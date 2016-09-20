define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/dom',
    'dojo/_base/Color',
    'dojo/topic',
    'esri/symbols/SimpleLineSymbol',
    'ngdc/antarctic/MapConfig',
    'app/antarctic/MapToolbar',
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

                this.mapToolbar = new MapToolbar({
                    map: this.map, 
                    layerCollection: this.mapLayerCollection, 
                    maxLat: -50, 
                    minLat: -90
                }, 'antarcticMapToolbar');
                this.mapToolbar.startup();
                this.mapToolbar.enabled = false;
                
                this.identify = new Identify({map: this.map, layerCollection: this.mapLayerCollection});
                this.identify.enabled = false;

                //this.mapLayerCollection.suspend();

                this.identifyPane = new IdentifyPane({
                    map: this.map,
                    identify: this.identify,
                    'class': 'identifyPane',
                    autoExpandTree: false,
                    lineSymbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 255, 255]), 3)
                }, dom.byId('antarcticIdentifyPaneDiv'));
                this.identifyPane.startup();
                this.identifyPane.enabled = false;
                
                topic.publish('/wcd/MapReady', 'antarctic');
            }
         
            
        });
    }
);
