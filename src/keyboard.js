/*!
 * Keyboard
 *
 * Copyright 2012-2014, Amir Grozki
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 */

window.keyboard = window.keyboard || {};

window.keyboard.directions = {
  ltr : 1,
  rtl : 2
};
window.keyboard.defaultlayout = {};

window.keyboard.layouts = {
  'hebrew' : {
    'lang' : 'he',
    'title' : '\u05de\u05e7\u05dc\u05d3\u05ea \u05e2\u05d1\u05e8\u05d9\u05ea',
    'direction' : window.keyboard.directions.rtl,
    'keys' : {
      '' : ';1234567890-=/\'\u05e7\u05e8\u05d0\u05d8\u05d5\u05df\u05dd\u05e4][\\\u05e9\u05d3\u05d2\u05db\u05e2\u05d9\u05d7\u05dc\u05da\u05e3,\u05d6\u05e1\u05d1\u05d4\u05e0\u05de\u05e6\u05ea\u05e5.',
      's' : '~!@#$%^&*()_+QWERTYUIOP}{|ASDFGHJKL:"ZXCVBNM><?',
      'c' : '`1234567890-=QWERTYUIOP[]\\ASDFGHJKL;\'ZXCVBNM,./',
      'sc' : '\u05b0\u05b1\u05b2\u05b3\u05b4\u05b5\u05b6\u05b7\u05b8\u05c2\u05c1\u05b9\u05bc/\'\u05e7\u05e8\u05d0\u05d8\u05d5\u05df\u05dd\u05e4][\u05bb\u05e9\u05d3\u05d2\u05db\u05e2\u05d9\u05d7\u05dc\u05da\u05e3,\u05d6\u05e1\u05d1\u05d4\u05e0\u05de\u05e6\u05ea\u05e5.'
    }
  },
  'english' : {}
};
window.keyboard.defaultlayout = window.keyboard.layouts.hebrew;

(function(window, document, Zepto) {

  window.keyboard = window.keyboard || {};
  window.keyboard.widget = window.keyboard.widget || ( function Keyboard($, window, document, layout) {

      /* Private members */
      var specialKeys = {
        'backspace' : 8,
        'shift' : 16,
        'capslock' : 20,
        'space' : 32
      },
      defaults = {
        'lang' : 'en',
        'title' : 'English Keyboard',
        'direction' : window.keyboard.directions.ltr,
        'width' : '',
        'cssprefix' : 'keyboard',
        'keys' : {
          '' : '`1234567890-=qwertyuiop[]\\asdfghjkl;\'zxcvbnm,./',
          's' : '~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:"ZXCVBNM<>?',
          'c' : '`1234567890-=QWERTYUIOP[]\\ASDFGHJKL;\'ZXCVBNM,./',
          'sc' : '~!@#$%^&*()_+qwertyuiop{}|asdfghjkl:"zxcvbnm<>?'
        },
        'specialKeys' : {
          'bksp' : {
            'cssclass' : 'bksp',
            'code' : specialKeys.backspace,
            'key' : 'bksp'
          },
          'caps' : {
            'cssclass' : 'caps',
            'code' : specialKeys.capslock,
            'key' : 'caps'
          },
          'lshift' : {
            'cssclass' : 'lshift',
            'key' : 'shift'
          },
          'rshift' : {
            'cssclass' : 'rshift',
            'key' : 'shift'
          },
          'space' : {
            'cssclass' : 'space',
            'code' : specialKeys.space,
            'key' : ' '
          }
        }
      }, 
      keyboardLayout = extend({}, defaults, layout), 
      container = $(format('<div class="{0} {0}-{1} {0}-{2}"></div>', keyboardLayout.cssprefix, ((keyboardLayout.direction == window.keyboard.directions.ltr) ? 'ltr' : 'rtl'), keyboardLayout.lang)), 
      keyMap = {}, 
      focusedTextbox = null,
      shiftKeys = null, 
      shiftMode = false, 
      capsLockMode = false, 
      mousePressed = false, 
      cssLoaded = false, 
      keyboardVisible = false, 
      mouseOffsetX = 0, 
      mouseOffsetY = 0, 
      specialKeyFunctions = {
        8 : backspace, // Backspace
        16 : null,
        20 : toggleCaps, // Caps lock
        32 : space
      };

      /* Private functions */
      function initializeKeyboard() {
        if (!keyboardVisible) {
          if (cssLoaded) {
            createKeyboard();
          } else {
            $(function() {
              createStylesheet('build/keyboard.css', function() {
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
        var rows = 5, keysContainer = container.find(format('div.{0}-keys', keyboardLayout.cssprefix)).empty(), state = getState();

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

        shiftKeys = container.find(format('.{0}-button-lshift, .{0}-button-rshift', keyboardLayout.cssprefix)).click(function() {
          toggleShift();
          return false;
        });

        if (capsLockMode) {
          keyMap.caps.addClass(keyboardLayout.cssprefix + '-button-active');
        }

        if (shiftMode) {
          shiftKeys.addClass(keyboardLayout.cssprefix + '-button-active');
        }
      }

      function renderKey(container, keys, from, to) {

        var button = null, key = null;
        for (var i = from; i <= to; i++) {
          key = keys.charAt(i);

          button = $(format('<a class="{0}-button" href="#">{1}</a>', keyboardLayout.cssprefix, key.toUpperCase()));
          
          button.data('key', key.charCodeAt(0));

          container.append(button);

          keyMap[key] = button;
        }
      }

      function renderSpecialKey(container, key) {
        var k = keyboardLayout.specialKeys[key],
        button = $(format('<a class="{0}-button {0}-button-{1}" href="#"><span>&nbsp;</span></a>', keyboardLayout.cssprefix, k.cssclass));
        
        button.data('key', k.code);
        button.data('cssclass', k.cssclass);

        container.append(button);

        keyMap[k.key] = button;
      }

      function setupEvents() {

        draggable();
        
        var textboxKeyDown = function(e) {
            var key = (e.key && e.key.charCodeAt(0)),
              keyCode = e.which || e.keyCode;
  
            if (keyCode in specialKeyFunctions) {
              return true;
            }
            
            if (isCtrlKeyPressed(e)) {
              // Special case for ctrl key. i.e: ctrl+a, ctrl+z. Let browser handle it.
              return true;
            }

            if (isCapsLock(e)) {
              caps();
            }
            
            // Convert at the end, in case capslock mode has changed.

            var result = keyPress(key, e.target);

            if (shiftMode === true && !isShiftKeyPressed(e)) {
              unshift();
            }

            return result;
          },
          textboxKeyUp = function(e) {
            var charCode = e.which || e.keyCode;

            if (charCode == specialKeys.capslock) {
              specialKeyFunctions[specialKeys.capslock]();
            }

            if (charCode == specialKeys.shift && !isShiftKeyPressed(e)) {
              // Keyup will fire once shift is unpressed, and mark it as unpressed.
              unshift();
            }
          };
        
        document.addEventListener('focus', function(e) {
          if (isTextbox(e.target)) {
            if (focusedTextbox) {
              focusedTextbox.removeEventListener('keyup', textboxKeyUp);
              focusedTextbox.removeEventListener('keydown', textboxKeyDown);
            } 
            
            focusedTextbox = e.target;
            
            focusedTextbox.addEventListener('keyup', textboxKeyUp, false);
            focusedTextbox.addEventListener('keydown', textboxKeyDown, false);
          }
        }, true);
        
        document.addEventListener('blur', function(e) {
          if (isTextbox(e.target)) {
            if (focusedTextbox) {
              focusedTextbox.removeEventListener('keyup', textboxKeyUp);
              focusedTextbox.removeEventListener('keydown', textboxKeyDown);
            }
            
            focusedTextbox = null;
          }
        }, true);
        
        document.addEventListener('keydown', createCaptureFunction('keydown'), true);
        document.addEventListener('keypress', createCaptureFunction('keypress'), true);

        container.on('click', '.' + keyboardLayout.cssprefix + '-button', function(evt) {

          var self = $(this), 
              key = self.data('key');

          if (!focusedTextbox) {
            return true;
          }

          if (handleSpecialKey(key, focusedTextbox)) {// Handle special keys, such as backspace.
            return false;
          }

          keyPress(key, focusedTextbox);

          if (shiftMode === true && key !== 'shift' && !isShiftKeyPressed(evt)) {
            unshift();
          }

          return false;
        });

        container.on('click', '.' + keyboardLayout.cssprefix + '-minimize', minimize);
        container.on('click', '.' + keyboardLayout.cssprefix + '-close', dispose);
      }
      
      function createCaptureFunction(type) {
        return function(e) {
          var convertedCharCode,
            key = (e.key && e.key.charCodeAt(0)),
            keyCode = e.which || e.keyCode,
            ne;
            
          if (keyCode in specialKeyFunctions) {
            if (specialKeyFunctions[keyCode]) {
              specialKeyFunctions[keyCode](this);
            } 
            return true;
          }
          
          if (isCtrlKeyPressed(e)) {
            // Special case for ctrl key. i.e: ctrl+a, ctrl+z. Let browser handle it.
            return true;
          }
          
          if (isShiftKeyPressed(e) && shiftMode === false) {
            shift();
          }
          
          convertedCharCode = convertKeyCode(key);
          
          if (key !== convertedCharCode && !e._kbanywhere) {
            e.preventDefault();
            e.stopPropagation();
            
            ne = new KeyboardEvent(type, {
              bubbles: true,
              cancelable: true,
              'key': String.fromCharCode(convertedCharCode),
              'char': String.fromCharCode(convertedCharCode),
              which: convertedCharCode,
              keyCode: convertedCharCode,
              //keyIdentifier: 'U+0043',
              target: e.target,
              eventPhase: 2,
              srcElement: e.srcElement
            });
            
            ne._kbanywhere = true;
            
            e.target.dispatchEvent(ne);
          }
        };
      }

      function mousemove(evt) {
        if (mousePressed) {
          // Move the element by the amount of change in the mouse position
          var changeX = evt.clientX - mouseOffsetX, changeY = evt.clientY - mouseOffsetY, offset = container.offset(), newX = offset.left + changeX, newY = offset.top + changeY;

          container.css({
            'left' : newX,
            'top' : newY
          });

          mouseOffsetX = evt.clientX;
          mouseOffsetY = evt.clientY;
        }
      }

      function draggable() {
        var returnFalse = function() {
          return false;
        };

        container.mousedown(function(evt) {
          if (evt.button === 0 || evt.button === 1) {
            mousePressed = true;
            mouseOffsetX = evt.clientX;
            mouseOffsetY = evt.clientY;

            evt.cancelBubble = true;
            if (evt.stopPropagation) {
              evt.stopPropagation();
            }

            $(document)
              //.css('MozUserSelect', 'none')
              .on('selectstart mousedown', returnFalse);

            return false;
          }
        });

        $(document).on({
          mouseup: function(evt) {
            if (evt.button === 0 || evt.button === 1) {
              mousePressed = false;
  
              $(document)
                //.css('MozUserSelect', '')
                .off('selectstart mousedown', returnFalse);
            }
          },
          mousemove: mousemove
        });
      }

      function handleSpecialKey(keyCode, element) {
        if (specialKeyFunctions.hasOwnProperty(keyCode)) {
          // We have a special case here (i.e: backspace), use specific function.
          specialKeyFunctions[keyCode].call(this, element);
          return true;
        }
      }

      function keyPress(keyCode, element) {

        var converted = String.fromCharCode(keyCode), button = keyMap[converted];

        if (!button) {
          return true;
          // We don't have this kind of button, let the browser perform whatever it needs to.
        }

        pressButton(button);

        // Modify textbox.
        var sel = getInputSelection(element), val = element.value;

        element.value = val.slice(0, sel.start) + converted + val.slice(sel.end);

        // Move the caret
        setInputSelection(element, sel.start + 1, sel.start + 1);

        return false;
        // Took care of event, let browser know it shouldn't perform anything.
      }

      function pressButton(button) {
        // Simulate button press.
        button.addClass(keyboardLayout.cssprefix + '-button-active');

        setTimeout(function() {
          button.removeClass(keyboardLayout.cssprefix + '-button-active');
        }, 100);
      }

      function convertKeyCode(charCode) {
        var state = getState(), 
            charStr = String.fromCharCode(charCode), 
            index = 0;

        switch (charCode) {
          case specialKeys.backspace:
            return 'bksp';
          case specialKeys.space:
            return specialKeys.space;
        }

        index = Math.max(defaults.keys.s.indexOf(charStr), defaults.keys[''].indexOf(charStr));
        // If charStr doesn't exist in one list, it will return -1, so the other will be picked as the index.

        if (charCode > 255) {
          // Provided character is outside of the ASCII chart, that is, not in english, try to find it in the translation.
          // We can also assume it's from a mouse click, so we can use the state instead of checking two sets.
          index = keyboardLayout.keys[state].indexOf(charStr);
        }

        return keyboardLayout.keys[state].charAt(index).charCodeAt(0);
      }

      function backspace(element) {
        pressButton(keyMap.bksp);
      }
      
      function space(element) {
        pressButton(keyMap[' ']);
      }

      function toggleCaps() {
        if (capsLockMode === true) {
          uncaps();
        } else {
          caps();
        }
      }

      function caps() {
        capsLockMode = true;
        // Mark shift as pressed.

        renderKeys(keyboardLayout.keys);
      }

      function uncaps() {
        capsLockMode = false;
        // Mark shift as pressed.

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
        shiftMode = true;
        // Mark shift as pressed.

        renderKeys(keyboardLayout.keys);
      }

      function unshift() {
        shiftMode = false;
        // Mark shift as unpressed.

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

      function minimize() {
        container.find('.' + keyboardLayout.cssprefix + '-keys').toggle();
      }

      function dispose() {
        container.off('mousedown click').remove();
        
        $('textarea, input[type=text]').off('.keyboard');

        $(document).off('.keyboard');

        keyboardVisible = false;
      }

      // Initialization
      if (!window.keyboard.hideOnStartup) {
        initializeKeyboard();
      }

      return {
        'setLayout' : function(layout) {
          container.removeClass(format('{0}-{1}', keyboardLayout.cssprefix, keyboardLayout.lang));

          keyboardLayout = extend({}, defaults, layout);

          container.removeClass(format('{0}-rtl {0}-ltr', keyboardLayout.cssprefix)).addClass(format('{0}-{1}', keyboardLayout.cssprefix, keyboardLayout.lang)).addClass(format('{0}-{1}', keyboardLayout.cssprefix, ((keyboardLayout.direction == window.keyboard.directions.ltr) ? 'ltr' : 'rtl')));
          container.css('width', keyboardLayout.width);

          renderKeyboard();
        },
        'setPos' : function(x, y) {
          container.css({
            'left' : x,
            'top' : y
          });
        },
        'init' : initializeKeyboard,
        'dispose' : dispose
      };
    }($, window, document, window.keyboard.defaultlayout));
  // keyboard.

})(window, document, window.keyboard.$ || Zepto); 