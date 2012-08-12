// Name: Clock
// Description: Shows digital clock in the lower right corner in menu and page (reading book) views
// Author: kartu
//
// History:
//	2010-03-07 kartu - Prepared for localization
//	2010-03-14 kartu - Refactored Utils -> Core
//	2010-03-14 kartu - Localized
//	2010-04-24 kartu - Added localized title
//	2010-04-24 kartu - Prepared for single JS merge
//	2010-04-25 kartu - Marked updateDate as constructor
//	2010-07-21 kartu - Refactored as Statusbar "plugin"
//	2012-02-10 Ben Chenoweth - Remove leading '0' in 12 hour mode

tmp = function () {
	var L = Core.lang.getLocalizer("StatusBar_Clock");
	var log = Core.log.getLogger("StatusBar_Clock");

	// Update date value
	var updateDate = function (tag) {
		try {
			var mode = StatusBar.options.clockMode;
			switch (mode) {
				case "all":
					break;
				case "menu": // fallthrough
				case "book":
					if (tag !== mode) {
						StatusBar.setTime();
						return;
					}
					break;
				case "off":
					StatusBar.setTime();
					return;
			}
			var time = new Date();
			var prefix = "0";
			var postfix = "";
			var hours = time.getHours();
			var minutes = time.getMinutes();
			if (StatusBar.options.clockStyle === "h12") {
				prefix = " ";
				postfix = L("AM");
				if (hours === 0) {
					hours = 12;
				} else if (hours > 11) {
					postfix = L("PM");
					if (hours > 12) {
						hours -= 12;
					}
				}
			}
			if (hours < 10) {hours = prefix + hours;}
			if (minutes < 10) {minutes = "0" + minutes;}
			StatusBar.setTime(hours + ":" + minutes + postfix);
		} catch (e) {
			log.error("in updateDate: " + e);
		}
	};

	var updateDateInMenu = function() {
		updateDate("menu");
	};
	var updateDateInBook = function() {
		updateDate("book");
	};
	
	StatusBar.addWidget({
		name: "Clock",
		onMenuPageChanged: updateDateInMenu,
		onBookPageChanged: updateDateInBook,
		optionDefs: [{
			groupTitle: L("TITLE"),
			groupIcon: "CLOCK",
			optionDefs: [{
						name: "clockStyle",
						title: L("OPTION_STYLE"),
						icon: "FOLDER",
						defaultValue: "h24",
						values: ["h24", "h12"],
						valueTitles: {
							h24: L("VALUE_24H"),
							h12: L("VALUE_12H")
						}
					},
					{
						name: "clockMode",
						title:	L("OPTION_MODE"),
						icon: "FOLDER",
						defaultValue: "all",
						values: ["all", "menu", "book", "off"],
						valueTitles: {
							all: L("VALUE_ALWAYS_SHOWN"), 
							menu: L("VALUE_SHOWN_ONLY_IN_MENU"),
							book: L("VALUE_SHOWN_WHEN_READING"),
							off: L("VALUE_OFF")
						}
					}]
		}],
		actions: [{
			name: "toggleClock",
			title: L("ACTION_TOGGLE_CLOCK"),
			group: "Utils",
			icon: "CLOCK",
			action: function (ignore, context, ignore2) {
				// Quick & dirty...
				if (StatusBar.options.clockMode === "all") {
					StatusBar.options.clockMode = "off";
				} else {
					StatusBar.options.clockMode = "all";
				}
				Core.settings.saveOptions(StatusBar);
				updateDate.call();
			}
		}]
	});
};

try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in Statusbar_Clock.js", e);
}