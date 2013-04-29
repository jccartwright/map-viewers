//NOTE: uses legacy dojo.connect for Esri objects.  To be replace  w/ dojo/on with future JSAPI release

define(["dojo/_base/declare", "esri/map", "esri/tasks/GeometryService", "esri/dijit/OverviewMap", "app/AppLayerCollection",
        "esri/geometry/webMercatorUtils", "dojo/_base/connect", "dojo/_base/array", "dojo/topic", "dojo/_base/lang"],
    function(declare, Map, GeometryService, OverviewMap, AppLayerCollection, webMercatorUtils, Connect, array, topic, lang){
        var map;
        var mapLayerCollection;
        var geometryService;

        return declare([], {
            constructor: function(divId, options) {
                this.map = new Map(divId, options);

                this.mapLayerCollection = new AppLayerCollection();

                Connect.connect(this.map, 'onLoad', this, function(map){
                    var overviewMap = new OverviewMap({
                        map: map,
                        attachTo: "bottom-right",
                        width: 150,
                        height: 120,
                        visible: true,
                        opacity: 0.3
                    });
                    overviewMap.startup();
                } );

                //fires after each Layer added to Map
                Connect.connect(this.map, 'onLayerAddResult', this, function(layer, error){
                    logger.debug('added layer '+layer.url+' to map...');
                    if (error) {
                        logger.warn('error adding layer '+layer.url+' to map');
                    }
                });

                //Fires after all Layers are added to the Map
                Connect.connect(this.map, 'onLayersAddResult', this, function(results){
                    //check for every layer reporting success
                    var success = array.every(results, function(item) {
                        return (item.success);
                    });

                    if (success) {
                        logger.debug('all layers added to map.');
                    } else {
                        logger.warn('one or more layers failed to load');
                    };

                    //should always be true
                    if (results.length !== this.mapLayerCollection.mapServices.length) {
                        logger.warn('onLayersAddResult != mapservice collection length');
                    }
                    this.mapReady();
                });

                //all all layers to Map
                this.map.addLayers(this.mapLayerCollection.mapServices);

                this.geometryService = new GeometryService("http://maps.ngdc.noaa.gov/rest/services/Geometry/GeometryServer");
            },  //end constructor

            //handle setup which requires all layers to be loaded
            mapReady: function() {
               this.mapLayerCollection.buildPairedMapServices(this.map);

                //setup event handlers
                Connect.connect(this.map, "onMouseMove", this, this.showCoordinates);
                Connect.connect(this.map, "onMouseDrag", this, this.showCoordinates);

                //TODO
                /*
                 initBanner('banner');
                 initTOC('toc');
                 initIdentify();
                 initScalebar();
                 */
            },

            //Show coordinates when moving the mouse, updates limited to every 100ms.
            waitToUpdate: false,
            showCoordinates: function(evt) {
                if (! this.waitToUpdate) {
                    this.waitToUpdate = true;
                    topic.publish("/ngdc/mouseposition", this.mapPointToGeographic(evt.mapPoint));

                    //Wait 100ms before allowing another update
                    setTimeout(lang.hitch(this, function(){
                        this.waitToUpdate = false;
                    }), 100);
                }
            },

            //override for various projections
            mapPointToGeographic: function mapPointToGeographic(mapPoint) {
                return (webMercatorUtils.webMercatorToGeographic(mapPoint));
            }
        });
    }
);

