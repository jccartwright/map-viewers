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
                this.year = arguments[1].year;
                this.month = arguments[1].month;
                this.hour = arguments[1].hour;
                this.styles = arguments[1].styles;
                this.colorScaleRange = arguments[1].colorScaleRange;
                this.numColorBands = arguments[1].numColorBands;
                this.logScale = arguments[1].logScale;

                // topic.subscribe('/layersPanel/selectNarrYear', lang.hitch(this, function (year) {
                //     this.year = year;
                //     this.refresh();
                // }));

                // topic.subscribe('/layersPanel/selectNarrMonth', lang.hitch(this, function (month) {
                //     this.month = month;
                //     this.refresh();
                // }));

                // topic.subscribe('/layersPanel/selectNarrHour', lang.hitch(this, function (hour) {
                //     this.hour = hour;
                //     this.refresh();
                // }));
                
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
                callback(this.url + '?' + dojo.objectToQuery(params));
            }
        });
    }
);