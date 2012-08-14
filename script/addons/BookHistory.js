// Name: Book History
// Description: History of book reading (opening)
// Author: kravitz
// Contributors: kartu
//
// History:
//	2010-04-27 kravitz - Initial version
//	2010-04-29 kravitz - Refactored events handling
//	2010-05-01 kravitz - Fixed onSettingsChanged()
//	2010-05-01 kravitz - Added Continue Reading action, fixed minor bugs
//	2010-05-03 kravitz - Renamed from ReadingList, refactored options
//	2010-05-04 kravitz - Fixed doDeleteBook()
//	2010-05-12 kartu - Renamed Continue Reading action to Book History
//	2010-05-14 kravitz - Fixed Book History loading
//	2010-05-14 kravitz - Added Continue Reading action
//	2010-05-14 kravitz - Added option to open the text immediately
//	2010-05-15 kartu - Renamed "through" to "skipBookMenu"
//				Replaced numeric option values with string equivalents (as core-settings supports only strings), implicit type conversion with explicit
//				Put history into it's own settings group.
//	2010-05-15 kartu - Reverted back to "PAGE" translation
//	2010-05-17 kravitz - Replaced "PAGE" with "FUNC_PAGE_X"
//	2010-05-19 kravitz - Fixed Book History menu title
//				Added return from menu to previous state
//	2010-05-19 kravitz - Forbidden enter into Book History not from MENU state
//	2010-05-20 kravitz - Allowed enter into Book History from PAGE state
//	2010-05-21 kravitz - Allowed enter into Book History from AUTORUN state
//	2010-05-24 kravitz - Changed logic of return, fixed minor bugs
//				Removed doDeleteBook() event handler, added audit() instead
//	2010-07-22 kartu - Adapted for 300
//				removed "BH into continue", as menu is now configurable using other means
//				changed skipBookMenu options to: never, always, when entering book, when exiting book
//	2010-09-16 kartu - Fixed: new books weren't added to BH until restart
//	2010-09-25 kartu - Adapted for 600 (removed direct reference to model.current)
//	2010-11-10 kartu - Renamed menu node icon from LIST to BOOK_HISTORY
//				added "short title" (for small buttons of touch readers etc)
//				renamed "opening" book to "entering" book
//	2010-11-30 kartu - Refactoring Core.stirng => Core.text
//	2011-01-31 kartu - Shortened comment field (fix for x50)
//	2011-02-01 kartu - Fixed goto child / parent in on enter book (on x50 book nodes do not have children)
//			Added "short comment" field.
//			Skip book menu menu option is shown only on older models (with numeric buttons)
//	2011-02-26 kartu - Fixed #68:  x50: Deleting books opened via Book History is bugged
//	2011-03-23 kartu - Refactoring: moving functions out of lang files, moving texts to a spreadsheet
//	2011-05-14 kartu - Fixed bug related to "Skip book menu" option 
//	2011-09-20 quisvir - Added getBookList to make booklist available to other addons (thanks kartu)
//	2011-09-24 quisvir - Fixed #178: Deleting books present in Book History deletes current book from Book History as well
//	2012-01-19 quisvir - Added "Go to Previous Book" action
//	2012-08-13 drMerry - updated some code. Moved bookhistory to books rather than utils

var tmp = function() {
	var L, LX, log, trim, model, BH_TITLE, BH_SHORT_TITLE, BH_FILE, BookHistory, bookList, mustSave, bookHistoryNode,
		fromParentFlag, createBookNode, enterBook, constructNodes, loadFromFile,
		doSave, save, bookChanged, bookDeleted;
		
	L = Core.lang.getLocalizer("BookHistory");
	LX = Core.lang.LX;
	log = Core.log.getLogger("BookHistory");
	trim = Core.text.trim;
	model = kbook.model;
	
	BH_TITLE = L("TITLE");
	BH_SHORT_TITLE = L("SHORT_TITLE");
	BH_FILE = Core.config.settingsPath + "book.history";
	
	// List of history books
	bookList = [];
	// Flag showing whether book list has to be persisted
	mustSave = false;

	bookHistoryNode = null;
	// Set /unset in gotoNode hook of the book history node
	fromParentFlag = false;
	
	// Creates book node attached to BH node
	createBookNode = function(path) {
		var node = Core.media.createMediaNode(path, bookHistoryNode);
		if (node !== null) {
			node.enter = enterBook;
		}
		return node;
	};
	
	// Takes care of "skip book menu" option
	enterBook = function() {
		var skipOption;
		try {
			model[this.onEnter](this);
			skipOption = BookHistory.options.skipBookMenu;
			
			if (fromParentFlag && (skipOption === "entering" || skipOption === "always")) {
				// skip menu (jump to "continue")
				if (this.nodes !== undefined && this.nodes.length !== undefined && this.nodes.length > 0) {
					this.gotoChild(0, model);
				}
			} else if (!fromParentFlag && (skipOption === "exiting" || skipOption === "always")) {
				// skip menu (jump to parent)
				if (this.canGotoParent()) {
					this.gotoParent(model);
				}
			}
		} catch (e) {
			log.error("enterBook", e);
		}
	};
	
	// Creates book nodes (once)
	constructNodes = function () {
		var i, node;
		this.nodes = [];
		this.onSearch = 'onSearchDefault';
		for (i = bookList.length-1; i >= 0; i--) {
			node = createBookNode(bookList[i]);
			if (node !== null) {
				this.nodes.unshift(node);
			} else {
				bookList.splice(i, 1);
				mustSave = true;
			}
		}
	};
	
	// Loads saved Book History from addon's private file
	loadFromFile = function () {
		var stream, s;
		try {
			if (FileSystem.getFileInfo(BH_FILE)) {
				stream = new Stream.File(BH_FILE);
				try {
					while (stream.bytesAvailable) {
						s = trim(stream.readLine());
						bookList.push(s);
					}
				} finally {
					stream.close();
				}
			}
		} catch (e) {
			log.error("loadFromFile", e);
		}
	};	
	
	// Saves book history
	doSave = function () {
		var current, i, len;
		try {
			FileSystem.ensureDirectory(Core.config.settingsPath);

			current = "";
			for (i = 0, len = bookList.length; i < len; i++) {
				current += bookList[i] + "\r\n";
			}
			if (current.length === 0) {
				// history is empty - delete the file
				FileSystem.deleteFile(BH_FILE);
				return;
			}
			// save
			Core.io.setFileContent(BH_FILE, current);
		} catch (e) {
			log.error("saveToFile(): " + e);
		}
	};
	
	
	save = function () {
		if (mustSave) {
			doSave();
			mustSave = false;
		}
	};
	
	bookChanged = function (bookNode) {
		var media, path, i, n, node;
		try {
			media = bookNode.media;
			path = media.source.path + media.path;
			
			// Check, if path is already in the list
			i = 0;
			n = bookList.length;
			for (i,n; i < n; i++) {
				if (path === bookList[i]) {
					if (i !== 0) {
						// move book to the top of the list
						bookList.unshift(bookList.splice(i, 1)[0]);
						
						// if nodes are initialized, also move book nodes
						if (bookHistoryNode && bookHistoryNode.nodes) {
							bookHistoryNode.nodes.unshift(bookHistoryNode.nodes.splice(i, 1)[0]);
						}
						
						mustSave = true;
					}
					return;
				}
			}
			
			// new book, adding it to the top of the list 
			bookList.unshift(path);
			
			// also add the book node
			if (bookHistoryNode && bookHistoryNode.nodes) {
				node = createBookNode(path);
				if (node !== null) {
					bookHistoryNode.nodes.unshift(node);
				}
			}
			
			if (Number(BookHistory.options.size) < bookList.length) {
				// remove the last item, since history list is full
				bookList.pop();
				
				// if nodes are initialized, also pop book node
				if (bookHistoryNode && bookHistoryNode.nodes) {
					bookHistoryNode.nodes.pop();
				}
			}
			
			mustSave = true;
		} catch (e) { 
			log.error("bookChanged,", e);
		}
	};
	
	// Called when book is deleted. Removes book from history node and from book list
	bookDeleted = function (not_commit, deleteNode) {
		var media, path, i, n;
		//TODO not_commit unused
		try {
			media = (deleteNode) ? deleteNode.media : kbook.model.currentBook.media;
			path = media.source.path + media.path;
			i = 0;
			n = bookList.length;
			for (i, n; i < n; i++) {
				if (path === bookList[i]) {
					bookList.splice(i, 1);
					mustSave = true;
					break;
				}
			}
		} catch (e) {
			log.error("bookDeleted", e);
		}
	};
	
	BookHistory = {
		name: "BookHistory",
		title: BH_TITLE,
		icon: "LIST",
		onPreInit: function() {
			if (Core.config.compat.hasNumericButtons) {
				this.optionDefs.push({
					name: "skipBookMenu",
					title: L("OPTION_SKIP_BOOK_MENU"),
					icon: "CONTINUE",
					defaultValue: "entering",
					values:	["entering", "exiting", "always", "never"],
					valueTitles: {
						"entering": L("VALUE_WHEN_ENTERING_BOOK"),
						"exiting": L("VALUE_WHEN_EXITING_BOOK"),
						"always": L("VALUE_ALWAYS"),
						"never": L("VALUE_NEVER")
					}
				});
			}
		},
		onInit: function() {
			// FIXME do nothing if disabled
			loadFromFile();
			Core.events.subscribe(Core.events.EVENTS.BOOK_CHANGED, bookChanged);
			// Fix for #68 x50: Deleting books opened via Book History is bugged
			Core.events.subscribe(Core.events.EVENTS.BOOK_DELETED, bookDeleted, true);
			Core.events.subscribe(Core.events.EVENTS.TERMINATE, save);
			Core.events.subscribe(Core.events.EVENTS.SLEEP, save);
		},
		getAddonNode: function() {
			if (bookHistoryNode === null) {
				bookHistoryNode = Core.ui.createContainerNode({
					title: BH_TITLE,
					shortName: BH_SHORT_TITLE,
					icon: "BOOK_HISTORY",
					comment: function () {return LX("BOOKS", bookList.length); },
					construct: constructNodes
				});

				// (X) like description, i.e. (3)
				bookHistoryNode.shortComment = function () {return "(" + bookList.length + ")"; };

				// null value of the nodes is used by the contructor to detect uninitialized state
				bookHistoryNode.nodes = null;
				
				// need to do this, to understand where user is coming from
				// examining value of "locked" doesn't work
				var oldGotoNode = bookHistoryNode.gotoNode;
				bookHistoryNode.gotoNode = function() {
					fromParentFlag = true;
					try {
						oldGotoNode.apply(this, arguments);
					} catch (e) {
						log.warn("bookHistoryNode.gotoNode", e);
					}
					fromParentFlag = false;
				};
			}
			return bookHistoryNode;
		},
			
		// Make bookList var available to other addons
		getBookList: function () {
			return bookList;
		},
		
		onSettingsChanged: function(propertyName, oldValue, newValue) {
			var i, n;
			//size obsolete
			if (oldValue === newValue || propertyName !== "size") {
				return;
			}
			//size = Number(newValue);
			i = 0;
			n = bookList.length - Number(newValue); //size;
			for (i, n; i < n; i++) {
				bookList.pop();
				// if nodes are initialized, also move book nodes
				if (bookHistoryNode && bookHistoryNode.nodes) {
					bookHistoryNode.nodes.pop();
				}
			}
		},
		optionDefs: [{
			name: "size",
			title: BH_TITLE,
			icon: "CONTINUE",
			defaultValue: "10",
			values:	["0", "3", "5", "10", "20", "30", "40", "50"],
			valueTitles: {
				"0": L("VALUE_DISABLED"),
				"3": LX("BOOKS", 3),
				"5": LX("BOOKS", 5),
				"10": LX("BOOKS", 10),
				"20": LX("BOOKS", 20),
				"30": LX("BOOKS", 30),
				"40": LX("BOOKS", 40),
				"50": LX("BOOKS", 50)
			}
		}],

		actions: [{
			name: "BookHistory",
			title: BH_TITLE,
			group: "Book",
			icon: "LIST",
			action: function () {
				var current = Core.ui.getCurrentNode();
				if (current) {
					current.gotoNode(bookHistoryNode, model);
				} else {
					log.trace("can't find current node");
				}
			}
		},
		{
			name: "Go to Previous Book",
			title: L("GO_TO_PREVIOUS_BOOK"),
			group: "Book",
			icon: "BACK",
			action: function () {
				var i, book, current;
				i = kbook.model.currentBook ? 1 : 0;
				if (i < bookList.length) {
					book = createBookNode(bookList[i]);
					current = Core.ui.getCurrentNode();
					current.gotoNode(book, kbook.model);
				}
			}
		}]
		
	};
	
	Core.addAddon(BookHistory);
};

try {
	tmp();
	tmp = undefined;
} catch (e) {
	// Core's log
	log.error("in BookHistory.js", e);
}