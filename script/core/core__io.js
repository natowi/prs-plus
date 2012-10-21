// Name: IO
// Description: File IO related methods
// Author: kartu
//
// History:
//	2010-03-14 kartu - Initial version, refactored from Utils
//	2010-04-21 kartu - Reformatted
//	2010-07-09 kartu - Renamed file so that it is loaded before other modules
//	2010-11-11 kartu - Added listFiles function
//	2010-11-30 kartu - Refactoring Core.stirng => Core.text
//	2010-11-30 kartu - Fixed nasty double-bug with getFileContent not working properly on 600 plus finally block hijacking control.
//	2011-03-03 kartu - Added moveFile, deleteFile, getFileSize
//	2011-04-24 kartu - Added extractFileName, extractExtension, pathExists, getUnusedPath
//	2011-11-22 Mark Nord - Modified extractExtension to return only portion after the last "." except for fb2.zip
//	2011-12-14 Ben Chenoweth - Added emptyDirectory, deleteDirectory
//	2011-12-30 Mark Nord - extractExtension return is now always in  lowercase

try {
	Core.io = {
		// Returns list of files in the directory. Accepts 0..*  extension arguments.
		//
		// Returns array of files with given extension sorted by name
		//
		listFiles : function(path, ext) {
			var iterator, items, item, p, i, n, endsWith;
			endsWith = Core.text.endsWith;
			items = [];
			try {
				if (FileSystem.getFileInfo(path)) {
					iterator = new FileSystem.Iterator(path);
					try {
						while (item = iterator.getNext()) {
							if (item.type == "file") {
								p = item.path;
								if (arguments.length > 1) {
									for (i = 1, n = arguments.length; i < n; i++) {
										if (endsWith(p, arguments[i])) {
											items.push(p);
											break;
										}
									}
								} else {
									items.push(p);
								}
							}
						}
						items.sort();
					} finally {
						iterator.close();
					}
				}
			} catch (e) {
				log.error("Error in list files, listing folder " + path, e);
			}
			return items;
		},
		
		// Returns content of the file <path> as a string.
		// If any kind of error happens (file doesn't exist, or is not readable etc) returns <defVal>
		//
		getFileContent: function (path, defVal) {
			var stream, result;
			try {
				stream = new Stream.File(path, 2);
				try {
					result = stream.toString();
				} finally {
					stream.close();
				}
			} catch (whatever) {
				return defVal;
			}
			return result;
		},
		
		// Sets content of the file <path> to <content>. If file exists it will be overwritten.
		//
		setFileContent: function (path, content) {
			var stream;
			try {
				if (FileSystem.getFileInfo(path)) {
					FileSystem.deleteFile(path);
				}
				stream = new Stream.File(path, 1);
				stream.writeString(content);
				stream.flush();
			} catch (e) {
				throw "in setFileContent: " + e;
			} finally {
				try {
					stream.close();
				} catch (ignore) {
				}
			}
		},

		// Deletes file, if it exists.
		//
		// Throws exceptions on errors
		deleteFile: function (path) {
			if (FileSystem.getFileInfo(path)) {
				FileSystem.deleteFile(path);
			}
		},
		
		// Empties directory, if it exists.
		//
		// Throws exceptions on errors
		emptyDirectory: function (path) {
			var items, item;
			if (this.pathExists(path)) {
				items = this.listFiles(path);
				for (item in items) {
					this.deleteFile(path + items[item]);
				}
			}
		},
		
		// Deletes directory, if it exists.
		//
		// Throws exceptions on errors
		deleteDirectory: function (path) {
			if (this.pathExists(path)) {
				this.emptyDirectory(path);
				FileSystem.deleteDirectory(path);
			}
		},
		
		// Copies file from <from> to <to>, deleting the target file first
		//
		// Arguments:
		//	from - source file
		//	to - target file
		//
		// Throws exceptions on errors. 
		copyFile: function (from, to) {
			this.deleteFile(to);
			//FileSystem.copyFile(from, to);
			// Copy/paste from FileSystem.copyFile, slightly modified (removed progress)
			var s, d, c, len, totalLen, copied;
			try {
				s = new Stream.File(from, 2);
				d = new Stream.File(to, 3);
				len = 128 * 1024;
				copied = 0;
				totalLen = s.bytesAvailable;
				c = new Chunk(len);
				while (s.readChunk(len, c)) {
					copied += c.length;
					d.writeChunk(c);
				}
				if (copied !== totalLen) {
					throw "Error copying " + from + " to " + to;
				}
			} finally {
				if (c) {
					c.free();
				}
				if (s) {
					s.close();
				}
				if (d) {
					d.close();
				}
			}
		},
		
		// Moves file from <from> to <to>, deleting the target file first
		//
		// Arguments:
		//	from - source file
		//	to - target file
		//
		// Throws exceptions on errors. 
		moveFile: function (from, to) {
			this.copyFile(from, to);
			this.deleteFile(from);
		},
		
		// Returns size of the file in bytes or null, if file cannot be found
		getFileSize: function (path) {
			var info = FileSystem.getFileInfo(path);
			if (info) {
				return info.size;
			}
			return null;
		},
		
		// Returns path including trailing "/"
		extractPath: function (path) {
			var idx;
			if (path === undefined) {
				return undefined;
			}
			idx = path.lastIndexOf("/");
			if (idx > -1) {
				path = path.substring(0, idx + 1);
			}
			return path;
		},
		
		// Extracts filename from absolute path
		extractFileName: function (path, stripExtension) {
			var idx;
			if (path === undefined) {
				return undefined;
			}
			idx = path.lastIndexOf("/");
			if (idx > -1) {
				path = path.substring(idx + 1);
				if (stripExtension) {
					idx = path.indexOf(".");
					if (idx > -1) {
						path = path.substring(0, idx);
					}
				}
			}
			return path;
		},
		
		// Extracts file extension
		extractExtension: function (path) {
			var idx, result;
			if (path === undefined) {
				return undefined;
			}
			path = this.extractFileName(path);
			
			idx = path.lastIndexOf(".");
			if (idx > -1) {
				result = path.substring(idx + 1);
				result = result.toLowerCase();
				if (result === "zip") {
					// check for fb2.zip
					 result = Core.text.endsWith(path.toLowerCase(),"fb2.zip") ? "fb2.zip" : "zip";
				}			
				return result;
			}
			return "";
		},
		
		// Checks if file or directory with given name exists
		pathExists: function (path) {
			return FileSystem.getFileInfo(path) ? true : false;
		},
		
		getUnusedPath: function (path, fileName) {
			var n, extension;
			if (!this.pathExists(path + fileName)) {
				return path + fileName;
			}
			
			extension = this.extractExtension(fileName);
			fileName = this.extractFileName(fileName, true);
			n = 0;
			while (FileSystem.getFileInfo(path + fileName + "_" + n + "." + extension)) {
				n++;
			}
			return path + fileName + "_" + n + "." + extension;			
		}
	};
} catch (e) {
	log.error("initializing core-io", e);
}