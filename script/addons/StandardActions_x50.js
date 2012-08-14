// Name: Standard Actions for models 350, 600, 650, 950
// Description: Provides built-in actions like "shutdown", "next page" etc
// Author: kartu
//
// History:
//	2010-06-27 kartu - Adapted for 300 from former KeyBindings addon
//	2010-11-28 kartu - 600: Implemented #31 "Use Volume buttons to move through history"
//				300: Fixed "next/prev" page actions consuming "goto page" key events
//	2010-02-05 kartu - Changed direct function calls with "bubbles" for x50
//	2011-02-10 kartu - Implemented # goto TOC, doOption, doSearch, doRotate, doMenu, doSize, doRoot actions
//	2011-02-27 kartu - x50: Added rotate by 0 / 90 / 180 / 270 / clock wise / counter clock wize actions
//	2011-02-27 kartu - 600: Added rotate by 90 action
//	2011-10-27 Mark Nord - Added doPowerSwitch = Sleepmode
//  2011-10-30 Ben Chenoweth - Added goZoomPage
//	2012-02-06 Ben Chenoweth - Added No Action, Goto various nodes, Delete Current Item, Play/Pause Audio
//	2012-02-20 quisvir - Added Action Launcher; code cleaning
//	2012-02-23 Ben Chenoweth - Added Toggle Notes Toolbar
//	2012-03-13 Ben Chenoweth - Fix for issue #321
//	2012-04-23 drMerry - Moved shutdown and standby to System folder (actions)

var tmp = function() {
	var L, log, NAME, StandardActions, model, book, doHistory, isBookEnabled, addBubbleActions, addOptionalActions,
		doBubble, doBubbleFunc, actionLauncher, actionLauncherConstruct, kbActions;
		
	NAME = "StandardActions";
	L = Core.lang.getLocalizer(NAME);
	log = Core.log.getLogger(NAME);

	// Shortcuts
	model = kbook.model;
	book = model.container.sandbox.PAGE_GROUP.findContent('PAGE');
	
	isBookEnabled = function() {
		return book.isEnabled();
	};
	
	// Generic "bubbling" code, bubbles using currently focused item;
	doBubble = function(cmd, param) {
		var currentNode, focus;
		currentNode = model.currentNode;
		if (currentNode) {
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
		var bubbles, bubble, icons, i, m, n, rotateFuncX50, groups;
		bubbles = ["doOption", "doSearch", "doRotate", "doMenu", "doSize"    , "doRoot"   ];
		icons   = ["EMPTY"   , "SEARCH"  , "EMPTY"   , "BACK" ,  "TEXT_SCALE", "ROOT_MENU"];
		groups = ["System"   , "Book"  , "Screen"   , "Other" ,  "Book", "Shortcut"];
		i = 0;
		n = bubbles.length;
		for (i, n; i < n; i ++) {
			bubble = bubbles[i];
			if (model[bubble]) {
				actions.push( {
					name: "BubbleAction_" + bubble,
					title: L("ACTION_" + bubble),
					group: groups[i],
					icon: icons[i],
					bubble: bubble,
					action: doBubbleFunc
				});
			}
		}
		bubbles = undefined;
		
		// doRotate for x50
		if (model.onEnterOrientation) {
			rotateFuncX50 = function() {
				var orientation = model.container.getVariable("ORIENTATION");
				if (this.closeCurrentOverlay) {
					this.closeCurrentOverlay();
				}
				switch (this.bubble) {
					case 0:
					case 1:
					case 2:
					case 3:
						if (orientation === this.bubble) {
							orientation = 0;
						} else {
							orientation = this.bubble;
						}
						break;
					case -1:
						// clock wise
						orientation -= 1;
						if (orientation < 0) {
							orientation = 3;
						}
						break;
					case -2:
						// counter clock wise
						orientation += 1;
						if (orientation > 3) {
							orientation = 0;
						}
						break;
				}
				doBubble("doRotate", orientation);
			};
			
			// FIXME model sniffing, there must be a better way
			// On 600 only rotate by 90 is possible
			if (Core.config.model === "600") {
				m = 1;
				n = 2;
			} else {
				m = -2;
				n = 4;
			}
			
			for (i = m; i < n; i++) {
				if (i >= 0) {
					bubble = "doRotate" + 90 * i;
				} else if (i === -2) {
					bubble = "doRotateCCWise";
				} else {
					bubble = "doRotateCWise";
				}
				actions.push( {
					name: "BubbleAction_" + bubble,
					title: L("ACTION_" + bubble),
					group: "Screen",
					bubble: i, 
					action: rotateFuncX50
				});
			}
		}
	};
	
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
	
	addOptionalActions = function(actions) {
		if (Core.config.compat.hasVolumeButtons) {
			actions.push({
				name: "NextSong",
				title: L("ACTION_NEXT_SONG"),
				group: "Utils",
				icon: "NEXT_SONG",
				action: function () {
					model.doGotoNextSong();
				}
			},
			{
				name: "PreviousSong",
				title: L("ACTION_PREVIOUS_SONG"),
				group: "Utils",
				icon: "PREVIOUS_SONG",
				action: function () {
					model.doGotoPreviousSong();
				}
			},
			{
				name: "GotoAudioNode",
				title: L("ACTION_MUSIC_NODE"),
				group: "Shortcut",
				icon: "AUDIO",
				action: function () {
					var node = kbook.music ? kbook.music : kbook.root.getMusicNode();
					model.currentNode.gotoNode(node, model);
				}
			},
			{
				name: "PausePlayAudio",
				title: L("ACTION_PAUSE_PLAY_AUDIO"),
				group: "Utils",
				icon: "PAUSE",
				action: function () {
					// code adapted from x50's songGroup.xml (function "doControl")
					var container, sandbox, SONG;
					try {
						container = model.container;
						sandbox = container.sandbox;
						SONG = kbook.movieData.mp;
						if (SONG.isPlaying()) {
								SONG.stop();
								if (container.getVariable('STANDBY_STATE')) {
									sandbox.control = 0;
								}
						} else {
							if (!container.getVariable('STANDBY_STATE')) {
								// if no current song paused
								model.setVariable('CONTROL', 0);
								return;
							}
							// current song paused
							if (SONG.getDuration() <= SONG.getTime()) {
								// current song at end, so try to go to next song
								if (!model.doGotoNextSong(kbook.movieData, true)) {
									// return to first song and stop
									model.doGotoFirstSong();
									SONG.stop();
									sandbox.control = 0;
									model.setVariable('CONTROL', 0);
									return;
								}
							}
							if (!container.getVariable('FIRST_SONG_STOP_FLAG')) {
								// continue current song
								SONG.start();
								sandbox.control = 1;
							} else {
								// no idea!
								container.setVariable('FIRST_SONG_STOP_FLAG', false);
								sandbox.control = 0;
							}
						}
						// update Audio overlay
						sandbox.volumeVisibilityChanged();
					} catch(e) {
						log.error("Error in StandardActions_x50 trying to pause/play audio", e);
					}
				}
			});
		}
		if (Core.config.model !== "600") {
			actions.push({
				name: "GotoPeriodicalsNode",
				title: L("ACTION_PERIODICALS_NODE"),
				group: "Shortcut",
				icon: "PERIODICALS",
				action: function () {
					model.currentNode.gotoNode(kbook.root.getPeriodicalListNode(), model);
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
		parent = this.parent = model.currentNode;
		if (!parent.nodes) { parent.nodes = []; }
		Core.addonByName.PRSPSettings.createSingleSetting(parent, optionDef, StandardActions);
		this.nodes = parent.nodes.pop().nodes;
	};
	
	StandardActions = {
		name: NAME,
		title: L("TITLE"),
		icon: "SETTINGS",
		optionDefs: [],
		onInit: function () {
			kbActions = Core.addonByName.KeyBindings.getActionDefs();
		},
		onSettingsChanged: function (propertyName, oldValue, newValue, object) {
		  //TODO olValue is unused, object is unused
			// Action Launcher
			if (propertyName === 'tempOption') {
				var actionName2action, parent;
				actionName2action = kbActions[4];
				parent = model.currentNode.parent;
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
		// FIXME: check if more actions could be "bublized" 
		actions: [
			{
				name: 'actionLauncher',
				title: L('ACTION_LAUNCHER'),
				group: 'Utils',
				icon: 'SETTINGS',
				action: function () {
					model.currentNode.gotoNode(Core.ui.nodes.StandardActions, model);
				}
			},
			{
				name: "Shutdown",
				title: L("ACTION_SHUTDOWN"),
				group: "System",
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
				bubble: "doNext",
				action: doBubbleFunc				
			},
			{
				name: "PreviousPage",
				title: L("ACTION_PREVIOUS_PAGE"),
				group: "Book",
				icon: "PREVIOUS_PAGE",
				bubble: "doPrevious",
				action: doBubbleFunc
			},
			{
				name: "NextInHistory",
				title: L("ACTION_NEXT_IN_HISTORY"),
				group: "Book",
				icon: "NEXT",
				action: function () {
					if (isBookEnabled()) {
						doHistory(-1);
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
					}
				}
			},
			{
				name: "ContinueReading",
				title: L("ACTION_CONTINUE_READING"),
				group: "Book",
				icon: "CONTINUE",
				action: function () {
					var current;
					current = kbook.model.currentBook;
					if (current) {
						// Show current book
						model.onEnterContinue();
					} else {
						model.doBlink();
					}
				}
			},
			{
				name: "Standby",
				title: L("ACTION_STANDBY"),
				group: "System",
				icon: "STANDBY",
				bubble: "doPowerSwitch",
				action: doBubbleFunc
			},
			{
				name: "NoAction",
				title: L("ACTION_NO_ACTION"),
				group: "Other",
				icon: "EMPTY",
				action:  function () {
					model.doBlink();
				}
			},
			{
				name: "GotoMoreNode",
				title: L("ACTION_MORE_NODE"),
				group: "Shortcut",
				icon: "ROOT_MENU",
				action: function () {
					model.currentNode.gotoNode(Core.ui.nodes.more, model);
				}
			},
			{
				name: "GotoGameNode",
				title: L("ACTION_GAME_NODE"),
				group: "Shortcut",
				icon: "GAME",
				action: function () {
					model.currentNode.gotoNode(Core.ui.nodes.games, model);
				}
			},
			{
				name: "GotoPicturesNode",
				title: L("ACTION_PICTURES_NODE"),
				group: "Shortcut",
				icon: "PICTURE_ALT",
				action: function () {
					var node = kbook.pictures ? kbook.pictures : kbook.root.getPicturesNode();
					model.currentNode.gotoNode(node, model);
				}
			},
			{
				name: "GotoCollectionsNode",
				title: L("ACTION_COLLECTIONS_NODE"),
				group: "Shortcut",
				icon: "COLLECTION",
				action: function () {
					model.currentNode.gotoNode(Core.ui.nodes.collections, model);
				}
			},
			{
				name: "GotoNotesNode",
				title: L("ACTION_NOTES_NODE"),
				group: "Shortcut",
				icon: "TEXT_MEMO",
				action: function () {
					var node = kbook.notepadsText ? kbook.notepadsText : kbook.root.getNotepadsTextNode();
					model.currentNode.gotoNode(node, model);
				}
			},
			{
				name: "GotoFreehandNode",
				title: L("ACTION_FREEHAND_NODE"),
				group: "Shortcut",
				icon: "HANDWRITING_ALT",
				action: function () {
					var node = kbook.notepadsFreehand ? kbook.notepadsFreehand : kbook.root.getNotepadsFreehandNode();
					model.currentNode.gotoNode(node, model);
				}
			},
			{
				name: "DeleteCurrentItem",
				title: L("ACTION_DELETE_CURRENT_ITEM"),
				group: "Utils",
				icon: "CROSSED_BOX",
				action: function () {
					var node, dialog, message, current;
					try {
						node = model.currentNode;
						current = false;
						if (node) {
							dialog = model.getConfirmationDialog();
							dialog.target = model;
							if (model.closeContentsList) {
								message = 'fskin:/l/strings/STR_UI_MESSAGE_DELETE_MANUALLY_NORMAL'.idToString();
							} else {
								// 600
								message = 'fskin:/l/strings/DIALOGMSG_CONFIRM_OPT_DELETE_ALLMYNOTES2'.idToString();
							}
							dialog.onNo = function () { };
							if (model.STATE === 'PAGE') {
								current = true;
								if (!model.closeContentsList) {
									// 600
									message = 'fskin:/l/strings/STR_UI_MESSAGE_DELETEBOOK'.idToString();
								}
								dialog.onOk = function () {
									var node;
									if (model.closeContentsList) {
										node = model.currentNode;
										model.doDeleteBook(true, node);
										kbook.root.update(model);
										model.closeContentsList(true);
									} else {
										// 600
										model.doDeleteBook();
									}
								};
							} else if (model.STATE === 'SONG') {
								current = true;
								dialog.onOk = function () {
									var node = model.currentNode;
									if (model.removeSong) {
										model.removeSong(node);
										kbook.root.update(model);
										if (node.equal(model.currentNode)) {
											model.closeContentsList(true);
										} else {
											model.currentNode.gotoNode(albumList, model);
										}
									} else {
										// 600
										model.onRemove(node);
									}
								};
							} else if (model.STATE === 'PICTURE') {
								current = true;
								if (kbook.standbyPicture.isExist(node)) {
									message = 'fskin:/l/strings/STR_UI_MESSAGE_DELETE_MANUALLY_SELECTED_AS_STANDBY'.idToString();
								}
								dialog.onOk = function () {
									var node, media, source;
									node = model.currentNode;
									if (model.removePicture) {
										model.removePicture(node);
										kbook.root.update(model);
										model.closeContentsList(true);
									} else {
										// 600
										media = node.media;
										source = media.source;
										source.deleteRecord(media.id);
										FileSystem.deleteFile(media.source.path + media.path);
										kbook.root.update(model);
									}
								};
							}
							if (current) {
								dialog.openDialog(message, 0);
							} else {
								Core.ui.doBlink();
							}
						}
					} catch(e) {
						log.error("Error in StandardActions_x50 trying to delete current item", e);
					}
				}
			},
			{
				name: "OpenTOC",
				title: L("ACTION_OPEN_TOC"),
				group: "Book",
				icon: "LIST",
				action: function() {
					var toc = kbook.bookOptionRoot.contents;
					if (toc) {
						model.gotoBookOptionList(toc);
					} else {
						model.doBlink();
					}
				}
			},
			{
				name: "OpenNotes",
				title: L("ACTION_OPEN_NOTES_LIST"),
				group: "Book",
				icon: "NOTES",
				action: function() {
					var notes = kbook.bookOptionRoot.notes;
					if (notes) {
						model.gotoBookOptionList(notes);
					} else {
						model.doBlink();
					}
				}
			},
			{
				name: "ToggleNotesToolbar",
				title: L("ACTION_TOGGLE_NOTES_TOOLBAR"),
				group: "Book",
				icon: "NOTES",
				action: function() {
					pageOptionToolbarOverlayModel.onOptionToolbar();
				}
			},
			{
				name: "ZoomPage",
				title: L("ACTION_ZOOM_PAGE"),
				group: "Book",
				icon: "SEARCH_ALT",
				action: function() {
				   pageSizeOverlayModel.openCurrentOverlay();
				   pageSizeOverlayModel.goZoomMode();
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