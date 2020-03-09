export function createStylesheet(href: string, callback) {
  // Create stylesheet link
  var head = document.getElementsByTagName('head')[0],
      link = document.createElement('link'),
      isGecko = ('MozAppearance' in document.documentElement.style ),
      isWebkit = ('webkitAppearance' in document.documentElement.style ),
      sTimeout = window.setTimeout,
      done;

  // Add attributes
  link.href = href;
  link.rel = 'stylesheet';
  link.type = 'text/css';

  // Poll for changes in webkit and gecko
  if (isWebkit || isGecko) {
    // A self executing function with a setTimeout poll to call itself
    // again until the css file is added successfully
    var poll = function(link) {
      sTimeout(function() {
        // Don't run again if we're already done
        if (!done) {
          try {
            // In supporting browsers, we can see the length of the cssRules of the file go up
            if (link.sheet.cssRules.length) {
              // Then turn off the poll
              done = 1;
              // And execute a function to execute callbacks when all dependencies are met
              callback();
            }
            // otherwise, wait another interval and try again
            else {
              poll(link);
            }
          } catch ( ex ) {
            // In the case that the browser does not support the cssRules array (cross domain)
            // just check the error message to see if it's a security error
            if ((ex.code == 1e3 ) || (ex.message == 'security' || ex.message == 'denied' )) {
              // if it's a security error, that means it loaded a cross domain file, so stop the timeout loop
              done = 1;
              // and execute a check to see if we can run the callback(s) immediately after this function ends
              sTimeout(function() {
                callback();
              }, 0);
            }
            // otherwise, continue to poll
            else {
              poll(link);
            }
          }
        }
      }, 0);
    };
    poll(link);

  }
  // Onload handler for IE and Opera
  else {
    // In browsers that allow the onload event on link tags, just use it
    link.onload = function() {
      if (!done) {
        // Set our flag to complete
        done = 1;
        // Check to see if we can call the callback
        sTimeout(function() {
          callback();
        }, 0);
      }
    };

    // if we shouldn't inject due to error or settings, just call this right away
    link.onload();
  }

  // 404 Fallback
  sTimeout(function() {
    if (!done) {
      done = 1;
      callback();
    }
  }, 3000);

  // Inject CSS
  // only inject if there are no errors, and we didn't set the no inject flag ( oldObj.e )
  head.appendChild(link);
}




export function getInputSelection(el) {
  return (

    /* mozilla / dom 3.0 */('selectionStart' in el &&
    function() {
      var l = el.selectionEnd - el.selectionStart;
      return {
        start : el.selectionStart,
        end : el.selectionEnd,
        length : l,
        text : el.value.substr(el.selectionStart, l)
      };
    }) ||

    /* exploder */
    (document.selection &&
    function() {

      el.focus();

      var r = document.selection.createRange();
      if (r === null) {
        return {
          start: 0,
          end: el.value.length,
          length: 0
        };
      }

      var re = el.createTextRange();
      var rc = re.duplicate();
      re.moveToBookmark(r.getBookmark());
      rc.setEndPoint('EndToStart', re);

      return {
        start : rc.text.length,
        end : rc.text.length + r.text.length,
        length : r.text.length,
        text : r.text
      };
    }) ||

    /* browser not supported */
    function() {
      return {
        start : 0,
        end : el.value.length,
        length : 0
      };
    }

  )();

}

export function offsetToRangeCharacterMove(el, offset) {
  return offset - (el.value.slice(0, offset).split("\r\n").length - 1);
}

export function setInputSelection(el: HTMLInputElement | HTMLTextAreaElement, startOffset: number, endOffset: number) {
  el.focus();
  if ( typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
    el.selectionStart = startOffset;
    el.selectionEnd = endOffset;
  } else {
    const range = el.createTextRange();
    const startCharMove = offsetToRangeCharacterMove(el, startOffset);
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

export function isTextbox(node) {
  return node.nodeName == 'TEXTAREA' || (node.nodeName == 'INPUT' && node.getAttribute('type') === 'text');
}

export function isShiftKeyPressed(evt: KeyboardEvent | MouseEvent): boolean {
  return evt.shiftKey;
}

export function isCtrlKeyPressed(evt) {
  return evt.ctrlKey === true || !!(evt.modifiers & 2);
  // Also considers some legacy browsers.
}

export function isCapsLock(evt) {
  var charCode = (typeof evt.which == "undefined") ? evt.keyCode : evt.which,
      s = String.fromCharCode(charCode);

  if (s.toUpperCase() === s && s.toLowerCase() !== s && !isShiftKeyPressed(evt)) {
    return true;
  }

  return false;
}

export function emptyElement(el: Element) {
  while (el.firstChild) {
    el.removeChild(el.lastChild);
  }
}

export function createElement(tag: string, className: string, textContent?: string): HTMLElement {
  const el = document.createElement(tag);

  el.classList.add(className);

  if (textContent) {
    el.textContent = textContent;
  }

  return el;
}
