dojo.provide('survey_select.AeroSurveySelectDialog');

dojo.require('dijit.Dialog');
dojo.require("dijit.form.NumberSpinner");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.MultiSelect");

/***************
 * CSS Includes
 ***************/
//anonymous function to load CSS files required for this module
(function(){
	var css = [dojo.moduleUrl("survey_select", "themes/survey_select.css")]; // custom css used by this dijit: you can customize this file to change the look and feel of this dijit
	
	var head = document.getElementsByTagName("head").item(0), link;
	for (var i = 0, il = css.length; i < il; i++) {
		link = document.createElement("link");
		link.type = "text/css";
		link.rel = "stylesheet";
		link.href = css[i];
		head.appendChild(link);
	}
})();


dojo.declare( 'survey_select.AeroSurveySelectDialog',dijit.Dialog, {
	templateString: null,
	templatePath: dojo.moduleUrl('survey_select.templates','AeroSurveySelectDialog.html'),
	widgetsInTemplate: true,
	defaultStartYear: null,
	defaultEndYear: null,
	projectsStore: null,
	surveysStore: null,
	surveyList: null,
		
	/**
	 * Reset the dialog values to defaults
	 */	
	reset: function() {
		var startTime = new Date().getTime();
		this.omitDate.attr('value','true');
		this.toggleOmitDate();
		this.startYearSpinner.attr('value', '');
		this.endYearSpinner.attr('value', '');		
		
		this.chkAllProjects.attr('value', 'true');
		this.toggleAllProjects();
		
		this.chkAllAeroParams.attr('value', 'true');
		this.toggleAllAeroParams();
		
		this.startDateAddedInput.reset();
		this.endDateAddedInput.reset();		
		
		if (!(dojo.isIE <= 8)) {
			this.surveyNameSelect.query.name = "*";
		}
		
		this.surveyNameSelect.attr('value', null);
		
		this.surveyList.length = 0;
		this.surveyListSpan.innerHTML = '';
		
		if (this.zoomToExtentEnabled) {
			this.zoomToSelection.attr('checked', true);
		}
		else {
			this.zoomToSelection.attr('checked', false);			
		}
		
		this.filterSurveys();
	},
	
	postCreate: function() {
		//console.log("inside SurveySelectDialog postCreate...");
		
		//In IE8 or earlier, replace the FilteringSelect with a simple TextBox for performance reasons.		
		if (dojo.isIE <= 8) {
			this.surveyNameSelect = new dijit.form.TextBox({
				type: "text",
				name: "id"
			});
		} else {
			this.surveyNameSelect = new dijit.form.FilteringSelect({
				//id: "surveyNameSelect",
				name: "id",
				store: this.surveysStore,
				searchAttr: "id",
				required: false
			});	
		}
		this.surveyNameSelect.placeAt(this.surveySelectInput);	
				
		this.connect(this.cancelButton, "onClick", "hide");
		this.connect(this.resetButton, "onClick", "reset");
		this.connect(this.omitDate, "onClick", "toggleOmitDate");
		this.connect(this.startYearSpinner, "onChange", "filterSurveys");
		this.connect(this.endYearSpinner, "onChange", "filterSurveys");		
		this.connect(this.projectSelect, "onChange", dojo.hitch(this, function(){
			this.numProjectsSpan.innerHTML = "Selected: " + this.projectSelect.attr('value').length;
			this.filterSurveys();
		}));
		this.connect(this.chkAllProjects, "onClick", "toggleAllProjects");
		this.connect(this.chkAllAeroParams, "onClick", "toggleAllAeroParams");
		this.connect(this.surveyNameSelect, "onChange", "addSurveyID");
		this.surveyList = [];
		
		this.toggleAllProjects();
		this.toggleAllAeroParams();
		
		//Populate the projects MultiSelect
		this.projectsStore.fetch({
			onComplete: dojo.hitch(this, function(items){		
				var i;				
				for (i = 0; i < items.length; i++) {					
					var option = dojo.doc.createElement('option');
					var project = items[i].id;
					option.innerHTML = project;
					option.value = project;
					this.projectSelect.domNode.appendChild(option);
				}									
				this.toggleAllProjects();		
			})
		});
				
		if (!(dojo.isIE <= 8)) {
			this.surveyNameSelect.store = this.surveysStore;
			this.surveyNameSelect.query.id = "*";
			this.surveyNameSelect.attr('value', null);
		}
		
		//initialize dialog box values
		var endYear = null;
		var startYear = null;
		if (this.defaultStartYear) {
			startYear = this.defaultStartYear;
		}
		if (this.defaultEndYear) {
			endYear = this.defaultEndYear;
		}  
		if (!this.defaultStartYear && !this.defaultEndYear) {
			this.omitDate.attr('checked',true);
			this.toggleOmitDate();
		}
		else {
			this.omitDate.attr('checked',false);
			this.toggleOmitDate();
		}
		this.startYearSpinner.attr('value', startYear);
		this.endYearSpinner.attr('value', endYear);			
		
		if (!this.zoomToExtentEnabled) {
			this.zoomToSelection.domNode.style.display = 'none';
			this.zoomToSelection.attr('checked', false);
			this.zoomToSelectionLabel.style.display = 'none';
		}	
						
		this.inherited(arguments);
	},

	/**
	 * filters the data available to surveyNameSelect
	 */	
	filterSurveys: function() {
		if (dojo.isIE <= 8) {
			//We're not using the FilteringSelect in IE8 or earlier. Immediately return.
			return;
		}
		var surveyFilter = {};						
		
		if (this.chkAllProjects.attr('checked')) {
			surveyFilter.project = '*';
		} 
		else {
			surveyFilter.project = new RegExp(this.projectSelect.attr('value').join('|'), 'g');
		}
		
		if (this.omitDate.attr('checked')) {
			surveyFilter.year = '*';
		}
		else {
			//Create a regular expression for the year range. Example: 2000|2001|2002|2003|2004|2005
			var years = [];
			var startYear = 1939;
			var endYear = 2015;
			var i;
			if (this.startYearSpinner.attr('value')) {
				startYear = this.startYearSpinner.attr('value');
			}
			if (this.endYearSpinner.attr('value')) {
				endYear = this.endYearSpinner.attr('value');
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
		var surveyId = this.surveyNameSelect.attr('value');
		if (!surveyId) {
			return;
		}	
		if (dojo.indexOf(this.surveyList, surveyId) < 0) {
			this.surveyList.push(surveyId);
			this.surveyListSpan.innerHTML = 'Selected: ' + this.surveyList.join(', ');		
		}	
		this.surveyNameSelect.attr('value', null);			
	},

	toggleOmitDate: function() {
		if (this.omitDate.attr('checked')) {
			this.startYearSpinner.attr('disabled',true);
			this.endYearSpinner.attr('disabled',true);
		} else {
			this.startYearSpinner.attr('disabled',false);
			this.endYearSpinner.attr('disabled',false);
		}
		this.filterSurveys();
	},
	
	toggleAllProjects: function() {
		if (this.chkAllProjects.attr('checked')) {
			this.projectSelect.attr('disabled',true);
			this.projectSelect.reset();
			this.projectSelect.domNode.scrollTop = 0;
			this.numProjectsSpan.innerHTML = "Selected: All";
		} else {
			this.projectSelect.attr('disabled',false);
			this.numProjectsSpan.innerHTML = "Selected: 0";
		}
		//this.filterSurveys();
	},
	
	toggleAllAeroParams: function() {
		if (this.chkAllAeroParams.attr('checked')) {
			this.aeroParamSelect.attr('disabled',true);
			this.aeroParamSelect.reset();
			this.aeroParamSelect.domNode.scrollTop = 0;
		} else {
			this.aeroParamSelect.attr('disabled',false);
		}
		//this.filterSurveys();
	},
		

	/**
	 * function automatically called by submit button. publishes event containing
	 * values from dialog 
	 */	
	execute: function(values) {
		//console.log('inside execute: ',values);
		this.addSurveyID(); //Any survey ID entered in the input control should be added before executing
		
		//BUG: omitDate, startYear values not in values object
		values.startYear = this.startYearSpinner.attr('value');
		values.omitDate = this.omitDate.attr('value');
		values.zoomToSelection = this.zoomToSelection.attr('value');
		values.surveyIds = this.surveyList;
		
		//cleanup values passed back to caller		
		if (values.surveyIds.length > 0) {
			//Survey Id takes precedence
			values.startYear = null;
			values.omitDate = null;
		} else {
			values.surveyIds = null;
			if (values.omitDate) { 
				values.startYear = null; 
				values.endYear = null;

			}
		}		
		dojo.publish("/survey_select/AeroSurveySelectDialog",[values]);
	}
	
});