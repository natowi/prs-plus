/* Name: MineSweeper game
   Original code (c) D. Shep Poor
   adapted for Sony PRS by Mark Nord
   Initial version: April 2011
   2012-11-05 drMerry added localization and added title to actions
*/

tmp = function() {
	var appIcon = (Core.config.compat.NodeKinds.BOMB == "undefined") ? "GAME" : "BOMB",
	L = Core.lang.getLocalizer("Minesweep");
	var MineSweeper = {
		name: "MineSweeper",
		title: L("TITLE"),
		description: L("MSG"),
		icon: appIcon,
		activate: function () {
		   try {
			kbook.autoRunRoot.sandbox._icon =  Core.config.compat.NodeKinds.getIcon(appIcon,0);
			kbook.autoRunRoot.sandbox._title = MineSweeper.title;		   
			kbook.autoRunRoot.sandbox.getSoValue = Core.system.getSoValue;
			kbook.autoRunRoot.sandbox.setSoValue = Core.system.setSoValue;
			kbook.autoRunRoot.sandbox.getFileContent = Core.io.getFileContent;
			kbook.autoRunRoot.sandbox.hasNumericButtons = Core.config.compat.hasNumericButtons;
			kbook.autoRunRoot.sandbox.gamesSavePath = Core.config.userGamesSavePath;			
			} catch (ignore) {}
			
			kbook.autoRunRoot.path = Core.config.addonsPath + "MineSweeper/minesweeper.xml";
			kbook.autoRunRoot.enterIf(kbook.model);
		},
		actions: [{
			name: "MineSweeper",
			title: L("TITLE"),
			group: "Games",
			icon: appIcon,
			action: function () {
				MineSweeper.activate();
			}
		}]
	};
	
	Core.addAddon(MineSweeper);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in MineSweeper.js", e);
}