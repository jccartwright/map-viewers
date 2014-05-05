define(["dojo/_base/declare", "ngdc/layers/AbstractLayerCollection", "esri/layers/ArcGISTiledMapServiceLayer",
    "esri/layers/ArcGISDynamicMapServiceLayer"],
    function(declare, LayerCollection, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer){

        return declare([LayerCollection], {
            constructor: function() {
                this.defineMapServices();

                this.setLayerTimeouts();

                this.buildPairedMapServices();

                this.setSubLayerVisibility();
            },

            defineMapServices: function() {
                //TODO check to ensure unique id

                this.mapServices = [
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/arctic/bathy_hillshade/MapServer", {
                        id: "Bathy Hillshade",
                        visible: true,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/arctic/bathy_hillshade/MapServer", {
                        id: "Bathy Hillshade2",
                        visible: false,
                        opacity: 1,
                        imageParameters: this.imageParameters.jpg
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/arctic/gshhs/MapServer", {
                        id: "GSHHS",
                        visible: false,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/dem_hillshades_mosaic/MapServer", {
                        id: "DEM Hillshades",
                        visible: false,
                        opacity: 1,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer", {
                        id: "NOS Hydrographic Surveys",
                        visible: true,
                        opacity: 1,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_combined_dynamic/MapServer", {
                        id: "Trackline Combined",
                        visible: false,
                        opacity: 1,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/arctic/multibeam/MapServer", {
                        id: "Multibeam (tiled)",
                        visible: true,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer", {
                        id: "Multibeam (dynamic)",
                        visible: false,
                        opacity: 1,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/arctic/world_reference_map/MapServer", {
                        id: "World Reference Map",
                        visible: false,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/arctic/graticule/MapServer", {
                        id: "Graticule",
                        visible: true,
                        opacity: 0.7,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/dem_extents/MapServer", {
                        id: "DEM Extents",
                        visible: false,
                        opacity: 1,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/arctic/clipping_donut/MapServer", {
                        id: "Clipping Donut",
                        visible: true,
                        opacity: 1
                    })
                ];
            },  //end defineMapServices

            buildPairedMapServices: function() {
                logger.debug('creating pairedMapServices...');
            },

            setSubLayerVisibility: function() {
                logger.debug('setting subLayer visibility...');
            }
        });
    }
);


