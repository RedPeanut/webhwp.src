/*
Copyright (C) NAVER corp.  

This library is free software; you can redistribute it and/or  
modify it under the terms of the GNU Lesser General Public  
License as published by the Free Software Foundation; either  
version 2.1 of the License, or (at your option) any later version.  

This library is distributed in the hope that it will be useful,  
but WITHOUT ANY WARRANTY; without even the implied warranty of  
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU  
Lesser General Public License for more details.  

You should have received a copy of the GNU Lesser General Public  
License along with this library; if not, write to the Free Software  
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA  
*/
/**
 * @pluginDesc IR 값과 복수개의 편집 영역을 관리하는 플러그인
 */
nhn.husky.SE_EditingAreaManager = jindo.$Class({
	name : "SE_EditingAreaManager",
	
	$init: function(sDefaultEditingMode, elContentsField, oDimension, fOnBeforeUnload, elAppContainer) {
		this.sDefaultEditingMode = sDefaultEditingMode;
		this.elContentsField = jindo.$(elContentsField);
		this.elEditingAreaContainer = jindo.$$.getSingle("div.container", elAppContainer);
		this.fOnBeforeUnload = fOnBeforeUnload;
		
		this.oEditingMode = {};
		
		this.elContentsField.style.display = "none";
	},

	$BEFORE_MSG_APP_READY: function(/*msg*/) {
	},

	$ON_MSG_APP_READY: function() {
	},

	$AFTER_MSG_APP_READY: function() {
		//this.oApp.exec("UPDATE_RAW_CONTENTS");
	},

	$ON_LOAD_CONTENTS_FIELD: function(bDontAddUndo) {
		var sContentsFieldValue = this.elContentsField.value;
		this.oApp.exec("SET_CONTENTS", [sContentsFieldValue, bDontAddUndo]);
	},
	
	// 현재 contents를 form의 textarea에 세팅 해 줌.
	// form submit 전에 이 부분을 실행시켜야 됨.
	$ON_UPDATE_CONTENTS_FIELD: function() {
		//this.oIRField.value = this.oApp.getIR();
		this.elContentsField.value = this.oApp.getContents();
		//this.oApp.exec("UPDATE_RAW_CONTENTS");
		//this.sCurrentRawContents = this.elContentsField.value;
	},
	
	// 에디터의 현재 상태를 기억해 둠. 페이지를 떠날 때 이 값이 변경 됐는지 확인 해서 내용이 변경 됐다는 경고창을 띄움
	// RawContents 대신 contents를 이용해도 되지만, contents 획득을 위해서는 변환기를 실행해야 되기 때문에 RawContents 이용
	$ON_UPDATE_RAW_CONTENTS: function() {
		this.sCurrentRawContents = this.oApp.getRawContents();
	},
	
	$BEFORE_CHANGE_EDITING_MODE: function(sMode) {
		if (!this.oEditingMode[sMode])
			return false;
		
		this.oPrevActivePlugin = this.oActivePlugin;
		this.oActivePlugin = this.oEditingMode[sMode];
	},

	$AFTER_CHANGE_EDITING_MODE: function(sMode, bNoFocus) {
		if (this.oPrevActivePlugin) {
			var sIR = this.oPrevActivePlugin.getIR();
			this.oApp.exec("SET_IR", [sIR]);
			//this.oApp.exec("ENABLE_UI", [this._oPrevActivePlugin.sMode]);
			this._setEditingAreaDimension();
		}
		//this.oApp.exec("DISABLE_UI", [this.oActivePlugin.sMode]);
		
		if (!bNoFocus) {
			this.oApp.delayedExec("FOCUS", [], 0);
		}
	},

	$ON_REGISTER_EDITING_AREA: function(oEditingAreaPlugin) {
		this.oEditingMode[oEditingAreaPlugin.mode] = oEditingAreaPlugin;
		//if (oEditingAreaPlugin.type == 'WYSIWYG')
			//this.attachDocumentEvents(oEditingAreaPlugin.paperHtml);
		//this._setEditingAreaDimension(oEditingAreaPlugin);
	},

	$ON_EVENT_EDITING_AREA_KEYDOWN: function() {
	},

	$ON_EVENT_EDITING_AREA_MOUSEDOWN: function() {
	},

	$ON_EVENT_EDITING_AREA_SCROLL: function() {
	},

	attachDocumentEvents: function(doc) {
		this.oApp.registerBrowserEvent(doc, "click", "EVENT_EDITING_AREA_CLICK");
		this.oApp.registerBrowserEvent(doc, "dblclick", "EVENT_EDITING_AREA_DBLCLICK");
		this.oApp.registerBrowserEvent(doc, "mousedown", "EVENT_EDITING_AREA_MOUSEDOWN");
		this.oApp.registerBrowserEvent(doc, "mousemove", "EVENT_EDITING_AREA_MOUSEMOVE");
		this.oApp.registerBrowserEvent(doc, "mouseup", "EVENT_EDITING_AREA_MOUSEUP");
		this.oApp.registerBrowserEvent(doc, "mouseout", "EVENT_EDITING_AREA_MOUSEOUT");
		this.oApp.registerBrowserEvent(doc, "mousewheel", "EVENT_EDITING_AREA_MOUSEWHEEL");
		this.oApp.registerBrowserEvent(doc, "keydown", "EVENT_EDITING_AREA_KEYDOWN");
		this.oApp.registerBrowserEvent(doc, "keypress", "EVENT_EDITING_AREA_KEYPRESS");
		this.oApp.registerBrowserEvent(doc, "keyup", "EVENT_EDITING_AREA_KEYUP");
		this.oApp.registerBrowserEvent(doc, "scroll", "EVENT_EDITING_AREA_SCROLL");
	},

	getRawContents: function() {
		if (!this.oActivePlugin)
			return "";
		return this.oActivePlugin.getRawContents();
	},
	
	getContents: function() {
	},
	
	setContents: function(sContents, bDontAddUndo) {
	},
	
	getEditingMode: function() {
		return this.oActivePlugin.sMode;
	},
	
	getEditingAreaWidth: function() {
		return this.elEditingAreaContainer.offsetWidth;
	},
	
	getEditingAreaHeight: function() {
		return this.elEditingAreaContainer.offsetHeight;
	},

	getWindow: function() {
		return window;
	},

	getDocument: function() {
		return document;
	},
});