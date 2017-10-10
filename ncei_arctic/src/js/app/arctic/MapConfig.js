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

            constructor: function() {
                if (Proj4js) {  
                    this.sourceProj = new Proj4js.Proj('EPSG:32661');
                }
            },
                        
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
                
                this.identify = new Identify({map: this.map, layerCollection: this.mapLayerCollection});

                this.identifyPane = new IdentifyPane({
                    map: this.map,
                    identify: this.identify,
                    class: 'identifyPane',
                    autoExpandTree: true
                }, dom.byId('arcticIdentifyPaneDiv'));
                this.identifyPane.startup();
                                
                this.mapLayerCollection.getLayerById('Trackline Combined').setVisibleLayers([-1]);

                this.mapLayerCollection.getLayerById('DEM Extents').setVisibleLayers([12]);

                var layerDefs = [];
                layerDefs[0] = 'YEAR=2016';
                layerDefs[4] = 'YEAR=2016 AND MOD(CONTOUR, 2)=0';
                this.mapLayerCollection.getLayerById('Magnetic Declination').setVisibleLayers([0, 4]);
                this.mapLayerCollection.getLayerById('Magnetic Declination').setLayerDefinitions(layerDefs);

                this.mapLayerCollection.getLayerById('CRN').setLayerDefinitions(['LATITUDE>=50']);
                this.mapLayerCollection.getLayerById('GHCND').setLayerDefinitions(['LATITUDE>=50']);
                this.mapLayerCollection.getLayerById('GSOM').setLayerDefinitions(['LATITUDE>=50']);
                this.mapLayerCollection.getLayerById('GSOY').setLayerDefinitions(['LATITUDE>=50']);
                this.mapLayerCollection.getLayerById('ISD').setLayerDefinitions(['LATITUDE>=50']);

                this.mapLayerCollection.getLayerById('Sample Index').setLayerDefinitions(['LAT>=50']);
                this.mapLayerCollection.getLayerById('Marine Geology').setLayerDefinitions(['LATITUDE>=50']);

                this.mapLayerCollection.getLayerById('DSCRTP').setVisibleLayers([0]);
                this.mapLayerCollection.getLayerById('DSCRTP').setLayerDefinitions(['LATITUDE>=50']);
                this.mapLayerCollection.getLayerById('DSCRTP').objectIdFields = {0: 'OBJECTID'};
            }                 
        });
    }
);
