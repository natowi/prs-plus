// Description: Localizaiton related code
// Author: kartu
//
// History:
//	2010-03-17 kartu - Initial version
//	2010-04-05 kartu - Finished localization
//	2010-04-10 kartu - Fixed collections localization (reported by kravitz)
//	2010-04-21 kartu - Localized. Fixed invisible "continue" comment bug.
//	2010-04-22 kartu - Added date customization
//	2010-04-24 kartu - Added Catalan, Georgian, German, Russian and Spanish locales
//	2010-04-24 kartu - Fixed SS_ON related bug (was set to min instead of max field)
//	2010-04-24 kartu - Changed language order
//	2010-04-25 kartu - Marked kbook.model.getDateAndClock as constructor
//	2010-04-25 kartu - Moved default UI localizer into separate file
//	2010-04-27 kravitz - Localizers are adapted for work with functions
//	2010-05-04 kravitz - Added French locale
//	2010-05-06 kartu - Added Czech locale
//	2010-05-10 kartu - Added Simplified Chineze locale
//	2010-05-11 kartu - Renamed Chinese to "Simplified Chinese"
//				Added "VALUE_DEFAULT_DATE" translation (CoreLang)
//	2010-05-15 kartu - Fixed date bug (when switching from any to English translation)
//				Fixed English locales date bug (wasn't possible to save date since kbook.model.getDateAndClock wasn't overriden
//	2010-05-18 kartu - Fixed dateSeparator's default value (spotted by VICTORSJG)
//	2010-06-27 kartu - Fixed error log message (was refering to core-hook2, instead of lang)
//	2010-09-02 kartu - Removed date related code
//			removed lang.init call (should be called from model specific compat module)
//	2010-11-10 kartu - Changed the way missing translations are handled:
//					1) if debug is enabled it will be loged
//					2) key is returned instead of prefix + key (didn't fit on the screen most of the time anyway)
//	2010-12-01 kartu - Switched back to returning prefix + key to give user some hint what's behind "TITLE"
//	2011-03-23 kartu - Refactoring: moving functions out of lang files, moving texts to a spreadsheet
//	2011-08-24 Shura1oplot - Fixed empty translation

tmp = function() {
	var _strings, _X; // whatever is loaded from lang/<language>.js file
	var isDebug, createLocalizer, x_func, initXFunc, getXFunc;

	createLocalizer = function(str, prefix) {
		var f;
		f = function(key) {
			if (str.hasOwnProperty(key)) {
				try {
					if (str[key] !== "")
						return str[key];
				} catch (ignore) {
				}
			}
			if (isDebug) {
				log.trace("Missing translation " + prefix + key);
			}
			return key;
		};
		return f;
	};

	initXFunc = function (lang) {
		x_func = getXFunc (lang);
	};
	
	// Initializes language specific "x of something" function
	getXFunc = function (lang) {
		var result;
		switch (lang) {
			case "cs": // Czech
				result = function (s, n) {
					if (n > 4) {
						return n + " " + s[0];
					}
					if (n >= 2 && n <= 4) {
						return n + " " + s[1];
					}
					if (n === 1) {
						return s[2];
					}
					return s[3];
				};
				break;
			case "ka": // Georgian
				result = function (s, n) {
					if (n > 0) {
						return n + " " + s[0];
					}
					return s[1];
				};
				break;
			case "ru": // fallthrough // Russian
			case "ua": // Ukrainian
				var _x_cache = [];
				var _x_cases = [2, 0, 1, 1, 1, 2];
				result = function (s, n) {
					if (!n) {
						return s[3];
					}
					if (!_x_cache[n]) {
						_x_cache[n] = (n % 100 > 4 && n % 100 < 20) ? 2 : _x_cases[Math.min(n % 10, 5)];
					}
					return n + " " + s[_x_cache[n]];
				};
				break;
			default:
				 result = function (s, n) {
					if (n > 1) {
						return n + " " + s[0];
					}
					if (n === 1) {
						return s[1];
					}
					return s[2];
				};
				break;
		}
		return result;
	};
	
	Core.lang = {
		/**
		* Should be called prior to getLocalizer calls
		* 
		* @param langFile - full path to the actual language js file (e.g. en.js)
		*/
		init: function (langFile) {
			try {
				isDebug = Core.log.isDebugEnabled();
				try {
					// translation strings
					_strings = Core.system.callScript(langFile, log);
					
					// translation strings, passed to functions
					_X = _strings.X;
					
					// Extract lang name
					var idx = langFile.lastIndexOf("/");
					var len = langFile.length;
					
					this.lang = langFile.substring(idx + 1, len -3);
					initXFunc(this.lang); // init language specific "x books" function
				} catch (e0) {
					log.error("Failed to load strings from file " + langFile, e0);
				}
				
				coreL = this.getLocalizer("Core"); // defined in core
				this.L = coreL;
			} catch (e) {
				log.error("in Core.lang.init: " + e);
			}
		},

		getStrings: function (category, strings) {
			try {
				if (strings === undefined) {
					strings = _strings;
				}

				if (strings !== undefined && strings[category] !== undefined) {
					return strings[category];
				} else {
					log.warn("Cannot find strings for category: " + category);
					return {};
				}
			} catch (e) {
				log.error("in getStrings: " + e);
			}
		},

		getLocalizer: function (category, strings) {
			return createLocalizer(this.getStrings(category, strings), category + ".");
		},
		
		LX: function (category, param) {
			try {
				return x_func(_X[category], param);
			} catch (e) {
				return "error: " + e;
			}
		},
		
		getXFunc: getXFunc
	};
};

try {
	tmp();
} catch (e) {
	log.error("initializing core-lang", e);
}
