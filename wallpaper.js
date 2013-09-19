E.wde.wallpaper = {
	layer: null,
	init: function() {		
		if (null === this.layer) {
			this.layer = E.wde.createLayer({
				id: 'wallpaper-layer',
				zIndex: 49999,
				fullscreen: true 				 
			}); 
		}		
	},
	
	applySettings: function() {	
		var config = E.config.wde.env.wallpaper;
		switch(config.type) {
			case "image": {
				var element = document.createElement("div");				
				element.style.extend({
					backgroundImage: "url(" + config.url + ")",
					backgroundSize: "cover",
					backgroundRepeat: "no-repeat",
					width: "100%",
					height: "100%"
				});
				
				this.layer.innerHTML = "";
				this.layer.appendChild(element);
				break;
			}
			default:
		};
		this.layer.show();
		
	}
};
	
E.wde.wallpaper.init();
