E.wde.panel = {	
	layer: null,
	body: null,
	init: function() {
		var config = E.config.wde.env.panel;		
		if (null === this.layer) {
			this.layer = E.wde.createLayer({
				id: 'panel-layer',
				zIndex: 70000,
				fullscreen: false 				 
			});			
			this.body = E.elementFactory({
				tag: "div",
				cls: config.orientation + " " + (("left" === config.orientation || "right" === config.orientation) 
					? "vertical" : "horizontal"),
				style: {
					display: "block",
					position: "absolute"
				}							
			});	
			
			this.body.mix(E.behaviors.ui.widget);
			this.body.setBackgroundOpacity(config.opacity);		
			
			for(var controlName in this.controls) {
				if (this.controls.hasOwnProperty(controlName)) {
					var control = this.controls[controlName];
					console.log(controlName, control);				
					this.body.appendChild(control);
					
					if ("function" === typeof(control["init"]))
						control.init();
				}
			}
			
			this.body.extend(E.behaviors.ui.layout);
			this.body.initLayout(E.behaviors.ui.layout.layoutStrategy[
				("left" === config.orientation || "right" === config.orientation) ? "VBoxLayout" : "HBoxLayout"]);
			
			
			E.connect(window, "onresize", this.resize);
			
			this.layer.appendChild(this.body);
			this.resize();
		}	
	},
	resize: function() {
		var config = E.config.wde.env.panel;
		var panel = E.wde.panel;
		switch (config.orientation) {
			case "left":
				panel.body.style.extend({
					top: "0px",
					left: "0px",
					width: config.size + "px",
					height:  document.body.clientHeight + "px"
				});
				break;
			case "right":				
				panel.body.style.extend({
					top: "0px",
					left: String(document.body.clientWidth - config.size) + "px",
					width: config.size + "px",
					height:  document.body.clientHeight + "px"
				});
				break;
			case "top":
				panel.body.style.extend({
					top: "0px",
					left: "0px",
					width: document.body.clientWidth + "px",
					height:  config.size + "px"
				});			
				break;
			case "bottom":
				panel.body.style.extend({
					top: (document.body.clientHeight - config.size) + "px",
					left: "0px",
					width: document.body.clientWidth + "px",
					height:  config.size + "px"
				});
				break;
			default:
				throw new Error("Invalid panel orientation in environment configuration!");
		}
	},	
	controls: {
		mainButton: E.elementFactory({
			tag: 'div',
			cls: 'main-button',
			attributes: {
				sizePolisy: "minimum"
			}
		}).mix(E.behaviors.ui.button.generate({
			constructors: [ 
				function() {
					E.connect(this, "onclick", function() {
						alert('TODO!!!');
					});
				}
			]
		})),
		appInspector: document.createElement('DIV').extend(E.behaviors.ui.widget.generate({
			//TODO
		})),
		systemTray: document.createElement('DIV').extend(E.behaviors.ui.widget.generate({
			//TODO
		})),
		clock: document.createElement('DIV').extend(E.behaviors.ui.widget.generate({
			//TODO
		})),
	}
};

E.wde.panel.init();
