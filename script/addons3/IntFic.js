/* Name: IntFic app
   Original code (c) Ben Chenoweth
   Initial (Frotz only) version: January 2012
   Renamed: March 2012
*/

tmp = function() {
	var appIcon = "INTERACT_FICT";
	var IntFic = {
		name: "IntFic",
		title: "Interactive Fiction",
		description: "Interactive Fiction app",
		icon: appIcon,			
		activate: function () {
			kbook.autoRunRoot.sandbox._icon =  Core.config.compat.NodeKinds.getIcon(appIcon,0);
			kbook.autoRunRoot.sandbox._title = IntFic.title;
			kbook.autoRunRoot.sandbox.getSoValue = Core.system.getSoValue;
			kbook.autoRunRoot.sandbox.setSoValue = Core.system.setSoValue;
			kbook.autoRunRoot.sandbox.hasNumericButtons = Core.config.compat.hasNumericButtons;
			kbook.autoRunRoot.sandbox.getFileContent = Core.io.getFileContent;
			kbook.autoRunRoot.sandbox.setFileContent = Core.io.setFileContent;
			kbook.autoRunRoot.sandbox.listFiles = Core.io.listFiles;
			kbook.autoRunRoot.sandbox.deleteFile = Core.io.deleteFile;
			kbook.autoRunRoot.sandbox.gamesSavePath = Core.config.userGamesSavePath;
			kbook.autoRunRoot.sandbox.shellExec = Core.shell.exec;
			kbook.autoRunRoot.path = Core.config.addonsPath + "IntFic/intfic.xml";
			kbook.autoRunRoot.sandbox.model = Core.config.model;
			kbook.autoRunRoot.enterIf(kbook.model);
		},
		actions: [{
			name: "IntFic",
			group: "Games",
			title: "IntFic",
			icon: appIcon,
			action: function () {
				IntFic.activate();
			}
		}]
	};
	
	Core.addAddon(IntFic);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in IntFic.js", e);
}