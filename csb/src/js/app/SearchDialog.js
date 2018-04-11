define([
    'dojo/_base/declare',
    'dijit/Dialog',
    'dijit/_Widget',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/form/Button', 
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

                xhr('https://gis.ngdc.noaa.gov/mapviewer-support/csb/providers.groovy', {
                    preventCache: true,
                    handleAs: 'json',
                    headers: {
                        "X-Requested-With": null
                    }
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateProviderSelect(data.items);
                    }
                }), lang.hitch(this, function(err){
                    logger.error('Error retrieving providers JSON: ' + err);
                    this.populateProviderSelect(null);
                }));

                xhr('https://gis.ngdc.noaa.gov/mapviewer-support/csb/platform_names.groovy', {
                    preventCache: true,
                    handleAs: 'json',
                    headers: {
                        "X-Requested-With": null
                    }
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populatePlatformNameSelect(data.items);
                    }
                }), lang.hitch(this, function(err){
                    logger.error('Error retrieving platformNames JSON: ' + err);
                    this.populatePlatformNameSelect(null);
                }));

                xhr('https://gis.ngdc.noaa.gov/mapviewer-support/csb/platform_ids.groovy', {
                    preventCache: true,
                    handleAs: 'json',
                    headers: {
                        "X-Requested-With": null
                    }
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populatePlatformIdSelect(data.items);
                    }
                }), lang.hitch(this, function(err){
                    logger.error('Error retrieving platformIds JSON: ' + err);
                    this.populatePlatformIdSelect(null);
                }));

                xhr('https://gis.ngdc.noaa.gov/mapviewer-support/csb/instruments.groovy', {
                    preventCache: true,
                    handleAs: 'json',
                    headers: {
                        "X-Requested-With": null
                    }
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateInstrumentSelect(data.items);
                    }
                }), lang.hitch(this, function(err){
                    logger.error('Error retrieving instruments JSON: ' + err);
                    this.populateInstrumentSelect(null);
                }));
                                
                on(this.cancelButton, 'click', lang.hitch(this, function(){
                    this.onCancel();
                }));
                on(this.resetButton, 'click', lang.hitch(this, function(){
                    this.reset();
                }));    
            },

            populateProviderSelect: function(items) {                
                this.providersStore = new Memory({data: {identifier: 'id', items: items}});

                this.providerSelect = new FilteringSelect({
                    name: "id",
                    store: this.providersStore,
                    searchAttr: "id",
                    required: false,
                    style: "width:220px;"
                }); 

                //Disable the validator so we can type any value into the box (e.g. wildcards).
                this.providerSelect.validate = function() { 
                    return true; 
                };
                this.providerSelect.placeAt(this.providerSelectDiv); 
            },

            populatePlatformNameSelect: function(items) {                
                this.platformNamesStore = new Memory({data: {identifier: 'id', items: items}});

                this.platformNameSelect = new FilteringSelect({
                    name: "id",
                    store: this.platformNamesStore,
                    searchAttr: "id",
                    required: false,
                    style: "width:220px;"
                }); 

                //Disable the validator so we can type any value into the box (e.g. wildcards).
                this.platformNameSelect.validate = function() { 
                    return true; 
                };
                this.platformNameSelect.placeAt(this.platformNameSelectDiv); 
            },

            populatePlatformIdSelect: function(items) {                
                this.platformIdsStore = new Memory({data: {identifier: 'id', items: items}});

                this.platformIdSelect = new FilteringSelect({
                    name: "id",
                    store: this.platformIdsStore,
                    searchAttr: "id",
                    required: false,
                    style: "width:220px;"
                }); 

                //Disable the validator so we can type any value into the box (e.g. wildcards).
                this.platformIdSelect.validate = function() { 
                    return true; 
                };
                this.platformIdSelect.placeAt(this.platformIdSelectDiv); 
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

                //Disable the validator so we can type any value into the box (e.g. wildcards).
                this.instrumentSelect.validate = function() { 
                    return true; 
                };
                this.instrumentSelect.placeAt(this.instrumentSelectDiv); 
            },

            execute: function(values) {  
                //Use _lastDisplayedValue instead of value to handle if a user typed in a string (i.e. with wildcard) that doesn't match anything in the store. Otherwise value is empty.
                values.provider = this.providerSelect.get('_lastDisplayedValue');
                values.platformName = this.platformNameSelect.get('_lastDisplayedValue');
                values.platformId = this.platformIdSelect.get('_lastDisplayedValue');
                values.instrument = this.instrumentSelect.get('_lastDisplayedValue');
                values.zoomToResults = this.chkZoomToResults.get('value');

                if (this.isDefault(values)) {
                    topic.publish('/csb/ResetSearch');
                } else {       
                    topic.publish('/csb/Search', values);
                }
            },
                
            isDefault: function() {
                return (!this.startDateInput.get('value') && !this.endDateInput.get('value') &&
                    this.providerSelect.get('_lastDisplayedValue') === '' && 
                    this.platformNameSelect.get('_lastDisplayedValue') === '' && 
                    this.platformIdSelect.get('_lastDisplayedValue') === '' && 
                    this.instrumentSelect.get('_lastDisplayedValue') === '');
            },
                   
            clearForm: function() {
                this.startDateInput.reset();
                this.endDateInput.reset();
                this.providerSelect.set('value', '');
                this.platformNameSelect.set('value', '');
                this.platformIdSelect.set('value', '');
                this.instrumentSelect.set('value', '');
                this.chkZoomToResults.set('checked', true);
            },

            reset: function() {
                this.clearForm();
            }    
    });
});