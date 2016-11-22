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
                    new ArcGISImageServiceLayer('//gis.ngdc.noaa.gov/arcgis/rest/services/dem_hillshades/ImageServer', {
                        id: 'DEM Hillshades',
                        visible: false,
                        imageServiceParameters: this.imageServiceParameters
                    }),                    
                    new ArcGISTiledMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/gebco_2014_contours/MapServer', {
                        id: 'GEBCO_2014 Contours',
                        visible: false,
                        opacity: 0.7
                    }),
                    new ArcGISTiledMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro/MapServer', {
                        id: 'NOS Hydro (tiled)',
                        visible: false
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer', {
                        id: 'NOS Hydro (dynamic)',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISTiledMapServiceLayer('//gis.ngdc.noaa.gov/arcgis/rest/services/bag_hillshades/ImageServer', {
                        id: 'BAG Hillshades',
                        visible: false
                    }),                    
                    // new ArcGISImageServiceLayer("//seamlessrnc.nauticalcharts.noaa.gov/ArcGIS/rest/services/RNC/NOAA_RNC/ImageServer", {
                    //     id: 'RNC',
                    //     visible: false,
                    //     opacity: 0.5,
                    //     imageServiceParameters: this.imageServiceParameters
                    // }),
                    new WebTiledLayer('https://gis.ngdc.noaa.gov/https-proxy/proxy?http://tileservice.charts.noaa.gov/tiles/50000_1/{level}/{col}/{row}.png', {
                        id: 'RNC',
                        visible: false,
                        opacity: 0.5
                    }),

                    new TiledWMSLayer('//geoservice.maris2.nl/wms/seadatanet/emodnet_hydrography?', {
                        id: 'EMODNet Singlebeam Polygons',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        sld: 'https://maps.ngdc.noaa.gov/viewers/emodnet.sld',
                        layerNames: ['EMODnet_Bathymetry_single_beams_polygons'],
                        opacity: 0.5
                    }),
                    new TiledWMSLayer('//geoservice.maris2.nl/wms/seadatanet/emodnet_hydrography?', {
                        id: 'EMODNet Multibeam Polygons',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        sld: 'https://maps.ngdc.noaa.gov/viewers/emodnet.sld',
                        layerNames: ['EMODnet_Bathymetry_multi_beams_polygons'],
                        opacity: 0.5
                    }),
                    new TiledWMSLayer('//geoservice.maris2.nl/wms/seadatanet/emodnet_hydrography?', {
                        id: 'EMODNet Singlebeam Lines',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        sld: 'https://maps.ngdc.noaa.gov/viewers/emodnet.sld',
                        layerNames: ['EMODnet_Bathymetry_single_beams_points', 'EMODnet_Bathymetry_single_beams_lines']
                    }),
                    new TiledWMSLayer('//geoservice.maris2.nl/wms/seadatanet/emodnet_hydrography?', {
                        id: 'EMODNet Multibeam Lines',
                        visible: false,
                        format: 'png',
                        wmsVersion: '1.3.0',
                        epsgCode: '900913',
                        sld: 'https://maps.ngdc.noaa.gov/viewers/emodnet.sld',
                        layerNames: ['EMODnet_Bathymetry_multi_beams_points', 'EMODnet_Bathymetry_multi_beams_lines']
                    }),
                    
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer', {
                        id: 'NOS Hydro (BAGs)',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISTiledMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_bathymetry/MapServer', {
                        id: 'Trackline Bathymetry (tiled)',
                        visible: false
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_combined_dynamic/MapServer', {
                        id: 'Trackline Combined (dynamic)',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISTiledMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam/MapServer', {
                        id: 'Multibeam (tiled)',
                        visible: false
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer', {
                        id: 'Multibeam (dynamic)',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),  

                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/csb/MapServer', {
                        id: 'CSB',
                        visible: true,
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
                        visible: true
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/graticule/MapServer', {
                        id: 'Graticule',
                        visible: false,
                        opacity: 0.7,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/dem_extents/MapServer', {
                        id: 'DEM Extents',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/poles_mask/MapServer', {
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
                         tiledService: this.getLayerById('NOS Hydro (tiled)'),
                         dynamicService: this.getLayerById('NOS Hydro (dynamic)'),
                         visible: false,
                         cutoffZoom: 9
                     }                     
                ];
            },

            setSubLayerVisibility: function() {
                //logger.debug('setting subLayer visibility...');
                //this.getLayerById('Water Column Sonar').setVisibleLayers([0,1,2,3]);
                //this.getLayerById('DEM Extents').setVisibleLayers([9999]); //Manually set all the sublayers to invisible for 'DEM Extents'
                //set on PairedService or dynamic service?
                //this.getLayerById('NOS Hydro (dynamic)').setVisibleLayers([9999]);
                //this.getLayerById('NOS Hydrographic Surveys').setVisibleLayers([9999]); //Manually set all the sublayers to invisible for 'NOS Hydro'
                //this.getLayerById('NOS Hydro Non-Digital').setVisibleLayers([9999]);

                this.getLayerById('DEM Extents').setVisibleLayers([12]);

                //this.getLayerById('DAV').setVisibleLayers([-1]);

                //this.getLayerById('NOS Hydrographic Surveys').setVisibleLayers([0])
            }
        });
    }
);

