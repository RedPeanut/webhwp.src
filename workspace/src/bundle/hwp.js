var doc = require('../hwp/doc');
var frame = require('../hwp/frame');
var text = require('../hwp/text');
var hwp = require('../hwp/hwp');

var bundle = {
	doc: doc,
	frame: frame,
	text: text,
	hwp: hwp,
};

module.exports = bundle;

if (typeof window !== 'undefined' && window.document) {
	if (window.hwp) {
		throw new Error('Something else is called hwp!');
	}
	window.hwp = bundle;
}
