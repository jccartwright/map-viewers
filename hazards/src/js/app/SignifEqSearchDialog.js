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
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-attr',
    'dojo/on',
    'dojo/topic',
    'dojo/request/xhr',
    'dojo/store/Memory',
    'dojo/text!./templates/SignifEqSearchDialog.html'
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

                on(this.regionSelect, 'change', lang.hitch(this, function(){
                    var regionCode = parseInt(this.regionSelect.get('value'));
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

                xhr.get('signifEqCountries.json', {
                    preventCache: true,
                    handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        data.items.unshift({id: '', name: ''});
                        this.populateCountrySelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving signifEqCountries JSON: ' + err);
                });

                xhr.get('signifEqRegions.json', {
                    preventCache: true,
                    handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        data.items.unshift({id: '', name: ''});
                        this.populateRegionSelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving signifEqRegions JSON: ' + err);
                });
                //this.reset();
            },

            execute: function(values) {
                values.startYear = this.startYearSpinner.get('value');
                values.endYear = this.endYearSpinner.get('value');
                values.region = this.regionSelect.get('value');
                values.country = this.countrySelect.get('displayedValue');
                values.minMagnitude = this.minMagnitudeSpinner.get('value');
                values.maxMagnitude = this.maxMagnitudeSpinner.get('value');
                values.minIntensity = this.minIntensitySpinner.get('value');
                values.maxIntensity = this.maxIntensitySpinner.get('value');
                values.minDepth = this.minDepthSpinner.get('value');
                values.maxDepth = this.maxDepthSpinner.get('value');
                
                values.minDeaths = this.minDeathsSelect.get('value');
                values.maxDeaths = this.maxDeathsSelect.get('value');
                values.minDamage = this.minDamageSelect.get('value');
                values.maxDamage = this.maxDamageSelect.get('value');
                
                values.tsunamiAssoc = this.checkTsunamiAssoc.get('value');
                values.volEventAssoc = this.checkVolEventAssoc.get('value');
                
                if (this.isDefault(values)) {
                    topic.publish("/hazards/ResetSignifEqSearch");
                } else {
                    topic.publish("/hazards/SignifEqSearch", values);
                }
            },
                   
            clearForm: function() {
                this.startYearSpinner.set('value', '');
                this.endYearSpinner.set('value', '');
                this.regionSelect.set('value', '');
                this.countrySelect.set('value', '');   
                this.minMagnitudeSpinner.set('value', '');
                this.maxMagnitudeSpinner.set('value', '');
                this.minIntensitySpinner.set('value', '');
                this.maxIntensitySpinner.set('value', '');
                this.minDepthSpinner.set('value', '');
                this.maxDepthSpinner.set('value', '');  
                this.minDeathsSelect.set('value', '');
                this.maxDeathsSelect.set('value', '');
                this.minDamageSelect.set('value', '');
                this.maxDamageSelect.set('value', '');      
                this.checkTsunamiAssoc.set('checked', false);
                this.checkVolEventAssoc.set('checked', false);
            },

            populateRegionSelect: function(items) {
                this.regionSelect.store = new Memory({data: items});
            },

            populateCountrySelect: function(items) {
                this.countrySelect.store = new Memory({data: items});
            },

            reset: function() {
                this.clearForm();
            },

            isDefault: function(values) {
                return (!values.startYear && !values.endYear && values.region === '' && values.country === '' &&
                    !values.minMagnitude && !values.maxMagnitude && !values.minIntensity && !values.maxIntensity && !values.minDepth && !values.maxDepth &&                    
                    values.minDeaths === '' && values.maxDeaths === '' && values.minDamage === '' && values.maxDamage === '' &&
                    !values.tsunamiAssoc && !values.volEventAssoc);
            }
    });
});