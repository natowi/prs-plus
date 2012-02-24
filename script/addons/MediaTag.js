// Name: Media Tags
// Description: Allows to "mark" media nodes with one of the predefined marks (plus, minus, cross etc)
// Author: kartu
//
//	2010-11-28 kartu - renamed from MarkMedia 
//

tmp = function() {
	var L, NAME, log, model, root, MENU, NUM_ICONS, MARK_PROPERTY,
		oldDraw, MediaTag, draw, init, i, toggleTag, actionFunction;
	NAME = "MediaTag";
	L = Core.lang.getLocalizer(NAME);
	log = Core.log.getLogger(NAME);
	model = kbook.model;
	root = model.container.root;
	MENU = kbook.model.container.sandbox.MENU_GROUP.sandbox.MENU;
	NUM_ICONS = 5;
	MARK_PROPERTY = "mark1";
	// Menu's draw method
	oldDraw = Fskin.kbookMenu.draw; 
	
	/**
	* Draw method, called after kbook menu has finished drawing. Draws icons over media nodes.
	*/
	// FIXME horizontal layout
	draw = function (event) {
		var x, y, i, n, j, m, idx, win, markIcon, w, h, gap, marks, record, offset, tabCount, recordCount;
		
		oldDraw.apply(this, arguments);
		try {
			// Vertical layout, don't draw anything
			if (this.width > this.height) {
				return;
			}
			
			recordCount = this.countRecords();
			offset = this.offset;
			tabCount = this.tabCount;
			
			win = this.getWindow();
			markIcon = root.cutouts.markIcon;
			w = markIcon.width;
			h = markIcon.height;
			gap = 5;
	
			for (i = offset, n = Math.min(offset + tabCount, recordCount); i < n; i++) {
				record = this.getRecord(i);
				if (record && record.media && record.media.mark1 !== undefined) {
					idx = i - offset;
					
					y = 70 + 70 * idx;
					marks = record.media.mark1.split(" ");
					switch (MediaTag.options.position) {
						case "bottom":
							x = 70;
							for (j = 0, m = marks.length; j < m; j++) {
								markIcon.draw(win, marks[j], 0, x + w * j, y + 70 - h - gap, w, h);
							}
							break;
						case "right":
							x = 600 - 70;
							for (j = marks.length - 1; j >= 0; j--) {
								markIcon.draw(win, marks[j], 0, x - w * (marks.length - j), y + gap, w, h);
							}
							break;
						case "overIcon":
							x = 70 - w;
							for (j = 0, m = marks.length; j < m; j++) {
								markIcon.draw(win, marks[j], 0, x, y + (h - 2) * j + gap, w, h);
							}
							break;
					}
				}
			}
		} catch (e) {
			log.error("draw", e);
		}
	};
	
	// Addon's init function
	init = function() {
		// Bind to kbookMenu's draw
		Fskin.kbookMenu.draw = draw;
	};	
	
	MediaTag = {
		name: NAME,
		title: L("TITLE"),
		icon: "BACK",
		onInit: init,
		optionDefs: [{
			name: "position",
			title: L("OPTION_POSITION"),
			defaultValue: "bottom",
			icon: "LIST",
			values: ["overIcon", "bottom", "right"],
			valueTitles: {
				overIcon: L("VALUE_OVER_ICON"),
				bottom: L("VALUE_BOTTOM"),
				right: L("VALUE_RIGHT")
			}
		}]
	};
	
	toggleTag = function(media, tagId) {
		var marks, markProp, found, i;
		try {
			markProp = media[MARK_PROPERTY];
			if (markProp !== undefined) {
				marks = markProp.split(" ");
				found = false;
				for (i = marks.length - 1; i >= 0; i--) {
					marks[i] = Number(marks[i]);
					if (marks[i] === tagId) {
						marks.splice(i, 1);
						found = true;
					}
				}
				if (!found) {
					marks.push(tagId);
				}
				if (marks.length > 0) {
					marks.sort();
					media[MARK_PROPERTY] = marks.join(" ");
				} else {
					delete media[MARK_PROPERTY];
				}
			} else {
				media[MARK_PROPERTY] = "" + tagId;
			}
		} catch (e) {
			Core.ui.doBlink();
		}
	};

	actionFunction = function() {
		var media, markId;
		if (model.current && model.current && model.current.nodes && model.current.nodes[MENU.selection]) {
			if (model.current.nodes[MENU.selection].media) {
				media = model.current.nodes[MENU.selection].media;
				markId = this.tag;
				toggleTag(media, markId);
				// redraw selected item
				MENU.invalidateSelection();
			}
		} else {
			Core.ui.doBlink();
		}
	};

	// Add actions
	MediaTag.actions = [];
	for (i = 0; i < NUM_ICONS; i++) {
		MediaTag.actions.push({
			name: "mark" + i,
			tag: i,
			title: L("MARK_" + i),
			icon: "BACK",
			action: actionFunction
		});
	}
	
	Core.addAddon(MediaTag);
};

try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in MediaTag.js", e);
}
