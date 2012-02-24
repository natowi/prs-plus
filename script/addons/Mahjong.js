/* Name: Mahjong game
   Original code (c) '08 Clemenseken
*/

tmp = function() {
	var appIcon = (Core.config.compat.NodeKinds.MAHJONG == "undefined") ? "GAME" : "MAHJONG";
	var Mahjong = {
		name: "Mahjong",
		title: "Mahjong",
		description: "Game",
		icon: appIcon,
		activate: function () {
		   try {
			kbook.autoRunRoot.sandbox._icon =  Core.config.compat.NodeKinds.getIcon(appIcon,0);
			kbook.autoRunRoot.sandbox._title = Mahjong.title;		   
			kbook.autoRunRoot.sandbox.getSoValue = Core.system.getSoValue;
			kbook.autoRunRoot.sandbox.getFileContent = Core.io.getFileContent;			
			kbook.autoRunRoot.sandbox.hasNumericButtons = Core.config.compat.hasNumericButtons;
			kbook.autoRunRoot.sandbox.gamesSavePath = Core.config.userGamesSavePath;						
			} catch (ignore) {}
			
			kbook.autoRunRoot.path = Core.config.addonsPath + "Mahjong/mahjong.xml";
			kbook.autoRunRoot.enterIf(kbook.model);
		},
		actions: [{
			name: "Mahjong",
			group: "Games",
			icon: appIcon,
			action: function () {
				Mahjong.activate();
			}
		}]
	};
	
	Core.addAddon(Mahjong);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in Mahjong.js", e);
}