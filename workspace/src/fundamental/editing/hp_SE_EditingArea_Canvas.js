/**
 * @desc 
 */
nhn.husky.SE_EditingArea_Canvas = jindo.$Class({
	mode: "CANVAS",
	name: "SE_EditingArea_Canvas",

	/* RATIO: 3.78, //ratio=px/mm, mm to px ratio
	documentWidth: Math.floor(210*this.RATIO), //px
	documentHeight: Math.floor(297*this.RATIO), //px
	documentMargin: 20, //px */

	$init: function(appContainer) {
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
		this.editCanvas = editingArea.querySelector("#editCanvas");
		
		//this.doc = carota.doc();
		this.doc = hwp.doc();

		//주요 상수값들 및 변수 선언
		this.RATIO = 3.78; //ratio=px/mm; mm to px ratio
		this.documentWidth = Math.floor(210*this.RATIO); //px
		this.documentHeight = Math.floor(297*this.RATIO); //px
		this.documentMargin = 20; //px

		this.paddingTop = Math.floor(20*this.RATIO);
		this.paddingBottom = Math.floor(15*this.RATIO);
		this.paddingLeft = Math.floor(30*this.RATIO);
		this.paddingRight = Math.floor(30*this.RATIO);
		this.paddingHead = Math.floor(15*this.RATIO);
		this.paddingTail = Math.floor(15*this.RATIO); //px

		this.offsetX = 0;
		this.offsetY = 0;
	},

	$BEFORE_MSG_APP_READY: function() {
	},

	$ON_MSG_APP_READY: function() {
		this.oApp.registerBrowserEvent(this.scrollView, "scroll", "EVENT_SCROLL_VIEW_SCROLL", [], null, 10);
		this.oApp.registerBrowserEvent(window, "resize", "EVENT_WINDOW_RESIZE", [], null, 100);
	},

	$AFTER_MSG_APP_READY : function() {
		this.oApp.exec("EVENT_WINDOW_RESIZE");
	},

	$ON_EVENT_SCROLL_VIEW_SCROLL: function() {
		this.oApp.exec("EDITING_AREA_PAINT");
	},

	$ON_EVENT_WINDOW_RESIZE: function() {
		this.editingArea.style.width = 100+"%";
		this.editingArea.style.height = this.appContainer.clientHeight - (this.menuBar.clientHeight + this.toolBar.clientHeight + this.ruler.clientHeight + this.statusBar.clientHeight) + "px";

		this.scrollView.style.width = this.editingArea.clientWidth+"px";
		this.scrollView.style.height = this.editingArea.clientHeight+"px";

		this.oApp.exec("EDITING_AREA_PAINT");
		this.oApp.exec("POSITION_CENTER");
	},

	$ON_PASTE_HTML: function(sHTML, oPSelection, htOption) {
		//console.log("$ON_PASTE_HTML is called...");
		/* var runs = carota.html.parse(sHTML, {});
		this.doc.load(runs); */
		
		this.oApp.exec("EVENT_WINDOW_RESIZE");
		//this.oApp.exec("EDITING_AREA_PAINT");
		//this.oApp.exec("POSITION_CENTER");
	},

	$ON_POSITION_CENTER: function() {
		//console.log("$ON_POSITON_CENTER is called...");
		var editingAreaWidth = this.editingArea.clientWidth,
			editingAreaHeight = this.editingArea.clientHeight;

		if (this.documentWidth > editingAreaWidth) {
			this.scrollView.scrollLeft = ((this.documentWidth+this.documentMargin*2)-editingAreaWidth)/2;
			//this.oApp.exec("EDITING_AREA_PAINT");
		}
	},
	
	$ON_EDITING_AREA_PAINT: function() {

		console.log("$ON_EDITING_AREA_PAINT is called...");

		var editingAreaWidth = this.editingArea.clientWidth,
			editingAreaHeight = this.editingArea.clientHeight;
		
		this.offsetX = (editingAreaWidth-this.documentWidth)/2;
		this.offsetY = (editingAreaHeight-this.documentHeight)/2;

		if (this.offsetX < 0) this.offsetX = 0;
		if (this.offsetY < 0) this.offsetY = 0;

		this.offsetX += this.documentMargin;
		this.offsetY += this.documentMargin;

		//console.log("this.offsetX = " + this.offsetX);
		//console.log("this.offsetY = " + this.offsetY);

		//draw paper

		var dpr = Math.max(1, window.devicePixelRatio || 1);
		
		var canvasWidth = Math.max(this.documentWidth, editingAreaWidth),
			canvasHeight = Math.min(this.documentHeight, editingAreaHeight)-16;

		this.editCanvas.width = dpr * canvasWidth;
		this.editCanvas.height = dpr * canvasHeight;
		this.editCanvas.style.width = canvasWidth+"px";
		this.editCanvas.style.height = canvasHeight+"px";

		this.scrollViewHorizontal.style.width = canvasWidth+"px";
		this.scrollViewVertical.style.height = this.documentHeight+"px";

		var ctx = this.editCanvas.getContext("2d");
		ctx.scale(dpr, dpr);
		ctx.translate(-this.scrollView.scrollLeft, -this.scrollView.scrollTop);

		ctx.clearRect(0, 0, canvasWidth, this.documentHeight);

		ctx.fillStyle = "white";
		ctx.fillRect(this.offsetX, this.offsetY, this.documentWidth, this.documentHeight);

		this._drawPaddingMark(ctx);

		var availableWidth = this.documentWidth-(this.paddingLeft+this.paddingRight),
			availableHeight = this.documentHeight-(this.paddingTop+this.paddingHead+this.paddingBottom+this.paddingTail);
		
		this.doc.layout(this.offsetX+this.paddingLeft, this.offsetY+this.paddingTop+this.paddingHead, availableWidth);
		//this.doc.draw(ctx, carota.rect(0, 0, availableWidth, availableHeight));

	},

	_drawPaddingMark: function(ctx) {

		ctx.beginPath();

		ctx.strokeStyle = "#c5c5c5";

		//LT
		ctx.moveTo(this.offsetX+this.paddingLeft, this.offsetY+this.paddingTop+this.paddingHead);
		ctx.lineTo(this.offsetX+this.paddingLeft, this.offsetY+this.paddingTop+this.paddingHead-20);
		ctx.moveTo(this.offsetX+this.paddingLeft, this.offsetY+this.paddingTop+this.paddingHead);
		ctx.lineTo(this.offsetX+this.paddingLeft-20, this.offsetY+this.paddingTop+this.paddingHead);

		//RT
		ctx.moveTo(this.offsetX+this.documentWidth-this.paddingLeft, this.offsetY+this.paddingTop+this.paddingHead);
		ctx.lineTo(this.offsetX+this.documentWidth-this.paddingLeft, this.offsetY+this.paddingTop+this.paddingHead-20);
		ctx.moveTo(this.offsetX+this.documentWidth-this.paddingLeft, this.offsetY+this.paddingTop+this.paddingHead);
		ctx.lineTo(this.offsetX+this.documentWidth-this.paddingLeft+20, this.offsetY+this.paddingTop+this.paddingHead);

		//RB
		ctx.moveTo(this.offsetX+this.documentWidth-this.paddingRight, this.offsetY+this.documentHeight-this.paddingBottom-this.paddingTail);
		ctx.lineTo(this.offsetX+this.documentWidth-this.paddingRight, this.offsetY+this.documentHeight-this.paddingBottom-this.paddingTail+20);
		ctx.moveTo(this.offsetX+this.documentWidth-this.paddingRight, this.offsetY+this.documentHeight-this.paddingBottom-this.paddingTail);
		ctx.lineTo(this.offsetX+this.documentWidth-this.paddingRight+20, this.offsetY+this.documentHeight-this.paddingBottom-this.paddingTail);

		//LB
		ctx.moveTo(this.offsetX+this.paddingLeft, this.offsetY+this.documentHeight-this.paddingBottom-this.paddingTail);
		ctx.lineTo(this.offsetX+this.paddingLeft, this.offsetY+this.documentHeight-this.paddingBottom-this.paddingTail+20);
		ctx.moveTo(this.offsetX+this.paddingLeft, this.offsetY+this.documentHeight-this.paddingBottom-this.paddingTail);
		ctx.lineTo(this.offsetX+this.paddingLeft-20, this.offsetY+this.documentHeight-this.paddingBottom-this.paddingTail);

		ctx.stroke();
	},

	$ON_EDITING_AREA_UPDATE: function() {
		var requirePaint = false;
		/* var newFocused = document.activeElement === textArea;
		if (focused !== newFocused) {
			focused = newFocused;
			requirePaint = true;
		}

		var now = new Date().getTime();
		if (now > nextCaretToggle) {
			nextCaretToggle = now + 500;
			if (this.doc.toggleCaret()) {
				requirePaint = true;
			}
		}

		if (this.editingArea.clientWidth !== cachedWidth ||
			this.editingArea.clientHeight !== cachedHeight) {
			requirePaint = true;
			cachedWidth = this.editingArea.clientWidth;
			cachedHeight = this.editingArea.clientHeight;
		} */

		if (requirePaint) {
			paint();
		}
	}
});