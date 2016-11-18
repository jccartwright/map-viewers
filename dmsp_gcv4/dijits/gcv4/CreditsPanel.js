dojo.provide('gcv4.CreditsPanel');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

dojo.declare('gcv4.CreditsPanel',[dijit._Widget, dijit._Templated],{
	templatePath: dojo.moduleUrl('gcv4','templates/CreditsPanel.html'),
	templateString: null
});