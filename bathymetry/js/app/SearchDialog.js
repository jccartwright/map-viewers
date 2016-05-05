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

                this.multibeamVisible = true;
                this.nosBagsVisible = false;
                this.nosDigitalVisible = false;
                this.nonNonDigitalVisible = false;
                this.tracklineVisible = false;
            },
                
            postCreate: function() {                                                                        
                this.inherited(arguments);

                xhr('platforms.json', {
                    preventCache: true,
                    handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populatePlatformSelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving platforms JSON: ' + err);
                });

                xhr('surveys.json', {
                    preventCache: true,
                    handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateSurveySelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving surveys JSON: ' + err);
                });

                on(this.cancelButton, 'click', lang.hitch(this, function(){
                    this.onCancel();
                }));
                on(this.resetButton, 'click', lang.hitch(this, function(){
                    this.reset();
                })); 
                on(this.startYearSpinner, 'change', lang.hitch(this, function(){
                    this.filterPlatformsAndSurveys();
                }));
                on(this.endYearSpinner, 'change', lang.hitch(this, function(){
                    this.filterPlatformsAndSurveys();
                }));

                //Subscribe to message to show/hide an entire service. Handles the Multibeam, Trackline, and NOS non-digital layers.
                topic.subscribe('/ngdc/layer/visibility', lang.hitch(this, function (svcId, visible) {
                    if (svcId === 'Multibeam') {
                        this.multibeamVisible = visible;                    
                    } else if (svcId === 'Trackline Bathymetry') {
                        this.tracklineVisible = visible;
                    } else if (svcId === 'NOS Hydro (non-digital)') {
                        this.nonNonDigitalVisible = visible;
                    }
                    this.filterPlatformsAndSurveys();
                    this.setActiveLayersText();
                }));

                //Subscribe to message to show/hide sublayers from a service. Handles the NOS Hydro BAGs and Digital layers.
                topic.subscribe('/ngdc/sublayer/visibility', lang.hitch(this, function (svcId, sublayers, visible) {
                    if (svcId === 'NOS Hydrographic Surveys') {
                        if (sublayers[0] === 0) {
                            this.nosBagsVisible = visible;
                        } else if (sublayers[0] === 1) {
                            this.nosDigitalVisible = visible;
                        }
                    }
                    this.filterPlatformsAndSurveys();
                    this.setActiveLayersText();
                }));
            },

            populateSurveySelect: function(items) {                
                this.surveysStore = new Memory({data: {identifier: 'id', items: items}});

                this.surveySelect = new FilteringSelect({
                    name: "id",
                    store: this.surveysStore,
                    searchAttr: "id",
                    required: false
                });

                //Disable the validator so we can type any value into the box.
                this.surveySelect.validate = function() { 
                    return true; 
                };
                this.surveySelect.placeAt(this.surveySelectDiv);  
            },

            populatePlatformSelect: function(items) {                
                this.platformsStore = new Memory({data: {identifier: 'id', items: items}});

                this.platformSelect = new FilteringSelect({
                    name: "id",
                    store: this.platformsStore,
                    searchAttr: "id",
                    required: false
                }); 

                //Disable the validator so we can type any value into the box.
                this.platformSelect.validate = function() { 
                    return true; 
                };
                this.platformSelect.placeAt(this.platformSelectDiv);

                on(this.platformSelect, 'change', lang.hitch(this, function(){
                    this.surveySelect.set('value', '');
                    this.filterPlatformsAndSurveys();
                }));  
            },

            filterPlatformsAndSurveys: function() {
                var minYear = this.startYearSpinner.get('value') || null;
                var maxYear = this.endYearSpinner.get('value') || null;
                var selectedPlatform = this.platformSelect.get('value');
                var multibeamVisible = this.multibeamVisible;
                var nosBagsVisible = this.nosBagsVisible;
                var nosDigitalVisible = this.nosDigitalVisible;
                var nonNonDigitalVisible = this.nonNonDigitalVisible;
                var tracklineVisible = this.tracklineVisible;

                if (this.platformSelect) {
                    //Query the platformSelect's store with a custom test function to filter on the currently-visible datasets.
                    this.platformSelect.set('query', {                    
                        d: {
                            test: function(itemDatasets) {                            
                                if (multibeamVisible && (array.indexOf(itemDatasets, 'm') !== -1)) {
                                    return true;
                                } else if (tracklineVisible && (array.indexOf(itemDatasets, 't') !== -1)) {
                                    return true;
                                } else if (nosBagsVisible && (array.indexOf(itemDatasets, 'b') !== -1)) {
                                    return true;
                                } else if (nosDigitalVisible && (array.indexOf(itemDatasets, 'd') !== -1)) {
                                    return true;
                                } else if (nonNonDigitalVisible && (array.indexOf(itemDatasets, 'a') !== -1)) {
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                        }
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
                        d: {
                            test: function(itemDatasets) {                            
                                if (multibeamVisible && (array.indexOf(itemDatasets, 'm') !== -1)) {
                                    return true;
                                } else if (tracklineVisible && (array.indexOf(itemDatasets, 't') !== -1)) {
                                    return true;
                                } else if (nosBagsVisible && (array.indexOf(itemDatasets, 'b') !== -1)) {
                                    return true;
                                } else if (nosDigitalVisible && (array.indexOf(itemDatasets, 'd') !== -1)) {
                                    return true;
                                } else if (nonNonDigitalVisible && (array.indexOf(itemDatasets, 'a') !== -1)) {
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                        }
                    });
                }
            },

            setActiveLayersText: function() {
                var text = '';
                if (this.multibeamVisible) {
                    text += 'Multibeam';
                }
                if (this.tracklineVisible) {
                    if (text.length > 0) {
                        text += ', ';
                    }
                    text += 'Single-Beam';
                }
                if (this.nosBagsVisible) {
                    if (text.length > 0) {
                        text += ', ';
                    }
                    text += 'NOS BAGs';
                }
                if (this.nosDigitalVisible) {
                    if (text.length > 0) {
                        text += ', ';
                    }
                    text += 'NOS Digital';
                }
                if (this.nonNonDigitalVisible) {
                    if (text.length > 0) {
                        text += ', ';
                    }
                    text += 'NOS Non-Digital';
                }
                if (text.length === 0) {
                    text += 'None'
                }
                this.activeLayersText.innerHTML = 'Visible Layers: ' + text;
            },

            execute: function(values) {  
                //Use _lastDisplayedValue instead of value to handle if a user typed in a string (i.e. with wildcard) that doesn't match anything in the store. Otherwise value is empty.
                values.platform = this.platformSelect.get('_lastDisplayedValue'); 
                values.survey = this.surveySelect.get('_lastDisplayedValue');
                values.zoomToResults = this.chkZoomToResults.get('value');

                if (this.isDefault(values)) {
                    topic.publish('/bathymetry/ResetSearch');
                } else {       
                    topic.publish('/bathymetry/Search', values);
                }
            },
                
            isDefault: function(values) {
                return (!values.startYear && !values.endYear && this.platformSelect.get('_lastDisplayedValue') === '' && this.surveySelect.get('_lastDisplayedValue') === '');
            },
                   
            clearForm: function() {                
                this.surveySelect.set('value', '');
                this.platformSelect.set('value', '');                                            
                this.startYearSpinner.set('value', '');
                this.endYearSpinner.set('value', '');
                this.chkZoomToResults.set('checked', true);                             
            },

            reset: function() {
                this.clearForm();
            }    
    });
});