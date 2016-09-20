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
                this.year = arguments[1].year;
                this.month = arguments[1].month;
                this.hour = arguments[1].hour;
                this.styles = arguments[1].styles;
                this.colorScaleRange = arguments[1].colorScaleRange;
                this.numColorBands = arguments[1].numColorBands;
                this.logScale = arguments[1].logScale;

                topic.subscribe('/layersPanel/selectNarrYear', lang.hitch(this, function (year) {
                    this.year = year;
                    this.refresh();
                }));

                topic.subscribe('/layersPanel/selectNarrMonth', lang.hitch(this, function (month) {
                    this.month = month;
                    this.refresh();
                }));

                topic.subscribe('/layersPanel/selectNarrHour', lang.hitch(this, function (hour) {
                    this.hour = hour;
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

                //http://nomads.ncdc.noaa.gov/thredds/wms/narrmonthly/YYYYMM/YYYYMM01/narrmonhr-a_221_YYYYMM01_HH00_000.grb
                callback(this.url + '/' + this.year + this.month + '/' + this.year + this.month + '01/narrmonhr-a_221_' + 
                    this.year + this.month + '01_' + this.hour + '00_000.grb?' + dojo.objectToQuery(params));
            }

            //http://nomads.ncdc.noaa.gov/thredds/wms/narrmonthly/200904/20090401/narrmonhr-a_221_20090401_1200_000.grb?
            //LAYERS=Ground_Heat_Flux&TRANSPARENT=true&STYLES=boxfill%2Frainbow&CRS=EPSG%3A4326&COLORSCALERANGE=-50%2C50&NUMCOLORBANDS=20&
            //LOGSCALE=false&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&EXCEPTIONS=XML&FORMAT=image%2Fpng&BBOX=-72.550464141521,53.266047811305,-36.733952188695,89.082559764131&WIDTH=256&HEIGHT=256
   
        });
    }
);