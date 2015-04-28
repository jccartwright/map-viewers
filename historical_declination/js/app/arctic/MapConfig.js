define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/dom',
    'dojo/on',
    'esri/layers/FeatureLayer',
    "esri/layers/LabelLayer",
    'esri/geometry/Extent',
    "esri/symbols/TextSymbol",
    "esri/symbols/Font",
    "esri/renderers/SimpleRenderer",
    "esri/layers/LabelLayer",
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
        TextSymbol,
        Font,
        SimpleRenderer,
        LabelLayer,
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

                this.currentYear = new Date().getFullYear();

                this.addFeatureLayers();

                this.setupListeners();
            },

            addFeatureLayers: function() {
                //FeatureLayer used for displaying lines every 2 degrees. Visible at all scales.
                this.linesLayer = new FeatureLayer("//maps.ngdc.noaa.gov/arcgis/rest/services/historical_declination/MapServer/4", {
                    id: 'Isogonic Lines',
                    mode: FeatureLayer.MODE_ONDEMAND,
                    outFields: ["Contour"],
                    tileHeight: 2048,
                    tileWidth: 2048,
                    visible: false,
                    //maxAllowableOffset: 5000
                });
                //FeatureLayer used for displaying intermediate lines, every 1 degree. Visible at larger scales
                this.linesLayer2 = new FeatureLayer("//maps.ngdc.noaa.gov/arcgis/rest/services/historical_declination/MapServer/4", {
                    id: 'Isogonic Lines2',
                    mode: FeatureLayer.MODE_ONDEMAND,
                    outFields: ["Contour"],
                    tileHeight: 2048,
                    tileWidth: 2048,
                    visible: false,
                    minScale: 10000000
                    //maxAllowableOffset: 5000
                });
                this.polesLayer = new FeatureLayer("//maps.ngdc.noaa.gov/arcgis/rest/services/historical_declination/MapServer/0", {
                    id: 'North Pole',
                    mode: FeatureLayer.MODE_SNAPSHOT,
                    visible: false
                }); 
                this.observedPolesLayer = new FeatureLayer("//maps.ngdc.noaa.gov/arcgis/rest/services/historical_declination/MapServer/1", {
                    id: 'Observed Poles',
                    mode: FeatureLayer.MODE_SNAPSHOT,
                    definitionExpression: "NORTH_SOUTH='N'",
                    outFields: ["*"],
                    visible: false
                });   
                this.historicPolesLayer = new FeatureLayer("//maps.ngdc.noaa.gov/arcgis/rest/services/historical_declination/MapServer/2", {
                    id: 'Historic Poles',
                    mode: FeatureLayer.MODE_SNAPSHOT,
                    definitionExpression: "NORTH_SOUTH='N'",
                    visible: false
                });
                           
                this.map.addLayer(this.linesLayer);
                this.map.addLayer(this.linesLayer2);
                this.map.addLayer(this.historicPolesLayer);
                this.map.addLayer(this.observedPolesLayer);
                this.map.addLayer(this.polesLayer);

                //create a text symbol to define the style of labels
                var label = new TextSymbol().setColor(new Color("#000"));
                label.font.setSize("10pt");
                label.font.setFamily("arial");
                label.font.setWeight(Font.WEIGHT_BOLD);
                label.setOffset(-1, -1);
                var labelRenderer = new SimpleRenderer(label);
                var labels = new LabelLayer({ id: "ArcticLabels" });
                // tell the label layer to label the observed poles feature layer 
                labels.addFeatureLayer(this.observedPolesLayer, labelRenderer, "{YEAR}");
                this.map.addLayer(labels);

                this.linesLayer.setDefinitionExpression(this.appendMod('YEAR=' + this.currentYear, 2, false));
                this.linesLayer2.setDefinitionExpression(this.appendMod('YEAR=' + this.currentYear, 2, true));
                if (this.polesLayer) {
                    this.northSouthClause = "NORTH_SOUTH='N' AND ";
                    this.polesLayer.setDefinitionExpression(this.northSouthClause + 'Year=' + this.currentYear);
                    this.polesLayer.show();
                }                
                
                this.linesLayer.show();
                this.linesLayer2.show();
            }
        });
    }
);
