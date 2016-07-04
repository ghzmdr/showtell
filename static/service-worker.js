this.addEventListener('install', onInstall)
this.addEventListener('fetch', onFetch)

var CACHE_NAME = 'v1'

function onInstall(event) {
	event.waitUntil(
		caches.open(CACHE_NAME).then(function (cache) {
			return cache.addAll([
				'/',
				'/pages/404',
				'https://fonts.googleapis.com/css?family=Material+Icons|Roboto:400,700',

				'/styles/main.css',
				'/styles/normalize.css',

				'/scripts/main.js',
				
				'/slides.json'
			])
		}).then(function () {
			self.skipWaiting()
		})
	)
}

this.addEventListener('activate', function () {
	self.clients.claim()
})

function onFetch(event) {
	event.respondWith(
		caches.match(event.request)
			.then(function(response) {
				
				if (response) {
				  return response;
				}

				// IMPORTANT: Clone the request. A request is a stream and
				// can only be consumed once. Since we are consuming this
				// once by cache and once by the browser for fetch, we need
				// to clone the response
				var fetchRequest = event.request.clone();

				return fetch(fetchRequest).then(
				  	function(response) {
						// Check if we received a valid response
						if(!response || response.status !== 200 || response.type !== 'basic') {
							return response;
						}

						// IMPORTANT: Clone the response. A response is a stream
						// and because we want the browser to consume the response
						// as well as the cache consuming the response, we need
						// to clone it so we have 2 stream.
						var responseToCache = response.clone();

						caches.open(CACHE_NAME)
							.then(function(cache) {
								cache.put(event.request, responseToCache);
							});

						return response;
				});
			})
	);
}