// Name: ViewerSettings
//
// History:
//	2012-01-19 quisvir - Initial version, reset autoPage timer on page change
//	2012-01-20 Mark Nord - kbook.model.processing() kbook.model.processed();
//		but this prevents SubCPUThread from sleeping, might lead to high battery consumption
//	2012-01-21 Mark Nord - first preview of MarginCut for 505/300
//	2012-01-29 Mark Nord - reset marginCut at appropriate places;  show helptext;
//	2012-02-18 quisvir - Add parent items as separate bookmarks in multi-level ToC (FR)
//	2012-02-20 Mark Nord - Fixed missing AutoPageTurn-Toggle-Action; Thanks Matt
//	2012-02-21 quisvir - Fixed #291 'Two taps are needed with SHOW_PARENT_ITEMS_IN_TOC enabled'
//	2012-03-19 Mark Nord - workaround for issue #303; disable keybindings in certain situations
//	2012-04-01 Mark Nord - MarginCut now also works in landscape-mode
//	2012-07-22 Mark Nord - Option to mask overlap in landscape-mode with a white bmp, instead of greying-out;
//				due to a (unresolved Sony-bug) lines may be truncated
//	2012-08-11 drMerry - Some typos
//	2012-09-01 - 2012-10-02 Mark Nord - PopUpMenu on doSize - epub CSS tweaking (credits to Analogus)
//	
//	ToDo - marginCut: add to Book-Menu; possible enhancements: 4-quadrants view, ...


var tmp = function() {

	// Localize
	var L, LX, log;
	L = Core.lang.getLocalizer("ViewerSettings_x50");
	LX = Core.lang.LX;
	log = Core.log.getLogger('ViewerSettings');

	var autoPageTimer, oldRender, myRender, setMarginCut, resetMarginCut, rotateMarginCut, myBounds, myHBounds, 
	dx, dy, hdx, hdy,  myWidth, myHeight, externCSS, delayTimer,
	marginCut = false, 
	mcLandscape = false,
	page = kbook.model.container.sandbox.PAGE_GROUP.sandbox.PAGE,
	cutout10,
	userStyleexternCSS = ['','','','','','',''],
	buildDoSizeMenus, sizeMenu, sizeActions, sizeTitles, simpleSizeMenu,
	t_ffont =  ['default', '0.94em', '0.97em', '1.00em', '1.033em', '1.066em', '1.10em', '1.20em'],
	t_lheight =['default', '1.0em', '1.25em', '1.5em', '1.75em', '2.0em'],
	t_indent = ['default', '0em', '1.0em', '1.5em', '2.0em'],
	t_margin = ['default', '0em', '0.5em', '1.0em', '1.5em'],

	setMarginCut = function () {
		var oldDoDigit, oldDoMenu, oldDoCenter, window, factor, drawRect, page,
			clipTop, clipBottom, offsetX, extraX, delta, oldRec, rec, doDigit, doMenu, doCenter, freeKeys;


		page = kbook.model.container.sandbox.PAGE_GROUP.sandbox.PAGE;		
		clipTop = clipBottom = offsetX = extraX = 0;
		delta = 5;

		//Create a rectangle object use Rectangle(0,0) rather than Rectangle in order to avoid errors.
		oldRec = new Rectangle(0,0);
		rec = new Rectangle(0,0);

		doDigit = function (sender) {
			switch (sender.key) { // * 1) {
			case '1': clipTop -= delta;
				break;
			case '2': clipTop += delta * 2;
				break;
		/*	case 3: extraX -= delta;
				break;
			case 4: extraX += delta;
				break;  */
			case '5': offsetX -= delta;
				break;
			case '6': offsetX += delta;
				break;
			case '9': clipBottom += delta * 2;
				break;
			case '0': clipBottom -= delta;
				break;
			}
			if (clipTop < 0) {
				clipTop = 0;
			}
			if (clipBottom < 0) {
				clipBottom = 0;
			}
		/*	try{ 
				if ((rec.width/rec.height < 0.71) && (extraX<0)) {
					extraX += delta;
				}
			} catch (ignore) {}	*/
			drawRect(clipTop, clipBottom);
			return true;
		};

		doMenu = function () {
			freeKeys();
			page.dataChanged();
		};

		doCenter = function () {
			var f;
			// calculation for portraitmode
			f = 754/rec.height;
			myHeight = Math.floor(754 * f);
			myWidth = Math.floor(myHeight * factor); 	// 0.7754 = 584 / 754
			dx = Math.floor((584-myWidth)/2) - offsetX;
			dy = Math.floor(clipTop * -f);
			myBounds = new Rectangle(0, 0, myWidth, myHeight);
			// calculation for landscapemode
			f = 584/rec.width;
			myWidth = Math.floor(784 * f);
			myHeight = Math.floor(myWidth / factor);	
			hdx = Math.floor((784-myWidth) / 2 - (offsetX / factor)) ;
			hdy = Math.floor(clipTop / factor * -f);
			myHBounds = new Rectangle(0, 0, myWidth, myHeight);
			marginCut = true;
			page.dataChanged();
			freeKeys();
		};

		drawRect = function (deltaTop, deltaBottom) {
			//UNUSED var x, y, width, height, color;
			window.beginDrawing();
			var color = window.getPenColor();
			// clear old frame
			window.setPenColor(Color.white);
			window.frameRectangle(oldRec.x, oldRec.y, oldRec.width, oldRec.height );
	
			rec.height = 754 - deltaTop - deltaBottom;
			rec.y = 8 + deltaTop;

			rec.width = Math.floor(rec.height*factor)+extraX;
			rec.x = 8 + offsetX + Math.floor((584-rec.width)/2);
	
			oldRec = rec;

			window.setPenColor(Color.black);
			window.frameRectangle(rec.x, rec.y, rec.width, rec.height );
			window.setPenColor(color);
			window.endDrawing();
			// needed to trigger a partial screen refresh - FixMe: find a better solution
			kbook.model.container.sandbox.STATUS_GROUP.sandbox.prspTime.setValue('');
		};

		freeKeys = function () {
			kbook.model.container.sandbox.PAGE_GROUP.sandbox.doDigit = oldDoDigit;
			kbook.model.doMenu = oldDoMenu;
			kbook.model.doCenter = oldDoCenter;		
			Core.addonByName.KeyBindings.overRide = false;
		};

		// toggle from marginCut to normal 100% view
		if (marginCut) {
			marginCut = false;
			page.dataChanged();
			return;
		}
		if (kbook.model.STATE === 'PAGE') {
			try{
				mcLandscape = ebook.getOrientation();
				if (mcLandscape) {
					Core.ui.showMsg(L('MARGINCUT_CUTINPORTRAIT') ,2);	
				return;
				}
					
				oldDoDigit = kbook.model.container.sandbox.PAGE_GROUP.sandbox.doDigit;
				oldDoMenu = kbook.model.doMenu;
				oldDoCenter = kbook.model.doCenter; 

				kbook.model.container.sandbox.PAGE_GROUP.sandbox.doDigit = doDigit;
				kbook.model.doMenu = doMenu;
				kbook.model.doCenter = doCenter;
				Core.addonByName.KeyBindings.overRide = true;

				factor = 584/754;
				window = kbook.model.container.getWindow();
				Core.ui.showMsg(L('MARGINCUT_HELP') ,'infinite');
				drawRect(0,0);
				clipTop = clipBottom = 0;
			}
			catch (e) {
				log.error('Error in setMarginCut: ',e);
				freeKeys();
			}
		}
	};

	rotateMarginCut = function () {
		if (marginCut) {
			mcLandscape = ebook.getOrientation();}	
	};

	resetMarginCut = function () {
			marginCut = false;
	};

	oldRender = Document.Viewer.viewer.render;

	myRender = function () {
		var oldBounds, myBitmap, bitmap2, port;
		if (marginCut) {
		try {
			oldBounds = this.get(Document.Property.dimensions);
			if (mcLandscape) {
				this.set(Document.Property.dimensions, myHBounds);	
			} 
			else {
				this.set(Document.Property.dimensions, myBounds);
			}
			myBitmap = oldRender.call(this);
			this.set(Document.Property.dimensions, oldBounds);
			bitmap2 = new Bitmap(oldBounds.width, oldBounds.height);
			//TODO shouldn't this be port(bitmap2) (lower case?) 2012-09-01 Mark Nord: No New Port() is correct
			port = new Port(bitmap2);
			if (mcLandscape) {
				port.drawBitmap(myBitmap, hdx, hdy, myHBounds.width, myHBounds.height);	
			} 
			else {
				port.drawBitmap(myBitmap, dx, dy, myBounds.width, myBounds.height);
			}
			myBitmap.close();
			port.close();
			return bitmap2;
			}
		catch (e) {
			log.error('error in myRender:',e);
			return oldRender.apply(this, arguments);
			}
		}
		else {
			return oldRender.apply(this, arguments);
		}
	};
	


	var autoPageToggle = function () {
		if (!autoPageTimer) {
			Core.ui.showMsg(L("AUTO_PAGE_TURNER") + ": " + L("VALUE_TRUE"), 2);
			kbook.model.processing(100);
			autoPageTimer = new Timer();
			autoPageTimer.onCallback = autoPageCallback;
			autoPageTimer.target = null;
			autoPageTimer.delay = parseInt(ViewerSettings.options.AutoPageTurnerTime,10) * 1000;
			autoPageTimer.schedule(autoPageTimer.delay);
		} else {
			autoPageTimer.cancel();
			autoPageTimer.close();
			autoPageTimer = null;
			kbook.model.processed(100);
			Core.ui.showMsg(L("AUTO_PAGE_TURNER") + ": " + L("VALUE_FALSE"), 2);
		}
	};
	
	var autoPageCallback = function () {
		if (kbook.model.STATE === 'PAGE') {
			kbook.model.container.sandbox.PAGE_GROUP.sandbox.PAGE.doNext();
		} else {
			autoPageToggle();
		}
	};

	var autoPageRestart = function () {
		if (autoPageTimer) {
			autoPageTimer.cancel();
			autoPageTimer.schedule(autoPageTimer.delay);
		}
	};

	// Add parent items as separate bookmarks in multi-level ToC
	var tocFunc, prop, oldTocFunc;
	tocFunc = FskCache.tree.markReferenceNode;
	prop = (tocFunc.construct) ? 'construct' : 'enter'; // model sniffing
	oldTocFunc = tocFunc[prop];
	
	tocFunc[prop] = function () {
		oldTocFunc.apply(this, arguments);
		var item, node;
		item = this.bookmark;
		if (item && this.bookmarks.length && ViewerSettings.options.parentItemsInToc === 'true') {
			if (this.construct) { // model sniffing
				node = FskCache.tree.bookmarkNode.nodeFromBookmark(item);
				node.title = node.title.replace(new RegExp('([\\1-\\31]+)', 'g'), ' ');
				node.name = node.title = Fskin.trimString(node.title);
				node.onEnter = 'onEnterPageOption';
			} else {
				node = xs.newInstanceOf(this.prototype);
				node.bookmark = item;
				node.name = node.title = item.name;
				node.bookmarks = [];
			}
			node.cache = this.cache;
			node.parent = this;
			node.depth = this.depth + 1;
			node.selected = item.selected;
			node._mycomment = L('PAGE') + ' ' + (this.bookmark._page + 1);
			this.nodes.unshift(node);
		}
	};

	// PopUpMenu for use with Size (Magnifier) Button
	var myDoSize = function (scale) {
		var page, data, media, s;
		page = kbook.model.container.sandbox.PAGE_GROUP.sandbox.PAGE;	
		data = page.data;
		media = kbook.model.currentBook.media;
		switch (scale) {
			case "S": s = media.scaleMin; break;
			case "M": s = media.scaleMin + 1; break;
			case "L": s = media.scaleMax; break;
		}
		resetMarginCut();
		media.browseTo(data, undefined, undefined, undefined, s);
		handleExtraCSS(0, "default"); // reset extra-fontsize
		return true;
	};

	var handleExtraCSS = function (index, value) {
		var currentPage;
		if (value !== "default") {
			userStyleexternCSS[index] = externCSS[index].replace(/placeholder/, value) +'\n';
			if (index  === 2) { // workaround handle @page {margin: }
				userStyleexternCSS[index+1] = externCSS[index+1].replace(/placeholder/, value) +'\n';
			}
		} else {
			userStyleexternCSS[index] = '';
			if (index  === 2) { // workaround handle @page {margin: }
				userStyleexternCSS[index+1] = '';
			}
		};
		currentPage = page.data.get(Document.Property.page);
		Core.addonByName.EpubUserStyle.reloadBook(userStyleexternCSS);
		page.data.set(Document.Property.page, currentPage);
		page.dataChanged();
		return true;
	};

	callDelayed = function (what) {
		try {
			delayTimer = new Timer();
		} catch(ignore) {}
		delayTimer.target = this;
		switch (what) {
			case 'setMarginCut' : 	
				delayTimer.onCallback = mcDelayed_onCallback;
				break;
			case 'cssFont' :
			 	delayTimer.onCallback = cssFont_onCallback;
				break;
		}
		delayTimer.schedule(100);
	};

	mcDelayed_onCallback = function () {
		delayTimer.cancel();
		delayTimer.close();
		delayTimer = null;
		setMarginCut();

	};

	cssFont_onCallback = function () {
		delayTimer.cancel();
		delayTimer.close();
		delayTimer = null;
		Core.addonByName.EpubUserStyle.actions[0].action();
	};

	buildDoSizeMenus = function () {
		// PopUpMenu definition
		LTS = Core.lang.getLocalizer("TextScale"),
		LSA = Core.lang.getLocalizer("StandardActions");
		sizeActions = [];
		sizeTitles = [LTS('VALUE_SMALL'), LTS('VALUE_MEDIUM'), LTS('VALUE_LARGE'), LSA('ACTION_doRotate'), L('MARGINCUT')];
		sizeActions.push( function () {myDoSize('S');	});
		sizeActions.push( function () {myDoSize('M');	});
		sizeActions.push( function () {myDoSize('L');	});
		sizeActions.push( function () {ebook.rotate(); });
		sizeActions.push( function () {callDelayed('setMarginCut'); });
		simpleSizeMenu = Core.popup.createSimpleMenu(sizeTitles, sizeActions); // for non-epubs

 		// not to type Core.popup X times
		var createMenuItem = Core.popup.createMenuItem;
		// Root menu for epubs
		sizeMenu = createMenuItem();
		sizeMenu.addChild(createMenuItem(LTS('VALUE_SMALL'), function () {myDoSize('S');}  )); 
		sizeMenu.addChild(createMenuItem(LTS('VALUE_MEDIUM'), function () {myDoSize('M');}  )); 
		sizeMenu.addChild(createMenuItem(LTS('VALUE_LARGE'), function () {myDoSize('L');}  )); 
		sizeMenu.addChild(createMenuItem(LSA('ACTION_doRotate'), function () {ebook.rotate();} )); 
		sizeMenu.addChild(createMenuItem(L('MARGINCUT'), function () {callDelayed('setMarginCut');} )); 
		sizeMenu.addChild(createMenuItem(L('CHANGEFONT'), function () {callDelayed('cssFont')} )); 
		// Submenus - TODO Localize
	
		cssFontSizeMenu = createMenuItem(L('OPTION_FONTSIZE')),
		cssLineHightMenu = createMenuItem(L('OPTION_LINEHEIGHT')),
		cssIndent = createMenuItem(L('OPTION_TEXTINDENT')),
		cssMargin = createMenuItem(L('OPTION_PAGEMARGIN'));

		sizeMenu.addChild(cssFontSizeMenu);
		sizeMenu.addChild(cssLineHightMenu);
		sizeMenu.addChild(cssIndent);
		sizeMenu.addChild(cssMargin);
		// Subsubmenus
		cssFontSizeMenu.addChild(createMenuItem(t_ffont[0], function() {return handleExtraCSS(0, t_ffont[0]);}  ));
		cssFontSizeMenu.addChild(createMenuItem(t_ffont[1], function() {return handleExtraCSS(0, t_ffont[1]);}  ));
		cssFontSizeMenu.addChild(createMenuItem(t_ffont[2], function() {return handleExtraCSS(0, t_ffont[2]);}  ));
		cssFontSizeMenu.addChild(createMenuItem(t_ffont[3], function() {return handleExtraCSS(0, t_ffont[3]);}  ));
		cssFontSizeMenu.addChild(createMenuItem(t_ffont[4], function() {return handleExtraCSS(0, t_ffont[4]);}  ));
		cssFontSizeMenu.addChild(createMenuItem(t_ffont[5], function() {return handleExtraCSS(0, t_ffont[5]);}  ));
		cssFontSizeMenu.addChild(createMenuItem(t_ffont[6], function() {return handleExtraCSS(0, t_ffont[6]);}  ));
		cssFontSizeMenu.addChild(createMenuItem(t_ffont[7], function() {return handleExtraCSS(0, t_ffont[7]);}  ));

		cssLineHightMenu.addChild(createMenuItem(t_lheight[0], function() {return handleExtraCSS(1, t_lheight[0]);}  ));
		cssLineHightMenu.addChild(createMenuItem(t_lheight[1], function() {return handleExtraCSS(1, t_lheight[1]);}  ));
		cssLineHightMenu.addChild(createMenuItem(t_lheight[2], function() {return handleExtraCSS(1, t_lheight[2]);}  ));
		cssLineHightMenu.addChild(createMenuItem(t_lheight[3], function() {return handleExtraCSS(1, t_lheight[3]);}  ));
		cssLineHightMenu.addChild(createMenuItem(t_lheight[4], function() {return handleExtraCSS(1, t_lheight[4]);}  ));
		cssLineHightMenu.addChild(createMenuItem(t_lheight[5], function() {return handleExtraCSS(1, t_lheight[5]);}  ));

		cssIndent.addChild(createMenuItem(t_indent[0], function() {return handleExtraCSS(5, t_indent[0]);}  ));
		cssIndent.addChild(createMenuItem(t_indent[1], function() {return handleExtraCSS(5, t_indent[1]);}  ));
		cssIndent.addChild(createMenuItem(t_indent[2], function() {return handleExtraCSS(5, t_indent[2]);}  ));
		cssIndent.addChild(createMenuItem(t_indent[3], function() {return handleExtraCSS(5, t_indent[3]);}  ));
		cssIndent.addChild(createMenuItem(t_indent[4], function() {return handleExtraCSS(5, t_indent[4]);}  ));

		cssMargin.addChild(createMenuItem(t_margin[0], function() {return handleExtraCSS(2, t_margin[0]);}  ));
		cssMargin.addChild(createMenuItem(t_margin[1], function() {return handleExtraCSS(2, t_margin[1]);}  ));
		cssMargin.addChild(createMenuItem(t_margin[2], function() {return handleExtraCSS(2, t_margin[2]);}  ));
		cssMargin.addChild(createMenuItem(t_margin[3], function() {return handleExtraCSS(2, t_margin[3]);}  ));
	};

	Fskin.kbookPage.doSize = function() {
		current = kbook.model.currentBook;
		if (current && current.media.mime === 'application/epub+zip') {
			Core.popup.showMenu(sizeMenu);
		} else {Core.popup.showMenu(simpleSizeMenu);
		}
	};

	loadExtraCSS = function () {
		var filePath, content, lines, path, i, n;
		// load externCSS
			filePath = Core.config.userCSSPath + "extern.css";
			content = Core.io.getFileContent(filePath, null);
			if (content !== null) {
				externCSS = [];
				lines = content.split("\n");
				if (lines) {
					i = 0;
					n = lines.length;
						for (i; i < n; i++) {
							if ((lines[i].indexOf("#")) === -1 && (lines[i].length)) {
								externCSS.push(lines[i]);
							}
						}	
					}
			} else {
				externCSS = ['','','','','','',''];
			}
	};
	
	var ViewerSettings = {
		name: "ViewerSettings",
		settingsGroup: "viewer",
		optionDefs: [
		{
			name: "AutoPageTurnerTime",
			title: L("AUTO_PAGE_TURNER"),
			icon: "CLOCK",
			defaultValue: "60",
			values: ["10", "20", "30", "40", "50", "60", "75", "90", "105", "120", "150", "180", "210", "240", "270", "300"],
			valueTitles: {
				"10": LX("SECONDS", 10),
				"20": LX("SECONDS", 20),
				"30": LX("SECONDS", 30),
				"40": LX("SECONDS", 40),
				"50": LX("SECONDS", 50),
				"60": LX("SECONDS", 60),
				"75": LX("SECONDS", 75),
				"90": LX("SECONDS", 90),
				"105": LX("SECONDS", 105),
				"120": LX("SECONDS", 120),
				"150": LX("SECONDS", 150),
				"180": LX("SECONDS", 180),
				"210": LX("SECONDS", 210),
				"240": LX("SECONDS", 240),
				"270": LX("SECONDS", 270),
				"300": LX("SECONDS", 300)
			}
		},
		{
			name: "parentItemsInToc",
			title: L("SHOW_PARENT_ITEMS_IN_TOC"),
			icon: "LIST",
			defaultValue: "false",
			values: ["true", "false"],
			valueTitles: {
				"true": L("VALUE_TRUE"),
				"false": L("VALUE_FALSE")
			}
		},
		{
			name: "OverlapWhite",
			title: L("OPTION_WHITEMASK"),
			icon: "COLOR",
			helpText: L("HELP_WHITEMASK"), 
			defaultValue: "false",
			values: ["true", "false"],
			valueTitles: {
				"true": L("VALUE_TRUE"),
				"false": L("VALUE_FALSE")
			}
		}],
		actions: [
		{
			name: "autoPageToggle",
			title: L("TOGGLE_AUTO_PAGE_TURNER"),
			group: "Book",
			icon: "CLOCK",
			action: function () {
				autoPageToggle();
			}
		},
		{
			name: "marginCut",
			title: L("MARGINCUT"),
			group: "Book",
			icon: "SEARCH_ALT",
			action: function () {
				setMarginCut();
			}
		}],
		onInit: function () {
			var result;
			Core.events.subscribe(Core.events.EVENTS.BOOK_PAGE_CHANGED, autoPageRestart);
			Core.events.subscribe(Core.events.EVENTS.BOOK_CHANGED, resetMarginCut);
			Core.hook.hookAfter(ebook, "rotate", rotateMarginCut); //function(where, what, newFunction, tag) 
		//	Core.hook.hookBefore(Fskin.kbookPage, "doSize", resetMarginCut);
			Document.Viewer.viewer.render = myRender;
			try{
				cutout10 = page.skin.cutouts[10];
				if (ViewerSettings.options.OverlapWhite === "true") {
					page.skin.cutouts[10] = page.skin.cutouts[0];
				}
			} catch (e) {
				log.error("in buffering cutout10", e);
			}
			// load externCSS
			loadExtraCSS();
			// load userCSSValues - if any	- there should be a simpler way !?
			result = Core.system.callScript(Core.config.userCSSValues, log);
			if (result) { 
				t_ffont = result.t_ffont;
				t_lheight = result.t_lheight;
				t_indent = result.t_indent;
				t_margin = result.t_margin;
			}
			buildDoSizeMenus();
		},
		onSettingsChanged: function (propertyName, oldValue, newValue, object) {
		  //TODO oldValue + object unused
			switch (propertyName) {
				case 'OverlapWhite':
					if (newValue === "true") {
						page.skin.cutouts[10] = page.skin.cutouts[0];
					} else {
						page.skin.cutouts[10] = cutout10;
					}
					break;
			}
		}
	};

	Core.addAddon(ViewerSettings);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in ViewerSettings.js", e);
}
