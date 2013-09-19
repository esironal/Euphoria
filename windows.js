E.wde.windows = {
	defs: {
		startZIndex: 50000
	},
	layer: null,
	init: function() {
		if (null === this.layer) {
			this.layer = E.wde.createLayer({
				id: 'windows-layer',
				zIndex: this.defs.startZIndex,
				fullscreen: false 				 
			}); 
		}	
	}	
};

E.wde.windows.init();
