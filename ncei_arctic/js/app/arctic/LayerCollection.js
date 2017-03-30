define([
    'dojo/_base/declare', 
    'ngdc/layers/AbstractLayerCollection', 
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISImageServiceLayer',
    'esri/layers/WMSLayer',
    'esri/layers/WMSLayerInfo',
    'esri/geometry/Extent',
    'app/CustomWMSLayer',
    'app/NARRWMSLayer'
    ],
    function(
        declare, 
        LayerCollection, 
        ArcGISTiledMapServiceLayer, 
        ArcGISDynamicMapServiceLayer,
        ArcGISImageServiceLayer,
        WMSLayer,
        WMSLayerInfo,
        Extent,
        CustomWMSLayer,
        NARRWMSLayer
        ){

        return declare([LayerCollection], {
            constructor: function() {
                this.name = 'app/arctic/LayerCollection';

                this.defineMapServices();

                this.setLayerTimeouts();

                this.definePairedMapServices();

                this.setSubLayerVisibility();
            },

            defineMapServices: function() {

                var wmsResourceInfo = {
                    extent: new Extent(-180, -90, 180, 90, {wkid: 4326}),
                    layerInfos: [
                        new WMSLayerInfo({
                            name: 't_an',
                            queryable: false,
                            showPopup: false
                        })
                    ],
                    spatialReferences: [32661],
                    version: '1.3.0'
                };

                //TODO check to ensure unique id
                this.mapServices = [
                    new ArcGISTiledMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/ups_north/arctic_basemap/MapServer', {
                        id: 'Arctic Basemap',
                        visible: true
                    }),  
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/EMAG2/MapServer', {
                        id: 'EMAG2',
                        visible: false,
                        imageParameters: this.imageParameters.jpeg
                    }),               
                    new ArcGISImageServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_global_mosaic_hillshade/ImageServer', {
                        id: 'DEM Hillshades',
                        visible: false,
                        imageServiceParameters: this.imageServiceParameters
                    }),

                    new CustomWMSLayer('https://data.nodc.noaa.gov/thredds/wms/ncml/regclim/arctic_ncml/temperature', {
                        id: 'Sea Water Temperature',
                        datasetPrefix: 'temperature',
                        timeString: 'annual',
                        datasetSuffix: 'quarter.ncml',
                        format: 'png',
                        resourceInfo: wmsResourceInfo,
                        version: '1.3.0',
                        visibleLayers: ['t_an'],
                        styles: 'boxfill/rainbow',
                        elevation: 0,
                        colorScaleRange: '-3,11',
                        numColorBands: 25,
                        logScale: false,
                        visible: false
                    }),

                    new CustomWMSLayer('https://data.nodc.noaa.gov/thredds/wms/ncml/regclim/arctic_ncml/salinity', {
                        id: 'Salinity',
                        datasetPrefix: 'salinity',
                        timeString: 'annual',
                        datasetSuffix: 'quarter.ncml',
                        format: 'png',
                        resourceInfo: wmsResourceInfo,
                        version: '1.3.0',
                        visibleLayers: ['s_an'],
                        styles: 'boxfill/rainbow',
                        elevation: 0,
                        colorScaleRange: '0,40',
                        numColorBands: 25,
                        logScale: false,
                        visible: false
                    }),

                    new NARRWMSLayer('https://nomads.ncdc.noaa.gov/thredds/wms/narrmonthly', {
                        id: 'NARR-A Monthly',
                        year: '2014',
                        month: '08',
                        hour: '00',  //00, 03, 06, 09, 12, 15, 18, 21
                        format: 'png',
                        resourceInfo: wmsResourceInfo,
                        version: '1.3.0',
                        visibleLayers: ['Ground_Heat_Flux'],
                        styles: 'boxfill/rainbow',
                        colorScaleRange: '-5,50',
                        numColorBands: 25,
                        logScale: false,
                        visible: false
                    }),                    

                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/arctic_ps/ibcao_contours/MapServer', {
                        id: 'IBCAO Contours',
                        visible: false,
                        opacity: 0.5,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/marine_geology_dynamic/MapServer', {
                        id: 'Marine Geology',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),                   
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/sample_index_dynamic/MapServer', {
                        id: 'Sample Index',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer', {
                        id: 'NOS Hydro (non-digital)',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer', {
                        id: 'NOS Hydrographic Surveys',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISImageServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/bag_hillshades/ImageServer', {
                        id: 'BAG Hillshades',
                        visible: false,
                        imageServiceParameters: this.imageServiceParameters
                    }),  
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer', {
                        id: 'NOS Hydro (BAGs)',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_combined_dynamic/MapServer', {
                        id: 'Trackline Combined',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),                    
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer', {
                        id: 'Multibeam',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),  

                    new ArcGISDynamicMapServiceLayer('https://gis.ncdc.noaa.gov/arcgis/rest/services/cdo/crn/MapServer', {
                        id: 'CRN',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }), 
                    new ArcGISDynamicMapServiceLayer('https://gis.ncdc.noaa.gov/arcgis/rest/services/cdo/ghcnd/MapServer', {
                        id: 'GHCND',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }), 
                    new ArcGISDynamicMapServiceLayer('https://gis.ncdc.noaa.gov/arcgis/rest/services/cdo/gsom/MapServer', {
                        id: 'GSOM',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }), 
                    new ArcGISDynamicMapServiceLayer('https://gis.ncdc.noaa.gov/arcgis/rest/services/cdo/gsoy/MapServer', {
                        id: 'GSOY',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }), 
                    new ArcGISDynamicMapServiceLayer('https://gis.ncdc.noaa.gov/arcgis/rest/services/cdo/isd/MapServer', {
                        id: 'ISD',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),  
                    

                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/arctic_ps/graticule/MapServer', {
                        id: 'Graticule',
                        visible: true,
                        opacity: 0.7,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/arctic_ps/reference/MapServer', {
                        id: 'Reference',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/dem_extents/MapServer', {
                        id: 'DEM Extents',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/undersea_features/MapServer', {
                        id: 'Undersea Features',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/historical_declination/MapServer', {
                        id: 'Magnetic Declination',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/arctic_ps/clipping_donut/MapServer', {
                        id: 'Clipping Donut',
                        visible: true,
                        imageParameters: this.imageParameters.png32
                    })
                ];

                this.getLayerById('Undersea Features').objectIdFields = {
                    0: 'FEATURE_ID',
                    1: 'FEATURE_ID',
                    2: 'FEATURE_ID'
                };
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

