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
                    autoExpandTree: false
                }, dom.byId('mercatorIdentifyPaneDiv'));
                this.identifyPane.startup();
                
                if (this.mapLayerCollection.nosHydroVisible) {
                    this.mapLayerCollection.getLayerById('NOS Hydrographic Surveys').setVisibleLayers([0, 1]);
                }
                else {
                    this.mapLayerCollection.getLayerById('NOS Hydrographic Surveys').setVisibleLayers([-1]);
                }
                this.mapLayerCollection.getLayerById('NOS Hydro (non-digital)').setVisibleLayers([2]);
                this.mapLayerCollection.getLayerById('NOS Hydro (BAGs)').setVisibleLayers([0]);

                this.mapLayerCollection.getLayerById('DEM Extents').setVisibleLayers([12]);

                this.mapLayerCollection.getLayerById('CSC Lidar').setVisibleLayers([-1]);

                //Apply layer definitions to the CSC Lidar layer to only show bathymetric lidar
                var layerDefinitions = [];
                layerDefinitions[4] = "Data_Classes_Available LIKE '%Bathymetric Lidar Points%'";
                this.mapLayerCollection.getLayerById('CSC Lidar').setLayerDefinitions(layerDefinitions);
            }
         
            
        });
    }
);
