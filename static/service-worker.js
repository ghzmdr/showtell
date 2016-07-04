this.addEventListener('install', onInstall)
this.addEventListener('fetch', onFetch)

var CACHE_NAME = 'v1'
var assets = [
    '/',
    '/pages/404',

    '/styles/main.css',
    '/styles/normalize.css',

    '/scripts/main.js',
    
    '/slides.json',

    'https://fonts.googleapis.com/css?family=Material+Icons|Roboto:400,700'
]

function onInstall(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(assets)
        }).then(function () {
            self.skipWaiting()
        })
    )
}

function onFetch(event) {
    event.respondWith(

        caches.match(event.request)
            .then(function(response){
                if (response) {
                    return response
                }

                var fetchRequest = event.request.clone()

                return fetch(fetchRequest)
                        .then(function(response) {
                            if (!response || response.status !== 200 || response.type !== 'basic') {
                                return response
                            }

                            var responseToCache = response.clone()

                            caches.open(CACHE_NAME)
                                .then(function(cache) {
                                    cache.put(event.request, responseToCache)
                                })

                            return response
                        })
            })
    )
}