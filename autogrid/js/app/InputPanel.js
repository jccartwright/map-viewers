define([
    'dojo/_base/declare',
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/topic',
    'dojo/_base/lang',
    'dojo/on',
    'dojo/number',
    'dojo/dom-style',
    'esri/geometry/webMercatorUtils',
    'dijit/form/Button',
    'dijit/form/Form',
    'dijit/form/ValidationTextBox',
    'dojo/text!./templates/InputPanel.html'
    ],
    function(
        declare, 
        _WidgetBase, 
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        topic,
        lang,
        on,
        number,
        domStyle,
        webMercatorUtils,
        Button,
        Form,
        ValidationTextBox,
        template
        ){
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            // Our template - important!
            templateString: template,

            // A class to be applied to the root node in our template
            baseClass: 'inputPanel',

            constructor: function() {
                //listen for events from the maptoolbar containing envelope
                topic.subscribe('/ngdc/geometry', lang.hitch(this, 'updateBBox'));

            },

            postCreate: function() {
                this.inherited(arguments);
                on(this.submitButton, 'click', lang.hitch(this,'submitNextOrder'));
            },

            submitNextOrder: function(evt) {
                console.log('inside submitNextOrder...',evt);

                /*
                 console.log('submitting NEXT order...');
                 var data = {"email" : dom.byId('email').value };

                 var gridOptionsDijit = registry.byId('gridOptions');
                 var mapOptionsDijit = registry.byId('mapOptions');

                 if (! data.email || ! gridOptionsDijit.validate() || ! mapOptionsDijit.validate()) {
                 console.warn("missing or invalid data - cannot submit NEXT request");
                 return;
                 }

                 lang.mixin(data, gridOptionsDijit.getData());
                 lang.mixin(data, mapOptionsDijit.getData());
                 console.log(data);
                 */

            },

            updateBBox: function(data) {
                console.log('inside updateBBox with ',data);
            },

            validate: function() {
                console.log('inside validate...');
                //TODO
                return true
            },

            getData: function() {
                console.log('inside getData...');
                //TODO
                return {};
            }
        });
    }
);
