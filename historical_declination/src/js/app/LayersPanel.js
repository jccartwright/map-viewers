define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/topic',
    'dojo/on',
    'dijit/form/CheckBox',
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

                on(this.chkIsogonicLines, 'change', lang.hitch(this, function() {
                    topic.publish('/isogonicLines/visibility', this.chkIsogonicLines.checked);                    
                }));
                on(this.chkPoles, 'change', lang.hitch(this, function() {
                    topic.publish('/poles/visibility', this.chkPoles.checked);                    
                }));
                on(this.chkPolesTrack, 'change', lang.hitch(this, function() {
                    topic.publish('/polesTrack/visibility', this.chkPolesTrack.checked);                    
                }));
                on(this.chkObservedPoles, 'change', lang.hitch(this, function() {
                    topic.publish('/observedPoles/visibility', this.chkObservedPoles.checked);                    
                }));
            }
        });
    }
);


