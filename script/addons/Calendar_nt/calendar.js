//
// Calendar for Sony Reader (505/300)
// by Ben Chenoweth
// (utilises code taken from JavaScript Calendar featured on and available at JavaScript Kit: http://www.javascriptkit.com)
//
// Initial version: 2011-07-14
// Latest update:
// 2012-05-22 Ben Chenoweth - Removed unused variables; changed globals to locals.

var tmp = function () {
	var L = kbook.autoRunRoot.L;
	var wordMonth = new Array(L("MONTH_JANUARY"),L("MONTH_FEBRUARY"),L("MONTH_MARCH"),L("MONTH_APRIL"),L("MONTH_MAY"),L("MONTH_JUNE"),L("MONTH_JULY"),L("MONTH_AUGUST"),L("MONTH_SEPTEMBER"),L("MONTH_OCTOBER"),L("MONTH_NOVEMBER"),L("MONTH_DECEMBER"));
	var wordDays = new Array(L("ABBRV_SUNDAY"),L("ABBRV_MONDAY"),L("ABBRV_TUESDAY"),L("ABBRV_WEDNESDAY"),L("ABBRV_THURSDAY"),L("ABBRV_FRIDAY"),L("ABBRV_SATURDAY"));
	var cardinals = new Array(L("CARDINAL_ONE"), L("CARDINAL_TWO"), L("CARDINAL_THREE"), L("CARDINAL_FOUR"), L("CARDINAL_FIVE"));
	var STR_TODAY = L("STR_TODAY");
	var STR_MONTH = L("STR_MONTH");
	var STR_YEAR = L("STR_YEAR");
	var STR_OPTIONS = L("STR_OPTIONS");
	var STR_QUIT = L("STR_QUIT");
	var STR_EDIT_EVENTS = L("STR_EDIT_EVENTS");
	var STR_EVENTS = L("STR_EVENTS");
	var STR_EVENT = L("STR_EVENT");
	var STR_OK = L("STR_OK");
	var STR_CANCEL = L("STR_CANCEL");
	var STR_DELETE = L("STR_DELETE");
	var STR_CALENDAR_SETTINGS = L("STR_CALENDAR_SETTINGS");
	var STR_WEEK_STARTS_ON = L("STR_WEEK_STARTS_ON");
	var FULL_MONDAY = L("FULL_MONDAY");
	var FULL_SUNDAY = L("FULL_SUNDAY");
	var STR_TYPE = L("STR_TYPE");
	var STR_ONE_OFF = L("STR_ONE_OFF");
	var STR_YEARLY = L("STR_YEARLY");
	var STR_MONTHLY = L("STR_MONTHLY");
	var STR_WEEKLY = L("STR_WEEKLY");
	var STR_FLOATING = L("STR_FLOATING");
	var STR_DATE = L("STR_DATE");
	var STR_CARDINAL = L("STR_CARDINAL");
	var STR_WEEKDAY = L("STR_WEEKDAY");
	var STR_DESCRIPTION = L("STR_DESCRIPTION");
	var STR_SYMBOLS = L("STR_SYMBOLS");
	var STR_LETTERS = L("STR_LETTERS");
	var STR_NEWYEARSDAY = L("STR_NEWYEARSDAY");
	var STR_VALENTINESDAY = L("STR_VALENTINESDAY");
	var STR_EASTERSUNDAY = L("STR_EASTERSUNDAY");
	var STR_STPATRICKSDAY = L("STR_STPATRICKSDAY");
	var STR_THANKSGIVING = L("STR_THANKSGIVING");
	var STR_CHRISTMAS = L("STR_CHRISTMAS");
	
	var thisDate = 1;							// Tracks current date being written in calendar
	var today = new Date();							// Date object to store the current date
	var todaysDay = today.getDay() + 1;					// Stores the current day number 1-7
	var todaysDate = today.getDate();					// Stores the current numeric date within the month
	var todaysMonth = today.getUTCMonth() + 1;				// Stores the current month 1-12
	var todaysYear = today.getFullYear();					// Stores the current year
	var monthNum = todaysMonth;						// Tracks the current month being displayed
	var yearNum = todaysYear;						// Tracks the current year being displayed
	var firstDate;					// Object Storing the first day of the current month
	var firstDay;					// Tracks the day number 1-7 of the first day of the current month
	var lastDate;					// Tracks the last date of the current month
	var numbDays = 0;
	var eastermonth = 0;
	var easterday = 0;
	var events = [];
	
	var hasNumericButtons = kbook.autoRunRoot.hasNumericButtons;
	var getSoValue = kbook.autoRunRoot.getSoValue;
	var setSoValue = kbook.autoRunRoot.setSoValue;
	var getFileContent = kbook.autoRunRoot.getFileContent;
	var startsWith = kbook.autoRunRoot.startsWith;
	var datPath0 = kbook.autoRunRoot.gamesSavePath+'Calendar/';
	FileSystem.ensureDirectory(datPath0);  
	var datPath  = datPath0 + 'calendar.dat';
	var settingsPath = datPath0 + 'settings.dat';
	var selectionDate;
	var selectionDay;
	var selectionMonth;
	var selectionYear;
	var settingsDlgOpen = false;
	var eventsDlgOpen = false;
	var weekBeginsWith = "Sun";
	var custSel;
	var prevSel;
	var maxEventNum;
	var maxEventType = 5;
	var maxEventMonth = 12;
	var maxEventDay;
	var maxEventYear = 2100;
	var maxEventIcon = 17; // Change this when adding icons
	var tempEvents = [];
	var tempEventsNum = [];
	var currentTempEvent;
	var mouseLeave = getSoValue( target.SETTINGS_DIALOG.btn_Cancel,'mouseLeave');
	var mouseEnter = getSoValue( target.SETTINGS_DIALOG.btn_Cancel,'mouseEnter');
	var shifted = false;
	var shiftOffset = 26;
	var symbols = false;
	var symbolsOffset = 52;
	var keys = [];
	var customKbdPath = datPath0 + 'custom_nt.kbd';	
	var currentNumEvents = 0;
	var currentOffset = 0;
	var upenabled = false;
	var downenabled = false;
	
	// the following strings work on all readers except the 600 because the characters are missing from the font
	var strShift = "\u2191"; //up arrow
	var strUnShift = "\u2193"; //down arrow
	var strBack = "\u2190"; //left arrow
	var strUp = "\u2191";
	var strDown = "\u2193";
	
	// variables to be saved to a file
	target.settings = {	
		WeekBeginsWith : "Sun"
	};        

	// reads values of target.settings.xx from file
	target.loadSettings = function () {
		var stream, inpLine;
		var values = [];
      	try {
      		if (FileSystem.getFileInfo(settingsPath)) {
      			stream = new Stream.File(settingsPath);    			
		      	while (stream.bytesAvailable) {
      				inpLine = stream.readLine();
      				values = inpLine.split(':');
      				if ((values[1] == 'true') || (values[1] == 'false')) {   					
 					target.settings[values[0]] = values[1] == 'true';
      				} else {
      					target.settings[values[0]]=values[1];  
      				}
      			}
      		}	
      		stream.close();
      	} catch (e) {}	
	};    

	// writes values of target.settings.xx to file         
	target.saveSettings = function () { 
		var o, stream;
      	try {
      		if (FileSystem.getFileInfo(settingsPath)) FileSystem.deleteFile(settingsPath);
      		stream = new Stream.File(settingsPath, 1);
      		for (o in target.settings) {
      			stream.writeLine(o+':'+target.settings[o]);
      		}
      		stream.close();
      	} catch (e) { }         
    };

	// Load settings from save file once at startup
	target.loadSettings();
	
	// assign model-variables
	with (target.settings) {
		weekBeginsWith = WeekBeginsWith;
		target.setVariable("week_begins",WeekBeginsWith);
	}

	var twoDigits = function (i) {
		if (i<10) {return "0"+i}
		return i;	
	};

	target.loadWesternKeys = function () {
		keys[0]="q";
		keys[1]="w";
		keys[2]="e";
		keys[3]="r";
		keys[4]="t";
		keys[5]="y";
		keys[6]="u";
		keys[7]="i";
		keys[8]="o";
		keys[9]="p";
		keys[10]="a";
		keys[11]="s";
		keys[12]="d";
		keys[13]="f";
		keys[14]="g";
		keys[15]="h";
		keys[16]="j";
		keys[17]="k";
		keys[18]="l";
		keys[19]="z";
		keys[20]="x";
		keys[21]="c";
		keys[22]="v";
		keys[23]="b";
		keys[24]="n";
		keys[25]="m";
		keys[26]="Q";
		keys[27]="W";
		keys[28]="E";
		keys[29]="R";
		keys[30]="T";
		keys[31]="Y";
		keys[32]="U";
		keys[33]="I";
		keys[34]="O";
		keys[35]="P";
		keys[36]="A";
		keys[37]="S";
		keys[38]="D";
		keys[39]="F";
		keys[40]="G";
		keys[41]="H";
		keys[42]="J";
		keys[43]="K";
		keys[44]="L";
		keys[45]="Z";
		keys[46]="X";
		keys[47]="C";
		keys[48]="V";
		keys[49]="B";
		keys[50]="N";
		keys[51]="M";
		keys[52]="1";
		keys[53]="2";
		keys[54]="3";
		keys[55]="4";
		keys[56]="5";
		keys[57]="6";
		keys[58]="7";
		keys[59]="8";
		keys[60]="9";
		keys[61]="0";
		keys[62]="%";
		keys[63]="&";
		keys[64]="*";
		keys[65]="(";
		keys[66]=")";
		keys[67]="_";
		keys[68]="+";
		keys[69]=";";
		keys[70]=":";
		keys[71]="!";
		keys[72]="?";
		keys[73]="\"";
		keys[74]="\'";
		keys[75]=",";
		keys[76]=".";
		keys[77]="/";
		keys[78]="~";
		keys[79]="@";
		keys[80]="#";
		keys[81]="$";
		keys[82]="^";
		keys[83]="-";
		keys[84]="`";
		keys[85]="=";
		keys[86]="{";
		keys[87]="}";
		keys[88]="\u00AC";
		keys[89]="\u00A3";
		keys[90]="\u20AC";
		keys[91]="\u00A7";
		keys[92]="\u00A6";
		keys[93]="[";
		keys[94]="]";
		keys[95]="|";
		keys[96]="\\";
		keys[97]="\u00B2";
		keys[98]="\u00B0";
		keys[99]="\u00B5";
		keys[100]="\u00AB";
		keys[101]="\u00BB";
		keys[102]="<";
		keys[103]=">";
		return;
	};
	
	target.saveCustomKeyboard = function () {
		var o, stream;
      	try {
      		if (FileSystem.getFileInfo(customKbdPath)) FileSystem.deleteFile(customKbdPath);
      		stream = new Stream.File(customKbdPath, 1);
      		for (o=0; o<=103; o++) {
      			stream.writeLine(keys[o]);
      		}
      		stream.close();
      	} catch (e) { }   
		return;
	};
	
	// load keyboard from file
	target.loadKeyboard = function (filename) {
		var i;
		// attempt to load keyboard from file
		if (FileSystem.getFileInfo(filename)) {
			// read whole file in first to count how many events there are
			var tempfile = getFileContent(filename,'keyboard missing');
			if (tempfile!='keyboard missing') {
				keys = tempfile.split("\r\n");	// CR LF is used by stream.writeLine()
			} else {
				// fallback
				this.loadWesternKeys();
				
				// output custom.kbd
				this.saveCustomKeyboard();
			}
		} else {
			// fallback
			this.loadWesternKeys();
			
			// output custom.kbd
			this.saveCustomKeyboard();
		}
		
		// put keys on buttons
		for (i=1; i<=26; i++) {
			setSoValue(target.EVENTS_DIALOG['key'+twoDigits(i)], 'text', keys[i-1]);
		}
		return; 
	};
	
	// load keyboard from file once at startup
	target.loadKeyboard(customKbdPath);
	
	target.init = function () {
		var i,j;
		//target.bubble("tracelog","initialising...");
		this.appTitle.setValue(kbook.autoRunRoot._title);
		this.appIcon.u = kbook.autoRunRoot._icon;

		// Load events from save file
		try {
			if (FileSystem.getFileInfo(datPath)) {
				// read whole file in first to count how many events there are
				var tempfile = getFileContent(datPath,'savefile missing');
				if (tempfile!='savefile missing') {
					var lines = tempfile.split("\r\n");	// CR LF is used by stream.writeLine()
					var tempnumevents = (lines.length-1);
					//target.bubble("tracelog","Events="+tempnumevents);
					for (i=0; i<tempnumevents; i++) {
						// check for rem-character
						// target.bubble("tracelog","line[i] "+lines[i]);
						if (!startsWith(lines[i],"#")) {		
							events.push(lines[i].split(";"));
							j=events.length-1;
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
				events.push(["Y", "1", "1", "1900", "12", STR_NEWYEARSDAY]);
				events.push(["Y", "2", "14", "1900", "6", STR_VALENTINESDAY]);
				events.push(["F", "3", "0", "0", "14", STR_EASTERSUNDAY]);
				events.push(["Y", "3", "17", "1900", "10", STR_STPATRICKSDAY]);
				events.push(["F", "11", "4", "5", "11", STR_THANKSGIVING]);
				events.push(["Y", "12", "25", "1900", "5", STR_CHRISTMAS]);
			}
		} catch (e) { }
		
		// hide unwanted graphics
		this.selection1.changeLayout(0, 0, uD, 0, 0, uD);

		//target.bubble("tracelog","Today: "+today);
		
		if (weekBeginsWith=="Mon") {
			this.labelSun.setValue(wordDays[1]);
			this.labelMon.setValue(wordDays[2]);
			this.labelTue.setValue(wordDays[3]);
			this.labelWed.setValue(wordDays[4]);
			this.labelThu.setValue(wordDays[5]);
			this.labelFri.setValue(wordDays[6]);
			this.labelSat.setValue(wordDays[0]);
			todaysDay = today.getDay();
			if (todaysDay==0) todaysDay=7;
		} else {
			this.labelSun.setValue(wordDays[0]);
			this.labelMon.setValue(wordDays[1]);
			this.labelTue.setValue(wordDays[2]);
			this.labelWed.setValue(wordDays[3]);
			this.labelThu.setValue(wordDays[4]);
			this.labelFri.setValue(wordDays[5]);
			this.labelSat.setValue(wordDays[6]);
			todaysDay = today.getDay() + 1;
		}
		
		selectionDate=todaysDate;
		this.dateChanged();
		
		if (hasNumericButtons) {
			this.touchButtons0.show(false);
			this.touchButtons1.show(false);			
			//this.touchButtons2.show(false);
			this.touchButtons3.show(false);
			this.touchButtons4.show(false);
			this.BUTTON_TDY.show(false);
			this.BUTTON_PYR.show(false);
			this.BUTTON_PMN.show(false);
			this.BUTTON_NMN.show(false);
			this.BUTTON_NYR.show(false);
			this.BUTTON_EDT.show(false);
			this.BUTTON_UPP.show(false);
			this.BUTTON_DWN.show(false);
		} else {
			this.gridCursor.changeLayout(0, 0, uD, 0, 0, uD);			
			this.nonTouch1.show(false);
			this.nonTouch2.show(false);
			this.nonTouch3.show(false);
			this.nonTouch4.show(false);
			this.nonTouch5.show(false);
			this.nonTouch6.show(false);
			this.nonTouch7.show(false);
			this.nonTouch8.show(false);
			this.nonTouch9.show(false);
			this.nonTouch0.show(false);
			this.EVENTS_DIALOG.ntEventSize.show(false);
			this.EVENTS_DIALOG.ntEventMark.show(false);
		}
		
		//target.eventsText.enable(true);
		target.BUTTON_EDT.enable(false);
		target.BUTTON_UPP.enable(false);
		upenabled=false;
		downenabled=false;
		target.BUTTON_DWN.enable(false);
		this.nonTouch9.setValue('');
		this.nonTouch0.setValue('');
	
		//simplify some labels
		setSoValue(target.EVENTS_DIALOG.BACK, 'text', strBack);
		setSoValue(target.EVENTS_DIALOG.SHIFT, 'text', strShift);
		setSoValue(target.EVENTS_DIALOG.SPACE, 'text', "");
		setSoValue(target.BUTTON_UPP, 'text', strUp);
		setSoValue(target.BUTTON_DWN, 'text', strDown);
		
		//apply translation strings
		setSoValue(target.BUTTON_TDY, 'text', STR_TODAY);
		setSoValue(target.BUTTON_PYR, 'text', "-" + STR_YEAR);
		setSoValue(target.BUTTON_PMN, 'text', "-" + STR_MONTH);
		setSoValue(target.BUTTON_NMN, 'text', "+" + STR_MONTH);
		setSoValue(target.BUTTON_NYR, 'text', "+" + STR_YEAR);
		this.touchButtons0.setValue("-" + STR_MONTH);
		this.touchButtons1.setValue("+" + STR_MONTH);
		this.touchButtons3.setValue(STR_OPTIONS);
		this.touchButtons4.setValue(STR_QUIT);
		this.nonTouch1.setValue("[Mark] " + STR_TODAY);
		this.nonTouch2.setValue("[Next] +" + STR_MONTH);
		this.nonTouch3.setValue("[Hold Next] +" + STR_YEAR);
		this.nonTouch4.setValue("[Hold 0] " + STR_QUIT);
		this.nonTouch5.setValue("[Prev] -" + STR_MONTH);
		this.nonTouch6.setValue("[Hold Prev] -" + STR_YEAR);
		this.nonTouch7.setValue("[Menu] " + STR_OPTIONS);
		this.nonTouch8.setValue("[Center] " + STR_EDIT_EVENTS);
		setSoValue(target.BUTTON_EDT, 'text', STR_EDIT_EVENTS);
		this.SETTINGS_DIALOG.CalSettings.setValue(STR_CALENDAR_SETTINGS);
		setSoValue(target.SETTINGS_DIALOG.SUN, 'text', FULL_SUNDAY);
		setSoValue(target.SETTINGS_DIALOG.MON, 'text', FULL_MONDAY);
		setSoValue(target.SETTINGS_DIALOG.btn_Ok, 'text', STR_OK);
		setSoValue(target.SETTINGS_DIALOG.btn_Cancel, 'text', STR_CANCEL);
		this.EVENTS_DIALOG.CalEvents.setValue(STR_EVENTS);
		this.EVENTS_DIALOG.ntEventSize.setValue("[Size] " + STR_OK);
		this.EVENTS_DIALOG.ntEventMark.setValue("[Mark] " + STR_CANCEL);
		this.EVENTS_DIALOG.fieldEvent.setValue(STR_EVENT + ":");
		this.EVENTS_DIALOG.fieldType.setValue(STR_TYPE + ":");
		this.EVENTS_DIALOG.fieldMonth.setValue(STR_MONTH + ":");
		this.EVENTS_DIALOG.eventDayText.setValue(STR_DATE + ":");
		this.EVENTS_DIALOG.eventYearText.setValue(STR_YEAR + ":");
		this.EVENTS_DIALOG.fieldDescription.setValue(STR_DESCRIPTION + ":");
		setSoValue(target.EVENTS_DIALOG.SYMBOL, 'text', STR_SYMBOLS);
		setSoValue(target.EVENTS_DIALOG.btn_Ok, 'text', STR_OK);
		setSoValue(target.EVENTS_DIALOG.btn_Cancel, 'text', STR_CANCEL);
		setSoValue(target.EVENTS_DIALOG.btn_Delete, 'text', STR_DELETE);
		
		// fix for Prev/Next month for 300
		if (!kbook.simEnviro) {
			if (kbook.autoRunRoot.model=="300") {
				this.nonTouch2.setValue("");
				this.nonTouch5.setValue("");
				this.nonTouch3.setValue("[Hold Right] +" + STR_MONTH);
				this.nonTouch6.setValue("[Hold Left] -" + STR_MONTH);
			}			
		}
		return;
	};

	target.dateChanged = function() {
		if (monthNum == 0) {
			monthNum = 12;
			yearNum--;
		}
		else if (monthNum == 13) {
			monthNum = 1;
			yearNum++
		}
		
		this.displayMonth.setValue(wordMonth[monthNum-1]);
		this.bigYear.setValue(yearNum);

		lastDate = new Date(yearNum,monthNum);
		lastDate.setDate(lastDate.getDate()-1);
		numbDays = lastDate.getDate();
		firstDate = new Date(yearNum, monthNum-1, 1);
		firstDay = firstDate.getDay() + 1;
		selectionMonth = monthNum;
		selectionYear = yearNum;
		
		// hide events
		this.eventsText.setValue("");
		target.BUTTON_EDT.enable(false);
		target.BUTTON_UPP.enable(false);
		target.BUTTON_DWN.enable(false);
		upenabled=false;
		downenabled=false;
		this.nonTouch9.setValue('');
		this.nonTouch0.setValue('');		
		
		if (selectionDate > numbDays) selectionDate=numbDays;
		var daycounter = 0;
		thisDate = 1;
		var x = -1;
		var y = -1;
		for (var i = 1; i <= 6; i++) {
			for (var j = 1; j <= 7; j++) {
				if (weekBeginsWith=="Sun") {
					daycounter = (thisDate - firstDay)+1;
				} else {
					daycounter = (thisDate - firstDay)+2;
					if (firstDay==1) daycounter -= 7;
				}
				if (selectionDate==daycounter) {
					x=j;
					y=i;
					selectionDay=i;
				}
				thisDate++;
			}
		}
		thisDate = 1;
		
		this.createCalendar();
		
		if ((selectionDate>0) && (hasNumericButtons)) {
			//place selection square
			this.gridCursor.changeLayout((x-1)*70+50, 70, uD, (y-1)*70+80, 70, uD);

			if (this.checkevents(selectionDate,monthNum,yearNum,y,x)>0) {
				// events in selection square
				this.showevents(selectionDate,monthNum,yearNum,y,x,0);
			} else {
				this.eventsText.setValue("");
			}
		}
		
		//target.bubble("tracelog","monthNum="+monthNum+", yearNum="+yearNum+", numbDays="+numbDays);
		//target.bubble("tracelog","firstDate="+firstDate+", lastDate="+lastDate+", firstDay="+firstDay);
		return;	
	};

	target.easter = function (year) {
		// feed in the year it returns the month and day of Easter using two GLOBAL variables: eastermonth and easterday
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
	};

	target.setSquare = function (row, column, type, date, numevents) {
		var id;
		id=(row - 1) * 7 + (column - 1);
		this['square' + id].u = type;
		if (date=="0") {
			this['day' + id].setValue("");
		} else {
			this['day' + id].setValue(date);
		}
		if (numevents>1) {
			this['events' + id].setValue(numevents);
		} else {
			this['events' + id].setValue("");
		}
		return;
	};
	
	target.createCalendar = function () {
		var daycounter = 0;
		var eventtype;
		thisDate = 1;
		
		//hide today marker
		this.selection1.changeLayout(0, 0, uD, 0, 0, uD);
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
					this.setSquare(i,x,0,"0",0);
				} else {
					var numevents=this.checkevents(daycounter,monthNum,yearNum,i,x);
					if (numevents>0 || ((todaysDay == x) && (todaysDate == daycounter) && (todaysMonth == monthNum))){
						if ((todaysDay == x) && (todaysDate == daycounter) && (todaysMonth == monthNum)) {
							// today
							if (numevents>0) {
								// event on this day
								eventtype=this.getevent(daycounter,monthNum,yearNum,i,x);
								this.setSquare(i,x,eventtype,daycounter,numevents);
							} else {
								// blank day
								if (weekBeginsWith=="Sun") {
									if ((x==1) || (x==7)) {
										// weekend
										this.setSquare(i,x,2,daycounter,0);
									} else {
										this.setSquare(i,x,1,daycounter,0);
									}
								} else {
									if ((x==6) || (x==7)) {
										// weekend
										this.setSquare(i,x,2,daycounter,0);
									} else {
										this.setSquare(i,x,1,daycounter,0);
									}
								}
							}
							//show today marker
							this.selection1.changeLayout((x-1)*70+50, 70, uD, (i-1)*70+80, 70, uD);
						}
						else	{
							// event on this day
							eventtype=this.getevent(daycounter,monthNum,yearNum,i,x);
							this.setSquare(i,x,eventtype,daycounter,numevents);
						}
					} else {
						// blank day
						if (weekBeginsWith=="Sun") {
							if ((x==1) || (x==7)) {
								// weekend
								this.setSquare(i,x,2,daycounter,0);
							} else {
								this.setSquare(i,x,1,daycounter,0);
							}
						} else {
							if ((x==6) || (x==7)) {
								// weekend
								this.setSquare(i,x,2,daycounter,0);
							} else {
								this.setSquare(i,x,1,daycounter,0);
							}
						}
					}
				}
			}
		}
		thisDate = 1;
		return;
	};

	target.checkevents = function (day,month,year,week,dayofweek) {
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
					this.easter(year);
					if (easterday == day && eastermonth == month) numevents++;
				} else {
					floater = this.floatingholiday(year,events[i][1],events[i][2],events[i][3]);
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
	};

	target.getevent = function (day,month,year,week,dayofweek) {
		var altdayofweek, floater;
		
		altdayofweek = dayofweek+1;
		if (altdayofweek==8) altdayofweek=1;
		
		// Only one icon can be shown, so we have to prioritise them
		// Also, the icon of the first event of each type will be the one displayed
		// yearly events are first
		for (var i = 0; i < events.length; i++) {
			if (events[i][0] == "Y") {
				if ((events[i][2] == day) && (events[i][1] == month) && (events[i][3] <= year)) {
					return events[i][4];
				}
			}
		}
		// floating events are next
		for ( i = 0; i < events.length; i++) {
			if (events[i][0] == "F") {
				if ((events[i][1] == 3) && (events[i][2] == 0) && (events[i][3] == 0) ) {
					if (easterday == day && eastermonth == month) {
						return events[i][4];
					} 
				} else {
					floater = this.floatingholiday(year,events[i][1],events[i][2],events[i][3]);

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
		// one off events are next
		for ( i = 0; i < events.length; i++) {
			if (events[i][0] == "") {
				if ((events[i][2] == day) && (events[i][1] == month) && (events[i][3] == year)) {
					return events[i][4];
				}
			}
		}		
		// monthly events are next
		for ( i = 0; i < events.length; i++) {
			if (events[i][0] == "M") {
				if ((events[i][2] == day) && (events[i][3] <= year)) {
					return events[i][4];
				}
			}
		}
		// weekly events are last
		for ( i = 0; i < events.length; i++) {
			if (events[i][0] == "W") {
				if (weekBeginsWith=="Sun") {
					if ((events[i][3] == dayofweek)) return events[i][4];
				} else {
					if ((events[i][3] == altdayofweek)) return events[i][4];
				}				
			}
		}

		// default event icon
		return 3;
	};
	
	target.showevents = function (day,month,year,week,dayofweek,offset) {
		var theevent = "";
		var floater = 0;
		var altdayofweek;
		var preoffset = 0;

		altdayofweek = dayofweek+1;
		if (altdayofweek==8) altdayofweek=1;

		// reset the temporary array
		if (tempEvents.length>0) {
			tempEvents.length=0;
			tempEventsNum.length=0;
		}
		
		for (var i = 0; i < events.length; i++) {
			// First we'll process recurring events (if any):
			if (events[i][0] != "") {
				// repeating event
				if (events[i][0] == "W") {
					if ((events[i][3] == dayofweek)) {
						
					}
					if (weekBeginsWith=="Sun") {
						if ((events[i][3] == dayofweek)) {
							preoffset++;
							if (preoffset > offset) { theevent += events[i][5] + '\n'; }
							tempEvents=tempEvents.concat(events.slice(i,i+1));
							tempEventsNum.push(i);
						}
					} else {
						if ((events[i][3] == altdayofweek)) {
							preoffset++;
							if (preoffset > offset) { theevent += events[i][5] + '\n'; }
							tempEvents=tempEvents.concat(events.slice(i,i+1));
							tempEventsNum.push(i);
						}
					}						
				}
				if (events[i][0] == "M") {
					if ((events[i][2] == day) && (events[i][3] <= year)) {
						preoffset++;
						if (preoffset > offset) { theevent += events[i][5] + '\n'; }
						tempEvents=tempEvents.concat(events.slice(i,i+1));
						tempEventsNum.push(i);
					}
				}
				if ((events[i][0] == "Y") || (events[i][0] == "C") || (events[i][0] == "B") || (events[i][0] == "V") || (events[i][0] == "A")) {
					if ((events[i][2] == day) && (events[i][1] == month) && (events[i][3] <= year)) {
						preoffset++;
						if (preoffset > offset) { theevent += events[i][5] + '\n'; }
						tempEvents=tempEvents.concat(events.slice(i,i+1));
						tempEventsNum.push(i);
					}
				}
				if (events[i][0] == "F") {
					if ((events[i][1] == 3) && (events[i][2] == 0) && (events[i][3] == 0) ) {
						if (easterday == day && eastermonth == month) {
							preoffset++;
							if (preoffset > offset) { theevent += events[i][5] + '\n'; }
							tempEvents=tempEvents.concat(events.slice(i,i+1));
							tempEventsNum.push(i);
						} 
					} else {
						floater = this.floatingholiday(year,events[i][1],events[i][2],events[i][3]);

						if ((month == 5) && (events[i][1] == 5) && (events[i][2] == 4) && (events[i][3] == 2)) {
							if ((floater + 7 <= 31) && (day == floater + 7)) {
								preoffset++;
								if (preoffset > offset) { theevent += events[i][5] + '\n'; }
								tempEvents=tempEvents.concat(events.slice(i,i+1));
								tempEventsNum.push(i);
							} else if ((floater + 7 > 31) && (day == floater)) {
								preoffset++;
								if (preoffset > offset) { theevent += events[i][5] + '\n'; }
								tempEvents=tempEvents.concat(events.slice(i,i+1));
								tempEventsNum.push(i);
							}
						} else if ((events[i][1] == month) && (floater == day)) {
							preoffset++;
							if (preoffset > offset) { theevent += events[i][5] + '\n'; }
							tempEvents=tempEvents.concat(events.slice(i,i+1));
							tempEventsNum.push(i);
						}
					}
				}
			}
			// Now we'll process any One Time events happening on the matching month, day, year:
			else if ((events[i][2] == day) && (events[i][1] == month) && (events[i][3] == year)) {
				// one-off event
				preoffset++;
				if (preoffset > offset) { theevent += events[i][5] + '\n'; }
				tempEvents=tempEvents.concat(events.slice(i,i+1));
				tempEventsNum.push(i);
			}
		}

		this.eventsText.setValue(theevent);
		currentNumEvents = tempEvents.length;
		currentOffset = offset;
		if (offset > 0) {
			target.BUTTON_UPP.enable(true);
			upenabled=true;
			this.nonTouch9.setValue('8: '+strUp);
		} else {
			target.BUTTON_UPP.enable(false);
			upenabled=false;
			this.nonTouch9.setValue('');
		}
		if (tempEvents.length > offset + 6) {
			target.BUTTON_DWN.enable(true);
			downenabled=true;
			this.nonTouch0.setValue('9: '+strDown);
		} else {
			target.BUTTON_DWN.enable(false);
			downenabled=false;
			this.nonTouch0.setValue('');
		}
		return;
	};

	target.floatingholiday = function (targetyr,targetmo,cardinaloccurrence,targetday) {
		// Floating holidays/events uses:
		//	the Month field for the Month (here it becomes the targetmo field)
		//	the Day field as the Cardinal Occurrence  (here it becomes the cardinaloccurrence field)
		//		1=1st, 2=2nd, 3=3rd, 4=4th, 5=5th, 6=6th occurrence of the day listed next
		//	the Year field as the Day of the week the event/holiday falls on  (here it becomes the targetday field)
		//		1=Sunday, 2=Monday, 3=Tuesday, 4=Wednesday, 5=Thurday, 6=Friday, 7=Saturday
		//	example: "F",	"1",	"3",	"2", = Floating holiday in January on the 3rd Monday of that month.
		//
		// In our code below:
		// 	targetyr is the active year
		// 	targetmo is the active month (1-12)
		// 	cardinaloccurrence is the xth occurrence of the targetday (1-6)
		// 	targetday is the day of the week the floating holiday is on
		//		0=Sun; 1=Mon; 2=Tue; 3=Wed; 4=Thu; 5=Fri; 6=Sat
		//		Note: subtract 1 from the targetday field if the info comes from the events.js file
		//
		// Note:
		//	If Memorial Day falls on the 22nd, 23rd, or 24th, then we add 7 to the dayofmonth to the result.
		//
		// Example: targetyr = 2052; targetmo = 5; cardinaloccurrence = 4; targetday = 1
		//	This is the same as saying our floating holiday in the year 2052, is during May, on the 4th Monday
		//
		var firstdate = new Date(targetyr, targetmo-1, 1);	// Object Storing the first day of the current month.
		var firstday = firstdate.getDay() + 1;	// The first day (0-6) of the target month.
		var dayofmonth = 0;	// zero out our calendar day variable.

			//targetday = targetday - 1;

			if (targetday >= firstday) {
				cardinaloccurrence--;	// Subtract 1 from cardinal day.
				dayofmonth = (cardinaloccurrence * 7) + ((targetday - firstday)+1);
			} else {
				dayofmonth = (cardinaloccurrence * 7) + ((targetday - firstday)+1);
			}
		return dayofmonth;
	};
	
	target.doButtonClick = function (sender) {
		var id, n, x, y;
		id = getSoValue(sender, "id");
		n = id.substring(7, 10);
		if (n == "TDY") {
			monthNum=todaysMonth;
			yearNum=todaysYear;
			this.gridCursor.changeLayout(0, 0, uD, 0, 0, uD);			
			this.dateChanged();			
			return;
		}
		if (n == "PYR") {
			// previous year
			yearNum--;
			this.gridCursor.changeLayout(0, 0, uD, 0, 0, uD);
			this.dateChanged();
			return;
		}
		if (n == "PMN") {
			// previous month
			monthNum--;
			this.gridCursor.changeLayout(0, 0, uD, 0, 0, uD);			
			this.dateChanged();
			return;
		}
		if (n == "NMN") {
			// next month
			monthNum++;
			this.gridCursor.changeLayout(0, 0, uD, 0, 0, uD);			
			this.dateChanged();
			return;
		}
		if (n == "NYR") {
			// next year
			yearNum++;
			this.gridCursor.changeLayout(0, 0, uD, 0, 0, uD);			
			this.dateChanged();
			return;
		}
		if (n == "EDT") {
			// edit events
			this.doEditEvents();
			return;
		}
		if (n == "UPP") {
			// scroll events textbox up
			currentOffset = currentOffset - 6;
			if (currentOffset < 0) { currentOffset=0; }
			this.showevents(selectionDate,monthNum,yearNum,y,x,currentOffset);
			return;
		}
		if (n == "DWN") {
			// scroll events textbox down
			var oldCurrentOffset = currentOffset;
			currentOffset = currentOffset + 6;
			if (currentOffset > currentNumEvents) { currentOffset=oldCurrentOffset; }
			this.showevents(selectionDate,monthNum,yearNum,y,x,currentOffset);
			return;
		}		
	};

	target.digitF = function (key) {
		var x, y;
		if ((key==8) && upenabled) {
			// scroll events textbox up
			currentOffset = currentOffset - 6;
			if (currentOffset < 0) { currentOffset=0; }
			this.showevents(selectionDate,monthNum,yearNum,y,x,currentOffset);
			return;
		}
		if ((key==9) && downenabled) {
			// scroll events textbox down
			var oldCurrentOffset = currentOffset;			
			currentOffset = currentOffset + 6;
			if (currentOffset > currentNumEvents) { currentOffset=oldCurrentOffset; }
			this.showevents(selectionDate,monthNum,yearNum,y,x,currentOffset);
			return;
		}
		return;
	};
	
	target.doSquareClick = function (sender) {
		var id, n, x, y;
		id = getSoValue(sender, "id");
		n = id.substring(6, 8);
		x = (n % 7) + 1; // find column
		y = (Math.floor(n / 7)) + 1; // find row
			
		var daycounter = 0;
		thisDate = 1;
		for (var i = 1; i <= 6; i++) {
			for (var j = 1; j <= 7; j++) {
				if (weekBeginsWith=="Sun") {
					daycounter = (thisDate - firstDay)+1;
				} else {
					daycounter = (thisDate - firstDay)+2;
					if (firstDay==1) daycounter -= 7;
				}
				if ((x==j) && (y==i)) {
					selectionDate=daycounter;
					selectionDay=j;
				}
				thisDate++;
			}
		}
		thisDate = 1;	
		if ((selectionDate < 1) || (selectionDate > numbDays)) selectionDate=0;
		
		if (selectionDate>0) {
			//place selection square
			this.gridCursor.changeLayout((x-1)*70+50, 70, uD, (y-1)*70+80, 70, uD);
			target.BUTTON_EDT.enable(true);
		}
		
		// reset the temporary array
		if (tempEvents.length>0) {
			tempEvents.length=0;
			tempEventsNum.length=0;
		}		
		
		if (this.checkevents(selectionDate,monthNum,yearNum,y,x)>0) {
			// events in square that was clicked
			this.showevents(selectionDate,monthNum,yearNum,y,x,0);
		} else {
			this.eventsText.setValue("");
		}

		//target.bubble("tracelog","n="+n+", column="+x+", row="+y+", date="+selectionDate);
		return;
	};
	
	target.doSelectClick = function (sender) {
		return;
	};

	target.doNext = function (sender) {
		// next month
		monthNum++;
		if (!hasNumericButtons) {
			this.gridCursor.changeLayout(0, 0, uD, 0, 0, uD);
		}
		this.dateChanged();	
		return;
	};

	target.doPrev = function (sender) {
		// previous month
		monthNum--;
		if (!hasNumericButtons) {
			this.gridCursor.changeLayout(0, 0, uD, 0, 0, uD);
		}		
		this.dateChanged();	
		return;
	};

	target.doRoot = function (sender) {
		this.saveEvents();
		kbook.autoRunRoot.exitIf(kbook.model);
		return;
	};
	
	target.doHold0 = function () {
		this.saveEvents();
		kbook.autoRunRoot.exitIf(kbook.model);
		return;
	};

	target.saveEvents = function () {
		var stream, event;
		// save events to file
		try {
			if (FileSystem.getFileInfo(datPath)) FileSystem.deleteFile(datPath); 
			stream = new Stream.File(datPath, 1);
			stream.writeLine("# General Event-Format is: Type; Month; Day; Year; Icon; Text");
			stream.writeLine("# Type can be: Y<early, M<onthly, W<eekly, F<loating, BLANK for one-off events");
			stream.writeLine("# Float-Format: F; Month; Cardinal Occurrence; Day of Week (Sun=1; Monday=2); Icon; Text");
			stream.writeLine("# Special Float-Format: F;3;0;0;Icon;Easter Sunday");
			stream.writeLine("# Icons: 3=Default, 4=Birthday, 5=Christmas, 6=Two Hearts, 7=Anniversary, 8=Airplane, 9=Car");
			stream.writeLine("# Icons: 10=St. Patrick's Day, 11=Thanksgiving, 12=New Year's Day, 13=R.I.P., 14=Easter");
			stream.writeLine("# Icons: 15=Work, 16=School, 17=Meeting");
			for (var i = 0; i < events.length; i++) {
				event=events[i][0]+';'+events[i][1]+';'+events[i][2]+';'+events[i][3]+';'+events[i][4]+';'+events[i][5];
				stream.writeLine(event);
			}		
			stream.close();
		} catch (e) {}
		return;
	};
	
	target.doLast = function () {
		// fix for Prev/Next month for 300
		if (!kbook.simEnviro) {
			if (kbook.autoRunRoot.model=="300") {
				// next month by holding right
				monthNum++;
				this.dateChanged();	
				return;
			}
		}
		
		// next year
		yearNum++;
		if (!hasNumericButtons) {
			this.gridCursor.changeLayout(0, 0, uD, 0, 0, uD);
		}		
		this.dateChanged();	
		return;
	};
	
	target.doFirst = function () {
		// fix for Prev/Next month for 300
		if (!kbook.simEnviro) {
			if (kbook.autoRunRoot.model=="300") {
				// previous month by holding left
				monthNum--;	
				this.dateChanged();	
				return;
			}
		}
		
		// last year
		yearNum--;
		if (!hasNumericButtons) {
			this.gridCursor.changeLayout(0, 0, uD, 0, 0, uD);
		}		
		this.dateChanged();	
		return;
	};

	target.doCenterF = function () {
		if (settingsDlgOpen) {
			this.SETTINGS_DIALOG.doCenterF();
			return;
		}
		if (eventsDlgOpen) {
			this.EVENTS_DIALOG.doCenterF();
			return;
		}
		//target.bubble("tracelog","selectionDate="+selectionDate+", numEvents="+tempEvents.length);
		this.doEditEvents();
		return;
	};
	
	target.moveCursor = function (dir) {
		if (settingsDlgOpen) {
			this.SETTINGS_DIALOG.moveCursor(dir);
			return;
		}	
		if (eventsDlgOpen) {
			this.EVENTS_DIALOG.moveCursor(dir);
			return;
		}	
		switch (dir) {
		case "down":
			{
				selectionDate += 7;
				break;
			}
		case "up":
			{
				selectionDate -= 7;
				break;
			}
		case "left":
			{
				selectionDate -= 1;
				if (selectionDate==0) selectionDate=numbDays;
				break;
			}
		case "right":
			{
				selectionDate += 1;
				if (selectionDate==numbDays+1) selectionDate=1;
				break;
			}
		}
		
		if (selectionDate > numbDays) {
			if (selectionDate > 35) {
				selectionDate -= 35;
			} else {
				selectionDate -= 28;
			}
		}
		if (selectionDate < 1) {
			if (numbDays==28) {
				selectionDate +=28;
			} else if (numbDays==29) {
				if (selectionDate < -5) {
					selectionDate += 35;
				} else {
					selectionDate += 28;
				}
			} else if (numbDays==30) {
				if (selectionDate < -4) {
					selectionDate += 35;
				} else {
					selectionDate +=28;
				}
			} else {
				if (selectionDate < -3) {
					selectionDate += 35;
				} else {
					selectionDate += 28;
				}
			}
		}
		this.dateChanged();
		return;
	};
	
	target.doMark = function () {
		if (eventsDlgOpen) {
			target.EVENTS_DIALOG.btn_Cancel.click();
		} else {
			selectionDate=todaysDate;
			monthNum=todaysMonth;
			yearNum=todaysYear;
			this.dateChanged();
		}
		return;
	};
	
	target.doSize = function () {
		if (eventsDlgOpen) {
			target.EVENTS_DIALOG.btn_Ok.click();
		}
		return;
	};
	
	
	// Settings pop-up panel stuff
    target.doOption = function(sender) {
		target.SETTINGS_DIALOG.week_starts.setValue(STR_WEEK_STARTS_ON + ":");
		if (weekBeginsWith=="Sun") {
			target.setVariable("week_begins","1");
		} else {
			target.setVariable("week_begins","2");
		}
		if (hasNumericButtons) {
			custSel = 0;
			this.ntHandleSettingsDlg();
		} else {
			//target.SETTINGS_DIALOG.week_starts.enable(true);
		}
		settingsDlgOpen = true;
		target.SETTINGS_DIALOG.show(true);
		return;
    };
	
	target.closeDlg = function () {
		settingsDlgOpen = false;
		eventsDlgOpen = false;
		return;
	};

	target.changeSettings = function () {
		settingsDlgOpen = false;
		var t = target.getVariable("week_begins");
		
		if (t == "1") {
			weekBeginsWith="Sun";
		}
		if (t == "2") {
			weekBeginsWith="Mon";
		}
		
		// save current settings to settingsDatPath
		target.settings.WeekBeginsWith = weekBeginsWith;
		this.saveSettings();
		
		// change calendar
		if (weekBeginsWith=="Mon") {
			this.labelSun.setValue(wordDays[1]);
			this.labelMon.setValue(wordDays[2]);
			this.labelTue.setValue(wordDays[3]);
			this.labelWed.setValue(wordDays[4]);
			this.labelThu.setValue(wordDays[5]);
			this.labelFri.setValue(wordDays[6]);
			this.labelSat.setValue(wordDays[0]);
			todaysDay = today.getDay();
			if (todaysDay==0) todaysDay=7;
		} else {
			this.labelSun.setValue(wordDays[0]);
			this.labelMon.setValue(wordDays[1]);
			this.labelTue.setValue(wordDays[2]);
			this.labelWed.setValue(wordDays[3]);
			this.labelThu.setValue(wordDays[4]);
			this.labelFri.setValue(wordDays[5]);
			this.labelSat.setValue(wordDays[6]);
			todaysDay = today.getDay() + 1;
		}
		if (!hasNumericButtons) {
			this.gridCursor.changeLayout(0, 0, uD, 0, 0, uD);
		}		
		this.dateChanged();
		return;
	};
	
	target.ntHandleSettingsDlg = function () {
		if (custSel === 0) {
			target.SETTINGS_DIALOG.week_starts.enable(true);
			mouseLeave.call(target.SETTINGS_DIALOG.btn_Ok);
		}
		if (custSel === 1) {
			target.SETTINGS_DIALOG.week_starts.enable(false);	
			mouseLeave.call(target.SETTINGS_DIALOG.btn_Cancel);
			mouseEnter.call(target.SETTINGS_DIALOG.btn_Ok);
		}		
		if (custSel === 2) {				 		
			mouseLeave.call(target.SETTINGS_DIALOG.btn_Ok);
			mouseEnter.call(target.SETTINGS_DIALOG.btn_Cancel);	
		}
		return;
	};

	target.SETTINGS_DIALOG.moveCursor = function (direction) {
		switch (direction) {
			case "up" : {
				if (custSel>0) {
					custSel--;
					target.ntHandleSettingsDlg();
				}
				break
			}
			case "down" : {
				if (custSel<2) {
					custSel++;
					target.ntHandleSettingsDlg();
				}
				break
			}
			case "left" : {
				if (custSel==0) {
					target.setVariable("week_begins","1");
				}
				break
			}		
			case "right" : {
				if (custSel==0) {
					target.setVariable("week_begins","2");
				}
				break
			}
			return;
		}	
	};
	
	target.SETTINGS_DIALOG.doCenterF = function () {
		if (custSel === 1) target.SETTINGS_DIALOG.btn_Ok.click();	
		if (custSel === 2) target.SETTINGS_DIALOG.btn_Cancel.click();
		return;
	};

	target.SETTINGS_DIALOG.settingsType = function (t) {
		return;
	};
	
	// events popup stuff
    target.doEditEvents = function () {
		// reset labels
		maxEventNum=tempEvents.length+1; // need to add +1 if a blank event can be added
		maxEventDay=numbDays;
		
		if (tempEvents.length==0) {
			// prepare textboxes for new event
			currentTempEvent=0;
			target.EVENTS_DIALOG.eventNum.setValue("1");
			target.setVariable("event_num","1");
			target.EVENTS_DIALOG.eventType.setValue("1");
			target.setVariable("event_type","1");
			target.EVENTS_DIALOG.eventTypeText.setValue(STR_ONE_OFF);
			target.EVENTS_DIALOG.eventMonth.setValue(monthNum);
			target.setVariable("event_month",monthNum);
			target.EVENTS_DIALOG.eventDay.setValue(selectionDate);
			target.setVariable("event_day",selectionDate);
			target.EVENTS_DIALOG.eventYear.setValue(yearNum);
			target.setVariable("event_year",yearNum);
			target.EVENTS_DIALOG.eventIcon.setValue("3");
			target.setVariable("event_icon","3");
			this.EVENTS_DIALOG.square42.u = 3;			
			target.EVENTS_DIALOG.eventDescription.setValue("");
			target.setVariable("event_description","");
			target.EVENTS_DIALOG.eventDayText.setValue(STR_DATE + ":");
			target.EVENTS_DIALOG.eventYearText.setValue(STR_YEAR + ":");	
			target.EVENTS_DIALOG.weekDay.show(false);
			target.EVENTS_DIALOG.cardinalDay.show(false);
			target.EVENTS_DIALOG.eventMonth.show(true);
			target.EVENTS_DIALOG.eventDay.show(true);			
			target.EVENTS_DIALOG.btn_Delete.enable(false);
			
			if (!shifted) {
				shifted=true;
				symbols=false;
				this.refreshKeys();
			}
		} else {
			// put first event information into textboxes
			currentTempEvent=0;
			target.EVENTS_DIALOG.eventNum.setValue("1");		
			target.setVariable("event_num","1");
			target.EVENTS_DIALOG.loadTempEvent();
			target.EVENTS_DIALOG.btn_Delete.enable(true);
		}

		if (hasNumericButtons) {
			custSel = 0;
			prevSel = 0;
			this.ntHandleEventsDlg();
		}
		
		eventsDlgOpen = true;
		target.EVENTS_DIALOG.show(true);
		return;
    };

	target.EVENTS_DIALOG.loadTempEvent = function () {
		var eventMonth, eventYear, eventDay;
		target.EVENTS_DIALOG.eventDayText.setValue(STR_DATE + ":");
		target.EVENTS_DIALOG.eventYearText.setValue(STR_YEAR + ":");	
		target.EVENTS_DIALOG.weekDay.show(false);
		target.EVENTS_DIALOG.cardinalDay.show(false);
		target.EVENTS_DIALOG.eventMonth.show(true);
		target.EVENTS_DIALOG.eventDay.show(true);
		if (tempEvents[currentTempEvent][0]=="") {
			target.EVENTS_DIALOG.eventType.setValue("1");
			target.setVariable("event_type","1");
			target.EVENTS_DIALOG.eventTypeText.setValue(STR_ONE_OFF);
			target.EVENTS_DIALOG.eventMonth.setValue(tempEvents[currentTempEvent][1]);
			target.setVariable("event_month",tempEvents[currentTempEvent][1]);
			target.EVENTS_DIALOG.eventDay.setValue(tempEvents[currentTempEvent][2]);
			target.setVariable("event_day",tempEvents[currentTempEvent][2]);
			target.EVENTS_DIALOG.eventYear.setValue(tempEvents[currentTempEvent][3]);
			target.setVariable("event_year",tempEvents[currentTempEvent][3]);				
		} else if (tempEvents[currentTempEvent][0]=="Y") {
			target.EVENTS_DIALOG.eventType.setValue("2");
			target.setVariable("event_type","2");
			target.EVENTS_DIALOG.eventTypeText.setValue(STR_YEARLY);
			target.EVENTS_DIALOG.eventMonth.setValue(tempEvents[currentTempEvent][1]);
			target.setVariable("event_month",tempEvents[currentTempEvent][1]);
			target.EVENTS_DIALOG.eventDay.setValue(tempEvents[currentTempEvent][2]);
			target.setVariable("event_day",tempEvents[currentTempEvent][2]);
			target.EVENTS_DIALOG.eventYear.setValue(tempEvents[currentTempEvent][3]);
			target.setVariable("event_year",tempEvents[currentTempEvent][3]);				
		} else if (tempEvents[currentTempEvent][0]=="M") {
			// monthly event (therefore don't need the month label)
			target.EVENTS_DIALOG.eventType.setValue("3");
			target.setVariable("event_type","3");
			target.EVENTS_DIALOG.eventTypeText.setValue(STR_MONTHLY);
			target.EVENTS_DIALOG.eventMonth.show(false);
			eventMonth=0;
			target.setVariable("event_month",eventMonth);
			target.EVENTS_DIALOG.eventDayText.setValue(STR_DATE + ":");
			target.EVENTS_DIALOG.eventYearText.setValue(STR_YEAR + ":");	
			target.EVENTS_DIALOG.weekDay.show(false);
			target.EVENTS_DIALOG.cardinalDay.show(false);
			target.EVENTS_DIALOG.eventDay.show(true);
			eventYear=tempEvents[currentTempEvent][3];
			eventDay=tempEvents[currentTempEvent][2];
			if (eventYear<1900) eventYear=todaysYear; // if original event was a floating event
			target.setVariable("event_year",eventYear);
			target.EVENTS_DIALOG.eventYear.setValue(eventYear);
			if (eventDay==0) eventDay=1; // if original event was a floating event
			target.setVariable("event_day",eventDay);
			target.EVENTS_DIALOG.eventDay.setValue(eventDay);
		} else if (tempEvents[currentTempEvent][0]=="W") {
			// weekly event (therefore don't need the month or date, and yearly becomes week day)
			target.EVENTS_DIALOG.eventType.setValue("4");
			target.setVariable("event_type","4");
			target.EVENTS_DIALOG.eventTypeText.setValue(STR_WEEKLY);
			target.EVENTS_DIALOG.eventMonth.show(false);
			eventMonth=0;
			target.setVariable("event_month",eventMonth);
			target.EVENTS_DIALOG.eventDay.show(false);
			target.EVENTS_DIALOG.cardinalDay.show(false);
			eventDay=0;
			target.setVariable("event_day",eventDay);
			target.EVENTS_DIALOG.eventYearText.setValue(STR_WEEKDAY);
			target.EVENTS_DIALOG.weekDay.show(true);
			eventYear=tempEvents[currentTempEvent][3];
			if (eventYear>7) eventYear=1;
			target.setVariable("event_year",eventYear);
			if (eventYear==0) {
				target.EVENTS_DIALOG.weekDay.setValue("0");
			} else if (eventYear==1) {
				target.EVENTS_DIALOG.weekDay.setValue(wordDays[0]);				
			} else if (eventYear==2) {
				target.EVENTS_DIALOG.weekDay.setValue(wordDays[1]);
			} else if (eventYear==3) {
				target.EVENTS_DIALOG.weekDay.setValue(wordDays[2]);
			} else if (eventYear==4) {
				target.EVENTS_DIALOG.weekDay.setValue(wordDays[3]);
			} else if (eventYear==5) {
				target.EVENTS_DIALOG.weekDay.setValue(wordDays[4]);
			} else if (eventYear==6) {
				target.EVENTS_DIALOG.weekDay.setValue(wordDays[5]);
			} else if (eventYear==7) {
				target.EVENTS_DIALOG.weekDay.setValue(wordDays[6]);
			}
		} else if (tempEvents[currentTempEvent][0]=="F") {
			target.EVENTS_DIALOG.eventType.setValue("5");
			target.setVariable("event_type","5");
			target.EVENTS_DIALOG.eventTypeText.setValue(STR_FLOATING);	
			// floating event requires different labels
			target.EVENTS_DIALOG.eventDayText.setValue(STR_CARDINAL + ":");
			target.EVENTS_DIALOG.eventYearText.setValue(STR_WEEKDAY + ":");
			target.EVENTS_DIALOG.weekDay.show(true);
			if (tempEvents[currentTempEvent][3]=="0") {
				target.EVENTS_DIALOG.weekDay.setValue("0");
			} else if (tempEvents[currentTempEvent][3]>="1" && tempEvents[currentTempEvent][3]<="6" ) {
				target.EVENTS_DIALOG.weekDay.setValue(wordDays[(tempEvents[currentTempEvent][3])-1]);				
			}
			target.EVENTS_DIALOG.cardinalDay.show(true);
			if (tempEvents[currentTempEvent][2]=="0") {
				target.EVENTS_DIALOG.cardinalDay.setValue("0");
			} else if (tempEvents[currentTempEvent][2]>="1" && tempEvents[currentTempEvent][2]<="5" ) {
				target.EVENTS_DIALOG.cardinalDay.setValue(cardinals[(tempEvents[currentTempEvent][2])-1]);
			}
			target.EVENTS_DIALOG.eventMonth.setValue(tempEvents[currentTempEvent][1]);
			target.setVariable("event_month",tempEvents[currentTempEvent][1]);
			target.EVENTS_DIALOG.eventDay.setValue(tempEvents[currentTempEvent][2]);
			target.setVariable("event_day",tempEvents[currentTempEvent][2]);
			target.EVENTS_DIALOG.eventYear.setValue(tempEvents[currentTempEvent][3]);
			target.setVariable("event_year",tempEvents[currentTempEvent][3]);				
		}
		target.EVENTS_DIALOG.eventIcon.setValue(tempEvents[currentTempEvent][4]);
		target.setVariable("event_icon",tempEvents[currentTempEvent][4]);
		this.square42.u = tempEvents[currentTempEvent][4];
		target.EVENTS_DIALOG.eventDescription.setValue(tempEvents[currentTempEvent][5]);
		target.setVariable("event_description",tempEvents[currentTempEvent][5]);
		return;
	};
	
	target.EVENTS_DIALOG.doPlusMinus = function (sender) {
	    var senderID;
	    senderID = getSoValue(sender,"id");
		target.EVENTS_DIALOG.doPlusMinusF(senderID);
		return;
	};
	
	target.EVENTS_DIALOG.doPlusMinusF = function (senderID) {
		var step, eventNum, eventType, eventMonth, eventDay, eventYear, eventIcon;
		step = ( senderID.lastIndexOf("+") != -1) ? 1 : -1;
		senderID = senderID.slice(0,senderID.length-1);
	    eventNum = parseInt(target.getVariable("event_num"));
	    eventType = parseInt(target.getVariable("event_type"));
	    eventMonth = parseInt(target.getVariable("event_month"));
	    eventDay = parseInt(target.getVariable("event_day"));
	    eventYear = parseInt(target.getVariable("event_year"));
		eventIcon = parseInt(target.getVariable("event_icon"));
		
	    switch (senderID) {
			case "eventNum" :
			{
				if (eventNum<=maxEventNum-step && eventNum>0-step) {
					eventNum = eventNum+step;
				}
				target.setVariable("event_num",eventNum);
				target.EVENTS_DIALOG.eventNum.setValue(eventNum);
				currentTempEvent=eventNum-1;
				if (currentTempEvent==tempEventsNum.length) {
					// new event
					target.EVENTS_DIALOG.eventNum.setValue(eventNum);
					target.setVariable("event_num",eventNum);
					target.EVENTS_DIALOG.eventType.setValue("1");
					target.setVariable("event_type","1");
					target.EVENTS_DIALOG.eventTypeText.setValue(STR_ONE_OFF);
					target.EVENTS_DIALOG.eventMonth.setValue(monthNum);
					target.setVariable("event_month",monthNum);
					target.EVENTS_DIALOG.eventDay.setValue(selectionDate);
					target.setVariable("event_day",selectionDate);
					target.EVENTS_DIALOG.eventYear.setValue(yearNum);
					target.setVariable("event_year",yearNum);
					target.EVENTS_DIALOG.eventIcon.setValue("3");
					target.setVariable("event_icon","3");
					this.square42.u = 3;
					target.EVENTS_DIALOG.eventDescription.setValue("");
					target.setVariable("event_description","");
					target.EVENTS_DIALOG.eventDayText.setValue(STR_DATE + ":");
					target.EVENTS_DIALOG.eventYearText.setValue(STR_YEAR + ":");	
					target.EVENTS_DIALOG.weekDay.show(false);
					target.EVENTS_DIALOG.eventMonth.show(true);
					target.EVENTS_DIALOG.eventDay.show(true);
					target.EVENTS_DIALOG.cardinalDay.show(false);
					target.EVENTS_DIALOG.btn_Delete.enable(false);
			} else {
					// load existing event
					target.EVENTS_DIALOG.loadTempEvent();
					target.EVENTS_DIALOG.btn_Delete.enable(true);
				}
				break;
			}
			case "eventType" :
			{
				if (eventType<=maxEventType-step && eventType>0-step) {
					eventType = eventType+step;
				}
				target.setVariable("event_type",eventType);
				target.EVENTS_DIALOG.eventType.setValue(eventType);
				if (eventType=="1") target.EVENTS_DIALOG.eventTypeText.setValue(STR_ONE_OFF);
				if (eventType=="2") target.EVENTS_DIALOG.eventTypeText.setValue(STR_YEARLY);
				if (eventType=="3") target.EVENTS_DIALOG.eventTypeText.setValue(STR_MONTHLY);
				if (eventType=="4") target.EVENTS_DIALOG.eventTypeText.setValue(STR_WEEKLY);
				if (eventType=="5") target.EVENTS_DIALOG.eventTypeText.setValue(STR_FLOATING);
				// change labels if necessary
				if (eventType=="3") {
					// monthly event (therefore don't need the month label)
					target.EVENTS_DIALOG.eventMonth.show(false);
					eventMonth=0;
					target.setVariable("event_month",eventMonth);
					target.EVENTS_DIALOG.eventDayText.setValue(STR_DATE + ":");
					target.EVENTS_DIALOG.eventYearText.setValue(STR_YEAR + ":");	
					target.EVENTS_DIALOG.weekDay.show(false);
					target.EVENTS_DIALOG.cardinalDay.show(false);
					target.EVENTS_DIALOG.eventDay.show(true);
					if (currentTempEvent==tempEventsNum.length) {
						// new event
						eventYear=selectionYear;
						eventDay=selectionDate;
					} else {
						eventYear=tempEvents[currentTempEvent][3];
						eventDay=tempEvents[currentTempEvent][2];
					}
					if (eventYear<1900) eventYear=todaysYear; // if original event was a floating event
					target.setVariable("event_year",eventYear);
					target.EVENTS_DIALOG.eventYear.setValue(eventYear);
					if (eventDay==0) eventDay=1; // if original event was a floating event
					target.setVariable("event_day",eventDay);
					target.EVENTS_DIALOG.eventDay.setValue(eventDay);					
				} else if (eventType=="4") {
					// weekly event (therefore don't need the month or date, and yearly becomes week day)
					target.EVENTS_DIALOG.eventMonth.show(false);
					eventMonth=0;
					target.setVariable("event_month",eventMonth);
					target.EVENTS_DIALOG.eventDay.show(false);
					target.EVENTS_DIALOG.cardinalDay.show(false);
					eventDay=0;
					target.setVariable("event_day",eventDay);
					target.EVENTS_DIALOG.eventYearText.setValue(STR_WEEKDAY + ":");
					target.EVENTS_DIALOG.weekDay.show(true);
					if (currentTempEvent==tempEventsNum.length) {
						// new event
						if (weekBeginsWith=="Sun") {
							eventYear=selectionDay;
						} else {
							eventYear=selectionDay+1;
							if (selectionDay==8) selectionDay=1;
						}
					} else {
						eventYear=tempEvents[currentTempEvent][3];
					}
					if (eventYear>7) eventYear=1;
					target.setVariable("event_year",eventYear);
					if (eventYear==0) {
						target.EVENTS_DIALOG.weekDay.setValue("0");
					} else if (eventYear>=1 && eventYear<=7) {
						target.EVENTS_DIALOG.weekDay.setValue(wordDays[eventYear-1]);				
					}
				} else if (eventType=="5") {
					// floating event (therefore date becomes cardinal and yearly becomes week day)
					target.EVENTS_DIALOG.eventDayText.setValue(STR_CARDINAL + ":");
					target.EVENTS_DIALOG.eventYearText.setValue(STR_WEEKDAY + ":");
					target.EVENTS_DIALOG.weekDay.show(true);
					target.EVENTS_DIALOG.cardinalDay.show(true);
					target.EVENTS_DIALOG.eventMonth.show(true);
					target.EVENTS_DIALOG.eventDay.show(true);
					if (currentTempEvent==tempEventsNum.length) {
						// new event
						eventYear=1;
						eventDay=1;
					} else {
						eventYear=tempEvents[currentTempEvent][3];
						eventDay=tempEvents[currentTempEvent][2];
						if (eventDay>5) eventDay=1;
					}
					if (eventYear>7) eventYear=1;
					target.setVariable("event_year",eventYear);
					if (eventYear==0) {
						target.EVENTS_DIALOG.weekDay.setValue("0");
					} else if (eventYear>=1 && eventYear<=7) {
						target.EVENTS_DIALOG.weekDay.setValue(wordDays[eventYear-1]);				
					}
					target.setVariable("event_day",eventDay);
					target.EVENTS_DIALOG.eventDay.setValue(eventDay);					
					if (eventDay=="0") {
						target.EVENTS_DIALOG.cardinalDay.setValue("0");
					} else if (eventDay>="1" && eventDay<="5") {
						target.EVENTS_DIALOG.cardinalDay.setValue(cardinals[eventDay-1]);				
					}
				} else {
					target.EVENTS_DIALOG.eventDayText.setValue(STR_DATE + ":");
					target.EVENTS_DIALOG.eventYearText.setValue(STR_YEAR + ":");	
					target.EVENTS_DIALOG.weekDay.show(false);
					target.EVENTS_DIALOG.cardinalDay.show(false);
					target.EVENTS_DIALOG.eventMonth.show(true);
					target.EVENTS_DIALOG.eventDay.show(true);
					if (currentTempEvent==tempEventsNum.length) {
						// new event
						eventYear=selectionYear;
						eventDay=selectionDate;
						eventMonth=selectionMonth;
					} else {
						eventYear=tempEvents[currentTempEvent][3];
						eventDay=tempEvents[currentTempEvent][2];
						eventMonth=tempEvents[currentTempEvent][1];
					}
					if (eventYear<1900) eventYear=todaysYear; // if original event was a floating event
					target.setVariable("event_year",eventYear);
					target.EVENTS_DIALOG.eventYear.setValue(eventYear);
					if (eventDay==0) eventDay=1; // if original event was a floating event
					target.setVariable("event_day",eventDay);
					target.EVENTS_DIALOG.eventDay.setValue(eventDay);
					if (eventMonth==0) eventMonth=1; // if original event was a floating event
					target.setVariable("event_month",eventMonth);
					target.EVENTS_DIALOG.eventMonth.setValue(eventMonth);
				}
				break;
			}
			case "eventMonth" :
			{
				if ((eventType==3) || (eventType==4)) break;
				if (eventMonth<=maxEventMonth-step && eventMonth>0-step) {
					eventMonth = eventMonth+step;
				}
				target.setVariable("event_month",eventMonth);
				target.EVENTS_DIALOG.eventMonth.setValue(eventMonth);
				if ((eventMonth==1) || (eventMonth==3) || (eventMonth==5) || (eventMonth==7) || (eventMonth==8) || (eventMonth==10) || (eventMonth==12)) maxEventDay=31;
				if ((eventMonth==4) || (eventMonth==6) || (eventMonth==9) || (eventMonth==11)) maxEventDay=30;
				if (eventMonth==2) maxEventDay=28; //problem for leap years!
				if (eventDay>maxEventDay) {
					eventDay=maxEventDay;
					target.setVariable("event_day",eventDay);
					target.EVENTS_DIALOG.eventDay.setValue(eventDay);						
				}
				break;
			}
			case "eventDay" :
			{
				if (eventType==4) break;
				if (eventType==5) {
					if (eventDay<=5-step && eventDay>=0) {
						eventDay = eventDay+step;
						if (eventDay<1) eventDay=1;
					}
				}	else {			
					if (eventDay<=maxEventDay-step && eventDay>=0) {
						eventDay = eventDay+step;
						if (eventDay<1) eventDay=1;
					}
				}
				target.setVariable("event_day",eventDay);
				if (eventDay==0) {
					target.EVENTS_DIALOG.eventDay.setValue("0");
				} else {
					target.EVENTS_DIALOG.eventDay.setValue(eventDay);
				}
				if (eventType==5) {
					if (eventDay=="0") {
						target.EVENTS_DIALOG.cardinalDay.setValue("0");
					} else if (eventDay>="1" && eventDay<="5") {
						target.EVENTS_DIALOG.cardinalDay.setValue(cardinals[eventDay-1]);				
					}
				}
				break;
			}
			case "eventYear" :
			{
				if ((eventType==4) || (eventType==5)) {
					if (eventYear<=7-step && eventYear>=0) {
						eventYear = eventYear+step;
						if (eventYear<1) eventYear=1;
					}
				}	else {
					if (eventYear<=maxEventYear-step && eventYear>=1900) {
						eventYear = eventYear+step;
						if (eventYear<1900) eventYear=1900;
					}
				}
				target.setVariable("event_year",eventYear);
				if (eventYear==0) {
					target.EVENTS_DIALOG.eventYear.setValue("0");
				} else {
					target.EVENTS_DIALOG.eventYear.setValue(eventYear);
				}
				if ((eventType==4) || (eventType==5)) {
					if (eventYear==0) {
						target.EVENTS_DIALOG.weekDay.setValue("0");
					} else if (eventYear>=1 && eventYear<=7) {
						target.EVENTS_DIALOG.weekDay.setValue(wordDays[eventYear-1]);				
					}
				}
				break;
			}
			case "eventIcon" :
			{
				if (eventIcon<=maxEventIcon && eventIcon>=3) {
					eventIcon = eventIcon+step;
				}
				if (eventIcon<3) eventIcon=3;
				if (eventIcon>maxEventIcon) eventIcon=maxEventIcon;
				target.setVariable("event_icon",eventIcon);
				this.square42.u=eventIcon;
				break;
			}
	    }
		return;
	};
	
	target.ntHandleEventsDlg = function () {
		var eventType;
		// work out direction of movement and check if item is available
		eventType = parseInt(target.getVariable("event_type"));
		if ((eventType=="3") && (custSel==3)) {
			// no month item
			if (prevSel==2) custSel=4;
			if (prevSel==4) custSel=2;
		}
		if ((eventType=="4") && ((custSel==4) || (custSel==3))) {
			// no month or date item
			if (prevSel==2) custSel=5;
			if (prevSel==5) custSel=2;
		}
		if (custSel==1) {
			if (currentTempEvent==tempEventsNum.length) {
				// new event, so skip delete button
				if (prevSel==0) custSel=2;
				if (prevSel==2) custSel=0;
			}
		}
		if (custSel == 0) {
			target.EVENTS_DIALOG.eventNum.enable(true);
			target.EVENTS_DIALOG.eventTypeText.enable(false);
			mouseLeave.call(target.EVENTS_DIALOG.btn_Delete);
			mouseLeave.call(target.EVENTS_DIALOG.btn_Ok);
			mouseLeave.call(target.EVENTS_DIALOG.btn_Cancel);
		}
		if (custSel == 1) {
			target.EVENTS_DIALOG.eventNum.enable(false);
			target.EVENTS_DIALOG.eventTypeText.enable(false);
			mouseEnter.call(target.EVENTS_DIALOG.btn_Delete);
		}
		if (custSel == 2) {
			target.EVENTS_DIALOG.eventNum.enable(false); 
			target.EVENTS_DIALOG.eventTypeText.enable(true);
			target.EVENTS_DIALOG.eventMonth.enable(false);
			target.EVENTS_DIALOG.eventDay.enable(false);
			target.EVENTS_DIALOG.cardinalDay.enable(false);
			target.EVENTS_DIALOG.eventYear.enable(false);
			target.EVENTS_DIALOG.weekDay.enable(false);
			mouseLeave.call(target.EVENTS_DIALOG.btn_Delete);
		}
		if (custSel == 3) {
			target.EVENTS_DIALOG.eventTypeText.enable(false);
			target.EVENTS_DIALOG.eventMonth.enable(true);
			target.EVENTS_DIALOG.eventDay.enable(false);
			target.EVENTS_DIALOG.cardinalDay.enable(false);
		}
		if (custSel == 4) {
			target.EVENTS_DIALOG.eventTypeText.enable(false);
			target.EVENTS_DIALOG.eventMonth.enable(false);
			target.EVENTS_DIALOG.eventDay.enable(true);
			target.EVENTS_DIALOG.cardinalDay.enable(true);
			target.EVENTS_DIALOG.eventYear.enable(false);
			target.EVENTS_DIALOG.weekDay.enable(false);
		}
		if (custSel == 5) {
			target.EVENTS_DIALOG.eventTypeText.enable(false);
			target.EVENTS_DIALOG.eventMonth.enable(false);
			target.EVENTS_DIALOG.eventDay.enable(false);
			target.EVENTS_DIALOG.cardinalDay.enable(false);
			target.EVENTS_DIALOG.eventYear.enable(true);
			target.EVENTS_DIALOG.weekDay.enable(true);
			target.EVENTS_DIALOG.eventIcon.enable(false);
		}
		if (custSel == 6) {
			target.EVENTS_DIALOG.eventYear.enable(false);
			target.EVENTS_DIALOG.weekDay.enable(false);
			target.EVENTS_DIALOG.eventIcon.enable(true);
			mouseLeave.call(target.EVENTS_DIALOG.key01);
			mouseLeave.call(target.EVENTS_DIALOG.key02);
			mouseLeave.call(target.EVENTS_DIALOG.key03);
			mouseLeave.call(target.EVENTS_DIALOG.key04);
			mouseLeave.call(target.EVENTS_DIALOG.key05);
			mouseLeave.call(target.EVENTS_DIALOG.key06);
			mouseLeave.call(target.EVENTS_DIALOG.key07);
			mouseLeave.call(target.EVENTS_DIALOG.key08);
			mouseLeave.call(target.EVENTS_DIALOG.key09);
			mouseLeave.call(target.EVENTS_DIALOG.key10);
		}
		if (custSel == 7) {
			mouseEnter.call(target.EVENTS_DIALOG.key01);
			mouseLeave.call(target.EVENTS_DIALOG.key02);
			mouseLeave.call(target.EVENTS_DIALOG.key11);
		}
		if (custSel == 8) {
			mouseLeave.call(target.EVENTS_DIALOG.key01);
			mouseEnter.call(target.EVENTS_DIALOG.key02);
			mouseLeave.call(target.EVENTS_DIALOG.key03);
			mouseLeave.call(target.EVENTS_DIALOG.key12);
		}
		if (custSel == 9) {
			mouseLeave.call(target.EVENTS_DIALOG.key02);
			mouseEnter.call(target.EVENTS_DIALOG.key03);
			mouseLeave.call(target.EVENTS_DIALOG.key04);
			mouseLeave.call(target.EVENTS_DIALOG.key13);
		}
		if (custSel == 10) {
			mouseLeave.call(target.EVENTS_DIALOG.key03);
			mouseEnter.call(target.EVENTS_DIALOG.key04);
			mouseLeave.call(target.EVENTS_DIALOG.key05);
			mouseLeave.call(target.EVENTS_DIALOG.key14);
		}
		if (custSel == 11) {
			target.EVENTS_DIALOG.eventNum.enable(false);
			target.EVENTS_DIALOG.eventTypeText.enable(false);
			target.EVENTS_DIALOG.eventMonth.enable(false);
			target.EVENTS_DIALOG.eventDay.enable(false);
			target.EVENTS_DIALOG.cardinalDay.enable(false);
			target.EVENTS_DIALOG.eventYear.enable(false);
			target.EVENTS_DIALOG.weekDay.enable(false);
			target.EVENTS_DIALOG.eventIcon.enable(false);
			target.EVENTS_DIALOG.eventDescription.enable(false);
			mouseLeave.call(target.EVENTS_DIALOG.key04);
			mouseEnter.call(target.EVENTS_DIALOG.key05);
			mouseLeave.call(target.EVENTS_DIALOG.key06);
			mouseLeave.call(target.EVENTS_DIALOG.key15);
		}
		if (custSel == 12) {
			mouseLeave.call(target.EVENTS_DIALOG.key05);
			mouseEnter.call(target.EVENTS_DIALOG.key06);
			mouseLeave.call(target.EVENTS_DIALOG.key07);
			mouseLeave.call(target.EVENTS_DIALOG.key16);
		}
		if (custSel == 13) {
			mouseLeave.call(target.EVENTS_DIALOG.key06);
			mouseEnter.call(target.EVENTS_DIALOG.key07);
			mouseLeave.call(target.EVENTS_DIALOG.key08);
			mouseLeave.call(target.EVENTS_DIALOG.key17);
		}
		if (custSel == 14) {
			mouseLeave.call(target.EVENTS_DIALOG.key07);
			mouseEnter.call(target.EVENTS_DIALOG.key08);
			mouseLeave.call(target.EVENTS_DIALOG.key09);
			mouseLeave.call(target.EVENTS_DIALOG.key18);
		}
		if (custSel == 15) {
			mouseLeave.call(target.EVENTS_DIALOG.key08);
			mouseEnter.call(target.EVENTS_DIALOG.key09);
			mouseLeave.call(target.EVENTS_DIALOG.key10);
			mouseLeave.call(target.EVENTS_DIALOG.key19);
		}
		if (custSel == 16) {
			mouseLeave.call(target.EVENTS_DIALOG.key09);
			mouseEnter.call(target.EVENTS_DIALOG.key10);
		}
		if (custSel == 17) {
			mouseLeave.call(target.EVENTS_DIALOG.key01);
			mouseEnter.call(target.EVENTS_DIALOG.key11);
			mouseLeave.call(target.EVENTS_DIALOG.key12);
			mouseLeave.call(target.EVENTS_DIALOG.SHIFT);
		}
		if (custSel == 18) {
			mouseLeave.call(target.EVENTS_DIALOG.key02);
			mouseLeave.call(target.EVENTS_DIALOG.key11);
			mouseEnter.call(target.EVENTS_DIALOG.key12);
			mouseLeave.call(target.EVENTS_DIALOG.key13);
			mouseLeave.call(target.EVENTS_DIALOG.key20);
		}
		if (custSel == 19) {
			mouseLeave.call(target.EVENTS_DIALOG.key03);
			mouseLeave.call(target.EVENTS_DIALOG.key12);
			mouseEnter.call(target.EVENTS_DIALOG.key13);
			mouseLeave.call(target.EVENTS_DIALOG.key14);
			mouseLeave.call(target.EVENTS_DIALOG.key21);
		}
		if (custSel == 20) {
			mouseLeave.call(target.EVENTS_DIALOG.key04);
			mouseLeave.call(target.EVENTS_DIALOG.key13);
			mouseEnter.call(target.EVENTS_DIALOG.key14);
			mouseLeave.call(target.EVENTS_DIALOG.key15);
			mouseLeave.call(target.EVENTS_DIALOG.key22);
		}
		if (custSel == 21) {
			mouseLeave.call(target.EVENTS_DIALOG.key05);
			mouseLeave.call(target.EVENTS_DIALOG.key14);
			mouseEnter.call(target.EVENTS_DIALOG.key15);
			mouseLeave.call(target.EVENTS_DIALOG.key16);
			mouseLeave.call(target.EVENTS_DIALOG.key23);
		}
		if (custSel == 22) {
			mouseLeave.call(target.EVENTS_DIALOG.key06);
			mouseLeave.call(target.EVENTS_DIALOG.key15);
			mouseEnter.call(target.EVENTS_DIALOG.key16);
			mouseLeave.call(target.EVENTS_DIALOG.key17);
			mouseLeave.call(target.EVENTS_DIALOG.key24);
		}
		if (custSel == 23) {
			mouseLeave.call(target.EVENTS_DIALOG.key07);
			mouseLeave.call(target.EVENTS_DIALOG.key16);
			mouseEnter.call(target.EVENTS_DIALOG.key17);
			mouseLeave.call(target.EVENTS_DIALOG.key18);
			mouseLeave.call(target.EVENTS_DIALOG.key25);
		}
		if (custSel == 24) {
			mouseLeave.call(target.EVENTS_DIALOG.key08);
			mouseLeave.call(target.EVENTS_DIALOG.key17);
			mouseEnter.call(target.EVENTS_DIALOG.key18);
			mouseLeave.call(target.EVENTS_DIALOG.key19);
			mouseLeave.call(target.EVENTS_DIALOG.key26);
		}
		if (custSel == 25) {
			mouseLeave.call(target.EVENTS_DIALOG.key09);
			mouseLeave.call(target.EVENTS_DIALOG.key10);
			mouseLeave.call(target.EVENTS_DIALOG.key18);
			mouseEnter.call(target.EVENTS_DIALOG.key19);
		}
		if (custSel == 26) {
			mouseLeave.call(target.EVENTS_DIALOG.key11);
			mouseLeave.call(target.EVENTS_DIALOG.key20);
			mouseEnter.call(target.EVENTS_DIALOG.SHIFT);
			mouseLeave.call(target.EVENTS_DIALOG.SYMBOL);
		}
		if (custSel == 27) {
			mouseLeave.call(target.EVENTS_DIALOG.key12);
			mouseLeave.call(target.EVENTS_DIALOG.SHIFT);
			mouseEnter.call(target.EVENTS_DIALOG.key20);
			mouseLeave.call(target.EVENTS_DIALOG.key21);
			mouseLeave.call(target.EVENTS_DIALOG.SYMBOL);
		}
		if (custSel == 28) {
			mouseLeave.call(target.EVENTS_DIALOG.key13);
			mouseLeave.call(target.EVENTS_DIALOG.key20);
			mouseEnter.call(target.EVENTS_DIALOG.key21);
			mouseLeave.call(target.EVENTS_DIALOG.key22);
			mouseLeave.call(target.EVENTS_DIALOG.SPACE);
		}
		if (custSel == 29) {
			mouseLeave.call(target.EVENTS_DIALOG.key14);
			mouseLeave.call(target.EVENTS_DIALOG.key21);
			mouseEnter.call(target.EVENTS_DIALOG.key22);
			mouseLeave.call(target.EVENTS_DIALOG.key23);
			mouseLeave.call(target.EVENTS_DIALOG.SPACE);
		}
		if (custSel == 30) {
			mouseLeave.call(target.EVENTS_DIALOG.key15);
			mouseLeave.call(target.EVENTS_DIALOG.key22);
			mouseEnter.call(target.EVENTS_DIALOG.key23);
			mouseLeave.call(target.EVENTS_DIALOG.key24);
			mouseLeave.call(target.EVENTS_DIALOG.SPACE);
		}
		if (custSel == 31) {
			mouseLeave.call(target.EVENTS_DIALOG.key16);
			mouseLeave.call(target.EVENTS_DIALOG.key23);
			mouseEnter.call(target.EVENTS_DIALOG.key24);
			mouseLeave.call(target.EVENTS_DIALOG.key25);
			mouseLeave.call(target.EVENTS_DIALOG.SPACE);
		}
		if (custSel == 32) {
			mouseLeave.call(target.EVENTS_DIALOG.key17);
			mouseLeave.call(target.EVENTS_DIALOG.key24);
			mouseEnter.call(target.EVENTS_DIALOG.key25);
			mouseLeave.call(target.EVENTS_DIALOG.key26);
			mouseLeave.call(target.EVENTS_DIALOG.SPACE);
		}
		if (custSel == 33) {
			mouseLeave.call(target.EVENTS_DIALOG.key18);
			mouseLeave.call(target.EVENTS_DIALOG.key19);
			mouseLeave.call(target.EVENTS_DIALOG.key25);
			mouseEnter.call(target.EVENTS_DIALOG.key26);
			mouseLeave.call(target.EVENTS_DIALOG.BACK);
		}
		if (custSel == 34) {
			mouseLeave.call(target.EVENTS_DIALOG.SHIFT);
			mouseLeave.call(target.EVENTS_DIALOG.key20);
			mouseLeave.call(target.EVENTS_DIALOG.SPACE);
			mouseEnter.call(target.EVENTS_DIALOG.SYMBOL);
		}
		if (custSel == 35) {
			mouseLeave.call(target.EVENTS_DIALOG.key21);
			mouseLeave.call(target.EVENTS_DIALOG.key22);
			mouseLeave.call(target.EVENTS_DIALOG.key23);
			mouseLeave.call(target.EVENTS_DIALOG.key24);
			mouseLeave.call(target.EVENTS_DIALOG.key25);
			mouseEnter.call(target.EVENTS_DIALOG.SPACE);
			mouseLeave.call(target.EVENTS_DIALOG.SYMBOL);
			mouseLeave.call(target.EVENTS_DIALOG.BACK);
			mouseLeave.call(target.EVENTS_DIALOG.btn_Ok);
		}	
		if (custSel == 36) {
			mouseLeave.call(target.EVENTS_DIALOG.key26);
			mouseLeave.call(target.EVENTS_DIALOG.SPACE);
			mouseLeave.call(target.EVENTS_DIALOG.btn_Cancel);
			mouseEnter.call(target.EVENTS_DIALOG.BACK);
		}
		if (custSel == 37) {
			mouseLeave.call(target.EVENTS_DIALOG.SHIFT);
			mouseLeave.call(target.EVENTS_DIALOG.SPACE);
			mouseLeave.call(target.EVENTS_DIALOG.btn_Cancel);
			mouseEnter.call(target.EVENTS_DIALOG.btn_Ok);
		}	
		if (custSel == 38) {
			mouseLeave.call(target.EVENTS_DIALOG.BACK);
			mouseLeave.call(target.EVENTS_DIALOG.btn_Ok);
			mouseEnter.call(target.EVENTS_DIALOG.btn_Cancel);
		}
		return;
	};

	target.EVENTS_DIALOG.moveCursor = function (direction) {
		switch (direction) {
			case "up" : {
				if ((custSel>0) && (custSel<7)) {
					prevSel=custSel;
					custSel--;
					target.ntHandleEventsDlg();
				} else if ((custSel>6) && (custSel<17)) {
					prevSel=custSel;
					custSel=6;
					target.ntHandleEventsDlg();
				} else if ((custSel>16) && (custSel<26)) {
					prevSel=custSel;
					custSel=custSel-10;
					target.ntHandleEventsDlg();
				} else if (custSel==26) {
					prevSel=custSel;
					custSel=17;
					target.ntHandleEventsDlg();				
				} else if ((custSel>26) && (custSel<34)) {
					prevSel=custSel;
					custSel=custSel-9;
					target.ntHandleEventsDlg();
				} else if (custSel==34) {
					prevSel=custSel;
					custSel=26;
					target.ntHandleEventsDlg();				
				} else if (custSel==35) {
					prevSel=custSel;
					custSel=30;
					target.ntHandleEventsDlg();				
				} else if (custSel==36) {
					prevSel=custSel;
					custSel=33;
					target.ntHandleEventsDlg();				
				} else if (custSel==37) {
					prevSel=custSel;
					custSel=35;
					target.ntHandleEventsDlg();				
				} else if (custSel==38) {
					prevSel=custSel;
					custSel=36;
					target.ntHandleEventsDlg();				
				}
				break
			}
			case "down" : {
				if (custSel<6) {
					prevSel=custSel;
					custSel++;
					target.ntHandleEventsDlg();
				} else if (custSel==6) {
					prevSel=custSel;
					custSel=11;
					target.ntHandleEventsDlg();
				} else if ((custSel>6) && (custSel<16)) {
					prevSel=custSel;
					custSel=custSel+10;
					target.ntHandleEventsDlg();
				} else if (custSel==16) {
					prevSel=custSel;
					custSel=25;
					target.ntHandleEventsDlg();
				} else if ((custSel>16) && (custSel<24)) {
					prevSel=custSel;
					custSel=custSel+9;
					target.ntHandleEventsDlg();			
				} else if ((custSel==24) || (custSel==25)) {
					prevSel=custSel;
					custSel=33;
					target.ntHandleEventsDlg();			
				} else if ((custSel==26) || (custSel==27)) {
					prevSel=custSel;
					custSel=34;
					target.ntHandleEventsDlg();			
				} else if ((custSel>27) && (custSel<33)) {
					prevSel=custSel;
					custSel=35;
					target.ntHandleEventsDlg();			
				} else if (custSel==33) {
					prevSel=custSel;
					custSel=36;
					target.ntHandleEventsDlg();			
				} else if ((custSel==34) || (custSel==35)) {
					prevSel=custSel;
					custSel=37;
					target.ntHandleEventsDlg();			
				} else if (custSel==36) {
					prevSel=custSel;
					custSel=38;
					target.ntHandleEventsDlg();			
				}
				break
			}
			case "left" : {
				if (custSel==0) {
					target.EVENTS_DIALOG.doPlusMinusF("eventNum-");
				} else if (custSel==2) {
					target.EVENTS_DIALOG.doPlusMinusF("eventType-");
				} else if (custSel==3) {
					target.EVENTS_DIALOG.doPlusMinusF("eventMonth-");
				} else if (custSel==4) {
					target.EVENTS_DIALOG.doPlusMinusF("eventDay-");
				} else if (custSel==5) {
					target.EVENTS_DIALOG.doPlusMinusF("eventYear-");
				} else if (custSel==6) {
					target.EVENTS_DIALOG.doPlusMinusF("eventIcon-");
				} else if ((custSel>7) && (custSel<17)) {
					prevSel=custSel;
					custSel--;
					target.ntHandleEventsDlg();	
				} else if ((custSel>17) && (custSel<26)) {
					prevSel=custSel;
					custSel--;
					target.ntHandleEventsDlg();	
				} else if ((custSel>26) && (custSel<34)) {
					prevSel=custSel;
					custSel--;
					target.ntHandleEventsDlg();	
				} else if ((custSel==35) || (custSel==36)) {
					prevSel=custSel;
					custSel--;
					target.ntHandleEventsDlg();	
				} else if (custSel==38) {
					prevSel=custSel;
					custSel--;
					target.ntHandleEventsDlg();	
				}
				break
			}		
			case "right" : {
				if (custSel==0) {
					target.EVENTS_DIALOG.doPlusMinusF("eventNum+");
				} else if (custSel==2) {
					target.EVENTS_DIALOG.doPlusMinusF("eventType+");
				} else if (custSel==3) {
					target.EVENTS_DIALOG.doPlusMinusF("eventMonth+");
				} else if (custSel==4) {
					target.EVENTS_DIALOG.doPlusMinusF("eventDay+");
				} else if (custSel==5) {
					target.EVENTS_DIALOG.doPlusMinusF("eventYear+");
				} else if (custSel==6) {
					target.EVENTS_DIALOG.doPlusMinusF("eventIcon+");
				} else if ((custSel>6) && (custSel<16)) {
					prevSel=custSel;
					custSel++;
					target.ntHandleEventsDlg();	
				} else if ((custSel>16) && (custSel<25)) {
					prevSel=custSel;
					custSel++;
					target.ntHandleEventsDlg();	
				} else if ((custSel>25) && (custSel<33)) {
					prevSel=custSel;
					custSel++;
					target.ntHandleEventsDlg();	
				} else if ((custSel==34) || (custSel==35)) {
					prevSel=custSel;
					custSel++;
					target.ntHandleEventsDlg();	
				} else if (custSel==37) {
					prevSel=custSel;
					custSel++;
					target.ntHandleEventsDlg();	
				}
				break
			}
			return;
		}	
	};
	
	target.EVENTS_DIALOG.doCenterF = function () {
		if (custSel === 1) target.EVENTS_DIALOG.btn_Delete.click();
		if (custSel === 7) target.EVENTS_DIALOG.key01.click();
		if (custSel === 8) target.EVENTS_DIALOG.key02.click();
		if (custSel === 9) target.EVENTS_DIALOG.key03.click();
		if (custSel === 10) target.EVENTS_DIALOG.key04.click();
		if (custSel === 11) target.EVENTS_DIALOG.key05.click();
		if (custSel === 12) target.EVENTS_DIALOG.key06.click();
		if (custSel === 13) target.EVENTS_DIALOG.key07.click();
		if (custSel === 14) target.EVENTS_DIALOG.key08.click();
		if (custSel === 15) target.EVENTS_DIALOG.key09.click();
		if (custSel === 16) target.EVENTS_DIALOG.key10.click();
		if (custSel === 17) target.EVENTS_DIALOG.key11.click();
		if (custSel === 18) target.EVENTS_DIALOG.key12.click();
		if (custSel === 19) target.EVENTS_DIALOG.key13.click();
		if (custSel === 20) target.EVENTS_DIALOG.key14.click();
		if (custSel === 21) target.EVENTS_DIALOG.key15.click();
		if (custSel === 22) target.EVENTS_DIALOG.key16.click();
		if (custSel === 23) target.EVENTS_DIALOG.key17.click();
		if (custSel === 24) target.EVENTS_DIALOG.key18.click();
		if (custSel === 25) target.EVENTS_DIALOG.key19.click();
		if (custSel === 26) target.EVENTS_DIALOG.SHIFT.click();
		if (custSel === 27) target.EVENTS_DIALOG.key20.click();
		if (custSel === 28) target.EVENTS_DIALOG.key21.click();
		if (custSel === 29) target.EVENTS_DIALOG.key22.click();
		if (custSel === 30) target.EVENTS_DIALOG.key23.click();
		if (custSel === 31) target.EVENTS_DIALOG.key24.click();
		if (custSel === 32) target.EVENTS_DIALOG.key25.click();
		if (custSel === 33) target.EVENTS_DIALOG.key26.click();
		if (custSel === 34) target.EVENTS_DIALOG.SYMBOL.click();
		if (custSel === 35) target.EVENTS_DIALOG.SPACE.click();
		if (custSel === 36) target.EVENTS_DIALOG.BACK.click();
		if (custSel === 37) target.EVENTS_DIALOG.btn_Ok.click();
		if (custSel === 38) target.EVENTS_DIALOG.btn_Cancel.click();
		return;
	};

	target.doUpdateEvent = function () {
		var eventNum, eventType, eventTypeCode, eventMonth, eventDay, eventYear, eventDescription, eventIcon;
		eventsDlgOpen = false;
		
		// create new array item from stored variables
		eventType = parseInt(target.getVariable("event_type"));
		if (eventType=="1") eventTypeCode="";
		if (eventType=="2") eventTypeCode="Y";
		if (eventType=="3") eventTypeCode="M";
		if (eventType=="4") eventTypeCode="W";
		if (eventType=="5") eventTypeCode="F";
		eventMonth = target.getVariable("event_month");
		eventDay = target.getVariable("event_day");
		eventYear = target.getVariable("event_year");
		eventIcon = target.getVariable("event_icon");
		eventDescription = target.getVariable("event_description");
		
		if (currentTempEvent==tempEventsNum.length) {
			// new event
			//target.bubble("tracelog","Add event");
			var addTo=[eventTypeCode, eventMonth, eventDay, eventYear, eventIcon, eventDescription];
			events.push(addTo);
		} else {
			//target.bubble("tracelog","Update event "+tempEventsNum[currentTempEvent]);
			var replaceWith=[eventTypeCode, eventMonth, eventDay, eventYear, eventIcon, eventDescription];
			events.splice(tempEventsNum[currentTempEvent],1,replaceWith);
		}

		this.dateChanged();
		target.BUTTON_EDT.enable(true);
		return;
	};

	target.doDeleteEvent = function () {
		//target.bubble("tracelog","Delete event "+tempEventsNum[currentTempEvent]);
		eventsDlgOpen = false;
		events.splice(tempEventsNum[currentTempEvent], 1);
		
		// reset the temporary array
		if (tempEvents.length>0) {
			tempEvents.length=0;
			tempEventsNum.length=0;
		}
		
		this.createCalendar();
		target.BUTTON_EDT.enable(true);		
		if (this.checkevents(selectionDate,monthNum,yearNum,y,x)>0) {
			this.showevents(selectionDate,monthNum,yearNum,y,x,0);
		} else {
			this.eventsText.setValue("");
		}
		return;
	};
	
	target.refreshKeys = function () {
		var i,n,key;
		n = -1;
		if (shifted) {
			n = n + shiftOffset;
			setSoValue(target.EVENTS_DIALOG.SHIFT, 'text', strUnShift);
		} else {
			setSoValue(target.EVENTS_DIALOG.SHIFT, 'text', strShift);
		}
		if (symbols) {
			n = n + symbolsOffset;
			setSoValue(target.EVENTS_DIALOG['SYMBOL'], 'text', STR_LETTERS);
		} else {
			setSoValue(target.EVENTS_DIALOG['SYMBOL'], 'text', STR_SYMBOLS);
		}
		for (i=1; i<=26; i++) {
			key = 'key'+twoDigits(i);
			setSoValue(target.EVENTS_DIALOG[key], 'text', keys[n+i]);
			mouseEnter.call(target.EVENTS_DIALOG[key]);
			mouseLeave.call(target.EVENTS_DIALOG[key]);
		}	
	};

	target.doSpace = function () {
		// ADD A SPACE
		var eventDescription = target.getVariable("event_description");
		eventDescription = eventDescription + " ";
		target.EVENTS_DIALOG.eventDescription.setValue(eventDescription);
		target.setVariable("event_description",eventDescription);
	};

	target.doSymbol = function () {
		symbols = !symbols;
		this.refreshKeys();
	};

	target.doShift = function () {
		shifted = !shifted;
		this.refreshKeys();
	};
	
	target.doBack = function () {
		// BACKSPACE
		var eventDescription = target.getVariable("event_description");
		eventDescription = eventDescription.slice(0,eventDescription.length-1);
		target.EVENTS_DIALOG.eventDescription.setValue(eventDescription);
		target.setVariable("event_description",eventDescription);
	};
	
	target.doKeyPress = function (sender) {
		var id = getSoValue(sender, "id");
		this.addCharacter(id);
		return;
	};
	
	target.addCharacter = function (id) {
		var n = parseInt(id.substring(3, 5));
		//target.bubble("tracelog","id="+id+", n="+n);
		if (symbols) { n = n + symbolsOffset };
		if (shifted) { n = n + shiftOffset };
		var character = keys[n-1];
		//target.bubble("tracelog","n="+n+", character="+character);
		var eventDescription = target.getVariable("event_description");
		eventDescription = eventDescription + character;
		target.EVENTS_DIALOG.eventDescription.setValue(eventDescription);
		target.setVariable("event_description",eventDescription);		
	};
};
tmp();
tmp = undefined;