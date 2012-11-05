// Name: Browse Folders
// Description: Adds "Browse Folders" menu option
// Author: kartu
//
// History:
//	2010-03-06 kartu - Added mount/umount feature
//	2010-03-07 kartu - Prepared for localization
//	2010-03-14 kartu - Refactored Utils -> Core
//	2010-03-14 kartu - Localized
//	2010-04-24 kartu - Prepared for merging into single JS
//	2010-04-25 kartu - Marked FolderNode and browseFoldersNode._myconstruct as constructors
//	2010-04-27 kravitz - Exported pathToBookNode() (fixing required)
//	2010-04-27 kravitz - Code of main menu forming is moved to MenuTuning.js
//	2010-04-29 kravitz - Refactored events handling
//	2010-05-15 kartu - Fixed: book list was initialized once and never updated
//	2010-05-24 kartu - Fixed weird bug "after deleting collection reader jumps to main menu, instead of collection" (fix by kravitz) that occured only if there was no SD card
//	2010-07-06 kartu - Rewritten from scratch, added "favourite folders" and picture,music,notes support
//	2010-09-29 kartu - Fixed: only existing roots will be shown in BrowseFolders (i.e. SD card won't be shown, if it is not inserted) 
//	2010-11-30 kartu - Refactoring Core.stirng => Core.text
//	2011-01-31 kartu - Removed comment field (fix for x50)
//	2011-02-04 kartu - Added trailing / to SD/MS/other roots check path
//	2011-02-06 kartu - Implemented #55 "'Jump to Folders' action"
//	2011-02-07 kartu - Implemented # sort by filename, showing filename as comment
//	2011-02-09 kartu - Fixed # BrowseFolders view not updated when settings change
//			Removed "mount" option
//	2011-03-03 kartu - Added support for converters/alternative viewers
//	2011-04-24 kartu - Added option to disable scanning without loading cache
//	2011-04-25 kartu - Added "via mount" option for SD/MS card access
//	2011-06-18 kartu - Reverted old "BrowseFolders view not updated" (2011-02-09) fix as it shouldn't be needed with correctly working ContainerNode.update()
//	2011-06-26 kartu - Applied Shura1oplot's changes (".." item, action grouping, more icons)
//	2011-08-10 Shura1oplot - Added show file size in comment option
//	2011-09-16 Mark Nord - Added FileType & FileSize to FileName in comment
//	2011-10-09 kartu - ALL: Fixed #171 "The "Copy to IM..." menu items are not present in Card via Mount, if card scanning is not disabled"
//	2011-11-13 kartu - ALL: Fixed bug that prevented SD/MS card scan mode from being changed on the fly
//			x50: Fixed bug that caused SD/MS card scan options to be ignored on the first boot
//	2011-11-14 kartu - ALL: Fixed #214 MSG_COPYING_BOOK not translated
//	2011-11-15 Mark Nord - ALL: Fixed Fix #214 there is another one in Line 248
//	2011-11-20 kartu - Fixed #215 fb2epub converter doesn't work with cards with disabled scanning
//	2011-12-08 Ben Chenoweth - Archive support (using on Shura1oplot's code); added CBZ and CBR to supported archives
//	2011-12-12 kartu - Changed mounted card order to SD/MS from MS/SD
//	2011-12-14 quisvir - Added preliminary archive browsing support (alpha)
//	2011-12-14 Ben Chenoweth - Correct icons for archive contents; temp files deleted
//	2011-12-16 Ben Chenoweth - Archives on SD/MS listable (in mount mode); CBR/CBZ (now with icon) on IM readable with NEXT/PREV buttons
//	2011-12-17 Ben Chenoweth - Archives page index now correct; remembers zoom on NEXT
//	2011-12-18 Ben Chenoweth - Flush archive items from library on exiting; move to top left on NEXT
//	2011-12-19 Ben Chenoweth - Options for what to do with books in archive (copy to IM, copy to IM and open, preview)
//	2011-12-20 Ben Chenoweth - Media deletion after book preview (but HOME not updated); model sniffing for NEXT zooming
//	2011-12-20 Mark Nord - temp. fix for pre 600 models (see line 723)
//	2011-12-21 Ben Chenoweth - Home (partially) updated; previous current book restored correctly
//	2011-12-22 Ben Chenoweth - Archives work on SD and MS in mount and non-mount mode (by going into mount mode)
//	2011-12-26 Mark Nord - adapted for 505 (& probably 300)
//	2011-12-27 Ben Chenoweth - Thumbnails on x50 now removed correctly (for archives in IM)
//	2011-12-28 Ben Chenoweth - Thumbnails on x50 now removed correctly (for archives on SD/MS)
//	2011-12-28 Ben Chenoweth - Initial implementation of audio for x50
//	2011-12-28 Ben Chenoweth - Fixes for image archive browsing on the 600; audio for 600
//	2011-12-29 Ben Chenoweth - Fixes for audio: index, prev/next on 600/x50 (".." node not compatible with shuffle); removed doUnpackHere
//	2011-12-29 Mark Nord - some changes for 300/505; book-preview out of archive disabled due to unexpected results
//	2011-12-20 Ben Chenoweth - Added more checks; localised song-index
//	2012-02-27 Ben Chenoweth - Fix for archives (with no subfolders) on MS/SD
//	2012-02-28 Ben Chenoweth - Update reader when archive closes not after every item
//	2012-03-21 Ben Chenoweth - Added Option menu to Archives (x50)
//	2012-03-31 Ben Chenoweth - Fix for filename as comment and filesize/extension in comment for archives and unscanned files
//	2012-06-23 drMerry - Added Global translation
//	2012-08-12 Mark Nord - moved custom FskCache.diskSupport.ignoreDirs froms bootstrap
//	2012-08-13 drMerry - Updated some code (combination of speed-up and minimize of code)
//	2012-11-05 drMerry - some code improvement
var tmp = function() {
	var log, L, LG, startsWith, trim, BrowseFolders, TYPE_SORT_WEIGHTS, compare, sorter, folderConstruct, 
		createFolderNode, createMediaNode, favourites, loadFavFolders, folderRootConstruct,
		compareFields, supportedMIMEs, supportedArchives, createArchiveNode, createLazyInitNode,
		constructLazyNode, archiveBookNodeEnter, ACTION_ICON, doCopyAndOpen, doCopy, doOpenHere, doOpenSongHere,
		supportedExtensions, supportedComics, supportedAudio, browsingArchive, currentArchivePath, currentNode, oldCurrentBook,
		oldCurrentNode, doGotoParent, browseFoldersNode, setPictureIndexCount, onEnterPicture,
		imageZoomOverlayModel_doNext, imageZoomOverlayModel_onCallback, ENABLED, DISABLED,
		//fuctions
		archiveRootDestruct, archiveRootConstruct, archiveFolderConstruct, archiveFolderDestruct, archiveItemDestruct,
		doArchiveCopy, doArchiveCopyAndOpen, oldDoGotoNextPicture, oldDoGotoPreviousPicture, oldOnEnterPicture,
		oldSetPictureIndexCount, archiveDummyEnter,
		oldPlaySongCallback, newDoGotoFirstSong, newDoGotoPreviousSong;
		
	ENABLED = "enabled";
	DISABLED = "disabled";
	log = Core.log.getLogger("BrowseFolders");
	L = Core.lang.getLocalizer("BrowseFolders");
	LG = Core.lang.getLocalizer("Global");
	startsWith = Core.text.startsWith;
	trim = Core.text.trim;
	supportedMIMEs = Core.media.supportedMIMEs;
	supportedArchives = Core.archiver.supportedArchives;
	supportedExtensions = Core.media.supportedExtensions;
	supportedComics = Core.media.supportedComics;
	supportedAudio = Core.media.supportedAudio;
	browsingArchive = false;
	currentNode = null;
	oldCurrentBook = null;
	oldCurrentNode = null;
	ACTION_ICON = "BACK";
	//-----------------------------------------------------------------------------------------------------------------------------
	// Sorting
	//-----------------------------------------------------------------------------------------------------------------------------
	TYPE_SORT_WEIGHTS = {
		folder: -100,
		book: -50,
		picture: -25,
		audio: -10,
		note: 0,
		file: 0
	};

	// Which fields to use for comparison
	compareFields = {
		"author": ["author", "titleSorter", "title"],
		"title": ["titleSorter", "title"],
		filename: ["path"],
		filenameAsComment: ["path"]
	};
	
	compare = Core.config.compat.compareStrings;
	sorter = function (a, b) {
		var compFields, i, n, result, field;
		try {
			if (a.type !== b.type) {
				// directories first, etc
				return TYPE_SORT_WEIGHTS[a.type] - TYPE_SORT_WEIGHTS[b.type];
			}
			if (a.type === "folder") {
				return compare(a.name, b.name);
			}
			if (a.hasOwnProperty("media") && b.hasOwnProperty("media")) {
				compFields = compareFields[BrowseFolders.options.sortMode];
				// compare fields until values don't match
				for (i = 0, n = compFields.length; i < n; i++) {
					field = compFields[i];
					result = compare(a.media[field], b.media[field]);
					if (result !== 0) {
						break;
					}
				}
				return result;
			}
			return compare(a.name, b.name);
		} catch (e) {
			log.error("in sortByTitle : " + e);
		}
	}; 

	//-----------------------------------------------------------------------------------------------------------------------------
	// Node creation
	//-----------------------------------------------------------------------------------------------------------------------------
	
	createFolderNode = function (path, title, parent, icon, needsMount) {
		try {
			if (icon === undefined) {
				icon = "FOLDER";
			}
			var node = Core.ui.createContainerNode({
					title: title,
					icon: icon,
					parent: parent,
					construct: folderConstruct
			});
			node.path = path + "/";
			node.type = "folder";
			node.needsMount = needsMount;
			// Model sniffing: enable search on x50
			if (kbook.iconKindField) {
				node.iconKind = node.kind;
				node.kind = 17;
				node.onSearch = 'onSearchDefault';
				node.match = function (term) {
					return this.name.toLowerCase().indexOf(term) !== -1;
				};
			}
			return node;
		} catch (e) {
			log.error("in createFolderNode", e);
		}
	};
	
	createLazyInitNode = function (path, title, parent, needsMount) {
		var node, ext;
		if ((needsMount !== undefined) || ((BrowseFolders.options.cardScan === DISABLED) && (!startsWith(path, "/Data")))) {
			// if SD/MS scan is disabled and we are not in internal memory			
			ext = Core.io.extractExtension(path);
			if (ext === "mp3") {
				node = Core.ui.createContainerNode({
					title: title,
					icon: "AUDIO",
					parent: parent,
					construct: constructLazyNode
				});
			} else {
				node = Core.ui.createContainerNode({
						title: title,
						icon: "BOOK_ALT",
						parent: parent,
						construct: constructLazyNode
				});
			}
		} else {
			ext = Core.io.extractExtension(path);
			if (ext === "mp3") {
				node = Core.ui.createContainerNode({
					title: title,
					icon: "AUDIO",
					parent: parent
				});
				node.enter = doOpenSongHere;
			} else {
				node = Core.ui.createContainerNode({
						title: title,
						icon: "BOOK_ALT",
						parent: parent
				});
				node.enter = doOpenHere;
			}
		}
		node.path = path;
		return node;
	};

	createArchiveNode = function (path, title, parent, needsMount) {
		var node, extension, icon;
		extension = Core.io.extractExtension(path);
		if (supportedComics[extension]) {
			icon = "COMIC";
		} else {
			icon = "ARCHIVE";
		}
		node = Core.ui.createContainerNode({
			title: title,
			parent: parent,
			icon: icon,
			needsMount: needsMount,
			construct: archiveRootConstruct,
			destruct: archiveRootDestruct
		});
		node.path = path;

		// activate options menu (x50)
		if (kbook.iconKindField) {
			node.iconKind = node.kind;
			node.kind = 17;
		}
		
		return node;
	};
		
	createMediaNode = function (path, title, parent, dummy, needsMount) {
	  //TODO dummy is unused
		var node, mime, extension, size, sizeStr;
		node = needsMount !== undefined ? null : Core.media.createMediaNode(path, parent);
		extension = Core.io.extractExtension(path);
		sizeStr = "";

		// Size in comment
		if ((BrowseFolders.options.fileSizeInComment === ENABLED) || (BrowseFolders.options.sortMode === "filenameAsComment")) {
			size = Core.io.getFileSize(path) / 1024;
			if (size > 1024) {
				size /= 1024;
				sizeStr = size.toFixed(1) + " MB";
			} else {
				sizeStr = size.toFixed(0) + " KB";
			}
		}
		if (node === null) {
			// Either file that is not a media, or unscanned
			mime = FileSystem.getMIMEType(path);
			if ((supportedMIMEs[mime]) || (supportedAudio[extension])) {
			  node = createLazyInitNode(path, title, parent, needsMount);
			} else if (supportedArchives[extension]) {
			  node = createArchiveNode(path, title, parent, needsMount);
			} else {
			  // or convertable, 
			  // convertable node needs media constructor for converted file
			  node = Core.convert.createMediaNode(path, title, parent, createMediaNode, needsMount);
			}
			if (node) {
				if (BrowseFolders.options.sortMode === "filenameAsComment") {
					if (BrowseFolders.options.fileSizeInComment === ENABLED) {
						node._mycomment = function() {
							try {
								if (this.path) {
									return Core.io.extractFileName(this.path) + ", " + sizeStr + ", [" + extension + "]";
								} else {
									return sizeStr + ", [" + extension + "]";
								}
							} catch (e) {
								return "error: " + e;
							}
						};
					} else {
						node._mycomment = function() {
							try {
								if (this.path) {
									return Core.io.extractFileName(this.path);
								} else {
									return "";
								}
							} catch (e) {
								return "error: " + e;
							}
						};
					}
				} else {
					if (BrowseFolders.options.fileSizeInComment === ENABLED) {
						node._mycomment = function() {
							try {
								return sizeStr + ", [" + extension + "]";
							} catch (e) {
								return "error: " + e;
							}
						};
					} else {
						node._mycomment = function() {
							try {
								return "";
							} catch (e) {
								return "error: " + e;
							}
						};
					}
				}
			}
		} else if (BrowseFolders.options.sortMode === "filenameAsComment") {
			if (BrowseFolders.options.fileSizeInComment === ENABLED) {
				node._mycomment = function() {
					try {
						if (this.media) {
							return Core.io.extractFileName(this.media.path) + ", " + sizeStr + ", [" + extension + "]";
						} else {
							return sizeStr + ", [" + extension + "]";
						}
					} catch (e) {
						return "error: " + e;
					}
				};
			} else {
				node._mycomment = function() {
					try {
						if (this.media) {
							return Core.io.extractFileName(this.media.path);
						} else {
							return "";
						}
					} catch (e) {
						return "error: " + e;
					}
				};

			}
		} else if (BrowseFolders.options.fileSizeInComment === ENABLED) {
			node._mycomment = function() {
				return this.comment + ", " + sizeStr + ", [" + extension + "]";
			};
		}
		if (node) {
			node.needsMount = needsMount;
		}
		return node;
	};
	
	//-----------------------------------------------------------------------------------------------------------------------------
	// "Lazy" opening of media in place, for disabled scanning with loaded cache case
	//-----------------------------------------------------------------------------------------------------------------------------	
	doOpenHere = function() {
		var path, item, parent, mediaNode;
		
		// create media
		parent = this.parent;
		path = this.path;
		try {
			item = Core.media.loadMedia(path);
		} catch (ignore) {
			Core.ui.showMsg(L("MSG_ERROR_OPENING_BOOK"));
		}
		
		if (item) {
			// create node
			mediaNode = Core.media.createMediaNode(item, parent);
	
			// replace parent with media node
			Core.utils.replaceInArray(parent.nodes, this, mediaNode); 
			
			this.gotoNode(mediaNode, kbook.model);
		}
	};
	
	doOpenSongHere = function() {
		var path, item, parent, mediaNode;
		
		// create media
		parent = this.parent;
		path = this.path;
		try {
			item = Core.media.loadMedia(path);
		} catch (ignore) {
			Core.ui.showMsg(L("MSG_ERROR_OPENING_BOOK"));
		}
		
		if (item) {
			// create node
			mediaNode = Core.media.createMediaNode(item, parent);
	
			// replace parent with media node
			Core.utils.replaceInArray(parent.nodes, this, mediaNode); 
			
			// initialise shuffleList
			try {
				if (parent.shuffleList) {
					if (parent.shuffleList.initialize) {
						parent.shuffleList.initialize(parent.nodes.length);
					}
				}
			} catch(ignored) {}
			
			this.gotoNode(mediaNode, kbook.model);
		}
	};
	
	doCopy = function () {
		var fileName, path, needsMount;
		Core.ui.showMsg(L("MSG_COPYING_BOOK"), 1);
		try {
			// mount, if needed
			needsMount = this.parent.needsMount;
			if (needsMount !== undefined) {
				Core.shell.mount(needsMount);
			}
			
			try {
				path = this.parent.path;
				fileName = Core.io.extractFileName(path);
				// FIXME: ask user first, if he wants to copy the book, if target exists
				fileName = Core.io.getUnusedPath("/Data" + BrowseFolders.options.imRoot + "/", fileName);
				Core.io.copyFile(path, fileName);
				return fileName;
			} finally {
				Core.shell.umount(needsMount);
			}
		} catch (ignore) {
			Core.ui.showMsg(L("MSG_ERROR_COPYING_BOOK"));	
		}
	};
	
	doCopyAndOpen = function () {
		var path, foldersNode, nodes, targetFolder, imNode, i, n;
		// Copy the file and get new filename
		path = doCopy.call(this);
		targetFolder = Core.io.extractPath(path);
		
		// find IM root node
		foldersNode = BrowseFolders.getAddonNode();
		nodes = foldersNode.nodes;
		imNode = null;
		for (i = 0, n = nodes.length; i < n; i++) {
			if (nodes[i].path === targetFolder) {
				imNode = nodes[i];
				break;
			}
		}
		
		// If IM root node not found, goto folders node
		if (imNode) {
			// goto IM node to allow it to construct children
			this.gotoNode(imNode, kbook.model);
			imNode.update();
			
			// Find element with matching path, if found, enter
			nodes = imNode.nodes;
			for (i = 0, n = nodes.length; i < n; i++) {
				if (path === nodes[i].path) {
					imNode.gotoNode(nodes[i], kbook.model);
					break;
				}
			}
		} else {
			this.gotoNode(foldersNode, kbook.model);
		}
	};
	
	archiveRootConstruct = function () {
		var d, f, list, i;
		
		try {
			this.insidePath = '';
			currentArchivePath = this.path;
			
			// Create and fill currentArchive object
			kbook.model.currentArchive = {
				path: this.path,
				needsMount: this.needsMount,
				parent: this.parent,
				dirs: [],
				files: []
			};
			d = kbook.model.currentArchive.dirs;
			f = kbook.model.currentArchive.files;
			
			// If browsing SD or MS but not in Mount mode - IS THIS WHAT ARE WE SUPPOSED TO DO IN THIS SITUATION?
			if (startsWith(kbook.model.currentArchive.path, "a:")){
				kbook.model.currentArchive.path = kbook.model.currentArchive.path.replace("a:", "/opt/mnt/ms");
				kbook.model.currentArchive.needsMount = 1;
			} else if (startsWith(kbook.model.currentArchive.path, "b:")) {
				kbook.model.currentArchive.path = kbook.model.currentArchive.path.replace("b:", "/opt/mnt/sd");
				kbook.model.currentArchive.needsMount = 0;
			}

			if (kbook.model.currentArchive.needsMount !== undefined) {
				Core.shell.mount(kbook.model.currentArchive.needsMount);
			}
			
			list = Core.archiver.list(kbook.model.currentArchive.path).split('\n');
			i = 0;
			for (i; i < list.length; i++) {
				switch (list[i].slice(0,1)) {
					case 'f':
						f.push(list[i].split('\t')[2]);
						break;
					case 'd':
						d.push(list[i].split('\t')[2]);
						break;
				}
			}
			d.sort();
			f.sort();
		} catch(e) {
			log.error("Error in archiveRootConstruct",e);
		} finally {
			if (kbook.model.currentArchive.needsMount !== undefined) {
				Core.shell.umount(kbook.model.currentArchive.needsMount);
			}
		}
		
		// Call general construct function
		archiveFolderConstruct.call(this);		
	};

	archiveRootDestruct = function () {
		var parent, path;
		try {
			browsingArchive = false;
			parent = this.parent;
			path = parent.path + '~temp~/';
			Core.io.deleteDirectory(path);
			kbook.model.currentArchive = null;
			this.nodes = null;
			kbook.root.update(kbook.model);
		} catch(e) {
			log.error("Error in archiveRootDestruct", e);
		}
	};
	
	// Archive menu option to delete current archive, called from main.xml (x50)
	if (kbook.iconKindField) {
		kbook.model.container.sandbox.OPTION_OVERLAY_PICTURE.sandbox.doDeleteArchive = function () {
			var currentArchive, path, dialog;
			currentArchive = kbook.model.currentArchive;
			path = currentArchive.path;
			this.doOption();
			if (path) {
				dialog = kbook.model.getConfirmationDialog();
				dialog.target = this;
				dialog.onOk = function () {
					var path, parent, needsMount, cn;
					path = currentArchive.path;
					parent = currentArchive.parent;
					
					try {
						// mount, if needed
						needsMount = currentArchive.needsMount;
						if (needsMount !== undefined) {
							Core.shell.mount(needsMount);
						}
						Core.io.deleteFile(path);
						if (needsMount !== undefined) {
							Core.shell.umount(needsMount);
						}
					} catch(e) { log.trace("Error deleting archive file: ", e); }
					
					// move to archive's parent node (triggering deletion of archive content)
					cn = Core.ui.getCurrentNode();
					if (cn) {
						cn.gotoNode(parent, kbook.model);
					} else {
						this.gotoNode(foldersNode, kbook.model);
					}
				};
				dialog.onNo = function () {
					Core.ui.doBlink();
				};
				dialog.openDialog(L('DELETE_ARCHIVE'), 0);
			}
		};
		
		kbook.model.container.sandbox.OPTION_OVERLAY_COLLECTION.sandbox.doDeleteArchive = function () {
			var currentArchive, path, dialog;
			//unused cn
			currentArchive = kbook.model.currentArchive;
			path = currentArchive.path;
			this.doOption();
			if (path) {
				dialog = kbook.model.getConfirmationDialog();
				dialog.target = this;
				dialog.onOk = function () {
					var path, parent, needsMount, cn;
					path = currentArchive.path;
					parent = currentArchive.parent;
					
					try {
						// mount, if needed
						needsMount = currentArchive.needsMount;
						if (needsMount !== undefined) {
							Core.shell.mount(needsMount);
						}
						Core.io.deleteFile(path);
						if (needsMount !== undefined) {
							Core.shell.umount(needsMount);
						}
					} catch(e) { log.trace("Error deleting archive file: ", e); }
					
					// move to archive's parent node (triggering deletion of archive content)
					cn = Core.ui.getCurrentNode();
					if (cn) {
						cn.gotoNode(parent, kbook.model);
					} else {
						this.gotoNode(foldersNode, kbook.model);
					}
				};
				dialog.onNo = function () {
					Core.ui.doBlink();
				};
				dialog.openDialog(L('DELETE_ARCHIVE'), 0);
			}
		};
	}
	
	archiveFolderConstruct = function () {
		var currentArchive, node, nodes, d, f, path, i, ext, fileIcon, fLength, dLength,
		enterAction;
		currentArchive = kbook.model.currentArchive;
		nodes = this.nodes = [];
		d = currentArchive.dirs;
		f = currentArchive.files;
		path = this.insidePath;
		
		i=0;
		dLength = d.length;
		// Create folder nodes
		for (i; i < dLength; i++) {
			idx = d[i].indexOf(path);
			if (idx === 0) {
				rest = d[i].slice(idx + path.length);
				if (rest && rest.indexOf('/') === -1) {
					node = Core.ui.createContainerNode({
						title: rest,
						icon: 'FOLDER',
						parent: this,
						construct: archiveFolderConstruct,
						destruct: archiveFolderDestruct
					});
					node.insidePath = path + rest + '/';
					if (!currentArchive.needsMount) {
						node.needsMount = currentArchive.needsMount;
					} else {
						node.needsMount = this.parent.needsMount;
					}
					
					// activate options menu (x50)
					if (kbook.iconKindField) {
						node.iconKind = node.kind;
						node.kind = 17;
					}

					nodes.push(node);
				}
			}
		}
		
		i=0;
		fLength = f.length;
		// Create file nodes
		for (i; i < fLength; i++) {
			idx = f[i].indexOf(path);
			if (idx === 0) {
				rest = f[i].slice(idx + path.length);
				if (rest && rest.indexOf('/') === -1) {
					ext = Core.io.extractExtension(rest);
					switch (ext) {
						case 'rtf':
						case 'pdf':
						case 'epub':
						case 'lrf':
						case 'fb2':
						case 'txt':
							fileIcon = 'BOOK_ALT';
							enterAction = archiveBookNodeEnter;
							break;
						case 'jpg':
						case 'jpeg':
						case 'png':
						case 'bmp':
						case 'gif':
							fileIcon = 'PICTURE_ALT';
							enterAction = archiveDummyEnter;
							break;
						default:
							fileIcon = 'CROSSED_BOX';
							break;
					}
					if (fileIcon !== 'CROSSED_BOX') {
						node = Core.ui.createContainerNode({
							title: rest,
							icon: fileIcon,
							parent: this
						});
						node.enter = enterAction;
						node.insidePath = f[i];
						if (!currentArchive.needsMount) {
							node.needsMount = currentArchive.needsMount;
						} else {
							node.needsMount = this.parent.needsMount;
						}
						nodes.push(node);
					} else {
						// hide other files
					}
				}
			}
		}
	};
	
	archiveFolderDestruct = function () {
		var currentArchive, nodes;
		//unused i, file, item, n, source, bookNode
		currentArchive = kbook.model.currentArchive;
		try {
			browsingArchive = false;
			// remove files from library
			path = Core.io.extractPath(currentArchive.path) + '~temp~/';
			if (this.nodes) {			
				this.nodes = null;
			}
		} catch(e) {
			log.error("Error in archiveFolderDestruct", e);
		}
	};
	
	archiveItemDestruct = function (model) {
		var node, current, path, media, source;
		//unused item
		try {
			node = this;
			current = kbook.model.currentBook;
			// check if preview item is the current book
			if ((current) && (current.media)) {
				// 300/505 doDeleteBook deletes only current, so don't reset it
				if (!Core.config.compat.hasNumericButtons && (current.media.path === node.media.path)) {
					// set current book to null
					kbook.model.currentBook.media.close(kbook.bookData);
					kbook.bookData.setData(null);
				}
			}
			mime = FileSystem.getMIMEType(node.media.path);
			if (supportedMIMEs[mime]) {
				// delete temp book
				kbook.model.doDeleteBook(false, this);  // also deletes item from BookHistory
				try {
					kbook.model.updateData();
				} catch (ignore) {} // no such function for 300/505
			} else {
				media = node.media;
				source = media.source;
				source.deleteRecord(media.id);
			}
		} catch(e) {
			log.error("Error in archiveItemDestruct trying to reset currentbook and delete book or delete item from library", e);
		}
		try {
			// delete temporary directory
			path = Core.io.extractPath(currentArchivePath) + '~temp~/';
			// need to convert mounted paths to unmounted paths
			path = path.replace("/opt/mnt/ms", "a:");
			path = path.replace("/opt/mnt/sd", "b:");
			if (Core.io.pathExists(path)) {
				Core.io.emptyDirectory(path);
				Core.io.deleteDirectory(path);
			}
		} catch(err) {
			log.error("Error in archiveItemDestruct trying to delete temp directory", err);
		}
		// standard node.exit code:
		if (this.onExit) {
			model[this.onExit](this);
		}
		if (oldCurrentBook) {
			// restore previous current book (if there was one)
			Core.ui.setCurrentNode(oldCurrentNode);
			kbook.model.onChangeBook(oldCurrentBook);
		}
		//kbook.root.update(kbook.model);
	};
	
	archiveDummyEnter = function () {
		var currentArchive, path, file, node, needsMount, mime, media, source;
		currentArchive = kbook.model.currentArchive;
		try {
			// mount, if needed
			needsMount = this.needsMount;
			if (needsMount !== undefined) {
				Core.shell.mount(needsMount);
			}
			path = Core.io.extractPath(currentArchive.path) + '~temp~/';
			file = path + Core.io.extractFileName(this.insidePath);

			// Extract file from archive
			// TODO clear temp folder whenever possible (before file open, on file close, on startup?)
			FileSystem.ensureDirectory(path);
			Core.io.emptyDirectory(path);
			Core.archiver.unpack(currentArchive.path, path, undefined, this.insidePath);
			if (Core.io.pathExists(file)) {
				mime = FileSystem.getMIMEType(file);
				if (supportedMIMEs[mime]) {
					// Save current book information and close current book
					media = kbook.model.currentBook.media;
					source = kbook.model.cache.getSourceByID(media.sourceid);
					source.commit();
					
					oldCurrentBook = kbook.model.currentBook;
					oldCurrentNode = Core.ui.getCurrentNode();
					
					media.close(kbook.bookData);
					kbook.bookData.setData(null);
				}

				// need to convert mounted paths to unmounted paths
				file = file.replace("/opt/mnt/ms", "a:");
				file = file.replace("/opt/mnt/sd", "b:");
				
				// Load & open media
				browsingArchive = true;
				try {
					Core.media.loadMedia(file);
					node = Core.media.createMediaNode(file, this.parent);
					node.exit = archiveItemDestruct;
					currentNode = this;
					this.parent.gotoNode(node, kbook.model);
				} catch (ignore) {
					Core.ui.showMsg(L("MSG_ERROR_OPENING_BOOK"));
				}
			} else {
				Core.ui.showMsg(L("MSG_ERROR_UNPACK"));
			}
		} catch (ignoring) {
			Core.ui.showMsg(L("MSG_ERROR_UNPACK"));
			Core.shell.umount(needsMount);
		} finally {
			if (needsMount !== undefined) {
				Core.shell.umount(needsMount);
			}		
		}
	};

	doArchiveCopy = function () {
		var fileDestination, fileTemp, path, currentArchive, needsMount;
		//unused node
		Core.ui.showMsg(L("MSG_COPYING_BOOK"), 1);
		try {
			// mount, if needed
			needsMount = this.parent.needsMount;
			if (needsMount !== undefined) {
				Core.shell.mount(needsMount);
			}
			
			try {
				path = '/tmp/~temp~/';
				currentArchive = kbook.model.currentArchive;
				fileDestination = Core.io.extractFileName(this.insidePath);
				fileTemp = path + fileDestination;
				FileSystem.ensureDirectory(path);
				Core.io.emptyDirectory(path);
				fileDestination = Core.io.getUnusedPath("/Data" + BrowseFolders.options.imRoot + "/", fileDestination);
				Core.archiver.unpack(currentArchive.path, path, undefined, this.insidePath);				
				if (Core.io.pathExists(fileTemp)) {
					// FIXME: ask user first, if he wants to copy the book, if target exists
					Core.io.moveFile(fileTemp, fileDestination);
					Core.media.loadMedia(fileDestination);			
					return fileDestination;   // returns filename like doCopy function
				} else {
					Core.ui.showMsg(L("MSG_ERROR_UNPACK"));
				}
			} finally {
				if (needsMount !== undefined) {
					Core.shell.umount(needsMount);
				}
				kbook.root.update(kbook.model);
			}
		} catch (ignore) {
			Core.ui.showMsg(L("MSG_ERROR_COPYING_BOOK"));	
		}
	};
	
	doArchiveCopyAndOpen = function () {
		var success, fileDestination, currentArchive, fileTemp, path, needsMount, foldersNode, nodes, targetFolder, imNode, i, n;
		Core.ui.showMsg(L("MSG_COPYING_BOOK"), 1);
		try {
			// mount, if needed
			needsMount = this.parent.needsMount;
			if (needsMount !== undefined) {
				Core.shell.mount(needsMount);
			}
			success = false;
			try {
				path = '/tmp/~temp~/';
				currentArchive = kbook.model.currentArchive;
				fileDestination = Core.io.extractFileName(this.insidePath);
				fileTemp = path + fileDestination;
				FileSystem.ensureDirectory(path);
				Core.io.emptyDirectory(path);
				fileDestination = Core.io.getUnusedPath("/Data" + BrowseFolders.options.imRoot + "/", fileDestination);
				Core.archiver.unpack(currentArchive.path, path, undefined, this.insidePath);
				if (Core.io.pathExists(fileTemp)) {
					// FIXME: ask user first, if he wants to copy the book, if target exists
					Core.io.moveFile(fileTemp, fileDestination);
					success = true;
				} else {
					Core.ui.showMsg(L("MSG_ERROR_UNPACK"));
				}
			} finally {
				Core.shell.umount(needsMount);
			}
		} catch (ignore) {
			Core.ui.showMsg(L("MSG_ERROR_COPYING_BOOK"));	
		}
		
		if (success) {
			targetFolder = Core.io.extractPath(fileDestination);
		
			// find IM root node
			foldersNode = BrowseFolders.getAddonNode();
			nodes = foldersNode.nodes;
			imNode = null;
			for (i = 0, n = nodes.length; i < n; i++) {
				if (nodes[i].path === targetFolder) {
					imNode = nodes[i];
					break;
				}
			}
			
			// If IM root node not found, goto folders node
			if (imNode) {
				// goto IM node to allow it to construct children
				this.gotoNode(imNode, kbook.model);
				imNode.update();
				
				// Find element with matching path, if found, enter
				nodes = imNode.nodes;
				for (i = 0, n = nodes.length; i < n; i++) {
					if (fileDestination === nodes[i].path) {
						imNode.gotoNode(nodes[i], kbook.model);
						break;
					}
				}
			} else {
				this.gotoNode(foldersNode, kbook.model);
			}
		}
	};
	
	//-----------------------------------------------------------------------------------------------------------------------------
	// functions for BrowseComics
	//-----------------------------------------------------------------------------------------------------------------------------
	oldDoGotoNextPicture = kbook.model.doGotoNextPicture;
	kbook.model.doGotoNextPicture = function () {
		var parent, nodes, nextNode, i, n, cn;
		if (browsingArchive) {
			// move to next image in archive
			parent = currentNode.parent;
			nodes = parent.nodes;
			nextNode = null;
			for (i = 0, n = nodes.length; i < n; i++) {
				if ((nodes[i].insidePath === currentNode.insidePath) && (i+1<n)) {
					nextNode = nodes[i+1];
					break;
				}
			}
			if (nextNode) {
				cn = Core.ui.getCurrentNode();
				cn.gotoNode(nextNode, kbook.model);
			} else {
				this.doBlink();
			}
		} else {
			oldDoGotoNextPicture.apply(this);
		}
	};
	
	oldDoGotoPreviousPicture = kbook.model.doGotoPreviousPicture;
	kbook.model.doGotoPreviousPicture = function () {
		var parent, nodes, prevNode, i, n, cn;
		if (browsingArchive) {
			// move to previous image in archive
			parent = currentNode.parent;
			nodes = parent.nodes;
			prevNode = null;
			for (i = 0, n = nodes.length; i < n; i++) {
				if ((nodes[i].insidePath === currentNode.insidePath) && (i-1>=0)) {
					prevNode = nodes[i-1];
					break;
				}
			}
			if (prevNode) {
				cn = Core.ui.getCurrentNode();
				cn.gotoNode(prevNode, kbook.model);
			} else {
				this.doBlink();
			}
		} else {
			oldDoGotoPreviousPicture.apply(this);
		}
	};
	
	oldOnEnterPicture = kbook.model.onEnterPicture;
	onEnterPicture = function (node) {
	  //TODO node is unused
	var parent, nodes, i, n, val, picture, LL;
		oldOnEnterPicture.apply(this, arguments);
		if (browsingArchive) {
			if (!imageZoomOverlayModel) {
				LL = Core.lang.getLocalizer("StatusBar_PageIndex");
				// 505/300
				picture = kbook.model.container.sandbox.PICTURE_GROUP.sandbox.PICTURE;
				if (picture.getZoom() !== 0) {
					picture.doMove(0,-10);
					picture.doMove(1,-10);
					picture.adjust();
				}
			}
			// 505/300/600
			parent = currentNode.parent;
			nodes = parent.nodes;
			i = 0;
			n = nodes.length;
			for (i, n; i < n; i++) {
				if (nodes[i].insidePath === currentNode.insidePath) {
					break;
				}
			}
			i++;
			val = i + " " + LL("OF")+ " " + n;
			if (this.PICTURE_INDEX_COUNT !== val) {
				this.PICTURE_INDEX_COUNT = val;
				this.changed();
			}			
		}
	};
	
	oldSetPictureIndexCount = kbook.model.setPictureIndexCount;
	setPictureIndexCount = function (node) {
	  //TODO node is unused
		var parent, nodes, i, n, val;
		if (browsingArchive) {
			parent = currentNode.parent;
			nodes = parent.nodes;
			i = 0;
			n = nodes.length;
			for (i, n; i < n; i++) {
				if (nodes[i].insidePath === currentNode.insidePath) {
					break;
				}
			}
			i++;
			val = i + 'fskin:/l/strings/STR_UI_PARTS_OF'.idToString() + n;
			if (this.PICTURE_INDEX_COUNT !== val) {
				this.PICTURE_INDEX_COUNT = val;
				this.changed();
			}		
		} else {
			oldSetPictureIndexCount.apply(this, arguments);
		}
	};

	// move to top on next page for 600/x50
	imageZoomOverlayModel_doNext = function () {
		var timer;
		if (browsingArchive) {
			if (this.SHOW === true) {
				this.container.target.bubble('doNext');
				this.container.zoomChange();
				try {
					timer = this.timer = new Timer(); //600
				} catch(ignore) {}
				try {
					timer = this.timer = new HardwareTimer(); //x50
				} catch(isIgnore) {}
				timer.target = this;
				timer.onCallback = imageZoomOverlayModel_onCallback;
				timer.onClockChange = imageZoomOverlayModel_onCallback;
				timer.schedule(100);
			} else {
				this.closeCurrentOverlay();
				this.container.target.bubble('doNext');
			}
		} else {
			this.closeCurrentOverlay();
			this.container.target.bubble('doNext');
		}
	};

	imageZoomOverlayModel_onCallback = function () {
		var target;
		target = this.target;
		target.timer = null;
		kbook.model.doSomething('scrollTo', -100, -100);
	};
	
	//-----------------------------------------------------------------------------------------------------------------------------
	// Functions for BrowseMusic
	//-----------------------------------------------------------------------------------------------------------------------------
	oldPlaySongCallback = kbook.model.playSongCallback;
	kbook.model.playSongCallback = function (data) {
	  //TODO data is unused
		var current, parent, nodes, i, n, LL;
		oldPlaySongCallback.apply(this, arguments);
		try {
			LL = Core.lang.getLocalizer("StatusBar_PageIndex");
			current = this.currentSong;
			parent = current.parent;
			nodes = parent.nodes;
			i = parent.getIndex(current);
			n = nodes.length;
			if (nodes[0].title === "..") {
				n--;
			} else {
				i++;
			}
			this.SONG_INDEX_COUNT = i + " " + LL("OF")+ " " + n;
			this.changed();
		} catch(e) {
			log.error("Error in playSongCallback", e);
		}
	};
	
	newDoGotoFirstSong = function () {
		var child, parent, shuffleList;
		child = this.currentSong;
		if (child) {
			parent = child.parent;
			shuffleList = parent.shuffleList;
			if (parent.nodes[0].title === "..") {
				this.doGotoSong(child, parent, shuffleList.getOriginalIndex(1));
			} else {
				this.doGotoSong(child, parent, shuffleList.getOriginalIndex(0));
			}
		}
	};
	
	newDoGotoPreviousSong = function () {
		var child, time, parent, shuffleList, i, c;
		child = this.currentSong;
		if (child) {
			if ((Core.config.model === '350') || (Core.config.model === '650') || (Core.config.model === '950')) {
				time = kbook.movieData.getTime();
				if (time !== undefined && this.doPrevAcceptTime < time) {
					kbook.movieData.setTime(0);
					if (!this.getVariable('CONTROL')) {
						this.container.sandbox.control = 1;
						this.container.sandbox.volumeVisibilityChanged();
						kbook.movieData.start();
					}
					return;
				}
			}
			parent = child.parent;
			shuffleList = parent.shuffleList;
			i = shuffleList.getPlayIndex(parent.getIndex(child));
			c = parent.length;
			i--;
			if (i < 0) {
				i = 0;
			}
			if (parent.nodes[0].title === "..") {
				i = 1;
			}
			this.doGotoSong(child, parent, shuffleList.getOriginalIndex(i));
		}
	};
	
	//-----------------------------------------------------------------------------------------------------------------------------
	// Node constructors
	//-----------------------------------------------------------------------------------------------------------------------------
	// Construct "copy to IM", "copy to IM and open" node
	constructLazyNode = function() {
		var copyNode, copyAndOpenNode;
		
		// Node that copies to IM and opens book
		copyAndOpenNode = Core.ui.createContainerNode({
				title: L("NODE_COPY_AND_OPEN"),
				comment: L("NODE_COPY_AND_OPEN_COMMENT"),
				parent: this,
				icon: ACTION_ICON
		});
		copyAndOpenNode.enter = doCopyAndOpen;
		
		// Node that copies to IM without opening
		copyNode = Core.ui.createContainerNode({
				title: L("NODE_COPY_TO_INTERNAL_MEMORY"),
				comment: L("NODE_COPY_TO_INTERNAL_MEMORY_COMMENT"),
				parent: this,
				icon: ACTION_ICON
		});
		copyNode.enter = doCopy;
		
		this.nodes = [copyAndOpenNode, copyNode];		
	};
	
	// Construct "copy to IM", "copy to IM and open", "preview" node
	archiveBookNodeEnter = function() {
		var node, nodes, bookNodes, copyNode, copyAndOpenNode, previewNode, title;
		title = Core.io.extractFileName(this.insidePath);
		nodes = this.nodes = [];
		node = Core.ui.createContainerNode({
				title: title,
				parent: this.parent,
				icon: "BOOK_ALT"
		});
		node.insidePath = this.insidePath;
		node.needsMount = this.needsMount;
		nodes.push(node);
		
		bookNodes = node.nodes = [];
		
		// Node that copies to IM and opens book
		copyAndOpenNode = Core.ui.createContainerNode({
				title: L("NODE_COPY_AND_OPEN"),
				comment: L("NODE_COPY_AND_OPEN_COMMENT"),
				parent: node,
				icon: ACTION_ICON
		});
		copyAndOpenNode.enter = doArchiveCopyAndOpen;
		copyAndOpenNode.insidePath = this.insidePath;
		copyAndOpenNode.needsMount = this.needsMount;
		bookNodes.push(copyAndOpenNode);
		
		// Node that copies to IM without opening
		copyNode = Core.ui.createContainerNode({
				title: L("NODE_COPY_TO_INTERNAL_MEMORY"),
				comment: L("NODE_COPY_TO_INTERNAL_MEMORY_COMMENT"),
				parent: node,
				icon: ACTION_ICON
		});
		copyNode.enter = doArchiveCopy;
		copyNode.insidePath = this.insidePath;
		copyNode.needsMount = this.needsMount;
		bookNodes.push(copyNode);
		
		// Node that opens book to preview contents (but it will be deleted from library after leaving book)
		if (!Core.config.compat.hasNumericButtons) {
			// preview disabled for 300/505 a) issue with doDeleteBook b) BF structure blown on exit
			previewNode = Core.ui.createContainerNode({
				title: L("NODE_PREVIEW_IN_INTERNAL_MEMORY"),
				comment: L("NODE_PREVIEW_IN_INTERNAL_MEMORY_COMMENT"),
				parent: node,
				icon: ACTION_ICON
			});
			previewNode.enter = archiveDummyEnter;
			previewNode.insidePath = this.insidePath;
			previewNode.needsMount = this.needsMount;
			bookNodes.push(previewNode);
		}	
		this.gotoNode(node, kbook.model);
	};

	// goto .. function
	doGotoParent = function() {
		this.gotoNode(this.parent.parent, kbook.model);
	};
	
	// Constructs folder node
	folderConstruct = function() {
		var path, nodes, iterator, item, factory, node;
		path = this.path;
		nodes = [];
		try {
			// Mount card, if it's a "mount" node
			if (this.needsMount !== undefined) {
				Core.shell.mount(this.needsMount);
			}
			try {
				// ".." item
				if ((BrowseFolders.options.upperDirectoryItem === ENABLED) &&
						(path !== "/") && ((path !== "/Data" + BrowseFolders.options.imRoot + "/") ||
						FileSystem.getFileInfo("b:/") || FileSystem.getFileInfo("a:/"))) {
					node = createFolderNode(path, "..", this, undefined, this.needsMount);
					node.enter = doGotoParent;
					nodes.push(node);
				}
				
				if (FileSystem.getFileInfo(path)) {
					// Iterate over item's content
					iterator = new FileSystem.Iterator(path);
					while (item = iterator.getNext()) {
						if (item.type === "directory") {
							factory = createFolderNode;
						} else {
							factory = createMediaNode;
						}
						
						node = factory(path + item.path, item.path, this, undefined, this.needsMount);
						if (node !== null) {
							nodes.push(node);
						}
					}
				}
			} finally {
				// Unmount card (power drain)
				Core.shell.umount(this.needsMount);
			}
				
			nodes.sort(sorter);
		} catch (e) {
			log.error("in folderConstruct " + e);
		}
		this.nodes = nodes;
		
		// update shuffleList (used with audio folders)
		switch (Core.config.model) {
		case '300':
		case '505':
			// audio just works on these models!
			break;
		case '600':
			if (!this.shuffleList) {
				this.shuffleList = xs.newInstanceOf(kbook.music.shuffleList);
				this.shuffleList.initialize(this.nodes.length);
			} else {
				this.shuffleList.initialize(this.nodes.length);
			}
			break;
		default:
			if (!this.shuffleList) {
				this.shuffleList = xs.newInstanceOf(kbook.root.kbookAudioContentsListNode.shuffleListObject);
				this.shuffleList.initialize(this.nodes.length);
			} else {
				this.shuffleList.initialize(this.nodes.length);
			}
			break;
		}
	};
	
	// Loads favourite folders from fav_folders.config file if file exists 
	favourites = null;
	loadFavFolders = function (roots, rootTitles, rootIcons) {
		var filePath, content, line, name, path, i, n, icon;
		if (BrowseFolders.options.favFoldersFile === ENABLED) {
			// load fav file content
			if (favourites === null) {
				filePath = Core.config.publicPath + "folders.cfg";
				content = Core.io.getFileContent(filePath, null);
				if (content !== null) {
					favourites = content.split("\n");
				} else {
					favourites = [];
				}
			}
			
			// parse fav file
			for (i = 0, n = favourites.length; i < n; i++) {
				try {
					line = favourites[i].split("\t");
					if (line.length === 2 && FileSystem.getFileInfo(trim(line[1])) && !startsWith(line[0], "#")) {
						name = line[0];
						path = trim(line[1]);
						roots.push(path);
						rootTitles.push(name);
						if (startsWith(path, "/Data")) {
							icon = "INTERNAL_MEM";
						} else if (startsWith(path, "a:")) {
							icon = "MS";
						} else if (startsWith(path, "b:")) {
							icon = "SD";
						} else {
							icon = "FOLDER";
						}
						rootIcons.push(icon);
					}
				} catch (e) {
					log.error("Processing line " + i, e);
				}
			}
		}
	};
	
	// Constructs "Browse Folders" node
	folderRootConstruct = function() {
		try {
			var i,n, nodes, roots, rootTitles, rootIcons, nNodes, idx;
			nodes = [];
			roots = [];
			rootTitles = [];
			rootIcons = [];
			
			// Load favourites
			loadFavFolders(roots, rootTitles, rootIcons);
			
			if (roots.length === 0) {
				roots = ["/Data" + BrowseFolders.options.imRoot, "b:", "a:"];
				rootTitles = [
					L("NODE_INTERNAL_MEMORY"),
					L("NODE_SD_CARD"),
					L("NODE_MEMORY_STICK")
				];
				
				rootIcons = [
					"INTERNAL_MEM",
					"SD",
					"MS"
				];
			}
			
			// Number of nodes created
			nNodes = 0;
			i = 0;
			n = roots.length;
			for (i, n; i < n; i++) {
				if (FileSystem.getFileInfo(roots[i] + "/")) {
					idx = i;
					nNodes++;
				}
			}
			if (nNodes === 1) {
				// Only one node, ask folderConstruct to create nodes (effectively: jump to child)
				this.path = roots[idx] + "/";
				folderConstruct.call(this);
				return;
			} else {
			  i = 0;
			  n = roots.length;
				for (i, n; i < n; i++) {
					if (FileSystem.getFileInfo(roots[i] + "/")) {
						nodes.push(createFolderNode(roots[i], rootTitles[i], this, rootIcons[i]));
					}
				}
				
				// Add "via mount" nodes
				if (BrowseFolders.options.useMount === ENABLED) {
					if (FileSystem.getFileInfo("b:/")) {
						nodes.push(createFolderNode(
							Core.shell.SD_MOUNT_PATH, 
							L("NODE_SD_CARD_MOUNT"), 
							this, 
							"SD",
							Core.shell.SD));
					}
					if (FileSystem.getFileInfo("a:/")) {
						nodes.push(createFolderNode(
							Core.shell.MS_MOUNT_PATH, 
							L("NODE_MEMORY_STICK_MOUNT"), 
							this, 
							"MS",
							Core.shell.MS));
					}

				}
			}

			this.nodes = nodes;
		} catch (e) {
			log.error("in folderRootConstruct", e);
		}
	};
	
	//-----------------------------------------------------------------------------------------------------------------------------
	// Addon & Option definitions
	//-----------------------------------------------------------------------------------------------------------------------------
	BrowseFolders = {
		name: "BrowseFolders",
		title: L("TITLE"),
		icon: "FOLDER",				
		getAddonNode: function() {
			if (browseFoldersNode === undefined) {
				browseFoldersNode = Core.ui.createContainerNode({
						title: L("NODE_BROWSE_FOLDERS"),
						shortName: L("NODE_BROWSE_FOLDERS_SHORT"),
						icon: "FOLDER",
						comment: "",
						parent: kbook.root,
						construct: folderRootConstruct
				});
				// Model sniffing: enable search on x50
				if (kbook.iconKindField) {
					browseFoldersNode.iconKind = browseFoldersNode.kind;
					browseFoldersNode.kind = 17;
					browseFoldersNode.onSearch = 'onSearchDefault';
				}
			}
			return browseFoldersNode;
		},
		optionDefs: [
			// How to sort
			{
				name: "sortMode",
				title: L("OPTION_SORTING_MODE"),
				icon: "LIST",
				defaultValue: "author",
				values: ["title", "author", "filename", "filenameAsComment"],
				valueTitles: {
					title: L("VALUE_BY_TITLE"),
					author: L("VALUE_BY_AUTHOR_THEN_TITLE"),
					filename: L("VALUE_BY_FILENAME"),
					filenameAsComment:  L("VALUE_BY_FILENAME_AS_COMMENT")
				}
			},
			// What to use as internal memory root
			{
				name: "imRoot",
				title: L("OPTION_IM_ROOT"),
				icon: "FOLDER",
				defaultValue: "",
				values: ["/database/media/books", "/database/media", "/media", "/books", ""],
				valueTitles: {
					"": "/" // yeah! :)
				}
			},
			// Whether to use folders.cfg from [prspPublicPath]
			{
				name: "favFoldersFile",
				title: L("OPTION_FAVOURITE_FOLDERS"),
				icon: "FOLDER",
				defaultValue: DISABLED,
				values: [ENABLED, DISABLED],
				valueTitles: {
					enabled: LG("VALUE_ENABLED"),
					disabled: LG("VALUE_DISABLED")
				}				
			},
			// Whether to show ".."
			{
				name: "upperDirectoryItem",
				title: L("OPTION_UPPER_DIRECTORY_ITEM"),
				icon: "FOLDER",
				// By default enabled for touch screen devices, disabled for the rest
				defaultValue: (Core.config.compat.hasNumericButtons ? DISABLED : ENABLED),
				values: [ENABLED, DISABLED],
				valueTitles: {
					enabled: LG("VALUE_ENABLED"),
					disabled: LG("VALUE_DISABLED")
				}
			},
			// Add file size to media comment
			{
				name: "fileSizeInComment",
				title: L("OPTION_FILE_SIZE_IN_COMMENT"),
				icon: "FOLDER",
				defaultValue: DISABLED,
				values: [ENABLED, DISABLED],
				valueTitles: {
					enabled: LG("VALUE_ENABLED"),
					disabled: LG("VALUE_DISABLED")
				}
			}
		],
		
		onPreInit: function() {
			// These options make sense only if device has SD/MS card slots 
			if (Core.config.compat.hasCardSlots) {
				// Option to enable disable SD/MS card scanning
				BrowseFolders.optionDefs.push({
					name: "cardScan",
					title: L("OPTION_CARD_SCAN"),
					icon: "DB",
					defaultValue: ENABLED,
					values: [ENABLED, "disabledLoadCache", DISABLED],
					valueTitles: {
						enabled: LG("VALUE_ENABLED"),
						disabledLoadCache: L("VALUE_DISABLED_LOAD_CACHE"),
						disabled: LG("VALUE_DISABLED")
					}
				});

				BrowseFolders.optionDefs.push({
					name: "useMount",
					title: L("OPTION_MOUNT"),
					icon: "DB",
					defaultValue: ENABLED,
					values: [ENABLED, DISABLED],
					valueTitles: {
						enabled: LG("VALUE_ENABLED"),
						disabled: LG("VALUE_DISABLED")
					}
				});
			}
			// setup custom ignoreDirs
			var result, lines, i;
			try {
				if (FileSystem.getFileInfo(Core.config.userDontScanPath)) {
					result = Core.io.getFileContent(Core.config.userDontScanPath);
					lines = result.split("\r\n");
					if (lines) {
						for (i=0; i<lines.length; i++) {
							if ((lines[i].indexOf("#")) === -1 && (lines[i].length)) {
								FskCache.diskSupport.ignoreDir(lines[i]);
							}
						}	
					}
				}
			}
			catch (ee) {
				log.error("error applying ignoreDirs " + ee);
			}
		},
		
		onInit: function() {
			// Bootstrap code knows only Core, not this addon
			Core.config.cardScanMode = BrowseFolders.options.cardScan;
			//model sniffing
			switch (Core.config.model) {
			case '300':
			case '505':
				kbook.model.onEnterPicture = onEnterPicture;
				break;
			case '600':
				kbook.model.onEnterPicture = onEnterPicture;
				imageZoomOverlayModel.doNext = imageZoomOverlayModel_doNext;
				kbook.model.doGotoPreviousSong = newDoGotoPreviousSong;
				kbook.model.doGotoFirstSong = newDoGotoFirstSong;
				break;
			default :
				kbook.model.setPictureIndexCount = setPictureIndexCount;
				imageZoomOverlayModel.doNext = imageZoomOverlayModel_doNext;
				kbook.model.doGotoPreviousSong = newDoGotoPreviousSong;
				kbook.model.doGotoFirstSong = newDoGotoFirstSong;
				break;
			}
		},
		
		actions: [{
			name: "BrowseFolders",
			title: L("TITLE"),
			group: "Utils",
			icon: "FOLDER",
			action: function () {
				var current = Core.ui.getCurrentNode();
				if (current) {
					current.gotoNode(browseFoldersNode, kbook.model);
				} else {
					Core.ui.doBlink();
				}
			}
		}],
		
		onSettingsChanged: function(propertyName, oldValue, newValue) {
			if (oldValue === newValue) {
				return;
			}
			
			// Bootstrap code knows only Core, not this addon
			if (propertyName === "cardScan") {
				Core.config.cardScanMode = newValue;
			}
			
			// Release the node so that it's content can be updated
			if (browseFoldersNode) {
				browseFoldersNode.update();
			}
		}
	};
	Core.addAddon(BrowseFolders);
};

try {
	tmp();
	tmp = undefined;
} catch (e) {
	// Core's log
	log.error("in BrowseFolders.js", e);
}
