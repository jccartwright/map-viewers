define([
    'dojo/_base/declare', 
    'ngdc/layers/AbstractLayerCollection', 
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISImageServiceLayer'
    ],
    function(
        declare, 
        LayerCollection, 
        ArcGISTiledMapServiceLayer, 
        ArcGISDynamicMapServiceLayer,
        ArcGISImageServiceLayer
        ){

        return declare([LayerCollection], {
            constructor: function(options) {
                this.name = 'app/arctic/LayerCollection';

                // this.multibeamVisible = false;
                // this.nosHydroVisible = false;
                // this.tracklineVisible = false;
                // this.demVisible = false;

                // if (options && options.multibeamVisible) {
                //     this.multibeamVisible = options.multibeamVisible;
                // }
                // if (options && options.nosHydroVisible) {
                //     this.nosHydroVisible = options.nosHydroVisible;
                // }
                // if (options && options.tracklineVisible) {
                //     this.tracklineVisible = options.tracklineVisible;
                // }
                // if (options && options.demVisible) {
                //     this.demVisible = options.demVisible;
                // }

                this.defineMapServices();

                this.setLayerTimeouts();

                this.definePairedMapServices();

                this.setSubLayerVisibility();
            },

            defineMapServices: function() {
                //TODO check to ensure unique id
                this.mapServices = [
                    new ArcGISTiledMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/arctic_ps/arctic_basemap/MapServer', {
                        id: 'Arctic Basemap',
                        visible: true
                    }),                 
                    new ArcGISImageServiceLayer('//gis.ngdc.noaa.gov/arcgis/rest/services/DEM_global_mosaic_hillshade/ImageServer', {
                        id: 'DEM Hillshades',
                        visible: false,
                        imageServiceParameters: this.imageServiceParameters
                    }),                                 
                    new ArcGISTiledMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/arctic_ps/ibcao_contours/MapServer', {
                        id: 'IBCAO Contours',
                        visible: false,
                        opacity: 0.5
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/marine_geology_dynamic/MapServer', {
                        id: 'Marine Geology',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISTiledMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/arctic_ps/sample_index/MapServer', {
                        id: 'Sample Index (tiled)',
                        visible: false
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/sample_index_dynamic/MapServer', {
                        id: 'Sample Index (dynamic)',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer', {
                        id: 'NOS Hydro (non-digital)',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer', {
                        id: 'NOS Hydrographic Surveys',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISImageServiceLayer('//gis.ngdc.noaa.gov/arcgis/rest/services/bag_hillshades/ImageServer', {
                        id: 'BAG Hillshades',
                        visible: false,
                        imageServiceParameters: this.imageServiceParameters
                    }),  
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer', {
                        id: 'NOS Hydro (BAGs)',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_combined_dynamic/MapServer', {
                        id: 'Trackline Combined',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),                    
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer', {
                        id: 'Multibeam',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),                    
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/arctic_ps/graticule/MapServer', {
                        id: 'Graticule',
                        visible: true,
                        opacity: 0.7,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/arctic_ps/reference/MapServer', {
                        id: 'Reference',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/dem_extents/MapServer', {
                        id: 'DEM Extents',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/undersea_features/MapServer', {
                        id: 'Undersea Features',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/historical_declination/MapServer', {
                        id: 'Magnetic Declination',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/arctic_ps/clipping_donut/MapServer', {
                        id: 'Clipping Donut',
                        visible: true,
                        imageParameters: this.imageParameters.png32
                    })
                ];
            },  //end defineMapServices

            definePairedMapServices: function() {
                //logger.debug('creating pairedMapServices...');
                this.pairedMapServices = [
                    {
                        id: 'Sample Index',
                        tiledService: this.getLayerById('Sample Index (tiled)'),
                        dynamicService: this.getLayerById('Sample Index (dynamic)'),
                        visible: false,
                        cutoffZoom: 8
                    }                                    
                ];
            },

            setSubLayerVisibility: function() {
                //logger.debug('setting subLayer visibility...');
            }
        });
    }
);

