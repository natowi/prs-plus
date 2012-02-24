// GAME: XO-Cubed
// Original code (c) Ben Chenoweth
// Initial version: April 2011
// HISTORY:
// 2011-04-01 Ben Chenoweth - 2 player only
// 2011-04-01 Ben Chenoweth - 1 player mode begun (AI reasonable)
// 2011-04-01 Ben Chenoweth - Less predictable AI by shuffling lines array
// 2011-04-01 Ben Chenoweth - Fixed some coordinate errors in the lines array
// 2011-04-03 Ben Chenoweth - AI improvement: Double whammies are now found and blocked
// 2011-04-03 Ben Chenoweth - Added difficulty level (easy/hard)
// 2011-04-04 Ben Chenoweth - Commented out the debug bubble outputs
// 2011-04-06 Ben Chenoweth - AI improvement: Make and block triple whammies; added difficulty level 'very hard'; losing player goes first next game
// 2011-04-07 Ben Chenoweth - AI tweaks; combined 'very hard' into 'hard'; commented out make triple whammies; added two missing planes

var tmp = function () {
	var Exiting;
	var gameover;
	var players=1;
	var player1turn;
	var previousplayers=1;
	var lastwinner=0;
	var difficulty="easy";
	var firstX = 110;
	var curDX = 98;
	var firstY = 16;
	var curDY = 36;
	var curDZ = 154;
	var pos1X;
	var pos1Y;
	var pos1Z;
	var pos2X;
	var pos2Y;
	var pos2Z;
	var maxX = 4;
	var maxY = 4;
	var maxZ = 4;
	var board = [];
	var oMovesX = [];
	var oMovesY = [];
	var oMovesZ = [];
	var oMoves;
	var xMovesX = [];
	var xMovesY = [];
	var xMovesZ = [];
	var lines = [];
	var planes = [];
	var centre;
	var numlines;
	var numplanes;
	var whammyinplay;
	var isTouch;
	var uD;

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
	

	var hasNumericButtons = kbook.autoRunRoot.hasNumericButtons;
	var getSoValue = kbook.autoRunRoot.getSoValue; 
	
	//this.bubble("tracelog","id="+id);
	
	target.init = function () {
		this.appIcon.u = kbook.autoRunRoot._icon;

		if (!hasNumericButtons) {
			isTouch = true;
			this.grid1Cursor.show(false);
			this.grid2Cursor.show(false);
			this.instr1.show(false);
			this.instr2.show(false);
			this.instr3.show(false);
			this.gridnums1.show(false);
			this.gridnums2.show(false);
			this.gridnums3.show(false);
			this.gridnums4.show(false);
			this.nonTouch4.show(false);
		} else {
			isTouch = false;
			this.grid1Cursor.show(true);
			this.grid2Cursor.show(false);
			//this.instr1.show(true);
			//this.instr2.show(true);
			//this.instr3.show(true);
			this.btn_hint_home.show(false);
			//this.BUTTON_EXT.show(false);
			this.BUTTON_ONE.show(false);
			this.BUTTON_TWO.show(false);
			//this.touchButtons1.show(false);
		}
		// board array needs to be initialised to be one column, row and height larger than the button array (for board-searching purposes)
		for (var a = 0; a <= maxX; a++) {
			board[a] = [];
			for (var b = 0; b <= maxY; b++) {
				board[a][b] = [];
			}
		}

		// set up lines array
		lines[0]=[this.coord(0,0,0),this.coord(1,0,0),this.coord(2,0,0),this.coord(3,0,0)];
		lines[1]=[this.coord(0,1,0),this.coord(1,1,0),this.coord(2,1,0),this.coord(3,1,0)];
		lines[2]=[this.coord(0,2,0),this.coord(1,2,0),this.coord(2,2,0),this.coord(3,2,0)];
		lines[3]=[this.coord(0,3,0),this.coord(1,3,0),this.coord(2,3,0),this.coord(3,3,0)];
		lines[4]=[this.coord(0,0,0),this.coord(0,1,0),this.coord(0,2,0),this.coord(0,3,0)];
		lines[5]=[this.coord(1,0,0),this.coord(1,1,0),this.coord(1,2,0),this.coord(1,3,0)];
		lines[6]=[this.coord(2,0,0),this.coord(2,1,0),this.coord(2,2,0),this.coord(2,3,0)];
		lines[7]=[this.coord(3,0,0),this.coord(3,1,0),this.coord(3,2,0),this.coord(3,3,0)];
		lines[8]=[this.coord(0,0,0),this.coord(1,1,0),this.coord(2,2,0),this.coord(3,3,0)];
		lines[9]=[this.coord(3,0,0),this.coord(2,1,0),this.coord(1,2,0),this.coord(0,3,0)];
		lines[10]=[this.coord(0,0,1),this.coord(1,0,1),this.coord(2,0,1),this.coord(3,0,1)];
		lines[11]=[this.coord(0,1,1),this.coord(1,1,1),this.coord(2,1,1),this.coord(3,1,1)];
		lines[12]=[this.coord(0,2,1),this.coord(1,2,1),this.coord(2,2,1),this.coord(3,2,1)];
		lines[13]=[this.coord(0,3,1),this.coord(1,3,1),this.coord(2,3,1),this.coord(3,3,1)];
		lines[14]=[this.coord(0,0,1),this.coord(0,1,1),this.coord(0,2,1),this.coord(0,3,1)];
		lines[15]=[this.coord(1,0,1),this.coord(1,1,1),this.coord(1,2,1),this.coord(1,3,1)];
		lines[16]=[this.coord(2,0,1),this.coord(2,1,1),this.coord(2,2,1),this.coord(2,3,1)];
		lines[17]=[this.coord(3,0,1),this.coord(3,1,1),this.coord(3,2,1),this.coord(3,3,1)];
		lines[18]=[this.coord(0,0,1),this.coord(1,1,1),this.coord(2,2,1),this.coord(3,3,1)];
		lines[19]=[this.coord(3,0,1),this.coord(2,1,1),this.coord(1,2,1),this.coord(0,3,1)];	
		lines[20]=[this.coord(0,0,2),this.coord(1,0,2),this.coord(2,0,2),this.coord(3,0,2)];
		lines[21]=[this.coord(0,1,2),this.coord(1,1,2),this.coord(2,1,2),this.coord(3,1,2)];
		lines[22]=[this.coord(0,2,2),this.coord(1,2,2),this.coord(2,2,2),this.coord(3,2,2)];
		lines[23]=[this.coord(0,3,2),this.coord(1,3,2),this.coord(2,3,2),this.coord(3,3,2)];
		lines[24]=[this.coord(0,0,2),this.coord(0,1,2),this.coord(0,2,2),this.coord(0,3,2)];
		lines[25]=[this.coord(1,0,2),this.coord(1,1,2),this.coord(1,2,2),this.coord(1,3,2)];
		lines[26]=[this.coord(2,0,2),this.coord(2,1,2),this.coord(2,2,2),this.coord(2,3,2)];
		lines[27]=[this.coord(3,0,2),this.coord(3,1,2),this.coord(3,2,2),this.coord(3,3,2)];
		lines[28]=[this.coord(0,0,2),this.coord(1,1,2),this.coord(2,2,2),this.coord(3,3,2)];
		lines[29]=[this.coord(3,0,2),this.coord(2,1,2),this.coord(1,2,2),this.coord(0,3,2)];
		lines[30]=[this.coord(0,0,3),this.coord(1,0,3),this.coord(2,0,3),this.coord(3,0,3)];
		lines[31]=[this.coord(0,1,3),this.coord(1,1,3),this.coord(2,1,3),this.coord(3,1,3)];
		lines[32]=[this.coord(0,2,3),this.coord(1,2,3),this.coord(2,2,3),this.coord(3,2,3)];
		lines[33]=[this.coord(0,3,3),this.coord(1,3,3),this.coord(2,3,3),this.coord(3,3,3)];
		lines[34]=[this.coord(0,0,3),this.coord(0,1,3),this.coord(0,2,3),this.coord(0,3,3)];
		lines[35]=[this.coord(1,0,3),this.coord(1,1,3),this.coord(1,2,3),this.coord(1,3,3)];
		lines[36]=[this.coord(2,0,3),this.coord(2,1,3),this.coord(2,2,3),this.coord(2,3,3)];
		lines[37]=[this.coord(3,0,3),this.coord(3,1,3),this.coord(3,2,3),this.coord(3,3,3)];
		lines[38]=[this.coord(0,0,3),this.coord(1,1,3),this.coord(2,2,3),this.coord(3,3,3)];
		lines[39]=[this.coord(3,0,3),this.coord(2,1,3),this.coord(1,2,3),this.coord(0,3,3)];
		lines[40]=[this.coord(0,0,0),this.coord(0,0,1),this.coord(0,0,2),this.coord(0,0,3)];
		lines[41]=[this.coord(1,0,0),this.coord(1,0,1),this.coord(1,0,2),this.coord(1,0,3)];
		lines[42]=[this.coord(2,0,0),this.coord(2,0,1),this.coord(2,0,2),this.coord(2,0,3)];
		lines[43]=[this.coord(3,0,0),this.coord(3,0,1),this.coord(3,0,2),this.coord(3,0,3)];
		lines[44]=[this.coord(0,0,0),this.coord(1,0,1),this.coord(2,0,2),this.coord(3,0,3)];
		lines[45]=[this.coord(3,0,0),this.coord(2,0,1),this.coord(1,0,2),this.coord(0,0,3)];
		lines[46]=[this.coord(0,1,0),this.coord(0,1,1),this.coord(0,1,2),this.coord(0,1,3)];
		lines[47]=[this.coord(1,1,0),this.coord(1,1,1),this.coord(1,1,2),this.coord(1,1,3)];
		lines[48]=[this.coord(2,1,0),this.coord(2,1,1),this.coord(2,1,2),this.coord(2,1,3)];
		lines[49]=[this.coord(3,1,0),this.coord(3,1,1),this.coord(3,1,2),this.coord(3,1,3)];
		lines[50]=[this.coord(0,1,0),this.coord(1,1,1),this.coord(2,1,2),this.coord(3,1,3)];
		lines[51]=[this.coord(3,1,0),this.coord(2,1,1),this.coord(1,1,2),this.coord(0,1,3)];
		lines[52]=[this.coord(0,2,0),this.coord(0,2,1),this.coord(0,2,2),this.coord(0,2,3)];
		lines[53]=[this.coord(1,2,0),this.coord(1,2,1),this.coord(1,2,2),this.coord(1,2,3)];
		lines[54]=[this.coord(2,2,0),this.coord(2,2,1),this.coord(2,2,2),this.coord(2,2,3)];
		lines[55]=[this.coord(3,2,0),this.coord(3,2,1),this.coord(3,2,2),this.coord(3,2,3)];
		lines[56]=[this.coord(0,2,0),this.coord(1,2,1),this.coord(2,2,2),this.coord(3,2,3)];
		lines[57]=[this.coord(3,2,0),this.coord(2,2,1),this.coord(1,2,2),this.coord(0,2,3)];
		lines[58]=[this.coord(0,3,0),this.coord(0,3,1),this.coord(0,3,2),this.coord(0,3,3)];
		lines[59]=[this.coord(1,3,0),this.coord(1,3,1),this.coord(1,3,2),this.coord(1,3,3)];
		lines[60]=[this.coord(2,3,0),this.coord(2,3,1),this.coord(2,3,2),this.coord(2,3,3)];
		lines[61]=[this.coord(3,3,0),this.coord(3,3,1),this.coord(3,3,2),this.coord(3,3,3)];
		lines[62]=[this.coord(0,3,0),this.coord(1,3,1),this.coord(2,3,2),this.coord(3,3,3)];
		lines[63]=[this.coord(3,3,0),this.coord(2,3,1),this.coord(1,3,2),this.coord(0,3,3)];
		lines[64]=[this.coord(0,0,0),this.coord(0,1,1),this.coord(0,2,2),this.coord(0,3,3)];
		lines[65]=[this.coord(0,3,0),this.coord(0,2,1),this.coord(0,1,2),this.coord(0,0,3)];
		lines[66]=[this.coord(1,0,0),this.coord(1,1,1),this.coord(1,2,2),this.coord(1,3,3)];
		lines[67]=[this.coord(1,3,0),this.coord(1,2,1),this.coord(1,1,2),this.coord(1,0,3)];
		lines[68]=[this.coord(2,0,0),this.coord(2,1,1),this.coord(2,2,2),this.coord(2,3,3)];
		lines[69]=[this.coord(2,3,0),this.coord(2,2,1),this.coord(2,1,2),this.coord(2,0,3)];
		lines[70]=[this.coord(3,0,0),this.coord(3,1,1),this.coord(3,2,2),this.coord(3,3,3)];
		lines[71]=[this.coord(3,3,0),this.coord(3,2,1),this.coord(3,1,2),this.coord(3,0,3)];
		lines[72]=[this.coord(0,0,0),this.coord(1,1,1),this.coord(2,2,2),this.coord(3,3,3)];
		lines[73]=[this.coord(3,0,0),this.coord(2,1,1),this.coord(1,2,2),this.coord(0,3,3)];
		lines[74]=[this.coord(3,3,0),this.coord(2,2,1),this.coord(1,1,2),this.coord(0,0,3)];
		lines[75]=[this.coord(0,3,0),this.coord(1,2,1),this.coord(2,1,2),this.coord(3,0,3)];
		numlines=76;
		centre=[this.coord(1,1,1),this.coord(2,1,1),this.coord(1,2,1),this.coord(2,2,1),this.coord(1,1,2),this.coord(2,1,2),this.coord(1,2,2),this.coord(2,2,2)];
		planes[0]=[this.coord(0,0,0),this.coord(1,0,0),this.coord(2,0,0),this.coord(3,0,0),this.coord(0,1,0),this.coord(1,1,0),this.coord(2,1,0),this.coord(3,1,0),this.coord(0,2,0),this.coord(1,2,0),this.coord(2,2,0),this.coord(3,2,0),this.coord(0,3,0),this.coord(1,3,0),this.coord(2,3,0),this.coord(3,3,0)];
		planes[1]=[this.coord(0,0,1),this.coord(1,0,1),this.coord(2,0,1),this.coord(3,0,1),this.coord(0,1,1),this.coord(1,1,1),this.coord(2,1,1),this.coord(3,1,1),this.coord(0,2,1),this.coord(1,2,1),this.coord(2,2,1),this.coord(3,2,1),this.coord(0,3,1),this.coord(1,3,1),this.coord(2,3,1),this.coord(3,3,1)];
		planes[2]=[this.coord(0,0,2),this.coord(1,0,2),this.coord(2,0,2),this.coord(3,0,2),this.coord(0,1,2),this.coord(1,1,2),this.coord(2,1,2),this.coord(3,1,2),this.coord(0,2,2),this.coord(1,2,2),this.coord(2,2,2),this.coord(3,2,2),this.coord(0,3,2),this.coord(1,3,2),this.coord(2,3,2),this.coord(3,3,2)];
		planes[3]=[this.coord(0,0,3),this.coord(1,0,3),this.coord(2,0,3),this.coord(3,0,3),this.coord(0,1,3),this.coord(1,1,3),this.coord(2,1,3),this.coord(3,1,3),this.coord(0,2,3),this.coord(1,2,3),this.coord(2,2,3),this.coord(3,2,3),this.coord(0,3,3),this.coord(1,3,3),this.coord(2,3,3),this.coord(3,3,3)];
		planes[4]=[this.coord(0,0,0),this.coord(0,0,1),this.coord(0,0,2),this.coord(0,0,3),this.coord(1,0,0),this.coord(1,0,1),this.coord(1,0,2),this.coord(1,0,3),this.coord(2,0,0),this.coord(2,0,1),this.coord(2,0,2),this.coord(2,0,3),this.coord(3,0,0),this.coord(3,0,1),this.coord(3,0,2),this.coord(3,0,3)];
		planes[5]=[this.coord(0,1,0),this.coord(0,1,1),this.coord(0,1,2),this.coord(0,1,3),this.coord(1,1,0),this.coord(1,1,1),this.coord(1,1,2),this.coord(1,1,3),this.coord(2,1,0),this.coord(2,1,1),this.coord(2,1,2),this.coord(2,1,3),this.coord(3,1,0),this.coord(3,1,1),this.coord(3,1,2),this.coord(3,1,3)];
		planes[6]=[this.coord(0,2,0),this.coord(0,2,1),this.coord(0,2,2),this.coord(0,2,3),this.coord(1,2,0),this.coord(1,2,1),this.coord(1,2,2),this.coord(1,2,3),this.coord(2,2,0),this.coord(2,2,1),this.coord(2,2,2),this.coord(2,2,3),this.coord(3,2,0),this.coord(3,2,1),this.coord(3,2,2),this.coord(3,2,3)];
		planes[7]=[this.coord(0,3,0),this.coord(0,3,1),this.coord(0,3,2),this.coord(0,3,3),this.coord(1,3,0),this.coord(1,3,1),this.coord(1,3,2),this.coord(1,3,3),this.coord(2,3,0),this.coord(2,3,1),this.coord(2,3,2),this.coord(2,3,3),this.coord(3,3,0),this.coord(3,3,1),this.coord(3,3,2),this.coord(3,3,3)];
		planes[8]=[this.coord(0,0,0),this.coord(0,1,1),this.coord(0,2,2),this.coord(0,3,3),this.coord(1,0,0),this.coord(1,1,1),this.coord(1,2,2),this.coord(1,3,3),this.coord(2,0,0),this.coord(2,1,1),this.coord(2,2,2),this.coord(2,3,3),this.coord(3,0,0),this.coord(3,1,1),this.coord(3,2,2),this.coord(3,3,3)];
		planes[9]=[this.coord(0,3,0),this.coord(0,2,1),this.coord(0,1,2),this.coord(0,0,3),this.coord(1,3,0),this.coord(1,2,1),this.coord(1,1,2),this.coord(1,0,3),this.coord(2,3,0),this.coord(2,2,1),this.coord(2,1,2),this.coord(2,0,3),this.coord(3,3,0),this.coord(3,2,1),this.coord(3,1,2),this.coord(3,0,3)];
		planes[10]=[this.coord(0,0,0),this.coord(0,1,0),this.coord(0,2,0),this.coord(0,3,0),this.coord(0,0,1),this.coord(0,1,1),this.coord(0,2,1),this.coord(0,3,1),this.coord(0,0,2),this.coord(0,1,2),this.coord(0,2,2),this.coord(0,3,2),this.coord(0,0,3),this.coord(0,1,3),this.coord(0,2,3),this.coord(0,3,3)];
		planes[11]=[this.coord(1,0,0),this.coord(1,1,0),this.coord(1,2,0),this.coord(1,3,0),this.coord(1,0,1),this.coord(1,1,1),this.coord(1,2,1),this.coord(1,3,1),this.coord(1,0,2),this.coord(1,1,2),this.coord(1,2,2),this.coord(1,3,2),this.coord(1,0,3),this.coord(1,1,3),this.coord(1,2,3),this.coord(1,3,3)];
		planes[12]=[this.coord(2,0,0),this.coord(2,1,0),this.coord(2,2,0),this.coord(2,3,0),this.coord(2,0,1),this.coord(2,1,1),this.coord(2,2,1),this.coord(2,3,1),this.coord(2,0,2),this.coord(2,1,2),this.coord(2,2,2),this.coord(2,3,2),this.coord(2,0,3),this.coord(2,1,3),this.coord(2,2,3),this.coord(2,3,3)];
		planes[13]=[this.coord(3,0,0),this.coord(3,1,0),this.coord(3,2,0),this.coord(3,3,0),this.coord(3,0,1),this.coord(3,1,1),this.coord(3,2,1),this.coord(3,3,1),this.coord(3,0,2),this.coord(3,1,2),this.coord(3,2,2),this.coord(3,3,2),this.coord(3,0,3),this.coord(3,1,3),this.coord(3,2,3),this.coord(3,3,3)];
		planes[14]=[this.coord(0,0,0),this.coord(0,1,0),this.coord(0,2,0),this.coord(0,3,0),this.coord(1,0,1),this.coord(1,1,1),this.coord(1,2,1),this.coord(1,3,1),this.coord(2,0,2),this.coord(2,1,2),this.coord(2,2,2),this.coord(2,3,2),this.coord(3,0,3),this.coord(3,1,3),this.coord(3,2,3),this.coord(3,3,3)]
		planes[15]=[this.coord(3,0,0),this.coord(3,1,0),this.coord(3,2,0),this.coord(3,3,0),this.coord(2,0,1),this.coord(2,1,1),this.coord(2,2,1),this.coord(2,3,1),this.coord(1,0,2),this.coord(1,1,2),this.coord(1,2,2),this.coord(1,3,2),this.coord(0,0,3),this.coord(0,1,3),this.coord(0,2,3),this.coord(0,3,3)]
		planes[16]=[this.coord(0,3,0),this.coord(1,2,0),this.coord(2,1,0),this.coord(3,0,0),this.coord(0,3,1),this.coord(1,2,1),this.coord(2,1,1),this.coord(3,0,1),this.coord(0,3,2),this.coord(1,2,2),this.coord(2,1,2),this.coord(3,0,2),this.coord(0,3,3),this.coord(1,2,3),this.coord(2,1,3),this.coord(3,0,3)]
		planes[17]=[this.coord(0,0,0),this.coord(1,1,0),this.coord(2,2,0),this.coord(3,3,0),this.coord(0,0,1),this.coord(1,1,1),this.coord(2,2,1),this.coord(3,3,1),this.coord(0,0,2),this.coord(1,1,2),this.coord(2,2,2),this.coord(3,3,2),this.coord(0,0,3),this.coord(1,1,3),this.coord(2,2,3),this.coord(3,3,3)]
		numplanes=18;
		this.startPlay();
		return;
	}

	target.Coord = function (x,y,z) {	
		this.x = x;
		this.y = y;
		this.z = z;
	}
	
	target.coord = function (x,y,z) {
		c = new this.Coord(x,y,z);
		return c;
	}
	
	target.resetButtons = function () {
		var x,y,z;
		for (x=0; x<maxX; x++) {
			for (y=0; y<maxY; y++) {
				for (z=0; z<maxZ; z++) {
					num = z * 16 + y * 4 + x;
					if (num<10) {
						id = "3Buttons00" + num;
					} else {
						id = "3Buttons0" + num;
					}
					board[x][y][z] = 0;
					if (num<64) this[id].u = 0;
				}
			}
		}
		return;
	}
	
	target.drawgrid1Cursor = function (x, y, z) {
		this.grid1Cursor.changeLayout(firstX + x * curDX - y * 21, uD, uD, firstY + y * curDY + z * curDZ, uD, uD);
		return;
	}
	
	target.drawgrid2Cursor = function (x, y, z) {
		this.grid2Cursor.changeLayout(firstX + x * curDX - y * 21, uD, uD, firstY + y * curDY + z * curDZ, uD, uD);
		return;
	}
	
	target.startPlay = function () {
		var templine;
		pos1X = 0;
		pos1Y = 0;
		pos1Z = 0;
		pos2X = 3;
		pos2Y = 0;
		pos2Z = 0;		
		gameover = false;
		oMoves = 0;
		xMoves = 0;
		
		// Reset the board - note that the board array needs to be initialised to be one column, row and height larger than the button array (for board-searching purposes)
		for (x=0; x<=maxX; x++) {
			for (y=0; y<=maxY; y++) {
				for (z=0; z<=maxZ; z++) {
					num = z * 16 + y * 4 + x;
					if (num<10) {
						id = "3Buttons00" + num;
					} else {
						id = "3Buttons0" + num;
					}
					board[x][y][z] = 0;
					if (num<64) this[id].u = 0;
				}
			}
		}
		
		// Shuffle lines using Knuth Sort (this makes the AI less predictable)
		for (j=numlines-1; j>=0; j--)
		{
			k=Math.floor(Math.random()*j);
			templine=cloneObject(lines[j]);
			lines[j]=lines[k];
			lines[k]=templine;
		}
		
		// Shuffle planes using Knuth Sort (this makes the AI less predictable)
		for (j=numplanes-1; j>=0; j--)
		{
			k=Math.floor(Math.random()*j);
			tempplane=cloneObject(planes[j]);
			planes[j]=planes[k];
			planes[k]=tempplane;
		}

		
		this.drawgrid1Cursor(pos1X, pos1Y,pos1Z);
		this.drawgrid2Cursor(pos2X, pos2Y,pos2Z);
		if (players == 2) {
			this.showTurn.setValue("Player 1's turn...");
			player1turn = true;
			if (!isTouch) {
				this.grid1Cursor.show(true);
				this.drawgrid1Cursor(pos1X, pos1Y,pos1Z);
				this.grid2Cursor.show(false);
			}
		} else {
			this.showTurn.setValue("Your turn...");
			player1turn = true;
			if (!isTouch) {
				this.grid1Cursor.show(true);
				this.drawgrid1Cursor(pos1X, pos1Y,pos1Z);
				this.grid2Cursor.show(false);
			}
		}
		return;
	}
	
	target.placeO = function () {
		var coordinate;
		var num;
		var foundmove=false;
		
		// Step one - look for three O's in the same line and complete for the win
		for (x=0;x<numlines;x++) {
			linesum=0;
			count=0;
			for (y=0;y<4;y++) {
				coordinate=lines[x][y];
				linesum=linesum+board[coordinate.x][coordinate.y][coordinate.z];
				if (board[coordinate.x][coordinate.y][coordinate.z]!=0) count++;
			}
			if ((linesum==-3) && (count==3)) {
				foundmove=true;
				// find empty place
				for (y=0;y<4;y++) {
					coordinate=lines[x][y];
					if (board[coordinate.x][coordinate.y][coordinate.z]==0) break;
				}
				//this.bubble("tracelog","Step one succeeded - found a winning move");
			}
			if (foundmove) break;
		}
		//if (!foundmove) this.bubble("tracelog","Step one failed - no move to win");
		
		// Step two - look for three X's in the same line and block
		if (!foundmove) {
			for (x=0;x<numlines;x++) {
				linesum=0;
				count=0;
				for (y=0;y<4;y++) {
					coordinate=lines[x][y];
					linesum=linesum+board[coordinate.x][coordinate.y][coordinate.z];
					if (board[coordinate.x][coordinate.y][coordinate.z]!=0) count++;
				}
				if ((linesum==3) && (count==3)) {
					foundmove=true;
					// find empty place
					for (y=0;y<4;y++) {
						coordinate=lines[x][y];
						if (board[coordinate.x][coordinate.y][coordinate.z]==0) break;
					}
					//this.bubble("tracelog","Step two succeeded - blocked a win.");
				}
				if (foundmove) break;
			}
		}
		//if (!foundmove) this.bubble("tracelog","Step two failed - no move to block a win");

		// Step three - look for intersection point of two lines each with two O's and no X's (to complete a double-whammy)
		if ((!foundmove) && (difficulty=="hard")) {
			for (x=0;x<numlines;x++) {
				linesum=0;
				count=0;
				for (y=0;y<4;y++) {
					coordinate=lines[x][y];
					linesum=linesum+board[coordinate.x][coordinate.y][coordinate.z];
					if (board[coordinate.x][coordinate.y][coordinate.z]!=0) count++;
				}
				if ((linesum==-2) && (count==2)) {
					// found a line with two O's and no X's
					// find first empty place
					for (y=0;y<4;y++) {
						coordinate=lines[x][y];
						if (board[coordinate.x][coordinate.y][coordinate.z]==0) break;
					}
					// search through all other lines looking for one with two O's and no X's and the same blank spot
					for (a=0;a<numlines;a++) {
						if (a==x) continue;
						templinesum=0;
						tempcount=0;
						lineintersect=false;
						for (b=0;b<4;b++) {
							tempcoordinate=lines[a][b];
							templinesum=templinesum+board[tempcoordinate.x][tempcoordinate.y][tempcoordinate.z];
							if (board[tempcoordinate.x][tempcoordinate.y][tempcoordinate.z]!=0) tempcount++;
							if ((tempcoordinate.x==coordinate.x) && (tempcoordinate.y==coordinate.y) && (tempcoordinate.z==coordinate.z)) lineintersect=true;
						}
						if ((templinesum==-2) && (tempcount==2) && (lineintersect)) {
							//this.bubble("tracelog","Step three succeeded - can complete a double whammy");
							foundmove=true;
						}
						if (foundmove) break;
					}
					if (!foundmove) {
						//try other empty space
						skipfirstone=false;
						for (y=0;y<4;y++) {
							coordinate=lines[x][y];
							if ((board[coordinate.x][coordinate.y][coordinate.z]==0) && (!skipfirstone)) {
								skipfirstone=true; // skip first space
								continue;
							}
							if (board[coordinate.x][coordinate.y][coordinate.z]==0) break;
						}
						// search through all other lines looking for one with two O's and no X's and the same blank spot
						for (a=0;a<numlines;a++) {
							if (a==x) continue;
							templinesum=0;
							tempcount=0;
							lineintersect=false;
							for (b=0;b<4;b++) {
								tempcoordinate=lines[a][b];
								templinesum=templinesum+board[tempcoordinate.x][tempcoordinate.y][tempcoordinate.z];
								if (board[tempcoordinate.x][tempcoordinate.y][tempcoordinate.z]!=0) tempcount++;
								if ((tempcoordinate.x==coordinate.x) && (tempcoordinate.y==coordinate.y) && (tempcoordinate.z==coordinate.z)) lineintersect=true;
							}
							if ((templinesum==-2) && (tempcount==2) && (lineintersect)) {
								foundmove=true;
								//this.bubble("tracelog","Step three succeeded - can complete a double whammy");
							}
							if (foundmove) break;
						}
					}
				}
				if (foundmove) break;
			}
		}
		//if ((!foundmove) && (difficulty=="hard")) this.bubble("tracelog","Step three failed - cannot complete a double whammy");

		// Step four - look for intersection point of two lines each with two X's and no O's (to block a double-whammy)
		if ((!foundmove) && (difficulty=="hard")) {
			for (x=0;x<numlines;x++) {
				linesum=0;
				count=0;
				for (y=0;y<4;y++) {
					coordinate=lines[x][y];
					linesum=linesum+board[coordinate.x][coordinate.y][coordinate.z];
					if (board[coordinate.x][coordinate.y][coordinate.z]!=0) count++;
				}
				if ((linesum==2) && (count==2)) {
					// found a line with two X's and no O's
					// find first empty place
					for (y=0;y<4;y++) {
						coordinate=lines[x][y];
						if (board[coordinate.x][coordinate.y][coordinate.z]==0) break;
					}
					// search through all other lines looking for one with two X's and no O's and the same blank spot
					for (a=0;a<numlines;a++) {
						if (a==x) continue;
						templinesum=0;
						tempcount=0;
						lineintersect=false;
						for (b=0;b<4;b++) {
							tempcoordinate=lines[a][b];
							templinesum=templinesum+board[tempcoordinate.x][tempcoordinate.y][tempcoordinate.z];
							if (board[tempcoordinate.x][tempcoordinate.y][tempcoordinate.z]!=0) tempcount++;
							if ((tempcoordinate.x==coordinate.x) && (tempcoordinate.y==coordinate.y) && (tempcoordinate.z==coordinate.z)) lineintersect=true;
						}
						if ((templinesum==2) && (tempcount==2) && (lineintersect)) {
							//this.bubble("tracelog","Step four succeeded - can block a double whammy");
							foundmove=true;
						}
						if (foundmove) break;
					}
					if (!foundmove) {
						//try other empty space
						skipfirstone=false;
						for (y=0;y<4;y++) {
							coordinate=lines[x][y];
							if ((board[coordinate.x][coordinate.y][coordinate.z]==0) && (!skipfirstone)) {
								skipfirstone=true; // skip first space
								continue;
							}
							if (board[coordinate.x][coordinate.y][coordinate.z]==0) break;
						}
						// search through all other lines looking for one with two X's and no O's and the same blank spot
						for (a=0;a<numlines;a++) {
							if (a==x) continue;
							templinesum=0;
							tempcount=0;
							lineintersect=false;
							for (b=0;b<4;b++) {
								tempcoordinate=lines[a][b];
								templinesum=templinesum+board[tempcoordinate.x][tempcoordinate.y][tempcoordinate.z];
								if (board[tempcoordinate.x][tempcoordinate.y][tempcoordinate.z]!=0) tempcount++;
								if ((tempcoordinate.x==coordinate.x) && (tempcoordinate.y==coordinate.y) && (tempcoordinate.z==coordinate.z)) lineintersect=true;
							}
							if ((templinesum==2) && (tempcount==2) && (lineintersect)) {
								foundmove=true;
								//this.bubble("tracelog","Step four succeeded - can block a double whammy");
							}
							if (foundmove) break;
						}
					}
				}
				if (foundmove) break;
			}
		}
		//if ((!foundmove) && (difficulty=="hard")) this.bubble("tracelog","Step four failed - cannot block a double whammy");		

/*		// Step five - look to make triple whammy
		if ((!foundmove) && (difficulty=="hard")) {
			for (x=0;x<numplanes;x++) {
				planesum=0;
				count=0;
				pos5=false;
				pos6=false;
				pos9=false;
				pos10=false;
				for (y=0;y<16;y++) {
					coordinate=planes[x][y];
					planesum=planesum+board[coordinate.x][coordinate.y][coordinate.z];
					if (board[coordinate.x][coordinate.y][coordinate.z]!=0) count++;
					if ((y==5) && (board[coordinate.x][coordinate.y][coordinate.z]==1)) pos5=true;
					if ((y==6) && (board[coordinate.x][coordinate.y][coordinate.z]==1)) pos6=true;
					if ((y==9) && (board[coordinate.x][coordinate.y][coordinate.z]==1)) pos9=true;
					if ((y==10) && (board[coordinate.x][coordinate.y][coordinate.z]==1)) pos10=true;
				}
				if ((planesum==-4) && (count==4) && (pos5) && (pos6) && (pos9) && (pos10)) {
					// found a plane with four O's in the middle positions and no X's
					this.bubble("tracelog","Step five succeeded - can make a triple whammy");
					coordinate=planes[x][0];
					foundmove=true;
				}
				if (foundmove) break;
			}
		}
		//if ((!foundmove) && (difficulty=="hard")) this.bubble("tracelog","Step five failed - cannot make a triple whammy");
*/		
		// Step six - look to block potential triple whammy
		if ((!foundmove) && (difficulty=="hard")) {
			for (x=0;x<numplanes;x++) {
				planesum=0;
				count=0;
				pos5=false;
				pos6=false;
				pos9=false;
				pos10=false;
				posO=0;
				for (y=0;y<16;y++) {
					coordinate=planes[x][y];
					planesum=planesum+board[coordinate.x][coordinate.y][coordinate.z];
					if (board[coordinate.x][coordinate.y][coordinate.z]!=0) count++;
					if ((y==5) && (board[coordinate.x][coordinate.y][coordinate.z]==1)) pos5=true;
					if ((y==6) && (board[coordinate.x][coordinate.y][coordinate.z]==1)) pos6=true;
					if ((y==9) && (board[coordinate.x][coordinate.y][coordinate.z]==1)) pos9=true;
					if ((y==10) && (board[coordinate.x][coordinate.y][coordinate.z]==1)) pos10=true;
					if ((y==5) && (board[coordinate.x][coordinate.y][coordinate.z]==-1)) posO=5;
					if ((y==6) && (board[coordinate.x][coordinate.y][coordinate.z]==-1)) posO=6;
					if ((y==9) && (board[coordinate.x][coordinate.y][coordinate.z]==-1)) posO=9;
					if ((y==10) && (board[coordinate.x][coordinate.y][coordinate.z]==-1)) posO=10;
				}
				if ((planesum==3) && (count==3)) {
					// found a plane with three X's and no O's
					if (!pos5) {
						//this.bubble("tracelog","Step six succeeded - can block a triple whammy");
						coordinate=planes[x][5];
						foundmove=true;
					} else if (!pos6) {
						//this.bubble("tracelog","Step six succeeded - can block a triple whammy");
						coordinate=planes[x][6];
						foundmove=true;
					} else if (!pos9) {
						//this.bubble("tracelog","Step six succeeded - can block a triple whammy");
						coordinate=planes[x][9];
						foundmove=true;
					} else if (!pos10) {
						//this.bubble("tracelog","Step six succeeded - can block a triple whammy");
						coordinate=planes[x][10];
						foundmove=true;
					}
				}
				if ((planesum==4) && (count==6)) {
					// try and block the 'w' construction
					if (posO==10) {
						coordinate=planes[x][0];
						if (board[coordinate.x][coordinate.y][coordinate.z]==0) {
							foundmove=true;
						} else {
							coordinate=planes[x][1];
							if  (board[coordinate.x][coordinate.y][coordinate.z]==0) {
								foundmove=true;
							} else {
								coordinate=planes[x][4];
								if  (board[coordinate.x][coordinate.y][coordinate.z]==0) {
									foundmove=true;
								}
							}
						}
					} else if (posO==6) {
						coordinate=planes[x][12];
						if (board[coordinate.x][coordinate.y][coordinate.z]==0) {
							foundmove=true;
						} else {
							coordinate=planes[x][8];
							if  (board[coordinate.x][coordinate.y][coordinate.z]==0) {
								foundmove=true;
							} else {
								coordinate=planes[x][13];
								if  (board[coordinate.x][coordinate.y][coordinate.z]==0) {
									foundmove=true;
								}
							}
						}
					} else if (posO==5) {
						coordinate=planes[x][15];
						if (board[coordinate.x][coordinate.y][coordinate.z]==0) {
							foundmove=true;
						} else {
							coordinate=planes[x][11];
							if  (board[coordinate.x][coordinate.y][coordinate.z]==0) {
								foundmove=true;
							} else {
								coordinate=planes[x][14];
								if  (board[coordinate.x][coordinate.y][coordinate.z]==0) {
									foundmove=true;
								}
							}
						}
					} else if (posO==9) {
						coordinate=planes[x][3];
						if (board[coordinate.x][coordinate.y][coordinate.z]==0) {
							foundmove=true;
						} else {
							coordinate=planes[x][2];
							if  (board[coordinate.x][coordinate.y][coordinate.z]==0) {
								foundmove=true;
							} else {
								coordinate=planes[x][7];
								if  (board[coordinate.x][coordinate.y][coordinate.z]==0) {
									foundmove=true;
								}
							}
						}
					} 
				}
				if (foundmove) break;
			}
		}
		//if ((!foundmove) && (difficulty=="hard")) this.bubble("tracelog","Step six failed - cannot block a triple whammy");
/*		
		// Step seven - look to setup potential triple whammy
		if ((!foundmove) && (difficulty=="hard") && (!whammyinplay)) {
			for (x=0;x<numplanes;x++) {
				planesum=0;
				count=0;
				pos5=false;
				pos6=false;
				pos9=false;
				pos10=false;
				for (y=0;y<16;y++) {
					coordinate=planes[x][y];
					planesum=planesum+board[coordinate.x][coordinate.y][coordinate.z];
					if (board[coordinate.x][coordinate.y][coordinate.z]!=0) count++;
					if ((y==5) && (board[coordinate.x][coordinate.y][coordinate.z]==-1)) pos5=true;
					if ((y==6) && (board[coordinate.x][coordinate.y][coordinate.z]==-1)) pos6=true;
					if ((y==9) && (board[coordinate.x][coordinate.y][coordinate.z]==-1)) pos9=true;
					if ((y==10) && (board[coordinate.x][coordinate.y][coordinate.z]==-1)) pos10=true;
				}
				if ((planesum*-1==count) && (count>2)) {
					// found a plane with 3 or more O's and no X's
					if ((pos5) && (pos6) && (pos9) && (pos10)) {
						// middle positions already taken
						//this.bubble("tracelog","Step seven succeeded - can play a triple whammy");
						coordinate=planes[x][0];
						foundmove=true;
						whammyinplay=true;
					} else if (!pos5) {
						//this.bubble("tracelog","Step seven succeeded - can work towards a triple whammy");
						coordinate=planes[x][5];
						foundmove=true;
					} else if (!pos6) {
						//this.bubble("tracelog","Step seven succeeded - can work towards a triple whammy");
						coordinate=planes[x][6];
						foundmove=true;
					} else if (!pos9) {
						//this.bubble("tracelog","Step seven succeeded - can work towards a triple whammy");
						coordinate=planes[x][9];
						foundmove=true;
					} else if (!pos10) {
						//this.bubble("tracelog","Step seven succeeded - can work towards a triple whammy");
						coordinate=planes[x][10];
						foundmove=true;
					}
				}
				if (foundmove) break;
			}
		}
		if ((!foundmove) && (difficulty=="hard") && (!whammyinplay)) {
			for (x=0;x<numplanes;x++) {
				planesum=0;
				count=0;
				pos5=false;
				pos6=false;
				pos9=false;
				pos10=false;
				for (y=0;y<16;y++) {
					coordinate=planes[x][y];
					planesum=planesum+board[coordinate.x][coordinate.y][coordinate.z];
					if (board[coordinate.x][coordinate.y][coordinate.z]!=0) count++;
					if ((y==5) && (board[coordinate.x][coordinate.y][coordinate.z]==-1)) pos5=true;
					if ((y==6) && (board[coordinate.x][coordinate.y][coordinate.z]==-1)) pos6=true;
					if ((y==9) && (board[coordinate.x][coordinate.y][coordinate.z]==-1)) pos9=true;
					if ((y==10) && (board[coordinate.x][coordinate.y][coordinate.z]==-1)) pos10=true;
				}
				if ((planesum*-1==count) && (count==2)) {
					// found a plane with only 2 O's
					if (!pos5) {
						//this.bubble("tracelog","Step seven succeeded - can work towards a triple whammy");
						coordinate=planes[x][5];
						foundmove=true;
					} else if (!pos6) {
						//this.bubble("tracelog","Step seven succeeded - can work towards a triple whammy");
						coordinate=planes[x][6];
						foundmove=true;
					} else if (!pos9) {
						//this.bubble("tracelog","Step seven succeeded - can work towards a triple whammy");
						coordinate=planes[x][9];
						foundmove=true;
					} else if (!pos10) {
						//this.bubble("tracelog","Step seven succeeded - can work towards a triple whammy");
						coordinate=planes[x][10];
						foundmove=true;
					}
				}
				if (foundmove) break;
			}
		}
		//if ((!foundmove) && (difficulty=="hard")) this.bubble("tracelog","Step seven failed - cannot work towards a triple whammy");
*/
		// Step eight - look for two O's in the same line with no X's
		if (!foundmove) {
			for (x=0;x<numlines;x++) {
				linesum=0;
				count=0;
				for (y=0;y<4;y++) {
					coordinate=lines[x][y];
					linesum=linesum+board[coordinate.x][coordinate.y][coordinate.z];
					if (board[coordinate.x][coordinate.y][coordinate.z]!=0) count++;
				}
				if ((linesum==-2) && (count==2)) {
					foundmove=true;
					// find empty place
					for (y=0;y<4;y++) {
						coordinate=lines[x][y];
						if (board[coordinate.x][coordinate.y][coordinate.z]==0) break;
					}
					//this.bubble("tracelog","Step eight succeeded - found a line with two O's and no X's");
				}
				if (foundmove) break;
			}
		}
		//if (!foundmove) this.bubble("tracelog","Step eight failed - no line with two O's and no X's");
		
		// Step nine - look to move in the central area (to control the game better!)
		if (!foundmove) {
			count=0;
			for (x=0;x<8;x++) {
				coordinate=centre[x];
				if (board[coordinate.x][coordinate.y][coordinate.z]==0) count++;
			}
			if (count>0) {
				while (!foundmove) {
					x=Math.floor(Math.random()*8);
					coordinate=centre[x];
					if (board[coordinate.x][coordinate.y][coordinate.z]==0) {
						foundmove=true;
						//this.bubble("tracelog","Step nine succeeded - found move in central area");
					}
				}
			}
		}
		//if (!foundmove) this.bubble("tracelog","Step nine failed - central area taken");
		
		// Step ten - look for one O in the same line with no X's
		if (!foundmove) {
			for (x=0;x<numlines;x++) {
				linesum=0;
				count=0;
				for (y=0;y<4;y++) {
					coordinate=lines[x][y];
					linesum=linesum+board[coordinate.x][coordinate.y][coordinate.z];
					if (board[coordinate.x][coordinate.y][coordinate.z]!=0) count++;
				}
				if ((linesum==-1) && (count==1)) {
					foundmove=true;
					// find empty place
					for (y=0;y<4;y++) {
						coordinate=lines[x][y];
						if (board[coordinate.x][coordinate.y][coordinate.z]==0) break;
					}
					//this.bubble("tracelog","Step ten succeeded - found a line with one O and no X's");
				}
				if (foundmove) break;
			}
		}
		//if (!foundmove) this.bubble("tracelog","Step ten failed - no line with one O's and no X's");
		
		// Step eleven - look for no O's in the same line with no X's
		if (!foundmove) {
			for (x=0;x<numlines;x++) {
				linesum=0;
				count=0;
				for (y=0;y<4;y++) {
					coordinate=lines[x][y];
					linesum=linesum+board[coordinate.x][coordinate.y][coordinate.z];
					if (board[coordinate.x][coordinate.y][coordinate.z]!=0) count++;
				}
				if ((linesum==0) && (count==0)) {
					foundmove=true;
					// choose 2nd or 3rd position
					y=Math.floor(Math.random()*2)+1;
					coordinate=lines[x][y];
					//this.bubble("tracelog","Step eleven succeeded - found a line with no O's and no X's");
				}
				if (foundmove) break;
			}
		}
		//if (!foundmove) this.bubble("tracelog","Step eleven failed - no line with no O's and no X's");
		
		// Last step - do random move
		while (!foundmove) {
			x=Math.floor(Math.random()*4);
			y=Math.floor(Math.random()*4);
			z=Math.floor(Math.random()*4);
			//this.bubble("tracelog","x="+x+", y="+y+", z="+z+", board[x][y][z]="+board[x][y][z]);
			if (board[x][y][z]==0) {
				foundmove=true;
				coordinate=this.coord(x,y,z);
				//this.bubble("tracelog","Last step succeeded - random move found");
			}
		}
		
		// convert coordinate to sprite id
		num = coordinate.z * 16 + coordinate.y * 4 + coordinate.x;
		if (num<10) {
			id = "3Buttons00" + num;
		} else {
			id = "3Buttons0" + num;
		}
		board[coordinate.x][coordinate.y][coordinate.z]=-1;
		return id;
	}
	
	target.checkWin = function (player) {
		var coordinate;
		var win=false;
		for (x=0;x<numlines;x++) {
			count=0;
			for (y=0;y<4;y++) {
				coordinate=lines[x][y];
				if (board[coordinate.x][coordinate.y][coordinate.z]==player) {
					count++;
				}
			}
			if (count==4) {
				for (y=0;y<4;y++) {
					coordinate=lines[x][y];
					num = coordinate.z * 16 + coordinate.y * 4 + coordinate.x;
					if (num<10) {
						id = "3Buttons00" + num;
					} else {
						id = "3Buttons0" + num;
					}
					if (player==1) {
						this[id].u = 3;
					} else {
						this[id].u = 4;
					}
				}
				gameover = true;
				win=true;
				if (players == 2) {
					if (player == 1) {
						// player 1 wins
						this.showTurn.setValue("Player 1 won!");
						lastwinner=1;
					} else {
						// player 2 wins
						this.showTurn.setValue("Player 2 won!");
						lastwinner=2;
					}
				} else {
					if (player == 1) {
						// player 1 wins
						this.showTurn.setValue("Congratulations!  You won!");
						lastwinner=1;
					} else {
						// reader wins
						this.showTurn.setValue("Bad luck!  I won!");
						lastwinner=2;
					}
				}
				this.grid2Cursor.show(false);
				this.grid1Cursor.show(false);
			}
		}
		return win;
	}
	
	target.checkfordraw = function () {
		var res=false;
		var placesleft=0;
		var x,y,z;
		
		for (x=0; x<maxX; x++) {
			for (y=0; y<maxY; y++) {
				for (z=0; z<maxZ; z++) {
					if (board[x][y][z]==0) placesleft++;
				}
			}
		}		
		
		if (placesleft == 0) {
			this.showTurn.setValue("It's a draw!");
			gameover = true;
			res = true;
		}
		return res;
	}
	
	target.placeXO = function () {
		var id;
		var butt;
		var res = false;
		var drawres = false;
	
		if (Exiting) {
			kbook.autoRunRoot.exitIf(kbook.model);
		}
		
		if (gameover) {
			return;
		}
		
		if (player1turn) {
			// player 1 places "X"
			num = pos1Z * 16 + pos1Y * 4 + pos1X;
			if (num<10) {
				id = "3Buttons00" + num;
			} else {
				id = "3Buttons0" + num;
			}
			if (board[pos1X][pos1Y][pos1Z] != 0) {
				return;
			}
			board[pos1X][pos1Y][pos1Z] = 1;
			this[id].u = 1;
			
			// store X's moves to help determine O's moves
			xMoves++;
			xMovesX[xMoves] = pos1X;
			xMovesY[xMoves] = pos1Y;
			xMovesZ[xMoves] = pos1Z;

			// check for win
			res = this.checkWin(1);
			if (!res) {
				// if not win
				// check for draw (no free spaces)
				drawres = this.checkfordraw();
				if (!drawres) {
					if (players == 1) {
						// reader's turn
						this.showTurn.setValue("My turn...");
						if (!isTouch) {
							this.grid1Cursor.show(false);
						}
						FskUI.Window.update.call(kbook.model.container.getWindow());
						id = target.placeO();
						this[id].u = 2;
											
						// check for win
						res = this.checkWin(-1);
						
						if (!res) {
							// if not win
							// check for draw (no free spaces)
							drawres = this.checkfordraw();
							if (!drawres) {
								this.showTurn.setValue("Your turn...");
								if (!isTouch) {
									this.grid1Cursor.show(true);
								}
							}
						}
					} else {
						// player 2's turn
						player1turn = false;
						this.showTurn.setValue("Player 2's turn...");
						this.drawgrid2Cursor(pos2X, pos2Y,pos2Z);
						if (!isTouch) {
							this.grid2Cursor.show(true);
							this.drawgrid2Cursor(pos2X, pos2Y,pos2Z);
							this.grid1Cursor.show(false);
						}
					}
				}
			}
		} else {
			// player 2 places "O"
			num = pos2Z * 16 + pos2Y * 4 + pos2X;
			if (num<10) {
				id = "3Buttons00" + num;
			} else {
				id = "3Buttons0" + num;
			}
			if (board[pos2X][pos2Y][pos2Z] != 0) {
				return;
			}
			board[pos2X][pos2Y][pos2Z] = -1;
			this[id].u = 2;
			//this.setButtons();
			
			// check for win
			res = this.checkWin(-1);
			
			if (!res) {
				// if not win
				// check for draw (no free spaces)
				drawres = this.checkfordraw();
				if (!drawres) {
					player1turn = true;
					this.showTurn.setValue("Player 1's turn...");
					this.drawgrid1Cursor(pos1X, pos1Y,pos1Z);
					if (!isTouch) {
						this.grid1Cursor.show(true);
						this.drawgrid1Cursor(pos1X, pos1Y,pos1Z);
						this.grid2Cursor.show(false);
					}
				}
			} else {
				// player 2 won!
				this.showTurn.setValue("Player 2 won!");
				this.showTurn.show(true);
				this.grid2Cursor.show(false);
				this.grid1Cursor.show(false);
				return;
			}
		}
	}
	
	target.doGridClick = function (sender) {
		var id, y, x, u;
		id = getSoValue(sender, "id");
		num = id.substring(9, 11);
		u = getSoValue(sender,"u");
		//this.bubble("tracelog","id="+id+", num="+num+", u="+u);
		if (u == 0) {
			if (players == 2) {
				if (player1turn) {
					pos1Z = Math.floor(num/16);
					pos1Y = Math.floor((num-pos1Z*16)/4);
					pos1X = num % 4; //modulus
					this.drawgrid1Cursor(pos1X, pos1Y,pos1Z);
				} else {
					pos2Z = Math.floor(num/16);
					pos2Y = Math.floor((num-pos2Z*16)/4);
					pos2X = num % 4; //modulus
					this.drawgrid2Cursor(pos2X, pos2Y,pos2Z);
				}
			} else {
				pos1Z = Math.floor(num/16);
				pos1Y = Math.floor((num-pos1Z*16)/4);
				pos1X = num % 4; //modulus
				this.drawgrid1Cursor(pos1X, pos1Y,pos1Z);
			}
			this.placeXO();
		}	
	}
	
	target.doButtonClick = function (sender) {
		var id;
	    id = getSoValue(sender, "id");
		n = id.substring(7, 10);
/*		if (n == "EXT") {
			kbook.autoRunRoot.exitIf(kbook.model);
			return;
		} */
		if (n == "ONE") {
			this.GameOnePlayer();
			return;
		}
		if (n == "TWO") {
			this.GameTwoPlayers();
			return;
		}	
	}
	
	target.moveCursor = function (dir) {
		switch (dir) {
		case "down":
			{
				if (players == 2) {
					if (player1turn) {
						pos1Y = (pos1Y + 1) % maxY;
					} else {
						pos2Y = (pos2Y + 1) % maxY;
					}
				} else {
					pos1Y = (pos1Y + 1) % maxY;
				}			
				break;
			}
		case "up":
			{
				if (players == 2) {
					if (player1turn) {
						pos1Y = (maxY + pos1Y - 1) % maxY;
					} else {
						pos2Y = (maxY + pos2Y - 1) % maxY;
					}
				} else {
					pos1Y = (maxY + pos1Y - 1) % maxY;
				}
				break;
			}
		case "left":
			{
				if (players == 2) {
					if (player1turn) {
						pos1X = (maxX + pos1X - 1) % maxX;
					} else {
						pos2X = (maxX + pos2X - 1) % maxX;
					}
				} else {
					pos1X = (maxX + pos1X - 1) % maxX;
				}
				break;
			}
		case "right":
			{
				if (players == 2) {
					if (player1turn) {
						pos1X = (pos1X + 1) % maxX;
					} else {
						pos2X = (pos2X + 1) % maxX;
					}
				} else {
					pos1X = (pos1X + 1) % maxX;
				}
				break;
			}
		}
		if (players == 2) {
			if (player1turn) {
				this.drawgrid1Cursor(pos1X, pos1Y,pos1Z);
			} else {
				this.drawgrid2Cursor(pos2X, pos2Y,pos2Z);
			}
		} else {
			this.drawgrid1Cursor(pos1X, pos1Y,pos1Z);
		}
		return;
	}
	
	target.doRoot = function (sender) {
		kbook.autoRunRoot.exitIf(kbook.model);
		return;
	}
	
	target.GameOnePlayer = function () {
		players = 1;
		this.resetButtons();
		pos1X = 0;
		pos1Y = 0;
		pos1Z = 0;
		pos2X = 3;
		pos2Y = 0;
		pos2Z = 0;
		gameover = false;
		whammyinplay=false;
		oMoves = 0;
		xMoves = 0;
		this.drawgrid1Cursor(pos1X, pos1Y,pos1Z);
		this.drawgrid2Cursor(pos2X, pos2Y,pos2Z);
		if (!isTouch) {
			this.grid1Cursor.show(true);
			this.grid2Cursor.show(false);
		}		
		
		if ((lastwinner==2) && (previousplayers==1)) {
			// reader won last game
			this.showTurn.setValue("Your turn...");
			player1turn = true;
		} else if ((lastwinner==1) && (previousplayers==1)) {
			// human won last game
			this.showTurn.setValue("My turn...");
			player1turn = false;
			if (!isTouch) {
				this.grid1Cursor.show(false);
			}
			FskUI.Window.update.call(kbook.model.container.getWindow());
			id = target.placeO();
			this[id].u = 2;
			this.showTurn.setValue("Your turn...");
			player1turn = true;
			if (!isTouch) {
				this.grid1Cursor.show(true);
			}
		} else {
			// previously playing 2 player game, now switching to 1 player game
			this.showTurn.setValue("Your turn...");
			player1turn = true;
			previousplayers=1;
		}
	}
	
	target.GameTwoPlayers = function () {
		players = 2;
		this.resetButtons();
		pos1X = 0;
		pos1Y = 0;
		pos1Z = 0;
		pos2X = 3;
		pos2Y = 0;
		pos2Z = 0;
		gameover = false;
		whammyinplay=false;
		oMoves = 0;
		xMoves = 0;
		this.drawgrid1Cursor(pos1X, pos1Y,pos1Z);
		this.drawgrid2Cursor(pos2X, pos2Y,pos2Z);
		if (!isTouch) {
			this.grid1Cursor.show(true);
			this.grid2Cursor.show(false);
		}

		if ((lastwinner==2) && (previousplayers==2)) {
			// Player 2 won last game
			this.showTurn.setValue("Player 1's turn...");
			player1turn = true;
		} else if ((lastwinner==1) && (previousplayers==2)) {
			// Player 1 won last game
			this.showTurn.setValue("Player 2's turn...");
			player1turn = false;
		} else {
			// previously playing 1 player game, now switching to 2 player game
			this.showTurn.setValue("Player 1's turn...");
			player1turn = true;
			previousplayers=2;
		}		
	}
	
	target.digitF = function (digit) {
		//this.bubble("tracelog","digit="+digit);
		switch (digit*1) {	/* typecast to number */
		case 1:
			{
				if (players == 2) {
					if (player1turn) {
						pos1Z=0;
						this.drawgrid1Cursor(pos1X, pos1Y,pos1Z);
					} else {
						pos2Z=0;
						this.drawgrid2Cursor(pos2X, pos2Y,pos2Z);
					}
				} else {
					pos1Z=0;
					this.drawgrid1Cursor(pos1X, pos1Y,pos1Z);
				}
				//this.bubble("tracelog","pos1X="+pos1X+", pos1Y="+pos1Y+", pos1Z="+pos1Z);
				return;
			}
		case 2:
			{
				if (players == 2) {
					if (player1turn) {
						pos1Z=1;
						this.drawgrid1Cursor(pos1X, pos1Y,pos1Z);
					} else {
						pos2Z=1;
						this.drawgrid2Cursor(pos2X, pos2Y,pos2Z);
					}
				} else {
					pos1Z=1;
					this.drawgrid1Cursor(pos1X, pos1Y,pos1Z);
				}
				//this.bubble("tracelog","pos1X="+pos1X+", pos1Y="+pos1Y+", pos1Z="+pos1Z);
				return;
			}
		case 3:
			{
				if (players == 2) {
					if (player1turn) {
						pos1Z=2;
						this.drawgrid1Cursor(pos1X, pos1Y,pos1Z);
					} else {
						pos2Z=2;
						this.drawgrid2Cursor(pos2X, pos2Y,pos2Z);
					}
				} else {
					pos1Z=2;
					this.drawgrid1Cursor(pos1X, pos1Y,pos1Z);
				}
				//this.bubble("tracelog","pos1X="+pos1X+", pos1Y="+pos1Y+", pos1Z="+pos1Z);
				return;
			}
		case 4:
			{
				if (players == 2) {
					if (player1turn) {
						pos1Z=3;
						this.drawgrid1Cursor(pos1X, pos1Y,pos1Z);
					} else {
						pos2Z=3;
						this.drawgrid2Cursor(pos2X, pos2Y,pos2Z);
					}
				} else {
					pos1Z=3;
					this.drawgrid1Cursor(pos1X, pos1Y,pos1Z);
				}
				//this.bubble("tracelog","pos1X="+pos1X+", pos1Y="+pos1Y+", pos1Z="+pos1Z);
				return;
			}
		case 8:
			{
				this.GameOnePlayer();
				return;
			}
		case 9:
			{
				this.GameTwoPlayers();
				return;
			}
		case 0:
			{	this.doRoot();
			/*	if (difficulty == "easy") {
					difficulty="hard";
					this.nonTouch6.setValue("[0] Difficulty: Hard");
				} else if (difficulty == "hard") {
					difficulty="easy";
					this.nonTouch6.setValue("[0] Difficulty: Easy");
				}
				return; */
			} 
		}
	}

	target.doPrev = function () {
	/*	if (hasNumericButtons) {
			this.moveCursor("left");
			return;
		} */
		if (difficulty == "easy") {
			difficulty="hard";
			this.touchButtons1.setValue("[Prev]: Difficulty: Hard");
		} else if (difficulty == "hard") {
			difficulty="easy";
			this.touchButtons1.setValue("[Prev]: Difficulty: Easy");
		}
		return;
	}
	
	target.doHold0 = function () {
		kbook.autoRunRoot.exitIf(kbook.model);
		return;
	}	
};
tmp();
tmp = undefined;