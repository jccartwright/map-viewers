define([
    'dojo/_base/declare', 
    'ngdc/layers/AbstractLayerCollection', 
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/ArcGISDynamicMapServiceLayer'
    ],
    function(
        declare, 
        AbstractLayerCollection, 
        ArcGISTiledMapServiceLayer, 
        ArcGISDynamicMapServiceLayer
        ){

        return declare([AbstractLayerCollection], {
            constructor: function(options) {
                this.name = 'app.web_mercator.LayerCollection';

                this.datasetsReportsVisible = false;
                this.sampleIndexVisible = false;
                this.nosSeabedVisible = false;

                if (options && options.datasetsReportsVisible) {
                    this.datasetsReportsVisible = options.datasetsReportsVisible;
                }
                if (options && options.sampleIndexVisible) {
                    this.sampleIndexVisible = options.sampleIndexVisible;
                }
                if (options && options.nosSeabedVisible) {
                    this.nosSeabedVisible = options.nosSeabedVisible;
                }

                this.defineMapServices();

                this.setLayerTimeouts();

                this.definePairedMapServices();

                //this.setSubLayerVisibility(); //When using PairedMapServiceLayers, need to do this later in MapConfig.MapReady()
            },

            defineMapServices: function() {
                //TODO check to ensure unique id
                this.mapServices = [
                    new ArcGISTiledMapServiceLayer('http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer', {
                        id: 'NatGeo',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/gebco08_hillshade/MapServer', {
                        id: 'GEBCO_08',
                        visible: false
                    }),                    
                    new ArcGISTiledMapServiceLayer('http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/etopo1_hillshade/MapServer', {
                        id: 'ETOPO1',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer', {
                        id: 'Light Gray',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer', {
                        id: 'Dark Gray',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer', {
                        id: 'World Imagery',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer', {
                        id: 'NatGeo Basemap',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('http://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer', {
                        id: 'Ocean Base',
                        visible: true,
                    }),
                    new ArcGISTiledMapServiceLayer('http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/marine_geology/MapServer', {
                        id: 'Datasets/Reports (tiled)',
                        visible: this.datasetsReportsVisible
                    }),
                    new ArcGISDynamicMapServiceLayer('http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/marine_geology_dynamic/MapServer', {
                        id: 'Datasets/Reports (dynamic)',
                        visible: this.datasetsReportsVisible,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISTiledMapServiceLayer('http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/sample_index/MapServer', {
                        id: 'Sample Index (tiled)',
                        visible: this.sampleIndexVisible
                    }),
                    new ArcGISDynamicMapServiceLayer('http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/sample_index_dynamic/MapServer', {
                        id: 'Sample Index (dynamic)',
                        visible: this.sampleIndexVisible,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISTiledMapServiceLayer('http://mapdevel.ngdc.noaa.gov:6080/arcgis/rest/services/web_mercator/nos_seabed/MapServer', {
                        id: 'NOS Seabed (tiled)',
                        visible: this.nosSeabedVisible
                    }),
                    new ArcGISDynamicMapServiceLayer('http://mapdevel.ngdc.noaa.gov:6080/arcgis/rest/services/web_mercator/nos_seabed_dynamic/MapServer', {
                        id: 'NOS Seabed (dynamic)',
                        visible: this.nosSeabedVisible,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISTiledMapServiceLayer('http://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer', {
                        id: 'World Boundaries and Places',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer', {
                        id: 'Light Gray Reference',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer', {
                        id: 'Dark Gray Reference',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('http://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Reference/MapServer', {
                        id: 'Ocean Reference',
                        visible: true,
                    }),
                    new ArcGISDynamicMapServiceLayer('http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/graticule/MapServer', {
                        id: 'Graticule',
                        visible: false,
                        opacity: 0.7,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/poles_mask/MapServer', {
                        id: 'Poles Mask',
                        visible: true,
                        imageParameters: this.imageParameters.png32
                    })
                ];
            },  //end defineMapServices

            definePairedMapServices: function() {
                this.pairedMapServices = [
                    {
                        id: 'Datasets/Reports',
                        tiledService: this.getLayerById('Datasets/Reports (tiled)'),
                        dynamicService: this.getLayerById('Datasets/Reports (dynamic)'),
                        visible: this.multibeamVisible,
                        cutoffZoom: 10
                    },
                    {
                        id: 'Sample Index',
                        tiledService: this.getLayerById('Sample Index (tiled)'),
                        dynamicService: this.getLayerById('Sample Index (dynamic)'),
                        visible: this.sampleIndexVisible,
                        cutoffZoom: 8
                     },
                     {
                         id: 'NOS Seabed',
                         tiledService: this.getLayerById('NOS Seabed (tiled)'),
                         dynamicService: this.getLayerById('NOS Seabed (dynamic)'),
                         visible: this.nosSeabedVisible,
                         cutoffZoom: 10
                     }                     
                ];
            },

            setSubLayerVisibility: function() {

            }
        });
    }
);

