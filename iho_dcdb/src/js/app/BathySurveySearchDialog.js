define([
    'dojo/_base/declare',
    'dijit/Dialog',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/form/Button', 
    'dijit/form/NumberSpinner', 
    'dijit/form/Select', 
    'dijit/form/CheckBox', 
    'dijit/form/TextBox', 
    'dijit/form/FilteringSelect',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/on',
    'dojo/topic',
    'dojo/request/xhr',
    'dojo/store/Memory', 
    'dojo/text!./templates/BathySurveySearchDialog.html'
],
    function(
        declare,
        Dialog,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Button, 
        NumberSpinner, 
        Select, 
        CheckBox, 
        TextBox, 
        FilteringSelect,
        lang,
        array,
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

                this.multibeamVisible = true; //visible on startup
                this.nosHydroVisible = false;
                this.nosHydroAllVisible = false;
                this.nosBagsVisible = false;
                this.tracklineVisible = false;
            },
                
            postCreate: function() {                                                                        
                this.inherited(arguments);

                xhr('https://gis.ngdc.noaa.gov/mapviewer-support/bathymetry/platforms.groovy', {
                    preventCache: true,
                    handleAs: 'json'
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populatePlatformSelect(data.items);
                    }
                }), lang.hitch(this, function(err){
                    logger.error('Error retrieving platforms JSON: ' + err);
                    this.populatePlatformSelect(null);
                }));

                xhr('https://gis.ngdc.noaa.gov/mapviewer-support/bathymetry/institutions.groovy', {
                    preventCache: true,
                    handleAs: 'json'
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateInstitutionSelect(data.items);
                    }
                }), lang.hitch(this, function(err){
                    logger.error('Error retrieving institutions JSON: ' + err);
                    this.populateInstitutionSelect(null);
                }));

                xhr('https://gis.ngdc.noaa.gov/mapviewer-support/bathymetry/surveys.groovy', {
                    preventCache: true,
                    handleAs: 'json'
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateSurveySelect(data.items);
                    }
                }), lang.hitch(this, function(err){
                    logger.error('Error retrieving surveys JSON: ' + err);
                    this.populateSurveySelect(null);
                }));

                on(this.cancelButton, 'click', lang.hitch(this, function(){
                    this.onCancel();
                }));
                on(this.resetButton, 'click', lang.hitch(this, function(){
                    this.reset();
                })); 
                on(this.startYearSpinner, 'change', lang.hitch(this, function(){
                    this.filterSelects();
                }));
                on(this.endYearSpinner, 'change', lang.hitch(this, function(){
                    this.filterSelects();
                }));

                //Subscribe to message to show/hide an entire service. Handles the Multibeam, and Trackline layers.
                topic.subscribe('/ngdc/layer/visibility', lang.hitch(this, function (svcId, visible) {
                    if (svcId === 'Multibeam') {
                        this.multibeamVisible = visible;                    
                    } else if (svcId === 'Trackline Bathymetry') {
                        this.tracklineVisible = visible;
                    } else if (svcId === 'NOS Hydrographic Surveys') {
                        this.nosHydroVisible = visible;
                    }
                    this.filterSelects();
                    this.setActiveLayersText();
                }));

                //Subscribe to message to show/hide sublayers from a service. Handles the NOS Hydro BAGs and Digital layers.
                topic.subscribe('/ngdc/sublayer/visibility', lang.hitch(this, function (svcId, sublayers, visible) {
                    if (svcId === 'NOS Hydrographic Surveys') {
                        if (array.indexOf(sublayers, 1) > -1 || array.indexOf(sublayers, 2) > -1) {
                            this.nosHydroAllVisible = visible;
                        } else if (array.indexOf(sublayers, 0) > -1) {
                            this.nosBagsVisible = visible;
                        }
                    }
                    this.filterSelects();
                    this.setActiveLayersText();
                }));
            },

            populateSurveySelect: function(items) {                
                this.surveysStore = new Memory({data: {identifier: 'id', items: items}});

                this.surveySelect = new FilteringSelect({
                    name: 'id',
                    store: this.surveysStore,
                    searchAttr: 'id',
                    required: false,
                    style: 'width:220px;'
                });

                //Disable the validator so we can type any value into the box (e.g. wildcards).
                this.surveySelect.validate = function() { 
                    return true; 
                };
                this.surveySelect.placeAt(this.surveySelectDiv);  
            },

            populatePlatformSelect: function(items) {                
                this.platformsStore = new Memory({data: {identifier: 'id', items: items}});

                this.platformSelect = new FilteringSelect({
                    name: 'id',
                    store: this.platformsStore,
                    searchAttr: 'id',
                    required: false,
                    style: 'width:220px;'
                }); 

                //Disable the validator so we can type any value into the box (e.g. wildcards).
                this.platformSelect.validate = function() { 
                    return true; 
                };
                this.platformSelect.placeAt(this.platformSelectDiv);

                on(this.platformSelect, 'change', lang.hitch(this, function(){
                    this.surveySelect.set('value', '');
                    this.filterSelects();
                }));  
            },

            populateInstitutionSelect: function(items) {                
                this.institutionsStore = new Memory({data: {identifier: 'id', items: items}});

                this.institutionSelect = new FilteringSelect({
                    name: 'id',
                    store: this.institutionsStore,
                    searchAttr: 'id',
                    required: false,
                    style: 'width:220px;'
                }); 

                //Disable the validator so we can type any value into the box (e.g. wildcards).
                this.institutionSelect.validate = function() { 
                    return true; 
                };
                this.institutionSelect.placeAt(this.institutionSelectDiv);

                on(this.institutionSelect, 'change', lang.hitch(this, function(){
                    this.surveySelect.set('value', '');
                    this.filterSelects();
                }));  
            },

            filterSelects: function() {
                if (!this.startYearSpinner || !this.endYearSpinner || !this.platformSelect || !this.institutionSelect || !this.surveySelect) {
                    //guard against calling this function before the widgets are initialized
                    return;
                }

                var minYear = this.startYearSpinner.get('value') || null;
                var maxYear = this.endYearSpinner.get('value') || null;
                var selectedPlatform = this.platformSelect.get('value');
                var selectedInstitution = this.institutionSelect.get('value');

                if (this.platformSelect) {
                    //Query the platformSelect's store with a custom test function to filter on the currently-visible datasets.
                    this.platformSelect.set('query', {                    
                        d: {test: lang.hitch(this, this.datasetTest)}
                    });
                }

                if (this.institutionSelect) {
                    //Query the platformSelect's store with a custom test function to filter on the currently-visible datasets.
                    this.institutionSelect.set('query', {                    
                        d: {test: lang.hitch(this, this.datasetTest)}
                    });
                }

                if (this.surveySelect) {
                    //Query the surveySelect's store with custom test functions to filter on the platform, year, and datasets parameters.
                    this.surveySelect.set('query', {
                        p: {
                            test: function(itemPlatform) {
                                //null platforms only get returned when there is no platform filter applied
                                return selectedPlatform === '' || (itemPlatform && (selectedPlatform === itemPlatform));
                            }
                        },
                        s: {
                            test: function(itemInstitution) {
                                //null institutions only get returned when there is no institution filter applied
                                return selectedInstitution === '' || (itemInstitution && (selectedInstitution === itemInstitution));
                            }
                        },
                        y: {
                            test: function(itemYear) {
                                if (!minYear && !maxYear) {
                                    return true;
                                }
                                if (itemYear) {
                                    return (itemYear <= maxYear) && (itemYear >= minYear);                                
                                } else {
                                    return false; //null years only get returned when there is no year filter applied
                                }
                            }
                        },                        
                        d: {test: lang.hitch(this, this.datasetTest)}
                    });
                }
            },

            datasetTest: function(itemDatasets) {
                if (this.multibeamVisible && (array.indexOf(itemDatasets, 'm') !== -1)) {
                    return true;
                } else if (this.tracklineVisible && (array.indexOf(itemDatasets, 't') !== -1)) {
                    return true;
                } else if (this.nosHydroVisible && this.nosBagsVisible && (array.indexOf(itemDatasets, 'b') !== -1)) {
                    return true;
                } else if (this.nosHydroVisible && this.nosHydroAllVisible && (array.indexOf(itemDatasets, 'd') !== -1)) {
                    return true;
                } else if (this.nosHydroVisible && this.nosHydroAllVisible && (array.indexOf(itemDatasets, 'a') !== -1)) {
                    return true;
                } else {
                    return false;
                }
            },

            setActiveLayersText: function() {
                var text = '';
                if (this.multibeamVisible) {
                    text += 'NCEI Multibeam';
                }
                if (this.tracklineVisible) {
                    if (text.length > 0) {
                        text += ', ';
                    }
                    text += 'NCEI Single-Beam';
                }
                if (this.nosHydroVisible && this.nosBagsVisible) {
                    if (text.length > 0) {
                        text += ', ';
                    }
                    text += 'NOAA Hydrographic Surveys with BAGs';
                }
                if (this.nosHydroVisible && this.nosHydroAllVisible) {
                    if (text.length > 0) {
                        text += ', ';
                    }
                    text += 'All NOAA Hydrographic Surveys';
                }
                if (text.length === 0) {
                    text += 'None';
                }
                this.activeLayersText.innerHTML = 'Visible Layers: ' + text;
            },

            execute: function(values) {  
                //Use _lastDisplayedValue instead of value to handle if a user typed in a string (i.e. with wildcard) that doesn't match anything in the store. Otherwise value is empty.
                values.platform = this.platformSelect.get('_lastDisplayedValue');
                values.institution = this.institutionSelect.get('_lastDisplayedValue');
                values.survey = this.surveySelect.get('_lastDisplayedValue');
                values.zoomToResults = this.chkZoomToResults.get('value');

                if (this.isDefault(values)) {
                    topic.publish('/bathymetry/ResetSearch');
                } else {       
                    topic.publish('/bathymetry/Search', values);
                }
            },
                
            isDefault: function(values) {
                return (!values.startYear && !values.endYear && 
                    this.platformSelect.get('_lastDisplayedValue') === '' && 
                    this.institutionSelect.get('_lastDisplayedValue') === '' && 
                    this.surveySelect.get('_lastDisplayedValue') === '');
            },
                   
            clearForm: function() {                
                this.surveySelect.set('value', '');
                this.platformSelect.set('value', '');
                this.institutionSelect.set('value', '');
                this.startYearSpinner.set('value', '');
                this.endYearSpinner.set('value', '');
                this.chkZoomToResults.set('checked', true);
            },

            reset: function() {
                this.clearForm();
            },

            show: function() {
                this.inherited(arguments);

                if (this.multibeamVisible || this.tracklineVisible) {
                    this.institutionSelect.set('disabled', false);
                } else {
                    this.institutionSelect.set('disabled', true);
                }
            }  
        });
    });