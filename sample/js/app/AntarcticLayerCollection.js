define(["dojo/_base/declare", "ngdc/layers/AbstractLayerCollection", "esri/layers/ArcGISTiledMapServiceLayer",
        "esri/layers/ArcGISDynamicMapServiceLayer"],
    function(declare, LayerCollection, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer){

        return declare([LayerCollection], {
            constructor: function() {

                //TODO check to ensure unique id
                this.mapServices = [
                    new ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/antarctic/antarctic_basemap/MapServer", {
                        id: "Basemap",
                        visible: true,
                        opacity: 1
                    }),
                    new ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/antarctic/gebco08_hillshade/ImageServer", {
                        id: "GEBCO 08",
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/antarctic/ibcso_contours/MapServer", {
                        id: "Contours",
                        visible: false,
                        opacity: 1
                    }),
                    new ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer", {
                        id: "Multibeam (dynamic)",
                        visible: true,
                        opacity: 1,
                        imageParameters: this.imageParametersPng32
                    }),
                    new ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/antarctic/clipping_donut/MapServer", {
                        id: "Clipping Donut",
                        visible: true
                    }),
                    new ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/antarctic/graticule/MapServer", {
                        id: "Graticule",
                        visible: false,
                        opacity: 0.7,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/antarctic/reference/MapServer", {
                        id: "Reference",
                        visible: false,
                        opacity: 1
                    })
                ];

                this.pairedMapServices = [];
            } //end constructor
        });
    }
);


