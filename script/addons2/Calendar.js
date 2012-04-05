/* Name: Calendar app
   Original code (c) Ben Chenoweth
   Initial version: July 2011
*/

tmp = function() {
	var appIcon = "DATE";
	var L = Core.lang.getLocalizer("Calendar");
	var eastermonth;
	var easterday;
	var weekBeginsWith;
	var events = [];
	var Calendar = {
		name: "Calendar",
		title: L("TITLE"),
		description: "Calendar app",
		icon: appIcon,			
		activate: function () {
			kbook.autoRunRoot.sandbox._icon =  Core.config.compat.NodeKinds.getIcon(appIcon,0);
			kbook.autoRunRoot.sandbox._title = Calendar.title;
			kbook.autoRunRoot.sandbox.getSoValue = Core.system.getSoValue;
			kbook.autoRunRoot.sandbox.setSoValue = Core.system.setSoValue;
			kbook.autoRunRoot.sandbox.hasNumericButtons = Core.config.compat.hasNumericButtons;
			kbook.autoRunRoot.sandbox.getFileContent = Core.io.getFileContent;
			kbook.autoRunRoot.sandbox.startsWith = Core.text.startsWith;
			kbook.autoRunRoot.sandbox.gamesSavePath = Core.config.userGamesSavePath;
			kbook.autoRunRoot.sandbox.L = L;
			switch (Core.config.model) {
				case "505":
				case "300":
					kbook.autoRunRoot.path = Core.config.addonsPath + "Calendar_nt/calendar.xml";
					break;
				default:
					kbook.autoRunRoot.path = Core.config.addonsPath + "Calendar/calendar.xml";
			}
			kbook.autoRunRoot.sandbox.model = Core.config.model;
			kbook.autoRunRoot.enterIf(kbook.model);
		},
		actions: [{
			name: "Calendar",
			group: "Games",
			title: L("TITLE"),
			icon: appIcon,
			action: function () {
				Calendar.activate();
			}
		}],
		checkevents: function (day,month,year,week,dayofweek) {
			var numevents = 0;
			var floater = 0;
			var altdayofweek;
			
			altdayofweek = dayofweek+1;
			if (altdayofweek==8) altdayofweek=1;

			for (var i = 0; i < events.length; i++) {
				if (events[i][0] == "W") {
					if (weekBeginsWith=="Sun") {
						if ((events[i][3] == dayofweek)) numevents++;
					} else {
						if ((events[i][3] == altdayofweek)) numevents++;
					}
				}
				else if (events[i][0] == "M") {
					if ((events[i][2] == day) && (events[i][3] <= year)) numevents++;
				}
				else if ((events[i][0] == "Y") || (events[i][0] == "C") || (events[i][0] == "B") || (events[i][0] == "V") || (events[i][0] == "A")) {
					if ((events[i][2] == day) && (events[i][1] == month) && (events[i][3] <= year)) numevents++;
				}
				else if (events[i][0] == "F") {
					if ((events[i][1] == 3) && (events[i][2] == 0) && (events[i][3] == 0) ) {
						Calendar.easter(year);
						if (easterday == day && eastermonth == month) numevents++;
					} else {
						floater = Calendar.floatingholiday(year,events[i][1],events[i][2],events[i][3]);
						if ((month == 5) && (events[i][1] == 5) && (events[i][2] == 4) && (events[i][3] == 2)) {
							if ((floater + 7 <= 31) && (day == floater + 7)) {
								numevents++;
							} else if ((floater + 7 > 31) && (day == floater)) numevents++;
						} else if ((events[i][1] == month) && (floater == day)) numevents++;
					}
				}
				else if ((events[i][2] == day) && (events[i][1] == month) && (events[i][3] == year)) {
					numevents++;
				}
			}
			return numevents;
		},
		drawStandbyWidget: function (win, eventsonly) {
			var w, h, hdiff;
			w = win.width;
			h = win.height;
			
			var wordMonth = new Array(L("MONTH_JANUARY"),L("MONTH_FEBRUARY"),L("MONTH_MARCH"),L("MONTH_APRIL"),L("MONTH_MAY"),L("MONTH_JUNE"),L("MONTH_JULY"),L("MONTH_AUGUST"),L("MONTH_SEPTEMBER"),L("MONTH_OCTOBER"),L("MONTH_NOVEMBER"),L("MONTH_DECEMBER"));
			var wordDays = new Array(L("ABBRV_SUNDAY"),L("ABBRV_MONDAY"),L("ABBRV_TUESDAY"),L("ABBRV_WEDNESDAY"),L("ABBRV_THURSDAY"),L("ABBRV_FRIDAY"),L("ABBRV_SATURDAY"));
		
			var thisDate = 1;
			var today = new Date();
			var todaysDay = today.getDay() + 1;
			var todaysDate = today.getDate();
			var todaysMonth = today.getUTCMonth() + 1;
			var todaysYear = today.getFullYear();
			var monthNum = todaysMonth;
			var yearNum = todaysYear;
			var firstDate;
			var firstDay;
			var lastDate;
			var datPath0 = Core.config.userGamesSavePath+'Calendar/';
			FileSystem.ensureDirectory(datPath0);  
			var datPath  = datPath0 + 'calendar.dat';
			var settingsPath = datPath0 + 'settings.dat';
			var stream, inpLine;
			var values = [];
			var todayevents = [];
			var futureevents = [];
			var altTodaysDay = todaysDay+1;
			if (altTodaysDay==8) altTodaysDay=1;
			var linelimit = 7;
	
			if (!eventsonly) {
				// window is already blank, so start with the top bar
				win.setPenColor(Color.black);
				win.fillRectangle(0, 0, w, 70);
				
				// YEAR (in the top bar)
				win.setTextStyle(1); // 0 = regular, 1 = bold, 2 = italic, 3 = bold italic
				win.setTextSize(40);
				win.setPenColor(Color.white);
				win.setTextAlignment(0, 0); // (x, y): 0 = center, 1 = left, 2 = right, 3 = top, 4 = bottom
				win.drawText(yearNum, 0, 12, w, 50);
				
				// MONTH (just below top bar)
				win.setTextSize(22);
				win.setPenColor(Color.black);
				win.setTextAlignment(0, 0);
				win.drawText(wordMonth[monthNum-1], 205, 70, 190, 60);
			}
		
			// load settings file to determine WeekStartsWith
			try {
				if (FileSystem.getFileInfo(settingsPath)) {
					stream = new Stream.File(settingsPath);    			
					while (stream.bytesAvailable) {
						inpLine = stream.readLine();
						values = inpLine.split(':');
						if (values[0] == 'WeekBeginsWith') {
							weekBeginsWith = values[1];
						}
					}
				}	
				stream.close();
			} catch (e) {
				log.error("Settings file failed to load");
				weekBeginsWith="Sun";
			}
			
			if (weekBeginsWith=="Mon") {
				todaysDay = today.getDay();
				if (todaysDay==0) todaysDay=7;
			}
			
			if (!eventsonly) {
				// WEEKDAY ABBREVIATIONS
				win.setTextSize(12);
				win.setTextAlignment(0, 0);
				if (weekBeginsWith=="Mon") {
					win.drawText(wordDays[1], 50, 132, 70, 20);
					win.drawText(wordDays[2], 120, 132, 70, 20);
					win.drawText(wordDays[3], 190, 132, 70, 20);
					win.drawText(wordDays[4], 260, 132, 70, 20);
					win.drawText(wordDays[5], 330, 132, 70, 20);
					win.drawText(wordDays[6], 400, 132, 70, 20);
					win.drawText(wordDays[0], 470, 132, 70, 20);
				} else {
					win.drawText(wordDays[0], 50, 132, 70, 20);
					win.drawText(wordDays[1], 120, 132, 70, 20);
					win.drawText(wordDays[2], 190, 132, 70, 20);
					win.drawText(wordDays[3], 260, 132, 70, 20);
					win.drawText(wordDays[4], 330, 132, 70, 20);
					win.drawText(wordDays[5], 400, 132, 70, 20);
					win.drawText(wordDays[6], 470, 132, 70, 20);
				}
			}
			
			// Load events from save file
			events = [];
			todayevents = [];
			futureevents = [];
			try {
				if (FileSystem.getFileInfo(datPath)) {
					var tempfile = Core.io.getFileContent(datPath,'savefile missing');
					if (tempfile!='savefile missing') {
						var lines = tempfile.split("\r\n");	// CR LF is used by stream.writeLine()
						var tempnumevents = (lines.length-1);
						for (i=0; i<tempnumevents; i++) {
							// check for rem-character
							if (!Core.text.startsWith(lines[i],"#")) {		
								events.push(lines[i].split(";"));
								var j=events.length-1;
								// auto correct calendar.dat to new data-format
								if (isNaN(events[j][4]-0)) {
									events[j][5]=events[i][4];
									events[j][4]=3;
								}
							}
						}
					}
				} else {
					// no savefile, so push default events
					events.push(["Y", "1", "1", "1900", "12", L("STR_NEWYEARSDAY")]);
					events.push(["Y", "2", "14", "1900", "6", L("STR_VALENTINESDAY")]);
					events.push(["F", "3", "0", "0", "14", L("STR_EASTERSUNDAY")]);
					events.push(["Y", "3", "17", "1900", "10", L("STR_STPATRICKSDAY")]);
					events.push(["F", "11", "4", "5", "11", L("STR_THANKSGIVING")]);
					events.push(["Y", "12", "25", "1900", "5", L("STR_CHRISTMAS")]);
				}
			} catch (e) {
				log.error("Data file failed to load");
				events.push(["Y", "1", "1", "1900", "12", L("STR_NEWYEARSDAY")]);
				events.push(["Y", "2", "14", "1900", "6", L("STR_VALENTINESDAY")]);
				events.push(["F", "3", "0", "0", "14", L("STR_EASTERSUNDAY")]);
				events.push(["Y", "3", "17", "1900", "10", L("STR_STPATRICKSDAY")]);
				events.push(["F", "11", "4", "5", "11", L("STR_THANKSGIVING")]);
				events.push(["Y", "12", "25", "1900", "5", L("STR_CHRISTMAS")]);
			}
			
			// check if event is a today event or a future event
			for (var j=0; j<events.length; j++) {
				if (events[j][0] == "Y") {
					if ((events[j][2] == todaysDate) && (events[j][1] == todaysMonth) && (events[j][3] <= todaysYear)) {
						todayevents.push(events[j][5]);
					}
					// add next month's events or events coming up in this month to future events
					if ((events[j][3] <= todaysYear) && ((todaysMonth == events[j][1] - 1) || ((todaysMonth == events[j][1]) && (todaysDate < events[j][2])))) {
						futureevents.push(["", events[j][1], events[j][2], todaysYear, events[j][4], events[j][5]]);
					} else if ((events[j][3] <= todaysYear+1) && (todaysMonth == 12) && (events[j][1] == 1)) {
						futureevents.push(["", events[j][1], events[j][2], todaysYear+1, events[j][4], events[j][5]]);
					}
				}
				if (events[j][0] == "F") {
					if ((events[j][1] == 3) && (events[j][2] == 0) && (events[j][3] == 0) ) {
						Calendar.easter(todaysYear);
						if (easterday == todaysDate && eastermonth == todaysMonth) {
							todayevents.push(events[j][5]);
						}
						// add easter event to future events if easter is next month or coming up in this month 
						if ((todaysMonth < eastermonth) || ((todaysMonth == eastermonth) && (todaysDate < easterday))) {
							futureevents.push(["", eastermonth, easterday, todaysYear, events[j][4], events[j][5]]);
						}
					} else {
						var floater = Calendar.floatingholiday(year,events[j][1],events[j][2],events[j][3]);
						if ((todaysMonth == 5) && (events[j][1] == 5) && (events[j][2] == 4) && (events[j][3] == 2)) {
							if ((floater + 7 <= 31) && (todaysDate == floater + 7)) {
								todayevents.push(events[j][5]);
							} else if ((floater + 7 > 31) && (todaysDate == floater)) {
								todayevents.push(events[j][5]);								
							}
						} else if ((events[j][1] == todaysMonth) && (floater == todaysDate)) {
							todayevents.push(events[j][5]);
						}
						// add next month's events or events coming up in this month to future events
						if ((events[j][3] <= todaysYear) && ((todaysMonth == events[j][1] - 1) || ((todaysMonth == events[j][1]) && (todaysDate < floater)))) {
							futureevents.push(["", events[j][1], floater, todaysYear, events[j][4], events[j][5]]);
						} else if ((events[j][3] <= todaysYear+1) && (todaysMonth == 12) && (events[j][1] == 1)) {
							futureevents.push(["", events[j][1], floater, todaysYear+1, events[j][4], events[j][5]]);
						}
					}
				}
				if (events[j][0] == "") {
					if ((events[j][2] == todaysDate) && (events[j][1] == todaysMonth) && (events[j][3] == todaysYear)) {
						todayevents.push(events[j][5]);
					}
					// add next month's events or events coming up in this month to future events
					if ((events[j][3] == todaysYear) && ((todaysMonth == events[j][1] - 1) || ((todaysMonth == events[j][1]) && (todaysDate < events[j][2])))) {
						futureevents.push(["", events[j][1], events[j][2], todaysYear, events[j][4], events[j][5]]);
					} else if ((events[j][3] == todaysYear+1) && (todaysMonth == 12) && (events[j][1] == 1)) {
						futureevents.push(["", events[j][1], events[j][2], todaysYear+1, events[j][4], events[j][5]]);
					}
				}
				if (events[j][0] == "M") {
					if ((events[j][2] == todaysDate) && (events[j][3] <= todaysYear)) {
						todayevents.push(events[j][5]);
					}
					// add next month's events or events coming up in this month to future events
					if ((events[j][3] <= todaysYear) && (todaysDate < events[j][2])) {
						futureevents.push(["", todaysMonth, events[j][2], todaysYear, events[j][4], events[j][5]]);
					} else if ((events[j][3] <= todaysYear) && (todaysDate > events[j][2]) && (todaysMonth < 12)) {
						futureevents.push(["", todaysMonth+1, events[j][2], todaysYear, events[j][4], events[j][5]]);
					} else if ((events[j][3] <= todaysYear+1) && (todaysMonth == 12)) {
						futureevents.push(["", 1, events[j][2], todaysYear+1, events[j][4], events[j][5]]);
					}
				}
				if (events[j][0] == "W") {
					if (weekBeginsWith=="Sun") {
						if (events[j][3] == todaysDay) {
							todayevents.push(events[j][5]);
						}
						// TODO: Add weekly events to future events
					} else {
						if (events[j][3] == altTodaysDay) {
							todayevents.push(events[j][5]);
						}
						// TODO: Add weekly events to future events
					}		
				}
			}
			
			if (!eventsonly) {
				// output current month (with event icons)
				lastDate = new Date(yearNum,monthNum);
				lastDate.setDate(lastDate.getDate()-1);
				var numbDays = lastDate.getDate();
				firstDate = new Date(yearNum, monthNum-1, 1);
				firstDay = firstDate.getDay() + 1;
				var daycounter = 0;
				var eventtype;
				var numevents
				thisDate = 1;
				for (var i = 1; i <= 6; i++) {
					for (var x = 1; x <= 7; x++) {
						if (weekBeginsWith=="Sun") {
							daycounter = (thisDate - firstDay)+1;
						} else {
							daycounter = (thisDate - firstDay)+2;
							if (firstDay==1) daycounter -= 7;
						}
						thisDate++;
						if ((daycounter > numbDays) || (daycounter < 1)) {
							// square not used by current month
						} else {
							numevents=Calendar.checkevents(daycounter,monthNum,yearNum,i,x);
							
							if (numevents>0) {
								// event on this day
								eventtype=Calendar.getevent(daycounter,monthNum,yearNum,i,x);
								kbook.model.container.cutouts['calendarsquare'].draw(win, eventtype, 0, (x-1)*70+50, (i-1)*70+150, 70, 70);
								if (numevents>1) {
									win.setTextSize(10);
									win.setTextAlignment(1, 0);
									win.drawText(numevents, (x-1)*70+54, (i-1)*70+200, 20, 20);
								}
								win.setTextSize(22);
								win.setTextAlignment(0, 0);
								win.drawText(daycounter, (x-1)*70+50, (i-1)*70+155, 70, 30);
							} else {
								// blank day
								if (((weekBeginsWith=="Sun") && ((x==1) || (x==7))) || ((weekBeginsWith=="Mon") && ((x==6) || (x==7)))) {
									// weekend
									kbook.model.container.cutouts['calendarsquare'].draw(win, 2, 0, (x-1)*70+50, (i-1)*70+150, 70, 70);
									win.setTextSize(22);
									win.setTextAlignment(0, 0);
									win.drawText(daycounter, (x-1)*70+50, (i-1)*70+155, 70, 30);
								} else {
									kbook.model.container.cutouts['calendarsquare'].draw(win, 1, 0, (x-1)*70+50, (i-1)*70+150, 70, 70);
									win.setTextSize(22);
									win.setTextAlignment(0, 0);
									win.drawText(daycounter, (x-1)*70+50, (i-1)*70+155, 70, 30);
								}
							}
							if ((todaysDay == x) && (todaysDate == daycounter) && (todaysMonth == monthNum)) {
								kbook.model.container.cutouts['highlightcalsquare'].draw(win, 0, 0, (x-1)*70+50, (i-1)*70+150, 70, 70);
							}
						}
					}
				}
			}
			
			if ((!eventsonly) || (todayevents.length>0) || (futureevents.length>0)) {
				// calculate required dimensions
				var totallines = todayevents.length + futureevents.length;
				if (todayevents.length>0) totallines++;
				if (futureevents.length>0) totallines++;
				if (totallines < linelimit + 1) {
					hdiff = 24 * (linelimit + 1 - totallines);
				} else {
					hdiff = 0;
				}
				
				// output today's events
				win.setPenColor(Color.black);
				win.frameRectangle(47, 579+hdiff, w-101, h-608-hdiff);
				if (!eventsonly) {
					win.setPenColor(Color.white);
					win.fillRectangle(48, 580+hdiff, w-103, h-610-hdiff);					
				} else {
					try {
						kbook.model.container.cutouts['transparentsquare'].fill(win, 0, 0, 48, 580+hdiff, w-103, h-610-hdiff); // 0 = white, transparency 128
					} catch(e) {
						win.setPenColor(Color.white);
						win.fillRectangle(48, 580+hdiff, w-103, h-610-hdiff);					
					}
				}
				win.setPenColor(Color.black);
				win.setTextSize(20);
				var i = 0;
				if (todayevents.length>0) {
					win.setTextStyle(1);
					win.setTextAlignment(0, 0);
					win.drawText(L("TODAYS_EVENTS"), 50, 582+hdiff, w-107, 24);
					win.setTextStyle(0);
					win.setTextAlignment(1, 0);
					for (i=0; i<todayevents.length; i++) {
						if (i==linelimit) break; // only room for a limited number of lines
						win.drawText(todayevents[i], 50, (i-1)*22+630+hdiff, w-107, 22);
					}
				}
				if (futureevents.length>0) {
					// pad day and month fields
					for (var k=0; k<futureevents.length; k++) {
						futureevents[k][1]=Calendar.pad(futureevents[k][1],2);
						futureevents[k][2]=Calendar.pad(futureevents[k][2],2);
					}
					
					// sort events
					futureevents.sort(Calendar.sortEvents);
					
				
					// output future events
					win.setTextStyle(1);
					win.setTextAlignment(0, 0);
					if (i==0) {
						win.drawText(L("FUTURE_EVENTS"), 50, 582+hdiff, w-107, 24);
					} else {
						win.drawText(L("FUTURE_EVENTS"), 50, (i-1)*22+630+hdiff, w-107, 24);
						linelimit--;
					}
					win.setTextStyle(0);
					win.setTextAlignment(1, 0);
					var dateFormat;
					dateFormat = Core.system.dateFormat();
					for (var j=i; (j-i)<futureevents.length; j++) {
						if (j==linelimit) break; // only room for a limited number of lines
						var datestring;
						switch (dateFormat) {
							case 'Year-Month-Day':
								datestring = futureevents[j-i][3]+"/"+futureevents[j-i][1]+"/"+futureevents[j-i][2];
								break;
							case 'Day-Month-Year':
								datestring = futureevents[j-i][2]+"/"+futureevents[j-i][1]+"/"+futureevents[j-i][3];
								break;
							case 'Month-Day-Year':
								datestring = futureevents[j-i][1]+"/"+futureevents[j-i][2]+"/"+futureevents[j-i][3];
								break;
							default:
								// just in case: use 'Day-Month-Year'
								datestring = futureevents[j-i][2]+"/"+futureevents[j-i][1]+"/"+futureevents[j-i][3];
						}
						if (i==0) {
							win.drawText(" "+datestring+" - "+futureevents[j-i][5], 50, (j-1)*22+630+hdiff, w-107, 22);
						} else {
							win.drawText(" "+datestring+" - "+futureevents[j-i][5], 50, (j-0)*22+630+hdiff, w-107, 22);
						}
					}
				}
			}
		},
		easter: function (year) {
			var a = year % 19;
			var b = Math.floor(year/100);
			var c = year % 100;
			var d = Math.floor(b/4);
			var e = b % 4;
			var f = Math.floor((b+8) / 25);
			var g = Math.floor((b-f+1) / 3);
			var h = (19*a + b - d - g + 15) % 30;
			var i = Math.floor(c/4);
			var j = c % 4;
			var k = (32 + 2*e + 2*i - h - j) % 7;
			var m = Math.floor((a + 11*h + 22*k) / 451);
			var month = Math.floor((h + k - 7*m + 114) / 31);
			var day = ((h + k - 7*m +114) % 31) + 1;
			eastermonth = month;
			easterday = day;
		},
		floatingholiday: function (targetyr,targetmo,cardinaloccurrence,targetday) {
			var firstdate = new Date(targetyr, targetmo-1, 1);
			var firstday = firstdate.getDay() + 1;
			var dayofmonth = 0;
			if (targetday >= firstday) {
				cardinaloccurrence--;
				dayofmonth = (cardinaloccurrence * 7) + ((targetday - firstday)+1);
			} else {
				dayofmonth = (cardinaloccurrence * 7) + ((targetday - firstday)+1);
			}
			return dayofmonth;
		},
		getevent: function (day,month,year,week,dayofweek) {
			var altdayofweek;
			
			altdayofweek = dayofweek+1;
			if (altdayofweek==8) altdayofweek=1;
			for (var i = 0; i < events.length; i++) {
				if (events[i][0] == "Y") {
					if ((events[i][2] == day) && (events[i][1] == month) && (events[i][3] <= year)) {
						return events[i][4];
					}
				}
			}
			for ( i = 0; i < events.length; i++) {
				if (events[i][0] == "F") {
					if ((events[i][1] == 3) && (events[i][2] == 0) && (events[i][3] == 0) ) {
						if (easterday == day && eastermonth == month) {
							return events[i][4];
						} 
					} else {
						var floater = Calendar.floatingholiday(year,events[i][1],events[i][2],events[i][3]);

						if ((month == 5) && (events[i][1] == 5) && (events[i][2] == 4) && (events[i][3] == 2)) {
							if ((floater + 7 <= 31) && (day == floater + 7)) {
								return events[i][4];
							} else if ((floater + 7 > 31) && (day == floater)) {
								return events[i][4];								
							}
						} else if ((events[i][1] == month) && (floater == day)) {
							return events[i][4];
						}
					}
				}
			}
			for ( i = 0; i < events.length; i++) {
				if (events[i][0] == "") {
					if ((events[i][2] == day) && (events[i][1] == month) && (events[i][3] == year)) {
						return events[i][4];
					}
				}
			}		
			for ( i = 0; i < events.length; i++) {
				if (events[i][0] == "M") {
					if ((events[i][2] == day) && (events[i][3] <= year)) {
						return events[i][4];
					}
				}
			}
			for ( i = 0; i < events.length; i++) {
				if (events[i][0] == "W") {
					if (weekBeginsWith=="Sun") {
						if ((events[i][3] == dayofweek)) {
							return events[i][4];
						}
					} else {
						if ((events[i][3] == altdayofweek)) {
							return events[i][4];
						}
					}				
				}
			}
			return 3;
		},
		pad: function (number, length) {
			var str = '' + number;
			while (str.length < length) {
				str = '0' + str;
			}
			return str;
		},
		sortEvents: function (a,b) {
		   if (a[3] < b[3]) return -1;
		   else if (a[3] > b[3]) return 1;
		   else if (a[1] < b[1]) return -1;
		   else if (a[1] > b[1]) return 1;
		   else if (a[2] < b[2]) return -1;
		   else if (a[2] > b[2]) return 1;
		   return 0;
		}		
	};
	
	Core.addAddon(Calendar);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error("in Calendar.js", e);
}