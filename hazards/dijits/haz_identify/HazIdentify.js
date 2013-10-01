dojo.provide("haz_identify.HazIdentify");

dojo.require("identify.Identify");
dojo.require("esri.tasks.identify");
dojo.require("esri.tasks.query");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dojox.grid.DataGrid");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.StackContainer");
dojo.require("dojo.fx");
dojo.require("dijit.form.NumberSpinner");
dojo.require("dijit.form.CheckBox");
dojo.require("identify.InfoWindowConnector");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.SimpleTextarea");

/***************
 * CSS Includes
 ***************/
//anonymous function to load CSS files required for this module
(function(){
	var css = [dojo.moduleUrl("dojox", "grid/resources/Grid.css"), // required css for grids
 dojo.moduleUrl("dojox", "grid/resources/tundraGrid.css")//, // tundra theme for grids
 //dojo.moduleUrl("identify", "css/identify.css") // custom css used by this dijit: you can customize this file to change the look and feel of this dijit
];
	
	var head = document.getElementsByTagName("head").item(0), link;
	for (var i = 0, il = css.length; i < il; i++) {
		link = document.createElement("link");
		link.type = "text/css";
		link.rel = "stylesheet";
		link.href = css[i];
		head.appendChild(link);
	}
})();


/*****************
 * Identify Dijit
 *****************/
dojo.declare("haz_identify.HazIdentify", [identify.Identify, dijit._Widget, dijit._Templated], {
	
	//templatePath: dojo.moduleUrl("haz_identify", "templates/haz_identify.html"),
	
	/*
	constructor: function(params, srcNodeRef){
		this.inherited(arguments);		
	},
	*/
	
	startup: function() {
		this.inherited(arguments);
		
		this._showTsObservations = dojo.hitch(this, this._showTsObservations);	
		this._showTsEvent = dojo.hitch(this, this._showTsEvent);
		
		this._showTsObservationsButton = new dijit.form.Button({
			label: "Show Tsunami Observations",
			showLabel: true
		});
		this._showTsObservationsButton.domNode.style.display = "none";
		dojo.addClass(this._showTsObservationsButton.domNode, 'genid-button');
		this._showTsObservationsButton.startup();
		this._showTsObservationsButton.placeAt(dijit.byId('showSummaryOrBackButton').domNode, 'after');
		dojo.connect(this._showTsObservationsButton, "onClick", this._showTsObservations);
		
		
		this._showTsEventButton = new dijit.form.Button({
			label: "Show Tsunami Event",
			showLabel: true
		});
		this._showTsEventButton.domNode.style.display = "none";
		dojo.addClass(this._showTsEventButton.domNode, 'genid-button');
		this._showTsEventButton.startup();
		this._showTsEventButton.placeAt(this._showTsObservationsButton.domNode, 'after');
		dojo.connect(this._showTsEventButton, "onClick", this._showTsEvent);
	},
	
	_showFeatures: function() {
		this.inherited(arguments);
		
		this._showTsObservationsButton.domNode.style.display = "none";  //Hide the "Show Tsunami Observations" button
		this._showTsEventButton.domNode.style.display = "none";  //Hide the "Show Tsunami Event" button
	},

	_gridRowClickHandler: function(evt){
		this.inherited(arguments);
		
		var item = evt.grid.getItem(evt.rowIndex), graphic = evt.grid.getItem(evt.rowIndex).ref[0], attr = graphic.attributes, dispAttr = graphic._displayAttributes, aliases = graphic._fieldAliases, urls = graphic._fieldUrls;
		
		if (item.layerName[0] == 'Tsunami Event') {
			this._tsEventId = attr["ID"];
			var numRunups = attr['Number of Observations'];
			if (numRunups > 1) {
				this._showTsObservationsButton.attr('label', "Show This Tsunami Event and " + numRunups + " Observations");
			} else if (numRunups == 1) {
				this._showTsObservationsButton.attr('label', "Show This Tsunami Event and " + numRunups + " Observation");
			} if (numRunups > 0) {
				this._showTsObservationsButton.domNode.style.display = ""; //Show the "Show Tsunami Observations" button
				this._showTsEventButton.domNode.style.display = "none";  //Hide the "Show Tsunami Event" button
			}
		}
		else if (item.layerName[0] == 'Tsunami Observation') {
			this._tsEventId = attr["Tsunami Event ID"];
			this._showTsEventButton.attr('label', "Show Associated Tsunami Event");
			this._showTsEventButton.domNode.style.display = ""; //Show the "Show Tsunami Event" button
			this._showTsObservationsButton.domNode.style.display = "none";  //Hide the "Show Tsunami Observations" button
		}
	},
	
	_backButtonClickHandler: function() {
		this.inherited(arguments);
		
		this._showTsObservationsButton.domNode.style.display = "none";  //Hide the "Show Tsunami Observations" button
		this._showTsEventButton.domNode.style.display = "none";  //Hide the "Show Tsunami Event" button
	},
	
	_showTsObservations: function() {
		console.log("showTsObservations");
		dojo.publish('/Identify/showTsObs', [{
			tsEventID: this._tsEventId, 
			geometry: this._selectedFeature.geometry
		}]);
	},
	
	_showTsEvent: function() {
		console.log("showTsEvent");
		dojo.publish('/Identify/showTsEvent', [{
		  	tsEventID: this._tsEventId,
		  	geometry: this._selectedFeature.geometry
		}]);
	}

});

dojo.mixin(identify.Identify, {
	// At Dojo 1.3.1, DataGrid escapes any HTML data.
	// Overrride that behavior by adding a formatter function 
	// for the grid cells and convert all &lt; back to <
	// See also: templates/identify.html where this formatter is bound to the grid column.
	// http://docs.dojocampus.org/dojox/grid#important-information-about-formatting-and-security
	_cellFormatter: function(value){
		return value.replace(/&lt;/g, "<");
	}
});

// disable sorting
// inSortInfo is the 1-based index of the field column and can be negative or positive
function noSort(inSortInfo){
	return false;
}
