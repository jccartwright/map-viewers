dojo.provide('mosaic.CreditsPanel');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

dojo.declare('mosaic.CreditsPanel',[dijit._Widget, dijit._Templated],{
	templatePath: dojo.moduleUrl('mosaic','templates/CreditsPanel.html'),
	templateString: null
});