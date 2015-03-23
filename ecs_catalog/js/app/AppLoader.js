define([
    'dojo/_base/declare',
    'dijit/registry',
    'dojo/dom',
    'dojo/_base/config',
    'dojo/io-query',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/topic',
    'dojo/on',
    'dojo/aspect',
    'dijit/form/CheckBox',
    'esri/config',
    'esri/urlUtils',
    'esri/geometry/Extent',
    'esri/SpatialReference',
    'esri/geometry/webMercatorUtils',
    'esri/dijit/Legend',
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
        on,
        aspect,
        CheckBox,
        esriConfig,
        urlUtils,
        Extent,
        SpatialReference,
        webMercatorUtils,
        Legend,
        Logger,
        MercatorMapConfig,
        ArcticMapConfig,
        MercatorZoomLevels,
        ArcticZoomLevels,
        Banner,
        CoordinatesToolbar,
        MercatorLayerCollection,
        ArcticLayerCollection,
        MapToolbar,
        ArcticMapToolbar,
        LayersPanel) {

        return declare(null, {
            mercatorMapConfig: null,
            arcticMapConfig: null,

            scenarioProductLayerIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            boundaryLayerIds: [15, 16, 17, 18, 19],
            sourceDataLayerIds: [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
            dataProductLayerIds: [42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58],

            regionFilter: '',
            phaseFilter: '',
            scenarioFilter: '',

            constructor: function(args){
                declare.safeMixin(this,args);
                this.overlayNode = dom.byId(this.overlayNodeId);
            },

            init: function() {
                esriConfig.defaults.io.corsEnabledServers = [
                    'http://maps.ngdc.noaa.gov/arcgis/rest/services',
                    'https://maps.ngdc.noaa.gov/arcgis/rest/services',
                    'http://mapdevel.ngdc.noaa.gov/arcgis/rest/services',
                    'http://sparrow.ngdc.noaa.gov'
                ];


                //Use the proxy for only the 'ecs_catalog' map service.
                urlUtils.addProxyRule({
                     urlPrefix: 'http://maps.ngdc.noaa.gov/arcgis/rest/services/intranet/ecs_catalog',
                     proxyUrl: window.location.protocol + '//' + window.location.host + "/ecs-catalog/rest/map/proxy"
                });
                urlUtils.addProxyRule({
                     urlPrefix: 'http://mapdevel.ngdc.noaa.gov/arcgis/rest/services/intranet/ecs_catalog_surge',
                     proxyUrl: window.location.protocol + '//' + window.location.host + "/ecs-catalog/rest/map/proxy"
                });

                this.filterPanel = registry.byId('filterPanel');

                //add queryParams into config object, values in queryParams take precedence
                var queryParams = ioQuery.queryToObject(location.search.substring(1));
                lang.mixin(config.app, queryParams);

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

                this.setupMapViews();

                //Subscribe to messages passed by the MapToolbar
                topic.subscribe('/ecs_catalog/selectRegion', lang.hitch(this, function(region) {
                    this.selectRegion(region);
                }));
                topic.subscribe('/ecs_catalog/selectPhase', lang.hitch(this, function(phase) {
                    this.selectPhase(phase);
                }));
                topic.subscribe('/ecs_catalog/selectScenario', lang.hitch(this, function(scenario) {
                    this.selectScenario(scenario);
                }));
                topic.subscribe('/ecs_catalog/regionsPopulated', lang.hitch(this, function() {
                    //Get the optional region parameter from the URL. Set the regionSelect widget accordingly.
                    if (queryParams.region !== undefined) {
                        var region = parseInt(queryParams.region);
                        if (!isNaN(region)) {
                            this.filterPanel.setRegion(region);
                        }
                    }   
                }));

                topic.subscribe('/ngdc/sublayerByName/visibility', lang.hitch(this, function(phase) {
                    if (this.legend) {
                        this.legend.refresh();
                    }
                }));
                topic.subscribe('/ngdc/sublayer/visibility', lang.hitch(this, function(phase) {
                    if (this.legend) {
                        this.legend.refresh();
                    }
                }));
                topic.subscribe('/ngdc/layer/visibility', lang.hitch(this, function(phase) {
                    if (this.legend) {
                        this.legend.refresh();
                    }
                }));

                this.allLayerDefs = [];

                //Select default phase and scenario on startup
                this.selectPhase('ONE');
                this.selectScenario(0);
            },

            setupBanner: function() {
                var banner = new Banner({
                    breadcrumbs: [
                        {url: 'http://www.noaa.gov', label: 'NOAA'},
                        {url: 'http://www.nesdis.noaa.gov', label: 'NESDIS'},
                        {url: 'http://www.ngdc.noaa.gov', label: 'NGDC'},
                        {url: 'http://maps.ngdc.noaa.gov/viewers', label: 'Maps'},
                        {url: window.location.protocol + '//' + window.location.host + '/ecs-catalog/', label: 'ECS Catalog'}
                    ],
                    dataUrl: window.location.protocol + '//' + window.location.host + '/ecs-catalog/',
                    image: 'images/ecs-logo.gif'
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
                } else { //arctic
                    this.mercatorMapConfig.setEnabled(false);
                    this.arcticMapConfig.setEnabled(true);
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

                aspect.after(this.mercatorMapConfig, 'mapReady', lang.hitch(this, function() {
                    this.legend = new Legend({
                        map: this.mercatorMapConfig.map,
                        layerInfos: [
                            {layer: this.mercatorMapConfig.mapLayerCollection.getLayerById('ECS Catalog'), title: "ECS Catalog"}
                        ]
                    }, 'dynamicLegend');
                    this.legend.startup();
                }));
            },

            setupArcticView: function() {
                logger.debug('setting up Arctic view...');
                
                var initialExtent = new Extent({
                    xmin: 270000,
                    ymin: -800000,
                    xmax: 3300000,
                    ymax: 1700000,
                    spatialReference: new SpatialReference({wkid: 5936})
                });   

                var zoomLevels = new ArcticZoomLevels();            

                this.arcticMapConfig = new ArcticMapConfig('arctic', {
                    extent: initialExtent,
                    //zoom: 3,
                    logo: false,
                    showAttribution: false,
                    overview: false,
                    sliderStyle: 'large',
                    navigationMode: 'classic'//, //disable CSS transforms to eliminate annoying flickering in Chrome
                    //lods: zoomLevels.lods
                }, new ArcticLayerCollection());

                new CoordinatesToolbar({map: this.arcticMapConfig.map}, 'arcticCoordinatesToolbar');
            },

            /*
             * Select a region by id.
             * Zooms to the region extent and filters the scenarioSelect FilteringSelect widget. 
             * Scenarios are filtered by selected region and its children.
             */
            selectRegion: function(region) {
                console.log('Inside selectRegion: ' + region);
                var regionName;
                var extent;
                var regions = [];
                var regionStore = this.filterPanel.regionStore;
                var scenarioStore = this.filterPanel.scenarioStore;

                var result = regionStore.query({objectid: region});
                if ( result.length > 0 ) {
                    regionName = result[0].name;

                    var minx = result[0].minx;
                    var miny = result[0].miny;
                    var maxx = result[0].maxx;
                    var maxy = result[0].maxy;

                    extent = webMercatorUtils.geographicToWebMercator(new Extent(minx, miny, maxx, maxy, new SpatialReference({ wkid: 4326 })));
                }

                if ( regionName === 'Global' ) {
                    //Zoom to a Pacific-centered global view
                    extent = webMercatorUtils.geographicToWebMercator(new Extent(30, -70, 390, 70, new SpatialReference({ wkid: 4326 })));
                    registry.byId('mapContainer').selectChild('mercator');
                } else if ( regionName === 'Arctic' ) { //Arctic region selected, open the Arctic viewer in a new window
                    registry.byId('mapContainer').selectChild('arctic');
                    return;
                } else {
                    registry.byId('mapContainer').selectChild('mercator');
                }

                this.mercatorMapConfig.map.setExtent(extent, true);

                this.applyRegionFilter(region);
            },

            getRegionAndPhaseLayerDef: function() {
                if (this.regionLayerDef && this.phaseLayerDef) {
                    return this.regionLayerDef + ' AND ' + this.phaseLayerDef;
                }
                else {
                    return this.phaseLayerDef;
                }
            },

            applyRegionFilter: function(region) {                
                var regionStore = this.filterPanel.regionStore;
                var mercatorService = this.mercatorMapConfig.mapLayerCollection.getLayerById('ECS Catalog');
                var arcticService = this.arcticMapConfig.mapLayerCollection.getLayerById('ECS Catalog');
                var regionIds = [region];

                //Get the 'Global' region id
                var globalRegionId = regionStore.query({name: 'Global'})[0].objectid;

                //Get the current region's parent
                var regionItems = regionStore.query({objectid: region})
                if (regionItems && regionItems.length > 0) {
                    regionIds.push(regionItems[0].parent_id);
                }

                //Add the 'Global' region id if it's not already there
                if (array.indexOf(regionIds, globalRegionId) == -1) {
                    regionIds.push(globalRegionId);
                }

                if (region === globalRegionId) {
                    this.regionLayerDef = null; //Don't apply any filter if region is 'Global'
                }
                else {
                    this.regionLayerDef = 'REGION_ID IN (' + regionIds.join(',') + ')';
                }

                //Apply the filter to the Boundaries, Data Product, and Source Data layers
                array.forEach(this.boundaryLayerIds, lang.hitch(this, function(layerId) {
                    this.allLayerDefs[layerId] = this.getRegionAndPhaseLayerDef();
                }));
                array.forEach(this.dataProductLayerIds, lang.hitch(this, function(layerId) {
                    this.allLayerDefs[layerId] = this.getRegionAndPhaseLayerDef();
                }));
                array.forEach(this.sourceDataLayerIds, lang.hitch(this, function(layerId) {
                    this.allLayerDefs[layerId] = this.regionLayerDef;
                }));

                mercatorService.setLayerDefinitions(this.allLayerDefs);
                arcticService.setLayerDefinitions(this.allLayerDefs);
            },

            selectPhase: function(phase) {
                var mercatorService = this.mercatorMapConfig.mapLayerCollection.getLayerById('ECS Catalog');
                var arcticService = this.arcticMapConfig.mapLayerCollection.getLayerById('ECS Catalog');

                this.phaseLayerDef = "PHASE='" + phase + "'";

                //Apply the filter to the Boundaries and Data Product layers
                array.forEach(this.boundaryLayerIds, lang.hitch(this, function(layerId) {
                    this.allLayerDefs[layerId] = this.getRegionAndPhaseLayerDef();
                }));
                array.forEach(this.dataProductLayerIds, lang.hitch(this, function(layerId) {
                    this.allLayerDefs[layerId] = this.getRegionAndPhaseLayerDef();
                }));

                mercatorService.setLayerDefinitions(this.allLayerDefs);
                arcticService.setLayerDefinitions(this.allLayerDefs);
            },

            /*
             * Select a BOS Scenario by id. If scenario == 0, that means "no scenario selected" and will display no features.
             * Applies a filter to the "scenario products" from the map service (currently layers 1,2,3,4,6,7,9,10,11,13,14,15,16,17,18)
             */
            selectScenario: function(scenario) {
                console.log('Inside selectScenario ' + scenario);

                //var allLayerDefs = [];
                var mercatorService = this.mercatorMapConfig.mapLayerCollection.getLayerById('ECS Catalog');
                var arcticService = this.arcticMapConfig.mapLayerCollection.getLayerById('ECS Catalog');

                //Apply the filter to the Scenario Product layers
                array.forEach(this.scenarioProductLayerIds, lang.hitch(this, function(layerId) {
                    this.allLayerDefs[layerId] = 'BOSS_ID=' + scenario;
                }));

                mercatorService.setLayerDefinitions(this.allLayerDefs);
                arcticService.setLayerDefinitions(this.allLayerDefs);
            },
        });
    }
);
