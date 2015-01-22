define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/dom',
    'dojo/on',
    'esri/layers/FeatureLayer',
    "esri/layers/LabelLayer",
    'esri/geometry/Extent',
    'esri/symbols/SimpleLineSymbol',
    "esri/Color",
    'esri/graphic',
    'esri/layers/LayerDrawingOptions',
    'ngdc/arctic/MapConfig',
    'app/arctic/MapToolbar',
    'app/MapConfigMixin'
    ],
    function(
        declare, 
        lang, 
        dom,
        on,
        FeatureLayer,
        LabelLayer,
        Extent,
        SimpleLineSymbol,
        Color,
        Graphic,
        LayerDrawingOptions,
        MapConfig,
        MapToolbar,
        MapConfigMixin
        ){
        
        return declare([MapConfig, MapConfigMixin], {
                        
            //handle setup which requires all layers to be loaded
            mapReady: function() {
                this.inherited(arguments);

                var mapToolbar = new MapToolbar({map: this.map, layerCollection: this.mapLayerCollection}, 'arcticMapToolbar');
                mapToolbar.startup();

                this.currentYear = 2015;

                this.addFeatureLayers();

                this.setupClickListeners();
            },

            addFeatureLayers: function() {
                //FeatureLayer used for displaying lines every 2 degrees. Visible at all scales.
                this.linesLayer = new FeatureLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/historical_declination/MapServer/3", {
                    id: 'Isogonic Lines',
                    mode: FeatureLayer.MODE_ONDEMAND,
                    outFields: ["CONTOUR"],
                    tileHeight: 2048,
                    tileWidth: 2048,
                    visible: false,
                    //maxAllowableOffset: 5000
                });
                //FeatureLayer used for displaying intermediate lines, every 1 degree. Visible at larger scales
                this.linesLayer2 = new FeatureLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/historical_declination/MapServer/3", {
                    id: 'Isogonic Lines2',
                    mode: FeatureLayer.MODE_ONDEMAND,
                    outFields: ["CONTOUR"],
                    tileHeight: 2048,
                    tileWidth: 2048,
                    visible: false,
                    minScale: 10000000
                    //maxAllowableOffset: 5000
                });
                this.npLayer = new FeatureLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/historical_declination/MapServer/0", {
                    id: 'North Pole',
                    mode: FeatureLayer.MODE_SNAPSHOT,
                    visible: false
                });                
                this.map.addLayer(this.linesLayer);
                this.map.addLayer(this.linesLayer2);
                this.map.addLayer(this.npLayer);

                this.linesLayer.setDefinitionExpression(this.appendMod('YEAR=' + this.currentYear, 2, false));
                this.linesLayer2.setDefinitionExpression(this.appendMod('YEAR=' + this.currentYear, 2, true));
                if (this.npLayer) {
                    this.npLayer.setDefinitionExpression('Year=' + this.currentYear);
                    this.npLayer.show();
                }                
                
                this.linesLayer.show();
                this.linesLayer2.show();
            }
        });
    }
);