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
    'dojo/aspect',    
    'dijit/form/CheckBox',
    'esri/config',
    'esri/geometry/Extent',
    'esri/SpatialReference',
    'ngdc/Logger',
    'app/web_mercator/MapConfig',
    'app/arctic/MapConfig',
    'app/antarctic/MapConfig',
    'ngdc/web_mercator/ZoomLevels',
    'ngdc/arctic/ZoomLevels',
    'ngdc/antarctic/ZoomLevels',
    'ngdc/Banner',
    'ngdc/CoordinatesToolbar',
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
        aspect,
        CheckBox,
        esriConfig,
        Extent,
        SpatialReference,
        Logger,
        MercatorMapConfig,
        ArcticMapConfig,
        AntarcticMapConfig,
        MercatorZoomLevels,
        ArcticZoomLevels,
        AntarcticZoomLevels,
        Banner,
        CoordinatesToolbar,
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

                this.currentInstitution = null;
                this.currentFilter = null;
            },

            init: function() {
                esriConfig.defaults.io.corsEnabledServers = [
                    'http://maps.ngdc.noaa.gov/arcgis/rest/services',
                    'http://mapdevel.ngdc.noaa.gov/arcgis/rest/services'];

                //add queryParams into config object, values in queryParams take precedence
                var queryParams = ioQuery.queryToObject(location.search.substring(1));
                lang.mixin(config.app, queryParams);
                
                if (queryParams.institution) {
                    //this.selectInstitution(queryParams.institution);   
                    this.selectedInstitution = queryParams.institution;
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

                //this.setStartupLayers(startupLayers);

                this.setupMapViews();

                //Subscribe to message passed by the LayersPanel. This is also triggered when specifying the 'institution' URL param
                topic.subscribe('/sample_index/SelectInstitution', lang.hitch(this, function(institution) {
                    this.layersPanel.setSelectedInst(institution);
                    this.selectInstitution(institution);
                }));

                //Subscribe to messages passed by the search dialog
                topic.subscribe('/sample_index/Search', lang.hitch(this, function(values) {
                    this.filterSamples(values);
                }));
                topic.subscribe('/sample_index/ResetSearch', lang.hitch(this, function() {
                    this.resetFilter();
                }));          
            },

            setupBanner: function() {
                var banner = new Banner({
                    breadcrumbs: [
                        {url: 'http://www.noaa.gov', label: 'NOAA'},
                        {url: 'http://www.nesdis.noaa.gov', label: 'NESDIS'},
                        {url: 'http://www.ngdc.noaa.gov', label: 'NGDC'},
                        {url: 'http://maps.ngdc.noaa.gov/viewers', label: 'Maps'},
                        {url: 'http://dx.doi.org/doi:10.7289/V5H41PB8', label: 'Sample Index'}
                    ],
                    dataUrl: 'http://dx.doi.org/doi:10.7289/V5H41PB8',
                    image: 'images/sample_index_viewer_logo.gif'
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
                if (mapId == 'mercator') {
                    this.mercatorMapConfig.setEnabled(true);
                    this.arcticMapConfig.setEnabled(false);
                    this.antarcticMapConfig.setEnabled(false);
                } else if (mapId == 'arctic') {
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
                    lods: zoomLevels.lods,
                    selectedInstitution: this.selectedInstitution
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
                    lods: zoomLevels.lods,
                    selectedInstitution: this.selectedInstitution
                }, new ArcticLayerCollection());

                new CoordinatesToolbar({map: this.arcticMapConfig.map}, 'arcticCoordinatesToolbar');
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
                    lods: zoomLevels.lods,
                    selectedInstitution: this.selectedInstitution
                }, new AntarcticLayerCollection());

                new CoordinatesToolbar({map: this.antarcticMapConfig.map}, 'antarcticCoordinatesToolbar');
            },

            selectInstitution: function(/*String*/ inst) {
                var layerDefinitions = [];
                this.currentInstitution = inst;

                var services = [
                    this.mercatorMapConfig.mapLayerCollection.getLayerById('Sample Index'),
                    this.arcticMapConfig.mapLayerCollection.getLayerById('Sample Index'),
                    this.antarcticMapConfig.mapLayerCollection.getLayerById('Sample Index')
                ];

                array.forEach(services, lang.hitch(this, function(svc) {

                    if (inst === 'AllInst') {
                        svc.hide();
                        if (this.currentFilter) {
                            layerDefinitions[0] = this.currentFilter;
                        }
                        svc.setLayerDefinitions(layerDefinitions);
                        svc.show();
                    } else if (inst === 'None') {
                        svc.hide();
                    } else {
                        svc.hide();
                        
                        if (inst === 'FSU') {
                            inst = 'ARFFSU';
                        }
                        if (inst === 'WISC') {
                            inst = 'U WISC';
                        }
                        
                        if (this.currentFilter) {
                            layerDefinitions = [this.currentFilter + " AND FACILITY_CODE in ('" + inst + "')"];
                        } else {
                            layerDefinitions = ["FACILITY_CODE in ('" + inst + "')"];
                        }

                        svc.setLayerDefinitions(layerDefinitions);   
                        svc.show();
                    }
                }));
            },

            filterSamples: function(values) {
                var layerDefinition;
                var sql = [];
                                                    
                //Multibeam
                if (values.startYear) {
                    sql.push("TO_NUMBER(SUBSTR(BEGIN_DATE,0,4)) >= " + values.startYear);  //TODO replace Oracle-specific functions
                }   
                if (values.endYear) {
                    sql.push("TO_NUMBER(SUBSTR(BEGIN_DATE,0,4)) <= " + values.endYear);  //TODO replace Oracle-specific functions
                }
                if (values.cruise) {
                    sql.push("(UPPER(CRUISE) LIKE '%" + values.cruise.toUpperCase() + "%' OR UPPER(LEG) LIKE '%" + values.cruise.toUpperCase() + "%')");
                }
                if (values.platform) {
                    sql.push("UPPER(PLATFORM) LIKE '%" + values.platform.toUpperCase() + "%'");
                }
                if (values.device) {
                    sql.push("DEVICE LIKE '" + values.device + "%'");
                }
                if (values.lake) {
                    sql.push("UPPER(LAKE) LIKE '%" + values.lake.toUpperCase() + "%'");
                }
                if (values.minWaterDepth) {
                    sql.push("WATER_DEPTH >= " + values.minWaterDepth);
                }
                if (values.maxWaterDepth) {
                    sql.push("WATER_DEPTH <= " + values.maxWaterDepth);
                }
                layerDefinition = sql.join(' AND ');
                this.currentFilter = layerDefinition;
                if (this.currentInstitution && this.currentInstitution != 'AllInst') {
                    layerDefinition += " AND FACILITY_CODE IN ('" + this.currentInstitution + "')";
                }
                //console.log(layerDefinitions);
                this.mercatorMapConfig.mapLayerCollection.getLayerById('Sample Index').setLayerDefinitions([layerDefinition]);
                this.arcticMapConfig.mapLayerCollection.getLayerById('Sample Index').setLayerDefinitions([layerDefinition]);
                this.antarcticMapConfig.mapLayerCollection.getLayerById('Sample Index').setLayerDefinitions([layerDefinition]);

                this.layersPanel.enableResetButton();
                this.layersPanel.setCurrentFilterString(values);
            },

            resetFilter: function() {
                var layerDefinitions = [];
                this.currentFilter = null;
                if (this.currentInstitution && this.currentInstitution != 'AllInst') {
                    layerDefinitions = ["FACILITY_CODE IN ('" + this.currentInstitution + "')"];
                }       
                this.mercatorMapConfig.mapLayerCollection.getLayerById('Sample Index').setLayerDefinitions(layerDefinitions);
                this.arcticMapConfig.mapLayerCollection.getLayerById('Sample Index').setLayerDefinitions(layerDefinitions);
                this.antarcticMapConfig.mapLayerCollection.getLayerById('Sample Index').setLayerDefinitions(layerDefinitions);

                this.layersPanel.disableResetButton();
                this.layersPanel.searchDialog.clearForm();
                this.layersPanel.setCurrentFilterString('');
            }        
        });
    }
);
