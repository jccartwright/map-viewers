define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dijit/registry',
    'dojo/dom',
    'dojo/_base/config',
    'dojo/io-query',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/on',
    'dojo/store/Memory',
    'dojo/aspect',
    'dojo/request/xhr',
    'dijit/Dialog',
    'dijit/form/Button',
    'dijit/form/CheckBox',
    'esri/config',
    'esri/geometry/Extent',
    'esri/geometry/geometryEngine',
    'esri/geometry/webMercatorUtils',
    'esri/SpatialReference',
    'esri/dijit/Legend',
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
    'app/web_mercator/Identify',
    'app/AppIdentifyPane',
    'app/LayersPanel',
    'dojo/domReady!'],
    function(
        declare,
        array,
        registry,
        dom,
        config,
        ioQuery,
        lang,
        topic,
        on,
        Memory,
        aspect,
        xhr,
        Dialog,
        Button,
        CheckBox,
        esriConfig,
        Extent,
        geometryEngine,
        webMercatorUtils,
        SpatialReference,
        Legend,
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
                esriConfig.defaults.io.corsEnabledServers.push('gis.ngdc.noaa.gov');
                esriConfig.defaults.io.corsEnabledServers.push('gisdev.ngdc.noaa.gov');
                esriConfig.defaults.io.corsEnabledServers.push('maps.ngdc.noaa.gov');

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

                //Subscribe to messages passed by the search dialogs
                topic.subscribe('/geophysics/MarineSearch', lang.hitch(this, function(values) {
                    this.filterMarineSurveys(values);
                }));
                topic.subscribe('/geophysics/AeroSearch', lang.hitch(this, function(values) {
                    this.filterAeroSurveys(values);
                }));
                topic.subscribe('/geophysics/ResetSearch', lang.hitch(this, function() {
                    this.resetSurveyFilter();
                }));

                topic.subscribe('/geophysics/GetMarineDataMultipleSurveys', lang.hitch(this, function(geometry, surveyIds) {
                    //this.openGetMarineDataWindow(geometry, surveyIds, false);
                    this.openNextWarningDialog(geometry, surveyIds, false);
                }));
                topic.subscribe('/geophysics/GetMarineDataSingleSurvey', lang.hitch(this, function(geometry, surveyIds) {
                    //this.openGetMarineDataWindow(geometry, surveyIds, true);
                    this.openNextWarningDialog(geometry, surveyIds, true);
                }));

                this.tracklineLayerDefinitions = []; //object containing the current layer definitions for all sublayers of the "Trackline Combined" service. 

                this.layersPanel.updateSurveyCounts(); //Update the number of surveys reported in the LayersPanel
            },


            setupBanner: function() {
                this.banner = new Banner({
                    breadcrumbs: [
                        {url: 'https://www.noaa.gov', label: 'NOAA', title: 'Go to the National Oceanic and Atmospheric Administration home'},
                        {url: 'https://www.nesdis.noaa.gov', label: 'NESDIS', title: 'Go to the National Environmental Satellite, Data, and Information Service home'},
                        {url: 'https://www.ncei.noaa.gov/', label: 'NCEI', title: 'Go to the National Centers for Environmental Information home'},
                        {url: 'https://www.ncei.noaa.gov/maps-and-geospatial-products', label: 'Maps', title: 'Go to NCEI maps home'},
                        {url: 'https://ngdc.noaa.gov/mgg/geodas/trackline.html', label: 'Trackline Geophysical Data', title: 'Go to NCEI Trackline Geophysical Data home'}
                    ],
                    dataUrl: 'https://ngdc.noaa.gov/mgg/geodas/trackline.html',
                    image: 'images/trackline_viewer_logo.png',
                    imageAlt: 'NCEI Trackline Geophysical Data Viewer - go to data home'
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
                    extent: this.initialExtent,
                    logo: false,
                    showAttribution: false,
                    overview: true,
                    sliderStyle: 'large',
                    navigationMode: 'classic', //disable CSS transforms to eliminate annoying flickering in Chrome
                    lods: zoomLevels.lods
                }, new MercatorLayerCollection());  

                aspect.after(this.mercatorMapConfig, 'mapReady', lang.hitch(this, function() {
                    this.legend = new Legend({
                        map: this.mercatorMapConfig.map,
                        layerInfos: [            
                            {layer: this.mercatorMapConfig.mapLayerCollection.getLayerById('All Parameters')._tiledService, title: " "},
                            {layer: this.mercatorMapConfig.mapLayerCollection.getLayerById('All Parameters')._dynamicService, title: " "},
                            {layer: this.mercatorMapConfig.mapLayerCollection.getLayerById('Bathymetry')._tiledService, title: " "},
                            {layer: this.mercatorMapConfig.mapLayerCollection.getLayerById('Bathymetry')._dynamicService, title: " "},
                            {layer: this.mercatorMapConfig.mapLayerCollection.getLayerById('Gravity')._tiledService, title: " "},
                            {layer: this.mercatorMapConfig.mapLayerCollection.getLayerById('Gravity')._dynamicService, title: " "},
                            {layer: this.mercatorMapConfig.mapLayerCollection.getLayerById('Magnetics')._tiledService, title: " "},
                            {layer: this.mercatorMapConfig.mapLayerCollection.getLayerById('Magnetics')._dynamicService, title: " "},
                            {layer: this.mercatorMapConfig.mapLayerCollection.getLayerById('Single-Channel Seismics')._tiledService, title: " "},    
                            {layer: this.mercatorMapConfig.mapLayerCollection.getLayerById('Single-Channel Seismics')._dynamicService, title: " "},                          
                            {layer: this.mercatorMapConfig.mapLayerCollection.getLayerById('Trackline Combined'), title: " "}
                        ],
                        respectCurrentMapScale: false
                    }, "legend");
                    this.legend.startup();

                    topic.subscribe('/ngdc/layer/visibility', lang.hitch(this, function() {
                        this.legend.refresh();
                    }));
                    topic.subscribe('/ngdc/sublayer/visibility', lang.hitch(this, function() {
                        this.legend.refresh();
                    }));
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

            filterMarineSurveys: function(values) {
                var layerDefinition;
                var sql = [];
                var i;
                
                if ((!values.ships || values.ships.length === 0) && 
                    (!values.institutions || values.institutions.length === 0) && 
                    !values.startYear && !values.endYear && 
                    !values.startDateAdded && !values.endDateAdded &&       
                    !values.surveyIds) {
                    //Dialog contains default values. Clear any selection, and return.
                    this.resetSurveyFilter();
                    return;
                }
                this.isCleared = false;
                this.filterValues = values;
                
                //survey_name takes precedence over ship, year, institution
                if (!values.surveyIds) {
                    if (values.ships && values.ships.length > 0) {          
                        var ships = '';
                        //Create a comma-separated list of ships
                        for (i = 0; i < values.ships.length; i++) {
                            //Escape single quotes in the ship name (i.e. Jeanne D'Arc) with 2 single quotes
                            ships += "'" + values.ships[i].toUpperCase().replace("'", "''") + "'";
                            if (i < values.ships.length - 1) {
                                ships += ',';
                            }   
                        }
                        sql.push("UPPER(PLATFORM) IN (" + ships + ")");                 
                    }
                        
                    if (values.institutions && values.institutions.length > 0) {
                        var institutions = '';
                        //Create a comma-separated list of institutions
                        for (i = 0; i < values.institutions.length; i++) {
                            institutions += "'" + values.institutions[i].toUpperCase().replace("'", "''") + "'";
                            if (i < values.institutions.length - 1) {
                                institutions += ',';
                            }
                        }
                        sql.push("UPPER(INST_SHORT) IN (" + institutions + ")");        
                    }       
                    
                    //only present if omitDate is false
                    if (values.startYear) {
                        sql.push("END_YR >= " + values.startYear);
                    }
                    
                    if (values.endYear) {
                        sql.push("START_YR <= " + values.endYear);
                    }
                    
                    if (values.startDateAdded) {
                        sql.push("DATE_ADDED >= date '" + this.toDateString(values.startDateAdded) + "'");          
                    }
                    
                    if (values.endDateAdded) {
                        sql.push("DATE_ADDED <= date '" + this.toDateString(values.endDateAdded) + "'");                
                    }   
                }
                else {
                    var ids = '';
                    //Create a comma-separated list of survey IDs
                    for (i = 0; i < values.surveyIds.length; i++) {
                        ids += "'" + values.surveyIds[i] + "'";
                        if (i < values.surveyIds.length - 1) {
                            ids += ',';
                        }
                    }
                    sql.push("SURVEY_ID IN (" + ids + ")");
                }
                    
                layerDefinition = sql.join(' and ');
                
                //Setup the layer definition for all 9 marine sublayers at once
                for (i = 0; i < 10; i++) {
                    this.tracklineLayerDefinitions[i] = layerDefinition;        
                }
                
                //Set all the layer definitions for Mercator, Arctic, and Antarctic maps.
                array.forEach(this.mercatorMapConfig.mapLayerCollection.tracklineLayerIds, lang.hitch(this, function(layerId) {
                    this.mercatorMapConfig.mapLayerCollection.getLayerById(layerId).setLayerDefinitions(this.tracklineLayerDefinitions);    
                }));
                array.forEach(this.arcticMapConfig.mapLayerCollection.tracklineLayerIds, lang.hitch(this, function(layerId) {
                    this.arcticMapConfig.mapLayerCollection.getLayerById(layerId).setLayerDefinitions(this.tracklineLayerDefinitions);    
                }));
                array.forEach(this.antarcticMapConfig.mapLayerCollection.tracklineLayerIds, lang.hitch(this, function(layerId) {
                    this.antarcticMapConfig.mapLayerCollection.getLayerById(layerId).setLayerDefinitions(this.tracklineLayerDefinitions);    
                }));

                this.layersPanel.enableResetButton();
                this.layersPanel.enableGetMarineDataButton();

                this.layersPanel.setCurrentMarineFilterString(values);
                
                this.layersPanel.updateSurveyCounts(this.tracklineLayerDefinitions); //Update the number of surveys reported in the TOC
                
                if (values.zoomToResults) {
                    this.zoomToMarineResults(layerDefinition);
                }
            },

            filterAeroSurveys: function(values) {                
                var layerDefinition;
                var sql = [];
                var i;
                
                if ((!values.projects || values.projects.length === 0) && 
                    (!values.aeroParams || values.aeroParams.length === 0) && 
                    !values.startYear && !values.endYear && 
                    !values.startDateAdded && !values.endDateAdded &&       
                    !values.surveyIds) {
                    //Dialog contains default values. Clear any selection, and return.
                    this.resetSurveyFilter();
                    return;
                }
                this.isCleared = false;
                
                //survey_name takes precedence over ship, year, institution
                if (!values.surveyIds) {
                    if (values.projects && values.projects.length > 0) {            
                        var projects = '';
                        //Create a comma-separated list of projects
                        for (i = 0; i < values.projects.length; i++) {
                            //Escape single quotes in the ship name (i.e. Jeanne D'Arc) with 2 single quotes
                            projects += "'" + values.projects[i].toUpperCase().replace("'", "''") + "'";
                            if (i < values.projects.length - 1) {
                                projects += ',';
                            }   
                        }
                        sql.push("UPPER(PROJECT_ID) IN (" + projects + ")");                    
                    }
                    
                    if (values.aeroParams && values.aeroParams.length > 0) {            
                        var params = [];
                        for (i = 0; i < values.aeroParams.length; i++) {
                            var aeroParam = values.aeroParams[i];
                            if (aeroParam === 'T') {
                                params.push("PARAM_T = 'Y'");
                            } else if (aeroParam === 'R') {
                                params.push("PARAM_R = 'Y'");
                            } else if (aeroParam === 'X') {
                                params.push("PARAM_X = 'Y'");
                            } else if (aeroParam === 'Y') {
                                params.push("PARAM_Y = 'Y'");
                            } else if (aeroParam === 'Z') {
                                params.push("PARAM_Z = 'Y'");
                            } else if (aeroParam === 'D') {
                                params.push("PARAM_D = 'Y'");
                            } else if (aeroParam === 'H') {
                                params.push("PARAM_H = 'Y'");
                            } else if (aeroParam === 'I') {
                                params.push("PARAM_I = 'Y'");
                            } else if (aeroParam === 'E') {
                                params.push("PARAM_E = 'Y'");
                            } else if (aeroParam === 'O') {
                                params.push("PARAM_O = 'Y'");
                            }
                        }
                        var paramsClause = '(' + params.join(' or ') + ')';
                        sql.push(paramsClause);                 
                    }
                        
                    //only present if omitDate is false
                    if (values.startYear) {
                        sql.push("END_YR >= " + values.startYear);
                    }       
                    if (values.endYear) {
                        sql.push("START_YR <= " + values.endYear);
                    }       
                    if (values.startDateAdded) {
                        sql.push("DATE_ADDED >= date '" + this.toDateString(values.startDateAdded) + "'");
                    }       
                    if (values.endDateAdded) {
                        sql.push("DATE_ADDED <= date '" + this.toDateString(values.endDateAdded) + "'");              
                    }   
                }
                else {
                    var ids = '';
                    //Create a comma-separated list of survey IDs
                    for (i = 0; i < values.surveyIds.length; i++) {
                        ids += "'" + values.surveyIds[i] + "'";
                        if (i < values.surveyIds.length - 1) {
                            ids += ',';
                        }
                    }
                    sql.push("SURVEY_ID IN (" + ids + ")");
                }
                                
                layerDefinition = sql.join(' and ');
                
                //Setup the layer definition for sublayer 10 (aeromag surveys)
                this.tracklineLayerDefinitions[10] = layerDefinition;        

                //Set all the layer definitions for Mercator, Arctic, and Antarctic maps.
                this.mercatorMapConfig.mapLayerCollection.getLayerById('Trackline Combined').setLayerDefinitions(this.tracklineLayerDefinitions);    
                this.arcticMapConfig.mapLayerCollection.getLayerById('(Arctic) Trackline Combined').setLayerDefinitions(this.tracklineLayerDefinitions);    
                this.antarcticMapConfig.mapLayerCollection.getLayerById('(Antarctic) Trackline Combined').setLayerDefinitions(this.tracklineLayerDefinitions);    

                this.layersPanel.enableResetButton();

                this.layersPanel.setCurrentAeroFilterString(values);
                
                this.layersPanel.updateSurveyCounts(this.tracklineLayerDefinitions); //Update the number of surveys reported in the TOC

                if (values.zoomToResults) {
                    this.zoomToAeroResults(layerDefinition);
                }
            },

            resetSurveyFilter: function() {
                if (!this.isCleared) {
                    this.tracklineLayerDefinitions = [];

                    //Set all the layer definitions for Mercator, Arctic, and Antarctic maps.
                    array.forEach(this.mercatorMapConfig.mapLayerCollection.tracklineLayerIds, lang.hitch(this, function(layerId) {
                        this.mercatorMapConfig.mapLayerCollection.getLayerById(layerId).setLayerDefinitions([]);    
                    }));
                    array.forEach(this.arcticMapConfig.mapLayerCollection.tracklineLayerIds, lang.hitch(this, function(layerId) {
                        this.arcticMapConfig.mapLayerCollection.getLayerById(layerId).setLayerDefinitions(this.tracklineLayerDefinitions);    
                    }));
                    array.forEach(this.antarcticMapConfig.mapLayerCollection.tracklineLayerIds, lang.hitch(this, function(layerId) {
                        this.antarcticMapConfig.mapLayerCollection.getLayerById(layerId).setLayerDefinitions(this.tracklineLayerDefinitions);    
                    }));

                    this.layersPanel.updateSurveyCounts(); //Update the number of surveys reported in the LayersPanel

                    this.layersPanel.marineSearchDialog.clearForm(); //Reset to defaults in the Survey Select Dialog
                    this.layersPanel.aeroSearchDialog.clearForm(); //Reset to defaults in the Survey Select Dialog 
                }
                
                this.isCleared = true;

                this.layersPanel.clearCurrentMarineFilterString();
                this.layersPanel.clearCurrentAeroFilterString();          

                this.layersPanel.disableResetButton();
                this.layersPanel.disableGetMarineDataButton();
            },

            openNextWarningDialog: function(geometry, surveyIds, isSingleSurvey) {
                //Temporary warning dialog for NEXT extract
                var okDialog = new Dialog({
                    title: 'Warning',
                    content: 'We are experiencing technical difficulties with the data delivery system for trackline geophysical data. If you experience problems or do not receive your requested data, please contact <a href="mailto:trackline.info@noaa.gov">trackline.info@noaa.gov</a> for assistance.<br>',
                    'class': 'requestDataDialog',
                    style: 'width:300px'
                });
                new Button({
                    label: 'OK',
                    type: 'submit',
                    onClick: lang.hitch(this, function(){
                        okDialog.destroy();
                        this.openGetMarineDataWindow(geometry, surveyIds, isSingleSurvey);
                    })
                }).placeAt(okDialog.containerNode);
                okDialog.show();
            },

            openGetMarineDataWindow: function(geometry, surveyIds, isSingleSurvey) {
                var filter = this.filterValues;
                var urlParams = [];
                var visibleTracklineLayers = this.layersPanel.visibleTracklineLayers;
                var date;
                var extent;
                var url;
                
                var surveyTypes = [];

                //Get the list of survey types currently visible on the map
                for (var visibleTracklineLayer in visibleTracklineLayers) {
                    if (visibleTracklineLayers[visibleTracklineLayer]) {
                        surveyTypes.push(visibleTracklineLayer);
                    }
                }
                urlParams.push('surveyTypes=' + surveyTypes.join(',')); //Always include the surveyTypes param
                
                if (isSingleSurvey || (geometry && geometry.type === 'point')) {
                    //Case when using single-click to identify, then clicking "Get Marine Data for these Surveys" 
                    //Or, when clicking "Get Marine Data for This Survey".
                    
                    //Pass the survey ID(s) from the IdentifyPane.
                    urlParams.push('surveyIds=' + surveyIds.join(','));        

                    //If geometry is an extent, pass it in geographic coords.
                    if (this.mapId === 'mercator' && geometry && geometry.type === 'extent') {
                        extent = geometry;
                        if (geometry.spatialReference.isWebMercator()) {
                            extent = webMercatorUtils.webMercatorToGeographic(geometry);
                        }
                        //Round lat/lon values to 5 decimal places
                        urlParams.push('geometry=' + 
                                Math.round(extent.xmin*100000)/100000 + ',' + 
                                Math.round(extent.ymin*100000)/100000 + ',' + 
                                Math.round(extent.xmax*100000)/100000 + ',' + 
                                Math.round(extent.ymax*100000)/100000);
                    }

                    if (this.mapId === 'arctic' || this.mapId === 'antarctic') {
                        alert('Warning: The "Draw Rectangle" tool for Arctic/Antarctic projections is currently unsupported for data extraction. The full cruises will be requested.');
                    }

                    url = '//www.ngdc.noaa.gov/trackline/request/?' + urlParams.join('&');
                    window.open(url);
                }
                else {
                    //Case when applying a filter, then clicking "Get Marine Data" in the left panel.
                    //Or, identify with extent, and click "Get Marine Data for These Surveys"

                    //Pass the filter if available.
                    if (filter && !this.isCleared) {
                        if (filter.startYear) {
                            urlParams.push('startYear=' + filter.startYear);
                        }
                        if (filter.endYear) {
                            urlParams.push('endYear=' + filter.endYear);
                        }
                        if (filter.ships) {
                            urlParams.push('platforms=' + filter.ships.join(','));
                        }
                        if (filter.surveyIds) {
                            urlParams.push('surveyIds=' + filter.surveyIds.join(','));
                        }
                        if (filter.institutions) {
                            var quoted = [];
                            for (var i = 0; i < filter.institutions.length; i++) {
                                quoted.push('"' + filter.institutions[i] + '"');
                            }
                            urlParams.push('institutions=' + quoted.join(','));
                        }
                        if (filter.startDateAdded) {
                            date = filter.startDateAdded;
                            urlParams.push('firstDateAdded=' + date.getFullYear() + '-' + this.padDigits(date.getMonth()+1,2) + '-' + this.padDigits(date.getDate(),2));
                        }
                        if (filter.endDateAdded) {
                            date = filter.endDateAdded;
                            urlParams.push('lastDateAdded=' + date.getFullYear() + '-' + this.padDigits(date.getMonth()+1,2) + '-' + this.padDigits(date.getDate(),2));
                        }
                    } 
                    else {
                        //If no filter, pass the survey ID(s) from the IdentifyPane.
                        urlParams.push('surveyIds=' + surveyIds.join(','));        
                    }

                    //Pass the extent in geographic coords.
                    if (this.mapId === 'mercator' && geometry) {
                        //First convert any polygon into an extent.
                        var extent;
                        if (geometry.type === 'extent') {
                            extent = geometry;
                        } else if (geometry.type === 'polygon') {
                            extent = geometry.getExtent();
                        }

                        if (extent.spatialReference.isWebMercator()) {
                            extent = webMercatorUtils.webMercatorToGeographic(extent);
                        }
                        //Round lat/lon values to 5 decimal places
                        urlParams.push('geometry=' + 
                                Math.round(extent.xmin*100000)/100000 + ',' + 
                                Math.round(extent.ymin*100000)/100000 + ',' + 
                                Math.round(extent.xmax*100000)/100000 + ',' + 
                                Math.round(extent.ymax*100000)/100000);
                    }

                    if (this.mapId === 'arctic' || this.mapId === 'antarctic') {
                        alert('Warning: The "Draw Rectangle" tool for Arctic/Antarctic projections is currently unsupported for data extraction. The full cruises will be requested.');
                    }

                    url = '//www.ngdc.noaa.gov/trackline/request/?' + urlParams.join('&');
                    if (url.length > 2000) {
                        alert('Warning: request URL is greater than 2000 characters. Problems may be encountered in some web browsers.');
                    }
                    window.open(url);
                }   
            },

            getTracklineLayerIndex: function(layerId) {
                if (layerId === 'All Parameters') { 
                    return 0; 
                } else if (layerId === 'Bathymetry') { 
                    return 1; 
                } else if (layerId === 'Gravity') { 
                    return 2; 
                } else if (layerId === 'Magnetics') { 
                    return 3; 
                } else if (layerId === 'Multi-Channel Seismics') { 
                    return 4; 
                } else if (layerId === 'Seismic Refraction') { 
                    return 5; 
                } else if (layerId === 'Shot-Point Navigation') { 
                    return 6; 
                } else if (layerId === 'Side Scan Sonar') { 
                    return 7; 
                } else if (layerId === 'Single-Channel Seismics') { 
                    return 8; 
                } else if (layerId === 'Subbottom Profile') { 
                    return 9; 
                } else if (layerId === 'Aeromagnetic Surveys') { 
                    return 10; 
                }
            },

            zoomToMarineResults: function(layerDef) {
                var visibleLayers = this.layersPanel.visibleTracklineLayers;
                var layerDefs = [];
                    
                //Get the list of survey types currently visible on the map
                for (var visibleLayer in visibleLayers) {
                    if (visibleLayers[visibleLayer]) {
                        layerDefs.push(this.getTracklineLayerIndex(visibleLayer) + ':' + layerDef);
                    }
                }

                var layerDefsStr = layerDefs.join(';');

                //Construct string for all 10 marine sublayers
                // for (var i = 0; i <= 9; i++) {
                //     layerDefsStr += i + ':' + layerDef;
                //     if (i < 9) {
                //         layerDefsStr += ';';
                //     }
                // }

                var params = {};
                params.layerDefs = layerDefsStr;

                var url = '//gis.ngdc.noaa.gov/geoextents/trackline_combined_dynamic/';

                xhr.post(
                    url, {
                        data: params,
                        handleAs: 'json'
                    }).then(lang.hitch(this, function(response){
                        logger.debug(response);
                        this.zoomToBbox(response.bbox);
                    }), function(error) {
                        logger.error('Error: ' + error);
                    });                
            },

            zoomToAeroResults: function(layerDef) {
                var layerDefsStr = '10:' + layerDef;

                var params = {};
                params.layerDefs = layerDefsStr;

                var url = '//gis.ngdc.noaa.gov/geoextents/trackline_combined_dynamic/';

                xhr.post(
                    url, {
                        data: params,
                        handleAs: 'json'
                    }).then(lang.hitch(this, function(response){
                        logger.debug(response);
                        this.zoomToBbox(response.bbox);
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
            }
        });
    }
);
