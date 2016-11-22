define([
    'dojo/_base/declare', 
    'ngdc/layers/AbstractLayerCollection', 
    'esri/layers/ArcGISTiledMapServiceLayer', 
    'esri/layers/ArcGISImageServiceLayer', 
    'esri/layers/ImageServiceParameters', 
    'esri/layers/ArcGISDynamicMapServiceLayer', 
    'esri/layers/FeatureLayer',
    'ngdc/layers/TiledWMSLayer'
    ],
    function(
        declare, 
        LayerCollection,
        ArcGISTiledMapServiceLayer,
        ArcGISImageServiceLayer,
        ImageServiceParameters,
        ArcGISDynamicMapServiceLayer,
        FeatureLayer,
        TiledWMSLayer
        ){

        return declare([LayerCollection], {
            constructor: function() {
                this.defineMapServices();

                this.setLayerTimeouts();

                this.buildPairedMapServices();
            },

            defineMapServices: function() {
                //TODO check to ensure unique id

                //all are invisible by default to hide the initial zoom to extent
                this.mapServices = [
                    new ArcGISTiledMapServiceLayer('//services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer', {
                    //new ArcGISTiledMapServiceLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/gebco_2014_hillshade/MapServer/', {                        
                        id: 'Ocean Base',
                        visible: true
                    }),                                 
                    new TiledWMSLayer('https://gis.ngdc.noaa.gov/https-proxy/proxy?http://gmrt.marine-geo.org/cgi-bin/mapserv?map=/public/mgg/web/gmrt.marine-geo.org/htdocs/services/map/wms_merc_mask.map&', {
                        id: 'GMRT',
                        visible: false,
                        format: 'jpeg',
                        wmsVersion: '1.1.1',
                        epsgCode: '3857',
                        layerNames: ['topo-mask']
                    }),
                    new FeatureLayer('//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer/0', {
                        id: 'Multibeam',
                        mode: FeatureLayer.MODE_ONDEMAND,
                        visible: false
                    }),
                    new ArcGISTiledMapServiceLayer('//services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Reference/MapServer', {
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


