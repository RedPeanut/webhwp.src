var node = require('./node');

var prototype = node.derive({
	load: function(runs, takeFocus) {
		var self = this;
		//this.words = [];
		this._paragraphs = [];
		this.layout();
	},
	layout: function(left, top, width, height) {
		this.frame = null;
		try {
			this._left = left || 0;
			this._top = top || 0;
			this._width = width || 0;
			this._paragraphs = [];
		} catch (x) {
			console.error(x);
		}
	},
	children: function() {
		return this._paragraphs;
	},
});

exports = module.exports = function() {
	var doc = Object.create(prototype);
	doc._left = 0;
	doc._top = 0;
	doc._width = 0;
	doc._paragraphs = [];
	doc.load([]);
	return doc;
};