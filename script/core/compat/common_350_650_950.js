// Name: common x50
// Description: Code shared between 350/650/950 models
//
// Credits:
//	Keyboard popup chars code discovered and harnessed by Mark Nord
//
// Receives PARAMS argument with the following fields:: 
//		Core, bootLog, loadCore, loadAddons, getFileContent, compatPath, langNodeIndex, keyboardNodeIndex
//	optional parameters:
//		fixTimeZones 
//
// History:
//	2011-02-26 kartu - Initial version, merged from 350/950 code
//		Added Belorussian / Ukranian chars (as popups) to keyboard
//		Fixed #66 x50: Collection editing broken, if collection node is not in the 4th slot
//	2011-02-27 kartu - Refactored parameters into PARAMS object
//	2011-03-16 kartu - Added Georgian translation for 350/650 by rawerfas & kato
//	2011-03-19 kartu - Fixed keyboard: "aaaa" is shown instead of ascented (popup) letters
//	2011-04-01 kartu - Renamed language files to corresponding 2 letter ISO codes
//	2011-04-21 kartu - Added option to disable scanning without loading cache
//	2011-05-12 kartu - Fixed "Periodicals"
//	2011-06-18 kartu - A bit less ugly fix to "Periodicals"
//	2011-06-26 kartu - x50 Fixed #120 "No keyboard in SP-EN dictionary"
//	2011-09-14 kartu - x50: Added Catalan & Polish translation (except 950), Polish keyboard 
//	2011-09-22 kartu - Removed code overriding String.prototype.localeCompare, it did nothing but tamper collections sorting
//	2011-10-04 quisvir - Moved standby image code from bootstrap to common
//	2011-10-09 quisvir - Removed unnecessary code from standby image (thx Mark)
//	2011-11-13 kartu - ALL: Fixed bug that prevented SD/MS card scan mode from being changed on the fly
//			x50: Fixed bug that caused SD/MS card scan options to be ignored on the first boot
//	2011-11-14 kartu - Fixed "PARAS" typo, spotted by Ben
//	2011-11-14 kartu - Removed debug statement
//	2011-11-14 kartu - Fixed #207 Collection sorting is broken for cyrillic
//	2011-11-15 kartu - Yet another fix to SD/MS card scanning
//	2011-11-17 kartu - Removed debug statement
//	2011-11-21 quisvir - Moved Standby Image code to addon
//	2011-12-05 quisvir - Fixed node comments if node.comment is undefined
//	2011-12-05 quisvir - Added tapAndHoldAction to available actions
//	2011-12-11 kartu - Fixed #244 books deleted using PC do not dissapear if scanning is "disabled (load cache)"
//	2011-12-25 quisvir - Added code to load custom home menu xml's for booklist arrows
//	2012-01-17 quisvir - Changed homelargekind to homekind
//	2012-01-18 quisvir - Fixed periodicals homekind, continue comment
//	2012-01-30 quisvir - Fixed #222 Missing font size indicator
//	2012-02-16 quisvir - Fixed 'latest read' sorting being lost on reboot (Sony bug)
//	2012-07-19 kartu	- Added Greek locale 
//	2012-07-22 Mark Nord - "/" and "." extendes hold-key support (2 new keys left/right from spacebar for 350/650);
//	2012-11-18 Mark Nord -  Fix for EN-RU and RU-EN dictionary titles and keyboard
var tmp = function () {
	var localizeKeyboardPopups, updateSiblings, localize, localizeKeyboard, oldSetLocale, 
		oldChangeKeyboardType, oldReadPreference, oldCallback, makeRootNodesMovable, bootLog,
		doGetPeriodicalsKind;
	bootLog = PARAMS.bootLog;

	// Localize "popup" keyboard, that shows after holding button for a couple of secs
	localizeKeyboardPopups = function () {
		var keyboardLayout, oldIsSelectChar, oldSetPopupChar, SEL_CHARS;
		
		keyboardLayout = Fskin.kbookKeyboard.keyboardLayout;
		oldIsSelectChar =  keyboardLayout.isSelectChar;
		oldSetPopupChar = keyboardLayout.setPopupChar;
		
		SEL_CHARS = {
			"и": ["и", "і", "ї"], 
			"у": ["у", "ў"], 
			"е": ["е", "ё", "е", "є"], 
			"г": ["г", "ґ"], 
			"ъ": ["ъ", "'"],
			"И": ["И", "І", "Ї"], 
			"У": ["У", "Ў"], 
			"Е": ["Е", "Ё", "Е", "Є"], 
			"Г": ["Г", "Ґ"], 
			"Ъ": ["Ъ", "'"],
			"/": ["\\", "+", "-", "<", ">", '"', "(", ")" ],
			".": [":", ",", ";", "!", "?", "[", "]", "_"]		
		};
		
		keyboardLayout.isSelectChar = function (key) {
			try {
				if (SEL_CHARS[key] !== undefined) {
					return true;
				}
				return oldIsSelectChar.apply(this, arguments);
			} catch (e) {
				return false;
			}
		};
		
		keyboardLayout.setPopupChar = function (text, popup) {
			var chars, i, n;
			chars = SEL_CHARS[text];
			if (chars !== undefined) {
				n = chars.length;
				for (i = 0; i < 8; i++) {
					popup["addkey" + i].setText(i < n ? chars[i] : "");
				}
				return n;
			}
			return oldSetPopupChar.apply(this, arguments);
		};
	};

	localizeKeyboardPopups();

	// Updates node siblings (used for setting selected / unselected icon)
	updateSiblings = function (fieldName) {
		// find currently selected node
		var nodes, i, n, idx, tmpKind;

		try {		
			nodes = this.parent.nodes;
			for (i = 0, n = nodes.length; i < n; i++) {
				if (kbook.model[fieldName] === nodes[i].tag) {
					idx = i;
					break;
				}
			}
			
			kbook.model[fieldName] = this.tag;
			kbook.model.writeFilePreference();
			
			// swap node kinds of this node and previously selected node
			if (idx !== undefined) {
				tmpKind = this.kind;
				this.kind = nodes[idx].kind;
				nodes[idx].kind = tmpKind;
			}
			
		} catch (e) {
			bootLog("In updateSiblings " + e);
		}
	};
	
	localize = function (Core) {
		try {
			var i, n, currentLang, settingsNode, langNode, languages, langNames, enter, 
				node, langFile, icon;
			currentLang = kbook.model.language;
			settingsNode = kbook.root.getSettingsRootNode();
			// Fix settings node 
			settingsNode.multiPage = true;
			
			languages = ["ca", "de", "el",  "en", "es", "fr", "it", "nl", "pl", "pt", "ru"];
			langNames = {
				ca: "Català",
				de: "Deutsch",
				el: "ελληνικά",
				en: "English",
				es: "Español",
				fr: "Français", 
				it: "Italiano",
				ka: "ქართული",
				nl: "Nederlands",
				pl: "Polski",
				pt: "Português",
				ru: "Русский"
			};
			
			// Load core js		
			PARAMS.loadCore();
			
			// Load PRS+ strings
			langFile = Core.config.corePath + "lang/" + currentLang + ".js";
			Core.lang.init(langFile);

			// FIXME localize date strings
			for (i = 0, n = languages.length; i < n; i++) {
				if (!Date.prototype.strings[languages[i]]) {
					Date.prototype.strings[languages[i]] = xs.newInstanceOf(Date.prototype.strings.en);
					Number.prototype.strings[languages[i]] = xs.newInstanceOf(Number.prototype.strings.en);
				}
			}
	
			// Custom language node
			langNode = Core.ui.createContainerNode({
				title: "fskin:/l/strings/STR_NODE_TITLE_LANG_SETTINGS".idToString(),
				icon: "LANGUAGE",
				comment: function () {
					return langNames[kbook.model.language];
				},
				parent: settingsNode
			});
			try {
				// Hook comment field
				kbook.commentField.format = function (item /* unused , name */) {
					if (item) {
						if (item._mycomment !== undefined) {
							if (typeof item._mycomment === "function") {
								try {
									return item._mycomment();
								} catch (e) {
									return "<error calling _mycomment>";
								}
							} else {
								return item._mycomment;
							}
						} else if (item.comment !== undefined) {
							return item.comment;
						} else {
							return "";
						}
					}
				};
			} catch (e) {
				bootLog("error hooking commendField.format function");
			}
			
			// Enter function for language children, changes locale and moves to parent
			enter = function () {
				try {
					// find currently selected node
					var nodes, i, n, idx, tmpKind;
					nodes = this.parent.nodes;
					for (i = 0, n = nodes.length; i < n; i++) {
						if (kbook.model.language === nodes[i].tag) {
							idx = i;
							break;
						}
					}
					
					// Code from kbook.xsb
					Fskin.localize.setLocale({language: this.tag, region: "XX"});
					kbook.model.language = this.tag;
					kbook.model.clearTitleSorters();
					kbook.root.update(kbook.model);
					kbook.model.writeFilePreference();
					this.parent.gotoParent(kbook.model);
					
					// swap node kinds of this node and previously selected node
					if (idx !== undefined) {
						tmpKind = this.kind;
						this.kind = nodes[idx].kind;
						nodes[idx].kind = tmpKind;
					}
					
					Core.ui.showMsg(Core.lang.L("MSG_RESTART"));					
				} catch (e) {
					bootLog("changing language", e);
				}
			};
			
			// Create language node's children
			for (i = 0, n = languages.length; i < n; i++) {
				if (kbook.model.language ===  languages[i]) {
					icon = "CHECKED";
				} else {
					icon = "UNCHECKED";
				}
				node = Core.ui.createContainerNode({
						title: langNames[languages[i]],
						icon: icon,
						parent: langNode,
						comment: ""
				});
				node.tag = languages[i];
				node.enter = enter;
				if (currentLang === languages[i]) {
					node.selected = true;
				}
				langNode.nodes.push(node);
			}
			
			// Replace "language" node with custom node
			settingsNode.nodes[0].nodes[PARAMS.langNodeIndex] = langNode;
			
			try {
				localizeKeyboard(Core);
			} catch (e0) {
				bootLog("Error localizing keyboard  " + e0);
			}
			
			try {
				if (typeof PARAMS.fixTimeZones === "function") {
					PARAMS.fixTimeZones(Core);
				}
			} catch (e1) {
				bootLog("Error fixing timezones " + e1);
			}

			// self destruct :)
			localize = null;
		} catch (e2) {
			bootLog("error in localize " + e2);
		}
	};

	// Init language related stuff once setLocale was called and strings were loaded
	oldSetLocale = Fskin.localize.setLocale;
	Fskin.localize.setLocale = function() {
		try {
			oldSetLocale.apply(this, arguments);
			// restore "old" set locale
			Fskin.localize.setLocale = oldSetLocale;
			
			localize(PARAMS.Core);
		} catch (e) {
			bootLog("in overriden setLocale " + e);
		}
	};
	
	// Keyboard related stuff
	localizeKeyboard = function (Core) {
		var i, n, node, advancedSettingsNode, keyboardNode, keyboardTypes, keyboardNames, enter, icon;
		keyboardTypes = [
				"English-US", 
				"English-UK", 
				"French-France", 
				"French-Canada",
				"German-Germany", 
				"Dutch-Netherlands",
				"Sapanish-Spain", 
				"Italian-Italy",
				"Polish",
				"Portuguese-Portugal",				
				"Georgian", 
				"Russian",
				"Russian-Phonetic"
		];
		keyboardNames = {
			"German-Germany": "Deutsch",
			"Sapanish-Spain": "Español", 
			"French-France": "Français",
			"French-Canada": "Français canadien",
			"Italian-Italy": "Italiano",
			"Georgian": "ქართული",
			"Dutch-Netherlands": "Nederlands",
			"Polish": "Polski",
			"Portuguese-Portugal": "Português",				
			"Russian": "Русская",
			"Russian-Phonetic": "Русская (яверты)",
			"English-UK": "United Kingdom",
			"English-US": "United States"
		};
		advancedSettingsNode = (kbook.root.getSettingsRootNode()).nodes[0];
	
		
		// Enter function for keyboard children, changes keyboard and moves to parent
		enter = function () {
			updateSiblings.call(this, "keyboard");
			this.parent.gotoParent(kbook.model);			
		};	
		
		// Custom keyboard node
		keyboardNode = Core.ui.createContainerNode({
			title: "fskin:/l/strings/STR_UI_NODE_TITLE_KEYBOARD".idToString(),
			icon: "KEYBOARD",
			comment: function() {
				return keyboardNames[kbook.model.keyboard];
			},
			parent: advancedSettingsNode
		});
		
		// Create language node's children
		for (i = 0, n = keyboardTypes.length; i < n; i++) {
			if (kbook.model.keyboard ===  keyboardTypes[i]) {
				icon = "CHECKED";
			} else {
				icon = "UNCHECKED";
			}
			node = Core.ui.createContainerNode({
					title: keyboardNames[keyboardTypes[i]],
					icon: icon,
					parent: keyboardNode
			});
			node.tag = keyboardTypes[i];
			node.enter = enter;
			keyboardNode.nodes.push(node);
		}	
		
		advancedSettingsNode.nodes[PARAMS.keyboardNodeIndex] = keyboardNode;
	
		// self destruct :)	
		localizeKeyboard = null;
	};


	oldChangeKeyboardType = Fskin.kbookKeyboard.keyboardLayout.changeKeyboardType;
	Fskin.kbookKeyboard.keyboardLayout.changeKeyboardType = function (langType) {
		var url, path, keyboardPaths, keyboardPath;
		try {
			keyboardPaths = {
				"English-US": "KeyboardLayout103P.xml",
				"English-UK": "KeyboardLayout166.xml",
				"French-France": "KeyboardLayout189.xml",
				"French-Canada": "KeyboardLayout445.xml",
				"German-Germany": "KeyboardLayout129.xml",
				"Dutch-Netherlands": "KeyboardLayout143.xml",
				// yeah, that's what's written in Sony's firmware, Sapanish
				"Sapanish-Spain": "KeyboardLayout173.xml", 
				"Italian-Italy": "KeyboardLayout142.xml",
				"Polish": "languages/KeyboardLayoutPolish.xml",
				"Portuguese-Portugal": "KeyboardLayout275.xml",
				"Russian": "languages/KeyboardLayoutRussian.xml",
				"Russian-Phonetic": "languages/KeyboardLayoutRussianPhonetic.xml",
				"Georgian": "languages/KeyboardLayoutGeorgian.xml"
			};
			
			keyboardPath = keyboardPaths[langType]; 
			if (keyboardPath !== undefined) {
				path = System.applyEnvironment('[keyboardLayoutPath]') ;
				url = 'file://' + path + keyboardPath;
				this.layoutData = null;
				this.setURI(url);
				return;
			}
		} catch (e) {
			bootLog("Error in changeKeyboardType [" + langType + "] " + e);
		}
		
		// call the default version, since custom way has failed
		oldChangeKeyboardType.apply(this, arguments);
	};


	// Init core here
	oldReadPreference = kbook.model.readPreference;
	kbook.model.readPreference = function() {
		try {
			oldReadPreference.apply(this, arguments);
			// restore "old" readPreference
			kbook.model.readPreference = oldReadPreference;
						
			makeRootNodesMovable();
			PARAMS.loadAddons();
			PARAMS.Core.init();
			fixRuDict();
		} catch (e) {
			bootLog("in overriden readPreference " + e);
		}
	};
	
	// Disable card scan
	var originalCanHandleVolume = FskCache.diskSupport.canHandleVolume;
	FskCache.diskSupport.canHandleVolume = function (volume) {
		var options, optionsCode, settingsFile;
		// If called for SD or MS volume
		if (volume.name === "sdmsa1" || volume.name === "sdmsb1" || volume.name === "SD Card" || volume.name === "Memory Stick") {
			try {
				if (PARAMS.Core && PARAMS.Core.config) {
					var scanMode = PARAMS.Core.config.cardScanMode; 
					if (scanMode === undefined) {
						// We are right after boot, addons haven't been loaded yet, need to load the value manually
						// load settings from BookHistory settings file
						settingsFile = Core.config.settingsPath + "BrowseFolders.config";
						if (FileSystem.getFileInfo(settingsFile)) {
							optionsCode = PARAMS.getFileContent(settingsFile);
							if (optionsCode !== "") {
								optionsCode = new Function("", optionsCode);
								options = optionsCode();
								scanMode = options.cardScan;
							}
						}
						
						if (scanMode === undefined) {
							scanMode = "enabled"; 
						}
	
						PARAMS.Core.config.cardScanMode = scanMode;
					}
					
					if (scanMode === "disabled") {
						return false;
					}
				}
			} catch (ee) {
				bootLog("canHandleVolume " + ee);
			}
		}
		return originalCanHandleVolume.apply(this, arguments);
	};	
	
	// Disabling scanning, but loading cache
	oldCallback = FskCache._diskSource.synchronizeCallback;
	FskCache._diskSource.synchronizeCallback = function() {
		var scanMode = PARAMS.Core.config.cardScanMode;
		try {
			if (scanMode === "disabledLoadCache" && this.target.name !== "mediaPath") {
				this.target.synchronizedSource();
				this.target.synchronizeDone();
				this.stack.pop();
			} else {
				oldCallback.apply(this, arguments);
			}
		} catch (e) {
			bootLog("Error in callback: " + e);
			oldCallback.apply(this, arguments);
		}
	};

	// Allow menu customization
	// Kinoma's code is hardcoded with references to periodicals / collections / all notes	
	makeRootNodesMovable = function() {
		var getComment, getKind, continueNode, periodicalsNode, collectionsNode, notesNode;

		// Save references to periodicals / collections / allNotes
		continueNode = kbook.root.getDeviceRootNode().getNode(0);
		periodicalsNode = kbook.root.getDeviceRootNode().getNode(2);
		collectionsNode = kbook.root.getDeviceRootNode().getNode(3);
		notesNode = kbook.root.getDeviceRootNode().getNode(4);
		
		// Helper functions
		getComment = function (node) {
			if (typeof node.shortComment === "function") {
				return node.shortComment();
			} else if (node === continueNode) {
				return "";
			}
			return kbook.commentField.format(node);
		};
		getKind = function (node, defVal) {
			if (node.hasOwnProperty('homekind')) {
				return node.homekind;
			}
			return defVal;
		};
		
		// Fix get<Node> functions
		kbook.root.getPeriodicalListNode = function () {
			return periodicalsNode;
		};
		kbook.root.getCollectionsNode = function () {
			return collectionsNode;
		};
		kbook.root.getAllNotesNode = function () {
			return notesNode;
		};
		
		// Fix goto<Node> functions
		kbook.model.doGoToPeriodicalList = function () {
			this.currentNode.gotoNode(kbook.root.getDeviceRootNode().getNode(2), this);
		};
		kbook.model.doGoToCollections = function () {
			this.currentNode.gotoNode(kbook.root.getDeviceRootNode().getNode(3), this);
		};
		kbook.model.doGoToAllNotes = function () {
			this.currentNode.gotoNode(kbook.root.getDeviceRootNode().getNode(4), this);
		};
		
		// Fix periodicals node
		kbook.model.getPeriodicalLatestItem = function (/* unused node */) {
			return periodicalsNode.latestItem;
		};

		// Detects periodicals "kind", returning 0 if there are no knew periodicals, or 1 if there are some
		// is used to select the right icon
		doGetPeriodicalsKind = function() {
			var dummy = {
				nodes: [undefined, undefined, periodicalsNode]
			};
			return  kbook.model.getPeriodicalKind(dummy);
		};

		// Fixing hardcoded periodicals / collections / notes
		kbook.model.updateDeviceRoot = function (node) {
			var n, dummy, continueTitle, continueAuthor, continueDate, middleItemKind, middleItemTitle, middleItemComment, leftItemKind, leftItemTitle, leftItemComment,
				periodicalKind, centerItemKind, centerItemTitle, centerItemComment, rightItemKind, rightItemTitle, rightItemComment, homeView;

			// If periodicals node was moved, we need to construct it manually, prior to setHomeCover
			if (node.nodes[2] !== periodicalsNode) {
				// TODO is this still needed?
				periodicalsNode.construct();
			}
			
			this.setHomeCover(node);
			kbook.menuHomeThumbnailBookData.setNode(kbook.root.getBookThumbnailsNode());
			continueTitle = this.getContinueComment(node);
			continueAuthor = this.getContinueAuthor(node);
			continueDate = this.getContinueDate(node);
			middleItemKind = this.getBooksKind(node);
			middleItemTitle = this.getBooksTitle(node);
			middleItemComment = this.getBooksComment(node);

			n = node.nodes[2];
			if (n === periodicalsNode) {
				// Fix for periodicals in home 
				dummy = {
					nodes: [undefined, undefined, periodicalsNode]
				};
				leftItemKind = doGetPeriodicalsKind();
				leftItemTitle = this.getPeriodicalTitle(dummy);
				leftItemComment = this.getPeriodicalComment(dummy);
			} else {
				leftItemKind = getKind(n, 0);
				leftItemComment = getComment(n);

				// Periodicals shown in unusual place
				// has no kind by default
				periodicalKind = doGetPeriodicalsKind();
				periodicalsNode.kind = 67 + periodicalKind;
				periodicalsNode.homekind = periodicalKind;
				periodicalsNode.separator = 0; // remove separator line

			}
			leftItemTitle = n.title;
			
			n = node.nodes[3];
			centerItemKind = getKind(n, 2);
			centerItemTitle = n.title;
			centerItemComment = getComment(n);
			
			n = node.nodes[4];
			rightItemKind = getKind(n, 3);
			rightItemTitle = n.title;
			rightItemComment = getComment(n);
			
			homeView = this.container.findContent('MENU_HOME');
			this.setParticularVariable(homeView, 'CONTINUE_TITLE', continueTitle);
			this.setParticularVariable(homeView, 'CONTINUE_AUTHOR', continueAuthor);
			this.setParticularVariable(homeView, 'CONTINUE_DATE', continueDate);
			this.setParticularVariable(homeView, 'MIDDLE_ITEM_KIND', middleItemKind);
			this.setParticularVariable(homeView, 'MIDDLE_ITEM_NAME', middleItemTitle);
			this.setParticularVariable(homeView, 'MIDDLE_ITEM_COMMENT', middleItemComment);
			this.setParticularVariable(homeView, 'MIDDLE_ITEM_NAME_COMMENT', middleItemTitle + '||' + middleItemComment);
			this.setParticularVariable(homeView, 'LEFT_ITEM_KIND', leftItemKind);
			this.setParticularVariable(homeView, 'LEFT_ITEM_NAME', leftItemTitle);
			this.setParticularVariable(homeView, 'LEFT_ITEM_COMMENT', leftItemComment);
			this.setParticularVariable(homeView, 'LEFT_ITEM_NAME_COMMENT', leftItemTitle + '||' + leftItemComment);
			this.setParticularVariable(homeView, 'CENTER_ITEM_KIND', centerItemKind);
			this.setParticularVariable(homeView, 'CENTER_ITEM_NAME', centerItemTitle);
			this.setParticularVariable(homeView, 'CENTER_ITEM_COMMENT', centerItemComment);
			this.setParticularVariable(homeView, 'CENTER_ITEM_NAME_COMMENT', centerItemTitle + '||' + centerItemComment);
			this.setParticularVariable(homeView, 'RIGHT_ITEM_KIND', rightItemKind);
			this.setParticularVariable(homeView, 'RIGHT_ITEM_NAME', rightItemTitle);
			this.setParticularVariable(homeView, 'RIGHT_ITEM_COMMENT', rightItemComment);
			this.setParticularVariable(homeView, 'RIGHT_ITEM_NAME_COMMENT', rightItemTitle + '||' + rightItemComment);
		};
	};
	
	
	// Add Cyrilic support
	var patchStringCompare = function () {
		var origToUpperCase, origToLowerCase, origLocaleCompare, isCyr;
		origLocaleCompare = String.prototype.localeCompare;
		origToUpperCase = String.prototype.toUpperCase;
		origToLowerCase = String.prototype.toLowerCase;

		isCyr = function (code) {
			return code >= 1040 && code <= 1103;
		};
		
		// Ignoring the case of mixed latin/cyr strings
		String.prototype.localeCompare = function (a) {
			var i, n, code, codeA, cyr, cyrA, ch, chA;
			if (a === null) {
				return (1);
			}

			if (this.length > 0 && a.length > 0) {
				code = this.charCodeAt(0);
				codeA = a.charCodeAt(0);
				cyr = isCyr(code);
				cyrA = isCyr(codeA);

				// Neither is cyrillic
				if (!cyr && !cyrA) {
					return origLocaleCompare.call(this, a);
				}

				// Both are cyrillic
				if (cyr && cyrA) {
					for (i = 0, n = Math.min (this.length, a.length); i < n; i++) {
						ch = this.charAt(i).toLowerCase();
						chA = a.charAt(i).toLowerCase();
						code = this.charCodeAt(i);
						codeA = a.charCodeAt(i);
						
						
						if (ch === chA) {
							// Same char, but different case
							if (code !== codeA) {
								return code > codeA ? -1 : 1;
							}
						} else {
							return ch.charCodeAt(0) > chA.charCodeAt(0) ? 1 : -1;
						}
					}
				} else {
					// one is cyrillic, one not
					return code > codeA ? 1 : -1; 
				}
			}
			
			if (a.length === this.length) {
				return 0;
			}
			
			return this.length  > a.length ? 1 : -1;
		};
		
		String.prototype.toUpperCase = function () {
			var i, n, code, ch, upCh, result;
			result = "";
			for (i = 0, n = this.length; i < n; i++) {
				code = this.charCodeAt(i);
				ch = this.charAt(i);
				if (!isCyr(code)) {
					upCh = origToUpperCase.call(ch);
				} else {
					if (code === 1105) {
						upCh = "Ё";
					} else if (code > 1071) {
						upCh = String.fromCharCode(code - 32);
					} else {
						upCh = ch;
					}
				}
				result += upCh;
			}
			return result;
		};

		String.prototype.toLowerCase = function () {
			var i, n, code, ch, loCh, result;
			result = "";
			for (i = 0, n = this.length; i < n; i++) {
				code = this.charCodeAt(i);
				ch = this.charAt(i);
				if (!isCyr(code)) {
					loCh = origToLowerCase.call(ch);
				} else {
					if (code === 1025) {
						loCh = "ё";
					} else if (code < 1072) {
						loCh = String.fromCharCode(code + 32);
					} else {
						loCh = ch;
					}
				}
				result += loCh;
			}
			return result;
		};
	};

	patchStringCompare();
	
	// Add tapAndHoldAction to available actions
	var oldGestureBaseInit = BookUtil.gestureBase.initialize;
	BookUtil.gestureBase.initialize = function (root, container) {
		this.actions.push(BookUtil.tapAndHoldAction);
		oldGestureBaseInit.apply(this, arguments);
	};
	
	// Load custom xml's to show home menu booklist arrows if option in Book Management is set
	var oldGetRelationalURI = kbook.root.children.deviceRoot.getRelationalURI;
	kbook.root.children.deviceRoot.getRelationalURI = function (orientation) {
		var homeMenuArrows, settingsFile, optionsCode, options;
		homeMenuArrows = PARAMS.Core.config.homeMenuArrows;
		if (homeMenuArrows === undefined) {
			settingsFile = PARAMS.Core.config.settingsPath + "BookManagement_x50.config";
			if (FileSystem.getFileInfo(settingsFile)) {
				optionsCode = PARAMS.getFileContent(settingsFile);
				if (optionsCode !== "") {
					optionsCode = new Function("", optionsCode);
					options = optionsCode();
					homeMenuArrows = options.homeMenuArrows;
					PARAMS.Core.config.homeMenuArrows = homeMenuArrows;
				}
			}
		}
		if (homeMenuArrows === 'true') {
			if (orientation) {
				return 'deviceHomeLandscapeCustom.xml';
			}
			else {
				return 'deviceHomePortraitCustom.xml';
			}
		} else {
			return oldGetRelationalURI.apply(this, arguments);
		}
	};
	
	// Fix for missing font size indicator after changing dict
	var oldCloseDictionary = pageDictionaryOverlayModel.closeDictionary;
	pageDictionaryOverlayModel.closeDictionary = function () {
		oldCloseDictionary.apply(this, arguments);
		if (kbook.model.STATE === 'PAGE') { kbook.model.container.sandbox.STATUS_GROUP.sandbox.STATUS_GROUP_SUB.sandbox.STATUS_GROUP.sandbox.showBookSizeIndicator(true); }
	};
	
	FskCache.text.indexLastestRead = function (id, index) {
		var date = (this.currentPosition) ? this.currentPosition.date : 0;
		index.handle(date, id);
	};

	// Fix Russian Dictionary - if any
	var fixRuDict = function () {
		var dictionaries = kbook.model.dictionaries,
			LD = Core.lang.getLocalizer('Dictionary'),
			i = 0,
			dict;
		while (i < dictionaries.length) {
			dict = dictionaries[i];
			switch (dict.contentsID) {
			case 'CDUS125D0000E': // RU-EN
				dict.title = LD(dict.contentsID);
				dict.keyboard = 'Russian';
				break;
			case 'CDUS125D0000D': // EN-RU
				dict.title = LD(dict.contentsID);
				dict.keyboard = 'English-UK';
				break;
			}
			i++;
		}
	};
	
};

try {
	tmp();
} catch (e) {
	PARAMS.bootLog("Error in common X50: " + e);
}
