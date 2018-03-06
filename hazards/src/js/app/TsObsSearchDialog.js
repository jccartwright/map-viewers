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
    'dojox/form/CheckedMultiSelect',
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
        CheckedMultiSelect, 
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

                on(this.cancelButton, 'click', lang.hitch(this, function(){
                    this.onCancel();
                }));
                on(this.resetButton, 'click', lang.hitch(this, function(){
                    this.reset();
                })); 

                on(this.runupRegionSelect, 'change', lang.hitch(this, function(){
                    var regionCode = parseInt(this.runupRegionSelect.get('value'));
                    this.countrySelect.set('query', {
                        r: {
                            test: function(itemRegions) {
                                if (isNaN(regionCode) || array.indexOf(itemRegions, regionCode) !== -1) {
                                    return true;
                                }
                            }
                        }
                    });
                }));

                on(this.countrySelect, 'change', lang.hitch(this, function(){
                    this.areaSelect.set('value', '');
                    this.areaSelect.query.c = this.countrySelect.get('displayedValue') || /.*/;
                }));

                this.measurementTypeSelect.set('value', '');

                xhr.get('https://gis.ngdc.noaa.gov/mapviewer-support/hazards/runups/countries.groovy', {
                    preventCache: true,
                    handleAs: 'json'
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        data.items.unshift({id: '', name: ''});
                        this.populateCountrySelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving tsrunupCountries JSON: ' + err);
                });

                xhr.get('https://gis.ngdc.noaa.gov/mapviewer-support/hazards/runups/regions.groovy', {
                    preventCache: true,
                    handleAs: 'json'
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        data.items.unshift({id: '', name: ''});
                        this.populateSourceRegionSelect(data.items);
                        this.populateRunupRegionSelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving tsunamiRegions JSON: ' + err);
                });

                xhr.get('https://gis.ngdc.noaa.gov/mapviewer-support/hazards/runups/areas.groovy', {
                    preventCache: true,
                    handleAs: 'json'
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        data.items.unshift({id: '', name: ''});
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
                values.locationName = this.locationText.get('value');         
                values.runupRegion = this.runupRegionSelect.get('value');
                values.country = this.countrySelect.get('displayedValue');
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
                    topic.publish('/hazards/ResetTsObsSearch');
                } else {
                    topic.publish("/hazards/TsObsSearch", values);
                }
            },
                   
            clearForm: function() {
                this.startYearSpinner.set('value', '');
                this.endYearSpinner.set('value', '');
                this.sourceRegionSelect.set('value', '');
                this.locationText.set('value', '');
                this.runupRegionSelect.set('value', '');
                this.countrySelect.set('value', '');
                this.areaSelect.set('value', '');
                this.areaSelect.query = /.*/;
                this.measurementTypeSelect.reset();
                this.measurementTypeSelect._updateSelection();
                this.minWaterHeightText.set('value', '');
                this.maxWaterHeightText.set('value', '');
                this.minDistText.set('value', '');
                this.maxDistText.set('value', '');
                this.minDeathsSelect.set('value', '');
                this.minDeathsSelect.set('value', '');
                this.minDamageSelect.set('value', '');
                this.minDamageSelect.set('value', '');
            },

            populateSourceRegionSelect: function(items) {
                this.sourceRegionSelect.store = new Memory({data: items});
            },

            populateRunupRegionSelect: function(items) {
                this.runupRegionSelect.store = new Memory({data: items});
            },

            populateCountrySelect: function(items) {
                this.countrySelect.store = new Memory({data: items});                
            },

            populateAreaSelect: function(items) {
                this.areaSelect.store = new Memory({data: items});
            },

            reset: function() {
                this.clearForm();
            },

            isDefault: function(values) {
                return (!values.startYear && !values.endYear && values.sourceRegion === '' && values.locationName === '' &&
                    values.runupRegion === '' && values.country === '' && values.area === '' &&
                    values.measurementType.length === 0 && !values.minWaterHeight && !values.maxWaterHeight && !values.minDist && !values.maxDist &&
                    values.minDeaths === '' && values.maxDeaths === '' && values.minDamage === '' && values.maxDamage === '');
            }  
    });
});