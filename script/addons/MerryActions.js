//	Merry Actions are actions to update the workflow and/or performance of the reader.
//	2012-04-23 drMerry - initial release (reboot action)
var mAcontainer = function () {
	var L, log, MerryActions;
	log = Core.log.getLogger("MerryActions");
	L = Core.lang.getLocalizer("MerryActions");
	MerryActions = {
		name: "MerryActions",
		title: L("MERRY_ACTIONS"),
		icon: "REBOOT",
		optionDefs: [
			{
				name: "enableReboot",
				title: L("OPT_REBOOT"),
				icon: "REBOOT",
				defaultValue: "False",
				values: ["True", "False"],
				valueTitles: {
					"True": L("REBOOT_TRUE"),
					"False": L("REBOOT_FALSE")
				}
			}
		],
		actions: [{
			name: "Reboot",
			title: L("REBOOT_TITLE"),
			group: "System",
			icon: "REBOOT",
			action: function () {
				try {
					if (MerryActions.options.enableReboot === 'True') {
						Core.shell.exec("reboot");
					}
				} catch (e) {
					log.error("in MerryActions action: " + e);
				}
			}
		}]
	};

	Core.addAddon(MerryActions);
};
try {
	mAcontainer();
	mAcontainer = undefined;
} catch (e) {
	var log;
	// Core's log
	log.error("in MerryActions.js", e);
	mAcontainer = undefined;
}