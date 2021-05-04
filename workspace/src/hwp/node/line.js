const node = require('../node');
const rect = require('../rect');

var prototype = node.derive({
	bounds: function() {
		return rect(this._left, this._top, this._width, this._height);
	},
	children: function() {
		return this._text;
	},
	draw: function(ctx, viewPort) {
	},
	type: "line"
});

exports = module.exports = function() {
	var line = Object.create(prototype, {});
	line._left = 0;
	line._top = 0;
	line._width = 0;
	line._height = 0;
	line._text = [];
	return line;
};