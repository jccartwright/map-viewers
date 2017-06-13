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
                on(this.chkAllFrequencies, 'click', lang.hitch(this, function() {
                    this.setFrequencyCheckboxesDisabled(this.chkAllFrequencies.checked);
                }));

                script.get("//maps.ngdc.noaa.gov/mapviewer-support/wcd/ships.groovy", {
                        preventCache: true,
                        jsonp: 'callback',
                        handleAs: 'json'
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateShipSelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving ships JSON: ' + err);
                });

                script.get("//maps.ngdc.noaa.gov/mapviewer-support/wcd/institutions.groovy", {
                        preventCache: true,
                        jsonp: 'callback',
                        handleAs: 'json'
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateInstitutionSelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving institutions JSON: ' + err);
                });

                script.get("//maps.ngdc.noaa.gov/mapviewer-support/wcd/surveys.groovy", {
                        preventCache: true,
                        jsonp: 'callback',
                        handleAs: 'json'
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateSurveySelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving surveys JSON: ' + err);
                });
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
                values.frequencies = this.getFrequencies();
                if (this.isDefault(values)) {
                    this.reset();
                }
                else {
                    values.bottomSoundingsOnly = this.chkBottomSoundings.checked;
                    values.zoomToResults = this.chkZoomToResults.checked;
                    topic.publish('/wcd/Search', values);
                }                
            },

            getFrequencies: function() {
                var frequencies = [];
                for (var i = 0; i < 7; i++) {
                    frequencies.push([]);
                }

                if (!this.chkAllFrequencies.checked) {
                    if (this.chkNarrowband18.checked) {
                        frequencies[0].push('18');
                    }
                    if (this.chkBroadband18.checked) {
                        frequencies[0].push('18W');
                    }
                    if (this.chkNarrowband38.checked) {
                        frequencies[1].push('38');
                    }
                    if (this.chkBroadband38.checked) {
                        frequencies[1].push('38W');
                    }
                    if (this.chkNarrowband70.checked) {
                        frequencies[2].push('70');
                    }
                    if (this.chkBroadband70.checked) {
                        frequencies[2].push('70W');
                    }
                    if (this.chkNarrowband120.checked) {
                        frequencies[3].push('120');
                    }
                    if (this.chkBroadband120.checked) {
                        frequencies[3].push('120W');
                    }
                    if (this.chkNarrowband200.checked) {
                        frequencies[4].push('200');
                    }
                    if (this.chkBroadband200.checked) {
                        frequencies[4].push('200W');
                    }
                    if (this.chkNarrowband710.checked) {
                        frequencies[5].push('710');
                    }
                }
                return frequencies;
            },

            isDefault: function(values) {
                return (!values.startDate && !values.endDate &&
                    (this.chkAllShips.checked || values.ships.length === 0) && 
                    (this.chkAllInstitutions.checked || values.institutions.length === 0) &&
                    (this.chkAllSurveys.checked || values.surveyIds.length === 0) &&
                    (this.chkAllInstruments.checked || values.instruments.length === 0) &&
                    (this.chkAllFrequencies.checked || values.frequencies.length === 0) &&
                    isNaN(values.minFrequency) && isNaN(values.maxFrequency) &&
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
                
                this.setFrequencyCheckboxesDisabled(true);
                this.chkNarrowband18.set('checked', false);
                this.chkBroadband18.set('checked', false);
                this.chkNarrowband38.set('checked', false);
                this.chkBroadband38.set('checked', false);
                this.chkNarrowband18.set('checked', false);
                this.chkNarrowband70.set('checked', false);
                this.chkBroadband70.set('checked', false);
                this.chkNarrowband120.set('checked', false);
                this.chkBroadband120.set('checked', false);
                this.chkNarrowband200.set('checked', false);
                this.chkBroadband200.set('checked', false);
                this.chkNarrowband710.set('checked', false);

                this.chkAllFrequencies.set('checked', true);

                this.chkBottomSoundings.set('checked', false);
                this.chkZoomToResults.set('checked', true);
            },

            reset: function() {
                this.clearForm();
                topic.publish('/wcd/ResetSearch');
            },

            setFrequencyCheckboxesDisabled: function(disabled) {
                this.chkNarrowband18.set('disabled', disabled);
                this.chkBroadband18.set('disabled', disabled);
                this.chkNarrowband38.set('disabled', disabled);
                this.chkBroadband38.set('disabled', disabled);
                this.chkNarrowband70.set('disabled', disabled);
                this.chkBroadband70.set('disabled', disabled);
                this.chkNarrowband120.set('disabled', disabled);
                this.chkBroadband120.set('disabled', disabled);
                this.chkNarrowband200.set('disabled', disabled);
                this.chkBroadband200.set('disabled', disabled);
                this.chkNarrowband710.set('disabled', disabled);
            }
    });
});