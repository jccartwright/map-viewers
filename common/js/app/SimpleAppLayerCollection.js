define(["dojo/_base/declare", "ngdc/layers/AbstractLayerCollection", "esri/layers/ArcGISTiledMapServiceLayer",
    "esri/layers/ArcGISDynamicMapServiceLayer"],
    function(declare, LayerCollection, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer){

        return declare([LayerCollection], {
            constructor: function() {
                this.defineMapServices();

                this.setLayerTimeouts();

                this.definePairedMapServices();

                this.setSubLayerVisibility();
            },

            defineMapServices: function() {
                //TODO check to ensure unique id

                this.mapServices = [
                    new ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer", {
                        id: "NatGeo Overview",
                        visible: true,
                        opacity: 1
                    }),
                    new ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer", {
                        id: "Ocean Basemap",
                        visible: false,
                        opacity: 1
                    }),
                    new ArcGISDynamicMapServiceLayer("http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer", {
                        id: "USA",
                        visible: true
                    }),
                    new ArcGISDynamicMapServiceLayer("http://sampleserver6.arcgisonline.com/arcgis/rest/services/SampleWorldCities/MapServer", {
                        id: "cities",
                        visible: true
                    })
                ];
            },  //end defineMapServices

            definePairedMapServices: function() {
                logger.debug('creating pairedMapServices...');
                this.pairedMapServices = [
                ];
            },

            setSubLayerVisibility: function() {
//                logger.debug('setting subLayer visibility...');
                this.getLayerById('USA').setVisibleLayers([0,1]);
                this.getLayerById('cities').setVisibleLayers([0]);
            }
        });
    }
);


