dojo.provide('references_panel.ReferencesPanel');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');


dojo.declare('references_panel.ReferencesPanel',[dijit._Widget, dijit._Templated],{
   templatePath: dojo.moduleUrl('references_panel','templates/ReferencesPanel.html'),

   //lifecycle extension points
   postMixInProperties: function() {
   },   
	
   postCreate: function() {
   },

   //widget-specific
   show: function() {   
      dojo.style(this.domNode,'display','block');
   },

   hide: function() {
      dojo.style(this.domNode,'display','none');
   },

   toggle: function() {
      if (dojo.style(this.domNode,'display') == 'none') {
         this.show();
      } else {
         this.hide();
      }
   }
});