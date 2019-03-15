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

                var hypoxiaLayer = this.mapLayerCollection.getLayerById('Hypoxia');
                var layerDefs = [];
                layerDefs[1] = 'cruiseno=328';
                layerDefs[2] = 'cruise=328';
                hypoxiaLayer.setLayerDefinitions(layerDefs);
                hypoxiaLayer.setVisibleLayers([1,2]);

                var contour10mLayer = this.mapLayerCollection.getLayerById('10m Contour');
                contour10mLayer.setLayerDefinitions(['contour=-10']);
                contour10mLayer.setVisibleLayers([0]);

                var contour200mLayer = this.mapLayerCollection.getLayerById('200m Contour');
                contour200mLayer.setLayerDefinitions(['contour=-200']);                
                contour200mLayer.setVisibleLayers([0]);

                this.identify = new Identify({map: this.map, layerCollection: this.mapLayerCollection});

                this.identifyPane = new IdentifyPane({
                    map: this.map,
                    identify: this.identify,
                    'class': 'identifyPane',
                    autoExpandTree: true,
                    lineSymbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 255, 255]), 2)
                }, dom.byId('identifyPaneDiv'));
                this.identifyPane.startup();
            }
         
            
        });
    }
);
