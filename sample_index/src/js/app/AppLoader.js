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
    'dojo/promise/all',
    'dojo/aspect', 
    'dojo/Deferred',
    'esri/config',
    'esri/geometry/Extent',
    'esri/SpatialReference',
    'esri/tasks/GeometryService',
    'esri/tasks/query', 
    'esri/tasks/QueryTask',
    'esri/layers/FeatureLayer',
    'app/FeatureTableCustom',
    'esri/symbols/SimpleMarkerSymbol', 
    'esri/symbols/SimpleLineSymbol',
    'esri/geometry/Point', 
    'esri/graphic',
    'esri/Color',
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
        array,
        registry,
        dom,
        config,
        ioQuery,
        lang,
        topic,
        on,
        all,
        aspect,
        Deferred,
        esriConfig,
        Extent,
        SpatialReference,
        GeometryService,
        Query,
        QueryTask,
        FeatureLayer,
        FeatureTable,
        SimpleMarkerSymbol,
        SimpleLineSymbol,
        Point,
        Graphic,
        Color,
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

                this.currentInstitution = null;
                this.currentFilter = null;

                this.queryTask = new QueryTask('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/sample_index_dynamic/MapServer/0');

                this.featureTableVisible = false;
                this.featureCount = 0;
            },

            init: function() {
                esriConfig.defaults.io.corsEnabledServers.push('maps.ngdc.noaa.gov');
                esriConfig.defaults.io.corsEnabledServers.push('gis.ngdc.noaa.gov');
                esriConfig.defaults.io.corsEnabledServers.push('gisdev.ngdc.noaa.gov');

                esriConfig.defaults.geometryService = new GeometryService('https://gis.ngdc.noaa.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer');

                //add queryParams into config object, values in queryParams take precedence
                var queryParams = ioQuery.queryToObject(location.search.substring(1));
                lang.mixin(config.app, queryParams);
                
                if (queryParams.institution) {
                    this.selectedRepository = queryParams.institution;
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

                var deferreds = [];
                deferreds.push(this.setupLayersPanel());
                deferreds.push(this.setupMapViews());

                all(deferreds).then(lang.hitch(this, function() {
                    this.setupFeatureTable();
                    this.layersPanel.disableShowTableButton();
                    if (this.selectedRepository) {  
                        this.layersPanel.setSelectedRepository(this.selectedRepository);
                        this.filterSamples({repository: this.selectedRepository});
                    } else {
                        this.resetFeatureCount();
                    }
                    this.mercatorMapConfig.mapLayerCollection.getLayerById('Sample Index').show();
                    this.arcticMapConfig.mapLayerCollection.getLayerById('Sample Index').show();
                    this.antarcticMapConfig.mapLayerCollection.getLayerById('Sample Index').show();
                }));

                //Subscribe to messages passed by the search dialog
                topic.subscribe('/sample_index/Search', lang.hitch(this, function(values) {
                    this.filterSamples(values);
                }));
                topic.subscribe('/sample_index/ResetSearch', lang.hitch(this, function() {
                    this.resetFilter();
                }));

                topic.subscribe('/sample_index/ShowFeatureTable', lang.hitch(this, function() {
                    this.showFeatureTable();
                }));
                topic.subscribe('/sample_index/HideFeatureTable', lang.hitch(this, function() {
                    this.hideFeatureTable();
                }));    
            },

            setupBanner: function() {
                this.banner = new Banner({
                    breadcrumbs: [
                        {url: '//www.noaa.gov', label: 'NOAA', title: 'Go to the National Oceanic and Atmospheric Administration home'},
                        {url: '//www.nesdis.noaa.gov', label: 'NESDIS', title: 'Go to the National Environmental Satellite, Data, and Information Service home'},
                        {url: '//www.ngdc.noaa.gov', label: 'NCEI (formerly NGDC)', title: 'Go to the National Centers for Environmental Information (formerly the National Geophysical Data Center) home'},
                        {url: '//maps.ngdc.noaa.gov', label: 'Maps', title: 'Go to NCEI maps home'},
                        {url: 'http://dx.doi.org/doi:10.7289/V5H41PB8', label: 'Sample Index', title: 'Go to Sample Index home'}        
                    ],
                    dataUrl: 'http://dx.doi.org/doi:10.7289/V5H41PB8',
                    image: 'images/sample_index_viewer_logo.gif',
                    imageAlt: 'NCEI Index to Marine and Lacustrine Geological Samples Viewer - go to data home'
                });
                this.banner.placeAt('banner');
            },

            setupLayersPanel: function() {
                var deferred = new Deferred();
                this.layersPanel = new LayersPanel();
                this.layersPanel.placeAt('layersPanel');

                topic.subscribe('layersPanel/filtersReady', lang.hitch(this, function() {
                    deferred.resolve('success');
                }));
                return deferred.promise;
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
                var deferred = new Deferred();
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

                new CoordinatesWithElevationToolbar({map: this.mercatorMapConfig.map, scalebarThreshold: 4}, 'mercatorCoordinatesToolbar');

                aspect.after(this.mercatorMapConfig, 'mapReady', function() {
                    deferred.resolve('success');
                });

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

            setupFeatureTable: function() {
                this.featureLayer = new FeatureLayer("https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/sample_index_dynamic/FeatureServer/0", {
                    mode: FeatureLayer.MODE_ONDEMAND,
                    outFields:  ['FACILITY_CODE','PLATFORM','CRUISE', 'LEG', 'SAMPLE', 'DEVICE', 'BEGIN_DATE', 'YEAR', 'LON', 'LAT', 'WATER_DEPTH', 'STORAGE_METH', 
                        'CORED_LENGTH', 'CORED_DIAM', 'PI', 'PROVINCE', 'LAKE', 'IGSN', 'LAST_UPDATE', 'SHOW_SAMPL', 'CRUISE_URL', 'LEG_URL', 'REPOSITORY_URL'],
                    visible: false, //The FeatureLayer should not be visible on the map. It's only used to populate the FeatureTable.
                    id: "fLayer",
                    definitionExpression: "1=0", //Start with no samples visible; you have to apply a filter first
                    orderByFields: ['SAMPLE ASC'],
                    showColumnHeaderTooltips: false
                }); 
                this.mercatorMapConfig.map.addLayer(this.featureLayer); 

                this.featureTable = new FeatureTable({
                    featureLayer: this.featureLayer,
                    showGridMenu: true,
                    hiddenFields: ['OBJECTID']
                }, 'featureTableNode');

                this.featureTable.fieldInfos = [
                    {name: 'YEAR', format: {template: '${value}'}}, //prevents the comma in years
                    {name: 'LAT', format: {places: 3}},
                    {name: 'LON', format: {places: 3}},
                    {name: 'WATER_DEPTH', format: {template: '${value}'}},
                    {name: 'SHOW_SAMPL', format: {template: '<a href="${value}" target="_blank">Data Link</a>'}},                    
                    {name: 'CRUISE_URL', format: {template: '<a href="${value}" target="_blank">Cruise or Leg Link</a>'}},
                    {name: 'LEG_URL', format: {template: '<a href="${value}" target="_blank">Alternate Cruise or Leg Link</a>'}},
                    {name: 'REPOSITORY_URL', format: {template: '<a href="${value}" target="_blank">Repository Link</a>'}}
                ];
                
                this.featureTable.startup();

                //Start with the featureTable hidden
                var borderContainer = registry.byId('centerContainer');
                var featureTableContainer = registry.byId('featureTableContainer');
                borderContainer.removeChild(featureTableContainer);

                //Selection symbol: cyan square
                var selectionSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 10,
                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                    new Color([0,255,255]), 1),
                    new Color([0,255,255,0.25]));

                //When row(s) are selected, highlight them on the map by adding to the graphics layer
                on(this.featureTable, 'row-select', lang.hitch(this, function() {
                    array.forEach(this.featureTable.selectedRows, lang.hitch(this, function(selectedRow) {
                        var point = new Point(selectedRow['LON'], selectedRow['LAT'], new SpatialReference({wkid:4326}));                        
                        this.mercatorMapConfig.map.graphics.add(new Graphic(point, selectionSymbol));
                        this.arcticMapConfig.map.graphics.add(new Graphic(this.projectPoint(point, 3995), selectionSymbol));
                        this.antarcticMapConfig.map.graphics.add(new Graphic(this.projectPoint(point, 3031), selectionSymbol));
                    }));
                }));

                //Clear the graphics layer when deselecting row
                on(this.featureTable, 'row-deselect', lang.hitch(this, function() {
                    this.mercatorMapConfig.map.graphics.clear();
                    this.arcticMapConfig.map.graphics.clear();
                    this.antarcticMapConfig.map.graphics.clear();
                }));

                on(this.featureTable, 'load', lang.hitch(this, function() {
                    this.featureLayer.name = 'Geological Samples'; //Override the layer name from the map service
                }));
            },

            showFeatureTable: function() {
                var borderContainer = registry.byId('centerContainer');
                var featureTableContainer = registry.byId('featureTableContainer');
                borderContainer.addChild(featureTableContainer);
                this.featureTableVisible = true;
                this.featureTable.refresh();
            },

            hideFeatureTable: function() {
                var borderContainer = registry.byId('centerContainer');
                var featureTableContainer = registry.byId('featureTableContainer');
                borderContainer.removeChild(featureTableContainer);
                this.featureTableVisible = false;
            },

            projectPoint: function(point, wkid) {
                this.sourceProj = new Proj4js.Proj('EPSG:4326');
                this.destProj = new Proj4js.Proj('EPSG:' + wkid);
                var pt = {x: point.x, y: point.y};
                Proj4js.transform(this.sourceProj, this.destProj, pt);
                return new Point(pt.x, pt.y, new SpatialReference({wkid:wkid}));    
            },

            filterSamples: function(values) {
                var layerDefinition;
                var sql = [];
                       
                if (values.repository)                              {
                    sql.push("FACILITY_CODE='" + values.repository + "'");
                }
                if (values.startYear) {
                    sql.push("YEAR >= " + values.startYear);
                }   
                if (values.endYear) {
                    sql.push("YEAR <= " + values.endYear);
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

                this.mercatorMapConfig.mapLayerCollection.getLayerById('Sample Index').setLayerDefinitions([layerDefinition]);
                this.arcticMapConfig.mapLayerCollection.getLayerById('Sample Index').setLayerDefinitions([layerDefinition]);
                this.antarcticMapConfig.mapLayerCollection.getLayerById('Sample Index').setLayerDefinitions([layerDefinition]);

                this.layersPanel.enableResetButton();

                this.displayFeatureCount(layerDefinition).then(lang.hitch(this, function() {
                    if (this.featureCount > 50000) {
                        this.layersPanel.disableShowTableButton();
                        this.hideFeatureTable();
                        this.featureLayer.setDefinitionExpression("1=0");
                    }
                    else {
                        this.layersPanel.enableShowTableButton();
                        this.featureLayer.setDefinitionExpression(layerDefinition);
                        if (this.featureTableVisible) {
                            this.featureTable.refresh();
                        }
                    }
                }));  
            },

            resetFilter: function() {
                var layerDefinitions = [];
                this.currentFilter = null;    
                this.mercatorMapConfig.mapLayerCollection.getLayerById('Sample Index').setLayerDefinitions(layerDefinitions);
                this.arcticMapConfig.mapLayerCollection.getLayerById('Sample Index').setLayerDefinitions(layerDefinitions);
                this.antarcticMapConfig.mapLayerCollection.getLayerById('Sample Index').setLayerDefinitions(layerDefinitions);

                this.resetFeatureCount();

                this.hideFeatureTable();
                this.layersPanel.disableShowTableButton();
                this.featureLayer.setDefinitionExpression("1=0");
            },

            displayFeatureCount: function(layerDefinition) {
                var deferred = new Deferred();
                var query = new Query();
                query.where = layerDefinition;

                var countDiv = dom.byId('featureCount');
                this.queryTask.executeForCount(query, lang.hitch(this, function(count) {
                    countDiv.innerHTML = 'Number of Samples Displayed: ' + count;
                    this.featureCount = count;
                    deferred.resolve('success');
                }), function(error) {
                    logger.error(error);
                    countDiv.innerHTML = 'Number of Samples Displayed: unavailable';
                    this.featureCount = 0;
                    deferred.resolve('error');
                });
                return deferred.promise;
            },

            resetFeatureCount: function() {
                var countDiv = dom.byId('featureCount');
                countDiv.innerHTML = 'Number of Samples Displayed: ';

                if (!this.featureCountTotal) {
                    var query = new Query();
                    query.where = '1=1';
                    this.queryTask.executeForCount(query, lang.hitch(this, function(count) {
                        this.featureCountTotal = count;
                        this.featureCount = count;
                        countDiv.innerHTML = 'Number of Samples Displayed: ' + count;
                    }), function(error) {
                        logger.error(error);
                    });  
                }
                else {
                    countDiv.innerHTML = 'Number of Samples Displayed: ' + this.featureCountTotal;   
                }
            }
        });
    }
);
