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
    'dojo/request/xhr',
    'dijit/form/CheckBox',
    'esri/config',
    'esri/geometry/Extent',
    'esri/geometry/geometryEngine',
    'esri/SpatialReference',
    'esri/tasks/GeometryService',
    'esri/tasks/ProjectParameters',
    'esri/tasks/QueryTask',
    'esri/tasks/query',
    'esri/tasks/StatisticDefinition',
    'ngdc/Logger',
    'app/web_mercator/MapConfig',
    'app/arctic/MapConfig',
    'ngdc/web_mercator/ZoomLevels',
    'ngdc/arctic/ZoomLevels',
    'ngdc/Banner',
    'ngdc/CoordinatesWithElevationToolbar',
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
        xhr,
        CheckBox,
        esriConfig,
        Extent,
        geometryEngine,
        SpatialReference,
        GeometryService,
        ProjectParameters,
        QueryTask,
        Query,
        StatisticDefinition,
        Logger,
        MercatorMapConfig,
        ArcticMapConfig,
        MercatorZoomLevels,
        ArcticZoomLevels,
        Banner,
        CoordinatesWithElevationToolbar,
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
                esri.config.defaults.io.corsEnabledServers = [
                    'http://gis.ngdc.noaa.gov/arcgis/rest/services',
                    'https://gis.ngdc.noaa.gov/arcgis/rest/services',
                    'http://maps.ngdc.noaa.gov/arcgis/rest/services',
                    'https://maps.ngdc.noaa.gov/arcgis/rest/services',
                    'http://mapdevel.ngdc.noaa.gov/arcgis/rest/services'];

                esriConfig.defaults.geometryService = new GeometryService('//maps.ngdc.noaa.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer');

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
                        {url: '//www.noaa.gov', label: 'NOAA', title: 'Go to the National Oceanic and Atmospheric Administration home'},
                        {url: '//www.nesdis.noaa.gov', label: 'NESDIS', title: 'Go to the National Environmental Satellite, Data, and Information Service home'},
                        {url: '//www.ngdc.noaa.gov', label: 'NCEI (formerly NGDC)', title: 'Go to the National Centers for Environmental Information (formerly the National Geophysical Data Center) home'},
                        {url: '//maps.ngdc.noaa.gov', label: 'Maps', title: 'Go to NCEI maps home'},
                        {url: '//www.ngdc.noaa.gov/mgg/wcd/', label: 'Water Column Sonar Data'}           
                    ],
                    dataUrl: '//www.ngdc.noaa.gov/mgg/wcd/',
                    image: '/images/water_column_sonar_data_viewer_logo.png',
                    imageAlt: 'NCEI Water Column Sonar Data Viewer - go to data home'
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
                this.mapId = mapId;
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

                new CoordinatesWithElevationToolbar({map: this.mercatorMapConfig.map, scalebarThreshold: 4}, 'mercatorCoordinatesToolbar');
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

                new CoordinatesWithElevationToolbar({map: this.mercatorMapConfig.map}, 'arcticCoordinatesToolbar');
            },

            filterWcd: function(values) {                
                var fileCond = [];
                var cruiseCond = [];
                var i;
                var quoted;
                
                if (values.startDate) {
                    fileCond.push("COLLECTION_DATE>=date '" + this.toDateString(values.startDate) + "'");
                    cruiseCond.push("START_DATE>=date '" + this.toDateString(values.startDate) + "'");
                }
                if (values.endDate) {
                    fileCond.push("COLLECTION_DATE<=date '" + this.toDateString(values.endDate) + "'");
                    cruiseCond.push("END_DATE<=date '" + this.toDateString(values.endDate) + "'");
                }
                if (values.ships && values.ships.length > 0) {
                    quoted = [];
                    for (i = 0; i < values.ships.length; i++) {
                        //Surround each string with single quotes
                        quoted.push("'" + values.ships[i] + "'");
                    }
                    fileCond.push("SHIP_NAME in (" + quoted.join(',') + ")");
                    cruiseCond.push("SHIP_NAME in (" + quoted.join(',') + ")");
                }
                if (values.institutions && values.institutions.length > 0) {
                    var conditionals = [];
                    for (i = 0; i < values.institutions.length; i++) {
                        //Surround each string with wildcard characters and single quotes
                        conditionals.push("SOURCE_NAME LIKE '%|" + values.institutions[i] + "|%'");
                    }
                    //sql.push("SOURCE_NAME in (" + quoted.join(',') + ")");  //TODO comma-separated
                    if (conditionals.length > 1) {
                        fileCond.push('(' + conditionals.join(' OR ') + ')');
                        cruiseCond.push('(' + conditionals.join(' OR ') + ')');
                    }
                    else {
                        fileCond.push(conditionals[0]);
                        cruiseCond.push(conditionals[0]);
                    }
                }
                if (values.surveyIds && values.surveyIds.length > 0) {
                    quoted = [];
                    for (i = 0; i < values.surveyIds.length; i++) {
                        //Surround each string with single quotes
                        quoted.push("'" + values.surveyIds[i] + "'");
                    }
                    fileCond.push("CRUISE_NAME in (" + quoted.join(',') + ")");
                    cruiseCond.push("CRUISE_NAME in (" + quoted.join(',') + ")");
                }
                if (values.instruments && values.instruments.length > 0) {
                    quoted = [];
                    for (i = 0; i < values.instruments.length; i++) {
                        //Surround each string with single quotes
                        quoted.push("'" + values.instruments[i] + "'");
                    }
                    fileCond.push("INSTRUMENT_NAME in (" + quoted.join(',') + ")");
                    cruiseCond.push("INSTRUMENT_NAME in (" + quoted.join(',') + ")");
                }

                if (values.frequencies && values.frequencies.length > 0) {
                    var clauses = [];
                    var clause = 'FREQUENCY LIKE '
                    for (i = 0; i < values.frequencies.length; i++) {
                        clauses.push("FREQUENCY LIKE '%" + values.frequencies[i] + "kHz%'");
                    }
                    var frequencyClause = '(' + clauses.join(' AND ') + ')';
                    fileCond.push(frequencyClause);
                    cruiseCond.push(frequencyClause);
                }

                if (values.minFrequency) {
                    fileCond.push("MIN_FREQ>=" + values.minFrequency);
                    cruiseCond.push("MIN_FREQ>=" + values.minFrequency);
                }
                if (values.maxFrequency) {
                    fileCond.push("MAX_FREQ<=" + values.maxFrequency);
                    cruiseCond.push("MAX_FREQ<=" + values.maxFrequency);
                }

                if (values.minNumBeams) {
                    fileCond.push("NUMBEROFBEAMS>=" + values.minNumBeams);
                }
                if (values.maxNumBeams) {
                    fileCond.push("NUMBEROFBEAMS<=" + values.maxNumBeams);
                }                
                if (values.minSwathWidth) {
                    fileCond.push("SWATHWIDTH>=" + values.minSwathWidth);
                }
                if (values.maxSwathWidth) {
                    fileCond.push("SWATHWIDTH<=" + values.maxSwathWidth);
                }
                if (values.bottomSoundingsOnly) {
                    fileCond.push("BOTTOM_HIT='Y'");
                }   
                
                var fileLayerDefinition = fileCond.join(' AND ');
                var cruiseLayerDefinition = cruiseCond.join(' AND ');
                
                var layerDefinitions = [];

                //Apply to all 6 file-level sublayers
                layerDefinitions[1] = fileLayerDefinition;
                layerDefinitions[2] = fileLayerDefinition;
                layerDefinitions[3] = fileLayerDefinition;
                layerDefinitions[4] = fileLayerDefinition;
                layerDefinitions[5] = fileLayerDefinition;
                layerDefinitions[6] = fileLayerDefinition;

                //Apply to all 6 cruise-level sublayers
                layerDefinitions[8] = cruiseLayerDefinition;
                layerDefinitions[9] = cruiseLayerDefinition;
                layerDefinitions[10] = cruiseLayerDefinition;
                layerDefinitions[11] = cruiseLayerDefinition;
                layerDefinitions[12] = cruiseLayerDefinition;
                layerDefinitions[13] = cruiseLayerDefinition;
                
                this.mercatorMapConfig.mapLayerCollection.getLayerById('Water Column Sonar').setLayerDefinitions(layerDefinitions);
                this.arcticMapConfig.mapLayerCollection.getLayerById('Water Column Sonar').setLayerDefinitions(layerDefinitions);                

                this.layersPanel.enableResetButton();
                this.layersPanel.setCurrentFilterString(values);

                if (values.zoomToResults) {
                    this.zoomToResults(layerDefinitions);
                }
            },

            resetWcd: function() {            
                this.mercatorMapConfig.mapLayerCollection.getLayerById('Water Column Sonar').setLayerDefinitions([]);
                this.arcticMapConfig.mapLayerCollection.getLayerById('Water Column Sonar').setLayerDefinitions([]);

                this.layersPanel.disableResetButton();
                this.layersPanel.searchDialog.clearForm();
                this.layersPanel.setCurrentFilterString('');
            },

            zoomToResults: function(layerDefs) {
                var layerDefsStr = '';

                //Only operate on cruise-level geometries (sublayers 8-13)
                for (var i = 8; i <= 13; i++) {
                    layerDefsStr += i + ':' + layerDefs[i];
                    if (i < 13) {
                        layerDefsStr += ';';
                    }
                }

                var params = {};
                params.layerDefs = layerDefsStr;

                var url = '//gis.ngdc.noaa.gov/geoextents/water_column_sonar/';

                xhr.post(
                    url, {
                        data: params,
                        handleAs: 'json'
                    }).then(lang.hitch(this, function(response){
                        logger.debug(response);
                        if (response && response.bbox !== 'null') {
                            this.zoomToBbox(response.bbox);
                        }
                    }), function(error) {
                        logger.error('Error: ' + error);
                    });                
            },

            //Zooms to bbox in geographic coordinates
            zoomToBbox: function(bboxWkt) {
                var wkt = new Wkt.Wkt();

                wkt.read(bboxWkt);
                var config = {
                    spatialReference: { wkid: 4326 },
                    editable: false
                };
                var polygon = wkt.toObject(config);

                var extent = polygon.getExtent();
                if (this.mapId == 'mercator') {
                    this.mercatorMapConfig.map.setExtent(this.clampExtentTo85(extent), true);
                } else {
                    this.zoomToArcticBbox(extent);
                }
            },

            //Ensure the extent doesn't go beyond the bounds of the Mercator map (85 N/S)
            clampExtentTo85: function(extent) {
                if (extent.ymax > 85) {
                    extent.ymax = 85;
                }
                if (extent.ymin > 85) {
                    extent.ymin = 85;
                }
                if (extent.ymax < -85) {
                    extent.ymax = -85;
                }
                if (extent.ymin < -85) {
                    extent.ymin = -85;
                }
                return extent;
            },

            //Input: Extent in geographic coords. Densifies the geometry, projects it to epsg:3995, then zooms to that geometry.
            zoomToArcticBbox: function(extent) {
                var geometryService = esriConfig.defaults.geometryService;
                var extentWidth = Math.abs(extent.xmax - extent.xmin);
                
                //Densify the geometry with ~20 vertices along the longest edge
                var maxSegmentLength = extentWidth / 20;
                var densifiedGeometry = geometryEngine.densify(extent, maxSegmentLength);

                var projectParams = new ProjectParameters();   
                projectParams.outSR = new SpatialReference(3995);
                projectParams.transformForward = true; 
                projectParams.geometries = [densifiedGeometry];
                
                //Project the densififed geometry, then zoom to the polygon's extent
                geometryService.project(projectParams, lang.hitch(this, function(geometries) {                            
                    this.arcticMapConfig.map.setExtent(geometries[0].getExtent(), true);
                }), function(error) {
                    logger.error(error);
                });
            },

            //Format a date in the form yyyy-mm-dd
            toDateString: function(date) {
                return date.getFullYear() + '-' + this.padDigits(date.getMonth()+1,2) + '-' + this.padDigits(date.getDate(),2);
            },

            padDigits: function(n, totalDigits){
                n = n.toString();
                var pd = '';
                if (totalDigits > n.length) {
                    for (var i = 0; i < (totalDigits - n.length); i++) {
                        pd += '0';
                    }
                }
                return pd + n.toString();
            }
        });
    }
);
