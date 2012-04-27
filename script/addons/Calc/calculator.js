// Description: js functions for calculator; borrowed/lend from http://www.motionnet.com/calculator/
// History:
//	2010-06-05 Mark Nord - initial release - public beta
//	2010-08-23 Mark Nord - Buttons enabled, should work on PRS 600 too
//	2010-12-05 Mark Nord - translations and custom icon enabled, button-index-computed  device independent
//	2011-03-01 kartu - Moved into a function, to allow variable name optimizations
//	2011-05-20 Mark Nord - fixed input of digits like 0.0x
//	2011-11-25 Ben Chenoweth - contents of memory cells now saved and loaded
//	2012-04-23 drMerry - started with optimizing
//	2012-04-26 drMerry - more optimizations applied
//		Chosen for speed over readability

var tmp = function () {
	// GLOBAL VARIABLES
	var digitsMaximum = 16,
		pi = Math.PI,
		pi200 = 200 / pi,
		pi180 = 180 / pi,
		pidiv180 = pi / 180,
		pidiv200 = pi / 200,
		maxPushLevels = 12,
		nhdigits = 8,
		valueMaximum = 4294967296,
		hexdigits = String("0123456789ABCDEF"),
		stack = new Array(maxPushLevels),
		angleMeasure = "deg",
		value = 0,
		stackTier = 0,
		isItThere = true,
		decimal = 0,
		fixed = 0,
		expMode = false,
		expval = 0,
		base = 10,
		firstX = 42,
		firstY = 205,
		// 255-curDY
		curDX = 60,
		curDY = 50,
		posX = 8,
		posY = 8,
		isbase10 = true,
		disp = ['NAN', '.', ' ', '                 ', 'Error ', '               '],
		display = '',
		gridDX,
		gridDY,
		digits,
		trigmeth = [
			[{checked: true}],
			[{checked: false}],
			[{checked: false}]
		],
		row_0 = ['b:hex', 'b:dec', 'b:bin', null, null, null, 't:deg', 't:rad', 't:grad'],
		row_1 = ['f:memclear3', null, null, null, 'f:memplus3', 'f:memminus3', 'f:memrecall3', null, 'c:exitApp'],
		row_2 = ['f:memclear2', null, null, null, 'f:memplus2', 'f:memminus2', 'f:memrecall2', null, null],
		row_3 = ['f:memclear1', null, null, null, 'f:memplus1', 'f:memminus1', 'f:memrecall1', null, 'c:clearAll'],
		row_4 = [null, 'f:ln', 'f:etox', 'f:log', 'f:10tox', 'f:log2', 'f:2tox', null, 'c:clear'],
		row_4_2 = ['f:pi', 'f:ln', 'f:etox', 'f:log', 'f:10tox', 'f:log2', 'f:2tox', 'f:percent', 'c:clear'],
		row_5 = [null, null, null, null, null, null, 'm:/', 'f:sqrt', 'f:xsq'],
		row_5_2 = ['f:sin', 'f:cos', 'f:tan', 'd:7', 'd:8', 'd:9', 'm:/', 'f:sqrt', 'f:xsq'],
		row_5_3 = [null, null, null, 'd:7', 'd:8', 'd:9', 'm:/', 'f:sqrt', 'f:xsq'],
		row_6 = [null, null, null, null, null, null, 'm:*', 'f:1/x', 'm:pow'],
		row_6_2 = ['f:asin', 'f:acos', 'f:atan', 'd:4', 'd:5', 'd:6', 'm:*', 'f:1/x', 'm:pow'],
		row_6_3 = [null, null, null, 'd:4', 'd:5', 'd:6', 'm:*', 'f:1/x', 'm:pow'],
		row_7 = ['c:exp', 'f:n!', 'm:%', 'd:1', null, null, 'm:-', 'c:popen', 'c:pclose'],
		row_7_2 = ['c:exp', 'f:n!', 'm:%', 'd:1', 'd:2', 'd:3', 'm:-', 'c:popen', 'c:pclose'],
		row_8 = ['m:and', 'm:or', 'm:xor', 'd:0', null, null, 'm:+', null, 'c:equals'],
		row_8_2 = ['m:and', 'm:or', 'm:xor', 'd:0', 'c:period', 'c:sign', 'm:+', null, 'c:equals'],
		row_9 = ['f:not', 'f:lsh', 'f:rsh', null, null, null, null, null, null],
		row_9_2 = ['f:not', 'f:lsh', 'f:rsh', 'd:10', 'd:11', 'd:12', 'd:13', 'd:14', 'd:15'],
		func_bas2 = [
			row_0,
			row_1,
			row_2,
			row_3,
			row_4,
			row_5,
			row_6,
			row_7,
			row_8,
			row_9
		],
		func_bas10 = [
			row_0,
			row_1,
			row_2,
			row_3,
			row_4_2,
			row_5_2,
			row_6_2,
			row_7_2,
			row_8_2,
			row_9
		],
		func_bas16 = [
			row_0,
			row_1,
			row_2,
			row_3,
			row_4,
			row_5_3,
			row_6_3,
			row_7_2,
			row_8,
			row_9_2
		],
		button = func_bas10,
		buttons = [
			["BUTTON_PI", "BUTTON_LN", "BUTTON_EexpX", "BUTTON_LOG", "BUTTON_10expX", "BUTTON_LOG2", "BUTTON_2expX", "BUTTON_%", "BUTTON_CLR"],
			["BUTTON_SIN", "BUTTON_COS", "BUTTON_TAN", "BUTTON_7", "BUTTON_8", "BUTTON_9", "BUTTON_div", "BUTTON_sqrt", "BUTTON_sqr"],
			["BUTTON_ASIN", "BUTTON_ACOS", "BUTTON_ATAN", "BUTTON_4", "BUTTON_5", "BUTTON_6", "BUTTON_x", "BUTTON_1divx", "BUTTON_xexpy"],
			["BUTTON_EE", "BUTTON_N!", "BUTTON_M0D", "BUTTON_1", "BUTTON_2", "BUTTON_3", "BUTTON_-", "BUTTON_(", "BUTTON_)"],
			["BUTTON_AND", "BUTTON_OR", "BUTTON_XOR", "BUTTON_0", "BUTTON_KOMMA", "BUTTON_PL_MIN", "BUTTON_PLUS", null, "BUTTON_GLEICH"],
			["BUTTON_NOT", "BUTTON_LSH", "BUTTON_RSH", "BUTTON_A", "BUTTON_B", "BUTTON_C", "BUTTON_D", "BUTTON_E", "BUTTON_F"]
		],
		getSoValue = kbook.autoRunRoot.getSoValue,
		datPath0 = kbook.autoRunRoot.gamesSavePath + 'Calc/',
		datPath,
	// END GLOBAL VARIABLES */

		setbase = function (nb) {
			isbase10 = (nb === 10);
			base = nb;
		},

		enter = function () {
			if (isbase10) {
				if (expMode) {
					value = value * Math.exp(expval * Math.LN10);
				}
				isItThere = true;
				expMode = false;
				decimal = 0;
				fixed = 0;
			} else { isItThere = true; }
		},

		format = function (val) {
			//	target.bubble("tracelog","FORMAT");   //debug
			//	return;		//debug
			var valStr, i, expStr, valNeg, valInt, valFrac, prec, mult, frac,
				s = "", x, d, fracStr; //get var out of loop JS has function scope, no block scope so all vars can be at start of function to speed up process.
			if (isbase10) {
				valStr = String(value); //value.toString(base);

				if (valStr.indexOf("N") >= 0 || (value === 2 * value && value === 1 + value)) {return disp[4]; }
				i = valStr.indexOf("e");
				if (i >= 0) {
					expStr = valStr.substring(i + 1, valStr.length);
					if (i > 11) {i = 11; }  // max 11 digits
					valStr = valStr.substring(0, i);
					if (valStr.indexOf(disp[1]) < 0) { valStr += disp[1]; }
					valStr += disp[2] + expStr;
				} else {
					valNeg = false;
					if (value < 0) { value = -value; valNeg = true; }
					valInt = Math.floor(value);
					valFrac = value - valInt;
					prec = digitsMaximum - String(valInt).length - 1;	// how many digits available after period
					if (!isItThere && fixed > 0) { prec = fixed; }
					mult = " 1000000000000000000".substring(1, prec + 2);
					frac = Math.floor(valFrac * mult + 0.5);
					valInt = Math.floor(Math.floor(value * mult + 0.5) / mult);
					if (valNeg) {
						valStr = "-" + valInt;
						value = -value;
					} else { valStr = String(valInt); }
					fracStr = "00000000000000" + frac;
					fracStr = fracStr.substring(fracStr.length - prec, fracStr.length);
					i = fracStr.length - 1;
					if (isItThere || fixed === 0) {
						// remove trailing zeros unless fixed during entry.
						while (i >= 0 && fracStr.charAt(i) === "0") { --i; }
						fracStr = fracStr.substring(0, i + 1);
					}
					if (i >= 0) { valStr += disp[1] + fracStr; }
				}
				return valStr;
			} else {
				s = "";
				if (val < 0 || val > valueMaximum) { return disp[4]; }
				if (val === 0) { return "0"; }
				// if (base < 2) { // will never run while base is 2, 10 or 16
					// while (val && s.length < 20) {
						// x = val % 16;
						// d = hexdigits.charAt(x);
						// val = (val - x) / 16 | 0;
						// y = val % 16;
						// e = hexdigits.charAt(y);
						// val = (val - y) / 16 | 0;
						// s = "%" + e + d + s;
					// }
					// s = '"' + s + '"';
					// return unescape(s);
				// }
				while (val && s.length < 20) {
					x = val % base;
					d = hexdigits.charAt(x);
					val = (val - x) / base | 0;
					s = String(d) + s;
				}
				return s;
			}
		},

		update = function () {
			var digMax = digitsMaximum - 1;
			if (isbase10) {
				display = format(value);
				if (expMode) {
					if (expval < 0) {
						display += disp[2] + expval;
					} else {
						display += " +" + expval;
					}
				}
				if (display.indexOf(disp[1]) < 0 && display !== disp[4]) {
					if (isItThere || decimal > 0) {
						display += disp[1];
					} else {
						display += disp[2];
					}
				}
				display = disp[5] + display;
			} else {
				value = value % valueMaximum;
				if (value < 0) {
					value = value + valueMaximum;
				}
				display = format(value);
				if (isItThere) {
					display += disp[1];
				} else {
					display += disp[2];
				}
				display = disp[3] + display;
			}
			display = display.substring(display.length - digMax, display.length);
			target.CalculatorLabel.setValue(display);
		  // target.bubble("tracelog","upd ende"); // debug
		},

		clear = function () {
			expMode = false;
			value = 0;
			enter();
			update();
		},

		clearAll = function () {
			stackTier = 0;
			clear();
		},

		push = function (value, op, prec) {
			//	target.bubble("tracelog","Push"+value+op+prec);	// debug
			if (stackTier === maxPushLevels) {
				return false;
			}
			var i = stackTier, j;
			for (i; i > 0; --i) {
				j = i - 1;
				stack[i].value = stack[j].value;
				stack[i].op = stack[j].op;
				stack[i].prec = stack[j].prec;
			}
			stack[0].value = value;
			stack[0].op = op;
			stack[0].prec = prec;
			++stackTier;
			return true;
		},

		popen =  function () {
			enter();
			if (!push(0, '(', 0)) {
				value = disp[0];
			}
			update();
		},

		pop = function () {
			if (stackTier === 0) {
				return false;
			}
			var i = 0, j;
			for (i; i < stackTier; ++i) {
				j = i + 1;
				stack[i].value = stack[j].value;
				stack[i].op = stack[j].op;
				stack[i].prec = stack[j].prec;
			}
			--stackTier;
			return true;
		},

		evalx =  function () {
			if (stackTier === 0) {
				return false;
			}
			var op = stack[0].op,
				sval = stack[0].value;
			//	target.bubble("tracelog","evalx "+op+sval); // debug
			switch (op) {
			case '+':
				value = sval + value;
				break;
			case '-':
				value = sval - value;
				break;
			case '*':
				value = sval * value;
				break;
			case '/':
				value = sval / value;
				break;
			case '%':
				value = sval % value;
				break;
			case 'pow':
				value = Math.pow(sval, value);
				break;
			case 'and':
				value = sval & value;
				break;
			case 'or':
				value = sval | value;
				break;
			case 'xor':
				value = sval ^ value;
				break;
			case 'lsh':
				value = sval << value;
				break;
			case 'rsh':
				value = sval >> value;
				break;
			}
			pop();
			if (op === '(') {
				return false;
			}
			return true;
		},

		pclose =  function () {
			enter();
			while (evalx()) {/*intentional blank???*/}
			update();
		},

		mathOp = function (op) {
			enter();
			//	target.bubble("tracelog","op= "+op); // debug
			var prec = 0;
			switch (op) {
			case '+':
			case '-':
				prec = 1;
				break;
			case '*':
			case '/':
			case '%':  // op=='%' was added (blippie)
				prec = 2;
				break;
			case 'pow':
				prec = 3;
				break;
			case 'or':
			case 'xor':
				prec = 4; // original value: prec = 3;
				break;
			case 'and':
				prec = 5; // original value: prec = 4;
				break;
			case 'lsh':
			case 'rsh':  // this statement wasn't originally here
				prec = 6;
				break;
			default:
				if (!isbase10) {
					value = disp[0];
				}
			}
			if (stackTier > 0 && prec <= stack[0].prec) {
				evalx();
			}
			if (!push(value, op, prec)) {
				value = disp[0];
			}
			update();
		},

		equals = function () {
			enter();
			while (stackTier > 0) {
				evalx();
			}
			update();
		},

		sign = function () {
			if (isbase10) {
				if (expMode) {
					expval = -expval;
				} else {
					value = -value;
				}
				update();
			}
		},

		period = function () {
			if (isbase10) {
				if (isItThere) {
					value = 0;
					digits = 1;
				}
				isItThere = false;
				if (decimal === 0) {
					decimal = 1;
				}
				update();
			}
		},

		exp = function () {
			if (isbase10) {
				if (isItThere || expMode) {
					return;
				}
				expMode = true;
				expval = 0;
				digits = 0;
				decimal = 0;
				update();
			}
		},

		decval = function (dv) {
			return parseInt(dv, 10);
		},

		func = function (f) {
			enter();
			//target.bubble("tracelog","f= "+f); // debug
			var op, n, sval, i, trigmeth0 = trigmeth[0].checked, trigmeth1 = trigmeth[1].checked, onepercent = value / 100, valXpi180, valXpi200;
			//trigmeth2 = trigmeth[2].checked = inherent. if 0 or 1 are true this is false, else true
			if (f === 'cos' || f === 'sin' || f === 'tan' || f === 'acos' || f === 'asin' || f === 'atan') {
				valXpi180 = value * pidiv180;
				valXpi200 = value * pidiv200;
				switch (f) {
				case 'sin':
					if (trigmeth0) {
						// if "Deg" is checked...
						value = Math.sin(valXpi180);
					} else if (trigmeth1) {
						// if "Rad" is checked...
						value = Math.sin(value);
					} else {
						// if "Grad" is checked...
						value = Math.sin(valXpi200);
					}
					break;
				case 'cos':
					if (trigmeth0) {
						// if "Deg" is checked...
						value = Math.cos(valXpi180);
					} else if (trigmeth1) {
						// if "Rad" is checked...
						value = Math.cos(value);
					} else {
						// if "Grad" is checked...
						value = Math.cos(valXpi200);
					}
					break;
				case 'tan':
					if (trigmeth0) {
						// if "Deg" is checked...
						value = Math.tan(valXpi180);
					} else if (trigmeth1) {
						// if "Rad" is checked...
						value = Math.tan(value);
					} else {
						// if "Grad" is checked...
						value = Math.tan(valXpi200);
					}
					break;
				case 'acos':
					if (trigmeth0) {
						// if "Deg" is checked...
						value = Math.acos(value) * pi180;
					} else if (trigmeth1) {
						// if "Rad" is checked...
						value = Math.acos(value);
					} else {
						// if "Grad" is checked...
						value = Math.acos(value) * pi200;
					}
					break;
				case 'asin':
					if (trigmeth0) {
						// if "Deg" is checked...
						value = Math.asin(value) * pi180;
					} else if (trigmeth1) {
						// if "Rad" is checked...
						value = Math.asin(value);
					} else {
						// if "Grad" is checked...
						value = Math.asin(value) * pi200;
					}
					break;
				case 'atan':
					if (trigmeth0) {
						// if "Deg" is checked...
						value = Math.atan(value) * pi180;
					} else if (trigmeth1) {
						// if "Rad" is checked...
						value = Math.atan(value);
					} else {
						// if "Grad" is checked...
						value = Math.atan(value) * pi200;
					}
					break;
				}
			} else {
				switch (f) {
				case 'percent': // behave like old TI-Calculators
					op = stack[0].op;
					sval = stack[0].value;
					//target.bubble("tracelog","op= " + op); // debug
					//target.bubble("tracelog","value= " + sval); // debug
					if (op === '+' || op === '-') {
						value = sval * onepercent;
					} else {
						value = onepercent;
					}
					break;
				case '1/x':
					value = 1 / value;
					break;
				case 'n!':
					value = Math.floor(value);
					if (value < 0 || value > 200) {
						value = disp[0];
					} else {
						n = 1;
						i = 1;
						for (i; i <= value; ++i) {
							n *= i;
						}
						// Value needs to be inside the else}
						value = n;
					}
					break;
				case 'memclearall':
					target.Meminput1.setValue(0);
					target.Meminput2.setValue(0);
					target.Meminput3.setValue(0);
					//memform.meminput4.value = "";
					//memform.meminput5.value = "";
					break;
				case 'memplus1':
					target.Meminput1.setValue(decval(target.Meminput1.getValue()) + value);
					break;
				case 'memminus1':
					target.Meminput1.setValue(decval(target.Meminput1.getValue()) - value);
					break;
				case 'memrecall1':
					value = parseFloat(target.Meminput1.getValue());
					break;
				case 'memclear1':
					target.Meminput1.setValue(0);
					break;
				case 'memplus2':
					target.Meminput2.setValue(decval(target.Meminput2.getValue()) + value);
					break;
				case 'memminus2':
					target.Meminput2.setValue(decval(target.Meminput2.getValue()) - value);
					break;
				case 'memrecall2':
					value = parseFloat(target.Meminput2.getValue());
					break;
				case 'memclear2':
					target.Meminput2.setValue(0);
					break;
				case 'memplus3':
					target.Meminput3.setValue(decval(target.Meminput3.getValue()) + value);
					break;
				case 'memminus3':
					target.Meminput3.setValue(decval(target.Meminput3.getValue()) - value);
					break;
				case 'memrecall3':
					value = parseFloat(target.Meminput3.getValue());
					break;
				case 'memclear3':
					target.Meminput3.setValue(0);
					break;
					/*
					else if (f === "memplus4") {
						memform.meminput4.value = value;
					}
					else if (f === "memrecall4") {
						value = parseFloat(memform.meminput4.value);
					}
					else if (f === "memclear4") {
						memform.meminput4.value = "";
					}
					else if (f === "memplus5") {
						memform.meminput5.value = value;
					}
					else if (f === "memrecall5") {
						value = parseFloat(memform.meminput5.value);
					}
					else if (f === "memclear5") {
						memform.meminput5.value = "";
					}
					*/
				case 'log':
					value = Math.log(value) / Math.LN10;
					break;
				case 'log2':
					value = Math.log(value) / Math.LN2;
					break;
				case 'ln':
					value = Math.log(value);
					break;
				case 'sqrt':
					value = Math.sqrt(value);
					break;
				case 'lsh':
					value = value << 1;
					break;
				case 'rsh':
					value = value >> 1;
					break;
				case 'pi':
					value = pi;
					break;
				case '10tox':
					value = Math.exp(value * Math.LN10);
					break;
				case 'etox':
					value = Math.exp(value);
					break;
				case '2tox':
					value = Math.exp(value * Math.LN2);
					break;
				case 'xsq':
					value *= value;
					break;
				case 'not':
					value = ~value;
					break;
				}
			}
			update();
		},

		// checkbase = function (e) { //unused
			// if (e >= base) {
				// return false;
			// } else {
				// return true;
			// }
		// },

		angleConvert = function (e) {
			var angleRad = angleMeasure === "rad", angleDeg = angleMeasure === "deg", angleGra = angleMeasure === "grad";
			switch (e) {
			case 'deg':
				if (angleGra) {
					value = pi180 * value;
				} else if (angleMeasure === "grad") {
					value = (180 / 200) * value;
				}
				//angleMeasure = "deg";
				break;
			case 'rad':
				if (angleDeg) {
					value = pidiv180 * value;
				} else if (angleGra) {
					value = pidiv200 * value;
				}
				//angleMeasure = "rad";
				break;
			case 'grad':
				if (angleDeg) {
					value = (200 / 180) * value;
				} else if (angleRad) {
					value = pi200 * value;
				}
				//angleMeasure = "grad";
				break;
			}
			angleMeasure = e;
			equals();
		},

		StackPushTier = function () {
			this.value = 0;
			this.prec = 0;
			this.op = "";
		},


		freshstart = function () {
			var i;
			display = format(value);
			display = disp[5] + display;
			display = display.substring(display.length - digitsMaximum - 1, display.length);
			target.CalculatorLabel.setValue(display);
			enter();
			//func ("memclearall");
			target.loadMemories();
			target.setTrigmeth("deg");
			target.setNumberBase("dec");

		//	initialise stack
			stack[0] = 0;
			i = 0;
			for (i; i < stack.length; ++i) {
				stack[i] = 0;
				stack[i] = new StackPushTier();
			}
		};

	target.init = function () {
		/* set translated appTitle and appIcon */
		this.appTitle.setValue(kbook.autoRunRoot._title);
		this.appIcon.u = kbook.autoRunRoot._icon;
		//this.showTime(); //Function disabled
		freshstart();

		/* shown gridCursor only on 300/505 */
		if (kbook.autoRunRoot.hasNumericButtons) {this.gridCursor.show(true); }

		/* Offset for Button<->Index device-independent */
		gridDX = getSoValue(this.BUTTON_M3C, "x");
		gridDY = getSoValue(this.BUTTON_M3C, "y") - 50;
	};

	target.exitApp = function () {
		target.saveMemories();
		kbook.autoRunRoot.exitIf(kbook.model);
	};

	target.digitF = function (sender) {
		// this.bubble("tracelog"," "+_Core.debug.dumpToString(sender.text,"n.",2)); // debug
		// this.bubble("tracelog"," "+getSoValue(sender,"text")); // debug
		var n = decval(sender);
		if (isNaN(n)) {// Button doCommand; param = buttonObject, Number in Object.text
			n = parseInt(getSoValue(sender, "text"), base);
		}
		// this.bubble("tracelog","sender="+sender+" "+typeof sender); // debug
		// return;	// debug
		if (isbase10) {
			// this.bubble("tracelog","base10"); // debug
			if (isItThere) {
				value = 0;
				digits = 0;
				isItThere = false;
			}
			if (n === 0 && digits === 0 && decimal === 0) {
				update();
				return;
			}
			if (expMode) {
				if (expval < 0) {
					n = -n;
				}
				if (digits < 3) {
					expval = expval * 10 + n;
					++digits;
					update();
				}
				return;
			}
			if (value < 0) {
				n = -n;
			}
			if (digits < digitsMaximum - 1) {
				++digits;
				if (decimal > 0) {
					decimal = decimal * 10;
					value = value + (n / decimal);
					++fixed;
				} else {
					value = value * 10 + n;
				}
			}
			//update();
		} else {
			if (isItThere) {
				value = 0;
				digits = 0;
			}
			if (n >= base) { return; }
			isItThere = false;
			if (value < 0) {
				n = -n;
			}
			if (digits < nhdigits) {
				value = value * base + n;
				++digits;
			}
			//update();
		}
		update(); //if and else both use it
	};

	/* this function calculates the x/y index of the selected button now device-indpended,
	   sets ScreenCursorPosition and calls doCenterF */
	target.doButtonClick = function (sender) {
		//this.showTime(); //Function Disabled
		var x = getSoValue(sender, "x"), y = getSoValue(sender, "y");
		x = (x - gridDX) / 60;
		y = (y - gridDY) / 50;
		//	this.bubble("tracelog","x="+x+" y="+y); // debug
		posX = x;
		posY = y;
		if (posY === 0) { firstY = 105; } else { firstY = 205; }
		target.doCenterF();
	};

	target.doPreviousF = function () { clear(); };
	target.doNextF = function () { equals(); };

	target.doCenterF = function () {
		var todo = button[posY][posX].split(":");
		//	this.bubble("tracelog","[0]="+todo[0]+"[1]="+todo[1]); // debug
		switch (todo[0]) {
		case 'b':
			target.setNumberBase(todo[1]);
			break;
		case 'c':
			switch (todo[1]) {
			case 'clear':
				clear();
				break;
			case 'clearAll':
				clearAll();
				break;
			case 'equals':
				equals();
				break;
			case 'exitApp':
				this.exitApp();
				break;
			case 'exp':
				exp();
				break;
			case 'pclose':
				pclose();
				break;
			case 'period':
				period();
				break;
			case 'popen':
				popen();
				break;
			case 'sign':
				sign();
				break;
			}
			break;
		case 'd':
			this.digitF(todo[1]);
			break;
		case 'f':
			func(todo[1]);
			break;
		case 'm':
			mathOp(todo[1]);
			break;
		case 't':
			target.setTrigmeth(todo[1]);
			break;
		}
	};

	target.setNumberBase = function (b) {
		// this.bubble("tracelog","base:"+b); // debug
		if (b === "hex" || b === "dec" || b === "bin") {
			target.setVariable("BASIS", b);
		} else {
			b = target.getVariable("BASIS");
			// this.bubble("tracelog","base:"+b); // debug
		}
		switch (b) {
		case 'hex':
			setbase(16);
			button = func_bas16;
			break;
		// case 'dec': 
			// base = 10;
			// button = func_bas10;
			// break;
		case 'bin':
			setbase(2);
			button = func_bas2;
			break;
		default: //equals case 'dec'
			setbase(10);
			button = func_bas10;
		}
		// enable trigm only when base=10
		var i, j, k, id;
		target.TRIGM.RBUTTON_DEG.enable(isbase10);
		target.TRIGM.RBUTTON_RAD.enable(isbase10);
		target.TRIGM.RBUTTON_GRAD.enable(isbase10);
		// activate/deactivate buttons/functions according base
		i = 0;
		for (i; i < 6; i++) {
			k = i + 4;
			j = 0;
			for (j; j < 9; j++) {
				id = buttons[i][j];
				// target.bubble("tracelog",id ); // debug
				if (id !== null) {
					target[id].enable(button[k][j] !== null);
				}
			}
		}
		equals();
	};

	target.setTrigmeth = function (t) {
		// target.bubble("tracelog",t);	// debug
		if (t === "deg" || t === "rad" || t === "grad") {
			target.setVariable("TRIG", t);
			trigmeth[0].checked = (t === "deg");
			trigmeth[1].checked = (t === "rad");
			trigmeth[2].checked = (t === "grad");
		  /*/ can be written as
			  if ( t in { deg:1, rad:1, grad:1 } )
		  {
		   target.setVariable("TRIG",t);
		  } */
		} else {
			t = target.getVariable("TRIG");
		// this.bubble("tracelog","base:"+b); // debug
		}
		if (isbase10) {angleConvert(t); }
		// target.bubble("tracelog","t="+trigmeth[0].checked+trigmeth[1].checked+trigmeth[2].checked);	// debug
	};

	/*target.showTime = function () {
		return; / * clock disabled * /
		var time = new Date(), 
		timeLocale = time.toLocaleTimeString(),
		show = timeLocale.substring(0, timeLocale.lastIndexOf(':'));
		target.clock1.setValue(show);/ ** /
	};*/

	target.moveCursor = function (direction) {
		//this.showTime(); //Function disabled
		switch (direction) {
		case 'w': //west AKA right
			posX = (posX + 1) % 9;
			//if (posX > 8) {posX = 0; }
			break;
		case 'e': //east AKA left
			posX = (posX + 10) % 9;
			//if (posX < 0) {posX = 8; }
			break;
		case 'n': //north AKA up
			posY = (posY + 11) % 10;
			//if (posY < 0) {posY = 9; }
			break;
		case 's': //south AKA down
			posY = (posY + 1) % 10;
			//if (posY > 9) {posY = 0; }
			break;
		}
		if ((direction !== "e") && posY === 8 && posX === 7) {posX++; } // double sized equal button
		if (button[posY][posX] === null) {this.moveCursor(direction); }  // jump holes
		if (posY === 0) { firstY = 105; } else { firstY = 205; }
		this.drawGridCursor(posX, posY);
	};

	target.drawGridCursor = function (x, y) {
		this.gridCursor.changeLayout(firstX + x * curDX, undefined, undefined, firstY + y * curDY, undefined, undefined);
	};

	target.loadMemories = function () {
		// load previous contents of memories (if they exist)
		try {
			if (FileSystem.getFileInfo(datPath)) {
				var stream = new Stream.File(datPath),
					tempnum = stream.readLine();
				target.Meminput1.setValue(tempnum);
				tempnum = stream.readLine();
				target.Meminput2.setValue(tempnum);
				tempnum = stream.readLine();
				target.Meminput3.setValue(tempnum);
				stream.close();
			} else {
				func("memclearall");
			}
		} catch (e) { func("memclearall"); }
	};

	FileSystem.ensureDirectory(datPath0);
	datPath = datPath0 + 'calc.dat';
	target.saveMemories = function () {
		// save current contents of memories
		try {
			if (FileSystem.getFileInfo(datPath)) {FileSystem.deleteFile(datPath); }
			var stream = new Stream.File(datPath, 1);
			stream.writeLine(target.Meminput1.getValue());
			stream.writeLine(target.Meminput2.getValue());
			stream.writeLine(target.Meminput3.getValue());
			stream.close();
		} catch (e) { }
	};
};
tmp();
tmp = undefined;
