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
//                    new ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/web_mercator/gebco08_hillshade/MapServer", {
//                        id: "GEBCO_08 (tiled)",
//                        visible: false,
//                        opacity: 1
//                    }),
                    new ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer", {
                        id: "Ocean Basemap",
                        visible: false,
                        opacity: 1
                    }),
                    ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer", {
                        id: "Light Gray",
                        visible: false,
                        opacity: 1
                    }),
                    new ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer", {
                        id: "Light Gray Reference",
                        visible: false,
                        opacity: 1
                    }),
//                    new ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/etopo1_hillshade/MapServer", {
//                        id: "ETOPO1 (tiled)",
//                        visible: false,
//                        opacity: 1
//                    }),
//                    new ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/web_mercator/graticule/MapServer", {
//                        id: "Graticule",
//                        visible: false,
//                        opacity: 0.7,
//                        imageParameters: this.imageParameters.png32
//                    }),
                    new ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer", {
                        id: "World Boundaries and Places",
                        visible: false,
                        opacity: 1
                    }),
//                    new ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam/MapServer", {
//                        id: "Multibeam (tiled)",
//                        visible: true,
//                        opacity: 1
//                    }),
//                    new ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer", {
//                        id: "Multibeam (dynamic)",
//                        visible: false,
//                        opacity: 1,
//                        imageParameters: this.imageParametersPng32
//                    })
//                    new ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/etopo1/MapServer", {
//                        id: "etopo1",
//                        visible: true
//                    }),
//                    new ArcGISDynamicMapServiceLayer("http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA1/MapServer", {
//                        id: "USA1",
//                        visible: true
//                    }),
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
//                    {
//                        id: "Multibeam",
//                        tiledService: this.getLayerById("Multibeam (tiled)"),
//                        dynamicService: this.getLayerById("Multibeam (dynamic)"),
//                        visible: true,
//                        cutoffZoom: 7 - this.firstZoomLevel
//                    }
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


