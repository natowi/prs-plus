// Name: Author List
// Models: 600 and x50 series
//
// Description: Allows user to browse books by author on touch models
//
// Author: quisvir
//
// History:
//	2011-09-24 quisvir - Initial version
//	2011-11-20 quisvir - Now working on 600 thanks to Ben Chenoweth, first public version
//	2011-11-20 quisvir - Minor changes
//	2011-11-24 quisvir - Fixed deleting books opened from Author List
//	2012-02-24 quisvir - Enabled #-Z navbar

tmp = function() {

	var L, LX, log, authorsNode, authors, authorsNodeConstruct, authorsNodeDestruct, authorConstruct;
	
	L = Core.lang.getLocalizer('AuthorList');
	LX = Core.lang.LX;
	log = Core.log.getLogger('AuthorList');
	
	authorsNode = null;
	
	authorsNodeConstruct = function () {
		var i, c, result, record, author, path, books, node, obj0, obj1;
		authors = [];
		this.nodes = [];
		result = kbook.model.cache.textMasters;
		obj0 = {};
		obj0.by = 'indexArtist';
		obj0.order = xdb.ascending;
		// Model sniffing: filter out periodicals, enhance sorting
		if (Core.config.model === '600') {
			result.sort(obj0);
		} else {
			result = kbook.root.children.deviceRoot.children.books.filter(result);
			obj1 = {};
			obj1.by = 'indexTitle';
			obj1.order = xdb.ascending;
			result.sort_c(obj0, obj1);
		}
		c = result.count();
		for (i=0;i<c;i++) {
			record = result.getRecord(i);
			author = record.author;
			path = record.getFilePath();
			if (!authors.length || authors[authors.length-1][0] !== author) {
				authors.push([author, path]);
			} else {
				authors[authors.length-1].push(path);
			}
		}
		// Create author subnodes
		for (i=0;i<authors.length;i++) {
			books = authors[i].length - 1;
			if (books >= Number(AuthorList.options.MinimumBooks)) {
				node = Core.ui.createContainerNode({
					title: authors[i][0] ? authors[i][0] : '(' + L('NO_AUTHOR') + ')',
					parent: authorsNode,
					comment: LX('BOOKS', books),
					construct: authorConstruct,
					icon: 'COLLECTION'
				})
				node.authorIndex = i;
				this.nodes.push(node);
			}
		}
	};
	
	authorsNodeDestruct = function () {
		authors = [];
		this.nodes = null;
	};
	
	authorConstruct = function () {
		var i;
		this.nodes = [];
		for (i=1;i<authors[this.authorIndex].length;i++) {
			this.nodes.push(Core.media.createMediaNode(authors[this.authorIndex][i], this));
		}
		this.comment = LX('BOOKS', this.nodes.length);
	};
	
	var AuthorList = {
		name: 'AuthorList',
		title: L('TITLE'),
		icon: 'AUTHOR',
		optionDefs: [
			{
				name: 'MinimumBooks',
				title: L('MINIMUM_BOOKS_PER_AUTHOR'),
				defaultValue: '2',
				values: ['1', '2', '3', '4', '5', '10', '15', '20', '25'],
			},
		],
		getAddonNode: function () {
			if (authorsNode === null) {
				authorsNode = Core.ui.createContainerNode({
					title: L('TITLE'),
					shortName: L('SHORT_TITLE'),
					icon: 'AUTHOR',
					construct: authorsNodeConstruct,
					destruct: authorsNodeDestruct
				});
				authorsNode.getSortBy = function () {
					return 'text';
				};
			}
			return authorsNode;
		},
	};

	Core.addAddon(AuthorList);
};

try {
	tmp();
} catch (e) {
	// Core's log
	log.error('in AuthorList.js', e);
}