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

                var mapToolbar = new MapToolbar({map: this.map, layerCollection: this.mapLayerCollection}, 'arcticMapToolbar');
                mapToolbar.startup();
                
                this.identify = new Identify({map: this.map, layerCollection: this.mapLayerCollection});
                this.identify.enabled = false;

                //this.mapLayerCollection.suspend();

                this.identifyPane = new IdentifyPane({
                    map: this.map,
                    identify: this.identify,
                    class: 'identifyPane',
                    autoExpandTree: false
                }, dom.byId('arcticIdentifyPaneDiv'));
                this.identifyPane.startup();
                this.identifyPane.enabled = false;

                if (this.mapLayerCollection.nosHydroVisible) {
                    this.mapLayerCollection.getLayerById('NOS Hydrographic Surveys').setVisibleLayers([0, 1]);
                }
                else {
                    this.mapLayerCollection.getLayerById('NOS Hydrographic Surveys').setVisibleLayers([-1]);
                }
                this.mapLayerCollection.getLayerById('NOS Hydro (non-digital)').setVisibleLayers([2]);
                this.mapLayerCollection.getLayerById('NOS Hydro (BAGs)').setVisibleLayers([0]);
                
                this.mapLayerCollection.getLayerById('Multibeam').setVisibleLayers([0]);
                this.mapLayerCollection.getLayerById('Trackline Bathymetry').setVisibleLayers([1]);

                this.mapLayerCollection.getLayerById('DEM Extents').setVisibleLayers([12]);
            }
         
            
        });
    }
);
