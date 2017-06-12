define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/dom',
    'ngdc/web_mercator/MapConfig',
    'app/web_mercator/MapToolbar',
    'app/web_mercator/Identify',
    'app/AppIdentifyPane'
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

                //console.log('inside custom Web Mercator mapReady...');   

                this.mapToolbar = new MapToolbar({
                    map: this.map, 
                    layerCollection: this.mapLayerCollection, 
                }, 'mercatorMapToolbar');
                this.mapToolbar.startup();

                this.identify = new Identify({map: this.map, layerCollection: this.mapLayerCollection});

                this.identifyPane = new IdentifyPane({
                    map: this.map,
                    identify: this.identify,
                    class: 'identifyPane',
                    autoExpandTree: true
                }, dom.byId('mercatorIdentifyPaneDiv'));
                this.identifyPane.startup();                
            }
         
            
        });
    }
);
