define([
    'dojo/_base/declare',
    'dijit/Dialog',
    'dijit/_Widget',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/form/Button', 
    'dijit/form/Select', 
    'dijit/form/CheckBox', 
    'dijit/form/DateTextBox',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-attr',
    'dojo/on',
    'dojo/topic',
    'dojo/text!./templates/DartSearchDialog.html'
    ],
    function(
        declare,
        Dialog,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Button, 
        Select, 
        CheckBox, 
        DateTextBox,   
        lang,
        array,
        domAttr,
        on,
        topic,
        template 
    ){
        return declare([Dialog, _TemplatedMixin, _WidgetsInTemplateMixin], {

            templateString: template,
            
            // A class to be applied to the root node in template
            baseClass: "SearchDialog",            

            constructor: function(/*Object*/ kwArgs) {
                lang.mixin(this, kwArgs); 
            },
            
            postCreate: function() {
                this.inherited(arguments);

                on(this.cancelButton, "click", lang.hitch(this, function(){
                    this.onCancel();
                }));
                on(this.resetButton, "click", lang.hitch(this, function(){
                    this.reset();
                }));
                on(this.checkShowRetrospectiveDarts, "click", lang.hitch(this, function(){
                    this.toggleShowRetrospectiveDarts();
                }));
               
                //this.reset();
            },

            execute: function(values) {
                values.showCurrentDarts = this.checkShowCurrentDarts.attr('checked');               
                values.showRetrospectiveDarts = this.checkShowRetrospectiveDarts.attr('checked');
                
                if (this.isDefault(values)) {
                    this.reset();
                } else {
                    topic.publish("/hazards/DartSearch", values);
                }
            },
                   
            clearForm: function() {
                this.checkShowCurrentDarts.set('checked', true);
                this.checkShowRetrospectiveDarts.set('checked', true);
                this.startDateInput.set('value', ' ');
                this.endDateInput.set('value', ' ');
                this.startDateInput.set('disabled', false);
                this.endDateInput.set('disabled', false);
            },

            reset: function() {
                this.clearForm();
                topic.publish("/hazards/ResetDartSearch");
            },

            toggleShowRetrospectiveDarts: function() {
                var disabled = !this.checkShowRetrospectiveDarts.get('checked');
                this.startDateInput.set('disabled', disabled);
                this.endDateInput.set('disabled', disabled);
            },

            isDefault: function(values) {
                return (values.showCurrentDarts && values.showRetrospectiveDarts && !values.startDate && !values.endDate);
            }
    });
});