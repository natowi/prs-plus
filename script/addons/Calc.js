// Name: calculator
// Description: loader for calculator autorun
// Author: Mark Nord
// Based on work of: obelix, kartu
//
// History:
//	2010-06-05 Mark Nord - initial release
//	2010-12-05 Mark Nord - prepared for PRS+ 2.0.x

tmp = function() {
	var L = Core.lang.getLocalizer("Calc");
	var Calc = {
		name: "Calculator",
		title: L("TITLE"),
		//description: L("DESCRIPTION"),	// to be added to language asset
		description: "Scientific calculator",
		icon: "CALC",
		activate: function () {
			kbook.autoRunRoot.sandbox._icon = Core.config.compat.NodeKinds.getIcon("CALC",0);
			kbook.autoRunRoot.sandbox._title = Calc.title;
			kbook.autoRunRoot.sandbox.hasNumericButtons = Core.config.compat.hasNumericButtons;
			kbook.autoRunRoot.sandbox.getSoValue = Core.system.getSoValue;
			kbook.autoRunRoot.sandbox.gamesSavePath = Core.config.userGamesSavePath;
			kbook.autoRunRoot.path = Core.config.addonsPath + "Calc/calculator.xml";
			kbook.autoRunRoot.enterIf(kbook.model);
		},
		actions: [{
			name: "Calc",
			group: "Utils",
			icon: "CALC",
			action: function () {
				Calc.activate();
			}
		}]
	};

	Core.addAddon(Calc);
};

try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in Calc.js", e);
}
