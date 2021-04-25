var nodeHwp = require('../node-hwp/lib/hwp');

var bundle = {
	nodeHwp: nodeHwp
};

module.exports = bundle;

if (typeof window !== 'undefined' && window.document) {
	if (window.nodeHwp) {
		throw new Error('Something else is called node-hwp!');
	}
	window.nodeHwp = bundle;
}
