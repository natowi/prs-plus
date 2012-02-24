// Name: System
// Description: Fsk system methods
// Author: kartu
//
// History:
//	2010-03-14 kartu - Initial version, refactored from Utils
//	2010-03-27 kartu - Added setSoValue, rootObj
//	2010-03-27 kartu - Modified getSoValue to support single parameter call
//	2010-04-03 kartu - Added "compile" function
//	2010-04-04 kartu - Added "getFastSoValue" function stub
//	2010-04-21 kartu - Reformatted
//	2010-04-25 kartu - Fixed minor syntax glitch: removed trailing comma
//	2010-04-27 kravitz - Added getFastBookMedia()

try {
	Core.system = {
		// Calls script located in "path", using "log" to log errors
		// Arguments:
		//	path - path to the script
		//	log - logger
		// Throws exceptions if script fails or file cannot be found.
		callScript: function (path, log) {
			try {
				if (FileSystem.getFileInfo(path)) {
					var f = new Stream.File(path);
					try {
						var fn = new Function("Core", f.toString(), path, 1);
						var result = fn(Core);
						delete fn;
						return result;
					} finally {
						f.close();
					}
				}
			} catch (e) {
				var msg = "Error calling " + path + ": " + e;
				if (log) {
					log.error(msg);
				}
				throw msg;

			}
		},

		// A bit weird way to clone an object. There might be a better function or FSK specific operator to do the same
		// Arguments:
		//      obj - object to clone
		// Returns:
		//      "copy" of an object (linked objects as well as functions aren't cloned)
		//
		cloneObj: function (obj) {
			var temp = FskCache.playlistResult;
			var dummy = {};
			try {
				FskCache.playlistResult = obj;
				var result = FskCache.playlist.browse(dummy);
				delete result.db;
				delete result.playlist;
				return result;
			} catch (e) {
				log.error("error cloning: " + e);
				return undefined;
			} finally {
				FskCache.playlistResult = temp;
			}
		},

		// Getting values of properties of objects created by .so bytecode isn't always possible for custom functions.
		// However they are visible to .xb code
		// Arguments:
		//      obj - object to get value from or full object path (propName should be undefined in this case)
		//      propName - property name, could also look like "prop1.prop2.prop3"
		// Returns:
		//      property value or undefined, if property is not defined
		//
		// Note:
		//	Supports 2 ways of calling:
		//		getSoValue(obj, "someProperty.somOtherProperty...");
		//		getSoValue("SomeObject.someProperty.someOtherProperty...");
		getSoValue: function (obj, propName) {
			if (propName === undefined) {
				return FskCache.mediaMaster.getInstance.call(Core.system.rootObj, obj);
			} else {
				return FskCache.mediaMaster.getInstance.call(obj, propName);
			}
		},

		// Same as setSoValue but slightly faster, doesn't support nested properties
		//
		getFastSoValue: function (obj, propName) {
			// FIXME obsolete, replace with custom code from prsp.xsb
			return Core.system.getSoValue(obj, propName);
		},

		// FIXME is this needed?
		// Accelerates book media access
		getFastBookMedia: function (book)  {
			if (book._myclass) {
				return book.media;
			}
			if (book._media === undefined) {
				book._media = Core.system.getSoValue(book, "media");
			}
			return book._media;
		}
	};

	// Reference to the root object
	//
	Core.system.rootObj =  this;

	// Similiar as getSoValue but could be used to set settings
	// Arguments:
	//	obj - object to set value
	//	field - field name
	//	value - new value
	Core.system.setSoValue = Core.system.getSoValue(this, "prsp.setSoValue");

	// Compiles code in the scope of FskCache.
	// Arguments:
	//	args - comma delimited list of arguments
	//	code - function code
	Core.system.compile = Core.system.getSoValue(this, "prsp.compile");
} catch (e) {
	log.error("initializing core-system", e);
}
