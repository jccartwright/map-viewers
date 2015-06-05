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
    'dojo/text!./templates/MarineSearchDialog.html'
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
                on(this.chkAllShips, 'click', lang.hitch(this, function() {
                    this.toggleAllShips();
                }));
                on(this.chkAllInstitutions, 'click', lang.hitch(this, function() {
                    this.toggleAllInst();
                }));

                on(this.shipSelect, 'change', lang.hitch(this, function(){
                    this.numShipsSpan.innerHTML = "Selected: " + this.shipSelect.get('value').length;
                    this.filterSurveys();
                }));
                on(this.sourceInstSelect, 'change', lang.hitch(this, function(){
                    this.numInstSpan.innerHTML = "Selected: " + this.sourceInstSelect.get('value').length;
                    this.filterSurveys();
                }));

                xhr.get('ships.json', {
                    preventCache: true,
                    handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateShipSelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving ships JSON: ' + err);
                });

                xhr.get('institutions.json', {
                    preventCache: true,
                    handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateInstitutionSelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving institutions JSON: ' + err);
                });

                xhr.get('surveys.json', {
                    preventCache: true,
                    handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateSurveySelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving surveys JSON: ' + err);
                });
            },

            populateShipSelect: function(items) {
                array.forEach(items, lang.hitch(this, function(item) { 
                    var option = domConstruct.create('option');
                    option.value = item.name; 
                    option.label = item.name;
                    option.selected = false;
                    this.shipSelect.domNode.appendChild(option);
                }));
                //this.shipSelect.addOption(options);
                this.shipSelect.set('disabled', true); //Freezes the widget if it's in postCreate() for some reason
            },

            populateInstitutionSelect: function(items) {
                array.forEach(items, lang.hitch(this, function(item) {
                    var option = domConstruct.create('option');
                    option.value = item.id;
                    option.label = item.id;
                    option.selected = false;
                    this.sourceInstSelect.domNode.appendChild(option);
                }));
                //this.sourceInstSelect.addOption(options);
                this.sourceInstSelect.set('disabled', true); //Freezes the widget if it's in postCreate() for some reason
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
                
                if (this.chkAllShips.get('checked') || this.shipSelect.get('value').length == 0) {
                    surveyFilter.ship = /.*/;
                }
                else {
                    surveyFilter.ship = new RegExp(this.shipSelect.get('value').join('|'), 'g');
                }
                
                if (this.chkAllInstitutions.get('checked') || this.sourceInstSelect.get('value').length == 0) {
                    surveyFilter.inst = /.*/;
                } 
                else {
                    surveyFilter.inst = new RegExp(this.sourceInstSelect.get('value').join('|'), 'g');
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
            
            toggleAllShips: function() {
                if (this.chkAllShips.get('checked')) {
                    this.shipSelect.set('disabled',true);
                    this.shipSelect.reset();
                    this.shipSelect.domNode.scrollTop = 0;  
                    this.numShipsSpan.innerHTML = "Selected: All";  
                } else {
                    this.shipSelect.set('disabled',false); 
                    this.numShipsSpan.innerHTML = "Selected: 0";        
                }
                this.filterSurveys();
            },
            
            toggleAllInst: function() {
                if (this.chkAllInstitutions.get('checked')) {
                    this.sourceInstSelect.set('disabled',true);
                    this.sourceInstSelect.reset();
                    this.sourceInstSelect.domNode.scrollTop = 0;
                    this.numInstSpan.innerHTML = "Selected: All";
                } else {
                    this.sourceInstSelect.set('disabled',false);
                    this.numInstSpan.innerHTML = "Selected: 0";
                }
                this.filterSurveys();
            },

            execute: function(values) { 
                if (this.isDefault(values)) {
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
                        values.ships = null;
                        values.startYear = null;
                        values.omitDate = null;
                    } else {
                        values.surveyIds = null;
                        if (values.omitDate) { 
                            values.startYear = null; 
                            values.endYear = null;
                        }
                    }       
                    topic.publish("/geophysics/MarineSearch", values);
                } 
            },

            isDefault: function(values) {
                return (!values.startYear && !values.endYear &&
                    (this.chkAllShips.checked || values.ships.length === 0) && 
                    (this.chkAllInstitutions.checked || values.institutions.length === 0) &&
                    this.surveyList.length === 0 &&
                    !values.startDateAdded && !values.endDateAdded)
            },
                   
            clearForm: function() {
                this.chkOmitDate.set('value','true');
                this.toggleOmitDate();
                this.startYearSpinner.set('value', '');
                this.endYearSpinner.set('value', '');      
                
                this.chkAllShips.set('value', 'true');
                this.toggleAllShips();
                
                this.chkAllInstitutions.set('value', 'true');
                this.toggleAllInst();
                      
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