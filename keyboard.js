/*!
* Keyboard
*
* Copyright 2011, Amir Grozki
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*/

window.keyboard = window.keyboard || {};

window.keyboard.directions = { ltr: 1, rtl: 2 };
window.keyboard.defaultlayout = {};

window.keyboard.layouts = {
	'hebrew': {
		'lang': 'he',
		'title': '\u05de\u05e7\u05dc\u05d3\u05ea \u05e2\u05d1\u05e8\u05d9\u05ea',
		'direction': window.keyboard.directions.rtl,
		'keys': {
			'': ';1234567890-=/\'\u05e7\u05e8\u05d0\u05d8\u05d5\u05df\u05dd\u05e4][\\\u05e9\u05d3\u05d2\u05db\u05e2\u05d9\u05d7\u05dc\u05da\u05e3,\u05d6\u05e1\u05d1\u05d4\u05e0\u05de\u05e6\u05ea\u05e5.',
			's': '~!@#$%^&*()_+QWERTYUIOP}{|ASDFGHJKL:"ZXCVBNM><?',
			'c': '`1234567890-=QWERTYUIOP[]\\ASDFGHJKL;\'ZXCVBNM,./',
			'sc': '\u05b0\u05b1\u05b2\u05b3\u05b4\u05b5\u05b6\u05b7\u05b8\u05c2\u05c1\u05b9\u05bc/\'\u05e7\u05e8\u05d0\u05d8\u05d5\u05df\u05dd\u05e4][\u05bb\u05e9\u05d3\u05d2\u05db\u05e2\u05d9\u05d7\u05dc\u05da\u05e3,\u05d6\u05e1\u05d1\u05d4\u05e0\u05de\u05e6\u05ea\u05e5.'
		}
	},
	'english': {}
};
window.keyboard.defaultlayout = window.keyboard.layouts.hebrew;

(function (window, document, jQuery) {

	window.keyboard = window.keyboard || {};	
	window.keyboard.widget = window.keyboard.widget || (function Keyboard($, window, document, layout) {

        /* Private members */
        var specialKeys =
            {
                'backspace': 8,
                'shift': 16,
                'capslock': 20,
                'space': 32
            },
            defaults =
            {
                'lang': 'en',
                'title': 'English Keyboard',
                'direction': window.keyboard.directions.ltr,
                'width': '',
				'cssprefix': 'keyboard',
                'keys': {
                    '': '`1234567890-=qwertyuiop[]\\asdfghjkl;\'zxcvbnm,./',
                    's': '~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:"ZXCVBNM<>?',
                    'c': '`1234567890-=QWERTYUIOP[]\\ASDFGHJKL;\'ZXCVBNM,./',
                    'sc': '~!@#$%^&*()_+qwertyuiop{}|asdfghjkl:"zxcvbnm<>?'
                },
                'specialKeys': {
                    'bksp': { 'cssclass': 'bksp', 'code': specialKeys.backspace, 'key': 'bksp' },
                    'caps': { 'cssclass': 'caps', 'code': specialKeys.capslock, 'key': 'caps' },
                    'lshift': { 'cssclass': 'lshift', 'key': 'shift' },
                    'rshift': { 'cssclass': 'rshift', 'key': 'shift' },
                    'space': { 'cssclass': 'space', 'code': specialKeys.space, 'key': ' ' }
                }
            },
            keyboardLayout = $.extend({}, defaults, layout),
            container = $(format('<div class="{0} {0}-{1} {0}-{2}"></div>', keyboardLayout.cssprefix, ((keyboardLayout.direction == window.keyboard.directions.ltr) ? 'ltr' : 'rtl'), keyboardLayout.lang)),
            keyMap = {},
            focusedTextbox = $('textarea,input[type=text]')[0], // Select first textbox on the page as the default textbox
            shiftKeys = null,
            shiftMode = false,
            capsLockMode = false,
            mousePressed = false,
			cssLoaded = false,
			keyboardVisible = false,
            mouseOffsetX = 0,
            mouseOffsetY = 0,
            specialKeyFunctions = {
                8: backspace, // Backspace
                20: toggleCaps // Caps lock
            };

        /* Private functions */
        function initializeKeyboard() {
            if ( ! keyboardVisible ) {
				if ( cssLoaded ) {
					createKeyboard();
				} else {
					$(function () {
						createStylesheet('keyboard.css', function () {
							cssLoaded = true;
							createKeyboard();
						});
					});
				}
			}
        }
		
		function createKeyboard() {
			renderKeyboard();

			setupEvents();

			container.prependTo('body');
			
			keyboardVisible = true;
		}

        function createStylesheet(href, callback) {

			// Create stylesheet link
			var head		= document.getElementsByTagName( 'head' )[0],
				link		= document.createElement( 'link' ),
				isGecko 	= ( 'MozAppearance' in document.documentElement.style ),
				isWebkit    = ( 'webkitAppearance' in document.documentElement.style ),
				sTimeout	= window.setTimeout,
				done;

			// Add attributes
			link.href = href;
			link.rel = 'stylesheet';
			link.type = 'text/css';

			// Poll for changes in webkit and gecko
			if ( isWebkit || isGecko ) {
				// A self executing function with a setTimeout poll to call itself
				// again until the css file is added successfully
				var poll = function ( link ) {
					sTimeout( function () {
						// Don't run again if we're already done
						if ( ! done ) {
							try {
								// In supporting browsers, we can see the length of the cssRules of the file go up
								if ( link.sheet.cssRules.length ) {
									// Then turn off the poll
									done = 1;
									// And execute a function to execute callbacks when all dependencies are met
									callback();
								}
								// otherwise, wait another interval and try again
								else {
									poll( link );
								}
							}
							catch ( ex ) {
								// In the case that the browser does not support the cssRules array (cross domain)
								// just check the error message to see if it's a security error
								if ( ( ex.code == 1e3 ) || ( ex.message == 'security' || ex.message == 'denied' ) ) {
									// if it's a security error, that means it loaded a cross domain file, so stop the timeout loop
									done = 1;
									// and execute a check to see if we can run the callback(s) immediately after this function ends
									sTimeout( function () {
										callback();
									}, 0 );
								}
								// otherwise, continue to poll
								else {
									poll( link );
								}
							}
						}
					}, 0 );
				};
				poll( link );

			}
			// Onload handler for IE and Opera
			else {
				// In browsers that allow the onload event on link tags, just use it
				link.onload = function () {			
					if ( ! done ) {
						// Set our flag to complete
						done = 1;
						// Check to see if we can call the callback
						sTimeout( function () {
							callback();
						}, 0 );
					}
				};

				// if we shouldn't inject due to error or settings, just call this right away
				link.onload();
			}

			// 404 Fallback
			sTimeout( function () {
				if ( ! done ) {
					done = 1;
					callback();
				}
			}, 3000 );
			
			// Inject CSS
			// only inject if there are no errors, and we didn't set the no inject flag ( oldObj.e )
			head.appendChild( link );
        }

        function renderKeyboard() {
            container.empty().append(format('<div class="{0}-keys"/>', keyboardLayout.cssprefix));

            renderTitle();
            renderControls();
            renderKeys(keyboardLayout.keys);
        }

        function renderControls() {
            container.prepend(format('<span class="{0}-controls"><a href="#" class="{0}-minimize">&nbsp;</a><a href="#" class="{0}-close">&nbsp;</a></span>', keyboardLayout.cssprefix));
        }

        function renderTitle() {
            container.prepend('<h2>' + keyboardLayout.title + '</h2>');
        }

        function renderKeys(keys) {
            var rows = 5,
                keysContainer = container.find(format('div.{0}-keys', keyboardLayout.cssprefix)).empty(),
                state = getState();

            keyMap = {};

            for (var i = 0; i < rows; i++) {

                var row = $(format('<div class="{0}-row {0}-row-{1}"/>', keyboardLayout.cssprefix, (i + 1)));

                switch (i) {
                    case 0:
                        renderKey(row, keys[state], 0, 12);
                        renderSpecialKey(row, 'bksp');
                        break;
                    case 1:
                        renderKey(row, keys[state], 13, 25);
                        break;
                    case 2:
                        renderSpecialKey(row, 'caps');
                        renderKey(row, keys[state], 26, 36);
                        break;
                    case 3:
                        renderSpecialKey(row, 'lshift');
                        renderKey(row, keys[state], 37, 46);
                        renderSpecialKey(row, 'rshift');
                        break;
                    case 4:
                        renderSpecialKey(row, 'space');
                        break;
                }

                row.appendTo(keysContainer);
            }

            shiftKeys = container.find(format('.{0}-button-lshift, .{0}-button-rshift', keyboardLayout.cssprefix)).click(function () {
                toggleShift();
                return false;
            });

            if (capsLockMode) {
                keyMap['caps'].addClass(keyboardLayout.cssprefix + '-button-active');
            }

            if (shiftMode) {
                shiftKeys.addClass(keyboardLayout.cssprefix + '-button-active');
            }
        }

        function renderKey(container, keys, from, to) {

            var button = null, key = null;
            for (var i = from; i <= to; i++) {
                key = keys.charAt(i);

                button = $(format('<a class="{0}-button" href="#">{1}</a>', keyboardLayout.cssprefix, key.toUpperCase())).data({ 'key': key.charCodeAt(0) });

                container.append(button);

                keyMap[key] = button;
            }
        }

        function renderSpecialKey(container, key) {
            var key = keyboardLayout.specialKeys[key],
                button = $(format('<a class="{0}-button {0}-button-{1}" href="#"><span>&nbsp;</span></a>', keyboardLayout.cssprefix, key.cssclass)).data({ 'key': key.code, 'cssclass': key.cssclass });

            container.append(button);

            keyMap[key.key] = button;
        }

        function setupEvents() {

            draggable();

            container.delegate('.' + keyboardLayout.cssprefix + '-button', 'click', function (evt) {

                var self = $(this),
                    key = self.data('key');

                if (!focusedTextbox) {
                    return true;
                }

                if (handleSpecialKey(key, focusedTextbox)) { // Handle special keys, such as backspace.
                    return false;
                }

                keyPress(key, focusedTextbox);

                if (shiftMode == true && key !== 'shift' && !isShiftKeyPressed(evt)) {
                    unshift();
                }

                return false;
            });

            container.delegate('.' + keyboardLayout.cssprefix + '-minimize', 'click', minimize);
            container.delegate('.' + keyboardLayout.cssprefix + '-close', 'click', dispose);

            $('textarea, input[type=text]').live({
                'keypress.keyboard': function (evt) {

                    var charCode = (typeof evt.which == "undefined") ? evt.keyCode : evt.which,
                        convertedCharCode = null;

                    if (isCtrlKeyPressed(evt)) {
                        // Special case for ctrl key. i.e: ctrl+a, ctrl+z. Let browser handle it.
                        return true;
                    }

                    if (isCapsLock(evt)) {
                        caps();
                    }

                    convertedCharCode = convertKeyCode(charCode); // Convert at the end, in case capslock mode has changed.

                    var result = keyPress(convertedCharCode, this);

                    if (shiftMode == true && !isShiftKeyPressed(evt)) {
                        unshift();
                    }

                    return result;
                },
                'focus.keyboard': function (evt) { focusedTextbox = this; },
                'keydown.keyboard': function (evt) {
                    var charCode = (typeof evt.which == "undefined") ? evt.keyCode : evt.which;

                    if (charCode == specialKeys.backspace) {
                        specialKeyFunctions[specialKeys.backspace](this);
                        return false;
                    }
                }
            });

            $(document).bind({
                'keyup.keyboard': function (evt) {
                    var charCode = (typeof evt.which == "undefined") ? evt.keyCode : evt.which;

                    if (charCode == specialKeys.capslock) {
                        specialKeyFunctions[specialKeys.capslock]();
                    }

                    if (charCode == specialKeys.shift && !isShiftKeyPressed(evt)) {
                        // Keyup will fire once shift is unpressed, and mark it as unpressed.
                        unshift();
                    }
                },
                'keydown.keyboard': function (evt) {
                    if (isShiftKeyPressed(evt) && shiftMode === false) {
                        shift();
                    }
                }
            });
        }

        function mousemove(evt) {
            if (mousePressed) {
                // Move the element by the amount of change in the mouse position
                var changeX = evt.clientX - mouseOffsetX,
					changeY = evt.clientY - mouseOffsetY,
                    offset = container.offset(),
                    newX = offset.left + changeX,
                    newY = offset.top + changeY;

                container.css({ 'left': newX, 'top': newY });

                mouseOffsetX = evt.clientX;
                mouseOffsetY = evt.clientY;
            }
        };

        function draggable() {
            var returnFalse = function () { return false; };

            container.mousedown(function (evt) {
                if (evt.button == 0 || evt.button == 1) {
                    mousePressed = true;
                    mouseOffsetX = evt.clientX;
                    mouseOffsetY = evt.clientY;

                    evt.cancelBubble = true;
                    if (evt.stopPropagation) {
                        evt.stopPropagation();
                    }

                    $(document).css('MozUserSelect', 'none')
                        .bind('selectstart mousedown', returnFalse);

                    return false;
                }
            });

            $(document).mouseup(function (evt) {
                if (evt.button == 0 || evt.button == 1) {
                    mousePressed = false;

                    $(document).css('MozUserSelect', '')
                        .unbind('selectstart mousedown', returnFalse);
                }
            })
            .mousemove(mousemove);
        }

        function handleSpecialKey(keyCode, element) {
            if (specialKeyFunctions.hasOwnProperty(keyCode)) {
                // We have a special case here (i.e: backspace), use specific function.
                specialKeyFunctions[keyCode].call(this, element);
                return true;
            }
        }

        function keyPress(keyCode, element) {

            var converted = String.fromCharCode(keyCode),
                button = keyMap[converted];

            if (!button) {
                return true; // We don't have this kind of button, let the browser perform whatever it needs to.
            }

            pressButton(button);

            // Modify textbox.
            var sel = getInputSelection(element),
                val = element.value;

            element.value = val.slice(0, sel.start) + converted + val.slice(sel.end);

            // Move the caret
            setInputSelection(element, sel.start + 1, sel.start + 1);

            return false; // Took care of event, let browser know it shouldn't perform anything.
        }

        function pressButton(button) {
            // Simulate button press.
            button.addClass(keyboardLayout.cssprefix + '-button-active');

            setTimeout(function () {
                button.removeClass(keyboardLayout.cssprefix + '-button-active');
            }, 100);
        }

        function getInputSelection(el) {

            return (

            /* mozilla / dom 3.0 */
				('selectionStart' in el && function () {
				    var l = el.selectionEnd - el.selectionStart;
				    return { start: el.selectionStart, end: el.selectionEnd, length: l, text: el.value.substr(el.selectionStart, l) };
				}) ||

            /* exploder */
				(document.selection && function () {

				    el.focus();

				    var r = document.selection.createRange();
				    if (r == null) {
				        return { start: 0, end: el.value.length, length: 0 }
				    }

				    var re = el.createTextRange();
				    var rc = re.duplicate();
				    re.moveToBookmark(r.getBookmark());
				    rc.setEndPoint('EndToStart', re);

				    return { start: rc.text.length, end: rc.text.length + r.text.length, length: r.text.length, text: r.text };
				}) ||

            /* browser not supported */
				function () {
				    return { start: 0, end: el.value.length, length: 0 };
				}

			)();

        }

        function offsetToRangeCharacterMove(el, offset) {
            return offset - (el.value.slice(0, offset).split("\r\n").length - 1);
        }

        function setInputSelection(el, startOffset, endOffset) {
            el.focus();
            if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
                el.selectionStart = startOffset;
                el.selectionEnd = endOffset;
            } else {
                var range = el.createTextRange();
                var startCharMove = offsetToRangeCharacterMove(el, startOffset);
                range.collapse(true);

                if (startOffset == endOffset) {
                    range.move("character", startCharMove);
                } else {
                    range.moveEnd("character", offsetToRangeCharacterMove(el, endOffset));
                    range.moveStart("character", startCharMove);
                }

                range.select();
            }
        }

        function convertKeyCode(charCode) {
            var state = getState(),
                charStr = String.fromCharCode(charCode),
                index = 0;

            switch (charCode) {
                case specialKeys.backspace: return 'bksp';
                case specialKeys.space: return specialKeys.space;
            }

            index = Math.max(defaults.keys['s'].indexOf(charStr), defaults.keys[''].indexOf(charStr)); // If charStr doesn't exist in one list, it will return -1, so the other will be picked as the index.

            if (charCode > 255) {
                // Provided character is outside of the ASCII chart, that is, not in english, try to find it in the translation.
                // We can also assume it's from a mouse click, so we can use the state instead of checking two sets.
                index = keyboardLayout.keys[state].indexOf(charStr);
            }

            return keyboardLayout.keys[state].charAt(index).charCodeAt(0);
        }

        function backspace(element) {
            var sel = getInputSelection(element),
                selCount = sel.end - sel.start,
                start = ((selCount > 0) ? sel.start : sel.start - 1),
                val = element.value;

            if (sel.start <= 0 && selCount <= 0) {
                // Trying to backspace at the start.
                return;
            }

            element.value = val.slice(0, start) + val.slice(sel.end);

            setInputSelection(element, start, start);

            pressButton(keyMap['bksp']);
        }

        function toggleCaps() {
            if (capsLockMode === true) {
                uncaps();
            } else {
                caps();
            }
        }

        function caps() {
            capsLockMode = true; // Mark shift as pressed.

            renderKeys(keyboardLayout.keys);
        }

        function uncaps() {
            capsLockMode = false; // Mark shift as pressed.

            renderKeys(keyboardLayout.keys);
        }

        function toggleShift() {
            if (shiftMode === true) {
                unshift();
            } else {
                shift();
            }
        }

        function shift() {
            shiftMode = true; // Mark shift as pressed.

            renderKeys(keyboardLayout.keys);
        }

        function unshift() {
            shiftMode = false; // Mark shift as unpressed.

            renderKeys(keyboardLayout.keys);
        }

        function getState() {
            if (shiftMode && capsLockMode) {
                return 'sc';
            } else if (shiftMode) {
                return 's';
            } else if (capsLockMode) {
                return 'c';
            } else {
                return '';
            }
        }

        function isShiftKeyPressed(evt) {
            return evt.shiftKey === true || !!(evt.modifiers & 4); // Also considers some legacy browsers.
        }

        function isCtrlKeyPressed(evt) {
            return evt.ctrlKey === true || !!(evt.modifiers & 2); // Also considers some legacy browsers.
        }

        function isCapsLock(evt) {
            var charCode = (typeof evt.which == "undefined") ? evt.keyCode : evt.which,
                s = String.fromCharCode(charCode);

            if (s.toUpperCase() === s && s.toLowerCase() !== s && !isShiftKeyPressed(evt)) {
                return true;
            }

            return false;
        }

        function minimize() {
            container.find('.' + keyboardLayout.cssprefix + '-keys').toggle();
        }

        function dispose() {
            container.find(format('.{0}-button, .{0}-minimize, .{0}-close', keyboardLayout.cssprefix)).undelegate('click');

            $('textarea, input[type=text]').die('keypress.keyboard').die('focus.keyboard').die('keydown.keyboard');

            container.unbind('mousedown').remove();

            $(document).unbind('mouseup.keyboard').unbind('mousemove.keyboard').unbind('keyup.keyboard').unbind('keydown.keyboard');
			
			keyboardVisible = false;
        }
		
		function format(formatted) {
			for (var i = 1; i < arguments.length; i++) {
				var regexp = new RegExp('\\{' + (i - 1) + '\\}', 'gi');
				formatted = formatted.replace(regexp, arguments[i]);
			}
			return formatted;
		}

        // Initialization
		if ( ! window.keyboard.hideOnStartup ) {
			initializeKeyboard();
		}
		
		return {
			'setLayout': function (layout) {
				container.removeClass(format('{0}-{1}', keyboardLayout.cssprefix, keyboardLayout.lang));

				keyboardLayout = $.extend({}, defaults, layout);

				container.removeClass(format('{0}-rtl {0}-ltr', keyboardLayout.cssprefix))
							.addClass(format('{0}-{1}', keyboardLayout.cssprefix, keyboardLayout.lang))
							.addClass(format('{0}-{1}', keyboardLayout.cssprefix, ((keyboardLayout.direction == window.keyboard.directions.ltr) ? 'ltr' : 'rtl')));
				container.css('width', keyboardLayout.width);

				renderKeyboard();
			},
			'setPos': function(x, y) {
				container.css({
					'left': x,
					'top': y
				});
			},
			'init': initializeKeyboard,
			'dispose': dispose
		};
    }($, window, document, window.keyboard.defaultlayout)); // keyboard.
	
})(window, document, window.keyboard.$ || jQuery);