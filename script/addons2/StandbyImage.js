// Name: StandbyImage
// Description: addon to set Standby/Shutdown Image
// Author: Mark Nord
//
// History:
//	2011-07-03 Mark Nord - Initial version
//	2011-07-05 Ben Chenoweth - minor corrections
//	2011-11-21 quisvir - Rewritten to merge all relevant code, add shutdown image support, icon, custom text
//	2011-11-22 quisvir - Implemented bugfixes from Mark Nord, fixed standby icon indices
//	2011-11-22 Mark Nord - some more tweaks to get it working with 300/505
//	2011-11-25 Ben Chenoweth - icon on standby and shutdown now separate options
//	2011-11-26 quisvir - separate standby/shutdown text
//	2011-11-27 quisvir - made customtext code more flexible, added scaling option
//	2011-11-28 Ben Chenoweth - Added event overlay option (on standby and/or shutdown)
//	2011-12-01 quisvir - Fixed issue #238 "505: does not display custom Standby text"
//	2011-12-03 quisvir - Added Auto Standby/Shutdown Time options
//	2011-12-04 quisvir - Fixed regression that broke fallback to system standby function
//	2011-12-07 quisvir - Fixed fallback to oldStandbyImageDraw on shutdown
//	2011-12-07 quisvir - Fixed shutdown image not displaying on auto-shutdown (issue #242)
//	2011-12-08 Mark Nord - Added Auto Standby Time option for 300/505
//	2011-12-10 quisvir - Merged Auto Standby Time options
//	2011-12-15 quisvir - Added set/restore portrait orientation on shutdown/startup
//	2011-12-29 quisvir - Added USB Data Transfer Mode dialog to allow reading while charging via usb
//	2011-12-30 Mark Nord - Added UI for function above for 300/505
//	2011-12-30 quisvir - Use popup menu on all models, stop usb charging on disconnect
//	2012-03-29 Ben Chenoweth - Added mini cover overlay option (on standby and/or shutdown); aspect ratio preserved

tmp = function() {
	var L, LX, log, orgOrientation, shutdown, oldStandbyImageDraw, getBookCover, usbConnected, standbyState;
	
	// Localize
	L = Core.lang.getLocalizer("StandbyImage");
	LX = Core.lang.LX;
	log = Core.log.getLogger("StandbyImage");
	
	// Initial values
	standbyState = 1;
	orgOrientation = 0;

	// Suspend: set orientation to portrait, call standbyimage if necessary
	var oldSuspend = kbook.model.suspend;
	kbook.model.suspend = function () {
		oldSuspend.apply(this);
		try {
			standbyState = 0;
			if (StandbyImage.options.StandbyMode !== 'act_page') {
				orgOrientation = ebook.getOrientation();
				if (orgOrientation) {
					ebook.rotate(0);
					// Model sniffing: update screen for 300/505
					if (!standbyImage.color) {
						// without this the current page is drawn over the standbyImage
						Core.ui.updateScreen();
					}
				}	
				
			}	
			// Model sniffing: call standbyimage for 300/505
			if (!standbyImage.color) {
				standbyImage.draw.call(kbook.model.container);
			}	
		} catch(ignore) {}
	};
	
	// Resume: restore orientation if necessary
	var oldResume = kbook.model.resume;
	kbook.model.resume = function () {
		if (orgOrientation) {
			ebook.rotate(orgOrientation);
			orgOrientation = 0;
		}
		standbyState = 1;
		oldResume.apply(this);
	};
	
	// Shutdown: set orientation to portrait
	var oldDoDeviceShutdown = kbook.model.doDeviceShutdown;
	kbook.model.doDeviceShutdown = function () {
		var orient = ebook.getOrientation();
		if (orient) {
			StandbyImage.options.orgOrientation = orient.toString();
			Core.settings.saveOptions(StandbyImage);
			ebook.rotate(0);
		}
		oldDoDeviceShutdown.apply(this, arguments);
	}
	
	// Quit: if no exit code already set, call standbyimage, set exit code 6
	var oldDoQuit = Fskin.window.doQuit;
	Fskin.window.doQuit = function () {
		var container = kbook.model.container;
		// If device is in standby (auto-shutdown), wake it up first
		if (container.getVariable('STANDBY_STATE') === 0) {
			container.bubble('setKeyHandlerActive', true);
			container.bubble('doPowerSwitch');
			kbook.model.doDeviceShutdown();
		} else {
			try {
				if (!FileSystem.getFileInfo('/tmp/exitcode')) {
					shutdown = true;
					standbyImage.draw.call(container);
					ebook.setExitCode(6);
				}
			} catch(ignore) {}
			oldDoQuit.apply(this);
		}
	};
	
	// getBookCover for 600+ and for epub on 300/505
	var getBookCoverNew = function (path, w, h) {
		var bitmap, viewer, bounds, natural, clip, rects, rect, scaled, ratio, bitmap2, port;
		try {
			viewer = new Document.Viewer.URL('file://' + path, FileSystem.getMIMEType(path));
			viewer.set(Document.Property.textScale, 0);
			viewer.set(Document.Property.textEngine, 'FreeType');
			viewer.set(Document.Property.font, 'Dutch801 Rm BT');
			bounds = new Rectangle(0, 0, w, h);
			while (1) {
				viewer.set(Document.Property.dimensions, bounds);
				bitmap = viewer.render();
				natural = viewer.get(Document.Property.naturalBounds);
				if (natural) {
					clip = natural;
				} else {
					natural = bounds;
				}
				rects = viewer.get(Document.Property.imageRects);
				if (rects && rects.length == 1) {
					rect = rects[0];
					rect.intersect(natural);
					if (scaled || rect.width * rect.height >= natural.width * natural.height * 0.8) {
						if (!scaled && rect.height < h && rect.width < w) {
							ratio = (rect.height/rect.width > h/w) ? (h/rect.height) : (w/rect.width);
							bounds.set(0, 0, Math.round(w*ratio), Math.round(h*ratio));
							bitmap.close();
							scaled = true;
							continue;
						}
						clip = new Rectangle();
						clip.set(rect.x, rect.y, rect.width, rect.height);
					}
				}
				break;
			}
			if (clip) {
				bitmap2 = new Bitmap(clip.width, clip.height);
				port = new Port(bitmap2);
				port.drawBitmap(bitmap, 0, 0, clip.width, clip.height, clip);
				bitmap.close();
				port.close();
				bitmap = bitmap2;
			}
		} catch (ignore) {}
		if (viewer) viewer.close();
		return bitmap;
	};
	
	// getBookCover for 300/505, calls getBookCoverNew for epub
	var getBookCoverOld = function (path, w, h) {
		var bitmap, page, oldpage;
		if (FileSystem.getMIMEType(path) === "application/x-sony-bbeb") { // it's a LRF BBeB-Book 
			if (orgOrientation) {
			// Fixme enable CoverPage for BBeB/LRF in landscape
				return null;
			}	
			page = kbook.model.container.sandbox.PAGE_GROUP.sandbox.PAGE;
			oldpage = page.data.get(Document.Property.page);
			page.data.set(Document.Property.page, 0);
			bitmap = page.data.render();
			page.data.set(Document.Property.page, oldpage);
			return bitmap;
		} else { // its a epub or pdf
			return getBookCoverNew(path, w, h);
		} 
	};
	
	// Get wallpaper for 300/505/600
	var getRandomWallpaper = function() {
		var  path, folder, idx, list;
		try {
			folder = System.applyEnvironment("[prspPublicPath]wallpaper/");
			list = Core.io.listFiles(folder, ".jpg", ".jpeg", ".gif", ".png");
			while (list.length) {
				idx = Math.floor(Math.random() * list.length);
				path = list[idx];
				if (Core.media.isImage(folder+path)) {
					return new Bitmap(folder+path);
				} else {
					list.splice(idx, 1);
				}
			}
		} catch (ignore) {}
		return null;
	};
	
	// Assign correct functions for each model
	switch (Core.config.model) {
		case "350":
		case "650":
		case "950":
			oldStandbyImageDraw = standbyImage.draw;
		case "600":
			getBookCover = getBookCoverNew;
			break;
		default:
			standbyImage = {};
			getBookCover = getBookCoverOld;
	}
	
	standbyImage.draw = function () {
	
		var opt, mode, win, w, h, path, bitmap, bounds, ratio, width, height, x, y, oldPencolor, oldTextStyle, oldTextSize, oldTextAlignmentX, oldTextAlignmentY, icon, iconX, file, content, lines, match, i, eventsonly, customText;
		opt = StandbyImage.options;
		mode = (shutdown) ? opt.ShutdownMode : opt.StandbyMode;
		win = this.getWindow();
		
		//Model sniffing: 300/505
		//win.width / win.height isn't update after ebook.rotate!? giving w:800 h:600 
		if (!standbyImage.color && mode !== 'act_page') {
			w = 600; 
			h = 800; 
		} else {
			w = win.width;
			h = win.height;
		}	
		
		// Save settings
		oldPencolor = win.getPenColor();
		oldTextStyle = win.getTextStyle();
		oldTextSize = win.getTextSize();
		oldTextAlignmentX = win.getTextAlignment().x;
		oldTextAlignmentY = win.getTextAlignment().y;
		
		win.beginDrawing();
		
		if (mode === 'act_page') {
			win.setTextStyle(1); // 0 = regular, 1 = bold, 2 = italic, 3 = bold italic
			win.setTextSize(20);
			win.setTextAlignment(2, 0); // (x, y): 0 = center, 1 = left, 2 = right, 3 = top, 4 = bottom
			win.setPenColor(Color.black);
			win.fillRectangle(w-155, h-30, 155, 30);
			win.setPenColor(Color.white);
			win.drawText(L('SLEEPING'), 0, h-30, w, 30);
		} else {
			win.setPenColor(Color.white);
			win.fillRectangle(win);
			
			switch (mode) {
				case 'cover':
					if (kbook.model.currentBook) {
						path = kbook.model.currentBook.media.source.path + kbook.model.currentBook.media.path;
						bitmap = getBookCover(path, w, h);						
					}
				case 'random':
				case 'standby':
					if (!bitmap) {
						if (oldStandbyImageDraw) {
							this.color = Color.white; // used by oldStandbyImageDraw, not present in shutdown context
							if (shutdown) kbook.model.setStandbyPicturePath();
							oldStandbyImageDraw.apply(this);
						} else {
							bitmap = getRandomWallpaper();
						}
					}
					break;
				case 'black':
					win.setPenColor(Color.black);
					win.fillRectangle(win);
					break;
				case 'calendar':
					try {
						eventsonly=false;
						Core.addonByName.Calendar.drawStandbyWidget(win, eventsonly);
					} catch (e) { log.error(e); }
					break;
			}
			
			// If getBookCover or getRandomWallpaper succeeded, draw bitmap
			if (bitmap) {
				bounds = bitmap.getBounds();
				switch (opt.ScalingMethod) {
					case 'keepaspect':
						ratio = (bounds.height/bounds.width > h/w) ? (h/bounds.height) : (w/bounds.width);
						width = Math.floor(bounds.width * ratio);
						height = Math.floor(bounds.height * ratio);
						x = (w > width) ? Math.floor((w - width) / 2) : 0;
						y = (h > height) ? Math.floor((h - height) / 2) : 0;
						break;
					case 'stretch':
						width = w;
						height = h;
						x = y = 0;
				}
				if (opt.dither === 'true') bitmap = bitmap.dither(true);
				win.drawBitmap(bitmap, x, y, width, height);
				bitmap.close();
			}
			
			// Display standby/shutdown icon
			if ((shutdown && opt.DisplayShutdownIcon === 'true') || (!shutdown && opt.DisplayStandbyIcon === 'true')) {
				win.setPenColor(Color.black);
				win.fillRectangle(w-69, 9, 60, 60);
				icon = (shutdown) ? Core.config.compat.NodeKinds.SHUTDOWN : Core.config.compat.NodeKinds.STANDBY;
				iconX = (shutdown) ? w-74 : w-73;
				kbook.model.container.cutouts['kBookVIcon-a'].draw(win, icon, 0, iconX, 4, 70, 70);
			}
			
			// Display custom standby/shutdown text from customtext.cfg
			if ((shutdown && opt.DisplayShutdownText === 'true') || (!shutdown && opt.DisplayStandbyText === 'true')) {
				win.setPenColor(Color.black);
				win.fillRectangle(0, h-30, w, 30);
				win.setPenColor(Color.white);
				win.setTextStyle(1);
				win.setTextSize(20);
				win.setTextAlignment(0, 0);
				file = Core.config.publicPath + 'customtext.cfg';
				content = Core.io.getFileContent(file, null);
				if (content !== null) {
					lines = content.split('\n');
					match = (shutdown) ? 'Enter Shutdown Text below this line' : 'Enter Standby Text below this line';
					for (i=0; i < lines.length - 1 && lines[i].indexOf(match) === -1; i++);
					if (i !== lines.length - 1) customText = lines[i+1].replace('\r','');
				}
				if (!customText || customText === '') customText = L('CUSTOM_TEXT_NOT_FOUND');
				win.drawText(customText, 0, h-30, w, 30);
			}
			
			// Display events overlay
			if (((shutdown && opt.DisplayShutdownEvents === 'true') || (!shutdown && opt.DisplayStandbyEvents === 'true')) && (mode !== 'calendar')) {
				eventsonly=true;
				Core.addonByName.Calendar.drawStandbyWidget(win, eventsonly);
			}
			
			// Display mini-cover
			if (((shutdown && opt.DisplayShutdownMiniCover === 'true') || (!shutdown && opt.DisplayStandbyMiniCover === 'true')) && (mode !== 'cover')) {
				if (kbook.model.currentBook) {
					path = kbook.model.currentBook.media.source.path + kbook.model.currentBook.media.path;
					w = 150;
					h = 200;
					bitmap = getBookCover(path, w, h);
					if (bitmap) {
						bounds = bitmap.getBounds();
						ratio = (bounds.height/bounds.width > h/w) ? (h/bounds.height) : (w/bounds.width);
						width = Math.floor(bounds.width * ratio);
						height = Math.floor(bounds.height * ratio);
						win.setPenColor(Color.black);
						win.fillRectangle(9, 9, width + 2, height + 2);
						if (opt.dither === 'true') bitmap = bitmap.dither(true);
						win.drawBitmap(bitmap, 10, 10, width, height);
						bitmap.close();
					}
				}
			}
		}
		win.endDrawing();
		// Model sniffing: call win.update() only for 600/x50
		if (standbyImage.color) {
			win.update();
		}
		// Restore settings
		win.setPenColor(oldPencolor);
		win.setTextStyle(oldTextStyle);
		win.setTextSize(oldTextSize);
		win.setTextAlignment(oldTextAlignmentX, oldTextAlignmentY);
	};
	
	var onUSBConnect = function () {
		var menu, actions, titles;
		usbConnected = true;
		if (StandbyImage.options.TransferModeDialog === 'true' && standbyState !== 0) {
			actions = [];
			titles = [L('ENTER_DATA_TRANSFER_MODE'), L('KEEP_READING')];
			actions.push( function () {
				if (usbConnected) {
					USBDispatcher.onConnected();
					return true;
				}
			});
			actions.push( function () {
				if (usbConnected) ebook.setUsbCharge(true);
			});
			menu = Core.popup.createSimpleMenu(titles, actions);
			Core.popup.showMenu(menu);
			return;
		}
		USBDispatcher.onConnected();
	};

	var onUSBDisconnect = function () {
		usbConnected = false;
		ebook.setUsbCharge(false);
	}
	
	var StandbyImage = {
		name: "StandbyImage",
		title: L("TITLE"),
		icon: "STANDBY",
		optionDefs: [
			{
			groupTitle: L('STANDBY_IMAGE'),
			groupIcon: 'STANDBY',
			optionDefs: [
				{
					name: "StandbyMode",
					title: L("STANDBY_IMG_KIND"),
					icon: "STANDBY",
					defaultValue: "standby",
					values: ["standby", "white", "black", "cover", "act_page", "calendar"],
					valueTitles: {
						"standby": L("VALUE_ORIGINAL_STANDBY"),
						"random": L("VALUE_RANDOM"),
						"white": L("VALUE_WHITE_SCREEN"),
						"black": L("VALUE_BLACK_SCREEN"),
						"cover": L("VALUE_COVER"),
						"act_page": L("VALUE_ACT_PAGE"),
						"calendar": L("VALUE_CALENDAR")
					}
				},
				{
					name: "DisplayStandbyIcon",
					title: L("DISPLAY_STANDBY_ICON"),
					icon: "STANDBY",
					defaultValue: "false",
					values: ["true", "false"],
					valueTitles: {
						"true": L("VALUE_TRUE"),
						"false": L("VALUE_FALSE")
					}
				},
				{
					name: "DisplayStandbyText",
					title: L("DISPLAY_STANDBY_TEXT"),
					icon: "ABC",
					defaultValue: "false",
					values: ["true", "false"],
					valueTitles: {
						"true": L("VALUE_TRUE"),
						"false": L("VALUE_FALSE")
					}
				},
				{
					name: "DisplayStandbyEvents",
					title: L("DISPLAY_STANDBY_EVENTS"),
					icon: "DATE",
					defaultValue: "false",
					values: ["true", "false"],
					valueTitles: {
						"true": L("VALUE_TRUE"),
						"false": L("VALUE_FALSE")
					}
				},
				{
					name: "DisplayStandbyMiniCover",
					title: L("DISPLAY_STANDBY_MINI_COVER"),
					icon: "PICTURE_ALT",
					defaultValue: "false",
					values: ["true", "false"],
					valueTitles: {
						"true": L("VALUE_TRUE"),
						"false": L("VALUE_FALSE")
					}
				}
			]},
			{
			groupTitle: L('SHUTDOWN_IMAGE'),
			groupIcon: 'SHUTDOWN',
			optionDefs: [
				{
					name: "ShutdownMode",
					title: L("SHUTDOWN_IMG_KIND"),
					icon: "SHUTDOWN",
					defaultValue: "white",
					values: ["standby", "white", "black", "cover", "calendar"],
					valueTitles: {
						"standby": L("VALUE_ORIGINAL_STANDBY"),
						"random": L("VALUE_RANDOM"),
						"white": L("VALUE_WHITE_SCREEN"),
						"black": L("VALUE_BLACK_SCREEN"),
						"cover": L("VALUE_COVER"),
						"calendar": L("VALUE_CALENDAR")
					}
				},
				{
					name: "DisplayShutdownIcon",
					title: L("DISPLAY_SHUTDOWN_ICON"),
					icon: "SHUTDOWN",
					defaultValue: "false",
					values: ["true", "false"],
					valueTitles: {
						"true": L("VALUE_TRUE"),
						"false": L("VALUE_FALSE")
					}
				},
				{
					name: "DisplayShutdownText",
					title: L("DISPLAY_SHUTDOWN_TEXT"),
					icon: "ABC",
					defaultValue: "false",
					values: ["true", "false"],
					valueTitles: {
						"true": L("VALUE_TRUE"),
						"false": L("VALUE_FALSE")
					}
				},
				{
					name: "DisplayShutdownEvents",
					title: L("DISPLAY_SHUTDOWN_EVENTS"),
					icon: "DATE",
					defaultValue: "false",
					values: ["true", "false"],
					valueTitles: {
						"true": L("VALUE_TRUE"),
						"false": L("VALUE_FALSE")
					}
				},
				{
					name: "DisplayShutdownMiniCover",
					title: L("DISPLAY_SHUTDOWN_MINI_COVER"),
					icon: "PICTURE_ALT",
					defaultValue: "false",
					values: ["true", "false"],
					valueTitles: {
						"true": L("VALUE_TRUE"),
						"false": L("VALUE_FALSE")
					}
				}
			]},
			{
				name: "ScalingMethod",
				title: L("IMAGE_SCALING"),
				icon: "SETTINGS",
				defaultValue: "keepaspect",
				values: ["keepaspect", "stretch"],
				valueTitles: {
					"keepaspect": L("VALUE_KEEP_ASPECT_RATIO"),
					"stretch": L("VALUE_STRETCH_TO_SCREEN")
				}
			},
			{
				name: "dither",
				title: L("DITHER_IMAGE"),
				icon: "SETTINGS",
				defaultValue: "true",
				values: ["true", "false"],
				valueTitles: {
					"true": L("VALUE_TRUE"),
					"false": L("VALUE_FALSE")
				}
			},
			{
				name: "TransferModeDialog",
				title: L("USB_TRANSFER_MODE_DIALOG"),
				icon: "SETTINGS",
				helpText: L('USB_TRANSFER_MODE_HELP'),
				defaultValue: "false",
				values: ["true", "false"],
				valueTitles: {
					"true": L("VALUE_TRUE"),
					"false": L("VALUE_FALSE")
					}
			},
			{
				name: "AutoStandbyTime",
				title: L("AUTO_STANDBY_TIME"),
				icon: "CLOCK",
				defaultValue: "default",
				values: ["default", "1", "3", "5", "10", "15", "20", "30", "60", "120"],
				valueTitles: {
					"default": L("VALUE_DEFAULT"),
					"1": LX("MINUTES", 1),
					"3": LX("MINUTES", 3),
					"5": LX("MINUTES", 5),
					"10": LX("MINUTES", 10),
					"15": LX("MINUTES", 15),
					"20": LX("MINUTES", 20),
					"30": LX("MINUTES", 30),
					"60": LX("MINUTES", 60),
					"120": LX("MINUTES", 120),
				}
			}
		],
		hiddenOptions: [
			{
				name: 'orgOrientation',
				defaultValue: '',
			}
		],
		onPreInit: function () {
			// For pre-x50 models, change system standby option to random wallpaper
			switch (Core.config.model) {
				case "505":
				case "300":
				case "600":
					this.optionDefs[0].optionDefs[0].values = ["random", "white", "black", "cover", "act_page", "calendar"];
					this.optionDefs[0].optionDefs[0].defaultValue = "white";
					this.optionDefs[1].optionDefs[0].values = ["random", "white", "black", "cover", "calendar"];
					USBDispatcher.connected.execute = onUSBConnect;
					USBDispatcher.disconnected.execute = onUSBDisconnect;
			}
			
			// Add auto-shutdown time for 600+
			switch (Core.config.model) {
				case "350":
				case "650":
				case "950":
					messages.connected.execute = onUSBConnect;
					messages.disconnected.execute = onUSBDisconnect;
				case "600":
					this.optionDefs.push(
						{
							name: "AutoShutdownTime",
							title: L("AUTO_SHUTDOWN_TIME"),
							icon: "CLOCK",
							defaultValue: "default",
							values: ["default", "1", "3", "6", "12", "24", "48", "72", "96", "120", "144", "168"],
							valueTitles: {
								"default": L("VALUE_DEFAULT"),
								"1": LX("HOURS", 1),
								"3": LX("HOURS", 3),
								"6": LX("HOURS", 6),
								"12": LX("HOURS", 12),
								"24": LX("HOURS", 24),
								"48": LX("HOURS", 48),
								"72": LX("HOURS", 72),
								"96": LX("HOURS", 96),
								"120": LX("HOURS", 120),
								"144": LX("HOURS", 144),
								"168": LX("HOURS", 168),
							}
						}
					);
			}
		},
		onInit: function () {
			var opt = this.options;
			// model sniffing
			if (Core.config.model === "300" || Core.config.model ==="505") {
				var oldEBookSetAutoStandby = ebook.setAutoStandby;
				ebook.setAutoStandby = function (time) {
					if (StandbyImage.options.AutoStandbyTime !== 'default' && time > 0) {
						time = (Number(StandbyImage.options.AutoStandbyTime) * 60);
					}
					oldEBookSetAutoStandby(time);
				};
				// adjust like 600/x50
				opt.AutoShutdownTime = 'default';
				ebook.device = {
					rtc : {
						autoStandby : {
							time : 3600,
							_initialize : ebook.setAutoStandby
						}
					}		
				};
			}
			// general code
			if (opt.AutoStandbyTime) {
				if (opt.AutoStandbyTime !== 'default') ebook.device.rtc.autoStandby._initialize(Number(opt.AutoStandbyTime) * 60);
				if (opt.AutoShutdownTime !== 'default') ebook.device.rtc.autoShutdown._initialize(Number(opt.AutoShutdownTime) * 3600, ebook.device.rtc.autoShutdown.lowCaseTime);
			}
			// Restore orientation
			if (opt.orgOrientation) {
				ebook.rotate(opt.orgOrientation);
				opt.orgOrientation = '';
				Core.settings.saveOptions(StandbyImage);
			}
		},
		onSettingsChanged: function (propertyName, oldValue, newValue, object) {
			if (propertyName === 'AutoStandbyTime') {
				if (newValue === 'default') {
					ebook.device.rtc.autoStandby._initialize(ebook.device.rtc.autoStandby.time);
				} else {
					ebook.device.rtc.autoStandby._initialize(Number(newValue) * 60);
				}
			} else if (propertyName === 'AutoShutdownTime') {
				if (newValue === 'default') {
					ebook.device.rtc.autoShutdown._initialize(ebook.device.rtc.autoShutdown.time, ebook.device.rtc.autoShutdown.lowCaseTime);
				} else {
					ebook.device.rtc.autoShutdown._initialize(Number(newValue) * 3600, ebook.device.rtc.autoShutdown.lowCaseTime);
				}
			}
		}
	}

	Core.addAddon(StandbyImage);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in StandbyImage.js", e);
}
