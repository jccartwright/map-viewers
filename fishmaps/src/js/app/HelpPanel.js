define([
    'dojo/_base/declare',
    'dojo/_base/config',
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin', 
    'dijit/_WidgetsInTemplateMixin',
    'dojo/_base/lang',
    'dojo/on',
    'dijit/form/Button',
    'ngdc/ContactUsDialog',
    'dojo/text!./templates/HelpPanel.html'
    ],
    function(
        declare, 
        config,
        _WidgetBase, 
        _TemplatedMixin, 
        _WidgetsInTemplateMixin,
        lang,
        on,
        Button,
        ContactUsDialog,
        template
        ){
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            // Our template - important!
            templateString: template,
            // A class to be applied to the root node in our template
            baseClass: 'helpPanel',

            constructor: function() {
                this.magnifyingGlassIconUrl = config.app.ngdcDijitsUrl+'/identify/images/magnifier.png';
                this.identifyRectIconUrl = config.app.ngdcDijitsUrl+'/images/layer-shape.png';
                this.identifyPolyIconUrl = config.app.ngdcDijitsUrl+'/images/layer-shape-polygon.png';
                this.identifyCoordsIconUrl = config.app.ngdcDijitsUrl+'/images/layer-shape-xy.png';
            },

            postCreate: function() {
                this.inherited(arguments);

                on(this.contactUsButton, 'click', lang.hitch(this, function() {
                    //TODO: should we lazily construct this or put into constructor?
                    if (!this.contactUsDialog) {
                        this.contactUsDialog = new ContactUsDialog({title: 'Contact Us'});
                    }
                    this.contactUsDialog.show();
                }));
            }
        });
    }
);