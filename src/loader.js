(function (window) {
	window.keyboard = window.keyboard || {};
	window.keyboard.loader = window.keyboard.loader || (function () {	
			function include_js(file, succeed, fail) {
				var body = document.getElementsByTagName('body')[0];
				js = document.createElement('script');
				js.setAttribute('type', 'text/javascript');

				var safelistener = function () {
					try {
						succeed(file);
					} catch (e) {
						if (fail) {
						  fail();
						}
					}
				};

				if (succeed) {
					if (js.readyState && js.onload !== null) {
						js.onreadystatechange = function () {
							if (this.readyState.match(/complete|loaded/i)) {
								js.onreadystatechange = null;
								safelistener();
							}
						};
					} else {
						js.onload = safelistener;
					}
				}

				js.setAttribute('src', file);
				body.appendChild(js);

				return false;
			}
			
			if (window.Zepto) {
				include_js('src/keyboard.js');
			} else {
				var shouldNoConflict = ( !! window.Zepto ); // Already have another Zepto around.
				
				include_js('src/zepto.js', function () {
					if ( shouldNoConflict ) {
						window.keyboard.$ = Zepto.noConflict(); // Only use a local copy of Zepto, if an already existing version has been overridden, return it to normal.
					}
					include_js('src/keyboard.js');
				});
			}
			
			return {
				'load': function(hide) {
					if (window.keyboard.widget) {
					  window.keyboard.widget.init();
					}
				}
			};
		}());
})(window);