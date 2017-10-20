define([
    'dojo/_base/declare',    
    'dijit/Dialog',
    'dijit/_Widget',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/form/Button',
    'dijit/form/CheckBox',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom',
    'dojo/dom-attr',
    'dojo/on',
    'dojo/io-query',
    'dijit/form/ValidationTextBox',
    'dojox/validate/web',
    'dojo/request/xhr',
    'dojo/json',
    'dojo/dom-style',
    'dojo/topic',
    'esri/geometry/Polygon',
    'esri/geometry/webMercatorUtils',
    'esri/geometry/geometryEngine',
    'esri/SpatialReference',
    'esri/config',
    'esri/tasks/GeometryService',
    'esri/tasks/ProjectParameters',
    'esri/tasks/DensifyParameters',
    'dojo/text!./templates/RequestDataDialog.html'
],
    function(
        declare,
        Dialog,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Button,
        CheckBox,
        lang,
        array,
        dom,
        domAttr,
        on,
        ioQuery,
        ValidationTextBox,
        validate,
        xhr,
        JSON,
        domStyle,
        topic,
        Polygon,
        webMercatorUtils,
        geometryEngine,
        SpatialReference,
        esriConfig,
        GeometryService,
        ProjectParameters,
        DensifyParameters,
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
                    this.updateSubmitButtonState();
                });

                //Subscribe to message sent by main SearchDialog to keep track of the current filter criteria
                topic.subscribe('/pad/Search', lang.hitch(this, function(values) {
                    this.filterValues = values;
                }));
            },

            updateSubmitButtonState: function() {
                if (this.state === '') {
                    this.submitButton.set('disabled', false);
                }
                else {
                    this.submitButton.set('disabled', true);
                }
            },

            execute: function(formContents) {
                var orderParams = {
                    name: formContents.name,
                    email: formContents.email,
                    organization: formContents.organization,
                    files: this.fileInfos
                };

                if (this.filterValues) {
                    if (this.filterValues.startDate)                 {
                        orderParams.startDate = this.toDateString(this.filterValues.startDate);
                    }
                    if (this.filterValues.endDate)                 {
                        orderParams.endDate = this.toDateString(this.filterValues.endDate);
                    }
                }

                this.submitOrder(orderParams);
            },

            submitOrder: function(orderParams) {
                var jsonString = JSON.stringify(orderParams);

                var okDialog = new Dialog({
                    title: 'Request Submitted',
                    //content: 'Your order has been received. ',
                    'class': 'requestDataDialog',
                    style: 'width:300px'
                });
                new Button({
                    label: 'OK',
                    type: 'submit',
                    onClick: lang.hitch(this, function(){
                        okDialog.destroy();
                    })
                }).placeAt(okDialog.containerNode);

                topic.publish('/ngdc/showLoading'); //Show the loading spinner
                
                xhr.post('https://gis.ngdc.noaa.gov/mapviewer-support/pad/generateOrder.groovy', {
                    data: jsonString,
                    handleAs: 'json',
                    headers: {'Content-Type':'application/json'},
                    timeout: 120000 //2 minute timeout
                }).then(lang.hitch(this, function(response){
                    logger.debug(response);
                    topic.publish('/ngdc/hideLoading'); //Hide the loading spinner
                    this.showOrderConfirmationDialog(response);
                }), function(error) {
                    var message;
                    if (error.response && error.response.text) {
                        message = JSON.parse(error.response.text).message;
                        alert('Error: ' + message);
                    } else {
                        alert('Unspecified error. Please contact pad.info@noaa.gov for assistance.');
                    }
                    topic.publish('/ngdc/hideLoading'); //Hide the loading spinner
                });
            },

            showOrderConfirmationDialog: function() {
                //var megabytes = Math.round(response.totalFileSizeInBytes / 1048576.0 * 100) / 100;
                //var gigabytes = Math.round(response.totalFileSizeInBytes / 1073741824.0 * 100) / 100;
                var okDialog = new Dialog({
                    title: 'Request Submitted',
                    content: 'Your order has been received, and a data manager will respond to your request.<br>Please contact <a href="mailto:pad.info@noaa.gov">pad.info@noaa.gov</a> with any questions.<br><br>',                            
                    'class': 'requestDataDialog',
                    style: 'width:300px'
                });
                new Button({
                    label: 'OK',
                    type: 'submit',
                    onClick: lang.hitch(this, function(){
                        okDialog.destroy();
                    })
                }).placeAt(okDialog.containerNode); 

                okDialog.show();   
            },

            //Format a date in the form yyyy-mm-dd
            toDateString: function(date) {  
                return date.getFullYear() + '-' + this.padDigits(date.getMonth()+1,2) + '-' + this.padDigits(date.getDate(),2);
            },

            padDigits: function(n, totalDigits){
                n = n.toString();
                var pd = '';
                if (totalDigits > n.length) {
                    for (var i = 0; i < (totalDigits - n.length); i++) {
                        pd += '0';
                    }
                }
                return pd + n.toString();
            }
        });
    });
