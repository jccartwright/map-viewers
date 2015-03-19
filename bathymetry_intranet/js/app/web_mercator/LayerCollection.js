define([
    'dojo/_base/declare', 
    'ngdc/layers/AbstractLayerCollection', 
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISImageServiceLayer'
    ],
    function(
        declare, 
        AbstractLayerCollection, 
        ArcGISTiledMapServiceLayer, 
        ArcGISDynamicMapServiceLayer,
        ArcGISImageServiceLayer
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
                //TODO check to ensure unique id
                this.mapServices = [
                    new ArcGISTiledMapServiceLayer('http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer', {
                        id: 'NatGeo',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/gebco08_hillshade/MapServer', {
                        id: 'GEBCO_08',
                        visible: false
                    }),                    
                    new ArcGISTiledMapServiceLayer('http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/etopo1_hillshade/MapServer', {
                        id: 'ETOPO1',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer', {
                        id: 'Light Gray',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer', {
                        id: 'Dark Gray',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer', {
                        id: 'World Imagery',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer', {
                        id: 'NatGeo Basemap',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('http://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer', {
                        id: 'Ocean Base',
                        visible: true,
                    }),
                    new ArcGISImageServiceLayer('http://gis.ngdc.noaa.gov/arcgis/rest/services/dem_hillshades/ImageServer', {
                        id: 'DEM Hillshades',
                        visible: this.demVisible,
                        imageServiceParameters: this.imageServiceParameters
                    }),                    
                    new ArcGISTiledMapServiceLayer('http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/gebco08_contours/MapServer', {
                        id: 'GEBCO_08 Contours',
                        visible: false,
                        opacity: 0.5
                    }),                    
                    new ArcGISDynamicMapServiceLayer('http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer', {
                        id: 'NOS Hydro (non-digital)',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISTiledMapServiceLayer('http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro/MapServer', {
                        id: 'NOS Hydro (tiled)',
                        visible: this.nosHydroVisible
                    }),
                    new ArcGISDynamicMapServiceLayer('http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer', {
                        id: 'NOS Hydro (dynamic)',
                        visible: this.nosHydroVisible,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISImageServiceLayer('http://gis.ngdc.noaa.gov/arcgis/rest/services/bag_hillshades/ImageServer', {
                        id: 'BAG Hillshades',
                        visible: false,
                        imageServiceParameters: this.imageServiceParameters
                    }),
                    new ArcGISImageServiceLayer('http://egisws02.nos.noaa.gov/ArcGIS/rest/services/RNC/NOAA_RNC/ImageServer', {
                        id: 'RNC',
                        visible: false,
                        opacity: 0.5,
                        imageServiceParameters: this.imageServiceParameters
                    }),
                    new ArcGISDynamicMapServiceLayer('http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer', {
                        id: 'NOS Hydro (BAGs)',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('http://coast.noaa.gov/arcgis/rest/services/DAV/DAV/MapServer', {
                        id: 'CSC Lidar',
                        visible: false,
                        imageParameters: this.imageParameters.png32,
                        opacity: 1
                    }),
                    new ArcGISDynamicMapServiceLayer('http://maps.ngdc.noaa.gov/arcgis/rest/services/intranet/trackline_combined_dynamic/MapServer', {
                        id: 'Trackline Bathymetry',
                        visible: this.tracklineVisible,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('http://maps.ngdc.noaa.gov/arcgis/rest/services/intranet/multibeam_dynamic/MapServer', {
                        id: 'Multibeam',
                        visible: this.multibeamVisible,
                        imageParameters: this.imageParameters.png32
                    }),                    
                    new ArcGISTiledMapServiceLayer('http://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer', {
                        id: 'World Boundaries and Places',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer', {
                        id: 'Light Gray Reference',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer', {
                        id: 'Dark Gray Reference',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('http://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Reference/MapServer', {
                        id: 'Ocean Reference',
                        visible: true,
                    }),
                    new ArcGISDynamicMapServiceLayer('http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/graticule/MapServer', {
                        id: 'Graticule',
                        visible: false,
                        opacity: 0.7,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('http://maps.ngdc.noaa.gov/arcgis/rest/services/intranet/dem_extents/MapServer', {
                        id: 'DEM Extents',
                        visible: this.demVisible,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/poles_mask/MapServer', {
                        id: 'Poles Mask',
                        visible: true,
                        imageParameters: this.imageParameters.png32
                    })
                ];
            },  //end defineMapServices

            definePairedMapServices: function() {
                this.pairedMapServices = [
                     {
                         id: 'NOS Hydrographic Surveys',
                         tiledService: this.getLayerById('NOS Hydro (tiled)'),
                         dynamicService: this.getLayerById('NOS Hydro (dynamic)'),
                         visible: this.nosHydroVisible,
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

