//	Merry Actions are actions to update the workflow and/or performance of the reader.
//	2012-04-23 drMerry - initial release (reboot action)
//	2012-06-22 drMerry - added flush command
//				added meminfo command
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
					"True": L("OPT_ENABLED"),
					"False": L("OPT_DISABLED")
				}
			},
            {
				name: "enableSync",
				title: L("OPT_SYNC"),
				icon: "MEMINFO",
				defaultValue: "False",
				values: ["True", "False"],
				valueTitles: {
					"True": L("OPT_ENABLED"),
					"False": L("OPT_DISABLED")
				}
			},
            {
				name: "enableMeminfo",
				title: L("OPT_MEMINFO"),
				icon: "MEMINFO",
				defaultValue: "True",
				values: ["True", "False"],
				valueTitles: {
					"True": L("OPT_ENABLED"),
					"False": L("OPT_DISABLED")
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
                    else {
                        Core.ui.showMsg(L("MSG_DISABLED"));
                        }
				} catch (e) {
					log.error("in MerryActions action: " + e);
				}
			}
		},
        {
			name: "Sync",
			title: L("SYNC_TITLE"),
			group: "System",
			icon: "MEMINFO",
			action: function () {
				try {
					if (MerryActions.options.enableSync=== 'True') {
                        //Core.popup.showMenu(menu);
						Core.shell.exec("echo 'before' > /Data/memdump_update.txt");
						Core.shell.exec("cat /proc/meminfo >> /Data/memdump_update.txt");
                        Core.shell.exec("sync; echo 3 >> /proc/sys/vm/drop_caches");
						Core.shell.exec("echo ''; echo 'after' >> /Data/memdump_update.txt");
						Core.shell.exec("cat /proc/meminfo >> /Data/memdump_update.txt");
                        //Core.ui.showMsg(L("MSG_NOT_IMPLEMENTED"));
						Core.ui.showMsg(L("MSG_NEW_MEMINFO"));
					}
                    else {
                        Core.ui.showMsg(L("MSG_DISABLED"));
                        }
				} catch (e) {
					log.error("in MerryActions action: " + e);
				}
			}
		},
        {
			name: "MemInfo",
			title: L("MEMINFO_TITLE"),
			group: "System",
			icon: "MEMINFO",
			action: function () {
				try {
					if (MerryActions.options.enableMeminfo === 'True') {
						Core.shell.exec("cat /proc/meminfo > /Data/memdump.txt");
                        Core.ui.showMsg(L("MSG_MEMINFO"));
					}
                    else {
                        Core.ui.showMsg(L("MSG_DISABLED"));
                        }
				} catch (e) {
					log.error("in MerryActions action: " + e);
				}
			}
		}]
        
        //sync; echo 3 > /proc/sys/vm/drop_caches
        //cat /proc/meminfo
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
