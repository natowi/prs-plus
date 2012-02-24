// Name: Utils
// Description: Misceleraneous utilities
// Author: kartu
//
// History:
//	2010-07-21 kartu - Initial version
//	2011-04-24 kartu - Added replaceInArray
//	2012-02-20 quisvir - Reversed callAll order in case a called function splices itself from the array (event unsub)

Core.utils = {
	/**
	* Calls each element of function array
	*
	* @param targets - array of functions, or array of objects, if funcName is defined
	* @param obj - object that will be passed as "this" to the functions
	* @param args - array of arguments to pass to the function
	* @param funcName - name of the function to call (if provided, targets is a list of objects) 
	*/
	callAll: function (targets, obj, args, funcName) {
		var i, f;
		for (i = targets.length - 1; i >= 0; i--) {
			try {
				f = targets[i];
				if (funcName !== undefined) {
					f = f[funcName];
				}
				if (f !== undefined) {
					if (args !== undefined) {
						f.apply(obj, args);
					} else {
						f.call(obj);
					}
				}
			} catch (e) {
				// Core's log
				log.error("in callAll, idx " + i, e);
			}
		}

	},
	
	/**
	* Replaces matching values in an array
	* @param what - value to look for
	* @param withWhat - value to replace with
	*/
	replaceInArray: function (arr, what, withWhat) {
		var i, n;
		for (i = 0, n = arr.length; i < n; i++) {
			if (arr[i] === what) {
				arr[i] = withWhat;
			}
		}
	}
};