// Name: Fiveballs game
//   Original code (c) 2008 Clemenseken
//   
//	History:
//	date? kartu - further adaptation
//	2010-12-11 Ben Chenoweth - conversion for Touch
//	2010-12-12 Ben Chenoweth - applied Mark Nord's temporary workaround for PRS+1.1.3 on PRS-505
//	2011-02-06 Ben Chenoweth - HOME button now quits game
//	2011-02-10 Ben Chenoweth - Replaced small menu with buttons (touch version).
//	2011-02-28 Ben Chenoweth - Changed addon name to CamelCase
//  2011-03-01 kartu - Moved into a function, to allow variable name optimizations
//  2011-03-20 Beb Chenoweth - Moved all labels out of status bar; moved this changelog from startup script into main script.
//  2011-03-24 Mark Nord - skins changed over to use common AppAssests
//  2011-03-25 Ben Chenoweth - made a few small adjustments to AppAssests skins
//  2011-06-02 Mark Nord - unified UI
//	2012-05-22 Ben Chenoweth - Removed unused variables; changed globals to locals

var tmp = function () {
	var firstX = 40,
	curDX = 50,
	firstY = 45,
	curDY = 50,
	posX,
	posY,
	hasNumericButtons = kbook.autoRunRoot.hasNumericButtons,
	getSoValue = kbook.autoRunRoot.getSoValue,
	datpath,
	datPath0 = kbook.autoRunRoot.gamesSavePath+'FiveBalls/';
	
	target.help;
	target.anAus;
	target.col10m = [];
	target.summe;
	target.sameBall = [];
	target.cNum = 0;
	
	target.init = function () {
		/* set correct appIcon */
		this.appIcon.u = kbook.autoRunRoot._icon;

		FileSystem.ensureDirectory(datPath0);  		
		datPath = datPath0+'fiveballs.dat';

		if (!hasNumericButtons) {
			this.gridCursor.show(false);
			this.btn_hint_size.show(false);
			this.btn_hint_option.show(false);
			this.backGrd.show(false);
			this.helpInfo1.show(false);
			this.helpInfo2.show(false);
			this.helpInfo3.show(false);
			//this.Touch.MENUBAR.show(true);
		} else {
			this.gridCursor.show(true);
			this.btn_hint_home.show(false);
			this.help = 1;
			this.showHelp();
			//this.Touch.MENUBAR.show(false);
			//this.BUTTON_EXT.show(false);
			this.BUTTON_NEW.show(false);
		}
		this.anAus = 0;
		this.CloseGame1.show(this.anAus);
		this.CloseGame2.show(this.anAus);
	
		// TODO should store this as "options" instead
		//var datPath = this.fiveballsRoot + 'fiveballs.dat';
		try {
			if (FileSystem.getFileInfo(datPath)) {
				var stream = new Stream.File(datPath);
				this.cNum = stream.readLine();
				//this.bubble("tracelog","datPath="+datPath+", cNum="+this.cNum);
			}
			stream.close();
		} catch (e) {}
		for (var a = 0; a < 10; a++) this.col10m[a] = [];
		for (a = 0; a < 120; a++) this.sameBall[a] = [a];
		for (var x = 0; x < 10; x++) {
			for (var y = 0; y < 12; y++) {
				var randBL = Math.floor(Math.random() * 5) + 1;
				this.col10m[x][y] = randBL;
				this.sameBall[10 * y + x] = randBL;
			}
		}
		this.setBalls();
		posX = 1;
		posY = 0;
		this.drawGridCursor((9 + posX * 1) % 10, 0);
		this.drawSumNum();
		this.summe = 0;
		this.showScore.setValue("Score: 0");
	};
	
	target.removeB = function () {
		if (this.anAus == 1) {
			this.exitQuit();
			return;
		}
		var id = "5Balls" + ((9 + posX * 1) % 10) + '' + posY,
			ball = this[id].u;
		var YX = posY * 10 + ((9 + posX * 1) % 10);
		var zwisc1 = YX,
			zwisc2 = this.sameBall[YX];
		this.sameBall[YX] = -1 * ball - 70;
		this.findUdLr(ball, YX);
		var drin = false,
			j = 1;
		while (drin == false) {
			drin = true;
			for (var i = 0; i < 120; i++) {
				if ((this.sameBall[i] > -10) && (this.sameBall[i] < 0)) {
					YX = i;
					j++;
					this.sameBall[YX] = -1 * ball - 70;
					this.findUdLr(ball, YX);
					drin = false;
				}
			}
		}
		if (j > 1) {
			this.summe += j * (j - 1);
			this.showScore.setValue("Score: " + this.summe + " (" + j * (j - 1) + ")");
			for (i = 120; i > -1; i--) {
				if (this.sameBall[i] * 1 < 0) {
					i += "";
					var End = i.length - 1;
					this.col10m[i.substring(End)].splice(i.substring(0, End), 1);
					this.col10m[i.substring(End)][11] = 0;
				}
			}
			for (var x = 0; x < 10; x++) {
				var y = 0;
				while (this.col10m[x][11] == 0 && y < 12) {
					y++;
					this.col10m[x].splice(11, 1);
					var uS = this.col10m[x].unshift(0);
				}
			}
			for (x = 0; x < 10; x++) {
				for (y = 0; y < 12; y++) {
					this.sameBall[(10 * y + x)] = this.col10m[x][y];
				}
			}
			this.setBalls();
		} else {
			this.sameBall[zwisc1] = zwisc2;
		}
		this.drawSumNum();
	};
	
	target.findUdLr = function (ball, YX) {
		if (YX % 10 < 9) {
			for (var x = 1; (YX + x) % 10 > 0; x++) {
				if (this.sameBall[YX + x] == ball) this.sameBall[YX + x] = ball * -1;
				else
				break;
			}
		}
		for (x = 1; YX + 10 * x < 120; x++) {
			if (this.sameBall[YX + 10 * x] == ball) this.sameBall[YX + 10 * x] = ball * -1;
			else
			break;
		}
		if (YX % 10 > 0) {
			for (x = 1;
			(YX - x) % 10 < 9; x++) {
				if (this.sameBall[YX - x] == ball) this.sameBall[YX - x] = ball * -1;
				else
				break;
			}
		}
		for (x = 1; YX - 10 * x > -1; x++) {
			if (this.sameBall[YX - 10 * x] == ball) this.sameBall[YX - 10 * x] = ball * -1;
			else
			break;
		}
	};
	
	target.drawSumNum = function () {
		var stream;
		//var id = "5Balls" + ((9 + posX * 1) % 10) + '' + posY, ball = this[id].u;
		if (this.summe > this.cNum) {
			this.cNum = this.summe;
			// TODO should store this as "options" instead
			//datPath = this.fiveballsRoot + 'fiveballs.dat';
			try {
				if (FileSystem.getFileInfo(datPath)) FileSystem.deleteFile(datPath);
				stream = new Stream.File(datPath, 1);
				stream.writeLine(this.summe);
				stream.close();
			} catch (e) {}
		}
		this.sumNum.setValue('Highscore: ' + this.cNum);
		//this.sumNum.setValue('Highscore: ' + this.cNum + '  [' + (posY * 10 + ((9 + posX * 1) % 10)) + '/' + '5B' + ball + ']');
	};
	
	target.showHelp = function () {
		if (hasNumericButtons) {
			this.help = Math.abs(this.help - 1);
			this.backGrd.show(this.help);
			this.helpInfo1.show(this.help);
			this.helpInfo2.show(this.help);
			this.helpInfo3.show(this.help);
		}
	};
	
	target.setBalls = function () {
		var id, B1 = 0,
		B2 = 0,
		B3 = 0,
		B4 = 0,
		B5 = 0;
		for (var x = 0; x < 10; x++) {
			for (var y = 0; y < 12; y++) {
				id = "5Balls" + x + '' + y;
				this[id].u = this.col10m[x][y];
				switch (this[id].u) {
				case 0:
					{
						break;
					}
				case 1:
					{
						B1 += 1;
						break;
					}
				case 2:
					{
						B2 += 1;
						break;
					}
				case 3:
					{
						B3 += 1;
						break;
					}
				case 4:
					{
						B4 += 1;
						break;
					}
				case 5:
					{
						B5 += 1;
						break;
					}
				}
			}
		}
		this.Ball1.setValue(B1);
		this.Ball2.setValue(B2);
		this.Ball3.setValue(B3);
		this.Ball4.setValue(B4);
		this.Ball5.setValue(B5);
	};
	
	target.drawGridCursor = function (x, y) {
		this.gridCursor.changeLayout(firstX + x * curDX, undefined, undefined, firstY + y * curDY, undefined, undefined);
		this.help = 1;
		this.showHelp();
	};
	
	target.moveCursor = function (dir) {
		switch (dir) {
		case "down":
			{
				posY = (posY + 1) % 12;
				break;
			}
		case "up":
			{
				posY = (12 + posY - 1) % 12;
				break;
			}
		case "left":
			{
				posY = Math.max(0, posY - 3);
				break;
			}
		case "right":
			{
				posY = Math.min(11, posY + 3);
				break;
			}
		}
		this.drawSumNum();
		this.drawGridCursor(((9 + posX * 1) % 10), posY);
	};
	
	target.moveColum = function (zahl) {
		posX = zahl * 1;
		this.drawGridCursor(((9 + posX * 1) % 10), posY);
		this.drawSumNum();
	};
	
	target.doCenterF = function () {
		this.help = 1;
		this.showHelp();
		this.anAus = Math.abs(this.anAus - 1);
		this.backGrd.show(this.anAus);
		this.CloseGame1.show(this.anAus);
		this.CloseGame2.show(this.anAus);
	};
	
	target.doGridClick = function (sender) {
		var id, y, x;
		id = getSoValue(sender, "id");
		x = id.substring(6, 7);
		y = id.substring(7, 8);
		if (y == 1) {
			y = id.substring(7, 9);
		}
		//var u = getSoValue(sender, "u");
		//this.bubble("tracelog","id="+id+", x="+x+", y="+y+", u="+u);
		posX = parseInt(x, 10) + 1;
		posY = parseInt(y, 10);
		this.drawGridCursor(((9 + posX * 1) % 10), posY);
		this.removeB();
	};
	
	target.exitQuit = function () {
		var stream;
		if (this.summe > this.cNum) {
			// TODO should store this as "options" instead
			//datPath = this.fiveballsRoot + 'fiveballs.dat';
			try {
				if (FileSystem.getFileInfo(datPath)) FileSystem.deleteFile(datPath);
				stream = new Stream.File(datPath, 1);
				stream.writeLine(this.summe);
				stream.close();
			} catch (e) {}
		}
		kbook.autoRunRoot.exitIf(kbook.model);
		return;
	};
	
	
	target.doButtonClick = function (sender) {
		var id, n;
		id = getSoValue(sender, "id");
		n = id.substring(7, 10);
		if (n == "EXT") {
			kbook.autoRunRoot.exitIf(kbook.model);
			return;
		}
		if (n == "NEW") {
			this.init();
			return;
		}
	};
};
tmp();
tmp = undefined;