define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/dom',
    'ngdc/antarctic/MapConfig',
    'app/antarctic/MapToolbar',
    'app/antarctic/Identify',
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

                //console.log('inside custom Antarctic mapReady...');   

                var mapToolbar = new MapToolbar({map: this.map, layerCollection: this.mapLayerCollection}, 'antarcticMapToolbar');
                mapToolbar.startup();
                
                // this.identify = new Identify({map: this.map, layerCollection: this.mapLayerCollection});
                // this.identify.enabled = false;

                //this.mapLayerCollection.suspend();

                // this.identifyPane = new IdentifyPane({
                //     map: this.map,
                //     identify: this.identify,
                //     class: 'identifyPane',
                //     autoExpandTree: false
                // }, dom.byId('antarcticIdentifyPaneDiv'));
                // this.identifyPane.startup();
                // this.identifyPane.enabled = false;              
            }
         
            
        });
    }
);
