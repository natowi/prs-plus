return {
	X: {
		BOOKS: ["libros", "1 libro", "Ningún libro"],
		SETTINGS: ["ajustes", "1 ajuste", "Ningún ajuste"],		
		PAGES: ["páginas", "1 página", "Ninguna página"],
		PICTURES: ["imágenes", "1 imagen", "Ninguna imagen"],
		SONGS: ["canciones", "1 canción", "Ninguna canción"],
		BOOKMARKS: ["marcadores", "1 marcador", "Ningún marcador"],
		COLLECTIONS: ["colecciones", "1 colección", "Ninguna colección"],
		ITEMS: ["elementos", "1 elemento", "Ningún elemento"]
	},

	// Standard stuff
	Sony: {
		// USB connected
		DO_NOT_DISCONNECT: "¡No Desconectar!",
		USB_CONNECTED: "USB conectado",
		DEVICE_LOCKED: "Dispositivo bloqueado",

		// About, translate either all or none
		ABOUT_PRSP: "PRS+ @@@firmware@@@\n" + "Autor: Mikheil Sukhiashvili aka kartu (kartu3@gmail.com) using work of: " + "igorsk, boroda, obelix, pepak, kravitz and others.\n" + "© GNU Lesser General Public License.",
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
		RICH_TEXT_FORMAT: "Texto de Formato Enriquecido (RTF)",
		ADOBE_PDF: "Adobe PDF",
		EPUB_DOCUMENT: "Documento EPUB",
		BBEB_BOOK: "Libro BBeB",
		PLAIN_TEXT: "Texto sin formato",
		INTERNAL_MEMORY: "Memoria Interna",
		MEMORY_STICK: "Memory Stick",
		SD_CARD: "Tarjeta SD",

		// Main.xml & kbook.so stuff
		INVALID_FORMAT: "Formato No Válido!",
		FORMATTING: "Formateando...",
		LOADING: "Cargando...",
		LOW_BATTERY: "¡Batería Baja!",
		HR_WARNING: "¿Quieres BORRAR todo el contenido y restaurar los ajustes iniciales y el estado de la autorización del DRM?\n\nSi - Pulsa 5\nNo - Pulsa MENU",
		DEVICE_SHUTDOWN: "Apagar Dispositivo",
		PRESS_MARK_TO_SHUTDOWN: "Pulsa MARK para",
		THIS_DEVICE: "apagar lector.",
		PRESS_MARK_TO_DELETE: "Pulsa MARK para",
		THIS_BOOK: "borrar libro.",
		FORMAT_INTERNAL_MEMORY: "Formatear Memoria Interna",
		PRESS_MARK_TO_FORMAT: "Pulsa MARK para formatear",
		MSG_INTERNAL_MEMORY: "memoria interna.",
		RESTORE_DEFAULTS: "Ajustes Iniciales",
		PRESS_MARK_TO_RESTORE: "Pulsa MARK para restaurar",
		DEFAULT_SETTINGS: "ajustes iniciales.",
		UPPER_PAGE: "PÁGINA",
		ONE_OF_ONE: "1 de 1",
		NO_BATTERY: "¡Sin Batería!",
		FORMATTING_INTERNAL_MEMORY: "Formateando Memoria Interna...",
		SHUTTING_DOWN: "Apagando...",

		// Root menu
		CONTINUE: "Continuar Leyendo",
		BOOKS_BY_TITLE: "Libros por Título",
		BOOKS_BY_AUTHOR: "Libros por Autor",
		BOOKS_BY_DATE: "Libros por Fecha",
		COLLECTIONS: "Colecciones",
		ALL_BOOKMARKS: "Marcadores",
		NOW_PLAYING: "Reproduciendo Ahora",
		MUSIC: "Audio",
		PICTURES: "Imágenes",
		SETTINGS: "Ajustes",

		// In Settings
		// orientation
		ORIENTATION: "Orientación",
		HORIZONTAL: "Horizontal",
		VERTICAL: "Vertical",
		// set date
		SET_DATE: "Fecha y Hora",
		YEAR: "Año",
		MONTH: "Mes",
		DATE: "Día",
		// Day
		HOUR: "Hora",
		MINUTE: "Minuto",
		SETDATE_OK: "OK",
		// width in pixels = ..._SIZE * 35
		SETDATE_OK_SIZE: 2,
		// slideshow
		SLIDESHOW: "Modo Diapositivas",
		SS_ON: "Activado",
		SS_OFF: "Desactivado",
		SS_TURN: "Estado",
		SS_DURATION: "Duración",
		// width in pixels = ..._SIZE * 35
		SS_SIZE: 6,
		SS_OK: "OK",
		// width in pixels = ..._SIZE * 35
		SS_OK_SIZE: 2,
		SECONDS: "Segundos",
		// auto standby (aka sleep mode)
		AUTOSTANDBY: "Modo Reposo",
		AS_ON: "Activado",
		AS_OFF: "Desactivado",
		AS_TURN: "Estado",
		// width in pixels = ..._SIZE * 35
		AS_SIZE: 6,
		AS_OK: "OK",
		// width in pixels = ..._SIZE * 35
		AS_OK_SIZE: 2,
		// about
		ABOUT: "Acerca del Reader",
		// reset to factory settings
		RESET_TO_FACTORY: "Ajustes Iniciales",

		// In Advanced Settings
		ADVANCED_SETTINGS: "Ajustes Avanzados",
		// screen lock (aka device lock)
		SCREEN_LOCK: "Bloqueo Dispositivo",
		SL_OFF: "Desactivado",
		SL_ON: "Activado",
		SL_CODE: "Código",
		SL_TURN: "Estado",
		// width in pixels = ..._SIZE * 35
		SL_SIZE: 6,
		SL_OK: "OK",
		SL_OK_SIZE: 2,
		SL_OK_UNLOCK: "OK",
		// unlock
		// width in pixels = ..._SIZE * 35
		SL_OK_UNLOCK_SIZE: 2,
		// format device
		FORMAT_DEVICE: "Formatear Dispositivo",

		// In Book menu
		BEGIN: "Inicio",
		END: "Final",
		BOOKMARKS: "Marcadores",
		CONTENTS: "Tabla de contenidos",
		HISTORY: "Historial",
		INFO: "Información",
		UTILITIES: "Utilidades",

		// In Book Utilities
		REMOVE_ALL_BOOKMARKS: "Eliminar Marcadores",
		CLEAR_HISTORY: "Borrar Historial",
		DELETE_BOOK: "Borrar Libro",

		// In Books by Date
		TODAY: "Hoy",
		EARLIER_THIS_WEEK: "Primeros de Esta Semana",
		LAST_WEEK: "La Semana Pasada",
		EARLIER_THIS_MONTH: "Primeros de Este Mes",
		LAST_MONTH: "El Mes Pasado",
		EARLIER_THIS_QUARTER: "Primeros de Este Trimestre",
		LAST_QUARTER: "Último Trimestre",
		EARLIER_THIS_YEAR: "Primeros de Este Año",
		LAST_YEAR: "El Año Pasado",
		OLDER: "Más Antiguo",

		PAGE: "Página",
		PART: "Parte",
		OF: "de",
		NO_BOOK: "Ningún libro",
		NO_SONG: "Ninguna canción",

		// Info title strings, comma separated, no spaces after comma
		INFO_TITLES: "Cubierta,Título,Autor,Editorial,Categoría,ID eBook,Tipo,Fecha,Tamaño,Ubicación,Archivo,Derechos Digitales,Caducidad",

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
		TITLE_0: "Otro",
		CRITERION_0: ""
	},

	CoreLang: {
		TITLE: "Localización",
		COMMENT: "Requiere reinicio", //modificado 
		OPTION_LANG: "Idioma",

		OPTION_DATE_FORMAT: "Formato fecha",
		VALUE_DEFAULT_DATE: "Por defecto",
		ddMMMYY: "31/Ene/99",
		ddMONTHYY: "31/Enero/99",
		ddMMMYYYY: "31/Ene/1999",
		ddMONTHYYYY: "31/Enero/1999",

		OPTION_DATE_SEPARATOR: "Separador fecha",
		VALUE_SPACE: "Espacio",
		VALUE_NONE: "Ninguno",

		MONTH_SHORT_1: "Ene",
		MONTH_SHORT_2: "Feb",
		MONTH_SHORT_3: "Mar",
		MONTH_SHORT_4: "Abr",
		MONTH_SHORT_5: "May",
		MONTH_SHORT_6: "Jun",
		MONTH_SHORT_7: "Jul",
		MONTH_SHORT_8: "Ago",
		MONTH_SHORT_9: "Sep",
		MONTH_SHORT_10: "Oct",
		MONTH_SHORT_11: "Nov",
		MONTH_SHORT_12: "Dic",

		MONTH_1: "Enero",
		MONTH_2: "Febrero",
		MONTH_3: "Marzo",
		MONTH_4: "Abril",
		MONTH_5: "Mayo",
		MONTH_6: "Junio",
		MONTH_7: "Julio",
		MONTH_8: "Agosto",
		MONTH_9: "Septiembre",
		MONTH_10: "Octubre",
		MONTH_11: "Noviembre",
		MONTH_12: "Diciembre"
	}	
};
