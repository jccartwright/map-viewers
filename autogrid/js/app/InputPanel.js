define([
    'dojo/_base/declare',
    'dijit/registry',
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/Dialog',
    'dojo/request/xhr',
    'dojo/topic',
    'dojo/_base/lang',
    'dojo/on',
    'dojo/number',
    'dojo/dom-style',
    'esri/geometry/webMercatorUtils',
    'dijit/form/Button',
    'dijit/form/Form',
    'dijit/form/ValidationTextBox',
    'dijit/Tooltip',
    'dojox/validate/web',
    'dojo/text!./templates/InputPanel.html'
    ],
    function(
        declare,
        registry,
        _WidgetBase, 
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Dialog,
        xhr,
        topic,
        lang,
        on,
        number,
        domStyle,
        webMercatorUtils,
        Button,
        Form,
        ValidationTextBox,
        Tooltip,
        validate,
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


             //{
             //"email": "user@example.com",
             //"items": [{
             //"dataset": "Autogrid",
             //"geometry": "-145.15625, 40.80315, -136.54297, 46.27649",
             //"gridCellSize": 1060,
             //"backgroundFill": true
             //}]
             //}


            submitNextOrder: function(evt) {
                console.log('inside submitNextOrder...',evt);

                var data = {
                    "email": registry.byId('email').value,
                    "items": []
                };

                 var gridOptionsDijit = registry.byId('gridOptions');
                 var mapOptionsDijit = registry.byId('mapOptions');

                 if (! data.email || ! gridOptionsDijit.validate() || ! mapOptionsDijit.validate()) {
                    console.warn("missing or invalid data - cannot submit NEXT request");
                    alert("ERROR: Your request cannot be submitted because it has missing or invalid data.");
                    return;
                 }

                var jobOptions = {
                    "dataset": "Autogrid"
                };

                lang.mixin(jobOptions, gridOptionsDijit.getData());
                lang.mixin(jobOptions, mapOptionsDijit.getData());
                data.items[0] = jobOptions;

                var okDialog = new Dialog({
                    title: 'Request Submitted',
                    content: 'Your order has been received. We will contact you when your order is ready for pickup.',
                    class: 'requestDataDialog',
                    style: 'width:300px'
                });
                new Button({
                    label: 'OK',
                    type: 'submit',
                    onClick: lang.hitch(this, function(){
                        //TODO reset form?
                        okDialog.destroy();
                    })
                }).placeAt(okDialog.containerNode);

                xhr.post(
                    '//www.ngdc.noaa.gov/next-web/rest/orders', {
                        data: JSON.stringify(data),
                        handleAs: 'json',
                        headers: {'Content-Type':'application/json'}
                    }).then(function(response){
                        logger.debug(response);
                        okDialog.show();
                    }, function(error) {
                        alert('Error: ' + error);
                    });
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
