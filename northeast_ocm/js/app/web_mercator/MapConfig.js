define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom',
    'dojo/topic',
    'ngdc/web_mercator/MapConfig',
    'app/web_mercator/MapToolbar',
    'app/web_mercator/Identify',
    'app/AppIdentifyPane',
    'esri/layers/FeatureLayer',
    'esri/layers/GraphicsLayer',
    'esri/renderers/UniqueValueRenderer',
    'esri/renderers/SimpleRenderer',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/TextSymbol',
    'esri/symbols/Font',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/symbols/PictureMarkerSymbol',
    'esri/layers/LabelClass',
    'esri/layers/LabelLayer',
    'esri/Color',
    'esri/tasks/QueryTask',
    'esri/tasks/query',
    'esri/graphic',
    'esri/geometry/Point',
    'esri/SpatialReference',
    'esri/geometry/webMercatorUtils'
    ],
    function(
        declare, 
        lang, 
        array,
        dom,
        topic,
        MapConfig,
        MapToolbar,
        Identify,
        IdentifyPane,
        FeatureLayer,
        GraphicsLayer,
        UniqueValueRenderer,
        SimpleRenderer,
        SimpleLineSymbol,
        TextSymbol,
        Font,
        SimpleMarkerSymbol,
        PictureMarkerSymbol,
        LabelClass,
        LabelLayer,
        Color,
        QueryTask,
        Query,
        Graphic,
        Point,
        SpatialReference,
        webMercatorUtils
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

                this.mapLayerCollection.getLayerById('OCM Lidar').setVisibleLayers([-1]);

                this.mapLayerCollection.getLayerById('FEMA Peak Wind Gusts').setVisibleLayers([3]);

                //Apply layer definitions to the OCM Lidar layer to only show bathymetric lidar
                var layerDefinitions = [];
                layerDefinitions[4] = "Data_Classes_Available LIKE '%Bathymetric Lidar Points%'";
                //layerDefinitions[4] = 'Year >= 2012';
                this.mapLayerCollection.getLayerById('OCM Lidar').setLayerDefinitions(layerDefinitions);    

                this.setupHurricaneLayer();                           
            },

            setupHurricaneLayer: function() {                
                var queryTask = new QueryTask('//maps.coast.noaa.gov/arcgis/rest/services/Hurricanes/AllStorms/MapServer/0');
                var query = new Query();
                query.where = "Display_StormName = 'SANDY 2012'";
                query.returnGeometry = false;
                query.outFields = ["NormalizedMSW", 'BEGINLAT', 'BEGINLON', 'Display_DateAndTime'];
                queryTask.execute(query).then(lang.hitch(this, function(featureSet) {
                   
                    this.hurricanePointLayer = new GraphicsLayer();
                    array.forEach(featureSet.features, lang.hitch(this, function(feature) {
                        var pt = webMercatorUtils.geographicToWebMercator(new Point(feature.attributes['BEGINLON'], feature.attributes['BEGINLAT'], new SpatialReference(4326)));
                        
                        //var sms = new SimpleMarkerSymbol().setStyle(SimpleMarkerSymbol.STYLE_SQUARE).setColor(new Color([255,0,0,0.5]));
                        var symbol = new PictureMarkerSymbol('//maps.ngdc.noaa.gov/viewers/northeast_ocm/images/hurricane_icon.png', 39, 35);
                        var graphic = new Graphic(pt, symbol);

                        // var textSymbol = new TextSymbol(feature.attributes['Display_DateAndTime'] + ': ' + feature.attributes['NormalizedMSW'] + 'mph');
                        // textSymbol.setColor(new Color([0,0,0]));
                        // textSymbol.setOffset(0, -23);
                        // var font = new Font()
                        // font.setSize("7pt");
                        // font.setFamily("arial");
                        // font.setWeight(Font.WEIGHT_BOLD)
                        // textSymbol.setFont(font);
                        // var labelGraphic = new Graphic(pt, textSymbol);

                        this.hurricanePointLayer.add(graphic);
                        //this.hurricanePointLayer.add(labelGraphic);
                        
                    }));

                    this.map.addLayer(this.hurricanePointLayer);
                }));


                var renderer = new SimpleRenderer(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SHORTDOT, new Color([216,4,4]), 3));

                //Add hurricanes feature layer, set definition to be SANDY 2012
                this.hurricaneLayer = new FeatureLayer('//maps.coast.noaa.gov/arcgis/rest/services/Hurricanes/AllStorms/MapServer/0', {
                    mode: FeatureLayer.MODE_ONDEMAND,
                    renderer: renderer,
                    outFields: ['Display_StormName', 'Display_DateAndTime', 'NormalizedMSW']
                });
                this.hurricaneLayer.setRenderer(renderer);
                this.hurricaneLayer.setDefinitionExpression("Display_StormName = 'SANDY 2012'");

                // create a text symbol to define the style of labels
                // var label = new TextSymbol().setColor(new Color([0,0,0]));
                // label.font.setSize("8pt");
                // label.font.setFamily("arial");
                // label.font.setWeight(Font.WEIGHT_BOLD)
                // var labelRenderer = new SimpleRenderer(label);
                // var labels = new LabelLayer({ id: "labels" });
                // // tell the label layer to label the countries feature layer 
                // // using the field named "admin"
                // labels.addFeatureLayer(this.hurricaneLayer, labelRenderer, 
                //     '{Display_DateAndTime} {NormalizedMSW}mph', {
                //     labelRotation: false,
                //     lineLabelPlacement: 'PlaceAtEnd'
                // });
                // add the label layer to the map
                
                this.map.addLayer(this.hurricaneLayer);
                //this.map.addLayer(labels);

                topic.subscribe('/hurricane/visibility', lang.hitch(this, function(visible) {
                    if (visible) {
                        this.hurricaneLayer.show();
                        this.hurricanePointLayer.show();
                    } else {
                        this.hurricaneLayer.hide();
                        this.hurricanePointLayer.hide();
                    }
                    
                })); 
            }
         
            
        });
    }
);
