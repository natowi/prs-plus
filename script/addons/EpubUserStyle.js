// Name: EpubUserStyle
// Description: Allows to choose switch between epub .css styles
// Author: kartu
//
// History:
//	2010-03-05 kartu - Initial version
//	2010-03-11 kartu - Fixed minot bug (iterating over non existing folder)
//	2010-03-14 kartu - Refactored Utils -> Core
//	2010-03-14 kartu - Localized
//	2010-04-24 kartu - Prepared for merging into single JS
//	2010-04-25 kartu - Marked onPreInit as constructor
//	2010-04-27 kravitz - Joined "viewer" settings group
//	2010-04-28 kravitz - Fixed user .css files path
//	2010-11-30 kartu - Refactoring Core.stirng => Core.text
//	2011-02-07 kartu - Added Core.config.userCSSFile support (instead of hardcoded style.css)
//	2011-11-20 kartu - Added sorting to CSS files
//	2011-12-07 quisvir - Added automatic epub reloading & action to change CSS from within book
//  2011-12-08 Mark Nord - Use of Core.ui.getCurrentNode in "action"

tmp = function() {
	var L, endsWith, USER_CSS, DISABLED, EpubUserStyle;
	// Localize
	L = Core.lang.getLocalizer("EpubUserStyle");
	endsWith = Core.text.endsWith;

	// Constants
	USER_CSS = Core.config.userCSSFile;
	if (USER_CSS === undefined) {
		USER_CSS = "style.css";
	}
	DISABLED = "disabled";

	EpubUserStyle = {
		name: "EpubUserStyle",
		settingsGroup: "viewer",
		optionDefs: [
			{
				name: "epubCssFile",
				title: L("OPTION_EPUB_CSS_FILE"),
				icon: "FONT",
				defaultValue: DISABLED,
				values: [DISABLED],
				valueTitles: {
					disabled: L("VALUE_DISABLED")
				}
			}
		],
		/**
		* @constructor
		*/
		onPreInit : function () {
			var i, n, od, path, cssFiles;
			this.root = Core.config.userCSSPath;

			// Init epubCssFile values
			if (!FileSystem.getFileInfo(this.root)) {
				// epub folder doesn't exist, nothing to do
				return;
			}
			
			// Load available list of CSS files and use it as option values 
			cssFiles = Core.io.listFiles(this.root, ".css"); // loads sorted list
			od = this.optionDefs[0];
			for (i = 0, n = cssFiles.length; i < n; i++) {
				path = cssFiles[i];
				if (path !== USER_CSS) {
					od.values.push(path);
					od.valueTitles[path]  = path;
				}
			}			
		},
		onSettingsChanged: function (propertyName, oldValue, newValue, object) {
			var current, password;
			if (newValue === DISABLED) {
				FileSystem.deleteFile(EpubUserStyle.root + USER_CSS);
			} else {
				Core.io.copyFile(EpubUserStyle.root + newValue, EpubUserStyle.root + USER_CSS);
			}
			// Reload current book if it is an epub file
			current = kbook.model.currentBook;
			if (current && current.media.mime === 'application/epub+zip') {
				current.media.close(kbook.bookData);
				kbook.bookData.setData(null);
				password = (kbook.model.protectedBookInfo) ? kbook.model.protectedBookInfo.password : null; // only used on x50
				current.media.load(current.cache, kbook.model, kbook.model.onChangeBookCallback, password);
			}
		},
		actions: [{
			name: 'ChangeEpubCSS',
			title: L('OPTION_EPUB_CSS_FILE'),
			group: 'Book',
			icon: 'FONT',
			action: function () {
				// Attach temporary setting node to currentNode; epub reload is handled by onSettingsChanged
				var currentNode = Core.ui.getCurrentNode();           
				Core.addonByName.PRSPSettings.createSingleSetting(currentNode, this.addon.optionDefs[0], this.addon);
				currentNode.gotoNode(currentNode.nodes.pop(), kbook.model);
			}
		}]
	};

	Core.addAddon(EpubUserStyle);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in EpubUserStyle.js", e);
}
