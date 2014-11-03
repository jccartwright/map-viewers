define([
    'dojo/_base/declare',
    'dijit/Dialog',
    'dijit/_Widget',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/form/Button',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-attr',
    'dojo/on',
    'dijit/form/ValidationTextBox',
    'dojox/validate/web',
    'dojo/request/xhr',
    'dojo/json',
    'dojo/text!./templates/RequestDataDialog.html'
],
    function(
        declare,
        Dialog,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Button,
        lang,
        array,
        domAttr,
        on,
        ValidationTextBox,
        validate,
        xhr,
        JSON,
        template
        ){
        return declare([Dialog, _TemplatedMixin, _WidgetsInTemplateMixin], {

            templateString: template,

            // A class to be applied to the root node in template
            baseClass: 'requestDataDialog',
            title: 'Request Data',

            constructor: function(/*Object*/ kwArgs) {
                this.filenames = arguments.filenames;
                lang.mixin(this, kwArgs);
            },

            postCreate: function() {
                this.inherited(arguments);

                on(this.cancelButton, 'click', lang.hitch(this, function(){
                    this.onCancel();
                }));

                //Is the form valid? Watch the 'state' property and enable/disable the submit button
                this.watch('state', function() {
                    if (this.state === '') {
                        this.submitButton.set('disabled', false);
                    }
                    else {
                        this.submitButton.set('disabled', true);
                    }
                });
            },

            execute: function(formContents) {
                var jsonString = JSON.stringify({
                    name: formContents.name,
                    email: formContents.email,
                    organization: formContents.organization,
                    files: this.fileInfos,
                    cruiseAndInstrumentPairs: this.cruiseInfos
                });

                var okDialog = new Dialog({
                    title: 'Request Submitted',
                    content: 'Your order has been received. We will contact you when your order is ready for pickup. Please contact the water column sonar data manager at <a href="mailto:wcd.info@noaa.gov">wcd.info@noaa.gov</a> if you have any questions.',
                    class: 'requestDataDialog',
                    style: 'width:300px'
                });
                new Button({
                    label: 'OK',
                    type: 'submit',
                    onClick: lang.hitch(this, function(){
                        okDialog.destroy();
                    })
                }).placeAt(okDialog.containerNode);

                xhr.post(
                    'http://maps.ngdc.noaa.gov/mapviewer-support/wcd/generateOrder.groovy', {
                        data: jsonString,
                        handleAs: 'json',
                        headers: {'Content-Type':'application/json'}
                    }).then(function(response){
                        logger.debug(response);
                        okDialog.show();
                    }, function(error) {
                        alert('Error: ' + error);
                    });

            }
        });
    });
