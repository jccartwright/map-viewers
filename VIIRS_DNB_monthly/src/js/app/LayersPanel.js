define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/topic',
    'dojo/on',
    'dijit/registry',
    'dijit/form/CheckBox',
    'dijit/form/HorizontalSlider',
    'dijit/form/HorizontalRule',
    'dijit/form/HorizontalRuleLabels',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!./templates/LayersPanel.html'
    ],
    function(
        declare,
        lang,
        array,
        topic,
        on,
        registry,
        CheckBox,
        HorizontalSlider,
        HorizontalRule,
        HorizontalRuleLabels,
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

                on(registry.byId('radioButton0'), 'click', lang.hitch(this, function() {
                    topic.publish('toggleLayer', 0);
                })); 
                on(registry.byId('radioButton1'), 'click', lang.hitch(this, function() {
                    topic.publish('toggleLayer', 1);
                }));
                on(registry.byId('radioButton2'), 'click', lang.hitch(this, function() {
                    topic.publish('toggleLayer', 2);
                })); 
                on(registry.byId('radioButton3'), 'click', lang.hitch(this, function() {
                    topic.publish('toggleLayer', 3);
                }));

                on(this.opacitySlider, 'change', lang.hitch(this, function(value) {
                    topic.publish('opacity', value);
                }));

                on(this.stretchSlider, 'change', lang.hitch(this, function(value) {
                    topic.publish('stretch', value);
                }));
            }
        });
    }
);


