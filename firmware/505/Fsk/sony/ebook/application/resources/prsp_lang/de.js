return {
	X: {
		BOOKS: ["Bücher", "1 Buch", "Kein Buch"],
		SETTINGS: ["Einstellungen", "1 Einstellung", "Keine Einstellung"],		
		PAGES: ["Seiten", "1 Seite", "Keine Seite"],
		PICTURES: ["Bilder", "1 Bild", "Kein Bild"],
		SONGS: ["Lieder", "1 Lied", "Kein Lied"],
		BOOKMARKS: ["Lesezeichen", "1 Lesezeichen", "Kein Lesezeichen"],
		COLLECTIONS: ["Sammlungen", "1 Sammlung", "Keine Sammlung"],
		ITEMS: ["Menüpunkte", "1 Menüpunkt", "Kein Menüpunkt"]
	}, 
	
	// Standard stuff
	Sony: {
		// USB connected
		DO_NOT_DISCONNECT: "Bitte nicht trennen",
		USB_CONNECTED: "USB verbunden",
		DEVICE_LOCKED: "Gerät gesperrt",

		// About, translate either all or none
		ABOUT_1: "Copyright ©2006-2008 Sony Corporation",
		ABOUT_2: "Adobe, the Adobe logo, Reader and PDF are either registered trademarks or" + " trademarks of Adobe Systems Incorporated in the United States and/or other countries.",
		ABOUT_3: "MPEG Layer-3 audio coding technology and patents licensed by Fraunhofer IIS and Thomson." + " MPEG-4 AAC audio coding technology licensed by Fraunhofer IIS (www.iis.fraunhofer.de/amm/).",
		ABOUT_4: "Application software designed and implemented by Kinoma (www.kinoma.com). Portions Copyright ©2006,2007 Kinoma, Inc.",
		ABOUT_5: "Bitstream is a registered trademark, and Dutch, Font Fusion, and Swiss are trademarks, of Bitstream, Inc.",
		ABOUT_6: "Portions of this software are Copyright ©2005 The FreeType Project (www.freetype.org). All rights reserved.",
		ABOUT_7: "This software is based in part on the work of the Independent JPEG Group.",
		AUTHORIZED_SONY: "Authorisiert für den eBook Store.",
		NOT_AUTHORIZED_SONY: "Nicht authorisiert für den eBook Store.",
		AUTHORIZED_ADOBE: "Dieses Gerät ist authorisiert für Adobe DRM-geschützte Inhalte.",
		NOT_AUTHORIZED_ADOBE: "Dieses Gerät ist nicht authorisiert für Adobe DRM-geschützte Inhalte.",
		SONY_FW_VERSION: "Version",
		DEVICE_ID: "Gerät",

		// Mime & card names
		RICH_TEXT_FORMAT: "RTF-Datei",
		ADOBE_PDF: "PDF-Datei",
		EPUB_DOCUMENT: "EPUB-Dokument",
		BBEB_BOOK: "BBeB-Buch",
		PLAIN_TEXT: "Textdatei",
		INTERNAL_MEMORY: "Interner Speicher",
		MEMORY_STICK: "Memory Stick",
		SD_CARD: "SD-Karte",

		// Main.xml & kbook.so stuff
		INVALID_FORMAT: "Ungültiges Format!",
		FORMATTING: "Formatiere...",
		LOADING: "Lade...",
		LOW_BATTERY: "Batterie schwach!",
		HR_WARNING: "Willst Du alle Inhalte LÖSCHEN, auf Werkseinstellungen zurücksetzen und die DRM-Authorisierung zurücksetzen?\n\nJa - Drücke 5\nNein - Drücke MENÜ",
		DEVICE_SHUTDOWN: "Gerät ausschalten",
		PRESS_MARK_TO_SHUTDOWN: "Drücke LESEZEICHEN",
		THIS_DEVICE: "zum Ausschalten.",
		PRESS_MARK_TO_DELETE: "Drücke LESEZEICHEN um",
		THIS_BOOK: "dieses Buch zu löschen.",
		FORMAT_INTERNAL_MEMORY: "Formatiere internen Speicher",
		PRESS_MARK_TO_FORMAT: "Drücke LESEZEICHEN",
		MSG_INTERNAL_MEMORY: "zum Formatieren.",
		RESTORE_DEFAULTS: "Standardeinstellungen wiederherstellen",
		PRESS_MARK_TO_RESTORE: "Drücke LESEZEICHEN zum Wiederherstellen",
		DEFAULT_SETTINGS: "der Standardeinstellungen.",
		UPPER_PAGE: "Seite",
		ONE_OF_ONE: "1 von 1",
		NO_BATTERY: "Batterie leer!",
		FORMATTING_INTERNAL_MEMORY: "Formatiere internen Speicher...",
		SHUTTING_DOWN: "Gerät schaltet aus...",

		// Root menu
		CONTINUE: "Weiterlesen",
		BOOKS_BY_TITLE: "Bücher nach Titel",
		BOOKS_BY_AUTHOR: "Bücher nach Autor",
		BOOKS_BY_DATE: "Bücher nach Datum",
		COLLECTIONS: "Sammlungen",
		ALL_BOOKMARKS: "Alle Lesezeichen",
		NOW_PLAYING: "Momentan läuft",
		MUSIC: "Musik",
		PICTURES: "Bilder",
		SETTINGS: "Einstellungen",

		// In Settings
		// orientation
		ORIENTATION: "Ausrichtung",
		HORIZONTAL: "Horizontal",
		VERTICAL: "Vertikal",
		// set date
		SET_DATE: "Datum und Uhrzeit",
		YEAR: "Jahr",
		MONTH: "Monat",
		DATE: "Tag", // Day
		HOUR: "Stunde",
		MINUTE: "Minute",
		SETDATE_OK: "OK",
		// width in pixels = ..._SIZE * 35
		SETDATE_OK_SIZE: 2,
		// slideshow
		SLIDESHOW: "Diashow",
		SS_ON: "Ja",
		SS_OFF: "Nein",
		SS_TURN: "Aktivieren",
		SS_DURATION: "Intervall",
		// width in pixels = ..._SIZE * 35
		SS_SIZE: "3",
		SS_OK: "OK",
		// width in pixels = ..._SIZE * 35
		SS_OK_SIZE: "2",
		SECONDS: "Sekunden",
		// auto standby (aka sleep mode)
		AUTOSTANDBY: "Schlaf-Modus",
		AS_ON: "Ja",
		AS_OFF: "Nein",
		AS_TURN: "Aktivieren",
		// width in pixels = ..._SIZE * 35
		AS_SIZE: "3",
		AS_OK: "OK",
		// width in pixels = ..._SIZE * 35
		AS_OK_SIZE: "2",
		// about
		ABOUT: "Über",
		// reset to factory settings
		RESET_TO_FACTORY: "Auf Werkseinstellungen zurücksetzen",

		// In Advanced Settings
		ADVANCED_SETTINGS: "Erweiterte Einstellungen",
		// screen lock (aka device lock)
		SCREEN_LOCK: "Gerätesperre",
		SL_OFF: "Aus",
		SL_ON: "Ein",
		SL_CODE: "Code eingeben",
		SL_TURN: "Aktivieren",
		// width in pixels = ..._SIZE * 35
		SL_SIZE: "3",
		SL_OK: "OK",
		SL_OK_SIZE: "2",
		SL_OK_UNLOCK: "OK", // unlock
		// width in pixels = ..._SIZE * 35
		SL_OK_UNLOCK_SIZE: "2",
		// format device
		FORMAT_DEVICE: "Gerät formatieren",

		// In Book menu
		BEGIN: "Anfang",
		END: "Ende",
		BOOKMARKS: "Lesezeichen",
		CONTENTS: "Inhaltsverzeichnis",
		HISTORY: "Verlauf",
		INFO: "Informationen",
		UTILITIES: "Werkzeuge",

		// In Book Utilities
		REMOVE_ALL_BOOKMARKS: "Alle Lesezeichen löschen",
		CLEAR_HISTORY: "Verlauf löschen",
		DELETE_BOOK: "Buch löschen",

		// In Books by Date
		TODAY: "Heute",
		EARLIER_THIS_WEEK: "Diese Woche",
		LAST_WEEK: "Letzte Woche",
		EARLIER_THIS_MONTH: "Diesen Monat",
		LAST_MONTH: "Letzter Monat",
		EARLIER_THIS_QUARTER: "Dieses Quartal",
		LAST_QUARTER: "Letztes Quartal",
		EARLIER_THIS_YEAR: "Dieses Jahr",
		LAST_YEAR: "Letztes Jahr",
		OLDER: "Älter",

		PAGE: "Seite",
		PART: "Teil",
		OF: "von",
		NO_BOOK: "Kein Buch",
		NO_SONG: "Kein Lied",

		// Info title strings, comma separated, no spaces after comma
		INFO_TITLES: "Einband,Titel,Autor,Verleger,Kategorie,eBook ID,Dateityp,Datum,Dateigröße,Speicherort,Dateipfad,Digitale Rechte,Gültigkeitsende",

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
		TITLE_0: "Sonstige",
		CRITERION_0: ""
	},
	
	CoreLang: {
		TITLE: "Lokalisierung",
		COMMENT: "Benötigt Neustart",
		OPTION_LANG: "Sprache",

		OPTION_DATE_FORMAT: "Datums-Format",
		VALUE_DEFAULT_DATE: "Standardwert",
		ddMMMYY: "31/Jan/99",
		ddMONTHYY: "31/Januar/99",
		ddMMMYYYY: "31/Jan/1999",
		ddMONTHYYYY: "31/Januar/1999",

		OPTION_DATE_SEPARATOR: "Datums-Trennzeichen",
		VALUE_SPACE: "Leerzeichen",
		VALUE_NONE: "Keins",

		MONTH_SHORT_1: "Jan",
		MONTH_SHORT_2: "Feb",
		MONTH_SHORT_3: "Mar",
		MONTH_SHORT_4: "Apr",
		MONTH_SHORT_5: "Mai",
		MONTH_SHORT_6: "Jun",
		MONTH_SHORT_7: "Jul",
		MONTH_SHORT_8: "Aug",
		MONTH_SHORT_9: "Sep",
		MONTH_SHORT_10: "Okt",
		MONTH_SHORT_11: "Nov",
		MONTH_SHORT_12: "Dez",

		MONTH_1: "Januar",
		MONTH_2: "Februar",
		MONTH_3: "März",
		MONTH_4: "April",
		MONTH_5: "Mai",
		MONTH_6: "Juni",
		MONTH_7: "Juli",
		MONTH_8: "August",
		MONTH_9: "September",
		MONTH_10: "Oktober",
		MONTH_11: "November",
		MONTH_12: "Dezember"
	}	
};
