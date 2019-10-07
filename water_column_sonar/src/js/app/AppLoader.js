define([
    'dojo/_base/declare',
    'dijit/registry',
    'dojo/dom',
    'dojo/_base/config',
    'dojo/io-query',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/topic',
    'dojo/request/xhr',
    'dijit/form/CheckBox',
    'esri/config',
    'esri/geometry/Extent',
    'esri/geometry/geometryEngine',
    'esri/SpatialReference',
    'esri/tasks/GeometryService',
    'esri/tasks/ProjectParameters',
    'ngdc/Logger',
    'app/web_mercator/MapConfig',
    'app/arctic/MapConfig',
    'app/antarctic/MapConfig',
    'ngdc/web_mercator/ZoomLevels',
    'ngdc/arctic/ZoomLevels',
    'ngdc/antarctic/ZoomLevels',
    'ngdc/Banner',
    'ngdc/CoordinatesWithElevationToolbar',
    'app/web_mercator/LayerCollection',
    'app/arctic/LayerCollection',
    'app/antarctic/LayerCollection',
    'app/web_mercator/MapToolbar',
    'app/arctic/MapToolbar',
    'app/antarctic/MapToolbar',
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
        array,
        topic,
        xhr,
        CheckBox,
        esriConfig,
        Extent,
        geometryEngine,
        SpatialReference,
        GeometryService,
        ProjectParameters,
        Logger,
        MercatorMapConfig,
        ArcticMapConfig,
        AntarcticMapConfig,
        MercatorZoomLevels,
        ArcticZoomLevels,
        AntarcticZoomLevels,
        Banner,
        CoordinatesWithElevationToolbar,
        MercatorLayerCollection,
        ArcticLayerCollection,
        AntarcticLayerCollection,
        MercatorMapToolbar,
        ArcticMapToolbar,
        AntarcticMapToolbar,
        Identify,
        IdentifyPane,
        LayersPanel
        ) {

        return declare(null, {
            mercatorMapConfig: null,
            arcticMapConfig: null,
            antarcticMapConfig: null,

            constructor: function(args){
                declare.safeMixin(this,args);
                this.overlayNode = dom.byId(this.overlayNodeId);
            },

            init: function() {
                esriConfig.defaults.io.corsEnabledServers.push('maps.ngdc.noaa.gov');
                esriConfig.defaults.io.corsEnabledServers.push('gis.ngdc.noaa.gov');
                esriConfig.defaults.io.corsEnabledServers.push('gisdev.ngdc.noaa.gov');
                
                esriConfig.defaults.geometryService = new GeometryService('https://gis.ngdc.noaa.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer');

                //add queryParams into config object, values in queryParams take precedence
                var queryParams = ioQuery.queryToObject(location.search.substring(1));
                lang.mixin(config.app, queryParams);

                this.startupSurveys = [];
                if (queryParams.surveys) {
                    this.startupSurveys = queryParams.surveys.split(',');
                }

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

                //Keep track of when the Mercator, Arctic, and Antarctic maps are ready. Only then should current region be selected. 
                //Messaged passed from MapConfig.mapReady().
                this.mapReadyCount = 0;
                topic.subscribe('/wcd/MapReady', lang.hitch(this, function() {
                    this.mapReadyCount++;
                    
                    if (this.mapReadyCount === 3 && this.startupSurveys.length > 0) {
                        var filterValues = {};
                        filterValues.surveyIds = this.startupSurveys;
                        filterValues.zoomToResults = true;
                        this.filterWcd(filterValues);
                    }
                }));
            },

            setupBanner: function() {
                this.banner = new Banner({
                    breadcrumbs: [
                        {url: 'https://www.noaa.gov', label: 'NOAA', title: 'Go to the National Oceanic and Atmospheric Administration home'},
                        {url: 'https://www.nesdis.noaa.gov', label: 'NESDIS', title: 'Go to the National Environmental Satellite, Data, and Information Service home'},
                        {url: 'https://www.ncei.noaa.gov/', label: 'NCEI', title: 'Go to the National Centers for Environmental Information home'},
                        {url: 'https://www.ncei.noaa.gov/maps-and-geospatial-products', label: 'Maps', title: 'Go to NCEI maps home'},
                        {url: 'https://www.ngdc.noaa.gov/mgg/wcd/', label: 'Water Column Sonar Data'}           
                    ],
                    dataUrl: 'https://www.ngdc.noaa.gov/mgg/wcd/',
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

                registry.byId('mapContainer').selectChild('antarctic');
                this.setupAntarcticView();

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
                if (mapId === 'mercator') {                    
                    this.mercatorMapConfig.setEnabled(true);
                    this.arcticMapConfig.setEnabled(false);
                    this.antarcticMapConfig.setEnabled(false);
                } else if (mapId === 'arctic') {
                    this.mercatorMapConfig.setEnabled(false);
                    this.arcticMapConfig.setEnabled(true);
                    this.antarcticMapConfig.setEnabled(false);                
                } else { //Antarctic
                    this.mercatorMapConfig.setEnabled(false);
                    this.arcticMapConfig.setEnabled(false);
                    this.antarcticMapConfig.setEnabled(true);
                }
            },

            setupMercatorView: function() {
                logger.debug('setting up Mercator view...');

                var zoomLevels = new MercatorZoomLevels();

                this.mercatorMapConfig = new MercatorMapConfig('mercator', {
                    center:[-110, 0], //centered over eastern Pacific
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

                new CoordinatesWithElevationToolbar({map: this.arcticMapConfig.map}, 'arcticCoordinatesToolbar');
            },

            setupAntarcticView: function() {            
                logger.debug('setting up Antarctic view...');
                
                var initialExtent = new Extent({
                    xmin: -4000000,
                    ymin: -4000000,
                    xmax: 4000000,
                    ymax: 4000000,
                    spatialReference: new SpatialReference({wkid: 3031})
                });  

                var zoomLevels = new AntarcticZoomLevels();
            
                this.antarcticMapConfig = new AntarcticMapConfig('antarctic', {
                    extent: initialExtent,
                    //zoom: 3,
                    logo: false,
                    showAttribution: false,
                    overview: false,
                    sliderStyle: 'large',
                    navigationMode: 'classic', //disable CSS transforms to eliminate annoying flickering in Chrome
                    lods: zoomLevels.lods
                }, new AntarcticLayerCollection());

                new CoordinatesWithElevationToolbar({map: this.antarcticMapConfig.map}, 'antarcticCoordinatesToolbar');                
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

                if (values.frequencies && this.isFrequencyFilter(values.frequencies)) {
                    var clauses = [];
                    for (i = 0; i < values.frequencies.length; i++) {
                        var subClauses = [];
                        for (var j = 0; j < values.frequencies[i].length; j++) {
                            subClauses.push("FREQUENCY LIKE '%" + values.frequencies[i][j] + "kHz%'");
                        }
                        
                        if (subClauses.length > 0) {
                            clauses.push('(' + subClauses.join(' OR ') + ')');
                        }
                    }
                    var frequencyClause = '(' + clauses.join(' AND ') + ')';
                    fileCond.push(frequencyClause);
                    cruiseCond.push(frequencyClause);
                }

                if (values.bottomSoundingsOnly) {
                    fileCond.push("BOTTOM_HIT='Y'");
                }   
                
                var fileLayerDefinition = fileCond.join(' AND ');
                var cruiseLayerDefinition = cruiseCond.join(' AND ');
                
                var layerDefinitions = [];

                //Apply to all 6 cruise-level sublayers
                layerDefinitions[0] = cruiseLayerDefinition;
                layerDefinitions[1] = cruiseLayerDefinition;
                layerDefinitions[2] = cruiseLayerDefinition;
                layerDefinitions[3] = cruiseLayerDefinition;
                layerDefinitions[4] = cruiseLayerDefinition;
                layerDefinitions[5] = cruiseLayerDefinition;

                //Apply to file-level sublayer
                layerDefinitions[6] = fileLayerDefinition;
                
                this.mercatorMapConfig.mapLayerCollection.getLayerById('Water Column Sonar').setLayerDefinitions(layerDefinitions);
                this.arcticMapConfig.mapLayerCollection.getLayerById('Water Column Sonar').setLayerDefinitions(layerDefinitions);
                this.antarcticMapConfig.mapLayerCollection.getLayerById('Water Column Sonar').setLayerDefinitions(layerDefinitions);

                this.layersPanel.enableResetButton();
                this.layersPanel.setCurrentFilterString(values);

                if (values.zoomToResults) {
                    this.zoomToResults(layerDefinitions);
                }
            },

            resetWcd: function() {            
                this.mercatorMapConfig.mapLayerCollection.getLayerById('Water Column Sonar').setLayerDefinitions([]);
                this.arcticMapConfig.mapLayerCollection.getLayerById('Water Column Sonar').setLayerDefinitions([]);
                this.antarcticMapConfig.mapLayerCollection.getLayerById('Water Column Sonar').setLayerDefinitions([]);

                this.layersPanel.disableResetButton();
                this.layersPanel.searchDialog.clearForm();
                this.layersPanel.setCurrentFilterString('');
            },

            zoomToResults: function(allLayerDefs) {
                var layerDefs = [];
                var layerDefsStr = '';

                //Only query on the visible layers
                var visibleLayers = this.mercatorMapConfig.mapLayerCollection.getLayerById('Water Column Sonar').visibleLayers;
                array.forEach(visibleLayers, function(layerIdx) {
                    layerDefs.push(layerIdx + ':' + allLayerDefs[layerIdx]);
                })

                var layerDefsStr = layerDefs.join(';');

                if (layerDefsStr !== '') {
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
                }
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

                //shift to 360 before getting the Extent
                array.forEach(polygon.rings[0], function(item){
                    item[0] = item[0] < 0 ? item[0] + 360: item[0];
                });

                var extent = polygon.getExtent();
                if (this.mapId === 'mercator') {
                    this.mercatorMapConfig.map.setExtent(this.clampExtentTo85(extent), true);
                } else if (this.mapId === 'arctic') {
                    this.zoomToPolarBbox(extent, true);
                } else {
                    this.zoomToPolarBbox(extent, false);
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

            //Input: Extent in geographic coords. Densifies the geometry, projects it to either epsg:3995 or epsg:3031, then zooms to that geometry.
            zoomToPolarBbox: function(extent, isArctic) {
                var geometryService = esriConfig.defaults.geometryService;
                var extentWidth = Math.abs(extent.xmax - extent.xmin);
                
                //Densify the geometry with ~20 vertices along the longest edge
                var maxSegmentLength = extentWidth / 20;
                var densifiedGeometry = geometryEngine.densify(extent, maxSegmentLength);

                var projectParams = new ProjectParameters();   
                if (isArctic) {
                    projectParams.outSR = new SpatialReference(3995);
                } else {
                    projectParams.outSR = new SpatialReference(3031);
                }
                projectParams.transformForward = true; 
                projectParams.geometries = [densifiedGeometry];
                
                //Project the densififed geometry, then zoom to the polygon's extent
                geometryService.project(projectParams, lang.hitch(this, function(geometries) {
                    if (isArctic) {
                        this.arcticMapConfig.map.setExtent(geometries[0].getExtent(), true);
                    } else {
                        this.antarcticMapConfig.map.setExtent(geometries[0].getExtent(), true); 
                    }
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
            },

            isFrequencyFilter: function(frequencies) {
                var isFrequencyFilter = false;
                array.forEach(frequencies, function(frequency) {
                    if (frequency.length > 0) {
                        isFrequencyFilter = true;
                    }
                });
                return isFrequencyFilter;
            },
        });
    }
);
