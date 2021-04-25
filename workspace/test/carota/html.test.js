var html = require("@src/carota/html");
//const window = global;

describe("html", () => {
	it("", () => {
		var runs = html.parse(`
<h1>How to use it</h1>
<br>
<p>First, the bad news: if you need to support IE8 and earlier, then
<span class="carota">Carota</span> is not for you. Right now it requires
Canvas. It may be extended in the future to support other ways of rendering.</p>
`,
			{});
		console.log("runs = " + runs);
		console.log("runs = " + JSON.stringify(runs));
	});
});