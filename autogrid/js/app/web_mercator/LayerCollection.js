define([
    'dojo/_base/declare', 
    'ngdc/layers/AbstractLayerCollection', 
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/ArcGISDynamicMapServiceLayer'
    ],
    function(
        declare, 
        AbstractLayerCollection, 
        ArcGISTiledMapServiceLayer, 
        ArcGISDynamicMapServiceLayer
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
                    new ArcGISTiledMapServiceLayer('https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/GEBCO_2019_basemap_ncei/MapServer', {
                        id: 'GEBCO_2019 (NCEI)',
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/GEBCO_2019_grayscale_basemap_ncei/MapServer', {
                        id: 'GEBCO_2019 Grayscale (NCEI)',
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
                        visible: true,
                    }),                    
                    new ArcGISTiledMapServiceLayer('https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/web_mercator_gebco_2019_contours/MapServer', {
                        id: 'GEBCO_2019 Contours',
                        visible: false,
                        opacity: 0.5
                    }),
                    new ArcGISTiledMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam/MapServer', {
                        id: 'Multibeam (tiled)',
                        visible: true
                    }),
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer', {
                        id: 'Multibeam (dynamic)',
                        imageParameters: this.imageParameters.png32,
                        visible: true
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
                        cutoffZoom: 9,
                        visible: true
                    }                 
                ];               
            },

            setSubLayerVisibility: function() {
            }
        });
    }
);

