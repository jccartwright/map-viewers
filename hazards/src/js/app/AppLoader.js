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
    'dojo/_base/array',
    'dijit/form/CheckBox',
    'esri/config',
    'esri/geometry/Extent',
    'esri/geometry/Point',
    'esri/geometry/Multipoint',
    'esri/SpatialReference',
    'esri/tasks/QueryTask',
    'esri/tasks/query',
    'esri/tasks/GeometryService',
    'ngdc/Logger',
    'ngdc/web_mercator/MapConfig',
    'ngdc/web_mercator/ZoomLevels',
    'ngdc/Banner',
    'ngdc/CoordinatesWithElevationToolbar',
    'app/web_mercator/LayerCollection',
    'app/web_mercator/MapToolbar',
    'app/Identify',
    'app/HazIdentifyPane',
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
        array,
        CheckBox,
        esriConfig,
        Extent,
        Point,
        Multipoint,
        SpatialReference,
        QueryTask,
        Query,
        GeometryService,
        Logger,
        MercatorMapConfig,        
        MercatorZoomLevels,        
        Banner,
        CoordinatesWithElevationToolbar,
        MercatorLayerCollection,        
        MapToolbar,        
        Identify,
        HazIdentifyPane,
        LayersPanel) {

        return declare(null, {
            mapConfig: null,            

            constructor: function(args){
                declare.safeMixin(this,args);
                this.overlayNode = dom.byId(this.overlayNodeId);

                this.hazLayerDefinitions = [];
                this.tsEventLayerID1 = 0;
                this.tsEventLayerID2 = 1;
                this.tsObsLayerID1 = 2;
                this.tsObsLayerID2 = 3;
                this.tsObsLayerID3 = 4;
                this.signifEqLayerID = 5;
                this.volEventLayerID = 6;
                this.volLocLayerID = 7;
                this.currentDartStationsLayerID = 8;
                this.retrospectiveDartStationsLayerID = 9;
                this.tideGaugesLayerID = 10;
                this.plateBoundariesLayerID = 11;
            },

            init: function() {
                esriConfig.defaults.io.corsEnabledServers.push('maps.ngdc.noaa.gov');
                esriConfig.defaults.io.corsEnabledServers.push('gis.ngdc.noaa.gov');
                esriConfig.defaults.io.corsEnabledServers.push('gisdev.ngdc.noaa.gov');

                esriConfig.defaults.geometryService = new GeometryService('//maps.ngdc.noaa.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer');

                //add queryParams into config object, values in queryParams take precedence
                var queryParams = ioQuery.queryToObject(location.search.substring(1));
                lang.mixin(config.app, queryParams);
                
                //Extent can be overridden with URL parameters
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

                topic.subscribe('/ngdc/MapReady', lang.hitch(this, function() {
                    var filterValues = {startYear: 2012};
                    this.filterSurveys(filterValues);
                }));

                //Subscribe to messages passed by the search dialogs
                topic.subscribe("/hazards/TsEventSearch", lang.hitch(this, function(values) {
                    this.filterTsEvents(values);
                }));
                topic.subscribe("/hazards/ResetTsEventSearch", lang.hitch(this, function() {
                    this.resetTsEvents();
                }));
                topic.subscribe("/hazards/TsObsSearch", lang.hitch(this, function(values) {
                    this.filterTsObs(values);
                }));
                topic.subscribe("/hazards/ResetTsObsSearch", lang.hitch(this, function() {
                    this.resetTsObs();
                }));
                topic.subscribe("/hazards/SignifEqSearch", lang.hitch(this, function(values) {
                    this.filterSignifEq(values);
                }));
                topic.subscribe("/hazards/ResetSignifEqSearch", lang.hitch(this, function() {
                    this.resetSignifEq();
                }));
                topic.subscribe("/hazards/VolEventSearch", lang.hitch(this, function(values) {
                    this.filterVolEvents(values);
                }));
                topic.subscribe("/hazards/ResetVolEventSearch", lang.hitch(this, function() {
                    this.resetVolEvents();
                }));
                topic.subscribe("/hazards/DartSearch", lang.hitch(this, function(values) {
                    this.filterDarts(values);
                }));
                topic.subscribe("/hazards/ResetDartSearch", lang.hitch(this, function() {
                    this.resetDarts();
                })); 
                topic.subscribe('/hazards/ShowTsObsForEvent', lang.hitch(this, function(tsEventId, activateTTTandRIFT, tsEventPoint) {
                    this.showTsObsForEvent(tsEventId, activateTTTandRIFT, tsEventPoint);
                })); 
                topic.subscribe('/hazards/ShowTsEventForObs', lang.hitch(this, function(tsEventId, tsObsPoint) {
                    this.showTsEventForObs(tsEventId, tsObsPoint);
                }));              
            },

            setupBanner: function() {
                this.banner = new Banner({
                    breadcrumbs: [
                        {url: '//www.noaa.gov', label: 'NOAA', title: 'Go to the National Oceanic and Atmospheric Administration home'},
                        {url: '//www.nesdis.noaa.gov', label: 'NESDIS', title: 'Go to the National Environmental Satellite, Data, and Information Service home'},
                        {url: '//www.ngdc.noaa.gov', label: 'NCEI (formerly NGDC)', title: 'Go to the National Centers for Environmental Information (formerly the National Geophysical Data Center) home'},
                        {url: '//maps.ngdc.noaa.gov', label: 'Maps', title: 'Go to NCEI maps home'},
                        {url: '//ngdc.noaa.gov/hazard/hazards.shtml', label: 'Hazards'}           
                    ],
                    dataUrl: '//ngdc.noaa.gov/hazard/hazards.shtml',
                    image: 'images/viewer_logo.png',
                    imageAlt: 'NCEI Natural Hazards Viewer - go to data home'
                });
                this.banner.placeAt('banner');
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

                this.mapConfig = new MercatorMapConfig('mercator', {
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

                new CoordinatesWithElevationToolbar({map: this.mapConfig.map, scalebarThreshold: 4}, 'mercatorCoordinatesToolbar');

                aspect.after(this.mapConfig, 'mapReady', lang.hitch(this, function() {
                    var mapToolbar = new MapToolbar({map: this.mapConfig.map, layerCollection: this.mapConfig.mapLayerCollection}, 'mercatorMapToolbar');
                    mapToolbar.startup();

                    this.hazMapService = this.mapConfig.mapLayerCollection.getLayerById('Hazards');

                    this.identify = new Identify({map: this.mapConfig.map, layerCollection: this.mapConfig.mapLayerCollection});

                    this.identifyPane = new HazIdentifyPane({
                        map: this.mapConfig.map,
                        identify: this.identify,
                        class: 'identifyPane',
                        autoExpandTree: true
                    }, dom.byId('identifyPaneDiv'));
                    this.identifyPane.startup();

                    //Set the TTT and Tsunami Energy sublayers to be hidden on startup
                    this.mapConfig.mapLayerCollection.getLayerById('TTT').setVisibleLayers([-1]);
                    this.mapConfig.mapLayerCollection.getLayerById('Tsunami Energy').setVisibleLayers([-1]);

                    //If the 'tsEvent' URL param is specified, show the tsunami event and its runups
                    if (config.app.tsEvent) {
                        this.showTsEventOnStartup(config.app.tsEvent);
                    }
                    else {
                        this.resetTsEvents(); //Set default EVENT_VALIDITY filter on tsevents (exclude seiches)
                    }

                    //The 'layers' URL param can contain a comma-separated list of numbers
                    if (config.app.layers) {
                        this.setStartupLayers(config.app.layers);
                    }

                }));
            },

            filterTsEvents: function(values) {
                var sql = [];
                
                if (!isNaN(values.startYear)) {
                    sql.push("YEAR>=" + values.startYear);
                }
                if (!isNaN(values.endYear)) {
                    sql.push("YEAR<=" + values.endYear);
                }
                if (values.sourceLocationName !== '') {
                    sql.push("UPPER(LOCATION_NAME) LIKE '%" + values.sourceLocationName.toUpperCase() + "%'");  
                }
                if (values.sourceRegion !== '') {
                    sql.push("REGION_CODE=" + values.sourceRegion); 
                }
                if (values.sourceCountry !== '') {
                    sql.push("COUNTRY='" + values.sourceCountry + "'"); 
                }
                if (values.sourceCause.length > 0) {
                    sql.push("CAUSE_CODE IN (" + values.sourceCause.join(',') + ")");
                }
                if (!isNaN(values.minEqMagnitude)) {
                    sql.push("EQ_MAGNITUDE>=" + values.minEqMagnitude);
                }
                if (!isNaN(values.maxEqMagnitude)) {
                    sql.push("EQ_MAGNITUDE<=" + values.minEqMagnitude);     
                }
                if (values.minDeaths) {
                    sql.push("DEATHS_AMOUNT_ORDER>=" + values.minDeaths);
                }
                if (values.maxDeaths) {
                    sql.push("DEATHS_AMOUNT_ORDER<=" + values.maxDeaths);
                }
                if (values.minDamage) {
                    sql.push("DAMAGE_AMOUNT_ORDER>=" + values.minDamage);
                }
                if (values.maxDamage) {
                    sql.push("DAMAGE_AMOUNT_ORDER<=" + values.maxDamage);
                }
                if (values.minEventValidity) {
                    sql.push("EVENT_VALIDITY_CODE>=" + values.minEventValidity);
                }
                if (values.maxEventValidity) {
                    sql.push("EVENT_VALIDITY_CODE<=" + values.maxEventValidity);
                }

                //If runup criteria is entered, first query the runup layer to get a list of TSEVENT_IDs. Append those to the tsevent layer defs.
                if (values.runupRegion || values.runupCountry || values.runupArea || values.minRunupHeight || values.maxRunupHeight || values.minRunupDeaths || values.maxRunupDeaths ||
                    values.minRunupDamage || values.maxRunupDamage || values.minRunupDistance || values.maxRunupDistance) {
                    var queryTask = new QueryTask("//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/hazards/MapServer/4");
                    var query = new Query();
                    query.returnDistinctValues = true;
                    query.outFields = ['TSEVENT_ID'];
                    query.orderByFields = ['TSEVENT_ID'];

                    var runupCriteria = [];
                    if (values.runupRegion) {
                        runupCriteria.push("REGION_CODE=" + values.runupRegion);
                    }
                    if (values.runupCountry) {
                        runupCriteria.push("COUNTRY='" + values.runupCountry + "'");
                    }
                    if (values.runupArea) {
                        runupCriteria.push("AREA='" + values.runupArea + "'");
                    }
                    if (values.minRunupHeight) {
                        runupCriteria.push("RUNUP_HT>=" + values.minRunupHeight);
                    }
                    if (values.maxRunupHeight) {
                        runupCriteria.push("RUNUP_HT<=" + values.maxRunupHeight);
                    }
                    if (values.minRunupDeaths) {
                        runupCriteria.push("DEATHS_AMOUNT_ORDER>=" + values.minRunupDeaths);
                    }
                    if (values.maxRunupDeaths) {
                        runupCriteria.push("DEATHS_AMOUNT_ORDER<=" + values.maxRunupDeaths);
                    }
                    if (values.minRunupDamage) {
                        runupCriteria.push("DAMAGE_AMOUNT_ORDER>=" + values.minRunupDamage);
                    }
                    if (values.maxRunupDamage) {
                        runupCriteria.push("DAMAGE_AMOUNT_ORDER<=" + values.maxRunupDamage);
                    }
                    if (values.minRunupDistance) {
                        runupCriteria.push("DIST_FROM_SOURCE>=" + values.minRunupDistance);
                    }
                    if (values.maxRunupDistance) {
                        runupCriteria.push("DIST_FROM_SOURCE<=" + values.maxRunupDistance);
                    }

                    query.where = runupCriteria.join(' and ');

                    queryTask.execute(query).then(lang.hitch(this, function(fset) {
                        var tseventIds = [];
                        array.forEach(fset.features, function(feature) {
                            tseventIds.push(feature.attributes['TSEVENT_ID']);
                        });
                        if (tseventIds.length > 0) {
                            sql.push('ID IN (' + tseventIds.join(',') + ')');
                        } else {
                            sql.push('ID IN (-1)'); //Query for a bogus id if the set is empty
                        }
                        this.setTsEventFilter(sql);
                    }));
                }
                
                else {
                    this.setTsEventFilter(sql);
                }
            },

            setTsEventFilter: function(sql) {
                var layerDefinitions = sql.join(' and ');
                this.hazLayerDefinitions[this.tsEventLayerID1] = layerDefinitions;
                this.hazLayerDefinitions[this.tsEventLayerID2] = layerDefinitions;
                
                this.hazMapService.setLayerDefinitions(this.hazLayerDefinitions);
                
                this.layersPanel.setTsEventFilterActive(true);    
            },

            resetTsEvents: function() {
                //By default, exclude seiches
                this.hazLayerDefinitions[this.tsEventLayerID1] = 'EVENT_VALIDITY_CODE>0';
                this.hazLayerDefinitions[this.tsEventLayerID2] = 'EVENT_VALIDITY_CODE>0';
                
                this.hazMapService.setLayerDefinitions(this.hazLayerDefinitions);
                
                this.layersPanel.setTsEventFilterActive(false);                
            },

            showTsEventOnStartup: function() {
                var tsEvent = config.app.tsEvent;
                var queryTask = new QueryTask(this.hazMapService.url + "/" + this.tsEventLayerID1);
                var query = new Query();
                query.returnGeometry = true;
                query.outFields = [];
                query.where = 'ID=' + tsEvent;

                queryTask.execute(query).then(lang.hitch(this, function(fset) {
                    var point = new Point(fset.features[0].geometry.x, fset.features[0].geometry.y, new SpatialReference({ wkid:102100 }));
                    this.showTsObsForEvent(tsEvent, true, point);
                }));
            },

            showTsObsForEvent: function(tsEventId, activateTTTandRIFT, tsEventPoint) {
                var tsEventLayerDefinitions = "ID=" + tsEventId;
                this.hazLayerDefinitions[this.tsEventLayerID1] = tsEventLayerDefinitions;
                this.hazLayerDefinitions[this.tsEventLayerID2] = tsEventLayerDefinitions;
                
                var tsObsLayerDefinitions = "TSEVENT_ID=" + tsEventId;
                this.hazLayerDefinitions[this.tsObsLayerID1] = tsObsLayerDefinitions;
                this.hazLayerDefinitions[this.tsObsLayerID2] = tsObsLayerDefinitions;
                this.hazLayerDefinitions[this.tsObsLayerID3] = tsObsLayerDefinitions;     
                
                this.hazMapService.setLayerDefinitions(this.hazLayerDefinitions);
                
                this.layersPanel.setTsEventFilterActive(true);
                this.layersPanel.setTsObsFilterActive(true);

                if (activateTTTandRIFT) {
                    this.layersPanel.activateTTTandRIFT(tsEventId);
                }
                           
                //Zoom to results
                if (tsEventPoint) {
                    this.zoomToTsEventAndObservations(tsEventId, tsEventPoint);
                }
            },

            showTsEventForObs: function(tsEventId, tsObsPoint) {                
                var layerDefinitions = "ID=" + tsEventId;
                this.hazLayerDefinitions[this.tsEventLayerID1] = layerDefinitions;
                this.hazLayerDefinitions[this.tsEventLayerID2] = layerDefinitions;
                    
                this.hazMapService.setLayerDefinitions(this.hazLayerDefinitions);
                
                this.layersPanel.setTsEventFilterActive(true);

                this.layersPanel.activateTTTandRIFT(tsEventId);
                
                //Zoom to results
                if (tsObsPoint) {
                    this.zoomToTsEventForObservation(tsEventId, tsObsPoint);
                }
            },

            filterTsObs: function(values) {
                var layerDefinitions;
                var sql = [];
                
                if (!isNaN(values.startYear)) {
                    sql.push("YEAR>=" + values.startYear);
                }
                if (!isNaN(values.endYear)) {
                    sql.push("YEAR<=" + values.endYear);
                }
                if (values.sourceRegion !== '') {
                    sql.push("EVENT_REGION_CODE=" + values.sourceRegion);
                }       
                if (values.runupRegion !== '') {
                    sql.push("REGION_CODE=" + values.runupRegion);
                }
                if (values.locationName !== '') {
                    sql.push("UPPER(LOCATION_NAME) LIKE '%" + values.locationName.toUpperCase() + "%'");
                }           
                if (values.country !== '') {
                    sql.push("COUNTRY='" + values.country + "'");
                }
                if (values.area !== '') {
                    sql.push("AREA='" + values.area + "'");
                }
                if (values.measurementType.length > 0) {
                    sql.push("TYPE_MEASUREMENT_ID IN(" + values.measurementType.join(',') + ")");
                }   
                if (values.minWaterHeight) {
                    sql.push("RUNUP_HT>=" + values.minWaterHeight);
                }
                if (values.maxWaterHeight) {
                    sql.push("RUNUP_HT<=" + values.maxWaterHeight);
                }
                if (values.minDist) {
                    sql.push("DIST_FROM_SOURCE>=" + values.minDist);
                }
                if (values.maxDist) {
                    sql.push("DIST_FROM_SOURCE<=" + values.maxDist);
                }
                if (values.minDeaths) {
                    sql.push("DEATHS_AMOUNT_ORDER>=" + values.minDeaths);
                }
                if (values.maxDeaths) {
                    sql.push("DEATHS_AMOUNT_ORDER<=" + values.maxDeaths);
                }
                if (values.minDamage) {
                    sql.push("DAMAGE_AMOUNT_ORDER>=" + values.minDamage);
                }
                if (values.maxDamage) {
                    sql.push("DAMAGE_AMOUNT_ORDER<=" + values.maxDamage);
                }
                layerDefinitions = sql.join(' and ');
                this.hazLayerDefinitions[this.tsObsLayerID1] = layerDefinitions;
                this.hazLayerDefinitions[this.tsObsLayerID2] = layerDefinitions;
                this.hazLayerDefinitions[this.tsObsLayerID3] = layerDefinitions;

                this.hazMapService.setLayerDefinitions(this.hazLayerDefinitions);
                    
                this.layersPanel.setTsObsFilterActive(true);
            },

            resetTsObs: function() {
                this.hazLayerDefinitions[this.tsObsLayerID1] = '';
                this.hazLayerDefinitions[this.tsObsLayerID2] = '';
                this.hazLayerDefinitions[this.tsObsLayerID3] = '';
                
                this.hazMapService.setLayerDefinitions(this.hazLayerDefinitions);
                
                this.layersPanel.setTsObsFilterActive(false);
            },

            filterSignifEq: function(values) {
                var layerDefinitions;
                var sql = [];
                
                if (!isNaN(values.startYear)) {
                    sql.push("YEAR>=" + values.startYear);
                }
                if (!isNaN(values.endYear)) {
                    sql.push("YEAR<=" + values.endYear);
                }
                if (values.region !== '') {
                    sql.push("REGION_CODE=" + values.region);   
                }
                if (values.country !== '') {
                    sql.push("COUNTRY='" + values.country + "'");   
                }
                if (values.minMagnitude) {
                    sql.push("EQ_MAGNITUDE>=" + values.minMagnitude);
                }
                if (values.maxMagnitude) {
                    sql.push("EQ_MAGNITUDE<=" + values.maxMagnitude);
                }
                if (values.minIntensity) {
                    sql.push("INTENSITY>=" + values.minIntensity);
                }
                if (values.maxIntensity) {
                    sql.push("INTENSITY<=" + values.maxIntensity);
                }
                if (values.minDepth) {
                    sql.push("EQ_DEPTH>=" + values.minDepth);
                }
                if (values.maxDepth) {
                    sql.push("EQ_DEPTH<=" + values.maxDepth);
                }
                if (values.minDeaths) {
                    sql.push("DEATHS_AMOUNT_ORDER>=" + values.minDeaths);
                }
                if (values.maxDeaths) {
                    sql.push("DEATHS_AMOUNT_ORDER<=" + values.maxDeaths);
                }
                if (values.minDamage) {
                    sql.push("DAMAGE_AMOUNT_ORDER>=" + values.minDamage);
                }
                if (values.maxDamage) {
                    sql.push("DAMAGE_AMOUNT_ORDER<=" + values.maxDamage);
                }
                if (values.tsunamiAssoc) {
                    sql.push("FLAG_TSUNAMI=1");
                }
                if (values.volEventAssoc) {
                    sql.push("FLAG_VOL_EVENT=1");
                }
                
                //console.log(sql);
                layerDefinitions = sql.join(' and ');
                this.hazLayerDefinitions[this.signifEqLayerID] = layerDefinitions;    

                this.hazMapService.setLayerDefinitions(this.hazLayerDefinitions);
                
                this.layersPanel.setSignifEqFilterActive(true);
            },

            resetSignifEq: function() {
                this.hazLayerDefinitions[this.signifEqLayerID] = '';
        
                this.hazMapService.setLayerDefinitions(this.hazLayerDefinitions);
                    
                this.layersPanel.setSignifEqFilterActive(false);
            },

            filterVolEvents: function(values) {
                var sql = [];
        
                if (values.volcanoName) {
                    sql.push("UPPER(NAME) LIKE '%" + values.volcanoName.toUpperCase() + "%'");
                }
                if (values.country) {
                    sql.push("COUNTRY='" + values.country + "'");
                }
                if (values.morphology) {
                    sql.push("MORPHOLOGY='" + values.morphology + "'");
                }
                if (values.timeOfEruption) {
                    sql.push("TIME_ERUPT='" + values.timeOfEruption + "'");
                }
                if (!isNaN(values.startYear)) {
                    sql.push("YEAR>=" + values.startYear);
                }
                if (!isNaN(values.endYear)) {
                    sql.push("YEAR<=" + values.endYear);
                }
                if (values.minVei) {
                    sql.push("VEI>=" + values.minVei);
                }
                if (values.maxVei) {
                    sql.push("VEI<=" + values.maxVei); 
                }
                if (values.minDeaths) {
                    sql.push("DEATHS_AMOUNT_ORDER>=" + values.minDeaths);
                }
                if (values.maxDeaths) {
                    sql.push("DEATHS_AMOUNT_ORDER<=" + values.maxDeaths); 
                }
                if (values.minDamage) {
                    sql.push("DAMAGE_AMOUNT_ORDER>=" + values.minDamage);
                }
                if (values.maxDamage) {
                    sql.push("DAMAGE_AMOUNT_ORDER<=" + values.maxDamage); 
                }
                if (values.tsunamiAssoc) {
                    sql.push("TSU_ID IS NOT NULL");
                }
                    
                var layerDefinitions = sql.join(' and ');
                this.hazLayerDefinitions[this.volEventLayerID] = layerDefinitions;    

                this.hazMapService.setLayerDefinitions(this.hazLayerDefinitions);
                    
                this.layersPanel.setVolEventFilterActive(true);
            },

            resetVolEvents: function() {
                this.hazLayerDefinitions[this.volLocLayerID] = '';
                this.hazLayerDefinitions[this.volEventLayerID] = '';

                this.hazMapService.setLayerDefinitions(this.hazLayerDefinitions);
                    
                this.layersPanel.setVolEventFilterActive(false);  
            },

            filterDarts: function(values) {
                var currentDartSql = [];
                var retrospectiveDartSql = [];
                var startDate, endDate;

                if (!values.showCurrentDarts) {
                    currentDartSql = ["STATION='None Selected'"];
                }
                if (!values.showRetrospectiveDarts) {
                    retrospectiveDartSql = ["STATION='None Selected'"];
                }
                    
                if (!values.startDate) {
                    startDate = new Date(1900, 0, 1);
                }
                else {
                    startDate = values.startDate;
                }
                if (!values.endDate) {
                    endDate = new Date(); //current date
                }
                else {
                    endDate = values.endDate;
                }
                
                retrospectiveDartSql.push(
                    "DEPLOYMENT_DATE <= date '" + this.toDateString(endDate) + "' AND " +
                    "RECOVERY_DATE >= date '" + this.toDateString(startDate) + "'");
                                                    
                var currentDartLayerDefinitions = currentDartSql.join(' and ');
                this.hazLayerDefinitions[this.currentDartStationsLayerID] = currentDartLayerDefinitions;  
                var retrospectiveDartLayerDefinitions = retrospectiveDartSql.join(' and ');
                this.hazLayerDefinitions[this.retrospectiveDartStationsLayerID] = retrospectiveDartLayerDefinitions;  

                this.hazMapService.setLayerDefinitions(this.hazLayerDefinitions);
                    
                this.layersPanel.setDartFilterActive(true);
            },

            resetDarts: function() {
                this.hazLayerDefinitions[this.currentDartStationsLayerID] = '';
                this.hazLayerDefinitions[this.retrospectiveDartStationsLayerID] = '';

                this.hazMapService.setLayerDefinitions(this.hazLayerDefinitions);
                    
                this.layersPanel.setDartFilterActive(false);
            },

            zoomToTsEventAndObservations: function(tsEventId, tsEventPoint) {
                var tsObsQueryTask = new QueryTask(this.hazMapService.url+"/" + this.tsObsLayerID3);
                var tsObsQuery = new Query();
                tsObsQuery.returnGeometry = true;
                tsObsQuery.outFields = [];
                tsObsQuery.where = 'TSEVENT_ID=' + tsEventId;

                tsObsQueryTask.execute(tsObsQuery).then(lang.hitch(this, function(fset) {
                    this.zoomToExtentOfPoints(fset, tsEventPoint);
                })); 

                if (this.layersPanel.tsObsSearchDialog) {
                    this.layersPanel.tsObsSearchDialog.clearForm();
                }
            },

            zoomToTsEventForObservation: function(tsEventId, tsObsPoint) {
                var tsEventQueryTask = new QueryTask(this.hazMapService.url+"/" + this.tsEventLayerID1);
                var tsEventQuery = new Query();
                tsEventQuery.returnGeometry = true;
                tsEventQuery.outFields = [];
                tsEventQuery.where = 'ID=' + tsEventId;

                tsEventQueryTask.execute(tsEventQuery).then(lang.hitch(this, function(fset) {
                    this.zoomToExtentOfPoints(fset, tsObsPoint);  
                })); 

                if (this.layersPanel.tsEventSearchDialog) {
                    this.layersPanel.tsEventSearchDialog.clearForm();
                }
            },

            zoomToExtentOfPoints: function(fset, currentPoint) {
                /*
                 * Populate 2 multipoint objects: one in Web Mercator and one in 180-centered Mercator.
                 * (Add a constant of 20037507.067161795 to the x-coordinate to convert to 180-centered)
                 * Each multipoint will contain either:
                 * -The tsunami event and its set of observations, or
                 * -A tsunami observation and its corresponding event point
                 * Zoom to the multipoint with the smaller area (either the Web Mercator or 180-centered).
                */
                
                //console.log("zoomToExtentOfPoints");
                
                var pacProj = new SpatialReference({wkt: "PROJCS[\"WGS_1984_Web_Mercator_Auxiliary_Sphere\",GEOGCS[\"GCS_WGS_1984\",DATUM[\"D_WGS_1984\",SPHEROID[\"WGS_1984\",6378137.0,298.257223563]],PRIMEM[\"Greenwich\",0.0],UNIT[\"Degree\",0.0174532925199433]],PROJECTION[\"Mercator_Auxiliary_Sphere\"],PARAMETER[\"False_Easting\",0.0],PARAMETER[\"False_Northing\",0.0],PARAMETER[\"Central_Meridian\",180],PARAMETER[\"Standard_Parallel_1\",0.0],PARAMETER[\"Auxiliary_Sphere_Type\",0.0],UNIT[\"Meter\",1.0]]"}); 
                var multipoint = new Multipoint(new SpatialReference({ wkid:102100 })); //Multipoint in Web Mercator projection
                var multipoint2 = new Multipoint(pacProj); //Multipoint in 180-centered Mercator projection

                if (fset.features.length === 0) {
                    return;
                }
                dojo.forEach(fset.features, function(feature) {
                    multipoint.addPoint(feature.geometry);
                    var x = feature.geometry.x + 20037507.067161795;
                    if (x > 20037507.067161795) {
                        x -= 40075014.13432359;
                    }
                    multipoint2.addPoint(new Point(x, feature.geometry.y, pacProj));
                });
                multipoint.addPoint(currentPoint);
                var x = currentPoint.x + 20037507.067161795;
                if (x > 20037507.067161795) {
                    x -= 40075014.13432359;
                }
                multipoint2.addPoint(new Point(x, currentPoint.y, pacProj));
                
                var extent = multipoint.getExtent();
                var extent2 = multipoint2.getExtent();  
                
                if (extent.getWidth() * extent.getHeight() < extent2.getWidth() * extent2.getHeight()) {
                    this.mapConfig.map.setExtent(extent, true);
                }
                else {
                    var webMercExtent = new Extent(extent2.xmin - 20037507.067161795, extent2.ymin, extent2.xmax - 20037507.067161795, extent2.ymax, new SpatialReference({wkid: 3857}));
                    this.mapConfig.map.setExtent(webMercExtent, true);
                }
            },

            setStartupLayers: function(layersString) {
                var visibleLayers = [];
                visibleLayers = layersString.split(',');

                this.layersPanel.toggleTsEventVisibility(false);

                if (array.indexOf(visibleLayers, '0') !== -1) {
                    this.layersPanel.toggleTsEventVisibility(true);
                }
                if (array.indexOf(visibleLayers, '1') !== -1) {
                    this.layersPanel.toggleTsObsVisibility(true);
                }
                if (array.indexOf(visibleLayers, '2') !== -1) {
                    this.layersPanel.toggleSignifEqVisibility(true);
                }
                if (array.indexOf(visibleLayers, '3') !== -1) {
                    this.layersPanel.toggleVolEventVisibility(true);
                }
                if (array.indexOf(visibleLayers, '4') !== -1) {
                    this.layersPanel.toggleDartVisibility(true);
                }
                if (array.indexOf(visibleLayers, '5') !== -1) {
                    this.layersPanel.toggleTideGaugeVisibility(true);
                }
            },

            //Format a date in the form yyyy-mm-dd
            toDateString: function(date) {  
                return date.getFullYear() + '-' + this.padDigits(date.getMonth()+1,2) + '-' + this.padDigits(date.getDate(),2);
            },

            padDigits: function(n, totalDigits){
                n = n.toString();
                var pd = '';
                if (totalDigits > n.length) {
                    for (var i = 0; i < (totalDigits - n.length); i++) {
                        pd += '0';
                    }
                }
                return pd + n.toString();
            }
        });
    }
);
