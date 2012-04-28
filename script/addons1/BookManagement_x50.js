// Name: BookManagement_x50
// Description: Allows to set 'new' flag manually, to hide default collections,
//				to show reading progress in home menu and thumbnail views
//				and to customize home menu booklist
// 
// Author: quisvir
//
// History:
//	2011-08-29 quisvir - Initial version
//	2011-08-31 quisvir - Avoid assets.xml and change terminology
//	2011-09-04 Mark Nord - preserve Add-Collection, added icons
//	2011-09-05 quisvir - Extend Hide Collection options to 1 option per collection entry
//	2011-09-05 quisvir - Add reading progress in home menu and thumbnail views
//	2011-09-08 quisvir - Format options now correspond to statusbar options, and fewer strings needed
//	2011-09-09 quisvir - Added exception for reading progress in thumbnail checkbox view
//	2011-09-10 quisvir - Reading Progress: Fixed menu lockups in views other than books
//	2011-09-12 quisvir - Added Home Menu Booklist customization
//	2011-09-14 quisvir - Fixed Booklist bug on searching history (thanks MiK77)
//	2011-09-14 quisvir - Fixed bug in Reading Progress if there is no current book
//	2011-09-15 quisvir - Fixed bug where booklist wasn't correct after startup (via workaround)
//	2011-09-16 quisvir - More bugfixes, booklist partly rewritten
//	2011-09-18 quisvir - Rename to BookManagement_x50, booklist speed improvements, add random booklist option
//	2011-09-20 quisvir - Use PRS+ book history instead of cache for 'last opened books' booklist
//	2011-09-22 quisvir - Display current booklist option in home menu
//	2011-09-27 quisvir - Add ability to cycle through collections for 'next in collection' booklist
//	2011-09-28 quisvir - Display current collection in home menu, add option to ignore memory cards
//	2011-10-04 quisvir - Add option to treat periodicals as books
//	2011-11-20 quisvir - Added sub-collection support (max 1 sub-level, using | as separator)
//	2011-11-25 quisvir - Added booklist option 'Select Collection' & action
//	2011-12-04 quisvir - Split cycle booklist action into cycle forward & backward actions
//  2011-12-04 Ben Chenoweth - Added "Next/Previous Books In History" actions
//  2011-12-05 Ben Chenoweth - Reset "Last Opened Books" when new book selected
//	2011-12-07 quisvir - Cosmetic changes
//	2011-12-11 quisvir - Extended 'Next/Previous Books' to all booklist options
//	2011-12-12 quisvir - Changed booklist construct to check numCurrentBook right away; various changes
//	2011-12-15 quisvir - Added Notepads filter to home menu booklist; code cleaning
//	2011-12-25 quisvir - Added option for booklist arrows in home menu
//	2011-12-26 quisvir - Fixed booklist cycle backward action for 'next in collection'
//	2012-01-02 quisvir - Added 'Read Books' collection
//	2012-01-10 Ben Chenoweth - Added default keybindings for HOME MENU context
//	2012-01-19 quisvir - Added 'Add to Collection' option in Book Option Menu
//	2012-02-07 quisvir - Performance tweaks: made filtering notepads optional, added modulus code by drMerry
//	2012-02-10 quisvir - Optimised most of the code, with help from drMerry
//	2012-02-11 quisvir - Added options: page buttons in home menu, use sub-collections, mark all books read/unread, clear history on shutdown
//	2012-02-16 quisvir - Added checkmarks for finished books, enable/disable page option items; fixed ignoreCards
//	2012-02-17 quisvir - Fixed #286 'Page buttons stop working for cycling books in main screen'
//	2012-02-24 quisvir - Made sub-collections recursive (unlimited levels), added option for separator, enabled #-Z navbar
//	2012-03-01 quisvir - Added book content search
//	2012-03-21 Ben Chenoweth - Added Option menu to Archives in BF (x50); removed audio items
//	2012-04-06 Ben Chenoweth - Added 'User EPUB Style (CSS File)' option in Book Option Menu (EPUB books only)
//	2012-04-12 Ben Chenoweth - Added 'Reformat Current Book' option in Book Option Menu (LRF books only)
//	2012-04-28 Ben Chenoweth - 350: Removed audio items from menu

tmp = function() {

	var L, LX, log, opt, bookChanged, trigger1, trigger2, trigger3, trigger4, tempNode, oldNode,
		numCur, holdKey, model, devRoot, thumbnailsNode, homeGroup, constructRun, VALUE_TRUE, VALUE_FALSE;
	
	L = Core.lang.getLocalizer('BookManagement');
	LX = Core.lang.LX;
	log = Core.log.getLogger('BookManagement');
	
	// Some useful references
	model = kbook.model;
	devRoot = kbook.root.children.deviceRoot;
	thumbnailsNode = kbook.root.nodes[0].nodes[6];
	homeGroup = model.container.sandbox.MENU_HOME_GROUP;
	
	numCur = 0;
	holdKey = false;
	VALUE_TRUE = L('VALUE_TRUE');
	VALUE_FALSE = L('VALUE_FALSE');
	
	// Treat Periodicals as Books	
	var oldIsPeriodical = FskCache.text.isPeriodical;
	FskCache.text.isPeriodical = function () {
		if (opt.PeriodicalsAsBooks === 'true') {
			return false;
		} else {
			return oldIsPeriodical.apply(this, arguments);
		}
	}
	
	var oldIsNewspaper = FskCache.text.isNewspaper;
	FskCache.text.isNewspaper = function () {
		if (opt.PeriodicalsAsBooks === 'true') {
			return false;
		} else {
			return oldIsNewspaper.apply(this, arguments);
		}
	}
	
	var oldOnEnterShortCutBook = model.onEnterShortCutBook;
	model.onEnterShortCutBook = function (node) {
		if (opt.PeriodicalsAsBooks === 'true' && node.periodicalName) {
			this.currentNode.gotoNode(node, this);
		} else {
			oldOnEnterShortCutBook.apply(this, arguments);
		}
	};
	
	// Keep new flag as is on opening book
	var oldOnChangeBook = model.onChangeBook;
	model.onChangeBook = function (node) {
		var flag = node.opened;
		if (this.currentBook) {
			opt.CurrentCollection = '';
		}
		oldOnChangeBook.apply(this, arguments);
		if (opt.bookFlags !== 'autoNew') {
			node.opened = flag;
		}
		if (this.STATE !== 'MENU_HOME') {
			bookChanged = true; // exception for current book on startup
		}
		numCur = 0;
	}
	
	// Book menu option to switch new flag, called from main.xml
	model.container.sandbox.OPTION_OVERLAY_PAGE.sandbox.doFlagToggle = function () {
		var book = model.currentBook;
		this.doOption();
		book.opened = !book.opened;
	}
	
	// Book menu option to add book to collection, called from main.xml
	model.container.sandbox.OPTION_OVERLAY_PAGE.sandbox.doAddToCollection = function () {
		this.doOption();
		doSelectCollection('book');
	}
	
	// Book menu option to change EPUB style, called from main.xml
	model.container.sandbox.OPTION_OVERLAY_PAGE.sandbox.doChangeEPUBStyle = function () {
		var mime, currentNode, data;
		this.doOption();
		if (model.currentBook) {
			mime = FileSystem.getMIMEType(model.currentBook.media.path);
			if (mime === "application/epub+zip") {
				currentNode = Core.ui.getCurrentNode();          
				Core.addonByName.PRSPSettings.createSingleSetting(currentNode, Core.addonByName.EpubUserStyle.optionDefs[0], Core.addonByName.EpubUserStyle);
				currentNode.gotoNode(currentNode.nodes.pop(), kbook.model);
			} else if (mime === "application/x-sony-bbeb") {
				data = kbook.bookData;
				model.currentBook.media.browseTo(data, undefined, undefined, undefined, undefined, false, data.width, data.height, data.book.facing);
				data.book.dataChanged();
			} else {
				model.doBlink();
			}
		}
	}
	
	// Show book menu option if preference is set
	kbook.optMenu.isDisable = function (part) {
		var res, opened, mime, LL;
		res = part.textresource;
		if (!res) {
			res = part.id;
		}
		if (res && opt[res] === 'false' && part.container.container.id === 'OPTION_OVERLAY_PAGE') {
			return true;
		}
		if (part.id === 'flag') {
			opened = model.currentBook.opened;
			switch (opt.bookFlags) {
				case 'autoNew':
					return true;
				case 'manualNew':
					part.text = (opened) ? L('SETNEWFLAG') : L('REMOVENEWFLAG');
					part.u = (opened) ? 30 : 31;
					break;
				case 'manualCheck':
					part.text = (opened) ? L('MARK_AS_UNREAD') : L('MARK_AS_READ');
					part.u = (opened) ? 31 : 30;
			}
		}
		if (part.id === 'changeEPUBStyle') {
			if (model.currentBook) {
				mime = FileSystem.getMIMEType(model.currentBook.media.path);
				if (mime === "application/epub+zip") {
					LL = Core.lang.getLocalizer('EpubUserStyle');
					part.text = LL('OPTION_EPUB_CSS_FILE');
				} else if (mime === "application/x-sony-bbeb") {
					LL = Core.lang.getLocalizer('LRFTextScale');
					part.text = LL("REFORMAT_CURRENT_BOOK");
				} else {
					return true;
				}
			}
		}
		if (kbook.model.currentArchive) {
			// this will only be true if an archive is currently being browsed in BF
			if (part.id === 'archive') {
				part.text = L('DELETE_ARCHIVE');
				return false;
			} else if (part.textresource === 'STR_UI_MENU_CLOSETHISPICTURE') {
				return false;
			} else if (part.textresource === 'STR_UI_MENU_ORIENTATION') {
				return false;
			} else {
				return true;
			}
		} else {
			if (part.id === 'archive') {
				return true;
			}
		}
		return Fskin.overlayTool.isDisable(part);
	}
	
	// Hide default collections
	var oldKbookPlaylistNode = kbook.root.kbookPlaylistNode.construct;
	kbook.root.kbookPlaylistNode.construct = function () {
		oldKbookPlaylistNode.apply(this, arguments);
		var node, nodes, c, p;
		nodes = this.nodes;
		c = p = 0;
		if (opt.HideAddNewCollection === 'true') {
			nodes.splice(3, 1);
			c++;
		}
		if (opt.HidePurchasedBooks === 'true') {
			nodes.splice(2, 1);
			c++; p++;
		}
		if (opt.HideUnreadPeriodicals === 'true') {
			nodes.splice(1, 1);
			c++; p++;
		}
		if (opt.HideUnreadBooks === 'true') {
			nodes.splice(0, 1);
			c++; p++;
		}
		if (opt.addReadBooks === 'true') {
			node = xs.newInstanceOf(kbook.root.kbookUnreadBooksListNode);
			node.cache = this.cache;
			node.parent = this;
			node.depth = this.depth + 1;
			node.name = node.title = L('READ_BOOKS');
			node.filter = function (result) {
				var i, record;
				for (i = result.count() - 1; i >= 0; i--) {
					record = result.getRecord(i);
					if (!record.opened || record.periodicalName) {
						result.removeID(result.getID(i));
					}
				}
				return result;
			};
			node.locked++;
			nodes.unshift(node);
			node.construct();
			c--; p--;
		}
		this.constNodesCount -= c;
		this.presetItemsCount -= p;
		if (opt.subCollections === 'true') {
			createSubCollections(this, this.constNodesCount, opt.subCollSeparator);
		}
	}

	var createSubCollections = function (parent, start, sep) {
		var i, c, next, node, nodes, newNode, last, idx, coll, title;
		nodes = parent.nodes;
		for (i = next = start, c = nodes.length; i < c; i++) {
			node = nodes[i];
			title = node.title;
			idx = title.indexOf(sep);
			if (idx !== -1) {
				coll = title.slice(0, idx);
				node.name = node.title = title.slice(idx + 1);
				if (last === coll) {
					node.parent = nodes[next-1];
					nodes[next-1].nodes.push(nodes.splice(i,1)[0]);
					i--; c--;
				} else {
					newNode = Core.ui.createContainerNode({
						title: coll,
						comment: function () {
							return Core.lang.LX('COLLECTIONS', this.nodes.length);
						},
						parent: parent,
						icon: 'BOOKS'
					});
					node.parent = newNode;
					newNode.sublistMark = true;
					newNode.ignoreSort = true;
					newNode.getSortBy = function () {
						return 'text';
					};
					newNode.onSearch = 'onSearchDefault';
					newNode.match = function (term) {
						return this.name.toLowerCase().indexOf(term) !== -1;
					};
					newNode.nodes.push(nodes.splice(i,1)[0]);
					nodes.splice(next, 0, newNode);
					last = coll;
					next++;
				}
			}
		}
		if (last) nodes[next-1].separator = 1;
		for (i = nodes.length - 1; i >= start; i--) {
			if (nodes[i].nodes) createSubCollections(nodes[i], 0, sep);
		}
	}
	
	// Draw reading progress instead of 'last read' date/time
	model.getContinueDate = function (node) {
		var cb, media, page, pages;
		cb = this.currentBook;
		if (cb && opt.readingProgressCurrent === 'true') {
			media = cb.media;
			if (media.currentPosition) {
				page = media.currentPosition.page + 1;
				if (page >= parseInt(opt.OnlyShowFromPage)) {
					pages = media.history[0].pages;
					return readingProgressComment(page, pages, opt.progressFormatCurrent);
				}
			}
		}
		return node.nodes[0].lastReadDate;
	}
	
	// Draw reading progress below thumbnails
	var oldDrawRecord = Fskin.kbookViewStyleThumbnail.drawRecord;
	Fskin.kbookViewStyleThumbnail.drawRecord = function (offset, x, y, width, height, tabIndex, parts) {
		oldDrawRecord.apply(this, arguments);
		if (!constructRun) return;
		
		var win, menu, home, list, idx, record, media, page, pages, msg, n, comX, comY, comWidth, comHeight;
		win = this.getWindow();
		menu = this.menu;
		comHeight = this.textCommentHeight;
		
		if (xs.isInstanceOf(model.currentNode, devRoot)) {
			// Display current booklist option text
			home = true;
			if (offset === 2) {
				list = opt.BookList;
				if (list === 4) {
					msg = opt.SelectedCollection;
				} else if (list === 3 && opt.CurrentCollection) {
					msg = L('NEXT_IN') + ' ' + opt.CurrentCollection;
				} else {
					msg = BookManagement_x50.optionDefs[0].optionDefs[0].valueTitles[list];
				}
				// Replace | with : for sub-collections
				if (opt.subCollections === 'true') {
					idx = msg.lastIndexOf(opt.subCollSeparator);
					if (idx !== -1) msg = msg.slice(idx + 1);
				}
				// Add position in current booklist
				n = thumbnailsNode.nodes.length;
				if (n > 1) {
					msg += ' (' + (numCur + 1) + '-' + (numCur + n) + ')';
				} else if (n === 1) {
					msg += ' (' + (numCur + 1) + ')';
				}
				this.skin.styles[6].draw(win, msg, 0, y-25, this.width, comHeight);
			}
		}
		
		switch (opt.readingProgressThumbs) {
			case 'false':
				return;
			case 'home':
				if (!home) return;
			case 'all':
				record = menu.getRecord(offset);
				if (!record || record.kind !== 2) return;
				media = record.media;
				if (!media.history.length || (this.statusVisible && (media.sourceid > 1 || menu.getFixSelectPosition() || record.expiration))) {
					return;
				}
				page = (media.currentPosition) ? media.currentPosition.page + 1 : media.ext.currentPosition.page + 1;
				if (page < parseInt(opt.OnlyShowFromPage)) return;
				pages = media.history[0].pages;
				msg = readingProgressComment(page, pages, opt.progressFormatThumbs);
				comX = x + this.marginWidth;
				comY = this.getNy(this.getTy(y), Math.min(this.getTh(height), this.thumbnailHeight)) + this.textNameHeight + this.marginNameAndComment + 23;
				comWidth = this.getCw(width, Fskin.scratchRectangle.width);
				parts.commentStyle.draw(win, msg, comX, comY, comWidth, comHeight);
		}
	};
	
	// Format reading progress comment
	var readingProgressComment = function (page, pages, format) {
		switch (format) {
			case '1': return L('PAGE') + ' ' + page + ' ' + L('OF') + ' ' + pages;
			case '2': return L('PAGE') + ' ' + page + ' ' + L('OF') + ' ' + pages + ' (' + Math.floor((page/pages)*100) + '%)';
			case '3': return page + ' ' + L('OF') + ' ' + pages;
			case '4': return page + ' ' + L('OF') + ' ' + pages + ' (' + Math.floor((page/pages)*100) + '%)';
			case '5': return Math.floor((page/pages)*100) + '%';
			case '6': return page + ' / ' + pages;
			case '7': return page + ' / ' + pages + ' (' + Math.floor((page/pages)*100) + '%)';
			case '8': return L('PAGE') + ' ' + page + ' / ' + pages + ' (' + Math.floor((page/pages)*100) + '%)';
		}
	}

	// Update deviceroot on enter
	var oldOnEnterDeviceRoot = model.onEnterDeviceRoot;
	model.onEnterDeviceRoot = function () {
		if (bookChanged) {
			// Don't update if opt = 0 and no trigger has been used
			if (opt.BookList || trigger1 || trigger2 || trigger3 || trigger4) {
				thumbnailsNode.update(this);
			}
			bookChanged = false;
		}
		oldOnEnterDeviceRoot.apply(this, arguments);
		homeGroup.focus(true);
	}
	
	// Update booklist after collection edit
	var oldFinishCollectionEdit = model.finishCollectionEdit;
	model.finishCollectionEdit = function () {
		var i, node, change, current, kind, items;
		node = this.colManTgtNode;
		if (node && opt.BookList > 2) {
			current = opt.CurrentCollection ? opt.CurrentCollection : opt.SelectedCollection;
			kind = node.kind;
			if (kind === 42 && node.title === current) {
				change = true;
			} else if (kind === 17) {
				items = this.colManItems;
				for (i = items.length - 1; i >= 0; i--) {
					if (items[i].title === current) {
						change = true;
						break;
					}
				}
			}
			if (change) {
				bookChanged = true;
				opt.CurrentCollection = '';
				numCur = 0;
			}
		}
		oldFinishCollectionEdit.apply(this, arguments);
	}
	
	var updateBookList = function () {
		if (xs.isInstanceOf(model.currentNode, devRoot)) {
			thumbnailsNode.update(model);
			kbook.menuHomeThumbnailBookData.setNode(thumbnailsNode);
		} else {
			bookChanged = true;
		}
	}
	
	// Get textMasters, exclude memory cards, call filter for home menu booklist
	var getDB = function (cache) {
		var result, s, i;
		result = new xdb.Result(cache);
		s = cache.sources;
		for (i = s.length - 1; i >= 0; i--) {
			if (opt.IgnoreCards === 'false' || (s[i].name !== 'SD Card' && s[i].name !== 'Memory Stick')) {
				result = result.or(s[i].textMasters);
			}
		}
		result = devRoot.children.books.filter(result);
		return result;
	}
	
	// Filter notepads & periodicals for booklists
	devRoot.children.books.filter = function (result) {
		var i, book;
		if (opt.PeriodicalsAsBooks === 'false') {
			if (opt.hideNotepads === 'false') {
				// Filter periodicals only (default behaviour)
				for (i = result.count() - 1; i >= 0; i--) {
					book = result.getRecord(i);
					if (book.periodicalName) {
						result.removeID(book.id);
					}
				}
			} else {
				// Filter periodicals and notepads
				for (i = result.count() - 1; i >= 0; i--) {
					book = result.getRecord(i);
					if (book.periodicalName || book.path.slice(0,9) === 'Notepads/') {
						result.removeID(book.id);
					}
				}
			}
		} else if (opt.hideNotepads === 'true') {
			// Filter notepads only
			for (i = result.count() - 1; i >= 0; i--) {
				book = result.getRecord(i);
				if (book.path.slice(0,9) === 'Notepads/') {
					result.removeID(book.id);
				}
			}
		}
		return result;
	}
	
	// Customize book list in home menu
	devRoot.children.bookThumbnails.construct = function () {
		var prototype, nodes, cache, db, db2, current, c, node,
			i, j, hist, book, books, id, id2, items, author, list, coll, colls;
		FskCache.tree.xdbNode.construct.call(this);
		constructRun = true;
		cache = this.cache;
		prototype = this.prototype;
		nodes = this.nodes = [];
		db = getDB(cache);
		c = db.count();
		if (!c) return;
		if (model.currentBook) {
			current = model.currentBook.media;
		} else if (model.currentPath) {
			db2 = db.db.search('indexPath',model.currentPath); // FIXME only do this lookup if actually needed
			if (db2.count()) {
				current = db2.getRecord(0);
			}
		}
		while (true) {
			switch (opt.BookList) {
				case 0: // Last added books
					db.sort_c({
						by: 'indexDate',
						order: xdb.descending
					});
					if (numCur && numCur >= c) {
						numCur -= 3;
					}
					for (i = numCur; nodes.length < 3 && i < c; i++) {
						node = nodes[nodes.length] = xs.newInstanceOf(prototype);
						node.cache = cache;
						node.media = db.getRecord(i);
					}
					break;
				case 1: // Last opened books
					hist = Core.addonByName.BookHistory.getBookList();
					j = (current) ? 1 : 0;
					books = hist.length;
					if (numCur && numCur + j >= books) {
						numCur -= 3;
					}
					for (i = numCur + j; nodes.length < 3 && i < books; i++) {
						book = Core.media.findMedia(hist[i]);
						if (book) {
							if (book.periodicalName && opt.PeriodicalsAsBooks === 'false') {
								continue; // FIXME numCur -= 3 goes wrong here
							}
							node = nodes[nodes.length] = xs.newInstanceOf(prototype);
							node.cache = cache;
							node.media = book;
						}
					}
					break;
				case 2: // Books by same author
					if (!current) break;
					id = current.id;
					author = current.author;
					if (!author) break;
					list = [];
					// Find other books by same author, excluding current book
					for (i = 0; i < c; i++) {
						book = db.getRecord(i);
						if (book.author === author && book.id !== id) {
							list.push(i);
						}
					}
					books = list.length;
					if (numCur && numCur >= books) {
						numCur -= 3;
					}
					for (i = numCur; nodes.length < 3 && i < books; i++) {
						node = nodes[nodes.length] = xs.newInstanceOf(prototype);
						node.cache = cache;
						node.media = db.getRecord(list[i]);
					}
					break;
				case 3: // Next books in collection
					if (!current) break;
					id = current.id;
					i = 0;
					// Switch to collections cache
					db2 = cache.playlistMasters;
					db2.sort('indexPlaylist');
					colls = db2.count();
					if (opt.CurrentCollection) {
						for (i = 0; i < colls && db2.getRecord(i).title !== opt.CurrentCollection; i++);
						if (i === colls) {
							// CC not found, so start from beginning
							i = 0;
						} else if (trigger1) {
							// CC found, but trigger1 used, so start from next
							i++;
						}
					}
					if (trigger2) {
						i = (i === 0) ? colls - 1 : i - 1;
					}
					while (i >= 0 && i < colls) {
						coll = db2.getRecord(i);
						books = coll.count();
						j = coll.getItemIndex(id) + 1;
						if (j && j < books) {
							// Current book found in collection where it's not the last book
							if (numCur && numCur + j >= books) {
								numCur -= 3;
							}
							for (j += numCur; nodes.length < 3 && j < books; j++) {
								node = nodes[nodes.length] = xs.newInstanceOf(prototype);
								node.cache = cache;
								node.media = cache.getRecord(coll.items[j].id);
							}
							break;
						}
						i = (trigger2) ? i - 1 : i + 1;
					}
					opt.CurrentCollection = (nodes.length) ? coll.title : '';
					break;
				case 4: // Select collection
					if (!opt.SelectedCollection) break;
					books = [];
					if (current) {
						id = current.id;
					}
					db2 = cache.playlistMasters.db.search('indexPlaylist', opt.SelectedCollection);
					if (!db2.count()) break;
					// Selected Collection found
					items = db2.getRecord(0).items;
					j = items.length;
					for (i = 0; i < j; i++) {
						id2 = items[i].id;
						if (id2 !== id) {
							books.push(id2);
						}
					}
					j = books.length;
					if (numCur && numCur >= j) {
						numCur -= 3;
					}
					for (i = numCur; nodes.length < 3 && i < j; i++) {
						node = nodes[nodes.length] = xs.newInstanceOf(prototype);
						node.cache = cache;
						node.media = cache.getRecord(books[i]);
					}
			}
			if (!nodes.length) {
				if (trigger1) {
					opt.BookList = (opt.BookList + 1) % 5;
					continue;
				} else if (trigger2) {
					opt.BookList = (opt.BookList + 4) % 5;
					continue;
				}
			}
			trigger1 = trigger2 = trigger3 = trigger4 = false;
			break;
		}
	};
	
	// PREV/NEXT on HOME MENU activate BooklistPrev/NextBooks
	homeGroup.sandbox.doPrevious = function () {
		if (!holdKey) {
			BookManagement_x50.actions[3 - opt.homeMenuPageButtons].action();
		} else {
			holdKey = false;
		}
	}
	
	homeGroup.sandbox.doNext = function () {
		if (!holdKey) {
			BookManagement_x50.actions[2 - opt.homeMenuPageButtons].action();
		} else {
			holdKey = false;
		}
	}

	// HOLD PREV/HOLD NEXT on HOME MENU activate BooklistCycleBackward/Forward
	homeGroup.sandbox.doPreviousHold = function () {
		holdKey = true;
		BookManagement_x50.actions[1 + opt.homeMenuPageButtons].action();
	}
	
	homeGroup.sandbox.doNextHold = function () {
		holdKey = true;
		BookManagement_x50.actions[opt.homeMenuPageButtons].action();
	}
	

	// Functions for booklist option 'Select Collection'
	var doSelectCollection = function (target) {
		if (target === 'book' && !model.currentBook) return;
		oldNode = model.currentNode;
		oldNode.redirect = true;
		tempNode = Core.ui.createContainerNode({
			title: L('SELECT_COLLECTION'),
			parent: oldNode,
			icon: 'BOOKS',
			construct: selectCollectionConstruct,
			destruct: selectCollectionDestruct
		});
		tempNode.target = target;
		tempNode.onSearch = 'onSearchDefault';
		oldNode.gotoNode(tempNode, model);
	}
	
	var selectCollectionConstruct = function () {
		var i, node, nodes, db, c;
		nodes = this.nodes = [];
		db = model.cache.playlistMasters;
		db.sort('indexPlaylist');
		c = db.count();
		for (i = 0; i < c; i++) {
			coll = db.getRecord(i);
			node = nodes[i] = Core.ui.createContainerNode({
				title: coll.title,
				comment: LX('BOOKS', db.getRecord(i).count()),
				icon: 'BOOKS'
			});
			node.onEnter = 'collectionSelected';
			node.coll = coll;
			node.oldNode = oldNode;
			node.target = this.target;
			node.onSearch = 'onSearchDefault';
			node.match = function (term) {
				return this.name.toLowerCase().indexOf(term) !== -1;
			};
		}
		if (opt.subCollections === 'true') {
			createSubCollections(this, 0, opt.subCollSeparator);
		}
	}
	
	var selectCollectionDestruct = function () {
		tempNode = null;
		delete oldNode.redirect;
		oldNode = null;
	}
	
	model.collectionSelected = function (node) {
		var old, coll, id;
		old = node.oldNode;
		coll = node.coll;
		switch (node.target) {
			case 'book':
				id = this.currentBook.media.id;
				if (coll.getItemIndex(id) === -1) {
					coll.append(id);
					this.cache.updateRecord(coll.id, coll);
				}
				break;
			case 'booklist':
				opt.BookList = 4;
				opt.SelectedCollection = coll.title;
				Core.settings.saveOptions(BookManagement_x50);
				updateBookList();
				if (old.title === L('BOOK_SELECTION')) {
					old = old.parent;
				}
		}
		this.currentNode.gotoNode(old, this);
	}
	
	// Link actions to home menu booklist arrows
	model.container.sandbox.booklistArrows = function (index) {
		BookManagement_x50.actions[4 - index].action();
	};
	
	// Mark all books as read/unread (uses books node to avoid periodicals)
	var markAllBooks = function (read) {
		var n, i;
		n = kbook.root.getBooksNode().nodes;
		for (i = n.length - 1; i >= 0; i--) {
			n[i].media.opened = read;
		}
		kbook.root.update(model);
	}
	
	// Clear page histories, keeping current position (length = 0 crashes home menu)
	var clearPageHists = function () {
		var db, i, r;
		if (opt.clearHistsOnShutdown === 'true') {
			db = model.cache.textMasters;
			for (i = db.count() - 1; i >= 0; i--) {
				r = db.getRecord(i);
				if (r.history.length) r.history.length = 1;
			}
		}
	}
	
	var createPageOptionSettings = function () {
		var group, contents, c, i, id, title, mime, LL;
		group = {
			groupTitle: L('PAGE_OPTION_ITEMS'),
			groupIcon: 'LIST',
		};
		group.optionDefs = [];
		contents = kbook.model.container.sandbox.OPTION_OVERLAY_PAGE.sandbox.OPT_MENU.contents;
		c = contents.length;
		for (i = 0; i < c; i++) {
			id = contents[i].textresource;
			if (id) {
				if ((Core.config.model === "350") && ((id === "STR_UI_MENU_NOWPLAYING") || (id === "STR_UI_MENU_RESUMELISTENING"))) continue; // 350 has no audio
				title = ('fskin:/l/strings/' + id).idToString();
				if (title) {
					group.optionDefs.push({
						name: id,
						title: title,
						icon: 'SETTINGS',
						defaultValue: 'true',
						values: ['true', 'false'],
						valueTitles: {
							'true': VALUE_TRUE,
							'false': VALUE_FALSE
						}
					})
				}
			} else {
				id = contents[i].id;
				if (id === "changeEPUBStyle") {
					LL = Core.lang.getLocalizer('EpubUserStyle');
					title = LL('OPTION_EPUB_CSS_FILE');
					LL = Core.lang.getLocalizer('LRFTextScale');
					title = title + " / " + LL("REFORMAT_CURRENT_BOOK");
					group.optionDefs.push({
						name: id,
						title: title,
						icon: 'SETTINGS',
						defaultValue: 'true',
						values: ['true', 'false'],
						valueTitles: {
							'true': VALUE_TRUE,
							'false': VALUE_FALSE
						}
					})
				}
			}
		}
		BookManagement_x50.optionDefs.push(group);
	}
	
	var enableCheckmarks = function () {
		
		var checkMarkKind = Core.config.compat.NodeKinds.CHECKMARK;
		
		// Hijack newIcon cutout, regular thumbnail views
		model.container.cutouts['newIcon'].x = 3100;
		
		// Determine if checkmark shown for thumbnails in home; hijack cutout each time, as xml is reloaded
		var oldCanNewContentsInHome = model.canNewContentsInHome;
		model.canNewContentsInHome = function (fields, index) {
			fields.fields[0].skin.cutouts[0].y = 48;
			return !oldCanNewContentsInHome.apply(this, arguments);
		}
		
		// Determine if checkmark shown in regular thumbnails views; don't show in selection mode
		var oldCanNewContents = model.canNewContents;
		model.canNewContents = function (fields, index) {
			if (fields.canFieldCommand('multipleCheckbox')) {
				return false;
			}
			return !oldCanNewContents.apply(this, arguments);
		}
		
		// Set default iconKind for book nodes
		delete FskCache.tree.bookNode.iconKind;
		FskCache.tree.bookNode.construct = function () {
			FskCache.tree.xdbNode.construct.call(this);
			this.iconKind = (this.opened) ? checkMarkKind : 2;
		};
		
		// Set iconKind for items in collection view
		delete devRoot.children.collections.prototype.prototype.iconKind;
		FskCache.tree.sortablePlaylistSubNode.build = function () {
			this.sortBy(this.by);
			var nodes, n, i;
			nodes = this.nodes;
			for (i = nodes.length - 1;i >= 0; i--) {
				n = nodes[i];
				if (n.opened) {
					n.iconKind = checkMarkKind;
				} else {
					n.iconKind = (n.media.isPeriodical()) ? 66 : 2;
				}
			}
		};
		
		// Set iconKind for periodicals
		delete FskCache.tree.backIssueNode.iconKind;
		var oldPeriodicalConstruct = FskCache.tree.periodicalNode.construct;
		FskCache.tree.periodicalNode.construct = function () {
			oldPeriodicalConstruct.apply(this, arguments);
			var nodes, n, i;
			nodes = this.nodes;
			for (i = nodes.length - 1; i >= 0; i-- ) {
				n = nodes[i];
				n.iconKind = (n.opened) ? checkMarkKind : 66;
			}
		}
		
		// In 'latest read' views, sort opened/read books at the bottom, not at the top
		FskCache.tree.sortableMasterNode.createChildNode4LatestRead = function (result) {
			this.constructChildNode(result, false, false);
			this.constructChildNode(result, false, true);
		};
		
		// In 'latest read' views, use changed iconKinds for navbar
		var oldGetBins = kbook.menuData.getBins;
		kbook.menuData.getBins = function () {
			var node, bins, i, c, record, field, val, bin, kind;
			node = this.node;
			if (!node || node.scrollbar === 'standard') {
				return null;
			}
			if (this.getSortBy() !== 'latest') {
				return oldGetBins.apply(this, arguments);
			}
			bins = new Fskin.kbookNavbar.BinSet(1);
			if (node.referNode) node = node.referNode;
			if (node.kind) {
				kind = node.kind;
				if (kind == 39) {
					kind = node.getTargetKind();
				}
				if (kind == 1 || kind == 120) {
					bins.add(2);
					bins.add(checkMarkKind);
				}
				else {
					if (kind == 105 || kind == 121) {
						bins.add(66);
						bins.add(checkMarkKind);
					}
					else {
						return null;
					}
				}
			}
			c = this.countRecords();
			field = this.getSortField();
			for (i = 0; i < c; i++) {
				record = this.getRecord(i);
				if (!this.getValue(record, 'ignoreSort')) {
					val = this.getValue(record, field);
					bin = bins.getBinByName(val);
					bin.accept(i);
				}
			}
			return bins;
		}
	}
	
	// Book content search
	var doContentSearch, cSearchTimer;
	
	var oldExecSearch = commonSearchOverlayModel.execSearch;
	commonSearchOverlayModel.execSearch = function (word) {
		if (opt.contentSearch === 'false') {
			return oldExecSearch.apply(this, arguments);
		}
		var dialog = kbook.model.getConfirmationDialog();
		dialog.target = this;
		dialog.onOk = function () {
			doContentSearch = true;
			oldExecSearch.call(this.target, word);
		}
		dialog.onNo = function () {
			doContentSearch = false;
			oldExecSearch.call(this.target, word);
		}
		dialog.openDialog(L('SEARCH_BOOK_CONTENTS'), 0);
	};
	
	var oldDoSearch = FskCache.tree.searchResultsNode.doSearch;
	FskCache.tree.searchResultsNode.doSearch = function () {
		if (!doContentSearch) {
			return oldDoSearch.apply(this, arguments);
		}
		if (this.nodes) {
			this.clear();
		}
		this.nodes = [];
		
		var dialog = kbook.model.getConfirmationDialog();
		dialog.target = this;
		dialog.onNo = function () {
			if (cSearchTimer) {
				cSearchTimer.cancel();
				cSearchTimer.close();
				cSearchTimer = null;
			}
			if (kbook.model.currentNode === this.target && !this.target.nodes.length) {
				this.target.gotoParent(kbook.model);
			}
			this.target = null;
			kbook.model.processed(100);
		}
		dialog.openDialog(L('SEARCHING_CONTENTS') + '...', 4);
		
		kbook.model.processing(100);
		cSearchTimer = new HardwareTimer();
		cSearchTimer.onCallback = cSearchCallback;
		cSearchTimer.target = this;
		cSearchTimer.nodes1 = this.target.nodes;
		cSearchTimer.nodes2 = this.nodes;
		cSearchTimer.term = this.term;
		cSearchTimer.i = 0;
		cSearchTimer.dialog = dialog;
		cSearchTimer.schedule(0);
		
		return 1;
	};
	
	var cSearchCallback = function () {
		var n, path;
		n = this.nodes1[this.i++];
		if (n && this.dialog.active) {
			path = (n.media) ? n.media.source.path + n.media.path : n.path;
			if (path && searchBookContents(path, this.term)) {
				n.parent = this.target;
				this.nodes2.push(n);
			}
			this.dialog.setVariable('MSG', L('SEARCHING_CONTENTS') + '...\n\n' + L('PROGRESS') + ': ' + this.i + ' / ' + this.nodes1.length + '\n' + L('HITS') + ': ' + this.nodes2.length);
			this.schedule(175); // lower values seem to hinder key/button processing
		} else {
			this.dialog.doNO();
			if (!this.nodes2.length) {
				this.dialog.openDialog('fskin:/l/strings/DIALOGMSG_INFORM_NOHITS'.idToString(), 1);
			}
		}
	}
	
	var searchBookContents = function (path, term) {
		var mime, viewer, ret;
		try {
			mime = FileSystem.getMIMEType(path);
			if (Document.Viewer.canHandle(mime)) {
				viewer = new Document.Viewer.URL('file://' + path, mime);
				if (viewer.find(term)) {
					ret = true;
				}
			}
		} catch(ignore) {
		} finally {
			if (viewer) viewer.close();
		}
		return ret;
	};
	
	var BookManagement_x50 = {
		name: 'BookManagement_x50',
		title: L('TITLE'),
		icon: 'BOOKS',
		onPreInit: function () {
			createPageOptionSettings();
		},
		onInit: function () {
			opt = this.options;
			// Workaround for numerical settings being saved as strings
			opt.BookList = parseInt(opt.BookList);
			opt.homeMenuPageButtons = parseInt(opt.homeMenuPageButtons);
			Core.events.subscribe(Core.events.EVENTS.SHUTDOWN, clearPageHists, true);
			if (opt.bookFlags === 'manualCheck') enableCheckmarks();
		},
		actions: [{
			name: 'BookListCycleForward',
			title: L('BOOKLIST_CYCLE_FORWARD'),
			group: 'Other',
			icon: 'BOOKS',
			action: function () {
				trigger1 = true;
				numCur = 0;
				if (opt.BookList === 4) {
					opt.BookList = 0;
				} else if (opt.BookList !== 3) {
					opt.BookList++;
					opt.CurrentCollection = '';
				}
				updateBookList();
				Core.settings.saveOptions(BookManagement_x50);
			}
		},
		{
			name: 'BookListCycleBackward',
			title: L('BOOKLIST_CYCLE_BACKWARD'),
			group: 'Other',
			icon: 'BOOKS',
			action: function () {
				trigger2 = true;
				numCur = 0;
				if (!opt.BookList) {
					opt.BookList = 4;
				} else if (opt.BookList !== 3) {
					opt.BookList--;
					opt.CurrentCollection = '';
				}
				updateBookList();
				Core.settings.saveOptions(BookManagement_x50);
			}
		},
		{
			name: 'BookListNextBooks',
			title: L('BOOKLIST_NEXT_BOOKS'),
			group: 'Other',
			icon: 'NEXT',
			action: function () {
				if (!bookChanged) {
					numCur += 3;
					trigger3 = true;
					updateBookList();
				}
			}
		},
		{
			name: 'BookListPreviousBooks',
			title: L('BOOKLIST_PREVIOUS_BOOKS'),
			group: 'Other',
			icon: 'NEXT',
			action: function () {
				if (numCur < 3 || bookChanged) {
					model.doBlink();
				} else {
					numCur -= 3;
					trigger4 = true;
					updateBookList();
				}
			}
		},
		{
			name: 'BookListSelectCollection',
			title: L('BOOKLIST_SELECT_COLLECTION'),
			group: 'Other',
			icon: 'BOOKS',
			action: function () {
				doSelectCollection('booklist');
			}
		}],
		optionDefs: [
			{
			groupTitle: L('CUSTOMIZE_HOME_MENU_BOOKLIST'),
			groupIcon: 'BOOKS',
			optionDefs: [
			{
				name: 'BookList',
				title: L('BOOK_SELECTION'),
				icon: 'BOOKS',
				defaultValue: '0',
				values: ['0', '1', '2', '3', '4'],
				valueTitles: {
					'0': L('LAST_ADDED_BOOKS'),
					'1': L('LAST_OPENED_BOOKS'),
					'2': L('BOOKS_BY_SAME_AUTHOR'),
					'3': L('NEXT_BOOKS_IN_COLLECTION'),
					'4': L('SELECT_COLLECTION') + '...'
				}
			},
			{
				name: 'IgnoreCards',
				title: L('IGNORE_MEMORY_CARDS'),
				icon: 'DB',
				defaultValue: 'false',
				values: ['true','false'],
				valueTitles: {
					'true': VALUE_TRUE,
					'false': VALUE_FALSE
				}
			},
			{
				name: 'homeMenuArrows',
				title: L('SHOW_HOME_MENU_ARROWS'),
				icon: 'PLAY',
				defaultValue: 'false',
				values: ['true', 'false'],
				valueTitles: {
					'true': VALUE_TRUE,
					'false': VALUE_FALSE
				}
			},
			{
				name: 'homeMenuPageButtons',
				title: L('HOME_MENU_PAGE_BUTTONS'),
				icon: 'SETTINGS',
				defaultValue: '0',
				values: ['0', '2'],
				valueTitles: {
					'0': L('PRESS_SCROLL_HOLD_SWITCH'),
					'2': L('PRESS_SWITCH_HOLD_SCROLL'),
				}
			}]},
			{
			groupTitle: L('COLLECTIONS'),
			groupIcon: 'BOOKS',
			optionDefs: [
				{
					name: 'addReadBooks',
					title: L('ADD_READ_BOOKS_COLLECTION'),
					icon: 'BOOKS',
					defaultValue: 'false',
					values: ['true','false'],
					valueTitles: {
						'true': VALUE_TRUE,
						'false': VALUE_FALSE
					}
				},
				{
					name: 'HideUnreadBooks',
					title: L('HIDE_UNREAD_BOOKS'),
					icon: 'BOOKS',
					defaultValue: 'false',
					values: ['true','false'],
					valueTitles: {
						'true': VALUE_TRUE,
						'false': VALUE_FALSE
					}
				},
				{
					name: 'HideUnreadPeriodicals',
					title: L('HIDE_UNREAD_PERIODICALS'),
					icon: 'BOOKS',
					defaultValue: 'false',
					values: ['true','false'],
					valueTitles: {
						'true': VALUE_TRUE,
						'false': VALUE_FALSE
					}
				},
				{
					name: 'HidePurchasedBooks',
					title: L('HIDE_PURCHASED_BOOKS'),
					icon: 'BOOKS',
					defaultValue: 'false',
					values: ['true','false'],
					valueTitles: {
						'true': VALUE_TRUE,
						'false': VALUE_FALSE
					}
				},
				{
					name: 'HideAddNewCollection',
					title: L('HIDE_ADD_NEW_COLLECTION'),
					icon: 'BOOKS',
					defaultValue: 'false',
					values: ['true','false'],
					valueTitles: {
						'true': VALUE_TRUE,
						'false': VALUE_FALSE
					}
				},
				{
					name: 'subCollections',
					title: L('SUB_COLLECTIONS'),
					icon: 'BOOKS',
					defaultValue: 'false',
					values: ['true','false'],
					valueTitles: {
						'true': VALUE_TRUE,
						'false': VALUE_FALSE
					}
				},
				{
					name: 'subCollSeparator',
					title: L('SUB_COLLECTIONS_SEPARATOR'),
					icon: 'BOOKS',
					defaultValue: '|',
					values: ['|', '.', ',', ':', ';', '/', '~'],
				}
			]},
			{
			groupTitle: L('SHOW_READING_PROGRESS'),
			groupIcon: 'BOOKMARK',
			optionDefs: [
				{
				name: 'readingProgressCurrent',
				title: L('SHOW_READING_PROGRESS_CURRENT'),
				icon: 'BOOKMARK',
				defaultValue: 'false',
				values: ['true','false'],
				valueTitles: {
					'true': VALUE_TRUE,
					'false': VALUE_FALSE
				}
				},
				{
				name: 'progressFormatCurrent',
				title: L('PROGRESS_FORMAT_CURRENT'),
				icon: 'SETTINGS',
				defaultValue: '2',
				values: ['1', '2', '3', '4', '5', '6', '7', '8'],
				valueTitles: {
					'1': L('PAGE') + ' 5 ' + L('OF') + ' 100',
					'2': L('PAGE') + ' 5 ' + L('OF') + ' 100 (5%)',
					'3': '5 ' + L('OF') + ' 100',
					'4': '5 ' + L('OF') + ' 100 (5%)',
					'5': '5%',
					'6': '5 / 100',
					'7': '5 / 100 (5%)',
					'8': L('PAGE') + ' 5 / 100 (5%)'
				}
				},
				{
				name: 'readingProgressThumbs',
				title: L('SHOW_READING_PROGRESS_THUMBS'),
				icon: 'BOOKMARK',
				defaultValue: 'false',
				values: ['all', 'home', 'false'],
				valueTitles: {
					'all': L('ALL_THUMBNAIL_VIEWS'),
					'home': L('HOME_MENU_ONLY'),
					'false': VALUE_FALSE
				}
				},
				{
				name: 'progressFormatThumbs',
				title: L('PROGRESS_FORMAT_THUMBS'),
				icon: 'SETTINGS',
				defaultValue: '3',
				values: ['1', '2', '3', '4', '5', '6', '7', '8'],
				valueTitles: {
					'1': L('PAGE') + ' 5 ' + L('OF') + ' 100',
					'2': L('PAGE') + ' 5 ' + L('OF') + ' 100 (5%)',
					'3': '5 ' + L('OF') + ' 100',
					'4': '5 ' + L('OF') + ' 100 (5%)',
					'5': '5%',
					'6': '5 / 100',
					'7': '5 / 100 (5%)',
					'8': L('PAGE') + ' 5 / 100 (5%)'
				}
				},
				{
				name: 'OnlyShowFromPage',
				title: L('ONLY_SHOW_FROM_PAGE'),
				icon: 'SETTINGS',
				defaultValue: '2',
				values: ['1', '2', '3', '4', '5', '10', '15', '20', '25', '50'],
				},
			]},
			{
				name: 'PeriodicalsAsBooks',
				title: L('TREAT_PERIODICALS_AS_BOOKS'),
				icon: 'PERIODICALS',
				defaultValue: 'false',
				values: ['true', 'false'],
				valueTitles: {
					'true': VALUE_TRUE,
					'false': VALUE_FALSE
				}	
			},
			{
				name: 'hideNotepads',
				title: L('HIDE_SAVED_NOTEPADS'),
				icon: 'TEXT_MEMO',
				defaultValue: 'false',
				values: ['true','false'],
				valueTitles: {
					'true': VALUE_TRUE,
					'false': VALUE_FALSE
				}
			},
			{
				name: 'bookFlags',
				title: L('BOOK_FLAGS'),
				icon: 'CHECKMARK',
				helpText: L('BOOK_FLAGS_HELPTEXT'),
				defaultValue: 'autoNew',
				values: ['autoNew', 'manualNew', 'manualCheck'],
				valueTitles: {
					'autoNew': L('AUTOMATIC_NEW_FLAG'),
					'manualNew': L('MANUAL_NEW_FLAG'),
					'manualCheck': L('MANUAL_CHECKMARK')
				}	
			},
			{
				name: 'markAllBooks',
				title: L('MARK_ALL_BOOKS'),
				icon: 'CHECKMARK',
				defaultValue: '',
				noCheck: true,
				values: ['read', 'unread'],
				valueTitles: {
					'read': L('MARK_ALL_BOOKS_READ'),
					'unread': L('MARK_ALL_BOOKS_UNREAD')
				}
			},
			{
				name: 'clearHistsOnShutdown',
				title: L('CLEAR_PAGE_HISTORY_ON_SHUTDOWN'),
				icon: 'CLOCK',
				helpText: L('CLEAR_PAGE_HIST_HELPTEXT'),
				defaultValue: 'false',
				values: ['true', 'false'],
				valueTitles: {
					'true': VALUE_TRUE,
					'false': VALUE_FALSE
				}	
			},
			{
				name: 'contentSearch',
				title: L('CONTENT_SEARCH'),
				icon: 'SEARCH_ALT',
				helpText: L('CONTENT_SEARCH_HELPTEXT'),
				defaultValue: 'false',
				values: ['true', 'false'],
				valueTitles: {
					'true': VALUE_TRUE,
					'false': VALUE_FALSE
				}	
			}
		],
		hiddenOptions: [
			{
				name: 'CurrentCollection',
				defaultValue: '',
			},
			{
				name: 'SelectedCollection',
				defaultValue: '',
			}
		],
		onSettingsChanged: function (propertyName, oldValue, newValue, object) {
			numCur = 0;
			switch (propertyName) {
				case 'homeMenuArrows':
					Core.config.homeMenuArrows = newValue;
					kbook.root.getDeviceRootNode().update(model);
					break;
				case 'homeMenuPageButtons':
					opt.homeMenuPageButtons = parseInt(newValue);
					break;
				case 'BookList':
					opt.BookList = parseInt(newValue);
					if (newValue === '4') doSelectCollection('booklist');
				case 'IgnoreCards':
				case 'hideNotepads':
					opt.CurrentCollection = '';
				case 'PeriodicalsAsBooks':
					updateBookList();
					break;
				case 'bookFlags':
					if (oldValue === 'manualCheck' || newValue === 'manualCheck') Core.ui.showMsg(L('MSG_RESTART'));
					break;
				case 'markAllBooks':
					markAllBooks(newValue === 'read');
					opt.markAllBooks = '';
					break;
				case 'addReadBooks':
				case 'HideUnreadBooks':
				case 'HideUnreadPeriodicals':
				case 'HidePurchasedBooks':
				case 'HideAddNewCollection':
				case 'subCollections':
				case 'subCollSeparator':
					Core.ui.nodes.collections.update(model);
					break;
				case 'contentSearch':
					doContentSearch = false;
			}
		}
	};

	Core.addAddon(BookManagement_x50);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error('in BookManagement.js', e);
}
