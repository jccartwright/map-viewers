dojo.provide("geophysics_identify.GeophysicsIdentify");

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
dojo.declare("geophysics_identify.GeophysicsIdentify", [identify.Identify, dijit._Widget, dijit._Templated], {
		
	_showFeatures: function() {
		this.inherited(arguments);
		
		dojo.publish('/Identify/showWidget', []);
	},

	_closeWidget: function(){
		console.log('inside custom _closeWidget()...');
		this.inherited(arguments);
		
		dojo.publish('/Identify/closeWidget', []);
	},
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
