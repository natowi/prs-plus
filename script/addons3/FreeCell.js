/* Name: Freecell game
   Original code (c) Ben Chenoweth
   Initial version: Dec. 2010
	History:
	2011-02-28 Ben Chenoweth - Changed addon name to CamelCase
*/

tmp = function() {
	var appIcon = (Core.config.compat.NodeKinds.CARDS == "undefined") ? "GAME" : "CARDS";
	var FreeCell = {
		name: "FreeCell",
		title: "Free Cell",
		description: "Card game",
		icon: appIcon,			
		activate: function () {
			kbook.autoRunRoot.sandbox._icon =  Core.config.compat.NodeKinds.getIcon(appIcon,0);
			kbook.autoRunRoot.sandbox._title = FreeCell.title;
			kbook.autoRunRoot.sandbox.getSoValue = Core.system.getSoValue;
			kbook.autoRunRoot.sandbox.hasNumericButtons = Core.config.compat.hasNumericButtons;
			kbook.autoRunRoot.sandbox.getFileContent = Core.io.getFileContent;
			kbook.autoRunRoot.path = Core.config.addonsPath + "FreeCell/freecell.xml";
			kbook.autoRunRoot.enterIf(kbook.model);
		},
		actions: [{
			name: "FreeCell",
			group: "Games",
			icon: appIcon,
			action: function () {
				FreeCell.activate();
			}
		}]
	};
	
	Core.addAddon(FreeCell);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in FreeCell.js", e);
}