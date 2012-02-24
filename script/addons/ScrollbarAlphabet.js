// Name: ScrollbarAlphabet
// Description: Allows to select alphabet used in Books view of the 600 and later models.
// Author: kartu
//
// History:
//	2011-02-06 kartu - Initial version
//	2011-02-10 kartu - Implemented # Latin-English and Latin-Georgian scrollbars 

tmp = function() {
	var log, L, defVal, ScrollbarAlphabet, initAlphaBins, getBinName, oldInitAlphaBins, oldGetBinName, BINS, rangeBasedGetBinName,
	createCharToBinMapping; 
	L = Core.lang.getLocalizer("ScrollbarAlphabet");
	log = Core.log.getLogger("ScrollbarAlphabet");
	defVal = "default";
	
	// Base func for range based alphabets
	rangeBasedGetBinName = function (bins, from, to, item) {
		var ch, i, n, code;
		ch = item.charAt(0).toUpperCase();
		code = ch.charCodeAt(0);
		if (code < from) {
			return "#";
		} else if (code > to) {
			return "*";
		}				
		for (i = 0, n = bins.length; i < n; i ++) {
			if (bins[i] === ch) {
				return ch;
			}
		}
		return "*";
	};
	
	// Creates letter => bin name mapping "hashmap"
	createCharToBinMapping = function(bins) {
		var result, i, j, n, m, bin;
		result = {};
		for (i = 0, n = bins.length; i < n; i++) {
			bin = bins[i];
			for (j = 0, m = bin.length; j < m; j++) {
				result[bin.charAt(j)] = bin;
			}
		}
		return result;
	};
	
		
	BINS = {
		"lat": {
			bins: [ "#", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "*"],
			getBinName: function (item) {
				try {
					return rangeBasedGetBinName(this.bins, 65, 122, item);
				} catch (e) {
					log.error("in geo.getBinName, item is " + item, e);
					return "*";
				}				
			}
		}, 
		"rus": {
			bins: [ "#", "А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "З", "И", "Й", "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т", "У", "Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Ъ", "Ы", "Ь", "Э", "Ю", "Я", "*"],
			getBinName: function (item) {
				var ch, code;
				try {
					ch = item.charAt(0);
					code = item.charCodeAt(0);
					// Ё
					if (code === 1025 || code === 1105) {
						return "Ё";
					}
					if (code < 1040 ) {
						return "#";
					} else if (code > 1103) {
						return "*";
					}
					// toUppercase
					if (code > 1071) {
						ch = String.fromCharCode(code - 32);
					}
					return rangeBasedGetBinName(this.bins, 1040, 1071, ch);
				} catch (e) {
					log.error("in rus.getBinName, item is " + item, e);
					return "*";
				}
			}
		}, 
		"lat_rus": {
			bins: [ "#","AB", "CD", "EF", "GH", "IJ", "KL", "MN", "OP", "QR", "ST", "UV", "WX", "YZ",
				 "АБ", "ВГ", "ДЕ", "ЁЖ", "ЗИ", "ЙК", "ЛМ", "НО", "ПР", "СТ", "УФ", "ХЦ", "ЧШ", "ЩЪ", "ЫЭ", "ЮЯ", "*"],
			getBinName: function (item) {
				var binName;
				try {
					// Try Russian first
					binName = BINS.rus.getBinName(item);
					if (binName === "*" || binName === "#") {
						// If not Russian, try latin
						binName = BINS.lat.getBinName(item);
					}
		
					if (this.map === undefined) {
						this.map = createCharToBinMapping (this.bins);
					}
					
					return this.map[binName];
				} catch (e) {
					log.error("in lat_rus.getBinName, item is " + item, e);
					return "*";
				}
			}
		}, 
		"geo": {
			bins: [ "#", "ა", "ბ", "გ", "დ", "ე", "ვ", "ზ", "თ", "ი", "კ", "ლ", "მ", "ნ", "ო", "პ", "ჟ", "რ", "ს", "ტ", "უ", "ფ", "ქ", "ღ", "ყ", "შ", "ჩ", "ც", "ძ", "წ", "ჭ", "ხ", "ჯ", "ჰ", "*"],
			getBinName: function (item) {
				try {
					return rangeBasedGetBinName(this.bins, 4304, 4336, item);
				} catch (e) {
					log.error("in geo.getBinName, item is " + item, e);
					return "*";
				}
			}
		},
		"lat_geo": {
			bins: [ "#","AB", "CD", "EF", "GH", "IJ", "KL", "MN", "OP", "QR", "ST", "UV", "WX", "YZ",
				"აბ", "გდ", "ევ", "ზთ", "იკ", "ლმ", "ნო", "პჟ", "რს", "ტუ", "ფქ", "ღყ", "შჩ", "ცძ", "წჭ", "ხჯ", "ჰ", "*"],
			getBinName: function (item) {
				var binName;
				try {
					// Try Georgian first
					binName = BINS.geo.getBinName(item);
					if (binName === "*" || binName === "#") {
						// If not Georgian, try latin
						binName = BINS.lat.getBinName(item);
					}
		
					if (this.map === undefined) {
						this.map = createCharToBinMapping (this.bins);
					}
					
					return this.map[binName];
				} catch (e) {
					log.error("in lat_rus.getBinName, item is " + item, e);
					return "*";
				}
			}
		}		
	};
	
	getBinName = function(item) {
		var alphabet = ScrollbarAlphabet.options.alphabet;
		if (alphabet === defVal || BINS[alphabet] === undefined) {
			return oldGetBinName.apply(this, arguments);
		}
		return BINS[ScrollbarAlphabet.options.alphabet].getBinName(item);
	};
	
	initAlphaBins = function() {
		var i, n, alphabet, bins, result;
		try {
			alphabet = ScrollbarAlphabet.options.alphabet;
			if (alphabet === defVal || BINS[alphabet] === undefined) {
				return oldInitAlphaBins.apply(this, arguments);
			}
			
			result = new Fskin.kbookNavbar.BinSet(Fskin.kbookNavbar.binTypes.text);
			bins = BINS[alphabet].bins;
			for (i = 0, n = bins.length; i < n; i++) {
				result.add(bins[i]);
			}
			return result;
		} catch (e) {
			log.error("initAlphaBins", e);
		}
	};
	
	ScrollbarAlphabet = {
		name: "ScrollbarAlphabet",
		title: L("TITLE"),
		icon: "ABC",
		onPreInit: function() {
			this.optionDefs = [{
				name: "alphabet",
				title: L("OPT_ALPHABET"),
				icon: "ABC",
				defaultValue: defVal,
				values: [defVal, "lat", "rus", "lat_rus", "geo", "lat_geo"],
				valueTitles: {
					"lat": "Latin",
					"rus": "Русский",
					"lat_rus": "Англо - русский",
					"geo": "ქართული",
					"lat_geo": "ინგლისურ - ქართული"
				}			
			}];
			this.optionDefs[0].valueTitles[defVal] = L("VALUE_DEFAULT");
		},
		onInit: function() {
			oldInitAlphaBins = kbook.menuData.initAlphaBins;
			oldGetBinName = kbook.menuData.getBinName;
			kbook.menuData.initAlphaBins = initAlphaBins;
			kbook.menuData.getBinName = getBinName;
			if (!BINS[this.options.alphabet]) {
				this.options.alphabet = defVal;
			}
		}
	};
	
	Core.addAddon(ScrollbarAlphabet);
};

try {
	// Run only if model supports bins
	if (kbook.menuData.getBinName) {
		tmp();
		tmp = undefined;
	}
} catch (e) {
	// Core's log
	log.error("in ScrollbarAlphabet.js", e);
}