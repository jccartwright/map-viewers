define(["dojo/_base/declare", "ngdc/layers/AbstractLayerCollection", "esri/layers/ArcGISTiledMapServiceLayer",
        "esri/layers/ArcGISDynamicMapServiceLayer"],
    function(declare, LayerCollection, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer){

        return declare([LayerCollection], {
            constructor: function() {

                //TODO check to ensure unique id
                this.mapServices = [
                    new ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/arctic_ps/arctic_basemap/MapServer", {
                        id: "basemap",
                        visible: true,
                        opacity: 1
                    }),
                    new ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/arctic_ps/ibcao_contours/MapServer", {
                        id: "contours",
                        visible: false,
                        opacity: 1
                    }),
                    new ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer", {
                        id: "Multibeam (dynamic)",
                        visible: true,
                        opacity: 1,
                        imageParameters: this.imageParametersPng32
                    }),
                    new ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/arctic_ps/clipping_donut/MapServer", {
                       id: "clipping_donut",
                        visible: true,
                        opacity: 1
                    }),
                    new ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/arctic_ps/graticule/MapServer", {
                        id: "Graticule",
                        visible: false,
                        opacity: 0.7,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/arctic_ps/reference/MapServer", {
                       id: "reference",
                        visible: false,
                        opacity: 1
                    })
                ];

                this.pairedMapServices = [];

            } //end constructor
        });
    }
);


