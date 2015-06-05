dojo.provide('survey_select.MarineSurveySelectDialog');

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


dojo.declare( 'survey_select.MarineSurveySelectDialog',dijit.Dialog, {
	templateString: null,
	templatePath: dojo.moduleUrl('survey_select.templates','MarineSurveySelectDialog.html'),
	widgetsInTemplate: true,
	defaultShip: null,
	defaultStartYear: null,
	defaultEndYear: null,
	shipsStore: null,
	surveysStore: null,
	sourceInstStore: null,
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
		
		this.chkAllShips.attr('value', 'true');
		this.toggleAllShips();
		
		this.chkAllInst.attr('value', 'true');
		this.toggleAllInst();
				
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
				id: "surveyNameSelect",
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
		this.connect(this.chkAllShips, "onClick", "toggleAllShips");
		this.connect(this.chkAllInst, "onClick", "toggleAllInst");
		this.connect(this.startYearSpinner, "onChange", "filterSurveys");
		this.connect(this.endYearSpinner, "onChange", "filterSurveys");		
		this.connect(this.shipSelect, "onChange", dojo.hitch(this, function(){
			this.numShipsSpan.innerHTML = "Selected: " + this.shipSelect.attr('value').length;
			this.filterSurveys();
		}));
		this.connect(this.sourceInstSelect, "onChange", dojo.hitch(this, function(){
			this.numInstSpan.innerHTML = "Selected: " + this.sourceInstSelect.attr('value').length;
			this.filterSurveys();
		}));
		this.connect(this.surveyNameSelect, "onChange", "addSurveyID");
		this.surveyList = [];
		
		//Populate the ships MultiSelect
		this.shipsStore.fetch({
			onComplete: dojo.hitch(this, function(items){		
				var i;				
				for (i = 0; i < items.length; i++) {					
					var option = dojo.doc.createElement('option');
					var ship = items[i].name;
					option.innerHTML = ship;
					option.value = ship;
					this.shipSelect.domNode.appendChild(option);
				}									
				this.toggleAllShips();		
			})
		});
		
		//Populate the institutions MultiSelect
		this.sourceInstStore.fetch({
			onComplete: dojo.hitch(this, function(items){		
				var i;			
				for (i = 0; i < items.length; i++) {					
					var option = dojo.doc.createElement('option');
					var inst = items[i].id;
					option.innerHTML = inst;
					option.value = inst;
					this.sourceInstSelect.domNode.appendChild(option);
				}									
				this.toggleAllInst();
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
		
		if (this.chkAllShips.attr('checked')) {
			surveyFilter.ship = '*';
		}
		else {
			surveyFilter.ship = new RegExp(this.shipSelect.attr('value').join('|'), 'g');
		}
		
		if (this.chkAllInst.attr('checked')) {
			surveyFilter.inst = '*';
		} 
		else {
			surveyFilter.inst = new RegExp(this.sourceInstSelect.attr('value').join('|'), 'g');
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
	
	toggleAllShips: function() {
		if (this.chkAllShips.attr('checked')) {
			this.shipSelect.attr('disabled',true);
			this.shipSelect.reset();
			this.shipSelect.domNode.scrollTop = 0;	
			this.numShipsSpan.innerHTML = "Selected: All";	
		} else {
			this.shipSelect.attr('disabled',false);	
			this.numShipsSpan.innerHTML = "Selected: 0";		
		}
		this.filterSurveys();
	},
	
	toggleAllInst: function() {
		if (this.chkAllInst.attr('checked')) {
			this.sourceInstSelect.attr('disabled',true);
			this.sourceInstSelect.reset();
			this.sourceInstSelect.domNode.scrollTop = 0;
			this.numInstSpan.innerHTML = "Selected: All";
		} else {
			this.sourceInstSelect.attr('disabled',false);
			this.numInstSpan.innerHTML = "Selected: 0";
		}
		this.filterSurveys();
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
		dojo.publish("/survey_select/MarineSurveySelectDialog",[values]);
	}
	
});