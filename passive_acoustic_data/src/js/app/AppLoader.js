define([
    'dojo/_base/declare',
    'dijit/registry',
    'dojo/dom',
    'dojo/_base/array',
    'dojo/_base/config',
    'dojo/io-query',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/on',
    'dojo/aspect',
    'dojo/Deferred',
    'dojo/promise/all',
    'dijit/form/CheckBox',
    'esri/config',
    'esri/geometry/Extent',
    'esri/SpatialReference',
    'esri/tasks/GeometryService',
    'esri/dijit/Legend',
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
    'app/LayersPanel',
    'dojo/domReady!'],
    function(
        declare,
        registry,
        dom,
        array,
        config,
        ioQuery,
        lang,
        topic,
        on,
        aspect,
        Deferred,
        all,
        CheckBox,
        esriConfig,
        Extent,
        SpatialReference,
        GeometryService,
        Legend,
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
        LayersPanel) {

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

                var startupLayers = [];
                if (queryParams.layers) {
                    startupLayers = queryParams.layers.split(',');
                }
                this.initialExtent = null;
                if (queryParams.minx && queryParams.maxx && queryParams.miny && queryParams.maxy) {
                    this.initialExtent = new Extent({
                        xmin: queryParams.minx,
                        ymin: queryParams.miny,
                        xmax: queryParams.maxx,
                        ymax: queryParams.maxy,
                        spatialReference: new SpatialReference({wkid: 4326})
                    });
                }

                //put the logger into global so all modules have access
                window.logger = new Logger(config.app.loglevel);

                this.setupBanner();

                this.setupLayersPanel();

                this.setupMapViews();

                //Subscribe to messages passed by the search dialog
                topic.subscribe('/pad/Search', lang.hitch(this, function(values) {
                    this.filterPad(values);
                }));
                topic.subscribe('/pad/ResetSearch', lang.hitch(this, function() {
                    this.resetPadFilter();
                }));
            },

            setupBanner: function() {
                this.banner = new Banner({
                    breadcrumbs: [
                        {url: 'https://www.noaa.gov', label: 'NOAA', title: 'Go to the National Oceanic and Atmospheric Administration home'},
                        {url: 'https://www.nesdis.noaa.gov', label: 'NESDIS', title: 'Go to the National Environmental Satellite, Data, and Information Service home'},
                        {url: 'https://www.ncei.noaa.gov/', label: 'NCEI', title: 'Go to the National Centers for Environmental Information home'},
                        {url: 'https://www.ncei.noaa.gov/maps-and-geospatial-products', label: 'Maps', title: 'Go to NCEI maps home'},
                    ],
                    dataUrl: 'https://www.ngdc.noaa.gov/mgg/bathymetry/relief.html',
                    image: 'images/pad_viewer_logo.png',
                    imageAlt: 'NCEI Passive Acoustic Data Viewer - go to data home'
                });
                this.banner.placeAt('banner');
            },

            setupLayersPanel: function() {
                this.layersPanel = new LayersPanel();
                this.layersPanel.placeAt('layersPanel');
            },

            setupMapViews: function() {
                var deferred = new Deferred();
                logger.debug('setting up map views...');

                var deferreds = [];

                // setup map views. You can only draw a Map into a visible container
                deferreds.push(this.setupMercatorView());

                registry.byId('mapContainer').selectChild('arctic');
                deferreds.push(this.setupArcticView());

                registry.byId('mapContainer').selectChild('antarctic');
                deferreds.push(this.setupAntarcticView());

                //go back to mercator as default view
                registry.byId('mapContainer').selectChild('mercator');

                registry.byId('mapContainer').watch('selectedChildWidget', lang.hitch(this, function(name, oval, nval){
                    var mapId = nval.id;
                    logger.debug(mapId + ' map view selected');
                    topic.publish('/ngdc/mapViewActivated', mapId);
                    this.enableMapView(mapId);
                }));

                this.enableMapView('mercator');

                all(deferreds).then(lang.hitch(this, function() {
                    deferred.resolve('success');
                }));
                return deferred.promise;
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
                } else { //antarctic
                    this.mercatorMapConfig.setEnabled(false);
                    this.arcticMapConfig.setEnabled(false);
                    this.antarcticMapConfig.setEnabled(true);
                }   
            },

            setupMercatorView: function() {
                var deferred = new Deferred();
                logger.debug('setting up Mercator view...');

                var zoomLevels = new MercatorZoomLevels();

                var center;
                var zoom;
                if (!this.initialExtent) {
                    center = [-120, 40]; //centered over western US
                    zoom = 2; //relative zoom level; equivalent to absolute zoom level 4
                }

                this.mercatorMapConfig = new MercatorMapConfig('mercator', {
                    center: center,
                    zoom: zoom,
                    initialExtent: this.initialExtent,
                    logo: false,
                    showAttribution: false,
                    overview: true,
                    sliderStyle: 'large',
                    navigationMode: 'classic', //disable CSS transforms to eliminate annoying flickering in Chrome
                    lods: zoomLevels.lods
                }, new MercatorLayerCollection());

                new CoordinatesWithElevationToolbar({map: this.mercatorMapConfig.map, scalebarThreshold: 4}, 'mercatorCoordinatesToolbar');

                aspect.after(this.mercatorMapConfig, 'mapReady', lang.hitch(this, function() {
                    this.setupLegends();
                    deferred.resolve('success');
                }));

                return deferred.promise;
            },

            setupArcticView: function() {
                var deferred = new Deferred();
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

                aspect.after(this.arcticMapConfig, 'mapReady', function() {
                    deferred.resolve('success');
                });

                return deferred.promise;
            },

            setupAntarcticView: function() {
                var deferred = new Deferred();
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

                aspect.after(this.antarcticMapConfig, 'mapReady', function() {
                    deferred.resolve('success');
                });

                return deferred.promise;
            },

            setupLegends: function() {
                var mpaLegend = new Legend({
                    map: this.mercatorMapConfig.map,
                    autoUpdate: false,
                    respectVisibility: false,
                    layerInfos: [
                        {title: 'Legend:', layer: this.mercatorMapConfig.mapLayerCollection.getLayerById('MPA Inventory')}
                    ]
                }, 'mpaLegend');
                mpaLegend.startup();
            },

            filterPad: function(values) {
                var layerDefinition;
                var sql = [];
                var conditionals;
                var i;
                                                                    
                if (values.startDate) {
                    sql.push("END_DATE >= date '" + this.toDateString(values.startDate) + "'");          
                }  
                if (values.endDate) {
                    sql.push("START_DATE <= date '" + this.toDateString(values.endDate) + "'");                
                }  

                if (values.sourceOrganizations && values.sourceOrganizations.length > 0) {
                    conditionals = [];
                    for (i = 0; i < values.sourceOrganizations.length; i++) {
                        //Surround each string with wildcard characters and single quotes
                        conditionals.push("SOURCE_ORGANIZATION LIKE '%" + values.sourceOrganizations[i] + "%'");
                    }
                    if (conditionals.length > 1) {
                        sql.push('(' + conditionals.join(' OR ') + ')');
                    }
                    else {
                        sql.push(conditionals[0]);
                    }
                }
                if (values.fundingOrganizations && values.fundingOrganizations.length > 0) {
                    conditionals = [];
                    for (i = 0; i < values.fundingOrganizations.length; i++) {
                        //Surround each string with wildcard characters and single quotes
                        conditionals.push("FUNDING_ORGANIZATION LIKE '%" + values.fundingOrganizations[i] + "%'");
                    }
                    if (conditionals.length > 1) {
                        sql.push('(' + conditionals.join(' OR ') + ')');
                    }
                    else {
                        sql.push(conditionals[0]);
                    }
                }

                if (values.instruments && values.instruments.length > 0) {
                    conditionals = [];
                    for (i = 0; i < values.instruments.length; i++) {
                        //Surround each string with single quotes
                        conditionals.push("INSTRUMENT_NAME='" + values.instruments[i] + "'");
                    }
                    if (conditionals.length > 1) {
                        sql.push('(' + conditionals.join(' OR ') + ')');
                    }
                    else {
                        sql.push(conditionals[0]);
                    }
                }

                if (values.platformTypes && values.platformTypes.length > 0) {
                    conditionals = [];
                    for (i = 0; i < values.platformTypes.length; i++) {
                        //Surround each string with single quotes
                        conditionals.push("PLATFORM_NAME='" + values.platformTypes[i] + "'");
                    }
                    if (conditionals.length > 1) {
                        sql.push('(' + conditionals.join(' OR ') + ')');
                    }
                    else {
                        sql.push(conditionals[0]);
                    }
                }

                if (values.projects && values.projects.length > 0) {
                    conditionals = [];
                    for (i = 0; i < values.projects.length; i++) {
                        //Surround each string with single quotes
                        conditionals.push("PROJECT_NAME='" + values.projects[i] + "'");
                    }
                    if (conditionals.length > 1) {
                        sql.push('(' + conditionals.join(' OR ') + ')');
                    }
                    else {
                        sql.push(conditionals[0]);
                    }
                }

                if (!isNaN(values.minSampleRate)) {
                    sql.push("MAX_SAMPLE_RATE>=" + values.minSampleRate);
                }
                if (!isNaN(values.maxSampleRate)) {
                    sql.push("MIN_SAMPLE_RATE<=" + values.maxSampleRate);
                }

                if (!isNaN(values.minSensorDepth)) {
                    sql.push("MAX_SENSOR_DEPTH>=" + values.minSensorDepth);
                }
                if (!isNaN(values.maxSensorDepth)) {
                    sql.push("MIN_SENSOR_DEPTH<=" + values.maxSensorDepth);
                }

                if (!isNaN(values.minBottomDepth)) {
                    sql.push("MAX_BOTTOM_DEPTH>=" + values.minBottomDepth);
                }
                if (!isNaN(values.maxBottomDepth)) {
                    sql.push("MIN_BOTTOM_DEPTH<=" + values.maxBottomDepth);
                }

                if (values.recordingDuration) {
                    if (values.recordingDuration === '100') {
                        sql.push("RECORDING_PERCENT=100");
                    } else if (values.recordingDuration === '0-25') {
                        sql.push("RECORDING_PERCENT<25");
                    } else if (values.recordingDuration === '25-50') {
                        sql.push("RECORDING_PERCENT>=25 AND RECORDING_PERCENT<25");
                    } else if (values.recordingDuration === '50-75') {
                        sql.push("RECORDING_PERCENT>=50 AND RECORDING_PERCENT<25");
                    } else if (values.recordingDuration === '75-100') {
                        sql.push("RECORDING_PERCENT>=75 AND RECORDING_PERCENT<100");
                    }
                }

                if (values.numChannels) {
                    if (values.numChannels === '1') {
                        sql.push("NUMBER_CHANNELS=1");
                    } else if (values.numChannels === '2') {
                        sql.push("NUMBER_CHANNELS=2");
                    } else if (values.numChannels === '3+') {
                        sql.push("NUMBER_CHANNELS>=3");
                    }
                }
  
                layerDefinition = sql.join(' and ');
                var allLayerDefs = [layerDefinition, layerDefinition, layerDefinition, layerDefinition, layerDefinition]; //Apply to all 5 sublayers
                this.mercatorMapConfig.mapLayerCollection.getLayerById('PAD').setLayerDefinitions(allLayerDefs);
                this.arcticMapConfig.mapLayerCollection.getLayerById('PAD').setLayerDefinitions(allLayerDefs);
                this.antarcticMapConfig.mapLayerCollection.getLayerById('PAD').setLayerDefinitions(allLayerDefs);

                this.layersPanel.enableResetButton();
                this.layersPanel.setCurrentFilterString(values);

                // if (values.zoomToResults) {
                //     this.zoomToResults(serviceLayerDefs);
                // }
            },

            resetPadFilter: function() {            
                this.mercatorMapConfig.mapLayerCollection.getLayerById('PAD').setLayerDefinitions([]);
                this.arcticMapConfig.mapLayerCollection.getLayerById('PAD').setLayerDefinitions([]);
                this.antarcticMapConfig.mapLayerCollection.getLayerById('PAD').setLayerDefinitions([]);
                
                this.layersPanel.disableResetButton();
                this.layersPanel.searchDialog.clearForm();
                this.layersPanel.setCurrentFilterString('');
            },

            // zoomToResults: function(serviceLayerDefs) {
            //     var deferreds = [];

            //     if (this.layersPanel.chkMultibeam.checked) {
            //         var url = '//gis.ngdc.noaa.gov/geoextents/multibeam_dynamic/';
            //         var params = {layerDefs: '0:' + serviceLayerDefs.multibeam};
            //         deferreds.push(xhr.post(
            //             url, {
            //                 data: params,
            //                 handleAs: 'json'
            //             })
            //         );
            //     }

            //     //Hit the geoextents endpoint for each of the visible services, then zoom to the union of the returned extents.
            //     all(deferreds).then(lang.hitch(this, function(responses) {
            //         logger.debug(responses);
            //         this.zoomToUnionOfBboxes(responses);
            //     }));
            // },

            //Zooms to bbox in geographic coordinates
            // zoomToUnionOfBboxes: function(responses) {
            //     var fullExtent;

            //     array.forEach(responses, lang.hitch(this, function(response) {
            //         if (response.bbox) {
            //             //logger.debug(response.bbox);
            //             var wkt = new Wkt.Wkt();
            //             wkt.read(response.bbox);
            //             var config = {
            //                 spatialReference: { wkid: 4326 },
            //                 editable: false
            //             };
            //             var polygon = wkt.toObject(config);
            //             var extent = polygon.getExtent();

            //             if (fullExtent) {
            //                 fullExtent = fullExtent.union(extent);
            //             } else {
            //                 fullExtent = extent;
            //             }
            //         }
            //     }));

            //     if (fullExtent) {
            //         if (this.mapId === 'mercator') {
            //             this.mercatorMapConfig.map.setExtent(this.clampExtentTo85(fullExtent), true);
            //         } else if (this.mapId === 'arctic') {
            //             this.zoomToPolarBbox(fullExtent, true);
            //         } else { //antarctic
            //             this.zoomToPolarBbox(fullExtent, false);
            //         }
            //     }
            // },

            //Ensure the extent doesn't go beyond the bounds of the Mercator map (85 N/S)
            // clampExtentTo85: function(extent) {
            //     if (extent.ymax > 85) {
            //         extent.ymax = 85;
            //     }
            //     if (extent.ymin > 85) {
            //         extent.ymin = 85;
            //     }
            //     if (extent.ymax < -85) {
            //         extent.ymax = -85;
            //     }
            //     if (extent.ymin < -85) {
            //         extent.ymin = -85;
            //     }
            //     return extent;
            // },

            //Input: Extent in geographic coords. Densifies the geometry, projects it to either epsg:3995 or epsg:3031, then zooms to that geometry.
            // zoomToPolarBbox: function(extent, isArctic) {
            //     var geometryService = esriConfig.defaults.geometryService;
            //     var extentWidth = Math.abs(extent.xmax - extent.xmin);
                
            //     //Densify the geometry with ~20 vertices along the longest edge
            //     var maxSegmentLength = extentWidth / 20;
            //     var densifiedGeometry = geometryEngine.densify(extent, maxSegmentLength);

            //     var projectParams = new ProjectParameters();   
            //     if (isArctic) {
            //         projectParams.outSR = new SpatialReference(3995);
            //     } else {
            //         projectParams.outSR = new SpatialReference(3031);
            //     }
            //     projectParams.transformForward = true; 
            //     projectParams.geometries = [densifiedGeometry];
                
            //     //Project the densififed geometry, then zoom to the polygon's extent
            //     geometryService.project(projectParams, lang.hitch(this, function(geometries) {
            //         if (isArctic) {
            //             this.arcticMapConfig.map.setExtent(geometries[0].getExtent(), true);
            //         } else {
            //             this.antarcticMapConfig.map.setExtent(geometries[0].getExtent(), true); 
            //         }
            //     }), function(error) {
            //         logger.error(error);
            //     });
            // },

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
