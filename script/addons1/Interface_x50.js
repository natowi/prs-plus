// Name: Analogus_Interface
// Description: alters navigating behaviour
// Author: ANALOGUS
// 

// History:
// Initial version: 11.03.2012
// 2012.04.27: shorten code
// 2012-06-10 Mark Nord - UTF-8 encoding, var-defs, now working in BETA-folder
// 2012-09-30 Mark Nord - renamed to interface_x50; moved to default-repository

tmp = function() 
{

//shortcuts:
	model = kbook.model.container.sandbox; 	
	
	
//Fon-Size-Overlay. Originale Höhe: 128. Testweise auf 220 vergrößert. 
	model.SIZE_OVERLAY_GROUP.sandbox.VIEW.sandbox.SIZE_OVERLAY.sandbox.canTap = function () {
			return true;
		}
	model.SIZE_OVERLAY_GROUP.sandbox.VIEW.sandbox.SIZE_OVERLAY.sandbox.doTap = function (x, y) {
			if (y < this.height - 265) this.getModel().closeCurrentOverlay();
		}
	
// OK: doToneCurveClose() instead of closeCurrentOverlay(). No () in main.xml. 
	model.OPTION_OVERLAY_PAGE_TONECURVE.sandbox.canTap = function () {
	   return true;
	}
	model.OPTION_OVERLAY_PAGE_TONECURVE.sandbox.doTap = function (x, y) {
	   if (y < this.height - 122) this.getModel().doToneCurveClose();
	}

	model.OPTION_OVERLAY_PAGE_JUMPBAR.sandbox.canTap = function () {
	   return true;
	}
	model.OPTION_OVERLAY_PAGE_JUMPBAR.sandbox.doTap = function (x, y) {
	   if (y < this.height - 128) this.getModel().closeCurrentOverlay();
	}
	
	model.SEARCH_OVERLAY.sandbox.canTap = function () {
	   return true;
	}
	model.SEARCH_OVERLAY.sandbox.doTap = function (x, y) {
	   if (y < this.height - 369) this.getModel().closeCurrentOverlay();
	}

	model.OPTION_OVERLAY_PAGE_TONECURVEEDITOR.sandbox.canTap = function () {
	   return true;
	}
	model.OPTION_OVERLAY_PAGE_TONECURVEEDITOR.sandbox.doTap = function (x, y) {
	   if (y < this.height - 122) this.getModel().closeCurrentOverlay();
	}


	var Interface_x50 = 
	{
		name: "Interface_x50"
	};

	Core.addAddon(Interface_x50);
};

// Error-Logging:
try {
	tmp();
} catch (e) {
	log.error("in Interface_x50.js", e);
}
