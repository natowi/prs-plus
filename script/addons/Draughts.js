/* Name: Draughts game
   Original code (c) Ben Chenoweth
   Initial version: March 2011
*/

tmp = function() {
	var appIcon = (Core.config.compat.NodeKinds.DRAUGHTS == "undefined") ? "GAME" : "DRAUGHTS";
	var Draughts = {
		name: "Draughts",
		title: "Draughts",
		description: "Board game",
		icon: appIcon,
		activate: function () {
			kbook.autoRunRoot.sandbox._icon =  Core.config.compat.NodeKinds.getIcon(appIcon,0);
			kbook.autoRunRoot.sandbox._title = Draughts.title;		
			kbook.autoRunRoot.sandbox.getSoValue = Core.system.getSoValue;
			kbook.autoRunRoot.sandbox.hasNumericButtons = Core.config.compat.hasNumericButtons;
			kbook.autoRunRoot.sandbox.getFileContent = Core.io.getFileContent;
			kbook.autoRunRoot.sandbox.gamesSavePath = Core.config.userGamesSavePath;
			kbook.autoRunRoot.path = Core.config.addonsPath + "Draughts/draughts.xml";
			kbook.autoRunRoot.enterIf(kbook.model);
		},
		actions: [{
			name: "Draughts",
			group: "Games",
			icon: appIcon,
			action: function () {
				Draughts.activate();
			}
		}]
	};
	
	Core.addAddon(Draughts);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in Draughts.js", e);
}