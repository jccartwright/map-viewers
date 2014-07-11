define([
    'dojo/_base/declare',
    'dijit/registry',
    'dojo/dom',
    'dojo/_base/config',
    'dojo/io-query',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/on',
    'dojo/aspect',
    'dijit/form/CheckBox',
    'esri/config',
    'esri/geometry/Extent',
    'esri/SpatialReference',
    'esri/tasks/GeometryService',
    'ngdc/Logger',
    'app/web_mercator/MapConfig',
    'app/arctic/MapConfig',
    'ngdc/web_mercator/ZoomLevels',
    'ngdc/arctic/ZoomLevels',
    'ngdc/Banner',
    'ngdc/CoordinatesToolbar',
    'app/web_mercator/LayerCollection',
    'app/arctic/LayerCollection',
    'app/web_mercator/MapToolbar',
    'app/arctic/MapToolbar',
    'app/Identify',
    'app/AppIdentifyPane',
    'app/LayersPanel',
    'dojo/domReady!'],
    function(
        declare,
        registry,
        dom,
        config,
        ioQuery,
        lang,
        topic,
        on,
        aspect,
        CheckBox,
        esriConfig,
        Extent,
        SpatialReference,
        GeometryService,
        Logger,
        MercatorMapConfig,
        ArcticMapConfig,
        MercatorZoomLevels,
        ArcticZoomLevels,
        Banner,
        CoordinatesToolbar,
        MercatorLayerCollection,
        ArcticLayerCollection,
        MercatorMapToolbar,
        ArcticMapToolbar,
        Identify,
        IdentifyPane,
        LayersPanel
        ) {

        return declare(null, {
            mercatorMapConfig: null,
            arcticMapConfig: null,

            constructor: function(args){
                declare.safeMixin(this,args);
                this.overlayNode = dom.byId(this.overlayNodeId);
            },

            init: function() {
                esriConfig.defaults.io.corsEnabledServers = [
                    'http://maps.ngdc.noaa.gov/arcgis/rest/services',
                    'http://mapdevel.ngdc.noaa.gov/arcgis/rest/services'];

                esriConfig.defaults.geometryService = new GeometryService('http://maps.ngdc.noaa.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer');

                //add queryParams into config object, values in queryParams take precedence
                var queryParams = ioQuery.queryToObject(location.search.substring(1));
                lang.mixin(config.app, queryParams);

                //put the logger into global so all modules have access
                window.logger = new Logger(config.app.loglevel);

                this.setupBanner();

                this.setupLayersPanel();

                this.setupMapViews();

                //Subscribe to messages passed by the search dialogs
                topic.subscribe('/wcd/Search', lang.hitch(this, function(values) {
                    this.filterWcd(values);
                }));
                topic.subscribe('/wcd/ResetSearch', lang.hitch(this, function() {
                    this.resetWcd();
                }));
            },

            setupBanner: function() {
                this.banner = new Banner({
                    breadcrumbs: [
                        {url: 'http://www.noaa.gov', label: 'NOAA'},
                        {url: 'http://www.nesdis.noaa.gov', label: 'NESDIS'},
                        {url: 'http://www.ngdc.noaa.gov', label: 'NGDC'},
                        {url: 'http://maps.ngdc.noaa.gov/viewers', label: 'Maps'},
                        {url: 'http://www.ngdc.noaa.gov/mgg/wcd/', label: 'Water Column Sonar Data'}           
                    ],
                    dataUrl: 'http://www.ngdc.noaa.gov/mgg/wcd/',
                    image: '/images/water_column_sonar_data_viewer_logo.png'
                });
                this.banner.placeAt('banner');
            },

            setupLayersPanel: function() {
                this.layersPanel = new LayersPanel();
                this.layersPanel.placeAt('layersPanel');
            },

            setupMapViews: function() {
                logger.debug('setting up map views...');
                // setup map views. You can only draw a Map into a visible container
                this.setupMercatorView();

                registry.byId('mapContainer').selectChild('arctic');
                this.setupArcticView();

                //go back to mercator as default view
                registry.byId('mapContainer').selectChild('mercator');

                registry.byId('mapContainer').watch('selectedChildWidget', lang.hitch(this, function(name, oval, nval){
                    var mapId = nval.id;
                    console.debug(mapId + ' map view selected');
                    topic.publish('/ngdc/mapViewActivated', mapId);
                    this.enableMapView(mapId);
                }));

                this.enableMapView('mercator');
            },

            enableMapView: function(/*String*/ mapId) {
                if (mapId == 'mercator') {
                    this.mercatorMapConfig.setEnabled(true);
                    this.arcticMapConfig.setEnabled(false);                    
                } else { //Arctic
                    this.mercatorMapConfig.setEnabled(false);
                    this.arcticMapConfig.setEnabled(true);                    
                }
            },

            setupMercatorView: function() {
                logger.debug('setting up Mercator view...');

                var zoomLevels = new MercatorZoomLevels();

                this.mercatorMapConfig = new MercatorMapConfig('mercator', {
                    center:[-110, 40], //centered over US
                    zoom: 1, //relative zoom level; equivalent to absolute zoom level 3
                    logo: false,
                    showAttribution: false,
                    overview: true,
                    sliderStyle: 'large',
                    navigationMode: 'classic', //disable CSS transforms to eliminate annoying flickering in Chrome
                    lods: zoomLevels.lods
                }, new MercatorLayerCollection());  

                var coordinatesToolbar = new CoordinatesToolbar({map: this.mercatorMapConfig.map}, 'mercatorCoordinatesToolbar');

                //Hide the scalebar at small scales <= 4
                on(this.mercatorMapConfig.map, 'zoom-end', lang.hitch(this, function() {
                    var level = this.mercatorMapConfig.map.getAbsoluteLevel();
                    if (level <= 4) {
                        //These need to be on a short timer due to unexpected errors during the zoom animation
                        setTimeout(function() {
                            coordinatesToolbar.hideScalebar();
                        }, 100);
                    } else {
                        setTimeout(function() {
                            coordinatesToolbar.showScalebar();
                        }, 100);
                    }
                }));

            },

            setupArcticView: function() {
                logger.debug('setting up Arctic view...');
                
                var initialExtent = new Extent({
                    xmin: -4000000,
                    ymin: -4000000,
                    xmax: 4000000,
                    ymax: 4000000,
                    spatialReference: new SpatialReference({wkid: 3995})
                });   

                var zoomLevels = new ArcticZoomLevels();            

                this.arcticMapConfig = new ArcticMapConfig('arctic', {
                    extent: initialExtent,
                    //zoom: 3,
                    logo: false,
                    showAttribution: false,
                    overview: false,
                    sliderStyle: 'large',
                    navigationMode: 'classic', //disable CSS transforms to eliminate annoying flickering in Chrome
                    lods: zoomLevels.lods
                }, new ArcticLayerCollection());

                new CoordinatesToolbar({map: this.arcticMapConfig.map}, 'arcticCoordinatesToolbar');
            },

            filterWcd: function(values) {
                var layerDefinition;
                var layerDefinitions = [];
                var sql = [];   

                if (values.startDate) {
                    sql.push("COLLECTION_DATE>=date '" + this.toDateString(values.startDate) + "'");
                }
                if (values.endDate) {
                    sql.push("COLLECTION_DATE<=date '" + this.toDateString(values.endDate) + "'");
                }
                if (values.cruiseId) {
                    //sql.push("UPPER(CRUISE_NAME)='" + values.cruiseId.toUpperCase() + "'");
                    sql.push("UPPER(CRUISE_NAME) LIKE '" + values.cruiseId.toUpperCase().replace('*', '%') + "'");
                }
                if (values.instruments.length > 0) {
                    var quoted = [];
                    for (var i = 0; i < values.instruments.length; i++) {
                        //Surround each string with single quotes
                        quoted.push("'" + values.instruments[i] + "'");
                    }
                    sql.push("INSTRUMENT_NAME in (" + quoted.join(',') + ")");
                }
                if (values.minNumBeams) {
                    sql.push("NUMBEROFBEAMS >= " + values.minNumBeams);
                }
                if (values.maxNumBeams) {
                    sql.push("NUMBEROFBEAMS <= " + values.maxNumBeams);
                }
                if (values.minRecordingRange) {
                    sql.push("RECORDINGRANGE >= " + values.minRecordingRange);
                }
                if (values.maxRecordingRange) {
                    sql.push("RECORDINGRANGE <= " + values.maxRecordingRange);
                }
                if (values.minSwathWidth) {
                    sql.push("SWATHWIDTH >= " + values.minSwathWidth);
                }
                if (values.maxSwathWidth) {
                    sql.push("SWATHWIDTH <= " + values.maxSwathWidth);
                }
                //TODO: Add frequency select

                //Apply to all 4 sublayers
                layerDefinition = sql.join(' AND ');
                layerDefinitions[1] = layerDefinition;
                layerDefinitions[2] = layerDefinition;
                layerDefinitions[3] = layerDefinition;
                layerDefinitions[4] = layerDefinition;
                
                this.mercatorMapConfig.mapLayerCollection.getLayerById('Water Column Sonar').setLayerDefinitions(layerDefinitions);
                this.arcticMapConfig.mapLayerCollection.getLayerById('Water Column Sonar').setLayerDefinitions(layerDefinitions);                

                this.layersPanel.enableResetButton();
                this.layersPanel.setCurrentFilterString(values);
            },

            resetWcd: function() {            
                this.mercatorMapConfig.mapLayerCollection.getLayerById('Water Column Sonar').setLayerDefinitions([]);
                this.arcticMapConfig.mapLayerCollection.getLayerById('Water Column Sonar').setLayerDefinitions([]);

                this.layersPanel.disableResetButton();
                this.layersPanel.searchDialog.clearForm();
                this.layersPanel.setCurrentFilterString('');
            }
        });
    }
);
