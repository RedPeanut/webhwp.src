var express = require("express");
//var webmake = require("webmake");
var multer = require('multer');
var fs = require("fs");
var path = require("path");
var hwp = require('@webhwp/node-hwp');
//var HWPViewer = require('@webhwp/hwp.js/src/viewer');

var app = express();

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.set("views", __dirname + "/workspace/templates");

app.get("/text", (req, res) => {
	res.render("text");
});

app.get("/", (req, res) => {
	res.redirect("/wysiwyg");
});

app.get("/canvas", (req, res) => {
	//res.send("/canvas is called...");
	res.render("canvas"/* , { title: "제목이들어갑니다", message: "메세지가들어갑니다"} */);
});

app.get("/wysiwyg", (req, res) => {
	res.render("wysiwyg");
});

fs.readdir("upload", (error) => {
	if (error) {
		fs.mkdirSync("upload");
	}
});

const upload = multer(
	{
		storage: multer.diskStorage({
			destination(req, file, cb) {
				console.log("destination() is called...");
				cb(null, "upload/");
			},
			filename(req, file, cb) {
				console.log("filename() is called...");
				const ext = path.extname(file.originalname);
				cb(null, file.originalname);
			}
		}),
		//limits: {fileSize:5*1024*1024},
	}
);

var loadCb = function(req, res) {
	//res.send("/load is called...");
	console.log("loadCb() is called...");
	console.log("req.file.filename = " + req.file.filename);
	if (req.file != null && req.file.filename != null && req.file.filename != "") {
		hwp.open("upload/" + req.file.filename, function(err, doc) {
			//console.log("doc._hml = " + doc._hml);
			//console.log(doc.toHML());
			console.log(doc != null);
			//var _doc = doc;
			res.json({
				status: "success",
				data: doc.toHML()
			});
		});
	}
	//res.render("index", {});
}

//app.get("/load", loadCb);
app.post("/load", upload.single("file"), loadCb);

app.post("/download", (req, res) => {
	res.send("/download is called...");
});

app.use(express.static(__dirname+"/workspace/static"));
app.listen(3000);