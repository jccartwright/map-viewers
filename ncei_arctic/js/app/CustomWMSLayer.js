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

            constructor: function() {
                this.datasetPrefix = arguments[1].datasetPrefix;   
                this.timeString = arguments[1].timeString;
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

                topic.subscribe('/layersPanel/selectTime', lang.hitch(this, function (timeString, time) {
                    this.timeString = timeString;
                    this.time = time;
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
                    height: height,
                    time: this.time
                };

                callback(this.url + '/' + this.datasetPrefix + '_' + this.timeString + '_' + this.datasetSuffix + '?' + dojo.objectToQuery(params));

                //Example URL:
                //https://data.nodc.noaa.gov/thredds/wms/ncml/regclim/arctic_ncml/temperature/temperature_annual_quarter.ncml?
                //LAYERS=t_an
                //&ELEVATION=0
                //&TIME=0000-06-29T14%3A54%3A22.987Z
                //&TRANSPARENT=true
                //&STYLES=boxfill%2Frainbow&CRS=EPSG%3A4326&COLORSCALERANGE=-50%2C50&NUMCOLORBANDS=25&LOGSCALE=false
                //&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&EXCEPTIONS=XML&FORMAT=image%2Fpng&BBOX=179.75,-0.062500000000028,269.6875,89.875&WIDTH=256&HEIGHT=256
            }
   
        });
    }
);