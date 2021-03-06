define([
    'dojo/_base/declare',
    'dijit/Dialog',
    'dijit/_Widget',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/form/Button', 
    'dijit/form/NumberSpinner', 
    'dijit/form/DateTextBox',
    'dijit/form/Select',
    'dojox/form/CheckedMultiSelect',
    'dijit/form/CheckBox', 
    'dijit/form/TextBox', 
    'dijit/form/FilteringSelect',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-attr',
    'dojo/on',
    'dojo/topic',
    'dojo/request/xhr',
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
        DateTextBox, 
        Select, 
        CheckedMultiSelect,
        CheckBox, 
        TextBox,
        FilteringSelect,
        lang,
        array,
        domAttr,
        on,
        topic,
        xhr,
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

                xhr('https://gis.ngdc.noaa.gov/mapviewer-support/pad/source-organizations.groovy', {
                    preventCache: true,
                    handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateSourceOrganizationSelect(data.items);
                    }
                }), lang.hitch(this, function(err){
                    logger.error('Error retrieving sourceOrganizations JSON: ' + err);
                    this.populateSourceOrganizationSelect(null);
                }));

                xhr('https://gis.ngdc.noaa.gov/mapviewer-support/pad/funding-organizations.groovy', {
                    preventCache: true,
                    handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateFundingOrganizationSelect(data.items);
                    }
                }), lang.hitch(this, function(err){
                    logger.error('Error retrieving fundingOrganizations JSON: ' + err);
                    this.populateFundingOrganizationSelect(null);
                }));

                xhr('https://gis.ngdc.noaa.gov/mapviewer-support/pad/instruments.groovy', {
                    preventCache: true,
                    handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateInstrumentSelect(data.items);
                    }
                }), lang.hitch(this, function(err){
                    logger.error('Error retrieving instruments JSON: ' + err);
                    this.populateInstrumentSelect(null);
                }));

                xhr('https://gis.ngdc.noaa.gov/mapviewer-support/pad/platforms.groovy', {
                    preventCache: true,
                    handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populatePlatformTypeSelect(data.items);
                    }
                }), lang.hitch(this, function(err){
                    logger.error('Error retrieving platforms JSON: ' + err);
                    this.populatePlatformTypeSelect(null);
                }));

                xhr('https://gis.ngdc.noaa.gov/mapviewer-support/pad/projects.groovy', {
                    preventCache: true,
                    handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateProjectSelect(data.items);
                    }
                }), lang.hitch(this, function(err){
                    logger.error('Error retrieving projects JSON: ' + err);
                    this.populateProjectSelect(null);
                }));

                on(this.chkAllSourceOrganizations, 'click', lang.hitch(this, function() {
                    this.sourceOrganizationSelect.set('disabled', this.chkAllSourceOrganizations.checked);
                }));
                on(this.chkAllFundingOrganizations, 'click', lang.hitch(this, function() {
                    this.fundingOrganizationSelect.set('disabled', this.chkAllFundingOrganizations.checked);
                }));
                on(this.chkAllInstruments, 'click', lang.hitch(this, function() {
                    this.instrumentSelect.set('disabled', this.chkAllInstruments.checked);
                }));
                on(this.chkAllPlatformTypes, 'click', lang.hitch(this, function() {
                    this.platformTypeSelect.set('disabled', this.chkAllPlatformTypes.checked);
                }));
                on(this.chkAllProjects, 'click', lang.hitch(this, function() {
                    this.projectSelect.set('disabled', this.chkAllProjects.checked);
                }));
                
                on(this.cancelButton, 'click', lang.hitch(this, function(){
                    this.onCancel();
                }));
                on(this.resetButton, 'click', lang.hitch(this, function(){
                    this.reset();
                }));    
            },

            populateSourceOrganizationSelect: function(items) {
                var options = [];
                array.forEach(items, lang.hitch(this, function(item) { 
                    options.push({ value: item.id, label: item.id, selected: false });
                }));
                this.sourceOrganizationSelect.addOption(options);
                this.sourceOrganizationSelect.set('disabled', true); //Freezes the widget if it's in postCreate() for some reason
            },

            populateFundingOrganizationSelect: function(items) {
                var options = [];
                array.forEach(items, lang.hitch(this, function(item) { 
                    options.push({ value: item.id, label: item.id, selected: false });
                }));
                this.fundingOrganizationSelect.addOption(options);
                this.fundingOrganizationSelect.set('disabled', true); //Freezes the widget if it's in postCreate() for some reason
            },
            
            populateInstrumentSelect: function(items) {
                var options = [];
                array.forEach(items, lang.hitch(this, function(item) { 
                    options.push({ value: item.id, label: item.id, selected: false });
                }));
                this.instrumentSelect.addOption(options);
                this.instrumentSelect.set('disabled', true); //Freezes the widget if it's in postCreate() for some reason
            },

            populatePlatformTypeSelect: function(items) {
                var options = [];
                array.forEach(items, lang.hitch(this, function(item) { 
                    options.push({ value: item.id, label: item.id, selected: false });
                }));
                this.platformTypeSelect.addOption(options);
                this.platformTypeSelect.set('disabled', true); //Freezes the widget if it's in postCreate() for some reason
            },

            populateProjectSelect: function(items) {
                var options = [];
                array.forEach(items, lang.hitch(this, function(item) { 
                    options.push({ value: item.id, label: item.id, selected: false });
                }));
                this.projectSelect.addOption(options);
                this.projectSelect.set('disabled', true); //Freezes the widget if it's in postCreate() for some reason
            },

            execute: function(values) {  
                values.recordingDuration = this.recordingDurationSelect.get('value');
                values.numChannels = this.numChannelsSelect.get('value');
                values.zoomToResults = this.chkZoomToResults.checked;

                if (this.isDefault(values)) {
                    topic.publish('/pad/ResetSearch');
                } else {
                     
                    topic.publish('/pad/Search', values);
                }
            },
                
            isDefault: function(values) {
                return (!values.startDate && !values.endDate &&
                    (this.chkAllSourceOrganizations.checked || values.sourceOrganizations.length === 0) && 
                    (this.chkAllFundingOrganizations.checked || values.fundingOrganizations.length === 0) &&
                    (this.chkAllInstruments.checked || values.instruments.length === 0) &&
                    (this.chkAllPlatformTypes.checked || values.platformTypes.length === 0) &&
                    (this.chkAllProjects.checked || values.projects.length === 0) &&
                    !values.minSampleRate && !values.maxSampleRate && !values.minSensorDepth && !values.maxSensorDepth &&
                    !values.minBottomDepth && !values.maxBottomDepth &&
                    values.recordingDuration === '' && values.numChannels === '');
            },
                   
            clearForm: function() {
                this.startDateInput.reset();
                this.endDateInput.reset();

                this.sourceOrganizationSelect.reset();
                this.sourceOrganizationSelect._updateSelection();
                this.sourceOrganizationSelect.set('disabled', true);
                this.chkAllSourceOrganizations.set('checked', true);

                this.fundingOrganizationSelect.reset();
                this.fundingOrganizationSelect._updateSelection();
                this.fundingOrganizationSelect.set('disabled', true);
                this.chkAllFundingOrganizations.set('checked', true);

                this.instrumentSelect.reset();
                this.instrumentSelect._updateSelection();
                this.instrumentSelect.set('disabled', true);
                this.chkAllInstruments.set('checked', true);

                this.platformTypeSelect.reset();
                this.platformTypeSelect._updateSelection();
                this.platformTypeSelect.set('disabled', true);
                this.chkAllPlatformTypes.set('checked', true);

                this.projectSelect.reset();
                this.projectSelect._updateSelection();
                this.projectSelect.set('disabled', true);
                this.chkAllProjects.set('checked', true);

                this.minSampleRateSpinner.set('value', '');
                this.maxSampleRateSpinner.set('value', '');

                this.minSensorDepthSpinner.set('value', '');
                this.maxSensorDepthSpinner.set('value', '');

                this.minBottomDepthSpinner.set('value', '');
                this.maxBottomDepthSpinner.set('value', '');

                this.recordingDurationSelect.set('value', '');

                this.numChannelsSelect.set('value', '');
                
                this.chkZoomToResults.set('checked', true);
            },

            reset: function() {
                this.clearForm();
            }    
    });
});