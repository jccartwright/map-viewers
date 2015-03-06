dojo.provide('multibeam.ResourcesPanel');dojo.require('dijit._Widget');dojo.require('dijit._Templated');dojo.require("dijit.form.NumberTextBox");
dojo.declare('multibeam.ResourcesPanel',[dijit._Widget, dijit._Templated],{
   templatePath: dojo.moduleUrl('multibeam','templates/ResourcesPanel.html'),	templateString: null,	widgetsInTemplate: true,		extent: new esri.geometry.Extent(-180, -90, 180, 90, new esri.SpatialReference({wkid: 4326})),	geoextentSub: null,	   //lifecycle extension points
   postMixInProperties: function() {
   },   
   postCreate: function() {		this.connect(this.txtInterfaceBtn, "onClick", "openTextInterface");		this.connect(this.surveyListBtn, "onClick", "openSurveyList");		this.connect(this.autochartBtn, "onClick", "openAutochart");		this.connect(this.resetBtn, "onClick", "resetCoords");				this.connect(this.minx, "onBlur", "validateCoords");		this.connect(this.miny, "onBlur", "validateCoords");		this.connect(this.maxx, "onBlur", "validateCoords");		this.connect(this.maxy, "onBlur", "validateCoords");		geoextentSub = dojo.subscribe('/extent/change', this, function(extent, delta, levelChange, lod) {			this.extent = extent;			this.updateCoords(extent);		});				//initialize coords		this.resetCoords();			},	destroy: function(){      dojo.unsubscribe(geoextentSub);	},	openTextInterface: function() {		//console.log('inside openTextInterface...');		var url = "http://www.ngdc.noaa.gov/nndc/struts/form?&t=101378&s=4&d=21,22";		var win = window.open(url);	},		openSurveyList: function() {		//console.log('inside openSurveyList...');		var url = "http://www.ngdc.noaa.gov/nndc/struts/results?d=5&query=&t=101378&s=3&srid=8307&westbc=${0}&southbc=${1}&eastbc=${2}&&northbc=${3}";			var win = window.open(dojo.string.substitute(url,[this.minx.attr('value'),this.miny.attr('value'),this.maxx.attr('value'),this.maxy.attr('value')]));		},		openAutochart: function() {		//console.log('inside openAutochart...');		var url = "http://www.ngdc.noaa.gov/autochart/?MinLng=${0}&MinLat=${1}&MaxLng=${2}&MaxLat=${3}";		var win = window.open(dojo.string.substitute(url,[this.minx.attr('value'),this.miny.attr('value'),this.maxx.attr('value'),this.maxy.attr('value')]));				},		validateCoords: function() {		//console.log('inside validateCoords');		if (this.minx.isValid() && this.miny.isValid() && this.maxx.isValid() && this.maxy.isValid()) {			console.log('enabling buttons...');			this.surveyListBtn.attr('disabled',false);			this.autochartBtn.attr('disabled',false);		} else {			console.log('disabling buttons...');			this.surveyListBtn.attr('disabled',true);			this.autochartBtn.attr('disabled',true);		}			},		updateCoords: function(bbox) {		console.log('inside updateCoords w/ ',bbox);		this.minx.attr('value',(bbox.xmin < -180)? -180: bbox.xmin);		this.miny.attr('value',(bbox.ymin < -90) ? -90: bbox.ymin);		this.maxx.attr('value',(bbox.xmax > 180) ? 180: bbox.xmax);		this.maxy.attr('value',(bbox.ymax > 90) ? 90: bbox.ymax);	},		resetCoords: function() {		this.minx.attr('value',(this.extent.xmin < -180)? -180: this.extent.xmin);		this.miny.attr('value',(this.extent.ymin < -90) ? -90: this.extent.ymin);		this.maxx.attr('value',(this.extent.xmax > 180) ? 180: this.extent.xmax);		this.maxy.attr('value',(this.extent.ymax > 90) ? 90: this.extent.ymax);		this.surveyListBtn.attr('disabled',false);		this.autochartBtn.attr('disabled',false);	}
});