// Name: Standard Actions for models 300, 505
// Description: Provides built-in actions like "shutdown", "next page" etc
// Author: kartu
//
// History:
//	2010-06-27 kartu - Adapted for 300 from former KeyBindings addon
//	2010-11-28 kartu - 600: Implemented #31 "Use Volume buttons to move through history"
//				300: Fixed "next/prev" page actions consuming "goto page" key events 
//	2011-10-27 Mark Nord - ported bubbleActions from x50
//	2011-10-28 Mark Nord - fixed issue #206
//	2011-11-26 Mark Nord - Added issue #218 TOC Action for 300/505
//	2012-02-06 Ben Chenoweth - Added No Action, Goto various nodes, Delete Current Item, Play/Pause Audio
//	2012-02-20 quisvir - Added custom action; code cleaning
//	2012-02-20 quisvir - Added Action Launcher; code cleaning

tmp = function() {
	var L, log, NAME, StandardActions, model, book, doHistory, isBookEnabled, addBubbleActions, addOptionalActions,
		doBubble, doBubbleFunc, actionLauncher, actionLauncherConstruct, kbActions;
		
	NAME = "StandardActions";
	L = Core.lang.getLocalizer(NAME);
	log = Core.log.getLogger(NAME);

	// Shortcuts
	model = kbook.model;
	book = model.container.sandbox.PAGE_GROUP.sandbox.PAGE;
	isBookEnabled = function() {
		return book.isEnabled();
	}
	
	// Cross-model do history
	//	whereTo - integer, positive moves back
	doHistory = function (whereTo) {
		try {
			if (model.currentBook && model.currentBook.media) {
				if (model.currentBook.media.rememberBy(kbook.bookData, whereTo)) {
					return;
				}
			}		
		} catch (e) {
			log.error("doHistory", e);
		}
		model.doBlink();
	};

	// Generic "bubbling" code, bubbles using currently focused item;
	doBubble = function(cmd, param) {
		var focus;
		if (model.current) {
			focus = model.container.getWindow().focus;
			if (focus) {
				try {
					focus.bubble(cmd, param);
				} catch (e) {
					log.error("in doBubble, command " + cmd, e);
				}
			} else {
				model.doBlink();
			}
		}
	};
	
	doBubbleFunc = function() {
		doBubble(this.bubble);
	};
	
	// Adds "bubblable" actions, if model supports them
	addBubbleActions = function (actions) {
		var bubbles, bubble, icons, i, m, n;
		bubbles = ["doMark",   "doMarkMenu", "doMenu", "doSize",     "doRoot"   ];
		icons   = ["BOOKMARK", "BOOKMARK",   "BACK",   "TEXT_SCALE", "ROOT_MENU"];
		for (i = 0, n = bubbles.length; i < n; i ++) {
			bubble = bubbles[i];
			if (model[bubble]) {
				actions.push( {
					name: "BubbleAction_" + bubble,
					title: L("ACTION_" + bubble),
					group: "Book",
					icon: icons[i],
					bubble: bubble,
					action: doBubbleFunc
				});
			}
		}
		bubbles = undefined;
	};
	
	addOptionalActions = function(actions) {
		if (Core.config.model === "505") {
			actions.push({
				name: "NextSong",
				title: L("ACTION_NEXT_SONG"),
				group: "Other",
				icon: "NEXT_SONG",
				action: function () {
					model.doGotoNextSong();
				}
			},
			{
				name: "PreviousSong",
				title: L("ACTION_PREVIOUS_SONG"),
				group: "Other",
				icon: "PREVIOUS_SONG",
				action: function () {
					model.doGotoPreviousSong();
				}
			},
			{
				name: "GotoAudioNode",
				title: L("ACTION_MUSIC_NODE"),
				group: "Other",
				icon: "AUDIO",
				action: function () {
					model.current.gotoNode(Core.ui.nodes.music, model);
				}
			},
			{
				name: "PausePlayAudio",
				title: L("ACTION_PAUSE_PLAY_AUDIO"),
				group: "Other",
				icon: "PAUSE",
				action: function () {
					var container, sandbox, SONG;
					try {
						container = model.container;
						sandbox = container.sandbox;
						SONG = kbook.movieData.mp;
						if (SONG.isPlaying()) {
							SONG.stop();
							sandbox.control = 0;
						} else {
							if (!SONG) {
								// if no current song paused
								return;
							}
							// current song paused
							if (SONG.getDuration() <= SONG.getTime()) {
								// current song at end, so go to next song
								model.doGotoNextSong();
								return;
							}
							// continue current song
							SONG.start();
							sandbox.control = 1;
						}
						// update interface
						sandbox.volumeVisibilityChanged();
					} catch(e) {
						log.error("Error in StandardActions trying to pause/play audio", e);
					}
				}
			},
			{
				name: "GotoPicturesNode",
				title: L("ACTION_PICTURES_NODE"),
				group: "Other",
				icon: "PICTURE_ALT",
				action: function () {
					model.current.gotoNode(Core.ui.nodes.pictures, model);
				}
			});
		}
	};	
	
	// Action Launcher
	actionLauncher = null;
	
	actionLauncherConstruct = function () {
		var optionDef, parent;
		optionDef = {
			name: 'tempOption',
			title: L('ACTION_LAUNCHER'),
			defaultValue: 'default',
			values: kbActions[0], 
			valueTitles: kbActions[1],
			valueIcons: kbActions[2],
			valueGroups: kbActions[3],
			useIcons: true
		};
		parent = this.parent = model.current;
		if (!parent.nodes) parent.nodes = [];
		Core.addonByName.PRSPSettings.createSingleSetting(parent, optionDef, StandardActions);
		this.nodes = parent.nodes.pop().nodes;
	}
	
	StandardActions = {
		name: NAME,
		title: L("TITLE"),
		icon: "SETTINGS",
		optionDefs: [],
		onInit: function () {
			kbActions = Core.addonByName.KeyBindings.getActionDefs();
		},
		onSettingsChanged: function (propertyName, oldValue, newValue, object) {
			// Action Launcher
			if (propertyName === 'tempOption') {
				var actionName2action, parent;
				actionName2action = kbActions[4];
				parent = model.current.parent;
				parent.redirect = true;
				parent.parent.enter(model);
				try {
					actionName2action[newValue].action();
				} catch(ignore) {}
			}
		},
		getAddonNode: function () {
			if (actionLauncher === null) {
				actionLauncher = Core.ui.createContainerNode({
					title: L('ACTION_LAUNCHER'),
					shortName: L('ACTION_LAUNCHER_SHORT'),
					icon: 'FOLDER',
					construct: actionLauncherConstruct
				});
			}
			return actionLauncher;
		},
		actions: [
			{
				name: 'actionLauncher',
				title: L('ACTION_LAUNCHER'),
				group: 'Utils',
				icon: 'SETTINGS',
				action: function () {
					model.current.gotoNode(Core.ui.nodes.StandardActions, model);
				}
			},
			{
				name: "Shutdown",
				title: L("ACTION_SHUTDOWN"),
				group: "Other",
				icon: "SHUTDOWN",
				action: function () {
					model.doDeviceShutdown();
				}
			},
			{
				name: "NextPage",
				title: L("ACTION_NEXT_PAGE"),
				group: "Book",
				icon: "NEXT_PAGE",
				action: function () {
					if (isBookEnabled()) {
						book.doNext();
					} else {
						model.doBlink();
					}
				}
			},
			{
				name: "PreviousPage",
				title: L("ACTION_PREVIOUS_PAGE"),
				group: "Book",
				icon: "PREVIOUS_PAGE",
				action: function () {
					if (isBookEnabled()) {
						book.doPrevious();
					} else {
						model.doBlink();
					}
				}
			},
			{
				name: "NextInHistory",
				title: L("ACTION_NEXT_IN_HISTORY"),
				group: "Book",
				icon: "NEXT",
				action: function () {
					if (isBookEnabled()) {
						doHistory(-1);
					} else {
						model.doBlink();
					}
				}
			},
			{
				name: "PreviousInHistory",
				title: L("ACTION_PREVIOUS_IN_HISTORY"),
				group: "Book",
				icon: "PREVIOUS",
				action: function () {
					if (isBookEnabled()) {
						doHistory(1);
					} else {
						model.doBlink();
					}
				}
			},
			{
				name: "OpenTOC",
				title: L("ACTION_OPEN_TOC"),
				group: "Book",
				icon: "LIST",
				action: function () {
					var parent = model.current.parent;
					if (isBookEnabled()) {
						parent.gotoNode(parent.nodes[4],model);
					} else {
						model.doBlink();
					}
				}
			}, 
			{
				name: "ContinueReading",
				title: L("ACTION_CONTINUE_READING"),
				group: "Book",
				icon: "CONTINUE",
				action: function () {
					// Show current book
					model.onEnterContinue();
				}
			},
			{
				name: "doRotate",
				title: L("ACTION_doRotate"),
				group: "Other",
				icon: 23,
				action: function () {
					ebook.rotate();
				}
			},
			{
				name: "NoAction",
				title: L("ACTION_NO_ACTION"),
				group: "Other",
				icon: "CROSSED_BOX",
				action:  function () {
					model.doBlink();
				}
			},
			{
				name: "GotoGameNode",
				title: L("ACTION_GAME_NODE"),
				group: "Other",
				icon: "GAME",
				action: function () {
					model.current.gotoNode(Core.ui.nodes.gamesAndUtils, model);
				}
			},
			{
				name: "GotoCollectionsNode",
				title: L("ACTION_COLLECTIONS_NODE"),
				group: "Other",
				icon: "COLLECTION",
				action: function () {
					model.current.gotoNode(Core.ui.nodes.collections, model);
				}
			},
			{
				name: "DeleteCurrentItem",
				title: L("ACTION_DELETE_CURRENT_ITEM"),
				group: "Utils",
				icon: "CROSSED_BOX",
				action: function () {
					var menu, actions, titles;
					actions = [];
					titles = [L('ACTION_DELETE_CURRENT_ITEM'), L('CANCEL')];
					actions.push( function () {
						var node, media, source;
						try {
							if (model.STATE === 'PAGE') {
								model.doDeleteBook();
							} else if (model.STATE === 'SONG') {
								node = model.currentSong;
								media = node.media;
								source = model.cache.getSourceByID(media.sourceid);
								source.deleteRecord(media.id);
								model.addPathToDCL(media.source, media.path);
								node.unlockPath();
								FileSystem.deleteFile(media.source.path + media.path);
								kbook.root.update(model);
							} else if (model.STATE === 'PICTURE') {
								node = model.current;
								media = node.media;
								source = model.cache.getSourceByID(media.sourceid);
								source.deleteRecord(media.id);
								model.addPathToDCL(media.source, media.path);
								node.unlockPath();
								FileSystem.deleteFile(media.source.path + media.path);
								kbook.root.update(model);
							} else {
								Core.ui.doBlink();
							}
						} catch(e) {
							log.error("Error in StandardActions trying to delete current item", e);
						}
					});
					actions.push( function () {
						return false;
					});
					menu = Core.popup.createSimpleMenu(titles, actions);
					Core.popup.showMenu(menu);
				}
			},
			{
				name: "GotoLink",
				title: L("ACTION_GOTO_LINK"),
				group: "Book",
				icon: "NEXT_PAGE",
				action: function () {
					if (isBookEnabled()) {
						book.doCenter();
					} else {
						model.doBlink();
					}
				}
			}
		]
	};
	
	// Optional actions depending on the model  
	try {
		addBubbleActions(StandardActions.actions);
		addOptionalActions(StandardActions.actions);
	} catch (e) {
		log.trace("Failed to add optional/bubble actions " + e);
	}
	Core.addAddon(StandardActions);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in StandardActions.js", e);
}