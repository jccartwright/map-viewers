define([
    'dojo/_base/declare',
    'dijit/registry',
    'dojo/dom',
    'dojo/_base/array',
    'dojo/_base/config',
    'dojo/io-query',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/on',
    'dojo/aspect',
    'dojo/request/xhr',
    'dojo/promise/all',
    'dijit/form/CheckBox',
    'esri/config',
    'esri/geometry/Extent',
    'esri/geometry/geometryEngine',
    'esri/SpatialReference',
    'esri/tasks/GeometryService',
    'esri/tasks/ProjectParameters',
    'esri/dijit/Legend',
    'ngdc/Logger',
    'app/arctic/MapConfig',
    'ngdc/arctic/ZoomLevels',
    'ngdc/Banner',
    'ngdc/CoordinatesWithElevationToolbar',
    'app/arctic/LayerCollection',
    'app/arctic/MapToolbar',
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
        on,
        aspect,
        xhr,
        all,
        CheckBox,
        esriConfig,
        Extent,
        geometryEngine,
        SpatialReference,
        GeometryService,
        ProjectParameters,
        Legend,
        Logger,
        ArcticMapConfig,
        ArcticZoomLevels,
        Banner,
        CoordinatesWithElevationToolbar,
        ArcticLayerCollection,
        ArcticMapToolbar,
        LayersPanel) {

        return declare(null, {
            arcticMapConfig: null,

            constructor: function(args){
                declare.safeMixin(this,args);
                this.overlayNode = dom.byId(this.overlayNodeId);
            },

            init: function() {
                esriConfig.defaults.io.corsEnabledServers.push('maps.ngdc.noaa.gov');
                esriConfig.defaults.io.corsEnabledServers.push('gis.ngdc.noaa.gov');
                esriConfig.defaults.io.corsEnabledServers.push('gisdev.ngdc.noaa.gov');

                esriConfig.defaults.geometryService = new GeometryService('//maps.ngdc.noaa.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer');

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

                this.setupMapViews();
            },

            setupBanner: function() {

                this.banner = new Banner({
                    breadcrumbs: [
                        {url: '//www.noaa.gov', label: 'NOAA', title: 'Go to the National Oceanic and Atmospheric Administration home'},
                        {url: '//www.nesdis.noaa.gov', label: 'NESDIS', title: 'Go to the National Environmental Satellite, Data, and Information Service home'},
                        {url: '//www.ngdc.noaa.gov', label: 'NCEI (formerly NGDC)', title: 'Go to the National Centers for Environmental Information (formerly the National Geophysical Data Center) home'},
                        {url: '//maps.ngdc.noaa.gov', label: 'Maps', title: 'Go to NCEI maps home'}//,
                        //{url: '//www.ngdc.noaa.gov/mgg/bathymetry/relief.html', label: 'Bathymetry'}           
                    ],
                    //dataUrl: '//www.ngdc.noaa.gov/mgg/bathymetry/relief.html'//,
                    image: 'images/ncei_arctic_viewer_logo.png',
                    imageAlt: 'NCEI Arctic Data Viewer - go to data home'
                });
                this.banner.placeAt('banner');
            },

            setupLayersPanel: function() {
                this.layersPanel = new LayersPanel();
                this.layersPanel.placeAt('layersPanel');
            },

            setupMapViews: function() {
                logger.debug('setting up map views...');
                this.setupArcticView();

            },

            setupArcticView: function() {
                logger.debug('setting up Arctic view...');
                
                var initialExtent = new Extent({
                    xmin: -2000000,
                    ymin: -2000000,
                    xmax: 6000000,
                    ymax: 6000000,
                    spatialReference: new SpatialReference({wkid: 32661})
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

                aspect.after(this.arcticMapConfig, 'mapReady', lang.hitch(this, function() {
                    this.dscrtplegend = new Legend({
                        map: this.arcticMapConfig.map,
                        layerInfos: [                            
                            {title: 'DSCRTP', layer: this.getLayerById('DSCRTP')._tiledService}
                        ]
                    }, 'dynamicDSCRTPLegend');
                    this.dscrtplegend.startup();

                    this.bathyLegend = new Legend({
                        map: this.arcticMapConfig.map,
                        layerInfos: [                            
                            {title: 'Multibeam', layer: this.getLayerById('Multibeam')},
                            {title: 'Trackline Bathymetry', layer: this.getLayerById('Trackline Combined')},
                            {title: 'NOS Hydrographic Surveys', layer: this.getLayerById('NOS Hydrographic Surveys')}
                        ]
                    }, 'dynamicBathyLegend');
                    this.bathyLegend.startup();

                    this.tracklineLegend = new Legend({
                        map: this.arcticMapConfig.map,
                        layerInfos: [                            
                            {title: 'Trackline Geophysical Surveys', layer: this.getLayerById('Trackline Combined')}
                        ]
                    }, 'dynamicTracklineLegend');
                    this.tracklineLegend.startup();

                    this.marineGeologyLegend = new Legend({
                        map: this.arcticMapConfig.map,
                        layerInfos: [                            
                            {title: 'Index to Marine and Lacustrine Geological Samples', layer: this.getLayerById('Sample Index')},
                            {title: 'Marine Geology Inventory', layer: this.getLayerById('Marine Geology')}
                        ]
                    }, 'dynamicMarineGeologyLegend');
                    this.marineGeologyLegend.startup();

                    this.geomagLegend = new Legend({
                        map: this.arcticMapConfig.map,
                        layerInfos: [                            
                            {title: 'EMAG2', layer: this.getLayerById('EMAG2')}
                        ]
                    }, 'dynamicGeomagLegend');
                    this.geomagLegend.startup();

                    topic.subscribe('/ngdc/layer/visibility', lang.hitch(this, function() {
                        this.dscrtplegend.refresh();
                        this.bathyLegend.refresh();
                        this.tracklineLegend.refresh();
                        this.marineGeologyLegend.refresh();
                        this.geomagLegend.refresh();
                    }));
                    topic.subscribe('/ngdc/sublayer/visibility', lang.hitch(this, function() {
                        this.dscrtplegend.refresh();
                        this.bathyLegend.refresh();
                        this.tracklineLegend.refresh();
                        this.marineGeologyLegend.refresh();
                        this.geomagLegend.refresh();
                    }));
                }));

                new CoordinatesWithElevationToolbar({map: this.arcticMapConfig.map}, 'arcticCoordinatesToolbar');
            },

            getLayerById: function(id) {
                return this.arcticMapConfig.mapLayerCollection.getLayerById(id);
            }
        });
    }
);
