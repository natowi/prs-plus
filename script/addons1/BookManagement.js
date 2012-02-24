// Name: BookManagement (300/505/600)
// 
// Author: quisvir
//
// History:
//	2012-02-24 quisvir - Initial version: sub-collections & clear page histories

tmp = function() {

	var L, LX, log, opt;
	
	L = Core.lang.getLocalizer('BookManagement');
	log = Core.log.getLogger('BookManagement');
	
	// Sub-collection support
	var oldPlaylistNode = FskCache.tree.playlistNode.construct;
	FskCache.tree.playlistNode.construct = function () {
		oldPlaylistNode.apply(this);
		if (opt.subCollections === 'true') {
			createSubCollections(this, 0, opt.subCollSeparator);
		}
	}

	var createSubCollections = function (parent, start, sep) {
		var i, c, next, node, nodes, newNode, last, idx, coll, title;
		nodes = parent.nodes;
		for (i = next = start, c = nodes.length; i < c; i++) {
			node = nodes[i];
			title = node.title;
			idx = title.indexOf(sep);
			if (idx !== -1) {
				coll = title.slice(0, idx);
				node.name = node.title = title.slice(idx + 1);
				if (last === coll) {
					node.parent = nodes[next-1];
					nodes[next-1].nodes.push(nodes.splice(i,1)[0]);
					i--; c--;
				} else {
					newNode = Core.ui.createContainerNode({
						title: coll,
						comment: function () {
							return Core.lang.LX('COLLECTIONS', this.nodes.length);
						},
						parent: parent,
						icon: 'BOOKS'
					});
					node.parent = newNode;
					newNode.sublistMark = true;
					newNode.nodes.push(nodes.splice(i,1)[0]);
					nodes.splice(next, 0, newNode);
					last = coll;
					next++;
				}
			}
		}
		if (last) nodes[next-1].separator = 1;
		for (i = nodes.length - 1; i >= start; i--) {
			if (nodes[i].nodes) createSubCollections(nodes[i], 0, sep);
		}
	}
	
	// Clear page histories, keeping current position (length = 0 crashes home menu)
	var clearPageHists = function () {
		var db, i, r;
		if (opt.clearHistsOnShutdown === 'true') {
			db = model.cache.textMasters;
			for (i = db.count() - 1; i >= 0; i--) {
				r = db.getRecord(i);
				if (r.history.length) r.history.length = 1;
			}
		}
	}
	
	var BookManagement = {
		name: 'BookManagement',
		title: L('TITLE'),
		icon: 'BOOKS',
		onInit: function () {
			opt = this.options;
			Core.events.subscribe(Core.events.EVENTS.SHUTDOWN, clearPageHists, true);
		},
		optionDefs: [
			{
				name: 'subCollections',
				title: L('SUB_COLLECTIONS'),
				icon: 'BOOKS',
				defaultValue: 'false',
				values: ['true','false'],
				valueTitles: {
					'true': L('VALUE_TRUE'),
					'false': L('VALUE_FALSE')
				}
			},
			{
				name: 'subCollSeparator',
				title: L('SUB_COLLECTIONS_SEPARATOR'),
				icon: 'BOOKS',
				defaultValue: '|',
				values: ['|', '.', ',', ':', ';', '/', '~'],
			},
			{
				name: 'clearHistsOnShutdown',
				title: L('CLEAR_PAGE_HISTORY_ON_SHUTDOWN'),
				icon: 'CLOCK',
				helpText: L('CLEAR_PAGE_HIST_HELPTEXT'),
				defaultValue: 'false',
				values: ['true', 'false'],
				valueTitles: {
					'true': L('VALUE_TRUE'),
					'false': L('VALUE_FALSE')
				}	
			}
		]
	};

	Core.addAddon(BookManagement);
};
try {
	tmp();
} catch (e) {
	// Core's log
	log.error('in BookManagement.js', e);
}
