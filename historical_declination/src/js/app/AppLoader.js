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
    'esri/tasks/GeometryService',
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
    'app/TimeSlider',
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
        GeometryService,
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
        TimeSlider) {

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

                var layersPanel = registry.byId('layersPanel');
                if (config.app.historicalPoles && config.app.historicalPoles == 'true') {
                    layersPanel.chkPolesTrack.set('checked', true);
                }
                if (config.app.observedPoles && config.app.observedPoles == 'true') {
                    layersPanel.chkObservedPoles.set('checked', true);
                }

                //put the logger into global so all modules have access
                window.logger = new Logger(config.app.loglevel);

                this.setupBanner();

                this.setupMapViews();

                topic.subscribe('/declination/year', lang.hitch(this, function(year, mapName) {
                    this.year = year;
                    if (mapName == 'mercator') {
                        this.mercatorMapConfig.setYear(year); 
                    } else if (mapName == 'arctic') {
                        this.arcticMapConfig.setYear(year);
                    } else if (mapName == 'antarctic') {
                        this.antarcticMapConfig.setYear(year);
                    }
                }));

                topic.subscribe('/isogonicLines/visibility', lang.hitch(this, function(visible) {
                    this.setIsogonicLinesVisibile(visible);
                }));
                topic.subscribe('/poles/visibility', lang.hitch(this, function(visible) {
                    this.setPolesVisibile(visible);
                }));
                topic.subscribe('/polesTrack/visibility', lang.hitch(this, function(visible) {
                    this.setPolesTrackVisible(visible);
                }));
                topic.subscribe('/observedPoles/visibility', lang.hitch(this, function(visible) {
                    this.setObservedPolesVisible(visible);
                }));
            },

            setupBanner: function() {
                var banner = new Banner({
                    breadcrumbs: [
                        {url: 'https://www.noaa.gov', label: 'NOAA', title: 'Go to the National Oceanic and Atmospheric Administration home'},
                        {url: 'https://www.nesdis.noaa.gov', label: 'NESDIS', title: 'Go to the National Environmental Satellite, Data, and Information Service home'},
                        {url: 'https://www.ncei.noaa.gov/', label: 'NCEI', title: 'Go to the National Centers for Environmental Information home'},
                        {url: 'https://www.ncei.noaa.gov/maps-and-geospatial-products', label: 'Maps', title: 'Go to NCEI maps home'},
                        {url: 'https://www.ngdc.noaa.gov/geomag/geomag.shtml',  label: 'Geomagnetism', title: 'Go to NCEI Geomagnetism home'}
                    ],
                    dataUrl: 'https://www.ngdc.noaa.gov/geomag/geomag.shtml',
                    image: 'images/historical_declination_viewer_logo.png',
                    imageAlt: 'NCEI Historical Magnetic Declination Viewer - go to Geomagnetism home'
                });
                banner.placeAt('banner');
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

                    //When switching to a map tab, set the year on the featureLayers for that map.
                    if (mapId == 'mercator') {
                        this.mercatorMapConfig.setYear(this.year);
                    } else if (mapId == 'arctic') {
                        this.arcticMapConfig.setYear(this.year);
                    } else if (mapId == 'antarctic') {
                        this.antarcticMapConfig.setYear(this.year);
                    }
                }));

            },

            setupMercatorView: function() {
                logger.debug('setting up Mercator view...');

                var zoomLevels = new MercatorZoomLevels();

                var center;
                var zoom;
                if (!this.initialExtent) {
                    center = [0, 0]; 
                    zoom = 0; //relative zoom level; equivalent to absolute zoom level 2
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

                this.mercatorMapConfig.timeSlider = registry.byId('mercatorTimeSlider');
                this.mercatorMapConfig.timeSlider.mapName = 'mercator';

                var coordinatesToolbar = new CoordinatesToolbar({map: this.mercatorMapConfig.map}, 'mercatorCoordinatesToolbar');

                //Hide the scalebar on startup and at small scales <= 4
                coordinatesToolbar.hideScalebar();
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
                    lods: zoomLevels.lods
                }, new ArcticLayerCollection());

                this.arcticMapConfig.timeSlider = registry.byId('arcticTimeSlider');
                this.arcticMapConfig.timeSlider.mapName = 'arctic';

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
                    lods: zoomLevels.lods
                }, new AntarcticLayerCollection());

                this.antarcticMapConfig.timeSlider = registry.byId('antarcticTimeSlider');
                this.antarcticMapConfig.timeSlider.mapName = 'antarctic';

                new CoordinatesToolbar({map: this.antarcticMapConfig.map}, 'antarcticCoordinatesToolbar');
            },

            setIsogonicLinesVisibile: function(visible) {
                this.mercatorMapConfig.setIsogonicLinesVisibile(visible);
                this.arcticMapConfig.setIsogonicLinesVisibile(visible);
                this.antarcticMapConfig.setIsogonicLinesVisibile(visible);
            },

            setPolesVisibile: function(visible) {
                this.mercatorMapConfig.setPolesVisibile(visible);
                this.arcticMapConfig.setPolesVisibile(visible);
                this.antarcticMapConfig.setPolesVisibile(visible);
            },

            setPolesTrackVisible: function(visible) {
                this.mercatorMapConfig.setPolesTrackVisible(visible);
                this.arcticMapConfig.setPolesTrackVisible(visible);
                this.antarcticMapConfig.setPolesTrackVisible(visible);
            },

            setObservedPolesVisible: function(visible) {
                this.mercatorMapConfig.setObservedPolesVisible(visible);
                this.arcticMapConfig.setObservedPolesVisible(visible);
                this.antarcticMapConfig.setObservedPolesVisible(visible);
            }
        });
    }
);
