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
    'dijit/form/MultiSelect', 
    'dijit/form/FilteringSelect', 
    'dijit/form/TextBox',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-attr',
    'dojo/on',
    'dojo/topic',
    'dojo/request/xhr',
    'dojo/store/Memory', 
    'dojo/text!./templates/TsObsSearchDialog.html'
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
        MultiSelect, 
        FilteringSelect, 
        TextBox,
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
            baseClass: "SearchDialog",            

            postCreate: function() {
                this.inherited(arguments);

                on(this.cancelButton, 'click', lang.hitch(this, function(evt){
                    this.onCancel();
                }));
                on(this.resetButton, 'click', lang.hitch(this, function(evt){
                    this.reset();
                })); 

                on(this.countrySelect, 'change', lang.hitch(this, function(evt){
                    this.areaSelect.set('value', '');
                    this.areaSelect.query.country = this.countrySelect.get('value') || /.*/;
                }));     

                this.measurementTypeSelect.set('value', '');

                xhr.get('tsrunupAreas.json', {
                    preventCache: true,
                    handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateAreaSelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving tsrunupAreas JSON: ' + err);
                });            
            },

            constructor: function(/*Object*/ kwArgs) {
                lang.mixin(this, kwArgs); 
            },
                      
            execute: function(values) {
                values.startYear = this.startYearSpinner.get('value');
                values.endYear = this.endYearSpinner.get('value');
                values.sourceRegion = this.sourceRegionSelect.get('value'); 
                values.observationLocationName = this.observationLocationText.get('value');         
                values.observationRegion = this.observationRegionSelect.get('value');
                values.country = this.countrySelect.get('value');
                values.area = this.areaSelect.get('displayedValue');
                values.measurementType = this.measurementTypeSelect.get('value');
                values.minWaterHeight = this.minWaterHeightText.get('value');
                values.maxWaterHeight = this.maxWaterHeightText.get('value');
                values.minDist = this.minDistText.get('value');
                values.maxDist = this.maxDistText.get('value');
                values.minDeaths = this.minDeathsSelect.get('value');       
                values.maxDeaths = this.maxDeathsSelect.get('value');
                values.minDamage = this.minDamageSelect.get('value');       
                values.maxDamage = this.maxDamageSelect.get('value');
                
                if (this.isDefault(values)) {
                    this.reset();
                } else {
                    topic.publish("/hazards/TsObsSearch", values);
                }
            },
                   
            clearForm: function() {
                this.startYearSpinner.set('value', '');
                this.endYearSpinner.set('value', '');
                this.sourceRegionSelect.set('value', '');
                this.observationLocationText.set('value', '');
                this.observationRegionSelect.set('value', '');
                this.countrySelect.set('value', '');
                this.areaSelect.set('value', '');
                this.areaSelect.query = /.*/;
                this.measurementTypeSelect.set('value', '');
                this.minWaterHeightText.set('value', '');
                this.maxWaterHeightText.set('value', '');
                this.minDistText.set('value', '');
                this.maxDistText.set('value', '');
                this.minDeathsSelect.set('value', '');
                this.minDeathsSelect.set('value', '');
                this.minDamageSelect.set('value', '');
                this.minDamageSelect.set('value', '');
            },

            populateAreaSelect: function(items) {
                this.areaSelect.store = new Memory({data: items});
            },

            reset: function() {
                this.clearForm();
                topic.publish('/hazards/ResetTsObsSearch');
            },

            isDefault: function(values) {
                return (!values.startYear && !values.endYear && values.sourceRegion === '' && values.observationLocationName === '' &&
                    values.observationRegion === '' && values.country === '' && values.area === '' &&
                    values.measurementType.length == 0 && !values.minWaterHeight && !values.maxWaterHeight && !values.minDist && !values.maxDist &&
                    values.minDeaths === '' && values.maxDeaths === '' && values.minDamage === '' && values.maxDamage === '');
            }  
    });
});