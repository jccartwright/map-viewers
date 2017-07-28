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
                this.name = 'app/antarctic/LayerCollection';

                this.multibeamVisible = false;
                this.tracklineVisible = false;
                this.demVisible = false;

                if (options && options.multibeamVisible) {
                    this.multibeamVisible = options.multibeamVisible;
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
                    new ArcGISTiledMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/antarctic/antarctic_basemap/MapServer', {
                        id: 'Antarctic Basemap',
                        visible: true
                    }),
                    new WMSLayer('https://gis.ngdc.noaa.gov/https-proxy/proxy?http://www.marine-geo.org/services/wms_SP_mask?', {
                        id: 'GMRT Masked',
                        format: 'jpeg',
                        resourceInfo: {
                            description: 'South_Polar_Bathymetry',
                            extent: new Extent(-180, -90, 180, 90, {wkid: 4326}),
                            getMapURL: 'https://gis.ngdc.noaa.gov/https-proxy/proxy?http://www.marine-geo.org/services/wms_SP_mask?',
                            layerInfos: [
                                new WMSLayerInfo({
                                    name: 'South_Polar_Bathymetry',
                                    title: 'South_Polar_Bathymetry',
                                    queryable: true,
                                    showPopup: true
                                })
                            ],
                            spatialReferences: [3031],
                            version: '1.3.0'
                        },
                        version: '1.3.0',
                        visibleLayers: ['South_Polar_Bathymetry'],
                        visible: false
                    }),
                    new WMSLayer('https://gis.ngdc.noaa.gov/https-proxy/proxy?http://www.marine-geo.org/services/wms_SP?', {
                        id: 'GMRT Unmasked',
                        format: 'jpeg',
                        resourceInfo: {
                            description: 'South_Polar_Bathymetry',
                            extent: new Extent(-180, -90, 180, 90, {wkid: 4326}),
                            getMapURL: 'https://gis.ngdc.noaa.gov/https-proxy/proxy?http://www.marine-geo.org/services/wms_SP?',
                            layerInfos: [
                                new WMSLayerInfo({
                                    name: 'South_Polar_Bathymetry',
                                    title: 'South_Polar_Bathymetry',
                                    queryable: true,
                                    showPopup: true
                                })
                            ],
                            spatialReferences: [3031],
                            version: '1.3.0'
                        },
                        version: '1.3.0',
                        visibleLayers: ['South_Polar_Bathymetry'],
                        visible: false
                    }),  
                    new ArcGISImageServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/multibeam_mosaic_hillshade/ImageServer', {
                        id: 'Multibeam Mosaic',
                        visible: false,
                        imageServiceParameters: this.imageServiceParameters
                    }),
                    new ArcGISTiledMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/antarctic/ibcso_contours/MapServer', {
                        id: 'IBCSO Contours',
                        visible: false,
                        opacity: 0.5
                    }),
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_combined_dynamic/MapServer', {
                        id: 'Trackline Bathymetry',
                        visible: this.tracklineVisible,
                        imageParameters: this.imageParameters.png32
                    }),                    
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer', {
                        id: 'Multibeam',
                        visible: this.multibeamVisible,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/antarctic/graticule/MapServer', {
                        id: 'Graticule',
                        visible: true,
                        opacity: 0.7,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/antarctic/reference/MapServer', {
                        id: 'Reference',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),                    
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/dem_extents/MapServer', {
                        id: 'DEM Extents',
                        visible: this.demVisible,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/antarctic/clipping_donut/MapServer', {
                        id: 'Clipping Donut',
                        visible: true,
                        imageParameters: this.imageParameters.png32
                    })
                ];

            }, //end defineMapServices

            definePairedMapServices: function() {
                //logger.debug('creating pairedMapServices...');
            },

            setSubLayerVisibility: function() {
                //logger.debug('setting subLayer visibility...');
            }
        });
    }
);


