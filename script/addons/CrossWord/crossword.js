// CrossWord
// by Dan Genin (dan.genin@gmail.com)
// borrowing generously from MineSweeper by Mark Nord
//
// History: 
//	06/09/2012	Dan Genin - alpha release
//	20/07/2013	Ben Chenoweth - added keyboard switch button for non-950 readers; various fixes; loading errors output to clue box; remembers current puzzle; check for win; non-menu version

var tmp = function() {
	//
	// Interface related variables 
	//
	
	var uD;
	var gridTop = 131;
	var gridLeft;

	var isNT = kbook.autoRunRoot.hasNumericButtons;
	var getSoValue = kbook.autoRunRoot.getSoValue;
	var setSoValue = kbook.autoRunRoot.setSoValue;
	var getFileContent = kbook.autoRunRoot.getFileContent;
	var listFiles = kbook.autoRunRoot.listFiles;
	var datPath = kbook.autoRunRoot.gamesSavePath + 'CrossWord/puzzles/';
	//var datPath = target.crosswordRoot + 'puzzles/';
	//var settingsPath  = target.crosswordRoot + 'settings.dat';
	var settingsPath = kbook.autoRunRoot.gamesSavePath + 'CrossWord/settings.dat';

	var fnPageScroll = getSoValue(target.helpText, 'scrollPage');
	var lastClickOnMenu = false;              // Used to control smooth menu closing
	var width = [ 230, 280, 230 ]; // lazy as I can't get >> itemWidth =
									// itemStyle.getWidth(window, item.title);<<
									// to work [inherited from minesweeper. dig]
	var direction = 0;
	var currCell = 0; // linear position (left to right and top to bottom) of the currently focused cell


	// puzzle state related variables	
	acrossClueMap = new Array(); // mapping from numbered cell linear address to the corresponding across clue address in cwdClues
	acrossNumberMap = new Array(); // mapping from numbered cell linear address to the corresponding across clue number 
	downClueMap = new Array(); // mapping from numbered cell linear address to the corresponding down address in cwdClues
	downNumberMap = new Array(); // mapping from numbered cell linear address to the corresponding down clue number
	var cwdTitle;	// crossword data
	var cwdAuthor;
	var cwdCopyright; 
	var cwdWidth = 0;
	var cwdHeight = 0;
	var cwdClueCount; // crossword data
	var cwdGrid; // crossword grid, also used to store state
	var cwdSolution; // crossword solution
	var cwdClues = new Array(); // crossword clues
	var cwdNote;
	var maxSquares = 367; // Large puzzles, e.g. NYTimes Sunday 21x21, are a problem since the squares would have to be tiny to fit the whole puzzle on the screen.
	
	var puzzleNames; // list of puzzles in the datPath folder
	//listFiles = getSoValue(theRoot,'Core.io.listFiles'); // file enumeration routine; takes a path and a list of extensions, returns an array of file names
	
	var strShift = "\u2191"; //up arrow
	var strUnShift = "\u2193"; //down arrow
	var keyboardLow;
	
	// read in the list of puzzles in the data directory
	FileSystem.ensureDirectory(datPath);
	//target.bubble('tracelog', 'datPath = ' + datPath);	
	puzzleNames = listFiles(datPath,"puz");
	//target.bubble('tracelog', 'puzzleNames = ' + puzzleNames[0]);
	var currPuzzleIndex = 0;
	var prevPuzzleIndex = -1;
	
	target.helpText.setValue(getFileContent(target.crosswordRoot.concat('CrossWord_Help_EN.txt'),'help.txt missing'));
	target.helpText.show(false);
	var displayHelp = false; 

	// adds leading length leading zeros to a number
	// used for converting numerical cell ids into strings matching ids in the layout file 
	var pad = function(number, length) {
		var str = '' + number;
		
		while(str.length < length) {
		str = '0' + str;
		}
		return str;
	}
	
	// highlights the given cell and displays the corresponding clue
	activateCell = function(cell) {
		// cell to be highlighted
		var nextCell = cell;

		// if the cell is out of range or is blacked out do nothing 
		if (nextCell > cwdGrid.length || cwdGrid.charAt(nextCell) == '.')
			return;
		
		
		target['sq' + pad(currCell, 3)].u = 0;
		currCell = nextCell;
		target['sq' + pad(currCell, 3)].u = 2;

		if (direction == 0) {
			// go backward horizontally until a black square is encountered
			// to obtain the linear index of the current clue 
			target.clueText.setValue(acrossNumberMap[pad(currCell, 3)] + " across: " + cwdClues[acrossClueMap[pad(currCell, 3)]]);
		} else {
			// go upward until a black square is encountered
			target.clueText.setValue(downNumberMap[pad(currCell, 3)] + " down: " + cwdClues[downClueMap[pad(currCell, 3)]]);
		}

	}

	// extract a null-terminated string starting at index in chunk
	var getString = function(chunk, index, maxLength) {
		var byteStr = [];
		var i;
		
		for(i = index; i < index + maxLength && chunk.peek(i) != 0; byteStr.push(chunk.peek(i++)));
		byteStr.push(0);
		
		return String.fromCharCode.apply(String, byteStr);
	}
	
	// write a null-terminated string to chunk, starting at index
	putString = function(chunk, index, str) {
		var i;
		
		for(i = index; i < str.length && i < chunk.length; i++) chunk.poke(i,str.charAt(i));
	}
	
	// loads the crossword data from the file puzzleNames[currPuzzleIndex]
	loadCrosswordFile = function() {
		var stream, inpLine, test, nextField;
		var chunk, size;
		var fileName = puzzleNames[currPuzzleIndex];
		
		try {
			if(FileSystem.getFileInfo(datPath+fileName)) {
				stream = new Stream.File(datPath+fileName);
			}
			else {
				return(-1);
			}
				
			size = stream.bytesAvailable;
			if (size > 4096) {
				target.bubble("tracelog","Puzzle file is too big.");
				target.clueText.setValue("ERROR: Puzzle file is too big.");
				return;
			}
			
			chunk = stream.readChunk(stream.bytesAvailable);
			
			if (getString(chunk,2,11) != "ACROSS&DOWN") {
				target.bubble("tracelog","The file does not appear to be an AcrossLite format puzzle.");
				target.clueText.setValue("ERROR: The file does not appear to be an AcrossLite format puzzle.");
				return;
			};
			
			cwdWidth = chunk.peek(44);
			//target.bubble("tracelog","cwdWidth = "+cwdWidth);
			cwdHeight = chunk.peek(45);
			//target.bubble("tracelog","cwdHeight = "+cwdHeight);
			
			if (cwdWidth > 15 || cwdHeight > 15) {
				target.bubble("tracelog","Puzzles larger than 15x15 not supported.");
				target.clueText.setValue("ERROR: Puzzles larger than 15x15 not supported.");
				return(-1);
			}
			
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
			var num = 1;
			var clue = 0;
			var numAssigned = 0;
			var pIndex = 0;
			var i, j;
			for (j = 0; j < cwdHeight; j++) {
				for (i = 0; i < cwdWidth; i++) {
					numAssigned = 0;
					pIndex = i + j * cwdHeight;
					if (cwdGrid.charAt(pIndex) != '.') {
						// scan for numbered squares horizontally
						if (i == 0 || (i > 0) && (i < (cwdWidth - 1)) && (cwdGrid.charAt(pIndex - 1) == '.') && (cwdGrid.charAt(pIndex + 1) != '.')) {
							acrossNumberMap[pad(pIndex, 3)] = num;
							acrossClueMap[pad(pIndex, 3)] = clue;
							clue = clue + 1;
							numAssigned = 1;
						}
						
						// scan for numbered squares vertically
						if (j == 0 || (j > 0 && j < (cwdHeight - 1) && cwdGrid.charAt(pIndex - cwdHeight) == '.' && cwdGrid.charAt(pIndex + cwdHeight) != '.')) {
							downNumberMap[pad(pIndex, 3)] = num;
							downClueMap[pad(pIndex, 3)] = clue;
							clue += 1;
							numAssigned = 1;
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
	}
	
	// loads the puzzle data from the puzzleNames[currPuzzleIndex] file and sets up the puzzle field
	target.loadCrossword = function() {
		//target.bubble('tracelog','in loadCrossword');
		if (loadCrosswordFile() < 0) {
			target.bubble('tracelog','failed to load the puzzle file');
			return;
		}
		
		target.clueText.setValue("");
		
		maxCells = (cwdWidth) * (cwdHeight) - 1; // Number of cells in the current puzzle
		
		// resize the grid frame
		gridLeft = 300 - (cwdWidth) * 32 / 2; // compute the left margin of the puzzle field
		this.frame2.changeLayout(gridLeft - 21, 21 + 21 + (cwdWidth) * 32 + 5, uD, 110, 21 + 21 + (cwdHeight) * 32 + 5, uD);

		// display the title and author of the puzzle
		target.cwdTitle.setValue(cwdTitle);
		target.cwdAuthor.setValue(cwdAuthor);
		target.setVariable("fname",0);


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
		var num = 1;
		var clue = 0;
		var numAssigned = 0;
		var pIndex = 0;
		for (j = 0; j < cwdHeight; j++) {
			for (i = 0; i < cwdWidth; i++) {
				this['sq' + imageIndexOf(i, j)].changeLayout(gridLeft + i * 32,32, uD, gridTop + j * 32, 32, uD);
				this['cell' + imageIndexOf(i, j)].changeLayout(gridLeft + i * 32 + 7, 32 - 7, uD, gridTop + j * 32, 32, uD);
				this['cell' + imageIndexOf(i, j)].setValue("");
				switch (cwdGrid.charAt(i + j * cwdHeight)) {
				case '-': {
					this['sq' + imageIndexOf(i, j)].u = 0;
					break;
					}
				case '.': {
					this['sq' + imageIndexOf(i, j)].u = 1;
					break;
					}
				default: {
					this['sq' + imageIndexOf(i, j)].u = 0;
					this['cell' + imageIndexOf(i, j)].setValue(cwdGrid.charAt(i + j * cwdHeight));
					}
				};

				// compute which squares should be assigned numbers
				// this information is not explicitly provided in the .puz format but rather has to be inferred from the grid layout
				// a square is given a number if it is first in a row or follows a black square horizontally
				// and if it is first in a column or follows a black square vertically 
				numAssigned = 0;
				pIndex = i + j * (cwdHeight);
				if (cwdGrid.charAt(pIndex) != '.') {
					// scan for numbered squares horizontally
					if(i == 0 || (i > 0 && cwdGrid.charAt(pIndex - 1) == '.')) {
						acrossNumberMap[pad(pIndex, 3)] = num;
						acrossClueMap[pad(pIndex, 3)] = clue;
						clue += 1;
						numAssigned = 1;
					}
					
					// scan for numbered squares vertically
					if(j == 0 || (j > 0 && cwdGrid.charAt(pIndex - (cwdHeight)) == '.')) {
						downNumberMap[pad(pIndex, 3)] = num;
						downClueMap[pad(pIndex, 3)] = clue;
						clue += 1;
						numAssigned = 1;
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
			
		for(i = cwdWidth; i < cwdWidth*cwdHeight; i++) {
			if(downNumberMap[pad(i,3)] == 0) downNumberMap[pad(i,3)] = downNumberMap[pad(i-cwdWidth,3)];
			if(downClueMap[pad(i,3)] == 0) downClueMap[pad(i,3)] = downClueMap[pad(i-cwdWidth,3)];
			}

		// hide unused squares
		//target.bubble('tracelog',(cwdWidth) * (cwdHeight) + "," + maxSquares)
		for (i = (cwdWidth) * (cwdHeight); i <= maxSquares; i++) {
			this['sq' + pad(i, 3)].changeLayout(0, 0, uD, 0, 0, uD);
		}
		
		activateCell(0);
	}

	// save the current crossword
	target.saveCrossword = function() {
		var i, stream, chunk;
		var cwdSaveGrid = "";

		if(FileSystem.getFileInfo(datPath + puzzleNames[currPuzzleIndex])) 
			stream = new Stream.File(datPath+puzzleNames[currPuzzleIndex]);
		else 
			return;
		
		// get the size of the puzzle file		
		size = stream.bytesAvailable;
		if (size > 4096) {
			target.bubble('tracelog','Puzzle too big.');
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
			if (this['cell' + pad(i, 3)].getValue() == "") {
				cwdSaveGrid += cwdGrid.charAt(i);
			} else {
				cwdSaveGrid += this['cell' + pad(i, 3)].getValue();
			}
		}
		
		// write current grid into the appropriate position in the buffer
		for (i = 0; i < cwdSaveGrid.length; i++) chunk.poke(52 + cwdWidth*cwdHeight + i,cwdSaveGrid.charCodeAt(i));
		// target.bubble('tracelog', 'chunk = ' + getString(chunk,52 + cwdWidth*cwdHeight,300));

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
	}

	
	// initialization
	target.init = function() {
		var i, fname;

		// set translated appTitle and appIcon
		this.appTitle.setValue(kbook.autoRunRoot._title);
		this.appIcon.u = kbook.autoRunRoot._icon;
		this['BUTTON_1'].setText(strShift);
		
		if (kbook.autoRunRoot.model=="950") {
			// don't need to be able to switch keyboard, since it fits underneath crossword area
			this['BUTTON_1'].changeLayout(0, 0, uD, 0, 0, uD);
		}
		keyboardLow = true;
		
		// check MenuOptions
		//var menuBar = this.findContent("MENUBAR"); // menuBar had to be defined as id="MENUBAR" in XML!! [from original MS code. dig]
		//var menus = getSoValue(menuBar, "menus");
		//var items = getSoValue(menus[0], "items");
		
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
		target.PUZZLE_DIALOG.show(true);
	};
	
	target.doRoot = function (sender) {
		this.exitQuit();
	};
	
	// saves current progress and exits
	target.exitQuit = function() {
		var stream;
		
		//target.bubble('tracelog', 'in exitQuit');
		
		this.saveCrossword();
		this.saveSettings();
		
		kbook.autoRunRoot.exitIf(kbook.model);
	};
	
	target.saveSettings = function() {
		// output settings file (filename of current puzzle)
		try {
			if (FileSystem.getFileInfo(settingsPath)) FileSystem.deleteFile(settingsPath);
			stream = new Stream.File(settingsPath, 1);
			stream.writeLine(puzzleNames[currPuzzleIndex]);		
			stream.close();
		} catch (e) {}
		return;
	}
	// ??? [dig]
	var updateScreen = function() {
		FskUI.Window.update.call(kbook.model.container.getWindow());
	};

	

	
/****************************************** Screen interaction functionality ***************************************************/ 
	// gets input from the on screen keyboard
	// displays the entered letter in the grid
	// updates current puzzle state
	// only gets called externally
	target.doButtonClick = function(sender) {
		var id;
		var letter;
		var nextCell;

		id = getSoValue(sender, "id");
		letter = id.substring(7, 8);
		
		// use blank to erase letters from the grid
		if (letter != ' ')
			this['cell' + pad(currCell, 3)].setValue(letter);
		else
			this['cell' + pad(currCell, 3)].setValue("");
		
		this.checkForAWin();
		
		nextCell = currCell;
		
		
		if (direction == 0) {
			if ((++nextCell) * 1 < cwdGrid.length) {
				// skip over blacked out squares
				while (cwdGrid.charAt(nextCell) == '.' && nextCell * 1 < cwdGrid.length)
					(++nextCell) * 1;
				// focus on the next cell horizontally
				activateCell(nextCell);
				// target.bubble('tracelog','nextCell '+nextCell);
			} else return;
		} else {
			if ((nextCell = nextCell * 1 + cwdWidth * 1) < cwdGrid.length) {
				// skip over blacked out squares
				while (cwdGrid.charAt(nextCell) == '.' && parseInt(nextCell) < cwdGrid.length)
					nextCell = nextCell * 1 + cwdWidth * 1;
				// focus on the next cell vertically
				activateCell(nextCell);
			} else return;
		}
		
		
	};
	
	target.checkForAWin = function() {
		//check for a win
		//target.bubble('tracelog','checkForAWin');
		var alldone = true;
		for ( var i = 0; i < cwdGrid.length; i++) {
			//target.bubble('tracelog', 'i='+i+",sol="+cwdSolution.charAt(i)+",ans="+target['cell' + pad(i, 3)].getValue());
			if (cwdSolution.charAt(i) != "." && target['cell' + pad(i, 3)].getValue() != cwdSolution.charAt(i))
				alldone = false;
		}
		if (alldone) {
			target.WIN_DIALOG.open();
		}
		return;
	}
	
	target.doSwitchKeyboard = function(sender) {
		//target.bubble('tracelog','doSwitchKeyboard');
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
			this['BUTTON_1'].setText(strUnShift);
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
			this['BUTTON_1'].setText(strShift);
			keyboardLow = true;
		}
	}

	// activates the clicked cell
	// only gets called externally 
	target.doGridClick = function(sender) {
		var id, sq, u, v;

		id = getSoValue(sender, "id");
		sq = id.substring(2, 5);
		activateCell(sq);
	};

	// toggles between across down directions
	// direction is used to display across and down clues and also to determine direction of typed in words
	target.changeDirection = function(sender) {
		var msg;
		// nt functionality needs to be implemented
		if (isNT) {
			var e = {
				button : 2
			};
			
		} else {
			direction = (direction + 1) % 2;
			msg = (direction == 0) ? "MODE: Across" : "MODE: Down";
			target.Touch.mode.setValue(msg);
			activateCell(currCell);
		}
	};

/****************************************** End of screen interaction functionality ********************************************/

	// displays a help page 

	target.showHelp = function(sender) {
		displayHelp = !displayHelp;
		this.closeHelpText.enable(displayHelp);
		this.closeHelpText.show(displayHelp);
		this.helpText.show(displayHelp);
		if (displayHelp) {
			this.doNext = function() {
				this.helpTextPgDwn()
			};
			this.doPrevious = function() {
				this.helpTextPgUp()
			};
		} else {
			this.doNext = function() {
				this.changeDirection()
			};
			this.doPrevious = function() {
				this.changeDirection()
			};
		}
	};

	target.helpTextPgDwn = function() {
		fnPageScroll.call(this.helpText, true, 1);
	}

	target.helpTextPgUp = function() {
		fnPageScroll.call(this.helpText, true, -1);
	}
	
	target.doShowPuzzleDialog = function(sender) {
		this.saveCrossword();
		prevPuzzleIndex = currPuzzleIndex;
		target.PUZZLE_DIALOG.show(true);
		return;
	}

/************************************************** Menu actions ***************************************************************/
	// menu exist in the scope of DOCUMENT !! [original mine sweeper comment. dig]
	
	// GAME menu
	// this should somehow allow user to load a different puzzle
	// either by browsing the list of available puzzles or by simply loading the next one in a list
	target.container.container.switchPuzzle = function(sender) {
		var x = getSoValue(sender, "index");
		// save progress of current puzzle
		target.saveCrossword();
		switch (x) {
			case 0: {
				prevPuzzleIndex = currPuzzleIndex;
				target.PUZZLE_DIALOG.show(true);	
				break;
			}
			case 1: {
				currPuzzleIndex = (currPuzzleIndex + 1) % puzzleNames.length;
				target.loadCrossword();
				break;
			}
		}
	};
	
	target.container.container.clearWord = function(sender) {
		if (direction == 0) {
			// go backward horizontally until a black square is encountered to get to the beginning of the current word 
			for (i = currCell; (i % cwdWidth) != 0 && cwdGrid.charAt(i - 1) != '.'; i--);
			// go forward clearing each letter
			for (j = i; cwdGrid.charAt(j) != '.' && j < (Math.floor(i/cwdWidth) * cwdWidth + cwdWidth); j++)
				target['cell' + pad(j, 3)].setValue("");
		} else {
			// go upward until a black square is encountered to get to the beginning of the word
			for (i = currCell; i >= 0 && cwdGrid.charAt(i - cwdWidth) != '.'; i = i - cwdWidth);
			if (i < 0) i = i + cwdWidth;
			// go forward clearing each letter
			for (j = i; cwdGrid.charAt(j) != '.' && j < (cwdWidth*cwdHeight); j = j + cwdWidth)
				target['cell' + pad(j, 3)].setValue("");
		}
		return;
	};
	
	target.container.container.clearPuzzle = function(sender) {
		for ( var i = 0; i < cwdGrid.length; i++)
			target['cell' + pad(i, 3)].setValue("");
	};
	
	target.PUZZLE_DIALOG.closeDlg = function() {
		if (currPuzzleIndex != prevPuzzleIndex)
			target.loadCrossword();
	}	
	 
	target.PUZZLE_DIALOG.doPrevNextPuzzle = function(sender){
		var senderID, len;
		var fileName;
		
		senderID = getSoValue(sender,"id");
				
		len = puzzleNames.length;
		//target.bubble('tracelog', 'puzzleNames.length = ' + len);
		fileName = target.getVariable("fileName");
		// for(i = 0; puzzleNames[i] != fileName && i < len; i++);
		// target.bubble('tracelog','doPrevNextPuzzle : i = '+i);
		// target.bubble('tracelog','doPrevNextPuzzle : puzzleNames[i] '+puzzleNames[i % len]);

		//target.bubble('tracelog', 'doPrevNextPuzzle: senderID ' + senderID);
		//target.bubble('tracelog','doPrevNextPuzzle : [before] currPuzzleIndex = ' + currPuzzleIndex);

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

		//target.bubble('tracelog','doPrevNextPuzzle : [after] currPuzzleIndex = ' + currPuzzleIndex);
		
		this.container.setVariable("fileName", puzzleNames[currPuzzleIndex]);

		//target.bubble('tracelog','doPrevNextPuzzle : fname = ' + target.getVariable("fileName"));
	}	

	// CHECK menu
	// provides various various options for checking/revealing the current letter/word/puzzle 
	target.container.container.hint = function(sender) {
		var x = getSoValue(sender, "index");
		
		//target.bubble('tracelog','in hint: sender index = ' + x);
			
		switch (x) {
			// check that the letter in the current cell is correct
			case 0: {
				if (target['cell' + pad(currCell, 3)].getValue() != "" && target['cell' + pad(currCell, 3)].getValue() != cwdSolution.charAt(currCell))
					target['sq' + pad(currCell, 3)].u = 3;
				break;
			}
			// check that the current word is correct
			case 1: {
				if (direction == 0) {
					//*****this is no longer necessary since *NumberMap[currCell] now carries the array index of the numbered square
					//*****actually *NumberMap[currCell] now carries the number of the clue in the corresponding orientation
					// go backward horizontally until a black square is encountered to get to the beginning of the current word 
					for (i = currCell; (i % cwdWidth) != 0 && cwdGrid.charAt(i - 1) != '.'; i--);
					// go forward checking each letter
					//target.bubble('tracelog','in hint: check slot ' + acrossNumberMap[pad(currCell, 3)]);
					//for (j = acrossNumberMap[pad(currCell, 3)]; cwdGrid.charAt(j) != '.'; j++)
						//target.bubble('tracelog', 'in hint: checking slot ' + j);
					//for (j = acrossNumberMap[pad(currCell, 3)] * 1; cwdGrid.charAt(j) != '.' && j < (acrossNumberMap[pad(currCell, 3)]/cwdWidth)*(cwdWidth+1); j++) {
					for (j = i; cwdGrid.charAt(j) != '.' && j < (Math.floor(i/cwdWidth) * cwdWidth + cwdWidth); j++) {
						//target.bubble('tracelog', 'in hint: checking slot ' + j + ' ' + target['cell' + pad(j, 3)].getValue() + ' ' + cwdSolution.charAt(j));
						if (target['cell' + pad(j, 3)].getValue() != "" && target['cell' + pad(j, 3)].getValue() != cwdSolution.charAt(j))
							target['sq' + pad(j, 3)].u = 3;
						}
				} else {
					// go upward until a black square is encountered to get to the beginning of the word
					for (i = currCell; i >= 0 && cwdGrid.charAt(i - cwdWidth) != '.'; i = i - cwdWidth);
					if (i < 0) i = i + cwdWidth;
					// go forward checking each letter
					//for (j = downNumberMap[pad(currCell, 3)]; cwdGrid.charAt(j) != '.' && j <= (cwdWidth*(cwdHeight-1) + downNumberMap[pad(currCell, 3)]); j = j + cwdWidth * 1)
					for (j = i; cwdGrid.charAt(j) != '.' && j < (cwdWidth*cwdHeight); j = j + cwdWidth)
						if (target['cell' + pad(j, 3)].getValue() != "" && target['cell' + pad(j, 3)].getValue() != cwdSolution.charAt(j))
							target['sq' + pad(j, 3)].u = 3;
				}
				break;
			}
			// check the whole puzzle
			case 2: {
				for ( var i = 0; i < cwdGrid.length; i++)
					if (target['cell' + pad(i, 3)].getValue() != ""	&& target['cell' + pad(i, 3)].getValue() != cwdSolution.charAt(i))
						target['sq' + pad(i, 3)].u = 3;
				break;
			}
			// reveal current letter
			case 4: {
				target['cell' + pad(currCell, 3)].setValue(cwdSolution.charAt(currCell));
				break;
			}
			// reveal current word
			case 5: {
				if (direction == 0) {
					// go backward horizontally until a black square is encountered to get to the beginning of the current word 
					for (i = currCell; (i % cwdWidth) != 0 && cwdGrid.charAt(i - 1) != '.'; i--);
					// go forward checking each letter
					for (j = i; cwdGrid.charAt(j) != '.' && j < (Math.floor(i/cwdWidth) * cwdWidth + cwdWidth); j++)
						target['cell' + pad(j, 3)].setValue(cwdSolution.charAt(j));
				} else {
					// go upward until a black square is encountered to get to the beginning of the word
					for (i = currCell; i >= 0 && cwdGrid.charAt(i - cwdWidth) != '.'; i = i - cwdWidth);
					if (i < 0) i = i + cwdWidth;
					// go forward checking each letter
					for (j = i; cwdGrid.charAt(j) != '.' && j < (cwdWidth*cwdHeight); j = j + cwdWidth)
						target['cell' + pad(j, 3)].setValue(cwdSolution.charAt(j));
				}
				break;
			}
			default : target.bubble('tracelog','in hint: switch default');
		}
	};

/*********************************************** End menu actions **************************************************************/

	// checks for 900/950 screensize
	var is950 = function() {
		return getSoValue(target, 'height') > 900;
	};
	
	// Returns the index of the documents image pointing to cell at given
	// x,y coords (on 0..n-1 scale). Very useful fn.
	// Notes: topImages are the 3 bomb digits, the face, & the 3 time digits.
	// Uses cwdWidth-1+2 (not cwdWidth) to include borderRight images.
	var imageIndexOf = function(x, y) {
		return pad(x + y * (cwdWidth), 3);
	}

	// Complete the Win process. Save the cookies, and call the winning window.
	var winShowWindow = function() {


		// save quickest times to save file
		// target.saveSettings(); // will be saved on exit

		// target.WIN_DIALOG.open();
	}
	
	var closeAllMenus = function() {
		return true;
	}

	//temporary functions since menu doesn't work
	target.doCheckPuzzle = function(sender) {
		for ( var i = 0; i < cwdGrid.length; i++) {
			if (target['cell' + pad(i, 3)].getValue() != ""	&& target['cell' + pad(i, 3)].getValue() != cwdSolution.charAt(i))
				target['sq' + pad(i, 3)].u = 3;
		}
		return;
	}
	
	target.doRevealLetter = function(sender) {
		target['cell' + pad(currCell, 3)].setValue(cwdSolution.charAt(currCell));
		this.checkForAWin();
		return;
	}
	
	target.doRevealWord = function(sender) {
		if (direction == 0) {
			// go backward horizontally until a black square is encountered to get to the beginning of the current word 
			for (i = currCell; (i % cwdWidth) != 0 && cwdGrid.charAt(i - 1) != '.'; i--);
			// go forward checking each letter
			for (j = i; cwdGrid.charAt(j) != '.' && j < (Math.floor(i/cwdWidth) * cwdWidth + cwdWidth); j++)
				target['cell' + pad(j, 3)].setValue(cwdSolution.charAt(j));
		} else {
			// go upward until a black square is encountered to get to the beginning of the word
			for (i = currCell; i >= 0 && cwdGrid.charAt(i - cwdWidth) != '.'; i = i - cwdWidth);
			if (i < 0) i = i + cwdWidth;
			// go forward checking each letter
			for (j = i; cwdGrid.charAt(j) != '.' && j < (cwdWidth*cwdHeight); j = j + cwdWidth)
				target['cell' + pad(j, 3)].setValue(cwdSolution.charAt(j));
		}
		this.checkForAWin();
		return;
	}
}; // end of tmp

try {
	tmp();
} catch (e) {
	target.bubble('tracelog', 'error in word.js');
}

tmp = undefined;
