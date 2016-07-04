var Application = function() {
	this.autobind()
	this.registerWorker()
	this.initGUI()
	this.start()
}

Application.prototype = {
	autobind: function () {
		for (var k in this) {
			if (typeof this[k] == 'function') {
				this[k] = this[k].bind(this)
			}
		}
	},

	registerWorker: function () {
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
	},

	initGUI: function () {
		document.querySelector('html').classList.add('js')
		
		window.addEventListener('popstate', this.onStateChange);
		document.addEventListener('click', this.onNavigation);
		

		this.app = document.querySelector('.App')

		this.title = document.querySelector('.SlideTitle')

		this.pageWrapper = document.querySelector('.PageWrapper')
		this.currentPage = document.querySelector('.Page')
		this.pagerCurrent = document.querySelector('.Pager .Current')
		
		this.navigation = {
			el: document.querySelector('.Navigation'),
			prev: navigationPrev = document.querySelector('.Navigation .Prev'),
			next: navigationNext = document.querySelector('.Navigation .Next')
		}
		
		this.navigation.prev.addEventListener('click', this.prevSlide, {passive: true})
		this.navigation.next.addEventListener('click', this.nextSlide, {passive: true})

		this.drawer = document.querySelector('.Drawer')
		this.slidesList = this.drawer.querySelector('ul')
		this.drawer.isOpen = false

		this.menuBtn = document.querySelector('.Hamburger')
		this.menuBtn.addEventListener('click', this.toggleDrawer, false)
		
		this.overlay = document.querySelector('.Overlay')
		this.overlay.addEventListener('click', this.closeDrawer, false)
	},

	isTouch: function() {
		return 'ontouchstart' in document.documentElement;
	},

	initSlides: function(slides) {
		this.slides = slides

		slides.forEach(function (page, index) {
			if (page.indexRoute) {
				return
			}

			var li = document.createElement('li')
			var a = document.createElement('a')
			a.textContent = page.name
			a.classList.add('internal-link')
			a.href = '/pages/' + page.slug
			li.appendChild(a)

			this.slidesList.appendChild(li)
		}.bind(this))
	},

	start: function() {
		var oldTransion = this.currentPage.style.transition
		this.currentPage.style.transition = 'none'
		this.currentPage.classList.add('right')

		fetch('/slides.json')
			.then(function(response) {
				return response.json()
			}).then(function (slides) {
				this.initSlides(slides)
				
				this.currentPage = document.querySelector('.Page')
				this.setCurrentSlide(location.pathname)
				
				this.currentPage.style.transition = oldTransion
				this.doTransitionIn(this.currentPage)
		}.bind(this))
	},

	setCurrentSlide: function(path) {
		var current = this.slidesList.querySelector('a.current')
		if (current) {
			current.classList.remove('current')
		}

		var found = false
		if (path === '/') {
			this.currentIndex = 0
			found = true
		} else {    
			var anchors = this.slidesList.querySelectorAll('a')
			for (var ai = 0; ai < anchors.length; ++ai) {
				var a = anchors[ai]
				if (a.href == location.href) {
					a.classList.add('current')
					this.currentIndex = ai + 1
					found = true
					break;
				}
			}
		}

		if (found) {
			var prev = this.currentIndex > 0 ? this.currentIndex -1 : this.currentIndex
			var next = this.currentIndex < this.slides.length-1 ? this.currentIndex +1 : this.currentIndex

			this.navigation.prev.href = prev === 0 ? '/' : '/pages/' + this.slides[prev].slug
			this.navigation.next.href = '/pages/' + this.slides[next].slug

			this.title.textContent = this.slides[this.currentIndex].name
			this.pagerCurrent.textContent = this.currentIndex			
		}
	},

	toggleDrawer: function() {
		if (this.app.classList.contains('drawer-open')) {
			this.closeDrawer()
		} else {
			this.openDrawer()
		}
	},

	openDrawer: function() {
		this.app.classList.add('drawer-open')
	},

	closeDrawer: function() {
		this.app.classList.remove('drawer-open')
	},

	onNavigation: function() {
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
		this.onStateChange()
	},

	onStateChange: function(event) {
		if (/^\/pages\/.*/.test(location.pathname)) {
			this.fetchPage(location.pathname)        
		} else if (location.pathname === '/') {
			this.fetchPage('/pages/home')
		}

		this.setCurrentSlide(location.pathname)
	},

	fetchPage: function(url) {
		fetch(url)
			.then(function (result) {return result.text()})
			.then(this.switchPage)
			.catch(this.displaySadPage)
	},

	switchPage: function(result) {

		var tmpWrapper = document.createElement('div')
		tmpWrapper.innerHTML = result

		var nextPage = tmpWrapper.querySelector('.Page')
		nextPage.classList.add('right')
		this.pageWrapper.appendChild(nextPage)

		if (this.currentPage) {
			this.doTransitionOut(this.currentPage)
				.then(function () {
					this.pageWrapper.removeChild(this.currentPage)
					this.currentPage = document.querySelector('.Page')
				}.bind(this))

			this.doTransitionIn(nextPage)
		}
	},

	doTransitionOut: function(element) {
		return new Promise(function (resolve, reject) {
			element.addEventListener('transitionend', onTransitionEnd)
			element.classList.add('left')

			function onTransitionEnd () {            
				element.removeEventListener('transitionend', onTransitionEnd)
				resolve()
			};
		})
	},

	doTransitionIn: function(element) {
		requestAnimationFrame(function () {
			requestAnimationFrame(function () {
				element.classList.remove('right')
			})
		})
	},

	displaySadPage: function() {
		this.fetchPage('/pages/404')
	}
}

window.onload = function() {
	application = new Application()
}
