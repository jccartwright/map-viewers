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
                    new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer", {
                        id: "Ocean Base",
                        visible: true,
                    }),                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/water_column_sonar/MapServer", {
                        id: "Water Column Sonar",
                        visible: true,
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
                    new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Reference/MapServer", {
                        id: "Ocean Reference",
                        visible: true,
                    }),
                    new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/graticule/MapServer", {
                        id: "Graticule",
                        visible: false,
                        opacity: 0.7,
                        imageParameters: this.imageParameters.png32
                    })
                ];
            },  //end defineMapServices

            buildPairedMapServices: function() {
                logger.debug('creating pairedMapServices...');
            },

            setSubLayerVisibility: function() {
                //logger.debug('setting subLayer visibility...');
                this.getLayerById('Water Column Sonar').setVisibleLayers([0,1,2,3]);
            }
        });
    }
);


