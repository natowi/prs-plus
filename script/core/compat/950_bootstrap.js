// Name: bootstrap 950
// Description: Sony PRS-950 bootstrap code
//	Receives PARAMS argument with the following fields:
//		Core, bootLog, loadCore, loadAddons, getFileContent, compatPath
//		must call loadAddons, loadCore and Core.init at appropriate times
//
// History:
//	2011-01-12 kartu - Initial version, based on 600
//	2011-02-06 kartu - Fixed #64 "Wrong german translation file"
//	2011-02-07 kartu - Implemented # possibility to download files using web browser
//	2011-02-10 kartu - Implemented # Russian phonetic keyboard (keyboard xml by boroda)
//	2011-02-26 kartu - Refactored, moved code common to x50 models into common_x50.js
//	2011-02-27 kartu - Refactored parameters into PARAMS object
//	2011-05-12 kartu - Added "GMT + 10" timezone
//	2011-07-04 Mark Nord - Added #24 "Displaying first page of the book on standby" based on code found by Ben Chenoweth
//	2011-07-06 Ben Chenoweth - Minor fix to StandbyImage (mime not needed)
//	2011-08-18 Mark Nord - fixed current page as StandbyImage + display of localised "sleeping.." instead of the clock
//	2011-10-04 quisvir - Always show book covers in portrait mode and keep aspect ratio
//
//-----------------------------------------------------------------------------------------------------
// Localization related code is model specific.  
// Replacing default  "choose language" menu & "choose keyboard" menu
//-----------------------------------------------------------------------------------------------------

var tmp = function() {

	var fixTimeZones, updateSiblings;
	
	// Updates node siblings (used for setting selected / unselected icon)
	updateSiblings = function(fieldName) {
		// find currently selected node
		var nodes, i, n, idx, tmpKind;

		try {		
			nodes = this.parent.nodes;
			for (i = 0, n = nodes.length; i < n; i++) {
				if (kbook.model[fieldName] === nodes[i].tag) {
					idx = i;
					break;
				}
			}
			
			kbook.model[fieldName] = this.tag;
			kbook.model.writeFilePreference();
			
			// swap node kinds of this node and previously selected node
			if (idx !== undefined) {
				tmpKind = this.kind;
				this.kind = nodes[idx].kind;
				nodes[idx].kind = tmpKind;
			}
			
		} catch (e) {
			PARAMS.bootLog("In updateSiblings " + e);
		}
	};

	fixTimeZones = function(Core) {
		var newTimeZoneNode, timeZoneParentNode, i, containerNode, TIMEZONES, icon, 
			node, summerNode, enterTimeZone, enterSummer, updateTime;
		timeZoneParentNode = kbook.root.getSettingsRootNode().nodes[0];
		
		// Custom timezone container node
		 containerNode = Core.ui.createContainerNode({
			title: "fskin:/l/strings/STR_NODE_TITLE_TIMEZONE".idToString(),
			icon: "TIMEZONE",
			parent: timeZoneParentNode
		});

		TIMEZONES = {
			"600": "GMT + 10",
			"540": "GMT + 9",
			"480": "GMT + 8",
			"420": "GMT + 7",
			"360": "GMT + 6",
			"300": "GMT + 5",
			"240": "GMT + 4",
			"180": "GMT + 3",
			"120": "GMT + 2",
			"60": "GMT + 1",
			"0": "GMT",
			"-60" : "GMT - 1",
			"-120" : "GMT - 2",
			"-300": "fskin:/l/strings/STR_UI_SETTING_TZ_EST".idToString(),
			"-360": "fskin:/l/strings/STR_UI_SETTING_TZ_CST".idToString(),
			"-420": "fskin:/l/strings/STR_UI_SETTING_TZ_MST".idToString(),
			"-480": "fskin:/l/strings/STR_UI_SETTING_TZ_PST".idToString(),
			"-540": "fskin:/l/strings/STR_UI_SETTING_TZ_AKST".idToString(),
			"-600": "fskin:/l/strings/STR_UI_SETTING_TZ_HST".idToString()
		};
		 
		// Custom timezone node
		newTimeZoneNode  = Core.ui.createContainerNode({
			title: "fskin:/l/strings/STR_NODE_TITLE_TIMEZONE".idToString(),
			icon: "TIMEZONE",
			parent: containerNode,
			comment: function() {
				var s = TIMEZONES[kbook.model.TimeZone + ""];
				return s ? s : kbook.model.TimeZone;
			}
		});
		containerNode.nodes.push(newTimeZoneNode);
		
		updateTime = function() {
			ebook.setDateTime(null, kbook.model.TimeZone + kbook.model.SummerTime * 60);
		};
		
		enterTimeZone = function() {
			updateSiblings.call(this, "TimeZone");
			updateTime();
			this.parent.gotoParent(kbook.model);
		};
		for (i = -10; i < 11; i++) {
			var offset = i * 60;
			var offsetStr = "" + offset;
			if (TIMEZONES[offsetStr]) {
				if (kbook.model.TimeZone ===  offset) {
					icon = "CHECKED";
				} else {
					icon = "UNCHECKED";
				}
				node = Core.ui.createContainerNode({
						title: TIMEZONES[offsetStr],
						icon: icon,
						parent: newTimeZoneNode
				});
				node.tag = offset;
				node.enter = enterTimeZone;
				newTimeZoneNode.nodes.push(node);
			}
		}

		// Custom timezone node
		var SUMMERTIME = {
			"0" : "fskin:/l/strings/STR_UI_BUTTON_Off".idToString(), 
			"1" : "fskin:/l/strings/STR_UI_BUTTON_On".idToString()
		};
		summerNode  = Core.ui.createContainerNode({
			title: "fskin:/l/strings/STR_UI_SETTING_SUMMERTIME_MSG".idToString(),
			icon: "TIMEZONE",
			parent: containerNode,
			comment: function() {
				return SUMMERTIME[kbook.model.SummerTime];
			}
		});
		enterSummer = function() {
			updateSiblings.call(this, "SummerTime");
			updateTime();
			this.parent.gotoParent(kbook.model);
		};
		 for (i = 0; i < 2; i++) {
			if (kbook.model.SummerTime ===  i) {
				icon = "CHECKED";
			} else {
				icon = "UNCHECKED";
			}
			node = Core.ui.createContainerNode({
					title: SUMMERTIME[i],
					icon: icon,
					parent: summerNode
			});
			node.tag = i;
			node.enter = enterSummer;
			summerNode.nodes.push(node);
		}
		containerNode.nodes.push(summerNode);

		timeZoneParentNode.nodes[1] = containerNode;
		
		// self destruct
		fixTimeZones = undefined;
	};
	
	// Add option to download files
	kbook.webviewexData.onUnsupportedMimeType = function (url, mimetype) {
		try {
			var dialog = kbook.model.getConfirmationDialog();
			dialog.target = this;
			dialog.onOk = function () {
				PARAMS.Core.shell.exec("/usr/bin/wget -P /Data " + url);	
			};
			dialog.onNo = function () {
			};
			dialog.openDialog("fskin:/l/strings/STR_UI_BUTTON_DOWNLOAD_NOW".idToString() + "?\n\nURL: " + url + "\nMIME: " +mimetype, 0);
		} catch (ignore) {
		}
	};

	// Call code common to x50 models	
	try {
		var f = new Function("PARAMS", PARAMS.getFileContent(PARAMS.compatPath + "common_350_650_950.js"));
		PARAMS.langNodeIndex = 4;
		PARAMS.keyboardNodeIndex = 5;
		PARAMS.fixTimeZones = fixTimeZones;
		f(PARAMS);
	} catch (ee) {
		PARAMS.bootLog("error calling common x50 " + ee);
	}	
};

try {
	tmp();
} catch (ignore) {
}
