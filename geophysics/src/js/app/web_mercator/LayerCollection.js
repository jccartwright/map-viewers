define([
    'dojo/_base/declare', 
    'ngdc/layers/AbstractLayerCollection', 
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISImageServiceLayer'
    ],
    function(
        declare, 
        AbstractLayerCollection, 
        ArcGISTiledMapServiceLayer, 
        ArcGISDynamicMapServiceLayer,
        ArcGISImageServiceLayer
        ){

        return declare([AbstractLayerCollection], {
            constructor: function(options) {
                this.name = 'app.web_mercator.LayerCollection';

                this.defineMapServices();

                this.setLayerTimeouts();

                this.definePairedMapServices();

                //this.setSubLayerVisibility(); //When using PairedMapServiceLayers, need to do this later in MapConfig.MapReady()
            },

            defineMapServices: function() {
                //TODO check to ensure unique id
                this.mapServices = [
                    new ArcGISTiledMapServiceLayer('//services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer', {
                        id: 'NatGeo',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/gebco_2014_hillshade/MapServer', {
                        id: 'GEBCO_2014',
                        visible: false
                    }),                    
                    new ArcGISTiledMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/etopo1_hillshade/MapServer', {
                        id: 'ETOPO1',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('//services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer', {
                        id: 'Light Gray',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('//services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer', {
                        id: 'Dark Gray',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('//services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer', {
                        id: 'World Imagery',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('//services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer', {
                        id: 'NatGeo Basemap',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('//services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer', {
                        id: 'Ocean Base',
                        visible: true,
                    }),
                 
                    new ArcGISTiledMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/gebco_2014_contours/MapServer', {
                        id: 'GEBCO_2014 Contours',
                        visible: false,
                        opacity: 0.5
                    }),

                    new ArcGISTiledMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_all_parameters/MapServer', {
                        id: 'All Parameters (tiled)',
                        visible: false
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_combined_dynamic/MapServer', {
                        id: 'All Parameters (dynamic)',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),                 

                    new ArcGISTiledMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_bathymetry/MapServer', {
                        id: 'Bathymetry (tiled)',
                        visible: false
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_combined_dynamic/MapServer', {
                        id: 'Bathymetry (dynamic)',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),

                    new ArcGISTiledMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_gravity/MapServer', {
                        id: 'Gravity (tiled)',
                        visible: false
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_combined_dynamic/MapServer', {
                        id: 'Gravity (dynamic)',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),

                    new ArcGISTiledMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_magnetics/MapServer', {
                        id: 'Magnetics (tiled)',
                        visible: false
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_combined_dynamic/MapServer', {
                        id: 'Magnetics (dynamic)',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),

                    new ArcGISTiledMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_single_channel_seismics/MapServer', {
                        id: 'Single-Channel Seismics (tiled)',
                        visible: false
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_combined_dynamic/MapServer', {
                        id: 'Single-Channel Seismics (dynamic)',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),

                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_combined_dynamic/MapServer', {
                        id: 'Trackline Combined',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                  
                    new ArcGISTiledMapServiceLayer('//services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer', {
                        id: 'World Boundaries and Places',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('//services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer', {
                        id: 'Light Gray Reference',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('//services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer', {
                        id: 'Dark Gray Reference',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('//services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Reference/MapServer', {
                        id: 'Ocean Reference',
                        visible: true,
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/graticule/MapServer', {
                        id: 'Graticule',
                        visible: false,
                        opacity: 0.7,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/poles_mask/MapServer', {
                        id: 'Poles Mask',
                        visible: true,
                        imageParameters: this.imageParameters.png32
                    })
                ];

                this.tracklineLayerIds = [
                    'All Parameters', 
                    'Bathymetry', 
                    'Gravity', 
                    'Magnetics',                     
                    'Single-Channel Seismics', 
                    'Trackline Combined'
                ];
                
            },  //end defineMapServices

            definePairedMapServices: function() {
                this.pairedMapServices = [
                    {
                        id: 'All Parameters',
                        tiledService: this.getLayerById('All Parameters (tiled)'),
                        dynamicService: this.getLayerById('All Parameters (dynamic)'),
                        cutoffZoom: 9,
                        visible: true,
                        defaultVisibleLayers: [0]
                    },
                    {
                        id: 'Bathymetry',
                        tiledService: this.getLayerById('Bathymetry (tiled)'),
                        dynamicService: this.getLayerById('Bathymetry (dynamic)'),
                        cutoffZoom: 9,
                        visible: false,
                        defaultVisibleLayers: [1]
                     },
                     {
                        id: 'Gravity',
                        tiledService: this.getLayerById('Gravity (tiled)'),
                        dynamicService: this.getLayerById('Gravity (dynamic)'),
                        cutoffZoom: 9,
                        visible: false,
                        defaultVisibleLayers: [2]
                     },
                     {
                        id: 'Magnetics',
                        tiledService: this.getLayerById('Magnetics (tiled)'),
                        dynamicService: this.getLayerById('Magnetics (dynamic)'),
                        cutoffZoom: 9,
                        visible: false,
                        defaultVisibleLayers: [3]
                     },
                     {
                        id: 'Single-Channel Seismics',
                        tiledService: this.getLayerById('Single-Channel Seismics (tiled)'),
                        dynamicService: this.getLayerById('Single-Channel Seismics (dynamic)'),
                        cutoffZoom: 9,
                        visible: false,
                        defaultVisibleLayers: [8]
                     }
                ];
            },

            setSubLayerVisibility: function() {
            }
        });
    }
);

