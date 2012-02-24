// Name: Text
// Description: Strings & text related methods
// Author: kartu
//
// History:
//	2010-03-14 kartu - Initial version, refactored from Utils
//	2010-04-21 kartu - Reformatted
//	2010-07-08 kartu - Added trim()
//	2010-07-09 kartu - Renamed file so that it is loaded before other modules
//	2010-11-30 kartu - Renamed to core___text

try {
	var ws = null;
        var chars = ' \n\r\t\v\f\u00a0\u2000\u2001\u2002\u2003\u2004\u2005​\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
	var getWhitespaceMap = function() {
		if (ws === null) {
			ws = {};
			for (var i = 0; i < chars.length; i++ ) {
				ws[chars.charAt(i)] = true;
			}
		}
		return ws;
	};

	Core.text = {
		compareStrings: function (a, b) {
			return a.localeCompare(b);
		},
		
		startsWith: function (str, prefix) {
			return str.indexOf(prefix) === 0;
		},
		
		endsWith: function (str, postfix) {
			return str.lastIndexOf(postfix) === str.length - postfix.length;
		},
		
		trim: function (str) {
			var s = -1, e = str.length, ws = getWhitespaceMap();
			while( ws[str.charAt(--e)] );
			while( s++ !== e && ws[str.charAt(s)] );
			return str.substring( s, e+1 );
		}
	};
} catch (e) {
	log.error("initializing core-string", e);
}	
