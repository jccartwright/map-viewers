define([
    "dojo/_base/declare",
    "dijit/Dialog",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/Button", "dijit/form/NumberSpinner", "dijit/form/Select", "dijit/form/CheckBox", "dijit/form/MultiSelect", "dijit/form/TextBox", "dijit/form/FilteringSelect",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/dom-attr",
    "dojo/on",
    "dojo/topic",
    "dojo/text!./templates/TsEventSearchDialog.html"
    ],
    function(
        declare,
        Dialog,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Button, NumberSpinner, Select, CheckBox, MultiSelect, TextBox, FilteringSelect,   
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
                console.log("inside TsEventSearchDialog constructor...");
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

                this.tsEventCauseSelect.set('value', '');           
            },

            buildRendering: function() {
                console.log('inside buildRendering...');
                this.inherited(arguments);
            },

            execute: function(values) {
                values.startYear = this.startYearSpinner.get('value');      
                values.endYear = this.endYearSpinner.get('value');
                values.sourceLocationName = this.sourceLocationText.get('value');       
                values.sourceRegion = this.sourceRegionSelect.get('value');
                values.sourceCountry = this.sourceCountrySelect.get('value');
                values.sourceCause = this.tsEventCauseSelect.get('value');
                values.minDeaths = this.minDeathsSelect.get('value');       
                values.maxDeaths = this.maxDeathsSelect.get('value');
                values.minDamage = this.minDamageSelect.get('value');
                values.maxDamage = this.maxDamageSelect.get('value');
                values.minEventValidity = this.minEventValiditySelect.get('value');
                values.maxEventValidity = this.maxEventValiditySelect.get('value');

                if (this.isDefault(values)) {
                    this.reset();
                } else {
                    topic.publish("/hazards/TsEventSearch", values);
                }
            },
                   
            clearForm: function() {
                this.startYearSpinner.set('value', '');
                this.endYearSpinner.set('value', '');
                this.sourceLocationText.set('value', '');       
                this.sourceRegionSelect.set('value', '');
                this.sourceCountrySelect.set('value', '');
                this.tsEventCauseSelect.set('value', '');
                this.minDeathsSelect.set('value', '');      
                this.maxDeathsSelect.set('value', '');
                this.minDamageSelect.set('value', '');
                this.maxDamageSelect.set('value', '');
                this.minEventValiditySelect.set('value', '1');
                this.maxEventValiditySelect.set('value', '');
            },

            reset: function() {
                this.clearForm();
                topic.publish("/hazards/ResetTsEventSearch");
            },

            isDefault: function(values) {
                return (!values.startYear && !values.endYear && values.sourceLocationName === '' && values.sourceRegion === '' &&
                    values.sourceCountry === '' && values.sourceCause.length == 0 && values.minDeaths === '' && values.maxDeaths === '' &&
                    values.minDamage === '' && values.maxDamage === '' && values.minEventValidity === '1' && values.maxEventValidity === '');
            }
    });
});