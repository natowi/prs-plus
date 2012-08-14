// Name: Screenshot
// Description: Allows to save screenshots as jpeg files
// Author: kartu
//
// History:
//	2010-03-07 kartu - #Prepared for localization (refactored to use L function)
//	2010-03-14 kartu - #Refactored Utils -> Core
//	2010-03-14 kartu - Localized
//	2010-04-17 kartu - Moved global vars into local functions context
//	2010-04-23 kartu - Fixed: tmp() function wasn't called
//	2010-04-24 kartu - Prepared for merging into single JS
//	2010-04-25 kartu - Made timer a local variable
//	2010-05-20 kartu - Fixed addon name (affects settings)
//	2010-07-13 kartu - Added "has SD card" check
//	2011-02-06 kartu - Removed timer from confirmation
//		Changed default save location to internal memory
//		Switched to using Core.ui.showMsg
//	2011-04-13 kartu - Captured image is made immediatelly visible to the system
//	2011-06-18 kartu - Captured image is made immediatelly visible to the user as well
//	2011-10-09 Mark Nord - save Screenshots in root+Core.config.userScreenShotPath
//  2011-10-19 Ben Chenoweth - changed PICTURE to PICTURE_ALT

// dummy function, to avoid introducing global vars
tmp = function() {
	var L, log, extension, getSavePath;
	L = Core.lang.getLocalizer("Screenshot");
	log = Core.log.getLogger("Screenshot");
	
	extension = ".jpg";
	getSavePath = function (root) {
		var d, name, n;
		if (!FileSystem.getFileInfo(root)) {
			return false;
		}
	
		d = new Date();
		name = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
						
		if (!FileSystem.getFileInfo(root + name + extension)) {
			return name + extension;
		}
		
		n = 0;
		while (FileSystem.getFileInfo(root + name + "_" + n + extension)) {
			n++;
		}
		
		return name + "_" + n + extension;
	};
	
	var saveToValueTitles = {
		"a:/": L("MEMORY_STICK"),
		"b:/": L("SD_CARD"),
		"/Data/": L("INTERNAL_MEMORY")
	};
	
	var Screenshot = {
		name: "Screenshot",
		title: L("TITLE"),
		icon: "PICTURE_ALT",
		optionDefs: [
			{
				name: "showSaveProgress",
				title: L("OPT_FEEDBACK"),
				icon: "PICTURE_ALT",
				defaultValue: "on",
				values: ["on", "off"],
				valueTitles: {
					"on": L("FEEDBACK_ON"),
					"off": L("FEEDBACK_OFF")
				}
			}
		],
		onPreInit: function() {
			if (Core.config.compat.hasCardSlots) {
				Screenshot.optionDefs.push({
					name: "saveTo",
					title: L("OPT_SAVETO"),
					icon: "DB",
					defaultValue: "/Data/",
					values: ["a:/", "b:/", "/Data/"],
					valueTitles: saveToValueTitles
				});
			}
		},
		onInit: function() {
			if (!Core.config.compat.hasCardSlots) {
				Screenshot.options.saveTo = "/Data/";
			}
		},
		actions: [{
			name: "takeScreenshoot",
			title: L("ACTION_TITLE"),
			group: "Screen",
			icon: "PICTURE_ALT",
			action: function () {
				var root, saveFilename, savePath, stream, msg1, msg2, bitmap;
				try {
					root = Screenshot.options.saveTo + Core.config.userScreenShotPath;;
					FileSystem.ensureDirectory(root);
					saveFilename = getSavePath(root);
					savePath = root + saveFilename;
					root = Screenshot.options.saveTo;
					
					try {
						stream = new Stream.File(savePath, 1);
						bitmap = kbook.model.container.getWindow().getBitmap();
						bitmap.writeJPEG(stream);
						stream.close();
						
						// Add image to the library
						try {
							Core.media.loadMedia(savePath);
							// Update nodes so that new image is visible
							kbook.root.update();
						} catch (ignore) {
						}
					} catch (ee) {
						msg1 = L("SAVING_TO") + saveToValueTitles[root];					
						msg2 = L("FAILED_TO_SAVE");
					}
					
					if (Screenshot.options.showSaveProgress === "on") {
						if (msg1 === undefined) {
							msg1 = L("SAVING_TO") + " " + saveToValueTitles[root];
							msg2 = saveFilename;
						}
						Core.ui.showMsg([msg1, msg2]);
					}
					
				} catch (e) {
					log.error("in takeScreenshot action: " + e);
				}
			}
		}]
	};

	Core.addAddon(Screenshot);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in Screenshot.js", e);
}