// Name: sudoku game
// Description: adapted version of Sudoku
// Author: obelix
//
// History:
//	2010-03-14 kartu - #Refactored Utils -> Core
//	2010-04-10 kartu - Prepared for merging into single JS
//	2010-04-24 kartu - Prepared for merging into single JS once more... :)
//	2010-12-03 Mark Nord - expose getSoValue & compat.hasNumericButtons to sandboxed Code
//  2011-03-26 Ben Chenoweth - added app icon and title

tmp = function() {
	var appIcon = (Core.config.compat.NodeKinds.SUDOKU == "undefined") ? "GAME" : "SUDOKU";
	var Sudoku = {
		name: "Sudoku",
		title: "Sudoku",
		description: "Sudoku Game",
		icon: appIcon,
		activate: function () {
			kbook.autoRunRoot.sandbox._icon =  Core.config.compat.NodeKinds.getIcon(appIcon,0);
			kbook.autoRunRoot.sandbox._title = Sudoku.title;		
			kbook.autoRunRoot.sandbox.getSoValue = Core.system.getSoValue;
			kbook.autoRunRoot.sandbox.hasNumericButtons = Core.config.compat.hasNumericButtons;
			kbook.autoRunRoot.sandbox.gamesSavePath = Core.config.userGamesSavePath;			
			kbook.autoRunRoot.path = Core.config.addonsPath + "Sudoku/sudoku.xml";
			kbook.autoRunRoot.enterIf(kbook.model);
		},
		actions: [{
			name: "Sudoku",
			group: "Games",
			icon: appIcon,
			action: function () {
				Sudoku.activate();
			}
		}]
	};
	
	Core.addAddon(Sudoku);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in Sudoku.js", e);
}