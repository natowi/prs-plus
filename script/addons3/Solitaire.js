/* Name: Solitaire game
   Original code (c) 2011 Ben Chenoweth
*/  

tmp = function() {
	var appIcon = (Core.config.compat.NodeKinds.FIVEBALLS == "undefined") ? "GAME" : "FIVEBALLS";
	var Solitaire = {
		name: "Solitaire",
		title: "Solitaire",
		description: "Game",
		icon: appIcon,
		activate: function () {
			kbook.autoRunRoot.sandbox._icon =  Core.config.compat.NodeKinds.getIcon(appIcon,0);
			kbook.autoRunRoot.sandbox._title = Solitaire.title;				
			kbook.autoRunRoot.sandbox.getSoValue = Core.system.getSoValue;
			kbook.autoRunRoot.sandbox.hasNumericButtons = Core.config.compat.hasNumericButtons;					
			kbook.autoRunRoot.path = Core.config.addonsPath + "Solitaire/solitaire.xml";
			kbook.autoRunRoot.enterIf(kbook.model);
		},
		actions: [{
			name: "Solitaire",
			group: "Games",
			icon: appIcon,
			action: function () {
				Solitaire.activate();
			}
		}]
	};
	
	Core.addAddon(Solitaire);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in Solitaire.js", e);
}