dojo.provide('survey_select.SurveySelectDialog');
 * CSS Includes
 ***************/
//anonymous function to load CSS files required for this module
(function(){
	var css = [dojo.moduleUrl("survey_select", "themes/survey_select.css")]; // custom css used by this dijit: you can customize this file to change the look and feel of this dijit
	
	var head = document.getElementsByTagName("head").item(0), link;
	for (var i = 0, il = css.length; i < il; i++) {
		link = document.createElement("link");
		link.type = "text/css";
		link.rel = "stylesheet";
		link.href = css[i];
		head.appendChild(link);
	}
})();
		this.shipsStore.fetch({
			onComplete: dojo.hitch(this, function(items){		
			})
		});