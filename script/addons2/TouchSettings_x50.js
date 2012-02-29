// Name: TouchSettings_x50
// Description: Contains options related to tap actions, swipe actions & zoom
// 
// Author: quisvir
//
// History:
//	2011-11-28 quisvir - Initial version
//	2011-11-29 quisvir - Fixed bug that broke page taps if 'extend' option was disabled
//	2011-12-01 quisvir - Adjusted extended tap areas
//	2011-12-05 quisvir - Added options for DoubleTap speed & disabling bookmark tapping
//	2011-12-06 quisvir - Added option to swith Tap/DoubleTap, disabled bookmark tapping option for now
//	2011-12-06 quisvir - Fixed Bookmark Tapping option
//	2011-12-07 quisvir - Cosmetic changes
//	2011-12-08 quisvir - Added option to disable predictive text
//	2011-12-13 quisvir - Added option to prevent popup menu overlapping selection
//	2011-12-17 quisvir - Some options moved to DictionaryOptions_x50
//	2012-02-28 quisvir - Fixed #301 'Pop-up dictionary demands to be closed and opened again to look up'
//	2012-02-29 quisvir - Fixed #304 'Only assigned gestures should be taken into account'

tmp = function() {

	var L, LX, log, opt;
	L = Core.lang.getLocalizer('TouchSettings');
	LX = Core.lang.LX;
	log = Core.log.getLogger('TouchSettings');
	
	
	/*** GENERAL ***/
	
	var touchAction, actionName2action, createTouchOptions;
	
	actionName2action = {};
	
	createTouchOptions = function () {
		var i, j, options, actions, target;
		actions = Core.addonByName.KeyBindings.getActionDefs();
		actionName2action = actions[4];
		options = ['SINGLE_TAP_TOP_LEFT', 'SINGLE_TAP_TOP_RIGHT', 'SINGLE_TAP_BOTTOM_LEFT', 'SINGLE_TAP_BOTTOM_RIGHT'];
		for (j=0;j<2;j++) {
			for (i=0;i<options.length;i++) {
				TouchSettings.optionDefs[j].optionDefs[0].optionDefs.push({
					name: options[i],
					title: L(options[i]),
					icon: 'SETTINGS',
					defaultValue: 'default',
					values: actions[0], 
					valueTitles: actions[1],
					valueIcons: actions[2],
					valueGroups: actions[3],
					useIcons: true
				});
			}
			options = ['SWIPE_LEFT', 'SWIPE_RIGHT', 'SWIPE_UP', 'SWIPE_DOWN'];
		}
	}
	
	
	/*** TAP RELATED ***/
	
	var readingTapX, readingTapY, oldSelectNoneWithoutUpdate, oldDoBlink, doNothingFunc;
	
	// Functions used for page tap actions
	oldSelectNoneWithoutUpdate = kbook.kbookPage.selectNoneWithoutUpdate;
	oldDoBlink = kbook.model.doBlink;
	doNothingFunc = function () {};
	
	// On tap, get coordinates from readingTracker
	var oldReadingTrackerTap = kbook.kbookPage.readingTracker.tap;
	kbook.kbookPage.readingTracker.tap = function (target, x, y) {
		readingTapX = x;
		readingTapY = y;
		oldReadingTrackerTap.apply(this, arguments);
	};
	
	var oldReadingTrackerDoubleTap = kbook.kbookPage.readingTracker.doubleTap;
	kbook.kbookPage.readingTracker.doubleTap = function (target, x, y) {
		Core.addonByName.DictionaryOptions.pageDoubleTap(x, y);
		oldReadingTrackerDoubleTap.apply(this, arguments);
	}
	
	var SwitchPageTaps = function () {
		var rt, dummy;
		rt = kbook.kbookPage.readingTracker;
		dummy = rt.tap;
		rt.tap = rt.doubleTap;
		rt.doubleTap = dummy;
		dummy = pageShortcutOverlayModel.doTap;
		pageShortcutOverlayModel.doTap = pageShortcutOverlayModel.doDoubleTap;
		pageShortcutOverlayModel.doDoubleTap = dummy;
		dummy = null;
	}
	
	// Call pageTapAction, but only if tap is not a link, highlight etc.
	var oldOnPageTapped = kbook.kbookPage.onPageTapped;
	kbook.kbookPage.onPageTapped = function (cache, bookmark, highlight, markupIcon, link) {
		if (!this.selection.length) {
			this.selectNoneWithoutUpdate = pageTapAction;
			kbook.model.doBlink = doNothingFunc;
			oldOnPageTapped.apply(this, arguments);
			this.selectNoneWithoutUpdate = oldSelectNoneWithoutUpdate;
			kbook.model.doBlink = oldDoBlink;
		} else {
			oldOnPageTapped.apply(this, arguments);
		}
	};
	
	// Execute tap action based on coordinates
	var pageTapAction = function () {
		var area, actionName;
		if (readingTapX < (this.width / 2)) {
			if (readingTapY < (this.height / 2)) {
				area = 'SINGLE_TAP_TOP_LEFT';
			} else {
				area = 'SINGLE_TAP_BOTTOM_LEFT';
			}
		} else {
			if (readingTapY < (this.height / 2)) {
				area = 'SINGLE_TAP_TOP_RIGHT';
			} else {
				area = 'SINGLE_TAP_BOTTOM_RIGHT';
			}
		}
		actionName = opt[area];
		if (actionName === 'default') {
			oldDoBlink();
		} else {
			touchAction = true;
			try {
				actionName2action[actionName].action();
			} catch(ignore) {}
			touchAction = false;
		}
	};
	
	// Disable Bookmark Tapping
	kbook.kbookPage.hitMark = function (cache) {
		var y, x, bounds, rct, obj0;
		if (opt.DisableBookmarkTaps === 'true') return;
		if (cache.error || cache.page >= this.countPages(true)) return;
		y = cache.y + this.marginHeight;
		x = cache.x + this.marginWidth;
		bounds = this.calcMark(false);
		rct = Fskin.scratchRectangle;
		if (!this.facing || cache.isRightPage) {
			rct.set(bounds[0].x, bounds[0].y, bounds[0].width, bounds[0].height);
		} else {
			rct.set(bounds[1].x, bounds[1].y, bounds[1].width, bounds[1].height);
		}
		obj0 = { x: x, y: y };
		if (rct.contains(obj0)) return cache;
	}
	
	// Extend tap area for links in books
	var oldHitLink, newHitLink;
	oldHitLink = Fskin.bookScroller.hitLink;
	newHitLink = function (cache) {
		var links, d, j, link, bounds, c, i, r;
		links = cache.links;
		if (links) {
			d = links.length;
			for (j=0;j<d;j++) {
				link = links[j];
				bounds = link.getBounds();
				c = bounds.length;
				for (i=0;i<c;i++) {
					r = bounds[i];
					if (cache.x > r.left-15 && cache.x < r.right+15 && cache.y > r.top-15 && cache.y < r.bottom+15) {
						link.cache = cache;
						return link;
					}
				}
			}
		}
	};
	
	
	/*** SWIPE RELATED ***/
	
	// Pass coordinate info to tracker so it can distinguish up/down
	kbook.kbookPage.doLine = function (dir, p1, p2) {
		if (this.getModel().overlayModel.checkZoomLock()) {
			kbook.kbookPage.readingTracker.line(this, dir, p1, p2);
		} else if (this.tracker !== kbook.kbookPage.freehandTracker) {
			this.tracker.line(this, dir, p1, p2);
		}
	};
	
	// Execute swipe action based on direction
	var oldLine = kbook.kbookPage.readingTracker.line;
	kbook.kbookPage.readingTracker.line = function (target, dir, p1, p2) {
		var dir2, swipe, actionName;
		if (opt.DisableAllSwipes === 'true') return;
		dir2 = dir;
		if (Math.abs(p2.y - p1.y) > Math.abs(p2.x - p1.x)) {
			if (p2.y - p1.y > 0) {
				dir2 = Gesture.bottomDirection;
			} else {
				dir2 = Gesture.upDirection;
			}
		}
		while (true) {
			switch (dir2) {
				case Gesture.leftDirection:
					swipe = 'SWIPE_LEFT';
					break;
				case Gesture.rightDirection:
					swipe = 'SWIPE_RIGHT';
					break;
				case Gesture.upDirection:
					swipe = 'SWIPE_UP';
					break;
				case Gesture.bottomDirection:
					swipe = 'SWIPE_DOWN';
			}
			actionName = opt[swipe];
			if (actionName === 'default') {
				if (dir2 !== dir) {
					// No action for up/down, rerun as left/right
					dir2 = dir;
					continue;
				}
				oldLine.apply(this, arguments);
			} else {
				target.clearTargetLink(true);
				touchAction = true;
				try {
					actionName2action[actionName].action();
				} catch(ignore) {}
				touchAction = false;
			}
			break;
		}
	};
	
	
	/*** ZOOM RELATED ***/
	
	var zoomLockOld = false;
	
	// In Zoom Lock, execute action on single tap
	var oldZoomOverlayDoTap = Fskin.kbookZoomOverlay.doTap;
	Fskin.kbookZoomOverlay.doTap = function (x, y) {
		if (this.isZoomLock) {
			switch (opt.ZoomLockSingleTap) {
				case 'none':
					return;
				case 'zoomin':
					this.zoomPosition(x, y, 50);
					return;
				case 'zoomout':
					this.zoomPosition(x, y, -50);
					return;
			}
		} else {
			oldZoomOverlayDoTap.apply(this, arguments);
		}
	};
	
	// In Zoom Lock, execute action on double tap
	var oldZoomOverlayDoDoubleTap = Fskin.kbookZoomOverlay.doDoubleTap;
	Fskin.kbookZoomOverlay.doDoubleTap = function (x, y) {
		if (this.isZoomLock) {
			switch (opt.ZoomLockDoubleTap) {
				case 'none':
					return;
				case 'zoomin':
					this.zoomPosition(x, y, 50);
					return;
				case 'zoomout':
					this.zoomPosition(x, y, -50);
					return;
			}
		} else {
			oldZoomOverlayDoDoubleTap.apply(this, arguments);
		}
	};
	
	// In Zoom Lock, move to top on next page
	Fskin.kbookZoomOverlay.doNext = function () {
		this.getModel().doNext();
		if (this.isZoomLock && opt.ZoomLockMoveToTop === 'true') kbook.model.doSomething('scrollTo', 0, 0);
	}
	
	// In Zoom Lock, enable panning
	var oldZoomOverlayDoDrag = Fskin.kbookZoomOverlay.doDrag;
	Fskin.kbookZoomOverlay.doDrag = function (x, y, type, tapCount) {
		if (opt.ZoomLockPanning === 'true' && this.isZoomLock) {
			zoomLockOld = this.isZoomLock;
			this.isZoomLock = false;
			oldZoomOverlayDoDrag.apply(this, arguments);
			this.isZoomLock = zoomLockOld;
			zoomLockOld = false;
		} else oldZoomOverlayDoDrag.apply(this, arguments);
	};
	
	var oldZoomOverlaydone = Fskin.kbookZoomOverlay.done;
	Fskin.kbookZoomOverlay.done = function () {
		if (zoomLockOld) this.isZoomLock = true;
		oldZoomOverlaydone.apply(this);
		this.isZoomlock = zoomLockOld;
	};

	Fskin.kbookZoomOverlay.canLine = Fskin.kbookZoomOverlay.canLineAndHold = function () {
		if (this.getVariable('STATE') === 'PAGE' && this.isZoomLock && opt.ZoomLockPanning === 'false') {
			return true;
		} else {
			return false;
		}
	};
	
	
	/*** OTHER ***/
	
	var oldGetCandidate = FskPredictive.group.getCandidate;
	FskPredictive.group.getCandidate = function (prefix, index) {
		if (opt.DisablePredictive === 'true') {
			return null;
		} else {
			return oldGetCandidate.apply(this, arguments);
		}
	}
	
	
	var TouchSettings = {
		name: 'TouchSettings',
        title: L('TITLE'),
		icon: 'STYLUS',
		optionDefs: [
			{
				groupTitle: L('TAP_OPTIONS'),
				groupIcon: 'STYLUS',
				optionDefs: [
				{
					groupTitle: L('CUSTOM_PAGE_TAP_ACTIONS'),
					groupIcon: 'STYLUS',
					optionDefs: []
				},
				{
					name: 'DisableBookmarkTaps',
					title: L('DISABLE_BOOKMARK_TAPPING'),
					icon: 'NOBOOKMARK',
					defaultValue: 'false',
					values: ['true', 'false'],
					valueTitles: {
						'true': L('VALUE_TRUE'),
						'false': L('VALUE_FALSE')
					}
				},
				{
					name: 'ExtendTapAreas',
					title: L('EXTEND_LINK_TAP_AREAS'),
					icon: 'STYLUS',
					helpText: L('EXTEND_LINK_HELPTEXT'),
					defaultValue: 'false',
					values: ['true', 'false'],
					valueTitles: {
						'true': L('VALUE_TRUE'),
						'false': L('VALUE_FALSE')
					}
				},
				{
					name: 'DoubleTapSpeed',
					title: L('DOUBLETAP_SPEED'),
					icon: 'STYLUS',
					helpText: L('DOUBLETAP_SPEED_HELPTEXT'),
					defaultValue: '500',
					values: ['50', '125', '250', '375', '500', '625', '750', '875', '1000'],
				},
				{
					name: 'switchPageTaps',
					title: L('SWITCH_PAGE_TAPS'),
					icon: 'STYLUS',
					defaultValue: 'false',
					values: ['true', 'false'],
					valueTitles: {
						'true': L('VALUE_TRUE'),
						'false': L('VALUE_FALSE')
					}
				}]
			},
			{
				groupTitle: L('SWIPE_OPTIONS'),
				groupIcon: 'GESTURE',
				optionDefs: [
				{
					groupTitle: L('CUSTOM_SWIPE_ACTIONS'),
					groupIcon: 'GESTURE',
					optionDefs: []
				},
				{
					name: 'DisableAllSwipes',
					title: L('DISABLE_ALL_SWIPES'),
					icon: 'CROSSED_BOX',
					defaultValue: 'false',
					values: ['true', 'false'],
					valueTitles: {
						'true': L('VALUE_TRUE'),
						'false': L('VALUE_FALSE')
					}
				}]
			},
			{
				groupTitle: L('ZOOM_OPTIONS'),
				groupIcon: 'TEXT_SCALE',
				optionDefs: [
				{
					name: 'ZoomLockPanning',
					title: L('ZOOMLOCK_PANNING'),
					icon: 'GESTURE',
					helpText: L('ZOOMLOCK_PANNING_HELPTEXT'),
					defaultValue: 'false',
					values: ['true', 'false'],
					valueTitles: {
						'true': L('VALUE_TRUE'),
						'false': L('VALUE_FALSE')
					}
				},
				{
					name: 'ZoomLockSingleTap',
					title: L('ZOOMLOCK_SINGLE_TAP'),
					icon: 'SETTINGS',
					defaultValue: 'none',
					values: ['none', 'zoomin', 'zoomout'],
					valueTitles: {
						'none': L('VALUE_NONE'),
						'zoomin': L('ZOOM_IN'),
						'zoomout': L('ZOOM_OUT')
					}
				},
				{
					name: 'ZoomLockDoubleTap',
					title: L('ZOOMLOCK_DOUBLE_TAP'),
					icon: 'SETTINGS',
					defaultValue: 'none',
					values: ['none', 'zoomin', 'zoomout'],
					valueTitles: {
						'none': L('VALUE_NONE'),
						'zoomin': L('ZOOM_IN'),
						'zoomout': L('ZOOM_OUT')
					}
				},
				{
					name: 'ZoomLockMoveToTop',
					title: L('MOVE_TO_TOP_ON_NEXT_PAGE'),
					icon: 'NEXT_PAGE',
					helpText: L('MOVE_TO_TOP_HELPTEXT'),
					defaultValue: 'false',
					values: ['true', 'false'],
					valueTitles: {
						'true': L('VALUE_TRUE'),
						'false': L('VALUE_FALSE')
					}
				}]
			},
			{
				name: 'DisablePredictive',
				title: L('DISABLE_PREDICTIVE'),
				icon: 'KEYBOARD',
				defaultValue: 'false',
				values: ['true', 'false'],
				valueTitles: {
					'true': L('VALUE_TRUE'),
					'false': L('VALUE_FALSE')
				}
			},
		],
		onPreInit: function () {
			createTouchOptions();
		},
		onInit: function () {
			opt = this.options;
			if (opt.ExtendTapAreas === 'true') Fskin.bookScroller.hitLink = newHitLink;
			if (opt.DoubleTapSpeed !== '500') {
				BookUtil.gesture.tracker.gesture.actions[3].time = parseInt(opt.DoubleTapSpeed);
				BookUtil.gesture.tracker.gesture.actions[4].time = parseInt(opt.DoubleTapSpeed);
			}
			if (opt.switchPageTaps === 'true') SwitchPageTaps();
		},
		onSettingsChanged: function (propertyName, oldValue, newValue, object) {
			switch (propertyName) {
				case 'switchPageTaps':
					if (newValue !== oldValue) SwitchPageTaps();
					break;
				case 'ExtendTapAreas':
					Fskin.bookScroller.hitLink = (newValue === 'true') ? newHitLink : oldHitLink;
					break;
				case 'DoubleTapSpeed':
					BookUtil.gesture.tracker.gesture.actions[3].time = parseInt(newValue);
					BookUtil.gesture.tracker.gesture.actions[4].time = parseInt(newValue);
			}
		},
		actions: [{
			name: 'SwipingToggle',
			title: L('TOGGLE_SWIPING'),
			group: 'Utils',
			icon: 'GESTURE',
			action: function () {
				opt.DisableAllSwipes = (opt.DisableAllSwipes === 'true') ? 'false' : 'true';
				Core.ui.showMsg(L('DISABLE_ALL_SWIPES') + ': ' + ((opt.DisableAllSwipes === 'true')?L('VALUE_TRUE'):L('VALUE_FALSE')));
				Core.settings.saveOptions(TouchSettings);
			}
		},
		{
			name: 'TouchscreenToggle',
			title: L('TOGGLE_TOUCHSCREEN'),
			group: 'Utils',
			icon: 'STYLUS',
			action: function () {
				if (touchAction) {
					kbook.model.doBlink();
					return; // to prevent disabling touchscreen with no way of turning it back on
				}
				if (ebook.device.touchpanel.activeArea.width === 0) {
					ebook.device.touchpanel.activeArea.width = ebook.device.framebuffer.width;
					ebook.device.touchpanel.activeArea.height = ebook.device.framebuffer.height;
					Core.ui.showMsg(L('TOUCHSCREEN') + ': ' + L('VALUE_TRUE'));
				} else {
					ebook.device.touchpanel.activeArea.width = 0;
					ebook.device.touchpanel.activeArea.height = 0;
					Core.ui.showMsg(L('TOUCHSCREEN') + ': ' + L('VALUE_FALSE'));
				}
				ebook.device.touchpanel.initialize();
			}
		},
		{
			name: 'ZoomLockActivate',
			title: L('ACTIVATE_ZOOMLOCK'),
			group: 'Book',
			icon: 'TEXT_SCALE',
			action: function () {
				if (kbook.model.STATE === 'PAGE') {
					pageSizeOverlayModel.openCurrentOverlay();
					pageSizeOverlayModel.goZoomMode();
					kbook.model.container.sandbox.ZOOM_OVERLAY.doZoomLock();
				} else {
					kbook.model.doBlink();
				}
			}
		},
		{
			name: 'SwitchPageTaps',
			title: L('SWITCH_PAGE_TAPS'),
			group: 'Utils',
			icon: 'STYLUS',
			action: function () {
				opt.switchPageTaps = (opt.switchPageTaps === 'true') ? 'false' : 'true';
				Core.ui.showMsg(L('SWITCH_PAGE_TAPS') + ': ' + ((opt.switchPageTaps === 'true')?L('VALUE_TRUE'):L('VALUE_FALSE')));
				Core.settings.saveOptions(TouchSettings);
				SwitchPageTaps();
			}
		}]
	};

	Core.addAddon(TouchSettings);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error('in TouchSettings.js', e);
}
