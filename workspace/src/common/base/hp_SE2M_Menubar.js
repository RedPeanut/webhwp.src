/**
 * @desc
 */
nhn.husky.SE2M_Menubar = jindo.$Class({
	name: "SE2M_Menubar",

	menubarArea: null,
	menubarTitle: null,
	menubarItem: null,

	_assignHTMLElements: function(container) {
		this.container = jindo.$(container) || document;
		this.menubarArea = jindo.$$.getSingle(".menu_bar", container);

		this.menus = jindo.$$(">[class*=menu_]", this.menubarArea);
		console.log("this.menus.length = " + this.menus.length);
		for (var i = 0; i < this.menus.length; i++) {
			if (new RegExp("menu_([^ ]+)").test(this.menus[i].className)) {
				var menuName = RegExp.$1;
				var items = jindo.$$("[class*=item_]", this.menus[i]);
				console.log("items.length = " + items.length);
				for (var j = 0; j < items.length; j++) {
					if (new RegExp("item_([^ ]+)").test(items[j].className)) {
						var itemName = RegExp.$1;
						//console.log("" + menuName+"_"+itemName);
						this.items[menuName+"_"+itemName] = items[j];
					}
				}
			}
		}
	},

	$init: function(container, options) {
		this._options = options || {};
		this.items = {};
		this._assignHTMLElements(container);
	},

	$ON_MSG_APP_READY: function() {
		
	},

	$ON_REGISTER_MENU_EVENT: function(sName, sEvent, sCmd, aParams) {
		var elButton;
		elButton = jindo.$Element(this.items[sName]);
		if (!elButton) return;
		this.oApp.registerBrowserEvent(elButton, sEvent, sCmd, aParams);
	},

});
