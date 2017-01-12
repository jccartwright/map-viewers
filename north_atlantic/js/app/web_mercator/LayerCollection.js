define([
    'dojo/_base/declare', 
    'ngdc/layers/AbstractLayerCollection', 
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISImageServiceLayer',
    'esri/layers/WMSLayer',
    'esri/layers/WMSLayerInfo',
    'esri/geometry/Extent',
    'ngdc/layers/TiledWMSLayer'
    ],
    function(
        declare, 
        AbstractLayerCollection, 
        ArcGISTiledMapServiceLayer, 
        ArcGISDynamicMapServiceLayer,
        ArcGISImageServiceLayer,
        WMSLayer,
        WMSLayerInfo,
        Extent,
        TiledWMSLayer
        ){

        return declare([AbstractLayerCollection], {
            constructor: function(options) {
                this.name = 'app.web_mercator.LayerCollection';

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

                //this.setSubLayerVisibility(); //When using PairedMapServiceLayers, need to do this later in MapConfig.MapReady()
            },

            defineMapServices: function() {

                var mareanoMultibeamLayerInfo = new WMSLayerInfo({
                    name: 'Flerstraale',
                    title: 'Flerstråle'
                });
                var mareanoSinglebeamLayerInfo = new WMSLayerInfo({
                    name: 'Enkeltstraale',
                    title: 'Enkeltstråle'
                });
                var mareanoMultibeamResourceInfo = {
                    extent: new Extent(-180, -90, 180, 90, {wkid: 4326}),
                    layerInfos: [mareanoMultibeamLayerInfo]
                };
                var mareanoSinglebeamResourceInfo = {
                    extent: new Extent(-180, -90, 180, 90, {wkid: 4326}),
                    layerInfos: [mareanoSinglebeamLayerInfo]
                };

                //TODO check to ensure unique id
                this.mapServices = [
                    new ArcGISTiledMapServiceLayer('https://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer', {
                        id: 'NatGeo',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/gebco_2014_hillshade/MapServer', {
                        id: 'GEBCO_2014',
                        visible: false
                    }),                    
                    new ArcGISTiledMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/etopo1_hillshade/MapServer', {
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
                        visible: true
                    }),
                    new TiledWMSLayer('https://gis.ngdc.noaa.gov/https-proxy/proxy?http://gmrt.marine-geo.org/cgi-bin/mapserv?map=/public/mgg/web/gmrt.marine-geo.org/htdocs/services/map/wms_merc_mask.map&', {
                        id: 'GMRT Masked',
                        visible: false,
                        format: 'jpeg',
                        wmsVersion: '1.1.1',
                        epsgCode: '3857',
                        layerNames: ['topo-mask']
                    }),
                    new TiledWMSLayer('https://gis.ngdc.noaa.gov/https-proxy/proxy?http://gmrt.marine-geo.org/cgi-bin/mapserv?map=/public/mgg/web/gmrt.marine-geo.org/htdocs/services/map/wms_merc.map&', {
                        id: 'GMRT Unmasked',
                        visible: false,
                        format: 'jpeg',
                        wmsVersion: '1.1.1',
                        epsgCode: '3857',
                        layerNames: ['topo']
                    }),
                    new TiledWMSLayer('https://gis.ngdc.noaa.gov/https-proxy/proxy?http://ows.emodnet-bathymetry.eu/wms?', {
                        id: 'EMODNet DTM',
                        visible: false,
                        format: 'PNG',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        layerNames: ['mean_atlas_land']
                    }),                                    
                    new ArcGISTiledMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/gebco_2014_contours/MapServer', {
                        id: 'GEBCO_2014 Contours',
                        visible: false,
                        opacity: 0.7
                    }),

                    // new ArcGISDynamicMapServiceLayer('//atlas.marine.ie/arcgis/rest/services/AdministrativeUnits/MapServer', {
                    //     id: 'OSPAR Boundaries',
                    //     visible: false,
                    //     imageParameters: this.imageParameters.png32
                    // }),
                    // new ArcGISDynamicMapServiceLayer('//atlas.marine.ie/arcgis/rest/services/ProtectedSites/MapServer', {
                    //     id: 'Protected Sites',
                    //     visible: false,
                    //     imageParameters: this.imageParameters.png32
                    // }),

                    new ArcGISDynamicMapServiceLayer('https://service.ncddc.noaa.gov/arcgis/rest/services/OceanExploration/OE_IOCM_Planned/MapServer', { //Force HTTP
                        id: 'OER Planned Expeditions',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    
                    new TiledWMSLayer('https://gis.ngdc.noaa.gov/https-proxy/proxy?http://wms.geonorge.no/skwms1/wms.dekning_sjomaaling?', {
                        id: 'MAREANO Multibeam',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        layerNames: ['Flerstraale']
                    }),
                    new TiledWMSLayer('https://gis.ngdc.noaa.gov/https-proxy/proxy?http://wms.geonorge.no/skwms1/wms.dekning_sjomaaling?', {
                        id: 'MAREANO Single-Beam',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        //sld: 'http://maps.ngdc.noaa.gov/viewers/emodnet.sld',
                        layerNames: ['Enkeltstraale']
                    }),                    
                    // new WMSLayer('http://wms.geonorge.no/skwms1/wms.dekning_sjomaaling', {
                    //     id: 'MAREANO Multibeam',
                    //     resourceInfo: mareanoMultibeamResourceInfo,
                    //     visibleLayers: ['Flerstraale'],
                    //     version: '1.3.0',
                    //     transparent: true,
                    //     format: 'png',
                    //     visible: false,
                    // }),
                    // new WMSLayer('http://wms.geonorge.no/skwms1/wms.dekning_sjomaaling', {
                    //     id: 'MAREANO Single-Beam',
                    //     resourceInfo: mareanoSinglebeamResourceInfo,
                    //     visibleLayers: ['Enkeltstraale'],
                    //     version: '1.3.0',
                    //     transparent: true,
                    //     format: 'png',
                    //     visible: false,
                    // }),
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/proprietary_bathymetric_surveys/MapServer', {
                        id: 'Portugal',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://geoappext.nrcan.gc.ca/arcgis/rest/services/GSCA/multibeam_multifaisceaux_index/MapServer', {
                        id: 'NRCan Multibeam',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new TiledWMSLayer('https://gis.ngdc.noaa.gov/https-proxy/proxy?http://geoservice.maris2.nl/wms/seadatanet/emodnet_hydrography?', {
                        id: 'EMODNet Singlebeam Polygons',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        sld: 'https://maps.ngdc.noaa.gov/viewers/emodnet.sld',
                        layerNames: ['EMODnet_Bathymetry_single_beams_polygons'],
                        opacity: 0.5
                    }),
                    new TiledWMSLayer('https://gis.ngdc.noaa.gov/https-proxy/proxy?http://geoservice.maris2.nl/wms/seadatanet/emodnet_hydrography?', {
                        id: 'EMODNet Multibeam Polygons',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        sld: 'https://maps.ngdc.noaa.gov/viewers/emodnet.sld',
                        layerNames: ['EMODnet_Bathymetry_multi_beams_polygons'],
                        opacity: 0.5
                    }),
                    new TiledWMSLayer('https://gis.ngdc.noaa.gov/https-proxy/proxy?http://geoservice.maris2.nl/wms/seadatanet/emodnet_hydrography?', {
                        id: 'EMODNet Singlebeam Lines',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        sld: 'https://maps.ngdc.noaa.gov/viewers/emodnet.sld',
                        layerNames: ['EMODnet_Bathymetry_single_beams_points', 'EMODnet_Bathymetry_single_beams_lines']
                    }),
                    new TiledWMSLayer('https://gis.ngdc.noaa.gov/https-proxy/proxy?http://geoservice.maris2.nl/wms/seadatanet/emodnet_hydrography?', {
                        id: 'EMODNet Multibeam Lines',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        sld: 'https://maps.ngdc.noaa.gov/viewers/emodnet.sld',
                        layerNames: ['EMODnet_Bathymetry_multi_beams_points', 'EMODnet_Bathymetry_multi_beams_lines']
                    }),                    
                    new ArcGISTiledMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_bathymetry/MapServer', {
                        id: 'Trackline Bathymetry (tiled)',
                        visible: this.tracklineVisible
                    }),
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_combined_dynamic/MapServer', {
                        id: 'Trackline Combined (dynamic)',
                        visible: this.tracklineVisible,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISTiledMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam/MapServer', {
                        id: 'Multibeam (tiled)',
                        visible: this.multibeamVisible
                    }),
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer', {
                        id: 'Multibeam (dynamic)',
                        visible: this.multibeamVisible,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/trackline_bathymetry_density/MapServer', {
                        id: 'Trackline Bathymetry Density',
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
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/graticule/MapServer', {
                        id: 'Graticule',
                        visible: false,
                        opacity: 0.7,
                        imageParameters: this.imageParameters.png32
                    }),                    
                    new ArcGISDynamicMapServiceLayer('https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/poles_mask/MapServer', {
                        id: 'Poles Mask',
                        visible: true,
                        imageParameters: this.imageParameters.png32
                    })
                ];

                //Force the WMS layer to use epsg:900913 instead of 102100, which is unsupported by the remote server.
                //See: http://gis.stackexchange.com/questions/86301/force-an-arcgis-api-for-javascript-wmslayer-to-use-epsg-900913-instead-of-1021
                //this.getLayerById('MAREANO Multibeam').spatialReferences[0] = 900913;
                //this.getLayerById('MAREANO Single-Beam').spatialReferences[0] = 900913;

            },  //end defineMapServices

            definePairedMapServices: function() {
                this.pairedMapServices = [
                    {
                        id: 'Multibeam',
                        tiledService: this.getLayerById('Multibeam (tiled)'),
                        dynamicService: this.getLayerById('Multibeam (dynamic)'),
                        visible: this.multibeamVisible,
                        cutoffZoom: 9
                    },
                    {
                        id: 'Trackline Bathymetry',
                        tiledService: this.getLayerById('Trackline Bathymetry (tiled)'),
                        dynamicService: this.getLayerById('Trackline Combined (dynamic)'),
                        visible: this.tracklineVisible,
                        cutoffZoom: 9,
                        defaultVisibleLayers: [1]
                     }                    
                ];
            },

            setSubLayerVisibility: function() {
                //logger.debug('setting subLayer visibility...');
            }
        });
    }
);

