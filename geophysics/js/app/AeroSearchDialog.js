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
    'dijit/form/TextBox',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-attr',
    'dojo/on',
    'dojo/topic',
    'dojo/sniff',
    'dojo/request/xhr',
    'dojo/store/Memory', 
    'dojo/dom-construct',
    'dojo/text!./templates/AeroSearchDialog.html'
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
        TextBox,
        lang,
        array,
        domAttr,
        on,
        topic,
        has,
        xhr,
        Memory,
        domConstruct,
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

                on(this.chkOmitDate, 'click', lang.hitch(this, function() {
                    this.toggleOmitDate();
                }));
                on(this.chkAllProjects, 'click', lang.hitch(this, function() {
                    this.toggleAllProjects();
                }));
                on(this.chkAllAeroParams, 'click', lang.hitch(this, function() {
                    this.toggleAllAeroParams();
                }));
                on(this.projectSelect, 'change', lang.hitch(this, function(){
                    this.numProjectsSpan.innerHTML = "Selected: " + this.projectSelect.get('value').length;
                    this.filterSurveys();
                }));

                xhr.get('//maps.ngdc.noaa.gov/mapviewer-support/aeromag/projects.groovy', {
                    preventCache: true,
                    jsonp: 'callback',
                    handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateProjectSelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving institutions JSON: ' + err);
                });

                xhr.get('//maps.ngdc.noaa.gov/mapviewer-support/aeromag/surveys.groovy', {
                    preventCache: true,
                    jsonp: 'callback',
                    handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateSurveySelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving institutions JSON: ' + err);
                });
            },

            populateProjectSelect: function(items) {
                array.forEach(items, lang.hitch(this, function(item) { 
                    var option = domConstruct.create('option');
                    option.value = item.id; 
                    option.label = item.id;
                    option.text = item.id;
                    option.selected = false;
                    this.projectSelect.domNode.appendChild(option);
                }));
                //this.shipSelect.addOption(options);
                this.projectSelect.set('disabled', true); //Freezes the widget if it's in postCreate() for some reason
            },

            populateSurveySelect: function(items) {
                this.surveysStore = new Memory({data: items});

                if (has('ie') <= 8) {
                    this.surveyNameSelect = new TextBox({
                        type: "text",
                        name: "id"
                    });
                } else {
                    this.surveyNameSelect = new FilteringSelect({
                        //id: "surveyNameSelect",
                        name: "id",
                        store: this.surveysStore,
                        searchAttr: "id",
                        required: false
                    }); 
                }
                this.surveyNameSelect.placeAt(this.surveySelectInput);

                //Handler for when survey IDs are selected
                on(this.surveyNameSelect, 'change', lang.hitch(this, function(){
                    this.addSurveyID();
                }));
                this.surveyList = [];
            },

            /**
             * filters the data available to surveyNameSelect
             */ 
            filterSurveys: function() {
                if (has('ie' <= 8)) {
                    //We're not using the FilteringSelect in IE8 or earlier. Immediately return.
                    return;
                }
                var surveyFilter = {};
                
                if (this.chkAllProjects.get('checked') || this.projectSelect.get('value').length == 0) {
                    surveyFilter.project = /.*/;
                }
                else {
                    surveyFilter.project = new RegExp(this.projectSelect.get('value').join('|'), 'g');
                }
                                
                if (this.chkOmitDate.get('checked')) {
                    surveyFilter.year = /.*/;
                }
                else {
                    //Create a regular expression for the year range. Example: 2000|2001|2002|2003|2004|2005
                    var years = [];
                    var startYear = 1939;
                    var endYear = new Date().getFullYear(); //get current year
                    var i;
                    if (this.startYearSpinner.get('value')) {
                        startYear = this.startYearSpinner.get('value');
                    }
                    if (this.endYearSpinner.get('value')) {
                        endYear = this.endYearSpinner.get('value');
                    }
                    for (i = startYear; i <= endYear; i++) {
                        years.push(i);
                    }
                    surveyFilter.year = new RegExp(years.join('|'), 'g');
                }

                this.surveyNameSelect.query = surveyFilter;
            },

            /**
             * Add a survey ID to the list of selected surveys
             */ 
            addSurveyID: function() {
                var surveyId = this.surveyNameSelect.get('value');
                if (!surveyId) {
                    return;
                }   
                if (array.indexOf(this.surveyList, surveyId) < 0) {
                    this.surveyList.push(surveyId);
                    this.surveyListSpan.innerHTML = 'Selected: ' + this.surveyList.join(', ');      
                }   
                this.surveyNameSelect.set('value', null);          
            },

            toggleOmitDate: function() {
                if (this.chkOmitDate.get('checked')) {
                    this.startYearSpinner.set('disabled',true);
                    this.endYearSpinner.set('disabled',true);
                } else {
                    this.startYearSpinner.set('disabled',false);
                    this.endYearSpinner.set('disabled',false);
                }
                this.filterSurveys();
            },
            
            toggleAllProjects: function() {
                if (this.chkAllProjects.get('checked')) {
                    this.projectSelect.set('disabled',true);
                    this.projectSelect.reset();
                    this.projectSelect.domNode.scrollTop = 0;  
                    this.numProjectsSpan.innerHTML = "Selected: All";  
                } else {
                    this.projectSelect.set('disabled',false); 
                    this.numProjectsSpan.innerHTML = "Selected: 0";        
                }
                this.filterSurveys();
            },

            toggleAllAeroParams: function() {
                if (this.chkAllAeroParams.get('checked')) {
                    this.aeroParamSelect.set('disabled',true);
                    this.aeroParamSelect.reset();
                    this.aeroParamSelect.domNode.scrollTop = 0;  
                } else {
                    this.aeroParamSelect.set('disabled',false); 
                }
            },
            
            execute: function(values) { 
                if (this.isDefault()) {
                    this.reset();
                }
                else {
                    this.addSurveyID(); //Any survey ID entered in the input control should be added before executing
                    
                    //BUG: omitDate, startYear values not in values object
                    values.startYear = this.startYearSpinner.get('value');
                    values.omitDate = this.chkOmitDate.get('value');
                    values.zoomToResults = this.chkZoomToResults.get('value');
                    values.surveyIds = this.surveyList;
                    
                    //cleanup values passed back to caller      
                    if (values.surveyIds.length > 0) {
                        //Survey Id takes precedence
                        values.projects = null;
                        values.aeroParams = null;
                        values.startYear = null;
                        values.omitDate = null;
                    } else {
                        values.surveyIds = null;
                        if (values.omitDate) { 
                            values.startYear = null; 
                            values.endYear = null;
                        }
                    }       
                    topic.publish("/geophysics/AeroSearch", values);
                } 
            },

            isDefault: function() {
                return (isNaN(this.startYearSpinner.get('value')) && isNaN(this.endYearSpinner.get('value')) &&
                    (this.chkAllProjects.checked || this.projectSelect.get('value').length === 0) && 
                    (this.chkAllAeroParams.checked || this.aeroParamSelect.get('value').length === 0) &&
                    this.surveyList.length === 0 &&
                    !this.startDateAddedInput.get('value') && !this.endDateAddedInput.get('value'));
            },
                   
            clearForm: function() {
                this.chkOmitDate.set('value','true');
                this.toggleOmitDate();
                this.startYearSpinner.set('value', '');
                this.endYearSpinner.set('value', '');      
                
                this.chkAllProjects.set('value', 'true');
                this.toggleAllProjects();
                
                this.chkAllAeroParams.set('value', 'true');
                this.toggleAllAeroParams();
                      
                this.startDateAddedInput.reset();
                this.endDateAddedInput.reset();     
                
                if (!(has('ie') <= 8)) {
                    this.surveyNameSelect.query.name = /.*/;
                }
                
                this.surveyNameSelect.set('value', null);
                this.surveyList.length = 0;
                this.surveyListSpan.innerHTML = '';

                this.chkZoomToResults.set('checked', true);  
            },

            reset: function() {
                this.clearForm();
                this.filterSurveys();
                topic.publish('/geophysics/ResetSearch');
            }
    });
});