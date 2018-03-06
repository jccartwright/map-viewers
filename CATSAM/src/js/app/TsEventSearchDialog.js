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
    'dijit/form/TextBox',
    'dijit/form/FilteringSelect',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-attr',
    'dojo/on',
    'dojo/topic',
    'dojo/request/xhr',
    'dojo/store/Memory', 
    'dojo/text!./templates/TsEventSearchDialog.html'
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

                this.tsEventCauseSelect.set('value', ''); 

                on(this.sourceRegionSelect, 'change', lang.hitch(this, function(){
                    var regionCode = parseInt(this.sourceRegionSelect.get('value'));
                    this.sourceCountrySelect.set('query', {
                        r: {
                            test: function(itemRegions) {
                                if (isNaN(regionCode) || array.indexOf(itemRegions, regionCode) !== -1) {
                                    return true;
                                }
                            }
                        }
                    });
                }));

                on(this.runupRegionSelect, 'change', lang.hitch(this, function(){
                    var regionCode = parseInt(this.runupRegionSelect.get('value'));
                    this.runupCountrySelect.set('query', {
                        r: {
                            test: function(itemRegions) {
                                if (isNaN(regionCode) || array.indexOf(itemRegions, regionCode) !== -1) {
                                    return true;
                                }
                            }
                        }
                    });
                }));

                on(this.runupCountrySelect, 'change', lang.hitch(this, function(){
                    this.runupAreaSelect.set('value', '');
                    this.runupAreaSelect.query.c = this.runupCountrySelect.get('displayedValue') || /.*/;
                }));

                xhr.get('https://gis.ngdc.noaa.gov/mapviewer-support/hazards/events/countries.groovy', {
                    preventCache: true,
                    handleAs: 'json'
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        data.items.unshift({id: '', name: ''});
                        this.populateSourceCountrySelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving tseventCountries JSON: ' + err);
                });

                xhr.get('https://gis.ngdc.noaa.gov/mapviewer-support/hazards/runups/countries.groovy', {
                    preventCache: true,
                    handleAs: 'json'
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        data.items.unshift({id: '', name: ''});
                        this.populateRunupCountrySelect(data.items);
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
                        this.populateRunupAreaSelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving tsrunupAreas JSON: ' + err);
                });   
            },

            execute: function(values) {
                values.startYear = this.startYearSpinner.get('value');      
                values.endYear = this.endYearSpinner.get('value');
                values.sourceLocationName = this.sourceLocationText.get('value');       
                values.sourceRegion = this.sourceRegionSelect.get('value');
                values.sourceCountry = this.sourceCountrySelect.get('displayedValue');
                values.sourceCause = this.tsEventCauseSelect.get('value');
                values.minEqMagnitude = this.minEqMagnitudeSpinner.get('value');
                values.maxEqMagnitude = this.maxEqMagnitudeSpinner.get('value');
                values.minDeaths = this.minDeathsSelect.get('value');       
                values.maxDeaths = this.maxDeathsSelect.get('value');
                values.minDamage = this.minDamageSelect.get('value');
                values.maxDamage = this.maxDamageSelect.get('value');
                values.minEventValidity = this.minEventValiditySelect.get('value');
                values.maxEventValidity = this.maxEventValiditySelect.get('value');

                values.runupRegion = this.runupRegionSelect.get('value');
                values.runupCountry = this.runupCountrySelect.get('displayedValue');
                values.runupArea = this.runupAreaSelect.get('displayedValue');
                values.minRunupHeight = this.minRunupHeightSpinner.get('value');
                values.maxRunupHeight = this.maxRunupHeightSpinner.get('value');
                values.minRunupDeaths = this.minRunupDeathsSelect.get('value');
                values.maxRunupDeaths = this.maxRunupDeathsSelect.get('value');
                values.minRunupDamage = this.minRunupDamageSelect.get('value');
                values.maxRunupDamage = this.maxRunupDamageSelect.get('value');
                values.minRunupDistance = this.minRunupDistanceSpinner.get('value');
                values.maxRunupDistance = this.maxRunupDistanceSpinner.get('value');

                if (this.isDefault(values)) {
                    topic.publish("/hazards/ResetTsEventSearch");
                } else {
                    topic.publish("/hazards/TsEventSearch", values);
                }
            },
                   
            clearForm: function() {
                this.startYearSpinner.set('value', '');
                this.endYearSpinner.set('value', '');
                this.sourceLocationText.set('value', '');       
                this.sourceRegionSelect.set('value', '');
                this.sourceCountrySelect.set('value', '');
                this.tsEventCauseSelect.reset();
                this.tsEventCauseSelect._updateSelection();
                this.minEqMagnitudeSpinner.set('value');
                this.maxEqMagnitudeSpinner.set('value');
                this.minDeathsSelect.set('value', '');      
                this.maxDeathsSelect.set('value', '');
                this.minDamageSelect.set('value', '');
                this.maxDamageSelect.set('value', '');
                this.minEventValiditySelect.set('value', '1');
                this.maxEventValiditySelect.set('value', '');

                this.runupRegionSelect.set('value', '');
                this.runupCountrySelect.set('value', '');
                this.runupAreaSelect.set('value', '');
                this.minRunupHeightSpinner.set('value', '');
                this.maxRunupHeightSpinner.set('value', '');
                this.minRunupDeathsSelect.set('value', '');
                this.maxRunupDeathsSelect.set('value', '');
                this.minRunupDamageSelect.set('value', '');
                this.maxRunupDamageSelect.set('value', '');
                this.minRunupDistanceSpinner.set('value', '');
                this.maxRunupDistanceSpinner.set('value', '');
            },

            populateSourceRegionSelect: function(items) {
                this.sourceRegionSelect.store = new Memory({data: items});
            },

            populateSourceCountrySelect: function(items) {
                this.sourceCountrySelect.store = new Memory({data: items});
            },

            populateRunupRegionSelect: function(items) {
                this.runupRegionSelect.store = new Memory({data: items});
            },

            populateRunupCountrySelect: function(items) {
                this.runupCountrySelect.store = new Memory({data: items});                
            },

            populateRunupAreaSelect: function(items) {
                this.runupAreaSelect.store = new Memory({data: items});
            },

            reset: function() {
                this.clearForm();                
            },

            isDefault: function(values) {
                return (!values.startYear && !values.endYear && values.sourceLocationName === '' && values.sourceRegion === '' &&
                    values.sourceCountry === '' && values.sourceCause.length === 0 && values.minDeaths === '' && values.maxDeaths === '' &&
                    !values.minEqMagnitude && !values.maxEqMagnitude &&
                    values.minDamage === '' && values.maxDamage === '' && values.minEventValidity === '1' && values.maxEventValidity === '' &&
                    values.runupRegion === '' && values.runupCountry === '' && values.runupArea === '' && !values.minRunupDistance && !values.maxRunupDistance &&
                    !values.minRunupHeight && !values.maxRunupHeight && values.minRunupDeaths === '' && values.maxRunupDeaths === '' &&
                    values.minRunupDamage === '' && values.maxRunupDamage === '');
            }
    });
});