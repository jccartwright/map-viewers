define([
    'dojo/_base/declare', 
    'ngdc/layers/AbstractLayerCollection', 
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISImageServiceLayer',
    'esri/layers/WebTiledLayer',
    'ngdc/layers/TiledWMSLayer'
    ],
    function(
        declare, 
        AbstractLayerCollection, 
        ArcGISTiledMapServiceLayer, 
        ArcGISDynamicMapServiceLayer,
        ArcGISImageServiceLayer,
        WebTiledLayer,
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

                //TODO check to ensure unique id
                this.mapServices = [
                    new ArcGISTiledMapServiceLayer('https://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer', {
                        id: 'NatGeo',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/GEBCO_2014_Global_Relief_Model_Color_Shaded_Relief/MapServer', {
                        id: 'GEBCO_2014 (NCEI)',
                        visible: true
                    }),                                
                    new TiledWMSLayer('https://www.gebco.net/data_and_products/gebco_web_services/web_map_service/mapserv?', {
                        id: 'GEBCO_2014',
                        visible: false,
                        format: 'jpeg',
                        wmsVersion: '1.3.0',
                        epsgCode: '3857',
                        layerNames: ['GEBCO_LATEST']
                    }), 
                    new ArcGISTiledMapServiceLayer('https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/ETOPO1_Global_Relief_Model_Color_Shaded_Relief/MapServer', {
                        id: 'ETOPO1',
                        visible: false
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
                        layerNames: ['mean_atlas_land']
                    }),

                    new TiledWMSLayer('http://wms.geonorge.no/skwms1/wms.havbunnraster2?', {
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

                    new ArcGISTiledMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/multibeam_mosaic_hillshade/ImageServer', {
                        id: 'Multibeam Mosaic',
                        visible: false
                    }),  

                    new ArcGISTiledMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/bag_hillshades/ImageServer', {
                        id: 'BAG Hillshades (tiled)',
                        visible: false
                    }),
                    new ArcGISImageServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/bag_hillshades_subsets/ImageServer', {
                        id: 'BAG Hillshades (dynamic)',
                        imageServiceParameters: this.imageServiceParameters,
                        visible: false
                    }),  

                    new ArcGISTiledMapServiceLayer('https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/gebco_2014_contours/MapServer', {
                        id: 'GEBCO_2014 Contours',
                        visible: false,
                        opacity: 0.7
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
                        //sld: 'http://maps.ngdc.noaa.gov/viewers/emodnet.sld',
                        layerNames: ['Enkeltstraale']
                    }),

                    new ArcGISDynamicMapServiceLayer('https://geoappext.nrcan.gc.ca/arcgis/rest/services/GSCA/multibeam_multifaisceaux_index/MapServer', {
                        id: 'NRCan Multibeam',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),

                    new TiledWMSLayer('https://gis.ngdc.noaa.gov/https-proxy/proxy?http://geoservice.maris2.nl/wms/seadatanet/emodnet_hydrography?', {
                        id: 'EMODnet Singlebeam Polygons',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        sld: 'http://geomag.colorado.edu/sld/emodnet.sld',
                        layerNames: ['EMODnet_Bathymetry_single_beams_polygons'],
                        opacity: 0.5
                    }),
                    new TiledWMSLayer('https://gis.ngdc.noaa.gov/https-proxy/proxy?http://geoservice.maris2.nl/wms/seadatanet/emodnet_hydrography?', {
                        id: 'EMODnet Multibeam Polygons',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        sld: 'http://geomag.colorado.edu/sld/emodnet.sld',
                        layerNames: ['EMODnet_Bathymetry_multi_beams_polygons'],
                        opacity: 0.5
                    }),
                    new TiledWMSLayer('https://gis.ngdc.noaa.gov/https-proxy/proxy?http://geoservice.maris2.nl/wms/seadatanet/emodnet_hydrography?', {
                        id: 'EMODnet Singlebeam Lines',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        sld: 'http://geomag.colorado.edu/sld/emodnet.sld',
                        layerNames: ['EMODnet_Bathymetry_single_beams_points', 'EMODnet_Bathymetry_single_beams_lines']
                    }),
                    new TiledWMSLayer('https://gis.ngdc.noaa.gov/https-proxy/proxy?http://geoservice.maris2.nl/wms/seadatanet/emodnet_hydrography?', {
                        id: 'EMODnet Multibeam Lines',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        sld: 'http://geomag.colorado.edu/sld/emodnet.sld',
                        layerNames: ['EMODnet_Bathymetry_multi_beams_points', 'EMODnet_Bathymetry_multi_beams_lines']
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
                        visible: true
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
                        visible: false
                    }),

                    //CSB should be on top of boundaries
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/csb/MapServer', {
                    //new ArcGISDynamicMapServiceLayer('https://gisdev.ngdc.noaa.gov/arcgis/rest/services/acceptance/csb_surge/MapServer', {                        
                        id: 'CSB',
                        visible: true,
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
                        visible: false,
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
                        defaultVisibleLayers: [0, 1, 2]
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
                //Only show at scales greater than 1:2,000,000 (zoom level 9)
                this.getLayerById('NRCan Multibeam East').setVisibleLayers(visibleLayers);
                this.getLayerById('NRCan Multibeam East').setScaleRange(2000000, 0);
                this.getLayerById('NRCan Multibeam West').setVisibleLayers(visibleLayers);
                this.getLayerById('NRCan Multibeam West').setScaleRange(2000000, 0);
                this.getLayerById('NRCan Multibeam North').setVisibleLayers(visibleLayers);
                this.getLayerById('NRCan Multibeam North').setScaleRange(2000000, 0);
            }
        });
    }
);

