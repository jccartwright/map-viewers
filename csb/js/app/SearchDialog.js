define([
    'dojo/_base/declare',
    'dijit/Dialog',
    'dijit/_Widget',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/form/Button', 
    'dijit/form/DateTextBox',
    'dijit/form/Select', 
    'dijit/form/CheckBox', 
    'dijit/form/TextBox', 
    'dijit/form/FilteringSelect',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-attr',
    'dojo/on',
    'dojo/topic',
    'dojo/request/xhr',
    'dojo/store/Memory', 
    'dojo/text!./templates/SearchDialog.html'
    ],
    function(
        declare,
        Dialog,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Button, 
        DateTextBox, 
        Select, 
        CheckBox, 
        TextBox,
        FilteringSelect,
        lang,
        array,
        domAttr,
        on,
        topic,
        xhr,
        Memory,
        template 
    ){
        return declare([Dialog, _TemplatedMixin, _WidgetsInTemplateMixin], {

            templateString: template,
            
            // A class to be applied to the root node in template
            baseClass: 'searchDialog',

            constructor: function(/*Object*/ kwArgs) {
                lang.mixin(this, kwArgs); 
            },
                
            postCreate: function() {
                this.inherited(arguments);

                xhr('platforms.json', {
                    preventCache: true,
                    handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populatePlatformSelect(data.items);
                    }
                }), lang.hitch(this, function(err){
                    logger.error('Error retrieving platforms JSON: ' + err);
                    this.populatePlatformSelect(null);
                }));
                                
                on(this.cancelButton, 'click', lang.hitch(this, function(){
                    this.onCancel();
                }));
                on(this.resetButton, 'click', lang.hitch(this, function(){
                    this.reset();
                }));    
            },

            populatePlatformSelect: function(items) {                
                this.platformsStore = new Memory({data: {identifier: 'id', items: items}});

                this.platformSelect = new FilteringSelect({
                    name: "id",
                    store: this.platformsStore,
                    searchAttr: "id",
                    required: false,
                    style: "width:220px;"
                }); 

                //Disable the validator so we can type any value into the box (e.g. wildcards).
                this.platformSelect.validate = function() { 
                    return true; 
                };
                this.platformSelect.placeAt(this.platformSelectDiv); 
            },

            execute: function(values) {  
                //Use _lastDisplayedValue instead of value to handle if a user typed in a string (i.e. with wildcard) that doesn't match anything in the store. Otherwise value is empty.
                values.platform = this.platformSelect.get('_lastDisplayedValue');
                values.zoomToResults = this.chkZoomToResults.get('value');

                if (this.isDefault(values)) {
                    this.reset();
                } else {       
                    topic.publish('/csb/Search', values);
                }
            },
                
            isDefault: function() {
                return (this.platformSelect.get('_lastDisplayedValue') === '' &&
                    !this.startDateInput.get('value') && !this.endDateInput.get('value'));
            },
                   
            clearForm: function() {                
                this.platformSelect.set('value', '');
                this.startDateInput.reset();
                this.endDateInput.reset();                                            
                this.chkZoomToResults.set('checked', true);                             
            },

            reset: function() {
                this.clearForm();
                topic.publish('/csb/ResetSearch');
            }    
    });
});