// Name: Text Scale
// Description: Options to set default text scale and to disable scale steps
// Author: kravitz
//
// History:
//	2010-04-27 kravitz - Initial version
//	2010-05-11 kartu - Fixed EPUB zoom. Still has side effects: utils -> clear history resets zoom
//	2010-05-11 kartu - Changed it, so that addon doesn't hook unless needed. 
//				Fixed === 0 bugs introduced in previous commit.
//	2012-06-23 drMerry - Added Global translation
//	2012-06-23 drMerry - Added var declaration at top of file
//	2012-12-02 Mark Nord - removed skip size (replaced by doSize-PopUp), removed Fskin.kbookPage.doSize() reassign
//
// Note(s):
//	- Reassigns original kbook.model.onChangeBookCallback()
//
// TODO:
//	- Add TEXT_SCALE icon (ex. magnifier)

tmp = function() {
	// declare var
	var log, getSoValue, setSoValue, getFastBookMedia, L, LG, SCALE_SMALL, SCALE_MEDIUM, SCALE_LARGE, TextScale, SMALL, ENABLED, DISABLED, MEDIUM, LARGE, oldOnChangeBookCallback, onChangeBookCallback,  areSettingsDefault, doHook;
	// Shortcuts
	log = Core.log.getLogger("TextScale");
	getSoValue = Core.system.getSoValue;
	setSoValue = Core.system.setSoValue;
	getFastBookMedia = Core.system.getFastBookMedia;

	// Localize
	L = Core.lang.getLocalizer("TextScale");
	LG = Core.lang.getLocalizer("Global");

	// Scale values
	SCALE_SMALL = 0;
	SCALE_MEDIUM = 1;
	SCALE_LARGE = 2;

	// Strings
	ENABLED = LG("VALUE_ENABLED");
	DISABLED = LG("VALUE_DISABLED");
	SMALL = L("VALUE_SMALL");
	MEDIUM = L("VALUE_MEDIUM");
	LARGE = L("VALUE_LARGE");

	// This addon
	TextScale = {
		name: "TextScale",
		settingsGroup: "viewer",
		optionDefs: [
		{
			name: "scaleDefault",
			title: L("OPTION_SCALE_DEFAULT"),
			icon: "TEXT_SCALE",
			defaultValue: SCALE_SMALL,
			values:	[SCALE_SMALL, SCALE_MEDIUM, SCALE_LARGE],
			valueTitles: {
				0: SMALL,
				1: MEDIUM,
				2: LARGE
			}
		}]
	};

	oldOnChangeBookCallback = kbook.model.onChangeBookCallback;
	onChangeBookCallback = function () {
		try {
			if (this.currentBook) {
				var media = getFastBookMedia(this.currentBook);
				// EPUBs don't have layouts, so we have to check history
				// as a side effect, utils -> clear history will also reset zoom 
				if (getSoValue(media, "layouts").length === 0 && getSoValue(media, "history").length === 0) {
					// Book is opened for the first time - set default scale
					setSoValue(media, "scale", TextScale.options.scaleDefault);
				}
			}
		} catch (e) {
			log.error("onChangeBookCallback(): " + e);
		}
		oldOnChangeBookCallback.apply(this, arguments);
	};
	
	// Hooks doSize and onChangeBookCallback
	// Is safe to call more than once
	doHook = function() {
		kbook.model.onChangeBookCallback = onChangeBookCallback;
	};
	
	areSettingsDefault = function() {
		var options = TextScale.options;
		return options !== undefined && options.scaleDefault == SCALE_SMALL;
	};

	TextScale.onInit = function() {
		if (!areSettingsDefault()) {
			doHook();
		}
	};
	
	TextScale.onSettingsChanged = function (propertyName, oldValue, newValue) {
		if (oldValue === newValue) {
			return;
		}
		if (propertyName === "scaleDefault") {
			this.options[newValue] = 1;
		} 
		if (!areSettingsDefault()) {
			doHook();
		}
	};

	Core.addAddon(TextScale);
};

try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in TextScale.js", e);
}