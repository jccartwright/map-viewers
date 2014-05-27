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

                console.log("inside custom mapReady...");   

                var mapToolbar = new MapToolbar({map: this.map, layerCollection: this.mapLayerCollection}, "mercatorMapToolbar");
                mapToolbar.startup();
                
                var identifyPane = new IdentifyPane({
                    map: this.map,
                    class: "identifyPane",
                    autoExpandTree: false
                }, dom.byId("identifyPaneDiv"));
                identifyPane.startup();

                var identify = new Identify({mapConfig: this, identifyPane: identifyPane});

                this.mapLayerCollection.getLayerById('NOS Hydrographic Surveys').setVisibleLayers([2]);         

            }
         
            
        });
    }
);
