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
				cls: config.orientation + ("left" === config.orientation || "right" === config.orientation) 
					? "vertical" : "horizontal",
				style: {
					display: "block",
					position: "absolute"			
				}
			});
			
			this.layer.appendChild(this.body);
			
			this.hint();
		}	
	},
	hint: function() {
		var config = E.config.wde.env.panel;
		switch (config.orientation) {
			case "left":
				this.body.style.extend({
					top: "0px",
					left: "0px",
					width: config.size + "px",
					height:  document.body.clientHeight + "px"
				});
				break;
			case "right":				
				this.body.style.extend({
					top: "0px",
					left: String(document.body.clientWidth - config.size) + "px",
					width: config.size + "px",
					height:  document.body.clientHeight + "px"
				});
				break;
			case "top":
				this.body.style.extend({
					top: "0px",
					left: "0px",
					width: document.body.clientWidth + "px",
					height:  config.size + "px"
				});			
				break;
			case "bottom":
				this.body.style.extend({
					top: (document.body.clientHeight - config.size) + "px",
					left: "0px",
					width: document.body.clientWidth + "px",
					height:  config.size + "px"
				});
				break;
			default:
				throw new Error("Invalid panel orientation in environment configuration!");
		}
	}
};

E.wde.panel.init();
