define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/on',
    'dojo/aspect',
    'dojo/dom',
    'dojo/dom-attr',
    'dijit/form/CheckBox',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!./templates/LayersPanel.html'],
    function(
        declare, 
        lang,
        topic,
        on,
        aspect,
        dom,
        domAttr,
        CheckBox,
        _WidgetBase, 
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        template){
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            // Our template - important!
            templateString: template,
            // A class to be applied to the root node in our template
            baseClass: 'layersPanel',

            postCreate: function() {
                this.inherited(arguments);

                on(this.chkFishingMaps, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Fish Maps', [0], this.chkFishingMaps.checked);
                }));
                on(this.chkTopoBathyMaps, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Fish Maps', [1], this.chkTopoBathyMaps.checked);
                }));
                on(this.chkBathyMaps, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Fish Maps', [2], this.chkBathyMaps.checked);
                }));
                on(this.chkPreliminaryMaps, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Fish Maps', [3], this.chkPreliminaryMaps.checked);
                }));  
            }
        });
    }
);