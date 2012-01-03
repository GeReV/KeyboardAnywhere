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
						fail && fail();
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

			function checkVersion(version) {
				return ! (/^1\.([0-4])/.test(version));
			}
			
			if (window.jQuery && checkVersion(jQuery.fn.jquery)) {
				include_js('keyboard.js');
			} else {
				var shouldNoConflict = ( !! window.jQuery ); // Already have an older jQuery around.
				
				include_js('jquery.min.js', function () {
					if ( shouldNoConflict ) {
						window.keyboard.$ = jQuery.noConflict(); // Only use a local copy of jQuery, if an already existing version has been overridden, return it to normal.
					}
					include_js('keyboard.js');
				});
			}
			
			return {
				'load': function(hide) {
					window.keyboard.widget && window.keyboard.widget.init();
				}
			};
		}());
})(window);