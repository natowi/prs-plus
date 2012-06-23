/* Name: Cli app
   Original code (c) Ben Chenoweth
   Initial version: January 2012
*/

tmp = function() {
	var appIcon = "KEYBOARD_ALT";
	var Cli = {
		name: "Cli",
		title: "CLI",
		description: "CLI app",
		icon: appIcon,			
		activate: function () {
			kbook.autoRunRoot.sandbox._icon =  Core.config.compat.NodeKinds.getIcon(appIcon,0);
			kbook.autoRunRoot.sandbox._title = Cli.title;
			kbook.autoRunRoot.sandbox.getSoValue = Core.system.getSoValue;
			kbook.autoRunRoot.sandbox.setSoValue = Core.system.setSoValue;
			kbook.autoRunRoot.sandbox.hasNumericButtons = Core.config.compat.hasNumericButtons;
			kbook.autoRunRoot.sandbox.getFileContent = Core.io.getFileContent;
			kbook.autoRunRoot.sandbox.deleteFile = Core.io.deleteFile;
			kbook.autoRunRoot.sandbox.shellExec = Core.shell.exec;
			kbook.autoRunRoot.path = Core.config.addonsPath + "Cli/cli.xml";
			kbook.autoRunRoot.sandbox.model = Core.config.model;
			kbook.autoRunRoot.enterIf(kbook.model);
		},
		actions: [{
			name: "Cli",
			group: "System",
			title: "CLI",
			icon: appIcon,
			action: function () {
				Cli.activate();
			}
		}]
	};
	
	Core.addAddon(Cli);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in Cli.js", e);
}