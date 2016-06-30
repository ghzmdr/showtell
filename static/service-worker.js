var CACHE_NAME = 'v1'

var CAHCED_DEFAULTS = [
    '/',

    '/styles/main.css',
    '/styles/normalize.css',

    '/scripts/main.js',
    
    '/slides.json',

    'https://fonts.googleapis.com/css?family=Material+Icons|Roboto:400,700'
]

this.addEventListener('install', onInstall)
this.addEventListener('fetch', onFetch)



function onInstall(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(CAHCED_DEFAULTS)
        })
    )
}

// Cache first strategy
function onFetch(event) {
    
    event.respondWith(
        // Try to grab from cache
        caches.match(event.request)
            .then(function (response) {

                // If caches has response use that
                if (response) {
                    return response
                }

                var request = event.request.clone();

                // Else fetch it from network
                return fetch(request)
                    .then(function (response) {
                        
                        // If got a fancy response do not cache
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response
                        }

                        //Else cache it for the next time
                        var cacheableResponse = response.clone()

                        caches.open(CACHE_NAME)
                            .then(function (cache) {
                                cache.put(event.request, cacheableResponse)
                            })

                        return response
                    })
            })
    )
}