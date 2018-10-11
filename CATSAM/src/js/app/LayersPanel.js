define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/request/xhr',
    'dojo/store/Memory', 
    'dojo/on',
    'dojo/dom',
    'app/TsEventSearchDialog',
    'app/TsObsSearchDialog',    
    'app/DartSearchDialog',
    'dijit/registry',
    'dijit/form/DropDownButton',
    'dijit/form/FilteringSelect',
    'dijit/form/Select',
    'dijit/TooltipDialog',
    'dijit/form/CheckBox',
    'dijit/form/Button',
    'dijit/form/RadioButton',
    'dijit/TitlePane',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!./templates/LayersPanel.html'],
    function(
        declare, 
        lang,
        topic,
        xhr,
        Memory,
        on,
        dom,
        TsEventSearchDialog,
        TsObsSearchDialog,
        DartSearchDialog,
        registry,
        DropDownButton,
        FilteringSelect,
        Select,
        TooltipDialog,
        CheckBox,
        Button,
        RadioButton,
        TitlePane,
        _WidgetBase, 
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        template){
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            // Our template - important!
            templateString: template,
            // A class to be applied to the root node in our template
            baseClass: 'layersPanel',

            postCreate: function() {
                this.inherited(arguments);

                this.tsEventSymbol = 'cause/deaths';
                this.tsObsSymbol = 'bars';

                //Connect to left panel controls
                on(registry.byId("checkScenarios"), "change", lang.hitch(this, function(checked) {
                    this.toggleScenarios(checked);
                })); 
                on(registry.byId("checkTsunamiEnergy"), "change", lang.hitch(this, function(checked) {
                    this.toggleTsunamiEnergy(checked);
                })); 
                on(registry.byId("scenarioResetButton"), "click", lang.hitch(this, function() {
                    this.regionSelect.set('value', '');
                    //this.meetingExcerciseSelect.set('value', '');
                    this.meetingExcerciseSelect.reset();
                    this.meetingExcerciseSelect.set('value', 'any');
                    this.tsunamiScenarioSelect.set('value', '');
                    topic.publish('/ngdc/sublayer/visibility', 'CARIBE-EWS Tsunami Energy', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22], false);
                    topic.publish('resetScenario');
                }));

                on(registry.byId("checkTsEvents"), "change", lang.hitch(this, function(checked) {
                    this.toggleTsEventVisibility(checked);
                })); 
                on(registry.byId("checkTsObs"), "change", lang.hitch(this, function(checked) {
                    this.toggleTsObsVisibility(checked);
                })); 
                on(registry.byId("checkVolcanoes"), "change", lang.hitch(this, function(checked) {
                    this.toggleVolcanoVisibility(checked);
                }));
                on(registry.byId("checkDarts"), "change", lang.hitch(this, function(checked) {
                    this.toggleDartVisibility(checked);
                })); 
                on(registry.byId("checkTideGauges"), "change", lang.hitch(this, function(checked) {
                    this.toggleTideGaugeVisibility(checked);
                }));
                on(registry.byId("checkIocStations"), "change", lang.hitch(this, function(checked) {
                    this.toggleIocStationVisibility(checked);
                }));
                on(registry.byId("checkPlateBoundaries"), "change", lang.hitch(this, function(checked) {
                    this.togglePlateBoundaries(checked);
                })); 
                on(registry.byId("radioTsEvents1"), "click", lang.hitch(this, function() {
                    this.setTsEventSymbol('cause/deaths');
                })); 
                on(registry.byId("radioTsEvents2"), "click", lang.hitch(this, function() {
                    this.setTsEventSymbol('squares');
                }));
                on(registry.byId("radioTsObs1"), "click", lang.hitch(this, function() {
                    this.setTsObsSymbol('bars');
                })); 
                on(registry.byId("radioTsObs2"), "click", lang.hitch(this, function() {
                    this.setTsObsSymbol('crosses');
                }));
                on(registry.byId("tsEventSearchButton"), "click", lang.hitch(this, function() {
                    if (!this.tsEventSearchDialog) {
                        this.tsEventSearchDialog = new TsEventSearchDialog({title: 'Tsunami Events Search'});
                    }            
                    this.tsEventSearchDialog.show();
                }));
                on(registry.byId("tsEventResetButton"), "click", lang.hitch(this, function() {
                    topic.publish('/hazards/ResetTsEventSearch');
                    this.setTsEventFilterActive(false);
                }));
                on(registry.byId("tsObsSearchButton"), "click", lang.hitch(this, function() {
                    if (!this.tsObsSearchDialog) {
                        this.tsObsSearchDialog = new TsObsSearchDialog({title: 'Tsunami Observations Search'});
                    }
                    this.tsObsSearchDialog.show();
                }));
                on(registry.byId("tsObsResetButton"), "click", lang.hitch(this, function() {
                    topic.publish('/hazards/ResetTsObsSearch');
                    this.setTsObsFilterActive(false);
                }));
                on(registry.byId("dartSearchButton"), "click", lang.hitch(this, function() {
                    if (!this.dartSearchDialog) {
                        this.dartSearchDialog = new DartSearchDialog({title: 'DART® Deployments Search'});
                    }
                    this.dartSearchDialog.show();
                }));
                on(registry.byId("dartResetButton"), "click", lang.hitch(this, function() {
                    topic.publish('/hazards/ResetDartSearch');
                    this.setDartFilterActive(false);
                }));

                xhr.get('tsunamiScenarios.json', {
                    preventCache: true,
                    handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        data.items.unshift({id: '', name: ''});
                        this.populateTsunamiScenariosSelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving tsunamiScenarios JSON: ' + err);
                });

                xhr.get('regions.json', {
                    preventCache: true,
                    handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        this.populateRegionsSelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving regions JSON: ' + err);
                });

                on(this.regionSelect, 'change', lang.hitch(this, function(region) {                    
                    //console.log('Selected region: ' + region);
                    this.tsunamiScenarioSelect.set('value', '');
                    if (region === '' || region === 'All') {
                        this.tsunamiScenarioSelect.query.region = /.*/;
                    } else {
                        this.tsunamiScenarioSelect.query.region = region;
                    }
                }));

                on(this.meetingExcerciseSelect, 'change', lang.hitch(this, function(value) {                    
                    //this.tsunamiScenarioSelect.set('value', '');
                    this.tsunamiScenarioSelect.query.expertsMeeting = /.*/;
                    this.tsunamiScenarioSelect.query.waveExercise = /.*/;

                    if (value === 'expertsMeetings') {
                        this.tsunamiScenarioSelect.query.expertsMeeting = true;
                    } else if (value === 'waveExercises') {
                        this.tsunamiScenarioSelect.query.waveExercise = true;
                    }
                }));  

                on(this.tsunamiScenarioSelect, 'change', lang.hitch(this, function(scenario) {
                    //console.log('Selected scenario: ' + scenario);
                    if (scenario !== '') {
                        var store = this.tsunamiScenarioSelect.store;
                        var item = store.query({id: scenario})[0];
                        var energyLayer = item.energyLayer;
                        var faultPlanes = item.faultPlanes.slice(0);
                        //this.regionSelect.set('value', region);

                        topic.publish('/ngdc/layer/visibility', 'CARIBE-EWS Tsunami Energy', true);
                        topic.publish('/ngdc/sublayer/visibility', 'CARIBE-EWS Tsunami Energy', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22], false);
                        topic.publish('/ngdc/sublayer/visibility', 'CARIBE-EWS Tsunami Energy', [energyLayer], true);

                        topic.publish('scenarioFaultPlanes', faultPlanes);
                    }
                }));  

                on(registry.byId('resetAllButton'), 'click', lang.hitch(this, function() {
                    topic.publish('/hazards/ResetTsEventSearch');
                    topic.publish('/hazards/ResetTsObsSearch');
                    topic.publish('/hazards/ResetDartSearch');
                    
                    this.setTsEventFilterActive(false);
                    this.setTsObsFilterActive(false);
                    this.setDartFilterActive(false);

                    registry.byId('checkTsEvents').set('checked', false);
                    registry.byId('checkTsObs').set('checked', false);
                    registry.byId('checkDarts').set('checked', false);
                }));        
            },

            toggleScenarios: function(visible) {
                topic.publish('/ngdc/layer/visibility', 'Scenarios', visible);
            },

            toggleTsEventVisibility: function(visible) {
                registry.byId('checkTsEvents').set('checked', visible);

                //Enable/disable the radio buttons
                registry.byId('radioTsEvents1').set('disabled', !visible);
                registry.byId('radioTsEvents2').set('disabled', !visible);

                if (visible) {
                    if (this.tsEventSymbol === 'cause/deaths') {
                        topic.publish('/ngdc/sublayer/visibility', 'Hazards', [0], false);
                        topic.publish('/ngdc/sublayer/visibility', 'Hazards', [1], true);
                    }
                    else {
                        topic.publish('/ngdc/sublayer/visibility', 'Hazards', [0], true);
                        topic.publish('/ngdc/sublayer/visibility', 'Hazards', [1], false);
                    }  
                }
                else {
                    topic.publish('/ngdc/sublayer/visibility', 'Hazards', [0], false);
                    topic.publish('/ngdc/sublayer/visibility', 'Hazards', [1], false);
                }
            },

            toggleTsObsVisibility: function(visible) {
                registry.byId('checkTsObs').set('checked', visible);

                //Enable/disable the radio buttons
                registry.byId('radioTsObs1').set('disabled', !visible);
                registry.byId('radioTsObs2').set('disabled', !visible);

                if (visible) {
                    if (this.tsObsSymbol === 'bars') {
                        topic.publish('/ngdc/sublayer/visibility', 'Hazards', [2], true);
                        topic.publish('/ngdc/sublayer/visibility', 'Hazards', [3], true);
                        topic.publish('/ngdc/sublayer/visibility', 'Hazards', [4], false);
                    }
                    else {
                        topic.publish('/ngdc/sublayer/visibility', 'Hazards', [2], false);
                        topic.publish('/ngdc/sublayer/visibility', 'Hazards', [3], false);
                        topic.publish('/ngdc/sublayer/visibility', 'Hazards', [4], true);
                    }  
                }
                else {
                    topic.publish('/ngdc/sublayer/visibility', 'Hazards', [2], false);
                    topic.publish('/ngdc/sublayer/visibility', 'Hazards', [3], false);
                    topic.publish('/ngdc/sublayer/visibility', 'Hazards', [4], false);
                }
            },

            setTsEventSymbol: function(option) { 
                this.tsEventSymbol = option;
                this.toggleTsEventVisibility(true);
            },

            setTsObsSymbol: function(option) {
                this.tsObsSymbol = option;
                this.toggleTsObsVisibility(true);
            },
            
            toggleVolcanoVisibility: function(visible) {
                registry.byId('checkVolcanoes').set('checked', visible);
                topic.publish('/ngdc/sublayer/visibility', 'Hazards', [7], visible);
            },

            toggleDartVisibility: function(visible) {
                registry.byId('checkDarts').set('checked', visible);
                topic.publish('/ngdc/sublayer/visibility', 'Hazards', [8], visible);
                topic.publish('/ngdc/sublayer/visibility', 'Hazards', [9], visible);
            },

            toggleTideGaugeVisibility: function(visible) {
                registry.byId('checkTideGauges').set('checked', visible);
                topic.publish('/ngdc/sublayer/visibility', 'Hazards', [10], visible);
            },

            toggleIocStationVisibility: function(visible) {
                registry.byId('checkIocStations').set('checked', visible);
                topic.publish('iocStationsVisibility', visible);
            },

            togglePlateBoundaries: function(visible) {
                registry.byId('checkPlateBoundaries').set('checked', visible);
                topic.publish('/ngdc/sublayer/visibility', 'Hazards', [11], visible);
            },

            toggleTTT: function(visible) {
                registry.byId('checkTTT').set('checked', visible);
                topic.publish('/ngdc/layer/visibility', 'TTT', visible);
            },

            toggleTsunamiEnergy: function(visible) {
                registry.byId('checkTsunamiEnergy').set('checked', visible);
                topic.publish('/ngdc/layer/visibility', 'CARIBE-EWS Tsunami Energy', visible);
            },
            
            setTsEventFilterActive: function(active) {
                registry.byId("tsEventResetButton").set("disabled", !active);
                if (active) {
                    dom.byId("tsEventsFlag").innerHTML = "<i><b>Filter Activated</b></i><br>";
                    registry.byId('checkTsEvents').set('checked', true);
                }
                else {
                    dom.byId("tsEventsFlag").innerHTML = "";
                    if (this.tsEventSearchDialog) {
                        this.tsEventSearchDialog.clearForm();
                    }
                }
            },

            setTsObsFilterActive: function(active) {
                registry.byId("tsObsResetButton").set("disabled", !active);
                if (active) {
                    dom.byId("tsObsFlag").innerHTML = "<i><b>Filter Activated</b></i><br>";
                    registry.byId('checkTsObs').set('checked', true);
                }
                else {
                    dom.byId("tsObsFlag").innerHTML = "";
                    if (this.tsObsSearchDialog) {
                        this.tsObsSearchDialog.clearForm();
                    }
                }
            },

            setDartFilterActive: function(active) {
                registry.byId("dartResetButton").set("disabled", !active);
                if (active) {
                    dom.byId("dartFlag").innerHTML = "<i><b>Filter Activated</b></i><br>";
                    registry.byId('checkDarts').set('checked', true);
                }
                else {
                    dom.byId("dartFlag").innerHTML = "";
                    if (this.dartSearchDialog) {
                        this.dartSearchDialog.clearForm();
                    }
                }
            },

            populateRegionsSelect: function(items) {
                this.regionSelect.store = new Memory({data: items});
                this.regionSelect.startup();
            },

            populateTsunamiScenariosSelect: function(items) {
                this.tsunamiScenarioSelect.store = new Memory({data: items});
            },

            setIocStationsCheckboxEnabled: function() {
                registry.byId('checkIocStations').set('disabled', false);
            }
        });
    }
);