var log = Core.log.getLogger("initLang505");

var initLang505 = function() {
	var _strings; // whatever is loaded from lang/<language>.js file
	var langL, getLangAddon;
	
	// Fix for for kbook.model.getDateAndClock
	var getDateAndClockFix = function () {
		this.getDateTimeStr();
		var date = new Date();
		this.dateYY = date.getFullYear();
		this.dateMM = date.getMonth() + 1;
		this.dateDD = date.getDate();
		this.clockH = date.getHours();
		this.clockM = date.getMinutes();
		this.clockS = 0;
	};
	
	var getDateFunc = function(format, separator) {
		var toDoubleDigit = function (num) {
					if (num < 10) {
						return "0" + num;
					} else {
						return num;
					}
		};
		// "ddMMYY", "MMddYY", "YYMMdd", "ddMMMYY", "ddMONTHYY", "ddMMYYYY", "MMddYYYY", "YYYYMMdd", "ddMMMYYYY", "ddMONTHYYYY"
		return function() {
			try {
				var date = this;
				var day, month, nMonth, year, shortYear;
				day = toDoubleDigit(date.getDate());
				nMonth = date.getMonth() + 1;
				month = toDoubleDigit(nMonth);
				year = date.getFullYear();
				shortYear = toDoubleDigit(year - Math.floor(year/100) * 100);
				switch (format) {
					case "ddMMYY":
						return day + separator + month + separator + shortYear;
					case "MMddYY":
						return month + separator + day + separator + shortYear;
					case "YYMMdd":
						return shortYear + separator + month + separator + day;
					case "ddMMMYY":
						return day + separator + langL("MONTH_SHORT_" + nMonth) + separator + shortYear;
					case "ddMONTHYY":
						return day + separator + langL("MONTH_" + nMonth) + separator + shortYear;
					case "ddMMYYYY":
						return day + separator + month + separator + year;
					case "MMddYYYY":
						return month + separator + day + separator + year;
					case "YYYYMMdd":
						return year + separator + month + separator + day;
					case "ddMMMYYYY":
						return day + separator + langL("MONTH_SHORT_" + nMonth) + separator + year;
					case "ddMONTHYYYY":
						return day + separator + langL("MONTH_" + nMonth) + separator + year;
					default:
						return day + separator + month + separator + shortYear;
				}
			} catch (e) {
				return e;
			}
		};
	};
	
	
	var lang505 = {
		// "fake" options, used only for loading stuff saved by other addon
		name: "Localization",
		optionDefs: [
			{
				name: "lang",
				defaultValue: "en"
			},
			{
				name: "dateFormat",
				defaultValue: "default"
			},
			{
				name: "dateSeparator",
				defaultValue: "/"
			}
		],
		
		init: function () {
			try {
				Core.settings.loadOptions(this);
				
				// Check if language file actually exists, if not, fallback to en
				var langPath = Core.config.corePath + "lang/" + this.options.lang + ".js";
				if (!FileSystem.getFileInfo(langPath)) {
						this.options.lang = "en";
				}

				// Init standard lang
				Core.lang.init(langPath);
				try {
					_strings = Core.system.callScript(langPath505 + this.options.lang + ".js", log);
					langL = Core.lang.getLocalizer("CoreLang", _strings);
				} catch (e0) {
					log.error("Failed to load strings", e0);
				}

				Core.addAddon(getLangAddon(langL));
				loadAddons();
				
				// If locale is English, there is nothing to localize
				var isDateCustom = false;
				if ("en" !== this.options.lang) {
					isDateCustom = true;
					try {
						// Save default toLocaleDateString (needed when switching from non-English to English locale
						if (Date.prototype.defaultToLocaleDateString === undefined)  {
							Date.prototype.defaultToLocaleDateString = Date.prototype.toLocaleDateString;
						}
						
						// localize default ui
						var code = Core.io.getFileContent(langPath505 + "defaultUILocalizer.js");
						var xFunc = Core.lang.getXFunc(this.options.lang);
						var localizeDefaultUI = new Function("_strings,xFunc,Core", code);
						localizeDefaultUI(_strings, xFunc, Core);
						delete localizeDefaultUI;
					} catch (e1) {
						log.error("Failed to localize default UI", e1);
					}
				} else {
					// Restore date format
					if (Date.prototype.defaultToLocaleDateString !== undefined)  {
						Date.prototype.toLocaleDateString = Date.prototype.defaultToLocaleDateString;
					}					
				}
				
				// Date
				if ("default" !== this.options.dateFormat) {
					isDateCustom = true;
					var separator = "/";
					switch (this.options.dateSeparator) {
						case "minus":
							separator = "-";
							break;
						case "dot":
							separator = ".";
							break;
						case "space":
							separator = " ";
							break;
						case "none":
							separator = "";
							break;
					}
					Date.prototype.toLocaleDateString = getDateFunc(this.options.dateFormat, separator);
				}
				
				// If locale isn't English or dateFormat isn't default, we need to fix this
				// since original version of the function made assumptions about date/time format 
				if (isDateCustom) {
					kbook.model.getDateAndClock = getDateAndClockFix;
				}
				
				Core.init();
			} catch (e) {
				log.error("in lang505.init: " + e);
			}
		},

		getStrings: function (category) {
			try {
				if (_strings !== undefined && _strings[category] !== undefined) {
					return _strings[category];
				} else {
					log.warn("Cannot find strings for category: " + category);
					return {};
				}
			} catch (e) {
				log.error("in getStrings: " + e);
			}
		},

		getLocalizer: function (category) {
			var createLocalizer = function(str, prefix) {
				var f = function(key, param) {
					if (str.hasOwnProperty(key)) {
						try {
							if (typeof str[key] === "function") {
								return str[key](param);
							}
							return str[key];
						} catch (e) {
						}
					}
					return prefix + key;
				};
				return f;
			};
			return createLocalizer(this.getStrings(category), category + ".");
		}
	};

	// Language options
	getLangAddon = function (langL) {
		return {
			name: "Localization",
			title:  langL("TITLE"),
			icon: "LANGUAGE",
			comment: langL("COMMENT"),
					
			onSettingsChanged: function (propertyName, oldValue, newValue) {
				if (oldValue === newValue) {
					return;
				}
				Core.ui.showMsg(Core.lang.L("MSG_RESTART"));
			},
			
			optionDefs: [
				{
					name: "lang",
					title: langL("OPTION_LANG"),
					icon: "LIST",
					defaultValue: "en",
					values: ["ca", "cs", "de", "en", "es", "fr", "ka", "ru", "zh"],
					valueTitles: {
						"ca": "Català",
						"cs": "Český",
						"de": "Deutsch",
						"en": "English",
						"es": "Español",
						"fr": "Français",
						"ka": "ქართული",
						"ru": "Русский",
						"zh": "简体中文"
					}
				},
				{
					name: "dateFormat",
					title: langL("OPTION_DATE_FORMAT"),
					icon: "DATE",
					defaultValue: "default",
					values: ["default", "ddMMYY", "MMddYY", "YYMMdd", "ddMMMYY", "ddMONTHYY", "ddMMYYYY", "MMddYYYY", "YYYYMMdd", "ddMMMYYYY", "ddMONTHYYYY"],
					valueTitles: {
						"default": langL("VALUE_DEFAULT_DATE"),
						ddMMYY: "31/01/99",
						MMddYY: "01/31/99",
						YYMMdd: "99/01/31",
						ddMMMYY: langL("ddMMMYY"),
						ddMONTHYY: langL("ddMONTHYY"),
						ddMMYYYY: "31/01/1999",
						MMddYYYY: "01/31/1999",
						YYYYMMdd: "1999/01/31",
						ddMMMYYYY: langL("ddMMMYYYY"),
						ddMONTHYYYY: langL("ddMONTHYYYY")
					}
				},
				{
					name: "dateSeparator",
					title: langL("OPTION_DATE_SEPARATOR"),
					icon: "DATE",
					defaultValue: "default",
					values: ["default", "minus", "dot", "space", "none"],
					valueTitles: {
						"default": "/",
						"minus": "-",
						"dot": ".",
						"space": langL("VALUE_SPACE"),
						"none": langL("VALUE_NONE")
					}
				}
			]
		};
	};
	
	// Initialize lang
	lang505.init();
};
initLang505();
initLang505 = undefined;