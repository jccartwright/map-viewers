define([
    "dojo/_base/declare", 
    "ngdc/layers/AbstractLayerCollection", 
    "esri/layers/ArcGISTiledMapServiceLayer",
    "esri/layers/ArcGISDynamicMapServiceLayer"
    ],
    function(
        declare, 
        LayerCollection, 
        ArcGISTiledMapServiceLayer, 
        ArcGISDynamicMapServiceLayer
        ){

        return declare([LayerCollection], {
            constructor: function() {
                this.name = "app/antarctic/LayerCollection";

                this.defineMapServices();

                this.setLayerTimeouts();

                this.definePairedMapServices();

                this.setSubLayerVisibility();
            },

            defineMapServices: function() {
                //TODO check to ensure unique id
                this.mapServices = [
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/antarctic/antarctic_basemap/MapServer", {
                        id: "Antarctic Basemap",
                        visible: true
                    }),                   
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/dem_hillshades_mosaic/MapServer", {
                        id: "DEM Hillshades",
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/antarctic/ibcso_contours/MapServer", {
                        id: "IBCSO Contours",
                        visible: false,
                        opacity: 0.5
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer", {
                        id: "NOS Hydrographic Surveys",
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_combined_dynamic/MapServer", {
                        id: "Trackline Bathymetry",
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),                    
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer", {
                        id: "Multibeam",
                        visible: true,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/antarctic/graticule/MapServer", {
                        id: "Graticule",
                        visible: true,
                        opacity: 0.7,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/antarctic/reference/MapServer", {
                        id: "Reference",
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),                    
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/dem_extents/MapServer", {
                        id: "DEM Extents",
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/antarctic/clipping_donut/MapServer", {
                        id: "Clipping Donut",
                        visible: true,
                        imageParameters: this.imageParameters.png32
                    })
                ];

            }, //end defineMapServices

            definePairedMapServices: function() {
                //logger.debug('creating pairedMapServices...');
            },

            setSubLayerVisibility: function() {
                //logger.debug('setting subLayer visibility...');
            }
        });
    }
);


