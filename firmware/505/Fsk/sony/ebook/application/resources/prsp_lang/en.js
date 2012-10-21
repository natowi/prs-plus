// Language: English (sample)
// Description: Localization file
//
// History:
//	2010-04-30 kravitz - Refactored, added new strings
//	2010-05-01 kartu - Added ACTION_GOTO_LINK
//	2010-05-02 kartu - Added dictionary strings
//	2010-05-03 kravitz - Renamed ReadingList to BookHistory, added new strings, refactored MenuTuning
//	2010-05-06 kartu - Added ppm related translations for PageIndex addon
//	2010-05-11 kartu - Added VALUE_DEFAULT_DATE (CoreLang)
//	2010-05-14 kravitz - Added BookHistory strings
//	2010-05-15 kartu - Added PAGE (BookHistory)
//	2010-05-17 kravitz - Replaced PAGE (BookHistory) with added FUNC_PAGE_X
//	2010-05-18 kravitz - Replaced PAGE (Sony) with FUNC_PAGE_X
//	2010-05-20 kartu - Removed script reference from about string

return {
	X: {
		BOOKS: ["books", "1 book", "empty"],
		SETTINGS: ["settings", "1setting", "empty"],
		PAGES: ["pages", "1 page", "empty"],
		PICTURES: ["pictures", "1 picture", "empty"],
		SONGS: ["songs", "1 song", "empty"],
		BOOKMARKS: ["bookmarks", "1 bookmark", "empty"],
		COLLECTIONS: ["collections", "1 collection", "empty"],
		ITEMS: ["items", "1 item", "empty"]
	},
	
	// Standard stuff
	Sony: {
		// USB connected
		DO_NOT_DISCONNECT: "Do not disconnect",
		USB_CONNECTED: "USB connected",
		DEVICE_LOCKED: "Device locked",

		// About, translate either all or none
		ABOUT_1: "Copyright ©2006-2008 Sony Corporation",
		ABOUT_2: "Adobe, the Adobe logo, Reader and PDF are either registered trademarks or" + " trademarks of Adobe Systems Incorporated in the United States and/or other countries.",
		ABOUT_3: "MPEG Layer-3 audio coding technology and patents licensed by Fraunhofer IIS and Thomson." + " MPEG-4 AAC audio coding technology licensed by Fraunhofer IIS (www.iis.fraunhofer.de/amm/).",
		ABOUT_4: "Application software designed and implemented by Kinoma (www.kinoma.com). Portions Copyright ©2006,2007 Kinoma, Inc.",
		ABOUT_5: "Bitstream is a registered trademark, and Dutch, Font Fusion, and Swiss are trademarks, of Bitstream, Inc.",
		ABOUT_6: "Portions of this software are Copyright ©2005 The FreeType Project (www.freetype.org). All rights reserved.",
		ABOUT_7: "This software is based in part on the work of the Independent JPEG Group.",
		AUTHORIZED_SONY: "Authorized for the eBook Store.",
		NOT_AUTHORIZED_SONY: "Not authorized for the eBook Store.",
		AUTHORIZED_ADOBE: "This device is authorized for Adobe DRM protected content.",
		NOT_AUTHORIZED_ADOBE: "This device is not authorized for Adobe DRM protected content.",
		SONY_FW_VERSION: "Version",
		DEVICE_ID: "Device",

		// Mime & card names
		RICH_TEXT_FORMAT: "Rich Text Format",
		ADOBE_PDF: "Adobe PDF",
		EPUB_DOCUMENT: "EPUB document",
		BBEB_BOOK: "BBeB Book",
		PLAIN_TEXT: "Plain text",
		INTERNAL_MEMORY: "Internal memory",
		MEMORY_STICK: "Memory Stick",
		SD_CARD: "SD Memory",

		// Main.xml & kbook.so stuff
		INVALID_FORMAT: "Invalid Format!",
		FORMATTING: "Formatting...",
		LOADING: "Loading...",
		LOW_BATTERY: "Low Battery!",
		HR_WARNING: "Do you want to DELETE all content, restore all factory settings, and clear the DRM authorization state?\n\nYes - Press 5\nNo - Press MENU",
		DEVICE_SHUTDOWN: "Device Shutdown",
		PRESS_MARK_TO_SHUTDOWN: "Press MARK to shutdown",
		THIS_DEVICE: "this device.",
		PRESS_MARK_TO_DELETE: "Press MARK to",
		THIS_BOOK: "delete book.",
		FORMAT_INTERNAL_MEMORY: "Format Internal Memory",
		PRESS_MARK_TO_FORMAT: "Press MARK to format",
		MSG_INTERNAL_MEMORY: "internal memory.",
		RESTORE_DEFAULTS: "Restore Defaults",
		PRESS_MARK_TO_RESTORE: "Press MARK to restore",
		DEFAULT_SETTINGS: "default settings.",
		UPPER_PAGE: "PAGE",
		ONE_OF_ONE: "1 of 1",
		NO_BATTERY: "No battery!",
		FORMATTING_INTERNAL_MEMORY: "Formatting Internal Memory...",
		SHUTTING_DOWN: "Shutting down...",

		// Root menu
		CONTINUE: "Continue Reading",
		BOOKS_BY_TITLE: "Books by Title",
		BOOKS_BY_AUTHOR: "Books by Author",
		BOOKS_BY_DATE: "Books by Date",
		COLLECTIONS: "Collections",
		ALL_BOOKMARKS: "All Bookmarks",
		NOW_PLAYING: "Now Playing",
		MUSIC: "Music",
		PICTURES: "Pictures",
		SETTINGS: "Settings",

		// In Settings
		// orientation
		ORIENTATION: "Orientation",
		HORIZONTAL: "Horizontal",
		VERTICAL: "Vertical",
		// set date
		SET_DATE: "Set Date",
		YEAR: "Year",
		MONTH: "Month",
		DATE: "Date", // Day
		HOUR: "Hour",
		MINUTE: "Minute",
		SETDATE_OK: "OK",
		// width in pixels = ..._SIZE * 35
		SETDATE_OK_SIZE: 2,
		// slideshow
		SLIDESHOW: "Slideshow",
		SS_ON: "On",
		SS_OFF: "Off",
		SS_TURN: "Turn",
		SS_DURATION: "Duration",
		// width in pixels = ..._SIZE * 35
		SS_SIZE: 2,
		SS_OK: "OK",
		// width in pixels = ..._SIZE * 35
		SS_OK_SIZE: 2,
		SECONDS: "Seconds",
		// auto standby (aka sleep mode)
		AUTOSTANDBY: "Sleep Mode",
		AS_ON: "On",
		AS_OFF: "Off",
		AS_TURN: "Turn",
		// width in pixels = ..._SIZE * 35
		AS_SIZE: 2,
		AS_OK: "OK",
		// width in pixels = ..._SIZE * 35
		AS_OK_SIZE: 2,
		// about
		ABOUT: "About",
		// reset to factory settings
		RESET_TO_FACTORY: "Reset to factory settings",

		// In Advanced Settings
		ADVANCED_SETTINGS: "Advanced Settings",
		// screen lock (aka device lock)
		SCREEN_LOCK: "Device Lock",
		SL_OFF: "Off",
		SL_ON: "On",
		SL_CODE: "Code",
		SL_TURN: "Turn",
		// width in pixels = ..._SIZE * 35
		SL_SIZE: 2,
		SL_OK: "OK",
		SL_OK_SIZE: 2,
		SL_OK_UNLOCK: "OK", // unlock
		// width in pixels = ..._SIZE * 35
		SL_OK_UNLOCK_SIZE: 2,
		// format device
		FORMAT_DEVICE: "Format Device",

		// In Book menu
		BEGIN: "Begin",
		END: "End",
		BOOKMARKS: "Bookmarks",
		CONTENTS: "Contents",
		HISTORY: "History",
		INFO: "Info",
		UTILITIES: "Utilities",

		// In Book Utilities
		REMOVE_ALL_BOOKMARKS: "Remove All Bookmarks",
		CLEAR_HISTORY: "Clear History",
		DELETE_BOOK: "Delete Book",

		// In Books by Date
		TODAY: "Today",
		EARLIER_THIS_WEEK: "Earlier This Week",
		LAST_WEEK: "Last Week",
		EARLIER_THIS_MONTH: "Earlier This Month",
		LAST_MONTH: "Last Month",
		EARLIER_THIS_QUARTER: "Earlier This Quarter",
		LAST_QUARTER: "Last Quarter",
		EARLIER_THIS_YEAR: "Earlier This Year",
		LAST_YEAR: "Last Year",
		OLDER: "Older",

		PART: "Part",
		OF: "of",
		NO_BOOK: "No book",
		NO_SONG: "No song",

		// Info title strings, comma separated, no spaces after comma
		INFO_TITLES: "Cover,Title,Author,Publisher,Category,eBook ID,Kind,Date,Size,Location,File,Digital Rights,Expires",

		// Titles and criterions for "Books by Title" and "Books by Folder"
		// title is displayed, "criterion" is used for sorting.
		//
		// NOTE: if localization doesn't need custom Books by sorting, just remove CUSTOM_SORT, TITLE_*, CRITERION_* items
		CUSTOM_SORT: true,
		TITLE_1: "0-9",
		CRITERION_1: "0123456789",
		TITLE_2: "A B C",
		CRITERION_2: "ABCabc",
		TITLE_3: "D E F",
		CRITERION_3: "DEFdef",
		TITLE_4: "G H I",
		CRITERION_4: "GHIghi",
		TITLE_5: "J K L",
		CRITERION_5: "JKLjkl",
		TITLE_6: "M N O",
		CRITERION_6: "MNOmno",
		TITLE_7: "P Q R S",
		CRITERION_7: "PQRSpqrs",
		TITLE_8: "T U V W",
		CRITERION_8: "TUVWtuvw",
		TITLE_9: "X Y Z",
		CRITERION_9: "XYZxyz",
		TITLE_0: "Other",
		CRITERION_0: ""
	},

	CoreLang: {
		TITLE: "Localization",
		COMMENT: "Requires restart",
		OPTION_LANG: "Language",

		OPTION_DATE_FORMAT: "Date Format",
		VALUE_DEFAULT_DATE: "default",
		ddMMMYY: "31/Jan/99",
		ddMONTHYY: "31/January/99",
		ddMMMYYYY: "31/Jan/1999",
		ddMONTHYYYY: "31/January/1999",

		OPTION_DATE_SEPARATOR: "Date Separator",
		VALUE_SPACE: "Space",
		VALUE_NONE: "None",

		MONTH_SHORT_1: "Jan",
		MONTH_SHORT_2: "Feb",
		MONTH_SHORT_3: "Mar",
		MONTH_SHORT_4: "Apr",
		MONTH_SHORT_5: "May",
		MONTH_SHORT_6: "Jun",
		MONTH_SHORT_7: "Jul",
		MONTH_SHORT_8: "Aug",
		MONTH_SHORT_9: "Sep",
		MONTH_SHORT_10: "Oct",
		MONTH_SHORT_11: "Nov",
		MONTH_SHORT_12: "Dec",

		MONTH_1: "January",
		MONTH_2: "February",
		MONTH_3: "March",
		MONTH_4: "April",
		MONTH_5: "May",
		MONTH_6: "June",
		MONTH_7: "July",
		MONTH_8: "August",
		MONTH_9: "September",
		MONTH_10: "October",
		MONTH_11: "November",
		MONTH_12: "December"
	}
};
