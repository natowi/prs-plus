//
// Calendar for Sony Reader (600/x50)
// by Ben Chenoweth
// (utilises code taken from JavaScript Calendar featured on and available at JavaScript Kit: http://www.javascriptkit.com)
//
// Initial version: 2011-07-14
// Latest update:
// 2011-11-03 Ben Chenoweth - Fixed floating events not appearing in event popup; fixed easter icon; fixed floating event day info in data file.

var tmp = function () {
	var L = kbook.autoRunRoot.L;
	var wordMonth = new Array(L("MONTH_JANUARY"),L("MONTH_FEBRUARY"),L("MONTH_MARCH"),L("MONTH_APRIL"),L("MONTH_MAY"),L("MONTH_JUNE"),L("MONTH_JULY"),L("MONTH_AUGUST"),L("MONTH_SEPTEMBER"),L("MONTH_OCTOBER"),L("MONTH_NOVEMBER"),L("MONTH_DECEMBER"));
	var wordDays = new Array(L("ABBRV_SUNDAY"),L("ABBRV_MONDAY"),L("ABBRV_TUESDAY"),L("ABBRV_WEDNESDAY"),L("ABBRV_THURSDAY"),L("ABBRV_FRIDAY"),L("ABBRV_SATURDAY"));
	var cardinals = new Array(L("CARDINAL_ONE"), L("CARDINAL_TWO"), L("CARDINAL_THREE"), L("CARDINAL_FOUR"), L("CARDINAL_FIVE"));
	var STR_MONTH = L("STR_MONTH");
	var STR_YEAR = L("STR_YEAR");
	var STR_QUIT = L("STR_QUIT");
	var STR_OK = L("STR_OK");
	var STR_CANCEL = L("STR_CANCEL");
	var STR_DELETE = L("STR_DELETE");
	var STR_ONE_OFF = L("STR_ONE_OFF");
	var STR_YEARLY = L("STR_YEARLY");
	var STR_MONTHLY = L("STR_MONTHLY");
	var STR_WEEKLY = L("STR_WEEKLY");
	var STR_FLOATING = L("STR_FLOATING");
	var STR_DATE = L("STR_DATE");
	var STR_CARDINAL = L("STR_CARDINAL");
	var STR_WEEKDAY = L("STR_WEEKDAY");
	var STR_SYMBOLS = L("STR_SYMBOLS");
	var STR_LETTERS = L("STR_LETTERS");
	
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
	var calendarString = "";
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
	var shiftOffset = 38;
	var symbols = false;
	var symbolsOffset = 76;
	var keys = [];
	var kbdPath = target.calendarRoot;
	FileSystem.ensureDirectory(kbdPath);
	var customKbdPath = datPath0 + 'custom.kbd';
	var currentKbd = 1;
	var currentNumEvents = 0;
	var currentOffset = 0;
	var offsetDifference = 6; // 600, 350, 650 (950: offsetDifference=15)
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
		WeekBeginsWith : "Sun",
		CurrentKeyboard : "Western"
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
	}         

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
    } 

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
	}

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
		keys[10]=",";
		keys[11]="7";
		keys[12]="8";
		keys[13]="9";
		keys[14]="a";
		keys[15]="s";
		keys[16]="d";
		keys[17]="f";
		keys[18]="g";
		keys[19]="h";
		keys[20]="j";
		keys[21]="k";
		keys[22]="l";
		keys[23]=".";
		keys[24]="4";
		keys[25]="5";
		keys[26]="6";
		keys[27]="z";
		keys[28]="x";
		keys[29]="c";
		keys[30]="v";
		keys[31]="b";
		keys[32]="n";
		keys[33]="m";
		keys[34]="0";
		keys[35]="1";
		keys[36]="2";
		keys[37]="3";
		keys[38]="Q";
		keys[39]="W";
		keys[40]="E";
		keys[41]="R";
		keys[42]="T";
		keys[43]="Y";
		keys[44]="U";
		keys[45]="I";
		keys[46]="O";
		keys[47]="P";
		keys[48]=";";
		keys[49]="&";
		keys[50]="*";
		keys[51]="(";
		keys[52]="A";
		keys[53]="S";
		keys[54]="D";
		keys[55]="F";
		keys[56]="G";
		keys[57]="H";
		keys[58]="J";
		keys[59]="K";
		keys[60]="L";
		keys[61]=":";
		keys[62]="$";
		keys[63]="%";
		keys[64]="^";
		keys[65]="Z";
		keys[66]="X";
		keys[67]="C";
		keys[68]="V";
		keys[69]="B";
		keys[70]="N";
		keys[71]="M";
		keys[72]=")";
		keys[73]="!";
		keys[74]="@";
		keys[75]="#";
		keys[76]="1";
		keys[77]="2";
		keys[78]="3";
		keys[79]="4";
		keys[80]="5";
		keys[81]="6";
		keys[82]="7";
		keys[83]="8";
		keys[84]="9";
		keys[85]="0";
		keys[86]="";
		keys[87]="";
		keys[88]="";
		keys[89]="";
		keys[90]="%";
		keys[91]="&";
		keys[92]="*";
		keys[93]="(";
		keys[94]=")";
		keys[95]="_";
		keys[96]="+";
		keys[97]=";";
		keys[98]=":";
		keys[99]="";
		keys[100]="";
		keys[101]="";
		keys[102]="";
		keys[103]="!";
		keys[104]="?";
		keys[105]="\"";
		keys[106]="\'";
		keys[107]=",";
		keys[108]=".";
		keys[109]="/";
		keys[110]="";
		keys[111]="";
		keys[112]="";
		keys[113]="";
		keys[114]="~";
		keys[115]="@";
		keys[116]="#";
		keys[117]="$";
		keys[118]="^";
		keys[119]="-";
		keys[120]="`";
		keys[121]="=";
		keys[122]="{";
		keys[123]="}";
		keys[124]="";
		keys[125]="";
		keys[126]="";
		keys[127]="";
		keys[128]="\u00AC";
		keys[129]="\u00A3";
		keys[130]="\u20AC";
		keys[131]="\u00A7";
		keys[132]="\u00A6";
		keys[133]="[";
		keys[134]="]";
		keys[135]="|";
		keys[136]="\\";
		keys[137]="";
		keys[138]="";
		keys[139]="";
		keys[140]="";
		keys[141]="\u00B2";
		keys[142]="\u00B0";
		keys[143]="\u00B5";
		keys[144]="\u00AB";
		keys[145]="\u00BB";
		keys[146]="<";
		keys[147]=">";
		keys[148]="";
		keys[149]="";
		keys[150]="";
		keys[151]="";
		return;
	}

	target.saveCustomKeyboard = function () {
		var o, stream;
      	try {
      		if (FileSystem.getFileInfo(customKbdPath)) FileSystem.deleteFile(customKbdPath);
      		stream = new Stream.File(customKbdPath, 1);
      		for (o=0; o<=151; o++) {
      			stream.writeLine(keys[o]);
      		}
      		stream.close();
      	} catch (e) { }   
		return;
	}
	
	// load keyboard from file
	target.loadKeyboard = function (filename) {
		var i,j;
		// attempt to load keyboard from file
		if (FileSystem.getFileInfo(filename)) {
			// read whole file in first to count how many events there are
			var tempfile = getFileContent(filename,'keyboard missing');
			if (tempfile!='keyboard missing') {
				keys = tempfile.split("\r\n");	// CR LF is used by stream.writeLine()
			} else {
				// fallback
				this.loadWesternKeys();
			}
		} else {
			// fallback
			this.loadWesternKeys();
		}
		
		// put keys on buttons
		for (i=1; i<=10; i++) {
			setSoValue(target.EVENTS_DIALOG['key'+twoDigits(i)], 'text', keys[i-1]);
		}
		for (i=11; i<=14; i++) {
			j=i-10;
			setSoValue(target.EVENTS_DIALOG['keyA'+j], 'text', keys[i-1]);
		}
		for (i=15; i<=23; i++) {
			j=i-4;
			setSoValue(target.EVENTS_DIALOG['key'+j], 'text', keys[i-1]);
		}
		for (i=24; i<=27; i++) {
			j=i-23;
			setSoValue(target.EVENTS_DIALOG['keyB'+j], 'text', keys[i-1]);
		}
		for (i=28; i<=34; i++) {
			j=i-8;
			setSoValue(target.EVENTS_DIALOG['key'+j], 'text', keys[i-1]);
		}
		for (i=35; i<=38; i++) {
			j=i-34;
			setSoValue(target.EVENTS_DIALOG['keyC'+j], 'text', keys[i-1]);
		}
		return; 
	}
	
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
				events.push(["Y", "1", "1", "1900", "12", L("STR_NEWYEARSDAY")]);
				events.push(["Y", "2", "14", "1900", "6", L("STR_VALENTINESDAY")]);
				events.push(["F", "3", "0", "0", "14", L("STR_EASTERSUNDAY")]);
				events.push(["Y", "3", "17", "1900", "10", L("STR_STPATRICKSDAY")]);
				events.push(["F", "11", "4", "5", "11", L("STR_THANKSGIVING")]);
				events.push(["Y", "12", "25", "1900", "5", L("STR_CHRISTMAS")]);
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
			//this.gridCursor.changeLayout(0, 0, uD, 0, 0, uD);			
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
		//target.BUTTON_EDT.enable(false);
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
		setSoValue(target.BUTTON_TDY, 'text', L("STR_TODAY"));
		setSoValue(target.BUTTON_PYR, 'text', "-" + STR_YEAR);
		setSoValue(target.BUTTON_PMN, 'text', "-" + STR_MONTH);
		setSoValue(target.BUTTON_NMN, 'text', "+" + STR_MONTH);
		setSoValue(target.BUTTON_NYR, 'text', "+" + STR_YEAR);
		this.touchButtons0.setValue("-" + STR_MONTH);
		this.touchButtons1.setValue("+" + STR_MONTH);
		this.touchButtons3.setValue(L("STR_OPTIONS"));
		this.touchButtons4.setValue(L("STR_QUIT"));
		this.nonTouch1.setValue("[Mark] " + L("STR_TODAY"));
		this.nonTouch2.setValue("[Next] +" + STR_MONTH);
		this.nonTouch3.setValue("[Hold Next] +" + STR_YEAR);
		this.nonTouch4.setValue("[Hold 0] " + L("STR_QUIT"));
		this.nonTouch5.setValue("[Prev] -" + STR_MONTH);
		this.nonTouch6.setValue("[Hold Prev] -" + STR_YEAR);
		this.nonTouch7.setValue("[Menu] " + L("STR_OPTIONS"));
		this.nonTouch8.setValue("[Center] " + L("STR_EDIT_EVENTS"));
		setSoValue(target.BUTTON_EDT, 'text', L("STR_EDIT_EVENTS"));
		this.SETTINGS_DIALOG.CalSettings.setValue(L("STR_CALENDAR_SETTINGS"));
		setSoValue(target.SETTINGS_DIALOG.SUN, 'text', L("FULL_SUNDAY"));
		setSoValue(target.SETTINGS_DIALOG.MON, 'text', L("FULL_MONDAY"));
		setSoValue(target.SETTINGS_DIALOG.btn_Ok, 'text', STR_OK);
		setSoValue(target.SETTINGS_DIALOG.btn_Cancel, 'text', STR_CANCEL);
		this.EVENTS_DIALOG.CalEvents.setValue(L("STR_EVENTS"));
		this.EVENTS_DIALOG.ntEventSize.setValue("[Size] " + STR_OK);
		this.EVENTS_DIALOG.ntEventMark.setValue("[Mark] " + STR_CANCEL);
		this.EVENTS_DIALOG.fieldEvent.setValue(L("STR_EVENT") + ":");
		this.EVENTS_DIALOG.fieldType.setValue(L("STR_TYPE") + ":");
		this.EVENTS_DIALOG.fieldMonth.setValue(STR_MONTH + ":");
		this.EVENTS_DIALOG.eventDayText.setValue(STR_DATE + ":");
		this.EVENTS_DIALOG.eventYearText.setValue(STR_YEAR + ":");
		this.EVENTS_DIALOG.fieldDescription.setValue(L("STR_DESCRIPTION") + ":");
		setSoValue(target.EVENTS_DIALOG.SYMBOL, 'text', L("STR_SYMBOLS"));
		setSoValue(target.EVENTS_DIALOG.btn_Ok, 'text', STR_OK);
		setSoValue(target.EVENTS_DIALOG.btn_Cancel, 'text', STR_CANCEL);
		setSoValue(target.EVENTS_DIALOG.btn_Delete, 'text', STR_DELETE);

		// 950 can display more events in the event box
		if (kbook.autoRunRoot.model=="950") {
			offsetDifference=15;
		}
		
		// look for custom keyboard
		if (FileSystem.getFileInfo(customKbdPath)) {

		} else {
			this.loadWesternKeys();
			this.saveCustomKeyboard();			
		}
		
		// load keyboard
		if (target.settings.CurrentKeyboard=="Custom") {
			this.loadKeyboard(customKbdPath);			
			target.EVENTS_DIALOG.kbdSelect.setValue("Custom");
			currentKbd=10;
		} else if (target.settings.CurrentKeyboard=="Western") {
			this.loadKeyboard(kbdPath+"western.kbd");			
			target.EVENTS_DIALOG.kbdSelect.setValue("Western");
			currentKbd=1;
		}  else if (target.settings.CurrentKeyboard=="Russian") {
			this.loadKeyboard(kbdPath+"russian.kbd");			
			target.EVENTS_DIALOG.kbdSelect.setValue("Russian");
			currentKbd=2;
		}  else if (target.settings.CurrentKeyboard=="Georgian") {
			this.loadKeyboard(kbdPath+"georgian.kbd");			
			target.EVENTS_DIALOG.kbdSelect.setValue("Georgian");
			currentKbd=3;
		}
		
		this.selectToday();
		target.BUTTON_EDT.enable(true);
		return;
	}

	target.selectToday = function() {
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
		
		//place selection square
		this.gridCursor.changeLayout((x-1)*70+50, 70, uD, (y-1)*70+80, 70, uD);

		if (this.checkevents(selectionDate,monthNum,yearNum,y,x)>0) {
			// events in selection square
			this.showevents(selectionDate,monthNum,yearNum,y,x,0);
		} else {
			this.eventsText.setValue("");
		}
		return;
	}
	
	target.dateChanged = function() {
		if (monthNum == 0) {
			monthNum = 12;
			yearNum--;
		}
		else if (monthNum == 13) {
			monthNum = 1;
			yearNum++;
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
	}

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
	}

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
	}
	
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
	}

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
	}

	target.getevent = function (day,month,year,week,dayofweek) {
		var altdayofweek;
		
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
	}
	
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
		if (tempEvents.length > offset + offsetDifference) {
			target.BUTTON_DWN.enable(true);
			downenabled=true;
			this.nonTouch0.setValue('9: '+strDown);
		} else {
			target.BUTTON_DWN.enable(false);
			downenabled=false;
			this.nonTouch0.setValue('');
		}
		return;
	}

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
	}
	
	target.doButtonClick = function (sender) {
		var id;
		id = getSoValue(sender, "id");
		n = id.substring(7, 10);
		if (n == "TDY") {
			monthNum=todaysMonth;
			yearNum=todaysYear;
			this.gridCursor.changeLayout(0, 0, uD, 0, 0, uD);			
			this.dateChanged();
			selectionDate=todaysDate;
			this.selectToday();
			target.BUTTON_EDT.enable(true);
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
			currentOffset = currentOffset - offsetDifference;
			if (currentOffset < 0) { currentOffset=0; }
			this.showevents(selectionDate,monthNum,yearNum,y,x,currentOffset);
			return;
		}
		if (n == "DWN") {
			// scroll events textbox down
			var oldCurrentOffset = currentOffset;
			currentOffset = currentOffset + offsetDifference;
			if (currentOffset > currentNumEvents) { currentOffset=oldCurrentOffset; }
			this.showevents(selectionDate,monthNum,yearNum,y,x,currentOffset);
			return;
		}		
	}

	target.digitF = function (key) {
		return;
	}
	
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
	}
	
	target.doSelectClick = function (sender) {
		return;
	}

	target.doNext = function (sender) {
		// next month
		monthNum++;
		if (!hasNumericButtons) {
			this.gridCursor.changeLayout(0, 0, uD, 0, 0, uD);
		}
		this.dateChanged();	
		return;
	}

	target.doPrev = function (sender) {
		// previous month
		monthNum--;
		if (!hasNumericButtons) {
			this.gridCursor.changeLayout(0, 0, uD, 0, 0, uD);
		}		
		this.dateChanged();	
		return;
	}

	target.doSize = function (sender) {
		return;
	}

	target.doRoot = function (sender) {
		this.saveEvents();
		kbook.autoRunRoot.exitIf(kbook.model);
		return;
	}
	
	target.doHold0 = function () {
		this.saveEvents();
		kbook.autoRunRoot.exitIf(kbook.model);
		return;
	}

	target.saveEvents = function () {
		var event;
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
	}
	
	target.doLast = function () {
		// next year
		yearNum++;
		if (!hasNumericButtons) {
			this.gridCursor.changeLayout(0, 0, uD, 0, 0, uD);
		}		
		this.dateChanged();	
		return;
	}
	
	target.doFirst = function () {
		// last year
		yearNum--;
		if (!hasNumericButtons) {
			this.gridCursor.changeLayout(0, 0, uD, 0, 0, uD);
		}		
		this.dateChanged();	
		return;
	}

	target.doCenterF = function () {
		return;
	}
	
	target.moveCursor = function (dir) {
		return;
	}
	
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
	}
	
	target.doSize = function () {
		if (eventsDlgOpen) {
			target.EVENTS_DIALOG.btn_Ok.click();
		}
		return;
	}
	
	
	// Settings pop-up panel stuff
    target.doOption = function(sender) {
		target.SETTINGS_DIALOG.week_starts.setValue(L("STR_WEEK_STARTS_ON") + ":");
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
    }
	
	target.closeDlg = function () {
		settingsDlgOpen = false;
		eventsDlgOpen = false;
		return;
	}

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
	}
	
	target.SETTINGS_DIALOG.settingsType = function (t) {
		return;
	}
	
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
		
		eventsDlgOpen = true;
		target.EVENTS_DIALOG.show(true);
		return;
    }

	target.EVENTS_DIALOG.loadTempEvent = function () {
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
	}
	
	target.EVENTS_DIALOG.doPlusMinus = function (sender) {
	    var senderID;
	    senderID = getSoValue(sender,"id");
		target.EVENTS_DIALOG.doPlusMinusF(senderID);
		return;
	}
	
	target.EVENTS_DIALOG.doPlusMinusF = function (senderID) {
		var step, eventNum, eventType, eventMonth, eventDay, eventYear;
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
					target.setVariable("event_month",eventmonth);
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
			case "kbdSel" :
			{
				currentKbd=currentKbd+step;
				if (currentKbd==4) {
					currentKbd=10;
				} else if (currentKbd==11) {
					currentKbd=10;
				} else if (currentKbd==9) {
					currentKbd=3;
				} else if (currentKbd==0) {
					currentKbd=1;
				}
				if (currentKbd==10) {
					target.loadKeyboard(customKbdPath);			
					target.EVENTS_DIALOG.kbdSelect.setValue("Custom");
					target.settings.CurrentKeyboard="Custom";
				} else if (currentKbd==1) {
					target.loadKeyboard(kbdPath+"western.kbd");			
					target.EVENTS_DIALOG.kbdSelect.setValue("Western");
					target.settings.CurrentKeyboard="Western";
				}  else if (currentKbd==2) {
					target.loadKeyboard(kbdPath+"russian.kbd");			
					target.EVENTS_DIALOG.kbdSelect.setValue("Russian");
					target.settings.CurrentKeyboard="Russian";
				}  else if (currentKbd==3) {
					target.loadKeyboard(kbdPath+"georgian.kbd");			
					target.EVENTS_DIALOG.kbdSelect.setValue("Georgian");
					target.settings.CurrentKeyboard="Georgian";
				}
				target.refreshKeys();
				target.saveSettings();
			}
	    }
		return;
	}
	
	target.doUpdateEvent = function () {
		var eventNum, eventType, eventTypeCode, eventMonth, eventDay, eventYear, eventDescription;
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

		this.createCalendar();
		target.BUTTON_EDT.enable(true);		
		if (this.checkevents(selectionDate,monthNum,yearNum,y,x)>0) {
			this.showevents(selectionDate,monthNum,yearNum,y,x,0);
		} else {
			this.eventsText.setValue("");
		}
		return;
	}

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
	}
	
	target.refreshKeys = function () {
		var i,j,n,key;
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
		// put keys on buttons
		for (i=1; i<=10; i++) {
			key = 'key'+twoDigits(i);
			setSoValue(target.EVENTS_DIALOG[key], 'text', keys[n+i]);
			mouseEnter.call(target.EVENTS_DIALOG[key]);
			mouseLeave.call(target.EVENTS_DIALOG[key]);
		}
		for (i=11; i<=14; i++) {
			j=i-10;
			key = 'keyA'+j;
			setSoValue(target.EVENTS_DIALOG[key], 'text', keys[n+i]);
			mouseEnter.call(target.EVENTS_DIALOG[key]);
			mouseLeave.call(target.EVENTS_DIALOG[key]);			
		}
		for (i=15; i<=23; i++) {
			j=i-4;
			key = 'key'+j;
			setSoValue(target.EVENTS_DIALOG[key], 'text', keys[n+i]);
			mouseEnter.call(target.EVENTS_DIALOG[key]);
			mouseLeave.call(target.EVENTS_DIALOG[key]);
		}
		for (i=24; i<=27; i++) {
			j=i-23;
			key = 'keyB'+j;
			setSoValue(target.EVENTS_DIALOG[key], 'text', keys[n+i]);
			mouseEnter.call(target.EVENTS_DIALOG[key]);
			mouseLeave.call(target.EVENTS_DIALOG[key]);	
		}
		for (i=28; i<=34; i++) {
			j=i-8;
			key = 'key'+j;
			setSoValue(target.EVENTS_DIALOG[key], 'text', keys[n+i]);
			mouseEnter.call(target.EVENTS_DIALOG[key]);
			mouseLeave.call(target.EVENTS_DIALOG[key]);
		}
		for (i=35; i<=38; i++) {
			j=i-34;
			key = 'keyC'+j;
			setSoValue(target.EVENTS_DIALOG[key], 'text', keys[n+i]);
			mouseEnter.call(target.EVENTS_DIALOG[key]);
			mouseLeave.call(target.EVENTS_DIALOG[key]);	
		}
	}

	target.doSpace = function () {
		// ADD A SPACE
		var eventDescription = target.getVariable("event_description");
		eventDescription = eventDescription + " ";
		target.EVENTS_DIALOG.eventDescription.setValue(eventDescription);
		target.setVariable("event_description",eventDescription);
	}

	target.doSymbol = function () {
		symbols = !symbols;
		this.refreshKeys();
	} 

	target.doShift = function () {
		shifted = !shifted;
		this.refreshKeys();
	}	
	
	target.doBack = function () {
		// BACKSPACE
		var eventDescription = target.getVariable("event_description");
		eventDescription = eventDescription.slice(0,eventDescription.length-1);
		target.EVENTS_DIALOG.eventDescription.setValue(eventDescription);
		target.setVariable("event_description",eventDescription);
	}
	
	target.doKeyPress = function (sender) {
		var id = getSoValue(sender, "id");
		this.addCharacter(id);
		return;
	}
	
	target.addCharacter = function (id) {
		var key=id.substring(3, 5);
		var n;
		if (key.substring(0, 1)=="A") {
			n=10 + parseInt(key.substring(1, 2));
		} else if (key.substring(0, 1)=="B") {
			n=23 + parseInt(key.substring(1, 2));
		} else if (key.substring(0, 1)=="C") {
			n=34 + parseInt(key.substring(1, 2));
		} else {
			n = parseInt(key);
			//target.bubble("tracelog","id="+id+", n="+n);
			if ((n>=11) && (n<=19)) {
				n=n+4;
			} else if ((n>=20) && (n<=26)) {
				n=n+8;
			}
		}
		if (symbols) { n = n + symbolsOffset };
		if (shifted) { n = n + shiftOffset };
		var character = keys[n-1];
		//target.bubble("tracelog","n="+n+", character="+character);
		var eventDescription = target.getVariable("event_description");
		eventDescription = eventDescription + character;
		target.EVENTS_DIALOG.eventDescription.setValue(eventDescription);
		target.setVariable("event_description",eventDescription);		
	}
};
tmp();
tmp = undefined;