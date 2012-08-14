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
//	2011-11-13 kartu - added support for rootNode being a function that returns root node
//	2011-11-27 Mark Nord - ItemCount in comment for more, multimedia & games-nodes 
//	2012-01-17 quisvir - Added homekind for moved default nodes
//	2012-01-18 quisvir - onSettingsChanged, rerun onInit & update root to remove need for reboot
//	2012-06-07 Ben Chenoweth - Fixes for 'Empty' node (issues #283, #290)
//	2012-06-09 Ben Chenoweth - Added standard apps: music player, notes, dictionary (issue #219)

var MenuCustomizer, tmp;
tmp = function() {
	var defVal, nodeMap, emptyNode, getEmptyNode, createActivateNode, 
		createListOfStandardNodes, createListOfAddonNodes, getAppNode;
	defVal = "default";
	// Name => node or getNode function map
	nodeMap = {};
	// Used by default UI localizer
	Core.ui.nodes = nodeMap;
	
	//-------------------------------------------------------------------------------------------------------------
	// Returns node that has no title / action associated with it, just a placeholder (might be useful to users who want specific menu layout)
	getEmptyNode = function() {
		//var L = Core.lang.getLocalizer("MenuCustomizer");
		if (emptyNode === undefined) {
			emptyNode = Core.ui.createContainerNode({
				title: "", //L("NODE_EMPTY")
				icon: "EMPTY",
				comment: ""
			});
			emptyNode.enter = function() {
				kbook.model.doBlink();
			};
		}
		return emptyNode;
	};
	
	// Returns node that will activate standard apps on enter
	getAppNode = function(title) {
		var L = Core.lang.getLocalizer("MenuCustomizer"), appNode;
		switch (title) {
			case 'musicplayer':
				appNode = Core.ui.createContainerNode({
						title: L("MUSIC_PLAYER"),
						icon: "AUDIO",
						comment: ""
					});
				appNode.enter = function() {
					var node;
					if (kbook.model.currentSong) {
						kbook.model.onEnterNowPlaying(node);
					} else {
						kbook.model.doGoToMusic();
					}
				};
				break;
			case 'musiclibrary':
				appNode = Core.ui.createContainerNode({
						title: L("MUSIC_LIBRARY"),
						icon: "AUDIO",
						comment: ""
					});
				appNode.enter = function() {
					kbook.model.doGoToMusic();
				};
				break;
			case 'textmemo':
				appNode = Core.ui.createContainerNode({
						title: L("TEXT_MEMOS"),
						icon: "TEXT_MEMO",
						comment: ""
					});
				appNode.enter = function() {
					kbook.model.doGoToNotepadsText();
				};
				break;
			case 'freehand':
				appNode = Core.ui.createContainerNode({
						title: L("HANDWRITINGS"),
						icon: "HANDWRITING",
						comment: ""
					});
				appNode.enter = function() {
					kbook.model.doGoToNotepadsFreehand();
				};
				break;
			case 'dictionary':
				appNode = Core.ui.createContainerNode({
						title: L("DICTIONARY"),
						icon: "DICTIONARY",
						comment: ""
					});
				appNode.enter = function() {
					kbook.model.doGoToDictionary();
				};
				break;
			default:
		}
		if (appNode) { return appNode; }
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
		var L,LL,standardMenuLayout, standardMenuLayoutIcons, prspMenu, key, path, node, j, m;
		L = Core.lang.getLocalizer("Core");
		LL = Core.lang.getLocalizer("MenuCustomizer");
		standardMenuLayoutIcons = {
			"continue": "CONTINUE",
			books: "ALL_BOOKS",
			periodicals: "PERIODICALS",
			collections: "BOOKS",
			notes: "NOTES",
			//newdelivery:
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
		valueTitles.empty = LL("NODE_EMPTY"); //nodeMap.empty.title
		valueIcons["empty"] = "EMPTY";
		
		// Standard nodes
		for (key in  standardMenuLayout) {
			try {
				path = standardMenuLayout[key];
				if (path !== undefined) {
					node = kbook.root;
					j = 0;
					m = path.length;
					for (j, m; j < m; j++) {
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
		//include standard apps
		if (!Core.config.compat.hasNumericButtons) {
			try {
				nodeMap.musicplayer = getAppNode("musicplayer");
				values.push("musicplayer");
				valueTitles.musicplayer = LL("MUSIC_PLAYER");
				valueIcons["musicplayer"] = "AUDIO";
			} catch (e1) {
				log.error("Failed to find music player node: " + e1);
			}
			try {
				nodeMap.musiclibrary = getAppNode("musiclibrary");
				values.push("musiclibrary");
				valueTitles.musiclibrary = LL("MUSIC_LIBRARY");
				valueIcons["musiclibrary"] = "AUDIO";
			} catch (e2) {
				log.error("Failed to find music library node: " + e2);
			}
			try {
				nodeMap.textmemo = getAppNode("textmemo");
				values.push("textmemo");
				valueTitles.textmemo = LL("TEXT_MEMOS");
				valueIcons["textmemo"] = "TEXT_MEMO";
			} catch (e3) {
				log.error("Failed to find text memo node: " + e3);
			}
			try {
				nodeMap.freehand = getAppNode("freehand");
				values.push("freehand");
				valueTitles.freehand = LL("HANDWRITINGS");
				valueIcons["freehand"] = "HANDWRITING";
			} catch (e4) {
				log.error("Failed to find freehand node: " + e4);
			}
			try {
				nodeMap.dictionary = getAppNode("dictionary");
				values.push("dictionary");
				valueTitles.dictionary = LL("DICTIONARY");
				valueIcons["dictionary"] = "DICTIONARY"; 
			} catch (e5) {
				log.error("Failed to find dictionary node: " + e5);
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
		} catch (e6) {
			log.error("Failed to find customContainers: " + key + " " + e6);
		} 
	};
	
	/** Creates addon nodes,addon can either provide "activate" function, 
	 * or getAddonNode function, returning node to show
	 */
	createListOfAddonNodes = function(addons, addonNodes, values, valueTitles, valueIcons) {
		var addon, node, i = 0, n = addons.length;
		for (i, n; i < n; i++) {
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
			var L, i, movableNodes, optionValues, optionValueTitles, optionValueIcons, menuOptionValues, menuOptionValueTitles, values, title, movableNodesLength;
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
			i = 0;
			movableNodesLength = movableNodes.length;
			for (i; i < movableNodesLength; i++) {
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
				i = 0;
				n = customContainers.length;
				for (i, n; i < n; i++) {
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
				i = defaultLayout.length - 1;
				for (i; i >= 0; i--) {
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
					
					// node might be an actual node or a function, that creates it
					if (typeof node === "function") { 
						node = node();
					}
					
					// if node is empty (or not found), have to insert empty node, if it is not the last node (505/300 only)
					if (node === undefined || node === getEmptyNode()) {
						if ((stillEmpty) && ((Core.config.model === "505") || (Core.config.model === "300"))) {
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
				
				// Insert custom nodes
				i = 0;
				n = customNodes.length;
				for (i, n; i < n; i++) {
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
				// Put detached nodes into default node
				if (defaultNode !== undefined && defaultNode.nodes !== undefined) {
					for (nodeName in detachedNodes) {
						// If node was not assigned and can be found and is not itself the default node, attach it to the default
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
		  //TODO propertyName unused
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
