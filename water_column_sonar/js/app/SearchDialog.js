define([
    'dojo/_base/declare',
    'dijit/Dialog',
    'dijit/_Widget',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/form/Button',
    'dijit/form/NumberSpinner',
    'dijit/form/Select',
    'dijit/form/CheckBox',
    'dijit/form/MultiSelect',
    'dojox/form/CheckedMultiSelect',
    'dijit/form/NumberTextBox',
    'dijit/form/FilteringSelect',
    'dijit/form/DateTextBox',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-attr',
    'dojo/on',
    'dojo/topic',
    'dojo/request/script',
    'dojo/request/xhr',
    'dojo/store/Memory',    
    'dojo/text!./templates/SearchDialog.html'
    ],
    function(
        declare,
        Dialog,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Button,
        NumberSpinner,
        Select,
        CheckBox,
        MultiSelect,
        CheckedMultiSelect,
        NumberTextBox,
        FilteringSelect,   
        DateTextBox,
        lang,
        array,
        domAttr,
        on,
        topic,
        script,
        xhr,
        Memory,
        template 
    ){
        return declare([Dialog, _TemplatedMixin, _WidgetsInTemplateMixin], {

            templateString: template,
            
            // A class to be applied to the root node in template
            baseClass: 'searchDialog',

            constructor: function(/*Object*/ kwArgs) {
                console.log('inside SearchDialog constructor...');
                lang.mixin(this, kwArgs); 
            },
            
            postCreate: function() {
                this.inherited(arguments);

                on(this.cancelButton, 'click', lang.hitch(this, function(){
                    this.onCancel();
                }));
                on(this.resetButton, 'click', lang.hitch(this, function(){
                    this.reset();
                })); 
                this.instrumentSelect.set('value', '');

                on(this.chkAllShips, 'click', lang.hitch(this, function() {
                    this.shipSelect.set('disabled', this.chkAllShips.checked);
                }));
                on(this.chkAllInstitutions, 'click', lang.hitch(this, function() {
                    this.sourceInstSelect.set('disabled', this.chkAllInstitutions.checked);
                }));
                on(this.chkAllSurveys, 'click', lang.hitch(this, function() {
                    this.surveyIdSelect.set('disabled', this.chkAllSurveys.checked);
                }));
                on(this.chkAllInstruments, 'click', lang.hitch(this, function() {
                    this.instrumentSelect.set('disabled', this.chkAllInstruments.checked);
                }));

                script.get("http://maps.ngdc.noaa.gov/mapviewer-support/wcd/ships.groovy", {
                        preventCache: true,
                        jsonp: 'callback',
                        handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateShipSelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving ships JSON: ' + err);
                });

                script.get("http://maps.ngdc.noaa.gov/mapviewer-support/wcd/institutions.groovy", {
                        preventCache: true,
                        jsonp: 'callback',
                        handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateInstitutionSelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving ships JSON: ' + err);
                });

                script.get("http://maps.ngdc.noaa.gov/mapviewer-support/wcd/surveys.groovy", {
                        preventCache: true,
                        jsonp: 'callback',
                        handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateSurveySelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving ships JSON: ' + err);
                });

                this.setFileCriteriaDisabled(true);
            },

            populateShipSelect: function(items) {
                var options = [];
                array.forEach(items, lang.hitch(this, function(item) { 
                    options.push({ value: item.id, label: item.id, selected: false });
                }));
                this.shipSelect.addOption(options);
                this.shipSelect.set('disabled', true); //Freezes the widget if it's in postCreate() for some reason
            },

            populateInstitutionSelect: function(items) {
                var options = [];
                array.forEach(items, lang.hitch(this, function(item) {
                    options.push({ value: item.id, label: item.id, selected: false });
                }));
                this.sourceInstSelect.addOption(options);
                this.sourceInstSelect.set('disabled', true); //Freezes the widget if it's in postCreate() for some reason
            },

            populateSurveySelect: function(items) {
                var options = [];
                array.forEach(items, lang.hitch(this, function(item) {    
                    options.push({ value: item.id, label: item.id, selected: false });
                }));
                this.surveyIdSelect.addOption(options);
                this.surveyIdSelect.set('disabled', true); //Freezes the widget if it's in postCreate() for some reason
            },

            execute: function(values) {  
                if (this.isDefault(values)) {
                    this.reset();
                }
                else {
                    values.bottomSoundingsOnly = this.chkBottomSoundings.checked;
                    topic.publish('/wcd/Search', values);
                }                
            },

            isDefault: function(values) {
                return (!values.startDate && !values.endDate &&
                    (this.chkAllShips.checked || values.ships.length === 0) && 
                    (this.chkAllInstitutions.checked || values.institutions.length === 0) &&
                    (this.chkAllSurveys.checked || values.surveyIds.length === 0) &&
                    (this.chkAllInstruments.checked || values.instruments.length === 0) &&
                    !values.frequency &&
                    isNaN(values.minNumBeams) && isNaN(values.maxNumBeams) &&
                    isNaN(values.minSwathWidth) && isNaN(values.maxSwathWidth)) &&
                    !this.chkBottomSoundings.checked;
            },
                   
            clearForm: function() {
                this.startDate.reset();
                this.endDate.reset();
                
                //Need to manually call _updateSelection for the CheckedMultiSelect. From here: https://bugs.dojotoolkit.org/ticket/16606
                this.shipSelect.reset();
                this.shipSelect._updateSelection();
                this.shipSelect.set('disabled', true);
                this.chkAllShips.set('checked', true);

                this.sourceInstSelect.reset();
                this.sourceInstSelect._updateSelection();
                this.sourceInstSelect.set('disabled', true);
                this.chkAllInstitutions.set('checked', true);

                this.surveyIdSelect.reset();
                this.surveyIdSelect._updateSelection();
                this.surveyIdSelect.set('disabled', true);
                this.chkAllSurveys.set('checked', true);
                 
                this.instrumentSelect.reset();
                this.instrumentSelect._updateSelection();
                this.instrumentSelect.set('disabled', true);
                this.chkAllInstruments.set('checked', true);

                this.frequencyText.set('value', '');
                //this.minFrequencySpinner.set('value', '');
                //this.maxFrequencySpinner.set('value', '');
                //this.chkAllFrequencies.set('checked', true);
                             
                this.minNumBeamsSpinner.set('value', '');
                this.maxNumBeamsSpinner.set('value', '');

                this.minSwathWidthSpinner.set('value', '');
                this.maxSwathWidthSpinner.set('value', '');

                this.chkBottomSoundings.set('checked', false);
            },

            reset: function() {
                this.clearForm();
                topic.publish('/wcd/ResetSearch');
            },

            setFileCriteriaDisabled: function(disabled) {
                this.frequencyText.set('disabled', disabled);
                this.minNumBeamsSpinner.set('disabled', disabled);
                this.maxNumBeamsSpinner.set('disabled', disabled);
                this.minSwathWidthSpinner.set('disabled', disabled);
                this.maxSwathWidthSpinner.set('disabled', disabled);
                this.chkBottomSoundings.set('disabled', disabled);

                if (disabled) { 
                    this.frequencyText.set('value', '');
                    this.minNumBeamsSpinner.set('value', '');
                    this.maxNumBeamsSpinner.set('value', '');
                    this.minSwathWidthSpinner.set('value', '');
                    this.maxSwathWidthSpinner.set('value', '');
                    this.chkBottomSoundings.set('checked', false);
                }
            }
    });
});