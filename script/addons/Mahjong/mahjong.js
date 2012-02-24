// Name: Mahjong game
//   Original code (c) '08 Clemenseken
//
//	History:
//	2010-12-03 Ben Chenoweth - Touch adaptation and startup Code for PRS+
//	2010-12-14 Ben Chenoweth - Removed some unnecessary graphics from the top of the screen.
//	2010-12-15 Ben Chenoweth - Fixed the menu bug in the non-Touch, and added two buttons to the Touch version: "New layout" and "Easy/Normal"
//	2011-02-10 Ben Chenoweth - Digit "0" quits (non-Touch); added Quit button (Touch)
//	2011-03-01 kartu - Moved into a function, to allow variable name optimizations
//	2011-03-20 Beb Chenoweth - Moved all labels out of status bar; moved this changelog from startup script into main script
//	2011-03-22 Mark Nord - <text> based Help
//	2011-03-26 Ben Chenoweth - Added congratulations upon completion
//	2011-05-15 Ben Chenoweth - Added remember last layout; reordered existing layouts and added new layout (Aztec); hid test layout
//	2011-05-28 Ben Chenoweth - Added new layout (BigHole)
//	2011-07-06 Ben Chenoweth - Added ability to click on congratulations message to make it disappear
//	2011-09-11 Ben Chenoweth - Selection now passes to new tile if tile does not complete a pair; numCurrent now correct at start of game
//	2011-11-29 Ben Chenoweth - Fixed bug where I, II, III and IV tiles were not being counted in available moves
//	2011-11-30 Ben Chenoweth - Fixed bug where I, II, III and IV tiles were not being counted in available moves (second attempt)
//	2011-12-27 Ben Chenoweth - Fixed Aztec layout
//	2011-12-30 Ben Chenoweth - Modified BigHole layout

var tmp = function () {
	var hasNumericButtons = kbook.autoRunRoot.hasNumericButtons;
	var getSoValue = kbook.autoRunRoot.getSoValue; 
	var getFileContent = kbook.autoRunRoot.getFileContent;
	var displayHelp = false;

	var datPath0 = kbook.autoRunRoot.gamesSavePath+'Mahjong/';
	FileSystem.ensureDirectory(datPath0);  
	var datPath  = datPath0 + 'mahjong.dat';
	
	target.L0 = 54; 
	target.T0 = 30;
	target.curDX = 62;
	target.curDY = 70;
	target.posX = 0;
	target.posY = 0;
	target.cNum;
	target.hH = 0;
	target.menuKlapp = 0;
	target.menuPos = 0;
	target.menuID;
	target.menuName = new Array("bild", "neu", "schwier", "hilf", "quit");
	target.TestLuft = [];
	target.Test_Plan = [22, 1, 32, 1, 42, 1, 52, 1, 24, 1, 34, 1, 44, 1, 54, 1, 26, 1, 36, 1, 46, 1, 56, 1];
	target.DragonLuft = [];
	target.Dragon_Plan = [0, 1, 30, 2, 40, 2, 70, 1, 1, 1, 31, 3, 41, 3, 71, 1, 2, 2, 22, 2, 32, 4, 42, 4, 52, 2, 72, 2, 3, 2, 13, 2, 23, 4, 33, 5, 43, 5, 53, 4, 63, 2, 73, 2, 4, 3, 14, 4, 24, 5, 34, 6, 44, 6, 54, 5, 64, 4, 74, 3, 5, 2, 15, 2, 25, 4, 35, 5, 45, 5, 55, 4, 65, 2, 75, 2, 6, 2, 26, 2, 36, 4, 46, 4, 56, 2, 76, 2, 7, 1, 37, 3, 47, 3, 77, 1, 8, 1, 38, 2, 48, 2, 78, 1];
	target.Italia2Luft = [];
	target.Italia2_Plan = [30, 4, 40, 5, 50, 5, 60, 5, 70, 3, 21, 3, 31, 4, 41, 2, 51, 2, 61, 4, 71, 2, 42, 4, 52, 2, 62, 1, 13, 4, 23, 3, 43, 4, 53, 4, 44, 3, 54, 5, 45, 3, 55, 5, 6, 4, 46, 4, 56, 3, 66, 1, 7, 4, 17, 2, 37, 2, 47, 3, 57, 2, 28, 2, 38, 2, 58, 2];
	target.GlypheLuft = [];
	target.Glyphe_Plan = [10, 2, 30, 2, 40, 2, 50, 2, 70, 2, 11, 3, 31, 3, 51, 3, 71, 3, 12, 4, 22, 3, 32, 4, 42, 3, 52, 4, 62, 3, 72, 4, 33, 4, 53, 4, 14, 3, 24, 4, 34, 5, 44, 7, 54, 5, 64, 4, 74, 3, 35, 4, 55, 4, 16, 4, 26, 3, 36, 4, 46, 3, 56, 4, 66, 3, 76, 4, 17, 2, 37, 3, 57, 3, 77, 2, 18, 1, 38, 2, 48, 1, 58, 2, 78, 1];
	target.CastleumLuft = [24, 40, 40, 41, 47, 48, 48, 64];
	target.Castleum_Plan = [30, 5, 40, 2, 50, 5, 21, 5, 31, 3, 41, 2, 51, 3, 61, 5, 12, 5, 22, 3, 62, 3, 72, 5, 13, 4, 23, 3, 63, 3, 73, 4, 14, 5, 24, 3, 44, 6, 64, 3, 74, 5, 15, 4, 25, 3, 65, 3, 75, 4, 16, 5, 26, 2, 66, 2, 76, 5, 27, 5, 37, 4, 57, 4, 67, 5, 38, 5, 48, 2, 58, 5];
	target.ItaliaLuft = [];
	target.Italia_Plan = [0, 4, 20, 4, 30, 4, 40, 4, 50, 2, 60, 4, 70, 2, 1, 2, 31, 4, 51, 4, 71, 4, 2, 4, 32, 4, 52, 4, 62, 4, 72, 4, 3, 4, 13, 2, 23, 1, 33, 4, 53, 4, 73, 4, 5, 4, 35, 4, 55, 3, 65, 4, 75, 2, 6, 4, 36, 2, 56, 4, 76, 4, 7, 4, 37, 4, 57, 4, 67, 4, 77, 4, 8, 4, 18, 4, 38, 4, 58, 4, 78, 4];
	target.ChinaLuft = [22, 22, 22, 31, 31, 31];
	target.China_Plan = [20, 7, 30, 6, 40, 4, 50, 3, 60, 4, 11, 5, 21, 4, 31, 2, 41, 2, 51, 1, 61, 1, 71, 3, 12, 6, 22, 2, 32, 6, 42, 4, 52, 3, 62, 1, 72, 2, 3, 4, 13, 2, 23, 2, 33, 4, 63, 2, 73, 3, 4, 3, 14, 2, 24, 2, 34, 3, 5, 2, 15, 1, 25, 1, 35, 2, 65, 2, 75, 3, 6, 1, 16, 3, 26, 1, 36, 3, 46, 2, 56, 3, 66, 1, 76, 1, 17, 2, 27, 1, 37, 1, 47, 1, 57, 1, 67, 1, 77, 1, 28, 3, 38, 2, 48, 3, 58, 2, 68, 3];
	target.China2Luft = [0, 2, 10, 12, 12, 12, 20, 21, 21, 21, 34, 40, 40, 41, 41, 42, 42, 50, 50, 50, 51, 51, 51, 52, 52, 52, 60, 60, 61, 61, 62, 62, 65, 67, 68, 70, 71, 71, 72, 75, 75, 76, 77, 77];
	target.China2_Plan = [0, 5, 10, 3, 20, 5, 30, 2, 40, 2, 50, 2, 60, 2, 70, 2, 1, 4, 11, 2, 21, 1, 31, 1, 41, 1, 51, 1, 61, 1, 71, 3, 2, 5, 12, 1, 22, 5, 32, 2, 42, 2, 52, 2, 62, 2, 72, 2, 3, 3, 13, 1, 23, 1, 33, 2, 4, 2, 14, 1, 24, 1, 34, 2, 5, 3, 15, 1, 25, 1, 35, 2, 65, 3, 75, 3, 16, 4, 26, 1, 36, 4, 46, 3, 56, 5, 66, 3, 76, 3, 17, 3, 27, 2, 37, 2, 47, 2, 57, 2, 67, 2, 77, 3, 28, 4, 38, 3, 48, 4, 58, 3, 68, 3];
	target.WheelLuft = [44, 44, 44];
	target.Wheel_Plan = [0, 2, 40, 2, 21, 3, 31, 4, 41, 4, 51, 4, 61, 3, 12, 3, 32, 5, 52, 5, 72, 3, 13, 4, 43, 6, 73, 4, 4, 3, 14, 4, 24, 5, 34, 6, 44, 6, 54, 6, 64, 5, 74, 4, 15, 4, 45, 6, 75, 4, 16, 3, 36, 5, 56, 5, 76, 3, 27, 3, 37, 4, 47, 4, 57, 4, 67, 3, 8, 2, 48, 3];
	target.CastleLuft = [30, 34, 34, 38, 40, 40, 40, 48, 48, 48, 50, 54, 54, 58];
	target.Castle_Plan = [10, 5, 20, 3, 30, 3, 40, 3, 50, 3, 60, 3, 70, 5, 11, 3, 71, 3, 12, 3, 72, 3, 13, 3, 33, 4, 43, 3, 53, 4, 73, 3, 14, 4, 34, 2, 54, 2, 74, 4, 15, 3, 35, 4, 45, 3, 55, 4, 75, 3, 16, 3, 76, 3, 17, 3, 77, 3, 18, 5, 28, 3, 38, 3, 48, 3, 58, 3, 68, 3, 78, 5];
	target.AztecLuft = [23, 43, 34, 25, 45];
	target.Aztec_Plan = [30, 1, 70, 2, 21, 1, 31, 3, 41, 1, 12, 1, 22, 3, 32, 5, 42, 3, 52, 1, 3, 1, 13, 3, 23, 4, 33, 7, 43, 4, 53, 3, 63, 1, 4, 1, 14, 3, 24, 5, 34, 8, 44, 5, 54, 3, 64, 1, 5, 1, 15, 3, 25, 4, 35, 7, 45, 4, 55, 3, 65, 1, 16, 1, 26, 3, 36, 5, 46, 3, 56, 1, 27, 1, 37, 3, 47, 1, 38, 1];
	target.BigHoleLuft = [];
	target.BigHole_Plan = [2, 2, 12, 3, 22, 4, 32, 4, 42, 4, 52, 4, 62, 3, 72, 2, 3, 1, 13, 3, 23, 4, 33, 4, 43, 4, 53, 4, 63, 3, 73, 1, 4, 1, 14, 3, 24, 4, 54, 4, 64, 3, 74, 1, 5, 1, 15, 3, 25, 4, 55, 4, 65, 3, 75, 1, 6, 1, 16, 3, 26, 4, 36, 4, 46, 4, 56, 4, 66, 3, 76, 1, 7, 2, 17, 3, 27, 4, 37, 4, 47, 4, 57, 4, 67, 3, 77, 2];
	target.plaName = ['China', 'Wheel', 'China2', 'Castle', 'Italia', 'Castleum', 'Italia2', 'Glyphe', 'Dragon', 'Aztec', 'BigHole'];
	target.planNr = 0;
	target.sometext1.setValue('China');
	target.Des = [];
	target.Des = target.China_Plan;
	target.Nul = [];
	target.Nul = target.ChinaLuft;
	target.MahjoNrs_i = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44];
	target.StoneAll = [];
	target.mJall = [];
	target.MahjoNrs = [];
	target.mahJong = [];
	target.restL;
	target.weg = 0;
	target.mark = 0;
	target.BAK1 = [];
	target.OLDBAK1 = [];
	target.BAK2 = [];

	var cloneObject = function (obj){
		var newObj = (obj instanceof Array) ? [] : {};
		for (var i in obj) {
			if (obj[i] && typeof obj[i] == "object" ) 
				newObj[i] = cloneObject(obj[i]);
			else
				newObj[i] = obj[i];
		}
		return newObj;
	}

	target.init = function () {
		this.appIcon.u = kbook.autoRunRoot._icon;
		
		// Load previous layout from save file
		try {
			if (FileSystem.getFileInfo(datPath)) {
				var stream = new Stream.File(datPath);
				this.planNr = stream.readLine() * 1;
				stream.close();
				bilder = this.plaName[this.planNr];
				this.Des = this[bilder + '_Plan'];
				this.Nul = this[bilder + 'Luft'];
				this.marker2.changeLayout(-100, 57, uD, 0, 63, uD);
				this.sometext1.setValue(bilder);
				this.weg = 0;
				this.drawGridCursor(this.posX, this.posY);				
			}
		} catch (e) {}
		
		this.prepMahJong();

		if (!hasNumericButtons) {
			this.gridCursor.show(false);
			this.helpCur.show(false);
			this.helpCur2.show(false);
			this.menuMenu0.show(false);
			this.menuAll.show(false);
			this.menuCur.show(false);
			this.touchButtons1.show(true);
			this.instr4.show(false);
		} else {
			this.BUTTON_NEW.show(false);
			this.BUTTON_DIF.show(false);
			//this.BUTTON_EXT.show(false);
			this.touchButtons1.show(false);
		}
		this.numCurrent.show(false);
		this.numRecords.show(false);
		
		// hide congratulations sprite
		this.congratulations.changeLayout(0,0,uD,0,0,uD);		
		
	//	this.touchHelp.changeLayout(0, 0, uD, 0, 0, uD);
		this.helpText.setValue(getFileContent(this.mahjongroot.concat('MahJong_Help_EN.txt'),'help.txt missing')); 
		this.helpText.show(false);
		this.enable(true);		

		//this.suchDopp();
		return;		
	};

	target.prepMahJong = function () {
		this.StoneAll = [];
		this.MahjoNrs = [];
		this.mJall = [];
		this.mahJong = [];
		this.menuID = "bild";
		for (var i = 0; i < 8; i++) {
			this.mJall[i] = new Array();
			for (var k = 0; k < 9; k++) {
				this.mJall[i][k] = new Array();
			}
		}
		for (var i = 1; i < this.Des.length; i += 2) {
			for (var k = 0; k < Math.max((this.Des[i] - this.weg), 1); k++)
			this.StoneAll.push(this.Des[i - 1]);
		}
		this.MahjoNrs.unshift(0, 1, 2, 3);
		for (n = 0; n < this.StoneAll.length / 4 - 1; n++) {
			for (var i = 0; i < 4; i++) this.MahjoNrs.unshift(this.MahjoNrs_i[n + 4]);
		}
		var PLx, PLy;
		if (this.Nul.length > 0) {
			for (var i = 0; i < this.Nul.length; i++) {
				PLx = this.Nul[i] / 10;
				PLx = Math.floor(PLx);
				PLy = this.Nul[i] % 10;
				this.mJall[PLx][PLy].push(888);
			}
		}
		for (var i = 0; i < this.StoneAll.length; i++) {
			PLx = this.StoneAll[i] / 10;
			PLx = Math.floor(PLx);
			PLy = this.StoneAll[i] % 10;
			this['maJ' + 1 * i].changeLayout(this.L0 - (this.mJall[PLx][PLy].length * 8) + PLx * this.curDX, 65, uD, this.T0 - (this.mJall[PLx][PLy].length * 7) + PLy * this.curDY, 71, uD);
			this.mJall[PLx][PLy].unshift(i);
		}
		for (var i = this.StoneAll.length; i < 169; i++) {
			this['maJ' + 1 * i].changeLayout(-100, uD, uD, 0, uD, uD);
		}
		this.restL = this.StoneAll.length;
		for (var i = 0; i < this.StoneAll.length; i++) {
			var xYz = Math.floor(Math.random() * this.MahjoNrs.length);
			var xXx = this.MahjoNrs[xYz];
			this["maJ" + i].u = xXx;
			this.MahjoNrs.splice(xYz, 1);
		}
		this.suchDopp();
	}
	target.doMenuF = function () {
		this.menuKlapp = Math.abs(this.menuKlapp - 1);
		if (this.menuKlapp == 1 & this.hH == 0) {
			this.menuAll.changeLayout(437, 150, uD, -33+this.T0, 185, uD);
			this.menuCur.changeLayout(440, 22, uD, -26+this.T0, 22, uD);
		} else {
			this.menuAll.changeLayout(437, 150, uD, -253, 185, uD);
			this.menuCur.changeLayout(440, 22, uD, -226, 22, uD);
			//this.helpHelp.changeLayout(0, 0, uD, 0, 0, uD);
			this.helpText.show(false);
			this.hH = 0;
			this.menuID = 'bild';
			this.menuPos = 0;
			this.menuKlapp = 0;
			//this.container.getModel().resume();
		}
	};
	target.doMahJong = function (pX, pY) {
		var mJ = this.mahJong,
			xyLg, xG, yG, aeh, uD = undefined;
		var leeRand = (mJ.length > 0) * 1 + '' + this.mark;
		//this.bubble("tracelog","this.leeRand="+leeRand);
		xG = this.L0 + 8 + pX * this.curDX;
		yG = this.T0 + 6 + pY * this.curDY;
		switch (leeRand) {
		case '00':
			if (!hasNumericButtons) {
				this.gridCursor.show(false);
			}		
			break;
		case '01':
			aeh = this.mJall[pX][pY];
			mJ.unshift(aeh[0], this['maJ' + aeh[0]].u, pX, pY);
			this.marker2.changeLayout(xG - aeh.length * 7 - 1, 57, uD, yG - aeh.length * 6 - 1, 63, uD);
			this.BAK1 = [aeh[0], pX, pY, aeh.length];
			if (!hasNumericButtons) {
				this.gridCursor.show(true);
			}
			this.numCurrent.setValue(mJ + ', ' + this['maJ' + aeh[0]].u);
			break;
		case '10':
			mJ.length = 0;
			if (!hasNumericButtons) {
				this.gridCursor.show(false);
			}
			this.numCurrent.setValue(mJ);		
			break;
		case '11':
			aeh = this['maJ' + this.mJall[pX][pY][0]].u;
			if ((aeh == mJ[1] || aeh < 4 & mJ[1] < 4) & (pX + '' + pY != mJ[2] + '' + mJ[3])) {
				this.marker2.changeLayout(-100, 57, uD, 0, 63, uD);
				aeh = this.mJall[mJ[2]][mJ[3]][0];
				this['maJ' + aeh].changeLayout(-100, 65, uD, uD, 71, uD);
				aeh = this.mJall[pX][pY][0];
				this['maJ' + aeh].changeLayout(-100, 65, uD, uD, 71, uD);
				this.OLDBAK1 = cloneObject(this.BAK1);
				this.BAK2 = [aeh, pX, pY, this.mJall[pX][pY].length];
				this.mJall[pX][pY].shift();
				this.mJall[mJ[2]][mJ[3]].shift();
				mJ.length = 0;
				this.numCurrent.setValue(mJ);
				this.restL -= 2;
				this.mark = 0;
				this.marker.changeLayout(-100, 57, uD, 0, 63, uD);
				if (this.mJall[pX][pY][0] == 888) this.mJall[pX][pY] = [];
				if (this.mJall[pX][pY].length > 0) this.drawMarker(pX, pY);
				if (!hasNumericButtons) {
					this.gridCursor.show(false);
				}
				this.suchDopp();
			} else {
				this.marker2.changeLayout(-100, 57, uD, 0, 63, uD);
				mJ.length = 0;
				if (!hasNumericButtons) {
					this.gridCursor.show(false);
				}
				this.numCurrent.setValue(mJ);
				// start new pair using currently selected item
				this.doMahJong(pX, pY);
			}
			break;
		}
		return;
	};
	target.suchDopp = function () {
		var aeh = 0,
			uiuiui, xyLg, such = new Array;
		such.length = this.StoneAll.length / 4 + 3;
		for (var i = 0; i < 8; i++) {
			for (var k = 0; k < 9; k++) {
				var i_1 = Math.max(i - 1, 0),
					ip1 = Math.min(i + 1, 7);
				xyLg = this.mJall[i][k].length;
				if (((i == 0 || i == 7) & (xyLg > 0)) || this.mJall[i_1][k].length < xyLg || this.mJall[ip1][k].length < xyLg || this.mJall[ip1][k][this.mJall[ip1][k].length - xyLg] == 888 || this.mJall[i_1][k][this.mJall[i_1][k].length - xyLg] == 888) {
					if (this.mJall[i][k][0] == 888) this.mJall[i][k] = [];
					else {
						uiuiui = this['maJ' + this.mJall[i][k][0]].u;
						if (such[uiuiui] == 'F') such[uiuiui] = 'G';
						else {
							such[uiuiui] = 'F';
							aeh += 1;
						}
					}
				}
			}
		}
		for (var m = 0; m < such.length; m++) {
			if (such[m] == 'F') aeh -= 1;
		}
		// look for I, II, III and IV
		var wilds = 0;
		for (var m = 0; m < 4; m++) {
			if (such[m] == 'F') wilds++;
		}
		if  ((wilds==2) || (wilds==3)) aeh += 1;
		if (wilds==4) aeh += 2;
		this.currentNum.setValue('Rest ' + this.restL + '/' + aeh);
		//this.bubble("tracelog","this.restL="+this.restL);
		// check for win
		if (this.restL == 0) {
			this.congratulations.changeLayout(94,411,uD,250,142,uD);
		}
	};
	target.undoDel = function (OLDBAK1, BAK2) {
		if (OLDBAK1.length > 0 & BAK2.length > 0) {
			this.mJall[OLDBAK1[1]][OLDBAK1[2]].unshift(OLDBAK1[0]);
			this.mJall[BAK2[1]][BAK2[2]].unshift(BAK2[0]);
			this['maJ' + OLDBAK1[0]].changeLayout(this.L0 - ((this.mJall[OLDBAK1[1]][OLDBAK1[2]].length - 1) * 8) + OLDBAK1[1] * this.curDX, 65, uD, this.T0 - ((this.mJall[OLDBAK1[1]][OLDBAK1[2]].length - 1) * 7) + OLDBAK1[2] * this.curDY, 71, uD);
			this['maJ' + BAK2[0]].changeLayout(this.L0 - ((this.mJall[BAK2[1]][BAK2[2]].length - 1) * 8) + BAK2[1] * this.curDX, 65, uD, this.T0 - ((this.mJall[BAK2[1]][BAK2[2]].length - 1) * 7) + BAK2[2] * this.curDY, 71, uD);
			OLDBAK1.length = 0;
			BAK2.length = 0;
			this.restL += 2;
			this.suchDopp();
			this.drawGridCursor(this.posX, this.posY);
		}
	};
	target.doCenterF = function () {
		var bilder;
		if (this.menuKlapp == 0 & this.hH == 0) {
			this.doMahJong(this.posX, this.posY);
		} else {
			switch (this.menuID) {
			case "bild":
				this.menuKlapp = 0;
				this.menuAll.changeLayout(437, 150, uD, -233, 185, uD);
				this.menuCur.changeLayout(440, 22, uD, -226, 22, uD);
				this.menuPos = 0;
				break;
			case "neu":
				// hide congratulations sprite
				this.congratulations.changeLayout(0,0,uD,0,0,uD);			
				this.menuKlapp = 1;
				this.doMenuF();
				this.prepMahJong();
				this.marker2.changeLayout(-100, 57, uD, 0, 63, uD);
				this.drawGridCursor(this.posX, this.posY);
				break;
			case "schwier":
				// hide congratulations sprite
				this.congratulations.changeLayout(0,0,uD,0,0,uD);			
				this.weg = Math.abs(this.weg - 1);
				this.menuKlapp = 1;
				this.doMenuF();
				this.prepMahJong();
				this.marker2.changeLayout(-100, 57, uD, 0, 63, uD);
				this.drawGridCursor(this.posX, this.posY);
				break;
			case "hilf":
				this.hH = 1;
				//this.helpHelp.changeLayout(0, 600, uD, -55, 800, uD);
				this.helpText.show(true);
				this.menuAll.changeLayout(437, 150, uD, -233, 185, uD);
				this.menuCur.changeLayout(440, 22, uD, -226, 22, uD);
				this.menuPos = 0;
				this.menuKlapp = 1;
				this.menuID = "bild";
				break;
			case "quit":
				try {
					if (FileSystem.getFileInfo(datPath)) FileSystem.deleteFile(datPath);
					stream = new Stream.File(datPath, 1);
					stream.writeLine(this.planNr);		
					stream.close();
				} catch (e) {}				
				kbook.autoRunRoot.exitIf(kbook.model);
				return;
				break;
			}
		}
	};
	target.goRow = function (key) {
		if (key == 0) {
			try {
				if (FileSystem.getFileInfo(datPath)) FileSystem.deleteFile(datPath);
				stream = new Stream.File(datPath, 1);
				stream.writeLine(this.planNr);		
				stream.close();
			} catch (e) {}			
			kbook.autoRunRoot.exitIf(kbook.model);
			return;
		}
		if (this.menuKlapp == 0 & this.hH == 0) {
			(key > 0) ? this.posY = key - 1 : key = this.posY;
			this.drawGridCursor(this.posX, this.posY);
		}
		return;
	};
	target.moveCursor = function (direction) {
		var linKrex = 1;
		if (this.menuKlapp == 0 & this.hH == 0) {
			switch (direction) {
			case "down":
				this.posX = (Math.min(7, (this.posX + 2))) % 8;
				break;
			case "up":
				this.posX = (Math.max(8, (8 + this.posX - 2))) % 8;
				break;
			case "left":
				if (!hasNumericButtons) {
					// hide congratulations sprite
					this.congratulations.changeLayout(0,0,uD,0,0,uD);
					linKrex = -1;
					this.planNr = (this.plaName.length + this.planNr + linKrex) % this.plaName.length;
					bilder = this.plaName[this.planNr];
					this.Des = this[bilder + '_Plan'];
					this.Nul = this[bilder + 'Luft'];
					this.marker2.changeLayout(-100, 57, uD, 0, 63, uD);
					this.sometext1.setValue(bilder);
					this.weg = 0;
					this.prepMahJong();
					this.drawGridCursor(this.posX, this.posY);
					break;
				}
				this.posX = (8 + this.posX - 1) % 8;
				break;
			case "right":
				if (!hasNumericButtons) {
					// hide congratulations sprite
					this.congratulations.changeLayout(0,0,uD,0,0,uD);				
					this.planNr = (this.plaName.length + this.planNr + linKrex) % this.plaName.length;
					bilder = this.plaName[this.planNr];
					this.Des = this[bilder + '_Plan'];
					this.Nul = this[bilder + 'Luft'];
					this.marker2.changeLayout(-100, 57, uD, 0, 63, uD);
					this.sometext1.setValue(bilder);
					this.weg = 0;
					this.prepMahJong();
					this.drawGridCursor(this.posX, this.posY);
					break;
				}
				this.posX = (this.posX + 1) % 8;
				break;
			}
		} else {
			if (this.hH == 0) {
				switch (direction) {
				case "down":
					this.menuPos = (this.menuPos + 1) % 5;
					break;
				case "up":
					this.menuPos = (5 + this.menuPos - 1) % 5;
					break;
				case "left":
				case "right":
					if (this.menuPos == 0) {
						// hide congratulations sprite
						this.congratulations.changeLayout(0,0,uD,0,0,uD);					
						if (direction == "left") linKrex = -1;
						this.planNr = (this.plaName.length + this.planNr + linKrex) % this.plaName.length;
						bilder = this.plaName[this.planNr];
						this.Des = this[bilder + '_Plan'];
						this.Nul = this[bilder + 'Luft'];
						this.marker2.changeLayout(-100, 57, uD, 0, 63, uD);
						this.sometext1.setValue(bilder);
						this.weg = 0;
						this.prepMahJong();
						this.drawGridCursor(this.posX, this.posY);
					}
					break;
				}
				var mI = -26 +this.T0+ this.menuPos * 36;
				this.menuID = this.menuName[this.menuPos * 1];
				this.menuCur.changeLayout(440, 22, uD, mI, 22, uD);
			}
		}
		this.drawGridCursor(this.posX, this.posY);
	};
	target.drawGridCursor = function (pX, pY) {
		var xyLg, xyLeer, leerCnt, uD = uDefined;
		xG = this.L0 + 8 + pX * this.curDX;
		yG = this.T0 + 6 + pY * this.curDY;
		this.marker.changeLayout(-100, 57, uD, 0, 63, uD);
		if (this.mJall[pX][pY][0] == 888) this.mJall[pX][pY] = [];
		if (this.mJall[pX][pY].length > 0) {
			xyLg = this.mJall[pX][pY].length;
			xyLeer = xyLg;
		} else {
			leerCnt = (this.mJall[Math.max(pX - 1, 0)][pY].length > 0) * 1 + (this.mJall[Math.min(pX + 1, 7)][pY].length > 0) * 1 + (this.mJall[pX][Math.max(pY - 1, 0)].length > 0) * 1 + (this.mJall[pX][Math.min(pY + 2, 8)].length > 0) * 1;
			xyLeer = (this.mJall[Math.max(pX - 1, 0)][pY].length + this.mJall[Math.min(pX + 1, 7)][pY].length + this.mJall[pX][Math.max(pY - 1, 0)].length + this.mJall[pX][Math.min(pY + 2, 8)].length) / Math.max(1, leerCnt);
		}
		this.gridCursor.changeLayout(xG - xyLeer * 8 + 7, uD, uD, yG - xyLeer * 7 + 10, uD, uD);
		this.helpCur.changeLayout(0, 600, uD, yG + 27, 5, uD);
		this.helpCur2.changeLayout(xG + 23, 5, uD, -37+this.T0, 680, uD);
		this.numRecords.setValue(pX + "," + pY);
		this.drawMarker(pX, pY);
	};
	target.drawMarker = function (pX, pY) {
		var xyLg = this.mJall[pX][pY].length;
		var pX_1 = Math.max(pX - 1, 0),
			pXp1 = Math.min(pX + 1, 7);
		xG = this.L0 + 8 + pX * this.curDX;
		yG = this.T0 + 6 + pY * this.curDY;
		if ((this.mJall[pX_1][pY] != [] & this.mJall[pXp1][pY] != [] & this.mJall[pX][pY] != []) & (((pX == 0 || pX == 7) & (xyLg > 0)) || this.mJall[pX_1][pY].length < xyLg || this.mJall[pXp1][pY].length < xyLg || this.mJall[pXp1][pY][this.mJall[pXp1][pY].length - xyLg] == 888 || this.mJall[pX_1][pY][this.mJall[pX_1][pY].length - xyLg] == 888)) {
			this.mark = 1;
			this.marker.changeLayout(xG - xyLg * 8 + 2, 57, uD, yG - xyLg * 7 + 3, 63, uD);
		} else {
			this.mark = 0;
			this.marker.changeLayout(-100, 57, uD, 0, 63, uD);
		}
	};

	target.tNote = function (LiReHoRu) {};
	target.loadGame = function () {};

	target.doGridClick = function (sender) {
		var id, n, found;
		id = getSoValue(sender, "id");
		n = id.substring(3, 6);
		//this.bubble("tracelog","n="+n);
		found = false;
		loop1: for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 9; j++) {
				if (this.mJall[i][j][0] == n) {
					this.posX = i;
					this.posY = j;
					found = true;
					break loop1;
				}
			}
		}

		if (found) {
			this.gridCursor.show(true);
			this.drawGridCursor(this.posX, this.posY);
			this.doMahJong(this.posX, this.posY);
		}
		return;
	};

	target.doButtonClick = function (sender) {
		var id, n, found;
		id = getSoValue(sender, "id");
		n = id.substring(7, 10);
		if (n == "NEW") {
			// hide congratulations sprite
			this.congratulations.changeLayout(0,0,uD,0,0,uD);
			this.menuKlapp = 1;
			this.doMenuF();
			this.prepMahJong();
			this.marker2.changeLayout(-100, 57, uD, 0, 63, uD);
			this.drawGridCursor(this.posX, this.posY);
			return;
		}
		if (n == "DIF") {
			// hide congratulations sprite
			this.congratulations.changeLayout(0,0,uD,0,0,uD);		
			this.weg = Math.abs(this.weg - 1);
			this.menuKlapp = 1;
			this.doMenuF();
			this.prepMahJong();
			this.marker2.changeLayout(-100, 57, uD, 0, 63, uD);
			this.drawGridCursor(this.posX, this.posY);
			return;
		}
	/*	if (n == "EXT") {
			try {
				if (FileSystem.getFileInfo(datPath)) FileSystem.deleteFile(datPath);
				stream = new Stream.File(datPath, 1);
				stream.writeLine(this.planNr);		
				stream.close();
			} catch (e) {}		
			kbook.autoRunRoot.exitIf(kbook.model);
			return;
		} */
	};

    target.showHelp = function () {
		displayHelp = !displayHelp;
		this.helpText.show(displayHelp);
    }

	target.quitGame = function () {
		try {
			if (FileSystem.getFileInfo(datPath)) FileSystem.deleteFile(datPath);
			stream = new Stream.File(datPath, 1);
			stream.writeLine(this.planNr);		
			stream.close();
		} catch (e) {}	
		kbook.autoRunRoot.exitIf(kbook.model);
		return;
	};
	
	target.hideCongratulations = function () {
		// hide congratulations sprite
		this.congratulations.changeLayout(0,0,uD,0,0,uD);	
	}
};
tmp();
tmp = undefined;