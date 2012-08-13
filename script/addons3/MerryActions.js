  //	Merry Actions are actions to update the workflow and/or performance of the reader.
//	2012-04-23 drMerry - initial release (reboot action)
//	2012-06-22 drMerry - added flush command
//				added meminfo command
//	2012-07-16 drMerry - added df-info command
//				added mnt-info command
//	2012-07-17 drMerry - made less localizer requests.
//				changed default value to disabled for all functions.
var mAcontainer = function () {
	var L, LG, log, MerryActions, TrueValue, FalseValue;
	log = Core.log.getLogger("MerryActions");
	L = Core.lang.getLocalizer("MerryActions");
	LG = Core.lang.getLocalizer("Global");
	TrueValue = LG("VALUE_ENABLED");
	FalseValue = LG("VALUE_DISABLED");
	//Remove LG to clean some memory
	LG = undefined;
	MerryActions = {
		name: "MerryActions",
		title: L("MERRY_ACTIONS"),
		icon: "REBOOT",
		optionDefs: [
			{
				name: "enableReboot",
				title: L("OPT_REBOOT"),
				icon: "REBOOT",
				helpText: L("MSG_HELP_REBOOT"),
				defaultValue: "False",
				values: ["True", "False"],
				valueTitles: {
					"True": TrueValue,
					"False": FalseValue
				}
			},
            {
				name: "enableSync",
				title: L("OPT_SYNC"),
				icon: "MEMINFO",
				helpText: L("MSG_HELP_SYNC"),
				defaultValue: "False",
				values: ["True", "False"],
				valueTitles: {
					"True": TrueValue,
					"False": FalseValue
				}
			},
            {
				name: "enableMeminfo",
				title: L("OPT_MEMINFO"),
				icon: "MEMINFO",
				defaultValue: "False",
				values: ["True", "False"],
				valueTitles: {
					"True": TrueValue,
					"False": FalseValue
				}
			},
            {
				name: "enableMntinfo",
				title: L("OPT_MNTINFO"),
				icon: "INFO",
				defaultValue: "False",
				values: ["True", "False"],
				valueTitles: {
					"True": TrueValue,
					"False": FalseValue
				}
			},
            {
				name: "enableDF",
				title: L("OPT_DF"),
				icon: "INFO",
				defaultValue: "False",
				values: ["True", "False"],
				valueTitles: {
					"True": TrueValue,
					"False": FalseValue
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
						Core.ui.showMsg(L("MSG_REBOOT"));
						Core.shell.exec("reboot");
					}
                    else {
                        Core.ui.showMsg(L("MSG_DISABLED"));
                        }
				} catch (e) {
					log.error("in MerryActions reboot action: " + e);
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
						Core.shell.exec("echo 'before' > /Data/memdump_update.txt");
						Core.shell.exec("cat /proc/meminfo >> /Data/memdump_update.txt");
                        Core.shell.exec("sync; echo 3 >> /proc/sys/vm/drop_caches");
						Core.shell.exec("echo '----------' > /Data/memdump_update.txt");
						Core.shell.exec("echo ''; echo 'after' >> /Data/memdump_update.txt");
						Core.shell.exec("cat /proc/meminfo >> /Data/memdump_update.txt");
                        //Core.ui.showMsg(LG("MSG_NOT_IMPLEMENTED"));
						Core.ui.showMsg(L("MSG_NEW_MEMINFO"));
					}
                    else {
                        Core.ui.showMsg(L("MSG_DISABLED"));
                        }
				} catch (e) {
					log.error("in MerryActions sync action: " + e);
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
					log.error("in MerryActions mem-info action: " + e);
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
					if (MerryActions.options.enableDF === 'True') {
						Core.shell.exec("df > /Data/dfdump.txt");
                        Core.ui.showMsg(L("MSG_DFINFO"));
					}
                    else {
                        Core.ui.showMsg(L("MSG_DISABLED"));
                        }
				} catch (e) {
					log.error("in MerryActions df-info action: " + e);
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
					if (MerryActions.options.enableMntinfo === 'True') {
						Core.shell.exec("mount > /Data/mntdump.txt");
                        Core.ui.showMsg(L("MSG_MNTINFO"));
					}
                    else {
                        Core.ui.showMsg(L("MSG_DISABLED"));
                        }
				} catch (e) {
					log.error("in MerryActions mnt-info action: " + e);
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
