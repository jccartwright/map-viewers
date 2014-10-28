dojo.provide('layer_info.LayerInfo');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

dojo.declare('layer_info.LayerInfo',[dijit._Widget, dijit._Templated],{
   
   templatePath: dojo.moduleUrl('layer_info','templates/LayerInfo.html'),
   
   layerCount: null,
   
   //lifecycle extension points
   postMixInProperties: function() {
   	this.layerCount = services.length;
   },   

   postCreate: function() {
   },

   startup: function() {
   }
   
});