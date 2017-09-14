define([
    'dojo/_base/declare', 
    'ngdc/layers/AbstractLayerCollection', 
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISImageServiceLayer',
    'esri/layers/WMSLayer',
    'esri/layers/WMSLayerInfo',
    'esri/geometry/Extent',
    'app/RegionalClimatologyWMSLayer',
    'app/NARRWMSLayer',
    'app/AVHRRWMSLayer',
    'app/SeaIceIndexWMSLayer'
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
        RegionalClimatologyWMSLayer,
        NARRWMSLayer,
        AVHRRWMSLayer,
        SeaIceIndexWMSLayer
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
                    new ArcGISImageServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/multibeam_mosaic_hillshade/ImageServer', {
                        id: 'Multibeam Mosaic',
                        visible: false,
                        imageServiceParameters: this.imageServiceParameters
                    }),

                    new RegionalClimatologyWMSLayer('https://data.nodc.noaa.gov/thredds/wms/nodc/archive/data/0115771/DATA/temperature/netcdf/0.25/t', {
                        id: 'Sea Water Temperature',
                        format: 'png',
                        resourceInfo: wmsResourceInfo,
                        timeString: '00',
                        datasetSuffix: '_04.nc',
                        version: '1.3.0',
                        visibleLayers: ['t_an'],
                        styles: 'boxfill/rainbow',
                        elevation: 0,
                        colorScaleRange: '-3,11',
                        numColorBands: 25,
                        logScale: false,
                        visible: false
                    }),

                    new RegionalClimatologyWMSLayer('https://data.nodc.noaa.gov/thredds/wms/nodc/archive/data/0115771/DATA/salinity/netcdf/0.25/s', {
                        id: 'Salinity',
                        format: 'png',
                        resourceInfo: wmsResourceInfo,
                        timeString: '00',
                        datasetSuffix: '_04.nc',
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

                    //https://www.ncei.noaa.gov/thredds/wms/avhrr-polar-pathfinder-ext-files/nhem/2016/Polar-APP-X_v01r01_Nhem_1400_d20160731_c20160822.nc
                    new AVHRRWMSLayer('https://www.ngdc.noaa.gov/thredds/wms/arctic/Polar-APP-X_v01r01_Nhem_1400_d20160731_c20160822.nc', {
                        id: 'AVHRR surface_albedo',                        
                        format: 'png',
                        resourceInfo: wmsResourceInfo,
                        version: '1.3.0',
                        visibleLayers: ['cdr_surface_albedo'],
                        styles: 'boxfill/rainbow',
                        colorScaleRange: '0,1',
                        numColorBands: 25,
                        logScale: false,
                        visible: false
                    }),
                    new AVHRRWMSLayer('https://www.ngdc.noaa.gov/thredds/wms/arctic/Polar-APP-X_v01r01_Nhem_1400_d20160731_c20160822.nc', {
                        id: 'AVHRR sea_ice_thickness',                        
                        format: 'png',
                        resourceInfo: wmsResourceInfo,
                        version: '1.3.0',
                        visibleLayers: ['cdr_sea_ice_thickness'],
                        styles: 'boxfill/rainbow',
                        colorScaleRange: '0,2',
                        numColorBands: 25,
                        logScale: false,
                        visible: false
                    }),
                    new AVHRRWMSLayer('https://www.ngdc.noaa.gov/thredds/wms/arctic/Polar-APP-X_v01r01_Nhem_1400_d20160731_c20160822.nc', {
                        id: 'AVHRR cloud_binary_mask',                        
                        format: 'png',
                        resourceInfo: wmsResourceInfo,
                        version: '1.3.0',
                        visibleLayers: ['cdr_cloud_binary_mask'],
                        styles: 'boxfill/greyscale',
                        colorScaleRange: '0,1',
                        numColorBands: 25,
                        logScale: false,
                        visible: false
                    }),
                    new SeaIceIndexWMSLayer('https://nsidc.org/api/mapservices/NSIDC/ows', {
                        id: 'Sea Ice Index Daily Concentration',                        
                        format: 'png',
                        resourceInfo: wmsResourceInfo,
                        version: '1.3.0',
                        visibleLayers: ['g02135_concentration_raster_daily_n'],
                        visible: false
                    }),
                    new SeaIceIndexWMSLayer('https://nsidc.org/api/mapservices/NSIDC/ows', {
                        id: 'Sea Ice Index Monthly Concentration',                        
                        format: 'png',
                        resourceInfo: wmsResourceInfo,
                        version: '1.3.0',
                        visibleLayers: ['g02135_concentration_raster_monthly_n'],
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
                    new ArcGISImageServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/bag_hillshades/ImageServer', {
                        id: 'BAG Hillshades',
                        visible: false,
                        imageServiceParameters: this.imageServiceParameters
                    }),  
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer', {
                        id: 'NOS Hydrographic Surveys',
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
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/deep_sea_corals/MapServer', {
                        id: 'DSCRTP',
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

                this.getLayerById('Sea Ice Index Daily Concentration').epsgCode = 5041;
                this.getLayerById('Sea Ice Index Monthly Concentration').epsgCode = 5041;
            },  //end defineMapServices

            definePairedMapServices: function() {
               
            },

            setSubLayerVisibility: function() {
                //logger.debug('setting subLayer visibility...');
            }
        });
    }
);

