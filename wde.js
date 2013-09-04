

E.wde = {
	run: function() {
		if("undefined" == typeof(E.config.wde))
			throw new Error("Web Desktop Environment not configured.");
		
		E.appendStyleSheet(E.config.wde.root + "/css/login.css");
			
		if(null == E.config.wde.env) {
			E.ajax({
				url: E.config.wde.controller.replace(":action","environment"),
				onSuccess: function() {
					answer = JSON.parse(this.request.responseText);
					if ("success" == answer.status) {
						//TODO
						E.log("start init wde");
					} else {
						E.wde.showLoginDialog();
					}
					
				},
				onError: function() {
					alert("Euphoria Critical Error", "Can't get environment from server!", E.wde.msbBox.status.error);
				}	
			});
		
		}
	},
	
	alert: function(title, message, status) {
		// TODO alert msgbox
		alert(message);
	},
	
	msgBox: {
		status: {
			error: -1,
			failure: 0,
			success: 1,			
			info: 2
		}
	},
// login dialog

	showLoginDialog: function() {
		var loginDialogLayer = E.elementFactory({
			tag: "div",
			cls: "login-dialog-layer",
			id: "login-dialog-layer",
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
									html: E.config.wde.login.signInTitle
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
		
		document.body.appendChild(loginDialogLayer);
	}	
};
