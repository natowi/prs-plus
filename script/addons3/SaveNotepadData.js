// Name: SaveNotepadData
// Models: 600 and x50 series
//
// Description: Allows user to save data from notes
//
// Author: Ben Chenoweth
//
// History:
//	2011-11-23 Ben Chenoweth - Initial version
//  2011-11-24 Ben Chenoweth - Added saving Handwriting as SVG and JPG
//  2011-11-27 Ben Chenoweth - Added saving Bookmark Comments and Scribbles
//  2011-11-28 Ben Chenoweth - Minor code cleaning
//  2011-11-29 Ben Chenoweth - All Bookmark Comments from one book are now saved in one TXT file
//  2011-12-05 Ben Chenoweth - Added confirmation option
//  2011-12-08 Ben Chenoweth - Code cleaning; failure message now compulsory (success message still optional)
//  2011-12-10 Ben Chenoweth - Added option to override Text Note with contents of changed TXT file
//  2011-12-11 Ben Chenoweth - Added error code to log.error calls
//	2012-03-13 Ben Chenoweth - Fixed #318: 'Failed to save' message appearing incorrectly
//	2012-03-17 Ben Chenoweth - Added saving Contents of Highlights; fix for page numbers
//	2012-08-14 drMerry - Minimized some code

var tmp = function() {
	var L = Core.lang.getLocalizer("Screenshot"), 
	log = Core.log.getLogger("SaveNotepadData"), oldNotepadDataSave, oldNoteFromHighlight, oldNotepadDataSetData, saveHandwritingSVG, 
	oldPageCommentEditorOverlayModelCloseAnnotationEditor, SaveNotepadData, saveToValueTitles,
	saveHandwritingJPG, oldPageScribbleEditorOverlayModelCloseAnnotationEditor, 
	fbOn = L("FEEDBACK_ON"), 
	fbOff = L("FEEDBACK_OFF"),
	saveMsg = L("SAVING_TO") + " ",
	saveFailMsg = L("FAILED_TO_SAVE"),
	onOff = ["on", "off"],
	//vars used in all(most) functions and initialized in those functions so needed to create only once
	//NOTE msg1 should not be placed here while it is used to check for empty by errors if placed here it can be non-empty
	//caused by another function while an error still occured in the last used function
	folder, path, msg2;
	//unused oldNotepadFreehandDataSave, 
	
	saveHandwritingSVG = function (name, svg, width, height) {
		var stream, chr34, tab, count, x, points;
		try {
			folder = SaveNotepadData.options.saveTo + "Notepads/";
			FileSystem.ensureDirectory(folder);
			path = folder + name + ".svg";
			if (FileSystem.getFileInfo(path)) { FileSystem.deleteFile(path); }
			stream = new Stream.File(path, 1);
			chr34 = String.fromCharCode(34); // "
			tab = String.fromCharCode(9); // TAB
			stream.writeLine("<?xml version="+chr34+"1.0"+chr34+" encoding="+chr34+"utf-8"+chr34+" ?>");
			stream.writeLine("<svg width="+chr34+width+chr34+" base="+chr34+"undefined"+chr34+" shape-rendering="+chr34+"optimizeQuality"+chr34+" height="+chr34+height+chr34+" transform="+chr34+chr34+">");
			count = svg.contents.length;
			x = 0;
			for (x; x<count; x++) {
				points = svg.contents[x].points.toString();
				points=points.replace("x: ","");
				points=points.replace("y: ","");
				points=points.replace(", ",",");
				points=points.replace("},{"," ");
				points=points.replace("{","");
				points=points.replace("}"," ");
				stream.writeLine(tab+"<polyline points="+chr34+points+chr34+" fill="+chr34+"none"+chr34+" shape-rendering="+chr34+"geometricPrecision"+chr34+" stroke="+chr34+"black"+chr34+" fill-rule="+chr34+"nonzero"+chr34+" stroke-linejoin="+chr34+"miter"+chr34+" stroke-linecap="+chr34+"butt"+chr34+" stroke-width="+chr34+"2.5"+chr34+"/>");
			}
			stream.writeLine("</svg>");
			stream.close();
			return path;
		} catch(e) {
			log.error("Save as SVG failed!", e);
			return false;
		}
	};
	
	saveHandwritingJPG = function (name, svg, width, height) {
		var maker, bitmap, stream;
		try {
			folder = SaveNotepadData.options.saveTo + "Notepads/";
			FileSystem.ensureDirectory(folder);
			path = folder + name + ".jpg";
			if (FileSystem.getFileInfo(path)) { FileSystem.deleteFile(path); }
			maker = BookUtil.thumbnail.notepadThumbnailMaker;
			bitmap = maker.makeThumbnail(new Bitmap(width, height), svg, width, height, true);
			stream = new Stream.File(path, 1);
			bitmap.writeJPEG(stream);
			stream.close();
			// Add image to the library
			try {
				Core.media.loadMedia(path);
				// Update nodes so that new image is visible
				kbook.root.update();
			} catch (ignore) { }
			return path;
		} catch (e1) {
			log.error("Save as JPG failed!", e1);
			return false;
		}
	};
	
	// Save NOTES and HANDWRITINGS
	oldNotepadDataSave = kbook.notepadData.save;
	kbook.notepadData.save = function () {
		var media, name, msg1, failed, width, height, svg;
		//unused chr34, tab, count, x, points, maker, bitmap, stream
		//mentioned duplicate stream 
		failed = false;
		if ((SaveNotepadData.options.saveTextMemo === 'on') || (SaveNotepadData.options.saveHandwritingSVG === 'on') || (SaveNotepadData.options.saveHandwritingJPG === 'on')) {
			try {
				media = this.media;
				if (media) {				
					if ((media.type === 'text') && (SaveNotepadData.options.saveTextMemo === 'on')) {				
						try {
							folder = SaveNotepadData.options.saveTo + "Notepads/";
							FileSystem.ensureDirectory(folder);
							name = media.path.substring(media.path.lastIndexOf('/') + 1);
							path = folder + name + ".txt";
							folder = SaveNotepadData.options.saveTo;
							Core.io.setFileContent(path, media.note.text);
						} catch (ee) {
							msg1 = saveMsg + saveToValueTitles[folder];					
							msg2 = saveFailMsg;
							failed = true;
							log.error("Save as TXT failed!", ee);
						}
						if ((SaveNotepadData.options.showSaveProgress === "on") || (failed)) {
							if (msg1 === undefined) {
								msg1 = saveMsg + saveToValueTitles[folder];
								msg2 = path;
							}
							Core.ui.showMsg([msg1, msg2]);
						}
					}
					if ((media.type === 'drawing') && ((SaveNotepadData.options.saveHandwritingSVG === 'on') || (SaveNotepadData.options.saveHandwritingJPG === 'on'))) {
						try {
							name = media.path.substring(media.path.lastIndexOf('/') + 1);
							svg = media.note.drawing.pages[0].svg;
							width = parseInt(media.note.drawing.width,10);
							height = parseInt(media.note.drawing.height,10);
							if (SaveNotepadData.options.saveHandwritingSVG === 'on') {
								path = saveHandwritingSVG(name, svg, width, height);
							}
							if (SaveNotepadData.options.saveHandwritingJPG === 'on') {
								path = saveHandwritingJPG(name, svg, width, height);
							}
							if ((SaveNotepadData.options.showSaveProgress === "on") || (!path)) {
								folder = SaveNotepadData.options.saveTo;
								msg1 = saveMsg + saveToValueTitles[folder];
								msg2 = path ? path : saveFailMsg;
								/*} else {
									msg1 = L("SAVING_TO") + " " + saveToValueTitles[folder];					
									msg2 = L("FAILED_TO_SAVE");
								}*/
								Core.ui.showMsg([msg1, msg2]);
							}
						} catch (e) { }
					}
				}
			} catch (e2) { log.error("Save failed!", e2); }
		}
		return oldNotepadDataSave.apply(this);
	};
	
	// save CONTENTS OF HIGHLIGHTS
	oldNoteFromHighlight = FskCache.text.noteFromHighlight;
	FskCache.text.noteFromHighlight = function (ann, viewer) {
		var failed, media, name, title, author, stream, span, highlightText, page, msg1;
		if (SaveNotepadData.options.saveHighlights === 'on') {
			failed = false;
			folder = SaveNotepadData.options.saveTo + "Notepads/";
			FileSystem.ensureDirectory(folder);
			try {
				if (kbook.model.currentBook) {
					media = kbook.model.currentBook.media;
					name = media.path.substring(media.path.lastIndexOf("/")+1,media.path.lastIndexOf("."));
					path = folder + name + ".txt";
					try {
						if (!FileSystem.getFileInfo(path)) {
							// first comment for this book, so output header information
							title=media.title;
							author=media.author;
							stream = new Stream.File(path, 1);
							stream.writeLine("Title: "+title);
							stream.writeLine("Author: "+author);
						} else {
							// file already exists, so scan through to the end
							stream = new Stream.File(path, 1);
							stream.seek(stream.bytesAvailable);
						}
						stream.writeLine("");
						span = ann.copySpan(viewer);
						highlightText = span.getText();
						page = span.start.getPage() + 1;
						stream.writeLine("Page: "+page);
						stream.writeLine(highlightText);
						stream.close();
					} catch(e3) {
							stream.close();
							msg1 = saveMsg + saveToValueTitles[folder];					
							msg2 = saveFailMsg;
							failed = true;
					}
					if ((SaveNotepadData.options.showSaveProgress === "on") || (failed)) {
						folder = SaveNotepadData.options.saveTo;
						msg2 = (msg1 === undefined) ? path : saveFailMsg;
						msg1 = saveMsg + saveToValueTitles[folder];
						/*
						if (msg1 === undefined) {
							msg1 = L("SAVING_TO") + " " + saveToValueTitles[folder];
							msg2 = path;
						} else {
							msg1 = L("SAVING_TO") + " " + saveToValueTitles[folder];					
							msg2 = L("FAILED_TO_SAVE");
						}
						*/
						Core.ui.showMsg([msg1, msg2]);
					}
				}
			}
			catch (e4) { log.error("Highlight save failed!", e4); }
		}
		return oldNoteFromHighlight.apply(this, arguments);
	};
	
	// Save BOOKMARK COMMENTS
	oldPageCommentEditorOverlayModelCloseAnnotationEditor = pageCommentEditorOverlayModel.closeAnnotationEditor;
	pageCommentEditorOverlayModel.closeAnnotationEditor = function (saveflag) {
		var note, media, name, title, author, stream, bookmark, page, date, str, failed, msg1;
		failed = false;
		if (SaveNotepadData.options.saveTextMemo === 'on') {
			folder = SaveNotepadData.options.saveTo + "Notepads/";
			FileSystem.ensureDirectory(folder);
			try {
				if (this.SHOW) {
					if (saveflag) {
						note = this.note;
						if (note) {
							if (kbook.model.currentBook) {
								media = kbook.model.currentBook.media;
								name = media.path.substring(media.path.lastIndexOf("/")+1,media.path.lastIndexOf("."));
								path = folder + name + ".txt";
								try {
									if (!FileSystem.getFileInfo(path)) {
										// first comment for this book, so output header information
										title=media.title;
										author=media.author;
										stream = new Stream.File(path, 1);
										stream.writeLine("Title: "+title);
										stream.writeLine("Author: "+author);
									} else {
										// file already exists, so scan through to the end
										stream = new Stream.File(path, 1);
										stream.seek(stream.bytesAvailable);
									}
									stream.writeLine("");
									bookmark=kbook.model.currentBook.bookmark;
									page=bookmark.page + 1;
									date=bookmark.date;
									stream.writeLine("Page: "+page);
									str = this.VAR_KEYBUF;
									stream.writeLine(str);
									stream.close();
								} catch(e) {
									try {
										// fallback
										name = Date.now();
										path = folder + name + ".txt";
										str = this.VAR_KEYBUF;
										Core.io.setFileContent(path, str);
									} catch(ee) {
										msg1 = saveMsg + saveToValueTitles[folder];					
										msg2 = saveFailMsg;
										failed = true;
									}
								}
							} else {
								try {
									// I don't think this is possible, but you never know!
									name = Date.now();
									path = folder + name + ".txt";
									str = this.VAR_KEYBUF;
									Core.io.setFileContent(path, str);
								} catch (e5) {
									msg1 = saveMsg + saveToValueTitles[folder];					
									msg2 = saveFailMsg;
									failed = true;
								}
							}
							if ((SaveNotepadData.options.showSaveProgress === "on") || (failed)) {
								folder = SaveNotepadData.options.saveTo;
								msg2 = (msg1 === undefined) ? path : saveFailMsg;
								msg1 = saveMsg + saveToValueTitles[folder];
								Core.ui.showMsg([msg1, msg2]);
							}
						}
					}
				}
			} catch (e6) { log.error("Bookmark Note save failed!", e6); }
		}
		oldPageCommentEditorOverlayModelCloseAnnotationEditor.apply(this, arguments);
	};
	
	// Save BOOKMARK SCRIBBLES
	oldPageScribbleEditorOverlayModelCloseAnnotationEditor = pageScribbleEditorOverlayModel.closeAnnotationEditor;
	pageScribbleEditorOverlayModel.closeAnnotationEditor = function (saveflag) {
		var note, svg, width, height, name, msg1;
		if ((SaveNotepadData.options.saveHandwritingSVG === 'on') || (SaveNotepadData.options.saveHandwritingJPG === 'on')) {
			folder = SaveNotepadData.options.saveTo + "Notepads/";
			FileSystem.ensureDirectory(folder);
			try {
				this.onStopFreehand();
				if (this.SHOW) {
					if (saveflag) {
						note = this.note;
						if (note) {
							svg = this.getEdit().getSVG();
							if (svg.contents.length > 0) {
								width = 450; // guessed
								height = 320; // guessed
								name = Date.now();
								if (SaveNotepadData.options.saveHandwritingJPG === 'on') {
									path = saveHandwritingJPG(name, svg, width, height);
								}
								if (SaveNotepadData.options.saveHandwritingSVG === 'on') {
									path = saveHandwritingSVG(name, svg, width, height);
								}
								if ((SaveNotepadData.options.showSaveProgress === "on") || (!path)) {
									folder = SaveNotepadData.options.saveTo;
									msg1 = saveMsg + saveToValueTitles[folder];
									msg2 = path ? path : saveFailMsg;
									/*if (path) {
										msg1 = L("SAVING_TO") + " " + saveToValueTitles[folder];
										msg2 = path;
									} else {
										msg1 = L("SAVING_TO") + " " + saveToValueTitles[folder];					
										msg2 = L("FAILED_TO_SAVE");
									}*/
									Core.ui.showMsg([msg1, msg2]);
								}
							}
						}
					}
				}
			} catch(e) { log.error("Bookmark Handwriting save failed!", e); }
		}
		oldPageScribbleEditorOverlayModelCloseAnnotationEditor.apply(this, arguments);
	};
	
	// Override contents of TEXT NOTE using changed TXT file
	oldNotepadDataSetData = kbook.notepadData.setData;
	kbook.notepadData.setData = function (media) {
		var name, msg1, content, loadMsg = L("LOADING_FROM") + " ";
		try {
			if (media) {
				if ((media.type === 'text') && (SaveNotepadData.options.overrideTextMemo === 'on')) {
					//replace media.note.text with contents of TXT file with same note name (if it exists and is different)
					folder = SaveNotepadData.options.saveTo + "Notepads/";
					FileSystem.ensureDirectory(folder);
					name = media.path.substring(media.path.lastIndexOf('/') + 1);
					path = folder + name + ".txt";
					folder = SaveNotepadData.options.saveTo;
					if (FileSystem.getFileInfo(path)) {
						// saved note of same name as media note exists
						content = Core.io.getFileContent(path, "222");
						if (content !== "222") {
							if (media.note.text !== content) {
								// content is different
								media.note.text = content;
								msg1 = loadMsg + saveToValueTitles[folder];
								msg2 = path;
								Core.ui.showMsg([msg1, msg2]);
							}
						}
					}
				}
			}
		} catch (e) {
			msg1 = loadMsg + saveToValueTitles[folder];					
			msg2 = L("FAILED_TO_LOAD");
			Core.ui.showMsg([msg1, msg2]);
			log.error("Override NOTE with TXT failed!", e);
		}
		oldNotepadDataSetData.apply(this, arguments);
	};
	
	saveToValueTitles = {
		"a:/": L("MEMORY_STICK"),
		"b:/": L("SD_CARD"),
		"/Data/": L("INTERNAL_MEMORY")
	};
	
	SaveNotepadData = {
		name: "SaveNotepadData",
		title: L("SAVE_NOTEPAD_TITLE"),
		icon: "TEXT_MEMO",
		optionDefs: [
			{
				name: "saveTextMemo",
				title: L("SAVE_TEXT_MEMO"),
				icon: "TEXT_MEMO",
				defaultValue: "off",
				values: onOff,
				valueTitles: {
					"on": fbOn,
					"off": fbOff
				}
			},
			{
				name: "overrideTextMemo",
				title: L("OVERRIDE_TEXT_MEMO"),
				icon: "TEXT_MEMO",
				defaultValue: "off",
				values: onOff,
				valueTitles: {
					"on": fbOn,
					"off": fbOff
				}
			},
			{
				name: "saveHandwritingSVG",
				title: L("SAVE_HANDWRITING"),
				icon: "HANDWRITING_ALT",
				defaultValue: "off",
				values: onOff,
				valueTitles: {
					"on": fbOn,
					"off": fbOff
				}
			},
			{
				name: "saveHandwritingJPG",
				title: L("SAVE_HANDWRITING_JPG"),
				icon: "HANDWRITING_ALT",
				defaultValue: "off",
				values: onOff,
				valueTitles: {
					"on": fbOn,
					"off": fbOff
				}
			},
			{
				name: "saveHighlights",
				title: L("SAVE_HIGHLIGHTS"),
				icon: "HIGHLIGHT",
				defaultValue: "off",
				values: onOff,
				valueTitles: {
					"on": fbOn,
					"off": fbOff
				}
			},
			{
				name: "showSaveProgress",
				title: L("OPT_FEEDBACK"),
				icon: "SETTING",
				defaultValue: "on",
				values: onOff,
				valueTitles: {
					"on": fbOn,
					"off": fbOff
				}
			}
		],
		onPreInit: function() {
			if (Core.config.compat.hasCardSlots) {
				SaveNotepadData.optionDefs.push({
					name: "saveTo",
					title: L("OPT_SAVETO"),
					icon: "DB",
					defaultValue: "/Data/",
					values: ["a:/", "b:/", "/Data/"],
					valueTitles: saveToValueTitles
				});
			}
		},
		onInit: function() {
			if (!Core.config.compat.hasCardSlots) {
				SaveNotepadData.options.saveTo = "/Data/";
			}
		}
	};

	Core.addAddon(SaveNotepadData);	
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error('in SaveNotepadData.js', e);
}