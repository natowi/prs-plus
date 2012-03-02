//
// Interactive Fiction for Sony Reader
// by Ben Chenoweth
//
// Initial version: 2012-01-25
// Changelog:
//	2012-01-28 Ben Chenoweth - Output scrolls automatically
//	2012-01-30 Ben Chenoweth - Changed working directory so that gamesave/load works
//	2012-02-04 Ben Chenoweth - Changed input method
//	2012-02-11 Ben Chenoweth - Changed binary files and fixed output; save/restore games
//	2012-02-12 Ben Chenoweth - Removed timers; added "quit", "restart" and "score" commands
//	2012-02-13 Ben Chenoweth - Added 'quit' labels and functions; fix for nonTouch keyboard
//	2012-02-16 Ben Chenoweth - Added UP/DOWN (scroll window) and PREVIOUS (commands) buttons
//	2012-02-17 Ben Chenoweth - Use PREV/NEXT for UP/DOWN; handle game initialisation failure
//	2012-02-19 Ben Chenoweth - 'Trinity' now runs
//	2012-02-20 Ben Chenoweth - Extended compatibility list; fix for 'Trinity'; fix for listing even number of games
//	2012-02-22 Ben Chenoweth - Workaround for 'Bureaucracy' (requires externally created initial gamesave file)
//	2012-02-22 Ben Chenoweth - Workaround for 'Zork1' (disable the 'loud' room so that save/restore work); use switches
//	2012-02-25 Ben Chenoweth - More fixes for 'Trinity'
//	2012-02-26 Ben Chenoweth - Added input shortcuts (x=examine, g=again, q=quit)
//	2012-02-29 Ben Chenoweth - Renamed app; use nitfol for more recent IntFic (600/x50 only)
//	2012-03-01 Ben Chenoweth - Whitespace handled; mortlake.z8 included in PRS+ installer
//	2012-03-02 Ben Chenoweth - Fixes for 'Tangle' & 'Trinity'; error message for 'undo'

var tmp = function () {
	
	var hasNumericButtons = kbook.autoRunRoot.hasNumericButtons;
	var getSoValue = kbook.autoRunRoot.getSoValue;
	var setSoValue = kbook.autoRunRoot.setSoValue;
	var getFileContent = kbook.autoRunRoot.getFileContent;
	var setFileContent = kbook.autoRunRoot.setFileContent;
	var listFiles = kbook.autoRunRoot.listFiles;
	var deleteFile = kbook.autoRunRoot.deleteFile;
	var shellExec = kbook.autoRunRoot.shellExec;
	
	var datPath = kbook.autoRunRoot.gamesSavePath+'Frotz/';
	FileSystem.ensureDirectory(datPath);
	var tempPath = "/tmp/frotz/";
	FileSystem.ensureDirectory(tempPath);

	var mouseLeave = getSoValue(target.btn_Ok, 'mouseLeave');
	var mouseEnter = getSoValue(target.btn_Ok, 'mouseEnter');
	var shifted = false;
	var shiftOffset = 26;
	var symbols = false;
	var symbolsOffset = 52;
	var keys = [];	
	var strShift = "\u2191"; //up arrow
	var strUnShift = "\u2193"; //down arrow
	var strBack = "\u2190"; //left arrow
	var custSel = 1; // OK key
	var prevSel;
	
	var FROTZ = System.applyEnvironment("[prspPath]") + "dfrotz";
	// FROTZ options: -w: screen width, -h: number of lines,
	// 				  -R: execute runtime code (cm = compression max, lt0 = line-type display off)
	var FROTZOPTIONS = " -w 56 -h 40 -R lt0 "; // note there needs to be spaces at start and end of this string
	var NITFOL = System.applyEnvironment("[prspPath]") + "cheapnitfol";
	// NITFOL options: -q: quiet mode, -i: ignore errors, -expand: expand shorthand
	var NITFOLOPTIONS = " -q -i -expand "; // note there needs to be spaces at start and end of this string
	var INTFICIN = tempPath + "intfic.in";
	var INTFICOUT = tempPath + "intfic.out";
	var GAMETITLE = "";
	var CONFIRM = ""; // Frotz asks for confirmation if save file exists, Nitfol does not
	var EXECUTABLE = "";
	var workingDir;
	var tempOutput = "";
	var chooseGame = false;
	var savingGame = false;
	var confirmedName = false;
	var restoringGame = false;
	var quittingGame = false;
	var restartingGame = false;
	var scoreCheck = false;
	var saveName = "story.sav";
	var titles = [];
	var pageScroll;
	var strUp = "\u2191";
	var strDown = "\u2193";
	var previousCommands = [];
	var previousCommandNum = 0;
	var startGame;
	var restoreTemp;
	var restoreUser;
	var saveTemp;
	var saveUser;
	var quitGame;
	var initialInput;
	var useFrotz;
	var quitMessage;
	var restartMessage;
	var saveSuccessMessage;
	var restoreSuccessMessage;
	var failMessage;
	var loudRoomDisabled = false;
		
	var twoDigits = function (i) {
		if (i<10) {return "0"+i}
		return i;	
	}

	target.loadKeyboard = function () {
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

		// put keys on buttons
		for (i=1; i<=26; i++) {
			setSoValue(target['key'+twoDigits(i)], 'text', keys[i-1]);
		}
	
		//simplify some labels
		setSoValue(target.BACK, 'text', strBack);
		setSoValue(target.SHIFT, 'text', strShift);
		setSoValue(target.SPACE, 'text', "");
		setSoValue(target.BUTTON_UPP, 'text', strUp);
		setSoValue(target.BUTTON_DWN, 'text', strDown);
		
		// highlight OK button for nonTouch
		if (hasNumericButtons) {
			custSel = 5;
			target.ntHandleEventsDlg();
		}
		return;
	}
	
	target.init = function () {
		//target.bubble("tracelog","initialising...");
		this.appTitle.setValue(kbook.autoRunRoot._title);
		this.appIcon.u = kbook.autoRunRoot._icon;
		try {
			pageScroll = getSoValue(this.frotzText, 'scrollPage');
		} catch (ignore) { }
		this.enable(true);
		this.loadKeyboard();		
		if (hasNumericButtons) {
			this.touchLabel1.show(false);
			//this.frotzScroll.show(false);
		} else {
			this.nonTouch1.show(false);
		}
		previousCommands.push(""); // start previous commands list with a blank entry
		this.loadGameList();
	}

	target.setOutput = function (output) {
		this.frotzText.setValue(output);
		try {
			pageScroll.call(this.frotzText, true, 1);
		}
		catch (ignore) { }
	}
	
	target.loadGameList = function () {
		var items, filesMissingError, itemNum, noZeroItemNum, noZeroItemNum2, numRows, rowNum, extraRow, midItem, addSpaces;
		items = listFiles(datPath);
		if (items.length == 0) {
			filesMissingError = "Error:\nThere are no files in the game directory.\nPlease connect your reader to a PC and copy the game files into the Frotz folder located in the PRS+ GamesSave folder."
			this.setOutput(filesMissingError);
			currentLine = "quit";
			target.currentText.setValue(currentLine);
			target.setVariable("current_line",currentLine);
		} else {
			titles.length = 0;	
			tempOutput = "Enter the number of the game you want to run:";
			if (items.length > 14) {
				// use two columns
				numRows = (Math.floor(items.length / 2));
				if (items.length % 2 === 1) {
					extraRow = true;
					midItem = numRows + 1;
				} else {
					extraRow = false;
					midItem = numRows;
				}
				for (rowNum = 0; rowNum < numRows; rowNum++) {
					noZeroItemNum = rowNum + 1;
					noZeroItemNum2 = midItem + rowNum + 1;
					tempOutput = tempOutput + "\n" + noZeroItemNum + ": " + items[rowNum];
					for (addSpaces = 0; addSpaces < 28 - items[rowNum].length; addSpaces++) {
						tempOutput = tempOutput + " ";
					}
					if (rowNum < 9) tempOutput = tempOutput + " "; // extra space for first 9 rows
					tempOutput = tempOutput + noZeroItemNum2 + ": " + items[midItem + rowNum];
				}
				// handle odd number of entries
				if (extraRow) {
					tempOutput = tempOutput + "\n" + midItem + ": " + items[midItem - 1];
				}
				// now push all titles in order
				for (itemNum = 0; itemNum < items.length; itemNum++) {
					titles.push(items[itemNum]);
				}
			} else {
				// use one column
				for (itemNum = 0; itemNum < items.length; itemNum++) {
					titles.push(items[itemNum]);
					noZeroItemNum = itemNum + 1;
					tempOutput = tempOutput + "\n" + noZeroItemNum + ": " + items[itemNum];
				}
			}
			tempOutput = tempOutput + "\n";
			this.setOutput(tempOutput);
			chooseGame = true;
			
			// change keyboard to show numbers (and move selection to "1")
			custSel = 7; // "1" when symbols showing
			symbols = true;
			this.refreshKeys();
		}
		
	}
	
	target.initialiseGame = function () {
		var lowerGameTitle, cmd, result;
		if (GAMETITLE !== "") {
			// set up game-specific save/load/quit commands
			lowerGameTitle = GAMETITLE.toLowerCase();
			lowerGameTitle = lowerGameTitle.substring(0, lowerGameTitle.lastIndexOf(".")); //strip extension
			
			// default strings
			startGame = "";
			saveTemp = "save\ntemp.sav\n";
			restoreTemp = "restore\ntemp.sav\n";
			saveUser = "save\n";
			restoreUser = "restore\n";
			quitGame = "quit\nY\n";
			quitMessage = "Are you sure you want to quit? (y/n) ";
			restartMessage = "Are you sure you want to restart? (y/n) ";
			saveSuccessMessage = "OK.";
			restoreSuccessMessage = "OK.";
			failMessage = "Failed.";
			initialInput = "";
			
			// modify if needed for specific games
			switch(lowerGameTitle) {
				// INFOCOM GAMES
				case "amfv":
					useFrotz = true;
					startGame = "\n";
					break;
				case "ballyhoo":
					useFrotz = true;
					break;
				case "borderzone":
					useFrotz = true;
					startGame = "1\n"; // to start Chapter 1
					break;
				case "bureau":
					useFrotz = true;
					workingDir = datPath + GAMETITLE.substring(0, GAMETITLE.indexOf(".")) + "/";
					FileSystem.ensureDirectory(workingDir);

					result = getFileContent(workingDir + "userinput.sav", "222");
					if (result === "222") {
						tempOutput = tempOutput + "\nTo play Bureaucracy you will first need to play the game on another computer since the start of this game is unfortunately not compatible with the reader.  Once you have answered the initial questions, save your game, call it 'userinput.sav' and then copy it into the game's save folder on your reader.  You will then be able to continue playing from there...\n\nFor now, please choose another game from the list...\n";
						this.setOutput(tempOutput);
						
						chooseGame = true;
					
						// change keyboard to show numbers (and move selection to "1")
						custSel = 7; // "1" when symbols showing
						symbols = true;
						this.refreshKeys();
						return;
					} else {
						initialInput = restoreUser+"userinput.sav\n"+saveTemp+quitGame;
					}
					break;
				case "enchanter":
					useFrotz = true;
					break;
				case "hhgg":
				case "hitchhik":
					useFrotz = true;
					quitGame = "quit\nY\nY\n";
					break;
				case "infidel":
					useFrotz = true;
					break;
				case "lurking":
					useFrotz = true;
					break;
				case "moonmist":
					useFrotz = true;
					break;
				case "phobos":
					useFrotz = true;
					startGame = "\n";
					break;
				case "planetfall":
					useFrotz = true;
					break;
				case "plunderer":
					useFrotz = true;
					startGame = "\n";
					break;
				case "sorcerer":
					useFrotz = true;
					break;
				case "spellbreaker":
					useFrotz = true;
					break;
				case "stationfall":
					useFrotz = true;
					break;
				case "suspect":
					useFrotz = true;
					break;
				case "suspended":
					useFrotz = true;
					break;
				case "trinity":
					useFrotz = true;
					FROTZOPTIONS = " -w 112 -h 40 -R lt0 "; // game won't play if width less than 62 (instead use a width that's approximately twice the reader screen width)
					startGame = "\n";
					break;
				case "wishbringer":
					useFrotz = true;
					break;
				case "witness":
					useFrotz = true;
					break;
				case "zork1":
					useFrotz = true;
					break;
				case "zork2":
					useFrotz = true;
					break;
				case "zork3":
					useFrotz = true;
					break;
					
				// INTERACTIVE FICTION
				case "anchor":
					useFrotz = false;
					startGame = "\n\n\n";
					break;
				case "bronze":
					useFrotz = false;
					startGame = "Y\n";
					break;
				case "curses":
					useFrotz = false;
					startGame = "\n";
					break;
				case "lostpig":
					useFrotz = false;
					quitMessage = "Really all done with story? ";
					restartMessage = "Really start all over? ";
					failMessage = "Oops, that not work.";
					break;
				case "slouch":
					useFrotz = false;
					quitMessage = "/(?? QUITleaveenddone ??)\\ ";
					restartMessage = "/(?? RESTARTperiodfirstrevisit ??)\\ ";
					saveSuccessMessage = "/(pointrememberingSAVEstoresafekeep)\\";
					restoreSuccessMessage = "/(yesunfoldingbackwardsRESTORErenewpointtimespace)\\";
					failMessage = "/(failednullRESTOREbackconfusion)\\";
					break;
					
				default:
					useFrotz = false;
			}
			
			if (initialInput === "") {
				initialInput = startGame+saveTemp+quitGame;
			}
			
			if (!FileSystem.getFileInfo(NITFOL)) {
				useFrotz = true; // 505/300 do not have NITFOL
			}
			
			if (useFrotz) {
				CONFIRM = "Y\n";
				EXECUTABLE = FROTZ + FROTZOPTIONS;
			} else {
				CONFIRM = "";
				EXECUTABLE = NITFOL + NITFOLOPTIONS;
			}
			
			try {
				// delete old output file if it exists
				deleteFile(INTFICOUT);
				
				// create input file (deletes file if it already exists)
				setFileContent(INTFICIN, initialInput);
				
				// create working directory (where savegames go) if it doesn't already exist
				workingDir = datPath + GAMETITLE.substring(0, GAMETITLE.indexOf(".")) + "/";
				FileSystem.ensureDirectory(workingDir);
				
				// delete old temp save if it exists
				deleteFile(workingDir + "temp.sav");
				
				// move to working directory and start executable
				cmd = "cd " + workingDir + ";" + EXECUTABLE + datPath + GAMETITLE + " < " + INTFICIN + " > " + INTFICOUT;
				shellExec(cmd);
				
				// clear textbox
				tempOutput = "";
				
				this.getResponse();
			} catch(e) {
				//tempOutput = tempOutput + "\nError " + e + " initialising game "+GAMETITLE;
				
				tempOutput = tempOutput + "Unfortunately, that game failed to initialise.\nPlease choose another game from the list...\n";
				this.setOutput(tempOutput);
				chooseGame = true;
			
				// change keyboard to show numbers (and move selection to "1")
				custSel = 7; // "1" when symbols showing
				symbols = true;
				this.refreshKeys();
			}
		} else {
			tempOutput = tempOutput + "\nError:\nNo valid game title found.";
			this.setOutput(tempOutput);
		}
	}
	
	target.doOK = function () {
		var currentLine, itemNum, stream, timer;
		// get currentLine
		currentLine = target.getVariable("current_line");
		
		if (chooseGame) {
			// convert input to number and look for respective GAMETITLE
			itemNum = parseInt(currentLine);
			if ((itemNum <= titles.length) && (itemNum > 0)) {
				itemNum--;
				GAMETITLE = titles[itemNum];
				chooseGame = false;
				symbols = false;
				shifted = false;
				this.refreshKeys();
				this.initialiseGame();
			}
		} else {
			// process input replacing shortcuts
			if (currentLine.substring(0,2) === "x ") {
				currentLine = "examine " + currentLine.substring(2);
			} else if (currentLine === "q") {
				currentLine = "quit";
			} else if (currentLine.substring(0,2) === "t ") {
				currentLine = "take " + currentLine.substring(2);
			} else if (currentLine === "g") {
				currentLine = previousCommands[previousCommands.length-1];
			}
			
			// update currentLine
			target.currentText.setValue(currentLine);
			target.setVariable("current_line",currentLine);
			
			// add command to previousCommands array
			if (currentLine !== "") {
				previousCommands.push(currentLine);
			}
			previousCommandNum = 0;
			
			if ((savingGame) && (!confirmedName)) {
				// input should be saveName (use existing name if blank)
				if (currentLine !== "") {
					saveName = currentLine;
				}
				if (FileSystem.getFileInfo(workingDir + saveName)) {
					// file exists
					confirmedName = true;
					tempOutput = tempOutput + currentLine + "\nOverwrite existing file? (y/n) ";
					this.setOutput(tempOutput);
				} else {
					// restore temp.sav and then save to user saveName
					deleteFile(INTFICOUT);
					setFileContent(INTFICIN, startGame+restoreTemp+saveUser+saveName+"\n"+quitGame);
					cmd = "cd " + workingDir + ";" + EXECUTABLE + datPath + GAMETITLE + " < " + INTFICIN + " > " + INTFICOUT;
					shellExec(cmd);
					savingGame = false;
					tempOutput = tempOutput + currentLine + "\n" + saveSuccessMessage + "\n\n>";
					this.setOutput(tempOutput);
				}
			} else if ((savingGame) && (confirmedName)) {
				// input should be Y or N
				if ((currentLine === "Y") || (currentLine === "y")) {
					// restore temp.sav and then save to user saveName (overwriting existing file)
					deleteFile(INTFICOUT);
					setFileContent(INTFICIN, startGame+restoreTemp+saveUser+saveName+"\n"+CONFIRM+quitGame);
					cmd = "cd " + workingDir + ";" + EXECUTABLE + datPath + GAMETITLE + " < " + INTFICIN + " > " + INTFICOUT;
					shellExec(cmd);
					savingGame = false;
					confirmedName = false;
					tempOutput = tempOutput + currentLine + "\n" + saveSuccessMessage + "\n\n>";
					this.setOutput(tempOutput);
				} else {
					savingGame = false;
					confirmedName = false;
					tempOutput = tempOutput + currentLine + "\n" + failMessage + "\n\n>";
					this.setOutput(tempOutput);
				}
			} else if (restoringGame) {
				// input should be saveName (use existing name if blank)
				if (currentLine !== "") {
					saveName = currentLine;
				}
				if (FileSystem.getFileInfo(workingDir + saveName)) {
					// restore user saveName and then save to temp.sav
					deleteFile(INTFICOUT);
					setFileContent(INTFICIN, startGame+restoreUser+saveName+"\n"+saveTemp+CONFIRM+quitGame);
					cmd = "cd " + workingDir + ";" + EXECUTABLE + datPath + GAMETITLE + " < " + INTFICIN + " > " + INTFICOUT;
					shellExec(cmd);
					restoringGame = false;
					tempOutput = tempOutput + currentLine + "\n" + restoreSuccessMessage + "\n\n>";
					this.setOutput(tempOutput);
				} else {
					restoringGame = false;
					tempOutput = tempOutput + currentLine + "\n" + failMessage + "\n\n>";
					this.setOutput(tempOutput);
				}
			} else if (quittingGame) {
				// input should be Y or N
				if ((currentLine === "Y") || (currentLine === "y")) {
					this.doQuit();
				} else {
					quittingGame = false;
					tempOutput = tempOutput + currentLine + "\nOK.\n\n>";
					this.setOutput(tempOutput);
				}
			} else if (restartingGame) {
				// input should be Y or N
				if ((currentLine === "Y") || (currentLine === "y")) {
					restartingGame = false;
					
					// delete old output file if it exists
					deleteFile(INTFICOUT);
					
					// create input file (deletes file if it already exists)
					setFileContent(INTFICIN, initialInput);
					
					// delete old temp save
					deleteFile(workingDir + "temp.sav");
					
					// move to working directory and start executable
					cmd = "cd " + workingDir + ";" + EXECUTABLE + datPath + GAMETITLE + " < " + INTFICIN + " > " + INTFICOUT;
					shellExec(cmd);
					
					// clear textbox
					tempOutput = "";
					loudRoomDisabled = false; // just in case current game is zork1
					
					this.getResponse();
				} else {
					restartingGame = false;
					tempOutput = tempOutput + currentLine + "\nOK.\n\n>";
					this.setOutput(tempOutput);
				}
			} else {
				// check for save/restore commands
				if (currentLine === "save") {
					savingGame = true;
					confirmedName = false;
					tempOutput = tempOutput + currentLine + "\nPlease enter a filename ["+saveName+"]: ";
					this.setOutput(tempOutput);
				} else if (currentLine === "restore") {
					restoringGame = true;
					tempOutput = tempOutput + currentLine + "\nPlease enter a filename ["+saveName+"]: ";
					this.setOutput(tempOutput);
				} else if ((currentLine === "quit") || (currentLine === "exit")) {
					quittingGame = true;
					tempOutput = tempOutput + currentLine + "\n" + quitMessage;
					this.setOutput(tempOutput);
				} else if (currentLine === "restart") {
					restartingGame = true;
					tempOutput = tempOutput + currentLine + "\n" + restartMessage;
					this.setOutput(tempOutput);
				} else if (currentLine === "score") {
					// pass special command to executable
					// delete old output file if it exists
					deleteFile(INTFICOUT);
					
					// add currentLine to output
					tempOutput = tempOutput + currentLine;
					this.setOutput(tempOutput);

					// set up new input file (extra RETURN after currentLine needed for hhgg)
					setFileContent(INTFICIN, startGame+restoreTemp+currentLine+"\n\n"+saveTemp+CONFIRM+quitGame);
					cmd = "cd " + workingDir + ";" + EXECUTABLE + datPath + GAMETITLE + " < " + INTFICIN + " > " + INTFICOUT;
					shellExec(cmd);
					
					scoreCheck = true;
					this.getResponse();
				} else if (currentLine === "undo") {
					tempOutput = tempOutput + currentLine + "\nUnfortunately, undo is not compatible with this Interactive Fiction app.  Sorry!\n\n>";
					this.setOutput(tempOutput);
				} else {
					// pass command to executable
					// delete old output file if it exists
					deleteFile(INTFICOUT);
					
					// add currentLine to output
					tempOutput = tempOutput + currentLine;
					this.setOutput(tempOutput);
					
					// set up new input file
					setFileContent(INTFICIN, startGame+restoreTemp+currentLine+"\n"+saveTemp+CONFIRM+quitGame);
					cmd = "cd " + workingDir + ";" + EXECUTABLE + datPath + GAMETITLE + " < " + INTFICIN + " > " + INTFICOUT;
					shellExec(cmd);
					
					this.getResponse();
				}
			}
		}
		// clear currentLine
		currentLine = "";
		target.currentText.setValue(currentLine);
		target.setVariable("current_line",currentLine);		
		return;
	}
	
	target.getResponse = function () {
		var result, lowerGameTitle, charPos, charPos2;
		
		result = getFileContent(INTFICOUT, "222");
		if (result !== "222") {
			/*/ output files for debugging
			if (FileSystem.getFileInfo("/Data/frotz0.out")) {
				cmd = "cp "+INTFICOUT+" /Data/frotz1.out";
				shellExec(cmd);
			} else {
				cmd = "cp "+INTFICOUT+" /Data/frotz0.out";
				shellExec(cmd);
			}*/
			
			// output
			if (tempOutput === "") {
				// first run
				lowerGameTitle = GAMETITLE.toLowerCase();
				lowerGameTitle = lowerGameTitle.substring(0, lowerGameTitle.lastIndexOf(".")); //strip extension
				
				// initial removals
				result = result.replace("Line-type display OFF", ""); // FROTZ output
				result = result.replace("Welcome to the Cheap Glk Implementation, library version 1.0.3.", ""); // NITFOL output
				result = result.replace("Have you played interactive fiction before? >", ""); //bronze
				result = result.replace("[Press any key to begin.]", ""); // trinity (and presumably others)
				result = result.replace(/\n{2,}/g, '\n\n'); // deal with unnecessary whitespace
				
				// initial replacements
				result = result.replace("<PERSON>", "[PERSON]");
				result = result.replace("<TOPIC>", "[TOPIC]");
				result = result.replace("<ORDER>", "[ORDER]");
				
				switch(lowerGameTitle) {
					case "borderzone":
						charPos = result.indexOf(">")+1; // need to include first '>'
						charPos = result.indexOf(">", charPos);
						result = result.substring(0, charPos);
						break;
					case "bureau":
						charPos = result.indexOf("[RESTORE completed.]")+21;
						charPos2 = result.indexOf(">", charPos);
						result = result.substring(charPos, charPos2);
						break;
					default:
						// trim save/quit lines at end of output
						result = result.substring(0, result.indexOf(">"));
				}
				
				tempOutput = result + ">";
				this.frotzText.setValue(tempOutput);
				
			} else {
				// initial removals
				result = result.replace("Have you played interactive fiction before? >", ""); //bronze
				
				// trim initial/restore lines at start of output
				result = result.substring(result.indexOf(">")+1);
				result = result.substring(result.indexOf(">")+1);
				
				if (scoreCheck) {
					if ((result.indexOf("ENTER") > 0) || (result.indexOf("RETURN") > 0)) {
						// remove bracketed part of output and extra ">"
						result = result.substring(0, result.indexOf("(")) + result.substring(result.indexOf(">")+1);
					}
					scoreCheck = false;
				}
				
				// trim save/quit lines at end of output
				charPos = result.indexOf(" -> "); // nitfol uses this when expanding/correcting
				if (charPos > 0) {
					result = result.substring(0, result.indexOf(">", charPos + 4));
				} else {
					result = result.substring(0, result.indexOf(">"));
				}
				
				// extra check for special cases
				result = this.extraCheck(result);
				
				tempOutput = tempOutput + "\n"+result + ">";
				this.setOutput(tempOutput);
			}
		} else {
			// no output file!
			tempOutput = tempOutput + "\nNo output found!";
			this.setOutput(tempOutput);
		}	
	}
	
	target.extraCheck = function (previousresult) {
		var lowerGameTitle, currentLine, result, cmd, getNewResult, charPos, charPos;
				
		// check for problematic help (used in more recent IntFic)
		if (previousresult.indexOf("Q = resume game") > 0) {
			previousresult = "Unfortunately, the help in this game involves a menu system which is not compatible with this Interactive Fiction app.  Sorry!\n\n";
			return previousresult;
		}
		
		previousresult = previousresult.replace("UNDO your last move, ", ""); // undo doesn't work on the PRS+
				
		// game-specific checks
		lowerGameTitle = GAMETITLE.toLowerCase();
		lowerGameTitle = lowerGameTitle.substring(0, lowerGameTitle.lastIndexOf(".")); //strip extension
		currentLine = target.getVariable("current_line");
		getNewResult = false;
		switch(lowerGameTitle) {
			case "trinity":
				result = getFileContent(INTFICOUT, "222");
				if (previousresult.indexOf("T    R    I    N    I    T    Y")>0) {
					// set up new input file
					setFileContent(INTFICIN, startGame+restoreTemp+currentLine+"\n\n"+saveTemp+CONFIRM+quitGame); // extra return needed
					getNewResult = true;
				} else if (previousresult.indexOf("purpose of the calligraphy")>0) {
					// trim initial/restore lines at start of output
					result = result.substring(result.indexOf(">")+1);
					result = result.substring(result.indexOf(">")+1);

					// skip three ">" (part of the contents of the book in the cottage)
					charPos = result.indexOf(">")+1;
					charPos = result.indexOf(">", charPos); // marks location of middle ">"
					charPos2 = result.indexOf(">", charPos + 1);
					
					// remove second book entry and trim save/quit lines at end of output
					result = result.substring(0, charPos) + result.substring(charPos2, result.indexOf(">", charPos2 + 1));
					result = result.replace("few incantations", "two incantations");
					return result;
				} else if (result.indexOf("You surrender a silver coin you didn't know you had")>0) {
					// trim initial/restore lines at start of output
					result = result.substring(result.indexOf(">")+1);
					result = result.substring(result.indexOf(">")+1);
					result = result.substring(result.indexOf(">")+currentLine.length+2); // skip player input
			
					// trim save/quit lines at end of output
					result = result.substring(0, result.indexOf(">"));
					return result;
				} else if ((result.indexOf("Are you sure you want to go that way?")>0) || (result.indexOf("Are you sure you want to go over that cliff?")>0)) {
					// set up new input file
					setFileContent(INTFICIN, startGame+restoreTemp+currentLine+"\nY\n"+saveTemp+CONFIRM+quitGame); // just answer 'YES'
					cmd = "cd " + workingDir + ";" + EXECUTABLE + datPath + GAMETITLE + " < " + INTFICIN + " > " + INTFICOUT;
					shellExec(cmd);
					result = getFileContent(INTFICOUT, "222");
					if (result !== "222") {
						// trim initial/restore lines at start of output
						result = result.substring(result.indexOf(">")+1);
						result = result.substring(result.indexOf(">")+1);
						result = result.substring(result.indexOf(">")+1);
						
						// trim save/quit lines at end of output
						result = result.substring(0, result.indexOf(">"));
						return result;
					}
				}
				break;
			case "phobos":
				if (previousresult.indexOf("Scratch 'n' sniff spot")>0) {
					// set up new input file
					setFileContent(INTFICIN, startGame+restoreTemp+currentLine+"\n\n"+saveTemp+CONFIRM+quitGame); // extra return needed
					getNewResult = true;
				}
				break;
			case "borderzone":
				// need to get output again and reprocess it
				result = getFileContent(INTFICOUT, "222");
				if (result !== "222") {
					// trim initial/restore lines at start of output
					result = result.substring(result.indexOf(">")+1);
					result = result.substring(result.indexOf(">")+1);
					result = result.substring(result.indexOf(">")+1);
				
					// trim save/quit lines at end of output
					result = result.substring(0, result.indexOf(">"));
					return result;
				}
				break;
			case "bureau":
				// need to get output again and reprocess it
				result = getFileContent(INTFICOUT, "222");
				if (result !== "222") {
					// trim initial/restore lines at start of output
					charPos = result.indexOf("[RESTORE completed.]");
					charPos = result.indexOf(">", charPos)+1;
					result = result.substring(charPos, result.indexOf(">", charPos));
					return result;
				}
				break;
			case "zork1":
				if ((!loudRoomDisabled) && ((previousresult.indexOf("Round Room")>0) || (previousresult.indexOf("Deep Canyon")>0))) {
					// player is adjacent to the 'loud' room, so start adding 'echo' to the input
					saveTemp = "echo\nsave\ntemp.sav\n"; // disables the 'loud' room to make save/restore work
				} else if ((!loudRoomDisabled) && (previousresult.indexOf("Loud Room")>0)) {
					// 'loud' room now disabled, so no need to start adding 'echo' to the input
					saveTemp = "save\ntemp.sav\n";
					previousresult = previousresult + ">echo\nThe acoustics of the room change subtly.\n\n";
					loudRoomDisabled = true;
				}
				break;
			case "tangle":
				charPos = previousresult.indexOf("[Hit any key.]");
				if (charPos > 0) {
					if (previousresult.indexOf("[Hit any key.]", charPos + 1)>0) {
						setFileContent(INTFICIN, startGame+restoreTemp+currentLine+"\n\n\n"+saveTemp+CONFIRM+quitGame); // need two extra returns
					} else {
						setFileContent(INTFICIN, startGame+restoreTemp+currentLine+"\n\n"+saveTemp+CONFIRM+quitGame); // extra return needed
					}
					getNewResult = true;
				}
				break;
			default:
		}
		
		if (previousresult.indexOf("Would you like to RESTART, RESTORE a saved game, or QUIT?")>0) {
			setFileContent(INTFICIN, startGame+restoreTemp+currentLine+"\n\n"+quitGame); // can't save, so just quit (extra return just in case)
			getNewResult = true;
		}

		if (getNewResult) {
			cmd = "cd " + workingDir + ";" + EXECUTABLE + datPath + GAMETITLE + " < " + INTFICIN + " > " + INTFICOUT;
			shellExec(cmd);
			result = getFileContent(INTFICOUT, "222");
			if (result !== "222") {
				// trim initial/restore lines at start of output
				result = result.substring(result.indexOf(">")+1);
				result = result.substring(result.indexOf(">")+1);
				
				// trim save/quit lines at end of output
				charPos = result.indexOf(" -> "); // nitfol uses this when expanding/correcting
				if (charPos > 0) {
					result = result.substring(0, result.indexOf(">", charPos + 1));
				} else {
					result = result.substring(0, result.indexOf(">"));
				}
				
				if (!useFrotz) {
					result = this.removeWhiteSpace(result);
				}
				return result;
			}
		} else {
			if (!useFrotz) {
				previousresult = this.removeWhiteSpace(previousresult);
			}
			return previousresult;
		}
	}
	
	target.removeWhiteSpace = function (outputstring) {
		// remove multiple (more than 2) new line characters
		outputstring = outputstring.replace(/\n{2,}/g, '\n\n');

		// any final NITFOL-specific removals?
		outputstring = outputstring.replace("Welcome to the Cheap Glk Implementation, library version 1.0.3.\n\n", "");
		outputstring = outputstring.replace("[Hit any key.]", ""); //tangle	
		return outputstring;
	}

	target.doQuit = function () {	
		// delete temp save
		deleteFile(workingDir + "temp.sav");
		deleteFile(INTFICIN);
		deleteFile(INTFICOUT);
		
		kbook.autoRunRoot.exitIf(kbook.model);
		return;
	}

	target.doRoot = function () {
		this.doQuit();
		return;
	}
	
	target.doHold0 = function () {
		this.doQuit();
		return;
	}
	
	target.doButtonClick = function (sender) {
		var id, n, numCommands;
		id = getSoValue(sender, "id");
		n = id.substring(7, 10);
		if (n == "UPP") {
			// scroll frotzText textbox up
			try {
				pageScroll.call(this.frotzText, true, -1);
			}
			catch (ignore) { }
			return;
		}
		if (n == "DWN") {
			// scroll frotzText textbox down
			try {
				pageScroll.call(this.frotzText, true, 1);
			}
			catch (ignore) { }
			return;
		}		
		if (n == "PRE") {
			// copy previous command into command box
			numCommands = previousCommands.length;
			if (numCommands !== 0) {
				if (previousCommandNum <= 1) {
					previousCommandNum = numCommands;
				} else {
					previousCommandNum--;
				}
				// replace currentLine with previous command
				currentLine = previousCommands[previousCommandNum-1];
				target.currentText.setValue(currentLine);
				target.setVariable("current_line",currentLine);
			}
			return;
		}		
	}
	
	target.doPrevious = function () {
		// scroll frotzText textbox up
		try {
			pageScroll.call(this.frotzText, true, -1);
		}
		catch (ignore) { }
		return;
	}

	target.doNext = function () {
		// scroll frotzText textbox down
		try {
			pageScroll.call(this.frotzText, true, 1);
		}
		catch (ignore) { }
		return;
	}

	target.doMark = function () {
		return;
	}
		
	target.doSize = function () {
		return;
	}
	
	target.doOption = function () {
		return;
	}
	
	target.doMenu = function () {
		return;
	}
	
	target.refreshKeys = function () {
		var i,n,key;
		n = -1;
		if (shifted) {
			n = n + shiftOffset;
			setSoValue(target.SHIFT, 'text', strUnShift);
			mouseEnter.call(target.SHIFT);
			mouseLeave.call(target.SHIFT);
		} else {
			setSoValue(target.SHIFT, 'text', strShift);
			mouseEnter.call(target.SHIFT);
			mouseLeave.call(target.SHIFT);
		}
		if (symbols) {
			n = n + symbolsOffset;
			setSoValue(target.SYMBOL, 'text', "Abc");
			mouseEnter.call(target.SYMBOL);
			mouseLeave.call(target.SYMBOL);
		} else {
			setSoValue(target.SYMBOL, 'text', "Symbols");
			mouseEnter.call(target.SYMBOL);
			mouseLeave.call(target.SYMBOL);
		}
		for (i=1; i<=26; i++) {
			key = 'key'+twoDigits(i);
			setSoValue(target[key], 'text', keys[n+i]);
			mouseEnter.call(target[key]);
			mouseLeave.call(target[key]);
		}
		if (hasNumericButtons) {
			// highlight active key
			this.ntHandleEventsDlg
		}
	}

	target.doSpace = function () {
		// ADD A SPACE
		var currentLine = target.getVariable("current_line");
		currentLine = currentLine + " ";
		target.currentText.setValue(currentLine);
		target.setVariable("current_line",currentLine);
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
		var currentLine = target.getVariable("current_line");
		currentLine = currentLine.slice(0,currentLine.length-1);
		target.currentText.setValue(currentLine);
		target.setVariable("current_line",currentLine);
	}
	
	target.doKeyPress = function (sender) {
		var id = getSoValue(sender, "id");
		this.addCharacter(id);
		return;
	}
	
	target.addCharacter = function (id) {
		var n = parseInt(id.substring(3, 5));
		if (symbols) { n = n + symbolsOffset };
		if (shifted) { n = n + shiftOffset };
		var character = keys[n-1];
		var currentLine = target.getVariable("current_line");
		currentLine = currentLine + character;
		target.currentText.setValue(currentLine);
		target.setVariable("current_line",currentLine);		
	}

	target.ntHandleEventsDlg = function () {
		if (custSel === 1) {
			mouseEnter.call(target.BUTTON_UPP);
			mouseLeave.call(target.BUTTON_DWN);
		}
		if (custSel === 2) {
			mouseLeave.call(target.btn_Ok);
			mouseEnter.call(target.BUTTON_DWN);
			mouseLeave.call(target.BUTTON_UPP);
		}
		if (custSel === 5) {
			mouseEnter.call(target.btn_Ok);
			mouseLeave.call(target.BUTTON_DWN);
			mouseLeave.call(target.BUTTON_PRE);
			mouseLeave.call(target.key01);
			mouseLeave.call(target.key02);
			mouseLeave.call(target.key03);
			mouseLeave.call(target.key04);
			mouseLeave.call(target.key05);
			mouseLeave.call(target.key06);
			mouseLeave.call(target.key07);
			mouseLeave.call(target.key08);
			mouseLeave.call(target.key09);
			mouseLeave.call(target.key10);
		}
		if (custSel === 6) {
			mouseLeave.call(target.btn_Ok);
			mouseEnter.call(target.BUTTON_PRE);
			mouseLeave.call(target.key10);
		}
		if (custSel === 7) {
			mouseEnter.call(target.key01);
			mouseLeave.call(target.key02);
			mouseLeave.call(target.key11);
		}
		if (custSel === 8) {
			mouseLeave.call(target.key01);
			mouseEnter.call(target.key02);
			mouseLeave.call(target.key03);
			mouseLeave.call(target.key12);
		}
		if (custSel === 9) {
			mouseLeave.call(target.key02);
			mouseEnter.call(target.key03);
			mouseLeave.call(target.key04);
			mouseLeave.call(target.key13);
		}
		if (custSel === 10) {
			mouseLeave.call(target.key03);
			mouseEnter.call(target.key04);
			mouseLeave.call(target.key05);
			mouseLeave.call(target.key14);
		}
		if (custSel === 11) {
			mouseLeave.call(target.key04);
			mouseEnter.call(target.key05);
			mouseLeave.call(target.key06);
			mouseLeave.call(target.key15);
		}
		if (custSel === 12) {
			mouseLeave.call(target.key05);
			mouseEnter.call(target.key06);
			mouseLeave.call(target.key07);
			mouseLeave.call(target.key16);
		}
		if (custSel === 13) {
			mouseLeave.call(target.key06);
			mouseEnter.call(target.key07);
			mouseLeave.call(target.key08);
			mouseLeave.call(target.key17);
		}
		if (custSel === 14) {
			mouseLeave.call(target.key07);
			mouseEnter.call(target.key08);
			mouseLeave.call(target.key09);
			mouseLeave.call(target.key18);
		}
		if (custSel === 15) {
			mouseLeave.call(target.key08);
			mouseEnter.call(target.key09);
			mouseLeave.call(target.key10);
			mouseLeave.call(target.key19);
		}
		if (custSel === 16) {
			mouseLeave.call(target.key09);
			mouseEnter.call(target.key10);
			mouseLeave.call(target.btn_Ok);
			mouseLeave.call(target.BUTTON_PRE);
		}
		if (custSel === 17) {
			mouseLeave.call(target.key01);
			mouseEnter.call(target.key11);
			mouseLeave.call(target.key12);
			mouseLeave.call(target.SHIFT);
		}
		if (custSel === 18) {
			mouseLeave.call(target.key02);
			mouseLeave.call(target.key11);
			mouseEnter.call(target.key12);
			mouseLeave.call(target.key13);
			mouseLeave.call(target.key20);
		}
		if (custSel === 19) {
			mouseLeave.call(target.key03);
			mouseLeave.call(target.key12);
			mouseEnter.call(target.key13);
			mouseLeave.call(target.key14);
			mouseLeave.call(target.key21);
		}
		if (custSel === 20) {
			mouseLeave.call(target.key04);
			mouseLeave.call(target.key13);
			mouseEnter.call(target.key14);
			mouseLeave.call(target.key15);
			mouseLeave.call(target.key22);
		}
		if (custSel === 21) {
			mouseLeave.call(target.key05);
			mouseLeave.call(target.key14);
			mouseEnter.call(target.key15);
			mouseLeave.call(target.key16);
			mouseLeave.call(target.key23);
		}
		if (custSel === 22) {
			mouseLeave.call(target.key06);
			mouseLeave.call(target.key15);
			mouseEnter.call(target.key16);
			mouseLeave.call(target.key17);
			mouseLeave.call(target.key24);
		}
		if (custSel === 23) {
			mouseLeave.call(target.key07);
			mouseLeave.call(target.key16);
			mouseEnter.call(target.key17);
			mouseLeave.call(target.key18);
			mouseLeave.call(target.key25);
		}
		if (custSel === 24) {
			mouseLeave.call(target.key08);
			mouseLeave.call(target.key17);
			mouseEnter.call(target.key18);
			mouseLeave.call(target.key19);
			mouseLeave.call(target.key26);
		}
		if (custSel === 25) {
			mouseLeave.call(target.key09);
			mouseLeave.call(target.key10);
			mouseLeave.call(target.key18);
			mouseEnter.call(target.key19);
		}
		if (custSel === 26) {
			mouseLeave.call(target.key11);
			mouseLeave.call(target.key20);
			mouseEnter.call(target.SHIFT);
			mouseLeave.call(target.SYMBOL);
		}
		if (custSel === 27) {
			mouseLeave.call(target.key12);
			mouseLeave.call(target.SHIFT);
			mouseEnter.call(target.key20);
			mouseLeave.call(target.key21);
			mouseLeave.call(target.SYMBOL);
		}
		if (custSel === 28) {
			mouseLeave.call(target.key13);
			mouseLeave.call(target.key20);
			mouseEnter.call(target.key21);
			mouseLeave.call(target.key22);
			mouseLeave.call(target.SPACE);
		}
		if (custSel === 29) {
			mouseLeave.call(target.key14);
			mouseLeave.call(target.key21);
			mouseEnter.call(target.key22);
			mouseLeave.call(target.key23);
			mouseLeave.call(target.SPACE);
		}
		if (custSel === 30) {
			mouseLeave.call(target.key15);
			mouseLeave.call(target.key22);
			mouseEnter.call(target.key23);
			mouseLeave.call(target.key24);
			mouseLeave.call(target.SPACE);
		}
		if (custSel === 31) {
			mouseLeave.call(target.key16);
			mouseLeave.call(target.key23);
			mouseEnter.call(target.key24);
			mouseLeave.call(target.key25);
			mouseLeave.call(target.SPACE);
		}
		if (custSel === 32) {
			mouseLeave.call(target.key17);
			mouseLeave.call(target.key24);
			mouseEnter.call(target.key25);
			mouseLeave.call(target.key26);
			mouseLeave.call(target.SPACE);
		}
		if (custSel === 33) {
			mouseLeave.call(target.key18);
			mouseLeave.call(target.key19);
			mouseLeave.call(target.key25);
			mouseEnter.call(target.key26);
			mouseLeave.call(target.BACK);
		}
		if (custSel === 34) {
			mouseLeave.call(target.SHIFT);
			mouseLeave.call(target.key20);
			mouseLeave.call(target.SPACE);
			mouseEnter.call(target.SYMBOL);
		}
		if (custSel === 35) {
			mouseLeave.call(target.key21);
			mouseLeave.call(target.key22);
			mouseLeave.call(target.key23);
			mouseLeave.call(target.key24);
			mouseLeave.call(target.key25);
			mouseEnter.call(target.SPACE);
			mouseLeave.call(target.SYMBOL);
			mouseLeave.call(target.BACK);
			mouseLeave.call(target.btn_Ok);
		}	
		if (custSel === 36) {
			mouseLeave.call(target.key26);
			mouseLeave.call(target.SPACE);
			mouseEnter.call(target.BACK);
		}
		return;
	}

	target.moveCursor = function (direction) {
	switch (direction) {
		case "up" : {
			if (custSel===2) {
				prevSel=custSel;
				custSel=1;
				target.ntHandleEventsDlg();
			} else if (custSel===5) {
				prevSel=custSel;
				custSel=2;
				target.ntHandleEventsDlg();
			} else if (custSel===6) {
				prevSel=custSel;
				custSel=5;
				target.ntHandleEventsDlg();
			} else if ((custSel>6) && (custSel<17)) {
				prevSel=custSel;
				custSel=5;
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
			}
			break
		}
		case "down" : {
			if (custSel===1) {
				prevSel=custSel;
				custSel=2;
				target.ntHandleEventsDlg();
			} else if (custSel===2) {
				prevSel=custSel;
				custSel=5;
				target.ntHandleEventsDlg();
			} else if (custSel===5) {
				prevSel=custSel;
				custSel=6;
				target.ntHandleEventsDlg();
			} else if ((custSel>6) && (custSel<16)) {
				prevSel=custSel;
				custSel=custSel+10;
				target.ntHandleEventsDlg();
			} else if (custSel===16) {
				prevSel=custSel;
				custSel=25;
				target.ntHandleEventsDlg();
			} else if ((custSel>16) && (custSel<24)) {
				prevSel=custSel;
				custSel=custSel+9;
				target.ntHandleEventsDlg();			
			} else if ((custSel===24) || (custSel===25)) {
				prevSel=custSel;
				custSel=33;
				target.ntHandleEventsDlg();			
			} else if ((custSel===26) || (custSel===27)) {
				prevSel=custSel;
				custSel=34;
				target.ntHandleEventsDlg();			
			} else if ((custSel>27) && (custSel<33)) {
				prevSel=custSel;
				custSel=35;
				target.ntHandleEventsDlg();			
			} else if (custSel===33) {
				prevSel=custSel;
				custSel=36;
				target.ntHandleEventsDlg();			
			}
			break
		}
		case "left" : {
			if (custSel===6) {
				prevSel=custSel;
				custSel=16;
				target.ntHandleEventsDlg();	
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
			} else if ((custSel===35) || (custSel===36)) {
				prevSel=custSel;
				custSel--;
				target.ntHandleEventsDlg();	
			}
			break
		}		
		case "right" : {
			if (custSel===16) {
				prevSel=custSel;
				custSel=6;
				target.ntHandleEventsDlg();	
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
			} else if ((custSel===34) || (custSel===35)) {
				prevSel=custSel;
				custSel++;
				target.ntHandleEventsDlg();	
			}
			break
		}
		return;
	  }	
	}
	
	target.doCenterF = function () {
		if (custSel === 1) target.BUTTON_UPP.click();
		if (custSel === 2) target.BUTTON_DWN.click();
		if (custSel === 5) target.btn_Ok.click();
		if (custSel === 6) target.BUTTON_PRE.click();
		if (custSel === 7) target.key01.click();
		if (custSel === 8) target.key02.click();
		if (custSel === 9) target.key03.click();
		if (custSel === 10) target.key04.click();
		if (custSel === 11) target.key05.click();
		if (custSel === 12) target.key06.click();
		if (custSel === 13) target.key07.click();
		if (custSel === 14) target.key08.click();
		if (custSel === 15) target.key09.click();
		if (custSel === 16) target.key10.click();
		if (custSel === 17) target.key11.click();
		if (custSel === 18) target.key12.click();
		if (custSel === 19) target.key13.click();
		if (custSel === 20) target.key14.click();
		if (custSel === 21) target.key15.click();
		if (custSel === 22) target.key16.click();
		if (custSel === 23) target.key17.click();
		if (custSel === 24) target.key18.click();
		if (custSel === 25) target.key19.click();
		if (custSel === 26) target.SHIFT.click();
		if (custSel === 27) target.key20.click();
		if (custSel === 28) target.key21.click();
		if (custSel === 29) target.key22.click();
		if (custSel === 30) target.key23.click();
		if (custSel === 31) target.key24.click();
		if (custSel === 32) target.key25.click();
		if (custSel === 33) target.key26.click();
		if (custSel === 34) target.SYMBOL.click();
		if (custSel === 35) target.SPACE.click();
		if (custSel === 36) target.BACK.click();
		return;
	}

};
tmp();
tmp = undefined;