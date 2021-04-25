var doc = require('../hwp/doc');
var frame = require('../hwp/frame');
var hwp = require('../hwp/hwp');

var bundle = {
	doc: doc,
	frame: frame,
	hwp: hwp,
};

module.exports = bundle;

if (typeof window !== 'undefined' && window.document) {
	if (window.hwp) {
		throw new Error('Something else is called hwp!');
	}
	window.hwp = bundle;
}
