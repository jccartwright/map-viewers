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
        ArcGISDynamicMapServiceLayer){

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
                    new ArcGISTiledMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/antarctic/antarctic_basemap/MapServer', {
                        id: 'Antarctic Basemap',
                        visible: true
                    }),                                                         
                    new ArcGISTiledMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/antarctic/ibcso_contours/MapServer', {
                        id: 'IBCSO Contours',
                        visible: false,
                        opacity: 0.5
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/water_column_sonar/MapServer', {
                        id: 'Water Column Sonar',
                        visible: true,
                        imageParameters: this.imageParameters.png32
                    }),                           
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/antarctic/graticule/MapServer', {
                        id: 'Graticule',
                        visible: true,
                        opacity: 0.7,
                        imageParameters: this.imageParameters.png32
                    }),
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/antarctic/reference/MapServer', {
                        id: 'Reference',
                        visible: false,
                        imageParameters: this.imageParameters.png32
                    }),                    
                    new ArcGISDynamicMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/antarctic/clipping_donut/MapServer', {
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
                this.getLayerById('Water Column Sonar').setVisibleLayers([0, 1, 2, 3, 4, 5]);
            }
        });
    }
);
