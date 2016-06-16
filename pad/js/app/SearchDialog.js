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
    'dijit/form/CheckBox', 
    'dijit/form/TextBox', 
    'dijit/form/FilteringSelect',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-attr',
    'dojo/on',
    'dojo/topic',
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
        DateTextBox, 
        Select, 
        CheckBox, 
        TextBox,
        FilteringSelect,
        lang,
        array,
        domAttr,
        on,
        topic,
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

                xhr('institutions.json', {
                    preventCache: true,
                    handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateInstitutionSelect(data.items);
                    }
                }), lang.hitch(this, function(err){
                    logger.error('Error retrieving institutions JSON: ' + err);
                    this.populateInstitutionSelect(null);
                }));

                xhr('instruments.json', {
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

                xhr('platformTypes.json', {
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
                                
                on(this.cancelButton, 'click', lang.hitch(this, function(){
                    this.onCancel();
                }));
                on(this.resetButton, 'click', lang.hitch(this, function(){
                    this.reset();
                }));    
            },

            populateInstitutionSelect: function(items) {                
                this.institutionsStore = new Memory({data: {identifier: 'id', items: items}});

                this.institutionSelect = new FilteringSelect({
                    name: "id",
                    store: this.institutionsStore,
                    searchAttr: "id",
                    required: false,
                    style: "width:220px;"
                }); 
                this.institutionSelect.placeAt(this.institutionSelectDiv); 
            },

            populateInstrumentSelect: function(items) {                
                this.instrumentsStore = new Memory({data: {identifier: 'id', items: items}});

                this.instrumentSelect = new FilteringSelect({
                    name: "id",
                    store: this.instrumentsStore,
                    searchAttr: "id",
                    required: false,
                    style: "width:220px;"
                }); 
                this.instrumentSelect.placeAt(this.instrumentSelectDiv); 
            },

            populatePlatformTypeSelect: function(items) {                
                this.platformTypesStore = new Memory({data: {identifier: 'id', items: items}});

                this.platformTypeSelect = new FilteringSelect({
                    name: "id",
                    store: this.platformTypesStore,
                    searchAttr: "id",
                    required: false,
                    style: "width:220px;"
                }); 
                this.platformTypeSelect.placeAt(this.platformTypeSelectDiv); 
            },

            execute: function(values) {  
                //Use _lastDisplayedValue instead of value to handle if a user typed in a string (i.e. with wildcard) that doesn't match anything in the store. Otherwise value is empty.
                values.institution = this.institutionSelect.get('_lastDisplayedValue');
                values.instrument = this.instrumentSelect.get('_lastDisplayedValue');
                values.platformType = this.platformTypeSelect.get('_lastDisplayedValue');                
                //values.zoomToResults = this.chkZoomToResults.get('value');

                if (this.isDefault(values)) {
                    this.reset();
                } else {       
                    topic.publish('/pad/Search', values);
                }
            },
                
            isDefault: function() {
                return (this.institutionSelect.get('_lastDisplayedValue') === '' &&
                    this.instrumentSelect.get('_lastDisplayedValue') === '' &&
                    this.platformTypeSelect.get('_lastDisplayedValue') === '' &&
                    !this.startDateInput.get('value') && !this.endDateInput.get('value') &&
                    !this.minSampleRateSpinner.get('value') && this.maxSampleRateSpinner.get('value'));
            },
                   
            clearForm: function() {                
                this.institutionSelect.set('value', '');
                this.instrumentSelect.set('value', '');
                this.platformTypeSelect.set('value', '');
                this.startDateInput.reset();
                this.endDateInput.reset();                                            
                //this.chkZoomToResults.set('checked', true);                             
            },

            reset: function() {
                this.clearForm();
                topic.publish('/pad/ResetSearch');
            }    
    });
});