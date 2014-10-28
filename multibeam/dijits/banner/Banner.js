dojo.provide('banner.Banner');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

/***************
 * CSS Includes
 ***************/
//anonymous function to load CSS files required for this module
(function() {
  var css = [
    dojo.moduleUrl("banner", "themes/ngdc/banner.css")     // custom css used by this dijit: you can customize this file to change the look and feel of this dijit
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


dojo.declare('banner.Banner',[dijit._Widget, dijit._Templated],{
   
   templatePath: dojo.moduleUrl('banner','templates/Banner.html'),
      
   //lifecycle extension points
   postMixInProperties: function() {
   },   

   postCreate: function() {
   },

   startup: function() {
   },

   destroy: function() {
    }
   
});