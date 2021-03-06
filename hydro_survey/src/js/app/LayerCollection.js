define([
    'dojo/_base/declare', 
    'ngdc/layers/AbstractLayerCollection', 
    'esri/layers/ArcGISTiledMapServiceLayer', 
    'esri/layers/ArcGISImageServiceLayer', 
    'esri/layers/ImageServiceParameters', 
    'esri/layers/ArcGISDynamicMapServiceLayer', 
    'esri/layers/FeatureLayer',
    'esri/InfoTemplate'
    ],
    function(
        declare, 
        LayerCollection,
        ArcGISTiledMapServiceLayer,
        ArcGISImageServiceLayer,
        ImageServiceParameters,
        ArcGISDynamicMapServiceLayer,
        FeatureLayer,
        InfoTemplate
        ){

        return declare([LayerCollection], {
            constructor: function() {
                this.defineMapServices();

                this.setLayerTimeouts();

                this.buildPairedMapServices();
            },

            defineMapServices: function() {
                //TODO check to ensure unique id

                var params = new ImageServiceParameters();
                params.format = 'jpgpng';
                params.compressionQuality = 90;
                params.interpolation = ImageServiceParameters.INTERPOLATION_BILINEAR;

                var template = new InfoTemplate('BAG Footprint', '${Name}');

                //all are invisible by default to hide the initial zoom to extent
                this.mapServices = [
                    new ArcGISTiledMapServiceLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer', {
                        id: 'World Imagery',
                        visible: false
                    }),                                  
                    new ArcGISImageServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/bag_hillshades_subsets/ImageServer', {
                        id: 'BAG Hillshades',
                        imageServiceParameters: params,
                        visible: false
                    }),
                    new ArcGISImageServiceLayer('https://seamlessrnc.nauticalcharts.noaa.gov/ArcGIS/rest/services/RNC/NOAA_RNC/ImageServer', {
                        id: 'RNC',
                        imageServiceParameters: params,
                        visible: false,
                        opacity: 0.5
                    }),
                    new FeatureLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer/1', {
                        id: 'NOS Hydro Digital',
                        mode: FeatureLayer.MODE_ONDEMAND,
                        visible: false
                    }),
                    new FeatureLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer/2', {
                        id: 'NOS Hydro Non-Digital',
                        mode: FeatureLayer.MODE_ONDEMAND,
                        visible: false
                    }),
                    new FeatureLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer/3', {
                        id: 'BAG Footprints',
                        mode: FeatureLayer.MODE_ONDEMAND,
                        visible: false,
                        infoTemplate: template,
                        outFields: ['Name']
                    }),
                    new ArcGISTiledMapServiceLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer', {
                        id: 'Boundaries/Labels',
                        visible: false
                    })
                ];
            },  //end defineMapServices

            buildPairedMapServices: function() {
                logger.debug('creating pairedMapServices...');
            }

        });
    }
);


