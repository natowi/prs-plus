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
//
// Note(s):
//	- Reassigns original kbook.model.onChangeBookCallback()
//	- Reassigns original Fskin.kbookPage.doSize()
//
// TODO:
//	- Add TEXT_SCALE icon (ex. magnifier)

tmp = function() {
	// declare var
	var log, getSoValue, setSoValue, getFastBookMedia, L, LG, SCALE_SMALL, SCALE_MEDIUM, SCALE_LARGE, TextScale, SMALL, ENABLED, DISABLED, MEDIUM, LARGE, oldOnChangeBookCallback, onChangeBookCallback, doSize, areSettingsDefault, doHook;
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
		},
		{
			name: "0",
			title: SMALL,
			icon: "TEXT_SCALE",
			defaultValue: 1,
			values:	[1, 0],
			valueTitles: {
				1: ENABLED,
				0: DISABLED
			}
		},
		{
			name: "1",
			title: MEDIUM,
			icon: "TEXT_SCALE",
			defaultValue: 1,
			values:	[1, 0],
			valueTitles: {
				1: ENABLED,
				0: DISABLED
			}
		},
		{
			name: "2",
			title: LARGE,
			icon: "TEXT_SCALE",
			defaultValue: 1,
			values:	[1, 0],
			valueTitles: {
				1: ENABLED,
				0: DISABLED
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
	
	doSize = function () {
		try {
			var media, current, next, browseTo;
			media = getFastBookMedia(kbook.model.currentBook);
			//NOTE Original handler used kbook.bookData.textScale but it looks like the same
			current = getSoValue(media, "scale");
			// Find next enabled scale...
			next = (current == 2) ? 0 : current + 1; // get next
			if (TextScale.options[next] == 0) { // next is disabled
				next = (next == 2) ? 0 : next + 1; // get next
				if (TextScale.options[next] == 0) { // next is disabled
					// No more enabled scales
					return;
				}
			}
			// Set new scale
			browseTo = getSoValue(media, "browseTo");
			browseTo.call(media, kbook.bookData, undefined, undefined, undefined, next);
		} catch (e) {
			log.error("doSize(): " + e);
		}
	};
	
	// Hooks doSize and onChangeBookCallback
	// Is safe to call more than once
	doHook = function() {
		var kbookPage = getSoValue("Fskin.kbookPage");
		kbookPage.doSize = doSize;
		kbook.model.onChangeBookCallback = onChangeBookCallback;
	};
	
	areSettingsDefault = function() {
		var options = TextScale.options;
		return options !== undefined && options.scaleDefault == SCALE_SMALL && 
			options[0] == 1 && options[1] == 1 && options[2] == 1;
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
		} else {
			// "0" | "1" | "2"
			var next, current;
			if (!newValue) { // current is disabled
				// Check up at least one scale is enabled and default scale is enabled...
				current = Number(propertyName);
				if (this.options[0] == 0 && this.options[1] == 0 && this.options[2] == 0) {
					// all are disabled
					next = (current == 2) ? 0 : current + 1; // get next
					this.options[next] = 1; // enable next
					this.options.scaleDefault = next; // default next
				} else {
					if (this.options.scaleDefault == current) { // current is default
						next = (current == 2) ? 0 : current + 1;  // get next
						if (this.options[next] == 0) { // next is disabled
							next = (next == 2) ? 0 : next + 1; // get next
						}
						this.options.scaleDefault = next; // default it
					}
				}
			}
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