define([
    'dojo/_base/declare', 
    'dojo/dom',
    'esri/symbols/SimpleLineSymbol',
    'dojo/_base/Color',
    'ngdc/web_mercator/MapConfig',
    'app/web_mercator/MapToolbar',
    'app/web_mercator/Identify',
    'app/AppIdentifyPane'],
    function(
        declare, 
        dom,
        SimpleLineSymbol,
        Color,
        MapConfig,
        MapToolbar,
        Identify,
        IdentifyPane
        ){
        
        return declare([MapConfig], {
                        
            //handle setup which requires all layers to be loaded
            mapReady: function() {
                this.inherited(arguments);

                //console.log('inside custom Web Mercator mapReady...');   

                this.mapToolbar = new MapToolbar({
                    map: this.map, 
                    layerCollection: this.mapLayerCollection 
                }, 'mapToolbar');
                this.mapToolbar.startup();

                this.mapLayerCollection.getLayerById('Hypoxia').setVisibleLayers([46,47]);

                this.identify = new Identify({map: this.map, layerCollection: this.mapLayerCollection});

                this.identifyPane = new IdentifyPane({
                    map: this.map,
                    identify: this.identify,
                    'class': 'identifyPane',
                    autoExpandTree: false,
                    lineSymbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 255, 255]), 2)
                }, dom.byId('identifyPaneDiv'));
                this.identifyPane.startup();
            }
         
            
        });
    }
);
