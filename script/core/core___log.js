// Name: Log
// Description: logging related methods 
// Author: kartu
//
// History:
//	2010-03-14 kartu - Initial version, refactored from Utils
//	2010-03-17 kartu - Fixed date format to always have the same length
//	2010-04-21 kartu - Added "exception" parameter to log.error
//	2010-04-25 kartu - Marked setLevel as constructor for closure compiler to shut up
//	2010-07-09 kartu - Renamed to core___log.js, so that it is the first module that is loaded
//	2010-11-10 kartu - Added isDebugEnabled function

Core.log = {
	loggers: {},
	isDebugEnabled: function () {
		return Core.config.defaultLogLevel === "trace";
	},
	createLogger: function (cls, level) {
		if (typeof level === "undefined") {
			level = Core.config.defaultLogLevel;
		}
		var result = {};
		result.name = cls;
		result.log = this.log;
		result.setLevel = this.setLevel;
		result.setLevel(level);
		return result;
	},
	getLogger: function (cls, level) {
		var loggers = this.loggers;
		if (loggers.hasOwnProperty(cls)) {
			return loggers[cls];
		} else {
			var logger = this.createLogger(cls, level);
			loggers[cls] = logger;
			return logger;
		}
	},		
	log : function (msg, level) {
		try {
			if (typeof level === "undefined") {
				level = "";
			} else {
				level = " " + level;
			}
			var stream = new Stream.File(Core.config.logFile, 1);
			try {
				// double digit
				var dd = function (n) {
					if (n < 10) {
						return "0" + n;
					} else {
						return n;
					}
		                };			
				
				stream.seek(stream.bytesAvailable);
				var d = new Date();
				var year, month, day, hour, minute, sec;
				year = dd(d.getFullYear());
				month = dd(d.getMonth() + 1);
				day = dd(d.getDate());
				hour = dd(d.getHours());
				minute = dd(d.getMinutes());
				sec = dd(d.getSeconds());				
				var dateStr = year + "-" + month + "-" + day + " " +  hour +
					":" + minute + ":" + sec + "." + d.getMilliseconds();
				stream.writeLine(dateStr + level + " " + this.name  + "\t" + msg);
			} catch (ignore) {
			} finally {
			    stream.close();
			}
		} catch (ignore2) {
		}
	},
	/**
	 * @constructor
	 */	
	setLevel: function (level) {
		this.trace = this.info = this.warn = this.error = Core.log.dummy;
		switch (level) {
			case "trace":
				this.trace = Core.log.trace;// fallthrough
			case "info":
				this.info = Core.log.info;// fallthrough
			case "warn":
				this.warn = Core.log.warn; // fallthrough
			case "error":
				this.error = Core.log.error;// fallthrough
		}
	},
	trace: function (msg) { this.log(msg, "T"); },
	info: function (msg) { this.log(msg, "I"); },
	warn: function (msg) { this.log(msg, "W"); },
	error: function (msg, e) { 
		if (e !== undefined) {
			this.log(msg + ": " + e, "E");
		} else {
			this.log(msg, "E");
		}	
	},
	dummy: function () {}
};

log = Core.log.getLogger("core");
