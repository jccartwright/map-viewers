define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/dom',
    'ngdc/MapConfig',
    'app/arctic/MapToolbar',
    'app/Identify',
    'app/AppIdentifyPane'
    ],
    function(
        declare, 
        lang, 
        dom,
        MapConfig,
        MapToolbar,
        Identify,
        IdentifyPane
        ){
        
        return declare([MapConfig], {
                       
            constructor: function() {
                logger.debug('inside constructor for app/arctic/MapConfig');

                if (window.proj4) {
                    //WGS 1984 EPSG Alaska Polar Stereographic
                    //WKT projection string copied from Esri's .prj file, with PROJECTION["Sterographic"] changed to PROJECTION["Polar_Stereographic"] for compatibility with Proj4js
                    this.sourceProj = 'PROJCS["WGS_1984_EPSG_Alaska_Polar_Stereographic",GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Polar_Stereographic"],PARAMETER["False_Easting",2000000.0],PARAMETER["False_Northing",2000000.0],PARAMETER["Central_Meridian",-150.0],PARAMETER["Scale_Factor",0.994],PARAMETER["Latitude_Of_Origin",90.0],UNIT["Meter",1.0],AUTHORITY["EPSG",5936]]';
                }
            },

            //override method in parent class for projection-specific conversion
            mapPointToGeographic: function(mapPoint) {
                var mp = {};
                mp.x = mapPoint.x;
                mp.y = mapPoint.y;
                var coords;

                 if (window.proj4) {    
                    try {
                        coords = proj4(this.sourceProj).inverse(mp);
                    } catch (err) {
                        logger.error(err);
                    }
                 }
                return (coords);
            },

            //handle setup which requires all layers to be loaded
            mapReady: function() {
                this.inherited(arguments);

                //console.log('inside custom Arctic mapReady...');   

                this.mapToolbar = new MapToolbar({map: this.map, layerCollection: this.mapLayerCollection}, 'arcticMapToolbar');
                this.mapToolbar.startup();

                this.identify = new Identify({map: this.map, layerCollection: this.mapLayerCollection});
                this.identify.enabled = false;

                this.identifyPane = new IdentifyPane({
                    map: this.map,
                    identify: this.identify,
                    class: 'identifyPane',
                    autoExpandTree: false
                }, dom.byId('arcticIdentifyPaneDiv'));
                this.identifyPane.startup();
                this.identifyPane.enabled = false;
                
                this.mapLayerCollection.getLayerById('ECS Catalog').setVisibleLayers([18, 20]); //US EEZ and International EEZs should be the only layers visible by default.

                //Layer definitions for NGDC pre-2012 source data
                this.mapLayerCollection.getLayerById('Multibeam').setLayerDefinitions(["ENTERED_DATE < date '2012-01-01' or ENTERED_DATE is null"]);
    
                var layerDefs = [];
                for (var i = 0; i < 10; i++) {
                    layerDefs[i] = "DATE_ADDED < date '2012-01-01' or DATE_ADDED is null";
                }
                this.mapLayerCollection.getLayerById('Trackline').setLayerDefinitions(layerDefs);
                this.mapLayerCollection.getLayerById('Trackline').setVisibleLayers([-1]);

                this.mapLayerCollection.getLayerById('Sample Index').setLayerDefinitions(["CAST(SUBSTR(BEGIN_DATE,0,4) AS NUMBER) < 2012 or BEGIN_DATE is null"]);

                //TODO should be shared parent class or mixin
                on(this.mapLayerCollection.getLayerById('ECS Catalog'),'update-start',function(e) {
                    var authUrl = window.location.protocol + '//' + window.location.host + "/ecs-catalog/rest/login/success";
                    var xhrOptions = {"preventCache":true, "handleAs": "json", "timeout":500};
                    request(authUrl, xhrOptions).then(function(data) {
                        if (data.username == '__grails.anonymous.user__') {
                            alert("WARNING: Not logged into ECS Catalog. Not all map layers will display");
                        }
                    }, function(err) {
                        console.error("error checking ECS authentication:",err);
                    });
                });
            }
        });
    }
);
