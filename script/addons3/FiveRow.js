/* Name: Fiverow game
   Original code (c) Ben Chenoweth
   Initial version: Dec. 2010
	History:
	2010-12-03 Mark Nord - startup Code for PRS+
	2011-02-28 Ben Chenoweth - Changed addon name to CamelCase
*/

tmp = function() {
	var appIcon = (Core.config.compat.NodeKinds.FIVEROW == "undefined") ? "GAME" : "FIVEROW";
	var FiveRow = {
		name: "FiveRow",
		title: "Five In A Row",
		description: "Game",
		icon: appIcon,
		activate: function () {
		   try {
			kbook.autoRunRoot.sandbox._icon =  Core.config.compat.NodeKinds.getIcon(appIcon,0);
			kbook.autoRunRoot.sandbox._title = FiveRow.title;				   
			kbook.autoRunRoot.sandbox.getSoValue = Core.system.getSoValue;
			kbook.autoRunRoot.sandbox.hasNumericButtons = Core.config.compat.hasNumericButtons;
			} catch (ignore) {}
			
			kbook.autoRunRoot.path = Core.config.addonsPath + "FiveRow/fiverow.xml";
			kbook.autoRunRoot.enterIf(kbook.model);
		},
		actions: [{
			name: "FiveInARow",
			group: "Games",
			icon: appIcon,
			action: function () {
				FiveRow.activate();
			}
		}]
	};
	
	Core.addAddon(FiveRow);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in FiveRow.js", e);
}