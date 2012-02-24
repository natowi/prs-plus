/* Name: Frotz app
   Original code (c) Ben Chenoweth
   Initial version: January 2012
*/

tmp = function() {
	var appIcon = "INTERACT_FICT";
	var Frotz = {
		name: "Frotz",
		title: "Frotz",
		description: "Frotz app",
		icon: appIcon,			
		activate: function () {
			kbook.autoRunRoot.sandbox._icon =  Core.config.compat.NodeKinds.getIcon(appIcon,0);
			kbook.autoRunRoot.sandbox._title = Frotz.title;
			kbook.autoRunRoot.sandbox.getSoValue = Core.system.getSoValue;
			kbook.autoRunRoot.sandbox.setSoValue = Core.system.setSoValue;
			kbook.autoRunRoot.sandbox.hasNumericButtons = Core.config.compat.hasNumericButtons;
			kbook.autoRunRoot.sandbox.getFileContent = Core.io.getFileContent;
			kbook.autoRunRoot.sandbox.setFileContent = Core.io.setFileContent;
			kbook.autoRunRoot.sandbox.listFiles = Core.io.listFiles;
			kbook.autoRunRoot.sandbox.deleteFile = Core.io.deleteFile;
			kbook.autoRunRoot.sandbox.gamesSavePath = Core.config.userGamesSavePath;
			//kbook.autoRunRoot.sandbox.createSimpleMenu = Core.popup.createSimpleMenu;
			//kbook.autoRunRoot.sandbox.showMenu = Core.popup.showMenu;
			kbook.autoRunRoot.sandbox.shellExec = Core.shell.exec;
			kbook.autoRunRoot.path = Core.config.addonsPath + "Frotz/frotz.xml";
			kbook.autoRunRoot.sandbox.model = Core.config.model;
			kbook.autoRunRoot.enterIf(kbook.model);
		},
		actions: [{
			name: "Frotz",
			group: "Games",
			title: "Frotz",
			icon: appIcon,
			action: function () {
				Frotz.activate();
			}
		}]
	};
	
	Core.addAddon(Frotz);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in Frotz.js", e);
}