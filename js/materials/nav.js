import Router from '../general/router.js';
import Page from './page.js';

class Nav {

	constructor () {

		// Mobile scroll

		this.scrollEnabled = true;

		var hammertime = new Hammer(document.querySelector('main'));
		
		hammertime.get('pan').set({ direction: Hammer.DIRECTION_VERTICAL });

		hammertime.on("pan", this.scrollInverted.bind(this));

		// Responsive Menu Button

		document.querySelector('.menu_button').addEventListener('click', this.menuResponsiveActive);

		// Menu

		var buttons = document.querySelectorAll('.menu button');

		for (var button of buttons) {

			button.addEventListener('click', this.navigate.bind(this));

		}

		// Orientation Change

		if (window.mobileAndTabletcheck()) {

			if (screen.orientation.type == 'landscape-primary') {
				document.querySelector('html').classList.add('orientation');
			}

			window.addEventListener("orientationchange", function() {
				
				if (screen.orientation.type == 'landscape-primary') {
					document.querySelector('html').classList.add('orientation');
				}
				else {
					document.querySelector('html').classList.remove('orientation');
				}

			}, false);

		}

		// Scroll

		var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel"; //FF doesn't recognize mousewheel as of FF3.x
 
		//if IE (and Opera depending on user setting)
		if (document.attachEvent) {
			document.attachEvent("on"+mousewheelevt, this.scroll.bind(this));
		}
		//WC3 browsers
		else if (document.addEventListener) {
			document.addEventListener(mousewheelevt, this.scroll.bind(this), false);
		}

		return true;
	}

	menuResponsiveActive (event) {
		
		if (document.querySelector('.menu_button').getAttribute('state') == 'active') {
			document.querySelector('.menu').setAttribute('state','ready');			
			document.querySelector('.menu_button').setAttribute('state','inactive');
			document.querySelector('.logo').setAttribute('state','ready');
		}
		else {
			document.querySelector('.menu_button').setAttribute('state','active');
			document.querySelector('.menu').setAttribute('state','active');
			document.querySelector('.logo').setAttribute('state','active');			
		}

		return true;
	}

	navigate (event) {


		if (event.target.getAttribute('state') != 'active') {

			// Menu

			document.querySelector('.menu button[state="active"]').removeAttribute('state');

			event.target.setAttribute('state', 'active');

			// Responsive Title

			document.querySelector('.responsive_title span:nth-child(2)').innerText = event.target.innerText;

			// Responsive Menu

			if (document.querySelector('.menu').getAttribute('state') == 'active') {
				this.menuResponsiveActive(null);
			}

			// Page

			Page.out(event.target.getAttribute('page'));

		}

		return true;
	}

	orientationChange () {
		return true;
	}

	scroll (event) {

		var delta = event.deltaY;

		if (typeof delta == 'undefined') delta = event.wheelDelta ? event.wheelDelta : event.detail;

		if (this.scrollEnabled) {

			if (document.querySelector('.page[state="ready"] .slide[state="active"]')) {

				if (delta > 0) {
					Page.scrollDown(this, delta);
				}
				else if (delta < 0) {
					Page.scrollUp(this, delta);
				}

			}

		}

		return true;
	}

	scrollInverted (event) {

		var delta = event.deltaY;

		if (typeof delta == 'undefined') delta = event.wheelDelta ? event.wheelDelta : event.detail;

		if (this.scrollEnabled) {

			if (document.querySelector('.page[state="ready"] .slide[state="active"]')) {

				if (delta > 0) {
					Page.scrollUp(this, delta);
				}
				else if (delta < 0) {
					Page.scrollDown(this, delta);
				}

			}

		}

		return true;
	}

}

export default Nav;