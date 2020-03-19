define([
    'dojo/_base/declare', 
    'ngdc/layers/AbstractLayerCollection', 
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISImageServiceLayer',
    'esri/layers/ImageServiceParameters', 
    'esri/layers/WMSLayer',
    'esri/layers/WMSLayerInfo',
    'esri/layers/RasterFunction',
    'esri/geometry/Extent'
    ],
    function(
        declare, 
        LayerCollection, 
        ArcGISTiledMapServiceLayer, 
        ArcGISDynamicMapServiceLayer,
        ArcGISImageServiceLayer,
        ImageServiceParameters,
        WMSLayer,
        WMSLayerInfo,
        RasterFunction,
        Extent
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
                var params = new ImageServiceParameters();
                params.format = 'jpgpng';
                params.compressionQuality = 90;
                params.interpolation = ImageServiceParameters.INTERPOLATION_BILINEAR;
                
                var rasterFunction = new RasterFunction();
                rasterFunction.functionName = "ColorHillshade";
                params.renderingRule = rasterFunction;

                //TODO check to ensure unique id
                this.mapServices = [
                    new ArcGISTiledMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/arctic_ps/arctic_basemap/MapServer', {
                        id: 'Arctic Basemap',
                        visible: true
                    }),
                    new WMSLayer('https://www.gmrt.org/services/mapserv/wms_NP_mask?', {
                        id: 'GMRT',
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

                    new ArcGISDynamicMapServiceLayer('https://geoportal.gc.ca/arcgis/rest/services/Bathymetry_500m_ENG/MapServer', {
                        id: 'Canada 500m Bathymetry',
                        visible: false
                    }),

                    new ArcGISImageServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/multibeam_mosaic/ImageServer', {
                        id: 'Multibeam Mosaic',
                        visible: false,
                        imageServiceParameters: params
                    }),
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_bathymetry_density/MapServer', {
                        id: 'Trackline Bathymetry Density',
                        visible: false,
                        imageParameters: this.imageParameters.png32
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
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),

                    // new WMSLayer('https://gis.ngdc.noaa.gov/https-proxy/proxy?http://wms.geonorge.no/skwms1/wms.dekning_sjomaaling?', {
                    //     id: 'MAREANO Multibeam',
                    //     format: 'png',
                    //     resourceInfo: {
                    //         description: 'Flerstraale',
                    //         extent: new Extent(-180, -90, 180, 90, {wkid: 4326}),
                    //         getMapURL: 'https://gis.ngdc.noaa.gov/https-proxy/proxy?http://wms.geonorge.no/skwms1/wms.dekning_sjomaaling?',
                    //         layerInfos: [
                    //             new WMSLayerInfo({
                    //                 name: 'Flerstraale',
                    //                 title: 'Flerstraale',
                    //                 queryable: true,
                    //                 showPopup: true
                    //             })
                    //         ],
                    //         spatialReferences: [3995],
                    //         version: '1.3.0'
                    //     },
                    //     version: '1.3.0',
                    //     visibleLayers: ['Flerstraale'],
                    //     visible: false
                    // }),


                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_combined_dynamic/MapServer', {
                        id: 'Trackline Bathymetry',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),                    
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer', {
                        id: 'Multibeam',
                        visible: true,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://geoappext.nrcan.gc.ca/arcgis/rest/services/GSCA/multibeam_multifaisceaux_index/MapServer', {
                        id: 'NRCan Multibeam',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/csb/MapServer', {
                        id: 'CSB',
                        visible: false,
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

