define([
    'dojo/_base/declare', 
    'ngdc/layers/AbstractLayerCollection', 
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISImageServiceLayer',
    'esri/layers/WebTiledLayer',
    'esri/layers/ImageServiceParameters', 
    'esri/layers/RasterFunction',
    'esri/geometry/Extent',
    'esri/SpatialReference',
    'esri/geometry/webMercatorUtils',
    'ngdc/layers/TiledWMSLayer'
    ],
    function(
        declare, 
        AbstractLayerCollection, 
        ArcGISTiledMapServiceLayer, 
        ArcGISDynamicMapServiceLayer,
        ArcGISImageServiceLayer,
        WebTiledLayer,
        ImageServiceParameters,
        RasterFunction,
        Extent,
        SpatialReference,
        webMercatorUtils,
        TiledWMSLayer
        ){

        return declare([AbstractLayerCollection], {
            constructor: function() {
                this.name = 'app.web_mercator.LayerCollection';

                this.defineMapServices();

                this.setLayerTimeouts();

                this.definePairedMapServices();

                this.setSubLayerVisibility(); //When using PairedMapServiceLayers, need to do this later in MapConfig.MapReady()
            },

            defineMapServices: function() {

                var exBathyImageServiceParams = new ImageServiceParameters();
                exBathyImageServiceParams.format = 'jpgpng';
                exBathyImageServiceParams.compressionQuality = 90;
                exBathyImageServiceParams.interpolation = ImageServiceParameters.INTERPOLATION_BILINEAR;
                var rasterFunction = new RasterFunction();
                rasterFunction.functionName = "MultidirectionalHillshadeHaxby_8000-0";
                exBathyImageServiceParams.renderingRule = rasterFunction;

                //TODO check to ensure unique id
                this.mapServices = [
                    new ArcGISTiledMapServiceLayer('https://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer', {
                        id: 'NatGeo',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/GEBCO_2019_basemap_ncei/MapServer', {
                        id: 'GEBCO_2019 (NCEI)',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/GEBCO_2019_grayscale_basemap_ncei/MapServer', {
                        id: 'GEBCO_2019 Grayscale (NCEI)',
                        visible: true
                    }),
                    new ArcGISTiledMapServiceLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer', {
                        id: 'Light Gray',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer', {
                        id: 'Dark Gray',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer', {
                        id: 'World Imagery',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('https://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer', {
                        id: 'NatGeo Basemap',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer', {
                        id: 'Ocean Base',
                        visible: false
                    }),
                    new TiledWMSLayer('https://www.gmrt.org/services/mapserv/wms_merc?', {
                        id: 'GMRT Unmasked',
                        visible: false,
                        format: 'jpeg',
                        wmsVersion: '1.1.1',
                        epsgCode: '3857',
                        layerNames: ['GMRT']
                    }), 
                    new TiledWMSLayer('https://www.gmrt.org/services/mapserv/wms_merc_mask?', {
                        id: 'GMRT',
                        visible: false,
                        format: 'jpeg',
                        wmsVersion: '1.1.1',
                        epsgCode: '3857',
                        layerNames: ['GMRTMask']
                    }), 

                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/bathy_gap_analysis/MapServer', {
                        id: 'Bathy Gap Analysis',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),

                    new TiledWMSLayer('https://marine.ga.gov.au/geoserver/marine/wms?', {
                        id: 'AusSeabed 50m Multibeam 2018',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '3857',
                        layerNames: ['marine:50m_multibeam_2018']
                    }), 
                    new TiledWMSLayer('https://marine.ga.gov.au/geoserver/marine/wms?', {
                        id: 'AusSeabed MH370 Phase 1 Data 150m',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '3857',
                        layerNames: ['marine:bathymetry_150m_3857']
                    }), 

                    new TiledWMSLayer('https://services.data.shom.fr/INSPIRE/wms/r?', {
                        id: 'France Grids 1',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '3857',
                        layerNames: ['MNT_REU100m_HOMONIM_PBMA_PYR_PNG_3857_WMSR'],
                        additionalParams: {
                            styles: ''
                        },
                        fullExtent: webMercatorUtils.geographicToWebMercator(new Extent(54.5, -22, 56.5, -20.25, new SpatialReference({wkid:4326})))
                    }), 
                    new TiledWMSLayer('https://services.data.shom.fr/INSPIRE/wms/r?', {
                        id: 'France Grids 2',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '3857',
                        layerNames: ['MNT_MAY100m_HOMONIM_PBMA_PYR_PNG_3857_WMSR'],
                        additionalParams: {
                            styles: ''
                        },
                        fullExtent: webMercatorUtils.geographicToWebMercator(new Extent(44.5, -13.5, 45.75, -12.25, new SpatialReference({wkid:4326})))
                    }), 
                    new TiledWMSLayer('https://services.data.shom.fr/INSPIRE/wms/r?', {
                        id: 'France Grids 3',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '3857',
                        layerNames: ['MNT_GUY100m_HOMONIM_PBMA_3857_WMSR'],
                        additionalParams: {
                            styles: ''
                        },
                        fullExtent: webMercatorUtils.geographicToWebMercator(new Extent(-54.75, 3.25, -49.75, 8, new SpatialReference({wkid:4326})))
                    }), 
                    new TiledWMSLayer('https://services.data.shom.fr/INSPIRE/wms/r?', {
                        id: 'France Grids 4',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '3857',
                        layerNames: ['MNT_FACADE_CLIPPERTON_3857_WMSR'],
                        additionalParams: {
                            styles: ''
                        },
                        fullExtent: webMercatorUtils.geographicToWebMercator(new Extent(-109.819, 9.7805, -108.681, 10.6795, new SpatialReference({wkid:4326})))
                    }), 
                    new TiledWMSLayer('https://services.data.shom.fr/INSPIRE/wms/r?', {
                        id: 'France Grids 5',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '3857',
                        layerNames: ['MNT_COTIER_CLIPPERTON_3857_WMSR'],
                        additionalParams: {
                            styles: ''
                        },
                        fullExtent: webMercatorUtils.geographicToWebMercator(new Extent(-109.35, 10.2, -109.124, 10.4385, new SpatialReference({wkid:4326})))
                    }), 
                    new TiledWMSLayer('https://services.data.shom.fr/INSPIRE/wms/r?', {
                        id: 'France Grids 6',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '3857',
                        layerNames: ['MNT_ANTS100m_HOMONIM_4326_WMSR'],
                        additionalParams: {
                            styles: ''
                        },
                        fullExtent: webMercatorUtils.geographicToWebMercator(new Extent(-62.3, 14.1, -60.3, 16.9, new SpatialReference({wkid:4326})))
                    }), 
                    new TiledWMSLayer('https://services.data.shom.fr/INSPIRE/wms/r?', {
                        id: 'France Grids 7',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '3857',
                        layerNames: ['MNT_ANTN100m_HOMONIM_PBMA_4326_WMSR'],
                        additionalParams: {
                            styles: ''
                        },
                        fullExtent: webMercatorUtils.geographicToWebMercator(new Extent(-63.5, 17.6, -62.5, 18.5, new SpatialReference({wkid:4326})))
                    }), 

                    new TiledWMSLayer('https://inspire.caris.nl/server/services/ows/view/map/Caribbean_inspire?', {
                        id: 'Netherlands Caribbean Grids',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '3857',
                        layerNames: ['Bathy_CAR_2017_raster.EL.GridCoverage'],
                        additionalParams: {
                            styles: ''
                        },
                        fullExtent: webMercatorUtils.geographicToWebMercator(new Extent(-70.4184971, 11.663932899999999, -62.823577, 18.055868099999998, new SpatialReference({wkid:4326})))
                    }), 

                    new ArcGISDynamicMapServiceLayer('https://geoportal.gc.ca/arcgis/rest/services/Bathymetry_500m_ENG/MapServer', {
                        id: 'Canada 500m Bathymetry',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),

                    new TiledWMSLayer('https://ows.emodnet-bathymetry.eu/wms?', {
                        id: 'EMODnet DTM',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        layerNames: ['mean_atlas_land'],
                        fullExtent: webMercatorUtils.geographicToWebMercator(new Extent(-36, 15, 43, 90, new SpatialReference({wkid:4326})))
                    }),
                    new TiledWMSLayer('https://wms.geonorge.no/skwms1/wms.havbunnraster2?', {
                        id: 'MAREANO Multibeam Shaded Relief',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        layerNames: ['Havbunnraster']
                    }),

                    new ArcGISDynamicMapServiceLayer('https://geoappext.nrcan.gc.ca/arcgis/rest/services/GSCA/multibeam_east_e/MapServer', {
                        id: 'NRCan Multibeam East',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://geoappext.nrcan.gc.ca/arcgis/rest/services/GSCA/multibeam_west_e/MapServer', {
                        id: 'NRCan Multibeam West',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://geoappext.nrcan.gc.ca/arcgis/rest/services/GSCA/multibeam_north_e/MapServer', {
                        id: 'NRCan Multibeam North',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),

                    new ArcGISDynamicMapServiceLayer('https://gisp.dfo-mpo.gc.ca/arcgis/rest/services/FGP/CHS_NONNA_100/MapServer', {
                        id: 'CHS 100m Bathymetry',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),                    

                    new ArcGISTiledMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/multibeam_mosaic_hillshade/ImageServer', {
                        id: 'Multibeam Mosaic',
                        visible: false
                    }),  
                    
                    new ArcGISImageServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/OceanExploration/okeanos_explorer_grids/ImageServer', {
                        id: 'Okeanos Explorer Mosaic',
                        imageServiceParameters: exBathyImageServiceParams,
                        visible: false
                    }),

                    // new ArcGISDynamicMapServiceLayer('https://maps.ccom.unh.edu/server/rest/services/Seabed2030/GMRT_Global/MapServer', {
                    //     id: 'GMRT_Global',
                    //     visible: true,
                    //     imageParameters: this.imageParameters.png32
                    // }),  
                    
                    new ArcGISTiledMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/bag_hillshades/ImageServer', {
                        id: 'BAG Hillshades (tiled)',
                        visible: false
                    }),
                    new ArcGISImageServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/bag_hillshades_subsets/ImageServer', {
                        id: 'BAG Hillshades (dynamic)',
                        imageServiceParameters: this.imageServiceParameters,
                        visible: false
                    }),

                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/GEBCO_2019_SID/MapServer', {
                        id: 'GEBCO_2019 SID',
                        visible: false,
                        opacity: 0.5,
                        //minScale: 5000000,
                        imageParameters: this.imageParameters.png32
                    }),

                    new ArcGISTiledMapServiceLayer('https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/web_mercator_gebco_2019_contours/MapServer', {
                        id: 'GEBCO_2019 Contours',
                        visible: false,
                        opacity: 0.5
                    }),
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_bathymetry_density/MapServer', {
                        id: 'Trackline Bathymetry Density',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new WebTiledLayer('https://tileservice.charts.noaa.gov/tiles/50000_1/{level}/{col}/{row}.png', {
                        id: 'RNC',
                        visible: false,
                        opacity: 0.5
                    }),
                    new TiledWMSLayer('https://marine.ga.gov.au/geoserver/marine/wms?', {
                        id: 'AusSeabed Bathymetry Holdings',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '3857',
                        layerNames: ['marine:ausseabed_bathymetry']
                    }), 
                    new ArcGISTiledMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro/MapServer', {
                        id: 'NOS Hydrographic Surveys (tiled)',
                        visible: false
                    }),
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer', {
                        id: 'NOS Hydrographic Surveys (dynamic)',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),

                    new TiledWMSLayer('https://wms.geonorge.no/skwms1/wms.dekning_sjomaaling?', {
                        id: 'MAREANO Multibeam',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        layerNames: ['Flerstraale']
                    }),
                    new TiledWMSLayer('https://wms.geonorge.no/skwms1/wms.dekning_sjomaaling?', {
                        id: 'MAREANO Single-Beam',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        layerNames: ['Enkeltstraale']
                    }),

                    new ArcGISDynamicMapServiceLayer('https://geoappext.nrcan.gc.ca/arcgis/rest/services/GSCA/multibeam_multifaisceaux_index/MapServer', {
                        id: 'NRCan Multibeam',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),

                    new TiledWMSLayer('https://geo-service.maris.nl/emodnet_bathymetry/wms?', {
                        id: 'EMODnet Singlebeam Polygons',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        layerNames: ['single_beams_polygons'],
                        opacity: 0.5
                        // additionalParams: {
                        //     styles: 'seadatanet_selected'
                        // },
                    }),
                    new TiledWMSLayer('https://geo-service.maris.nl/emodnet_bathymetry/wms?', {
                        id: 'EMODnet Multibeam Polygons',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        layerNames: ['multi_beams_polygons'],
                        opacity: 0.5,
                        additionalParams: {
                            styles: 'seadatanet_selected'
                        }
                    }),
                    new TiledWMSLayer('https://geo-service.maris.nl/emodnet_bathymetry/wms?', {
                        id: 'EMODnet Singlebeam Lines',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        layerNames: ['single_beams_tracks']
                        // additionalParams: {
                        //     styles: 'seadatanet_selected'
                        // }
                    }),
                    new TiledWMSLayer('https://geo-service.maris.nl/emodnet_bathymetry/wms?', {
                        id: 'EMODnet Multibeam Lines',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        layerNames: ['multi_beams_tracks'],
                        additionalParams: {
                            styles: 'seadatanet_selected'
                        }
                    }),   
                    new ArcGISTiledMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_bathymetry/MapServer', {
                        id: 'Trackline Bathymetry (tiled)',
                        visible: false
                    }),
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_combined_dynamic/MapServer', {
                        id: 'Trackline Combined (dynamic)',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISTiledMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam/MapServer', {
                        id: 'Multibeam (tiled)',
                        visible: false
                    }),
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer', {
                        id: 'Multibeam (dynamic)',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),  

                    new ArcGISTiledMapServiceLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer', {
                        id: 'World Boundaries and Places',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer', {
                        id: 'Light Gray Reference',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer', {
                        id: 'Dark Gray Reference',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Reference/MapServer', {
                        id: 'Ocean Reference',
                        visible: true
                    }),

                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/undersea_features/MapServer', {
                        id: 'Undersea Features',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),

                    //CSB should be on top of boundaries
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/csb/MapServer', {
                        id: 'CSB',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),  
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/graticule/MapServer', {
                        id: 'Graticule',
                        visible: false,
                        opacity: 0.7,
                        imageParameters: this.imageParameters.png32
                    }),                    
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/poles_mask/MapServer', {
                        id: 'Poles Mask',
                        visible: true,
                        imageParameters: this.imageParameters.png32
                    })
                ];
            },  //end defineMapServices

            definePairedMapServices: function() {
                this.pairedMapServices = [
                    {
                        id: 'Multibeam',
                        tiledService: this.getLayerById('Multibeam (tiled)'),
                        dynamicService: this.getLayerById('Multibeam (dynamic)'),
                        visible: true,
                        cutoffZoom: 9
                    },
                    {
                        id: 'Trackline Bathymetry',
                        tiledService: this.getLayerById('Trackline Bathymetry (tiled)'),
                        dynamicService: this.getLayerById('Trackline Combined (dynamic)'),
                        visible: false,
                        cutoffZoom: 9,
                        defaultVisibleLayers: [1]
                    },
                    {
                        id: 'NOS Hydrographic Surveys',
                        tiledService: this.getLayerById('NOS Hydrographic Surveys (tiled)'),
                        dynamicService: this.getLayerById('NOS Hydrographic Surveys (dynamic)'),
                        visible: this.nosHydroVisible,
                        cutoffZoom: 9,
                        defaultVisibleLayers: [0, 1]
                    },
                    {
                        id: 'BAG Hillshades',
                        tiledService: this.getLayerById('BAG Hillshades (tiled)'),
                        dynamicService: this.getLayerById('BAG Hillshades (dynamic)'),
                        visible: false,
                        cutoffZoom: 16
                    }                  
                ];
            },

            setSubLayerVisibility: function() {
                var visibleLayers = [];
                for (var i = 0; i < 450; i++) {
                    visibleLayers.push(i);
                }

                //NRCan multibeam hillshade services are composed of many sublayers, toggle them all to be visible by default.
                //Only show at scales greater than 1:4,000,000 (zoom level 8)
                this.getLayerById('NRCan Multibeam East').setVisibleLayers(visibleLayers);
                this.getLayerById('NRCan Multibeam East').setScaleRange(4000000, 0);
                this.getLayerById('NRCan Multibeam West').setVisibleLayers(visibleLayers);
                this.getLayerById('NRCan Multibeam West').setScaleRange(4000000, 0);
                this.getLayerById('NRCan Multibeam North').setVisibleLayers(visibleLayers);
                this.getLayerById('NRCan Multibeam North').setScaleRange(4000000, 0);
            }
        });
    }
);

