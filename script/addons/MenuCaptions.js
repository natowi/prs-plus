// Name: Unified Menu Captions
// Description: Allows to choose caption style in menus
// Author: kartu
//
// History:
//	2010-03-07 kartu - #Prepared for localization
//	2010-03-14 kartu - #Refactored Utils -> Core
//	2010-03-14 kartu - Localized
//	2010-04-25 kartu - Marked onInit as constructor
//	2010-04-27 kravitz - Joined "menu" settings group

tmp = function() {
	var L = Core.lang.getLocalizer("MenuCaptions");

	var MenuCaptions = {
		name: "MenuCaptions",
		settingsGroup: "menu",
		/**
		* @constructor
		*/
		onInit: function () {
			var styles = Core.system.getSoValue(kbook.tableData, "table.skin.styles");
			this.big = styles[2];
			this.small = styles[3];
			this.onSettingsChanged();
		},
		onSettingsChanged: function () {
			var styles = Core.system.getSoValue(kbook.tableData, "table.skin.styles");
			switch (MenuCaptions.options.style) {
				case "def":
					styles[2] = MenuCaptions.big;
					styles[3] = MenuCaptions.small;
					break;
				case "big":
					styles[2] = MenuCaptions.big;
					styles[3] = MenuCaptions.big;
					break;
				case "small": // fallthrough
				default:
					styles[2] = MenuCaptions.small;
					styles[3] = MenuCaptions.small;
					break;
			}
		},
		optionDefs: [
			{
				name: "style",
				title: L("OPTION_STYLE"),
				icon: "LIST",
				defaultValue: "small",
				values:	["def", "small" , "big"],
				valueTitles: {
					def: L("VALUE_SONY_DEFAULT"),
					small: L("VALUE_ALWAYS_SMALL"),
					big: L("VALUE_ALWAYS_BIG")
				}
			}
		]
	};

	Core.addAddon(MenuCaptions);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in MenuCaptions.js", e);
}
