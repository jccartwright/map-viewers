define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/request/xhr',
    'dojo/store/Memory', 
    'dojo/on',
    'dojo/aspect',
    'dojo/dom',
    'dojo/dom-attr',
    'dojo/dom-style',
    'dojo/_base/array',
    'esri/geometry/Point',
    'esri/geometry/Extent',
    'esri/geometry/webMercatorUtils',
    'esri/SpatialReference',
    'app/TsEventSearchDialog',
    'app/TsObsSearchDialog',
    'app/SignifEqSearchDialog',
    'app/VolEventSearchDialog',
    'app/DartSearchDialog',
    'dijit/registry',
    'dijit/form/DropDownButton',
    'dijit/form/FilteringSelect',
    'dijit/form/ComboBox',
    'dijit/TooltipDialog',
    'dijit/form/CheckBox',
    'dijit/form/Button',
    'dijit/form/RadioButton',
    'dojox/layout/FloatingPane',
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
        aspect,
        dom,
        domAttr,
        domStyle,
        array,
        Point,
        Extent,
        webMercatorUtils,
        SpatialReference,
        TsEventSearchDialog,
        TsObsSearchDialog,
        SignifEqSearchDialog,
        VolEventSearchDialog,
        DartSearchDialog,
        registry,
        DropDownButton,
        FilteringSelect,
        ComboBox,
        TooltipDialog,
        CheckBox,
        Button,
        RadioButton,
        FloatingPane,
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
                on(registry.byId("checkTsEvents"), "change", lang.hitch(this, function(checked) {
                    this.toggleTsEventVisibility(checked);
                })); 
                on(registry.byId("checkTsObs"), "change", lang.hitch(this, function(checked) {
                    this.toggleTsObsVisibility(checked);
                })); 
                // on(registry.byId("checkSignifEqs"), "change", lang.hitch(this, function(checked) {
                //     this.toggleSignifEqVisibility(checked);
                // })); 
                // on(registry.byId("checkVolEvents"), "change", lang.hitch(this, function(checked) {
                //     this.toggleVolEventVisibility(checked);
                // })); 
                on(registry.byId("checkVolcanoes"), "change", lang.hitch(this, function(checked) {
                    this.toggleVolcanoVisibility(checked);
                }));
                on(registry.byId("checkDarts"), "change", lang.hitch(this, function(checked) {
                    this.toggleDartVisibility(checked);
                })); 
                on(registry.byId("checkTideGauges"), "change", lang.hitch(this, function(checked) {
                    this.toggleTideGaugeVisibility(checked);
                })); 
                on(registry.byId("checkPlateBoundaries"), "change", lang.hitch(this, function(checked) {
                    this.togglePlateBoundaries(checked);
                })); 
                // on(registry.byId("checkTTT"), "change", lang.hitch(this, function(checked) {
                //     this.toggleTTT(checked);
                // })); 
                // on(registry.byId("checkTsunamiEnergy"), "change", lang.hitch(this, function(checked) {
                //     this.toggleTsunamiEnergy(checked);
                // })); 

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
                // on(registry.byId("signifEqSearchButton"), "click", lang.hitch(this, function() {
                //     if (!this.signifEqSearchDialog) {
                //         this.signifEqSearchDialog = new SignifEqSearchDialog({title: 'Significant Earthquakes Search'});
                //     }
                //     this.signifEqSearchDialog.show();
                // }));
                // on(registry.byId("signifEqResetButton"), "click", lang.hitch(this, function() {
                //     topic.publish('/hazards/ResetSignifEqSearch');
                //     this.setSignifEqFilterActive(false);
                // }));
                // on(registry.byId("volEventSearchButton"), "click", lang.hitch(this, function() {
                //     if (!this.volEventSearchDialog) {
                //         this.volEventSearchDialog = new VolEventSearchDialog({title: 'Significant Volcanic Eruptions Search'});    
                //     }
                //     this.volEventSearchDialog.show();
                // }));
                // on(registry.byId("volEventResetButton"), "click", lang.hitch(this, function() {
                //     topic.publish('/hazards/ResetVolEventSearch');
                //     this.setVolEventFilterActive(false);
                // }));
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

                // xhr.get('signifTsEvents.json', {
                //     preventCache: true,
                //     handleAs: 'json',
                // }).then(lang.hitch(this, function(data){
                //     if (data.items) {
                //         data.items.unshift({id: '', name: ''});
                //         this.populateSignifTsEventsSelect(data.items);
                //     }
                // }), function(err){
                //     logger.error('Error retrieving signifTsEvents JSON: ' + err);
                // });

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
                        data.items.unshift({id: 'All', name: 'All'});
                        this.populateRegionsSelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving regions JSON: ' + err);
                });

                // on(this.signifTsEventSelect, 'change', lang.hitch(this, function() {
                //     var tsEventId = this.signifTsEventSelect.get('value');
                //     this.activateTTTandRIFT(tsEventId);
                //     if (tsEventId !== '') {
                //         var store = this.signifTsEventSelect.store;
                //         var lon = store.query({id: tsEventId})[0].lon;
                //         var lat = store.query({id: tsEventId})[0].lat;
                //         var xmin = store.query({id: tsEventId})[0].xmin;
                //         var xmax = store.query({id: tsEventId})[0].xmax;
                //         var ymin = store.query({id: tsEventId})[0].ymin;
                //         var ymax = store.query({id: tsEventId})[0].ymax;
                //         var extent;

                //         if (xmin && xmax && ymin && ymax) {
                //             //Handle antimeridian-crossing extent
                //             if (xmin > xmax) {
                //                 xmin = xmin - 360;
                //             }
                //             extent = new Extent(xmin, ymin, xmax, ymax, new SpatialReference({wkid: 4326}))
                //         }
                //         topic.publish('/hazards/ShowTsObsForEvent', tsEventId, false, webMercatorUtils.geographicToWebMercator(new Point(lon, lat)), extent);
                //     }
                // }));  

                on(this.regionSelect, 'change', lang.hitch(this, function(region) {                    
                    console.log('Selected region: ' + region);
                    this.tsunamiScenarioSelect.set('value', '');
                    if (region === 'All') {
                        this.tsunamiScenarioSelect.query.region = /.*/;
                    } else {
                        this.tsunamiScenarioSelect.query.region = region;
                    }
                }));  

                on(this.tsunamiScenarioSelect, 'change', lang.hitch(this, function(scenario) {
                    console.log('Selected scenario: ' + scenario);
                    if (scenario !== '') {
                        var store = this.tsunamiScenarioSelect.store;
                        //var region = store.query({id: scenario})[0].region;
                        var energyLayer = store.query({id: scenario})[0].energyLayer;
                        //this.regionSelect.set('value', region);

                        topic.publish('/ngdc/layer/visibility', 'CARIBE-EWS Tsunami Energy', true);
                        topic.publish('/ngdc/sublayer/visibility', 'CARIBE-EWS Tsunami Energy', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], false);
                        topic.publish('/ngdc/sublayer/visibility', 'CARIBE-EWS Tsunami Energy', [energyLayer], true);
                    }
                }));  

                on(registry.byId('resetAllButton'), 'click', lang.hitch(this, function() {
                    topic.publish('/hazards/ResetTsEventSearch');
                    topic.publish('/hazards/ResetTsObsSearch');
                    topic.publish('/hazards/ResetSignifEqSearch');
                    topic.publish('/hazards/ResetVolEventSearch');
                    topic.publish('/hazards/ResetDartSearch');
                    
                    this.setTsEventFilterActive(false);
                    this.setTsObsFilterActive(false);
                    this.setVolEventFilterActive(false);
                    this.setSignifEqFilterActive(false);
                    this.setDartFilterActive(false);

                    registry.byId('checkTsEvents').set('checked', false);
                    registry.byId('checkTsObs').set('checked', false);
                    registry.byId('checkSignifEqs').set('checked', false);
                    registry.byId('checkVolEvents').set('checked', false);
                    registry.byId('checkDarts').set('checked', false);

                    this.signifTsEventSelect.set('value', '');
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

            toggleSignifEqVisibility: function(visible) {
                registry.byId('checkSignifEqs').set('checked', visible);
                topic.publish('/ngdc/sublayer/visibility', 'Hazards', [5], visible);
            },

            toggleVolEventVisibility: function(visible) {
                registry.byId('checkVolEvents').set('checked', visible);
                topic.publish('/ngdc/sublayer/visibility', 'Hazards', [6], visible);
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

            setSignifEqFilterActive: function(active) {
                registry.byId("signifEqResetButton").set("disabled", !active);
                if (active) {
                    dom.byId("signifEqFlag").innerHTML = "<i><b>Filter Activated</b></i><br>";
                    registry.byId('checkSignifEqs').set('checked', true);
                }
                else {
                    dom.byId("signifEqFlag").innerHTML = "";
                    if  (this.signifEqSearchDialog) {
                        this.signifEqSearchDialog.clearForm();
                    }
                }
            }, 

            setVolEventFilterActive: function(active) {
                registry.byId("volEventResetButton").set("disabled", !active);
                if (active) {
                    dom.byId("volEventFlag").innerHTML = "<i><b>Filter Activated</b></i><br>";
                    registry.byId('checkVolEvents').set('checked', true);
                }
                else {
                    dom.byId("volEventFlag").innerHTML = ""; 
                    if (this.volEventSearchDialog) {
                        this.volEventSearchDialog.clearForm();
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

            populateSignifTsEventsSelect: function(items) {
                this.signifTsEventSelect.store = new Memory({data: items});
                this.getSignifTsEventList();
            },

            getSignifTsEventList: function() {
                var items = this.signifTsEventSelect.store.query();
                this.signifTsEventIds = [];
                array.forEach(items, lang.hitch(this, function(item) {
                    if (item.id) {
                        this.signifTsEventIds.push(item.id);
                    }
                }));
            },

            populateRegionsSelect: function(items) {
                this.regionSelect.store = new Memory({data: items});
                this.regionSelect.startup();
                //this.getSignifTsEventList();
            },

            populateTsunamiScenariosSelect: function(items) {
                this.tsunamiScenarioSelect.store = new Memory({data: items});
                //this.tsunamiScenarioSelect.startup();
            },

            activateTTTandRIFT: function(tsEventId) {
                var tttLayer, riftLayer;

                this.signifTsEventSelect.set('value', tsEventId);

                if (tsEventId !== '') {
                    tttLayer = this.signifTsEventSelect.store.query({id: tsEventId})[0].tttLayer;
                    riftLayer = this.signifTsEventSelect.store.query({id: tsEventId})[0].riftLayer;
                }

                topic.publish('/ngdc/sublayer/visibility', 'TTT', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], false);
                topic.publish('/ngdc/sublayer/visibility', 'Tsunami Energy', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], false);

                if (tttLayer !== null && tttLayer !== undefined) {
                    registry.byId('checkTTT').set('checked', true);
                    topic.publish('/ngdc/sublayer/visibility', 'TTT', [tttLayer], true);
                } else {
                    registry.byId('checkTTT').set('checked', false);
                }

                if (riftLayer !== null && riftLayer !== undefined) {
                    registry.byId('checkTsunamiEnergy').set('checked', true);
                    topic.publish('/ngdc/sublayer/visibility', 'Tsunami Energy', [riftLayer], true);
                } else {
                    registry.byId('checkTsunamiEnergy').set('checked', false);
                }   
            }
        });
    }
);