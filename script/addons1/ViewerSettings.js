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
//
//	ToDo - marginCut: check for landscape; add to Book-Menu; possible enhancements: 4-quadrants view, ...


tmp = function() {

	// Localize
	var L, LX, log;
	L = Core.lang.getLocalizer("ViewerSettings_x50");
	LX = Core.lang.LX;
	log = Core.log.getLogger('ViewerSettings');

	var autoPageTimer, oldRender, myRender, setMarginCut, resetMarginCut, myBounds, dx, dy, myWidth, myHeight, marginCut;
	marginCut = false;

	setMarginCut = function () {
		var oldDoDigit, oldDoMenu, oldDoCenter, window, factor, drawRect, page,
			clipTop, clipBottom, offsetX, delta, oldRec, rec, doDigit, doMenu, doCenter, freeKeys;


		page = kbook.model.container.sandbox.PAGE_GROUP.sandbox.PAGE;		
		clipTop = clipBottom = offsetX = 0;
		delta = 5;

		oldRec = new Rectangle;
		rec = new Rectangle;

		doDigit = function (sender) {
			switch (sender.key * 1) {
			case 1: clipTop -= delta;
				break;
			case 2: clipTop += delta * 2;
				break;
			case 5: offsetX -= delta;
				break;
			case 6: offsetX += delta;
				break;
			case 9: clipBottom += delta * 2;
				break;
			case 0: clipBottom -= delta;
				break;
			}
			if (clipTop < 0) {
				clipTop = 0;
			}
			if (clipBottom < 0) {
				clipBottom = 0;
			}
			drawRect(clipTop, clipBottom);
			return true;
		};

		doMenu = function () {
			freeKeys();
			page.dataChanged();
		};

		doCenter = function () {
			var f;
			f = 754/rec.height;
			myHeight = Math.floor(754*f);
			myWidth = Math.floor(myHeight * 0.7754);
			dx = Math.floor((584-myWidth)/2) - offsetX;
			dy = Math.floor(clipTop * -f) 
			myBounds = new Rectangle(0, 0, myWidth, myHeight);
			marginCut = true;
			page.dataChanged();
			freeKeys();
		};

		drawRect = function (deltaTop, deltaBottom) {
			var x, y, width, height, color;
			window.beginDrawing;
			color = window.getPenColor();
			// clear old frame
			window.setPenColor(Color.white);
			window.frameRectangle(oldRec.x, oldRec.y, oldRec.width, oldRec.height );
	
			rec.height = 754 - deltaTop - deltaBottom;
			rec.y = 8 + deltaTop;

			rec.width = Math.floor(rec.height*factor);
			rec.x = 8 + offsetX + Math.floor((584-rec.width)/2);
	
			oldRec = rec;

			window.setPenColor(Color.black);
			window.frameRectangle(rec.x, rec.y, rec.width, rec.height );
			window.setPenColor(color);
			window.endDrawing;
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

	resetMarginCut = function () {
			marginCut = false;
	};

	oldRender = Document.Viewer.viewer.render;

	myRender = function () {
		var oldBounds, myBitmap, bitmap2, port;
		if (marginCut) {
		try {	
			oldBounds = this.get(Document.Property.dimensions);
			this.set(Document.Property.dimensions, myBounds);
			myBitmap = oldRender.call(this);
			this.set(Document.Property.dimensions, oldBounds);
			bitmap2 = new Bitmap(oldBounds.width, oldBounds.height);
			port = new Port(bitmap2);
			port.drawBitmap(myBitmap, dx, dy, myBounds.width, myBounds.height);
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
			autoPageTimer.delay = parseInt(ViewerSettings.options.AutoPageTurnerTime) * 1000;
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
	}
	
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
			Core.events.subscribe(Core.events.EVENTS.BOOK_PAGE_CHANGED, autoPageRestart);
			Core.events.subscribe(Core.events.EVENTS.BOOK_CHANGED, resetMarginCut);
			Core.hook.hookBefore(ebook, "rotate", resetMarginCut); //function(where, what, newFunction, tag) 
			Core.hook.hookBefore(Fskin.kbookPage, "doSize", resetMarginCut);
			Document.Viewer.viewer.render = myRender;
/*			var node;
			node = Core.ui.createContainerNode({
				title: L("MARGINCUT"),
				icon: 'SEARCH_ALT' 
			});
			node.onEnter = 'onEnterPage';
			kbook.children.marginCut = node; 
			Core.hook.hookAfter(kbook.children.marginCut, "enter", setMarginCut);	*/
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
