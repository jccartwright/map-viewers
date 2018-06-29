define([
    'dojo/_base/declare', 
    'ngdc/layers/AbstractLayerCollection', 
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISImageServiceLayer',
    'esri/layers/WMSLayer',
    'esri/layers/WMSLayerInfo',
    'esri/geometry/Extent'],
    function(
        declare, 
        LayerCollection, 
        ArcGISTiledMapServiceLayer, 
        ArcGISDynamicMapServiceLayer,
        ArcGISImageServiceLayer,
        WMSLayer,
        WMSLayerInfo,
        Extent
        ){

        return declare([LayerCollection], {
            constructor: function(options) {
                this.name = 'app/arctic/LayerCollection';

                this.multibeamVisible = false;
                this.nosHydroVisible = false;
                this.tracklineVisible = false;
                this.demVisible = false;

                if (options && options.multibeamVisible) {
                    this.multibeamVisible = options.multibeamVisible;
                }
                if (options && options.nosHydroVisible) {
                    this.nosHydroVisible = options.nosHydroVisible;
                }
                if (options && options.tracklineVisible) {
                    this.tracklineVisible = options.tracklineVisible;
                }
                if (options && options.demVisible) {
                    this.demVisible = options.demVisible;
                }

                this.defineMapServices();

                this.setLayerTimeouts();

                this.definePairedMapServices();

                this.setSubLayerVisibility();
            },

            defineMapServices: function() {

                //TODO check to ensure unique id
                this.mapServices = [
                    new ArcGISTiledMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/arctic_ps/arctic_basemap/MapServer', {
                        id: 'Arctic Basemap',
                        visible: true
                    }),
                    new WMSLayer('https://www.gmrt.org/services/mapserv/wms_NP_mask?', {
                        id: 'GMRT Masked',
                        format: 'jpeg',
                        resourceInfo: {
                            description: 'North_Polar_Bathymetry',
                            extent: new Extent(-180, -90, 180, 90, {wkid: 4326}),
                            getMapURL: 'https://www.gmrt.org/services/mapserv/wms_NP_mask?',
                            layerInfos: [
                                new WMSLayerInfo({
                                    name: 'North_Polar_Bathymetry',
                                    title: 'North_Polar_Bathymetry',
                                    queryable: true,
                                    showPopup: true
                                })
                            ],
                            spatialReferences: [3995],
                            version: '1.3.0'
                        },
                        version: '1.3.0',
                        visibleLayers: ['North_Polar_Bathymetry'],
                        visible: false
                    }),
                    new WMSLayer('https://www.gmrt.org/services/mapserv/wms_NP?', {
                        id: 'GMRT Unmasked',
                        format: 'jpeg',
                        resourceInfo: {
                            description: 'North_Polar_Bathymetry',
                            extent: new Extent(-180, -90, 180, 90, {wkid: 4326}),
                            getMapURL: 'https://www.gmrt.org/services/mapserv/wms_NP?',
                            layerInfos: [
                                new WMSLayerInfo({
                                    name: 'North_Polar_Bathymetry',
                                    title: 'North_Polar_Bathymetry',
                                    queryable: true,
                                    showPopup: true
                                })
                            ],
                            spatialReferences: [3995],
                            version: '1.3.0'
                        },
                        version: '1.3.0',
                        visibleLayers: ['North_Polar_Bathymetry'],
                        visible: false
                    }),             
                    new ArcGISImageServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_hillshade/ImageServer', {
                        id: 'DEM Hillshades',
                        visible: false,
                        imageServiceParameters: this.imageServiceParameters
                    }),
                    new ArcGISImageServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/multibeam_mosaic_hillshade/ImageServer', {
                        id: 'Multibeam Mosaic',
                        visible: false,
                        imageServiceParameters: this.imageServiceParameters
                    }),
                    new ArcGISTiledMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/arctic_ps/ibcao_contours/MapServer', {
                        id: 'IBCAO Contours',
                        visible: false,
                        opacity: 0.5
                    }),
                    new ArcGISImageServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/bag_hillshades/ImageServer', {
                        id: 'BAG Hillshades',
                        visible: false,
                        imageServiceParameters: this.imageServiceParameters
                    }),  
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer', {
                        id: 'NOS Hydrographic Surveys',
                        visible: this.nosHydroVisible,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer', {
                        id: 'BAG Footprints',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_combined_dynamic/MapServer', {
                        id: 'Trackline Bathymetry',
                        visible: this.tracklineVisible,
                        imageParameters: this.imageParameters.png32
                    }),                    
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer', {
                        id: 'Multibeam',
                        visible: this.multibeamVisible,
                        imageParameters: this.imageParameters.png32
                    }),                    
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/arctic_ps/graticule/MapServer', {
                        id: 'Graticule',
                        visible: true,
                        opacity: 0.7,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/arctic_ps/reference/MapServer', {
                        id: 'Reference',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/dem_extents/MapServer', {
                        id: 'DEM Extents',
                        visible: this.demVisible,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/arctic_ps/clipping_donut/MapServer', {
                        id: 'Clipping Donut',
                        visible: true,
                        imageParameters: this.imageParameters.png32
                    })
                ];
            },  //end defineMapServices

            definePairedMapServices: function() {
                //logger.debug('creating pairedMapServices...');
            },

            setSubLayerVisibility: function() {
                //logger.debug('setting subLayer visibility...');
            }
        });
    }
);

