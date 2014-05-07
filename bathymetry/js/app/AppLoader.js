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
    "esri/config",
    "esri/geometry/Extent",
    "esri/SpatialReference",
    "ngdc/Logger",
    "ngdc/web_mercator/MapConfig",
    "ngdc/arctic/MapConfig",
    "ngdc/antarctic/MapConfig",
    "ngdc/Banner",
    "app/web_mercator/LayerCollection",
    "app/arctic/LayerCollection",
    "app/antarctic/LayerCollection",
    "app/web_mercator/BasemapToolbar",
    "app/arctic/BasemapToolbar",
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
        esriConfig,
        Extent,
        SpatialReference,
        Logger,
        MercatorMapConfig,
        ArcticMapConfig,
        AntarcticMapConfig,
        Banner,
        MercatorLayerCollection,
        ArcticLayerCollection,
        AntarcticLayerCollection,
        BasemapToolbar,
        ArcticBasemapToolbar
        ){
        return declare(null, {
            constructor:function(args){
                declare.safeMixin(this,args);
                this.overlayNode = dom.byId(this.overlayNodeId);
            },

            init: function() {
                esriConfig.defaults.io.corsEnabledServers = [
                    "http://maps.ngdc.noaa.gov/arcgis/rest/services",
                    "http://agsdevel.ngdc.noaa.gov/arcgis/rest/services"];

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
            },

            setupMercatorView: function() {
                logger.debug('setting up Mercator view...');
                var mapConfig = new MercatorMapConfig("mercator", {
                    center:[-45,45],
                    zoom: 3,
                    logo: false,
                    showAttribution: false,
                    overview: true,
                    sliderStyle: 'large'
                }, new MercatorLayerCollection());

                //var mapToolbar = new MapToolbar({map: mapConfig.map}, "mercatorMapToolbar");

                var basemapToolbar = new BasemapToolbar({layerCollection: mapConfig.mapLayerCollection}, "mercatorBasemapToolbar");
                basemapToolbar.startup();

                //var coordinatesToolbar = new CoordinatesToolbar({map: mapConfig.map}, "mercatorCoordinatesToolbar");

            },

            setupArcticView: function() {
                logger.debug('setting up Arctic view...');
                /*
                var initialExtent = new Extent({
                    xmin:-30000000,
                    ymin:-30000000,
                    xmax:30000000,
                    ymax:30000000,
                    spatialReference: new SpatialReference({wkid:3995})
                });
                */

                var mapConfig = new ArcticMapConfig("arctic", {
                    //extent: initialExtent,
                    //center:[0, 89],
                    zoom: 2,
                    logo: false,
                    showAttribution: false,
                    overview: false,
                    sliderStyle: 'large'
                }, new ArcticLayerCollection());

                var basemapToolbar = new ArcticBasemapToolbar({layerCollection: mapConfig.mapLayerCollection}, "arcticBasemapToolbar");
                basemapToolbar.startup();
            },

            setupAntarcticView: function() {
                logger.debug('setting up Antarctic view...');
                /*
                var initialExtent = new Extent({
                    xmin:-30000000,
                    ymin:-30000000,
                    xmax:30000000,
                    ymax:30000000,
                    spatialReference: new SpatialReference({wkid:3031})
                });
                */

                var mapConfig = new AntarcticMapConfig("antarctic", {
                    zoom: 3,
                    logo: false,
                    showAttribution: false,
                    overview: false,
                    sliderStyle: 'large'
                }, new AntarcticLayerCollection());

                //var basemapToolbar = new AntarcticBasemapToolbar({layerCollection: mapConfig.mapLayerCollection}, "antarcticBasemapToolbar");
                //basemapToolbar.startup();
            }
        })
    }
);
