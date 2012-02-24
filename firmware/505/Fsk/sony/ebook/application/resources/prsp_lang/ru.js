return {
	X: {
		BOOKS: ["книга", "книги", "книг", "Пусто"],
		SETTINGS: ["настройка", "настройки", "настроек", "Пусто"],
		PAGES: ["страница", "страницы", "страниц", "Пусто"],
		PICTURES: ["изображение", "изображения", "изображений", "Пусто"],
		SONGS: ["песня", "песни", "песен", "Пусто"],
		BOOKMARKS: ["закладка", "закладки", "закладок", "Пусто"],
		COLLECTIONS: ["коллекция", "коллекции", "коллекций", "Пусто"],
		ITEMS: ["пункт", "пункта", "пунктов", "Пусто"]
	},

	// Standard stuff
	Sony: {
		// USB connected
		DO_NOT_DISCONNECT: "Не отсоединяйте устройство",
		USB_CONNECTED: "USB подключен",
		DEVICE_LOCKED: "Устройство заблокировано",

		// About, translate either all or none
		ABOUT_1: "Авторские права ©2006-2008 Sony Corporation",
		ABOUT_2: "Adobe, логотип Adobe, Reader и PDF являются зарегистрированными торговыми" + " марками или торговыми марками Adobe Systems Incorporated в США и/или других странах.",
		ABOUT_3: "Технология аудио-кодирования MPEG Layer-3 и патенты лицензированы Fraunhofer IIS и Thomson." + " Технология аудио-кодирования MPEG-4 AAC лицензирована Fraunhofer IIS (www.iis.fraunhofer.de/amm/).",
		ABOUT_4: "Программное обеспечение разработано и внедрено Kinoma (www.kinoma.com). Авторские права ©2006,2007 Kinoma, Inc.",
		ABOUT_5: "Bitstream является зарегистрированной торговой маркой; Dutch, Font Fusion, и Swiss являются торговыми марками Bitstream, Inc.",
		ABOUT_6: "Авторские права на часть программ принадлежат ©2005 The FreeType Project (www.freetype.org). Все права защищены.",
		ABOUT_7: "Программное обеспечение использует часть работ Independent JPEG Group.",
		AUTHORIZED_SONY: "\nАвторизован для eBook Store.",
		NOT_AUTHORIZED_SONY: "\nНе авторизован для eBook Store.",
		AUTHORIZED_ADOBE: "\nАвторизован для защищенных материалов Adobe DRM.",
		NOT_AUTHORIZED_ADOBE: "\nНе авторизован для защищенных материалов Adobe DRM.",
		SONY_FW_VERSION: "Версия",
		DEVICE_ID: "Устройство",

		// Mime & card names
		RICH_TEXT_FORMAT: "Rich Text Format",
		ADOBE_PDF: "Adobe PDF",
		EPUB_DOCUMENT: "Документ EPUB",
		BBEB_BOOK: "Книга BBeB",
		PLAIN_TEXT: "Обычный текст",
		INTERNAL_MEMORY: "Внутренняя память",
		MEMORY_STICK: "Memory Stick",
		SD_CARD: "SD Memory",

		// Main.xml & kbook.so stuff
		INVALID_FORMAT: "Неверный формат!",
		FORMATTING: "Форматирую...",
		LOADING: "Загружаю...",
		LOW_BATTERY: "Батарея разряжена!",
		HR_WARNING: "Вы готовы УДАЛИТЬ всё содержимое ридера, восстановить заводские настройки, и очистить состояние защищенного содержимого?\n\nДа - нажмите 5\nНет - нажмите «меню»",
		DEVICE_SHUTDOWN: "Отключение ридера",
		PRESS_MARK_TO_SHUTDOWN: "Нажмите «закладки» для",
		THIS_DEVICE: "полного отключения",
		PRESS_MARK_TO_DELETE: "Нажмите «закладки» для",
		THIS_BOOK: "удаления книги",
		FORMAT_INTERNAL_MEMORY: "Форматировать память",
		PRESS_MARK_TO_FORMAT: "Нажмите «закладки» для",
		MSG_INTERNAL_MEMORY: "начала форматирования",
		RESTORE_DEFAULTS: "Сбросить все настройки",
		PRESS_MARK_TO_RESTORE: "Нажмите «закладки» для",
		DEFAULT_SETTINGS: "сброса всех настроек.",
		UPPER_PAGE: "СТР.",
		ONE_OF_ONE: "1 из 1",
		NO_BATTERY: "Батарея разряжена!",
		FORMATTING_INTERNAL_MEMORY: "Форматирую внутреннюю память...",
		SHUTTING_DOWN: "Отключаюсь...",

		// Root menu
		CONTINUE: "Продолжить чтение",
		BOOKS_BY_TITLE: "Книги по названию",
		BOOKS_BY_AUTHOR: "Книги по авторам",
		BOOKS_BY_DATE: "Книги по дате загрузки",
		COLLECTIONS: "Коллекции книг",
		ALL_BOOKMARKS: "Все закладки",
		NOW_PLAYING: "В эфире",
		MUSIC: "Аудио",
		PICTURES: "Изображения",
		SETTINGS: "Настройки",

		// In Settings
		// orientation
		ORIENTATION: "Ориентация",
		HORIZONTAL: "Альбомная",
		VERTICAL: "Книжная",
		// set date
		SET_DATE: "Дата и время",
		YEAR: "Год",
		MONTH: "Месяц",
		DATE: "День",
		// Day
		HOUR: "Часы",
		MINUTE: "Минуты",
		SETDATE_OK: "Применить",
		// width in pixels = ..._SIZE * 35
		SETDATE_OK_SIZE: 7,
		// slideshow
		SLIDESHOW: "Показ слайдов",
		SS_ON: "Включён",
		SS_OFF: "Отключён",
		SS_TURN: "Состояние",
		SS_DURATION: "Длительность",
		// width in pixels = ..._SIZE * 35
		SS_SIZE: 7,
		SS_OK: "Применить",
		// width in pixels = ..._SIZE * 35
		SS_OK_SIZE: 7,
		SECONDS: "секунд",
		// auto standby (aka sleep mode)
		AUTOSTANDBY: "Спящий режим",
		AS_ON: "Включён",
		AS_OFF: "Отключён",
		AS_TURN: "Состояние",
		// width in pixels = ..._SIZE * 35
		AS_SIZE: 7,
		AS_OK: "Применить",
		// width in pixels = ..._SIZE * 35
		AS_OK_SIZE: 7,
		// about
		ABOUT: "О Ридере",
		// reset to factory settings
		RESET_TO_FACTORY: "Сброс на заводские настройки",


		// In Advanced Settings
		ADVANCED_SETTINGS: "Дополнительные настройки",
		// screen lock (aka device lock)
		SCREEN_LOCK: "Защита паролем",
		SL_OFF: "Отключено",
		SL_ON: "Включено",
		SL_CODE: "Пароль",
		SL_TURN: "Состояние",
		// width in pixels = ..._SIZE * 35
		SL_SIZE: 7,
		SL_OK: "Применить",
		SL_OK_SIZE: 7,
		SL_OK_UNLOCK: "Открыть",
		// unlock
		// width in pixels = ..._SIZE * 35
		SL_OK_UNLOCK_SIZE: 7,
		// format device
		FORMAT_DEVICE: "Форматировать внутреннюю память",

		// In Book menu
		BEGIN: "В начало",
		END: "В конец",
		BOOKMARKS: "Закладки",
		CONTENTS: "Оглавление",
		HISTORY: "Журнал",
		INFO: "Информация",
		UTILITIES: "Инструменты",

		// In Book Utilities
		REMOVE_ALL_BOOKMARKS: "Удалить все закладки",
		CLEAR_HISTORY: "Очистить журнал",
		DELETE_BOOK: "Удалить книгу",

		// In Books by Date
		TODAY: "Сегодня",
		EARLIER_THIS_WEEK: "С начала недели",
		LAST_WEEK: "За прошлую неделю",
		EARLIER_THIS_MONTH: "С начала месяца",
		LAST_MONTH: "За прошлый месяц",
		EARLIER_THIS_QUARTER: "С начала квартала",
		LAST_QUARTER: "За прошлый квартал",
		EARLIER_THIS_YEAR: "С начала года",
		LAST_YEAR: "За прошлый год",
		OLDER: "Ещё ранее",

		PAGE: "Страница",
		PART: "Часть",
		OF: "из",
		NO_BOOK: "Пусто",
		NO_SONG: "Нет аудио",

		// Info title strings, comma separated, no spaces after comma
		INFO_TITLES: "Обложка,Название,Автор,Издатель,Жанр,eBook ID,Тип,Дата,Размер,Источник,Файл,Права,Истекают",

		// Titles and criterions for "Books by Title" and "Books by Folder"
		// title is displayed, "criterion" is used for sorting.
		//
		// NOTE: if localization doesn't need custom Books by sorting, just remove CUSTOM_SORT, TITLE_*, CRITERION_* items
		CUSTOM_SORT: true,
		TITLE_1: "0-9",
		CRITERION_1: "0123456789",
		TITLE_2: "А Б В Г",
		CRITERION_2: "АБВГабвг",
		TITLE_3: "Д Е Ж З",
		CRITERION_3: "ДЕЖЗдежз",
		TITLE_4: "И Й К Л",
		CRITERION_4: "ИЙКЛийкл",
		TITLE_5: "М Н О П",
		CRITERION_5: "МНОПмноп",
		TITLE_6: "Р С Т У",
		CRITERION_6: "РСТУрсту",
		TITLE_7: "Ф Х Ц Ч",
		CRITERION_7: "ФХЦЧфхцч",
		TITLE_8: "Ш Щ Ы",
		CRITERION_8: "ШЩЫшщы",
		TITLE_9: "Э Ю Я",
		CRITERION_9: "ЭЮЯэюя",
		TITLE_0: "Прочие",
		CRITERION_0: ""
	},

	CoreLang: {
		TITLE: "Региональные установки",
		COMMENT: "Требуется перезагрузка",
		OPTION_LANG: "Язык меню",

		OPTION_DATE_FORMAT: "Формат даты",
		VALUE_DEFAULT_DATE: "По умолчанию",
		ddMMMYY: "31/янв/99",
		ddMONTHYY: "31/января/99",
		ddMMMYYYY: "31/янв/1999",
		ddMONTHYYYY: "31/января/1999",

		OPTION_DATE_SEPARATOR: "Разделитель даты",
		VALUE_SPACE: "Пробел",
		VALUE_NONE: "Нет",

		MONTH_SHORT_1: "янв",
		MONTH_SHORT_2: "фев",
		MONTH_SHORT_3: "мар",
		MONTH_SHORT_4: "апр",
		MONTH_SHORT_5: "май",
		MONTH_SHORT_6: "июн",
		MONTH_SHORT_7: "июл",
		MONTH_SHORT_8: "авг",
		MONTH_SHORT_9: "сен",
		MONTH_SHORT_10: "окт",
		MONTH_SHORT_11: "ноя",
		MONTH_SHORT_12: "дек",

		MONTH_1: "январь",
		MONTH_2: "февраль",
		MONTH_3: "март",
		MONTH_4: "апрель",
		MONTH_5: "май",
		MONTH_6: "июнь",
		MONTH_7: "июль",
		MONTH_8: "август",
		MONTH_9: "сентябрь",
		MONTH_10: "октябрь",
		MONTH_11: "ноябрь",
		MONTH_12: "декабрь"
	}	
};
