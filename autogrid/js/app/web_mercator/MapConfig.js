define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/dom',
    'dojo/_base/Color',
    'dojo/topic',
    'esri/symbols/SimpleLineSymbol',
    'ngdc/web_mercator/MapConfig',
    'app/web_mercator/MapToolbar'
    ],
    function(
        declare, 
        lang, 
        dom,
        Color,
        topic,
        SimpleLineSymbol,
        MapConfig,
        MapToolbar
        ){
        
        return declare([MapConfig], {
                        
            //handle setup which requires all layers to be loaded
            mapReady: function() {
                this.inherited(arguments);

                console.log('inside custom Web Mercator mapReady...');   

                this.mapToolbar = new MapToolbar({
                    map: this.map, 
                    layerCollection: this.mapLayerCollection,
                    bboxDialogTitle: 'Enter Coordinates to Define Area of Interest'
                }, 'mercatorMapToolbar');
                this.mapToolbar.startup();
            }
         
            
        });
    }
);
