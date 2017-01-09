define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/dom',
    'ngdc/arctic/MapConfig',
    'app/arctic/MapToolbar',
    'app/arctic/Identify',
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

                //console.log('inside custom Arctic mapReady...');   

                this.mapToolbar = new MapToolbar({
                    map: this.map, 
                    layerCollection: this.mapLayerCollection, 
                    maxLat: 90, 
                    minLat: 50
                }, 'arcticMapToolbar');
                this.mapToolbar.startup();
                this.mapToolbar.enabled = false;
                
                this.identify = new Identify({map: this.map, layerCollection: this.mapLayerCollection});
                this.identify.enabled = false;

                this.identifyPane = new IdentifyPane({
                    map: this.map,
                    identify: this.identify,
                    class: 'identifyPane',
                    autoExpandTree: true
                }, dom.byId('arcticIdentifyPaneDiv'));
                this.identifyPane.startup();
                this.identifyPane.enabled = false;
            }
         
            
        });
    }
);
