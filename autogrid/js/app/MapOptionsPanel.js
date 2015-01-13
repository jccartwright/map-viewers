define([
    'dojo/_base/declare',
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/topic',
    'dojo/_base/lang',
    'dojo/number',
    'dojo/dom-style',
    'esri/geometry/webMercatorUtils',
    'dojo/text!./templates/MapOptionsPanel.html'
    ],
    function(
        declare, 
        _WidgetBase, 
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        topic,
        lang,
        number,
        domStyle,
        webMercatorUtils,
        template
        ){
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            // Our template - important!
            templateString: template,

            // A class to be applied to the root node in our template
            baseClass: 'mapOptionsPanel',

            constructor: function() {
                topic.subscribe('/ngdc/surveyStats', lang.hitch(this, 'updateMapOptions'));
            },

            updateMapOptions: function(data) {
                console.log('inside updateMapOptions with ',data);

                var calculateDefaultContourInterval = lang.hitch(this, 'calculateDefaultContourInterval');

                var msg = 'approximate depth range: ' + number.format(Math.round(data.minDepth)) +
                          ' to '+ number.format(Math.round(data.maxDepth)) + ' meters';
                this.zRangeMessage.innerHTML = msg;

                console.log(this.contourIntervalText);
                console.log(calculateDefaultContourInterval(data.minDepth, data.maxDepth));
                this.contourIntervalText.value = calculateDefaultContourInterval(data.minDepth, data.maxDepth);
            },

            validate: function() {
                //TODO
                return true
            },

            getData: function() {
                return ({
                    "colorTable": this.colorTableSelect.value,
                    "contourInterval": parseInt(this.contourIntervalText.value),
                    "mapTitle": this.mapTitleText.value
                });
            },

            calculateDefaultContourInterval: function(minZ, maxZ) {
                var zrange = Math.abs(maxZ - minZ);

                var ci = 25;
                if ( 0 <= zrange && zrange <= 19) {
                    ci = 2;
                } else if (20 <= zrange && zrange <= 59) {
                    ci = 5;
                } else if (60 <= zrange && zrange <= 109) {
                    ci = 10;
                } else if (110 <= zrange && zrange <= 209) {
                    ci = 20;
                } else if (210 <= zrange && zrange <= 509) {
                    ci = 50;
                } else if (510 <= zrange && zrange <= 1009) {
                    ci = 100;
                } else if (1010 <= zrange && zrange <= 3009) {
                    ci = 250;
                } else if (3010 <= zrange && zrange <= 6000) {
                    ci = 500;
                } else {
                    ci = 750;
                }
                return(ci);
            }
        });
    }
);
