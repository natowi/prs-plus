// Name: Menu Customizer
// Description: Allows to customize root menu
// Author: kartu
//
// History:
//	2010-11-10 kartu - Renamed from MenuCustomizer to "Menu Customizer" (used as settings file name)
//	2011-02-05 kartu - Added support for "Core.config.compat.rootNode" parameter (target node for menu customizer)
//				"Separator" option is not shown, if model doesn't have numeric button.
//				Fixed #34 ALL: MenuCustomizer should put unassigned nodes into default one.
//				Unmodifiable slots got different title.
//	2011-06    Shura1oplot - assign Icons to menu-options
//	2011-08-01 Mark Nord -  include Core.config.compat.prspMenu.customContainers
//	2011-08-28 Ben Chenoweth - Custom containers can now have a short name and a comment
//	2011-11-13 kartu - added support for rootNode being a funciton that returns root node
//	2011-11-27 Mark Nord - ItemCount in comment for more, multimedia & games-nodes 
//	2012-01-17 quisvir - Added homekind for moved default nodes
//	2012-01-18 quisvir - onSettingsChanged, rerun onInit & update root to remove need for reboot

var MenuCustomizer;
tmp = function() {
	var defVal, nodeMap, emptyNode, getEmptyNode, createActivateNode, 
		createListOfStandardNodes, createListOfAddonNodes;
	defVal = "default";
	// Name => node or getNode function map
	nodeMap = {};
	// Used by default UI localizer
	Core.ui.nodes = nodeMap;
	
	//-------------------------------------------------------------------------------------------------------------
	// Returns node that has no title / action associated with it, just a placeholder (might be usefull to users who want specific menu layout)
	getEmptyNode = function() {
		var L = Core.lang.getLocalizer("MenuCustomizer");
		if (emptyNode === undefined) {
			emptyNode = Core.ui.createContainerNode({
				title: L("NODE_EMPTY"),
				icon: "EMPTY",
				comment: ""
			});
			emptyNode.enter = function() {
				kbook.model.doBlink();
			};
		}
		return emptyNode;
	};

	createActivateNode = function (addon) {
		var node;
		node = Core.ui.createContainerNode({
				title: addon.title,
				icon: addon.icon,
				comment: addon.comment ? addon.comment : ""
		});
		node.enter = function() {
			addon.activate();
		};
		return node;
	};
	
	//-------------------------------------------------------------------------------------------------------------
	// Initializes node map
	createListOfStandardNodes = function(nodeMap, values, valueTitles, valueIcons) {
		var L,standardMenuLayout, standardMenuLayoutIcons, prspMenu, key, path, node, j, m;
		L = Core.lang.getLocalizer("Core");
		standardMenuLayoutIcons = {
			"continue": "CONTINUE",
			books: "ALL_BOOKS",
			periodicals: "PERIODICALS",
			collections: "BOOKS",
			notes: "NOTES",
			//newdelivery:
			//textMemo:
			//handwriting:
			audio: "AUDIO",
			music: "AUDIO",
			pictures: "PICTURES",
			apps: "APPLICATIONS",
			settings: "SETTINGS",
			advancedSettings: "SETTINGS",
			nowPlaying: "PLAY",
			booksByTitle:"ALL_BOOKS",
			booksByDate :"DATE",
			booksByAuthor:"AUTHOR",
			bookmarks :"BOOKMARK"
		};
		standardMenuLayout = Core.config.compat.standardMenuLayout;
		// Root node
		nodeMap.root = Core.config.compat.rootNode;
		if (typeof nodeMap.root === "function") {
			nodeMap.root = nodeMap.root();
		}
		if (!nodeMap.root) {
			nodeMap.root = kbook.root;	
		}
		
		// Empty node
		nodeMap.empty = getEmptyNode();
		values.push("empty");
		valueTitles.empty = nodeMap.empty.title;
		valueIcons["empty"] = "EMPTY";
		
		// Standard nodes
		for (key in  standardMenuLayout) {
			try {
				path = standardMenuLayout[key];
				if (path !== undefined) {
					node = kbook.root;
					for (j = 0, m = path.length; j < m; j++) {
						node = node.nodes[path[j]];
					}
					nodeMap[key] = node;
					values.push(key);
					valueTitles[key] = node.title;
					if (standardMenuLayoutIcons.hasOwnProperty(key)) {
						valueIcons[key] = standardMenuLayoutIcons[key];
					}
				}
			} catch (e) {
				log.error("Failed to find node: " + key + " " + e);
			}
		}	
			//include Core.config.compat.prspMenu.customContainers
			try {
				prspMenu = Core.config.compat.prspMenu;
				for (key in prspMenu.customContainers) {
					values.push(prspMenu.customContainers[key].name);
					valueTitles[prspMenu.customContainers[key].name] = L(prspMenu.customContainers[key].title); 
					valueIcons[prspMenu.customContainers[key].name] = prspMenu.customContainers[key].icon;
					} 
			} catch (e) {
				log.error("Failed to find customContainers: " + key + " " + e);
			} 
	};
	
	/** Creates addon nodes,addon can either provide "activate" function, 
	 * or getAddonNode function, returning node to show
	 */
	createListOfAddonNodes = function(addons, addonNodes, values, valueTitles, valueIcons) {
		var addon, node, i, n;
		for (i = 0, n = addons.length; i < n; i++) {
			addon = addons[i];
			if (typeof addon.activate === "function") {
				node = createActivateNode(addon);
			} else if (typeof addon.getAddonNode === "function") {
				node = addon.getAddonNode();
			} else {
				continue;
			}
			addonNodes[addon.name] = node;
			values.push(addon.name);
			valueTitles[addon.name] = node.title;
			if (addon.hasOwnProperty("icon")) {
				valueIcons[addon.name] = addon.icon;
			}
		}
	};
	
	MenuCustomizer = {
		name: "MenuCustomizer",
		icon: "ROOT_MENU",
		onPreInit: function() {
			var L, i, movableNodes, optionValues, optionValueTitles, optionValueIcons, menuOptionValues, menuOptionValueTitles, values, title;
			L = Core.lang.getLocalizer("MenuCustomizer");
			this.title = L("TITLE");
			this.optionDefs = [];
			movableNodes = Core.config.compat.prspMenu.movableNodes;
			
			// which node
			optionValues = [defVal];
			optionValueTitles = {};
			optionValueTitles[defVal] = L("VALUE_DEFAULT");
			optionValueIcons = {};
			// whether to show separator
			menuOptionValues = [defVal, "yes", "no"];
			menuOptionValueTitles = {
				"yes": L("VALUE_YES"),
				"no": L("VALUE_NO")
			};
			menuOptionValueTitles[defVal] = L("VALUE_DEFAULT");
			
			// Create list of standard nodes
			createListOfStandardNodes(nodeMap, optionValues, optionValueTitles, optionValueIcons);
			// Create list of addon nodes
			createListOfAddonNodes(Core.addons, nodeMap, optionValues, optionValueTitles, optionValueIcons);
			
			this.optionDefs = [];
			for (i = 0; i < movableNodes.length; i++) {
				// Don't show impossible values on unmovable nodes
				if (movableNodes[i] === 0) {
					values = [defVal];
					title = L("UNMOVABLE_SLOT") + " " + (i + 1);
				} else {
					values = optionValues;
					title = L("SLOT") + " " + (i + 1);
				}
				
				// FIXME implicit "is touch device"
				// Whether ot show or not "Separator" menu options
				if (Core.config.compat.hasNumericButtons) {
					this.optionDefs.push({
							groupTitle: title,
							groupIcon: "FOLDER",
							optionDefs: [
								{
									name: "slot_" + i,
									title: L("MENU_ITEM"),
									defaultValue: defVal,
									values: values,
									valueTitles: optionValueTitles,
									valueIcons: optionValueIcons,
									useIcons: true
								},
								{
									name: "slot_sep_" + i,
									title: L("MENU_SEPARATOR"),
									defaultValue: defVal,
									values: menuOptionValues,
									valueTitles: menuOptionValueTitles
								}
							]
					});
				} else {
					this.optionDefs.push({
						name: "slot_" + i,
						title: title,
						defaultValue: defVal,
						values: values,
						valueTitles: optionValueTitles,
						valueIcons: optionValueIcons,
						useIcons: true
					});
				}
			}
		},
		
		onInit: function() {
			try {
				var i, n, options, root, prspMenu, customContainers, customNodes, movableNodes, defaultLayout, standardMenuIcons, placedNodes, detachedNodes,
					nodeName, node, container, isSeparator, isShortName, customNode, parentNode, stillEmpty, isDefault, defaultNode, defaultNodeName;
				
				options = this.options;
				root = nodeMap.root;
				prspMenu = Core.config.compat.prspMenu;
				// Custom node containers to create
				customContainers = prspMenu.customContainers;
				// Nodes assigned to certain nodes
				customNodes = prspMenu.customNodes;
				// Which nodes could be moved and which not
				movableNodes = prspMenu.movableNodes;
				// Default prsp menu layout
				defaultLayout = prspMenu.defaultLayout;
				// Icons for default nodes
				standardMenuIcons = Core.config.compat.standardMenuIcons;
				
				// Create prs+ containers ("Multimedia", "Games & Utils" etc)
				for (i = 0, n = customContainers.length; i < n; i++) {
					container = customContainers[i];
					nodeMap[container.name] = Core.ui.createContainerNode({
						title: coreL(container.title),
						shortName: container.shortName,
						kind: container.kind,
						icon: container.icon,
						//comment: container.comment
						comment : container.comment ? container.comment : function () {
								try{
									return Core.lang.LX("ITEMS", this.nodes.length);
								}
								catch (ignore) {}
							}
					});					
					// (X) like description, i.e. (3)
					nodeMap[container.name].shortComment = function () {return "(" + this.nodes.length + ")"; };
				}
				
				// Set of already placed nodes
				placedNodes = {};
				// Set of default nodes that were replaced by user defined ones
				detachedNodes = {};
				
				// Set root menu nodes, remembering which were placed and which were not
				// was a non empty node inserted
				stillEmpty = true; 
				for (i  = defaultLayout.length - 1; i >= 0; i--) {
					nodeName = options["slot_" + i];
					isSeparator = options["slot_sep_" + i] === "true";
					isShortName = Boolean(defaultLayout[i].shortName);
					isDefault = nodeName === defVal || movableNodes[i] === 0;
					
					// If slot set to default or node is unmovable
					if (isDefault) {
						if (defaultLayout[i] === undefined) {
							break;
						}
						nodeName = defaultLayout[i].name;
						if (options["slot_sep_" + i] === defVal) {
							isSeparator = defaultLayout[i].separator === true;
						}
					} else {
						detachedNodes[defaultLayout[i].name] = true;
					}
					node = nodeMap[nodeName];
					
					// node might be an actuall node or a function, that creates it
					if (typeof node === "function") { 
						node = node();
					}
					
					// if node is empty (or not found), have to insert empty node, if it is not the last node
					if (node === undefined || node === getEmptyNode()) {
						if (stillEmpty) {
							continue;
						} else {
							node = getEmptyNode();
						}
					}
					// set separator state
					node.separator = isSeparator ? 1 : 0;
					
					// whether to use short name (small buttons where full name doesn't fit)
					if (isShortName) {
						node.name = node.shortName;
					}
					
					// add homekind (necessary for moved default nodes)
					if (!node.hasOwnProperty('homekind') && standardMenuIcons) {
						node.homekind = standardMenuIcons[nodeName];
					}
					
					// attach to root
					root.nodes[i] = node;
					node.parent = root;
					placedNodes[nodeName] = true;
					stillEmpty = false;
				}
				
				// Insert curstom nodes
				for (i = 0, n = customNodes.length; i < n; i++) {
					customNode = customNodes[i];
					nodeName = customNode.name;
					if (placedNodes[nodeName] === true) {
						// Node was already placed in the root menu, nothing to do
						continue;
					}
					node = nodeMap[nodeName];
					if (node === undefined) {
						log.warn("Cannot find custom node " + nodeName);
						continue;
					}
					parentNode = nodeMap[customNode.parent];
					if (parentNode === undefined) {
						log.warn("Cannot find custom node parent: " + customNode.parent);
						continue;
					}
					node.parent = parentNode;
					if (customNode.position !== undefined) {
						if (customNode.replace) {
							parentNode.nodes[customNode.position] = node;
						} else if (parentNode.nodes[customNode.position] !== node) {
							parentNode.nodes.splice(customNode.position, 0, node);
						}
						
					} else {
						parentNode.nodes.push(node);
					}
				}
				
				// Default node, if not specified, using "more"
				defaultNodeName = Core.config.compat.defaultNode;
				if (defaultNodeName === undefined) {
					defaultNodeName = "more"; 
				}
				defaultNode = nodeMap[defaultNodeName];
				// Put  detached nodes into default node
				if (defaultNode !== undefined && defaultNode.nodes !== undefined) {
					for (nodeName in detachedNodes) {
						// If node wasnot assigned and can be found and is not itself the default node, attach it to the default
						if (placedNodes[nodeName] !== true && nodeMap[nodeName] !== undefined && defaultNodeName !== nodeName) {
							// Pushing
							node = nodeMap[nodeName];
							defaultNode.nodes.push(node);
							node.parent = defaultNode;
						}
					}
				}
			} catch (e) {
				log.error("in menu onInit: ", e);
			}
		},
		
		onSettingsChanged: function (propertyName, oldValue, newValue) {
			if (oldValue !== newValue) {
				this.onInit();
				nodeMap.root.update(kbook.model);
			}
		}
		
	};	

	Core.addAddon(MenuCustomizer);
};

try {
	tmp();
	tmp = undefined;
} catch (e) {
	log.error("Error in core-ui-menu: " + e); 
}
