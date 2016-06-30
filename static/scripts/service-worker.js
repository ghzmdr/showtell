this.addEventListener('install', onInstall)
this.addEventListener('fetch', onFetch)

function onInstall(event) {
    event.waitUntil(
        caches.open('v1').then(function (cache) {
            return cache.addAll([
                '/',

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
    var response;

    event.respondWith(
        //Try to grab from cache
        caches.match(event.request)
            .catch(function () {
                //Fallback to network if not found
                return fetch(event.request)
            }).then(function (r) {
                response = r
                
                //Chain to the fetch promise and cache result
                caches.open('v1').then(function (cache) {
                    cache.put(event.request, response)
                })

                return response.clone()
            })
    )
}