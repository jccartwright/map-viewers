dojo.provide('help_panel.HelpPanel');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');


dojo.declare('help_panel.HelpPanel',[dijit._Widget, dijit._Templated],{
   templatePath: dojo.moduleUrl('help_panel','templates/HelpPanel.html'),
   basePath: dojo.moduleUrl("help_panel"),

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