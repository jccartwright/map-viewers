define([
    "dojo/_base/declare", 
    "dojo/_base/lang",
    "dojo/dom",
    "ngdc/web_mercator/MapConfig",
    "app/web_mercator/MapToolbar",
    "app/web_mercator/Identify",
    "app/AppIdentifyPane"
    ],
    function(
        declare, 
        lang, 
        dom,
        MapConfig,
        MapToolbar,
        Identify,
        IdentifyPane
        ){
        
        return declare([MapConfig], {
                        
            //handle setup which requires all layers to be loaded
            mapReady: function() {
                this.inherited(arguments);

                console.log("inside custom Web Mercator mapReady...");   

                var mapToolbar = new MapToolbar({map: this.map, layerCollection: this.mapLayerCollection}, "mercatorMapToolbar");
                mapToolbar.startup();

                this.identify = new Identify({map: this.map, layerCollection: this.mapLayerCollection});
                
                this.identifyPane = new IdentifyPane({
                    map: this.map,
                    identify: this.identify,
                    class: "identifyPane",
                    autoExpandTree: false
                }, dom.byId("mercatorIdentifyPaneDiv"));
                this.identifyPane.startup();

                
                this.mapLayerCollection.getLayerById('NOS Hydrographic Surveys').setVisibleLayers([0,1]);
                this.mapLayerCollection.getLayerById('NOS Hydro (non-digital)').setVisibleLayers([2]);

                this.mapLayerCollection.getLayerById('DEM Extents').setVisibleLayers([12]);


            }
         
            
        });
    }
);
