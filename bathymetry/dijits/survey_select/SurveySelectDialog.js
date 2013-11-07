dojo.provide('survey_select.SurveySelectDialog');dojo.require('dijit.Dialog');dojo.require("dijit.form.NumberSpinner");dojo.require("dijit.form.CheckBox");dojo.require("dijit.form.TextBox");dojo.require("dijit.form.DateTextBox");dojo.require("dijit.form.FilteringSelect");dojo.require("dijit.form.MultiSelect");/***************
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
})();dojo.declare( 'survey_select.SurveySelectDialog',dijit.Dialog, {	templateString: null,	templatePath: dojo.moduleUrl('survey_select.templates','SurveySelectDialog.html'),	widgetsInTemplate: true,			defaultStartYear: null,	defaultEndYear: null,				/**	 * Reset the dialog values to defaults	 */		reset: function() {				this.startYearSpinner.attr('value', '');		this.endYearSpinner.attr('value', '');			this.surveyNameText.attr('value', '');		this.shipNameText.attr('value', '');	},		postCreate: function() {		//console.log("inside SurveySelectDialog postCreate...");								this.connect(this.cancelButton, "onClick", "hide");		this.connect(this.resetButton, "onClick", "reset");						//initialize dialog box values		var endYear = null;		var startYear = null;		if (this.defaultStartYear) {			startYear = this.defaultStartYear;		}		if (this.defaultEndYear) {			endYear = this.defaultEndYear;		}  				this.startYearSpinner.attr('value', startYear);		this.endYearSpinner.attr('value', endYear);															this.inherited(arguments);	},			/**	 * function automatically called by submit button. publishes event containing	 * values from dialog 	 */		execute: function(values) {		console.log('inside execute: ',values);				dojo.publish("/survey_select/SurveySelectDialog", [values]);	}	});