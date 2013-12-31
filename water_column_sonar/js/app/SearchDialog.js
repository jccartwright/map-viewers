define([
    "dojo/_base/declare",
    "dijit/Dialog",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/Button", "dijit/form/NumberSpinner", "dijit/form/Select", "dijit/form/CheckBox", "dijit/form/MultiSelect", "dijit/form/TextBox", "dijit/form/FilteringSelect",
    "dijit/form/DateTextBox",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/dom-attr",
    "dojo/on",
    "dojo/topic",
    "dojo/text!./templates/SearchDialog.html"
    ],
    function(
        declare,
        Dialog,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Button, NumberSpinner, Select, CheckBox, MultiSelect, TextBox, FilteringSelect,   
        DateTextBox,
        lang,
        array,
        domAttr,
        on,
        topic,
        template 
    ){
        return declare([Dialog, _TemplatedMixin, _WidgetsInTemplateMixin], {

            templateString: template,
            
            // A class to be applied to the root node in template
            baseClass: "SearchDialog",            

            constructor: function(/*Object*/ kwArgs) {
                console.log("inside SearchDialog constructor...");
                lang.mixin(this, kwArgs); 
            },
            
            postCreate: function() {
                this.inherited(arguments);

                on(this.cancelButton, "click", lang.hitch(this, function(evt){
                    this.onCancel();
                }));
                on(this.resetButton, "click", lang.hitch(this, function(evt){
                    this.reset();
                })); 
                //this.clearForm();  
                this.instrumentSelect.set('value', '');             
            },

            execute: function(values) {  
                if (this.isDefault(values)) {
                    this.reset();
                }
                else {       
                    topic.publish("/wcd/Search", values);
                }
            },

            isDefault: function(values) {
                return (!values.startDate && !values.endDate &&
                    values.cruiseId == '' &&
                    values.instruments.length == 0 &&
                    isNaN(values.minNumBeams) && isNaN(values.maxNumBeams) &&
                    isNaN(values.minRecordingRange) && isNaN(values.maxRecordingRange) &&
                    isNaN(values.minSwathWidth) && isNaN(values.maxSwathWidth))
            },
                   
            clearForm: function() {
                this.startDate.reset();
                this.endDate.reset();
                this.cruiseIdText.set('value', '');
                this.instrumentSelect.set('value', '');
                this.minNumBeamsSpinner.set('value', '');
                this.maxNumBeamsSpinner.set('value', '');
                this.minRecordingRangeSpinner.set('value', '');
                this.maxRecordingRangeSpinner.set('value', '');
                this.minSwathWidthSpinner.set('value', '');
                this.maxSwathWidthSpinner.set('value', '');
                //this.frequencySelect.set('value', '');                
            },

            reset: function() {
                this.clearForm();
                topic.publish("/wcd/ResetSearch");
            }    
    });
});