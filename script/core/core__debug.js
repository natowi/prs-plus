// Name: Debug
// Description: Debugging related functions
// Author: kartu
//
// History:
//	2010-03-14 kartu - Initial version, refactored from Utils
//	2010-04-21 kartu - Reformatted
//	2010-04-27 kravitz - Assignment to oprop is moved into try..catch
//	2010-07-09 kartu - Renamed file so that it is loaded before other modules

try {
	Core.debug = {
		// Dumps properties of an object
		//
		dump: function (obj, log) {
			for (var p in obj) {
				log.trace(p + " => " + obj);
			}
		},

		dumpToString: function (o, prefix, depth) {
			var typeofo = typeof o;
			if (typeofo == "string" || typeofo == "boolean" || typeofo == "number") {
				return "'" + o + "'(" + typeofo + ")";
			}
			// Default depth is 1
			if (typeof depth == "undefined") {
				depth = 1;
			}
			// we show prefix if depth is
			if (typeofo == "undefined") {
				return "undefined";
			}
			if (o === null) {
				return "null";
			}
			if (typeofo == "function") {
				return "a function";
			}
			if (o.constructor == Array) {
				var s = "Array(" + o.length + ")";
				if (depth > 0) {
					s += " dumping\n";
					for (var i = 0, n = o.length; i < n; i++) {
						s += prefix + "[" + i + "] => " + this.dumpToString(o[i], prefix + "\t", depth - 1) + "\n";
					}
				}
				// remove trailing "\n"
				if (s.charAt(s.length - 1) == "\n") {
					s = s.substring(0, s.length - 1);
				}
				return s;
			}
			if (typeofo != "object") {
				return "unknown entitiy of type (" + (typeof o) + ")";
			}

			// if depth is less than 1, return just "an object" string
			if (depth < 1) {
				return "an object";
			}
			if (typeof prefix == "undefined") {
				prefix = "";
			}

			// at this point, o is not null, and is an object
			var str = "dumping\n";
			var hasProps = false;
			for (var prop in o) {
				hasProps = true;
				try {
					var oprop = o[prop];
					str += prefix + prop + " => " + this.dumpToString(oprop, prefix + "\t", depth - 1) + "\n";
				} catch (ee) {
					str += prefix + prop + " => " + "failed to tostring: " + ee + "\n";
				}
			}
			if (!hasProps) {
				return "an object with no properties";
			}
			// remove trailing "\n"
			if (str.charAt(str.length - 1) == "\n") {
				str = str.substring(0, str.length - 1);
			}
			return str;
		}
	};
} catch (e) {
	log.error("initializing core-debug", e);
}