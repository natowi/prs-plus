// Name: Popup
// Description: Popup menu related functionality
// Author: kartu
//
//
// History:
//	2010-07-13 kartu - Initial version
//	2011-12-11 Mark Nord - some adjustments for 505, added invalidate() to hideMenu()
//	2011-12-20 Mark Nord - enabled for 600/x50
//		ToDo: handle more then 10 menu-items
//	2011-12-30 Mark Nord - added menu.titel to error.trace in doCenter() 

/**
 Sample code:
 
 	// not to type Core.popup X times
	var createMenuItem = Core.popup.createMenuItem;
	// Root menu
	var menu = createMenuItem();
	// Submenus
	var submenu1 = createMenuItem("Hello");
	var submenu2 = createMenuItem("World");
	menu.addChild(submenu1);
	menu.addChild(submenu2);
	// Subsubmenus
	submenu1.addChild(createMenuItem("hello0", function() {Core.ui.showMsg("Hello0");}  ));
	submenu1.addChild(createMenuItem("hello1", function() {Core.ui.showMsg("Hello1");}  ));
	submenu2.addChild(createMenuItem("hello2", function() {Core.ui.showMsg("Hello2");}  ));
	submenu2.addChild(createMenuItem("hello3", function() {Core.ui.showMsg("Hello3");}  ));
	// Showing menu
	Core.popup.showMenu(menu);
*/
tmp = function() { 
	Core.popup = {};
	
	// Shortcuts
	//
	var model = kbook.model;
	var root = model.container.root;
	var popupMenu = model.container.sandbox.POPUP_MENU;
	
	// Constants
	//
	// spacing in menu label
	var VGAP = 16;
	var HGAP = 20;
	// spacing between outer and inner menu containers
	var BORDER_GAP = 6;
	// popup menu's bottom left point's position
	var MENU_X = 50;
	var MENU_Y = 50;
	
	// "Instance" variables
	//
	// widget that was focused before popup menu was shown
	var oldFocus;
	// currently displayed menu instance
	var currentMenu;

	var MenuItem = function(title, action, parent, children) {
		this.title = title;
		this.action = action;
		this.parent = parent;		
		this.children = children;
	};
	MenuItem.prototype.addChild = function (child) {
		if (this.children === undefined) {
			this.children = [];
		}
		this.children.push(child);
		child.parent = this;
	};
	
	var dummy = {};
	var SimpleMenu = function(titles, actions) {
		var children = [];
		if (actions === undefined) {
			// not to break actions[i] lookups
			actions = dummy;
		}
		var result = new MenuItem(undefined, undefined, undefined, children);
		for (var i = 0, n = titles.length; i < n; i++) {
			children.push(new MenuItem(titles[i], actions[i], result));
		}
		return result;
	};
	
	// forward declaration
	var constructMenu, redrawMenu, hideMenu;	
	
	/**
	* Create single menu item.
	*
	* @param title a string
	* @param action function to call when user clicks on this menu item
	* @param parent parent menu
	* @param children array of submenus
	* @returns a menu
	*/
	Core.popup.createMenuItem = function (title, action, parent, children) {
		return new MenuItem(title, action, parent, children);
	};
	
	/**
	* Creates simple (one level) menu.
	* 
	* @param titles string array of menu titles
	* @param actions string array of functions
	* @returns a menu
	*/
	Core.popup.createSimpleMenu = function (titles, actions) {
		return new SimpleMenu(titles, actions);
	};

	/**
	* Shows popup menu. Captures all key events, until user closes it. Only first 10 menu items can be shown. Others will be ignored.
	*
	* @param menu menu previosly created by one of Core.popup.create* methods
	*/
	Core.popup.showMenu = function (menu) {
		constructMenu(menu);
		// Dynamic resizing + layouts = need to do it 2 times
		constructMenu(menu);
		redrawMenu();
	};
	
	// Key event handlers
	//
	// joypad center
	var doCenter = function() {
		// execute selected menu item's function
		try {
			if (currentMenu && currentMenu.children && currentMenu.children[currentMenu.selected]) {
				var menu = currentMenu.children[currentMenu.selected];
				if (menu.children) {
					Core.popup.showMenu(menu);
				} else if (menu.action) {
					var f = menu.action;
					if (f(menu) !== true) { // passing menu to enable access menu.title in item's function
						hideMenu();
					}
				}
			}
		} catch (e) {
			log.error("executing menu action ", menu.title + ' ' + e );
		}
	};
	popupMenu.sandbox.doCenter = doCenter;
	// menu
	popupMenu.sandbox.doMenu = function() {
		if (currentMenu.parent !== undefined) {
			// show parent
			Core.popup.showMenu(currentMenu.parent);
		} else {
			// hide popup
			hideMenu();
		}
	};
	// touch-button-handling
	popupMenu.sandbox.doPopupButton = function(sender) {
		var key = sender.id;
		key = (10 - parseInt(key, 10)) % 10;
		if (key < currentMenu.children.length) {
			currentMenu.selected = key;
			doCenter();
			return;
		}
		model.doBlinkl();
	};
	// 0-9
	popupMenu.sandbox.doDigit = function(part) {
		var key = part.key;
		key = (10 - parseInt(key, 10)) % 10;
		if (key < currentMenu.children.length) {
			currentMenu.selected = key;
			doCenter();
			return;
		}
		model.doBlinkl();
	};
	// joypad up
	popupMenu.sandbox.doUp = function() {
		if (currentMenu.children === undefined) {
			return;
		}
		if (currentMenu.selected < currentMenu.children.length) {
			currentMenu.selected = currentMenu.selected + 1;
			redrawMenu();
			return;
		}
		model.doBlinkl();
	};
	// joypad down
	popupMenu.sandbox.doDown = function() {
		if (currentMenu.selected > 0) {
			currentMenu.selected--;
			redrawMenu();
			return;
		}
		model.doBlinkl();
	};
	
	// Hides popup menu, returning focus
	hideMenu = function() {
		var win = kbook.model.container.getWindow();
		if (oldFocus !== undefined) {
			oldFocus.focus(true);
			oldFocus = undefined;
		}
		popupMenu.show(false);
		win.invalidate();
		return;
	};
	
	// Resizes controls to fit the menu
	constructMenu = function (menu) {
		currentMenu = menu;
		var win = kbook.model.container.getWindow();
		var closeBox = popupMenu.sandbox.CLOSE_BOX;
		var innerGroup = popupMenu.sandbox.innerGroup;
		var sandbox = innerGroup.sandbox;
		// kind of model-sniffing
		var hasNumericButtons = Core.config.compat.hasNumericButtons;

		// If not focused, save focus state
		if (win.focus !== popupMenu) {
			oldFocus = win.focus;
			popupMenu.focus(true);
		}
		
		// Calculate lines max width / height
		var i, n, control, w, h, indicatorWidth, children, count;
		count = w = h = 0; 
		children = menu.children;
		if (children !== undefined) {
			count = children.length;
			// set current text style					
			win.setTextFormat(sandbox.panel1.sandbox.menu.skin.styles[0]);
			indicatorWidth = hasNumericButtons ? win.getTextBounds("0").width + HGAP : 0;
			for (i = 0, n = Math.min(count, 10); i < n; i++) {
				var bounds = win.getTextBounds("" + children[i].title);
				w = Math.max(w, bounds.width);
				h = Math.max(h, bounds.height);
			}
		}
		w += HGAP + indicatorWidth;
		h += VGAP;
		
		// Resize containers
		popupMenu.changeLayout(MENU_X, w + BORDER_GAP*3, undefined, undefined, count * h + BORDER_GAP * 2 , MENU_Y);
		if (closeBox) {
			closeBox.changeLayout(undefined, 42, -50 , 0, 42, undefined);
		}
		innerGroup.changeLayout(BORDER_GAP * 2, undefined, BORDER_GAP, BORDER_GAP, undefined, BORDER_GAP);
		
		// Resize lines
		for (i = 0; i < 10; i++) {
			// panel
			control = sandbox["panel" + (10 - i)];
			if (i < count) {
				// resize panel
				control.show(true);
				control.changeLayout(0, undefined, 0, undefined, h, i * h);
				
				// resize indicator (number on the right side)
				var indicator = control.sandbox.indicator;
				indicator.changeLayout(undefined, indicatorWidth, 0, 0, undefined, 0);

				// resize menu
				var m = control.sandbox.menu;
				m.setValue(children[i].title);
				m.changeLayout(0, undefined, indicatorWidth, 0, undefined, 0);

				// resize button if necessary, 300/505 don't have the buttons
				var b = control.sandbox[""+ (10 - i)%10];
				if (b) {
					b.changeLayout(0, undefined, 0, 0, undefined, 0);
				}

			} else {
				control.show(false);
			}
		}
	};

	// draws menu, effectively setting indicator styles according to selected index	
	redrawMenu = function () {
		if (currentMenu.selected === undefined || currentMenu.selected > currentMenu.children.length) {
			currentMenu.selected = 0;
		}
		var sandbox = popupMenu.sandbox.innerGroup.sandbox;
		var unselectedSkin = root.skins.popupIndicator;
		var selectedSkin = root.skins.popupIndicatorSel;
		
		// Set indicator state
		for (var i = 0; i < 10; i++) {
			var indicator = sandbox["panel" + (10 - i)].sandbox.indicator;
			var indicatorSkin;
			if (i === currentMenu.selected) {
				indicatorSkin = selectedSkin;
			} else {
				indicatorSkin = unselectedSkin;
			}
			indicator.skin = indicatorSkin;
			indicator.te.setTextFormat(indicatorSkin.styles[0]);
		
			// Doesn't work without this (300, untested on others)
			//indicator.setValue("");
			// 2011-12-11 Mark Nord - had to add +(10-i)%10); for 505
			indicator.setValue(""+(10-i)%10);
		}
		// Show main contaner
		popupMenu.show(true);
	};
};

try {
	tmp();
	tmp = undefined;
} catch (e) {
	log.error("in core popup init", e);
}
