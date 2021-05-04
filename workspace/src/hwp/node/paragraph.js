const node = require('../node');

var prototype = node.derive({
	children: function() {
		return this._line;
	},
	draw: function(ctx, viewPort) {
		var top = viewPort ? viewPort.t : 0;
		var bottom = viewPort ? (viewPort.t + viewPort.h) : Number.MAX_VALUE;
		this._line.forEach(function(node) {
			var b = _line.bounds();
			
		});
	},
	type: "paragraph"
});

exports = module.exports = function(parent) {
	var paragraph = Object.create(prototype);
	paragraph._parent = parent;
	paragraph._line = [];
	return paragraph;
};