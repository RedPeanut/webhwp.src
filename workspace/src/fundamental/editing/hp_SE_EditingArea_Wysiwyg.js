import { 
	HWPDocument,
	DocInfo,
	HWPHeader,
	HWPVersion,
	Section,
	CharType,

	DocInfoParser,
	SectionParser,

	parse,
	parsePage,
	Viewer,

	isTable, isShape, isPicture
} from "@webhwp/hwp.js";

const BORDER_WIDTH = [
	"0.1mm",
	"0.12mm",
	"0.15mm",
	"0.2mm",
	"0.25mm",
	"0.3mm",
	"0.4mm",
	"0.5mm",
	"0.6mm",
	"0.7mm",
	"1.0mm",
	"1.5mm",
	"2.0mm",
	"3.0mm",
	"4.0mm",
	"5.0mm",
];

const BORDER_STYLE = {
	0: "none",
	1: "solid",
	2: "dashed",
	3: "dotted",
	8: "double",
};

const TEXT_ALIGN = {
	0: "justify",
	1: "left",
	2: "right",
	3: "center",
};

/**
 * @desc 
 */
 nhn.husky.SE_EditingArea_Wysiwyg = jindo.$Class({
	type: "WYSIWYG",
	name: "SE_EditingArea_Wysiwyg",

	$init: function(appContainer) {
		//console.log("$init() is called...");

		//Assign HTML Element
		this.appContainer = appContainer;
		this.menuBar = appContainer.querySelector("#menuBar");
		this.toolBar = appContainer.querySelector("#toolBar");
		this.statusBar = appContainer.querySelector("#statusBar");
		
		var container = this.container = appContainer.querySelector(".container"),
			document = this.document = container.querySelector(".document"),
			ruler = this.ruler = container.querySelector(".ruler"),
			editingArea = this.editingArea = document.querySelector(".editing_area");
		
		this.scrollView = document.querySelector("#scrollView");
		this.scrollViewHorizontal = document.querySelector("#scrollViewHorizontal");
		this.scrollViewVertical = document.querySelector("#scrollViewVertical");

		var self = this;
		this.$file = $("input[type=file]");
		this.$file.on("change", function() {
			console.log("onchange() is called...");
			var blob = this.files[0];
			blob.arrayBuffer().then(arrayBuffer => {

				//remove all pages
				$(".hwpjs-page").remove(); 
				self.pages = [];

				//load file
				var array = new Uint8Array(arrayBuffer);
				//new Viewer(self.paperHtml, array, {type: "array"});
				var document = parsePage(parse(array, {type: "array"}));
				//console.log("document.sections.length = " + document.sections.length);

				//draw pages
				document.sections.forEach((section, index) => {
					self.drawSection(document, self.editingArea, section, index);
				});
				
				self.oApp.exec("EVENT_WINDOW_RESIZE");
				self.oApp.exec("POSITION_TOP");
			});
		});

		this.pageMargin = 20; //px

		this.pages = [];

		/* Blank 페이지 */

		//디폴트:A4,단위:7200/inch 
		var section = new Section();
		section.width = 59528;
		section.height = 84188;
		section.paddingTop = 5669;
		section.headerPadding = 4251;
		section.paddingRight = 8503;
		section.paddingBottom = 4251;
		//section.tailPadding = 4251;
		section.paddingLeft = 8503;
		var page = this.createPage(section, 0);
		this.pages.push(page);
		this.editingArea.appendChild(page);

		/* this.paperHtml = editingArea.querySelector("#paperHtml");

		//주요 상수값들 및 변수 선언
		this.RATIO = 3.78; //ratio=px/mm; mm to px ratio
		this.paperWidth = Math.floor(210*this.RATIO); //px
		this.paperHeight = Math.floor(297*this.RATIO); //px
		this.pageMargin = 20; //px

		this.paddingTop = Math.floor(20*this.RATIO);
		this.paddingBottom = Math.floor(15*this.RATIO);
		this.paddingLeft = Math.floor(30*this.RATIO);
		this.paddingRight = Math.floor(30*this.RATIO);
		this.paddingHead = Math.floor(15*this.RATIO);
		this.paddingTail = Math.floor(15*this.RATIO); //px

		this.paperHtml.style.width = this.paperWidth+"px";
		this.paperHtml.style.height = this.paperHeight+"px";
		this.paperHtml.style.paddingLeft = this.paddingLeft+"px";
		this.paperHtml.style.paddingTop = this.paddingTop+"px";
		this.paperHtml.style.paddingRight = this.paddingRight+"px";
		this.paperHtml.style.paddingBottom = this.paddingBottom+"px";
		//this.paperHtml.style.left = this.pageMargin;
		this.paperHtml.style.top = this.pageMargin+"px"; */

	},

	$BEFORE_MSG_APP_READY: function() {
		this.oApp.exec("REGISTER_EDITING_AREA", [this]);
		this.oApp.exec("ADD_APP_PROPERTY", ["getWysiwygPaperHtml", this.getPaperHtml.bind(this)]);
		this.oApp.exec("REGISTER_MENU_EVENT", ["FILE_LOAD", "click", "EXECCOMMAND", ["FILE_LOAD", false, false]]);
		this.oApp.exec("REGISTER_MENU_EVENT", ["FILE_DOWNLOAD", "click", "EXECCOMMAND", ["FILE_DOWNLOAD", false, false]]);
	},

	$ON_MSG_APP_READY: function() {
		//this.oEditingArea = this.editingArea;
		//this.oApp.registerBrowserEvent(this.scrollView, "scroll", "EVENT_SCROLL_VIEW_SCROLL", [], null, 10);
		this.oApp.registerBrowserEvent(window, "resize", "EVENT_WINDOW_RESIZE", [], null, 100);
	},

	$AFTER_MSG_APP_READY : function() {
		this.oApp.exec("REGISTER_EDITING_AREA", [this]);
		this.oApp.exec("EVENT_WINDOW_RESIZE");
	},

	$ON_EVENT_SCROLL_VIEW_SCROLL: function() {
		this.editingArea.scrollTop = this.scrollView.scrollTop;
		this.editingArea.scrollLeft = this.scrollView.scrollLeft;

	},

	$ON_EVENT_WINDOW_RESIZE: function() {
		this.editingArea.style.width = 100+"%";
		this.editingArea.style.height = this.appContainer.clientHeight - (this.menuBar.clientHeight + this.toolBar.clientHeight + this.ruler.clientHeight + this.statusBar.clientHeight) + "px";

		var editingAreaWidth = this.editingArea.clientWidth,
			editingAreaHeight = this.editingArea.clientHeight;
		
		var maxPaperWidth = 0, paperHeight = 0;
		this.pages.forEach((page) => {
			maxPaperWidth = Math.max(maxPaperWidth, page.clientWidth);
			paperHeight = page.clientHeight+this.pageMargin*2;
		});
		console.log("maxPaperWidth = " + maxPaperWidth);
		console.log("paperHeight = " + paperHeight);

		/* var paperLeftPos = (editingAreaWidth - this.paperWidth) / 2;
		if (paperLeftPos < this.pageMargin) paperLeftPos = this.pageMargin;
		this.paperHtml.style.left = paperLeftPos+"px";*/

		var scrollViewWidth = Math.max(maxPaperWidth+this.pageMargin*2, editingAreaWidth);
		var scrollViewHeight = paperHeight;

		this.scrollViewHorizontal.style.width = scrollViewWidth+"px";
		this.scrollViewVertical.style.height = scrollViewHeight+"px";

		this.oApp.exec("POSITION_CENTER");
	},

	$ON_POSITION_CENTER: function() {
		var editingAreaWidth = this.editingArea.clientWidth,
		editingAreaHeight = this.editingArea.clientHeight;
		var scrollViewWidth = this.scrollViewHorizontal.clientWidth;
		
		if (scrollViewWidth > editingAreaWidth) {
			this.pages.forEach((page) => {
				page.style.marginLeft = page.style.marginRight = this.pageMargin+"px";
				//console.log("" + page.style.marginLeft);
			});
			this.editingArea.scrollLeft = (scrollViewWidth-editingAreaWidth)/2;
		} else {
			this.pages.forEach((page) => {
				page.style.marginLeft = page.style.marginRight = "auto";
				//console.log("" + page.style.marginLeft);
			});
		}
	},
	$ON_POSITION_TOP: function() {
		this.editingArea.scrollTop = 0;
	},
	$ON_PASTE_HTML: function(sHTML, oPSelection, htOption) {
		//this.oApp.exec("EVENT_WINDOW_RESIZE");
	},

	getPaperHtml: function() {
		//console.log("getPaperHtml() is called...");
		return this.paperHtml;
	},

	$ON_EXECCOMMAND: function(sCommand, bUserInterface, vValue) {
		//console.log("$ON_EXECCOMMAND is called...");
		//console.log("sCommand = " + sCommand);
		switch (sCommand) {
			case "FILE_LOAD":
				this.$file.click();
				break;
			case "FILE_DOWNLOAD":
				break;
		}
	},
	createPaddingMark: function() {
		const mark = document.createElement("div");
		mark.style.position = "absolute";
		mark.style.borderStyle = "solid";
		mark.style.borderColor = "#c5c5c5";
		mark.style.width = "20px";
		mark.style.height = "20px";
		return mark;
	},
	createPage: function(section, index) {
		const page = document.createElement("div");
		page.style.boxShadow = "0 1px 3px 1px rgba(60,64,67,.15)";
		page.style.backgroundColor = "#FFF";
		page.style.margin = this.pageMargin+"px auto";
		//page.style.marginTop = page.style.marginBottom = "";
		page.style.position = "relative";
		page.style.pageBreakAfter = "always";
		//page.style.display = "flex";

		page.style.width = `${section.width / 7200}in`;
		page.style.height = `${section.height / 7200}in`;
		// TODO: (@hahnlee) header 정의하기
		page.style.paddingTop = `${(section.paddingTop + section.headerPadding) / 7200}in`;
		page.style.paddingRight = `${section.paddingRight / 7200}in`;
		page.style.paddingBottom = `${section.paddingBottom / 7200}in`;
		page.style.paddingLeft = `${section.paddingLeft / 7200}in`;

		page.classList.add("hwpjs-page");
		page.setAttribute("data-page-number", index.toString());
		page.setAttribute("contenteditable", "true");

		const lt = this.createPaddingMark();
		lt.style.left = `calc(${page.style.paddingLeft} - 20px)`;
		lt.style.top = `calc(${page.style.paddingTop} - 20px)`;
		lt.style.borderWidth = "0 1px 1px 0";
		const rt = this.createPaddingMark();
		rt.style.right = `calc(${page.style.paddingRight} - 20px)`;
		rt.style.top = `calc(${page.style.paddingTop} - 20px)`;
		rt.style.borderWidth = "0 0 1px 1px";
		const rb = this.createPaddingMark();
		rb.style.right = `calc(${page.style.paddingRight} - 20px)`;
		rb.style.bottom = `calc(${page.style.paddingBottom} - 20px)`;
		rb.style.borderWidth = "1px 0 0 1px";
		const lb = this.createPaddingMark();
		lb.style.left = `calc(${page.style.paddingLeft} - 20px)`;
		lb.style.bottom = `calc(${page.style.paddingBottom} - 20px)`;
		lb.style.borderWidth = "1px 1px 0 0";

		page.appendChild(lt);
		page.appendChild(rt);
		page.appendChild(rb);
		page.appendChild(lb);

		/* const observer = document.createElement("div");
		observer.style.height = "2px";
		observer.style.position = "absolute";
		observer.style.width = "100%";
		observer.style.top = "50%";
		observer.style.left = "0";
		observer.classList.add("hwpjs-observer");
		observer.setAttribute("data-page-number", index.toString());
		page.appendChild(observer); */

		return page;
	},
	getRGBStyle: function(rgb) {
		const [red, green, blue] = rgb;
		return `rgb(${red}, ${green}, ${blue})`;
	},
	drawBorderFill: function(doc, target, borderFillID) {
		
		if (borderFillID === undefined)
			return;
	
		const borderFill = doc.info.borderFills[borderFillID];
	
		target.style.borderTopColor = this.getRGBStyle(borderFill.style.top.color);
		target.style.borderRightColor = this.getRGBStyle(borderFill.style.right.color);
		target.style.borderBottomColor = this.getRGBStyle(borderFill.style.bottom.color);
		target.style.borderLeftColor = this.getRGBStyle(borderFill.style.left.color);
	
		target.style.borderTopWidth = BORDER_WIDTH[borderFill.style.top.width];
		target.style.borderRightWidth = BORDER_WIDTH[borderFill.style.right.width];
		target.style.borderBottomWidth = BORDER_WIDTH[borderFill.style.bottom.width];
		target.style.borderLeftWidth = BORDER_WIDTH[borderFill.style.left.width];
	
		target.style.borderTopStyle = BORDER_STYLE[borderFill.style.top.type];
		target.style.borderRightStyle = BORDER_STYLE[borderFill.style.right.type];
		target.style.borderBottomStyle = BORDER_STYLE[borderFill.style.bottom.type];
		target.style.borderLeftStyle = BORDER_STYLE[borderFill.style.left.type];
	
		if (borderFill.backgroundColor) {
			target.style.backgroundColor = this.getRGBStyle(borderFill.backgroundColor);
		}
	},
	drawColumn: function(doc, container, paragraphList) {
		const column = document.createElement('td');
		const {
			width,
			height,
			colSpan,
			rowSpan,
			borderFillID,
		} = paragraphList.attribute;
	
		column.style.width = `${width / 100}pt`;
		column.style.height = `${height / 100}pt`;
		column.colSpan = colSpan;
		column.rowSpan = rowSpan;
	
		this.drawBorderFill(doc, column, borderFillID);
	
		paragraphList.items.forEach((paragraph) => {
			this.drawParagraph(doc, column, paragraph);
		});
	
		container.appendChild(column);
	},
	drawTable: function(doc, container, control) {
		const table = document.createElement('table');
		table.style.display = 'inline-table';
		table.style.borderCollapse = 'collapse';
		table.style.width = `${control.width / 100}pt`;
		table.style.height = `${control.height / 100}pt`;
	
		const tbody = document.createElement('tbody');
	
		for (let i = 0; i < control.rowCount; i += 1) {
			const tr = document.createElement('tr');
	
			control.content[i].forEach((paragraphList) => {
				this.drawColumn(doc, tr, paragraphList);
			})
	
			tbody.appendChild(tr);
		}
	
		table.appendChild(tbody);
		container.appendChild(table);
	},
	drawShape: function(doc, container, control) {
		const shapeGroup = document.createElement('div');
		shapeGroup.style.width = `${control.width / 100}pt`;
		shapeGroup.style.height = `${control.height / 100}pt`;
	
		if (control.attribute.vertRelTo === 0) {
			shapeGroup.style.position = 'absolute';
			shapeGroup.style.top = `${control.verticalOffset / 100}pt`;
			shapeGroup.style.left = `${control.horizontalOffset / 100}pt`;
		} else {
			shapeGroup.style.marginTop = `${control.verticalOffset / 100}pt`;
			shapeGroup.style.marginLeft = `${control.horizontalOffset / 100}pt`;
		}
	
		shapeGroup.style.zIndex = `${control.zIndex}`;
		shapeGroup.style.verticalAlign = 'middle';
		shapeGroup.style.display = 'inline-block';
	
		if (isPicture(control)) {
			const image = doc.info.binData[control.info.binID];
			const blob = new Blob([image.payload], { type: `images/${image.extension}` });
			// TODO: (@hahnlee) revokeObjectURL을 관리할 수 있도록 하기
			const imageURL = window.URL.createObjectURL(blob);
			shapeGroup.style.backgroundImage = `url("${imageURL}")`;
			shapeGroup.style.backgroundRepeat = 'no-repeat';
			shapeGroup.style.backgroundPosition = 'center';
			shapeGroup.style.backgroundSize = 'contain';
		}
	
		control.content.forEach((paragraphList) => {
			paragraphList.items.forEach((paragraph) => {
				this.drawParagraph(shapeGroup, paragraph);
			})
		})
	
		container.appendChild(shapeGroup);
	},
	drawControl: function(doc, container, control) {
		if (isTable(control)) {
			this.drawTable(doc, container, control);
			return;
		}
	
		if (isShape(control)) {
			this.drawShape(doc, container, control);
		}
	},
	drawText: function(doc, container, paragraph, shapePointer, endPos) {
		const range = paragraph.content.slice(shapePointer.pos, endPos+1);
	
		const texts = [];
		let ctrlIndex = 0;
		
		//console.log("range.length = " + range.length);
		range.forEach((hwpChar) => {
			if (typeof hwpChar.value === 'string') {
				texts.push(hwpChar.value);
				return;
			}
			//console.log("hwpChar.type = " + hwpChar.type);
			//console.log(hwpChar.type === CharType.Extened);
			//console.log(hwpChar.type == CharType.Extened);
			if (hwpChar.type === CharType.Extened) {
				//console.log("hwpChar.type === CharType.Extened is matched...");
				const control = paragraph.controls[ctrlIndex];
				ctrlIndex += 1;
				this.drawControl(doc, container, control);
			}
	
			if (hwpChar.value === 13) {
				texts.push('\n');
			}
		})
	
		const text = texts.join('');
	
		const span = document.createElement('div');
		span.textContent = text;
	
		const charShape = doc.info.getCharShpe(shapePointer.shapeIndex);
	
		if (charShape) {
			const {
				fontBaseSize, fontRatio, color, fontId,
			} = charShape;
			const fontSize = fontBaseSize * (fontRatio[0] / 100);
			span.style.fontSize = `${fontSize}pt`;
			span.style.lineBreak = 'anywhere';
			span.style.whiteSpace = 'pre-wrap';
	
			span.style.color = this.getRGBStyle(color);
	
			const fontFace = doc.info.fontFaces[fontId[0]];
			span.style.fontFamily = fontFace.getFontFamily();
		}
		container.appendChild(span);
	},
	drawParagraph: function(doc, container, paragraph) {

		if (paragraph == null) return;

		var paragraphContainer = document.createElement("div");
		paragraphContainer.style.margin = "0";
		//console.log("paragraph.shapeIndex = " + paragraph.shapeIndex);
		var shape = doc.info.paragraphShapes[paragraph.shapeIndex];
		paragraphContainer.style.textAlign = TEXT_ALIGN[shape.align];
	
		paragraph.shapeBuffer.forEach((shapePointer, index) => {
			var endPos = paragraph.getShapeEndPos(index);
			this.drawText(doc, paragraphContainer, paragraph, shapePointer, endPos);
		})
		container.append(paragraphContainer);
	},
	drawSection: function(doc, container, section, index) {
		var page = this.createPage(section, index);
		this.pages.push(page);
		//console.log(section.content.length);
		section.content.forEach((paragraph) => {
			this.drawParagraph(doc, page, paragraph);
		});
		container.appendChild(page);
	},

});