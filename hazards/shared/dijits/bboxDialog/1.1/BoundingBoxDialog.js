dojo.provide('bboxDialog.BoundingBoxDialog');

dojo.require('dijit.Dialog');
dojo.require("dijit.form.NumberTextBox");
dojo.require('dijit.form.Button');

//anonymous function to load CSS files required for this module
(function() {
  var css = [
    dojo.moduleUrl("bboxDialog", "themes/BoundingBoxDialog.css")     // custom css used by this dijit: you can customize this file to change the look and feel of this dijit
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

dojo.declare( 'bboxDialog.BoundingBoxDialog',dijit.Dialog, {
	templateString: null,
	templatePath: dojo.moduleUrl('bboxDialog.templates','BoundingBoxDialog.html'),
	widgetsInTemplate: true,
	minx: null,
	miny: null,
	maxx: null,
	maxy: null,
	
	postCreate: function() {
		this.minxInput.attr('value',this.minx);
		this.minyInput.attr('value',this.miny);
		this.maxxInput.attr('value',this.maxx);
		this.maxyInput.attr('value',this.maxy);

		this.connect(this.cancelButton, "onClick", "onCancel");
		this.connect(this.resetButton, "onClick", "reset");
		//don't dismiss dialog unless valid input - NOT WORKING
		//this.connect(this.okButton, "onSubmit", this, function(){return isValid();});
		this.inherited(arguments);
	},

	/**
	 * function automatically called by submit button. publishes event containing
	 * values from dialog
	 * 
	 *  WARNING: input elements must have "name" attribute
	 */	
	execute: function(/*Object*/ formContents) {
		//console.log('inside execute: ',formContents);
		//alternatives
		//   this.attr('value');
		//   this.getValues();
		
		if (this.isValid()) {
			//do not allow latitude to be at limit as it causes problems when re-projecting
			//formContents.miny = formContents.miny < -89.9 ? -89.9 : formContents.miny;
			//formContents.maxy = formContents.maxy > 89.9 ? 89.9 : formContents.maxy;

		  	dojo.publish("/ngdc/BoundingBoxDialog", [formContents]);
		} else {
			console.log('invalid values');
			//TODO: should not close dialog when invalid values
			dojo.publish("/ngdc/BoundingBoxDialog/message",
			[{
            	message: "invalid coordinates",
            	type: "warning",
            	duration: 2000
        	}]);
		}
	},

	onCancel: function() {
		console.log('user canceled');
		dojo.publish("/ngdc/BoundingBoxDialog/message",
		[{
            message: "user canceled",
            type: "info",
            duration: 2000
        }]);
		this.hide();
	}

});