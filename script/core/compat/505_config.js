// Name: 505
// Description: Sony  PRS-505 compatibility layer
//
// History:
//	2011-03-04 kartu - Initial version
//  2011-06-29 Ben Chenoweth - ALL: Updated existing games/calculator to use AppAssets and added
//      Draughts by Ben Chenoweth
//      MineSweeper by Mark Nord / D. Shep Poor
//      XO-Cubed by Ben Chenoweth
//	2011-07-04 Mark Nord - Added #39 "Hold joypad arrows events"
//	2011-07-04 Mark Nord - Added #24 "Displaying first page of the book on standby" & #38 "Standby image"
//	2011-07-03 Mark Nord - Added NodeKinds.STANDBY
//	2011-07-05 Ben Chenoweth - Added STANDBY icon
//	2011-08-03 Ben Chenoweth - ALL: Added
//      	Calendar by Ben Chenoweth
// 		Solitaire by Ben Chenoweth
//	2011-10-19 Ben Chenoweth - Added ALT icons
//	2011-12-25 Mark Nord - added picture & audio to "media" -> will be supported by BrowseFolders
//	2012-02-20 quisvir - Added Action Launcher (StandardActions node)

return {
	// Menu icon indices 
	NodeKinds: {
		EMPTY: 1000,
		ALL_BOOKS: 1,
		BOOK: 2,
		FILE: 2,
		AUDIO: 3,
		PICTURE: 4,
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
		DATE: 22,
		ABOUT: 25,
		BACK: 26,
		ABC: 27,
		DATETIME: 28,
		DB: 29,
		SHUTDOWN: 31,
		MS: 34,
		SD: 35,
		INTERNAL_MEM: 36,
		SEARCH: 37,
		ROOT_MENU: 38,

		STANDBY: 62,

		UNCHECKED: 39,
		CHECKED: 40,
		
		FOLDER: 41,
		GAME: 42,
		CALC: 43,
		LANGUAGE: 44,
		KEYBOARD: 45,
		KEYBOARD_ALT: 45,
		CHESS: 46,
		CARDS: 47,
		SUDOKU: 48,
		MAHJONG: 49,
		FIVEROW: 50,
		FIVEBALLS: 51,
		DRAUGHTS: 52,
		TEXT_SCALE: 53,
		BOMB: 54,
		
		FONT: 55,
		EXECUTABLE: 56,
		APPLICATIONS: 57,
		PREVIOUS_SONG: 58,
		NEXT_SONG: 59,
		PREVIOUS: 60,
		NEXT: 61,
		
		BOOK_ALT: 63,
		INTERACT_FICT: 63,
		PICTURE_ALT: 64,
		SEARCH_ALT: 65,
		COMIC: 66,
		ARCHIVE: 67,
		AUDIO_ALT: 68,

		DEFAULT: 41,
		
		// At least 600 and 900 have more than one type of icons
		getIcon: function (strKind, type) {
			var kind = this[strKind];
			if (typeof kind === "undefined") {
				kind = 41;
			}
			return kind;
		}
	},
	
	// PRS+ abstract key code to actual key code, model specific
	keyCodes: {
		"1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9", "0": "0",
		"1_h": "kHold1", "2_h": "kHold2", "3_h": "kHold3", "4_h": "kHold4", "5_h": "kHold5", "6_h": "kHold6", "7_h": "kHold7", "8_h": "kHold8", "9_h": "kHold9", "0_h": "kHold0",
		jp_left: "kLeft", jp_right: "kRight", jp_up: "kUp", jp_down: "kDown",
		jp_left_h: "kLeft-hold", jp_right_h: "kRight-hold", jp_up_h: "kUp-hold", jp_down_h: "kDown-hold",
		jp_center: "0x27", jp_center_h: "0x27-hold",
		menu: "0x21", menu_h: "0x21-hold",
		bookmark: "0x32", bookmark_h: "0x32-hold",
		size: "0x42", size_h: "0x42-hold",
		volume_down: "0x41", volume_down_h: "0x41-hold", volume_up: "0x40", volume_up_h: "0x40-hold",
		// Bottom left next/prev page
		bl_next: "0x30", bl_next_h: "0x30-hold", bl_previous: "0x31", bl_previous_h: "0x31-hold",
		// Sidebar next/prev page
		sb_next: "kNext", sb_next_h: "kLast", sb_previous: "kPrevious", sb_previous_h: "kFirst"
	},
	// does device have numeric keys
	hasNumericButtons: true,
	// are there volume keys
	hasVolumeButtons: true,
	// are there paging buttons
	hasPagingButtonsOld: true,
	hasPagingButtonsNew: false,
	// are there joypad buttons
	hasJoypadButtons: true,
	// are there "other" buttons
	hasOtherButtons: true,
	// Are there SD/MS card slots
	hasCardSlots: true,
	
	// Where to find which node, relative to kbook.root
	standardMenuLayout: {
		"continue": [0],
		booksByTitle: [1],
		booksByAuthor: [2],
		booksByDate: [3],
		collections: [4],
		bookmarks: [5],
		nowPlaying: [6],
		music: [7],
		pictures: [8],
		settings: [9],
		advancedSettings: [9,4]
	},
	
	// Menu configuration
	prspMenu: {
		// Container nodes
		customContainers: [
			{ name: "gamesAndUtils", title: "NODE_GAMES_AND_UTILS", icon: "GAME"},
			{ name: "multimedia", title: "NODE_OTHERS", icon: "AUDIO"}
		],
		// Nodes assigned to certain nodes
		customNodes: [
			{ name: "BookHistory", parent: "gamesAndUtils"},
			{ name: "DictionaryCL", parent: "gamesAndUtils" },
			{ name: "Calculator", parent: "gamesAndUtils" },
			{ name: "Calendar", parent: "gamesAndUtils" },
			//{ name: "Cli", parent: "gamesAndUtils" },
			{ name: "StandardActions", parent: "gamesAndUtils" },		
			{ name: "Chess", parent: "gamesAndUtils" },				
			{ name: "Draughts", parent: "gamesAndUtils" },
			{ name: "FiveBalls", parent: "gamesAndUtils" },				
			{ name: "FiveRow", parent: "gamesAndUtils" },				
			{ name: "FreeCell", parent: "gamesAndUtils" },
			{ name: "Frotz", parent: "gamesAndUtils" },
			{ name: "Mahjong", parent: "gamesAndUtils" },
			{ name: "MineSweeper", parent: "gamesAndUtils" },
			{ name: "Solitaire", parent: "gamesAndUtils" },
			{ name: "Sudoku", parent: "gamesAndUtils" },
			{ name: "XOCubed", parent: "gamesAndUtils" },						
			{ name: "nowPlaying", parent: "multimedia" },
			{ name: "music", parent: "multimedia" },
			{ name: "pictures", parent: "multimedia" },
			{ name: "PRSPSettings", parent: "settings", position: 0 }
		],
		movableNodes: [1,0 /* by author */,1,1,1,1,1,1,1,0 /* settings */],
		defaultLayout: [
			{ name: "continue"}, 
			{ name: "booksByTitle"}, 
			{ name: "booksByDate"}, 
			{ name: "booksByAuthor"},
			{ name: "BrowseFolders", separator: true},
			{ name: "bookmarks"}, 
			{ name: "collections"},
			{ name: "multimedia"},
			{ name: "gamesAndUtils"},
			{ name: "settings"}
		]
	},
	
	media: {
		// types to be used to determine media type using "xs.isInstanceOf"
		types: [FskCache.text, FskCache.image, FskCache.audio],
		// what kind it is, supported are: "book", "picture", "note", "audio"
		kinds: ["book", "picture", "audio"],
		// node prototypes to use when creating media nodes
		prototypes: [FskCache.tree.bookNode, kbook.root.children.pictures.prototype, kbook.root.children.music.prototype]
	}, 
	
	compareStrings: function(a, b) {
		if (a === b) {
			return 0;
		}
		return a > b ? 1 : -1;
	}
};
