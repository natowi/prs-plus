// Minesweeper
// written in JavaScript
// Based on version written 1997..2004 by D. Shep Poor
// sheppoor@dataexperts.com
// Original on which this game is based
// Copyright (c) 1981-1995 Microsoft Corp. // beware of the (c) sign!!

// History:
//	2011-04-10 Mark Nord:	initially adapted to FSK for use with Sony PRS
//	2011-05-15 Mark Nord:	fist try for non-touch reader
//	2011-05-28 Mark Nord:	reached public beta state
//				ToDo: tick gameclock with hardware-timer for x50 models
var tmp = function () {
	var uD;
	var gridTop = 131;
	var gridLeft;
	
	var isNT = kbook.autoRunRoot.hasNumericButtons;
	var getSoValue = kbook.autoRunRoot.getSoValue;
	var setSoValue = kbook.autoRunRoot.setSoValue;
	var getFileContent = kbook.autoRunRoot.getFileContent;
	var datPath = kbook.autoRunRoot.gamesSavePath+'MineSweeper/';
	
	var fnPageScroll = getSoValue(target.helpText, 'scrollPage');
   	var mouseLeave = getSoValue( target.PERSONAL_BEST_DIALOG.btn_close,'mouseLeave');
	var mouseEnter = getSoValue( target.PERSONAL_BEST_DIALOG.btn_close,'mouseEnter');
	
	var clickMode = 0;
	var ntMenu;
	var ntMenuIndex = 0;
	var ntMenuItemIndex=0;
	var ntMenuActive = false;
	var width =[230,280,230];	// lazy as I can't get  >> itemWidth = itemStyle.getWidth(window, item.title);<< to work
	
	function ntMenuItem () {
		this.isItem = true;
		this.top = 0;
		this.sender = new Object();
		this.doCommand = '';
		this.isBottom =true;
	}	

      //
      // Variable and document setup stuff:
      //
      
        var maxX ,maxY, maxNumBombs, maxLegalBombs, l, maxCells, cellArray, clockStartTime, datPath, msPath, posX, posY, btnPos, custSel;

	// bunch of variables to be saved to a file
	target.settings = {	
		BeginnerBestTime : 999,
		IntermediateBestTime : 999,
		ExpertBestTime : 999,
		CustomBestTime : 999,
		useQuestionMarks : true,
		useMacroOpen : true,
		useFirstClickUseful : true,
		openRemaining : false,
		cMaxX : 8,
		cMaxY : 8,
		cMaxBombs :10,
		gameFormat : "Beginner"
	};			   
	
	
/*	if (kbook.simEnviro) {datPath = target.mineSweeperRoot + 'minesweeper.dat';} 
	else {datPath = '/Data/minesweeper.dat';} */
	msPath = datPath+'minesweeper.dat';
	FileSystem.ensureDirectory(datPath);             
        // Set global constants   
        
        var topImages = 19;                       // 7 on game menu, 8 on opt menu, 3 bomb #s, smile face, 3 time #s
        var maxStackHeight = 300;                 // For recursive cell opening stack
        var smileMargin=((maxX+1)*32-(26*6+52))/2;// To center smile & rt jstfy time
        
        // Global Arrays (created once)
        var markedArray = new Array(maxStackHeight); // For recursive cell opening stack
         
        // Variables used & reset during play
        var dead = false;                         // Hit a bomb?
        var win = false;                          // All cells open?
        var bombsFlagged = 0;                     // How many bombs marked so far?
        var cellsOpen = 0;                        // How many cells open so far?
        var markedCount = -1;                     // For recursive cell opening stack
        var highestStackHeight = -1;              // For recursive cell opening stack
        var pointingAtX = -1;                     // Current cell being pointed at.
        var pointingAtY = -1;                     // Used for space bar bomb flagging
        var numMoves = 0;                         // Count the number of clicks
        var openRemainingUsed = false;            // Was openRemaining used by the player?
        var lastClickOnMenu = false;              // Used to control smooth menu closing
      
        // Vars for the clock time
        var clockMoving  = false;                 // Is it moving?
        var clockActive  = false;                 // Should it be moving?
        var killLastClock= false;                 // To start new time w/ old still running
        var clockCurrent = -1;                    // Current time
      
        // define images: the many faces of bombs and bomb markers
        var bombFlagged = 11;
        var bombRevealed = 14;
        var bombMisFlagged = 12;
        var bombDeath = 10;
        var bombQuestion = 13;
        var blankCell = 9;
      
        // define images: the 3 faces 
        var faceDead = 4;
        var faceSmile = 0;
        var faceWin = 1;
        var faceWait = 5;
        var faceOoh = 3;
        var facePirate = 2;	
         
        // load helptext and hide instructions once 
	if (!isNT) {target.helpText.setValue(getFileContent(target.mineSweeperRoot.concat('MineSweeper_Help_EN.txt'),'help.txt missing'));}
	else {	// FixMe write Help for nt-reader
		target.helpText.setValue(getFileContent(target.mineSweeperRoot.concat('MineSweeper_Help_EN.txt'),'help.txt missing'));
		} 
	target.helpText.show(false);
	var displayHelp = false; 
	
	// reads values of target.settings.xx form file
	target.loadSettings = function (){
	var stream, inpLine;
	var values = [];
      	try {
      		if (FileSystem.getFileInfo(msPath)) {
      			stream = new Stream.File(msPath);    			
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
	target.saveSettings = function (){         
	var o, stream;
      	  try {
      		if (FileSystem.getFileInfo(msPath)) FileSystem.deleteFile(msPath);
      		stream = new Stream.File(msPath, 1);
      		for (o in target.settings) {
      			stream.writeLine(o+':'+target.settings[o]);
      		}
      		stream.close();
      	  } catch (e) {}         
        } 

	// Load quickest times and settings from save file once at startup
	target.loadSettings();

	// assign model-variables
	with (target.settings) {
		target.setVariable("custom_Height",cMaxY);
		target.setVariable("custom_Width",cMaxX);
		target.setVariable("custom_Bombs",cMaxBombs);
	}


        
	target.init = function () {
	var i,j;
	var maxSquares = 367; // 16*23-1
		// set translated appTitle and appIcon 
		this.appTitle.setValue(kbook.autoRunRoot._title);
		this.appIcon.u = kbook.autoRunRoot._icon;
	
                 // Roll-your-own (custom)
                 if (this.settings.gameFormat == "Custom" && this.getVariable("custom_selected")) {
                    maxX = parseInt(this.getVariable("custom_Width")-1);
                    maxY = parseInt(this.getVariable("custom_Height")-1);
                    maxNumBombs = parseInt(this.getVariable("custom_Bombs")); }
                 // Intermediate
                 else { if (this.settings.gameFormat == "Intermediate") {
                    maxX = 12;
                    maxY = 12;
                    maxNumBombs = 30; }
                 // Expert
                 else { if (this.settings.gameFormat == "Expert") {
 		    if (!is950()) {		                
	                    maxX = 15;
        	            maxY = 15;
                	    maxNumBombs = 50; }
                    else {		                
	                    maxX = 15;
        	            maxY = 22;
                	    maxNumBombs = 77; }}
                 // Beginner (also the default)
                 else { 
                    maxX = 7;
                    maxY = 7;
                    maxNumBombs = 10; // 10 when not testing
                    this.settings.gameFormat = "Beginner"; } } }
                    
                 // This pre-calc just makes the next "if" easier to handle.
                 maxLegalBombs = Math.round((maxX+1)*(maxY+1) / 3)  // Max 1/3 of all cells
              
                 // Make sure all values are numbers and are within range
                 if ((isNaN(maxX)) || (maxX<7) || (maxX>31) || (isNaN(maxY)) || (maxY<7) || (maxY>24) ||
                    (isNaN(maxNumBombs)) || (maxNumBombs<1) || (maxNumBombs>maxLegalBombs)) {
                    maxX = 7;
                    maxY = 7;
                    maxNumBombs = 10;
                    this.settings.gameFormat = "Beginner"; }
        
              	 maxCells = (maxX+1)*(maxY+1)-1;       // Constant: # of cells on board
        	 cellArray = new Array(maxCells);      // One per cell on the board
                 for (l=0; l<=maxCells; l++) {
                    cellArray[l]=new constructCell()}	
		
		// check MenuOptions
 		 var menuBar = this.findContent("MENUBAR"); // menuBar had to be defined as id="MENUBAR" in XML!!
		 var menus = getSoValue(menuBar,"menus");
		 var items = getSoValue(menus[0],"items");
        		for (var i = 2; i < 6; i++) { 
        		  switch (i) {
        			case 2:
        			{	items[i].check(this.settings.gameFormat == "Beginner"); 
	        			break;
        				}
        			case 3:
        			{	items[i].check (this.settings.gameFormat == "Intermediate"); 
        				break;
        				}
        			case 4:
 	    			{	items[i].check(this.settings.gameFormat == "Expert"); 
        				break;
        				}			
        			case 5:
        			{	items[i].check(this.settings.gameFormat == "Custom"); 
        				break;
        				}
        		  } 		
        		}  
		updateOptMenu();

		// setup button hint's
		if (!isNT) {
			this.btn_hint_prev_next.setValue('PREV/NEXT: Change Mode step/flag')
			this.btn_hint_home.setValue('Quit');
		}
		else {
			this.btn_hint_prev_next.setValue('PREV/NEXT: flag/mark/clear square')
			this.btn_hint_home.setValue('1,2,3: Restart');
			this.btn_hint_size.setValue('CENTER: step');
			this.btn_hint_option.setValue('0: Quit');
			target.Touch.mode.setValue('');
			}
		
		// resize frame dynamical 
		gridLeft = 300-(maxX+1)*32/2;
		this.frame1.changeLayout(gridLeft-21, 21+21+(maxX+1)*32, uD,  35, 85,uD);
		this.frame2.changeLayout(gridLeft-21, 21+21+(maxX+1)*32, uD, 110, 21+21+(maxY+1)*32, uD);

		// fill grid
        	   for (i=0; i<=maxX; i++) {
                    for (j=0; j<=maxY; j++) {
                        this['sq'+imageIndexOf(i,j)].changeLayout(gridLeft+i*32,32,uD,gridTop + j*32,32,uD);
                        this['sq'+imageIndexOf(i,j)].u = 9;
                       }} 
                // hide unuses squares       
                 for (i=(maxX+1)*(maxY+1); i<=maxSquares; i++) { 
                       this['sq'+pad(i,3)].changeLayout(0,0,uD,0,0,uD);
                 }      
                // show gridCursor for NT-readers hide it for all others
		if (isNT) {
                	posX = Math.floor(Math.random() * (maxX+1));  // set gridCursor to a random position
                	posY = Math.floor(Math.random() * (maxY+1));
                	this['gridCursor'].changeLayout(gridLeft+posX*32,32,uD,gridTop + posY*32,32,uD);
                	this['gridCursor'].u = 15;	
                	
                	} 
                else {
                	this['gridCursor'].changeLayout(0,0,uD,0,0,uD);
                } 
		faceClick_first()
	};
	
	// builds a menu lookalike panel for use with non-touch readers
	var buildNTMenu = function (MenuIdx) {
		var dx,ntItem, x, j, itemWidth, title;
		var itemHeight=32;
		var sepHeight=10;
		var top = 10;
		var uD;
		var sep = 0;
 		var menuBar = target.findContent("MENUBAR"); // menuBar had to be defined as id="MENUBAR" in XML!!
		dx = getSoValue(menuBar,"x");				
		var menus = getSoValue(menuBar,"menus");
		var items = getSoValue(menus[MenuIdx],"items");	
		
      		x = getSoValue(menus[MenuIdx],"x");
		target.NT_MENU.changeLayout(3+x-dx,width[MenuIdx],uD,35,top+6,uD);	    		
		ntMenu = new Array(9);
      		for (var i = 0; i < getSoValue(items,'length'); i++) { 
      			j = i;
      			ntMenu[i] = new ntMenuItem();
      			ntMenu[i].top = top;
      			ntMenu[i].sender = items[i];
      			ntMenu[i].doCommand = getSoValue(items[i],"doCommand")
			ntMenu[i].isBottom = false;      	

      			ntItem = target.NT_MENU['ntMenuItem'+i];
      			title = getSoValue(items[i],"title");

      			if (title) {setSoValue(ntItem,'text', title);} else {setSoValue(ntItem,'text', '');} 
      			ntItem.changeLayout(0,width[MenuIdx],uD,top,32,uD);
      			target.NT_MENU['ntMenuChk'+i].changeLayout(0,20,uD,top-5,38,uD);
      			target.NT_MENU['ntMenuChk'+i].u = 0;
      			if (title) {
	      			if (items[i].isChecked()) target.NT_MENU['ntMenuChk'+i].u = 1;
      				ntMenu[i].isItem = true;  			
      				top = top + 32;
      				}
      			else {
      				ntMenu[i].isItem = false;      			
      				target.NT_MENU['ntMenuSep'+sep].changeLayout(0,width[MenuIdx],uD,top,10,uD); 
      				top = top + 10;
      				sep++;
      				}	
      			}
		ntMenu[j].isBottom = true; 
		// hide unused items
		for (i = j+1; i <= 9; i++) {
			ntItem = target.NT_MENU['ntMenuItem'+i];
			setSoValue(ntItem,'text', '');
			target.NT_MENU['ntMenuChk'+i].changeLayout(0,0,uD,0,0,uD); 
			}
		for (i = sep; i <= 4; i++) {
			target.NT_MENU['ntMenuSep'+i].changeLayout(0,-0,uD,0,0,uD);
			} 
	      	target.NT_MENU['ntMenuSelector'].changeLayout(4,width[MenuIdx]-12,uD,ntMenu[ntMenuItemIndex].top,uD,uD);
		target.NT_MENU.show(true);
		target.NT_MENU.changeLayout(3+x-dx,width[MenuIdx],uD,35,top+6,uD);
	}

	var moveNTMenuSelector = function (MenuIdx) {
		target.NT_MENU['ntMenuSelector'].changeLayout(4,width[MenuIdx]-12,uD,ntMenu[ntMenuItemIndex].top,uD,uD);
	}

	// moves the gridCursor for nt-readers
	target.moveCursor = function (direction) {
	if (!ntMenuActive) {	
      		if (direction == "right") {
      			posX++;
      			if (posX > maxX) posX = 0;
      		}
      		if (direction == "left") {
      			posX--;
      			if (posX < 0) posX = maxX;
      		}
      		if (direction == "up") {
      			posY--;
      			if (posY < 0) posY = maxY;
      		}
      		if (direction == "down") {
      			posY++;
      			if (posY > maxY) posY = 0;
      		}
		this.gridCursor.changeLayout(gridLeft+posX*32,32,uD,gridTop + posY*32,32,uD);
	  }
	else	// handles Menu
		{			
		if (direction == "right") {
      			ntMenuIndex++;
      			if (ntMenuIndex > 2) ntMenuIndex = 0;
      			ntMenuItemIndex=0;
      			buildNTMenu(ntMenuIndex);
      			}
      		if (direction == "left") {
			ntMenuIndex--;
      			if (ntMenuIndex < 0) ntMenuIndex = 2;
      			ntMenuItemIndex=0;
     			buildNTMenu(ntMenuIndex);
      			}
      		if ((direction == "up") && (ntMenuItemIndex>0)) {
      			ntMenuItemIndex--;
      			// deal with separator
      			while((!ntMenu[ntMenuItemIndex].isItem) && (ntMenuItemIndex>0)) ntMenuItemIndex--;
      			moveNTMenuSelector(ntMenuIndex);
      			}	
      		if ((direction == "down") && (!ntMenu[ntMenuItemIndex].isBottom)) {
      			ntMenuItemIndex++;
      			while(!ntMenu[ntMenuItemIndex].isItem) ntMenuItemIndex++;
      			moveNTMenuSelector(ntMenuIndex);
			}
		}
	}	

	// handles center-button for nt-readers	
	target.doCenterF = function (){
	var doHandle, sender;
	// close HelpTextWindow
	if (displayHelp) {
		this.showHelp();
		return;
	}
	// if not in menu step onto
	if (!ntMenuActive) {
		var e = {button :1};
		cellClick(posX,posY,e);
		ticClock();	
	  	}	
	// else handle menu
	else {
		sender = ntMenu[ntMenuItemIndex].sender;
		doHandle = getSoValue(sender,'doHandle');
		doHandle.call(sender,target);
		ntMenuActive = false;
		target.NT_MENU.show(false);
		} 		
	}

	// handles digit-buttons for nt-readers	
	target.doDigitF = function (sender) {
	var n=parseInt(sender);
		if (n>3) return;
		switch (n) {
		case 0: {
        		this.exitQuit();
	        	break;
        		}
        	case 1: {
        		this.settings.gameFormat = "Beginner";
	        	break;
        		}
       		case 2: {
       			target.settings.gameFormat = "Intermediate"; 
      			break;
      			}
		case 3: {
			target.settings.gameFormat = "Expert"; 
      			break;
      			}			
		}
		this.init();
	}
	
	
	target.doMenuF = function () {
		ntMenuActive = !ntMenuActive;
		if (ntMenuActive) {
			buildNTMenu(ntMenuIndex);
			}
		else {
			target.NT_MENU.show(false);
			}
	}
	
	target.exitQuit = function () {
		this.saveSettings();
		kbook.autoRunRoot.exitIf(kbook.model);
	};

	var updateScreen = function() {
		FskUI.Window.update.call(kbook.model.container.getWindow());
	};

	// just for debugging purposes
	target.doGridClick = function (sender) {
		var id, sq, u, v;
		var e = {button :1};
		id = getSoValue(sender,"id");
		sq = id.substring(2,5);
	//	u = getSoValue(sender,"u");
	//	v = getSoValue(sender,"v");
	//		this.bubble("tracelog","id= "+id); // debug
	//		this.bubble("tracelog","X= "+xFromID(x)); // debug
 	//		this.bubble("tracelog","Y= "+yFromID(x)); // debug
		e.button = (clickMode == 0) ? 1 : 2;
		cellClick(xFromID(sq),yFromID(sq),e);
		ticClock();	
		//	this.bubble("tracelog","sq#= "+x); // debug
		//	this.bubble("tracelog","u= "+u);
		//	this.bubble("tracelog","v= "+v);	  	
	};
	
	target.changeClickMode = function (sender) { 
	var msg;
	if (isNT) {
		var e = {button :2};
		cellClick(posX,posY,e);
		ticClock();	
		}
	 else {
		clickMode = Math.abs(clickMode-1);
		msg = (clickMode == 0) ? "MODE: step" : "MODE: flag";
		target.Touch.mode.setValue(msg);
		}
	};

	target.toggleClockMove = function (sender) {
		showNumMoves = !showNumMoves;
		updateClock();	
	}; 
	
	target.showHelp = function (sender) {
		displayHelp = !displayHelp;
		this.closeHelpText.enable(displayHelp);
		this.closeHelpText.show(displayHelp);
		this.helpText.show(displayHelp);
		if (displayHelp) {
		 this.doNext = function () {this.helpTextPgDwn()};
		 this.doPrevious = function () {this.helpTextPgUp()};
		 if (isNT) {
		 	this.btn_hint_size.setValue('CENTER: Close Help');}
			this.btn_hint_prev_next.setValue('PREV/NEXT: Scroll Help');		 
			}
		 else {
 		 	this.doNext = function () {this.changeClickMode()};
			 this.doPrevious = function() {this.changeClickMode()};
			 if (!isNT) {
				this.btn_hint_prev_next.setValue('PREV/NEXT: Change Mode step/flag')
				}
			else {
				this.btn_hint_prev_next.setValue('PREV/NEXT: flag/mark/clear square')
				this.btn_hint_size.setValue('CENTER: step');
			}
		} 
	}; 
	
	target.helpTextPgDwn = function (){
		fnPageScroll.call(this.helpText, true, 1);
	}	

	target.helpTextPgUp = function (){
		fnPageScroll.call(this.helpText, true, -1);
	}	

        // shows the Personal Best Times Window
        target.showPersBest = function() {
           this.PERSONAL_BEST_DIALOG.bestBeginnerTime.setValue(target.settings.BeginnerBestTime);
           this.PERSONAL_BEST_DIALOG.bestIntermediateTime.setValue(target.settings.IntermediateBestTime);
           this.PERSONAL_BEST_DIALOG.bestExpertTime.setValue(target.settings.ExpertBestTime);
	   if (isNT) {
	   	mouseEnter.call(target.PERSONAL_BEST_DIALOG.btn_close);  
	   	btnPos=0; 
	   }		
           this.PERSONAL_BEST_DIALOG.show(true);
        }	

        target.PERSONAL_BEST_DIALOG.doResetBest = function() {
	   target.settings.BeginnerBestTime = 999;
           target.settings.IntermediateBestTime = 999;
           target.settings.ExpertBestTime = 999;
		   
	   // save quickest times to save file
           target.showPersBest();
	   target.PERSONAL_BEST_DIALOG.moveCursor();
	}

	target.PERSONAL_BEST_DIALOG.moveCursor = function (direction) {
	var btn = ["btn_close","resetBest"];
      		btnPos = Math.abs(btnPos-1);
		mouseEnter.call(target.PERSONAL_BEST_DIALOG[btn[btnPos]]);	
		mouseLeave.call(target.PERSONAL_BEST_DIALOG[btn[Math.abs(btnPos-1)]]);
	}

	target.PERSONAL_BEST_DIALOG.doCenterF = function () {
	var btn;
      		btn = (btnPos == 0) ? "btn_close" : "resetBest";
		target.PERSONAL_BEST_DIALOG[btn].click();	
	}

        // shows the Custom-Settings Window
        target.CUSTOM_DIALOG.open = function() {
	   if (isNT) {
		target.CUSTOM_DIALOG.cust_Height.enable(true);
	   	custSel = 0; 
	   	ntHandleCustDlg();
	   }		
           target.CUSTOM_DIALOG.show(true);
        }

	var ntHandleCustDlg = function () {
        	if (custSel === 0) {
        		target.CUSTOM_DIALOG.cust_Height.enable(true);
        		target.CUSTOM_DIALOG.cust_Width.enable(false);
        		target.CUSTOM_DIALOG.cust_Bombs.enable(false);
        		}
        	if (custSel === 1) {
        		target.CUSTOM_DIALOG.cust_Height.enable(false);
        		target.CUSTOM_DIALOG.cust_Width.enable(true);
        		target.CUSTOM_DIALOG.cust_Bombs.enable(false);
        		}			
        	if (custSel === 2) {
        		target.CUSTOM_DIALOG.cust_Height.enable(false);
        		target.CUSTOM_DIALOG.cust_Width.enable(false);
        		target.CUSTOM_DIALOG.cust_Bombs.enable(true);
        		mouseLeave.call(target.CUSTOM_DIALOG.btn_Ok);	
        		}
        	if (custSel === 3) {				
	      		target.CUSTOM_DIALOG.cust_Height.enable(false);
        		target.CUSTOM_DIALOG.cust_Width.enable(false);
        		target.CUSTOM_DIALOG.cust_Bombs.enable(false);
			mouseLeave.call(target.CUSTOM_DIALOG.btn_Cancel);
        		mouseEnter.call(target.CUSTOM_DIALOG.btn_Ok);	
        		}			
        	if (custSel === 4) {				 		
        		mouseLeave.call(target.CUSTOM_DIALOG.btn_Ok);
        		mouseEnter.call(target.CUSTOM_DIALOG.btn_Cancel);	
        		}								
	}
        
	target.CUSTOM_DIALOG.moveCursor = function (direction) {
	switch (direction) {
		case "up" : {
			if (custSel>0) {
				custSel --;
				ntHandleCustDlg();
				}
			break
		}
		case "down" : {
			if (custSel<4) {
				custSel ++;
				ntHandleCustDlg();
				}
			break
		}
		case "left" : {
			if (custSel === 0) target.CUSTOM_DIALOG["cust_Height-"].click();
			if (custSel === 1) target.CUSTOM_DIALOG["cust_Width-"].click();
			if (custSel === 2) target.CUSTOM_DIALOG["cust_Bombs-"].click();
			break
		}		
		case "right" : {
			if (custSel === 0) target.CUSTOM_DIALOG["cust_Height+"].click();
			if (custSel === 1) target.CUSTOM_DIALOG["cust_Width+"].click();
			if (custSel === 2) target.CUSTOM_DIALOG["cust_Bombs+"].click();
			break
		}
	  }	
	}
	
	target.CUSTOM_DIALOG.doCenterF = function () {
        	if (custSel === 3) target.CUSTOM_DIALOG.btn_Ok.click();	
        	if (custSel === 4) target.CUSTOM_DIALOG.btn_Cancel.click();	
	}

        target.CUSTOM_DIALOG.doPlusMinus = function(sender) {
	   var senderID, cHeight, cWidth, cBombs, step;
	   senderID = getSoValue(sender,"id");
	   step = ( senderID.lastIndexOf("+") != -1) ? 1 : -1;
	   senderID = senderID.slice(0,senderID.length-1);
	   cHeight = parseInt(target.getVariable("custom_Height"));
	   cWidth = parseInt(target.getVariable("custom_Width"));
	   cBombs = parseInt(target.getVariable("custom_Bombs"));
	   switch (senderID) {
	   	case "cust_Height" :
	   	{  if (cHeight<23-step && is950() && cHeight>7-step) {cHeight = cHeight+step;} 
	   	   else { if (cHeight<16-step && cHeight>7-step) {cHeight = cHeight +step}};
		   this.container.setVariable("custom_Height",cHeight);
	           break;
		}
	   	case "cust_Width" :
	   	{  if (cWidth<16-step && cWidth>7-step) cWidth = cWidth + step;
		   this.container.setVariable("custom_Width",cWidth);
	           break;		   
		}	
	   	case "cust_Bombs" :
	   	{  if (cBombs < Math.round(cWidth*cHeight / 3)-step && cBombs>0-step) {cBombs = cBombs+step};
		   this.container.setVariable("custom_Bombs",cBombs);
	           break;		   
		}		
	   }	 
	}
	
      	// menu exist in the scope of DOCUMENT !! 
      	target.container.container.selectLevel = function(sender) {
      		var x = getSoValue(sender,"index");
      		switch (x) {
      			case 2:
      			{	target.settings.gameFormat = "Beginner"; 
      				break;
      				}
      			case 3:
      			{	target.settings.gameFormat = "Intermediate"; 
      				break;
      				}
      			case 4:
      			{	target.settings.gameFormat = "Expert"; 
      				break;
      				}			
      			case 5:
      			{	target.settings.gameFormat = "Custom"; 
      				target.CUSTOM_DIALOG.open();
      				break;
      				}
      		}
      		if (target.settings.gameFormat!="Custom"){
      			target.setVariable("custom_selected",false)
	      		target.init();
		}      	
      	};
	
	var updateOptMenu = function (){
      		var menuBar, menus, items;
      		var menuBar = target.findContent("MENUBAR"); // menuBar had to be defined as id="MENUBAR" in XML!!
		var menus = getSoValue(menuBar,"menus");
      		items = getSoValue(menus[1],"items");	// Options-Menu
      		items[0].check(target.settings.useFirstClickUseful);
  		items[1].check(target.settings.useQuestionMarks); 
          	items[2].check(target.settings.useMacroOpen); 
      		items[3].check(target.settings.openRemaining); 
	}

	target.container.container.changeOption = function(sender) {
		var x = getSoValue(sender,"index");
		switch (x) {
			case 0:
			{	target.settings.useFirstClickUseful = !target.settings.useFirstClickUseful; 
				break;
				}
			case 1:
			{	target.settings.useQuestionMarks = !target.settings.useQuestionMarks; 
				break;
				}
			case 2:
			{	target.settings.useMacroOpen = !target.settings.useMacroOpen; 
				break;
				}			
			case 3:
			{	target.settings.openRemaining = !target.settings.openRemaining; 
				break;
				}
		}		
		updateOptMenu();
	};
	
// checks for 900/950 screensize
var is950 = function() {
	return getSoValue(target,'height') > 900;
};
	
// get X form id	
var xFromID = function (id) {	
	return id % (maxX+1);
}

// get Y form id	
var yFromID = function (id) {	
	return Math.floor(id / (maxX+1));
}
	
// add leading Zeros	
var pad = function (number, length) {
   
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
   
    return str;

}


// Creates the internal cells (as opposed to the image cells).  Called once
// per cell upon creation of the window (see above).
var constructCell = function() {
   this.isBomb = false;         // Is the cell a bomb?
   this.isExposed = false;      // Is it open?
   this.isFlagged = false;      // Does it have a bomb flag on it?
   this.isQuestion = false;     // Question mark (if its used)
   this.isMarked = false;       // Used for recursive macro opening
   this.neighborBombs = 0; }    // # surrounding bombs.  Set for all cells.

//
// General-purpose routines called from throughout the game
//


// Returns the index of the internal playing board cellArray at given
// x,y coords (on 0..n-1 scale).  Very useful fn.
var arrayIndexOf = function(x,y) {
   return x+y*(maxX+1); }


// Returns the index of the documents image pointing to cell at given
// x,y coords (on 0..n-1 scale).  Very useful fn.
// Notes: topImages are the 3 bomb digits, the face, & the 3 time digits.
//        Uses maxX+2 (not maxX+1) to include borderRight images.
var imageIndexOf = function(x,y) {	
	return pad(x + y * (maxX+1),3); }
//   return x+(y+2)*(maxX+3)+topImages+3; } // This is the simplified version
// return x+y*(maxX+2)+topImages+(maxX+1)*2+(y+1)+6; }


// Makes sure x,y coords are within the board.  Returns true or false.
var checkBounds = function(x,y) {
  return ((0<=x) && (x<=maxX) && (0<=y) && (y<=maxY)); }

// Saves the current pointing location of the mouse.  Called w/ onMouseOver
// for each cell.
var cursorHoldLoc = function(x,y) {
   pointingAtX = x;
   pointingAtY = y; 
   forceFocus(); }

// Clears the saved location.  Needed when user points outside the grid.
// Note: I check that I'm clearing the correct cell, just in case events
// occur out of order.
var cursorClearLoc = function(x,y) {
   if ((pointingAtX == x) && (pointingAtY == y)) {
      pointingAtX = -1;
      pointingAtY = -1; } }


// Complete the Win process. Save the cookies, and call the winning window.
var winShowWindow = function() {
   var bestTime = target.settings[target.settings.gameFormat+'BestTime'];
   win = true;
   target.WIN_DIALOG.winTime.setValue('Game time: '+ clockCurrent);
   target.WIN_DIALOG.bestTime.setValue("Your best "+target.settings.gameFormat+ " time is: "+bestTime);
   target.WIN_DIALOG.numClicks.setValue("Number of Clicks: "+ numMoves);
   target.face.u = faceWin;
   if (clockCurrent<bestTime) {target.settings[target.settings.gameFormat+'BestTime']=clockCurrent}
   
   // save quickest times to save file
   // target.saveSettings();		// will be saved on exit
	
   target.WIN_DIALOG.open();
}
	
//
// Associated w/ opening cells & cell clicking
//

// Make sure the check box always has the focus. makes the space bar work.
var forceFocus = function() {
     // document.checkForm.modeCheck.focus()
     }


// You're dead.  Open the board of bombs.  Assumes death bomb is already
// displayed (and isExposed is set to true).
var deathShowBombs = function() {
   for (i=0; i<=maxX; i++) {
      for (j=0; j<=maxY; j++) {
         with (cellArray[arrayIndexOf(i,j)]) {
            if (!isExposed) {
               if ((isBomb) && (!isFlagged)) {
                  target['sq'+imageIndexOf(i,j)].u = bombRevealed; }
               else {
                  if ((!isBomb) && (isFlagged)) {
                  target['sq'+imageIndexOf(i,j)].u = bombMisFlagged;
               } } } } } } }


// You've won.  Mark any remaining cells as flags.
var winShowFlags = function() {
   for (i=0; i<=maxX; i++) {
      for (j=0; j<=maxY; j++) {
         with (cellArray[arrayIndexOf(i,j)]) {
            if ((!isExposed) && (!isFlagged)) {
               isFlagged = true;
               target['sq'+imageIndexOf(i,j)].u = bombFlagged; } } } } }
              
// Open all remaining cells. Returns True if the player has won.
var openAll = function() {
   allOK = true;
   for (i=0; i<=maxX; i++) {
      for (j=0; j<=maxY; j++) {
         with (cellArray[arrayIndexOf(i,j)]) {
            if (!isExposed) {
               if ((isBomb) && (!isFlagged)) {
                  target['sq'+imageIndexOf(i,j)].u = bombDeath; 
                  allOK = false;}
               else if ((!isBomb) && (isFlagged)) {
                  target['sq'+imageIndexOf(i,j)].u = bombMisFlagged; }
               else if (!isBomb) {
                  target['sq'+imageIndexOf(i,j)].u = neighborBombs; 
               } } } } } 
   return allOK;}
             


// Actually opens the cell.  Works for bombs & free cells.  Can handle
// recursive calls (through markMatrixToOpen), death (if bomb), and win.
// (should probably be broken up a bit)
var openCell = function(x,y) {
   // Normal cell opening processing begins here
   with (cellArray[arrayIndexOf(x,y)]) {
      if (isBomb) {
         // death
         clockStop();
         target['sq'+imageIndexOf(x,y)].u =  bombDeath;
         target.face.u = faceDead;
         isExposed = true;
         dead = true;
         updateNumBombs();
         deathShowBombs(); }
      else {
         target['sq'+imageIndexOf(x,y)].u =  neighborBombs; 
         isExposed = true;
         isMarked = false;
         ++ cellsOpen;
         if ((neighborBombs == 0) && (!isBomb)) {
            markMatrixToOpen(x,y); } 
         if (cellsOpen+maxNumBombs-1 == maxCells) {
            clockStop();
            winShowFlags();
            winShowWindow();
            } } } }
         

// Cells on stack marked to be open.  Called on an as-needed baisis.
// See the markCellToOpen fn below.
var constructMarkedCell = function() {
   this.x = -1;
   this.y = -1; }


// Although Netscapes JavaScript 1.1 documentation says JavaScript is
// recursive, it doesn't actually maintain a stack of local vars!
// So these functions turned out to be a real pain to rewrite with my
// own stack structures.
// Adds an element to the manual stack.  Lengthens the stack if necessary.
var markCellToOpen = function(x,y) {
   ++markedCount;
   if (highestStackHeight < markedCount) {
     ++highestStackHeight;
     markedArray[markedCount] = new constructMarkedCell() }
   markedArray[markedCount].x = x;
   markedArray[markedCount].y = y;
   cellArray[arrayIndexOf(x,y)].isMarked = true; }


// When you open a cell w/ 0 neighbors or click on a completely flagged
// cell, open all neighbors (not flagged).  Creates recursive calls through
// markCellToOpen
var markMatrixToOpen = function(x,y) {
   for (i=x-1; i<=x+1; i++) {
      for (j=y-1; j<=y+1; j++) {
         if (checkBounds(i,j)) {
            with (cellArray[arrayIndexOf(i,j)]) {
               if ((!isExposed) && (!isMarked) && (!isFlagged)) {
                  markCellToOpen(i,j); } } } } } }


// Open all cells (usually one) marked for opening.  See markMatrixToOpen
// to see how multiple cells are marked.
var openAllMarked = function() {
   while (markedCount >= 0) {
      markedCount--;  // Decrement first, in case a matrix is to be open
      with (markedArray[markedCount+1]) {
         openCell(x,y); } } }

// Returns 1 if a cell is flagged, and 0 otherwise.  Used in determining
// if a cell has complete surrounding cells flagged.  See below
var checkFlagged = function(x,y) {
   if (checkBounds(x,y)) 
      return (cellArray[arrayIndexOf(x,y)].isFlagged) ? (1) : (0); 
   else
      return 0; }


// Count the # of neighbors flagged.  Called for matrix opening.
var checkFlaggedMatrix = function(x,y) {
   count = 0;
   for (i=x-1; i<=x+1; i++) {
      for (j=y-1; j<=y+1; j++) {
         if ((i!=x) || (j!=y)) {                  //Don't check center point
         count = count + checkFlagged(i,j); } } }
   return count; }


// Called for first click only.  Starts the clock, and makes sure there is
// no bomb for the first open cell (or matrix).
var firstClick = function(x,y) {
    if (!target.settings.useFirstClickUseful) {
      if (cellArray[arrayIndexOf(x,y)].isBomb) {
         placeBombRandomLoc();  // Place first to insure different loc
         removeBomb(x,y); } }
    else {
      var i = 0;        // Make local
      var j = 0;
      // Set each cell of the matrix to open to prevent bomb placement.
      for (i=x-1; i<=x+1; i++) {
         for (j=y-1; j<=y+1; j++) {
            if (checkBounds(i,j)) {
               cellArray[arrayIndexOf(i,j)].isExposed = true; } } }
      // Remove any bombs in the matrix and place elsewhere
      for (i=x-1; i<=x+1; i++) {
         for (j=y-1; j<=y+1; j++) {
            if (checkBounds(i,j)) {
               if (cellArray[arrayIndexOf(i,j)].isBomb) {
                  removeBomb(i,j);
                  placeBombRandomLoc();
                  } } } }
      // Set each cell back to normal.  (Let cellClick take it from here).
      for (i=x-1; i<=x+1; i++) {
         for (j=y-1; j<=y+1; j++) {
            if (checkBounds(i,j)) {
               cellArray[arrayIndexOf(i,j)].isExposed = false; } } } }
  clockStart(); }


// Main click function.  Called whenever a cell is clicked.  Based on mode,
// determines what to do about the click. Handles both left and right.
var cellClick = function(x,y,e) {
//   alert("Clicked cell " + x + "," + y);  //Useful diagnostic line
//   alert("Button pressed = " + e.button) //Useful diagnostic line
   closeAllMenus();
   if ((!dead) && (!win)) {
      target.face.u = faceSmile;
      numMoves++;
      // Count the moves
	  if ((e != null) && (e.button != 2)) {
	      if (!clockMoving)
	         firstClick(x,y);
	      with (cellArray[arrayIndexOf(x,y)]) {
	         // Is it already open?  If so, we may need to do a matrix (macro) open
	         if (isExposed) {
	            if ((target.settings.useMacroOpen) && (checkFlaggedMatrix(x,y) == neighborBombs)) { 
	               markMatrixToOpen(x,y);
	               openAllMarked(); } }
	         else {
	            if (!isFlagged) { 
	               markCellToOpen(x,y); 
	               openAllMarked(); } } }
	      if (win) {
	         bombsFlagged = maxNumBombs;
	         updateNumBombs(); }
	  }
	  else {
	     if (x > -1) {
	      with (cellArray[arrayIndexOf(x,y)]) {
	         if (!isExposed) {
	            // There are 3 possibilities: blank, flagged, and question
	            // First deal with flagged going to either blank or question
	            if (isFlagged) {
	               bombsFlagged--;
	               isFlagged = false;
	               if (!target.settings.useQuestionMarks)
	                  target['sq'+imageIndexOf(x,y)].u = blankCell;
	               else {
	                  isQuestion = true;
	                  target['sq'+imageIndexOf(x,y)].u = bombQuestion; } }
	            // Now deal w/ question going to blank
	            else {
	               if (isQuestion) {
	                  isQuestion = false;
	                  target['sq'+imageIndexOf(x,y)].u = blankCell; }
	               // Finally, blank going to flagged
	               else {
	                  isFlagged = true;
	                  ++bombsFlagged;
	                  target['sq'+imageIndexOf(x,y)].u = bombFlagged; } }
	         updateNumBombs(); } } }
 	  }
   }
  forceFocus();
}


// Mark a bomb with the space bar (what would be the spacebar).  Called 
// whenever the value of the check box is toggled.  (Replaces old fn which 
// altered "mode").
var cellRightClick = function() {
	cellClick(pointingAtX,pointingAtY, null);
}


// Disable the right click button's menu.
// var pressRightClick = function() { return false; } 
// document.oncontextmenu = pressRightClick;


// Special routine to ignore dragging starts.
// Allows the mouse to be in motion when the user clicks.
// Only works in IE because there is no onDrag handler in Mozilla
//var ignoreDragging = function() {
//   try {
//      window.event.returnValue = false; }
//   catch (e) {}
//   return false; }


// Show or remove the "Ooh" face when the mouse is clicked.
target.showMouseDown = function (e) {
   if ((! dead) && (! win) && (clickMode==0)){
      closeAllMenus();
      target.face.u = faceOoh; } }



// Check for F2. If pressed, restart the game. Two versions: for FF & IE
// document.onkeydown = checkKeyDown; // Uses global onkeypress. 
var checkKeyDown = function(e) { 
	try {
		if (e.keyCode == 113) {
			faceClick(); } }
	catch (e) {}
	try {
		if (window.event.keyCode == 113) {
			faceClick(); } }
	catch (e) {}
}


// When all bombs are marked, user can open all remaining cells.
var bombCountClick = function() {
   closeAllMenus();
   if ((!dead) && (!win) && (target.settings.openRemaining) && ((maxNumBombs-bombsFlagged) == 0)) {
      clockStop();
      numMoves++;
      openRemainingUsed = true;
      if (openAll()) {
         winShowWindow(); 
         updateNumBombs(); }
      else {
         dead = true;
         updateNumBombs();
         target.face.u = faceDead; } }
   forceFocus();
   return false; }

//
// Board creation, re-initialization, bomb placement, etc.
//


// Support function for makeBoard.  Adds 1 to the neighborBombs property.
// Does a bounds check and a check for not being a bomb. (no change if 
// either condition fails)
var addNeighbor = function(x,y) {
   if (checkBounds(x,y)) {
      with (cellArray[arrayIndexOf(x,y)]) {
            ++neighborBombs; } } }


// Called only w/ removal of bomb when 1st click is on a bomb.
var removeNeighbor = function(x,y) {
   if (checkBounds(x,y)) {
      with (cellArray[arrayIndexOf(x,y)]) {
            neighborBombs--; } } }


// Support function for makeBoard, and also called externally if first 
// click is on a bomb.  Places a bomb at x,y loc and updates neighbor 
// counts.  returns true upon success, failure if bomb is already there 
// or if the square is open. (note: isExposed is set temporarily to true
// during first click to avoid bombs being placed in bomb-free zone.)
var placeBomb = function(x,y) {
   with (cellArray[arrayIndexOf(x,y)]) {
      if ((! isBomb) && (! isExposed)) {
         isBomb = true;
         for (i=x-1; i<=x+1; i++) {
            for (j=y-1; j<=y+1; j++) {
               addNeighbor(i,j); } } 
         return true;} 
      else
         return false; } }


// Only called when user's 1st click is on a bomb.
// NOTE: This fn caused an "internal error: Stack underflow" for a while,
// and then stopped.  I still can't find the cause, but if I split the
// cellArray reference out into a higher "with" statement, it comes back.
// It seems to work fine now, but be careful!
var removeBomb = function(x,y) {
   if (cellArray[arrayIndexOf(x,y)].isBomb) {
      for (i=x-1; i<=x+1; i++) {
         for (j=y-1; j<=y+1; j++) {
            removeNeighbor(i,j); } } 
      cellArray[arrayIndexOf(x,y)].isBomb = false;
      return true; } 
   else
      return false; }


// Pixed a random stop w/o a bomb already there and places a bomb there.
// Since it works w/ random locs and tests compliance, this fn is only
// suitable for up to ~50% coverage. (I've limited the program to 33%).
var placeBombRandomLoc = function() {
   bombPlaced = false;
   while (!bombPlaced) {
      with (Math) {
         i = floor(random() * (maxX+1));
         j = floor(random() * (maxY+1)); }
      bombPlaced = (placeBomb(i,j)) } }


// Does a complete clear of the internal board cell objects.
var clearBoard = function() {
   for (i=0; i<=maxX; i++) {
      for (j=0; j<=maxY; j++) {
         with (cellArray[arrayIndexOf(i,j)]) {
            isExposed = false;
            isBomb = false;
            isFlagged = false;
            isMarked = false;
            isQuestion = false;
            neighborBombs = 0;  } } } }


// Puts the original image on each image cell.
var clearBoardImages = function() {
   for (j=0; j<=maxY; j++) {
      for (i=0; i<=maxX; i++) {
         with (cellArray[arrayIndexOf(i,j)]) {
            if (target['sq'+imageIndexOf(i,j)].u != blankCell) {
            	target['sq'+imageIndexOf(i,j)].u = blankCell; } } } } }


// Core fn for creating a board.  Does not reset time or clear images.
var makeBoard = function() {
   clearBoard();
   bombsFlagged = 0;
   cellsOpen = 0;
   updateNumBombs();
   // Now place the bombs on the board
   bombsToPlace = maxNumBombs;
   while (bombsToPlace != 0) {
      placeBombRandomLoc();
      bombsToPlace--; } }


// Resets clock, makes board, clears images, and prepares for next game.
// First time doesn't do a parent reload.
var faceClick_first = function () {
   target.face.u = faceWait;
   updateScreen();
   numMoves = 0;
   closeAllMenus();
   clockStop();
   clockClear();
   makeBoard();
   clearBoardImages(); 
   forceFocus();
   dead = false;
   win = false;
   openRemainingUsed = false;
   target.face.u = faceSmile;
   return false;
   }

var faceClick = function() {
    faceClick_first();
   // Cheezy line to allow ads on calling page.
   try { 
      if (window.opener.window.location.pathname.indexOf('minesweeper.html') >= 0) {
         window.opener.window.location.reload(); 
      }
   } 
   catch (e) { }
   return false;
   }

//
// Numerical displays (clock and num bomb) updated here
//


// Set the clock images to the current time.  Called by ticClock
var updateClock = function() {
     var tempClock,digit,v;
     if (showNumMoves){
       v=1;
       tempClock=numMoves;
     	} 
     else {  
       v=0;
       tempClock = clockCurrent;
     }		     
     if (tempClock == -1) { tempClock = 0; }
     digit = tempClock % 10;
     target.time1s.u = digit + v*11;
     //target.time1s.v = v;
     digit = Math.floor(tempClock / 10 % 10);
     target.time10s.u = digit + v*11;
     //target.time10s.v = v;
     digit = Math.floor(tempClock / 100 % 10);
     target.time100s.u = digit  + v*11;
     //target.time100s.v = v;
     }


// Updates the display w/ the current number of bombs left.
var updateNumBombs = function() {
   if ((!dead) && (!win) && (target.settings.openRemaining) && ((maxNumBombs-bombsFlagged) == 0)) {
      target.bomb1s.u = 10;
      target.bomb10s.u = 10;
      target.bomb100s.u = 10; }
   else {
      digit = Math.abs(maxNumBombs-bombsFlagged) % 10;
      target.bomb1s.u = digit;
      digit = Math.floor(Math.abs(maxNumBombs-bombsFlagged) / 10 % 10);
      target.bomb10s.u = digit;
      digit = Math.floor(Math.abs(maxNumBombs-bombsFlagged) / 100 % 10);
      target.bomb100s.u = digit;
      if (maxNumBombs < bombsFlagged)
         target.bomb100s.u = 10; 
      } 
      }

//
// TIME functions begin here...
//

// Clock tic. Originally called once, then it repeats every 1 second.
// no timers used at this moment, called with every click
// fixme
// for x50 hardwaretimer should be used
var ticClock = function() {
   var now;
   if (!killLastClock) {
      if (clockMoving) {
         now = new Date();
      	 clockCurrent = Math.floor((now.getTime()-clockStartTime)/1000)}
  // 	 target.bubble('tracelog','currentTime='+clockCurrent);
      if ((clockMoving) && (clockCurrent < 1000)) // Max out display at 999
         updateClock(); 
      clockActive = clockMoving;
//      if (clockActive)  {              // Always do the recursive call last
//         id = setTimeout("ticClock()",1000) } 
         }
//   killLastClock = false; 
}


// Stops the clock
//   SPECIAL NOTE: This function doesn't actually stop the clock: it
//   directs the ticClock fn to stop ticking upon its next recusrive call.
var clockStop = function() {
   clockMoving = false; }


// Stop and clear the clock.  See specal note in clockStop above.   
var clockClear = function() {
   // If we're currently moving, we need to first stop it
   if ((!clockMoving) && (clockCurrent != 0)) {
      clockCurrent = 0;
      updateClock(); }
   clockCurrent = -1;
   clockMoving = false; }


// Starts the clock.  Able to start a clear clock or restart a paused
// clock (a feature I'm not using here).
var clockStart = function() {
   var now;
   // Stop the clock (sets a temp variable for later interigation)
   clockWasActive = clockActive;
   clockMoving = true;
   now = new Date();
   clockStartTime = now.getTime();
//   target.bubble('tracelog','StartTime='+clockStartTime);
   ticClock();
   // harder part: We're still running.  Tells ticClock to kill old clock.
   if (clockWasActive) {
      killLastClock = true;  } }
      

// Since it takes so long to close, make a face...
var gameClose = function() {
   target.face.u = faceWait; }
//
var closeAllMenus = function() {
return true;
}
	
	
};
try {
  tmp();
} catch(e) {target.bubble('tracelog','error in minesweeper.js');}
tmp = undefined;
