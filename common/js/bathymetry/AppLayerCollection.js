/*
 * layers for the bathymetry viewer
 */
define(["dojo/_base/declare", "dojo/_base/array", "ngdc/layers/AbstractLayerCollection", "esri/layers/ArcGISTiledMapServiceLayer", "esri/layers/ArcGISDynamicMapServiceLayer"],
    function(declare, array, LayerCollection, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer){

        return declare([LayerCollection], {
            mapServices: null,
            pairedMapServices: null,
            basemaps: null,
            overlays: null,

            constructor: function() {

                //TODO check to ensure unique id
                this.mapServices = [
                    new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer", {
                        id: "NatGeo Overview",
                        visible: false,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/web_mercator/gebco08_hillshade/MapServer", {
                        id: "GEBCO_08 (tiled)",
                        visible: false,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/web_mercator/gebco08_hillshade/MapServer", {
                        id: "GEBCO_08 (dynamic)",
                        visible: false,
                        opacity: 1,
                        imageParameters: this.imageParameters.jpg
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/web_mercator/etopo1_hillshade/MapServer", {
                        id: "ETOPO1 (tiled)",
                        visible: false,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/web_mercator/etopo1_hillshade/MapServer", {
                        id: "ETOPO1 (dynamic)",
                        visible: false,
                        opacity: 1,
                        imageParameters: this.imageParameters.jpg
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer", {
                        id: "Light Gray",
                        visible: false,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer", {
                        id: "World Imagery",
                        visible: false,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer", {
                        id: "NatGeo Basemap",
                        visible: false,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer", {
                        id: "Ocean Basemap",
                        visible: false,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/web_mercator/dem_hillshades_mosaic/MapServer", {
                        id: "DEM Hillshades",
                        visible: false,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/web_mercator/bag_hillshades/MapServer", {
                        id: "BAG Hillshades",
                        visible: false
                    }),
//                    new esri.layers.ArcGISImageServiceLayer("http://egisws02.nos.noaa.gov/ArcGIS/rest/services/RNC/NOAA_RNC/ImageServer", {
//                        id: "RNC",
//                        visible: false,
//                        opacity: 0.5,
//                        imageServiceParameters: this.imageParameters.interpolationBilinear
//                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/web_mercator/trackline_bathymetry/MapServer", {
                        id: "Trackline Bathymetry (tiled)",
                        visible: false,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/web_mercator/trackline_combined_dynamic/MapServer", {
                        id: "Trackline Bathymetry (dynamic)",
                        visible: false,
                        opacity: 1,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/web_mercator/nos_hydro_dynamic/MapServer", {
                        id: "NOS Hydro Non-Digital",
                        visible: false,
                        opacity: 0.9,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/web_mercator/nos_hydro/MapServer", {
                        id: "NOS Hydro (tiled)",
                        visible: false,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/web_mercator/nos_hydro_dynamic/MapServer", {
                        id: "NOS Hydro (dynamic)",
                        visible: false,
                        opacity: 1,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/web_mercator/multibeam/MapServer", {
                        id: "Multibeam (tiled)",
                        visible: false,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/web_mercator/multibeam_dynamic/MapServer", {
                        id: "Multibeam (dynamic)",
                        visible: false,
                        opacity: 1,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer", {
                        id: "World Boundaries and Places",
                        visible: false,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer", {
                        id: "Light Gray Reference",
                        visible: false,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/web_mercator/graticule/MapServer", {
                        id: "Graticule",
                        visible: false,
                        opacity: 0.7,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/rest/services/web_mercator/dem_extents/MapServer", {
                        id: "DEM Extents",
                        visible: false,
                        opacity: 1,
                        imageParameters: this.imageParameters.png32
                    })
                ];

                this.pairedMapServices = [
                    {
                        id: "Multibeam",
                        tiledService: this.getLayerById("Multibeam (tiled)"),
                        dynamicService: this.getLayerById("Multibeam (dynamic)"),
                        visible: true,
                        cutoffZoom: 7 - this.firstZoomLevel
                    },
                    {
                        id: "Trackline Bathymetry",
                        tiledService: this.getLayerById("Trackline Bathymetry (tiled)"),
                        dynamicService: this.getLayerById("Trackline Bathymetry (dynamic)"),
                        visible: false,
                        cutoffZoom: 7 - this.firstZoomLevel
                    },
                    {
                        id: "NOS Hydrographic Surveys",
                        tiledService: this.getLayerById("NOS Hydro (tiled)"),
                        dynamicService: this.getLayerById("NOS Hydro (dynamic)"),
                        visible: false,
                        cutoffZoom: 7 - this.firstZoomLevel
                    },
                    {
                        id: "GEBCO_08",
                        tiledService: this.getLayerById("GEBCO_08 (tiled)"),
                        dynamicService: this.getLayerById("GEBCO_08 (dynamic)"),
                        visible: false,
                        cutoffZoom: 7 - this.firstZoomLevel
                    },
                    {
                        id: "ETOPO1",
                        tiledService: this.getLayerById("ETOPO1 (tiled)"),
                        dynamicService: this.getLayerById("ETOPO1 (dynamic)"),
                        visible: false,
                        cutoffZoom: 7 - this.firstZoomLevel
                    }
                ];

                this.basemaps = [
                    {services: ['Ocean Basemap'], label: 'Ocean Basemap (Esri)', boundariesEnabled: false},
                    {services: ['GEBCO_08 (tiled)'], label: 'Shaded Relief (GEBCO_08)', boundariesEnabled: true, default: true},
                    {services: ['ETOPO1 (tiled)'], label: 'Shaded Relief (ETOPO1)', boundariesEnabled: true},
                    {services: ['Light Gray', 'Light Gray Reference'], label: 'Light Gray (Esri)', boundariesEnabled: false},
                    //{services: ['World Imagery'], label: 'Imagery (Esri)', boundariesEnabled: true},
                    {services: ['NatGeo Overview'], label: 'National Geographic (Esri)', boundariesEnabled: false}
                ];

                this.overlays = [
                    {services: ['World Boundaries and Places'], label: 'Boundaries/Labels'},
                    {services: ['Graticule'], label: 'Graticule'}
                ];

            }, //end constructor

            sayHello: function() {
                logger.debug("Customized Greeting");
            }
        });
    }
);

