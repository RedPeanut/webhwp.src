var node = require('../carota/node');
var editor = require('../carota/editor');
var doc = require('../carota/doc');
var dom = require('../carota/dom');
var runs = require('../carota/runs');
var html = require('../carota/html');
var frame = require('../carota/frame');
var text = require('../carota/text');
var rect = require('../carota/rect');

var bundle = {
	node: node,
	editor: editor,
	doc: doc,
	dom: dom,
	runs: runs,
	html: html,
	frame: frame,
	text: text,
	rect: rect
};

module.exports = bundle;

if (typeof window !== 'undefined' && window.document) {
	if (window.carota) {
		throw new Error('Something else is called carota!');
	}
	window.carota = bundle;
}
