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
    'ngdc/Logger',
    'app/web_mercator/MapConfig',
    'ngdc/web_mercator/ZoomLevels',
    'ngdc/Banner',
    'ngdc/CoordinatesToolbar',
    'app/web_mercator/LayerCollection',
    'app/web_mercator/MapToolbar',
    'app/web_mercator/Identify',
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
        Logger,
        MercatorMapConfig,        
        MercatorZoomLevels,        
        Banner,
        CoordinatesToolbar,
        MercatorLayerCollection,        
        MapToolbar,        
        WebMercatorIdentify,
        IdentifyPane,
        LayersPanel) {

        return declare(null, {
            mercatorMapConfig: null,            

            constructor: function(args){
                declare.safeMixin(this,args);
                this.overlayNode = dom.byId(this.overlayNodeId);
            },

            init: function() {
                esriConfig.defaults.io.corsEnabledServers = [
                    'http://maps.ngdc.noaa.gov/arcgis/rest/services',
                    'http://mapdevel.ngdc.noaa.gov/arcgis/rest/services'];

                //add queryParams into config object, values in queryParams take precedence
                var queryParams = ioQuery.queryToObject(location.search.substring(1));
                lang.mixin(config.app, queryParams);

                var startupLayers = [];
                if (queryParams.layers) {
                    startupLayers = queryParams.layers.split(',');
                }
                
                //Initial extent centered over northeast US
                this.initialExtent = new Extent({
                    xmin: -78,
                    ymin: 37,
                    xmax: -70,
                    ymax: 43,
                    spatialReference: new SpatialReference({wkid: 4326})
                });

                //Extent can be overridden with URL parameters
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

                topic.subscribe('/ngdc/MapReady', lang.hitch(this, function() {
                    var filterValues = {startYear: 2012};
                    this.filterSurveys(filterValues);
                }));

                //Subscribe to messages passed by the search dialog
                topic.subscribe('/bathymetry/Search', lang.hitch(this, function(values) {
                    this.filterSurveys(values);
                }));
                topic.subscribe('/bathymetry/ResetSearch', lang.hitch(this, function() {
                    this.resetSurveyFilter();
                }));
            },

            setupBanner: function() {
                var banner = new Banner({
                    breadcrumbs: [
                        {url: 'http://www.noaa.gov', label: 'NOAA'},
                        {url: 'http://www.nesdis.noaa.gov', label: 'NESDIS'},
                        {url: 'http://www.ngdc.noaa.gov', label: 'NGDC'},
                        {url: 'http://maps.ngdc.noaa.gov/viewers', label: 'Maps'},
                        {url: 'http://www.ngdc.noaa.gov/mgg/bathymetry/relief.html', label: 'Bathymetry'}
                    ],
                    dataUrl: 'http://www.ngdc.noaa.gov/mgg/bathymetry/relief.html',
                    image: 'images/northeast_ocm_viewer_logo.png'
                });
                banner.placeAt('banner');
            },

            setupLayersPanel: function() {
                this.layersPanel = new LayersPanel();
                this.layersPanel.placeAt('layersPanel');
            },

            setupMapViews: function() {
                logger.debug('setting up map views...');
                // setup map views. You can only draw a Map into a visible container
                this.setupMercatorView();                
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
                }, new MercatorLayerCollection({
                    multibeamVisible: this.multibeamVisible,
                    nosHydroVisible: this.nosHydroVisible,
                    tracklineVisible: this.tracklineVisible,
                    demVisible: this.demVisible
                }));  

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

            //Sets layers visible on startup using the 'layers' url parameter, which can contain a comma-spearated list with 'multibeam', 'trackline', 'nos_hydro', 'dem'
            setStartupLayers: function(/*String[]*/ startupLayers) {                
                if (startupLayers.length === 0) {
                    this.layersPanel.chkMultibeam.set('checked', true);
                    this.multibeamVisible = true;

                    this.layersPanel.chkNosHydroBags.set('checked', true);
                    this.nosHydroVisible = true;

                    this.layersPanel.chkNosHydroDigital.set('checked', true);
                    this.nosHydroVisible = true;

                    this.layersPanel.chkDems.set('checked', true);
                    //this.demVisible = true;
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
                var layerDefinitions;
                var sql = [];
                                                    
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
                    sql.push("UPPER(PLATFORM) LIKE '%" + values.platform.toUpperCase().replace(/\*/g, '%') + "'");
                }
                layerDefinitions = sql.join(' and ');
                //console.log(layerDefinitions);
                this.mercatorMapConfig.mapLayerCollection.getLayerById('Multibeam').setLayerDefinitions([layerDefinitions]);
                
                //Trackline Bathymetry
                sql = [];
                if (values.startYear) {
                    sql.push("END_YR >= " + values.startYear);
                }       
                if (values.endYear) {
                    sql.push("START_YR <= " + values.endYear);
                }
                if (values.survey) {
                    sql.push("UPPER(SURVEY_ID) = '" + values.survey.toUpperCase().replace(/\*/g, '%') + "'");
                }
                if (values.platform) {
                    sql.push("UPPER(PLATFORM) LIKE '%" + values.platform.toUpperCase().replace(/\*/g, '%') + "'");
                }
                layerDefinitions = sql.join(' and ');
                //console.log(layerDefinitions);
                var allLayerDefinitions = [];
                //allLayerDefinitions[0] = layerDefinitions;
                allLayerDefinitions[1] = layerDefinitions;
                this.mercatorMapConfig.mapLayerCollection.getLayerById('Trackline Bathymetry').setLayerDefinitions(allLayerDefinitions);
                                
                //NOS Hydro 
                sql = [];
                if (values.startYear) {
                    sql.push("SURVEY_YEAR >= " + values.startYear);
                }       
                if (values.endYear) {
                    sql.push("SURVEY_YEAR <= " + values.endYear);
                }
                if (values.survey) {
                    sql.push("UPPER(SURVEY_ID) LIKE '%" + values.survey.toUpperCase().replace(/\*/g, '%') + "'");
                }
                if (values.platform) {
                    sql.push("UPPER(PLATFORM) LIKE '%" + values.platform.toUpperCase().replace(/\*/g, '%') + "'");
                }
                layerDefinitions = sql.join(' and ');
                //console.log(layerDefinitions);
                allLayerDefinitions = [];
                allLayerDefinitions[0] = layerDefinitions;
                allLayerDefinitions[1] = layerDefinitions;
                allLayerDefinitions[2] = layerDefinitions;      
                this.mercatorMapConfig.mapLayerCollection.getLayerById('NOS Hydrographic Surveys').setLayerDefinitions(allLayerDefinitions);
                this.mercatorMapConfig.mapLayerCollection.getLayerById('NOS Hydro (non-digital)').setLayerDefinitions(allLayerDefinitions);
                this.mercatorMapConfig.mapLayerCollection.getLayerById('NOS Hydro (BAGs)').setLayerDefinitions(allLayerDefinitions);
                                           
                this.layersPanel.enableResetButton();
                this.layersPanel.setCurrentFilterString(values);
                this.mercatorMapConfig.identify.setCurrentFilter(values);
            },

            resetSurveyFilter: function() {            
                this.mercatorMapConfig.mapLayerCollection.getLayerById('Multibeam').setLayerDefinitions([]);
                this.mercatorMapConfig.mapLayerCollection.getLayerById('Trackline Bathymetry').setLayerDefinitions([]);
                this.mercatorMapConfig.mapLayerCollection.getLayerById('NOS Hydrographic Surveys').setLayerDefinitions([]);
                this.mercatorMapConfig.mapLayerCollection.getLayerById('NOS Hydro (non-digital)').setLayerDefinitions([]);
                this.mercatorMapConfig.mapLayerCollection.getLayerById('NOS Hydro (BAGs)').setLayerDefinitions([]);
 
                this.layersPanel.disableResetButton();
                this.layersPanel.searchDialog.clearForm();
                this.layersPanel.setCurrentFilterString('');
                this.mercatorMapConfig.identify.clearCurrentFilter();
            }
        });
    }
);
