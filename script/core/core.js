// Name: Core
// Description: controls PRS+ initialization
// Author: kartu
//
// History:
//	2010-03-14 kartu - Initial version, refactored from Utils
//	2010-04-17 kartu - Moved module specific global vars into local functions context
//	2010-04-21 kartu - Localized, removed call to lang.init
//	2010-04-27 kravitz - Added "PRS+ Settings" node comment
//	2010-04-27 kravitz - Creation of addon and setting nodes are moved to Core.settings.init()
//	2010-04-29 kravitz - Refactored events handling
//	2010-05-03 kravitz - Code of base nodes creating is moved to createBaseNodes() from MenuTuning.js
//	2010-07-20 kartu - Removed core event init call

var log;

// initialized in lang
var coreL;

// dummy function, to avoid introducing global vars
var tmp = function() {
	Core.addons = [];
	Core.actions = [];
	Core.addonByName = {};

	// Calls given method for all array objects, passing arg as argument
	// Arguments:
	//	objArray - array of objects to call
	//	methodName - name of the method to call
	//	args - arguments to pass to <methodName> function
	//
	Core.callMethodForAll = function (objArray, methodName, args) {
		if (!objArray) {
			return;
		}
		for (var i = 0, n = objArray.length; i < n; i++) {
			var obj = objArray[i];
			var func = obj[methodName];
			if (typeof func === "function") {
				try {
					func.apply(obj, args);
				} catch (e) {
					try {
						if (typeof obj != "undefined" && obj.hasOwnProperty("name")) {
							log.error("error when calling method " + methodName + " on " + obj.name + ": " + e);
						} else {
							log.error("error when calling method " + methodName + " on object [" + i + "]: " + e);
						}
					} catch (ignore) {
					}
				}
			}
		}
	};

	// Adds all addons actions to the Core.actions array
	var addActions = function(addon) {
		if (addon && addon.actions) {
			for (var i = 0, n = addon.actions.length; i < n; i++) {
				addon.actions[i].addon = addon;
				Core.actions.push(addon.actions[i]);
			}
		}
	};

	// Adds addon nodes, calls onPreInit & onInit
	//
	Core.addAddon = function(addon) {
		if (addon.name) {
			this.addonByName[addon.name] = addon;
		}
		this.addons.push(addon);
		addActions(addon);
	};

	// Init of settings and addons
	//
	Core.init = function () {
		try {
			var addons = this.addons;

			// All addon's are loaded, call preInit (some addon's might change option defs)
			Core.callMethodForAll(addons, "onPreInit");

			// Load options
			for (var i = 0, n = addons.length; i < n; i++) {
				try {
					Core.settings.loadOptions(addons[i]);
				} catch (e0) {
					log.warn("error loading settings for addon " + addons[i].name + ": " + e0);
				}
			}

			// Addons and options are loaded, call init
			Core.callMethodForAll(addons, "onInit");

			// Create addon nodes and addon option nodes
			Core.settings.init(addons);
		} catch (e) {
			log.error("in core init", e);
		}
	};
};

try {
	tmp();
} catch (ignore) {
	// logging system is not yet initialized
}
