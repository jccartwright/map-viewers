dojo.provide('firedetects.CreditsPanel');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

dojo.declare('firedetects.CreditsPanel',[dijit._Widget, dijit._Templated],{
   templatePath: dojo.moduleUrl('firedetects','templates/CreditsPanel.html'),
   widgetsInTemplate: true,
   lastUpdate: "5/26/2011",
   version: "1.00",

   //lifecycle extension points
	postMixInProperties: function() {
	},   
	
	postCreate: function() {
	}
});