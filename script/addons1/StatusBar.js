// Name: Statusbar 
// Description: Provides access to statusbar controls, dispatches relevant events
// Author: kartu
//
// History:
//	2010-07-21 kartu - Initial version
//	2010-09-28 kartu - Adapted for 600 (MENU_GROUP => MENU_DETAILS_GROUP)
//	2010-11-27 kartu - Fixed #17 "clock is not updated when going from standby"
//	2011-02-05 kartu - Adapted for x50
//	2011-02-09 kartu - Fixed # Page index is not updated when book is opened
//	2011-12-20 quisvir - Added clock updates during apps/games
//	2011-12-22 qusivir - Changed to TIME.setValue for autorun, removed TIME.invalidate()
//	2012-01-06 quisvir - Added next/previous chapter actions

// Available to sub-addons
var StatusBar;

tmp = function() {
	var L, log, BOOK, PAGE_INFO, MENU, TIME, sandbox, widgets, updateMenu, updateBook, updateAutorun;
	L = Core.lang.getLocalizer("StatusBar");
	log = Core.log.getLogger("StatusBar");
	
	// not to type this gazillion times
	sandbox = kbook.model.container.sandbox;

	// FIXME model sniffing
	if (sandbox.MENU_GROUP) {
		MENU = sandbox.MENU_GROUP.sandbox.MENU;
	} else if (sandbox.MENU_DETAILS_GROUP) {
		MENU = sandbox.MENU_DETAILS_GROUP.sandbox.MENU;
	}
	if (sandbox.STATUS_GROUP.sandbox.STATUS_GROUP_SUB) {
		TIME = sandbox.STATUS_GROUP.sandbox.STATUS_GROUP_SUB.sandbox.STATUS_GROUP.sandbox.prspTime;
	} else {
		TIME = sandbox.STATUS_GROUP.sandbox.prspTime;
	}
	if (sandbox.PAGE_GROUP.sandbox.PAGE_SUBGROUP) {
		BOOK = sandbox.PAGE_GROUP.sandbox.PAGE_SUBGROUP.sandbox.PAGE;
		PAGE_INFO = sandbox.PAGE_GROUP.sandbox.PAGE_INFO.sandbox;
	} else {
		BOOK = sandbox.PAGE_GROUP.sandbox.PAGE;
	}
	if (PAGE_INFO === undefined) {
		PAGE_INFO = kbook.model;
	}


	// Statusbar widgets
	widgets = [];
	
	updateMenu = function() {
		Core.utils.callAll(widgets, MENU, undefined, "onMenuPageChanged");
	};
	
	updateBook = function() {
		Core.utils.callAll(widgets, BOOK, undefined, "onBookPageChanged");
	};
	
	updateAutorun = function() {
		if (kbook.model.STATE === 'AUTORUN') {
			widgets[0].onMenuPageChanged(); // Perhaps change to own property in widgets
		}
	};
	
	StatusBar = {
		name: "StatusBar",
		title: L("TITLE"),
		icon: "ABOUT",
		optionDefs: [],
		actions: [{
			name: "NextChapter",
			title: L("NEXT_CHAPTER"),
			icon: "NEXT_SONG",
			group: "Book",
			action: function () {
				widgets[1].jumpToNextChapter(BOOK);
			}
		},
		{
			name: "PreviousChapter",
			title: L("PREVIOUS_CHAPTER"),
			icon: "PREVIOUS_SONG",
			group: "Book",
			action: function () {
				widgets[1].jumpToPrevChapter(BOOK);
			}
		}],
		onPreInit: function() {
			var i, n, od, j, m;
			Core.utils.callAll(widgets, this, undefined, "onPreInit");

			// Add widgets' option definitions
			for (i = 0, n = widgets.length; i < n; i++) {
				od = widgets[i].optionDefs;
				if (od !== undefined) {
					for (j = 0, m = od.length; j < m; j++) {
						this.optionDefs.push (od[j]); // concat is also possible, yes
					}
				}
			}
		},
		setTime: function (value) {
			if (value === undefined) {
				value = "";
			}
			if (value !== TIME.getValue()) {
				// not to cause extra screen refresh (usual way would be to call setValue)
				if (kbook.model.STATE === 'AUTORUN') {
					TIME.setValue(value);
				} else {
					TIME.text = value;
				}
			}
		},
		setMenuIndex: function (value) {
			kbook.model.setVariable("MENU_INDEX_COUNT", value);
		},
		setBookIndex: function (value) {
			PAGE_INFO.setVariable("BOOK_INDEX_COUNT", value);
		},
		addWidget: function (widget) {
			widgets.push(widget);
		},
		onSettingsChanged: function () {
			Core.utils.callAll(widgets, this, undefined, "onSettingsChanged");
			updateMenu();
			updateBook();
		}
	};
	
	StatusBar.onInit = function () {
		// Subscribe to "page changed" events in both menu and book
		Core.events.subscribe(Core.events.EVENTS.BOOK_PAGE_CHANGED, updateBook);
		Core.events.subscribe(Core.events.EVENTS.MENU_PAGE_CHANGED, updateMenu);
		// Update when going back from standby
		Core.events.subscribe(Core.events.EVENTS.RESUME, updateMenu);
		// Subscribe to user actions for apps/games
		Core.events.subscribe(Core.events.EVENTS.KEY_EVENT, updateAutorun);
		Core.events.subscribe(Core.events.EVENTS.TOUCH_EVENT, updateAutorun);
	};
	
	Core.addAddon(StatusBar);
};

try {
	tmp();
	tmp = undefined;
} catch (e) {
	// Core's log
	log.error("in Statusbar.js", e);
}