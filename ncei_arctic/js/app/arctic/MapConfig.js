define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/dom',
    'esri/layers/FeatureLayer',
    'esri/symbols/TextSymbol',
    'esri/symbols/Font',
    'esri/renderers/SimpleRenderer',
    'esri/layers/LabelLayer',
    'esri/Color',
    'ngdc/arctic/MapConfig',
    'app/arctic/MapToolbar',
    'app/arctic/Identify',
    'app/AppIdentifyPane'
    ],
    function(
        declare, 
        lang, 
        dom,
        FeatureLayer,
        TextSymbol,
        Font,
        SimpleRenderer,
        LabelLayer,
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

                //console.log('inside custom Arctic mapReady...');   

                this.mapToolbar = new MapToolbar({
                    map: this.map, 
                    layerCollection: this.mapLayerCollection, 
                    maxLat: 90, 
                    minLat: 50
                }, 'arcticMapToolbar');
                this.mapToolbar.startup();
                
                // this.identify = new Identify({map: this.map, layerCollection: this.mapLayerCollection});
                // this.identify.enabled = false;

                // this.identifyPane = new IdentifyPane({
                //     map: this.map,
                //     identify: this.identify,
                //     class: 'identifyPane',
                //     autoExpandTree: false
                // }, dom.byId('arcticIdentifyPaneDiv'));
                // this.identifyPane.startup();
                // this.identifyPane.enabled = false;
                
                this.mapLayerCollection.getLayerById('NOS Hydrographic Surveys').setVisibleLayers([-1]);
                
                this.mapLayerCollection.getLayerById('NOS Hydro (non-digital)').setVisibleLayers([2]);
                this.mapLayerCollection.getLayerById('NOS Hydro (BAGs)').setVisibleLayers([0]);
                
                this.mapLayerCollection.getLayerById('Trackline Combined').setVisibleLayers([-1]);
                //topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [0], false);                    

                this.mapLayerCollection.getLayerById('DEM Extents').setVisibleLayers([12]);

                var layerDefs = [];
                layerDefs[0] = 'YEAR=2016';
                layerDefs[4] = 'YEAR=2016 AND MOD(CONTOUR, 2)=0';
                this.mapLayerCollection.getLayerById('Magnetic Declination').setVisibleLayers([0, 4]);
                this.mapLayerCollection.getLayerById('Magnetic Declination').setLayerDefinitions(layerDefs);

            }                 
        });
    }
);