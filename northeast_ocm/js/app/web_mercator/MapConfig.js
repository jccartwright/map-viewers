define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/dom',
    'dojo/topic',
    'ngdc/web_mercator/MapConfig',
    'app/web_mercator/MapToolbar',
    'app/web_mercator/Identify',
    'app/AppIdentifyPane',
    'esri/layers/FeatureLayer',
    'esri/renderers/UniqueValueRenderer',
    'esri/renderers/SimpleRenderer',
    'esri/symbols/SimpleLineSymbol',
    'esri/Color'
    ],
    function(
        declare, 
        lang, 
        dom,
        topic,
        MapConfig,
        MapToolbar,
        Identify,
        IdentifyPane,
        FeatureLayer,
        UniqueValueRenderer,
        SimpleRenderer,
        SimpleLineSymbol,
        Color
        ){
        
        return declare([MapConfig], {
                        
            //handle setup which requires all layers to be loaded
            mapReady: function() {
                this.inherited(arguments);

                //console.log('inside custom Web Mercator mapReady...');   

                var mapToolbar = new MapToolbar({map: this.map, layerCollection: this.mapLayerCollection}, 'mercatorMapToolbar');
                mapToolbar.startup();

                this.identify = new Identify({map: this.map, layerCollection: this.mapLayerCollection});

                this.identifyPane = new IdentifyPane({
                    map: this.map,
                    identify: this.identify,
                    class: 'identifyPane',
                    autoExpandTree: false
                }, dom.byId('mercatorIdentifyPaneDiv'));
                this.identifyPane.startup();
                
                topic.publish('/ngdc/MapReady');

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

                this.mapLayerCollection.getLayerById('FEMA Peak Wind Gusts').setVisibleLayers([3]);

                //Apply layer definitions to the CSC Lidar layer to only show bathymetric lidar
                var layerDefinitions = [];
                layerDefinitions[4] = "Data_Classes_Available LIKE '%Bathymetric Lidar Points%'";
                this.mapLayerCollection.getLayerById('CSC Lidar').setLayerDefinitions(layerDefinitions);

                //Custom renderer for Hurricane strength classifications
                // var renderer = new UniqueValueRenderer(null, 'SaffirSimpsonScale');
                // renderer.addValue('ET', new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([128,128,128]), 4));
                // renderer.addValue('TS', new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([57,228,27]), 4));
                // renderer.addValue('TD', new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([149,206,226]), 4));
                // renderer.addValue('H1', new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255,224,0]), 4));
                // renderer.addValue('H2', new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255,123,0]), 4));
                // renderer.addValue('H3', new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255,0,0]), 4));
                // renderer.addValue('H4', new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([220,20,220]), 4));
                // renderer.addValue('H5', new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([106,30,210]), 4));

                var renderer = new SimpleRenderer(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SHORTDOT, new Color([255,0,0]), 4));

                //Add hurricanes feature layer, set definition to be SANDY 2012
                this.hurricaneLayer = new FeatureLayer('http://maps.csc.noaa.gov/arcgis/rest/services/Hurricanes/AllStorms/MapServer/0', {
                    mode: FeatureLayer.MODE_ONDEMAND,
                    renderer: renderer
                });
                this.hurricaneLayer.setRenderer(renderer);
                this.hurricaneLayer.setDefinitionExpression("Display_StormName = 'SANDY 2012'");
                this.map.addLayer(this.hurricaneLayer);

                topic.subscribe('/hurricane/visibility', lang.hitch(this, function(visible) {
                    if (visible) {
                        this.hurricaneLayer.show();
                    } else {
                        this.hurricaneLayer.hide();
                    }
                    
                }));                
            }
         
            
        });
    }
);
