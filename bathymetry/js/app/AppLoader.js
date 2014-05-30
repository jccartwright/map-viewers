define([
    "dojo/_base/declare",
    "dijit/registry",
    "dojo/dom",
    "dojo/_base/config",
    "dojo/io-query",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/on",
    "dojo/aspect",
    "dijit/form/CheckBox",
    "esri/config",
    "esri/geometry/Extent",
    "esri/SpatialReference",
    "ngdc/Logger",
    "app/web_mercator/MapConfig",
    "app/arctic/MapConfig",
    "app/antarctic/MapConfig",
    "ngdc/web_mercator/ZoomLevels",
    "ngdc/arctic/ZoomLevels",
    "ngdc/antarctic/ZoomLevels",
    "ngdc/Banner",
    "app/web_mercator/LayerCollection",
    "app/arctic/LayerCollection",
    "app/antarctic/LayerCollection",
    "app/web_mercator/MapToolbar",
    "app/arctic/MapToolbar",
    "app/antarctic/MapToolbar",
    "app/web_mercator/Identify",
    "app/AppIdentifyPane",
    "app/LayersPanel",
    "dojo/domReady!"],
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
        ArcticMapConfig,
        AntarcticMapConfig,
        MercatorZoomLevels,
        ArcticZoomLevels,
        AntarcticZoomLevels,
        Banner,
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
                    "http://maps.ngdc.noaa.gov/arcgis/rest/services",
                    "http://mapdevel.ngdc.noaa.gov/arcgis/rest/services"];

                //add queryParams into config object, values in queryParams take precedence
                var queryParams = ioQuery.queryToObject(location.search.substring(1));
                lang.mixin(config.app, queryParams);

                //put the logger into global so all modules have access
                window.logger = new Logger(config.app.loglevel);

                this.setupBanner();

                this.setupMapViews();
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
                    dataUrl: "http://www.ngdc.noaa.gov/mgg/bathymetry/relief.html",
                    image: "images/bathymetry_viewer_logo.png"
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
                }));
            },

            enableIdentify: function(/*String*/ mapId) {
                if (mapId == 'mercator') {
                    this.mercatorMapConfig.identify.enabled = true;
                    this.mercatorMapConfig.identifyPane.enable();                    
                    this.arcticMapConfig.identify.enabled = false;
                    this.arcticMapConfig.identifyPane.disable();
                    this.antarcticMapConfig.identify.enabled = false;
                    this.antarcticMapConfig.identifyPane.disable();
                } else if (mapId == 'arctic') {
                    this.mercatorMapConfig.identify.enabled = false;
                    this.mercatorMapConfig.identifyPane.disable();
                    this.arcticMapConfig.identify.enabled = true;
                    this.arcticMapConfig.identifyPane.enable();
                    this.antarcticMapConfig.identify.enabled = false;
                    this.antarcticMapConfig.identifyPane.disable();
                } else { //antarctic
                    this.mercatorMapConfig.identify.enabled = false;
                    this.mercatorMapConfig.identifyPane.disable();
                    this.arcticMapConfig.identify.enabled = false;
                    this.arcticMapConfig.identifyPane.disable();
                    this.antarcticMapConfig.identify.enabled = true;
                    this.antarcticMapConfig.identifyPane.enable();
                }   
            },

            setupMercatorView: function() {
                logger.debug('setting up Mercator view...');

                var zoomLevels = new MercatorZoomLevels();

                this.mercatorMapConfig = new MercatorMapConfig("mercator", {
                    center:[-45,45],
                    zoom: 3,
                    logo: false,
                    showAttribution: false,
                    overview: true,
                    sliderStyle: 'large',
                    navigationMode: 'classic', //disable CSS transforms to eliminate annoying flickering in Chrome
                    lods: zoomLevels.lods
                }, new MercatorLayerCollection());  

                //var coordinatesToolbar = new CoordinatesToolbar({map: mapConfig.map}, "mercatorCoordinatesToolbar");

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

                this.arcticMapConfig = new ArcticMapConfig("arctic", {
                    extent: initialExtent,
                    //zoom: 3,
                    logo: false,
                    showAttribution: false,
                    overview: false,
                    sliderStyle: 'large',
                    navigationMode: 'classic', //disable CSS transforms to eliminate annoying flickering in Chrome
                    lods: zoomLevels.lods
                }, new ArcticLayerCollection());
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
            
                this.antarcticMapConfig = new AntarcticMapConfig("antarctic", {
                    extent: initialExtent,
                    //zoom: 3,
                    logo: false,
                    showAttribution: false,
                    overview: false,
                    sliderStyle: 'large',
                    navigationMode: 'classic', //disable CSS transforms to eliminate annoying flickering in Chrome
                    lods: zoomLevels.lods
                }, new AntarcticLayerCollection());
            }
        })
    }
);
