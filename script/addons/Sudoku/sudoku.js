// Original code Mikhail Sharonov
// History:
//	2010-07-24 Mark Nord	use only one set of 89 Sprits and lesser use of target
//	2010-11-17 Mark Nord	clickable in Sim, maybe useable on touch-devices
//		Issues:	Select Game not implemented yet
//				Zero-Sprite without glyph after Exit Quit via menubar, the simulator lose focus and becomes unresponsive
//	2010-11-20 Mark Nord	full functional in Simulator
//		Core functions used: _Core.system.getSoValue
//	 2010-11-21 Mark Nord	decided to explicit include code for getSoValue
//	2010-11-21 Mark Nord	3rd and 4th row of sprite-skin
//	2010-12-01 Mark Nord	fix menuBar.endLoop, use of Core-functions, no expicit code <== isn't possible
//	2011-12-03 Mark Nord	use of sandbox-exposed Core-functions
//		Core.config.compat.hasNumericButtons =>  kbook.autoRunRoot.hasNumericButtons
//		Core.system.getSoValue =>  kbook.autoRunRoot.getSoValue
//		Core.system.compile => prsp.compile
// 	2011-03-01 kartu - Moved into a function, to allow variable name optimizations
//  	2011-03-24 Mark Nord: skins changed over to use common AppAssests
//	2011-03-25 Ben Chenoweth: added quit for Touch readers; added app icon and title
//	2011-05-19 Mark Nord - removed Exit from menu -> exit via home-button; path for savegames is set to /Data/

var tmp = function () {
	var firstX = 81;
	var firstY = 195;
	
	var curDX = 50;
	var curDY = 50;
	
	var posX = 0;
	var posY = 0;
	
	var menuX = 0;
	
	var menuDX = 185;
	var subDY = 22;
	
	var menufirstX = 21;
	var menufirstY = 45;
	
	var subfirstX = 60;
	var subfirstY = 90;
	
	
	var isMenu = true;
	var isSubMenu = false;
	var isEntering = false;
	var isEnteringFirst = false;
	
	
	var startTime = "";
	
	var sudokuFiles = new Array("simple.tpl", "easy.tpl", "medium.tpl", "hard.tpl");
	var sudokuNumRecords = new Array(0, 0, 0, 0);
	
	var subMenuPos = new Array(0, 0, 0);
	var subMenuPosMax = new Array(3, 3, 1);
	
	var cNum = 1;
	
	var currentPuzzle = 0;
	
//	var newEvent = prsp.compile("param", "return new Event(param)");
	
	var hasNumericButtons = kbook.autoRunRoot.hasNumericButtons;
	var getSoValue = kbook.autoRunRoot.getSoValue;
	var datPath = kbook.autoRunRoot.gamesSavePath+'Sudoku/';
	
	var lastSprite = "Digit00";
	
	var drawMenuCursor = function (x) {
		target.nonTouch.menuCursor.changeLayout(menufirstX + x * menuDX, undefined, undefined, menufirstY, undefined, undefined);
	};
	
	var showTime = function () {
	
		var time = new Date();
		var timeLocale = time.toLocaleTimeString();
		var show = timeLocale.substring(0, timeLocale.lastIndexOf(':'));
	
		if (startTime != "") {
			var playDuration = time - startTime;
			var seconds = Math.floor(playDuration / 1000);
			var h = Math.floor(seconds / 3600);
			var m = Math.floor((seconds % 3600) / 60);
	
			if (h < 10) h = "0" + h;
			if (m < 10) m = "0" + m;
	
			var showDuration = "Play time " + h + ":" + m;
	
			target.clock2.setValue(showDuration);
		} else target.clock2.setValue("");
	
		// kartu: commented out as it overlaps with standard clock
		//target.clock1.setValue(show);
	
	};
	
	var drawSubMenu = function (x) {
		var id = 'subMenu' + x;
		target.nonTouch.subMenu0.show(true);
		target.nonTouch.subMenu1.show(true);
		target.nonTouch.subMenu2.show(true);
		target.nonTouch.currentNum.show(true);
		target.nonTouch.subMenu0.changeLayout(subfirstX + 0 * menuDX, undefined, undefined, subfirstY, undefined, undefined);
		target.nonTouch.subMenu1.changeLayout(subfirstX + 1 * menuDX, undefined, undefined, subfirstY, undefined, undefined);
		target.nonTouch.subMenu2.changeLayout(subfirstX + 2 * menuDX, undefined, undefined, subfirstY, undefined, undefined);
		target.nonTouch.currentNum.show(false);
		target.nonTouch.subMenu0.show(false);
		target.nonTouch.subMenu1.show(false);
		target.nonTouch.subMenu2.show(false);
		if (isSubMenu) {
			target.nonTouch[id].show(true);
		}
	};
	
	var drawSubMenuCursor = function () {
		target.nonTouch.subCursor.show(true);
		target.nonTouch.subCursor.changeLayout(subfirstX + menuX * menuDX, undefined, undefined, subfirstY + subMenuPos[menuX] * subDY, undefined, undefined);
		target.nonTouch.subCursor.show(false);
		isEntering = false;
		cNum = cNum * 1;
		if (isSubMenu) {
			if ((menuX == 0) & (subMenuPos[0] == 2)) {
				isEntering = true;
				isEnteringFirst = true;
			}
			target.nonTouch.subCursor.show(true);
		}
	};
	
	var drawCurrentNum = function () {
		target.nonTouch.currentNum.show(false);
		target.nonTouch.currentNum.setValue(cNum);
		if ((isSubMenu) & (menuX == 0)) {
			target.nonTouch.currentNum.show(true);
		}
	};
	
	var showLabels = function () {
		var totalPuzzles = sudokuNumRecords[subMenuPos[1]];
	
		if (totalPuzzles == 0) currentPuzzle = 0;
	
		if (subMenuPos[1] == 0) totalPuzzles = "Simple:" + totalPuzzles;
		if (subMenuPos[1] == 1) totalPuzzles = "Easy:" + totalPuzzles;
		if (subMenuPos[1] == 2) totalPuzzles = "Medium:" + totalPuzzles;
		if (subMenuPos[1] == 3) totalPuzzles = "Hard:" + totalPuzzles;
	
		target.numRecords.setValue(totalPuzzles);
		target.numCurrent.setValue(currentPuzzle);
		if (currentPuzzle == 0) {
			target.numCurrent.show(false);
			target.sometext1.show(false);
		} else {
			target.numCurrent.show(true);
			target.sometext1.show(true);
		}
	};
	
	target.init = function () {
		/* set translated appTitle and appIcon */
		this.appTitle.setValue(kbook.autoRunRoot._title);
		this.appIcon.u = kbook.autoRunRoot._icon;
	
		this.cCon.show(false);
		showTime();
		this.nonTouch.menuCursor.show(true);
	
		if (!hasNumericButtons) {
			this.nonTouch.show(false);
			this.Touch.show(true);
			this.Touch.cNum.show(false);
		} else {
			this.nonTouch.show(true);
			this.Touch.show(false);
			this.touchButtons4.show(false);
		}
	
		this.nonTouch.subCursor.show(true);
		this.nonTouch.subMenu0.show(true);
		this.nonTouch.subMenu1.show(true);
		this.nonTouch.subMenu2.show(true);
	
		menuX = 0;
		drawMenuCursor(menuX);
		drawGridCursor(posX, posY);
		for (var i = 0; i < 4; i++) checkSudokuFiles(i);
		showLabels();
	
		this.nonTouch.subCursor.show(false);
		this.nonTouch.subMenu0.show(false);
		this.nonTouch.subMenu1.show(false);
		this.nonTouch.subMenu2.show(false);
		this.bckGround.show(false);
	};
	
	var showSubMenu = function (x) {
		drawSubMenu(x);
		drawSubMenuCursor();
		drawCurrentNum();
	};
	
	target.doMenuF = function () {
		this.cCon.stopAnimation("cCon");
		this.cCon.show(false);
		this.bckGround.show(false);
		isSubMenu = false;
		showSubMenu(menuX, 0);
	
		this.nonTouch.menuCursor.show(true);
		isMenu = true;
		menuX = 0;
		// drawGridCursor(posX, posY);
		drawMenuCursor(0);
		startTime = "";
		showTime();
	};
	
	
	var startSudoku = function () {
		eraseBoard();
		if (currentPuzzle > 0) {
			// 2 lines to handle touch-interface
			target.Touch.key0.u = 10;
			target.Touch.cNum.show(false);
	
			var s = getSudokuString(currentPuzzle - 1, subMenuPos[1]);
			if (s != '') doSudoku(s);
			target.nonTouch.menuCursor.show(true);
			posX = 0;
			posY = 0;
			drawGridCursor(posX, posY);
			drawMenuCursor(menuX);
			target.nonTouch.menuCursor.show(false)
			isMenu = false;
			startTime = new Date();
			showTime();
		}
	};
	
	/* functions to be called by fsk_menu */
	target.GameRandom = function () {
		var nStr = Math.floor(Math.random() * sudokuNumRecords[subMenuPos[1]]);
		currentPuzzle = nStr + 1;
		showLabels();
		startSudoku();
	};
	
	target.GameNext = function () {
		currentPuzzle = currentPuzzle + 1;
		if (currentPuzzle > sudokuNumRecords[subMenuPos[1]]) currentPuzzle = 0;
		showLabels();
		startSudoku();
	};
	
	target.GameLoad = function () {
		eraseBoard();
		loadGame();
		showLabels();
		target.nonTouch.menuCursor.show(true);
		posX = 0;
		posY = 0;
		drawGridCursor(posX, posY);
		drawMenuCursor(menuX);
		target.nonTouch.menuCursor.show(false);
		startTime = new Date();
		showTime();
		isMenu = false;
	};
	
	target.GameSelect = function () {
		isEntering = true;
		isEnteringFirst = true;
		target.Touch.key0.u = 11;
		target.Touch.cNum.cNum.setValue(cNum);
		target.Touch.cNum.show(true);
	};
	
	/* menu exist in the scope of DOCUMENT !! */
	target.container.container.doSelectLevel = function(sender) {
		var x = getSoValue(sender,"index");
		subMenuPos[1] = x;
		//	this.bubble("tracelog","x="+x); // debug
		currentPuzzle = 0;
		showLabels();
	};
	
	target.GameSave = function () {
		saveGame();
	};
	
	target.exitQuit = function () {
		kbook.autoRunRoot.exitIf(kbook.model);
	};
	
	/* handler for "digit-key-sprites" */
	target.doNumKey = function (sender) {
		var x = getSoValue(sender,"id").substring(3,4);
		//	this.bubble("tracelog","id="+x); // debug
		this.drawDigit(x);
	};
	
	/* handler for "grid-sprites" */
	target.doGridClick = function (sender) {
		var id, y, x, v;
		id = getSoValue(sender,"id");
		y = id.substring(5,6);
		x = id.substring(6,7);
		v = getSoValue(sender,"v");
		//	this.bubble("tracelog","posX="+x); // debug
		//	this.bubble("tracelog","posY="+y);
		//	this.bubble("tracelog","v="+v);
		if (v == 2) {
			posX = x;
			posY = y;
			drawGridCursor(posX, posY);
		    }
	};
	
	target.doCenterF = function () {
	
		if (isMenu) {
			if (isSubMenu) {
				switch (menuX) {
				case 0:
					{
						switch (subMenuPos[0]) {
						case 0:
							{	target.GameRandom();
								break;
							}
						case 1:
							{	target.GameNext();
								break;
							}
						case 2:	{	currentPuzzle = cNum * 1;
								if (currentPuzzle > sudokuNumRecords[subMenuPos[1]]) {
									currentPuzzle = 0;
									cNum = "";
								};
	
								showLabels();
								startSudoku();
								break;
							}
						case 3:
							{	target.GameLoad();
								break;
							}
	
						} // end of switch
	
						break;
					}
				case 1:
					{
						currentPuzzle = 0;
						showLabels();
						break;
					}
				case 2:
					{
						if (subMenuPos[2] == 1) saveGame();
	
						if (subMenuPos[2] == 0) {
							kbook.autoRunRoot.exitIf(kbook.model);
							return;
						};
						break;
					}
	
				} //end of switch
			}
			isSubMenu = !isSubMenu;
			showSubMenu(menuX);
	
		}
	};
	
	target.moveCursor = function (direction) {
		showTime();
		if (isSubMenu) {
			if (direction == "up") {
				subMenuPos[menuX] = subMenuPos[menuX] - 1;
				if (subMenuPos[menuX] < 0) subMenuPos[menuX] = subMenuPosMax[menuX];
				drawSubMenuCursor();
			}
			if (direction == "down") {
				subMenuPos[menuX] = subMenuPos[menuX] + 1;
				if (subMenuPos[menuX] > subMenuPosMax[menuX]) subMenuPos[menuX] = 0;
				drawSubMenuCursor();
			}
	
		}
	
		if (!isMenu) {
			if (direction == "right") {
				posX = posX + 1;
				if (posX > 8) posX = 0;
			}
			if (direction == "left") {
				posX = posX - 1;
				if (posX < 0) posX = 8;
			}
			if (direction == "up") {
				posY = posY - 1;
				if (posY < 0) posY = 8;
			}
			if (direction == "down") {
				posY = posY + 1;
				if (posY > 8) posY = 0;
			}
			drawGridCursor(posX, posY);
		} else moveMenuCursor(direction);
	
		showSubMenu(menuX, 0);
	};
	
	var moveMenuCursor = function (direction) {
		if (isMenu) {
			if (direction == "right") {
				menuX = menuX + 1;
				if (menuX > 2) menuX = 0;
			}
			if (direction == "left") {
				menuX = menuX - 1;
				if (menuX < 0) menuX = 2;
			}
			drawMenuCursor(menuX);
		}
	};
	
	var drawGridCursor = function (x, y) {
		// target.gridCursor.changeLayout(firstX + x * curDX, undefined, undefined, firstY + y * curDY, undefined, undefined);
		var id = "Digit" + y + x;
		if (lastSprite != id) {
			target[lastSprite].v--}
		lastSprite = id;
		target[id].v++;
	};
	
	target.drawDigit = function (key) {
	
		if (isEntering) {
			if (isEnteringFirst) {
				cNum = "";
				isEnteringFirst = false;
			}
	
			if (key=="O") {			// add for touch interface
				isEntering = false;
				currentPuzzle = cNum * 1;
				showLabels();
				startSudoku();
				return;
			}
			if (key=="A") {			// add for touch interface
				isEntering = false;
				target.Touch.cNum.show(false);
				return;
			}
	
			cNum = cNum + key;
			this.nonTouch.currentNum.setValue(cNum);
			this.Touch.cNum.cNum.setValue(cNum);
	
		}
		if ((!isMenu) && (!isEntering)) {
			var id = "Digit" + posY + posX;
	
			if (this[id].v > 1 ) {
				showTime();
				this[id].u = key;
				checkDone();
	
			}
	
		}
	
	};
	
	var doSudoku = function (strTemplate) {
		for (var i = 0; i < 9; i++)
		for (var j = 0; j < 9; j++) {
			var id = "Digit" + i + j;
			var dig = strTemplate.charAt(j + 9 * i);
	
			if ((dig > 0) && (dig <= 9)) {
				target[id].u = dig;
				target[id].v = 0;		// FixDigit
			} else {
				target[id].u = 0;
				target[id].v = 2;		//CustDigit
			}
		}
	};
	
	var eraseBoard = function () {
		lastSprite = "Digit00";
		for (var i = 0; i < 9; i++)
		for (var j = 0; j < 9; j++) {
			var id = "Digit" + i + j;
			target[id].u = 0;
			target[id].v = 2;
		}
	};
	
	
	var checkSudokuFiles = function (num) {
		var res = null;
		var sudokuPath = target.sudokuRoot + 'sudoku/' + sudokuFiles[num];
		var i = 0;
	
		if (FileSystem.getFileInfo(sudokuPath)) {
			var stream = new Stream.File(sudokuPath);
			while (stream.bytesAvailable) {
				var s = stream.readLine();
				if (s.length == 81) i++;
			}
			res = i;
			if (res > 0) sudokuNumRecords[num] = i;
			stream.close();
		}
		stream.close();
	
		return res;
	};
	
	
	var getSudokuString = function (nStr, num) {
		var res = '';
		var sudokuPath = target.sudokuRoot + 'sudoku/' + sudokuFiles[num];
	
		var i = 0;
	
		try {
			var stream = new Stream.File(sudokuPath);
			while (stream.bytesAvailable) {
				var s = stream.readLine();
				if (s.length == 81) i++;
				if (i == (nStr + 1)) {
					res = s;
					break
				};
			}
	
		}
		catch(e) {
			res = '';
		}
		stream.close();
	
		return res;
	};
	
	var saveGame = function () {
	
		var res = true;
		/*if (kbook.simEnviro){	var sudokuPath = target.sudokuRoot + 'game';}
		else {	var sudokuPath = '/Data/sudoku.dat';} */
		var sudokuPath = datPath+'sudoku.dat';
		FileSystem.ensureDirectory(datPath); 
		var fixStr = "";
		var custStr = "";
	
		for (var i = 0; i < 9; i++)
		for (var j = 0; j < 9; j++) {
			var id = "Digit" + i + j;
			if ((target[id].u > 0) && (target[id].v <= 1)) fixStr = fixStr + target[id].u;
			else fixStr = fixStr + ".";
			if ((target[id].u > 0) && (target[id].v >= 2)) custStr = custStr + target[id].u;
			else custStr = custStr + ".";
		}
	
		try {
			if (FileSystem.getFileInfo(sudokuPath)) FileSystem.deleteFile(sudokuPath);
			var stream = new Stream.File(sudokuPath, 1);
			stream.writeLine(cNum);
			stream.writeLine(currentPuzzle);
			stream.writeLine(subMenuPos[0]);
			stream.writeLine(subMenuPos[1]);
			stream.writeLine(subMenuPos[2]);
			stream.writeLine(fixStr);
			stream.writeLine(custStr);
			stream.close();
		}
		catch(e) {
			res = false;
		}
		stream.close();
	
		return res;
	};
	
	
	var loadGame = function () {
		var res = true;
		/*if (kbook.simEnviro){	var sudokuPath = target.sudokuRoot + 'game';}
		else {	var sudokuPath = '/Data/sudoku.dat';} */
		var sudokuPath = datPath+'sudoku.dat';
		var fixStr = "";
		var custStr = "";
	
		try {
			if (FileSystem.getFileInfo(sudokuPath)) {
				var stream = new Stream.File(sudokuPath);
	
				cNum = stream.readLine();
				currentPuzzle = parseInt(stream.readLine());
				var a = stream.readLine();
				a = stream.readLine();
				subMenuPos[1] = a * 1;
				a = stream.readLine();
				subMenuPos[2] = a * 1;
				fixStr = stream.readLine();
				custStr = stream.readLine();
	
				for (var i = 0; i < 9; i++)
				for (var j = 0; j < 9; j++) {
					var id = "Digit" + i + j;
					var digF = fixStr.charAt(j + 9 * i);
					var digC = custStr.charAt(j + 9 * i);
	
					if ((digF > 0) && (digF <= 9)) { target[id].u = digF; target[id].v = 0;}
					if ((digC > 0) && (digC <= 9)) { target[id].u = digC; target[id].v = 2;}
				}
				stream.close();
			}
		}
		catch(e) {
			res = false;
		}
		stream.close();
	
		return res;
	};
	
	var checkDone = function () {
		var i = 0;
		var j = 0;
		var id = "";
		var chF = 0;
		var chN = 0;
		target.bckGround.show(false);
		target.cCon.stopAnimation("cCon");
		target.cCon.show(false);
	
		for (i = 0; i < 9; i++)
		for (j = 0; j < 9; j++) {
			id = "Digit" + i + j;
			if ((target[id].u <= 0) ) return;
		}
	
		for (i = 0; i < 9; i++)
		for (j = 0; j < 8; j++) {
			id = "Digit" + i + j;
			chF = target[id].u;
			for (var k = j + 1; k < 9; k++) {
				id = "Digit" + i + k;
				if (target[id].v > 1) chN = target[id].u; else chN = -1;
				if (chF == chN) return;
			}
		}
	
		for (j = 0; j < 9; j++)
		for (i = 0; i < 8; i++) {
			id = "Digit" + i + j;
			chF = target[id].u;
			for (var k = i + 1; k < 9; k++) {
				id = "Digit" + k + j;
				if (target[id].v > 1) chN = target[id].u; else chN = -1;
				if (chF == chN) return;
			}
		}
	
		if (hasNumericButtons)
			target.bckGround.show(true);
		target.cCon.show(true);
		target.cCon.startAnimation("cCon");
	
	};

	target.doRoot = function (sender) {
		kbook.autoRunRoot.exitIf(kbook.model);
		return;
	};	
};
tmp();
tmp = undefined;
