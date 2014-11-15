define([
    'dojo/_base/declare',
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/topic',
    'dojo/_base/lang',
    'esri/geometry/webMercatorUtils',
    'dojo/text!./templates/GridOptionsPanel.html'
    ],
    function(
        declare, 
        _WidgetBase, 
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        topic,
        lang,
        webMercatorUtils,
        template
        ){
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            // Our template - important!
            templateString: template,

            // A class to be applied to the root node in our template
            baseClass: 'gridOptionsPanel',

            constructor: function() {
                //listen for events from the maptoolbar containing envelope
                topic.subscribe('/ngdc/geometry', lang.hitch(this, 'updateGridOptions'));
            },

            updateGridOptions: function(geom) {
                var convertToGeographic = lang.hitch(this, 'convertToGeographic');
                var extent = convertToGeographic(geom);

                //this.areaOfInterestText.value = extent.xmin.toFixed(2)+", "+extent.ymin.toFixed(2)+", "+extent.xmax.toFixed(2)+", "+extent.ymax.toFixed(2);
                this.aoiSpan.innerHTML = extent.xmin.toFixed(2)+", "+extent.ymin.toFixed(2)+", "+extent.xmax.toFixed(2)+", "+extent.ymax.toFixed(2);

            },

            //TODO add support for arctic coords
            convertToGeographic: function(geom) {
                if (geom.spatialReference.wkid == 4326) {
                    //no action necessary
                    return(geom);
                } else if (geom.spatialReference.wkid == 102100) {
                    //convert from web mercator
                    return(webMercatorUtils.webMercatorToGeographic(geom));

                } else {
                    console.warn("unsupported SRID: "+geom.spatialReference.wkid);
                }
            }

        });
    }
);
