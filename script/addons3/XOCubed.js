/* Name: XO-Cubed game
   Original code (c) Ben Chenoweth
   Initial version: April 2011
*/

tmp = function() {
	var appIcon = (Core.config.compat.NodeKinds.FIVEROW == "undefined") ? "GAME" : "FIVEROW";
	var XOCubed = {
		name: "XOCubed",
		title: "XO-Cubed",
		description: "Game",
		icon: appIcon,
		activate: function () {
		   try {
			kbook.autoRunRoot.sandbox._icon =  Core.config.compat.NodeKinds.getIcon(appIcon,0);
			kbook.autoRunRoot.sandbox._title = XOCubed.title;				   
			kbook.autoRunRoot.sandbox.getSoValue = Core.system.getSoValue;
			kbook.autoRunRoot.sandbox.hasNumericButtons = Core.config.compat.hasNumericButtons;
			} catch (ignore) {}
			
			kbook.autoRunRoot.path = Core.config.addonsPath + "XOCubed/xocubed.xml";
			kbook.autoRunRoot.enterIf(kbook.model);
		},
		actions: [{
			name: "XOCubed",
			group: "Games",
			icon: appIcon,
			action: function () {
				XOCubed.activate();
			}
		}]
	};
	
	Core.addAddon(XOCubed);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in XOCubed.js", e);
}