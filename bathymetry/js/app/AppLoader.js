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
    'dojo/request/xhr',
    'dojo/promise/all',
    'dijit/form/CheckBox',
    'esri/config',
    'esri/geometry/Extent',
    'esri/geometry/geometryEngine',
    'esri/SpatialReference',
    'esri/tasks/GeometryService',
    'esri/tasks/ProjectParameters',
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
    'app/web_mercator/MapToolbar',
    'app/arctic/MapToolbar',
    'app/antarctic/MapToolbar',
    'app/web_mercator/Identify',
    'app/AppIdentifyPane',
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
        xhr,
        all,
        CheckBox,
        esriConfig,
        Extent,
        geometryEngine,
        SpatialReference,
        GeometryService,
        ProjectParameters,
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
        MapToolbar,
        ArcticMapToolbar,
        AntarcticMapToolbar,
        WebMercatorIdentify,
        IdentifyPane,
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
                esriConfig.defaults.io.corsEnabledServers = [
                    'http://maps.ngdc.noaa.gov/arcgis/rest/services',
                    'http://mapdevel.ngdc.noaa.gov/arcgis/rest/services'
                ];

                esriConfig.defaults.geometryService = new GeometryService('//maps.ngdc.noaa.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer');

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

                this.setStartupLayers(startupLayers);

                this.setupMapViews();

                //Subscribe to messages passed by the search dialog
                topic.subscribe('/bathymetry/Search', lang.hitch(this, function(values) {
                    this.filterSurveys(values);
                }));
                topic.subscribe('/bathymetry/ResetSearch', lang.hitch(this, function() {
                    this.resetSurveyFilter();
                }));
            },

            setupBanner: function() {

                this.banner = new Banner({
                    breadcrumbs: [
                        {url: '//www.noaa.gov', label: 'NOAA', title: 'Go to the National Oceanic and Atmospheric Administration home'},
                        {url: '//www.nesdis.noaa.gov', label: 'NESDIS', title: 'Go to the National Environmental Satellite, Data, and Information Service home'},
                        {url: '//www.ngdc.noaa.gov', label: 'NCEI (formerly NGDC)', title: 'Go to the National Centers for Environmental Information (formerly the National Geophysical Data Center) home'},
                        {url: '//maps.ngdc.noaa.gov', label: 'Maps', title: 'Go to NCEI maps home'},
                        {url: '//www.ngdc.noaa.gov/mgg/bathymetry/relief.html', label: 'Bathymetry'}           
                    ],
                    dataUrl: '//www.ngdc.noaa.gov/mgg/bathymetry/relief.html',
                    image: 'images/bathymetry_viewer_logo.png',
                    imageAlt: 'NCEI Bathymetric Data Viewer - go to data home'
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
                    logger.debug(mapId + ' map view selected');
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
                } else { //antarctic
                    this.mercatorMapConfig.setEnabled(false);
                    this.arcticMapConfig.setEnabled(false);
                    this.antarcticMapConfig.setEnabled(true);
                }   
            },

            setupMercatorView: function() {
                logger.debug('setting up Mercator view...');

                var zoomLevels = new MercatorZoomLevels();

                var center;
                var zoom;
                if (!this.initialExtent) {
                    center = [-110, 20]; //centered over eastern Pacific
                    zoom = 1; //relative zoom level; equivalent to absolute zoom level 3
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
                }, new MercatorLayerCollection({
                    multibeamVisible: this.multibeamVisible,
                    nosHydroVisible: this.nosHydroVisible,
                    tracklineVisible: this.tracklineVisible,
                    demVisible: this.demVisible
                }));

                aspect.after(this.mercatorMapConfig, 'mapReady', lang.hitch(this, function() {
                    var legend = new Legend({
                        map: this.mercatorMapConfig.map,
                        layerInfos: [
                            {title: 'DEM Tiles', layer: this.mercatorMapConfig.mapLayerCollection.getLayerById('DEM Tiles')}
                        ]
                    }, 'dynamicLegend');
                    legend.startup();
                }));

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
                }, new ArcticLayerCollection({
                    multibeamVisible: this.multibeamVisible,
                    nosHydroVisible: this.nosHydroVisible,
                    tracklineVisible: this.tracklineVisible,
                    demVisible: this.demVisible
                }));

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
                }, new AntarcticLayerCollection({
                    multibeamVisible: this.multibeamVisible,
                    tracklineVisible: this.tracklineVisible,
                    demVisible: this.demVisible
                }));

                new CoordinatesWithElevationToolbar({map: this.antarcticMapConfig.map}, 'antarcticCoordinatesToolbar');
            },

            //Sets layers visible on startup using the 'layers' url parameter, which can contain a comma-spearated list with 'multibeam', 'trackline', 'nos_hydro', 'dem'
            setStartupLayers: function(/*String[]*/ startupLayers) {                
                if (startupLayers.length === 0) {
                    this.layersPanel.chkMultibeam.set('checked', true);
                    this.multibeamVisible = true;
                    return;    
                }

                for (var i = 0; i < startupLayers.length; i++) {
                    if (startupLayers[i].toLowerCase() === 'multibeam') {
                        this.layersPanel.chkMultibeam.set('checked', true);
                        this.multibeamVisible = true;
                    } 
                    else if (startupLayers[i].toLowerCase() === 'nos_hydro') {
                        //Startup with "Surveys with Digital Sounding Data" and "Surveys with BAGs" visible
                        this.layersPanel.chkNosHydroBags.set('checked', true);
                        this.layersPanel.chkNosHydroDigital.set('checked', true);
                        //this.layersPanel.chkBagHillshades.set('checked', true);
                        this.nosHydroVisible = true;
                    } 
                    else if (startupLayers[i].toLowerCase() === 'trackline') {
                        this.layersPanel.chkTrackline.set('checked', true);
                        this.tracklineVisible = true;
                    } 
                    else if (startupLayers[i].toLowerCase() === 'dem') {
                        //Startup with DEM Footprints and DEM Hillshades visible
                        this.layersPanel.chkDems.set('checked', true);
                        this.layersPanel.chkDemHillshades.set('checked', true);
                        this.demVisible = true;
                    }
                }
            },

            filterSurveys: function(values) {
                var layerDefinition;
                var sql = [];
                var serviceLayerDefs = {};
                                                    
                //Multibeam
                if (values.startYear) {
                    sql.push("SURVEY_YEAR >= " + values.startYear);
                }   
                if (values.endYear) {
                    sql.push("SURVEY_YEAR <= " + values.endYear);
                }
                if (values.survey) {
                    sql.push("UPPER(SURVEY_ID) LIKE '" + values.survey.toUpperCase().replace(/\*/g, '%') + "'");
                }
                if (values.platform) {
                    sql.push("UPPER(PLATFORM) LIKE '" + values.platform.toUpperCase().replace(/\*/g, '%') + "'");                    
                }
                layerDefinition = sql.join(' and ');
                this.mercatorMapConfig.mapLayerCollection.getLayerById('Multibeam').setLayerDefinitions([layerDefinition]);
                this.arcticMapConfig.mapLayerCollection.getLayerById('Multibeam').setLayerDefinitions([layerDefinition]);
                this.antarcticMapConfig.mapLayerCollection.getLayerById('Multibeam').setLayerDefinitions([layerDefinition]);
                serviceLayerDefs.multibeam = layerDefinition;

                //Trackline Bathymetry
                sql = [];
                if (values.startYear) {
                    sql.push("END_YR >= " + values.startYear);
                }       
                if (values.endYear) {
                    sql.push("START_YR <= " + values.endYear);
                }
                if (values.survey) {
                    sql.push("UPPER(SURVEY_ID) LIKE '" + values.survey.toUpperCase().replace(/\*/g, '%') + "'");
                }
                if (values.platform) {
                    sql.push("UPPER(PLATFORM) LIKE '" + values.platform.toUpperCase().replace(/\*/g, '%') + "'");
                }
                layerDefinition = sql.join(' and ');
                var allLayerDefinitions = [];
                allLayerDefinitions[1] = layerDefinition;
                this.mercatorMapConfig.mapLayerCollection.getLayerById('Trackline Bathymetry').setLayerDefinitions(allLayerDefinitions);
                this.arcticMapConfig.mapLayerCollection.getLayerById('Trackline Bathymetry').setLayerDefinitions(allLayerDefinitions);
                this.antarcticMapConfig.mapLayerCollection.getLayerById('Trackline Bathymetry').setLayerDefinitions(allLayerDefinitions);
                serviceLayerDefs.trackline = layerDefinition;

                //NOS Hydro 
                sql = [];
                if (values.startYear) {
                    sql.push("SURVEY_YEAR >= " + values.startYear);
                }       
                if (values.endYear) {
                    sql.push("SURVEY_YEAR <= " + values.endYear);
                }
                if (values.survey) {
                    sql.push("UPPER(SURVEY_ID) LIKE '" + values.survey.toUpperCase().replace(/\*/g, '%') + "'");
                }
                if (values.platform) {
                    sql.push("UPPER(PLATFORM) LIKE '" + values.platform.toUpperCase().replace(/\*/g, '%') + "'");
                }
                layerDefinition = sql.join(' and ');
                allLayerDefinitions = [];
                allLayerDefinitions[0] = layerDefinition;
                allLayerDefinitions[1] = layerDefinition;
                allLayerDefinitions[2] = layerDefinition;      
                this.mercatorMapConfig.mapLayerCollection.getLayerById('NOS Hydrographic Surveys').setLayerDefinitions(allLayerDefinitions);
                this.arcticMapConfig.mapLayerCollection.getLayerById('NOS Hydrographic Surveys').setLayerDefinitions(allLayerDefinitions);
                this.mercatorMapConfig.mapLayerCollection.getLayerById('NOS Hydro (non-digital)').setLayerDefinitions(allLayerDefinitions);
                this.arcticMapConfig.mapLayerCollection.getLayerById('NOS Hydro (non-digital)').setLayerDefinitions(allLayerDefinitions);
                this.mercatorMapConfig.mapLayerCollection.getLayerById('NOS Hydro (BAGs)').setLayerDefinitions(allLayerDefinitions);
                this.arcticMapConfig.mapLayerCollection.getLayerById('NOS Hydro (BAGs)').setLayerDefinitions(allLayerDefinitions);
                serviceLayerDefs.nosHydro = layerDefinition;
                        
                this.layersPanel.enableResetButton();
                this.layersPanel.setCurrentFilterString(values);

                if (values.zoomToResults) {
                    this.zoomToResults(serviceLayerDefs);
                }
            },

            resetSurveyFilter: function() {            
                this.mercatorMapConfig.mapLayerCollection.getLayerById('Multibeam').setLayerDefinitions([]);
                this.mercatorMapConfig.mapLayerCollection.getLayerById('Trackline Bathymetry').setLayerDefinitions([]);
                this.mercatorMapConfig.mapLayerCollection.getLayerById('NOS Hydrographic Surveys').setLayerDefinitions([]);
                this.mercatorMapConfig.mapLayerCollection.getLayerById('NOS Hydro (non-digital)').setLayerDefinitions([]);
                this.mercatorMapConfig.mapLayerCollection.getLayerById('NOS Hydro (BAGs)').setLayerDefinitions([]);

                this.arcticMapConfig.mapLayerCollection.getLayerById('Multibeam').setLayerDefinitions([]);
                this.arcticMapConfig.mapLayerCollection.getLayerById('Trackline Bathymetry').setLayerDefinitions([]);
                this.arcticMapConfig.mapLayerCollection.getLayerById('NOS Hydrographic Surveys').setLayerDefinitions([]);
                this.arcticMapConfig.mapLayerCollection.getLayerById('NOS Hydro (non-digital)').setLayerDefinitions([]);
                this.arcticMapConfig.mapLayerCollection.getLayerById('NOS Hydro (BAGs)').setLayerDefinitions([]);

                this.antarcticMapConfig.mapLayerCollection.getLayerById('Multibeam').setLayerDefinitions([]);
                this.antarcticMapConfig.mapLayerCollection.getLayerById('Trackline Bathymetry').setLayerDefinitions([]);

                this.layersPanel.disableResetButton();
                this.layersPanel.searchDialog.clearForm();
                this.layersPanel.setCurrentFilterString('');
            },

            zoomToResults: function(serviceLayerDefs) {
                var deferreds = [];
                var url;
                var params;

                if (this.layersPanel.chkMultibeam.checked) {
                    url = '//gis.ngdc.noaa.gov/geoextents/multibeam_dynamic/';
                    params = {layerDefs: '0:' + serviceLayerDefs.multibeam};
                    deferreds.push(xhr.post(
                        url, {
                            data: params,
                            handleAs: 'json'
                        })
                    );
                }

                if (this.layersPanel.chkTrackline.checked) {
                    url = '//gis.ngdc.noaa.gov/geoextents/trackline_combined_dynamic/';
                    params = {layerDefs: '1:' + serviceLayerDefs.trackline};
                    deferreds.push(xhr.post(
                        url, {
                            data: params,
                            handleAs: 'json'
                        })
                    );
                }

                if (this.layersPanel.chkNosHydroBags.checked || this.layersPanel.chkNosHydroDigital.checked || this.layersPanel.chkNosHydroNonDigital.checked) {
                    url = '//gis.ngdc.noaa.gov/geoextents/nos_hydro_dynamic/';
                    var layerDef = serviceLayerDefs.nosHydro;
                    params = {layerDefs: '0:' + layerDef + ';1:' + layerDef + ';2:' + layerDef};
                    deferreds.push(xhr.post(
                        url, {
                            data: params,
                            handleAs: 'json'
                        })
                    );
                }

                //Hit the geoextents endpoint for each of the visible services, then zoom to the union of the returned extents.
                all(deferreds).then(lang.hitch(this, function(responses) {
                    logger.debug(responses);
                    this.zoomToUnionOfBboxes(responses);
                }));
            },

            //Zooms to bbox in geographic coordinates
            zoomToUnionOfBboxes: function(responses) {
                var fullExtent;

                array.forEach(responses, lang.hitch(this, function(response) {
                    if (response.bbox) {
                        //logger.debug(response.bbox);
                        var wkt = new Wkt.Wkt();
                        wkt.read(response.bbox);
                        var config = {
                            spatialReference: { wkid: 4326 },
                            editable: false
                        };
                        var polygon = wkt.toObject(config);
                        var extent = polygon.getExtent();

                        if (fullExtent) {
                            fullExtent = fullExtent.union(extent);
                        } else {
                            fullExtent = extent;
                        }
                    }
                }));

                if (fullExtent) {
                    if (this.mapId === 'mercator') {
                        this.mercatorMapConfig.map.setExtent(this.clampExtentTo85(fullExtent), true);
                    } else if (this.mapId === 'arctic') {
                        this.zoomToPolarBbox(fullExtent, true);
                    } else { //antarctic
                        this.zoomToPolarBbox(fullExtent, false);
                    }
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
        });
    }
);
