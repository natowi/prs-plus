// Name: ViewerSettings_600
// Description: Allows to 
//	autopage turn
//	no flash on overlay close
//	parent items in TOC
//	toggle border color grey/white
//
// History:
//	2012-05-29 Ben Chenoweth - Initial version (based on ViewerSettings_x50)

tmp = function() {

	// Localize
	var L, LX, log;
	L = Core.lang.getLocalizer("ViewerSettings_x50");
	LX = Core.lang.LX;
	log = Core.log.getLogger('ViewerSettings_600');

	var opt, autoPageTimer;
	
	var autoPageToggle = function () {
		if (!autoPageTimer) {
			Core.ui.showMsg(L("AUTO_PAGE_TURNER") + ": " + L("VALUE_TRUE"), 2);
			ebook.setStandbyWithoutSleep(true);
			kbook.model.processing(100);
			autoPageTimer = new Timer();
			autoPageTimer.target = null;
			autoPageTimer.onCallback = autoPageCallback;
			autoPageTimer.delay = parseInt(opt.AutoPageTurnerTime) * 1000;
			autoPageTimer.schedule(autoPageTimer.delay);
		} else {
			autoPageTimer.cancel();
			autoPageTimer.close();
			autoPageTimer = null;
			kbook.model.processed(100);
			ebook.setStandbyWithoutSleep(false);
			Core.ui.showMsg(L("AUTO_PAGE_TURNER") + ": " + L("VALUE_FALSE"), 2);
		}
	}
	
	var autoPageCallback = function () {
		if (kbook.model.STATE === 'PAGE') {
			kbook.model.container.sandbox.PAGE_GROUP.sandbox.PAGE.doNext();
		} else {
			autoPageToggle();
		}
	}

	var autoPageRestart = function () {
		if (autoPageTimer) {
			autoPageTimer.cancel();
			autoPageTimer.schedule(autoPageTimer.delay);
		}
	}
	
	// No full screen refresh on closing overlays
	kbook.model.fullScreenUpdate = function () {
		if (opt.noFlashOnOverlayClose === 'true' && this.STATE !== 'MENU_HOME') return;
		this.container.invalidate();
	};
	
	// Add parent items as separate bookmarks in multi-level ToC
	var oldTocConstruct = FskCache.tree.markReferenceNode.construct;
	FskCache.tree.markReferenceNode.construct = function () {
		oldTocConstruct.apply(this);
		doCreateBookmarkNode.call(this);
	}
	
	var doCreateBookmarkNode = function () {
		var item, prototype, node;
		item = this.bookmark;
		if (item && this.bookmarks.length && opt.parentItemsInToc === 'true') {
			prototype = FskCache.tree.bookmarkNode;
			node = prototype.nodeFromBookmark(item);
			node.cache = this.cache;
			node.parent = this;
			node.depth = this.depth + 1;
			node.selected = item.selected;
			node.title = node.title.replace(new RegExp('([\\1-\\31]+)', 'g'), ' ');
			node.name = node.title = Fskin.trimString(node.title);
			node._mycomment = L('PAGE') + ' ' + (this.bookmark._page + 1);
			node.onEnter = 'onEnterPageOption';
			this.nodes.unshift(node);
		}
	}
	
	var ViewerSettings_600 = {
		name: "ViewerSettings_600",
		settingsGroup: "viewer", // "advanced",
		optionDefs: [
			{
				name: "BorderColor",
				title: L("OPTION_BORDERCOLOR"),
				icon: "COLOR",
				defaultValue: "grey",
				values: ["grey", "white"],
				valueTitles: {
					"grey": L("VALUE_GREY"),
					"white": L("VALUE_WHITE")
				}									
			},
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
				name: "noFlashOnOverlayClose",
				title: L("NO_FLASH_ON_OVERLAY_CLOSE"),
				icon: "ABOUT",
				defaultValue: "false",
				values: ["true", "false"],
				valueTitles: {
					"true": L("VALUE_TRUE"),
					"false": L("VALUE_FALSE")
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
			}
		],
		onInit: function () {
			opt = this.options;
			if (opt.BorderColor === 'white') kbook.kbookPage.borderColor = Color.rgb.parse('white');
			Core.events.subscribe(Core.events.EVENTS.BOOK_PAGE_CHANGED, autoPageRestart);
		},
		onSettingsChanged: function (propertyName, oldValue, newValue, object) {
			switch (propertyName) {
				case 'BorderColor':
					kbook.kbookPage.borderColor = (newValue === 'grey') ? Color.rgb.parse('#6D6D6D') : Color.rgb.parse('white');
			}
		},
		actions: [{
			name: "autoPageToggle",
			title: L("TOGGLE_AUTO_PAGE_TURNER"),
			group: "Book",
			icon: "CLOCK",
			action: function () {
				autoPageToggle();
			}
		}]
	};

	Core.addAddon(ViewerSettings_600);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in ViewerSettings_600.js", e);
}
