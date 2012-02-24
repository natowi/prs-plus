return {
	X: {
		BOOKS: ["livres", "1 livre", "Aucun livre"],
		SETTINGS: ["paramètres", "1 paramètre", "Aucun paramètre"],		
		PAGES: ["pages", "1 page", "Pas de page"],
		PICTURES: ["images", "1 image", "Pas d'image"],
		SONGS: ["chansons", "1 chanson", "Pas de chanson"],
		BOOKMARKS: ["tous les signets", "1 marque-page", "Aucun marque-page"],
		COLLECTIONS: ["collections", "1 collection", "Pas de collection"],
		ITEMS: ["éléments", "1 élément", "Aucun élément"]
	},
	
	// Standard stuff
	Sony: {
		// USB connected
		DO_NOT_DISCONNECT: "Ne débranchez pas!",
		USB_CONNECTED: "USB connecté",
		DEVICE_LOCKED: "Appareil verrouillé",

		// About, translate either all or none
		ABOUT_1: "Copyright ©2006-2008 Sony Corporation",
		ABOUT_2: "Adobe, le logo Adobe, Reader et PDF sont soit des marques enregistrées ou" + " des marques d'Adobe Systems Incorporated aux États-Unis et/ou dans d'autres pays.",
		ABOUT_3: "La technologie d'encodage audio MPEG et les brevets associés sont sous licence de Fraunhofer IIS et Thomson." +  " La technologie d'encodage audio MPEG-4 AAC est sous licence de Fraunhofer IIS (www.iis.fraunhofer.de/amm/).",
		ABOUT_4: "Le logiciel de cette application a été conçu et mis en oeuvre par Kinoma (www.kinoma.com). Parties sous Copyright ©2006,2007 Kinoma, Inc.",
		ABOUT_5: "Bitstream est une marque enregistrée, et Dutch, Font Fusion, et Swiss sont des marques de Bitstream, Inc.",
		ABOUT_6: "Des parties de ce logiciel sont sous copyright de The FreeType Project (www.freetype.org) ©2005. Tous droits réservés.",
		ABOUT_7: "Ce logiciel est basé en partie sur le travail de The Independent JPEG Group.",
		AUTHORIZED_SONY: "Autorisé pour l'eBook Store.",
		NOT_AUTHORIZED_SONY: "Non autorisé pour l'eBook Store.",
		AUTHORIZED_ADOBE: "Cet appareil est autorisé pour le contenu protégé par DRM Adobe.",
		NOT_AUTHORIZED_ADOBE: "Cet appareil n'est pas autorisé pour le contenu protégé par DRM Adobe.",
		SONY_FW_VERSION: "Version",
		DEVICE_ID: "Appareil",

		// Mime & card names
		RICH_TEXT_FORMAT: "Format RTF",
		ADOBE_PDF: "Adobe PDF",
		EPUB_DOCUMENT: "Document EPUB",
		BBEB_BOOK: "Livre BBeB",
		PLAIN_TEXT: "Texte",
		INTERNAL_MEMORY: "Mémoire interne",
		MEMORY_STICK: "Memory Stick",
		SD_CARD: "Carte SD",

		// Main.xml & kbook.so stuff
		INVALID_FORMAT: "Format non valide",
		FORMATTING: "Formatage en cours...",
		LOADING: "Chargement en cours...",
		LOW_BATTERY: "Batterie faible!",
		HR_WARNING: "Vous voulez effacer tout le contenu et restaurer les paramètres initiaux et le paramétrage du verrouillage?\n\nOui - Touche 5\nAucun - Touche MENU",
		DEVICE_SHUTDOWN: "Éteindre l'appareil",
		PRESS_MARK_TO_SHUTDOWN: "Appuyer sur SIGNET pour éteindre",
		THIS_DEVICE: "l'appareil.",
		PRESS_MARK_TO_DELETE: "Appuyer sur SIGNET pour",
		THIS_BOOK: "supprimer le livre.",
		FORMAT_INTERNAL_MEMORY: "Formater la Mémoire Interne",
		PRESS_MARK_TO_FORMAT: "Appuyer sur SIGNET pour formater",
		MSG_INTERNAL_MEMORY: "la mémoire Interne.",
		RESTORE_DEFAULTS: "Restaurer les paramètres par défaut",
		PRESS_MARK_TO_RESTORE: "Appuyer sur SIGNET pour restaurer",
		DEFAULT_SETTINGS: "les paramètres par défaut.",
		UPPER_PAGE: "PAGE",
		ONE_OF_ONE: "1 de 1",
		NO_BATTERY: "Batterie vide!",
		FORMATTING_INTERNAL_MEMORY: "Formatage de la Mémoire Interne en cours...",
		SHUTTING_DOWN: "Éteindre l'appareil",

		// Root menu
		CONTINUE: "Continuer la lecture",
		BOOKS_BY_TITLE: "Livres par Titre",
		BOOKS_BY_AUTHOR: "Livres par Auteur",
		BOOKS_BY_DATE: "Livres par Date",
		COLLECTIONS: "Collections",
		ALL_BOOKMARKS: "Tous les signets",
		NOW_PLAYING: "Lecture en cours",
		MUSIC: "Audio",
		PICTURES: "Images",
		SETTINGS: "Paramètres",

		// In Settings
		// orientation
		ORIENTATION: "Orientation",
		HORIZONTAL: "Horizontal",
		VERTICAL: "Vertical",
		// set date
		SET_DATE: "Date et heure",
		YEAR: "Année",
		MONTH: "Mois",
		DATE: "Jour",
		// Day
		HOUR: "Heure",
		MINUTE: "Minute",
		SETDATE_OK: "OK",
		// width in pixels = ..._SIZE * 35
		SETDATE_OK_SIZE: 2,
		// slideshow
		SLIDESHOW: "Mode Diaporama",
		SS_ON: "Oui",
		SS_OFF: "Non",
		SS_TURN: "Turn",
		SS_DURATION: "Durée de la diapositive",
		// width in pixels = ..._SIZE * 35
		SS_SIZE: 2,
		SS_OK: "OK",
		// width in pixels = ..._SIZE * 35
		SS_OK_SIZE: 2,
		SECONDS: "Seconde",
		// auto standby (aka sleep mode)
		AUTOSTANDBY: "Mode veille",
		AS_ON: "Oui",
		AS_OFF: "Non",
		AS_TURN: "Turn",
		// width in pixels = ..._SIZE * 35
		AS_SIZE: 2,
		AS_OK: "OK",
		// width in pixels = ..._SIZE * 35
		AS_OK_SIZE: 2,
		// about
		ABOUT: "A propos de Reader",
		// reset to factory settings
		RESET_TO_FACTORY: "Restaurer les paramètres par défaut",


		// In Advanced Settings
		ADVANCED_SETTINGS: "Paramètres avancés",
		// screen lock (aka device lock)
		SCREEN_LOCK: "Verrouillage de l'appareil",
		SL_OFF: "Oui",
		SL_ON: "Non",
		SL_CODE: "Entrez le code",
		SL_TURN: "Activation",
		// width in pixels = ..._SIZE * 35
		SL_SIZE: 2,
		SL_OK: "OK",
		SL_OK_SIZE: 2,
		SL_OK_UNLOCK: "OK",
		// unlock
		// width in pixels = ..._SIZE * 35
		SL_OK_UNLOCK_SIZE: 2,
		// format device
		FORMAT_DEVICE: "Formatage de la Mémoire Interne",

		// In Book menu
		BEGIN: "Début",
		END: "Fin",
		BOOKMARKS: "Signets",
		CONTENTS: "Table des matières",
		HISTORY: "Historique",
		INFO: "Infos",
		UTILITIES: "Utilitaires",

		// In Book Utilities
		REMOVE_ALL_BOOKMARKS: "Supprimer tous les signets",
		CLEAR_HISTORY: "Supprimer l'historique",
		DELETE_BOOK: "Supprimer le livre",

		// In Books by Date
		TODAY: "Aujourd'hui",
		EARLIER_THIS_WEEK: "Plus tôt cette semaine",
		LAST_WEEK: "La semaine dernière",
		EARLIER_THIS_MONTH: "Plus tôt ce mois-ci",
		LAST_MONTH: "Mois dernier",
		EARLIER_THIS_QUARTER: "Plus tôt ce trimestre",
		LAST_QUARTER: "Dernier trimestre",
		EARLIER_THIS_YEAR: "Plus tôt cette année",
		LAST_YEAR: "Année dernière",
		OLDER: "Plus",

		PAGE: "Page",
		PART: "Partie",
		OF: "de",
		NO_BOOK: "Aucun livre",
		NO_SONG: "Pas de chanson",

		// Info title strings, comma separated, no spaces after comma
		INFO_TITLES: "Couverture,Titre,Auteur,Éditeur,Catégorie,eBook ID,Type,Date,Taille,Emplacement,Fichier,Droits numériques,Expiration",

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
		TITLE_0: "Autres",
		CRITERION_0: ""
	},

	CoreLang: {
		TITLE: "Emplacement",
		COMMENT: "Nécessite un redémarrage",
		OPTION_LANG: "Langue",

		OPTION_DATE_FORMAT: "Format de Date",
		VALUE_DEFAULT_DATE: "Par défaut",
		ddMMMYY: "31/Jan/99",
		ddMONTHYY: "31/Janvier/99",
		ddMMMYYYY: "31/Jan/1999",
		ddMONTHYYYY: "31/Janvier/1999",

		OPTION_DATE_SEPARATOR: "Séparateur de date",
		VALUE_SPACE: "Espace",
		VALUE_NONE: "Aucun",

		MONTH_SHORT_1: "Janv",
		MONTH_SHORT_2: "Févr",
		MONTH_SHORT_3: "Mars",
		MONTH_SHORT_4: "Avr",
		MONTH_SHORT_5: "Mai",
		MONTH_SHORT_6: "Juin",
		MONTH_SHORT_7: "Juil",
		MONTH_SHORT_8: "Août",
		MONTH_SHORT_9: "Sept",
		MONTH_SHORT_10: "Oct",
		MONTH_SHORT_11: "Nov",
		MONTH_SHORT_12: "Déc",

		MONTH_1: "Janvier",
		MONTH_2: "Février",
		MONTH_3: "Mars",
		MONTH_4: "Avril",
		MONTH_5: "Mai",
		MONTH_6: "Juin",
		MONTH_7: "Juillet",
		MONTH_8: "Août",
		MONTH_9: "Septembre",
		MONTH_10: "Octobre",
		MONTH_11: "Novembre",
		MONTH_12: "Décembre"
	}	
};
