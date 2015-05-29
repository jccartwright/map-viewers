define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/dom',
    'dojo/_base/Color',
    'esri/symbols/SimpleLineSymbol',
    'ngdc/arctic/MapConfig',
    'app/arctic/MapToolbar'
    ],
    function(
        declare, 
        lang, 
        dom,
        Color,
        SimpleLineSymbol,
        MapConfig,
        MapToolbar
        ){
        
        return declare([MapConfig], {
                        
            //handle setup which requires all layers to be loaded
            mapReady: function() {
                this.inherited(arguments);

                console.log('inside custom Arctic mapReady...');   

                this.mapToolbar = new MapToolbar({
                    map: this.map, 
                    layerCollection: this.mapLayerCollection, 
                    maxLat: 90, 
                    minLat: 50,
                    bboxDialogTitle: 'Enter Coordinates to Define Area of Interest'
                }, 'arcticMapToolbar');
                this.mapToolbar.startup();
            }
         
            
        });
    }
);
