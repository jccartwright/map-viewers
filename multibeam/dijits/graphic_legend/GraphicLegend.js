dojo.provide('graphic_legend.GraphicLegend');

dojo.require('dijit._Widget');

dojo.declare('graphic_legend.GraphicLegend',[dijit._Widget],{
   
   //path to legend image
   imagePath: 'images/blank.png',
   //CSS class to apply to image
   addClass: '',
   
   postMixInProperties: function() {
   },
   
   postCreate: function() {
      var imgNode = dojo.doc.createElement('img');
      imgNode.src = this.imagePath;
      this.domNode.appendChild(imgNode);  
   },
  
   startup: function() {
   }
      
});