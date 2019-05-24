define([
    'dojo/_base/declare', 
    'ngdc/layers/AbstractLayerCollection', 
    'esri/layers/ArcGISTiledMapServiceLayer', 
    'esri/layers/ArcGISImageServiceLayer', 
    'esri/layers/ImageServiceParameters', 
    'esri/layers/ArcGISDynamicMapServiceLayer', 
    'esri/layers/FeatureLayer',
    'esri/layers/RasterFunction'
    ],
    function(
        declare, 
        LayerCollection,
        ArcGISTiledMapServiceLayer,
        ArcGISImageServiceLayer,
        ImageServiceParameters,
        ArcGISDynamicMapServiceLayer,
        FeatureLayer,
        RasterFunction
        ){

        return declare([LayerCollection], {
            constructor: function() {
                this.defineMapServices();

                this.setLayerTimeouts();

                this.buildPairedMapServices();
            },

            defineMapServices: function() {
                //TODO check to ensure unique id

                // var params = new ImageServiceParameters();
                // params.format = 'jpgpng';
                // params.compressionQuality = 90;
                // params.interpolation = ImageServiceParameters.INTERPOLATION_BILINEAR;
                
                // var rasterFunction = new RasterFunction();
                // rasterFunction.functionName = "ColorHillshade";
                // params.renderingRule = rasterFunction;

                //all are invisible by default to hide the initial zoom to extent
                this.mapServices = [
                    new ArcGISTiledMapServiceLayer('https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer', {
                        id: 'Ocean Base',
                        visible: true
                    }),                                 
                    // new ArcGISImageServiceLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/multibeam_mosaic_subsets/ImageServer', {
                    //     id: 'Multibeam Mosaic',
                    //     imageServiceParameters: params,
                    //     visible: false
                    // }),
                    new FeatureLayer('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer/0', {
                        id: 'Multibeam',
                        mode: FeatureLayer.MODE_ONDEMAND,
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Reference/MapServer', {
                        id: 'Ocean Reference',
                        visible: true
                    })
                ];
            },  //end defineMapServices

            buildPairedMapServices: function() {
                logger.debug('creating pairedMapServices...');
            }

        });
    }
);


