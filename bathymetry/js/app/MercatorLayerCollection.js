define(["dojo/_base/declare", "ngdc/layers/AbstractLayerCollection", "esri/layers/ArcGISTiledMapServiceLayer",
    "esri/layers/ArcGISDynamicMapServiceLayer"],
    function(declare, AbstractLayerCollection, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer){

        return declare([AbstractLayerCollection], {
            constructor: function() {
                this.defineMapServices();

                this.setLayerTimeouts();

                this.definePairedMapServices();

                this.setSubLayerVisibility();
            },

            defineMapServices: function() {
                //TODO check to ensure unique id
                this.mapServices = [
                    new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer", {
                        id: "NatGeo Overview",
                        visible: false,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/gebco08_hillshade/MapServer", {
                        id: "GEBCO_08 (tiled)",
                        visible: false,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/gebco08_hillshade/MapServer", {
                        id: "GEBCO_08 (dynamic)",
                        visible: false,
                        opacity: 1,
                        imageParameters: this.imageParameters.jpg
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/etopo1_hillshade/MapServer", {
                        id: "ETOPO1 (tiled)",
                        visible: false,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/etopo1_hillshade/MapServer", {
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
                        visible: true,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/dem_hillshades_mosaic/MapServer", {
                        id: "DEM Hillshades",
                        visible: false,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/bag_hillshades/MapServer", {
                        id: "BAG Hillshades",
                        visible: false
                    }),
                    new esri.layers.ArcGISImageServiceLayer("http://egisws02.nos.noaa.gov/ArcGIS/rest/services/RNC/NOAA_RNC/ImageServer", {
                        id: "RNC",
                        visible: false,
                        opacity: 0.5,
                        imageServiceParameters: this.imageServiceParameters
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_bathymetry/MapServer", {
                        id: "Trackline Bathymetry (tiled)",
                        visible: false,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_combined_dynamic/MapServer", {
                        id: "Trackline Bathymetry (dynamic)",
                        visible: false,
                        opacity: 1,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer", {
                        id: "NOS Hydro Non-Digital",
                        visible: false,
                        opacity: 0.9,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro/MapServer", {
                        id: "NOS Hydro (tiled)",
                        visible: false,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer", {
                        id: "NOS Hydro (dynamic)",
                        visible: false,
                        opacity: 1,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam/MapServer", {
                        id: "Multibeam (tiled)",
                        visible: false,
                        opacity: 1
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer", {
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
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/graticule/MapServer", {
                        id: "Graticule",
                        visible: false,
                        opacity: 0.7,
                        imageParameters: this.imageParameters.png32
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/dem_extents/MapServer", {
                        id: "DEM Extents",
                        visible: false,
                        opacity: 1,
                        imageParameters: this.imageParameters.png32
                    })
                ];
            },  //end defineMapServices

            definePairedMapServices: function() {
                this.pairedMapServices = [
                    {
                        id: "Multibeam",
                        tiledService: this.getLayerById("Multibeam (tiled)"),
                        dynamicService: this.getLayerById("Multibeam (dynamic)"),
                        visible: true,
                        cutoffZoom: 5
                    },
                    {
                        id: "Trackline Bathymetry",
                        tiledService: this.getLayerById("Trackline Bathymetry (tiled)"),
                        dynamicService: this.getLayerById("Trackline Bathymetry (dynamic)"),
                        visible: false,
                        cutoffZoom: 5,
                        defaultVisibleLayers: [1]
                     },
                     {
                         id: "NOS Hydrographic Surveys",
                         tiledService: this.getLayerById("NOS Hydro (tiled)"),
                         dynamicService: this.getLayerById("NOS Hydro (dynamic)"),
                         visible: true,
                         cutoffZoom: 5
                     },
                     {
                         id: "GEBCO_08",
                         tiledService: this.getLayerById("GEBCO_08 (tiled)"),
                         dynamicService: this.getLayerById("GEBCO_08 (dynamic)"),
                         visible: false,
                         cutoffZoom: 5
                     },
                     {
                         id: "ETOPO1",
                         tiledService: this.getLayerById("ETOPO1 (tiled)"),
                         dynamicService: this.getLayerById("ETOPO1 (dynamic)"),
                         visible: false,
                         cutoffZoom: 5
                     }
                ];
            },

            setSubLayerVisibility: function() {
                //logger.debug('setting subLayer visibility...');
                //this.getLayerById('Water Column Sonar').setVisibleLayers([0,1,2,3]);
                this.getLayerById('DEM Extents').setVisibleLayers([9999]); //Manually set all the sublayers to invisible for "DEM Extents"
                //set on PairedService or dynamic service?
                this.getLayerById('NOS Hydro (dynamic)').setVisibleLayers([9999]);
                //this.getLayerById('NOS Hydrographic Surveys').setVisibleLayers([9999]); //Manually set all the sublayers to invisible for "NOS Hydro"
                this.getLayerById('NOS Hydro Non-Digital').setVisibleLayers([9999]);
            }
        });
    }
);

