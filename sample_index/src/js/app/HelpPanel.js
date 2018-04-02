define([
    'dojo/_base/declare',
    'dojo/_base/config',
    'dojo/on',
    'dojo/_base/lang',
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin', 
    'dojo/text!./templates/HelpPanel.html'
    ],
    function(
        declare, 
        config,
        on,
        lang,
        _WidgetBase, 
        _TemplatedMixin, 
        template
        ){
        return declare([_WidgetBase, _TemplatedMixin], {
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