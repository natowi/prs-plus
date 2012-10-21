return {
	X: {
		BOOKS: ["本", "1 本", "无"],
		SETTINGS: ["项", "1 项", "无"],
		PAGES: ["页", "1 页", "无"],
		PICTURES: ["张", "1 张", "无"],
		SONGS: ["首", "1 首", "无"],
		BOOKMARKS: ["项", "1 项", "无"],
		COLLECTIONS: ["项", "1 项", "无"],
		ITEMS: ["项", "1 项", "无"]
	},
	
	// Standard stuff
	Sony: {
		// USB connected
		DO_NOT_DISCONNECT: "请不要断开",
		USB_CONNECTED: "已连接USB",
		DEVICE_LOCKED: "设备被锁定",

		// About, translate either all or none
		ABOUT_PRSP: "PRS+ @@@firmware@@@\n" + "Author: Mikheil Sukhiashvili aka kartu (kartu3@gmail.com) using work of: " + "igorsk, boroda, obelix, pepak, kravitz and others.\n" + "© GNU Lesser General Public License.",
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
		RICH_TEXT_FORMAT: "RTF格式",
		ADOBE_PDF: "Adobe PDF",
		EPUB_DOCUMENT: "EPUB格式",
		BBEB_BOOK: "BBeB格式",
		PLAIN_TEXT: "纯文本格式",
		INTERNAL_MEMORY: "内部存储",
		MEMORY_STICK: "Sony记忆棒",
		SD_CARD: "SD卡",

		// Main.xml & kbook.so stuff
		INVALID_FORMAT: "文件格式无法识别！",
		FORMATTING: "正在排版...",
		LOADING: "加载中...",
		LOW_BATTERY: "电量过低！",
		HR_WARNING: "您要删除所有内容,恢复出厂设置,清除DRM数字版权保护信息吗?\n\n是 - 按 5\n否 - 按 MENU",
		DEVICE_SHUTDOWN: "关闭设备",
		PRESS_MARK_TO_SHUTDOWN: "按MARK键",
		THIS_DEVICE: "关闭此设备",
		PRESS_MARK_TO_DELETE: "按MARK键",
		THIS_BOOK: "开始删除",
		FORMAT_INTERNAL_MEMORY: "格式化内部存储",
		PRESS_MARK_TO_FORMAT: "按MARK键开始",
		MSG_INTERNAL_MEMORY: "格式化内部存储",
		RESTORE_DEFAULTS: "恢复缺省设置",
		PRESS_MARK_TO_RESTORE: "按MARK键开始",
		DEFAULT_SETTINGS: "恢复缺省设置",
		UPPER_PAGE: "PAGE",
		ONE_OF_ONE: "1 of 1",
		NO_BATTERY: "没有电！",
		FORMATTING_INTERNAL_MEMORY: "正在格式化内部存储...",
		SHUTTING_DOWN: "正在关闭设备...",

		// Root menu
		CONTINUE: "继续上次阅读",
		BOOKS_BY_TITLE: "按标题排序",
		BOOKS_BY_AUTHOR: "按作者排序",
		BOOKS_BY_DATE: "按日期排序",
		COLLECTIONS: "分类",
		ALL_BOOKMARKS: "书签",
		NOW_PLAYING: "正在播放",
		MUSIC: "音乐",
		PICTURES: "图片",
		SETTINGS: "配置选项",

		// In Settings
		// orientation
		ORIENTATION: "显示方向",
		HORIZONTAL: "横向",
		VERTICAL: "竖向",
		// set date
		SET_DATE: "设置日期",
		YEAR: "年",
		MONTH: "月",
		DATE: "日",
		// Day
		HOUR: "时",
		MINUTE: "分",
		SETDATE_OK: "确认",
		// width in pixels = ..._SIZE * 35
		SETDATE_OK_SIZE: 3,
		// slideshow
		SLIDESHOW: "幻灯片",
		SS_ON: "开",
		SS_OFF: "关",
		SS_TURN: "开关",
		SS_DURATION: "每张图片显示",
		// width in pixels = ..._SIZE * 35
		SS_SIZE: 2,
		SS_OK: "确认",
		// width in pixels = ..._SIZE * 35
		SS_OK_SIZE: 3,
		SECONDS: "秒",
		// auto standby (aka sleep mode)
		AUTOSTANDBY: "休眠模式",
		AS_ON: "开",
		AS_OFF: "关",
		AS_TURN: "开关",
		// width in pixels = ..._SIZE * 35
		AS_SIZE: 2,
		AS_OK: "确认",
		// width in pixels = ..._SIZE * 35
		AS_OK_SIZE: 3,
		// about
		ABOUT: "关于",
		// reset to factory settings
		RESET_TO_FACTORY: "恢复出厂设置",

		// In Advanced Settings
		ADVANCED_SETTINGS: "高级选项",
		// screen lock (aka device lock)
		SCREEN_LOCK: "设备锁",
		SL_OFF: "关",
		SL_ON: "开",
		SL_CODE: "密码",
		SL_TURN: "开关",
		// width in pixels = ..._SIZE * 35
		SL_SIZE: 2,
		SL_OK: "确认",
		SL_OK_SIZE: 3,
		SL_OK_UNLOCK: "解锁",
		// unlock
		// width in pixels = ..._SIZE * 35
		SL_OK_UNLOCK_SIZE: 3,
		// format device
		FORMAT_DEVICE: "格式化内部存储",

		// In Book menu
		BEGIN: "起始页",
		END: "结束页",
		BOOKMARKS: "书签",
		CONTENTS: "目录",
		HISTORY: "阅读历史",
		INFO: "信息",
		UTILITIES: "工具",

		// In Book Utilities
		REMOVE_ALL_BOOKMARKS: "删除所有书签",
		CLEAR_HISTORY: "清除阅读历史",
		DELETE_BOOK: "删除本书",

		// In Books by Date
		TODAY: "今天",
		EARLIER_THIS_WEEK: "本周早期",
		LAST_WEEK: "上周",
		EARLIER_THIS_MONTH: "本月早期",
		LAST_MONTH: "上月",
		EARLIER_THIS_QUARTER: "本季度早期",
		LAST_QUARTER: "上季度",
		EARLIER_THIS_YEAR: "本年度早期",
		LAST_YEAR: "去年",
		OLDER: "更早",

		PAGE: "第",
		PART: "段",
		OF: "共",
		NO_BOOK: "无",
		NO_SONG: "无",

		// Info title strings, comma separated, no spaces after comma
		//INFO_TITLES: "Cover,Title,Author,Publisher,Category,eBook ID,Kind,Date,Size,Location,File,Digital Rights,Expires",
		INFO_TITLES: "封面,标题,作者,发布者,类型,电子书ID,文件类型,日期,文件大小,存放位置,文件路径,数字版权保护,失效时间",

		// Titles and criterions for "Books by Title" and "Books by Folder"
		// title is displayed, "criterion" is used for sorting.
		//
		// NOTE: if localization doesn't need custom Books by sorting, just remove CUSTOM_SORT, TITLE_*, CRITERION_* items
		CUSTOM_SORT: false,
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
		TITLE: "区域与语言",
		COMMENT: "重启生效！",
		OPTION_LANG: "界面语言",

		OPTION_DATE_FORMAT: "日期格式",
		VALUE_DEFAULT_DATE: "缺省",
		ddMMMYY: "31/Jan/99",
		ddMONTHYY: "31/January/99",
		ddMMMYYYY: "31/Jan/1999",
		ddMONTHYYYY: "31/January/1999",

		OPTION_DATE_SEPARATOR: "日期分隔符",
		VALUE_SPACE: "空格",
		VALUE_NONE: "无",

		MONTH_SHORT_1: "一月",
		MONTH_SHORT_2: "二月",
		MONTH_SHORT_3: "三月",
		MONTH_SHORT_4: "四月",
		MONTH_SHORT_5: "五月",
		MONTH_SHORT_6: "六月",
		MONTH_SHORT_7: "七月",
		MONTH_SHORT_8: "八月",
		MONTH_SHORT_9: "九月",
		MONTH_SHORT_10: "十月",
		MONTH_SHORT_11: "十一月",
		MONTH_SHORT_12: "十二月",

		MONTH_1: "一月",
		MONTH_2: "二月",
		MONTH_3: "三月",
		MONTH_4: "四月",
		MONTH_5: "五月",
		MONTH_6: "六月",
		MONTH_7: "七月",
		MONTH_8: "八月",
		MONTH_9: "九月",
		MONTH_10: "十月",
		MONTH_11: "十一月",
		MONTH_12: "十二月"
	}	
};
