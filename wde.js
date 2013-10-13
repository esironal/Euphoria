

E.wde = {
	run: function() {
		if("undefined" === typeof(E.config.wde))
			throw new Error("Web Desktop Environment not configured.");
		
		E.appendStyleSheet(E.config.wde.root + "/css/login.css");
			
		E.include(E.config.wde.root + "/ui.js", this.initEnvironment);
	},
	
	initEnvironment: function() {		
		if(null == E.config.wde.env) {
			E.ajax({
				url: E.config.wde.controller.replace(":action","environment"),
				onSuccess: function() {
					var answer = JSON.parse(this.request.responseText);
					if ("success" == answer.status) {						
						E.config.wde.env = answer.env;
						E.wde.initDesktopLayers();
						E.wde.loginDialog.hide();						
					} else {
						if (null === E.wde.loginDialog.layer)
							E.wde.loginDialog.show();
						else this.config.onError();
					}
					
				},
				onError: function() {					
					E.wde.alert("Euphoria Critical Error", "Can't get environment from server!", E.wde.msgBox.status.error);
				}	
			});
		
		}
	},
	initDesktopLayers: function() {
		E.appendStyleSheet(E.config.wde.env.theme);
		
		E.includeList([
			E.config.wde.root + "/wallpaper.js",
			E.config.wde.root + "/windows.js",
			E.config.wde.root + "/widgets.js",
			E.config.wde.root + "/panel.js",
			E.config.wde.root + "/dialogs.js"
		], function(){
			E.wde.wallpaper.applySettings();
			E.wde.windows.layer.show();
			E.wde.panel.layer.show();
			//TODO
		}, function() {
			E.wde.alert("Euphoria Critical Error", "Can't load system javascript files", E.wde.msgBox.status.error);
		});		
	},
	createLayer: function(config) {
		var layer = E.elementFactory({
			tag: "div",
			id: config.id,
			cls: config.cls,
			style: {
				zIndex: config.zIndex,
				position: "absolute",
				top: "0px",
				left: "0px",
				minWidth: "400px",
				minHeight: "300px",
				overflow: "visible",
				display: "none"				
			}
		});
		
		if (config.fullscreen)
			layer.style.extend({
				width: "100%",
				height: "100%"
			});
		else
			layer.style.extend({
				width: "0px",
				height: "0px"
			});
			
		layer.extend({
			show: function() {
				this.style.display = "block";
			},
			hide: function() {
				this.style.display = "none";
			}
		});
		
		document.body.appendChild(layer);
		
		return layer;
	},
// message box module	
// TODO need refactoring in obedience to layers conception
	msgBox: {
		status: {
			error: -1,
			failure: 0,
			success: 1,			
			info: 2
		}
	},
	alert: function(title, message, status) {
		// TODO alert msgbox
		alert(message);
	},
// login dialog module
// TODO need refactoring in obedience to layers conception
	loginDialog: {
		layer: null,
		init: function() {
			var loginDialogLayer = E.elementFactory({
				tag: "div",
				cls: "login-dialog-layer hidden-layer",
				id: "login-dialog-layer",
				style: { display: "none" },				
				childs: [
					{
						tag: "div",
						cls: "login-dialog-container",
						childs: [
							{
								tag: "div",
								cls: "login-dialog-background"
							},
							{
								tag: "h1",
								html: E.config.wde.login.welcome
							},
							{
								tag: "form",
								id: "login-form",
								attribytes: {
									name: "login-form"
								},
								childs: [
									{
										tag: "label",
										html: E.config.wde.login.loginTitle + ":"
									},
									{
										tag: "input",
										attributes: {
											name: E.config.wde.login.loginAttribute,
										}
									},
									{
										tag: "label",
										html: E.config.wde.login.passwordTitle + ":"
									},
									{
										tag: "input",
										attributes: {
											name: E.config.wde.login.passwordAttribute,
											type: "password"
										}
									},
									{
										tag: "button",
										html: E.config.wde.login.signInTitle,
										attributes: {
											type: "button"
										},
										events: {
											onclick: function() {
												var loginData = {
													ajax: true
												};
												E.wde.loginDialog.layer.classList.add("layer-loading");
												
												loginData[E.config.wde.login.loginAttribute] = document.forms["login-form"][E.config.wde.login.loginAttribute].value;
												loginData[E.config.wde.login.passwordAttribute] = document.forms["login-form"][E.config.wde.login.passwordAttribute].value;
												E.ajax({
													url: E.config.wde.login.loginAction,
													data: loginData,
													onSuccess: E.wde.initEnvironment,
													onFailure: function() {
														E.wde.loginDialog.layer.classList.remove("layer-loading");														
														E.log(this.request.status);
														E.wde.alert("Login", "Login incorect! pleace try again.", E.wde.msgBox.status.failure);
													},
													onError: function() {
														E.wde.loginDialog.layer.classList.remove("layer-loading");
														E.wde.alert("Critical error", "Login error!", E.wde.msgBox.status.error);
													}
												});
												
												return false;
											}
										}
									}
								]
							},
							{
								tag: "span",
								html: "Work on Euphoria desktop environment"
							}
						]
					}
				]
			});
			
			this.layer = loginDialogLayer;
			
			document.body.appendChild(loginDialogLayer);
		},
		
		show: function() {
			if (null === this.layer)
				this.init();
			E.wde.loginDialog.layer.classList.remove("layer-loading");	
			E.wde.loginDialog.layer.style.display = "block";
		},
		hide: function() {
			if (null !== this.layer)
				E.wde.loginDialog.layer.style.display = "none";
		}	
	}
};
