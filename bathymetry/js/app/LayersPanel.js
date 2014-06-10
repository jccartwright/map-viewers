define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/on",
    "dojo/aspect",
    "dojo/dom",
    "dojo/dom-attr",
    "dijit/form/CheckBox",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "app/SearchDialog",
    "dojo/text!./templates/LayersPanel.html"],
    function(
        declare, 
        lang,
        topic,
        on,
        aspect,
        dom,
        domAttr,
        CheckBox,
        _WidgetBase, 
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        SearchDialog,
        template){
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            // Our template - important!
            templateString: template,
            // A class to be applied to the root node in our template
            baseClass: "layersPanel",

            postCreate: function() {
                this.inherited(arguments);

                on(this.chkMultibeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Multibeam', this.chkMultibeam.checked);
                }));
                on(this.chkTrackline, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Trackline Bathymetry', this.chkTrackline.checked);                    
                }));


                on(this.chkNosHydro0, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'NOS Hydrographic Surveys', [0], this.chkNosHydro0.checked);
                }));
                on(this.chkNosHydro1, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'NOS Hydrographic Surveys', [1], this.chkNosHydro1.checked);
                }));
                on(this.chkNosHydro2, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'NOS Hydro (non-digital)', this.chkNosHydro2.checked);                    
                }));
                on(this.chkBagHillshades, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'BAG Hillshades', this.chkBagHillshades.checked);                    
                }));

                on(this.chkDems, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'DEM Extents', this.chkDems.checked);
                })); 
                on(this.chkDemHillshades, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'DEM Hillshades', this.chkDemHillshades.checked);
                }));  

                on(this.chkCscLidar, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'CSC Lidar', [4], this.chkCscLidar.checked);                    
                }));

                on(this.searchButton, "click", lang.hitch(this, function() {
                    if (!this.searchDialog) {
                        this.searchDialog = new SearchDialog({title: 'Bathymetry Survey Search'});
                    }
                    this.searchDialog.show();
                }));  

                on(this.resetButton, "click", lang.hitch(this, function() {
                    topic.publish('/bathymetry/ResetSearch');
                })); 

                // topic.subscribe('/ngdc/mapViewActivated', lang.hitch(this, function(mapId) {
                //     if (mapId == 'antarctic') {
                //         this.setNosHydroDisabled(true);
                //     } else {
                //         this.setNosHydroDisabled(false);
                //     }
                // }));
            },

            setNosHydroDisabled: function(disabled) {
                domAttr.set('chkNosHydro0', 'disabled', disabled);
                domAttr.set('chkNosHydro1', 'disabled', disabled);
                domAttr.set('chkNosHydro2', 'disabled', disabled);
                domAttr.set('chkBagHillshades', 'disabled', disabled);
                domAttr.set('chkDemHillshades', 'disabled', disabled);
                domAttr.set('chkDems', 'disabled', disabled);
            },

            disableResetButton: function() {
                this.resetButton.set("disabled", true);
            },

            enableResetButton: function() {
                this.resetButton.set("disabled", false);
            },

            setCurrentFilterString: function(values) {
                var filterDiv = dom.byId('currentFilter');
                if (!values) {
                    filterDiv.innerHTML = '';
                    return;
                }

                var s = '<b>Current filter:</b><br>';
                
                if (values.startYear && values.endYear) {
                    s += 'Year: ' + values.startYear + ' to ' + values.endYear + '<br>';
                }
                else if (values.startYear) {
                    s += 'Starting year: ' + values.startYear + '<br>';
                }
                else if (values.endYear) {
                    s += 'Ending year: ' + values.endYear + '<br>';
                }

                if (values.survey) {
                    s += 'Survey ID: ' + values.survey + '<br>';
                }
                if (values.ship) {
                    s += 'Ship Name: ' + values.ship + '<br>';
                }                
                filterDiv.innerHTML = s;
            }
        });
    }
);