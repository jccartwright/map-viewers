define([
    'dojo/_base/declare', 
    'ngdc/layers/AbstractLayerCollection', 
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/ArcGISDynamicMapServiceLayer'
    ],
    function(
        declare, 
        LayerCollection, 
        ArcGISTiledMapServiceLayer, 
        ArcGISDynamicMapServiceLayer
        ){

        return declare([LayerCollection], {
            constructor: function() {
                this.name = 'app/antarctic/LayerCollection';

                this.defineMapServices();

                this.setLayerTimeouts();

                this.definePairedMapServices();

                this.setSubLayerVisibility();
            },

            defineMapServices: function() {
                //TODO check to ensure unique id
                this.mapServices = [
                    new ArcGISTiledMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/antarctic/antarctic_basemap/MapServer', {
                        id: 'Antarctic Basemap',
                        visible: true
                    }),                                       
                    new ArcGISTiledMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/antarctic/ibcso_contours/MapServer', {
                        id: 'IBCSO Contours',
                        visible: false,
                        opacity: 0.5
                    }),
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/test/passive_acoustic_data/MapServer', {
                        id: 'PAD',
                        visible: true,
                        imageParameters: this.imageParameters.png32
                    }), 
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/antarctic/graticule/MapServer', {
                        id: 'Graticule',
                        visible: true,
                        opacity: 0.7,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/antarctic/reference/MapServer', {
                        id: 'Reference',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),                                        
                    new ArcGISDynamicMapServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/antarctic/clipping_donut/MapServer', {
                        id: 'Clipping Donut',
                        visible: true,
                        imageParameters: this.imageParameters.png32
                    })
                ];

                this.getLayerById('PAD').objectIdFields = {
                    0: 'Data Collections ID',
                    1: 'Data Collections ID',
                    2: 'Data Collections ID',
                    3: 'Data Collections ID',
                    4: 'Data Collections ID'
                };

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


