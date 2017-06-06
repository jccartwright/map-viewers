define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/on',
    'dojo/aspect',
    'dojo/dom',
    'dojo/dom-attr',
    'dijit/form/CheckBox',
    'dijit/form/RadioButton',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'app/SearchDialog',
    'dojo/text!./templates/LayersPanel.html'],
    function(
        declare, 
        lang,
        topic,
        on,
        aspect,
        dom,
        domAttr,
        CheckBox,
        RadioButton,
        _WidgetBase, 
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        SearchDialog,
        template){
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            // Our template - important!
            templateString: template,
            // A class to be applied to the root node in our template
            baseClass: 'layersPanel',

            postCreate: function() {
                this.inherited(arguments);

                on(this.chkMultibeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Multibeam', this.chkMultibeam.checked);
                }));
                on(this.chkMultibeamMosaic, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Multibeam Mosaic', this.chkMultibeamMosaic.checked);
                }));
                on(this.chkTrackline, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Trackline Bathymetry', this.chkTrackline.checked);                    
                }));
                on(this.chkTracklineDensity, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Trackline Bathymetry Density', this.chkTracklineDensity.checked);                    
                }));

                this.bagFootprintsVisible = false;
                this.bagHillshadesVisible = false;

                on(this.chkNosHydro, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'NOS Hydrographic Surveys', this.chkNosHydro.checked);
                    this.radioNosHydroAll.set('disabled', !this.chkNosHydro.checked);
                    this.radioNosHydroBags.set('disabled', !this.chkNosHydro.checked);
                }));

                on(this.radioNosHydroAll, 'click', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'NOS Hydrographic Surveys', [0, 1, 2], true);               
                }));
                on(this.radioNosHydroBags, 'click', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'NOS Hydrographic Surveys', [1, 2], false);
                    topic.publish('/ngdc/sublayer/visibility', 'NOS Hydrographic Surveys', [0], true);
                }));
                on(this.chkBagFootprints, 'change', lang.hitch(this, function() {
                    this.bagFootprintsVisible = this.chkBagFootprints.checked;
                    topic.publish('/ngdc/layer/visibility', 'BAG Footprints', this.bagFootprintsVisible);
                }));
                on(this.chkBagHillshades, 'change', lang.hitch(this, function() {
                    this.bagHillshadesVisible = this.chkBagHillshades.checked;
                    topic.publish('/ngdc/layer/visibility', 'BAG Hillshades', this.bagHillshadesVisible);                       
                }));

                on(this.chkDems, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'DEM Extents', this.chkDems.checked);
                    topic.publish('/ngdc/layer/visibility', 'DEM Tiles', this.chkDems.checked);
                })); 
                on(this.chkDemHillshades, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'DEM Hillshades', this.chkDemHillshades.checked);
                }));  

                on(this.chkOcmLidar, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'OCM Lidar', [0, 1, 2, 3], this.chkOcmLidar.checked);                    
                }));

                this.searchDialog = new SearchDialog({title: 'Search Bathymetric Surveys'});
                on(this.searchButton, 'click', lang.hitch(this, function() {
                    this.searchDialog.show();
                }));  

                on(this.resetButton, 'click', lang.hitch(this, function() {
                    topic.publish('/bathymetry/ResetSearch');
                })); 
            },

            setNosHydroDisabled: function(disabled) {
                domAttr.set('chkNosHydroBags', 'disabled', disabled);
                domAttr.set('chkNosHydroDigital', 'disabled', disabled);
                domAttr.set('chkNosHydroNonDigital', 'disabled', disabled);
                domAttr.set('chkBagHillshades', 'disabled', disabled);
                domAttr.set('chkDemHillshades', 'disabled', disabled);
                domAttr.set('chkDems', 'disabled', disabled);
            },

            disableResetButton: function() {
                this.resetButton.set('disabled', true);
            },

            enableResetButton: function() {
                this.resetButton.set('disabled', false);
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
                if (values.platform) {
                    s += 'Platform Name: ' + values.platform + '<br>';
                }
                if (values.institution) {
                    s += 'Source Institution: ' + values.institution + '<br>';
                }
                filterDiv.innerHTML = s;
            }
        });
    }
);