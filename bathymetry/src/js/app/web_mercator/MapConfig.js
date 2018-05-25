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
                }, 'mercatorMapToolbar');
                this.mapToolbar.startup();

                this.identify = new Identify({map: this.map, layerCollection: this.mapLayerCollection});

                this.identifyPane = new IdentifyPane({
                    map: this.map,
                    identify: this.identify,
                    'class': 'identifyPane',
                    autoExpandTree: false,
                    lineSymbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 255, 255]), 2)
                }, dom.byId('mercatorIdentifyPaneDiv'));
                this.identifyPane.startup();
                
                if (this.mapLayerCollection.nosHydroVisible) {
                    this.mapLayerCollection.getLayerById('NOS Hydrographic Surveys').show();
                }
                else {
                    this.mapLayerCollection.getLayerById('NOS Hydrographic Surveys').hide();
                }

                this.mapLayerCollection.getLayerById('BAG Footprints').setVisibleLayers([3]);

                this.mapLayerCollection.getLayerById('OCM Lidar').setVisibleLayers([-1]);

                //Apply layer definitions to the CSC Lidar layer to only show bathymetric lidar
                var layerDefinitions = [];
                layerDefinitions[0] = 'Data_Classes_Available LIKE \'%Bathymetric%\'';
                layerDefinitions[1] = 'Data_Classes_Available LIKE \'%Bathymetric%\'';
                layerDefinitions[2] = 'Data_Classes_Available LIKE \'%Bathymetric%\'';
                layerDefinitions[3] = 'Data_Classes_Available LIKE \'%Bathymetric%\'';
                this.mapLayerCollection.getLayerById('OCM Lidar').setLayerDefinitions(layerDefinitions);
            }
         
            
        });
    }
);
