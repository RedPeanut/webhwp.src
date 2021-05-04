var node = require('../node');

var prototype = node.derive({
	children: function() {
		return this.nodes;
	},
	draw: function(ctx, viewPort) {
	}
});

exports = module.exports = function() {
	var text = Object.create(prototype, {});
	
};