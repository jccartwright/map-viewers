define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/dom',
    'dojo/_base/Color',
    'dojo/topic',
    'esri/symbols/SimpleLineSymbol',
    'ngdc/web_mercator/MapConfig',
    'app/web_mercator/MapToolbar',
    'app/Identify',
    'app/AppIdentifyPane'
    ],
    function(
        declare, 
        lang, 
        dom,
        Color,
        topic,
        SimpleLineSymbol,
        MapConfig,
        MapToolbar,
        Identify,
        IdentifyPane
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

                /*
                this.identify = new Identify({map: this.map, layerCollection: this.mapLayerCollection});

                this.identifyPane = new IdentifyPane({
                    map: this.map,
                    identify: this.identify,
                    class: 'identifyPane',
                    autoExpandTree: false,
                    lineSymbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 255, 255]), 3)
                }, dom.byId('mercatorIdentifyPaneDiv'));
                this.identifyPane.startup();
                */
            }
         
            
        });
    }
);
