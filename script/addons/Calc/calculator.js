// Description: js functions for calculator; borrowed/lend from http://www.motionnet.com/calculator/
// History: 
//	2010-06-05 Mark Nord - initial release - public beta
//	2010-08-23 Mark Nord - Buttons enabled, should work on PRS 600 too
//	2010-12-05 Mark Nord - translations and custom icon enabled, button-index-computed  device independent
// 	2011-03-01 kartu - Moved into a function, to allow variable name optimizations
//	2011-05-20 Mark Nord - fixed input of digits like 0.0x
//  2011-11-25 Ben Chenoweth - contents of memory cells now saved and loaded

var tmp = function () { 	
	// GLOBAL VARIABLES
	var digitsMaximum = 16; 
	var maxPushLevels = 12; 
	var nhdigits = 8;
	var valueMaximum = 4294967296; 
	var hexdigits = "" + "0123456789ABCDEF";
	var stack = new Array(maxPushLevels); 
	var angleMeasure = "deg"; 
	var value = 0;
	var stackTier = 0;
	var isItThere = true;
	var decimal = 0;	
	var fixed = 0;	
	var expMode = false;	
	var expval = 0;
	var base = 10; 
	
	var firstX = 42;
	var firstY = 205; // 255-curDY
	var curDX = 60;
	var curDY = 50;
	var posX = 8;
	var posY = 8;
	
	var gridDX, gridDY;
	
	var trigmeth  = [
		[{checked:true}],
		[{checked:false}],
		[{checked:false}]
	];	 
	var func_bas2 = [
		['b:hex','b:dec','b:bin',null,null,null,'t:deg','t:rad','t:grad'],
		['f:memclear3',null,null,null,'f:memplus3','f:memminus3','f:memrecall3',null,'c:exitApp'],
		['f:memclear2',null,null,null,'f:memplus2','f:memminus2','f:memrecall2',null,null],
		['f:memclear1',null,null,null,'f:memplus1','f:memminus1','f:memrecall1',null,'c:clearAll'], 
		[null,'f:ln','f:etox','f:log','f:10tox','f:log2','f:2tox',null,'c:clear'],
		[null,null,null,null,null,null,'m:/','f:sqrt','f:xsq'], 
		[null,null,null,null,null,null,'m:*','f:1/x','m:pow'],
		['c:exp','f:n!','m:%','d:1',null,null,'m:-','c:popen','c:pclose'],
		['m:and','m:or','m:xor','d:0',null,null,'m:+', null, 'c:equals'],
		['f:not','f:lsh','f:rsh',null,null,null,null,null,null]
	];
	var func_bas10 = [
		['b:hex','b:dec','b:bin',null,null,null,'t:deg','t:rad','t:grad'],
		['f:memclear3',null,null,null,'f:memplus3','f:memminus3','f:memrecall3',null,'c:exitApp'],
		['f:memclear2',null,null,null,'f:memplus2','f:memminus2','f:memrecall2',null,null],
		['f:memclear1',null,null,null,'f:memplus1','f:memminus1','f:memrecall1',null,'c:clearAll'], 
		['f:pi','f:ln','f:etox','f:log','f:10tox','f:log2','f:2tox','f:percent','c:clear'],
		['f:sin','f:cos','f:tan','d:7','d:8','d:9','m:/','f:sqrt','f:xsq'], 
		['f:asin','f:acos','f:atan','d:4','d:5','d:6','m:*','f:1/x','m:pow'],
		['c:exp','f:n!','m:%','d:1','d:2','d:3','m:-','c:popen','c:pclose'],
		['m:and','m:or','m:xor','d:0','c:period','c:sign','m:+', null, 'c:equals'],
		['f:not','f:lsh','f:rsh',null,null,null,null,null,null]
	];
	var func_bas16 = [
		['b:hex','b:dec','b:bin',null,null,null,'t:deg','t:rad','t:grad'],
		['f:memclear3',null,null,null,'f:memplus3','f:memminus3','f:memrecall3',null,'c:exitApp'],
		['f:memclear2',null,null,null,'f:memplus2','f:memminus2','f:memrecall2',null,null],
		['f:memclear1',null,null,null,'f:memplus1','f:memminus1','f:memrecall1',null,'c:clearAll'], 
		[null,'f:ln','f:etox','f:log','f:10tox','f:log2','f:2tox',null,'c:clear'],
		[null,null,null,'d:7','d:8','d:9','m:/','f:sqrt','f:xsq'], 
		[null,null,null,'d:4','d:5','d:6','m:*','f:1/x','m:pow'],
		['c:exp','f:n!','m:%','d:1','d:2','d:3','m:-','c:popen','c:pclose'],
		['m:and','m:or','m:xor','d:0',null,null,'m:+', null, 'c:equals'],
		['f:not','f:lsh','f:rsh','d:10','d:11','d:12','d:13','d:14','d:15']
	];
	
	var button = func_bas10;
	
	var buttons = [
		["BUTTON_PI","BUTTON_LN","BUTTON_EexpX","BUTTON_LOG","BUTTON_10expX","BUTTON_LOG2","BUTTON_2expX","BUTTON_%","BUTTON_CLR"],
		["BUTTON_SIN","BUTTON_COS","BUTTON_TAN","BUTTON_7","BUTTON_8","BUTTON_9","BUTTON_div","BUTTON_sqrt","BUTTON_sqr"],	
		["BUTTON_ASIN","BUTTON_ACOS","BUTTON_ATAN","BUTTON_4","BUTTON_5","BUTTON_6","BUTTON_x","BUTTON_1divx","BUTTON_xexpy"],
		["BUTTON_EE","BUTTON_N!","BUTTON_M0D","BUTTON_1" ,"BUTTON_2" ,"BUTTON_3" ,"BUTTON_-","BUTTON_(","BUTTON_)"],
		["BUTTON_AND","BUTTON_OR","BUTTON_XOR","BUTTON_0" ,"BUTTON_KOMMA","BUTTON_PL_MIN","BUTTON_PLUS",null,"BUTTON_GLEICH"],
		["BUTTON_NOT","BUTTON_LSH","BUTTON_RSH","BUTTON_A","BUTTON_B","BUTTON_C","BUTTON_D","BUTTON_E","BUTTON_F"]
	];	
	
	var getSoValue = kbook.autoRunRoot.getSoValue;
	var datPath0 = kbook.autoRunRoot.gamesSavePath+'Calc/';		
	FileSystem.ensureDirectory(datPath0);
	var datPath = datPath0+'calc.dat';	
	
	// END GLOBAL VARIABLES */
	
	target.init = function () {
		/* set translated appTitle and appIcon */
		this.appTitle.setValue(kbook.autoRunRoot._title);
		this.appIcon.u = kbook.autoRunRoot._icon;
		this.showTime();
		freshstart();
		
		/* shown gridCursor only on 300/505 */
		if (kbook.autoRunRoot.hasNumericButtons){this.gridCursor.show(true)};
		
		/* Offset for Button<->Index device-independent */
		gridDX = getSoValue(this.BUTTON_M3C,"x"); 
		gridDY = getSoValue(this.BUTTON_M3C,"y") - 50; 
	}
	
	target.exitApp = function() {
		target.saveMemories();
	    kbook.autoRunRoot.exitIf(kbook.model);
	};
	
	var format = function (val) {
		//	target.bubble("tracelog","FORMAT");   //debug
		//	return;   	//debug
		if (base == 10){
			var valStr = "" + value; //value.toString(base);
		
			if (valStr.indexOf("N")>=0 || (value == 2*value && value == 1+value))
				return "Error ";
			var i = valStr.indexOf("e")
			if (i>=0)
			{
				var expStr = valStr.substring(i+1,valStr.length);
				if (i>11) i=11;  // max 11 digits
				valStr = valStr.substring(0,i);
				if (valStr.indexOf(".")<0) valStr += ".";
				valStr += " " + expStr;
			}
			else
			{
				var valNeg = false;
				if (value < 0)
					{ value = -value; valNeg = true; }
				var valInt = Math.floor(value);
				var valFrac = value - valInt;
				var prec = digitsMaximum - (""+valInt).length - 1;	// how many digits available after period
				if (!isItThere && fixed>0)
					prec = fixed;
				var mult = " 1000000000000000000".substring(1,prec+2);
				var frac = Math.floor(valFrac * mult + 0.5);
				valInt = Math.floor(Math.floor(value * mult + .5) / mult);
				if (valNeg){
					valStr = "-" + valInt;
					value = -value;
					}
				else
					valStr = "" + valInt;
				var fracStr = "00000000000000"+frac;
				fracStr = fracStr.substring(fracStr.length-prec, fracStr.length);
				i = fracStr.length-1;
				if (isItThere || fixed==0)
				{
					// remove trailing zeros unless fixed during entry.
					while (i>=0 && fracStr.charAt(i)=="0")
						--i;
					fracStr = fracStr.substring(0,i+1);
				}
				if (i>=0) valStr += "." + fracStr;
			}
			return valStr;
		}
		else{
			var s = "";
			if (val<0 || val>valueMaximum)
				return "Error";
			if (val==0)
				return "0";
			if (base<2)
			{
				while (val && s.length < 20)
				{
					var x = val % 16;
					var d = hexdigits.charAt(x);
					val = (val-x)/16 | 0;
					var y = val % 16;
					var e = hexdigits.charAt(y);
					val = (val-y)/16 | 0;
					s = "%" + e + d + s;
				}
				s = '"' + s + '"';
				return unescape(s);
			}
			while (val && s.length < 20)
			{
				var x = val % base;
				var d = hexdigits.charAt(x);
				val = (val-x)/base | 0;
				s = "" + d + s;
			}
			return s;
			} 
	}
	
	var update = function (){
		 if(base == 10){
			var display = format(value);	  
			if (expMode){
				if (expval<0){
					display += " " + expval;
				}
				else{
					display += " +" + expval;
				}
			}
			if (display.indexOf(".")<0 && display != "Error "){
				if (isItThere || decimal>0){
					display += '.';
				}
				else{
					display += ' ';
				}
			}
			display = "               " + display;
			display = display.substring(display.length-digitsMaximum-1,display.length);
			target.CalculatorLabel.setValue(display);
		}
		else{
			value = value % valueMaximum;
			if (value<0){
				value = value + valueMaximum;
			}
			var display = format(value);
			if (isItThere){
				display += ".";
			}
			else{
				display += " ";
			}
			display = "                 " + display;
			display = display.substring(display.length-digitsMaximum-1,display.length);
			target.CalculatorLabel.setValue(display);
		} 
	  // target.bubble("tracelog","upd ende"); // debug
	}
	
	target.digitF = function (sender) {
		// this.bubble("tracelog"," "+_Core.debug.dumpToString(sender.text,"n.",2)); // debug
		// this.bubble("tracelog"," "+getSoValue(sender,"text")); // debug
		var n=parseInt(sender);
		if (isNaN(n)) // Button doCommand; param = buttonObject, Number in Object.text
			{n=parseInt(getSoValue(sender,"text"),base)}; 
		// this.bubble("tracelog","sender="+sender+" "+typeof sender); // debug
		// return;	// debug
		if(base == 10){
			// this.bubble("tracelog","base10"); // debug
			if (isItThere){
				value = 0;
				digits = 0;
				isItThere = false;
			}
			if (n==0 && digits==0 && decimal==0){
				update();
				return;
			}
			if (expMode){
				if (expval<0){
					n = -n;
				}
				if (digits < 3){
					expval = expval * 10 + n;
					++digits;
					update();
				}
				return;
			}
			if (value<0){
				n = -n;
			}
			if (digits < digitsMaximum-1){
				++digits;
				if (decimal>0){
					decimal = decimal * 10;
					value = value + (n/decimal);
					++fixed;
				}
				else{
					value = value * 10 + n;
				}
			}
			update();
		}
		else{
			if (isItThere){
				value = 0;
				digits = 0;
			}
			if (n>=base){
				return;
			}
			isItThere = false;
			if (value<0){
				n = -n;
			}
			if (digits < nhdigits){
				value = value * base + n;
				++digits;
			}
			update();
		}
	}
	
	/* this function calculates the x/y index of the selected button now device-indpended,
	   sets ScreenCursorPosition and calls doCenterF */
	target.doButtonClick = function (sender) {
		this.showTime();
		var x = getSoValue(sender,"x");
		x = (x - gridDX) / 60 ;
		var y = getSoValue(sender,"y");
		y = (y - gridDY) / 50;
		//	this.bubble("tracelog","x="+x+" y="+y); // debug 
		posX = x;
		posY = y;
		if (posY == 0) { firstY = 105} else { firstY = 205} 
		target.doCenterF(); 
	}
	
	target.doPreviousF = function() { 
		clear();
	}
	
	target.doNextF = function() { 
		equals();
	}
	
	target.doCenterF = function() {
		var  todo = button[posY][posX].split(":");
		//	this.bubble("tracelog","[0]="+todo[0]+"[1]="+todo[1]); // debug
		switch (todo[0]) {
			case "b" : {
				target.setNumberBase(todo[1]);
				break;
			}	
			case "c" : { switch (todo[1]) {
						case "clear": { 
							clear();
							break;
						}
						case "clearAll": { 
							clearAll();
							break;
						}
						case "equals": { 
							equals();
							break;
						}					
						case "exitApp": { 
							this.exitApp();
							break;
						}					
						case "exp": { 
							exp();
							break;
						}					
						case "pclose": { 
							pclose();
							break;
						}					
						case "period": { 
							period();
							break;
						}
						case "popen": { 
							popen();
							break;
						}
						case "sign": { 
							sign();
							break;
						}
					}
				break;
				}		
			case "d" : {
				this.digitF(todo[1]);
				break;
			}
			case "f" : {
				func(todo[1]);		
				break;
			}	
			case "m" : {
				mathOp(todo[1]);
				break;
			}
			case "t" : {
				target.setTrigmeth(todo[1]);
				break;
			}					
		}
	}
	
	var enter = function() {
		if(base == 10){
				if (expMode){
					value = value * Math.exp(expval * Math.LN10);
				}
				isItThere = true;
				expMode = false;
				decimal = 0;
				fixed = 0;
		}
		else{
			isItThere = true;
		}
	}
	
	var stackPushTier = function(){
		this.value = 0;
		this.prec = 0;
		this.op = "";
	}
	
	target.setNumberBase = function(b){
		// this.bubble("tracelog","base:"+b); // debug
		if ( b == "hex" || b == "dec" || b == "bin" )    {     
			target.setVariable("BASIS",b)}
		else {
			b = target.getVariable("BASIS");
			// this.bubble("tracelog","base:"+b); // debug
		}
		switch (b) {
			case 'hex': {	base=16;
					button=func_bas16;
					break; }
			case 'dec': {	base=10;
					button=func_bas10;		
					break; }
			case 'bin': {	base=2;
					button=func_bas2;		
					break; }
			default : { base=10; }		
		}
		// enable trigm only when base=10
		target.TRIGM.RBUTTON_DEG.enable(base==10);
		target.TRIGM.RBUTTON_RAD.enable(base==10);
		target.TRIGM.RBUTTON_GRAD.enable(base==10); 
		// activate/deactivate buttons/functions according base
		for (var i=0; i<6; i++)
		 for (var j=0; j<9; j++){
		  var id = buttons[i][j];
		  // target.bubble("tracelog",id ); // debug
		  if (id!=null){
			target[id].enable(button[i+4][j]!=null); 
		  }
		 } 
		equals(); 
	} 
	
	target.setTrigmeth = function(t){
			// target.bubble("tracelog",t);	// debug
			if ( t == "deg" || t == "rad" || t == "grad" )
			  {
			   target.setVariable("TRIG",t);
			   trigmeth[0].checked = (t=="deg");
			   trigmeth[1].checked = (t=="rad");
			   trigmeth[2].checked = (t=="grad");
			  }
			  /*/ can be written as
			  if ( t in { deg:1, rad:1, grad:1 } )
			  {
			   target.setVariable("TRIG",t);
			  } */  
			else {
				t = target.getVariable("TRIG");
			// this.bubble("tracelog","base:"+b); // debug
			}                     	
			if (base == 10) {angleConvert(t)}
			// target.bubble("tracelog","t="+trigmeth[0].checked+trigmeth[1].checked+trigmeth[2].checked);	// debug
	} 
	
	
	var freshstart = function () {
		var display = format(value);
		display = "               " + display;
		display = display.substring(display.length-digitsMaximum-1,display.length);
		target.CalculatorLabel.setValue(display);
		enter();
		//func ("memclearall");
		target.loadMemories();
		target.setTrigmeth("deg");
		target.setNumberBase("dec");
	
	//	initialise stack
		var i = 0;
		stack[0] = 0;
		for (i=0; i<stack.length; ++i){
			stack[i] = 0;
			stack[i] = new stackPushTier();		
		} 
	}
	
	target.showTime = function () {
		return; /* clock disabled */
		var time = new Date();
		var timeLocale = time.toLocaleTimeString();
		var show = timeLocale.substring(0, timeLocale.lastIndexOf(':'));
		target.clock1.setValue(show);
	}
	
	target.moveCursor = function (direction) {
		this.showTime();
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
				if (posY < 0) posY = 9;
			}
			if (direction == "down") {
				posY = posY + 1;
				if (posY > 9) posY = 0;
			}
			if (!(direction =="left") && posY == 8 && posX == 7) {posX++}; // double sized equal button
			if (button[posY][posX] == null) {this.moveCursor(direction)};  // jump holes
			if (posY == 0) { firstY = 105} else { firstY = 205} 
			this.drawGridCursor(posX, posY);
	}
	
	target.drawGridCursor = function (x, y) {
		this.gridCursor.changeLayout(firstX + x * curDX, undefined, undefined, firstY + y * curDY, undefined, undefined);
	}
	
	var clearAll = function(){
		stackTier = 0;
		clear();
	} 
	
	var clear = function(){
		expMode = false;
		value = 0;
		enter();
		update();
	}
	var push = function(value,op,prec){
		//	target.bubble("tracelog","Push"+value+op+prec);	// debug
		if (stackTier==maxPushLevels){
			return false;
		}
		for (i=stackTier;i>0; --i){
			stack[i].value = stack[i-1].value;
			stack[i].op = stack[i-1].op;
			stack[i].prec = stack[i-1].prec;
		}
		stack[0].value = value;
		stack[0].op = op;
		stack[0].prec = prec;
		++stackTier;
		return true;
	}
	
	var pop = function(){
		if (stackTier==0){
			return false;
		}
		for (i=0;i<stackTier; ++i){
			stack[i].value = stack[i+1].value;
			stack[i].op = stack[i+1].op;
			stack[i].prec = stack[i+1].prec;
		}
		--stackTier;
		return true;
	}
	
	var popen =  function(){
		enter();
		if (!push(0,'(',0)){
			value = "NAN";
		}
		update();
	}
	
	var pclose =  function(){
		enter();
		while (evalx())
			;
		update();
	}
	
	var mathOp = function(op) {
		enter();
		//	target.bubble("tracelog","op= "+op); // debug
		var prec = 0;
		if(base == 10){
			if (op=='+' || op=='-'){
				prec = 1;
			}
			else if (op=='*' || op=='/' || op=='%'){ // op=='%' was added (blippie)
				prec = 2;
			}
			else if (op=="pow"){
				prec = 3;
			}
			else if (op=="or" || op=='xor'){ // this statement wasn't originally here
				prec = 4;
			}
			else if (op=="and"){ // this statement wasn't originally here
				prec = 5;
			}
			else if(op=="lsh" || op=="rsh"){ // this statement wasn't originally here
				prec = 6;
			}
			if (stackTier>0 && prec <= stack[0].prec){
				evalx();
			}
			if (!push(value,op,prec)){
				value = "NAN";
			}
			update();
		}
		else{
			if (op=='+' || op=='-'){
				prec = 1;
			}
			else if (op=='*' || op=='/' || op=='%'){ // op=='%' was added (blippie)
				prec = 2;
			}
			else if(op=='pow'){
				prec = 3;
			}
			else if (op=="or" || op=='xor'){
				prec = 4; // original value: prec = 3;
			}
			else if (op=="and"){
				prec = 5; // original value: prec = 4;
			}
			else if(op=="lsh" || op=="rsh"){ // this statement wasn't originally here
				prec = 6;
			}
			else{
				value = "NAN";
			}
			if (stackTier>0 && prec <= stack[0].prec){
				evalx();
			}
			if (!push(value,op,prec)){
				value = "NAN";
			}
			update();
		}
	}
	
	var equals = function(){
		enter();
		while (stackTier>0){
			evalx();
		}
		update();
	}
	
	var sign = function (){
		if(base == 10){
			if (expMode){
				expval = -expval;
			}
			else{
				value = -value;
			}
			update();
		}
	}
	
	
	var period = function (){
		if(base == 10){
			if (isItThere){
					value = 0;
					digits = 1;
			}
			isItThere = false;
			if (decimal == 0){
					decimal = 1;
			}
			update();
		}
	}
	
	
	var exp = function (){
		if(base == 10){
			if (isItThere || expMode){
					return;
			}
			expMode = true;
			expval = 0;
			digits = 0;
			decimal = 0;
			update();
		}
	}
	
	var evalx =  function(){
	
		if (stackTier==0){
			return false;
		}
	
		var op = stack[0].op;
		var sval = stack[0].value;
		//	target.bubble("tracelog","evalx "+op+sval); // debug
	
		if (op == '+'){
			value = sval + value;
		}
	
		else if (op == '-'){
			value = sval - value;
		}
	
		else if (op == '*'){
			value = sval * value;
		}
	
		else if (op == '/'){
			value = sval / value;
		}
	
		else if (op == '%'){
			value = sval % value;
		}
	
		else if (op == 'pow'){
			value = Math.pow(sval,value);
		}
	
		else if(op == "and"){
			value = sval & value;
		}
	
		else if(op == "or"){
			value = sval | value;
		}
	
		else if(op == "xor"){
			value = sval ^ value;
		}
	
		else if(op == "lsh"){
			value = sval << value;
		}
	
		else if(op == "rsh"){
			value = sval >> value;
		}
	
		pop();
		if (op=='(')
			return false;
		return true;
	}
	
	
	var func = function (f){
		enter();
		//target.bubble("tracelog","f= "+f); // debug
	
		if (f=="percent"){ // behave like old TI-Calculators
			var op = stack[0].op;
			var sval = stack[0].value;
			//target.bubble("tracelog","op= " + op); // debug
			//target.bubble("tracelog","value= " + sval); // debug
			if (op == '+' || op =='-') {
				value = sval * value / 100;	
			} 
			else {
				value = value/100;
			}
		}
		
		else if (f=="1/x"){
			value = 1/value;
		}
	
		else if (f=="n!"){
			value = Math.floor(value);
	
			if (value<0 || value>200){
				value = "NAN";
			}
	
			else{
				var n = 1;
				var i;
				for (i=1;i<=value;++i){
					n *= i;
				}
			}
	
			value = n;
		}
	
		else  if(f=="memclearall"){
			target.Meminput1.setValue(0);
			target.Meminput2.setValue(0);
			target.Meminput3.setValue(0);
			//memform.meminput4.value = "";
			//memform.meminput5.value = "";
		}
	
		else if(f=="memplus1"){
			target.Meminput1.setValue(target.Meminput1.getValue()*1+value);
		}
		else if(f=="memminus1"){
			target.Meminput1.setValue(target.Meminput1.getValue()*1-value);
		}
		else if(f=="memrecall1"){
			value = parseFloat(target.Meminput1.getValue());
		}
		else if(f=="memclear1"){
			target.Meminput1.setValue(0);
		}
		else if(f=="memplus2"){
			target.Meminput2.setValue(target.Meminput2.getValue()*1+value);
		}
		else if(f=="memminus2"){
			target.Meminput2.setValue(target.Meminput2.getValue()*1-value);
		}
		else if(f=="memrecall2"){
			value = parseFloat(target.Meminput2.getValue());
		}
		else if(f=="memclear2"){
			target.Meminput2.setValue(0);
		}
		else if(f=="memplus3"){
			target.Meminput3.setValue(target.Meminput3.getValue()*1+value);
		}
		else if(f=="memminus3"){
			target.Meminput3.setValue(target.Meminput3.getValue()*1-value);
		}	
		else if(f=="memrecall3"){
			value = parseFloat(target.Meminput3.getValue());
		}
		else if(f=="memclear3"){
			target.Meminput3.setValue(0);
		}
		/*
		else if(f=="memplus4"){
			memform.meminput4.value = value;
		}
		else if(f=="memrecall4"){
			value = parseFloat(memform.meminput4.value);
		}
		else if(f=="memclear4"){
			memform.meminput4.value = "";
		}
		else if(f=="memplus5"){
			memform.meminput5.value = value;
		}
		else if(f=="memrecall5"){
			value = parseFloat(memform.meminput5.value);
		}
		else if(f=="memclear5"){
			memform.meminput5.value = "";
		}
		*/	
		else if(f=="sin"){
			// if "Deg" is checked...
			if(trigmeth[0].checked){
				value = Math.sin(value * Math.PI / 180);
			}
			// if "Rad" is checked...
			else if(trigmeth[1].checked){
				value = Math.sin(value);
			}
			// if "Grad" is checked...
			else if(trigmeth[2].checked){
				value = Math.sin(value * Math.PI / 200);
			}
		}
		else if (f=="cos"){
			// if "Deg" is checked...
			if(trigmeth[0].checked){
				value = Math.cos(value * Math.PI / 180);
			}
			// if "Rad" is checked...
			else if(trigmeth[1].checked){
				value = Math.cos(value);
			}
			// if "Grad" is checked...
			else if(trigmeth[2].checked){
				value = Math.cos(value * Math.PI / 200);
			}
		}
		else if (f=="tan"){
			// if "Deg" is checked...
			if(trigmeth[0].checked){
				value = Math.tan(value * Math.PI / 180);
			}
			// if "Rad" is checked...
			else if(trigmeth[1].checked){
				value = Math.tan(value);
			}
			// if "Grad" is checked...
			else if(trigmeth[2].checked){
				value = Math.tan(value * Math.PI / 200);
			}
		}
		else if (f=="log"){
			value = Math.log(value)/Math.LN10;
		}
		else if (f=="log2"){
			value = Math.log(value)/Math.LN2;
		}
		else if (f=="ln"){
			value = Math.log(value);
		}
		else if (f=="sqrt"){
			value = Math.sqrt(value);
		}
		else if (f=="lsh"){
			value = value << 1;
		}
		else if (f=="rsh"){
			value = value >> 1;
		}
		else if (f=="pi"){
			value = Math.PI;
		}
		else if (f=="acos"){
			// if "Deg" is checked...
			if(trigmeth[0].checked){
				value = Math.acos(value) * (180 / Math.PI);
			}
			// if "Rad" is checked...
			else if(trigmeth[1].checked){
				value = Math.acos(value);
			}
			// if "Grad" is checked...
			else if(trigmeth[2].checked){
				value = Math.acos(value) * (200 / Math.PI);
			}
		}
		else if(f=="asin"){
			// if "Deg" is checked...
			if(trigmeth[0].checked){
				value = Math.asin(value) * (180 / Math.PI);
			}
			// if "Rad" is checked...
			else if(trigmeth[1].checked){
				value = Math.asin(value);
			}
			// if "Grad" is checked...
			else if(trigmeth[2].checked){
				value = Math.asin(value) * (200 / Math.PI);
			}
		}
		else if(f=="atan"){
			// if "Deg" is checked...
			if(trigmeth[0].checked){
				value = Math.atan(value) * (180 / Math.PI);
			}
			// if "Rad" is checked...
			else if(trigmeth[1].checked){
				value = Math.atan(value);
			}
			// if "Grad" is checked...
			else if(trigmeth[2].checked){
				value = Math.atan(value) * (200 / Math.PI);
			}
		}
		else if(f=="10tox"){
			value = Math.exp(value * Math.LN10);
		}
		else if(f=="etox"){
			value = Math.exp(value);
		}
		else if(f=="2tox"){
			value = Math.exp(value * Math.LN2);
		}
		else if(f=="xsq"){
			value = value*value;
		}
		else if(f=="not"){
			value = ~ value;
		}
		update();
	}
	
	
	var checkbase= function(e) {
		if(e >= base){
			return false;
		}
		else{
			return true;
		}
	}
	
	var angleConvert = function(e){
		if (e == "deg"){
			if (angleMeasure == "rad"){
				value = (180 / Math.PI) * value;
			}
			else if (angleMeasure == "grad"){
				value = (180 / 200) * value;
			}
			angleMeasure = "deg";
		}
		else if (e == "rad"){
			if (angleMeasure == "deg"){
				value = (Math.PI / 180) * value;
			}
			else if (angleMeasure == "grad"){
				value = (Math.PI / 200) * value;
			}
			angleMeasure = "rad";
		}
		else if (e == "grad"){
			if (angleMeasure == "deg"){
				value = (200 / 180) * value;
			}
			else if (angleMeasure == "rad"){
				value = (200 / Math.PI) * value;
			}
			angleMeasure = "grad";
		}
		equals();
	}
	
	target.loadMemories = function() {
		// load previous contents of memories (if they exist)
		try {
			if (FileSystem.getFileInfo(datPath)) {
				var stream = new Stream.File(datPath);
				var tempnum = stream.readLine();
				target.Meminput1.setValue(tempnum);
				tempnum = stream.readLine();
				target.Meminput2.setValue(tempnum);
				tempnum = stream.readLine();
				target.Meminput3.setValue(tempnum);
				stream.close();			
			} else {
				func ("memclearall");
			}
		}  catch (e) { func ("memclearall"); }
	}
	
	target.saveMemories = function() {
		// save current contents of memories
		try {
			if (FileSystem.getFileInfo(datPath)) FileSystem.deleteFile(datPath);
			stream = new Stream.File(datPath, 1);
			stream.writeLine(target.Meminput1.getValue());
			stream.writeLine(target.Meminput2.getValue());
			stream.writeLine(target.Meminput3.getValue());
			stream.close();
		} catch (e) { }
	}
};
tmp();
tmp = undefined;

