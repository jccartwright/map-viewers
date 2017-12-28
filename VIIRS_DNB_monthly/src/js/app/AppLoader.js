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
    'ngdc/web_mercator/ZoomLevels',
    'ngdc/Banner',
    'ngdc/CoordinatesToolbar',
    'app/web_mercator/LayerCollection',
    'app/web_mercator/MapToolbar',
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
        MercatorZoomLevels,
        Banner,
        CoordinatesToolbar,
        MercatorLayerCollection,
        MapToolbar) {

        return declare(null, {
            mercatorMapConfig: null,

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

                var layer0 = this.mercatorMapConfig.mapLayerCollection.getLayerById('Monthly_AvgRadiance');
                var layer1 = this.mercatorMapConfig.mapLayerCollection.getLayerById('Monthly_CloudFreeCoverage');
                var layer2 = this.mercatorMapConfig.mapLayerCollection.getLayerById('Monthly_AvgRadiance_StrayLightImpacted');
                var layer3 = this.mercatorMapConfig.mapLayerCollection.getLayerById('Monthly_CloudFreeCoverage_StrayLightImpacted');

                topic.subscribe('toggleLayer', function(idx) {
                    if (idx === 0) {
                        layer0.show();
                        layer1.hide();
                        layer2.hide();
                        layer3.hide();
                    } else if (idx === 1) {
                        layer0.hide();
                        layer1.show();
                        layer2.hide();
                        layer3.hide();
                    } else if (idx === 2) {
                        layer0.hide();
                        layer1.hide();
                        layer2.show();
                        layer3.hide();
                    } else {
                        layer0.hide();
                        layer1.hide();
                        layer2.hide();
                        layer3.show();
                    }
                });

                topic.subscribe('opacity', function(opacity) {
                    layer0.setOpacity(opacity);
                    layer1.setOpacity(opacity);
                    layer2.setOpacity(opacity);
                    layer3.setOpacity(opacity);
                });

                topic.subscribe('stretch', function(value) {
                    var renderingRule = layer0.renderingRule;
                    renderingRule.functionArguments.NumberOfStandardDeviations = value;

                    layer0.setRenderingRule(renderingRule);
                    layer1.setRenderingRule(renderingRule);
                    layer2.setRenderingRule(renderingRule);
                    layer3.setRenderingRule(renderingRule);
                });
            },

            setupBanner: function() {
                var banner = new Banner({
                    breadcrumbs: [
                        {url: 'https://www.noaa.gov', label: 'NOAA', title: 'Go to the National Oceanic and Atmospheric Administration home'},
                        {url: 'https://www.nesdis.noaa.gov', label: 'NESDIS', title: 'Go to the National Environmental Satellite, Data, and Information Service home'},
                        {url: 'https://www.ngdc.noaa.gov', label: 'NCEI (formerly NGDC)', title: 'Go to the National Centers for Environmental Information (formerly the National Geophysical Data Center) home'},
                        {url: 'https//maps.ngdc.noaa.gov', label: 'Maps', title: 'Go to NCEI maps home'},
                        {url: 'https://ngdc.noaa.gov/eog/viirs/index.html',  label: 'VIIRS', title: 'Go to NCEI VIIRS home'}
                    ],
                    dataUrl: 'https://ngdc.noaa.gov/eog/viirs/download_dnb_composites.html',
                    image: 'images/viirs_dnb_monthly_viewer_logo.png',
                    imageAlt: 'NCEI VIIRS DNB Monthly Composites Viewer - go to data home'
                });
                banner.placeAt('banner');
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
                    center = [0, 0]; //centered over eastern Pacific
                    zoom = 1; //relative zoom level; equivalent to absolute zoom level 3
                }

                this.mercatorMapConfig = new MercatorMapConfig('mercator', {
                    center: center,
                    zoom: zoom,
                    initialExtent: this.initialExtent,
                    logo: false,
                    showAttribution: false,
                    overview: true,
                    sliderStyle: 'large',
                    navigationMode: 'classic', //disable CSS transforms to eliminate annoying flickering in Chrome
                    lods: zoomLevels.lods                    
                }, new MercatorLayerCollection());

                var coordinatesToolbar = new CoordinatesToolbar({map: this.mercatorMapConfig.map}, 'mercatorCoordinatesToolbar');
            }
        });
    }
);
