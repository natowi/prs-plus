// Name: Solitaire
//   Original code (c) 2011 by Ben Chenoweth
// 
// Initial version: 2011-08-03
// Changelog:
// 

var tmp = function () {
	var hasNumericButtons = kbook.autoRunRoot.hasNumericButtons;
	var getSoValue = kbook.autoRunRoot.getSoValue; 
	var firstX = 51;
	var curDX = 70;
	var firstY = 96;
	var curDY = 70;
	var posX = 3;
	var posY = 3;	
	var marbleselected = false;
	var fromPos = -1;
	var firstMove = true;
	var numRemain = 33;
	var layout = 1;
	
	target.init = function () {
		/* set correct appIcon */
		this.appIcon.u = kbook.autoRunRoot._icon;

		if (!hasNumericButtons) {
			this.gridCursor.show(false);
			this.nontouch_quit.show(false);
			this.nontouch_new.show(false);
		} else {
			this.gridCursor.show(true);
			this.touch_quit.show(false);
			this.BUTTON_NEW.show(false);
		}
		
		this.drawGridCursor(posX, posY);
		
		// hide congratulations sprite
		this.congratulations.changeLayout(0,0,uD,0,0,uD);
		
		return;
	}
	
	target.exitQuit = function () {
		kbook.autoRunRoot.exitIf(kbook.model);
		return;
	}
	
	target.doGridClick = function (sender) {
		var id, num, u;
		id = getSoValue(sender, "id");
		num = id.substring(6, 8);
		u = getSoValue(sender, "u");
		//this.bubble("tracelog","id="+id+", num="+num+", u="+u);
		posX = (parseInt(num) - 1) % 7;
		posY = (parseInt((num - 1) / 7));
		//this.bubble("tracelog","posX="+posX+", posY="+posY);
		this.drawGridCursor(posX, posY);
		this.clickMarble(id, u);
		return;
	}

	target.drawGridCursor = function (x, y) {
		this.gridCursor.changeLayout(firstX + x * curDX, undefined, undefined, firstY + y * curDY, undefined, undefined);
		return;
	};
	
	target.clickMarble = function (id, u) {
		var i, marble;
		//this.bubble("tracelog","id="+id+", u="+u);

		if (u == "3")  return;
		
		if (firstMove) {
			this[id].u=0;
			numRemain--;
			this.numRemaining.setValue(numRemain);
			firstMove = false;
			return;
		}
				
		if (u == "1") {
			// reset previously selected marble
			for (i = 1; i <= 49; i++)
			{
				if (i < 10) {
					marble = "Marble0" + i;
				} else {
					marble = "Marble" + i;
				}
				tempu = getSoValue(this[marble], "u");
				if (tempu == 2) {
					this[marble].u=1;
				}
			}
		
			// select marble
			this[id].u=2;
			marbleselected = true;
			fromPos = id;
		}
		if (u == "2") {
			// unselect marble
			this[id].u=1;
			marbleselected = false;
			fromPos = -1;
		}
		if (u == "0") {
			// empty position
			if (marbleselected) {
				middle = this.check_move(fromPos, id);
				if (middle != "") {
					// make the move
					this[middle].u=0;
					this[fromPos].u=0;
					this[id].u=1;
					numRemain--;
					this.numRemaining.setValue(numRemain);					
					marbleselected = false;
					fromPos = -1;
					if (numRemain == 1) {
						// win
						this.congratulations.changeLayout(94,411,uD,250,142,uD);
					}
				}
			}
			return;
		}
		return;
	}
	
    target.check_move = function (from, to) {
		var middle = "";
		fromNum = from.substring(6, 8) * 1;
		toNum = to.substring(6, 8) * 1;
		var diff = fromNum - toNum;
		var xpos = (fromNum % 7);

		//this.bubble("tracelog","from="+from+", fromNum="+fromNum+", to="+to+", toNum="+toNum);
		
		if (diff == 2) {
			if (!(xpos == 1 || xpos == 2)) {
				if (fromNum > 10) {
					middle = "Marble" + (fromNum - 1);
				} else {
					middle = "Marble0" + (fromNum - 1);
				}
			}
		} else if (diff == -2) {
			if (!(xpos == 6 || xpos == 0)) {
				if (fromNum > 8) {
					middle = "Marble" + (fromNum + 1);
				} else {
					middle = "Marble0" + (fromNum + 1);
				}
			}
		} else if (diff == 14) {
			if (fromNum < 17) {
				middle= "Marble0" + (fromNum - 7);
			} else {
				middle= "Marble" + (fromNum - 7);
			}

		} else if (diff == -14) {
			if (fromNum < 3) {
				middle= "Marble0" + (fromNum + 7);
			} else {
				middle= "Marble" + (fromNum + 7);
			}
		}

		if (middle!= "") {
			var tempu = getSoValue(this[middle], "u");
			if (tempu != 1) {
				middle="";
			}
		}
		return (middle);
    }
	
	target.doButtonClick = function (sender) {
		var id;
		id = getSoValue(sender, "id");
		n = id.substring(7, 10);
		if (n == "NEW") {
			this.resetBoard();
			return;
		}
	}
	
	target.resetBoard = function () {
		// reset marbles
		for (i = 1; i <= 49; i++)
		{
			if (i < 10) {
				marble = "Marble0" + i;
			} else {
				marble = "Marble" + i;
			}
			tempu = getSoValue(this[marble], "u");
			if (tempu != 3) {
				this[marble].u=1;
			}
		}
		
		// reset variables
		firstMove = true;
		marbleselected = false;
		fromPos = -1;
		if (layout==1) {
			numRemain = 33;
			this.numRemaining.setValue("33");
		}
		if (layout==2) {
			numRemain = 37;
			this.numRemaining.setValue("37");
		}
		if (layout==3) {
			numRemain = 49;
			this.numRemaining.setValue("49");		
		}
		
		// hide congratulations sprite
		this.congratulations.changeLayout(0,0,uD,0,0,uD);
		
		return;
	}
	
	target.hideCongratulations = function () {
		// hide congratulations sprite
		this.congratulations.changeLayout(0,0,uD,0,0,uD);	
	}
	
	target.doNext = function () {
		layout++;
		if (layout==4) layout=1;

		// reset variables
		firstMove = true;
		marbleselected = false;
		fromPos = -1;		
		
		if (layout==1) {
			this.layout.setValue("[Next/Prev] Layout: English");
			this.Marble01.u=3;
			this.Marble02.u=3;
			this.Marble06.u=3;
			this.Marble07.u=3;
			this.Marble08.u=3;
			this.Marble09.u=3;
			this.Marble13.u=3;
			this.Marble14.u=3;
			this.Marble36.u=3;
			this.Marble37.u=3;
			this.Marble41.u=3;
			this.Marble42.u=3;
			this.Marble43.u=3;
			this.Marble44.u=3;
			this.Marble48.u=3;
			this.Marble49.u=3;
			numRemain = 33;
			this.numRemaining.setValue("33");
		}
		if (layout==2) {
			this.layout.setValue("[Next/Prev] Layout: French");
			this.Marble01.u=3;
			this.Marble02.u=3;
			this.Marble06.u=3;
			this.Marble07.u=3;
			this.Marble08.u=3;			
			this.Marble09.u=1;
			this.Marble13.u=1;
			this.Marble14.u=3;
			this.Marble36.u=3;
			this.Marble37.u=1;
			this.Marble41.u=1;
			this.Marble42.u=3;
			this.Marble43.u=3;
			this.Marble44.u=3;
			this.Marble48.u=3;
			this.Marble49.u=3;
			numRemain = 37;
			this.numRemaining.setValue("37");
		}
		if (layout==3) {
			this.layout.setValue("[Next/Prev] Layout: Square");
			this.Marble01.u=1;
			this.Marble02.u=1;
			this.Marble06.u=1;
			this.Marble07.u=1;
			this.Marble08.u=1;
			this.Marble09.u=1;
			this.Marble13.u=1;
			this.Marble14.u=1;
			this.Marble36.u=1;
			this.Marble37.u=1;
			this.Marble41.u=1;
			this.Marble42.u=1;
			this.Marble43.u=1;
			this.Marble44.u=1;
			this.Marble48.u=1;
			this.Marble49.u=1;
			numRemain = 49;
			this.numRemaining.setValue("49");
		}
		
		// reset marbles
		for (i = 1; i <= 49; i++)
		{
			if (i < 10) {
				marble = "Marble0" + i;
			} else {
				marble = "Marble" + i;
			}
			tempu = getSoValue(this[marble], "u");
			if (tempu != 3) {
				this[marble].u=1;
			}
		}		
		
		return;
	}
	
	target.doPrevious = function () {
		layout--;
		if (layout==0) layout=3;

		// reset variables
		firstMove = true;
		marbleselected = false;
		fromPos = -1;		
		
		if (layout==1) {
			this.layout.setValue("[Next/Prev] Layout: English");
			this.Marble01.u=3;
			this.Marble02.u=3;
			this.Marble06.u=3;
			this.Marble07.u=3;
			this.Marble08.u=3;
			this.Marble09.u=3;
			this.Marble13.u=3;
			this.Marble14.u=3;
			this.Marble36.u=3;
			this.Marble37.u=3;
			this.Marble41.u=3;
			this.Marble42.u=3;
			this.Marble43.u=3;
			this.Marble44.u=3;
			this.Marble48.u=3;
			this.Marble49.u=3;
			numRemain = 33;
			this.numRemaining.setValue("33");
		}
		if (layout==2) {
			this.layout.setValue("[Next/Prev] Layout: French");
			this.Marble01.u=3;
			this.Marble02.u=3;
			this.Marble06.u=3;
			this.Marble07.u=3;
			this.Marble08.u=3;			
			this.Marble09.u=1;
			this.Marble13.u=1;
			this.Marble14.u=3;
			this.Marble36.u=3;
			this.Marble37.u=1;
			this.Marble41.u=1;
			this.Marble42.u=3;
			this.Marble43.u=3;
			this.Marble44.u=3;
			this.Marble48.u=3;
			this.Marble49.u=3;
			numRemain = 37;
			this.numRemaining.setValue("37");
		}
		if (layout==3) {
			this.layout.setValue("[Next/Prev] Layout: Square");
			this.Marble01.u=1;
			this.Marble02.u=1;
			this.Marble06.u=1;
			this.Marble07.u=1;
			this.Marble08.u=1;
			this.Marble09.u=1;
			this.Marble13.u=1;
			this.Marble14.u=1;
			this.Marble36.u=1;
			this.Marble37.u=1;
			this.Marble41.u=1;
			this.Marble42.u=1;
			this.Marble43.u=1;
			this.Marble44.u=1;
			this.Marble48.u=1;
			this.Marble49.u=1;
			numRemain = 49;
			this.numRemaining.setValue("49");
		}
		
		// reset marbles
		for (i = 1; i <= 49; i++)
		{
			if (i < 10) {
				marble = "Marble0" + i;
			} else {
				marble = "Marble" + i;
			}
			tempu = getSoValue(this[marble], "u");
			if (tempu != 3) {
				this[marble].u=1;
			}
		}
		
		return;
	}
	
	target.moveCursor = function (dir) {
		switch (dir) {
		case "down":
			{
				posY = (posY + 1) % 7;
				break;
			}
		case "up":
			{
				posY = (7 + posY - 1) % 7;
				break;
			}
		case "left":
			{
				posX = (7 + posX -1) % 7;
				break;
			}
		case "right":
			{
				posX = (posX + 1) % 7;
				break;
			}
		}		
		this.drawGridCursor(posX, posY);
		return;
	}
	
	target.doCenterF = function () {
		var num;
		var id;
		var u;
		num = posY * 7 + posX + 1;
		if (num < 10) {
			id="Marble0" + num;
		} else {
			id="Marble" + num;
		}
		u = getSoValue(this[id], "u");
		this.clickMarble(id, u);
		return;
	}
	
	target.doMenu = function () {
		return;
	}
	
	target.doSize = function () {
		return;
	}	
	
	target.doOption = function () {
		return;
	}
};
tmp();
delete tmp;