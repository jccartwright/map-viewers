define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/on',
    'dojo/aspect',
    'dojo/dom',
    'dojo/dom-attr',
    'app/TsEventSearchDialog',
    'app/TsObsSearchDialog',
    'app/SignifEqSearchDialog',
    'app/VolEventSearchDialog',
    'app/DartSearchDialog',
    'dijit/registry',
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
        on,
        aspect,
        dom,
        domAttr,
        TsEventSearchDialog,
        TsObsSearchDialog,
        SignifEqSearchDialog,
        VolEventSearchDialog,
        DartSearchDialog,
        registry,
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
                on(registry.byId("checkTsEvents"), "change", lang.hitch(this, function(checked) {
                    this.toggleTsEventVisibility(checked);
                })); 
                on(registry.byId("checkTsObs"), "change", lang.hitch(this, function(checked) {
                    this.toggleTsObsVisibility(checked);
                })); 
                on(registry.byId("checkSignifEqs"), "change", lang.hitch(this, function(checked) {
                    this.toggleSignifEqVisibility(checked);
                })); 
                on(registry.byId("checkVolEvents"), "change", lang.hitch(this, function(checked) {
                    this.toggleVolEventVisibility(checked);
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
                on(registry.byId("checkPlateBoundaries"), "change", lang.hitch(this, function(checked) {
                    this.togglePlateBoundaries(checked);
                })); 

                on(registry.byId("radioTsEvents1"), "click", lang.hitch(this, function(checked) {
                    this.setTsEventSymbol('cause/deaths');
                })); 
                on(registry.byId("radioTsEvents2"), "click", lang.hitch(this, function(checked) {
                    this.setTsEventSymbol('squares');
                }));
                on(registry.byId("radioTsObs1"), "click", lang.hitch(this, function(checked) {
                    this.setTsObsSymbol('bars');
                })); 
                on(registry.byId("radioTsObs2"), "click", lang.hitch(this, function(checked) {
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
                on(registry.byId("signifEqSearchButton"), "click", lang.hitch(this, function() {
                    if (!this.signifEqSearchDialog) {
                        this.signifEqSearchDialog = new SignifEqSearchDialog({title: 'Significant Earthquakes Search'});
                    }
                    this.signifEqSearchDialog.show();
                }));
                on(registry.byId("signifEqResetButton"), "click", lang.hitch(this, function() {
                    topic.publish('/hazards/ResetSignifEqSearch');
                    this.setSignifEqFilterActive(false);
                }));
                on(registry.byId("volEventSearchButton"), "click", lang.hitch(this, function() {
                    if (!this.volEventSearchDialog) {
                        this.volEventSearchDialog = new VolEventSearchDialog({title: 'Significant Volcanic Eruptions Search'});    
                    }
                    this.volEventSearchDialog.show();
                }));
                on(registry.byId("volEventResetButton"), "click", lang.hitch(this, function() {
                    topic.publish('/hazards/ResetVolEventSearch');
                    this.setVolEventFilterActive(false);
                }));
                on(registry.byId("dartSearchButton"), "click", lang.hitch(this, function() {
                    if (!this.dartSearchDialog) {
                        this.dartSearchDialog = new DartSearchDialog({title: 'DART Stations Search'});
                    }
                    this.dartSearchDialog.show();
                }));
                on(registry.byId("dartResetButton"), "click", lang.hitch(this, function() {
                    topic.publish('/hazards/ResetDartSearch');
                    this.setDartFilterActive(false);
                }));                       
            },

            startup: function() {
                this.inherited(arguments);

                on(dom.byId("tsEventLegendLink"), "click", lang.hitch(this, function() {
                    registry.byId('tsEventLegendPane').show();
                }));
                on(dom.byId("tsObsLegendLink1"), "click", lang.hitch(this, function() {
                    registry.byId('tsObsLegendPane1').show();
                }));
                on(dom.byId("tsObsLegendLink2"), "click", lang.hitch(this, function() {
                    registry.byId('tsObsLegendPane2').show();
                }));
                on(dom.byId("signifEqLegendLink"), "click", lang.hitch(this, function() {
                    registry.byId('signifEqLegendPane').show();
                }));
                on(dom.byId("volEventLegendLink"), "click", lang.hitch(this, function() {
                    registry.byId('volEventLegendPane').show();
                }));
                on(dom.byId("dartLegendLink"), "click", lang.hitch(this, function() {
                    registry.byId('dartLegendPane').show();
                }));
                on(dom.byId("plateBoundariesLegendLink"), "click", lang.hitch(this, function() {
                    registry.byId('plateBoundariesLegendPane').show();
                }));
            },

            toggleTsEventVisibility: function(visible) {
                //Enable/disable the radio buttons
                registry.byId('radioTsEvents1').set('disabled', !visible);
                registry.byId('radioTsEvents2').set('disabled', !visible);

                if (visible) {
                    if (this.tsEventSymbol == 'cause/deaths') {
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
                //Enable/disable the radio buttons
                registry.byId('radioTsObs1').set('disabled', !visible);
                registry.byId('radioTsObs2').set('disabled', !visible);

                if (visible) {
                    if (this.tsObsSymbol == 'bars') {
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
                topic.publish('/ngdc/sublayer/visibility', 'Hazards', [5], visible);
            },

            toggleVolEventVisibility: function(visible) {
                topic.publish('/ngdc/sublayer/visibility', 'Hazards', [6], visible);
            },

            toggleVolcanoVisibility: function(visible) {
                topic.publish('/ngdc/sublayer/visibility', 'Hazards', [7], visible);
            },

            toggleDartVisibility: function(visible) {
                topic.publish('/ngdc/sublayer/visibility', 'Hazards', [8], visible);
                topic.publish('/ngdc/sublayer/visibility', 'Hazards', [9], visible);
            },

            toggleTideGaugeVisibility: function(visible) {
                topic.publish('/ngdc/sublayer/visibility', 'Hazards', [10], visible);
            },

            togglePlateBoundaries: function(visible) {
                topic.publish('/ngdc/sublayer/visibility', 'Hazards', [11], visible);
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
            }
            

        });
    }
);