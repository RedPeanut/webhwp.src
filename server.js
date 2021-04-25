var express = require('express');
var webmake = require('webmake');

var app = express();

/* app.get('js/webhwp.js', function(req, res) {
	res.writeHead(200, {
		'Content-Type': 'application/javascript; charset=utf-8',
		'Cache-Control': 'no-cache'
	});

	webmake('workspace/src/bundle/index.js', { cache: true }, function (err, content) {
		if (err) {
			res.end('document.write(' + JSON.stringify(err.message) + ');');
		} else {
			res.end(content);
		}
	});
}); */

app.post("/load", (req, res) => {
	res.send("/load is called...");
    
});

app.post("/download", (req, res) => {
	res.send("/download is called...");
});

app.use(express.static(__dirname+"/workspace/static"));
app.listen(3000);