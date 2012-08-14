  //	Merry Actions are actions to update the workflow and/or performance of the reader.
//	2012-04-23 drMerry - initial release (reboot action)
//	2012-06-22 drMerry - added flush command
//				added meminfo command
//	2012-07-16 drMerry - added df-info command
//				added mnt-info command
//	2012-07-17 drMerry - made less localizer requests.
//				changed default value to disabled for all functions.
//	2012-08-14 drMerry - minimized some Code
//				changed some vars to match rules (no capital)
//				renamed enableSync into enableSyncMem while enableSync is seen as a Sync-action
var mAcontainer = function () {
	var merryActions, 
	log = Core.log.getLogger("merryActions"),
	L = Core.lang.getLocalizer("MerryActions"),
	LG = Core.lang.getLocalizer("Global"),
	trueVal = LG("VALUE_ENABLED"),
	falseVal = LG("VALUE_DISABLED"),
	trueFalse = ["True", "False"],
	dumpUpdate = "cat /proc/meminfo >> /Data/memdump_update.txt";
	//Remove LG to clean some memory
	LG = undefined;
	merryActions = {
		name: "merryActions",
		title: L("MERRY_ACTIONS"),
		icon: "REBOOT",
		optionDefs: [
			{
				name: "enableReboot",
				title: L("OPT_REBOOT"),
				icon: "REBOOT",
				helpText: L("MSG_HELP_REBOOT"),
				defaultValue: "False",
				values: trueFalse,
				valueTitles: {
					"True": trueVal,
					"False": falseVal
				}
			},
            {
				name: "enableSyncMem",
				title: L("OPT_SYNC"),
				icon: "MEMINFO",
				helpText: L("MSG_HELP_SYNC"),
				defaultValue: "False",
				values: trueFalse,
				valueTitles: {
					"True": trueVal,
					"False": falseVal
				}
			},
            {
				name: "enableMeminfo",
				title: L("OPT_MEMINFO"),
				icon: "MEMINFO",
				defaultValue: "False",
				values: trueFalse,
				valueTitles: {
					"True": trueVal,
					"False": falseVal
				}
			},
            {
				name: "enableMntinfo",
				title: L("OPT_MNTINFO"),
				icon: "INFO",
				defaultValue: "False",
				values: trueFalse,
				valueTitles: {
					"True": trueVal,
					"False": falseVal
				}
			},
            {
				name: "enableDF",
				title: L("OPT_DF"),
				icon: "INFO",
				defaultValue: "False",
				values: trueFalse,
				valueTitles: {
					"True": trueVal,
					"False": falseVal
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
					if (merryActions.options.enableReboot === 'True') {
						Core.ui.showMsg(L("MSG_REBOOT"));
						Core.shell.exec("reboot");
					}
                    else {
                        Core.ui.showMsg(L("MSG_DISABLED"));
                        }
				} catch (e) {
					log.error("in merryActions reboot action: " + e);
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
					if (merryActions.options.enableSyncMem === 'True') {
						Core.shell.exec("echo 'before' > /Data/memdump_update.txt");
						Core.shell.exec(dumpUpdate);
                        Core.shell.exec("sync; echo 3 >> /proc/sys/vm/drop_caches");
						Core.shell.exec("echo '----------' > /Data/memdump_update.txt");
						Core.shell.exec("echo ''; echo 'after' >> /Data/memdump_update.txt");
						Core.shell.exec(dumpUpdate);
                        //Core.ui.showMsg(LG("MSG_NOT_IMPLEMENTED"));
						Core.ui.showMsg(L("MSG_NEW_MEMINFO"));
					}
                    else {
                        Core.ui.showMsg(L("MSG_DISABLED"));
                        }
				} catch (e) {
					log.error("in merryActions sync action: " + e);
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
					if (merryActions.options.enableMeminfo === 'True') {
						Core.shell.exec("cat /proc/meminfo > /Data/memdump.txt");
                        Core.ui.showMsg(L("MSG_MEMINFO"));
					}
                    else {
                        Core.ui.showMsg(L("MSG_DISABLED"));
                        }
				} catch (e) {
					log.error("in merryActions mem-info action: " + e);
				}
			}
		},
        {
			name: "DiskFree",
			title: L("DF_TITLE"),
			group: "System",
			icon: "INFO",
			action: function () {
				try {
					if (merryActions.options.enableDF === 'True') {
						Core.shell.exec("df > /Data/dfdump.txt");
                        Core.ui.showMsg(L("MSG_DFINFO"));
					}
                    else {
                        Core.ui.showMsg(L("MSG_DISABLED"));
                        }
				} catch (e) {
					log.error("in merryActions df-info action: " + e);
				}
			}
		},
        {
			name: "MountInfo",
			title: L("MNTNFO_TITLE"),
			group: "System",
			icon: "INFO",
			action: function () {
				try {
					if (merryActions.options.enableMntinfo === 'True') {
						Core.shell.exec("mount > /Data/mntdump.txt");
                        Core.ui.showMsg(L("MSG_MNTINFO"));
					}
                    else {
                        Core.ui.showMsg(L("MSG_DISABLED"));
                        }
				} catch (e) {
					log.error("in merryActions mnt-info action: " + e);
				}
			}
		}]
	};

	Core.addAddon(merryActions);
};
try {
	mAcontainer();
	mAcontainer = undefined;
} catch (e) {
	var log;
	// Core's log
	log.error("in merryActions.js", e);
	mAcontainer = undefined;
}
