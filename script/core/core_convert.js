// Name: Converters & Viewers
// Description: Converters (e.g. fb2 => epub) and alternative viewers (image viewers)
// Author: kartu
//
// History:
//	2011-03-02 kartu - Initial version
//	2011-11-20 kartu - Fixed #215 fb2epub converter doesn't work with cards with disabled scanning
//
try {
	tmp = function() {
		var L, fb2toepub, endsWith, createFB2Node, createImageNode, createMediaNode, enterFB2Node, FB2EPUB, STYLES_DIR, MAX_TMP_SIZE, TMP_FILE;
		endsWith = Core.text.endsWith;
		FB2EPUB = System.applyEnvironment("[prspPath]") + "fb2toepub";
		STYLES_DIR = System.applyEnvironment("[prspPath]") + "styles";
		MAX_TMP_SIZE = 5000000; // max size of the file that can be processed directly in mem
		TMP_FILE = "prsp_temp_file"; // temporary file
		
		fb2toepub = function (originalSrc, originalDest) {
			var cmd, size, tmpDir, usingTemp, src, dest, mount;
			// SD / MS card is not mounted => not visible to normal executables
			// Hence in that case we need to first copy source file to a temp location, 
			// then move 
			if (originalSrc.charAt(1) === ":") {
				// Use in memory temp folder if file is small enough, otherwise internal memory
				size = Core.io.getFileSize(originalSrc);
				if (size === null) {
					throw "FileNotFound";
				}
				if (size > MAX_TMP_SIZE) {
					tmpDir = "/Data/";
				} else {
					// tmp folder on x50 and 600 is rather small, use var instead
					switch (Core.config.model) {
						case 300:
						case 505:
							tmpDir = "/tmp/";
						default:
							tmpDir = "/var/";
					}
				}
				src = tmpDir + TMP_FILE;
				dest = src + ".dest";
				usingTemp = true;
				
				Core.io.copyFile(originalSrc, src);
			} else {
				src = originalSrc;
				dest = originalDest;
			}
			
			// Might need to "mount"
			mount = null;
			if (Core.text.startsWith(originalSrc, Core.shell.MS_MOUNT_PATH)) {
				mount = Core.shell.MS;
			} else if (Core.text.startsWith(originalSrc, Core.shell.SD_MOUNT_PATH)) {
				mount = Core.shell.SD;
			}
			
			// Mount if needed
			if (mount !== null) {
				Core.shell.mount(mount);
			}
			
			try {
				cmd = FB2EPUB + " -s " + STYLES_DIR + " \"" + src + "\" \"" + dest + "\"";
				log.trace(cmd);
				Core.shell.exec(cmd);
			} finally {
				// Delete temporary source file
				if (usingTemp) {
					try {
						Core.io.deleteFile(src);
					} catch (ignore) {
					}
				}
				
				// umount
				if (mount !== null) {
					Core.shell.umount(mount);
				}
			}

			if (usingTemp) {
				// move temporary destinaiton file to SD/MS card
				Core.io.moveFile(dest, originalDest);
			}
		};
		
		enterFB2Node = function () {
			var epubPath, node, media, nodes, i, n;
			try {
				if (L === undefined) {
					L =  Core.lang.getLocalizer("Converter");
				}
				
				epubPath = this.path + ".epub";
				Core.ui.showMsg([L("CONVERTING_FB2"), L("NORMALLY_TAKES")], 0);					
				fb2toepub(this.path, epubPath);
				Core.ui.showMsg(L("OPENING"), 0);
				
				node = this.createMediaNode(epubPath, this.title, this.parent, undefined, this.needsMount);
				
				if (node !== null) {
					// Replace this node with created media node
					nodes = this.parent.nodes;
					for (i = 0, n = nodes.length; i < n; i++) {
						if (nodes[i] === this) {
							nodes[i] = node;
							break;
						}
					}
					
					// Jump to newly created node
					this.gotoNode(node, kbook.model);
				} else {
					Core.ui.showMsg(L("ERROR"), 0);
				}
			} catch (e) {
				Core.ui.showMsg(L("ERROR"), 0);
				log.error("enterFB2Node", e);
			}
		};
		
		createFB2Node = function (path, title, parent, createMediaNode, needsMount) {
			var node, media, epubPath;
			try {
				epubPath = path + ".epub";
				media = Core.media.findMedia(epubPath);
				// if media is found, it means file was already converted, no need to show it
				if (media) {
					return null;
				}
				
				node = Core.ui.createContainerNode({
						title: title,
						comment: title,
						icon: "BOOK",
						parent: parent						
				});
				node.type = "book";
				node.path = path;
				node.enter = enterFB2Node;
				node.needsMount = needsMount;
				node.createMediaNode = createMediaNode;
				return node;
			} catch (e) {
				log.error("in createFB2Node " + path, e);
			}
			return null;
		};
		
		createImageNode = function (path, title, parent) {
			// FIXME implement image viewer
			return null;
		};
		
		createMediaNode = function (path, title, parent, createMediaNode, needsMount) {
			var ext = FileSystem.getExtension(path);
			
			switch (ext) {
				case "zip":
					if (!endsWith(path.toLowerCase(), ".fb2.zip")) {
						break;
					} // fallthrough
				case "fb2":
					return createFB2Node(path, title, parent, createMediaNode, needsMount);
				case "png":
				case "jpg":
				case "jpeg":
					return createImageNode(path, title, parent);
			}
			
			return null;
		};
		
		Core.convert = {
			/**
			* @returns node if file is convertable / viewable, null otherwise
			*/
			createMediaNode: createMediaNode
		};
	};
	
	tmp();
} catch (e) {
	log.error("Error in core_convert.js", e);
}
