/**
 * @desc 
 */
 nhn.husky.SE_EditingArea_Wysiwyg = jindo.$Class({
	mode: "WYSIWYG",
	name: "SE_EditingArea_Wysiwyg",

	/* RATIO: 3.78, //ratio=px/mm, mm to px ratio
	documentWidth: Math.floor(210*this.RATIO), //px
	documentHeight: Math.floor(297*this.RATIO), //px
	documentMargin: 20, //px */

	$init: function(appContainer) {
		console.log("$init() is called...");
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
		this.paperHtml = editingArea.querySelector("#paperHtml");;

		//주요 상수값들 및 변수 선언
		this.RATIO = 3.78; //ratio=px/mm; mm to px ratio
		this.paperWidth = Math.floor(210*this.RATIO); //px
		this.paperHeight = Math.floor(297*this.RATIO); //px
		this.paperMargin = 20; //px

		this.paddingTop = Math.floor(20*this.RATIO);
		this.paddingBottom = Math.floor(15*this.RATIO);
		this.paddingLeft = Math.floor(30*this.RATIO);
		this.paddingRight = Math.floor(30*this.RATIO);
		this.paddingHead = Math.floor(15*this.RATIO);
		this.paddingTail = Math.floor(15*this.RATIO); //px

		this.paperHtml.style.width = this.paperWidth+/* this.paperMargin*2+ */"px";
		this.paperHtml.style.height = this.paperHeight+/* this.paperMargin*2+ */"px";
		this.paperHtml.style.paddingLeft = this.paddingLeft+"px";
		this.paperHtml.style.paddingTop = this.paddingTop+"px";
		this.paperHtml.style.paddingRight = this.paddingRight+"px";
		this.paperHtml.style.paddingBottom = this.paddingBottom+"px";
		//this.paperHtml.style.left = this.paperMargin;
		this.paperHtml.style.top = this.paperMargin+"px";
	},

	$BEFORE_MSG_APP_READY: function() {
	},

	$ON_MSG_APP_READY: function() {
		//this.oEditingArea = this.editingArea;
		//this.oApp.registerBrowserEvent(this.scrollView, "scroll", "EVENT_SCROLL_VIEW_SCROLL", [], null, 10);
		this.oApp.registerBrowserEvent(window, "resize", "EVENT_WINDOW_RESIZE", [], null, 100);
	},

	$AFTER_MSG_APP_READY : function() {
		this.oApp.exec("EVENT_WINDOW_RESIZE");
		this.oApp.exec("REGISTER_EDITING_AREA", [this]);
	},

	$ON_EVENT_SCROLL_VIEW_SCROLL: function() {
		this.editingArea.scrollTop = this.scrollView.scrollTop;
		this.editingArea.scrollLeft = this.scrollView.scrollLeft;

	},

	$ON_EVENT_WINDOW_RESIZE: function() {
		this.editingArea.style.width = 100+"%";
		this.editingArea.style.height = this.appContainer.clientHeight - (this.menuBar.clientHeight + this.toolBar.clientHeight + this.ruler.clientHeight + this.statusBar.clientHeight) + "px";

		//this.scrollView.style.width = this.editingArea.clientWidth+"px";
		//this.scrollView.style.height = this.editingArea.clientHeight+"px";

		var editingAreaWidth = this.editingArea.clientWidth,
			editingAreaHeight = this.editingArea.clientHeight;
		
		var paperLeftPos = (editingAreaWidth - this.paperWidth) / 2;
		if (paperLeftPos < 0) paperLeftPos = this.paperMargin;
		this.paperHtml.style.left = paperLeftPos+"px";

		var scrollViewWidth = Math.max(this.paperWidth+this.paperMargin*2, editingAreaWidth);
		var scrollViewHeight = this.paperHeight+this.paperMargin*2;

		this.scrollViewHorizontal.style.width = scrollViewWidth+"px";
		this.scrollViewVertical.style.height = scrollViewHeight+"px";

		//this.oApp.exec("EDITING_AREA_PAINT");
		//this.oApp.exec("POSITION_PAPER");
		this.oApp.exec("POSITION_CENTER");
	},

	$ON_POSITION_CENTER: function() {
		var editingAreaWidth = this.editingArea.clientWidth,
		editingAreaHeight = this.editingArea.clientHeight;
		var scrollViewWidth = this.scrollViewHorizontal.clientWidth;
		
		if (scrollViewWidth > editingAreaWidth) {
			this.editingArea.scrollLeft = (scrollViewWidth-editingAreaWidth)/2;
		}
	},

	$ON_PASTE_HTML: function(sHTML, oPSelection, htOption) {
		//this.oApp.exec("EVENT_WINDOW_RESIZE");
	},
	
});