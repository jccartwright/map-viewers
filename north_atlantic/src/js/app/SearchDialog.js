define([
    'dojo/_base/declare',
    'dijit/Dialog',
    'dijit/_Widget',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/form/Button', 
    'dijit/form/NumberSpinner', 
    'dijit/form/Select', 
    'dijit/form/CheckBox', 
    'dijit/form/TextBox', 
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-attr',
    'dojo/on',
    'dojo/topic',
    'dojo/text!./templates/SearchDialog.html'
    ],
    function(
        declare,
        Dialog,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Button, 
        NumberSpinner, 
        Select, 
        CheckBox, 
        TextBox, 
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
            baseClass: 'searchDialog',

            constructor: function(/*Object*/ kwArgs) {
                console.log('inside SearchDialog constructor...');
                lang.mixin(this, kwArgs); 
            },
                
            postCreate: function() {
                //console.log('inside SurveySelectDialog postCreate...');
                                
                on(this.cancelButton, 'click', lang.hitch(this, function(){
                    this.onCancel();
                }));
                on(this.resetButton, 'click', lang.hitch(this, function(){
                    this.reset();
                })); 
                                                                        
                this.inherited(arguments);
            },

            execute: function(values) {  
                values.zoomToResults = this.chkZoomToResults.get('value');

                if (this.isDefault(values)) {
                    this.reset();
                } else {       
                    topic.publish('/bathymetry/Search', values);
                }
            },
                
            isDefault: function(values) {
                return (!values.startYear && !values.endYear && values.survey === '' && values.platform === '');
            },
                   
            clearForm: function() {                
                this.surveyNameText.set('value', '');
                this.platformNameText.set('value', '');                                            
                this.startYearSpinner.set('value', '');
                this.endYearSpinner.set('value', '');
                this.chkZoomToResults.set('checked', true);                             
            },

            reset: function() {
                this.clearForm();
                topic.publish('/bathymetry/ResetSearch');
            }    
    });
});