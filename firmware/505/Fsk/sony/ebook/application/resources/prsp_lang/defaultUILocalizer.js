// Description: Default UI localizer (needed only by non English locales)
// Author: kartu
//
// History:
//	2010-04-25 kartu - Refactored from core-lang
//	2010-05-02 kartu - Added second "unlock screen" localization (shown after sleep/usb connection)
//				Added support for field sizes
//				Localized "ok" texts
//	2010-05-09 kartu - Fixed "All bookmarks" "+ 1" bug
//	2010-05-15 kartu - Fixed "set date" bug ("mAX" typo)
//	2010-05-15 kartu - Moved getDateAndClock function to core lang (since English locale might also need it)
//	2010-05-18 kravitz - Replaced "PAGE" with "FUNC_PAGE_X"
//	2010-05-20 kartu - Removed script reference from about string
//	2010-06-26 kartu - Removed dependency on menu customizer

var tmp = function() {
	//--------------------------------------------------------------------------------------
	// utility functions
	//--------------------------------------------------------------------------------------
	var L, LF, setStr, getPageChangedFunc, settingsComment, localizeDefaultUI, standardNodes, log,
		toDoubleDigit, FUNC_GET_DATE, FUNC_GET_TIME, FUNC_GET_DATE_TIME;
	log = Core.log.getLogger("defaultUILocalizer");

	// Create list of nodes for simpler referencing 
	standardNodes = {};
	createListOfStandardNodes = function () {
		var key, path, node, j, m, standardMenuLayout;
		standardMenuLayout = Core.config.compat.standardMenuLayout;
		for (key in standardMenuLayout) {
			try {
				path = standardMenuLayout[key];
				if (path !== undefined) {
					node = kbook.root;
					for (j = 0, m = path.length; j < m; j++) {
						node = node.nodes[path[j]];
					}
					standardNodes[key] = node;
				}
			} catch (e) {
				log.error("Failed to find node: " + key + " " + e);
			}
		}
	};
	createListOfStandardNodes();

	// Utility function, no need to localize
	toDoubleDigit = function (num) {
	    if (num < 10) {
		return "0" + num;
	    }
	    return num;
	};
	
	FUNC_GET_DATE = function (date) {
	    var day, month, year;
	    day = toDoubleDigit(date.getDate());
	    month = toDoubleDigit(date.getMonth() + 1);
	    year = date.getFullYear();
	    return month + "/" + day + "/" + year;
	};
	
	FUNC_GET_TIME = function (date) {
	    var hour, minute;
	    hour = toDoubleDigit(date.getHours());
	    minute = toDoubleDigit(date.getMinutes());
	    return hour + ":" + minute;
	};
	
	FUNC_GET_DATE_TIME = function (date) {
	    return date.toLocaleDateString() + " " + FUNC_GET_TIME(date);
	};	
	
	//--------------------------------------------------------------------------------------
	// "Localizing" functions
	//--------------------------------------------------------------------------------------

	var localizeDate = function() {
		var sony = _strings.Sony;
		// Set date related stuff
		//
		// FIXME side effects!!!
		if (typeof sony.FUNC_GET_DATE === "function") {
			Date.prototype.toLocaleDateString = function() {
				return sony.FUNC_GET_DATE(this);
			};
		}
	};

	var localizeRoot = function() {
		try {
			var nodes = standardNodes;
			var getSoValue = Core.system.getSoValue;
			
			setStr(nodes["continue"], "CONTINUE");
			
			nodes["continue"]._mycomment = function (arg) {
				var bookNode = kbook.model.currentBook;
				return bookNode !== null ?  getSoValue(bookNode, "media.title") : L("NO_BOOK");
			};
			
			// Books by ?
			setStr(nodes.booksByTitle, "BOOKS_BY_TITLE");
			setStr(nodes.booksByAuthor, "BOOKS_BY_AUTHOR");
			setStr(nodes.booksByDate, "BOOKS_BY_DATE");
			nodes.booksByTitle._mycomment = nodes.booksByAuthor._mycomment = nodes.booksByDate._mycomment = function () {
				return LF("BOOKS", this.nodes.length - 10);
			};
	
			// Collections
			setStr(nodes.collections, "COLLECTIONS");
			nodes.collections._mycomment = function () {
				return LF("COLLECTIONS", this.length);
			};
			// Books inside collections
			kbook.root.children.collections.prototype._mycomment = function() {
				return LF("BOOKS", this.playlist.items.length);
			};
	
			// Bookmarks
			setStr(nodes.bookmarks, "ALL_BOOKMARKS");
			nodes.bookmarks._mycomment = function () {
				return LF("BOOKMARKS", this.nodes.length);
			};
	
			// Now Playing
			setStr(nodes.nowPlaying, "NOW_PLAYING");
			nodes.nowPlaying._mycomment = function () {
				return kbook.model.currentSong === null ? L("NO_SONG") : this.comment();
			};
	
			// Music
			setStr(nodes.music, "MUSIC");
			nodes.music._mycomment = function () {
				return LF("SONGS", this.length);
			};
	
			// Pictures
			setStr(nodes.pictures, "PICTURES");
			nodes.pictures._mycomment = function () {
				return LF("PICTURES", this.length);
			};
	
			// Settings
			setStr(nodes.settings, "SETTINGS");
			nodes.settings._mycomment = settingsComment;
				
		} catch (e) {
			log.error("localizing root", e);
		}
	};

	var localizeSettings = function() {
		try {
			// Settings - Orientation
			var settingsNode = standardNodes.settings;
			var settingsChildren = settingsNode.children;
			setStr(settingsChildren.orientation, "ORIENTATION");
			settingsChildren.orientation._mycomment = function () {
				return kbook.model.container.getVariable('ORIENTATION') ? L("HORIZONTAL") : L("VERTICAL");
			};
	
			// Settings - Set Date
			setStr(settingsChildren.setdate_clock, "SET_DATE");
			settingsChildren.setdate_clock._mycomment = function() {
				return FUNC_GET_DATE_TIME(new Date());
			};
			var setDateNodes = settingsNode.nodes[1].nodes;
			setDateNodes[0].name = L("YEAR"); //year
			setDateNodes[1].name = L("MONTH"); // month
			setDateNodes[2].name = L("DATE"); // day
			setDateNodes[3].name = L("HOUR"); // hour
			setDateNodes[4].name = L("MINUTE"); // minute
			setDateNodes[5].min = setDateNodes[5].max = L("SETDATE_OK");
			setDateNodes[5].kind = -parseFloat(L("SETDATE_OK_SIZE", 2));
	
			// Settings - Slideshow
			var slideshow = standardNodes.settings.nodes[2];
			setStr(slideshow, "SLIDESHOW");
			slideshow._mycomment = function() {
				return kbook.model.slideshowFlag ? L("SS_ON") :  L("SS_OFF");
			};
			var slideshowNodes = slideshow.nodes;
			slideshowNodes[0].name= L("SS_TURN");
			slideshowNodes[0].min = L("SS_OFF") ;
			slideshowNodes[0].max = L("SS_ON") ;
			slideshowNodes[0].kind = -parseFloat(L("SS_SIZE", 2));
			slideshowNodes[1].name= L("SS_DURATION");
			slideshowNodes[1].comment = L("SECONDS");
			slideshowNodes[2].min =  slideshowNodes[2].max = L("SS_OK");
			slideshowNodes[2].kind = -parseFloat(L("SS_OK_SIZE", 2));
			
			// Settings - Auto Standby
			var autoStandby = standardNodes.settings.nodes[3];
			setStr(autoStandby, "AUTOSTANDBY");
			autoStandby._mycomment = function() {
				return kbook.model.autoStandbyFlag ? L("AS_ON") : L("AS_OFF");
			};
			
			var autoStandbyNodes = autoStandby.nodes;
			autoStandbyNodes[0].name = L("AS_TURN");
			autoStandbyNodes[0].min = L("AS_OFF");
			autoStandbyNodes[0].max = L("AS_ON");
			autoStandbyNodes[0].kind = -parseFloat(L("AS_SIZE", 2));
			autoStandbyNodes[1].min = autoStandbyNodes[1].max = L("AS_OK");
			autoStandbyNodes[1].kind = -parseFloat(L("AS_OK_SIZE", 2));
	
			// Settings - About
			setStr(settingsChildren.about, "ABOUT");
			setStr(settingsChildren.resetToFactorySettings, "RESET_TO_FACTORY");
		} catch (e) {
			log.error("Error localizing settings", e);
		}
	};

	var localizeAdvancedSettings = function() {
		try {
			var nodes = standardNodes;

			// Settings - Advanced Settings
			setStr(nodes.advancedSettings, "ADVANCED_SETTINGS");
			nodes.advancedSettings._mycomment = settingsComment;
			var advancedSettingsChildren = nodes.advancedSettings.children;
			
			// Settings - Advanced Settings - Screen Lock
			var screenLockSettings = kbook.screenLock;
			var screenLockSettingsNodes = screenLockSettings.nodes;
			setStr(screenLockSettings, "SCREEN_LOCK");
			screenLockSettingsNodes[0].name = L("SL_TURN");
			screenLockSettingsNodes[0].min =  L("SL_OFF");
			screenLockSettingsNodes[0].max =  L("SL_ON");
			screenLockSettingsNodes[0].kind = -parseFloat(L("SL_SIZE", 2));
			screenLockSettingsNodes[1].name =  L("SL_CODE");
			screenLockSettingsNodes[2].min = screenLockSettingsNodes[2].max = L("SL_OK");
			screenLockSettingsNodes[2].kind = -parseFloat(L("SL_OK_SIZE", 2));

			// Shown to unlock settings
			var screenLock = standardNodes.advancedSettings.nodes[0];
			var screenLockNodes = screenLock.nodes;
			screenLock._mycomment = function () {
				return kbook.model.screenLockFlag ? L("SL_ON") : L("SL_OFF");
			};
			setStr(screenLock, "SCREEN_LOCK");
			screenLockNodes[0].name = L("SL_CODE");
			screenLockNodes[1].min = screenLockNodes[1].max = L("SL_OK_UNLOCK");
			screenLockNodes[1].kind = -parseFloat(L("SL_OK_UNLOCK_SIZE", 2));
			
			// Shown to unlock device after it was connected to USB / restart
			var unlockNodes = kbook.screenUnlock.nodes;
			unlockNodes[0].name = L("SL_CODE");
			unlockNodes[1].min = unlockNodes[1].max = L("SL_OK_UNLOCK");
			unlockNodes[1].kind = -parseFloat(L("SL_OK_UNLOCK_SIZE", 2));

			// Settings - Advanced Settings - Format Device
			setStr(advancedSettingsChildren.formatDevice, "FORMAT_DEVICE");
			
			// Settings - Advanced Settings - Shutdown
			setStr(advancedSettingsChildren.deviceShutdown, "DEVICE_SHUTDOWN");
		} catch (e) {
			log.error("in localizeAdvancedSettings: " + e);
		}
	};

	var localizeBook = function() {
		// Book
		var bookChildren = kbook.children;
		setStr(bookChildren["continue"], "CONTINUE");
		setStr(bookChildren.begin, "BEGIN");
		setStr(bookChildren.end, "END");
		var getSoValue = Core.system.getSoValue;
		bookChildren["continue"]._mycomment = bookChildren.begin._mycomment = bookChildren.end._mycomment = function () {
			if (this.bookmark) {
				return L("PAGE") + " " + (getSoValue(this.bookmark, "page") + 1);
			}
			return "";
		};

		setStr(bookChildren.bookmarks, "BOOKMARKS");
		bookChildren.bookmarks._mycomment = function () {
			return LF("BOOKMARKS", this.bookmarks.length);
		};

		setStr(bookChildren.contents, "CONTENTS");
		bookChildren.contents._mycomment = function () {
			return LF("ITEMS", this.bookmarks.length);
		};

		setStr(bookChildren.history, "HISTORY");
		bookChildren.history._mycomment = function () {
			return LF("PAGES", this.bookmarks.length);
		};

		setStr(bookChildren.info, "INFO");
		Core.system.setSoValue(getSoValue(kbook, "strings"), "infoTitles", L("INFO_TITLES"));

		setStr(kbook.children.utilities, "UTILITIES");
		kbook.children.utilities._mycomment = settingsComment;
	};

	var localizeBookUtils = function() {
		// Book.Utilities
		var bookUtilChildren = kbook.children.utilities.children;
		var getSoValue = Core.system.getSoValue;
		setStr(bookUtilChildren.removeAllBookmarks, "REMOVE_ALL_BOOKMARKS");
		bookUtilChildren.removeAllBookmarks._mycomment = function () {
			return LF("BOOKMARKS", getSoValue(this.parent.parent, "media.bookmarks.length"));
		};

		setStr(bookUtilChildren.clearHistory, "CLEAR_HISTORY");
		bookUtilChildren.clearHistory._mycomment = function () {
			return LF("PAGES", getSoValue(this.parent.parent, "media.history.length"));
		};

		setStr(bookUtilChildren.deleteBook, "DELETE_BOOK");
	};

	var localizeBookByDate = function() {
		try {
			// BooksByDate child children
			var children = standardNodes.booksByDate.children;
			setStr(children._1, "TODAY");
			setStr(children._2, "EARLIER_THIS_WEEK");
			setStr(children._3, "LAST_WEEK");
			setStr(children._4, "EARLIER_THIS_MONTH");
			setStr(children._5, "LAST_MONTH");
			setStr(children._6, "EARLIER_THIS_QUARTER");
			setStr(children._7, "LAST_QUARTER");
			setStr(children._8, "EARLIER_THIS_YEAR");
			setStr(children._9, "LAST_YEAR");
			setStr(children._0, "OLDER");
		} catch (e) {
			log.error("In localizeBookByDate: " + e);
		}
	};

	var localizeBookByTitleAndAuthor = function() {
		var setSoValue, childrenTitle, childrenAuthor, i, obj1, obj2, criterion, title;
		try {
		if (L("CUSTOM_SORT") === true) {
			setSoValue = Core.system.setSoValue;
			childrenTitle = standardNodes.booksByTitle.children;
			childrenAuthor = standardNodes.booksByAuthor.children;
			for (i = 0; i < 10; i++) {
				obj1 = childrenTitle["_" + i];
				obj2 = childrenAuthor["_" + i];
				criterion = L("CRITERION_" + i);
				title =  L("TITLE_" + i);
				setSoValue(obj1, "criterion", criterion);
				setSoValue(obj1, "name", title);
				setSoValue(obj1, "title", title);
				setSoValue(obj2, "criterion", criterion);
				setSoValue(obj2, "name", title);
				setSoValue(obj2, "title", title);
			}
		}
		} catch (e) {
			log.error("In localizeBookByTitleAndAuthor: " + e);
		}
	};

	var localizeComments = function() {
		var getSoValue = Core.system.getSoValue;
		var getFastSoValue = Core.system.getFastSoValue;

		// BooksBy* comment
		//
		var obj = getSoValue("FskCache.tree.bookItemNode");
		obj._mycomment = function() {
			var offsets, offset, index, c, result;
			index = getFastSoValue(this, "index");
			offsets = getSoValue(this, "parent.offsets");
			offset = offsets[index];
			c = offsets[index + 1] - offset;
			offset = offset - offset % 10;
			offset = offset / 10;
			offset++;
			result = LF("BOOKS", c);
			if (c > 0) {
				result = result + " - " + L("PAGE") + " " + offset;
			}
			return result;
		};

		// Global bookmarks node
		//
		obj = getSoValue("FskCache.tree.globalBookmarkItemNode");
		obj._mycomment = function() {
			var bookmark, comment, part;
			bookmark = getFastSoValue(this, "bookmark");
			comment = (new Date(getFastSoValue(bookmark, "date"))).toLocaleDateString();
			comment = comment + ' - ' + getSoValue(this, "book.name");
			part = getFastSoValue(bookmark, "part");
			if (part) {
				comment = comment + ' - ' + L("PART") + ' ' + part;
			}
			comment = comment + ' - ' + L("PAGE") + " " + (getFastSoValue(bookmark, "page") + 1) + ' ' + L("OF") + ' ' + getFastSoValue(bookmark, "pages");
			return comment;
		};

		// Bookmarks in book's "Bookmarks" and "History"
		//
		obj = getSoValue("FskCache.tree.bookmarkNode.prototype");
		obj._mycomment = function() {
			var part, page, pages, bookmark, result;
			bookmark = getFastSoValue(this, "bookmark");
			if (bookmark !== undefined) {
				part = getFastSoValue(bookmark, "part");
				page = getFastSoValue(bookmark, "page");
				page++;
				pages = getFastSoValue(bookmark, "pages");
				result = '';
				if (part) {
					result = result + L("PART") + ' ' + part + ' - ';
				}
				result = result + L("PAGE") + " " +  page;
				if (pages) {
					result = result + ' ' + L("OF") + ' ' + pages;
				}
				return result;
			}
			return '?';
		};

		// Bookmarks in book's "Contents"
		//
		obj = getSoValue("FskCache.tree.markReferenceNode.prototype");
		obj._mycomment = function() {
			var part, page, bookmark;
			bookmark = getSoValue(this, "bookmark");
			page = getFastSoValue(bookmark, "page") + 1;
			part = getFastSoValue(bookmark, "part");
			if (part) {
				return L("PART") + ' ' + part + ' - ' + L("PAGE") + " " + page;
			} else {
				return L("PAGE") + " " +  page;
			}
		};
	};

	var localizeStatic = function() {
		try {
			var obj;
			var container = kbook.model.container;
			// Invalid Format!
			container.sandbox.INVALID_FORMAT_GROUP.sandbox.LB_INVALID_FORMAT.setValue(L("INVALID_FORMAT"));
			// Formatting...
			container.sandbox.PROGRESS_GROUP.sandbox.LB_FORMATTING.setValue(L("FORMATTING"));
			container.sandbox.FORMAT_GROUP.sandbox.LB_FORMATTING.setValue(L("FORMATTING"));
			// Loading...
			container.sandbox.DISK_GROUP.sandbox.LB_LOADING.setValue(L("LOADING"));
			// Low Battery!
			container.sandbox.LOW_BATTERY_GROUP.sandbox.LB_LOW_BATTERY.setValue(L("LOW_BATTERY"));
			
			// Reset All
			obj = container.sandbox.HARD_RESET_GROUP;
			obj.sandbox.RESET_ALL.setValue(L("RESET_ALL"));
			// "Do you want to DELETE all content, restore all factory settings,
			// and clear the DRM authorization state?&#13;&#13;Yes - Press 5&#13;No - Press MENU"
			obj.sandbox.HARD_RESET.sandbox.HR_WARNING.setValue(L("HR_WARNING"));
			
			// Device Shutdown
			obj = container.sandbox.DEVICE_SHUTDOWN_GROUP;
			obj.sandbox.LB_TITLE.setValue(L("DEVICE_SHUTDOWN"));
			// Press MARK to shutdown
			obj.sandbox.DEVICE_SHUTDOWN.sandbox.LB_MESSAGE1.setValue(L("PRESS_MARK_TO_SHUTDOWN"));
			// this device.
			obj.sandbox.DEVICE_SHUTDOWN.sandbox.LB_MESSAGE2.setValue(L("THIS_DEVICE"));
			
			// Delete Book
			obj = container.sandbox.DELETE_BOOK_GROUP;
			obj.sandbox.LB_TITLE.setValue(L("DELETE_BOOK"));
			// Press MARK to
			obj.sandbox.DELETE_BOOK.sandbox.LB_MESSAGE1.setValue(L("PRESS_MARK_TO_DELETE"));
			// delete book.
			obj.sandbox.DELETE_BOOK.sandbox.LB_MESSAGE2.setValue(L("THIS_BOOK"));
			
			// Format Internal Memory
			obj = container.sandbox.FORMAT_DEVICE_GROUP;
			obj.sandbox.LB_TITLE.setValue(L("FORMAT_INTERNAL_MEMORY"));
			// Press MARK to format
			obj.sandbox.FORMAT_DEVICE.sandbox.LB_MESSAGE1.setValue(L("PRESS_MARK_TO_FORMAT"));
			// internal memory.
			obj.sandbox.FORMAT_DEVICE.sandbox.LB_MESSAGE2.setValue(L("MSG_INTERNAL_MEMORY"));
			
			// Restore Defaults
			obj = container.sandbox.SOFT_RESET_GROUP;
			obj.sandbox.LB_TITLE.setValue(L("RESTORE_DEFAULTS"));
			// Press MARK to restore
			obj.sandbox.SOFT_RESET.sandbox.LB_MESSAGE1.setValue(L("PRESS_MARK_TO_RESTORE"));
			// default settings.
			obj.sandbox.SOFT_RESET.sandbox.LB_MESSAGE2.setValue(L("DEFAULT_SETTINGS"));
			
			// Now Playing
			container.sandbox.SONG_GROUP.sandbox.LB_TITLE.setValue(L("NOW_PLAYING"));
			// Uppercase PAGE (goto)
			container.sandbox.GOTO_GROUP.sandbox.GROUP.sandbox.LB_MESSAGE.setValue(L("UPPER_PAGE"));
			
			// 1 of 1
			var oneOfOne = L("ONE_OF_ONE");
			container.sandbox.HARD_RESET_GROUP.sandbox.LB_STATUS.setValue(oneOfOne);
			container.sandbox.DEVICE_SHUTDOWN_GROUP.sandbox.LB_STATUS.setValue(oneOfOne);
			container.sandbox.DELETE_BOOK_GROUP.sandbox.LB_STATUS.setValue(oneOfOne);
			container.sandbox.FORMAT_DEVICE_GROUP.sandbox.LB_STATUS.setValue(oneOfOne);
			container.sandbox.SOFT_RESET_GROUP.sandbox.LB_STATUS.setValue(oneOfOne);
			container.sandbox.SETTING_GROUP.sandbox.LB_STATUS.setValue(oneOfOne);
			
			// Info page
			var oldPageChanged = container.sandbox.INFO_GROUP.sandbox.INFO.pageChanged;
			container.sandbox.INFO_GROUP.sandbox.INFO.pageChanged = getPageChangedFunc("INFO_INDEX_COUNT", oldPageChanged, L);
		} catch (e) {
			log.error("localizeStatic", e);
		}
	};

	var localizeKbook = function () {
		// SHUTDOWN_MSG related stuff
		// No battery!
		kbook.model.SHUTDOWN_MSG = L("NO_BATTERY");
		var oldDoFormatFlash = kbook.model.doFormatFlash;
		kbook.model.doFormatFlash = function () {
			oldDoFormatFlash.apply(this, arguments);
			this.setVariable('SHUTDOWN_MSG', L("FORMATTING_INTERNAL_MEMORY"));
		};
		var oldDoDeviceShutdown = kbook.model.doDeviceShutdown;
		kbook.model.doDeviceShutdown = function () {
			oldDoDeviceShutdown.apply(this, arguments);
			this.setVariable('SHUTDOWN_MSG', L("SHUTTING_DOWN"));
		};

		// Pictures
		var oldOnEnterPicture = kbook.model.onEnterPicture;
		kbook.model.onEnterPicture = getPageChangedFunc("PICTURE_INDEX_COUNT", oldOnEnterPicture, L);

		// Songs
		var oldPlaySong = kbook.model.playSong;
		kbook.model.playSong = getPageChangedFunc("SONG_INDEX_COUNT", oldPlaySong, L);
	};

	var localizeMisc = function () {
		// mime types
		var obj = Core.system.getSoValue("FskCache.tree.infoListNode.prototypes.mime");
		var func = function (value) {
			if (value === 'application/rtf') {
				return L("RICH_TEXT_FORMAT");
			}
			if (value === 'application/pdf') {
				return L("ADOBE_PDF");
			}
			if (value === 'application/epub+zip') {
				return L("EPUB_DOCUMENT");
			}
			if (value === 'application/x-sony-bbeb') {
				return L("BBEB_BOOK");
			}
			if (value === 'text/plain') {
				return L("PLAIN_TEXT");
			}
			return value;
		};
		Core.system.setSoValue(obj, "format", func);

		// internal memory / mem card
		obj = Core.system.getSoValue("FskCache.tree.infoListNode.prototypes.location");
		var oldFunc = Core.system.getFastSoValue(obj, "format");
		func = function () {
			var s = oldFunc.apply(this, arguments);
			switch (s) {
				case "Internal memory":
					return L("INTERNAL_MEMORY");
				case "Memory Stick":
					return L("MEMORY_STICK");
				case "SD Memory":
					return L("SD_CARD");
			}
			return s;
		};
		Core.system.setSoValue(obj, "format", func);
	};

	var localizeAbout = function () {
		var setSoValue, getFastSoValue, about, records, i, n, sandbox, key, text;
		setSoValue = Core.system.setSoValue;
		getFastSoValue = Core.system.getFastSoValue;
		about = kbook.model.container.sandbox.ABOUT_GROUP.sandbox.ABOUT;

		// Localize records
		records = Core.system.getSoValue(about, "data.records");
		for (i = 0, n = records.length; i < n; i++) {
			
			sandbox = getFastSoValue(records[i], "sandbox");
			if (i === 0) {
				// translate PRSP entry
				// kartu: not needed any more, done by core
				// key = "ABOUT_PRSP";
				// text = L(key);
				// text = text.replace("@@@firmware@@@", Core.version.firmware);
			} else {
				key = "ABOUT_" + i;
				text = L(key);
				setSoValue(sandbox, "text", text);
			}
			
		}

		var oldGetValue = about.getValue;
		var authorizedSony = L("AUTHORIZED_SONY");
		var notAuthorizedSony = L("NOT_AUTHORIZED_SONY");
		var authorizedAdobe = L("AUTHORIZED_ADOBE");
		var notAuthorizedAdobe = L("NOT_AUTHORIZED_ADOBE");
		var sonyVersion = L("SONY_FW_VERSION") + ":";
		var deviceID = L("DEVICE_ID") + ":";
		about.getValue = function (record, field) {
			var result = oldGetValue.apply(this, arguments);
			if (field === "text") {
				if (record.kind === 0) {
					result = result.replace("Authorized for the eBook Store.", authorizedSony);
					result = result.replace("Not authorized for the eBook Store.", notAuthorizedSony);
					result = result.replace("Version:", sonyVersion);
					result = result.replace("Device:", deviceID);
				} else if (record.kind === 1) {
					result = result.replace("This device is authorized for Adobe DRM protected content.", authorizedAdobe);
					result = result.replace("This device is not authorized for Adobe DRM protected content.", notAuthorizedAdobe);
				}
			}
			return result;
		};

		// Localize page index
		var oldPageChanged = about.pageChanged;
		about.pageChanged = getPageChangedFunc("ABOUT_INDEX_COUNT", oldPageChanged, L);

		// Localize title
		var aboutTitle = L("ABOUT");
		about.getTitle = function() {
			return aboutTitle;
		};

		// Recalculate box sizes
		about.dataChanged();
	};

	localizeDefaultUI = function () {
		var sony_str =_strings.Sony;
		var X = _strings.X;
		// Helper functions
		L = function (key, defValue) {
			if (sony_str.hasOwnProperty(key)) {
				return sony_str[key];
			} else {
				if (defValue !== undefined) {
					return defValue;
				} else {
					return key;
				}
			}
		};
		LF = function (key, param) {
			try {
				var strings = X[key]; 
				if (typeof  strings !== undefined) {
					return xFunc(strings, param);
				}
			} catch (e) {
				log.error("when calling " + key + " with param " + param + ": " + e);
			}
			return key;
		};
		
		setStr = function (node, strID) {
			node._myname = node.title = L(strID);
		};
		settingsComment = function () {
			return LF("SETTINGS", this.length);
		};
		getPageChangedFunc = function(varName, oldFunc, L) {
			var model = kbook.model;
			var of = L("OF");
			return function() {
				oldFunc.apply(this, arguments);
				var s = model.getVariable(varName);
				if (s) {
					model.setVariable(varName, s.replace("of", of));
				}
			};
		};

		localizeRoot();
		localizeSettings();
		localizeAdvancedSettings();
		localizeBook();
		localizeBookUtils();
		localizeBookByDate();
		localizeBookByTitleAndAuthor();
		localizeComments();
		localizeStatic();
		localizeKbook();
		localizeMisc();
		localizeAbout();
		localizeDate();
	};

	localizeDefaultUI();
};
tmp();
