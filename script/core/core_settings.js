// Name: PRS+ Settings
// Description: PRS+ Settings engine
// Author: kartu
//
// History:
//	2010-03-14 kartu - Initial version, refactored from Utils
//	2010-04-17 kartu - Moved global vars into local functions context
//	2010-04-25 kartu - Marked lazyCreateSettings as constructor for closure compiler to shut up
//	2010-04-27 kravitz - Added Core.settings.init()
//	2010-04-27 kravitz - Grouping of settings (based on "settingsGroup")
//	2010-04-27 kravitz - Added "N Settings" comment (if not preset anything else)
//	2010-05-03 kravitz - Added insertAddonNode(), removeAddonNode()
//	2010-07-01 kartu - Adapted for 300
//	2010-11-16 kartu - Added short title to the node (for small buttons on readers with touchscreen)
//	2011-03-23 kartu - Refactoring: moving functions out of lang files, moving texts to a spreadsheet
//	2011-08-23 Mark Nord - added PRS+ advanced Settings Group -> 11th Group -> 2 Settings Pages -> reorganize PRS+ Settings?
//	2011-10-01 quisvir - Added guideArea property for option and group descriptions
//	2011-10-13 quisvir - Fixed #187 "Arrow" icon in "PRS+ Settings" slot is missing
//  2011-10-19 Ben Chenoweth - Changed BOOK to BOOK_ALT
//	2011-11-25 quisvir - Allow temporary redirect after selecting setting
//	2011-11-28 qusivir - Sort PRS+ Settings nodes by title
//	2011-12-07 quisvir - Exposed doCreateSingleSetting
//	2011-12-17 quisvir - Minor change to show numerical settings correctly
//	2012-02-11 quisvir - Let options keep showing unchecked using 'noCheck' property
//	2012-02-20 quisvir - Fixed incorrect settings count in case of hidden settings; minor changes
//	2012-02-21 quisvir - Moved hidden settings to separate group

// dummy function, to avoid introducing global vars
tmp = function() {
	var prspSettingsNode;
	
	// Returns option title for given addon/option definition
	//
	var core_setting_translateValue = function(optionDef, value) {
		if (optionDef.hasOwnProperty("valueTitles") && optionDef.valueTitles.hasOwnProperty(value)) {
			return optionDef.valueTitles[value];
		}
		return value;
	};
	// Returns closure that retrieves given value from a given option object
	// 
	var core_setting_getValueTranslator = function(options, optionDef) {
		return function() {
			return core_setting_translateValue(optionDef, options[optionDef.name]);
		};
	};

	// Returns option icon for given addon/option definition
	//
	var core_setting_translateIcon = function(optionDef, value) {
		if (optionDef.hasOwnProperty("valueIcons") && optionDef.valueIcons.hasOwnProperty(value)) {
			return optionDef.valueIcons[value];
		}
		return "UNCHECKED";
	};

	// Returns option group for given addon/option definition
	//
	var core_setting_translateGroup = function(optionDef, value) {
		if (optionDef.hasOwnProperty("valueGroups") && optionDef.valueGroups.hasOwnProperty(value)) {
			return optionDef.valueGroups[value];
		}
		return "";
	};

	// Creates "value" node (used in settings).
	// Arguments:
	//	arg, in addition to fields from createContainerNode, can have the following fields
	//		optionDef - option definition
	//		value - option value
	//		object - target object, to set option to (typically addon.options)
	//		addon - addon object
	//
	var core_setting_createValueNode = function(arg) {
		var node = Core.ui.createContainerNode(arg);
		node.enter = function() {
			try {
				var optionDef = arg.optionDef;
				var propertyName = optionDef.name;

				var oldValue = arg.object[propertyName];
				arg.object[propertyName] = arg.value;

				if(arg.addon && arg.addon.onSettingsChanged) {
					arg.addon.onSettingsChanged(propertyName, oldValue, arg.value, arg.object);
				}

				if (!optionDef.useIcons && !optionDef.noCheck) {
					var i, n, node, nodes, icon;
					nodes = this.parent.nodes;
					for (i = 0, n = nodes.length; i < n; i++) {
						node = nodes[i];
						if (node === this) {
							icon = "CHECKED";
						} else {
							icon = "UNCHECKED";
						}
						Core.ui.setNodeIcon(node, icon);
					}
				}

				// Save changes
				Core.settings.saveOptions(arg.addon);

				// Goto parent node
				if (this.parent.redirect) {
					delete this.parent.redirect;
				} else {
					this.parent.parent.enter(kbook.model);
				}
			} catch (e) {
				log.error("in valuenode.enter for option " + arg.optionDef.name + ": " + e);
			}
		};
		return node;
	};

	// Creates value nodes (used in addon settings) for given option definition and addon.
	//
	var core_setting_createValueNodes = function(parent, optionDef, addon, options) {
		var i, n, values, v, node, groups, group, groupTitle;
		try {
			values = optionDef.values;
			if (!optionDef.useIcons) {
				for (i = 0, n = values.length; i < n; i++) {
					v = values[i];
					node = core_setting_createValueNode({
						parent: parent,
						title: core_setting_translateValue(optionDef, v),
						optionDef: optionDef,
						value: v,
						object: options,
						addon: addon,
						icon: "UNCHECKED",
						comment: ""
					});
					if (v === options[optionDef.name].toString()) {
						node.selected = true;
						Core.ui.setNodeIcon(node, "CHECKED");
					}
					parent.nodes.push(node);
				}
			} else {
				groups = {};
				for (i = 0, n = values.length; i < n; i++) {
					v = values[i];
					groupTitle = core_setting_translateGroup(optionDef, v);
					if (groupTitle !== "") { 
						if (!groups.hasOwnProperty(groupTitle)) {
							groups[groupTitle] = Core.ui.createContainerNode({
								parent: parent,
								title: groupTitle,
								icon: "FOLDER"
							});
							parent.nodes.push(groups[groupTitle]);
						}
						group = groups[groupTitle];
					} else {
						group = parent;
					}
					node = core_setting_createValueNode({
						parent: parent,
						title: core_setting_translateValue(optionDef, v),
						optionDef: optionDef,
						value: v,
						object: options,
						addon: addon,
						icon: core_setting_translateIcon(optionDef, v),
						comment: ""
					});
					if (options[optionDef.name] !== undefined && v === options[optionDef.name].toString()) {
						node.selected = true;
					}
					group.nodes.push(node);
				}
			}
		} catch (e) {
			log.error("in core_setting_createValueNodes for addon " + addon.name + " option " + optionDef.name + ": " + e);
		}
	};


	var doCreateAddonSettings;
	/**
	 * @constructor
	 */
	var lazyCreateSettings = function(parent, optionDefs, addon) {
		// FIXME maybe replace with legit "construct" initialization
		parent._uncreated = (parent._uncreated) ? parent._uncreated + 1 : 1;
		Core.hook.hookBefore(parent, "enter", function(args, oldFunc) {
			if (this._uncreated) {
				this._uncreated--;
				doCreateAddonSettings(parent, optionDefs, addon, true);
			}
		});
	};

	var doCreateSingleSetting;
	doCreateAddonSettings = function(parent, optionDefs, addon, ignoreLazy) {
		var i, n;
		if (ignoreLazy !== true) {
			lazyCreateSettings(parent, optionDefs, addon);
			return;
		}

		for (i = 0, n = optionDefs.length; i < n; i++) {
			doCreateSingleSetting(parent, optionDefs[i], addon);
		}
	};

	// Recursively creates setting nodes
	//
	doCreateSingleSetting = function(parent, optionDef, addon) {
		var node;
		if (optionDef.hasOwnProperty("groupTitle")) {
			// Group
			node = Core.ui.createContainerNode({
					parent: parent,
					title: optionDef.groupTitle,
					comment: optionDef.groupComment ? optionDef.groupComment : function () {
						return Core.lang.LX("SETTINGS", optionDef.optionDefs.length);
					},
					icon: optionDef.groupIcon,
					guideArea: optionDef.helpText
			});
			node.sublistMark = true;
			parent.nodes.push(node);

			doCreateAddonSettings(node, optionDef.optionDefs, addon, false);
		} else {
			// If target is defined, use it, else create "options"
			var options;
			if (optionDef.hasOwnProperty("target")) {
				options = addon.options[optionDef.target];
			} else {
				options = addon.options;
			}

			// Create parent node
			node = Core.ui.createContainerNode({
					parent: parent,
					title: optionDef.title,
					icon: optionDef.icon,
					guideArea: optionDef.helpText
			});
			parent.nodes.push(node);
			parent = node;

			parent._mycomment = core_setting_getValueTranslator(options, optionDef);
			core_setting_createValueNodes(parent, optionDef, addon, options);
		}
	};

	Core.settings = {};

	Core.settings.init = function(addons) {
		var i, n;
		// Init settings groups
		Core.settings.settingsGroupDefs = {
			menu: {
				title: coreL("GROUP_MENU_TITLE"),
				icon: "LIST"
			},
			advanced: {
				title: coreL("GROUP_ADV_SETTINGS_TITLE"),
				icon: "SETTINGS"
			},			
			viewer: {
				title: coreL("GROUP_VIEWER_TITLE"),
				icon: "BOOK_ALT"
			}
		};
		// Create addon nodes and addon option nodes
		for (i = 0, n = addons.length; i < n; i++) {
			Core.settings.createAddonSettings(addons[i]);
		}
		// Sort nodes by title
		prspSettingsNode.nodes.sort(function(a, b){
			if (a.title < b.title) return -1;
			if (a.title > b.title) return 1;
			return 0;
		});
	};

	// Creates entry under "Settings => PRS+ Settings" corresponding to the addon.
	// Arguments:
	//	addon - addon variable
	Core.settings.createAddonSettings = function(addon) {
		try {
			// Addon
			if (addon && addon.optionDefs && addon.optionDefs.length > 0) {
				var optionDefs = addon.optionDefs;
				
				// Search for settings node with same settingsGroup property
				var thisSettingsNode, group, title, comment, icon, i, n;
				if (addon.settingsGroup && this.settingsGroupDefs[addon.settingsGroup]) {
					group = addon.settingsGroup;
					for (i = 0, n = prspSettingsNode.nodes.length; i < n; i++) {
						if (prspSettingsNode.nodes[i]._settingsGroup === group) {
							// ... group found
							thisSettingsNode = prspSettingsNode.nodes[i];
							if (thisSettingsNode._settingsCount) {
								// Group comment is undefined
								thisSettingsNode._settingsCount += optionDefs.length;
								thisSettingsNode._mycomment = Core.lang.LX("SETTINGS", thisSettingsNode._settingsCount);
							}
							break;
						}
					}
					if (thisSettingsNode === undefined) {
						// ... group not found
						var defs = this.settingsGroupDefs[group];
						title = defs.title;
						comment = defs.comment;
						icon = defs.icon;
					}
				} else {
					group = addon.name;
					title = (addon.title) ? addon.title : addon.name;
					comment = addon.comment;
					icon = addon.icon;
				}
				if (thisSettingsNode === undefined) {
					// Create settings node for this addon
					thisSettingsNode = Core.ui.createContainerNode({
						parent: prspSettingsNode,
						title: title,
						icon: icon
					});
					thisSettingsNode._settingsGroup = group;
					if (comment) {
						thisSettingsNode._mycomment = comment;
					} else {
						thisSettingsNode._settingsCount = optionDefs.length;
						thisSettingsNode._mycomment = Core.lang.LX("SETTINGS", thisSettingsNode._settingsCount);
					}
					prspSettingsNode.nodes.push(thisSettingsNode);
				}
				thisSettingsNode.sublistMark = true;
				doCreateAddonSettings(thisSettingsNode, optionDefs, addon, false);
			}
		} catch (e) {
			log.error("failed to create addon settings: " + addon.name + ": " + e);
		}
	};


	// Saves addon's non-default options as JSON object.
	// WARNING: no escaping is done!
	// Arguments:
	//	addon - addon who's settings must be saved
	//
	Core.settings.saveOptions = function(addon) {
		try {
			FileSystem.ensureDirectory(Core.config.settingsPath);
			var od, od2, name, options, optionDefsToSave, gotSomethingToSave,
				stream, globalStr, ii, str, j, m;

			// Find out which options need to be saved (do not save devault values)
			options = addon.options;
			optionDefsToSave = []; // option defs

			if (saveOptions2(addon.optionDefs, options, optionDefsToSave)) {
				gotSomethingToSave = true;
			}
			if (addon.hiddenOptions) {
				if (saveOptions2(addon.hiddenOptions, options, optionDefsToSave)) {
					gotSomethingToSave = true;
				}
			}
			
			// If there is anything to save - save, if not, delete settings file
			var settingsFile = Core.config.settingsPath + addon.name + ".config";
			if (gotSomethingToSave) {
				stream = new Stream.File(settingsFile, 1, 0);
				try {
					globalStr = "";
					for (ii in optionDefsToSave) {
						od = optionDefsToSave[ii];
						name = od.name;

						str = null;
						if (od.isGroup) {
							str = "\t\"" + od.target + "\": {\n";
							for (j = 0, m = od.optionDefs.length; j < m; j++) {
								od2 = od.optionDefs[j];
								str = str +  "\t\t\"" + od2.name + "\":\"" + options[od2.target][od2.name] + "\",\n";
							}
							// remove trailing ,\n
							str = str.substring(0, str.length -2);
							str = str + "\n\t}";
						} else if (od.hasOwnProperty("name")) {
							str = "\t\"" + name + "\":\"" + options[name] + "\"";
						}
						globalStr = globalStr + str + ",\n";
					}
					// remove trailing ,\n
					globalStr = globalStr.substring(0, globalStr.length - 2);
					stream.writeLine("return {\n" + globalStr + "\n}");
				} finally {
					stream.close();
				}
			} else {
				// Remove settings file, since all settings have default values
				FileSystem.deleteFile(settingsFile);
			}
		} catch (e) {
			log.error("saving options for addon: " + addon.name);
		}
	};
	
	var saveOptions2 = function (optionDefs, options, optionDefsToSave) {
		var i, od, name, defValue, target, gotSomethingToSave;
		for (i = 0; i < optionDefs.length; i++) {
			od = optionDefs[i];

			// Add group suboptions
			if (od.hasOwnProperty("groupTitle")) {
				optionDefs = optionDefs.concat(od.optionDefs);
				continue;
			}

			name = od.name;
			defValue = od.defaultValue;
			target = od.hasOwnProperty("target") ? od.target : false;

			if (target) {
				if (options.hasOwnProperty(target) && options[target].hasOwnProperty(name) && options[target][name] !== defValue) {
					if (!optionDefsToSave.hasOwnProperty(target)) {
						optionDefsToSave[target] = {
							isGroup: true,
							target: target,
							optionDefs: []
						};
					}
					gotSomethingToSave = true;
					optionDefsToSave[target].optionDefs.push(od);
				}
			} else if (options.hasOwnProperty(name) && options[name] !== defValue) {
				gotSomethingToSave = true;
				optionDefsToSave.push(od);
			}
		}
		return gotSomethingToSave;
	}

	// Loads addon's options, using default option values, if settings file or value is not present.
	//
	Core.settings.loadOptions = function(addon) {
		var options, settingsFile, optionDefs, i, od;
		try {
			if (addon.optionDefs) {
				// load settings from settings file
				try {
					settingsFile = Core.config.settingsPath + addon.name + ".config";
					options = Core.system.callScript(settingsFile, log);
				} catch (e0) {
					log.warn("Failed loading settings file for addon " + addon.name + ": " + e0);
				}
				if (!options) {
					options = {};
				}
				
				loadOptions2(addon.optionDefs, options);
				if (addon.hiddenOptions) {
					loadOptions2(addon.hiddenOptions, options);
				}
				
				addon.options = options;
			}
		} catch (e) {
			log.error("Loading settings of " + addon.name);
		}
	};
	
	var loadOptions2 = function (optionDefs, options) {
		var i, od;
		for (i = 0; i < optionDefs.length; i++) {
			od = optionDefs[i];
			if (od.hasOwnProperty("groupTitle")) {
				optionDefs = optionDefs.concat(od.optionDefs);
			} else {
				if (od.hasOwnProperty("target")) {
					if (!options.hasOwnProperty(od.target)) {
						options[od.target] = {};
					}

					if (!options[od.target].hasOwnProperty(od.name)) {
						options[od.target][od.name] = od.defaultValue;
					}
				} else {
					if (!options.hasOwnProperty(od.name)) {
						options[od.name] = od.defaultValue;
					}
				}
			}
		}
	}
	
	Core.addAddon({
		name: "PRSPSettings",
		icon: "SETTINGS",
		onPreInit: function() {
			prspSettingsNode = Core.ui.createContainerNode({
				title: coreL("NODE_PRSP_SETTINGS"),
				shortTitle: coreL("NODE_PRSP_SETTINGS_SHORT"),
				icon: "SETTINGS",
				comment: function () {
					return Core.lang.LX("SETTINGS", this.nodes.length);
				}
			});
			prspSettingsNode.sublistMark = true;
		},
		getAddonNode: function() {
			return prspSettingsNode;
		},
		createSingleSetting: function (parent, optionDef, addon) {
			doCreateSingleSetting(parent, optionDef, addon);
		}
	});
};

try {
	tmp();
} catch (e) {
	log.error("initializing core-settings", e);
}
