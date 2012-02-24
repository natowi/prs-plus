// Name: Non-Unicode text encoding
// Description: Allows to choose between Latin / win1251 (Russian) encodings
// Author: kartu
//
// History:
//	2010-03-04 kartu - Initial version
//	2010-03-14 kartu - #Refactored Utils -> Core
//	2010-04-17 kartu - Moved global vars into local functions context
//	2010-04-24 kartu - Prepared for merging into single JS
//	2010-04-25 kartu - Marked onPreInit as constructor
//	2010-04-27 kravitz - Joined "viewer" settings group
//	2011-05-16 kartu - Replaced addon's "MSG_RESTART" with core's

// dummy function, to avoid introducing global vars
tmp = function () {
	var L = Core.lang.getLocalizer("TextEncoding");

	Core.addAddon({
		name: "TextEncoding",
		settingsGroup: "viewer",
		/**
		* @constructor
		*/
		onPreInit: function() {
			this.optionDefs = [
				{
					name: "encoding",
					title: L("OPTION_TITLE"),
					icon: "BOOK",
					defaultValue: "___latin___",
					values:	["___latin___", "___win1251___"],
					valueTitles: {
						___latin___: L("LATIN"),
						___win1251___: L("RUSSIAN")
					}
				}
			];
		},
		onSettingsChanged: function (propertyName, oldValue, newValue) {
			if (oldValue === newValue) {
				return;
			}
			Core.ui.showMsg([Core.lang.L("MSG_RESTART")]);
		}
	});
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in TextEncoding.js", e);
}
