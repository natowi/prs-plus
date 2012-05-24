/* Name: Chess game
   Original code (c) Ben Chenoweth
   Initial version: Jan. 2011
*/

tmp = function() {
	var appIcon = (Core.config.compat.NodeKinds.CHESS == "undefined") ? "GAME" : "CHESS";
	var Chess = {
		name: "Chess",
		title: "Chess",
		description: "Board game",
		icon: appIcon,
		activate: function () {
			kbook.autoRunRoot.sandbox._icon =  Core.config.compat.NodeKinds.getIcon(appIcon,0);
			kbook.autoRunRoot.sandbox._title = Chess.title;
			kbook.autoRunRoot.sandbox.getSoValue = Core.system.getSoValue;
			kbook.autoRunRoot.sandbox.setSoValue = Core.system.setSoValue;
			kbook.autoRunRoot.sandbox.hasNumericButtons = Core.config.compat.hasNumericButtons;
			kbook.autoRunRoot.sandbox.gamesSavePath = Core.config.userGamesSavePath;
			kbook.autoRunRoot.sandbox.shellExec = Core.shell.exec;
			kbook.autoRunRoot.sandbox.getFileContent = Core.io.getFileContent;
			kbook.autoRunRoot.sandbox.setFileContent = Core.io.setFileContent;
			kbook.autoRunRoot.path = Core.config.addonsPath + "Chess/chess.xml";
			kbook.autoRunRoot.enterIf(kbook.model);
		},
		actions: [{
			name: "Chess",
			group: "Games",
			icon: appIcon,
			action: function () {
				Chess.activate();
			}
		}]
	};
	
	Core.addAddon(Chess);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in Chess.js", e);
}