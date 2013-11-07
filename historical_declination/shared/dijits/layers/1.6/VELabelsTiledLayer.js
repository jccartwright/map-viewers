dojo.provide("layers.VELabelsTiledLayer");

/*
 * A customized Bing Maps VETiledLayer class for providing boundaries/labels in PNG format with a transparent background.
 * 
 * Tile URLs of the form:
 * http://t2.tiles.virtualearth.net/tiles/a0323.jpeg?g=790&mkt=en-US&token=AiIF8xFYTmPAK8shdTVLVnznZuOY5FYPrHj-Kaph-g1Hw9yFBsbgYRlR1eEvdlj8
 * Should be replaced with:
 * http://t2.tiles.virtualearth.net/tiles/ho0323.png?g=790&mkt=en-US&token=AiIF8xFYTmPAK8shdTVLVnznZuOY5FYPrHj-Kaph-g1Hw9yFBsbgYRlR1eEvdlj8
 * 
 * Described here:
 * http://alastaira.wordpress.com/2011/05/13/displaying-labels-on-top-of-bing-maps-custom-tile-layers/
 * http://social.msdn.microsoft.com/Forums/en-US/vemapcontroldev/thread/e7d3dc6a-a203-4327-9edc-59a9ef0df83d
 */
dojo.declare("layers.VELabelsTiledLayer", esri.virtualearth.VETiledLayer, {
	constructor: function() {
		//Set the initial mapStyle to be MAP_STYLE_AERIAL. 
		//This will force the tile URLs to contain '/tiles/a', which will be replaced by '/tiles/ho'		
		this.mapStyle = esri.virtualearth.VETiledLayer.MAP_STYLE_AERIAL;
	},
	
	_initLayer: function() {
		this.inherited(arguments);		
		
		this.tileServers = dojo.map(this.tileServers, function(tileServer){
			var str = tileServer.replace('/tiles/a','/tiles/ho');
			return str.replace('.jpeg', '.png'); //Not necessary, it still returns PNG even with '.jpeg' in the request
		});		
	}
});

