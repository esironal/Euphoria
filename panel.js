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
					this.body.appendChild(control);
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
		appInspector: document.createElement('DIV'),
		systemTray: document.createElement('DIV'),
		clock: E.elementFactory({
			tag: 'div',
			cls: 'panel-clock',
			attributes: {
				sizePolisy: "minimum"
			}
		}).extend(E.behaviors.ui.widget).mix({
			constructors: [
				function() {
					this.minutesElement = E.elementFactory({
						tag: 'div',
						cls: 'minutes',
						style: {
							width: '100%',
							height: '100%',
							position: 'relative'
						}
					});
					
					this.hoursElement = E.elementFactory({
						tag: 'div',
						cls: 'hours',
						style: {
							width: '100%',
							height: '100%',
							position: 'relative',
							marginTop: "-100%"
						}
					});
					
					this.appendChild(this.minutesElement);
					this.appendChild(this.hoursElement);
					
					this.start();
				}
			],
			timerId: null,
			minutesElement: null,
			hoursElement: null,
			start: function() {				
				if (null == this.timerId) {
					this.timerId = setInterval(this.updateTimeView, 30000);
					setTimeout(this.updateTimeView, 100);
				} 				
			},
			stop: function() {
				if (null != this.timerId) {
					clearInterval(this.timerId);
				}
			},
			updateTimeView: function() {
				var clock = E.wde.panel.controls.clock;
				var currentTime = new Date();
				console.log(currentTime);
				var minutes = currentTime.getMinutes();
				var hours = currentTime.getHours();
				clock.minutesElement.style.transform = "rotate(" + (minutes * 6) + "deg)";
				clock.hoursElement.style.transform = "rotate(" + parseInt((minutes + (hours * 60)) * 0.25) + "deg)";
			},
			isStarted: function() {
				return (null != this.timerId);
			},			
		}),
	}
};

E.wde.panel.init();
