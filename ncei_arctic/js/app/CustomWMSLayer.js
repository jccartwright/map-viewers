define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'esri/layers/WMSLayer',
    'dojo/topic',
    'dojo/on'
    ],
    function(
        declare,
        lang,
        WMSLayer,
        topic,
        on
        ) {

        return declare([WMSLayer], {
            layerType: 'WMS',

            constructor: function(baseUrl) {
                this.datasetPrefix = arguments[1].datasetPrefix;   
                this.timeCode = arguments[1].timeCode;
                this.datasetSuffix = arguments[1].datasetSuffix;
                this.elevation = arguments[1].elevation;
                this.styles = arguments[1].styles;
                this.colorScaleRange = arguments[1].colorScaleRange;
                this.numColorBands = arguments[1].numColorBands;
                this.logScale = arguments[1].logScale;

                topic.subscribe('/layersPanel/selectElevation', lang.hitch(this, function (elevation) {
                    this.elevation = elevation;
                    this.refresh();
                }));

                topic.subscribe('/layersPanel/selectTime', lang.hitch(this, function (timeCode) {
                    this.timeCode = timeCode;
                    this.refresh();
                }));

                on(this, 'error', lang.hitch(this, function(error) {
                    console.error(error);
                    //this.refresh();
                }));
            }, //end constructor function

            getImageUrl: function(extent, width, height, callback) {
                var params = {
                    service: 'WMS',
                    request: 'GetMap',
                    transparent: true,
                    format: 'image/png',
                    version: this.version,
                    layers: this.visibleLayers,
                    styles: this.styles,

                    elevation: this.elevation,
                    colorScaleRange: this.colorScaleRange,
                    numColorBands: this.numColorBands,
                    logScale: this.logScale,
                    //exceptions: "application/vnd.ogc.se_xml",

                    //changing values
                    bbox: extent.xmin + "," + extent.ymin + "," + extent.xmax + "," + extent.ymax,
                    crs: 'EPSG:' + extent.spatialReference.wkid,
                    width: width,
                    height: height
                };

                callback(this.url + '/' + this.datasetPrefix + this.timeCode + this.datasetSuffix + '?' + dojo.objectToQuery(params));

                //http://data.nodc.noaa.gov/thredds/wms/woa/DATA_ANALYSIS/NP_REG_CLIMAT/DATA/netcdf/temperature/0.25/t16_04.nc?
                //LAYERS=t_an&ELEVATION=0&
                //TIME=0000-11-13T14%3A05%3A10.227Z&
                //TRANSPARENT=true&STYLES=boxfill%2Frainbow&CRS=EPSG%3A4326&
                //COLORSCALERANGE=-2.1%2C10.5&NUMCOLORBANDS=25&LOGSCALE=false&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&EXCEPTIONS=XML&FORMAT=image%2Fpng&
                //BBOX=-180,89.875,-90.0625,179.8125&WIDTH=256&HEIGHT=256
            }
   
        });
    }
);