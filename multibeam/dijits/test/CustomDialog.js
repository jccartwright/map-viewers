dojo.provide('test.CustomDialog');

dojo.require('dijit.Dialog');
dojo.require("dijit.form.NumberSpinner");

dojo.declare( 'test.CustomDialog',dijit.Dialog, {

	foo: 'foo...',
	bar: 'bar!',
	callback: null,
	templateString: null,
	templatePath: dojo.moduleUrl('test','templates/CustomDialog.html'),
	widgetsInTemplate: true,

	postMixInProperties: function() {
		console.log('inside postMixInProperties...');
		this.inherited(arguments);
	},


	postCreate: function() {
		console.log('inside postCreate...');
		this.connect(this.closeButton, "onclick", "hide");
		this.inherited(arguments);
	}
});