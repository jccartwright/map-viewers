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
    'dijit/form/TextBox',
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
        TextBox,
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
                //this.clearForm();  
                this.instrumentSelect.set('value', '');

                on(this.chkAllShips, 'click', lang.hitch(this, function() {
                    this.shipSelect.set('disabled', this.chkAllShips.checked);
                }));
                on(this.chkAllInst, 'click', lang.hitch(this, function() {
                    this.sourceInstSelect.set('disabled', this.chkAllInst.checked);
                }));                

                //script.get("http://mapdevel.ngdc.noaa.gov/viewers-2.0/map-viewers/water_column_sonar/ships.json", {
                xhr("http://mapdevel.ngdc.noaa.gov/viewers-2.0/map-viewers/water_column_sonar/ships.json", {
                        //preventCache: true,
                        //jsonp: 'callback',
                        handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateShipSelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving ships JSON');
                });

                //script.get("http://mapdevel.ngdc.noaa.gov/viewers-2.0/map-viewers/water_column_sonar/ships.json", {
                xhr("http://mapdevel.ngdc.noaa.gov/viewers-2.0/map-viewers/water_column_sonar/institutions.json", {
                        //preventCache: true,
                        //jsonp: 'callback',
                        handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateInstitutionSelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving institutions JSON');
                });

                this.setFileCriteriaDisabled(true);
            },

            populateShipSelect: function(items) {
                array.forEach(items, lang.hitch(this, function(item) {                    
                    var option = { value: item.name, label: item.name, selected: false };
                    this.shipSelect.addOption(option);
                }));
                this.shipSelect.set('disabled', true); //Freezes the widget if it's in postCreate() for some reason
            },

            populateInstitutionSelect: function(items) {
                array.forEach(items, lang.hitch(this, function(item) {                    
                    var option = { value: item.id, label: item.id, selected: false };
                    this.sourceInstSelect.addOption(option);
                }));
                this.sourceInstSelect.set('disabled', true); //Freezes the widget if it's in postCreate() for some reason
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
                    (this.chkAllInst.checked || values.institutions.length === 0) &&
                    values.surveyId === '' &&
                    values.instruments.length === 0 &&
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
                this.chkAllShips.set('checked', true);

                this.sourceInstSelect.reset();
                this.sourceInstSelect._updateSelection();
                this.chkAllInst.set('checked', true);

                this.surveyIdSelect.set('value', '');
                 
                this.instrumentSelect.reset();
                this.instrumentSelect._updateSelection();

                this.minFrequencySpinner.set('value', '');
                this.maxFrequencySpinner.set('value', '');
                this.chkAllFrequencies.set('checked', true);
                             
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
                this.minNumBeamsSpinner.set('disabled', disabled);
                this.maxNumBeamsSpinner.set('disabled', disabled);
                this.minSwathWidthSpinner.set('disabled', disabled);
                this.maxSwathWidthSpinner.set('disabled', disabled);
                this.chkBottomSoundings.set('disabled', disabled);

                if (disabled) { 
                    this.minNumBeamsSpinner.set('value', '');
                    this.maxNumBeamsSpinner.set('value', '');
                    this.minSwathWidthSpinner.set('value', '');
                    this.maxSwathWidthSpinner.set('value', '');
                    this.chkBottomSoundings.set('checked', false);
                }
            }
    });
});