/**
 * @desc 
 */
nhn.husky.SE_EditingArea_Canvas = jindo.$Class({
	name : "SE_EditingArea_Canvas",
	status : nhn.husky.PLUGIN_STATUS.NOT_READY,

	sMode : "Canvas",
	elDocument : null,
	doc : null,
	
	bStopCheckingBodyHeight : false, 
	bAutoResize : false,	// [SMARTEDITORSUS-677] 해당 편집모드의 자동확장 기능 On/Off 여부
	
	nBodyMinHeight : 0,
	nScrollbarWidth : 0,
	
	iLastUndoRecorded : 0,
	//iMinUndoInterval : 50,
	
	_nIFrameReadyCount : 50,
	
	//bWYSIWYGEnabled : false,
	
	$init : function(elAppContainer){
		//var elContainer = jindo.$$.getSingle("div.container", elAppContainer);
		//this.elDocument = jindo.$$.getSingle("div.document", elAppContainer);
		this.htOptions = nhn.husky.SE2M_Configuration.SE_EditingAreaManager;
		this.elEditingArea = jindo.$$.getSingle("div.editing_area", elAppContainer);
		//this.elEditor = carota.editor.create(this.elEditingArea);
		
		var fHandlerSuccess, fHandlerFail;
		this.status = nhn.husky.PLUGIN_STATUS.READY;
	},

	$BEFORE_MSG_APP_READY : function(){
		//this.oEditingArea = this.iframe.contentWindow.document;
		this.oApp.exec("REGISTER_EDITING_AREA", [this]);
		this.oApp.exec("ADD_APP_PROPERTY", ["getWindow", jindo.$Fn(this.getWindow, this).bind()]);
		this.oApp.exec("ADD_APP_PROPERTY", ["getDocument", jindo.$Fn(this.getDocument, this).bind()]);
		//this.oApp.exec("ADD_APP_PROPERTY", ["isCanvasEnabled", jindo.$Fn(this.isCanvasEnabled, this).bind()]);
		this.oApp.exec("ADD_APP_PROPERTY", ["getRawHTMLContents", jindo.$Fn(this.getRawHTMLContents, this).bind()]);
		this.oApp.exec("ADD_APP_PROPERTY", ["setRawHTMLContents", jindo.$Fn(this.setRawHTMLContents, this).bind()]);
		
		/* if (this.isWYSIWYGEnabled()) {
			this.oApp.exec('ENABLE_WYSIWYG_RULER');
		} */
		
		this.oApp.registerBrowserEvent(this.getDocument(), 'paste', 'EVENT_EDITING_AREA_PASTE');
		this.oApp.registerBrowserEvent(this.getDocument(), 'drop', 'EVENT_EDITING_AREA_DROP');
	},

	$ON_MSG_APP_READY : function(){
		if(!Object.prototype.hasOwnProperty.call(this.oApp, "saveSnapShot")){
			this.$ON_EVENT_EDITING_AREA_MOUSEUP = function(){};
			this._recordUndo = function(){};
		}
		
		// uncomment this line if you wish to use the IE-style cursor in FF
		// this.getDocument().body.style.cursor = "text";

		// Do not update this._oIERange until the document is actually clicked (focus was given by mousedown->mouseup)
		// Without this, iframe cannot be re-selected(by RESTORE_IE_SELECTION) if the document hasn't been clicked
		// mousedown on iframe -> focus goes into the iframe doc -> beforedeactivate is fired -> empty selection is saved by the plugin -> empty selection is recovered in RESTORE_IE_SELECTION
		this._bIERangeReset = true;

		// [SMARTEDITORSUS-2149] win10_edge 추가 (TODO: 추후 win10 정식릴리즈시 ua 재확인필요)
		if(this.oApp.oNavigator.ie || navigator.userAgent.indexOf("Edge") > -1){
			this._bIECursorHide = true;
			jindo.$Fn(
				function(weEvent){
					var oSelection = this.iframe.contentWindow.document.selection;
					if(oSelection && oSelection.type.toLowerCase() === 'control' && weEvent.key().keyCode === 8){
						this.oApp.exec("EXECCOMMAND", ['delete', false, false]);
						weEvent.stop();
					}
					
					this._bIERangeReset = false;
				}, this
			).attach(this.iframe.contentWindow.document, "keydown");
			jindo.$Fn(
				function(){
					this._oIERange = null;
					this._bIERangeReset = true;
				}, this
			).attach(this.iframe.contentWindow.document.body, "mousedown");

			// [SMARTEDITORSUS-1810] document.createRange 가 없는 경우만(IE8이하) beforedeactivate 이벤트 등록
			if(!this.getDocument().createRange){
				jindo.$Fn(this._onIEBeforeDeactivate, this).attach(this.iframe.contentWindow.document.body, "beforedeactivate");
			}
			
			jindo.$Fn(
				function(){
					this._bIERangeReset = false;
				}, this
			).attach(this.iframe.contentWindow.document.body, "mouseup");
		}else if(this.oApp.oNavigator.bGPadBrowser){
			// [SMARTEDITORSUS-1802] GPad 에서만 툴바 터치시 셀렉션을 저장해둔다.
			this.$ON_EVENT_TOOLBAR_TOUCHSTART = function(){
				this._oIERange = this.oApp.getSelection().cloneRange();
			}
		}
		
		// DTD가 quirks가 아닐 경우 body 높이 100%가 제대로 동작하지 않아서 타임아웃을 돌며 높이를 수동으로 계속 할당 해 줌 
		// body 높이가 제대로 설정 되지 않을 경우, 보기에는 이상없어 보이나 마우스로 텍스트 선택이 잘 안된다든지 하는 이슈가 있음
		this.fnSetBodyHeight = jindo.$Fn(this._setBodyHeight, this).bind();
		this.fnCheckBodyChange = jindo.$Fn(this._checkBodyChange, this).bind();

		this.fnSetBodyHeight();
		this._nContainerHeight = this.oApp.getEditingAreaHeight();	// 편집영역이 리사이즈되었는지 체크하기 위해 초기값 할당
		
		this._setScrollbarWidth();
	},

	$ON_REGISTER_CONVERTERS : function(){
		this.oApp.exec("ADD_CONVERTER_DOM", ["DB_TO_IR", jindo.$Fn(this._dbToIrDOM, this).bind()]);
	},

	/**
	 * [SMARTEDITORSUS-2315] setContents가 될때 폰트태그를 정제해준다.
	 */
	_dbToIrDOM : function(oTmpNode){
		nhn.husky.SE2M_Utils.removeInvalidFont(oTmpNode);
		nhn.husky.SE2M_Utils.convertFontToSpan(oTmpNode);
	},

	/**
	 * 스크롤바의 사이즈 측정하여 설정
	 */
	_setScrollbarWidth : function(){
		var oDocument = this.getDocument(),
			elScrollDiv = oDocument.createElement("div");
		
		elScrollDiv.style.width = "100px";
		elScrollDiv.style.height = "100px";
		elScrollDiv.style.overflow = "scroll";
		elScrollDiv.style.position = "absolute";
		elScrollDiv.style.top = "-9999px";
				
		oDocument.body.appendChild(elScrollDiv);

		this.nScrollbarWidth = elScrollDiv.offsetWidth - elScrollDiv.clientWidth;
		
		oDocument.body.removeChild(elScrollDiv);
	},
	
	/**
	 * [SMARTEDITORSUS-677] 붙여넣기나 내용 입력에 대한 편집영역 자동 확장 처리
	 */ 
	$AFTER_EVENT_EDITING_AREA_KEYUP : function(oEvent){		
		if(!this.bAutoResize){
			return;
		}
		
		var oKeyInfo = oEvent.key();

		if((oKeyInfo.keyCode >= 33 && oKeyInfo.keyCode <= 40) || oKeyInfo.alt || oKeyInfo.ctrl || oKeyInfo.keyCode === 16){
			return;
		}
		
		this._setAutoResize();
	},
	
	/**
	 * [SMARTEDITORSUS-677] WYSIWYG 편집 영역 자동 확장 처리 시작
	 */ 
	startAutoResize : function(){},
	
	/**
	 * [SMARTEDITORSUS-677] WYSIWYG 편집 영역 자동 확장 처리 종료
	 */ 
	stopAutoResize : function(){},
	
	/**
	 * [SMARTEDITORSUS-677] 편집 영역 Body가 변경되었는지 주기적으로 확인
	 */ 
	_checkBodyChange : function(){},
	
	/**
	 * [SMARTEDITORSUS-677] WYSIWYG 자동 확장 처리
	 */ 
	_setAutoResize : function(){	},
	
	// [SMARTEDITORSUS-1756]
	_getStyleSize : function(oCurrentStyle){
		/**
		 * this.iframe의 height style에 반영되는 높이값인
		 * nContainerHeight를 결정짓는 nStyleSize의 경우,
		 * 기존 로직에서는
		 * nStyleSize = parseInt(oCurrentStyle.fontSize, 10) * oCurrentStyle.lineHeight;
		 * 와 같이 값을 산정한다.
		 * 
		 * SmartEditor에서만 생산한 컨텐츠의 경우,
		 * font-size 값은 px 단위형 숫자이고,
		 * line-height 값은 배수형 숫자이다.
		 * 
		 * 따라서 nStyleSize는 이 산정으로 px 단위의 숫자값을 가지게 된다.
		 * 
		 * 하지만 외부에서 붙여넣은 컨텐츠는 다양한 형태의 font-size값과 line-height 값을 가질 수 있다.
		 * 그 중 일부 값은 nStyleSize를 NaN으로 만들기 때문에, 
		 * 컨텐츠가 화면에서 사라진 것처럼 보이는 현상을 일으킨다.
		 * 
		 * 또한 "px 단위형 - 배수형" 이라는 틀에 맞지 않으면
		 * 부적절한 결과를 야기할 수 있다.
		 * 
		 * 따라서 font-size 값을 px 단위형 숫자로,
		 * line-height 값을 배수형 숫자로 보정해 줘서, 
		 * nStyleSize가 숫자형이 될 수 있도록 만들어 준다.
		 * 
		 * line-height의 보정은 아래를 참조한다. (http://www.w3schools.com/cssref/pr_dim_line-height.asp)
		 * -"normal" : 통상 120%에 대응하며, 정확한 값은 font-family에 좌우 (https://developer.mozilla.org/en-US/docs/Web/CSS/line-height)
		 * --ex) verdana 폰트
		 * ---12px~15일 때 120% 에 대응
		 * ---16일 때 115%
		 * ---17일 때 120%
		 * ---18~20일 때 125%
		 * -배수형 숫자
		 * -단위형 숫자 (pt, px, em, cm 등)
		 * --pt : 12pt = 16px = 100%
		 * --em : 1em = 12pt = 16px = 100%
		 * --cm : 1inch = 2.54cm = 96px 이므로 1cm = (1/2.54*96) = 약 37.795px
		 * -%형
		 * -"initial"
		 * -"inherit" : 부모 엘리먼트의 값에 의해 좌우됨
		 * 
		 * font-size의 보정은 아래를 참조한다. (http://www.w3schools.com/cssref/pr_font_font-size.asp)
		 * -"medium" : 16px = 100%
		 * -단위형은 line-height와 같이 처리
		 * */
		var nResult;
		if(oCurrentStyle){
			// line-height 값을 배수형으로 보정
			var nLineHeight = oCurrentStyle.lineHeight;
			if(nLineHeight && /[^\d.]/.test(nLineHeight)){ // 배수형이 아닌 경우
				if(/\d/.test(nLineHeight) && /[A-Za-z]/.test(nLineHeight)){ // 단위형 : 실제 원하는 최종 결과값인 만큼, px 단위형으로 변환만 거친 뒤 return
					if(/px$/.test(nLineHeight)){ // px 단위형 : 최종 결과값
						return parseFloat(nLineHeight, 10);
					}else if(/pt$/.test(nLineHeight)){ // pt 단위형
						return parseFloat(nLineHeight, 10) * 4 / 3;
					}else if(/em$/.test(nLineHeight)){ // em 단위형
						return parseFloat(nLineHeight, 10) * 16;
					}else if(/cm$/.test(nLineHeight)){ // cm 단위형
						return parseFloat(nLineHeight, 10) * 96 / 2.54;
					}
				}else if(/\d/.test(nLineHeight) && /%/.test(nLineHeight)){ // %형
					nLineHeight = parseFloat(nLineHeight, 10) * 100;
				}else if(!/[^A-Za-z]/.test(nLineHeight)){ // TODO : "normal", "inherit", "initial" 세분화
					nLineHeight = 1.2;
				}
			}
			
			// font-size 값을 px 단위형으로 보정
			var sFontSize = oCurrentStyle.fontSize;
			if(sFontSize && !/px$/.test(sFontSize)){ // px 단위형이 아닌 경우
				if(/pt$/.test(sFontSize)){ // pt 단위형
					sFontSize = parseFloat(sFontSize, 10) * 4 / 3 + "px";
				}else if(/em$/.test(sFontSize)){ // em 단위형
					sFontSize = parseFloat(sFontSize, 10) * 16 + "px";
				}else if(/cm$/.test(sFontSize)){ // cm 단위형
					sFontSize = parseFloat(sFontSize, 10) * 96 / 2.54 + "px";
				}else if(sFontSize == "medium"){ // "medium"
					sFontSize = "16px";
				}else{ // TODO : 다양한 small, large 종류가 존재 
					sFontSize = "16px";
				}
			}
			
			nResult = parseFloat(sFontSize, 10) * nLineHeight;
		}else{
			nResult = 12 * 1.5;
		}
		
		return nResult;
	},
	// --[SMARTEDITORSUS-1756]
	
	/**
	 * 스크롤 처리를 위해 편집영역 Body의 사이즈를 확인하고 설정함
	 * 편집영역 자동확장 기능이 Off인 경우에 주기적으로 실행됨
	 */ 
	_setBodyHeight : function(){},
	
	/**
	 * 가로 스크롤바 생성 확인
	 */
	_isHorizontalScrollbarVisible : function(){
		var oDocument = this.getDocument();
		
		if(oDocument.documentElement.clientWidth < oDocument.documentElement.scrollWidth){
			//oDocument.body.clientWidth < oDocument.body.scrollWidth ||
			
			return true;
		}
		
		return false;
	},
	
	/**
	 *  body의 offset체크를 멈추게 하는 함수.
	 */
	$ON_STOP_CHECKING_BODY_HEIGHT :function(){
		if(!this.bStopCheckingBodyHeight){
			this.bStopCheckingBodyHeight = true;
		}
	},
	
	/**
	 *  body의 offset체크를 계속 진행.
	 */
	$ON_START_CHECKING_BODY_HEIGHT :function(){
		if(this.bStopCheckingBodyHeight){
			this.bStopCheckingBodyHeight = false;
			this.fnSetBodyHeight();
		}
	},
	
	$ON_IE_CHECK_EXCEPTION_FOR_SELECTION_PRESERVATION : function(){
		// 현재 선택된 앨리먼트가 iframe이라면, 셀렉션을 따로 기억 해 두지 않아도 유지 됨으로 RESTORE_IE_SELECTION을 타지 않도록 this._oIERange을 지워준다.
		// (필요 없을 뿐더러 저장 시 문제 발생)
		var oSelection = this.getDocument().selection;
		if(oSelection && oSelection.type === "Control"){
			this._oIERange = null;
		}
	},
	
	_onIEBeforeDeactivate : function(){
		this.oApp.delayedExec("IE_CHECK_EXCEPTION_FOR_SELECTION_PRESERVATION", null, 0);

		if(this._oIERange){
			return;
		}

		// without this, cursor won't make it inside a table.
		// mousedown(_oIERange gets reset) -> beforedeactivate(gets fired for table) -> RESTORE_IE_SELECTION
		if(this._bIERangeReset){
			return;
		}

		this._oIERange = this.oApp.getSelection().cloneRange();
	},
	
	$ON_CHANGE_EDITING_MODE : function(sMode/*, bNoFocus*/){},

	$AFTER_CHANGE_EDITING_MODE : function(/*sMode, bNoFocus*/){
		this._oIERange = null;
	},

	/* $ON_ENABLE_WYSIWYG : function(){
		this._enableWYSIWYG();
	},

	$ON_DISABLE_WYSIWYG : function(){
		this._disableWYSIWYG();
	}, */
	
	$ON_IE_HIDE_CURSOR : function(){},
	
	$AFTER_SHOW_ACTIVE_LAYER : function(){
		this.oApp.exec("IE_HIDE_CURSOR");
		this.bActiveLayerShown = true;
	},
	
	$BEFORE_EVENT_EDITING_AREA_KEYDOWN : function(/*oEvent*/){
		this._bKeyDown = true;
	},
	
	$ON_EVENT_EDITING_AREA_KEYDOWN : function(oEvent){
		if(this.oApp.getEditingMode() !== this.sMode){
			return;
		}
		
		var oKeyInfo = oEvent.key();
		if(this.oApp.oNavigator.ie){
			//var oKeyInfo = oEvent.key();
			switch(oKeyInfo.keyCode){
				case 33:
					this._pageUp(oEvent);
					break;
				case 34:
					this._pageDown(oEvent);
					break;
				case 8:		// [SMARTEDITORSUS-495][SMARTEDITORSUS-548] IE에서 표가 삭제되지 않는 문제
					this._backspace(oEvent);
					break;
				case 46:	// [SMARTEDITORSUS-2064] IE11은 delete 로 테이블 삭제가 안되서 추가함
					this._delete(oEvent);
					break;
				default:
			}
		}else if(this.oApp.oNavigator.firefox){
			// [SMARTEDITORSUS-151] FF 에서 표가 삭제되지 않는 문제
			if(oKeyInfo.keyCode === 8){				// backspace
				this._backspace(oEvent);
			}
		}
		
		this._recordUndo(oKeyInfo);	// 첫번째 Delete 키 입력 전의 상태가 저장되도록 KEYDOWN 시점에 저장
	},

	/**
	 * IE와 FF에서 백스페이스로 테이블이 삭제되지 않기 때문에 강제삭제 처리
	 */
	_backspace : function(weEvent){
		var oPrevNode = this._prepareBackspaceDelete(true);
		if(!oPrevNode){
			return;
		}

		if(this._removeUnremovable(oPrevNode, true)){
			// table 처럼 키로 삭제가 안되는 경우 강제 삭제하고 이벤트를 중단한다.
			weEvent.stop();
		}
	},

	/**
	 * [SMARTEDITORSUS-2064] IE11은 delete 로 테이블 삭제가 안되서 추가함
	 * [SMARTEDITORSUS-2184] span > p 역전현상으로 인한 오류 보정 로직 추가
	 */
	_delete : function(weEvent){
		var oNextNode = this._prepareBackspaceDelete(false);
		if(!oNextNode){
			return;
		}

		if(this._removeUnremovable(oNextNode, false)){
			// table 처럼 키로 삭제가 안되는 경우 강제 삭제하고 이벤트를 중단한다.
			weEvent.stop();
		}else if(oNextNode.nodeType === 3){
			// [SMARTEDITORSUS-2184] 텍스트 노드이면 다음 라인을 확인하여 span > p 역전된 경우 span 만 제거하도록 처리
			var oLineInfo = this.oApp.getSelection().getLineInfo(),
				oEnd = oLineInfo.oEnd.oLineBreaker,
				oNextLine = oEnd && oEnd.nextSibling;
			this._removeWrongSpan(oNextLine);
		}else{
			// [SMARTEDITORSUS-2184] span > p 역전된 경우 span 만 제거하도록 처리
			this._removeWrongSpan(oNextNode);
		}
	},

	/**
	 * backspace/delete 키에 대한 공통 전처리 과정으로
	 * 셀렉션레인지가 collapsed 상태인 경우 주변의 노드를 반환한다.
	 * @param {Boolean} bBackspace 백스페이스키 여부 (true 면 앞쪽노드를 찾고 false 면 뒤쪽노드를 찾는다.)
	 * @returns {Node} 찾은 주변 노드
	 */
	_prepareBackspaceDelete : function(bBackspace){
		var oSelection = this.oApp.getSelection();
		if(!oSelection.collapsed){
			return;
		}

		var oNode = oSelection.getNodeAroundRange(bBackspace, false);
		// LineFeed 텍스트노드라면 다음 노드를 할당
		if(this._isLineFeed(oNode)){
			oNode = bBackspace ? oSelection._getPrevNode(oNode) : oSelection._getNextNode(oNode);
		}
		/*
		 * [SMARTEDITORSUS-1575] 빈라인에 커서홀더가 삽입된 상태에서는
		 * 키를 두번 쳐야 빈줄이 삭제되기 때문에 미리 커서홀더문자는 제거한다.
		 */
		this._clearCursorHolderValue(oNode);

		return oNode;
	},

	/**
	 * 해당 텍스트 노드가 LineFeed(\n) 로만 이루어졌는지 여부
	 * @param {Node} oNode 확인할 노드
	 * @returns {Boolean} LineFeed(\n) 로만 이루어진 텍스트노드인지 여부
	 */
	_isLineFeed : function(oNode){
		return (oNode && oNode.nodeType === 3 && /^[\n]*$/.test(oNode.nodeValue));
	},

	/**
	 * 해당 텍스트 노드의 값이 커서홀더 문자이면 값을 비운다. (노드자체를 제거하지 않고 문자값만 비운다.)
	 * @param {Node} oNode 확인할 노드
	 */
	_clearCursorHolderValue : function(oNode){
		if(oNode && oNode.nodeType === 3 &&
				(oNode.nodeValue === "\u200B" || oNode.nodeValue === "\uFEFF")){
			oNode.nodeValue = "";
		}
	},

	/**
	 * backspace나 delete 키로 삭제가 안되는 요소를 강제 삭제한다.
	 * @param {Node} oNode 확인할 노드
	 * @param {Boolean} bBackspace 백스페이스키 여부
	 * @returns {Boolean} 삭제되었으면 true 반환
	 */
	_removeUnremovable : function(oNode, bBackspace){
		var bRemoved = false;
		if(!oNode){
			return false;
		}

		if(oNode.nodeName === "TABLE"){
			oNode.parentNode.removeChild(oNode);
			bRemoved = true;
		}else if(oNode.nodeName === "DIV"){
			/*
			 * IE의 경우 텍스트가 없는 블럭요소가 삭제되지 않기 때문에 별도 처리함
			 * TODO: div 뿐만 아니라 다른 블럭요소도 마찬가지일 것으로 추정되나 일단 div에 대해서만 한정 처리함
			 */
			var oChild = bBackspace ? oNode.lastChild : oNode.firstChild;
			if(!oChild){
				oNode.parentNode.removeChild(oNode);
				bRemoved = true;
			}else if(oChild.nodeName === "TABLE"){
				oNode.removeChild(oChild);
				bRemoved = true;
			}else if(oChild.nodeType === 1 && jindo.$S(oChild.innerHTML).trim() == ""){
				oNode.removeChild(oChild);
				bRemoved = true;
			}
		}

		return bRemoved;
	},

	/**
	 * [SMARTEDITORSUS-2184] span 안쪽에 p태그가 있는 경우 span의 모든 child 노드를 밖으로 빼내고 제거한다.
	 * known-issue: span에 스타일이 적용되어 있을 경우, 적용된 스타일이 풀려버린다. 
	 * 잘못된 span에 적용된 스타일을 무조건 안쪽에 넣어주기에는 위험도가 있어서 별도 처리하지 않음 
	 * @param {Node} oNode 확인할 노드
	 */
	_removeWrongSpan : function(oNode){
		if(oNode && oNode.nodeName === "SPAN" && oNode.firstChild && oNode.firstChild.nodeName === "P"){
			var oParentNode = oNode.parentNode;
			while(oNode.firstChild){
				oParentNode.insertBefore(oNode.firstChild, oNode);
			}
			oParentNode.removeChild(oNode);
		}
	},
	
	$BEFORE_EVENT_EDITING_AREA_KEYUP : function(/*oEvent*/){
		// IE(6) sometimes fires keyup events when it should not and when it happens the keyup event gets fired without a keydown event
		if(!this._bKeyDown){
			return false;
		}
		this._bKeyDown = false;
	},
	
	$ON_EVENT_EDITING_AREA_MOUSEUP : function(/*oEvent*/){
		this.oApp.saveSnapShot();
	},

	$BEFORE_PASTE_HTML : function(){
		if(this.oApp.getEditingMode() !== this.sMode){
			this.oApp.exec("CHANGE_EDITING_MODE", [this.sMode]);
		}
	},
	
	/**
	 * @param {String}		sHTML				삽입할 HTML
	 * @param {HuskyRange}	oPSelection			재사용할 Selection 객체
	 * @param {HashTable}	htOption			추가옵션
	 * @param {Boolean}		htOption.bNoUndo	UNDO 히스토리를 저장하지 않을지 여부 
	 * @param {Boolean}		htOption.bBlock		HTML 삽입시 강제로 block 요소 처리할지 여부(true 이면 P태그 안에 삽입될 경우, P태그를 무조건 쪼개고 그 사이에 DIV태그로 감싸서 삽입한다.)
	 */
	$ON_PASTE_HTML : function(sHTML, oPSelection, htOption){
		//console.log("$ON_PASTE_HTML is called...");
		//var oSelection;
		//oSelection = oPSelection || this.oApp.getSelection();
		//oSelection.pasteHTML(sHTML, htOption.bBlock);

		//console.log("sHTML = " + sHTML);
		/* var runs = carota.html.parse(sHTML, {
			//carota: { color: 'orange', bold: true, size: 14 }
		});
		this.elEditor.load(runs); */
	},

	/**
	 * [SMARTEDITORSUS-677] 붙여넣기나 내용 입력에 대한 편집영역 자동 확장 처리
	 */
	$AFTER_PASTE_HTML : function(){
		if(!this.bAutoResize)
			return;
		this._setAutoResize();
	},
	
	/**
	 * [SMARTEDITORSUS-344]사진/동영상/지도 연속첨부시 포커싱 개선이슈로 추가되 함수.
	 */
	$ON_FOCUS_N_CURSOR : function (bEndCursor, sId){},
	
	/* 
	 * 엘리먼트의 top, bottom 값을 반환
	 */
	_getElementVerticalPosition : function(el){
		var nTop = 0,
			elParent = el,
			htPos = {nTop : 0, nBottom : 0};

		if(!el){
			return htPos;
		}

		// 테스트코드를 실행하면 IE8 이하에서 offsetParent 접근시 다음과 같이 알 수 없는 exception 이 발생함
		// "SCRIPT16389: 지정되지 않은 오류입니다."
		// TODO: 해결방법이 없어서 일단 try/catch 처리했지만 추후 정확한 이유를 파악할 필요가 있음
		try{
			while(elParent) {
				nTop += elParent.offsetTop;
				elParent = elParent.offsetParent;
			}
		}catch(e){/**/}

		htPos.nTop = nTop;
		htPos.nBottom = nTop + jindo.$Element(el).height();

		return htPos;
	},
	
	/* 
	 * Window에서 현재 보여지는 영역의 top, bottom 값을 반환
	 */
	_getVisibleVerticalPosition : function(){
		var oWindow, oDocument, nVisibleHeight,
			htPos = {nTop : 0, nBottom : 0};
		
		oWindow = this.getWindow();
		oDocument = this.getDocument();
		nVisibleHeight = oWindow.innerHeight ? oWindow.innerHeight : oDocument.documentElement.clientHeight || oDocument.body.clientHeight;
		
		htPos.nTop = oWindow.pageYOffset || oDocument.documentElement.scrollTop;
		htPos.nBottom = htPos.nTop + nVisibleHeight;
		
		return htPos;
	},
	
	/* 
	 * 엘리먼트가 WYSIWYG Window의 Visible 부분에서 완전히 보이는 상태인지 확인 (일부만 보이면 false)
	 */
	_isElementVisible : function(htElementPos, htVisiblePos){					
		return (htElementPos.nTop >= htVisiblePos.nTop && htElementPos.nBottom <= htVisiblePos.nBottom);
	},
	
	/* 
	 * [SMARTEDITORSUS-824] [SMARTEDITORSUS-828] 자동 스크롤 처리
	 */
	_scrollIntoView : function(el){
		var htElementPos = this._getElementVerticalPosition(el),
			htVisiblePos = this._getVisibleVerticalPosition(),
			nScroll = 0;
				
		if(this._isElementVisible(htElementPos, htVisiblePos)){
			return;
		}
				
		if((nScroll = htElementPos.nBottom - htVisiblePos.nBottom) > 0){
			this.getWindow().scrollTo(0, htVisiblePos.nTop + nScroll);	// Scroll Down
			return;
		}
		
		this.getWindow().scrollTo(0, htElementPos.nTop);	// Scroll Up
	},
	
	$BEFORE_MSG_EDITING_AREA_RESIZE_STARTED  : function(){
		// FF에서 Height조정 시에 본문의 _fitElementInEditingArea()함수 부분에서 selection이 깨지는 현상을 잡기 위해서
		// StringBookmark를 사용해서 위치를 저장해둠. (step1)
		if(!jindo.$Agent().navigator().ie){
			var oSelection = null;
			oSelection = this.oApp.getSelection();
			this.sBM = oSelection.placeStringBookmark();
		}
	},
	
	$AFTER_MSG_EDITING_AREA_RESIZE_ENDED : function(/*FnMouseDown, FnMouseMove, FnMouseUp*/){
		if(this.oApp.getEditingMode() !== this.sMode){
			return;
		}
		
		// bts.nhncorp.com/nhnbts/browse/COM-1042
		// $BEFORE_MSG_EDITING_AREA_RESIZE_STARTED에서 저장한 StringBookmark를 셋팅해주고 삭제함.(step2)
		if(!jindo.$Agent().navigator().ie){
			var oSelection = this.oApp.getEmptySelection();
			oSelection.moveToBookmark(this.sBM);
			oSelection.select();
			oSelection.removeStringBookmark(this.sBM);	
		}
	},

	$ON_CLEAR_IE_BACKUP_SELECTION : function(){
		this._oIERange = null;
	},
	
	$ON_RESTORE_IE_SELECTION : function(){
		if(this._oIERange){
			// changing the visibility of the iframe can cause an exception
			try{
				this._oIERange.select();

				this._oPrevIERange = this._oIERange;
				this._oIERange = null;
			}catch(e){/**/}
		}
	},
	
	/**
	  * EVENT_EDITING_AREA_PASTE 의 ON 메시지 핸들러
	  *		위지윅 모드에서 에디터 본문의 paste 이벤트에 대한 메시지를 처리한다.
	  *		paste 시에 내용이 붙여진 본문의 내용을 바로 가져올 수 없어 delay 를 준다.
	  */	
	$ON_EVENT_EDITING_AREA_PASTE : function(oEvent){
		this.oApp.delayedExec('EVENT_EDITING_AREA_PASTE_DELAY', [oEvent], 0);
	},

	$ON_EVENT_EDITING_AREA_PASTE_DELAY : function(weEvent) {	
		this._replaceBlankToNbsp(weEvent.element);
	},
	
	// [SMARTEDITORSUS-855] IE에서 특정 블로그 글을 복사하여 붙여넣기 했을 때 개행이 제거되는 문제
	_replaceBlankToNbsp : function(el){},
	
	_pageUp : function(we){
		var nEditorHeight = this._getEditorHeight(),
			htPos = jindo.$Document(this.oApp.getDocument()).scrollPosition(),
			nNewTop;

		if(htPos.top <= nEditorHeight){
			nNewTop = 0;
		}else{
			nNewTop = htPos.top - nEditorHeight;
		}
		this.oApp.getWindow().scrollTo(0, nNewTop);
		we.stop();
	},
	
	_pageDown : function(we){
		var nEditorHeight = this._getEditorHeight(),
			htPos = jindo.$Document(this.oApp.getDocument()).scrollPosition(),
			nBodyHeight = this._getBodyHeight(),
			nNewTop;

		if(htPos.top+nEditorHeight >= nBodyHeight){
			nNewTop = nBodyHeight - nEditorHeight;
		}else{
			nNewTop = htPos.top + nEditorHeight;
		}
		this.oApp.getWindow().scrollTo(0, nNewTop);
		we.stop();
	},
	
	_getEditorHeight : function(){
		return this.oApp.elEditingAreaContainer.offsetHeight - this.nTopBottomMargin;
	},
	
	_getBodyHeight : function(){
		return parseInt(this.getDocument().body.scrollHeight, 10);
	},
	
	initIframe : function(){},

	getIR : function(){
		var sContent = this.iframe.contentWindow.document.body.innerHTML,
			sIR;

		if(this.oApp.applyConverter){
			sIR = this.oApp.applyConverter(this.sMode+"_TO_IR", sContent, this.oApp.getDocument());
		}else{
			sIR = sContent;
		}

		return sIR;
	},

	setIR : function(sIR){
		//console.log("setIR() is called...");
		// [SMARTEDITORSUS-875] HTML 모드의 beautify에서 추가된 공백을 다시 제거
		//sIR = sIR.replace(/(>)([\n\r\t\s]*)([^<]?)/g, "$1$3").replace(/([\n\r\t\s]*)(<)/g, "$2")
		// --[SMARTEDITORSUS-875]
		
		var sContent, 
			oNavigator = this.oApp.oNavigator, 
			bUnderIE11 = oNavigator.ie && document.documentMode < 11, // IE11미만
			sCursorHolder = bUnderIE11 ? "" : "<br>";

		if(this.oApp.applyConverter){
			sContent = this.oApp.applyConverter("IR_TO_"+this.sMode, sIR, this.oApp.getDocument());
		}else{
			sContent = sIR;
		}

		// [SMARTEDITORSUS-1279] [IE9/10] pre 태그 아래에 \n이 포함되면 개행이 되지 않는 이슈
		/*if(oNavigator.ie && oNavigator.nativeVersion >= 9 && document.documentMode >= 9){
			// [SMARTEDITORSUS-704] \r\n이 있는 경우 IE9 표준모드에서 정렬 시 브라우저가 <p>를 추가하는 문제
			sContent = sContent.replace(/[\r\n]/g,"");
		}*/

		// 편집내용이 없는 경우 커서홀더로 대체
		if(sContent.replace(/[\r\n\t\s]*/,"") === ""){
			if(this.oApp.sLineBreaker !== "BR"){
				sCursorHolder = "<p>" + sCursorHolder + "</p>";
			}
			sContent = sCursorHolder;
		}

		// TODO: 
		//this.iframe.contentWindow.document.body.innerHTML = sContent;

		// [COM-1142] IE의 경우 <p>&nbsp;</p> 를 <p></p> 로 변환
		// [SMARTEDITORSUS-1623] IE11은 <p></p>로 변환하면 라인이 붙어버리기 때문에 IE10만 적용하도록 수정
		if(bUnderIE11 && this.oApp.getEditingMode() === this.sMode){
			var pNodes = this.oApp.getDocument().body.getElementsByTagName("P");

			for(var i=0, nMax = pNodes.length; i < nMax; i++){
				if(pNodes[i].childNodes.length === 1 && pNodes[i].innerHTML === "&nbsp;"){
					pNodes[i].innerHTML = '';
				}
			}
		}
	},

	getRawContents : function(){
		//return this.iframe.contentWindow.document.body.innerHTML;
	},

	getRawHTMLContents : function(){
		return this.getRawContents();
	},

	setRawHTMLContents : function(sContents){
		//this.iframe.contentWindow.document.body.innerHTML = sContents;
		var runs = carota.html.parse(sContents, {});
		this.elEditor.load(runs);
	},

	getWindow : function(){
		return window;
	},

	getDocument : function(){
		return document;
	},
	
	getEditArea : function(){
		return this.elEditArea;
	},

	getEditor : function() {
		return this.elEditor;
	},

	focus : function(){
		//this.getWindow().focus();
		this.getDocument().body.focus();
		this.oApp.exec("RESTORE_IE_SELECTION");
	},
	
	_recordUndo : function(oKeyInfo){
		/**
		 * 229: Korean/Eng
		 * 16: shift
		 * 33,34: page up/down
		 * 35,36: end/home
		 * 37,38,39,40: left, up, right, down
		 * 32: space
		 * 46: delete
		 * 8: bksp
		 */
		if(oKeyInfo.keyCode >= 33 && oKeyInfo.keyCode <= 40){	// record snapshot
			this.oApp.saveSnapShot();
			return;
		}

		if(oKeyInfo.alt || oKeyInfo.ctrl || oKeyInfo.keyCode === 16){
			return;
		}

		if(this.oApp.getLastKey() === oKeyInfo.keyCode){
			return;
		}
		
		this.oApp.setLastKey(oKeyInfo.keyCode);

		// && oKeyInfo.keyCode != 32		// 속도 문제로 인하여 Space 는 제외함
		if(!oKeyInfo.enter && oKeyInfo.keyCode !== 46 && oKeyInfo.keyCode !== 8){
			return;
		}
	
		this.oApp.exec("RECORD_UNDO_ACTION", ["KEYPRESS(" + oKeyInfo.keyCode + ")", {bMustBlockContainer:true}]);
	},
	
	/* _enableWYSIWYG : function(){
		//if (this.iframe.contentWindow.document.body.hasOwnProperty("contentEditable")){
		if (this.iframe.contentWindow.document.body.contentEditable !== null) {
			this.iframe.contentWindow.document.body.contentEditable = true;
		} else {
			this.iframe.contentWindow.document.designMode = "on";
		}
				
		this.bWYSIWYGEnabled = true;		
		if(jindo.$Agent().navigator().firefox){
			setTimeout(jindo.$Fn(function(){
				//enableInlineTableEditing : Enables or disables the table row and column insertion and deletion controls. 
				this.iframe.contentWindow.document.execCommand('enableInlineTableEditing', false, false);
			}, this).bind(), 0);
		}
	},
	
	_disableWYSIWYG : function(){
		//if (this.iframe.contentWindow.document.body.hasOwnProperty("contentEditable")){
		if (this.iframe.contentWindow.document.body.contentEditable !== null){
			this.iframe.contentWindow.document.body.contentEditable = false;
		} else {
			this.iframe.contentWindow.document.designMode = "off";
		}
		this.bWYSIWYGEnabled = false;
	},
	
	isWYSIWYGEnabled : function(){
		return this.bWYSIWYGEnabled;
	} */
});
//}