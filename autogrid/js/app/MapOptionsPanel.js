define([
    'dojo/_base/declare',
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/topic',
    'dojo/_base/lang',
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
        webMercatorUtils,
        template
        ){
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            // Our template - important!
            templateString: template,

            // A class to be applied to the root node in our template
            baseClass: 'mapOptionsPanel',

            constructor: function() {
            }
        });
    }
);
