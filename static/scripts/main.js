if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js', {scope: '/'})
        .then(function (registration) {

            if(registration.installing) {
              console.log("[SERVICE WORKER] Installing")
            } else if(registration.waiting) {
              console.log("[SERVICE WORKER] Installed")
            } else if(registration.active) {
              console.log("[SERVICE WORKER] Active")
            }
            

            if (navigator.serviceWorker.controller) {
                console.log('[SERVICE WORKER] Controlling')
            } else {
                console.log('[SERVICE WORKER] NOT Controlling')
            }

        }).catch(function (error) {
            console.log("[SERVICE WORKER] Registration FAILED. ", error)
        })
}

document.querySelector('html').classList.add('js')

var PAGES
var currentSlide = 0

var drawer = document.querySelector('.Drawer')
var drawerList = drawer.querySelector('ul')

var pagerCurrent = document.querySelector('.Pager .Current')
var pagerTotal = document.querySelector('.Pager .Total')

var navigationNext = document.querySelector('.Navigation .Next')
var navigationPrev = document.querySelector('.Navigation .Prev')

var slideTitle = document.querySelector('.SlideTitle')

navigationPrev.addEventListener('click', prevSlide)
navigationNext.addEventListener('click', nextSlide)

navigationPrev.href = ''
navigationNext.href = ''

function prevSlide(e) {
    e.preventDefault()
    e.stopPropagation()

    if (currentSlide > 0) {
        gotoSlideByIndex(currentSlide -1)
    }
}

function nextSlide(e) {
    e.preventDefault()
    e.stopPropagation()

    if (currentSlide < PAGES.length-1) {
        gotoSlideByIndex(currentSlide +1)
    }
}

function gotoSlideByIndex(index) {
    if (index === currentSlide) {
        return
    }

    if (index === 0) {
        history.pushState(null, null, '/')
    } else {        
        history.pushState(null, null, '/pages/' + PAGES[index].slug)
    }

    onStateChange()
}

window.onload = function () {

    var oldTransion = page.style.transition
    page.style.transition = 'none'
    page.classList.add('right')

    fetch('/slides.json')
        .then(function(response) {
            return response.json()
        }).then(function(pages) {
            PAGES = pages

            PAGES.forEach(function (page, index) {
                if (page.index) {
                    return
                }

                var li = document.createElement('li')
                var a = document.createElement('a')
                a.textContent = page.name
                a.classList.add('internal-link')
                a.href = '/pages/' + page.slug
                li.appendChild(a)

                drawerList.appendChild(li)
            })

            pagerTotal.textContent = PAGES.length -1

            page = document.querySelector('.Page')
            setCurrentSlide(location.pathname)
            page.style.transition = oldTransion
            doTransitionIn(page)
        })
}

function setCurrentSlide(path) {
    var current = drawerList.querySelector('a.current')
    if (current) {
        current.classList.remove('current')
    }

    if (path === '/') {
        currentSlide = 0
    } else {    
        var anchors = drawerList.querySelectorAll('a')
        for (var ai = 0; ai < anchors.length; ++ai) {
            var a = anchors[ai]
            if (a.href == location.href) {
                a.classList.add('current')
                currentSlide = ai + 1
                break;
            }
        }
    }

    slideTitle.textContent = PAGES[currentSlide].name
    pagerCurrent.textContent = currentSlide || 0
}

var app = document.querySelector('.App')
app.isOpen = false

var menuBtn = document.querySelector('.Hamburger')
menuBtn.addEventListener('click', toggleDrawer, false)

var overlay = document.querySelector('.Overlay')
overlay.addEventListener('click', closeDrawer, false)

function toggleDrawer() {
    if (app.classList.contains('drawer-open')) {
        closeDrawer()
    } else {
        openDrawer()
    }
}

function openDrawer() {
    app.classList.add('drawer-open')
}

function closeDrawer() {
    app.classList.remove('drawer-open')
}

function onNavigation (event) {    
    if (event.target.tagName !== 'A' || !event.target.classList.contains('internal-link')) {
        return
    }

    event.preventDefault()
    event.stopPropagation()

    if (event.target.href === location.href) {
        return
    }

    var request = event.target.href
    var host = location.host

    history.pushState(null, null, request)
    onStateChange()
}

function onStateChange(event) {
    if (/^\/pages\/.*/.test(location.pathname)) {
        fetchPage(location.pathname)        
    } else if (location.pathname === '/') {
        fetchPage('/')
    }

    setCurrentSlide(location.pathname)
}

window.addEventListener('popstate', onStateChange);
document.addEventListener('click', onNavigation);

var pageWrapper = document.querySelector('.PageWrapper')
var page = document.querySelector('.Page')

function fetchPage(url) {
    fetch(url)
        .then(function (result) {return result.text()})
        .then(switchPage)
        .catch(displaySadPage)
}

function switchPage(result) {

    var tmpWrapper = document.createElement('div')
    tmpWrapper.innerHTML = result

    var nextPage = tmpWrapper.querySelector('.Page')
    nextPage.classList.add('right')
    pageWrapper.appendChild(nextPage)

    if (page) {
        doTransitionOut(page)
            .then(function () {
                pageWrapper.removeChild(page)
                page = document.querySelector('.Page')
            })

        doTransitionIn(nextPage)
    }
}

function doTransitionOut(element) {
    return new Promise(function (resolve, reject) {
        element.addEventListener('transitionend', onTransitionEnd)
        element.classList.add('left')

        function onTransitionEnd () {            
            element.removeEventListener('transitionend', onTransitionEnd)
            resolve()
        };
    })
}

function doTransitionIn(element) {
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            element.classList.remove('right')
        })
    })
}

function displaySadPage() {
    debugger
}