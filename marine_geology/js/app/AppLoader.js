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
    'esri/dijit/Legend',
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
        Legend,
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
            },

            setupBanner: function() {
                var banner = new Banner({
                    breadcrumbs: [
                        {url: 'http://www.noaa.gov', label: 'NOAA'},
                        {url: 'http://www.nesdis.noaa.gov', label: 'NESDIS'},
                        {url: 'http://www.ngdc.noaa.gov', label: 'NGDC'},
                        {url: 'http://maps.ngdc.noaa.gov', label: 'Maps'},
                        {url: 'http://www.ngdc.noaa.gov/mgg/geology/geology.html', label: 'Marine Geology'}
                    ],
                    dataUrl: 'http://www.ngdc.noaa.gov/mgg/geology/geology.html',
                    image: 'images/MarineGeologyRight.gif'
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
                    sampleIndexVisible: this.sampleIndexVisible,
                    datasetsReportsVisible: this.datasetsReportsVisible,
                    nosSeabedVisible: this.nosSeabedVisible
                }));  

                aspect.after(this.mercatorMapConfig, 'mapReady', lang.hitch(this, function() {
                    var legend = new Legend({
                        map: this.mercatorMapConfig.map,
                        layerInfos: [
                            {layer: this.mercatorMapConfig.mapLayerCollection.getLayerById('Datasets/Reports')._tiledService, title: "Datasets/Reports"},
                            {layer: this.mercatorMapConfig.mapLayerCollection.getLayerById('Datasets/Reports')._dynamicService, title: "Datasets/Reports"},
                            {layer: this.mercatorMapConfig.mapLayerCollection.getLayerById('Sample Index')._tiledService, title: "Sample Index"},
                            {layer: this.mercatorMapConfig.mapLayerCollection.getLayerById('Sample Index')._dynamicService, title: "Sample Index"}
                        ]
                    }, 'dynamicLegend');
                    legend.startup();
                }));

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

            //Sets layers visible on startup using the 'layers' url parameter, which can contain a comma-spearated list with 'multibeam', 'trackline', 'nos_hydro', 'dem'
            setStartupLayers: function(/*String[]*/ startupLayers) {                
                for (var i = 0; i < startupLayers.length; i++) {
                    if (startupLayers[i].toLowerCase() === 'datasets_reports') {
                        this.layersPanel.chkDatasetsReports.set('checked', true);
                        this.datasetsReportsVisible = true;
                    } 
                    else if (startupLayers[i].toLowerCase() === 'sample_index') {
                        this.layersPanel.chkSampleIndex.set('checked', true);
                        this.sampleIndexVisible = true;
                    } 
                    else if (startupLayers[i].toLowerCase() === 'nosSeabed') {
                        this.layersPanel.chkNosSeabed.set('checked', true);
                        this.nosSeabedVisible = true;
                    } 
                }
            }
        });
    }
);