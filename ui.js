E.behaviors.ui = {
	layout: {		
		isLayout: true,
		//childs: [],
		initLayout: function(layoutStrategy) {
			if ("function" !== typeof(layoutStrategy))
				throw new Error("E.behaviors.ui.layout.init(): argument sizingStrategy must be a function!");
				
			this.doLayout = layoutStrategy;
		},
		/*appendChild: function(child) {},
		prependChild: function(child) {},
		addChild: function() {},*/
		/*count: function() {},*/
		doLayout: null, 	// can be seated one of strategy function or user's implement
		layoutStrategy: {
			VBoxLayout: function() {},
			HBoxLayout: function() {},
		}
	},
	widget: {
		isWidget: true,
		constructors: [
			function() {
				//console.log("call widget");
				this.appendChild(E.elementFactory({
					tag: "div",					
					cls: "widget-background",
					style: {
						width: "100%",
						height: "100%",
						position: "absolute"
					}
				}));
				
				if(!this.style.position)
					this.style.position = "relative";
			}
		],
		setBackgroundOpacity: function(opacityValue) {
			this.style.opacity = parseFloat(opacityValue);
		}		
	},	
	window: {
		isWindow: true
	}
};

E.behaviors.ui.button = E.behaviors.ui.widget.generate({
	isButton: true,
	constructors: [
		function() {
			//console.log("call button");
			this.appendChild(E.elementFactory({
				tag: "div",
				cls: "hover",
				style: {
					width: "100%",
					height: "100%",
					position: "absolute"
				}
			}));
		}
	]
});
