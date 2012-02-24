var okText = "შენახვა";
var okSize = 4.5;
var onText = "ჩართულია";
var offText = "გამორთულია";
var onOffSize = 7.5;
var activateText = "სტატუსი";


return {
	X: {
		BOOKS: ["წიგნი", "ცარიელი"],
		SETTINGS: ["ოფცია", "ცარიელი"],		
		PAGES: ["გვერდი", "ცარიელი"],
		PICTURES: ["სურათი", "ცარიელი"],
		SONGS: ["სიმღერა", "ცარიელი"],
		BOOKMARKS: ["ჩანიშნული", "ცარიელი"],
		COLLECTIONS: ["კოლქკცია", "ცარიელი"],
		ITEMS: ["საგანი", "ცარიელი"]
	},
	// Standard stuff
	Sony: {
		// USB connected
		DO_NOT_DISCONNECT: "არ გამორთოთ",
		USB_CONNECTED: "USB შეერთებულია",
		DEVICE_LOCKED: "წიგნი დაბლოკილია",

		// About, translate either all or none
		ABOUT_1: "საავტორო უფლებები ©2006-2008 Sony Corporation",
		ABOUT_2: "Adobe, the Adobe logo, Reader and PDF are either registered trademarks or" + " trademarks of Adobe Systems Incorporated in the United States and/or other countries.",
		ABOUT_3: "MPEG Layer-3 audio coding technology and patents licensed by Fraunhofer IIS and Thomson." + " MPEG-4 AAC audio coding technology licensed by Fraunhofer IIS (www.iis.fraunhofer.de/amm/).",
		ABOUT_4: "Application software designed and implemented by Kinoma (www.kinoma.com). Portions Copyright ©2006,2007 Kinoma, Inc.",
		ABOUT_5: "Bitstream is a registered trademark, and Dutch, Font Fusion, and Swiss are trademarks, of Bitstream, Inc.",
		ABOUT_6: "Portions of this software are Copyright ©2005 The FreeType Project (www.freetype.org). All rights reserved.",
		ABOUT_7: "This software is based in part on the work of the Independent JPEG Group.",
		AUTHORIZED_SONY: "წიგნი ავტორიზებულია eBook Store-ისთვის.",
		NOT_AUTHORIZED_SONY: "წიგნი არ არის ავტორიზებული eBook Store-ისთვის.",
		AUTHORIZED_ADOBE: "წიგნი ავტორიზირებულია Adobe DRM დაცული მასალისთვის.",
		NOT_AUTHORIZED_ADOBE: "წიგნი არ არის ავტორიზირებული Adobe DRM დაცული მასალისთვის.",
		SONY_FW_VERSION: "ვერსია",
		DEVICE_ID: "მოწყობილობა",

		// Mime & card names
		RICH_TEXT_FORMAT: "Rich Text ფორმატი",
		ADOBE_PDF: "Adobe PDF",
		EPUB_DOCUMENT: "EPUB დოკუმენტი",
		BBEB_BOOK: "BBeB წიგნი",
		PLAIN_TEXT: "უბრალო ტექსტი",
		INTERNAL_MEMORY: "შიდა მეხსიერება",
		MEMORY_STICK: "Memory Stick",
		SD_CARD: "SD კარტა",

		// Main.xml & kbook.so stuff
		INVALID_FORMAT: "არასწორი ფორმატი!",
		FORMATTING: "დაფორმატება...",
		LOADING: "იტვირთება...",
		LOW_BATTERY: "აკუმულატორი დამჯდარია!",
		HR_WARNING: "გინდათ წაშალოდ მთელი მასალა, აღადგინოთ საწყისი პარამეტრები და წაშალოთ DRM ავტორიზაცია?\n\nდიახ - დააჭირეთ 5-ს\nარა - დააჭირეთ MENU-ს",
		DEVICE_SHUTDOWN: "სისტემის გათიშვა",
		PRESS_MARK_TO_SHUTDOWN: "დააჭირეთ MARK-ს წიგნის",
		THIS_DEVICE: "გასათიშად.",
		PRESS_MARK_TO_DELETE: "დააჭირეთ MARK-ს წიგნის",
		THIS_BOOK: "წასაშლელად.",
		FORMAT_INTERNAL_MEMORY: "შიდა მეხსიერების დაფორმატება",
		PRESS_MARK_TO_FORMAT: "დააჭირეთ MARK-ს შიდა",
		MSG_INTERNAL_MEMORY: "მეხსიერების დასაფორმატებლად.",
		RESTORE_DEFAULTS: "ნაგულისხმევის აღდგენა",
		PRESS_MARK_TO_RESTORE: "დააჭირეთ MARK-ს",
		DEFAULT_SETTINGS: "ნაგულისხმევის აღსადგენად.",
		UPPER_PAGE: "გვერდი",
		ONE_OF_ONE: "1 - 1",
		NO_BATTERY: "აკუმულატორი დამჯდარია!",
		FORMATTING_INTERNAL_MEMORY: "შიდა მეხსიერების ფორმატირება...",
		SHUTTING_DOWN: "მუშაობის დასრულება...",

		// Root menu
		CONTINUE: "კითხვის გაგრძელება",
		BOOKS_BY_TITLE: "წიგნები სათაურის მიხედვით",
		BOOKS_BY_AUTHOR: "წიგნები ავტორის მიხედვით",
		BOOKS_BY_DATE: "წიგნები თარიღის მიხედვით",
		COLLECTIONS: "კოლექციები",
		ALL_BOOKMARKS: "ყველა სანიშნე",
		NOW_PLAYING: "ახლა იკვრება",
		MUSIC: "მუსიკა",
		PICTURES: "სურათები",
		SETTINGS: "პარამეტრები",

		// In Settings
		// orientation
		ORIENTATION: "ორიენტაცია",
		HORIZONTAL: "ჰორიზონტალური",
		VERTICAL: "ვერტიკალური",
		// set date
		SET_DATE: "თარიღი",
		YEAR: "წელი",
		MONTH: "თვე",
		DATE: "დღე",
		// Day
		HOUR: "საათი",
		MINUTE: "წუთი",
		SETDATE_OK: okText,
		SETDATE_OK_SIZE: okSize,
		// slideshow
		SLIDESHOW: "დიაფილმი",
		SS_ON: onText,
		SS_OFF: offText,
		SS_TURN: activateText,
		SS_DURATION: "ხანძლიობა",
		SS_SIZE: onOffSize,
		SS_OK: okText,
		SS_OK_SIZE: okSize,
		SECONDS: "წამი",

		// auto standby (aka sleep mode)
		AUTOSTANDBY: "ძილის რეჟიმი",
		AS_ON: onText,
		AS_OFF: offText,
		AS_TURN: activateText,
		AS_SIZE: onOffSize,
		AS_OK: okText,
		AS_OK_SIZE: okSize,
		// about
		ABOUT: "წიგნის შესახებ",
		// reset to factory settings
		RESET_TO_FACTORY: "საწყისი პარამეტრების აღდგენა",

		// In Advanced Settings
		ADVANCED_SETTINGS: "გაფართოებული პარამეტრები",
		// screen lock (aka device lock)
		SCREEN_LOCK: "წიგნის ჩაკეტვა",
		SL_ON: onText,
		SL_OFF: offText,
		SL_CODE: "კოდი",
		SL_TURN: activateText,
		SL_SIZE: onOffSize,
		SL_OK: okText,
		SL_OK_SIZE: okSize,
		SL_OK_UNLOCK: "გახსნა",
		SL_OK_UNLOCK_SIZE: 5,
		// format device
		FORMAT_DEVICE: "წიგნის ფორმატირება",

		// In Book menu
		BEGIN: "დასაწყისი",
		END: "დასასრული",
		BOOKMARKS: "სანიშნეები",
		CONTENTS: "სარჩევი",
		HISTORY: "ისტორია",
		INFO: "ინფორმაცია",
		UTILITIES: "უტილიტები",

		// In Book Utilities
		REMOVE_ALL_BOOKMARKS: "ყველა სანიშნეს წაშლა",
		CLEAR_HISTORY: "ისტორიის წაშლა",
		DELETE_BOOK: "წიგნის წაშლა",

		// In Books by Date
		TODAY: "დღეს",
		EARLIER_THIS_WEEK: "ამ კვირას",
		LAST_WEEK: "წინა კვირას",
		EARLIER_THIS_MONTH: "ამ თვეში",
		LAST_MONTH: "წინა თვეში",
		EARLIER_THIS_QUARTER: "ამ კვარტალში",
		LAST_QUARTER: "წინა კვარტალში",
		EARLIER_THIS_YEAR: "წელს",
		LAST_YEAR: "შარშან",
		OLDER: "უფრო ძველი",

		PAGE: "გვერდი",
		PART: "ნაწილი",
		OF: "/",
		NO_BOOK: "ცარიელი",
		NO_SONG: "ცარიელი",

		// Info title strings, comma separated, no spaces after comma
		INFO_TITLES: "გარეკანი,სათაური,ავტორი,გამომცემელი,კატეგორია,eBook ID,ტიპი,თარიღი,სიდიდე,წყარო,ფაილი,Digital Rights,ვადის ამოწურვა",

		// Titles and criterions for "Books by Title" and "Books by Folder"
		// title is displayed, "criterion" is used for sorting.
		//
		// NOTE: if localization doesn't need custom Books by sorting, just remove CUSTOM_SORT, TITLE_*, CRITERION_* items
		CUSTOM_SORT: true,
		TITLE_1: "0-9",
		CRITERION_1: "0123456789",
		TITLE_2: "A B C D E F",
		CRITERION_2: "ABCabcDEFdef",
		TITLE_3: "G H I J K L",
		CRITERION_3: "GHIghiJKLjkl",
		TITLE_4: "M N O P Q R S",
		CRITERION_4: "MNOmnoPQRSpqrs",
		TITLE_5: "T U V W X Y Z",
		CRITERION_5: "TUVWtuvwWXYZwxyz",
		TITLE_6: "ა ბ გ დ ე ვ ზ თ ი",
		CRITERION_6: "აბგდევზთი",
		TITLE_7: "კ ლ მ ნ ო პ ჟ რ",
		CRITERION_7: "კლმნოპჟრ",
		TITLE_8: "ს ტ უ ფ ქ ღ ყ შ",
		CRITERION_8: "სტუფქღყშ",
		TITLE_9: "ჩ ც ძ წ ჭ ხ ჯ ჰ",
		CRITERION_9: "ჩცძწჭხჯჰ",
		TITLE_0: "სხვა",
		CRITERION_0: ""
	},

	CoreLang: {
		TITLE: "ლოკალიზაცია",
		COMMENT: "საჭიროებს გადატვირთვას",
		OPTION_LANG: "ენა",

		OPTION_DATE_FORMAT: "თარიღის ფორმატი",
		VALUE_DEFAULT_DATE: "ნაგულისხმევი",
		ddMMMYY: "31/იან/99",
		ddMONTHYY: "31/იანვარი/99",
		ddMMMYYYY: "31/იან/1999",
		ddMONTHYYYY: "31/იანვარი/1999",

		OPTION_DATE_SEPARATOR: "გამყოფი სიმბოლო",
		VALUE_SPACE: "ინტერვალი",
		VALUE_NONE: "არაფერი",

		MONTH_SHORT_1: "იან",
		MONTH_SHORT_2: "თებ",
		MONTH_SHORT_3: "მარ",
		MONTH_SHORT_4: "აპრ",
		MONTH_SHORT_5: "მაი",
		MONTH_SHORT_6: "ივნ",
		MONTH_SHORT_7: "ივლ",
		MONTH_SHORT_8: "აგვ",
		MONTH_SHORT_9: "სექ",
		MONTH_SHORT_10: "ოქტ",
		MONTH_SHORT_11: "ნოე",
		MONTH_SHORT_12: "დეკ",

		MONTH_1: "იანვარი",
		MONTH_2: "თებერვალი",
		MONTH_3: "მარტი",
		MONTH_4: "აპრილი",
		MONTH_5: "მაისი",
		MONTH_6: "ივნისი",
		MONTH_7: "ივლისი",
		MONTH_8: "აგვისტო",
		MONTH_9: "სექტემბერი",
		MONTH_10: "ოქტომბერი",
		MONTH_11: "ნოემბერი",
		MONTH_12: "დეკემბერი"
	}

};
