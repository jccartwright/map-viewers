define(["dojo/_base/declare", "ngdc/layers/AbstractLayerCollection", "esri/layers/ArcGISTiledMapServiceLayer",
        "esri/layers/ArcGISDynamicMapServiceLayer"],
    function(declare, LayerCollection, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer){

        return declare([LayerCollection], {
            constructor: function() {

                //TODO check to ensure unique id
                this.mapServices = [
                    new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer", {
                        id: "NatGeo Overview",
                        visible: false
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/gebco08_hillshade/MapServer", {
                        id: "GEBCO_08",
                        visible: false
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/etopo1_hillshade/MapServer", {
                        id: "ETOPO1",
                        visible: false
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer", {
                        id: "Light Gray",
                        visible: false
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer", {
                        id: "World Imagery",
                        visible: false
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer", {
                        id: "NatGeo Basemap",
                        visible: false
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer", {
                        id: "Ocean Basemap",
                        visible: true
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/dem_hillshades_mosaic/MapServer", {
                        id: "DEM Hillshades",
                        visible: false
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/marine_geology/MapServer", {
                        id: "Datasets/Reports (tiled)",
                        visible: false
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/marine_geology_dynamic/MapServer", {
                        id: "Datasets/Reports (dynamic)",
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/sample_index/MapServer", {
                        id: "Sample Index (tiled)",
                        visible: false
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/sample_index_dynamic/MapServer", {
                        id: "Sample Index (dynamic)",
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_seabed/MapServer", {
                        id: "NOS Seabed Descriptions (tiled)",
                        visible: false
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_seabed_dynamic/MapServer", {
                        id: "NOS Seabed Descriptions (dynamic)",
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer", {
                        id: "World Boundaries and Places",
                        visible: false
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer", {
                        id: "Light Gray Reference",
                        visible: false
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/graticule/MapServer", {
                        id: "Graticule",
                        visible: false,
                        opacity: 0.7,
                        imageParameters: this.imageParameters.png32
                    })
                ];

                this.pairedMapServices = [
                    {
                        id: "NOS Seabed Descriptions",
                        tiledService: this.getLayerById("NOS Seabed Descriptions (tiled)"),
                        dynamicService: this.getLayerById("NOS Seabed Descriptions (dynamic)"),
                        visible: true,
                        cutoffZoom: 7 - this.firstZoomLevel
                    }
                ];

            } //end constructor
        });
    }
);


