define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/dom',
    'dojo/_base/Color',
    'esri/symbols/SimpleLineSymbol',
    'ngdc/arctic/MapConfig',
    'app/arctic/MapToolbar',
    'app/Identify',
    'app/AppIdentifyPane'
    ],
    function(
        declare, 
        lang, 
        dom,
        Color,
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

                console.log('inside custom Arctic mapReady...');   

                var mapToolbar = new MapToolbar({map: this.map, layerCollection: this.mapLayerCollection}, 'arcticMapToolbar');
                mapToolbar.startup();

                /*
                this.identify = new Identify({map: this.map, layerCollection: this.mapLayerCollection});
                this.identify.enabled = false;

                //this.mapLayerCollection.suspend();


                this.identifyPane = new IdentifyPane({
                    map: this.map,
                    identify: this.identify,
                    class: 'identifyPane',
                    autoExpandTree: false,
                    lineSymbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 255, 255]), 3)
                }, dom.byId('arcticIdentifyPaneDiv'));
                this.identifyPane.startup();
                this.identifyPane.enabled = false;
                */
            }
         
            
        });
    }
);
