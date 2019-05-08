/* eslint-disable quotes */
define([
    'dojo/_base/declare',
    'dijit/registry',
    'dojo/dom',
    'dojo/_base/array',
    'dojo/_base/config',
    'dojo/io-query',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/aspect',
    'dijit/form/CheckBox',
    'esri/config',
    'esri/geometry/Extent',
    'esri/SpatialReference',
    'esri/tasks/GeometryService',
    'esri/dijit/Legend',
    'ngdc/Logger',
    'app/web_mercator/MapConfig',
    'ngdc/web_mercator/ZoomLevels',
    //'ngdc/Banner',
    'app/Header',
    'app/Footer',
    'ngdc/CoordinatesWithElevationToolbar',
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
        array,
        config,
        ioQuery,
        lang,
        topic,
        aspect,
        CheckBox,
        esriConfig,
        Extent,
        SpatialReference,
        GeometryService,
        Legend,
        Logger,
        MapConfig,
        MercatorZoomLevels,
        //Banner,
        Header,
        Footer,
        CoordinatesWithElevationToolbar,
        LayerCollection,
        MapToolbar,
        Identify,
        IdentifyPane,
        LayersPanel
        ) {

        return declare(null, {
            mapConfig: null,

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

                this.setupHeader();
                this.setupFooter();

                this.setupLayersPanel();

                //this.setStartupLayers(startupLayers);

                this.setupMapViews();
            },

            setupHeader: function() {
                this.header = new Header({
                    title: 'Gulf of Mexico Hypoxia Watch',
                    titleUrl: 'https://www.ncddc.noaa.gov/hypoxia/',
                    imageSrc: 'images/hypoxia_banner_sm.jpg',
                    imageUrl: 'https://www.ncddc.noaa.gov/hypoxia/',
                    imageAlt: 'Gulf of Mexico Hypoxia Watch',
                    imageUrlTitle: 'Gulf of Mexico Hypoxia Watch'
                });
                this.header.placeAt('banner');
            },

            setupFooter: function() {
                this.footer = new Footer();
                this.footer.placeAt('footer');
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
                    center = [-91, 28.5]; //centered over Gulf
                    zoom = 5; //relative zoom level; equivalent to absolute zoom level 7
                }

                this.mapConfig = new MapConfig('mercator', {
                    center: center,
                    zoom: zoom,
                    initialExtent: this.initialExtent,
                    logo: false,
                    showAttribution: false,
                    overview: true,
                    sliderStyle: 'large',
                    navigationMode: 'classic', //disable CSS transforms to eliminate annoying flickering in Chrome
                    lods: zoomLevels.lods
                }, new LayerCollection());

                new CoordinatesWithElevationToolbar({map: this.mapConfig.map, scalebarThreshold: 4}, 'coordinatesToolbar');

                aspect.after(this.mapConfig, 'mapReady', lang.hitch(this, function() {
                    this.layersPanel.hypoxiaLayer = this.mapConfig.mapLayerCollection.getLayerById('Hypoxia');
                }));
            }
        });
    }
);
