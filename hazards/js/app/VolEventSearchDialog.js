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
    "dojo/text!./templates/VolEventSearchDialog.html"
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

                //this.reset();
            },

            execute: function(values) {
                values.volcanoName = this.volcanoNameText.get('value');
                values.country = this.countrySelect.get('value');
                values.morphology = this.morphologySelect.get('value');
                values.timeOfEruption = this.timeOfEruptionSelect.get('value');
                values.startYear = this.startYearSpinner.get('value');
                values.endYear = this.endYearSpinner.get('value');  
                values.minVei = this.minVeiSpinner.get('value');
                values.maxVei = this.maxVeiSpinner.get('value');
                values.minDeaths = this.minDeathsSelect.get('value');
                values.maxDeaths = this.maxDeathsSelect.get('value');
                values.minDamage = this.minDamageSelect.get('value');
                values.maxDamage = this.maxDamageSelect.get('value');
                values.tsunamiAssoc = this.checkTsunamiAssoc.get('checked');
                
                if (this.isDefault(values)) {
                    this.reset();
                } else {
                    topic.publish("/hazards/VolEventSearch", values);
                }
            },
                   
            clearForm: function() {
                this.volcanoNameText.set('value', '');
                this.countrySelect.set('value', '');
                this.morphologySelect.set('value', '');
                this.timeOfEruptionSelect.set('value', '');
                this.startYearSpinner.set('value', '');
                this.endYearSpinner.set('value', '');   
                this.minVeiSpinner.set('value', '');
                this.maxVeiSpinner.set('value', '');
                this.minDeathsSelect.set('value', '');
                this.maxDeathsSelect.set('value', '');
                this.minDamageSelect.set('value', '');
                this.maxDamageSelect.set('value', '');
                this.checkTsunamiAssoc.set('checked', false);
            },

            reset: function() {
                this.clearForm();
                topic.publish("/hazards/ResetVolEventSearch");
            },

            isDefault: function(values) {
                return (values.volcanoName === '' && values.country === '' && values.morphology === '' && values.timeOfEruption === '' &&
                    !values.startYear && !values.endYear && !values.minVei && !values.maxVei && values.minDeaths === '' && values.maxDeaths === '' &&
                    values.minDamage === '' && values.maxDamage === '' && !values.tsunamiAssoc);
            }
    });
});