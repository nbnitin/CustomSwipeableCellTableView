$ = jQuery.noConflict();
// Used to remove white space in counter that causes rendering bugs
(function ($) {

	$.fn.flipCounter = function (method) {

		// Public Variables
		var obj = false; // reference to DOM object
		
		var defaults = {
			number: 0, // default number is 0,
			numIntegralDigits: 1, // default number of places left of . is 1
			numFractionalDigits: 0, // default number of places right of . is 0
			digitClass: 'counter-digit', // default class for the counter digits
			counterFieldName: 'counter-value',// default name for the counter hidden field
			digitHeight: 40, // default height of each digit in sprite image
			digitWidth: 30, // default width of each digit in sprite image
			imagePath: 'img/flipCounter-medium.png',// default path of sprite image relative to html document
			easing: false,// default easing function, this can be overridden by jQuery.easing methods (i.e.	 jQuery.easing.easeOutCubic)
			duration: 10000, // default duration of animations
			onAnimationStarted: false, // callback for animation starting
			onAnimationStopped: false,// callback for animation stopped,
			onAnimationPaused: false, // callback for animation paused
			onAnimationResumed: false,// callback for animation resumed
			formatNumberOptions: false
		};

		// Public Methods
		var methods = {

			// Initialization
			init: function (options) {

				return this.each(
				
					function () {

						// Set reference to this DOM object
						obj = $(this);
	
						// new options override defaults
						var new_options = $.extend(defaults, options);
						var old_options = obj.data('flipCounter');
	
						// new options override previous initializiation options
						options = $.extend(old_options, new_options);
						
						obj.data('flipCounter', options);
	
						// if number isn't set then try and get it from the hidden field
						if (options.number === false || options.number == 0) {
						
							(_getCounterValue() !== false) ? options.number = _getCounterValue() : options.number = 0;
							_setOption('number', options.number);
							
						}
	
						// Default Options
						_setOption('animating', false);
						_setOption('start_time', false);
	
						// Bind Actions
						obj.bind('startAnimation', function (event, options) {
							_startAnimation(options);
						});
						obj.bind('pauseAnimation', function (event) {
							_pauseAnimation();
						});
						obj.bind('resumeAnimation', function (event) {
							_resumeAnimation();
						});
						obj.bind('stopAnimation', function (event) {
							_stopAnimation();
						});
	
						// Remove line breaks which cause rendering errors
						obj.htmlClean();
						
						// Render counter
						_renderCounter();
	
					}
				
				)
				
			},

			// Render a number in the counter
			renderCounter: function (value) {
			
				return this.each(
				
					function () {
				
						obj = $(this);
						
						if (!_isInitialized()) $(this).flipCounter();
						
						_setOption('number', value);
						
						_renderCounter();
						
					}
				
				);
				
			},

			// Render a number in the counter (synonym for above)
			setNumber: function (value) {
			
				return this.each(
				
					function () {
				
						obj = $(this);
						
						if (!_isInitialized()) $(this).flipCounter();
						
						_setOption('number', value);
						
						_renderCounter();
						
					}
				
				);
				
			},

			// Get the number currently rendered
			getNumber: function () {
			
				var val = false;
				
				this.each(
				
					val = function () {
				
						obj = $(this);
						
						if (!_isInitialized()) $(this).flipCounter();
						
						val = _getOption('number');
						
						return val;
						
					}
				
				);
				
				return val;
				
			},

			// Start animation or resume paused animation
			startAnimation: function (options) {

				return this.each(
				
					function () {
				
						obj = $(this);
						
						if (!_isInitialized()) $(this).flipCounter();
						
						obj.trigger('startAnimation', options);
						
					}
					
				);

			},

			// Stop animation
			stopAnimation: function () {
			
				return this.each(
					
					function () {
				
						obj = $(this);
						
						if (!_isInitialized()) $(this).flipCounter();
						
						obj.trigger('stopAnimation');
						
					}
				
				);
				
			},

			// Pause animation
			pauseAnimation: function () {
			
				return this.each(
					
					function () {
						
						obj = $(this);

						if (!_isInitialized()) $(this).flipCounter();
	
						obj.trigger('pauseAnimation');
		
					}
			
				);
			
			},

			// Resume animation
			resumeAnimation: function () {
			
				return this.each(
					
					function () {
				
						obj = $(this);
						
						if (!_isInitialized()) $(this).flipCounter();
						
						obj.trigger('resumeAnimation');
						
					}
				
				);
				
			}

		};

		// Call public methods
		if (methods[method]) {
		
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
			
		} else if (typeof method === 'object' || !method) {
		
			return methods.init.apply(this, arguments);
			
		} else {
		
			$.error('Method ' + method + ' does not exist on jQuery.flipCounter');
			
		}

		// Private Functions

		function _isInitialized() {
		
			var data = obj.data('flipCounter');
			
			if (typeof data == 'undefined') return false
			
			return true;
			
		}

		// Get an option


		function _getOption(option) {
		
			var data = obj.data('flipCounter');
			var value = data[option];
			
			if (typeof value !== 'undefined') {
			
				return value;
				
			}
			
			return false;
			
		}

		// Set an option


		function _setOption(option, value) {
		
			var data = obj.data('flipCounter');
			
			data[option] = value;
			obj.data('flipCounter', data);
			
		}

		// Setup the counter


		function _setupCounter() {
			
			// If object doesn't have a hidden field then create one
			if (obj.children('[name="' + _getOption('counterFieldName') + '"]').length < 1) {
			
				obj.append('<input type="hidden" name="' + _getOption('counterFieldName') + '" value="' + _getOption('number') + '" />');
				
			}

			// Add or remove enough digits to fit number
			var digits_length = _getDigitsLength();
			var num_digits_needed = _getNumberFormatted().length;

			if (num_digits_needed > digits_length) {

				for (i = 0; i < (num_digits_needed - digits_length); i++) {

					var digit_element = $('<span class="' + _getOption('digitClass') + '" style="' + _getDigitStyle('0') + '" />');

					obj.prepend(digit_element);

				}

			} else if (num_digits_needed < digits_length) {
			
				for (i = 0; i < (digits_length - num_digits_needed); i++) {
				
					obj.children('.' + _getOption('digitClass')).first().remove();
					
				}
				
			}

			// Add the invisible span if it doesn't already exist
			obj.find('.' + _getOption('digitClass')).each(
				
				function () {
			
					if (0 == $(this).find('span').length)
					{
						
						$(this).append('<span style="visibility:hidden">0</span>');
					
					}
			
				}
			
			);

		}

		// Render the counter
		function _renderCounter() {

			_setupCounter();

			var number = _getNumberFormatted();
			var digits = _getDigits();
			var pos = 0;
			
			$.each(digits, function (index, value) {
			
				digit = number.toString().charAt(pos);
				$(this).attr('style',  _getDigitStyle(digit));
				$(this).find('span').text(digit.replace(' ', '&nbsp;').toString()); // replace empty space with &nbsp; to prevent rendering bug
				pos++
				
			});
			
			_setCounterValue();

		}

		// get a collection of the objects digit DOM elements
		function _getDigits() {
		
			return obj.children('.' + _getOption('digitClass'));
			
		}

		// get the current number of digit DOM elements
		function _getDigitsLength() {
		
			return _getDigits().length;
			
		}

		// get the value stored in the counter field
		function _getCounterValue() {
		
			var val = parseFloat(obj.children('[name="' + _getOption('counterFieldName') + '"]').val());
			
			if (val == val == false) return false; // test for NaN
			
			return val;
			
		}

		// update the counter field with the current number
		function _setCounterValue() {
		
			obj.children('[name="' + _getOption('counterFieldName') + '"]').val(_getOption('number'));
			
		}

		// format number as a string according to given options
		function _getNumberFormatted() {
		
			var number = _getOption('number');
			
			// check is numeric
			if (typeof number !== 'number') {
			
				$.error('Attempting to render non-numeric value.');
				return '0';
				
			} 
			
			var str_number = '';
			
			// Number formatter plugin is being used
			if (_getOption('formatNumberOptions')) 
			{
			
				if ($.formatNumber) {
				 
					str_number = $.formatNumber(number, _getOption('formatNumberOptions'));
			  
				} else {
				
					$.error('The numberformatter jQuery plugin is not loaded. This plugin is required to use the formatNumberOptions setting.');
					
				}
				
			} else {
			
				// if greater than zero add leading zeros if necessary
				if (number >= 0) { 
				
					var num_integral_digits = _getOption('numIntegralDigits');
					var num_extra_zeros = num_integral_digits - number.toFixed().toString().length;
					
					for (var i = 0; i < num_extra_zeros; i++) {
					
						str_number += '0';
						
					}
					
					str_number += number.toFixed(_getOption('numFractionalDigits'));
					
				 // if less than zero remove leading zeros and add minus sign 
				} else { 
				
					str_number = '-' + Math.abs(number.toFixed(_getOption('numFractionalDigits')));
					
				}
				
			}

			return str_number;

		}
		
		// Get CSS background image positiong
		function _getDigitStyle(character)
		{
			
			var style = "height:" + _getOption('digitHeight') + "px; width:" + _getOption('digitWidth') + "px; display:inline-block; background-image:url('" + _getOption('imagePath') + "'); background-repeat:no-repeat; ";
			
			var bg_pos = new Array();
			
			bg_pos['1'] = _getOption('digitWidth') * 0;
			bg_pos['2'] = _getOption('digitWidth') * -1;
			bg_pos['3'] = _getOption('digitWidth') * -2;
			bg_pos['4'] = _getOption('digitWidth') * -3;
			bg_pos['5'] = _getOption('digitWidth') * -4;
			bg_pos['6'] = _getOption('digitWidth') * -5;
			bg_pos['7'] = _getOption('digitWidth') * -6;
			bg_pos['8'] = _getOption('digitWidth') * -7;
			bg_pos['9'] = _getOption('digitWidth') * -8;
			bg_pos['0'] = _getOption('digitWidth') * -9;
			bg_pos['.'] = _getOption('digitWidth') * -10;
			bg_pos['-'] = _getOption('digitWidth') * -11;
			bg_pos[','] = _getOption('digitWidth') * -12;
			bg_pos[' '] = _getOption('digitWidth') * -13;
			
			if( character in bg_pos)
			{
			
				return style + 'background-position: ' + bg_pos[character] + 'px 0px;'
				
			}
			
			return style;
			
		}

		// Start the animation 
		function _startAnimation(options) {

			if (true == _getOption('animating')) _stopAnimation();

			if (typeof options !== 'undefined') {
			
				options = $.extend(obj.data('flipCounter'), options);
				obj.data('flipCounter', options);
				
			} else {
			
				options = obj.data('flipCounter');
				
			}

			if (false == _getOption('start_time')) {

				_setOption('start_time', new Date().getTime());

			}

			if (false == _getOption('time')) {

				_setOption('time', 0);

			}

			if (false == _getOption('elapsed')) {

				_setOption('elapsed', '0.0');

			}

			if (false == _getOption('start_number')) {

				_setOption('start_number', _getOption('number'));

				if (false == _getOption('start_number')) {

					_setOption('start_number', 0);

				}

			}

			_doAnimation();
			
			var onAnimationStarted = _getOption('onAnimationStarted');
			
			if (typeof onAnimationStarted == 'function') onAnimationStarted.call(obj, obj);

		}

		// Do animation step
		function _doAnimation() {

			var start_time = _getOption('start_time');
			var time = _getOption('time');
			var elapsed = _getOption('elapsed');
			var start_number = _getOption('start_number');
			var number_change = _getOption('end_number') - _getOption('start_number');

			if (number_change == 0) return false;

			var duration = _getOption('duration');
			var easing = _getOption('easing');

			_setOption('animating', true);

			function animation_step() {

				time += 10;
				elapsed = Math.floor(time / 10) / 10;

				if (Math.round(elapsed) == elapsed) {
				
					elapsed += '.0';
					
				}

				_setOption('elapsed', elapsed);

				var diff = (new Date().getTime() - start_time) - time;
				
				var new_num = 0;
				
				if(typeof easing == 'function') {
				
					new_num = easing.apply(obj, [false, time, start_number, number_change, duration]);
				}
				else
				{
				
					new_num = _noEasing(false, time, start_number, number_change, duration);
				
				}
				
				_setOption('number', new_num);

				_setOption('time', time);

				_renderCounter();

				if (time < duration) {

					_setOption('interval', window.setTimeout(animation_step, (10 - diff)));

				} else {
				
					_stopAnimation();
					
				}

			}

			window.setTimeout(animation_step, 10);

		}

		// Stop animation
		function _stopAnimation() {

			if (false == _getOption('animating')) return false;

			clearTimeout(_getOption('interval'));

			_setOption('start_time', false);
			_setOption('start_number', false);
			_setOption('end_number', false);
			_setOption('time', 0);
			_setOption('animating', false);
			_setOption('paused', false);

			var onAnimationStopped = _getOption('onAnimationStopped');
			
			if (typeof onAnimationStopped == 'function') onAnimationStopped.call(obj, obj);

		}

		// Pause animation
		function _pauseAnimation() {

			if (false == _getOption('animating') || true == _getOption('paused')) return false;

			clearTimeout(_getOption('interval'));

			_setOption('paused', true);

			var onAnimationPaused = _getOption('onAnimationPaused');
			
			if (typeof onAnimationPaused == 'function') onAnimationPaused.call(obj, obj);

		}

		// Resume animation
		function _resumeAnimation() {

			if (false == _getOption('animating') || false == _getOption('paused')) return false;

			_setOption('paused', false);

			_doAnimation();

			var onAnimationResumed = _getOption('onAnimationResumed');
			
			if (typeof onAnimationResumed == 'function') onAnimationResumed.call(obj, obj);

		}

		// Default linear interpolation
		function _noEasing(x, t, b, c, d) {
		
			return t / d * c + b;
			
		}

	}

})(jQuery);

jQuery.fn.htmlClean = function () {

	this.contents().filter(function () {
	
		if (this.nodeType != 3) {
		
			jQuery(this).htmlClean();
			
			return false;
			
		} else {
		
			return !/\S/.test(this.nodeValue);
			
		}
		
	}).remove();
	
}
jQuery.easing.jswing=jQuery.easing.swing;jQuery.extend(jQuery.easing,{def:"easeOutQuad",swing:function(e,f,a,h,g){return jQuery.easing[jQuery.easing.def](e,f,a,h,g)},easeInQuad:function(e,f,a,h,g){return h*(f/=g)*f+a},easeOutQuad:function(e,f,a,h,g){return -h*(f/=g)*(f-2)+a},easeInOutQuad:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f+a}return -h/2*((--f)*(f-2)-1)+a},easeInCubic:function(e,f,a,h,g){return h*(f/=g)*f*f+a},easeOutCubic:function(e,f,a,h,g){return h*((f=f/g-1)*f*f+1)+a},easeInOutCubic:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f*f+a}return h/2*((f-=2)*f*f+2)+a},easeInQuart:function(e,f,a,h,g){return h*(f/=g)*f*f*f+a},easeOutQuart:function(e,f,a,h,g){return -h*((f=f/g-1)*f*f*f-1)+a},easeInOutQuart:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f*f*f+a}return -h/2*((f-=2)*f*f*f-2)+a},easeInQuint:function(e,f,a,h,g){return h*(f/=g)*f*f*f*f+a},easeOutQuint:function(e,f,a,h,g){return h*((f=f/g-1)*f*f*f*f+1)+a},easeInOutQuint:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f*f*f*f+a}return h/2*((f-=2)*f*f*f*f+2)+a},easeInSine:function(e,f,a,h,g){return -h*Math.cos(f/g*(Math.PI/2))+h+a},easeOutSine:function(e,f,a,h,g){return h*Math.sin(f/g*(Math.PI/2))+a},easeInOutSine:function(e,f,a,h,g){return -h/2*(Math.cos(Math.PI*f/g)-1)+a},easeInExpo:function(e,f,a,h,g){return(f==0)?a:h*Math.pow(2,10*(f/g-1))+a},easeOutExpo:function(e,f,a,h,g){return(f==g)?a+h:h*(-Math.pow(2,-10*f/g)+1)+a},easeInOutExpo:function(e,f,a,h,g){if(f==0){return a}if(f==g){return a+h}if((f/=g/2)<1){return h/2*Math.pow(2,10*(f-1))+a}return h/2*(-Math.pow(2,-10*--f)+2)+a},easeInCirc:function(e,f,a,h,g){return -h*(Math.sqrt(1-(f/=g)*f)-1)+a},easeOutCirc:function(e,f,a,h,g){return h*Math.sqrt(1-(f=f/g-1)*f)+a},easeInOutCirc:function(e,f,a,h,g){if((f/=g/2)<1){return -h/2*(Math.sqrt(1-f*f)-1)+a}return h/2*(Math.sqrt(1-(f-=2)*f)+1)+a},easeInElastic:function(f,h,e,l,k){var i=1.70158;var j=0;var g=l;if(h==0){return e}if((h/=k)==1){return e+l}if(!j){j=k*0.3}if(g<Math.abs(l)){g=l;var i=j/4}else{var i=j/(2*Math.PI)*Math.asin(l/g)}return -(g*Math.pow(2,10*(h-=1))*Math.sin((h*k-i)*(2*Math.PI)/j))+e},easeOutElastic:function(f,h,e,l,k){var i=1.70158;var j=0;var g=l;if(h==0){return e}if((h/=k)==1){return e+l}if(!j){j=k*0.3}if(g<Math.abs(l)){g=l;var i=j/4}else{var i=j/(2*Math.PI)*Math.asin(l/g)}return g*Math.pow(2,-10*h)*Math.sin((h*k-i)*(2*Math.PI)/j)+l+e},easeInOutElastic:function(f,h,e,l,k){var i=1.70158;var j=0;var g=l;if(h==0){return e}if((h/=k/2)==2){return e+l}if(!j){j=k*(0.3*1.5)}if(g<Math.abs(l)){g=l;var i=j/4}else{var i=j/(2*Math.PI)*Math.asin(l/g)}if(h<1){return -0.5*(g*Math.pow(2,10*(h-=1))*Math.sin((h*k-i)*(2*Math.PI)/j))+e}return g*Math.pow(2,-10*(h-=1))*Math.sin((h*k-i)*(2*Math.PI)/j)*0.5+l+e},easeInBack:function(e,f,a,i,h,g){if(g==undefined){g=1.70158}return i*(f/=h)*f*((g+1)*f-g)+a},easeOutBack:function(e,f,a,i,h,g){if(g==undefined){g=1.70158}return i*((f=f/h-1)*f*((g+1)*f+g)+1)+a},easeInOutBack:function(e,f,a,i,h,g){if(g==undefined){g=1.70158}if((f/=h/2)<1){return i/2*(f*f*(((g*=(1.525))+1)*f-g))+a}return i/2*((f-=2)*f*(((g*=(1.525))+1)*f+g)+2)+a},easeInBounce:function(e,f,a,h,g){return h-jQuery.easing.easeOutBounce(e,g-f,0,h,g)+a},easeOutBounce:function(e,f,a,h,g){if((f/=g)<(1/2.75)){return h*(7.5625*f*f)+a}else{if(f<(2/2.75)){return h*(7.5625*(f-=(1.5/2.75))*f+0.75)+a}else{if(f<(2.5/2.75)){return h*(7.5625*(f-=(2.25/2.75))*f+0.9375)+a}else{return h*(7.5625*(f-=(2.625/2.75))*f+0.984375)+a}}}},easeInOutBounce:function(e,f,a,h,g){if(f<g/2){return jQuery.easing.easeInBounce(e,f*2,0,h,g)*0.5+a}return jQuery.easing.easeOutBounce(e,f*2-g,0,h,g)*0.5+h*0.5+a}});

/*
 * jQuery FlexSlider v2.1
 * http://www.woothemes.com/flexslider/
 *
 * Copyright 2012 WooThemes
 * Free to use under the GPLv2 license.
 * http://www.gnu.org/licenses/gpl-2.0.html
 *
 * Contributing author: Tyler Smith (@mbmufffin)
 */
(function(d){d.flexslider=function(j,l){var a=d(j),c=d.extend({},d.flexslider.defaults,l),e=c.namespace,q="ontouchstart"in window||window.DocumentTouch&&document instanceof DocumentTouch,u=q?"touchend":"click",m="vertical"===c.direction,n=c.reverse,h=0<c.itemWidth,s="fade"===c.animation,t=""!==c.asNavFor,f={};d.data(j,"flexslider",a);f={init:function(){a.animating=!1;a.currentSlide=c.startAt;a.animatingTo=a.currentSlide;a.atEnd=0===a.currentSlide||a.currentSlide===a.last;a.containerSelector=c.selector.substr(0,
c.selector.search(" "));a.slides=d(c.selector,a);a.container=d(a.containerSelector,a);a.count=a.slides.length;a.syncExists=0<d(c.sync).length;"slide"===c.animation&&(c.animation="swing");a.prop=m?"top":"marginLeft";a.args={};a.manualPause=!1;var b=a,g;if(g=!c.video)if(g=!s)if(g=c.useCSS)a:{g=document.createElement("div");var p=["perspectiveProperty","WebkitPerspective","MozPerspective","OPerspective","msPerspective"],e;for(e in p)if(void 0!==g.style[p[e]]){a.pfx=p[e].replace("Perspective","").toLowerCase();
a.prop="-"+a.pfx+"-transform";g=!0;break a}g=!1}b.transitions=g;""!==c.controlsContainer&&(a.controlsContainer=0<d(c.controlsContainer).length&&d(c.controlsContainer));""!==c.manualControls&&(a.manualControls=0<d(c.manualControls).length&&d(c.manualControls));c.randomize&&(a.slides.sort(function(){return Math.round(Math.random())-0.5}),a.container.empty().append(a.slides));a.doMath();t&&f.asNav.setup();a.setup("init");c.controlNav&&f.controlNav.setup();c.directionNav&&f.directionNav.setup();c.keyboard&&
(1===d(a.containerSelector).length||c.multipleKeyboard)&&d(document).bind("keyup",function(b){b=b.keyCode;if(!a.animating&&(39===b||37===b))b=39===b?a.getTarget("next"):37===b?a.getTarget("prev"):!1,a.flexAnimate(b,c.pauseOnAction)});c.mousewheel&&a.bind("mousewheel",function(b,g){b.preventDefault();var d=0>g?a.getTarget("next"):a.getTarget("prev");a.flexAnimate(d,c.pauseOnAction)});c.pausePlay&&f.pausePlay.setup();c.slideshow&&(c.pauseOnHover&&a.hover(function(){!a.manualPlay&&!a.manualPause&&a.pause()},
function(){!a.manualPause&&!a.manualPlay&&a.play()}),0<c.initDelay?setTimeout(a.play,c.initDelay):a.play());q&&c.touch&&f.touch();(!s||s&&c.smoothHeight)&&d(window).bind("resize focus",f.resize);setTimeout(function(){c.start(a)},200)},asNav:{setup:function(){a.asNav=!0;a.animatingTo=Math.floor(a.currentSlide/a.move);a.currentItem=a.currentSlide;a.slides.removeClass(e+"active-slide").eq(a.currentItem).addClass(e+"active-slide");a.slides.click(function(b){b.preventDefault();b=d(this);var g=b.index();
!d(c.asNavFor).data("flexslider").animating&&!b.hasClass("active")&&(a.direction=a.currentItem<g?"next":"prev",a.flexAnimate(g,c.pauseOnAction,!1,!0,!0))})}},controlNav:{setup:function(){a.manualControls?f.controlNav.setupManual():f.controlNav.setupPaging()},setupPaging:function(){var b=1,g;a.controlNavScaffold=d('<ol class="'+e+"control-nav "+e+("thumbnails"===c.controlNav?"control-thumbs":"control-paging")+'"></ol>');if(1<a.pagingCount)for(var p=0;p<a.pagingCount;p++)g="thumbnails"===c.controlNav?
'<img src="'+a.slides.eq(p).attr("data-thumb")+'"/>':"<a>"+b+"</a>",a.controlNavScaffold.append("<li>"+g+"</li>"),b++;a.controlsContainer?d(a.controlsContainer).append(a.controlNavScaffold):a.append(a.controlNavScaffold);f.controlNav.set();f.controlNav.active();a.controlNavScaffold.delegate("a, img",u,function(b){b.preventDefault();b=d(this);var g=a.controlNav.index(b);b.hasClass(e+"active")||(a.direction=g>a.currentSlide?"next":"prev",a.flexAnimate(g,c.pauseOnAction))});q&&a.controlNavScaffold.delegate("a",
"click touchstart",function(a){a.preventDefault()})},setupManual:function(){a.controlNav=a.manualControls;f.controlNav.active();a.controlNav.live(u,function(b){b.preventDefault();b=d(this);var g=a.controlNav.index(b);b.hasClass(e+"active")||(g>a.currentSlide?a.direction="next":a.direction="prev",a.flexAnimate(g,c.pauseOnAction))});q&&a.controlNav.live("click touchstart",function(a){a.preventDefault()})},set:function(){a.controlNav=d("."+e+"control-nav li "+("thumbnails"===c.controlNav?"img":"a"),
a.controlsContainer?a.controlsContainer:a)},active:function(){a.controlNav.removeClass(e+"active").eq(a.animatingTo).addClass(e+"active")},update:function(b,c){1<a.pagingCount&&"add"===b?a.controlNavScaffold.append(d("<li><a>"+a.count+"</a></li>")):1===a.pagingCount?a.controlNavScaffold.find("li").remove():a.controlNav.eq(c).closest("li").remove();f.controlNav.set();1<a.pagingCount&&a.pagingCount!==a.controlNav.length?a.update(c,b):f.controlNav.active()}},directionNav:{setup:function(){var b=d('<ul class="'+
e+'direction-nav"><li><a class="'+e+'prev" href="#">'+c.prevText+'</a></li><li><a class="'+e+'next" href="#">'+c.nextText+"</a></li></ul>");a.controlsContainer?(d(a.controlsContainer).append(b),a.directionNav=d("."+e+"direction-nav li a",a.controlsContainer)):(a.append(b),a.directionNav=d("."+e+"direction-nav li a",a));f.directionNav.update();a.directionNav.bind(u,function(b){b.preventDefault();b=d(this).hasClass(e+"next")?a.getTarget("next"):a.getTarget("prev");a.flexAnimate(b,c.pauseOnAction)});
q&&a.directionNav.bind("click touchstart",function(a){a.preventDefault()})},update:function(){var b=e+"disabled";1===a.pagingCount?a.directionNav.addClass(b):c.animationLoop?a.directionNav.removeClass(b):0===a.animatingTo?a.directionNav.removeClass(b).filter("."+e+"prev").addClass(b):a.animatingTo===a.last?a.directionNav.removeClass(b).filter("."+e+"next").addClass(b):a.directionNav.removeClass(b)}},pausePlay:{setup:function(){var b=d('<div class="'+e+'pauseplay"><a></a></div>');a.controlsContainer?
(a.controlsContainer.append(b),a.pausePlay=d("."+e+"pauseplay a",a.controlsContainer)):(a.append(b),a.pausePlay=d("."+e+"pauseplay a",a));f.pausePlay.update(c.slideshow?e+"pause":e+"play");a.pausePlay.bind(u,function(b){b.preventDefault();d(this).hasClass(e+"pause")?(a.manualPause=!0,a.manualPlay=!1,a.pause()):(a.manualPause=!1,a.manualPlay=!0,a.play())});q&&a.pausePlay.bind("click touchstart",function(a){a.preventDefault()})},update:function(b){"play"===b?a.pausePlay.removeClass(e+"pause").addClass(e+
"play").text(c.playText):a.pausePlay.removeClass(e+"play").addClass(e+"pause").text(c.pauseText)}},touch:function(){function b(b){k=m?d-b.touches[0].pageY:d-b.touches[0].pageX;q=m?Math.abs(k)<Math.abs(b.touches[0].pageX-e):Math.abs(k)<Math.abs(b.touches[0].pageY-e);if(!q||500<Number(new Date)-l)b.preventDefault(),!s&&a.transitions&&(c.animationLoop||(k/=0===a.currentSlide&&0>k||a.currentSlide===a.last&&0<k?Math.abs(k)/r+2:1),a.setProps(f+k,"setTouch"))}function g(){j.removeEventListener("touchmove",
b,!1);if(a.animatingTo===a.currentSlide&&!q&&null!==k){var h=n?-k:k,m=0<h?a.getTarget("next"):a.getTarget("prev");a.canAdvance(m)&&(550>Number(new Date)-l&&50<Math.abs(h)||Math.abs(h)>r/2)?a.flexAnimate(m,c.pauseOnAction):s||a.flexAnimate(a.currentSlide,c.pauseOnAction,!0)}j.removeEventListener("touchend",g,!1);f=k=e=d=null}var d,e,f,r,k,l,q=!1;j.addEventListener("touchstart",function(k){a.animating?k.preventDefault():1===k.touches.length&&(a.pause(),r=m?a.h:a.w,l=Number(new Date),f=h&&n&&a.animatingTo===
a.last?0:h&&n?a.limit-(a.itemW+c.itemMargin)*a.move*a.animatingTo:h&&a.currentSlide===a.last?a.limit:h?(a.itemW+c.itemMargin)*a.move*a.currentSlide:n?(a.last-a.currentSlide+a.cloneOffset)*r:(a.currentSlide+a.cloneOffset)*r,d=m?k.touches[0].pageY:k.touches[0].pageX,e=m?k.touches[0].pageX:k.touches[0].pageY,j.addEventListener("touchmove",b,!1),j.addEventListener("touchend",g,!1))},!1)},resize:function(){!a.animating&&a.is(":visible")&&(h||a.doMath(),s?f.smoothHeight():h?(a.slides.width(a.computedW),
a.update(a.pagingCount),a.setProps()):m?(a.viewport.height(a.h),a.setProps(a.h,"setTotal")):(c.smoothHeight&&f.smoothHeight(),a.newSlides.width(a.computedW),a.setProps(a.computedW,"setTotal")))},smoothHeight:function(b){if(!m||s){var c=s?a:a.viewport;b?c.animate({height:a.slides.eq(a.animatingTo).height()},b):c.height(a.slides.eq(a.animatingTo).height())}},sync:function(b){var g=d(c.sync).data("flexslider"),e=a.animatingTo;switch(b){case "animate":g.flexAnimate(e,c.pauseOnAction,!1,!0);break;case "play":!g.playing&&
!g.asNav&&g.play();break;case "pause":g.pause()}}};a.flexAnimate=function(b,g,p,j,l){t&&1===a.pagingCount&&(a.direction=a.currentItem<b?"next":"prev");if(!a.animating&&(a.canAdvance(b,l)||p)&&a.is(":visible")){if(t&&j)if(p=d(c.asNavFor).data("flexslider"),a.atEnd=0===b||b===a.count-1,p.flexAnimate(b,!0,!1,!0,l),a.direction=a.currentItem<b?"next":"prev",p.direction=a.direction,Math.ceil((b+1)/a.visible)-1!==a.currentSlide&&0!==b)a.currentItem=b,a.slides.removeClass(e+"active-slide").eq(b).addClass(e+
"active-slide"),b=Math.floor(b/a.visible);else return a.currentItem=b,a.slides.removeClass(e+"active-slide").eq(b).addClass(e+"active-slide"),!1;a.animating=!0;a.animatingTo=b;c.before(a);g&&a.pause();a.syncExists&&!l&&f.sync("animate");c.controlNav&&f.controlNav.active();h||a.slides.removeClass(e+"active-slide").eq(b).addClass(e+"active-slide");a.atEnd=0===b||b===a.last;c.directionNav&&f.directionNav.update();b===a.last&&(c.end(a),c.animationLoop||a.pause());if(s)q?(a.slides.eq(a.currentSlide).css({opacity:0,
zIndex:1}),a.slides.eq(b).css({opacity:1,zIndex:2}),a.slides.unbind("webkitTransitionEnd transitionend"),a.slides.eq(a.currentSlide).bind("webkitTransitionEnd transitionend",function(){c.after(a)}),a.animating=!1,a.currentSlide=a.animatingTo):(a.slides.eq(a.currentSlide).fadeOut(c.animationSpeed,c.easing),a.slides.eq(b).fadeIn(c.animationSpeed,c.easing,a.wrapup));else{var r=m?a.slides.filter(":first").height():a.computedW;h?(b=c.itemWidth>a.w?2*c.itemMargin:c.itemMargin,b=(a.itemW+b)*a.move*a.animatingTo,
b=b>a.limit&&1!==a.visible?a.limit:b):b=0===a.currentSlide&&b===a.count-1&&c.animationLoop&&"next"!==a.direction?n?(a.count+a.cloneOffset)*r:0:a.currentSlide===a.last&&0===b&&c.animationLoop&&"prev"!==a.direction?n?0:(a.count+1)*r:n?(a.count-1-b+a.cloneOffset)*r:(b+a.cloneOffset)*r;a.setProps(b,"",c.animationSpeed);if(a.transitions){if(!c.animationLoop||!a.atEnd)a.animating=!1,a.currentSlide=a.animatingTo;a.container.unbind("webkitTransitionEnd transitionend");a.container.bind("webkitTransitionEnd transitionend",
function(){a.wrapup(r)})}else a.container.animate(a.args,c.animationSpeed,c.easing,function(){a.wrapup(r)})}c.smoothHeight&&f.smoothHeight(c.animationSpeed)}};a.wrapup=function(b){!s&&!h&&(0===a.currentSlide&&a.animatingTo===a.last&&c.animationLoop?a.setProps(b,"jumpEnd"):a.currentSlide===a.last&&(0===a.animatingTo&&c.animationLoop)&&a.setProps(b,"jumpStart"));a.animating=!1;a.currentSlide=a.animatingTo;c.after(a)};a.animateSlides=function(){a.animating||a.flexAnimate(a.getTarget("next"))};a.pause=
function(){clearInterval(a.animatedSlides);a.playing=!1;c.pausePlay&&f.pausePlay.update("play");a.syncExists&&f.sync("pause")};a.play=function(){a.animatedSlides=setInterval(a.animateSlides,c.slideshowSpeed);a.playing=!0;c.pausePlay&&f.pausePlay.update("pause");a.syncExists&&f.sync("play")};a.canAdvance=function(b,g){var d=t?a.pagingCount-1:a.last;return g?!0:t&&a.currentItem===a.count-1&&0===b&&"prev"===a.direction?!0:t&&0===a.currentItem&&b===a.pagingCount-1&&"next"!==a.direction?!1:b===a.currentSlide&&
!t?!1:c.animationLoop?!0:a.atEnd&&0===a.currentSlide&&b===d&&"next"!==a.direction?!1:a.atEnd&&a.currentSlide===d&&0===b&&"next"===a.direction?!1:!0};a.getTarget=function(b){a.direction=b;return"next"===b?a.currentSlide===a.last?0:a.currentSlide+1:0===a.currentSlide?a.last:a.currentSlide-1};a.setProps=function(b,g,d){var e,f=b?b:(a.itemW+c.itemMargin)*a.move*a.animatingTo;e=-1*function(){if(h)return"setTouch"===g?b:n&&a.animatingTo===a.last?0:n?a.limit-(a.itemW+c.itemMargin)*a.move*a.animatingTo:a.animatingTo===
a.last?a.limit:f;switch(g){case "setTotal":return n?(a.count-1-a.currentSlide+a.cloneOffset)*b:(a.currentSlide+a.cloneOffset)*b;case "setTouch":return b;case "jumpEnd":return n?b:a.count*b;case "jumpStart":return n?a.count*b:b;default:return b}}()+"px";a.transitions&&(e=m?"translate3d(0,"+e+",0)":"translate3d("+e+",0,0)",d=void 0!==d?d/1E3+"s":"0s",a.container.css("-"+a.pfx+"-transition-duration",d));a.args[a.prop]=e;(a.transitions||void 0===d)&&a.container.css(a.args)};a.setup=function(b){if(s)a.slides.css({width:"100%",
"float":"left",marginRight:"-100%",position:"relative"}),"init"===b&&(q?a.slides.css({opacity:0,display:"block",webkitTransition:"opacity "+c.animationSpeed/1E3+"s ease",zIndex:1}).eq(a.currentSlide).css({opacity:1,zIndex:2}):a.slides.eq(a.currentSlide).fadeIn(c.animationSpeed,c.easing)),c.smoothHeight&&f.smoothHeight();else{var g,p;"init"===b&&(a.viewport=d('<div class="'+e+'viewport"></div>').css({overflow:"hidden",position:"relative"}).appendTo(a).append(a.container),a.cloneCount=0,a.cloneOffset=
0,n&&(p=d.makeArray(a.slides).reverse(),a.slides=d(p),a.container.empty().append(a.slides)));c.animationLoop&&!h&&(a.cloneCount=2,a.cloneOffset=1,"init"!==b&&a.container.find(".clone").remove(),a.container.append(a.slides.first().clone().addClass("clone")).prepend(a.slides.last().clone().addClass("clone")));a.newSlides=d(c.selector,a);g=n?a.count-1-a.currentSlide+a.cloneOffset:a.currentSlide+a.cloneOffset;m&&!h?(a.container.height(200*(a.count+a.cloneCount)+"%").css("position","absolute").width("100%"),
setTimeout(function(){a.newSlides.css({display:"block"});a.doMath();a.viewport.height(a.h);a.setProps(g*a.h,"init")},"init"===b?100:0)):(a.container.width(200*(a.count+a.cloneCount)+"%"),a.setProps(g*a.computedW,"init"),setTimeout(function(){a.doMath();a.newSlides.css({width:a.computedW,"float":"left",display:"block"});c.smoothHeight&&f.smoothHeight()},"init"===b?100:0))}h||a.slides.removeClass(e+"active-slide").eq(a.currentSlide).addClass(e+"active-slide")};a.doMath=function(){var b=a.slides.first(),
d=c.itemMargin,e=c.minItems,f=c.maxItems;a.w=a.width();a.h=b.height();a.boxPadding=b.outerWidth()-b.width();h?(a.itemT=c.itemWidth+d,a.minW=e?e*a.itemT:a.w,a.maxW=f?f*a.itemT:a.w,a.itemW=a.minW>a.w?(a.w-d*e)/e:a.maxW<a.w?(a.w-d*f)/f:c.itemWidth>a.w?a.w:c.itemWidth,a.visible=Math.floor(a.w/(a.itemW+d)),a.move=0<c.move&&c.move<a.visible?c.move:a.visible,a.pagingCount=Math.ceil((a.count-a.visible)/a.move+1),a.last=a.pagingCount-1,a.limit=1===a.pagingCount?0:c.itemWidth>a.w?(a.itemW+2*d)*a.count-a.w-
d:(a.itemW+d)*a.count-a.w-d):(a.itemW=a.w,a.pagingCount=a.count,a.last=a.count-1);a.computedW=a.itemW-a.boxPadding};a.update=function(b,d){a.doMath();h||(b<a.currentSlide?a.currentSlide+=1:b<=a.currentSlide&&0!==b&&(a.currentSlide-=1),a.animatingTo=a.currentSlide);if(c.controlNav&&!a.manualControls)if("add"===d&&!h||a.pagingCount>a.controlNav.length)f.controlNav.update("add");else if("remove"===d&&!h||a.pagingCount<a.controlNav.length)h&&a.currentSlide>a.last&&(a.currentSlide-=1,a.animatingTo-=1),
f.controlNav.update("remove",a.last);c.directionNav&&f.directionNav.update()};a.addSlide=function(b,e){var f=d(b);a.count+=1;a.last=a.count-1;m&&n?void 0!==e?a.slides.eq(a.count-e).after(f):a.container.prepend(f):void 0!==e?a.slides.eq(e).before(f):a.container.append(f);a.update(e,"add");a.slides=d(c.selector+":not(.clone)",a);a.setup();c.added(a)};a.removeSlide=function(b){var e=isNaN(b)?a.slides.index(d(b)):b;a.count-=1;a.last=a.count-1;isNaN(b)?d(b,a.slides).remove():m&&n?a.slides.eq(a.last).remove():
a.slides.eq(b).remove();a.doMath();a.update(e,"remove");a.slides=d(c.selector+":not(.clone)",a);a.setup();c.removed(a)};f.init()};d.flexslider.defaults={namespace:"flex-",selector:".slides > li",animation:"fade",easing:"swing",direction:"horizontal",reverse:!1,animationLoop:!0,smoothHeight:!1,startAt:0,slideshow:!0,slideshowSpeed:7E3,animationSpeed:600,initDelay:0,randomize:!1,pauseOnAction:!0,pauseOnHover:!1,useCSS:!0,touch:!0,video:!1,controlNav:!0,directionNav:!0,prevText:"Previous",nextText:"Next",
keyboard:!0,multipleKeyboard:!1,mousewheel:!1,pausePlay:!1,pauseText:"Pause",playText:"Play",controlsContainer:"",manualControls:"",sync:"",asNavFor:"",itemWidth:0,itemMargin:0,minItems:0,maxItems:0,move:0,start:function(){},before:function(){},after:function(){},end:function(){},added:function(){},removed:function(){}};d.fn.flexslider=function(j){void 0===j&&(j={});if("object"===typeof j)return this.each(function(){var a=d(this),c=a.find(j.selector?j.selector:".slides > li");1===c.length?(c.fadeIn(400),
j.start&&j.start(a)):void 0==a.data("flexslider")&&new d.flexslider(this,j)});var l=d(this).data("flexslider");switch(j){case "play":l.play();break;case "pause":l.pause();break;case "next":l.flexAnimate(l.getTarget("next"),!0);break;case "prev":case "previous":l.flexAnimate(l.getTarget("prev"),!0);break;default:"number"===typeof j&&l.flexAnimate(j,!0)}}})(jQuery);

jQuery(document).ready(function() {
	
	jQuery("#scroller").simplyScroll({
				orientation:'vertical',
				customClass:'vert',
				startOnLoad:'true'
		});
	
	jQuery(".callouts").flexslider({
		animation: "slide",
		pauseOnHover: true,
		directionNav: false,
		slideshowSpeed: 5000,
		manualControls: ".flex-control-nav li",
		start: function() {
			jQuery(".callouts").css("visibility", "visible");
		}
	});

	jQuery("#counter").flipCounter({ 
			imagePath: siteUrl + "/images/flipCounter-medium.png",
			easing : true,
	});  
	if (typeof totalTutorials !== "undefined") {
		jQuery("#counter").flipCounter(
		        "startAnimation", // scroll counter from the current number to the specified number
		        {
		                end_number: totalTutorials, // the number we want the counter to scroll to
		                easing: jQuery.easing.easeOutCubic, // this easing function to apply to the scroll.
		                duration: 1000, // number of ms animation should take to complete
		        }
		);	
	}          
	
	
	/**
	jQuery("#tutorial-team-members").simplyScroll({
			customClass: 'vert',
			orientation: 'vertical',
            auto: true,
            manualMode: 'loop',
			frameRate: 20,
			speed: 5,
			startOnLoad : true
		});
	**/
		
	

	
	jQuery("#difficulty-selector a").each(function(index) {
		jQuery(this).click(function() {
			/**
			var previousTutorialList = "";
			var tutorialList = "";
			
			if (jQuery(this).parent().hasClass("selected")) {
				tutorialList = jQuery(this).parent().attr("data-tutorial-list");
				jQuery("#" + tutorialList).css("display", "none");
				jQuery(this).parent().removeClass("selected");
			} else {
				tutorialList = jQuery(this).parent().attr("data-tutorial-list");
				jQuery("#" + tutorialList).css("display", "block");
				jQuery(this).parent().addClass("selected");
			}	
			**/
			return false;
		})
	});
});
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;js.async = true;
  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
/*jslint browser: true */ /*global jQuery: true */

/**
 * jQuery Cookie plugin
 *
 * Copyright (c) 2010 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

// TODO JsDoc

/**
 * Create a cookie with the given key and value and other optional parameters.
 *
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Set the value of a cookie.
 * @example $.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jquery.com', secure: true });
 * @desc Create a cookie with all available options.
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Create a session cookie.
 * @example $.cookie('the_cookie', null);
 * @desc Delete a cookie by passing null as value. Keep in mind that you have to use the same path and domain
 *       used when the cookie was set.
 *
 * @param String key The key of the cookie.
 * @param String value The value of the cookie.
 * @param Object options An object literal containing key/value pairs to provide optional cookie attributes.
 * @option Number|Date expires Either an integer specifying the expiration date from now on in days or a Date object.
 *                             If a negative value is specified (e.g. a date in the past), the cookie will be deleted.
 *                             If set to null or omitted, the cookie will be a session cookie and will not be retained
 *                             when the the browser exits.
 * @option String path The value of the path atribute of the cookie (default: path of page that created the cookie).
 * @option String domain The value of the domain attribute of the cookie (default: domain of page that created the cookie).
 * @option Boolean secure If true, the secure attribute of the cookie will be set and the cookie transmission will
 *                        require a secure protocol (like HTTPS).
 * @type undefined
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */

/**
 * Get the value of a cookie with the given key.
 *
 * @example $.cookie('the_cookie');
 * @desc Get the value of a cookie.
 *
 * @param String key The key of the cookie.
 * @return The value of the cookie.
 * @type String
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */
jQuery.cookie = function (key, value, options) {
    
    // key and at least value given, set cookie...
    if (arguments.length > 1 && String(value) !== "[object Object]") {
        options = jQuery.extend({}, options);

        if (value === null || value === undefined) {
            options.expires = -1;
        }

        if (typeof options.expires === 'number') {
            var days = options.expires, t = options.expires = new Date();
            t.setDate(t.getDate() + days);
        }
        
        value = String(value);
        
        return (document.cookie = [
            encodeURIComponent(key), '=',
            options.raw ? value : encodeURIComponent(value),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
        ].join(''));
    }

    // key and possibly options given, get cookie...
    options = value || {};
    var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
};
    jQuery(document).ready(function() {
        var count;
        if ( !jQuery.cookie('wwsgd_visits') ) {
            count = 1;
        }
        else {
            count = parseInt(jQuery.cookie('wwsgd_visits'), 10) + 1;
        }
        jQuery.cookie('wwsgd_visits', count, { expires: 365, path: "/" });

        if ( count <= 5 ) {
            jQuery(".wwsgd").show();
        }
    });
/*
 * simplyScroll 2 - a scroll-tastic jQuery plugin
 *
 * http://logicbox.net/jquery/simplyscroll/
 *
 * Copyright (c) 2009-2012 Will Kelly - http://logicbox.net
 *
 * Dual licensed under the MIT and GPL licenses.
 *
 * Version: 2.0.5 Last revised: 10/05/2012
 *
 */
(function(c,j,i){c.fn.simplyScroll=function(a){return this.each(function(){new c.simplyScroll(this,a)})};var h={customClass:"simply-scroll",frameRate:24,speed:1,orientation:"horizontal",auto:!0,autoMode:"loop",manualMode:"end",direction:"forwards",pauseOnHover:!0,pauseOnTouch:!0,pauseButton:!1,startOnLoad:!1};c.simplyScroll=function(a,b){var g=this;this.o=c.extend({},h,b||{});this.isAuto=!1!==this.o.auto&&null!==this.o.autoMode.match(/^loop|bounce$/);this.isRTL=(this.isHorizontal=null!==this.o.orientation.match(/^horizontal|vertical$/)&&
this.o.orientation==h.orientation)&&"rtl"==c("html").attr("dir");this.isForwards=!this.isAuto||this.isAuto&&(null!==this.o.direction.match(/^forwards|backwards$/)&&this.o.direction==h.direction)&&!this.isRTL;this.isLoop=this.isAuto&&"loop"==this.o.autoMode||!this.isAuto&&"loop"==this.o.manualMode;this.events=(this.supportsTouch="createTouch"in document)?{start:"touchstart MozTouchDown",move:"touchmove MozTouchMove",end:"touchend touchcancel MozTouchRelease"}:{start:"mouseenter",end:"mouseleave"};
this.$list=c(a);var d=this.$list.children();this.$list.addClass("simply-scroll-list").wrap('<div class="simply-scroll-clip"></div>').parent().wrap('<div class="'+this.o.customClass+' simply-scroll-container"></div>');this.isAuto?this.o.pauseButton&&(this.$list.parent().parent().prepend('<div class="simply-scroll-btn simply-scroll-btn-pause"></div>'),this.o.pauseOnHover=!1):this.$list.parent().parent().prepend('<div class="simply-scroll-forward"></div>').prepend('<div class="simply-scroll-back"></div>');
if(1<d.length){var f=!1,e=0;this.isHorizontal?(d.each(function(){e=e+c(this).outerWidth(true)}),f=d.eq(0).outerWidth(!0)*d.length!==e):(d.each(function(){e=e+c(this).outerHeight(true)}),f=d.eq(0).outerHeight(!0)*d.length!==e);f&&(this.$list=this.$list.wrap("<div></div>").parent().addClass("simply-scroll-list"),this.isHorizontal?this.$list.children().css({"float":"left",width:e+"px"}):this.$list.children().css({height:e+"px"}))}this.o.startOnLoad?c(j).load(function(){g.init()}):this.init()};c.simplyScroll.fn=
c.simplyScroll.prototype={};c.simplyScroll.fn.extend=c.simplyScroll.extend=c.extend;c.simplyScroll.fn.extend({init:function(){this.$items=this.$list.children();this.$clip=this.$list.parent();this.$container=this.$clip.parent();this.$btnBack=c(".simply-scroll-back",this.$container);this.$btnForward=c(".simply-scroll-forward",this.$container);this.isHorizontal?(this.itemMax=this.$items.eq(0).outerWidth(!0),this.clipMax=this.$clip.width(),this.dimension="width",this.moveBackClass="simply-scroll-btn-left",
this.moveForwardClass="simply-scroll-btn-right",this.scrollPos="Left"):(this.itemMax=this.$items.eq(0).outerHeight(!0),this.clipMax=this.$clip.height(),this.dimension="height",this.moveBackClass="simply-scroll-btn-up",this.moveForwardClass="simply-scroll-btn-down",this.scrollPos="Top");this.posMin=0;this.posMax=this.$items.length*this.itemMax;var a=Math.ceil(this.clipMax/this.itemMax);if(this.isAuto&&"loop"==this.o.autoMode)this.$list.css(this.dimension,this.posMax+this.itemMax*a+"px"),this.posMax+=
this.clipMax-this.o.speed,this.isForwards?(this.$items.slice(0,a).clone(!0).appendTo(this.$list),this.resetPosition=0):(this.$items.slice(-a).clone(!0).prependTo(this.$list),this.resetPosition=this.$items.length*this.itemMax,this.isRTL&&(this.$clip[0].dir="ltr",this.$items.css("float","right")));else if(!this.isAuto&&"loop"==this.o.manualMode){this.posMax+=this.itemMax*a;this.$list.css(this.dimension,this.posMax+this.itemMax*a+"px");this.posMax+=this.clipMax-this.o.speed;this.$items.slice(0,a).clone(!0).appendTo(this.$list);
this.$items.slice(-a).clone(!0).prependTo(this.$list);this.resetPositionForwards=this.resetPosition=a*this.itemMax;this.resetPositionBackwards=this.$items.length*this.itemMax;var b=this;this.$btnBack.bind(this.events.start,function(){b.isForwards=false;b.resetPosition=b.resetPositionBackwards});this.$btnForward.bind(this.events.start,function(){b.isForwards=true;b.resetPosition=b.resetPositionForwards})}else this.$list.css(this.dimension,this.posMax+"px"),this.isForwards?this.resetPosition=0:(this.resetPosition=
this.$items.length*this.itemMax,this.isRTL&&(this.$clip[0].dir="ltr",this.$items.css("float","right")));this.resetPos();this.interval=null;this.intervalDelay=Math.floor(1E3/this.o.frameRate);if(this.isAuto||"end"!=this.o.manualMode)for(;0!==this.itemMax%this.o.speed;)if(this.o.speed--,0===this.o.speed){this.o.speed=1;break}b=this;this.trigger=null;this.funcMoveBack=function(a){a!==i&&a.preventDefault();b.trigger=!b.isAuto&&b.o.manualMode=="end"?this:null;b.isAuto?b.isForwards?b.moveBack():b.moveForward():
b.moveBack()};this.funcMoveForward=function(a){a!==i&&a.preventDefault();b.trigger=!b.isAuto&&b.o.manualMode=="end"?this:null;b.isAuto?b.isForwards?b.moveForward():b.moveBack():b.moveForward()};this.funcMovePause=function(){b.movePause()};this.funcMoveStop=function(){b.moveStop()};this.funcMoveResume=function(){b.moveResume()};if(this.isAuto){this.paused=!1;var g=function(){if(b.paused===false){b.paused=true;b.funcMovePause()}else{b.paused=false;b.funcMoveResume()}return b.paused};this.supportsTouch&&
this.$items.find("a").length&&(this.supportsTouch=!1);if(this.isAuto&&this.o.pauseOnHover&&!this.supportsTouch)this.$clip.bind(this.events.start,this.funcMovePause).bind(this.events.end,this.funcMoveResume);else if(this.isAuto&&this.o.pauseOnTouch&&!this.o.pauseButton&&this.supportsTouch){var d,f;this.$clip.bind(this.events.start,function(a){g();var c=a.originalEvent.touches[0];d=b.isHorizontal?c.pageX:c.pageY;f=b.$clip[0]["scroll"+b.scrollPos];a.stopPropagation();a.preventDefault()}).bind(this.events.move,
function(a){a.stopPropagation();a.preventDefault();a=a.originalEvent.touches[0];a=d-(b.isHorizontal?a.pageX:a.pageY)+f;if(a<0)a=0;else if(a>b.posMax)a=b.posMax;b.$clip[0]["scroll"+b.scrollPos]=a;b.funcMovePause();b.paused=true})}else this.o.pauseButton&&(this.$btnPause=c(".simply-scroll-btn-pause",this.$container).bind("click",function(a){a.preventDefault();g()?c(this).addClass("active"):c(this).removeClass("active")}));this.funcMoveForward()}else this.$btnBack.addClass("simply-scroll-btn "+this.moveBackClass).bind(this.events.start,
this.funcMoveBack).bind(this.events.end,this.funcMoveStop),this.$btnForward.addClass("simply-scroll-btn "+this.moveForwardClass).bind(this.events.start,this.funcMoveForward).bind(this.events.end,this.funcMoveStop),"end"==this.o.manualMode&&(!this.isRTL?this.$btnBack.addClass("disabled"):this.$btnForward.addClass("disabled"))},moveForward:function(){var a=this;this.movement="forward";null!==this.trigger&&this.$btnBack.removeClass("disabled");a.interval=setInterval(function(){a.$clip[0]["scroll"+a.scrollPos]<
a.posMax-a.clipMax?a.$clip[0]["scroll"+a.scrollPos]+=a.o.speed:a.isLoop?a.resetPos():a.moveStop(a.movement)},a.intervalDelay)},moveBack:function(){var a=this;this.movement="back";null!==this.trigger&&this.$btnForward.removeClass("disabled");a.interval=setInterval(function(){a.$clip[0]["scroll"+a.scrollPos]>a.posMin?a.$clip[0]["scroll"+a.scrollPos]-=a.o.speed:a.isLoop?a.resetPos():a.moveStop(a.movement)},a.intervalDelay)},movePause:function(){clearInterval(this.interval)},moveStop:function(a){this.movePause();
null!==this.trigger&&("undefined"!==typeof a&&c(this.trigger).addClass("disabled"),this.trigger=null);this.isAuto&&"bounce"==this.o.autoMode&&("forward"==a?this.moveBack():this.moveForward())},moveResume:function(){"forward"==this.movement?this.moveForward():this.moveBack()},resetPos:function(){this.$clip[0]["scroll"+this.scrollPos]=this.resetPosition}})})(jQuery,window);

(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

	  (function() {
	    var cx = '014141977933580679837:nad2btglbby';
	    var gcse = document.createElement('script');
	    gcse.type = 'text/javascript';
	    gcse.async = true;
	    gcse.src = (document.location.protocol == 'https:' ? 'https:' : 'http:') +
	        '//www.google.com/cse/cse.js?cx=' + cx;
	    var s = document.getElementsByTagName('script')[0];
	    s.parentNode.insertBefore(gcse, s);
	  })();

	<!-- AD CODE //-->
    function _dmBootstrap(file) { 
        var _dma = document.createElement('script');  
        _dma.type = 'text/javascript'; 
        _dma.async = true;  
        _dma.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + file; 
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(_dma);
    }
    function _dmFollowup(file) { if (typeof DMAds === 'undefined')  _dmBootstrap('cdn2.DeveloperMedia.com/a.min.js');}
    (function () { _dmBootstrap('cdn1.DeveloperMedia.com/a.min.js'); setTimeout(_dmFollowup, 2000);})();
    


// jQuery.getJSON( "https://graph.facebook.com/516533855059578/", {
	
// }).done(function(data) {
// 	jQuery("#like-count").html(data.likes);
// })

// -------------------------------------------------------------
	//   Footer on hover rotate cogs 
	// ------------------------------------------------------------- 

	var razeware = {

	  
	  isLocked : false,
	  timeOuts : [],
	  fadeFlags : new Array(4),
	  degree : 0,
	  isRotating : false,
	  gears : jQuery(".gears"),
	  smallSpeed : 1,
	  mediumSpeed : .75,
	  largeSpeed : .50,
	  hugeSpeed : .375,
	  clockwise: 1,
	  totalTicks: 0,
	  timer: 30,
	  defaultDegreesPerTick:10,
	  degreesPerTick: 10,
	  counterClockwise: -1,

	  startRotatingGears : function() {    
	    if (razeware.isRotating != true) {
	      razeware.isRotating = true;
	      razeware.rotateGears(); 
	    }
	  },

	  rotateGear : function(degree, direction, element) {
	    if (direction > 0) {
	      element.css({ transform: 'rotate(' + degree + 'deg)'});
	    } else {
	      element.css({ transform: 'rotate(' + (degree * -1) + 'deg)'});
	    }
	  },

	  calculateDegree : function(degree, multiplier) {
	    degree += (degree * multiplier) - degree;
	    return degree;
	  },      

	  rotateGears : function() {

	    var calculatedMiliSeconds = 0;
	    if (razeware.isRotating) {
	      razeware.totalTicks +=1;
	      calculatedMiliSeconds = razeware.totalTicks * razeware.timer;

	      
	      if (calculatedMiliSeconds > 200 && calculatedMiliSeconds < 300) {
	        if (razeware.fadeFlags[0] != 1) {
	          razeware.fadeFlags[0] = 1;
	        }
	      }
	      if (calculatedMiliSeconds > 300 && calculatedMiliSeconds < 400) {      
	        razeware.degreesPerTick = razeware.defaultDegreesPerTick + 3;
	      }
	      if (calculatedMiliSeconds > 400 && calculatedMiliSeconds < 500) {
	        if (razeware.fadeFlags[2] != 1) {
	          razeware.fadeFlags[2] = 1;
	        }
	      }
	      if (calculatedMiliSeconds > 500) {
	        if (razeware.fadeFlags[3] != 1) {
	          razeware.fadeFlags[3] = 1;
	        }
	      }
	      
	      razeware.timeOuts.push(setTimeout(function() {
	        
	        if (razeware.isRotating && razeware.isLocked == false) {
	          razeware.degree += razeware.degreesPerTick;
	                
	                jQuery(".small-gear").each(function(index) {
	                  if (jQuery(this).hasClass("clockwise-motion")) {
	                    razeware.rotateGear(razeware.calculateDegree(razeware.degree, razeware.smallSpeed), razeware.clockwise, jQuery(this));
	                  } else {
	                    razeware.rotateGear(razeware.calculateDegree(razeware.degree, razeware.smallSpeed), razeware.counterClockwise, jQuery(this));
	                  }
	                });
	                jQuery(".medium-gear").each(function(index) {
	                  if (jQuery(this).hasClass("clockwise-motion")) {
	                    razeware.rotateGear(razeware.calculateDegree(razeware.degree, razeware.mediumSpeed), razeware.clockwise, jQuery(this));
	                  } else {
	                    razeware.rotateGear(razeware.calculateDegree(razeware.degree, razeware.mediumSpeed), razeware.counterClockwise, jQuery(this));
	                  }
	                });
	                jQuery(".large-gear").each(function(index) {
	                  if (jQuery(this).hasClass("clockwise-motion")) {
	                    razeware.rotateGear(razeware.calculateDegree(razeware.degree, razeware.largeSpeed), razeware.clockwise, jQuery(this));
	                  } else {
	                    razeware.rotateGear(razeware.calculateDegree(razeware.degree, razeware.largeSpeed), razeware.counterClockwise, jQuery(this));
	                  }
	                });
	          
	                razeware.rotateGears();
	                
	        }
	                
	      },razeware.timer)); 
	    }
	  },

	  stopRotatingGears : function() {

	    razeware.isRotating = false;
	    razeware.isLocked = true;
	    
	    for (var i=0; i<razeware.timeOuts.length; i++) {
	       clearTimeout(razeware.timeOuts[i]);
	    }

	    razeware.timeOuts = [];
	    razeware.fadeFlags = new Array(4);
	    razeware.totalTicks = 0;
	    razeware.degreesPerTick = razeware.defaultDegreesPerTick;
	    razeware.isLocked = false;
	  
	  }

	}

	
	/*!
	* placeholders js
	*/

	!function(a){"use strict";function b(){}function c(){try{return document.activeElement}catch(a){}}function d(a,b){for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return!0;return!1}function e(a,b,c){return a.addEventListener?a.addEventListener(b,c,!1):a.attachEvent?a.attachEvent("on"+b,c):void 0}function f(a,b){var c;a.createTextRange?(c=a.createTextRange(),c.move("character",b),c.select()):a.selectionStart&&(a.focus(),a.setSelectionRange(b,b))}function g(a,b){try{return a.type=b,!0}catch(c){return!1}}function h(a,b){if(a&&a.getAttribute(B))b(a);else for(var c,d=a?a.getElementsByTagName("input"):N,e=a?a.getElementsByTagName("textarea"):O,f=d?d.length:0,g=e?e.length:0,h=f+g,i=0;h>i;i++)c=f>i?d[i]:e[i-f],b(c)}function i(a){h(a,k)}function j(a){h(a,l)}function k(a,b){var c=!!b&&a.value!==b,d=a.value===a.getAttribute(B);if((c||d)&&"true"===a.getAttribute(C)){a.removeAttribute(C),a.value=a.value.replace(a.getAttribute(B),""),a.className=a.className.replace(A,"");var e=a.getAttribute(I);parseInt(e,10)>=0&&(a.setAttribute("maxLength",e),a.removeAttribute(I));var f=a.getAttribute(D);return f&&(a.type=f),!0}return!1}function l(a){var b=a.getAttribute(B);if(""===a.value&&b){a.setAttribute(C,"true"),a.value=b,a.className+=" "+z;var c=a.getAttribute(I);c||(a.setAttribute(I,a.maxLength),a.removeAttribute("maxLength"));var d=a.getAttribute(D);return d?a.type="text":"password"===a.type&&g(a,"text")&&a.setAttribute(D,"password"),!0}return!1}function m(a){return function(){P&&a.value===a.getAttribute(B)&&"true"===a.getAttribute(C)?f(a,0):k(a)}}function n(a){return function(){l(a)}}function o(a){return function(){i(a)}}function p(a){return function(b){return v=a.value,"true"===a.getAttribute(C)&&v===a.getAttribute(B)&&d(x,b.keyCode)?(b.preventDefault&&b.preventDefault(),!1):void 0}}function q(a){return function(){k(a,v),""===a.value&&(a.blur(),f(a,0))}}function r(a){return function(){a===c()&&a.value===a.getAttribute(B)&&"true"===a.getAttribute(C)&&f(a,0)}}function s(a){var b=a.form;b&&"string"==typeof b&&(b=document.getElementById(b),b.getAttribute(E)||(e(b,"submit",o(b)),b.setAttribute(E,"true"))),e(a,"focus",m(a)),e(a,"blur",n(a)),P&&(e(a,"keydown",p(a)),e(a,"keyup",q(a)),e(a,"click",r(a))),a.setAttribute(F,"true"),a.setAttribute(B,T),(P||a!==c())&&l(a)}var t=document.createElement("input"),u=void 0!==t.placeholder;if(a.Placeholders={nativeSupport:u,disable:u?b:i,enable:u?b:j},!u){var v,w=["text","search","url","tel","email","password","number","textarea"],x=[27,33,34,35,36,37,38,39,40,8,46],y="#ccc",z="placeholdersjs",A=new RegExp("(?:^|\\s)"+z+"(?!\\S)"),B="data-placeholder-value",C="data-placeholder-active",D="data-placeholder-type",E="data-placeholder-submit",F="data-placeholder-bound",G="data-placeholder-focus",H="data-placeholder-live",I="data-placeholder-maxlength",J=100,K=document.getElementsByTagName("head")[0],L=document.documentElement,M=a.Placeholders,N=document.getElementsByTagName("input"),O=document.getElementsByTagName("textarea"),P="false"===L.getAttribute(G),Q="false"!==L.getAttribute(H),R=document.createElement("style");R.type="text/css";var S=document.createTextNode("."+z+" {color:"+y+";}");R.styleSheet?R.styleSheet.cssText=S.nodeValue:R.appendChild(S),K.insertBefore(R,K.firstChild);for(var T,U,V=0,W=N.length+O.length;W>V;V++)U=V<N.length?N[V]:O[V-N.length],T=U.attributes.placeholder,T&&(T=T.nodeValue,T&&d(w,U.type)&&s(U));var X=setInterval(function(){for(var a=0,b=N.length+O.length;b>a;a++)U=a<N.length?N[a]:O[a-N.length],T=U.attributes.placeholder,T?(T=T.nodeValue,T&&d(w,U.type)&&(U.getAttribute(F)||s(U),(T!==U.getAttribute(B)||"password"===U.type&&!U.getAttribute(D))&&("password"===U.type&&!U.getAttribute(D)&&g(U,"text")&&U.setAttribute(D,"password"),U.value===U.getAttribute(B)&&(U.value=T),U.setAttribute(B,T)))):U.getAttribute(C)&&(k(U),U.removeAttribute(B));Q||clearInterval(X)},J);e(a,"beforeunload",function(){M.disable()})}}(this);	


	/*!
 * enquire.js v2.1.2 - Awesome Media Queries in JavaScript
 * Copyright (c) 2014 Nick Williams - http://wicky.nillia.ms/enquire.js
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */

!function(a,b,c){var d=window.matchMedia;"undefined"!=typeof module&&module.exports?module.exports=c(d):"function"==typeof define&&define.amd?define(function(){return b[a]=c(d)}):b[a]=c(d)}("enquire",this,function(a){"use strict";function b(a,b){var c,d=0,e=a.length;for(d;e>d&&(c=b(a[d],d),c!==!1);d++);}function c(a){return"[object Array]"===Object.prototype.toString.apply(a)}function d(a){return"function"==typeof a}function e(a){this.options=a,!a.deferSetup&&this.setup()}function f(b,c){this.query=b,this.isUnconditional=c,this.handlers=[],this.mql=a(b);var d=this;this.listener=function(a){d.mql=a,d.assess()},this.mql.addListener(this.listener)}function g(){if(!a)throw new Error("matchMedia not present, legacy browsers require a polyfill");this.queries={},this.browserIsIncapable=!a("only all").matches}return e.prototype={setup:function(){this.options.setup&&this.options.setup(),this.initialised=!0},on:function(){!this.initialised&&this.setup(),this.options.match&&this.options.match()},off:function(){this.options.unmatch&&this.options.unmatch()},destroy:function(){this.options.destroy?this.options.destroy():this.off()},equals:function(a){return this.options===a||this.options.match===a}},f.prototype={addHandler:function(a){var b=new e(a);this.handlers.push(b),this.matches()&&b.on()},removeHandler:function(a){var c=this.handlers;b(c,function(b,d){return b.equals(a)?(b.destroy(),!c.splice(d,1)):void 0})},matches:function(){return this.mql.matches||this.isUnconditional},clear:function(){b(this.handlers,function(a){a.destroy()}),this.mql.removeListener(this.listener),this.handlers.length=0},assess:function(){var a=this.matches()?"on":"off";b(this.handlers,function(b){b[a]()})}},g.prototype={register:function(a,e,g){var h=this.queries,i=g&&this.browserIsIncapable;return h[a]||(h[a]=new f(a,i)),d(e)&&(e={match:e}),c(e)||(e=[e]),b(e,function(b){d(b)&&(b={match:b}),h[a].addHandler(b)}),this},unregister:function(a,b){var c=this.queries[a];return c&&(b?c.removeHandler(b):(c.clear(),delete this.queries[a])),this}},new g});

jQuery(document).ready(function() 
{
	


	// -------------------------------------------------------------
	//   Search box
	// -------------------------------------------------------------


	jQuery('button#search-submit-desktop').click(function(){ //show search box when user clicks search icon

	  jQuery('aside#search-view').toggleClass('visible-ele');
	  jQuery('input#nav-search-box').focus();

	});

	jQuery(document).click(function(event) { //Hide search box when user clicks anywhere

	    if(!jQuery(event.target).closest('button#search-submit-desktop').length && !jQuery(event.target).is('input#nav-search-box')  ) {
	        
	        if(jQuery('aside#search-view').is(":visible")) {

	            jQuery('aside#search-view').removeClass('visible-ele');
	            // jQuery('form#nav-search #nav-search-box').val('');

	        }

	    }  

	});


	// -------------------------------------------------------------
	//   Mobile Menu
	// -------------------------------------------------------------

	jQuery('button#toggle-menu').on('click touchend', function(e){

	  e.preventDefault();
	  jQuery('#main-links, .login-controls, .nav-my-account').toggleClass('visible-ele');

	  if(jQuery('#main-links').is(":visible")) { //if any part of mobile menu is open, this is a click to close so hide dropdowns
	    jQuery('ul.dropdown-menu').removeClass('visible-ele');
	  }

	});


	// -------------------------------------------------------------
	//   Dropdown menu links mobile 
	// -------------------------------------------------------------


	enquire.register("screen and (max-width: 55em)", { //use enquire to cleanup nav going from mobile to desktop
	    match : function() {

	    },  
	    unmatch : function() {
	        jQuery('ul.dropdown-menu').removeClass('visible-ele');
	        jQuery('li#main-links, li.nav-my-account, li.login-controls').removeClass('visible-ele');
	    }
	});

	jQuery('body').on('click touchend', 'a.top-level-link', function(e) { //void href from links with dropdown menus

	  e.preventDefault();
	  jQuery(this).next().toggleClass('visible-ele');

	});

	jQuery(document).on('click', function(event) { //Hide dropdown menu unless user clicks within it

	  if(!jQuery(event.target).closest('a.top-level-link').length && !jQuery(event.target).is('ul.dropdown-menu, ul.dropdown-menu a')) {
	        
	        if(jQuery('ul.dropdown-menu').is(":visible")) {

	            jQuery('ul.dropdown-menu').removeClass('visible-ele');


	        }

	    }  

	});

			
		jQuery("#gearbox").mouseenter(function() {
			razeware.startRotatingGears();	 
		});
		
		jQuery("#gearbox").mouseleave(function() { 
			razeware.stopRotatingGears();
		});

	jQuery("#difficulty-selector a").each(function(index) 
	{
		
		jQuery(this).click(function() 
		{
			var previousTutorialList = jQuery("#difficulty-selector .selected").attr("data-tutorial-list");
			var tutorialList = jQuery(this).parent().attr("data-tutorial-list");
			var previousSelected  = jQuery("#difficulty-selector .selected");
			if (!jQuery(this).parent().hasClass("selected")) 
			{
				jQuery("#" + previousTutorialList).css("display", "none");
				jQuery("#" + tutorialList).css("display", "block");
				previousSelected.removeClass("selected");
				jQuery(this).parent().addClass("selected")
				
				
			}
			return false;
		});
	});
	
	jQuery("#difficulty-selector li").each(function(index) 
	{
		
		jQuery(this).click(function() 
		{
			var previousTutorialList = jQuery("#difficulty-selector .selected").attr("data-tutorial-list");
			var tutorialList = jQuery(this).attr("data-tutorial-list");
			var previousSelected  = jQuery("#difficulty-selector .selected");
			if (!jQuery(this).parent().hasClass("selected")) 
			{
				jQuery("#" + previousTutorialList).css("display", "none");
				jQuery("#" + tutorialList).css("display", "block");
				previousSelected.removeClass("selected");
				jQuery(this).addClass("selected")
				
				
			}
			return false;
		});
	});
	jQuery('.wpsqt-show-answer').click( function() {
		jQuery(this).siblings('.wpsqt-answer-explanation').show();
		jQuery(this).hide();
		return false;
	});
	jQuery('.wpsqt-show-toggle').click( function() {
		jQuery(this).siblings('.wpsqt-toggle-block').show();
		jQuery(this).siblings('.wpsqt-hide-toggle').show();
		jQuery(this).hide();
		return false;
	});
	jQuery('.wpsqt-hide-toggle').click( function() {
		jQuery(this).siblings('.wpsqt-toggle-block').hide();
		jQuery(this).siblings('.wpsqt-show-toggle').show();
		jQuery(this).hide();
		return false;
	});
	jQuery('.wpst_question input, .wpst_question textarea').click( function() {
		var explanationText = jQuery(this).parents('.wpst_question').children('.wpsqt-answer-explanation:hidden');

		if (explanationText.length != 0) {
			jQuery(explanationText).siblings('.wpsqt-show-answer').show();
		}
	});
});

/**
 * Handle: easySpoiler
 * Version: 1.2
 * Enqueue: true
 *
 * Author: dyerware
 * Author URI: http://www.dyerware.com
 * Copyright Â© 2009, 2010, 2011  dyerware
 * Support: support@dyerware.com
 */
 
/////////////////////////////////////////////////////////////////////////////
function wpSpoilerToggle(id, doAnim, showName, hideName, speed, doIframes) 
{
    var myName = id + '_action';
    var b = document.getElementById(myName);
    var e = document.getElementById(id);
        
    if(e.style.display == 'block')
    {
        if (doAnim)
            {jQuery("#" + id).slideUp(speed);}
        else
            {e.style.display = 'none';}
            

        b.nodeValue=showName;
        b.innerText=showName;
        
        if (navigator.userAgent.indexOf("Firefox")!=-1)
        {
        	b.firstChild.nodeValue=showName;
        }
        
    }
    else
    {     
        if (doAnim)
            {jQuery("#" + id).fadeIn(speed);} 
        e.style.display = 'block';
        
	    b.value=hideName;
	    b.innerText=hideName;
        
        if (navigator.userAgent.indexOf("Firefox")!=-1)
        {
        	b.firstChild.nodeValue=hideName;
        }
        
        if (doIframes && doIframes != "false")
       	{
       		jQuery("#" + id).find('iframe').each(function(i) {autoResize(this);});
       		//jQuery("#" + id).find('iframe').each(function(i) {this.src = this.src;});
       	}
    }
    
    return false;
}

/////////////////////////////////////////////////////////////////////////////
function autoResize(iframe)
{
    iframe.height = iframe.contentWindow.document.body.scrollHeight;
    iframe.width = iframe.contentWindow.document.body.scrollWidth;
}

/////////////////////////////////////////////////////////////////////////////
function wpSpoilerHide(id, doAnim, showName, speed) 
{
    var myName = id + '_action';
    var me = document.getElementById(myName);
    var e = document.getElementById(id);
    
    if(e.style.display == 'block')
    {   
        if (doAnim)
            {jQuery("#" + id).slideUp(speed);}
        e.style.display = 'none';
        
        me.value=showName;
        me.innerText=showName;
	        
        if (navigator.userAgent.indexOf("Firefox")!=-1)
        {
        	me.firstChild.nodeValue=showName;
        }
    }
}

/////////////////////////////////////////////////////////////////////////////
function wpSpoilerSelect(objId)
{
    if (document.selection) 
    {
    	document.selection.empty(); 
    }
	else 
	{
		if (window.getSelection)
		{
               window.getSelection().removeAllRanges();
		}
	}
               
	if (document.selection) 
	{
		var range = document.body.createTextRange();
		range.moveToElementText(document.getElementById(objId));
		range.select();
	}
	else if (window.getSelection) 
	{
		var range = document.createRange();
		range.selectNode(document.getElementById(objId));
		window.getSelection().addRange(range);
	}
}

var userAgent = navigator.userAgent.toLowerCase();
var is_webtv = userAgent.indexOf('webtv') != -1;
var is_kon = userAgent.indexOf('konqueror') != -1;
var is_mac = userAgent.indexOf('mac') != -1;
var is_saf = userAgent.indexOf('applewebkit') != -1 || navigator.vendor == 'Apple Computer, Inc.';
var is_opera = userAgent.indexOf('opera') != -1 && opera.version();
var is_moz = (navigator.product == 'Gecko' && !is_saf) && userAgent.substr(userAgent.indexOf('firefox') + 8, 3);
var is_ns = userAgent.indexOf('compatible') == -1 && userAgent.indexOf('mozilla') != -1 && !is_opera && !is_webtv && !is_saf;
var is_ie = (userAgent.indexOf('msie') != -1 && !is_opera && !is_saf && !is_webtv) && userAgent.substr(userAgent.indexOf('msie') + 5, 3);



function copycode(obj) {
	obj = document.getElementById(obj);
	if(is_ie && obj.style.display != 'none') {
		var rng = document.body.createTextRange();
		rng.moveToElementText(obj);
		rng.scrollIntoView();
		rng.select();
		rng.execCommand("Copy");
		rng.collapse(false);
	}
}
/*
if ('undefined' == typeof codeid) {
	function codeid(id) {
		return document.getElementById(id);
	}
}


function copycode(id){
//copyToClipboard(document.getElementById(id).value);
	copy(document.getElementById(id).value);
}
function copy(text2copy) { 
	if (window.clipboardData) {   
  	window.clipboardData.setData("Text",text2copy);   
  } else {   
  	var flashcopier = 'flashcopier';
    if(!document.getElementById(flashcopier)) {
       var divholder = document.createElement('div');
       divholder.id = flashcopier;
       document.body.appendChild(divholder);
    }
    document.getElementById(flashcopier).innerHTML = '';
    var divinfo = '<embed src="_clipboard.swf" FlashVars="clipboard='+escape(text2copy)+'" width="0" height="0" type="application/x-shockwave-flash"></embed>';//ÕâÀïÊÇ¹Ø¼ü
   	document.getElementById(flashcopier).innerHTML = divinfo;
   	alert('Text copied');
  }
}
function copyToClipboard(meintext){
	if (window.clipboardData) {
  	alert("ie");
  	// the IE-manier
  	window.clipboardData.setData("Text", meintext);
       
		// waarschijnlijk niet de beste manier om Moz/NS te detecteren;
   	// het is mij echter onbekend vanaf welke versie dit precies werkt:
  }
  else if (window.netscape) { 
     
  	// dit is belangrijk maar staat nergens duidelijk vermeld:
    // you have to sign the code to enable this, or see notes below 
    netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
     
    // maak een interface naar het clipboard
    var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
    if (!clip) return;
    alert("mozilla");
    // maak een transferable
    var trans = Components.classes['@mozilla.org/widget/transferable;1']
                    .createInstance(Components.interfaces.nsITransferable);
    if (!trans) return;
     
    // specificeer wat voor soort data we op willen halen; text in dit geval
    trans.addDataFlavor('text/unicode');
     
    // om de data uit de transferable te halen hebben we 2 nieuwe objecten 
    // nodig om het in op te slaan
    var str = new Object();
    var len = new Object();
     
    var str = Components.classes["@mozilla.org/supports-string;1"]
                  .createInstance(Components.interfaces.nsISupportsString);
     
    var copytext=meintext;
     
    str.data=copytext;
     
    trans.setTransferData("text/unicode",str,copytext.length*2);
     
    var clipid=Components.interfaces.nsIClipboard;
     
    if (!clip) return false;
     
    clip.setData(trans,null,clipid.kGlobalClipboard);
     
	}
  alert("Following info was copied to your clipboard:\n\n" + meintext);
  return false;
}
*/  
// Start syntax_hilite.js
function getBrowserType() {
	var detect = navigator.userAgent.toLowerCase();
	var browser;
	var doCheckIt = function (bString) {
		place = detect.indexOf(bString) + 1;
		return place;
	};
	if (doCheckIt('konqueror')) { browser = "konqueror"; }
	else if (doCheckIt('safari')) { browser = "safari"; }
	else if (doCheckIt('omniweb')) { browser = "omniweb"; }
	else if (doCheckIt('opera')) { browser = "opera"; }
	else if (doCheckIt('webtv')) { browser = "webtv"; }
	else if (doCheckIt('icab')) { browser = "icab"; }
	else if (doCheckIt('msie')) { browser = "msie"; }
	else if (doCheckIt('firefox')) { browser = "firefox"; }
	else if (!doCheckIt('compatible')) { browser = "nn"; }
	return browser;
}

function strTrim(str) {
	var i,j;
	i = 0;
	j = str.length-1;
	str = str.split("");
	while(i < str.length) {
		if(str[i]==" ") {
			str[i] = "";
		} else {
			break;
		}
		i++;
	}
	while(j > 0) {
		if(str[j]== " ") {
			str[j]="";
		} else {
			break;
		}
		j--;
	}
	return str.join("");
}

function igEncodeHTML(igHTML) {
	var regExLT = /</g;
	var regExGT = />/g;
	igHTML = igHTML.replace(regExLT, "&lt;");
	igHTML = igHTML.replace(regExGT, "&gt;");
	return igHTML;
}

function doCleanUp(sTxt) {
	sTxt = sTxt.replace(/(\r\n|\r|\n)/g, "\n");
	var arrTxt = sTxt.split("\n");
	for(i=0; i<arrTxt.length; i++) {
		if(arrTxt[i].substr((arrTxt[i].length-1), 1)==" ") {
			arrTxt[i] = arrTxt[i].substr(0, (arrTxt[i].length-1));
		}
		if(arrTxt[i].substr((arrTxt[i].length-1), 1)=="	") {
			arrTxt[i] = arrTxt[i].substr(0, (arrTxt[i].length-1));
		}
	}
	sTxt = arrTxt.join("\n");
	var regExNL1a = /([\n]{2,})/g;			//to find two consecutive 'newlines'
	var regExNL1b = /([ ]{1,})\n/g;			//to find more than 1 whitespace before 'newline'
	var regExNL1c = /([	|\t]{1,})\n/g;		//to find more than 1 tab before 'newline'
	var regExNL1d = /\n([ ]{1,})\n/g;		//to find a line with only spaces
	var regExNL1e = /\n([	|\t]{1,})\n/g;	//to find a line with only tabs
	var regExNL1g = / {4}/g;				//to find 4 space chars
	sTxt = sTxt.replace(regExNL1g, "	");
	sTxt = sTxt.replace(regExNL1d, "\n").replace(regExNL1e, "\n");
	sTxt = sTxt.replace(regExNL1b, "\n").replace(regExNL1c, "\n");
	sTxt = sTxt.replace(regExNL1a, "\n");
	if(sTxt.substr(0, 1)=="\n") {
		sTxt = sTxt.substr(1, sTxt.length);
	}
	if(sTxt.substr((sTxt.length-1), 1)=="\n") {
		sTxt = sTxt.substr(0, (sTxt.length-1));
	}
	return sTxt;
}

function getTagCode(sID) {
	var myBrowser = strTrim(navigator.appName.substring(0, 9));
	myBrowser = myBrowser.toLowerCase();
	if(document.getElementById) {
		oDoc = document.getElementById(sID);
	} else if(document.all) {
		oDoc = document.all[sID];
	}
	var getTxt = "";
	if(typeof(oDoc.innerText) != 'undefined') {
		getTxt = strTrim(oDoc.innerText);
	} else {
		getTxt = strTrim(oDoc.innerHTML);	//textContent doesn't keep \n with <LI>, so use innerHTML
		var regExLi = /<\/li>/gi;		//RegEx to find </li>
		var regExHTML = /<\S[^>]*>/g;	//RegEx to find HTML Tags
		var regExAnd = /&amp;/g;		//to find ampersand as HTML entity
		var regExSpace = /&nbsp;/g;		//to find whitespace as HTML entity
		var regExLT = /&lt;/g;			//to find < as HTML entity
		var regExGT = /&gt;/g;			//to find > as HTML entity
		getTxt = getTxt.replace(regExLi, "\n");		//replace </li> with \n
		getTxt = getTxt.replace(regExHTML, "");		//strip out all HTML Tags
		getTxt = getTxt.replace(regExAnd, "&");		//replace &amp; with &
		getTxt = getTxt.replace(regExSpace, " ");	//replace &nbsp; with simple whitespace
		getTxt = getTxt.replace(regExLT, "<");		//replace &lt; with <
		getTxt = getTxt.replace(regExGT, ">");		//replace &gt; with >
	}
	return getTxt;
}

function showCodeTxt(sId) {
	var cdTxt = igEncodeHTML(getTagCode(sId));
	cdTxt = doCleanUp(cdTxt);
	var cdTxtPrefix = "<html><head><title>WP-CODEBOX &raquo; Plain-Text View</title><style>body { margin:0px; padding:0px; white-space:nowrap; }</style></head><body><pre>\n";
	var cdTxtSuffix = "\n</pre><br /></body></html>";
	cdWin = window.open("about:blank", "cdWin", "toolbar=0,scrollbars=1,location=0,statusbar=0,menubar=0,resizable=1,width=700,height=400,left=35,top=85");
	cdWin.document.open();
	cdWin.document.write(cdTxtPrefix+cdTxt+cdTxtSuffix);
	cdWin.document.close();
}

function getCodeTxt(sId) {
	var cdTxt = igEncodeHTML(getTagCode(sId));
	cdTxt = doCleanUp(cdTxt);
	return cdTxt;
}

function hidePlainTxt(bID) {
	var oCodeBox = document.getElementById(bID);
	if(arrCode[bID]=="") {
		alert("The HTML View for this Code Box is not available");
	} else {
		var lnkID = "l"+bID;
		lnkID = lnkID.toLowerCase();
		var oLnk = document.getElementById(lnkID);
		var sInnerHTML = "<a href=\"#\" onclick=\"javascript:showPlainTxt('"+bID+"'); return false;\">PLAIN TEXT</a>";
		oLnk.innerHTML = sInnerHTML;
		oCodeBox.innerHTML = "";
		oCodeBox.innerHTML = arrCode[bID];
		arrCode[bID] = "";
	}
}

function showPlainTxt(bID) {
	var sHtmlCode, sPlainCode, sInnerHTML, oLnk, intHeightDiff, intWidthDiff;
	var browserName = getBrowserType();
	if(browserName=="msie") {
		intHeightDiff = 20;
		intWidthDiff = 5;
	} else if(browserName=="opera") {
		intHeightDiff = 20;
		intWidthDiff = 12;
	} else if(browserName=="firefox") {
		intHeightDiff = 20;
		intWidthDiff = 12;
	}
	var oCodeBox = document.getElementById(bID);
	//get InnerHTML
	sHtmlCode = oCodeBox.innerHTML;
	arrCode[bID] = sHtmlCode;
	var lnkID = "l"+bID;
	lnkID = lnkID.toLowerCase();
	oLnk = document.getElementById(lnkID);
	sInnerHTML = "<a href=\"#\" onclick=\"javascript:hidePlainTxt('"+bID+"'); return false;\">HILITED HTML</a>";
	oLnk.innerHTML = sInnerHTML;
	sPlainCode = getCodeTxt(bID);
	var cbHeight = oCodeBox.parentNode.clientHeight;
	var cbWidth = oCodeBox.parentNode.clientWidth;
	var ptHeight = cbHeight-intHeightDiff;
	var ptWidth = cbWidth-intWidthDiff;
	sPlainCodeHTML = "<textarea style=\"width:"+ptWidth+"px; height:"+ptHeight+"px;\" wrap=\"off\">"+sPlainCode+"</textarea>";
	oCodeBox.innerHTML = "";
	oCodeBox.innerHTML = sPlainCodeHTML;
}

var $jcodebox = jQuery.noConflict(); 
$jcodebox(document).ready(function(){
	$jcodebox(".wp_codebox_msgheader").click(function(event){
		if (event.target == this){
			$jcodebox(this).next(".wp_codebox").slideToggle("slow");
			$jcodebox(this).toggleClass("active");
		}
	});
	$jcodebox(".wp_codebox_hide").next(".wp_codebox").hide();
	$jcodebox(".wp_codebox_hide").addClass("active");
});

/*jshint eqnull:true */
/*!
 * jQuery Cookie Plugin v1.2
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
(function ($, document, undefined) {

	var pluses = /\+/g;

	function raw(s) {
		return s;
	}

	function decoded(s) {
		return decodeURIComponent(s.replace(pluses, ' '));
	}

	$.cookie = function (key, value, options) {

		// key and at least value given, set cookie...
		if (value !== undefined && !/Object/.test(Object.prototype.toString.call(value))) {
			options = $.extend({}, $.cookie.defaults, options);

			if (value === null) {
				options.expires = -1;
			}

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}

			value = String(value);
            
			return (document.cookie = [
				encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// key and possibly options given, get cookie...
		options = value || $.cookie.defaults || {};
		var decode = options.raw ? raw : decoded;
		var cookies = document.cookie.split('; ');
		for (var i = 0, parts; (parts = cookies[i] && cookies[i].split('=')); i++) {
			if (decode(parts.shift()) === key) {
				return decode(parts.join('='));
			}
		}

		return null;
	};

	$.cookie.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key, options) !== null) {
			$.cookie(key, null, options);
			return true;
		}
		return false;
	};

})(jQuery, document);

jQuery(document).ready(function() {
	const cookieNameSuffix = jQuery('div#top-sales-banner').data('cookie-name') || 'noSalesBanner';
	const cookieName = 'topBanner--' + cookieNameSuffix;

	jQuery('div#top-sales-banner button').on('click touchend', function(){
		jQuery.cookie(cookieName, '25', { expires: 30 });
		jQuery('div#top-sales-banner').slideUp();
	});

	if (!jQuery.cookie(cookieName)){
		jQuery('div#top-sales-banner').show();
	}

	jQuery('#comment-form').submit(function() {
		if (jQuery("#comment").val() == "") {
			alert("Please enter a comment.");
			return false;
		}
		return true;
	});
	jQuery("#comments .comment-pages.top-pages a").each(function(index) {	
		
		jQuery(this).click(function() {
			jQuery("#pageNumber").attr("value", index+1);
			razewareComments.getComments(jQuery(this).text());
			return false;
		});
	});
	jQuery("#comments .comment-pages.bottom-pages a").each(function(index) {	
		jQuery(this).click(function() {
			jQuery("#pageNumber").attr("value", index+1);
			razewareComments.getComments(jQuery(this).text());
			var target = this.hash,
		    $target = jQuery(target);
		    jQuery('html, body').stop().animate({
		        'scrollTop': $target.offset().top
		    }, 900, 'swing', function () {
		        window.location.hash = target;
		    });
			return false;
		});
	});
	jQuery('textarea#comment').focus(function() {
        if(jQuery(this).val() == jQuery(this).data('default_val') || !jQuery(this).data('default_val')) {
            jQuery(this).data('default_val', jQuery(this).val());
            jQuery(this).val('');
        }
    });

    jQuery('textarea#comment').blur(function() {
        if (jQuery(this).val() == '') jQuery(this).val(jQuery(this).data('default_val'));
    });
	
});
var pollsL10n = {"ajax_url":"http:\/\/www.raywenderlich.com\/wp-admin\/admin-ajax.php","text_wait":"Your last request is still being processed. Please wait a while ...","text_valid":"Please choose a valid poll answer.","text_multiple":"Maximum number of choices allowed: ","show_loading":"1","show_fading":"1"};
var poll_id=0,poll_answer_id="",is_being_voted=!1;pollsL10n.show_loading=parseInt(pollsL10n.show_loading);pollsL10n.show_fading=parseInt(pollsL10n.show_fading);
function poll_vote(a){is_being_voted?alert(pollsL10n.text_wait):(set_is_being_voted(!0),poll_id=a,poll_answer_id="",poll_multiple_ans_count=poll_multiple_ans=0,jQuery("#poll_multiple_ans_"+poll_id).length&&(poll_multiple_ans=parseInt(jQuery("#poll_multiple_ans_"+poll_id).val())),jQuery("#polls_form_"+poll_id+" input:checkbox, #polls_form_"+poll_id+" input:radio").each(function(){jQuery(this).is(":checked")&&(0<poll_multiple_ans?(poll_answer_id=jQuery(this).val()+","+poll_answer_id,poll_multiple_ans_count++):
poll_answer_id=parseInt(jQuery(this).val()))}),0<poll_multiple_ans?0<poll_multiple_ans_count&&poll_multiple_ans_count<=poll_multiple_ans?(poll_answer_id=poll_answer_id.substring(0,poll_answer_id.length-1),poll_process()):0==poll_multiple_ans_count?(set_is_being_voted(!1),alert(pollsL10n.text_valid)):(set_is_being_voted(!1),alert(pollsL10n.text_multiple+" "+poll_multiple_ans)):0<poll_answer_id?poll_process():(set_is_being_voted(!1),alert(pollsL10n.text_valid)))}
function poll_process(){poll_nonce=jQuery("#poll_"+poll_id+"_nonce").val();pollsL10n.show_fading?jQuery("#polls-"+poll_id).fadeTo("def",0,function(){pollsL10n.show_loading&&jQuery("#polls-"+poll_id+"-loading").show();jQuery.ajax({type:"POST",url:pollsL10n.ajax_url,data:"action=polls&view=process&poll_id="+poll_id+"&poll_"+poll_id+"="+poll_answer_id+"&poll_"+poll_id+"_nonce="+poll_nonce,cache:!1,success:poll_process_success})}):(pollsL10n.show_loading&&jQuery("#polls-"+poll_id+"-loading").show(),jQuery.ajax({type:"POST",
url:pollsL10n.ajax_url,data:"action=polls&view=process&poll_id="+poll_id+"&poll_"+poll_id+"="+poll_answer_id+"&poll_"+poll_id+"_nonce="+poll_nonce,cache:!1,success:poll_process_success}))}
function poll_result(a){is_being_voted?alert(pollsL10n.text_wait):(set_is_being_voted(!0),poll_id=a,poll_nonce=jQuery("#poll_"+poll_id+"_nonce").val(),pollsL10n.show_fading?jQuery("#polls-"+poll_id).fadeTo("def",0,function(){pollsL10n.show_loading&&jQuery("#polls-"+poll_id+"-loading").show();jQuery.ajax({type:"GET",url:pollsL10n.ajax_url,data:"action=polls&view=result&poll_id="+poll_id+"&poll_"+poll_id+"_nonce="+poll_nonce,cache:!1,success:poll_process_success})}):(pollsL10n.show_loading&&jQuery("#polls-"+
poll_id+"-loading").show(),jQuery.ajax({type:"GET",url:pollsL10n.ajax_url,data:"action=polls&view=result&poll_id="+poll_id+"&poll_"+poll_id+"_nonce="+poll_nonce,cache:!1,success:poll_process_success})))}
function poll_booth(a){is_being_voted?alert(pollsL10n.text_wait):(set_is_being_voted(!0),poll_id=a,poll_nonce=jQuery("#poll_"+poll_id+"_nonce").val(),pollsL10n.show_fading?jQuery("#polls-"+poll_id).fadeTo("def",0,function(){pollsL10n.show_loading&&jQuery("#polls-"+poll_id+"-loading").show();jQuery.ajax({type:"GET",url:pollsL10n.ajax_url,data:"action=polls&view=booth&poll_id="+poll_id+"&poll_"+poll_id+"_nonce="+poll_nonce,cache:!1,success:poll_process_success})}):(pollsL10n.show_loading&&jQuery("#polls-"+
poll_id+"-loading").show(),jQuery.ajax({type:"GET",url:pollsL10n.ajax_url,data:"action=polls&view=booth&poll_id="+poll_id+"&poll_"+poll_id+"_nonce="+poll_nonce,cache:!1,success:poll_process_success})))}function poll_process_success(a){jQuery("#polls-"+poll_id).replaceWith(a);pollsL10n.show_loading&&jQuery("#polls-"+poll_id+"-loading").hide();pollsL10n.show_fading?jQuery("#polls-"+poll_id).fadeTo("def",1,function(){set_is_being_voted(!1)}):set_is_being_voted(!1)}
function set_is_being_voted(a){is_being_voted=a};
function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload) {
        oldonload();
      }
      func();
    }
  }  
}
addLoadEvent(function(){
    var lhid = document.createElement('input');
    lhid.setAttribute('type','hidden');
    lhid.setAttribute('name','lang'); 
    src = document.getElementById('searchform');   
    if(src){
        src.appendChild(lhid);
        src.action=icl_home; 
    }
});

function icl_retry_mtr(a){
    var id = a.getAttribute('id');
    spl = id.split('_');
    var loc = location.href.replace(/#(.*)$/,'').replace(/(&|\?)(retry_mtr)=([0-9]+)/g,'').replace(/&nonce=([0-9a-z]+)(&|$)/g,'');
    if(-1 == loc.indexOf('?')){
        url_glue='?';
    }else{
        url_glue='&';
    }    
    location.href=loc+url_glue+'retry_mtr='+spl[3]+'&nonce='+spl[4];
    return false;
}