// CrossWord
// by Dan Genin (dan.genin@gmail.com)
// borrowing generously from MineSweeper by Mark Nord
//
// History: 
//	06/09/2012	Dan Genin - alpha release
//	20/07/2013	Ben Chenoweth - added keyboard switch button for non-950 readers; various fixes; loading errors output to clue box; remembers current puzzle; check for win; non-menu version
//	21/07/2013	Ben Chenoweth - various fixes; better handle different crossword types
//	23/07/2013	Ben Chenoweth - more fixes; code cleaning; reduce size of xml file
//	24/07/2013	Ben Chenoweth - minor fixes; different selection sprite
//	26/07/2013	Ben Chenoweth - prevent saving over puzzles when there is an error loading new puzzle; various fixes
//	30/07/2013	Ben Chenoweth - resize dialogs; switch keyboard to lower position on new puzzle; added clear word button
//	05/08/2013	Mark Nord - introduced a hardware-timer to call initial PuzzleDlg, Home-Button should work now
//	06/08/2013	Ben Chenoweth - added 'Quit' label
//	10/08/2013	Ben Chenoweth - added 'Change Mode' using Prev/Next buttons; minor fixes
//	11/08/2013	Ben Chenoweth - fix for non-square puzzles; and allow for CROSSWORD icon

var tmp = function() {
	//
	// Interface related variables 
	//
	
	var uD,
	gridTop = 131,
	gridLeft,
	getSoValue = kbook.autoRunRoot.getSoValue,
	setSoValue = kbook.autoRunRoot.setSoValue,
	listFiles = kbook.autoRunRoot.listFiles,
	datPath = kbook.autoRunRoot.gamesSavePath + 'CrossWord/puzzles/',
	//datPath = target.crosswordRoot + 'puzzles/',
	//settingsPath  = target.crosswordRoot + 'settings.dat',
	settingsPath = kbook.autoRunRoot.gamesSavePath + 'CrossWord/settings.dat',

	direction = 0,
	currCell = 0, // linear position (left to right and top to bottom) of the currently focused cell

	// puzzle state related variables	
	acrossClueMap = [], // mapping from numbered cell linear address to the corresponding across clue address in cwdClues
	acrossNumberMap = [], // mapping from numbered cell linear address to the corresponding across clue number 
	downClueMap = [], // mapping from numbered cell linear address to the corresponding down address in cwdClues
	downNumberMap = [], // mapping from numbered cell linear address to the corresponding down clue number
	cwdTitle,	// crossword data
	cwdAuthor,
	cwdCopyright,
	cwdWidth = 0,
	cwdHeight = 0,
	cwdClueCount, // crossword data
	cwdGrid, // crossword grid, also used to store state
	cwdSolution, // crossword solution
	cwdClues = [], // crossword clues
	cwdNote,
	maxSquares = 224, // 15x15 is the maximum size, since the squares would have to be tiny to fit larger puzzles on the screen
	
	strShift = "\u2191", //up arrow
	strUnShift = "\u2193", //down arrow
	keyboardLow = true,
	puzzleNames,
	ableToSavePuzzle = false,
	currPuzzleIndex = 0,
	prevPuzzleIndex = -1;
	
	// read in the list of puzzles in the data directory
	FileSystem.ensureDirectory(datPath);
	puzzleNames = listFiles(datPath,"puz"); // list of puzzles in the datPath folder
	
	// adds leading length leading zeros to a number
	// used for converting numerical cell ids into strings matching ids in the layout file 
	var pad = function(number, length) {
		var str = '' + number;
		
		while(str.length < length) {
		str = '0' + str;
		}
		return str;
	};
	
	// highlights the given cell and displays the corresponding clue
	var activateCell = function(nextCell) {
		// cell to be highlighted
		var i, j, msg;

		// if the cell is out of range or is blacked out do nothing 
		if (nextCell > cwdGrid.length || cwdGrid.charAt(nextCell) == '.')
			return;	

		currCell = nextCell;
		
		i = currCell % cwdWidth;
		j = Math.floor(currCell/cwdWidth);
		
		//move selection
		target.selection.changeLayout(gridLeft + i * 32,32, uD, gridTop + j * 32, 32, uD);
		
		if (direction == 0) {
			if (((i==0) || (cwdGrid.charAt(currCell*1-1) == ".")) && ((i==cwdWidth*1-1) || (cwdGrid.charAt(currCell*1+1) == "."))) {
				//need to switch direction and output down clue
				direction = (direction + 1) % 2;
				msg = (direction == 0) ? "MODE: Across" : "MODE: Down";
				target.Touch.mode.setValue(msg);
				target.clueText.setValue(downNumberMap[pad(currCell, 3)] + " down: " + cwdClues[downClueMap[pad(currCell, 3)]]);
			} else {
				target.clueText.setValue(acrossNumberMap[pad(currCell, 3)] + " across: " + cwdClues[acrossClueMap[pad(currCell, 3)]]);
			}
		} else {
			if (((j==0) || (cwdGrid.charAt(currCell*1-cwdWidth*1) == ".")) && ((j==cwdHeight*1-1) || (cwdGrid.charAt(currCell*1+cwdWidth*1) == "."))) {
				//need to switch direction and output across clue
				direction = (direction + 1) % 2;
				msg = (direction == 0) ? "MODE: Across" : "MODE: Down";
				target.Touch.mode.setValue(msg);
				target.clueText.setValue(acrossNumberMap[pad(currCell, 3)] + " across: " + cwdClues[acrossClueMap[pad(currCell, 3)]]);
			} else {
				target.clueText.setValue(downNumberMap[pad(currCell, 3)] + " down: " + cwdClues[downClueMap[pad(currCell, 3)]]);
			}
		}
	};

	// extract a null-terminated string starting at index in chunk
	var getString = function(chunk, index, maxLength) {
		var byteStr = [];
		var i;
		
		for(i = index; i < index + maxLength && chunk.peek(i) != 0; byteStr.push(chunk.peek(i++)));
		byteStr.push(0);
		
		return String.fromCharCode.apply(String, byteStr);
	};
	
	// write a null-terminated string to chunk, starting at index
	var putString = function(chunk, index, str) {
		var i;
		
		for(i = index; i < str.length && i < chunk.length; i++) chunk.poke(i,str.charAt(i));
	};
	
	// loads the crossword data from the file puzzleNames[currPuzzleIndex]
	var loadCrosswordFile = function() {
		var stream, inpLine, test, nextField, chunk, size,
		fileName = puzzleNames[currPuzzleIndex],
		num = 1, clue = 0, numAssigned, pIndex = 0, i, j;
		
		ableToSavePuzzle = false;
		
		try {
			if(FileSystem.getFileInfo(datPath+fileName)) {
				stream = new Stream.File(datPath+fileName);
			}
			else {
				return(-1);
			}
				
			size = stream.bytesAvailable;
			if (size > 4096) {
				target.clueText.setValue("ERROR: Puzzle file is too big.");
				return(-1);
			}
			
			chunk = stream.readChunk(stream.bytesAvailable);
			
			if (getString(chunk,2,11) != "ACROSS&DOWN") {
				target.clueText.setValue("ERROR: The file does not appear to be an AcrossLite format puzzle.");
				return(-1);
			};
			
			cwdWidth = chunk.peek(44);
			//target.bubble("tracelog","cwdWidth = "+cwdWidth);
			cwdHeight = chunk.peek(45);
			//target.bubble("tracelog","cwdHeight = "+cwdHeight);
			
			if (cwdWidth > 15 || cwdHeight > 15) {
				target.clueText.setValue("ERROR: Puzzles larger than 15x15 not supported.");
				return(-1);
			}
			
			ableToSavePuzzle = true;
			
			//seems to mistake unscrambled solutions for scrambled
			//if (chunk.peek(30)+chunk.peek(31)*256 == 0) {
				cwdSolution = getString(chunk,52,cwdWidth*cwdHeight); // if solution is unscrambled load it 
			//}
			//target.bubble("tracelog","cwdSolution = "+cwdSolution);
			
			nextField = 52 + cwdWidth*cwdHeight;
			cwdGrid = getString(chunk,nextField,cwdWidth*cwdHeight);
			//target.bubble("tracelog","cwdGrid = "+cwdGrid);
			nextField = nextField + cwdWidth*cwdHeight; 
			cwdTitle = getString(chunk,nextField,size);
			//target.bubble("tracelog","cwdTitle = "+cwdTitle);
			nextField = nextField + cwdTitle.length + 1;
			cwdAuthor = getString(chunk,nextField,size);
			//target.bubble("tracelog","cwdAuthor = "+cwdAuthor);
			nextField = nextField + cwdAuthor.length + 1;
			cwdCopyright = getString(chunk,nextField,size);
			//target.bubble("tracelog","cwdCopyright = "+cwdCopyright);
			nextField = nextField + cwdCopyright.length + 1;
			
			// compute which squares should be assigned numbers
			// this information is not explicitly provided in the .puz format but rather has to be inferred from the grid layout
			// a square is given a number if it is first in a row or follows a black square horizontally
			// and if it is first in a column or follows a black square vertically
			for (j = 0; j < cwdHeight; j++) {
				for (i = 0; i < cwdWidth; i++) {
					numAssigned = false;
					pIndex = imageIndexOf(i,j);
					if (cwdGrid.charAt(pIndex) != '.') {
						// scan for numbered squares horizontally
						if ((i == 0) || (cwdGrid.charAt(pIndex*1 - 1) == '.')) {
							if ((i < (cwdWidth - 1)) && (cwdGrid.charAt(pIndex*1 + 1) != '.')) {
								acrossNumberMap[pad(pIndex, 3)] = num;
								acrossClueMap[pad(pIndex, 3)] = clue;
								clue += 1;
								numAssigned = true;
							}
						}
						// scan for numbered squares vertically
						if ((j == 0) || (cwdGrid.charAt(pIndex*1 - cwdWidth*1) == '.')) {
							if ((j < (cwdHeight - 1)) && (cwdGrid.charAt(pIndex*1 + cwdWidth*1) != '.')) {
								downNumberMap[pad(pIndex, 3)] = num;
								downClueMap[pad(pIndex, 3)] = clue;
								clue += 1;
								numAssigned = true;
							}
						}
						if (numAssigned) num++;  
					}
				}
			}
			
			//target.bubble("tracelog","There are "+clue+" clues");
			
			cwdClues.length = 0;
			for(i = 0; i < clue; i++){
				cwdClues.push(getString(chunk,nextField,size));
				nextField = nextField + cwdClues[i].length + 1;
			}
			
			cwdNote = getString(chunk,nextField,size);
			chunk.free();
			stream.close();
		} catch (e) {
			target.bubble('tracelog', 'failed while loading puzzle'+e);
		}
	};
	
	function realTypeOf(obj) {
		return Object.prototype.toString.call(obj).slice(8, -1);
	}
	
	// loads the puzzle data from the puzzleNames[currPuzzleIndex] file and sets up the puzzle field
	target.loadCrossword = function() {
		var num = 1, clue = 0, numAssigned, pIndex = 0, i, j, firstClue = 0, foundFirstClue = false, msg;
		
		if (loadCrosswordFile() == -1) {
			//target.bubble('tracelog','failed to load the puzzle file');
			// hide squares
			for (i = 0; i <= maxSquares; i++) {
				this['sq' + pad(i, 3)].changeLayout(0, 0, uD, 0, 0, uD);
			}
			
			// hide numbers
			for (i = 0; i <= 79; i++) {
				this['num' + i].setValue("");
			}
			
			// hide selection, previous title & author
			target.selection.changeLayout(0, 0, uD, 0, 0, uD);
			target.cwdTitle.setValue("");
			target.cwdAuthor.setValue("");
			return;
		}
		
		target.clueText.setValue("");
		
		// resize the grid frame
		gridLeft = 300 - (cwdWidth) * 32 / 2; // compute the left margin of the puzzle field
		this.frame2.changeLayout(gridLeft - 21, 21 + 21 + (cwdWidth) * 32 + 5, uD, 110, 21 + 21 + (cwdHeight) * 32 + 5, uD);

		// display the title and author of the puzzle
		target.cwdTitle.setValue(cwdTitle);
		target.cwdAuthor.setValue(cwdAuthor);

		//initialize the clue mapping arrays
		for(i = 0; i < cwdWidth*cwdHeight; i++) {
			acrossClueMap[pad(i,3)] = 0;
			acrossNumberMap[pad(i,3)] = 0;
		}
			
		for(i = 0; i < cwdWidth*cwdHeight; i++) {
			downClueMap[pad(i,3)] = 0;
			downNumberMap[pad(i,3)] = 0;
		}

		// setup the crossword grid and compute the mapping between numbered grid squares and clues
		for (j = 0; j < cwdHeight; j++) {
			for (i = 0; i < cwdWidth; i++) {
				pIndex = imageIndexOf(i, j); //padded
				this['sq' + pIndex].changeLayout(gridLeft + i * 32,32, uD, gridTop + j * 32, 32, uD);
				switch (cwdGrid.charAt(pIndex)) { //previously "charAt(i + j * cwdHeight)"
				case '-': {
					target['sq' + pIndex].u = 0;
					if (getSoValue(target['sq' + pIndex], "v") != 0) target['sq' + pIndex].v = 0;
					break;
					}
				case '.': {
					target['sq' + pIndex].u = 1;
					if (getSoValue(target['sq' + pIndex], "v") != 0) target['sq' + pIndex].v = 0;
					break;
					}
				default: {
					target['sq' + pIndex].u = letterToNum(cwdGrid.charAt(pIndex)) + 1; //previously "charAt(i + j * cwdHeight)"
					if (getSoValue(target['sq' + pIndex], "v") != 0) target['sq' + pIndex].v = 0;
					}
				};

				// compute which squares should be assigned numbers
				// this information is not explicitly provided in the .puz format but rather has to be inferred from the grid layout
				// a square is given a number if it is first in a row or follows a black square horizontally
				// and if it is first in a column or follows a black square vertically 
				numAssigned = false;
				if (cwdGrid.charAt(pIndex) != '.') {
					// scan for numbered squares horizontally
					if ((i == 0) || (cwdGrid.charAt(pIndex*1 - 1) == '.')) {
							if ((i < (cwdWidth - 1)) && (cwdGrid.charAt(pIndex*1 + 1) != '.')) {
							acrossNumberMap[pad(pIndex, 3)] = num;
							acrossClueMap[pad(pIndex, 3)] = clue;
							clue += 1;
							numAssigned = true;
							if (!foundFirstClue) {
								firstClue = pIndex;
								foundFirstClue = true;
							}
						}
					}
					
					// scan for numbered squares vertically
					if ((j == 0) || (cwdGrid.charAt(pIndex*1 - cwdWidth*1) == '.')) {
						if ((j < (cwdHeight - 1)) && (cwdGrid.charAt(pIndex*1 + cwdWidth*1) != '.')) {
							downNumberMap[pad(pIndex, 3)] = num;
							downClueMap[pad(pIndex, 3)] = clue;
							clue += 1;
							numAssigned = true;
							if (!foundFirstClue) {
								firstClue = pIndex;
								foundFirstClue = true;
							}
						}
					}

					// display numbers
					if(numAssigned) {
						this['num' + num].changeLayout(gridLeft + i * 32, 13, uD, gridTop + j * 32, 13, uD);
						this['num' + num].setValue(num);
						num++;
					}
				}
			}
		}
		
		//fill non-numbered cells with corresponding numbered cell and clue index
		for(i = 1; i < cwdWidth*cwdHeight; i++) {
			if(acrossNumberMap[pad(i,3)] == 0) acrossNumberMap[pad(i,3)] = acrossNumberMap[pad(i-1,3)];
			if(acrossClueMap[pad(i,3)] == 0) acrossClueMap[pad(i,3)] = acrossClueMap[pad(i-1,3)];
		}
			
		for(i = cwdWidth*1; i < cwdWidth*cwdHeight; i++) {
			if(downNumberMap[pad(i,3)] == 0) downNumberMap[pad(i,3)] = downNumberMap[pad(i-cwdWidth,3)];
			if(downClueMap[pad(i,3)] == 0) downClueMap[pad(i,3)] = downClueMap[pad(i-cwdWidth,3)];
		}

		// hide unused squares
		for (i = cwdWidth*cwdHeight; i <= maxSquares; i++) {
			this['sq' + pad(i, 3)].changeLayout(0, 0, uD, 0, 0, uD);
		}
		
		// hide unused numbers
		for (i = num; i <= 79; i++) {
			this['num' + i].setValue("");
		}
		
		// change to Across mode
		if (direction != 0) {
			direction = (direction + 1) % 2;
			msg = (direction == 0) ? "MODE: Across" : "MODE: Down";
			target.Touch.mode.setValue(msg);
		}
		
		// move keyboard down if it's up
		if (!keyboardLow) target.doSwitchKeyboard();
		
		activateCell(firstClue);
	};

	// save the current crossword
	target.saveCrossword = function() {
		var i, stream, chunk, cwdSaveGrid = "";
		
		if (!ableToSavePuzzle) return;
		
		if(FileSystem.getFileInfo(datPath + puzzleNames[currPuzzleIndex])) {
			stream = new Stream.File(datPath+puzzleNames[currPuzzleIndex]);
		} else {
			return;
		}
		
		// get the size of the puzzle file		
		size = stream.bytesAvailable;
		if (size > 4096) {
			//target.bubble('tracelog','Puzzle too big.');
			return;
		}
			
		try {
			// read the puzzle file into a buffer
			chunk = stream.readChunk(stream.bytesAvailable);
		} catch (e) {
			target.bubble('tracelog', 'failed while reloading the puzzle before saving' + e);
		}
		
		// close stream
		stream.close();
		
		// record current grid
		for (i = 0; i < cwdGrid.length; i++) {
			if (numToLetter(getSoValue(target['sq' + pad(i, 3)], "u")) == "") {
				cwdSaveGrid += cwdGrid.charAt(i);
			} else {
				cwdSaveGrid += numToLetter(getSoValue(target['sq' + pad(i, 3)], "u"));
			}
		}
		
		// write current grid into the appropriate position in the buffer
		for (i = 0; i < cwdSaveGrid.length; i++) {
			chunk.poke(52 + cwdWidth*cwdHeight + i,cwdSaveGrid.charCodeAt(i));
		}

		// save the modified file
		try {
			stream = new Stream.File(datPath + puzzleNames[currPuzzleIndex], 3);
			stream.writeChunk(chunk);
			stream.close();
		} catch (e) {
			target.bubble('tracelog', 'failed while saving puzzle'+e);
		}
		
		// close stream
		stream.close();
		// release buffer
		chunk.free();
	};

	
	// initialization
	target.init = function() {
		var i, fname, stream, timer;

		// set translated appTitle and appIcon
		this.appTitle.setValue(kbook.autoRunRoot._title);
		this.appIcon.u = kbook.autoRunRoot._icon;
		this['BUTTON_1'].setText(strShift); // up arrow on keyboard switch button
		
		if (kbook.autoRunRoot.model=="950") {
			// don't need to be able to switch keyboard, since it fits underneath crossword area
			this['BUTTON_1'].changeLayout(0, 0, uD, 0, 0, uD);
		}
				
		// look for settings file
		try {
			if (FileSystem.getFileInfo(settingsPath)) {
				stream = new Stream.File(settingsPath);
				fname = stream.readLine();
				stream.close();
				if (FileSystem.getFileInfo(datPath + fname)) {
					// Get number of previous puzzle
					for (i=0; i < puzzleNames.length; i++) {
							if (puzzleNames[i] == fname) {
								currPuzzleIndex = i;
								break;
							}
						}
				}
			}
		} catch (e) {}
		
		// display the puzzle load dialog box
		target.setVariable("fileName", puzzleNames[currPuzzleIndex]);
		target.focus(true);
		try {
				timer = this.timer = new HardwareTimer(); //x50
		} catch(isIgnore) {
			target.PUZZLE_DIALOG.show(true);
		}
		timer.target = this;
		timer.onCallback = PzlDlg_onCallback;
		timer.schedule(10);
	};
	
	var PzlDlg_onCallback = function () {
		var target;
		target = this.target;
		target.timer = null;
		target.PUZZLE_DIALOG.show(true);
	};
		
	target.doRoot = function (sender) {
		this.exitQuit();
	};
	
	target.doPrev = function (sender) {
		this.changeDirection();
	};
	
	target.doNext = function (sender) {
		this.changeDirection();
	};
	
	// saves current progress and exits
	target.exitQuit = function() {
		try {	
			this.saveCrossword();
			this.saveSettings();
		} catch (e) {}	
		kbook.autoRunRoot.exitIf(kbook.model);
	};
	
	target.saveSettings = function() {
		var stream;
		// output settings file (filename of current puzzle)
		try {
			if (FileSystem.getFileInfo(settingsPath)) FileSystem.deleteFile(settingsPath);
			stream = new Stream.File(settingsPath, 1);
			stream.writeLine(puzzleNames[currPuzzleIndex]);		
			stream.close();
		} catch (e) {}
		return;
	};
	
	// gets input from the on screen keyboard
	// displays the entered letter in the grid
	// updates current puzzle state
	// only gets called externally
	target.doButtonClick = function(sender) {
		var id, letter;

		id = getSoValue(sender, "id");
		letter = id.substring(7, 8);
		
		// use blank to erase letters from the grid
		if (letter != ' ') {
			target['sq' + pad(currCell, 3)].u = letterToNum(letter) + 1;
			if (getSoValue(target['sq' + pad(currCell, 3)], "v") != 0) target['sq' + pad(currCell, 3)].v = 0;
			if (!this.checkForAWin()) this.moveToNextCell();
		} else {
			target['sq' + pad(currCell, 3)].u = 0;
			if (getSoValue(target['sq' + pad(currCell, 3)], "v") != 0) target['sq' + pad(currCell, 3)].v = 0;
			this.moveToNextCell();
		}
	};
	
	target.checkForAWin = function() {
		var alldone = true, i;
		for (i = 0; i < cwdGrid.length; i++) {
			if (cwdSolution.charAt(i) != "." && numToLetter(getSoValue(target['sq' + pad(i, 3)], "u")) != cwdSolution.charAt(i)) {
				alldone = false;
			}
		}
		if (alldone) {
			target.WIN_DIALOG.open();
		}
		return alldone;
	};
	
	target.moveToNextCell = function() {
		var i, j, nextCell = currCell;
		
		j = Math.floor(currCell/cwdWidth);
		
		if (direction == 0) {
			nextCell++;
			i = nextCell - j * cwdWidth;
			if (i < cwdWidth) {
				// skip over blacked out squares
				while (cwdGrid.charAt(nextCell) == '.' && i < cwdWidth) {
					nextCell++;
					i = nextCell - j * cwdWidth;
				}
				// focus on the next cell horizontally
				if (i < cwdWidth) {
					activateCell(nextCell);
				} else {
					return;
				}
			} else {
				return;
			}
		} else {
			if ((nextCell = nextCell * 1 + cwdWidth * 1) < cwdGrid.length) {
				// skip over blacked out squares
				while (cwdGrid.charAt(nextCell) == '.' && nextCell * 1 < cwdGrid.length) {
					nextCell = nextCell * 1 + cwdWidth * 1;
				}
				// focus on the next cell vertically
				if (nextCell < cwdGrid.length) {
					activateCell(nextCell);
				} else {
					return;
				}
			} else {
				return;
			}
		}	
	}
	
	target.doSwitchKeyboard = function(sender) {
		if (keyboardLow) {
			this['BUTTON_Q'].changeLayout(40, 40, uD, 140, 40, uD);
			this['BUTTON_W'].changeLayout(90, 40, uD, 140, 40, uD);
			this['BUTTON_E'].changeLayout(140, 40, uD, 140, 40, uD);
			this['BUTTON_R'].changeLayout(190, 40, uD, 140, 40, uD);
			this['BUTTON_T'].changeLayout(240, 40, uD, 140, 40, uD);
			this['BUTTON_Y'].changeLayout(290, 40, uD, 140, 40, uD);
			this['BUTTON_U'].changeLayout(340, 40, uD, 140, 40, uD);
			this['BUTTON_I'].changeLayout(390, 40, uD, 140, 40, uD);
			this['BUTTON_O'].changeLayout(440, 40, uD, 140, 40, uD);
			this['BUTTON_P'].changeLayout(490, 40, uD, 140, 40, uD);
			this['BUTTON_A'].changeLayout(40, 40, uD, 190, 40, uD);
			this['BUTTON_S'].changeLayout(90, 40, uD, 190, 40, uD);
			this['BUTTON_D'].changeLayout(140, 40, uD, 190, 40, uD);
			this['BUTTON_F'].changeLayout(190, 40, uD, 190, 40, uD);
			this['BUTTON_G'].changeLayout(240, 40, uD, 190, 40, uD);
			this['BUTTON_H'].changeLayout(290, 40, uD, 190, 40, uD);
			this['BUTTON_J'].changeLayout(340, 40, uD, 190, 40, uD);
			this['BUTTON_K'].changeLayout(390, 40, uD, 190, 40, uD);
			this['BUTTON_L'].changeLayout(440, 40, uD, 190, 40, uD);
			this['BUTTON_Z'].changeLayout(40, 40, uD, 240, 40, uD);
			this['BUTTON_X'].changeLayout(90, 40, uD, 240, 40, uD);
			this['BUTTON_C'].changeLayout(140, 40, uD, 240, 40, uD);
			this['BUTTON_V'].changeLayout(190, 40, uD, 240, 40, uD);
			this['BUTTON_B'].changeLayout(240, 40, uD, 240, 40, uD);
			this['BUTTON_N'].changeLayout(290, 40, uD, 240, 40, uD);
			this['BUTTON_M'].changeLayout(340, 40, uD, 240, 40, uD);
			this['BUTTON_ '].changeLayout(390, 40, uD, 240, 40, uD);
			this['BUTTON_1'].setText(strUnShift); //down arrow
			keyboardLow = false;
		} else {
			this['BUTTON_Q'].changeLayout(40, 40, uD, 487, 40, uD);
			this['BUTTON_W'].changeLayout(90, 40, uD, 487, 40, uD);
			this['BUTTON_E'].changeLayout(140, 40, uD, 487, 40, uD);
			this['BUTTON_R'].changeLayout(190, 40, uD, 487, 40, uD);
			this['BUTTON_T'].changeLayout(240, 40, uD, 487, 40, uD);
			this['BUTTON_Y'].changeLayout(290, 40, uD, 487, 40, uD);
			this['BUTTON_U'].changeLayout(340, 40, uD, 487, 40, uD);
			this['BUTTON_I'].changeLayout(390, 40, uD, 487, 40, uD);
			this['BUTTON_O'].changeLayout(440, 40, uD, 487, 40, uD);
			this['BUTTON_P'].changeLayout(490, 40, uD, 487, 40, uD);
			this['BUTTON_A'].changeLayout(40, 40, uD, 537, 40, uD);
			this['BUTTON_S'].changeLayout(90, 40, uD, 537, 40, uD);
			this['BUTTON_D'].changeLayout(140, 40, uD, 537, 40, uD);
			this['BUTTON_F'].changeLayout(190, 40, uD, 537, 40, uD);
			this['BUTTON_G'].changeLayout(240, 40, uD, 537, 40, uD);
			this['BUTTON_H'].changeLayout(290, 40, uD, 537, 40, uD);
			this['BUTTON_J'].changeLayout(340, 40, uD, 537, 40, uD);
			this['BUTTON_K'].changeLayout(390, 40, uD, 537, 40, uD);
			this['BUTTON_L'].changeLayout(440, 40, uD, 537, 40, uD);
			this['BUTTON_Z'].changeLayout(40, 40, uD, 587, 40, uD);
			this['BUTTON_X'].changeLayout(90, 40, uD, 587, 40, uD);
			this['BUTTON_C'].changeLayout(140, 40, uD, 587, 40, uD);
			this['BUTTON_V'].changeLayout(190, 40, uD, 587, 40, uD);
			this['BUTTON_B'].changeLayout(240, 40, uD, 587, 40, uD);
			this['BUTTON_N'].changeLayout(290, 40, uD, 587, 40, uD);
			this['BUTTON_M'].changeLayout(340, 40, uD, 587, 40, uD);
			this['BUTTON_ '].changeLayout(390, 40, uD, 587, 40, uD);
			this['BUTTON_1'].setText(strShift); //up arrow
			keyboardLow = true;
		}
	};

	// activates the clicked cell
	// only gets called externally 
	target.doGridClick = function(sender) {
		var id, sq;
		id = getSoValue(sender, "id");
		sq = id.substring(2, 5);
		//target.bubble("tracelog","id="+id+", sq="+sq);
		activateCell(sq);
	};

	// toggles between across down directions
	// direction is used to display across and down clues and also to determine direction of typed in words
	target.changeDirection = function(sender) {
		var msg;
		direction = (direction + 1) % 2;
		msg = (direction == 0) ? "MODE: Across" : "MODE: Down";
		target.Touch.mode.setValue(msg);
		activateCell(currCell);
	};

	target.doShowPuzzleDialog = function(sender) {
		this.saveCrossword();
		prevPuzzleIndex = currPuzzleIndex;
		setSoValue(target.PUZZLE_DIALOG['btn_Cancel'],"visible",true);
		target.PUZZLE_DIALOG.show(true);
		return;
	};
	
	target.PUZZLE_DIALOG.closeDlg = function() {
		if (currPuzzleIndex != prevPuzzleIndex) {
			target.loadCrossword();
		}
	};
	
	target.PUZZLE_DIALOG.cancelDlg = function() {
		currPuzzleIndex = prevPuzzleIndex;
	};
	 
	target.PUZZLE_DIALOG.doPrevNextPuzzle = function(sender){
		var senderID, len, fileName;
		
		senderID = getSoValue(sender,"id");
		len = puzzleNames.length;
		fileName = target.getVariable("fileName");

		switch(senderID) {
			case "prevPuzzle" : {
				currPuzzleIndex = (currPuzzleIndex - 1) % len;
				if (currPuzzleIndex === -1) {
					currPuzzleIndex = len - 1;
				}
				break;
			}
			case "nextPuzzle" : {
				currPuzzleIndex = (currPuzzleIndex + 1) % len;
				break;
			}
		};

		this.container.setVariable("fileName", puzzleNames[currPuzzleIndex]);
	};

	target.PUZZLE_DIALOG.doRoot = function(sender) {
		target.exitQuit();
	};
	
	// Returns the index of the documents image pointing to cell at given
	// x,y coords (on 0..n-1 scale)
	var imageIndexOf = function(x, y) {
		return pad(x + y * (cwdWidth), 3);
	};
	
	var letterToNum = function(letter) {
		var result = letter.charCodeAt(0) - 64;
		return result;
	};
	
	var numToLetter = function(val) {
		var result="";
		if (val == 1) {
			result=".";
		} else if (val >= 2) {
			result=String.fromCharCode(63 + val);
		}
		return result;
	};
	
	target.doClearPuzzle = function(sender) {
		var i;
		for (i = 0; i < cwdGrid.length; i++) {
			if (getSoValue(target['sq' + pad(i, 3)], "u") != 1) {
				target['sq' + pad(i, 3)].u = 0;
				if (getSoValue(target['sq' + pad(i, 3)], "v") != 0) target['sq' + pad(i, 3)].v = 0;
			}
		}
	};
	
	target.doClearWord = function(sender) {
		var i, j, dummy;
		if (direction == 0) {
			// go backward horizontally until a black square is encountered to get to the beginning of the current word 
			for (i = currCell; (i % cwdWidth) != 0 && cwdGrid.charAt(i - 1) != '.'; i--);
			// go forward checking each letter
			for (j = i; cwdGrid.charAt(j) != '.' && j < (Math.floor(i/cwdWidth) * cwdWidth + cwdWidth); j++) {
				if (getSoValue(target['sq' + pad(j, 3)], "u") != 1) {
					target['sq' + pad(j, 3)].u = 0;
					if (getSoValue(target['sq' + pad(j, 3)], "v") != 0) target['sq' + pad(j, 3)].v = 0;
				}
			}
		} else {
			// go upward until a black square is encountered to get to the beginning of the word
			for (i = currCell; i >= 0 && cwdGrid.charAt(i - cwdWidth) != '.'; i = i - cwdWidth);
			if (i < 0) {
				i = i + cwdWidth;
			}
			// go forward checking each letter
			for (j = i*1; (cwdGrid.charAt(j) != '.') && (j < (cwdWidth*cwdHeight)); j = j + cwdWidth) {
				if (getSoValue(target['sq' + pad(j, 3)], "u") != 1) {
					target['sq' + pad(j, 3)].u = 0;
					if (getSoValue(target['sq' + pad(j, 3)], "v") != 0) target['sq' + pad(j, 3)].v = 0;
				}
			}
		}
		return;
	};
	
	target.doCheckPuzzle = function(sender) {
		var i, letter;
		for (i = 0; i < cwdGrid.length; i++) {
			letter = numToLetter(getSoValue(target['sq' + pad(i, 3)], "u"));
			if (letter != "" && letter != cwdSolution.charAt(i)) {
				target['sq' + pad(i, 3)].v = 1;
			}
		}
	};
	
	target.doRevealLetter = function(sender) {
		target['sq' + pad(currCell, 3)].u = letterToNum(cwdSolution.charAt(currCell)) + 1;
		if (getSoValue(target['sq' + pad(currCell, 3)], "v") != 0) target['sq' + pad(currCell, 3)].v = 0;
		if (!this.checkForAWin()) this.moveToNextCell();
	};
	
	target.doRevealWord = function(sender) {
		var i, j, dummy;
		if (direction == 0) {
			// go backward horizontally until a black square is encountered to get to the beginning of the current word 
			for (i = currCell; (i % cwdWidth) != 0 && cwdGrid.charAt(i - 1) != '.'; i--);
			// go forward checking each letter
			for (j = i; cwdGrid.charAt(j) != '.' && j < (Math.floor(i/cwdWidth) * cwdWidth + cwdWidth); j++) {
				target['sq' + pad(j, 3)].u = letterToNum(cwdSolution.charAt(j)) + 1;
				if (getSoValue(target['sq' + pad(j, 3)], "v") != 0) target['sq' + pad(j, 3)].v = 0;
			}
		} else {
			// go upward until a black square is encountered to get to the beginning of the word
			for (i = currCell; i >= 0 && cwdGrid.charAt(i - cwdWidth) != '.'; i = i - cwdWidth);
			if (i < 0) {
				i = i + cwdWidth;
			}
			// go forward checking each letter
			for (j = i*1; (cwdGrid.charAt(j) != '.') && (j < (cwdWidth*cwdHeight)); j = j + cwdWidth) {
				target['sq' + pad(j, 3)].u = letterToNum(cwdSolution.charAt(j)) + 1;
				if (getSoValue(target['sq' + pad(j, 3)], "v") != 0) target['sq' + pad(j, 3)].v = 0;
			}
		}
		dummy = this.checkForAWin();
		return;
	}
}; // end of tmp

try {
	tmp();
} catch (e) {
	target.bubble('tracelog', 'error in word.js');
}

tmp = undefined;
