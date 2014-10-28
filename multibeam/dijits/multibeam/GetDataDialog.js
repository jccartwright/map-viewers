dojo.provide('multibeam.GetDataDialog');

dojo.require('dijit.Dialog');
dojo.require("dijit.form.NumberTextBox");
dojo.require('dijit.form.Button');
dojo.require("dojo.string");

//anonymous function to load CSS files required for this module
(function() {
  var css = [
    dojo.moduleUrl("multibeam", "themes/GetDataDialog.css")     // custom css used by this dijit: you can customize this file to change the look and feel of this dijit
  ];

  var head = document.getElementsByTagName("head").item(0), link;
  for (var i=0, il=css.length; i<il; i++) {
    link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = css[i];
    head.appendChild(link);
  }
})();

dojo.declare( 'multibeam.GetDataDialog',dijit.Dialog, {
	templateString: null,
	templatePath: dojo.moduleUrl('multibeam.templates','GetDataDialog.html'),
	widgetsInTemplate: true,
	minx: -180,
	miny: -90,
	maxx: 180,
	maxy: 90,
	
	postCreate: function() {
		this.minxInput.attr('value',this.minx);
		this.minyInput.attr('value',this.miny);
		this.maxxInput.attr('value',this.maxx);
		this.maxyInput.attr('value',this.maxy);

		this.connect(this.cancelButton, "onClick", "onCancel");
		this.connect(this.autochartButton, "onClick", "openAutoChart");
		//this.connect(this.listSurveysButton, "onClick", "openSurveyList");
		this.inherited(arguments);
	},

	setExtent: function(extent) {
		this.minxInput.attr('value',extent.xmin);
		this.minyInput.attr('value',extent.ymin);
		this.maxxInput.attr('value',extent.xmax);
		this.maxyInput.attr('value',extent.ymax);			
	},
	
	openAutoChart: function() {
		var url = "http://www.ngdc.noaa.gov/autochart/?MinLng=${minx}&MinLat=${miny}&MaxLng=${maxx}&MaxLat=${maxy}";
		var win = window.open(dojo.string.substitute(url,this.getValues()));			
		this.hide();
	},
	
	openSurveyList: function() {
		var url = "http://www.ngdc.noaa.gov/nndc/struts/results?d=5&query=&t=101378&s=3&srid=8307&westbc=${minx}&southbc=${miny}&eastbc=${maxx}&&northbc=${maxy}";	
		var win = window.open(dojo.string.substitute(url,this.getValues()));
		//this.hide();		
	}
	
});