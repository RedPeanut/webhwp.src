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
//{
/**
 * @fileOverview This file contains Husky plugin that takes care of the basic editor commands
 * @name hp_SE_ExecCommand.js
 */
nhn.husky.SE2M_ExecCommand = jindo.$Class({
	name:"SE2M_ExecCommand",

	$init: function(elAppContainer) {
		this.$file = $("input[type=file]");
		this.$file.on("change", function() {
			//document.loadForm.submit();
		});
	},

	$BEFORE_MSG_APP_READY: function() {
	},

	$ON_MSG_APP_READY: function() {
		this.oApp.exec("REGISTER_MENU_EVENT", ["FILE_LOAD", "click", "EXECCOMMAND", ["FILE_LOAD", false, false]]);
		this.oApp.exec("REGISTER_MENU_EVENT", ["FILE_DOWNLOAD", "click", "EXECCOMMAND", ["FILE_DOWNLOAD", false, false]]);
	},

	$BEFORE_EXECCOMMAND: function(sCommand, bUserInterface, vValue, htOptions) {

	},
	
	$ON_EXECCOMMAND: function(sCommand, bUserInterface, vValue) {
		//console.log("$ON_EXECCOMMAND is called...");
		//console.log("sCommand = " + sCommand);
		switch(sCommand) {
			case "FILE_LOAD":
				this.$file.click();
				break;
			case "FILE_DOWNLOAD":

				break;
		}
	},
	
	$AFTER_EXECCOMMAND: function(sCommand, bUserInterface, vValue, htOptions) {
	},

});
