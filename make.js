var webmake = require('webmake');
var minify = require('node-minify');

webmake('workspace/src/bundle/index.js', { output: 'workspace/static/js/webhwp-debug.js' }, function(result) {
	if (!result) {
		console.log('All good');
	} else {
		console.log(result);
	}
});

new minify.minify({
	type: 'uglifyjs',
	fileIn: 'workspace/static/js/webhwp-debug.js',
	fileOut: 'workspace/static/js/webhwp-min.js',
	callback: function(err, min) {
		if (err) {
			console.log(err);
		}
	}
});
