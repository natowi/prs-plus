/* Name: Fiveballs game
   Original code (c) 2008 Clemenseken
*/  

tmp = function() {
	var appIcon = (Core.config.compat.NodeKinds.FIVEBALLS == "undefined") ? "GAME" : "FIVEBALLS";
	var FiveBalls = {
		name: "FiveBalls",
		title: "Five Balls",
		description: "Game",
		icon: appIcon,
		activate: function () {
			kbook.autoRunRoot.sandbox._icon =  Core.config.compat.NodeKinds.getIcon(appIcon,0);
			kbook.autoRunRoot.sandbox._title = FiveBalls.title;				
			kbook.autoRunRoot.sandbox.getSoValue = Core.system.getSoValue;
			kbook.autoRunRoot.sandbox.hasNumericButtons = Core.config.compat.hasNumericButtons;
			kbook.autoRunRoot.sandbox.gamesSavePath = Core.config.userGamesSavePath;						
			kbook.autoRunRoot.path = Core.config.addonsPath + "FiveBalls/fiveballs.xml";
			kbook.autoRunRoot.enterIf(kbook.model);
		},
		actions: [{
			name: "FiveBalls",
			group: "Games",
			icon: appIcon,
			action: function () {
				FiveBalls.activate();
			}
		}]
	};
	
	Core.addAddon(FiveBalls);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in FiveBalls.js", e);
}