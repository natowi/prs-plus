// Name: LRFTextScale
// Description: Options to change default scale factor for LRF files
// Author: kartu
//
// History:
//	2011-05-17 kartu - 600: Removed "XS" level 
//		ALL: Restart warning message is shown at most once per hour
//	2011-11-20 kartu - Removed unused "DESCRIPTION"
//	2011-12-09 quisvir - Added action to reformat current book
//	2011-12-10 quisvir - Fixed bookData bug spotted by Mark

tmp = function() {
	var LRFTextScale, defVal, L, ZOOM_VALUES, ZOOM_VALUE_NAMES, ZOOM_LEVEL_NAMES, scaleMin, scaleMax,
		updateKconfig, warnUser, warningShownOn,
		CURRENT_KCONFIG_PATH, KCONFIG_PATH, MARKER, ENV_TAG, OPTION_NAME;
	L = Core.lang.getLocalizer("LRFTextScale");
	defVal = "default";
	ZOOM_VALUES = [defVal, "50", "75", "80", "85", "90", "95", "100", "105", "110", "115", "120", "125", "130", "135", "140", "145", "150", "160", "170", "180", "190", "200", "225", "250", "275", "300"];
	ZOOM_VALUE_NAMES = {};
	ZOOM_VALUE_NAMES[defVal] = L("VALUE_DEFAULT");
	ZOOM_LEVEL_NAMES = ["XS", "S", "M", "L", "XL", "XXL"];
	CURRENT_KCONFIG_PATH = "/opt/sony/ebook/application/kconfig.xml";
	KCONFIG_PATH = "/opt0/prsp/kconfig.xml";
	MARKER = "<!--PRSP_LRFTextScale-->";
	ENV_TAG = "<environment>";
	OPTION_NAME = "scale";
	
	LRFTextScale = {
		name: "LRFTextScale",
		title: L("TITLE"),
		icon: "TEXT_SCALE",
		actions: [{
			name: "ReformatCurrentBook",
			title: L("REFORMAT_CURRENT_BOOK"),
			group: "Book",
			icon: "BOOK_ALT",
			action: function () {
				if (!kbook.model.currentBook) return;
				var data = kbook.bookData;
				kbook.model.currentBook.media.browseTo(data, undefined, undefined, undefined, undefined, false, data.width, data.height, data.book.facing);
				data.book.dataChanged();
			}
		}]
	};
	
	LRFTextScale.onPreInit = function() {
		var od, i;
		switch (Core.config.model) {
			case "300":
			case "505":
				scaleMin = 0;
				scaleMax = 2;
				break;
			case "600":
				scaleMin = 0;
				scaleMax = 4;
				break;
			default:
				scaleMin = -1;
				scaleMax = 4;
		}
		
		// options
		od = [];
		for (i = scaleMin; i <= scaleMax; i++) {
			od.push({
					name: OPTION_NAME + i,
					title: ZOOM_LEVEL_NAMES[i + 1],
					defaultValue: defVal,
					values: ZOOM_VALUES
			});
		}
		this.optionDefs = od;
	};
	
	warnUser = function() {
		if (warningShownOn === undefined || ((new Date()).getTime() - warningShownOn.getTime()) > 3600000) {
			warningShownOn = new Date();
			Core.ui.showMsg(Core.lang.L("MSG_RESTART")  + "\n" + L("MSG_DEFAULT"), 5);
		}
	};
	
	LRFTextScale.onSettingsChanged = function(propertyName, oldValue, newValue) {
		if (oldValue !== newValue) {
			updateKconfig(LRFTextScale.options);
			warnUser();
		}
	};
	
	updateKconfig = function(options) {
		var i, env, kconfig, idx;
		env = "";
		
		// create "environment" string
		for (i = scaleMin; i <= scaleMax; i++) {
			if (options[OPTION_NAME + i] !== defVal) {
				env += '\t\t\t<variable name="bbebTextScale' + i + '" value="' + options[OPTION_NAME + i] + '"/>\n';
			}
		}
		
		if (env === "") {
			// all default, no need in custom kconfig file
			Core.io.deleteFile(KCONFIG_PATH);
		} else {
			env = ENV_TAG + "\n" + env + MARKER;
			kconfig = Core.io.getFileContent(CURRENT_KCONFIG_PATH);
			idx = kconfig.indexOf(MARKER);
			if (idx === -1) {
				kconfig = kconfig.replace(ENV_TAG, env);
			} else {
				kconfig =
					kconfig.substring(0, kconfig.indexOf(ENV_TAG)) +
					env +
					kconfig.substring(idx + MARKER.length);
			}
			Core.io.setFileContent(KCONFIG_PATH, kconfig);
		}
	};

	Core.addAddon(LRFTextScale);
};

try {
	tmp();
} catch (e) {
	log.error("LRFTextScale", e);
}
