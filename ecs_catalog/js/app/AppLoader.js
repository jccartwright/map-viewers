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

            constructor: function(args){
                declare.safeMixin(this,args);
                this.overlayNode = dom.byId(this.overlayNodeId);
            },

            init: function() {
                esriConfig.defaults.io.corsEnabledServers = [
                    'http://maps.ngdc.noaa.gov/arcgis/rest/services',
                    'http://mapdevel.ngdc.noaa.gov/arcgis/rest/services',
                    'http://sparrow.ngdc.noaa.gov'
                ];


                //Use the proxy for only the 'ecs_catalog' map service.
                urlUtils.addProxyRule({
                     urlPrefix: 'http://maps.ngdc.noaa.gov/arcgis/rest/services/intranet/ecs_catalog',
                     proxyUrl: window.location.protocol + '//' + window.location.host + "/ecs-catalog/rest/map/proxy"
                });

                urlUtils.addProxyRule({
                     urlPrefix: 'http://mapdevel.ngdc.noaa.gov/arcgis/rest/services/intranet/ecs_catalog_mist',
                     proxyUrl: window.location.protocol + '//' + window.location.host + "/ecs-catalog/rest/map/proxy"
                });

                //add queryParams into config object, values in queryParams take precedence
                var queryParams = ioQuery.queryToObject(location.search.substring(1));
                lang.mixin(config.app, queryParams);

                //Get the optional region parameter from the URL. Set the regionSelect widget accordingly.
                if (queryParams.region !== undefined) {
                    var region = parseInt(queryParams.region);
                    if (!isNaN(region)) {
                        //dijit.byId('regionSelect').set('value', String(region)); //onChange calls selectRegion()
                    }
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

                //Subscribe to messages passed by the MapToolbar
                topic.subscribe('/ecs_catalog/selectRegion', lang.hitch(this, function(region) {
                    this.selectRegion(region);
                }));
                topic.subscribe('/ecs_catalog/selectScenario', lang.hitch(this, function(scenario) {
                    this.selectScenario(scenario);
                }));

                this.allLayerDefs = [];
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
            },

            setupArcticView: function() {
                logger.debug('setting up Arctic view...');
                
                var initialExtent = new Extent({
                    xmin: -4000000,
                    ymin: -4000000,
                    xmax: 4000000,
                    ymax: 4000000,
                    spatialReference: new SpatialReference({wkid: 3572})
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
                var regionStore = this.mercatorMapConfig.mapToolbar.regionStore;
                var scenarioStore = this.mercatorMapConfig.mapToolbar.scenarioStore;

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

            applyRegionFilter: function(region) {                
                var regionStore = this.mercatorMapConfig.mapToolbar.regionStore;
                var service = this.mercatorMapConfig.mapLayerCollection.getLayerById('ECS Catalog');
                var regionIds = [region];
                //var allLayerDefs = [];

                //Get the 'Global' region id
                var globalRegionId = regionStore.query({name: 'Global'})[0].objectid;

                //Don't apply any filter if region is 'Global'
                //if (region === globalRegionId) {
                //    return;
                //}

                //Get the current region's parent
                var regionItems = regionStore.query({objectid: region})
                if (regionItems && regionItems.length > 0) {
                    regionIds.push(regionItems[0].parent_id);
                }

                //Add the 'Global' region id if it's not already there
                if (array.indexOf(regionIds, globalRegionId) == -1) {
                    regionIds.push(globalRegionId);
                }

                var sourceDataAndDataProductsLayers = [
                    //1, 2, 3, 4, 6, 7, 9, 10, 11, 13, 14, 15, 17, 19, 20, //scenario products
                    22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, //source data
                    42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58 //data products
                ];

                for ( var i = 0; i < sourceDataAndDataProductsLayers.length; i++ ) {
                    if (region === globalRegionId) {
                        this.allLayerDefs[sourceDataAndDataProductsLayers[i]] = null;
                    }
                    else {
                        this.allLayerDefs[sourceDataAndDataProductsLayers[i]] = 'REGION_ID IN (' + regionIds.join(',') + ')';
                    }
                }
                service.setLayerDefinitions(this.allLayerDefs);
            },

            /*
             * Select a BOS Scenario by id. If scenario == 0, that means "no scenario selected" and will display no features.
             * Applies a filter to the "scenario products" from the map service (currently layers 1,2,3,4,6,7,9,10,11,13,14,15,16,17,18)
             */
            selectScenario: function(scenario) {
                console.log('Inside selectScenario ' + scenario);

                //var allLayerDefs = [];
                var service = this.mercatorMapConfig.mapLayerCollection.getLayerById('ECS Catalog');


                var scenarioProductLayers = [1, 2, 3, 4, 6, 7, 9, 10, 11, 13, 14, 15, 16, 17, 18];

                for (var i = 0; i < scenarioProductLayers.length; i++) {
                    this.allLayerDefs[scenarioProductLayers[i]] = 'BOSS_ID=' + scenario;
                }
                service.setLayerDefinitions(this.allLayerDefs);
            },
        });
    }
);
