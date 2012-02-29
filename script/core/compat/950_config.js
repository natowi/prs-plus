// Name: 950 config
// Description: Sony PRS-950 model specific configuration
//
// History:
//	2011-01-12 kartu - Initial version, based on 600
//	2011-02-08 kartu - "More" is now by default attached to the root folder
//	2011-02-27 kartu - Periodicals node no longer "unmovable", replaced with "Browse Folders" by default
//	2011-02-28 kartu -  ALL: Added 
//		Calculator by Mark Nord
//		Chess by Ben Chenoweth / Stefano Gioffre
//		Five in a Row by Ben Chenoweth
//		Five Balls by Clemenseken
//		Free Cell by Ben Chenoweth
//		Mahjong by Clemenseken
//		Sudoku by Obelix
//	2011-06-29 Ben Chenoweth - ALL: Updated existing games/calculator to use AppAssets and added
//		Draughts by Ben Chenoweth
//		MineSweeper by Mark Nord / D. Shep Poor
//		XO-Cubed by Ben Chenoweth
//	2011-07-03 Mark Nord - Added NodeKinds.STANDBY
//	2011-08-03 Ben Chenoweth - ALL: Added
//		Calendar by Ben Chenoweth
//		Solitaire by Ben Chenoweth
//	2011-08-28 Ben Chenoweth - Moved games into Games node
//	2011-09-04 Mark Nord - NodeKinds.getIcon modified to accept "#icon-number" (not consistent across model-border but speeds up testing)
//	2011-09-14 kartu - games & utils "into games (unstable)", removed Minesweeper
//	2011-10-13 quisvir - Fixed #192 Games folder is on the wrong place
//	2011-10-14 Ben Chenoweth - Added home icons for Games node and Calendar
//	2011-10-19 Ben Chenoweth - Added ALT icons; reverted BOOK to 2 and PICTURE to 4; added missing CONTRAST icon
//	2011-10-22 Ben Chenoweth - Fix for assigning default HOME and LARGE icons to items that don't have them.
//	2011-11-13 kartu - changed rootNode to a function, since node is not available at the time config file is loaded
//	2011-11-20 quisvir - Added Author List
//  2011-11-23 Ben Chenoweth - Added TEXT_MEMO
//  2011-11-24 Ben Chenoweth - Added HANDWRITING_ALT
//	2011-11-28 quisvir - Added STYLUS
//	2011-12-13 quisvir - Added NOBOOKMARK
//	2011-12-17 quisvir - Added DICTIONARY
//	2011-12-28 Ben Chenoweth - Initial implementation of audio
//	2012-01-17 quisvir - Changed homelargekind to homekind, added standardMenuIcons for moved default nodes
//	2012-02-06 quisvir - Added HIGHLIGHT
//	2012-02-16 quisvir - Added CHECKMARK
//	2012-02-20 quisvir - Added Action Launcher (StandardActions node)

return {
	// Menu icon indices 
	NodeKinds: {
		EMPTY: 1000,
		ALL_BOOKS: 1,
		BOOK: 2, // 17
		FILE: 2,
		AUDIO: 3,
		PICTURE: 4,  // 18
		SETTINGS: 5,
		AUTHOR: 6,
		CONTINUE: 7,
		PREVIOUS_PAGE: 8,
		NEXT_PAGE: 9,
		BOOKMARK: 10,
		NOTES: 10,
		LIST: 11,
		BOOK_HISTORY: 1, // 11
		CLOCK: 12,
		PAUSE: 13,
		PLAY: 14,
		INFO: 15,
		LOCK: 16,
		BOOKS: 17,
		PICTURES: 18,
		CROSSED_BOX: 19,
		NOBOOKMARK: 21,
		DATE: 22,
		LANDSCAPE: 24,
		ABOUT: 25,
		BACK: 26,
		ABC: 27,
		DATETIME: 28,
		DB: 29,
		SHUTDOWN: 31,
		COLOR: 32,
		INTERACT_FICT: 34,
		HIGHLIGHT: 35,
		TEXT_SCALE: 124, // 39
		GESTURE: 38,
		SEARCH: 39,
		NODICTIONARY: 40,
		STYLUS: 41,
		COLLECTION: 42,
		TEXT_MEMO: 50,
		KEYBOARD: 51,
		DICTIONARY: 52,
		ROOT_MENU: 53,
		INTERNAL_MEM: 54,
		MS: 55,
		SD: 56,
		LANGUAGE: 57,
		NEW: 61,
		TIMEZONE: 62,
		PERIODICALS: 67,
		HOME: 26, // missing
		
		STANDBY: 79,
		
		UNCHECKED: 110,
		CHECKED: 111,
		
		FOLDER: 112,
		GAME: 113,
		CALC: 114,
		KEYBOARD_ALT: 116,
		CHESS: 117,
		CHECKMARK: 118,
		CARDS: 119,
		SUDOKU: 120,
		MAHJONG: 121,
		FIVEROW: 122,
		FIVEBALLS: 123,
		DRAUGHTS: 124,
		BOMB: 126,
		
		FONT: 127,
		APPLICATIONS: 128,
		EXECUTABLE: 129,
		PREVIOUS_SONG: 130,
		NEXT_SONG: 131,
		PREVIOUS: 132,
		NEXT: 133,
		ARCHIVE: 134,
		BRIGHT_CONT: 135,
		BRIGHTNESS: 136,
		CONTRAST: 137,
		
		BOOK_ALT: 138,
		PICTURE_ALT: 139,
		SEARCH_ALT: 140,
		HANDWRITING_ALT: 141,
		COMIC: 142,
		AUDIO_ALT: 143,
		
		DEFAULT: 112,
		
		// big icons shonw in home menu
		HOME_BOOK_HISTORY: 2,
		HOME_AUTHOR: 2,
		HOME_FOLDER: 4,
		HOME_MORE: 5,
		HOME_GAME: 6,
		HOME_DATE: 7,
		
		// At least 600 and 900 have more than one type of icons
		getIcon: function (strKind, type) {
			try{
				var kind, i;
				if (type === "home") {
					kind = this["HOME_" + strKind];
					if (typeof kind === "undefined") {
						kind = this.HOME_FOLDER;
					}
				} else if (type === "homeLarge") {
					return undefined;
				} else {
					i = strKind.lastIndexOf("#");
					if (i > -1) {
						kind = parseInt(strKind.substring(i+1));
					} else {
						kind = this[strKind];
					}
				}
				if (typeof kind === "undefined") {
					kind = this.FOLDER;
				}
				return kind;
			}
			catch (e) {
				return this.FOLDER;
			}
		}
	},
	
	// PRS+ abstract key code to actual key code, model specific
	keyCodes: {
		previous: "kPreviousCustom",
		previous_h: "kPreviousCustom-hold",
		next: "kNextCustom",
		next_h: "kNextCustom-hold",
		volume_down: "kVolumeMinus", 
		volume_down_h: "kVolumeMinus-hold", 
		volume_up: "kVolumePlus",
		volume_up_h: "kVolumePlus-hold",
		home: "kHome",
		home_h: "kHome-hold",
		size: "kSize",
		size_h: "kSize-hold",
		option: "kOption",
		option_h: "kOption-hold"
	},
	// does device have numeric keys
	hasNumericButtons: false,
	// are there volume keys
	hasVolumeButtons: true,
	// are there paging buttons
	hasPagingButtonsOld: false,
	hasPagingButtonsNew: true,
	// are there joypad buttons
	hasJoypadButtons: false,
	// are there "other" buttons
	hasOtherButtons: true,
	// Are there SD/MS card slots
	hasCardSlots: true,
	
	// Where to find which node, relative to kbook.root
	standardMenuLayout: {
		"continue": [0, 0],
		books: [0, 1],
		periodicals: [0, 2],
		collections: [0, 3],
		notes: [0, 4],
		newdelivery: [0, 5],
		textMemo: [2, 3],
		handwriting: [2, 2],
		// more: [2],
		audio: [2, 0],
		pictures: [2, 1],
		settings: [3],
		apps: [2]
	},
	
	// Home menu icons for default nodes
	standardMenuIcons: {
		"continue": 2,
		books: 2,
		collections: 2,
		notes: 3
	},
	
	// Root node for menu customizer
	rootNode: function() { return kbook.root.nodes[0] },
	
	// Menu configuration
	prspMenu: {
		// Container nodes
		customContainers: [
			{ name: "more", title: "NODE_MORE", icon: "MORE", parent: "root"},
			{ name: "games", title: "NODE_GAMES_UNSTABLE", shortName: "Games", icon: "GAME"}
		],
		// Nodes assigned to certain nodes
		customNodes: [
			{ name: "PRSPSettings", parent: "settings", position: 0},
			{ name: "collections", parent: "more" },
			{ name: "periodicals", parent: "more" },
			{ name: "notes", parent: "more" },
			{ name: "games", parent: "more" },
			{ name: "Calculator", parent: "more" },
			{ name: "Calendar", parent: "more" },
			//{ name: "Cli", parent: "more" },
			{ name: "StandardActions", parent: "more" },
			{ name: "AuthorList", parent: "more" },
			{ name: "Chess", parent: "games" },
			{ name: "Draughts", parent: "games" },
			{ name: "FiveBalls", parent: "games" },	
			{ name: "FiveRow", parent: "games" },	
			{ name: "FreeCell", parent: "games" },
			{ name: "IntFic", parent: "games" },
			{ name: "Mahjong", parent: "games" },
			// FIXME: Doesn't work on 950 yet
			// { name: "MineSweeper", parent: "games" },
			{ name: "Solitaire", parent: "games" },
			{ name: "Sudoku", parent: "games" },
			{ name: "XOCubed", parent: "games" }		
		],
		movableNodes: [0, 0, 1, 1, 1],
		defaultLayout: [
			{ name: "continue"},
			{ name: "books"},
			{ name: "BrowseFolders"},
			{ name: "BookHistory"},
			{ name: "more" }
		]		
	},

	media: {
		// types to be used to determine media type using "xs.isInstanceOf"
		types: [ FskCache.text  , FskCache.image, FskCache.notepad, FskCache.audio],
		// what kind it is, supported are: "book", "picture", "note", "audio"
		kinds: [ "book", "picture", "note", "audio"],
		// node prototypes to use when creating media nodes
		prototypes: [ FskCache.tree.bookNode, kbook.root.children.applicationRoot.children.pictures.prototype, FskCache.tree.notepadFreehandNode, FskCache.tree.mediaNode]
	}, 

	
	compareStrings: function(a, b) {
		if (a === b) {
			return 0;
		}
		return a > b ? 1 : -1;
	}
};