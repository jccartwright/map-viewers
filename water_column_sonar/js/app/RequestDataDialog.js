define([
    "dojo/_base/declare",
    "dijit/Dialog",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/Button",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/dom-attr",
    "dojo/on",
    "dijit/form/ValidationTextBox",
    "dojox/validate/web",
    "dojo/request/xhr",
    "dojo/json",
    "dojo/text!./templates/RequestDataDialog.html"
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
            baseClass: "requestDataDialog",
            title: "Request Data",

            constructor: function(/*Object*/ kwArgs) {
                console.log("inside RequestDataDialog constructor...");
                this.filenames = arguments.filenames;
                lang.mixin(this, kwArgs);
            },

            postCreate: function() {
                this.inherited(arguments);

                on(this.cancelButton, "click", lang.hitch(this, function(evt){
                    this.onCancel();
                }));

                //Is the form valid? Watch the 'state' property and enable/disable the submit button
                this.watch('state', function() {
                    if (this.state == '') {
                        this.submitButton.set('disabled', false);
                    }
                    else {
                        this.submitButton.set('disabled', true);
                    }
                });
            },

            execute: function(formContents) {
                console.log('Name: ' + formContents.name);
                console.log('Email: ' + formContents.email);
                console.log('Files: ' + this.filenames.join(','));

                var jsonString = JSON.stringify({
                    name: formContents.name,
                    email: formContents.email,
                    files: this.filenames
                });

                xhr.post(
                    "http://agsdevel.ngdc.noaa.gov/mapviewer-support/wcd/generateOrder.groovy", {
                        data: jsonString,
                        handleAs: "json",
                        headers: {'Content-Type':'application/json'}
                    }).then(function(response){
                        alert('Thank you for contacting us.');
                    }, function(error) {
                        alert('Error: ' + error);
                    });
            }


        });
    });
