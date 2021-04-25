var node = require('./node');

var prototype = node.derive({
	children: function() {
		return this._paragraphs;
	},
	draw: function(ctx, viewPort) {
		this.children().forEach(function(child) {
			child.draw(ctx, viewPort);
		});
	}
});

exports = module.exports = function(left, top, width, parent) {
	var paragraphs = [];
	var frame = Object.create(prototype, {
		_paragraphs: { value: paragraphs },
		_parent: { value: parent }
	});
	return frame;
};