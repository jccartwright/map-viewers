define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/on',
    'dojo/aspect',
    'dojo/dom',
    'dojo/dom-attr',
    'dijit/form/CheckBox',
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

                on(this.chkCsb, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'CSB', this.chkCsb.checked);
                }));

                on(this.chkMultibeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Multibeam', this.chkMultibeam.checked);
                }));
                on(this.chkTrackline, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Trackline Bathymetry', this.chkTrackline.checked);                    
                }));

                on(this.chkNosHydro, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'NOS Hydrographic Surveys', this.chkNosHydro.checked);
                }));                
                on(this.chkBagHillshades, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'BAG Hillshades', this.chkBagHillshades.checked);   

                    //If the "Surveys with BAGs" are visible, toggle the extra overlay on top of the hillshades.
                    if (this.chkBagHillshades.checked && this.chkNosHydro.checked) {
                        topic.publish('/ngdc/layer/visibility', 'NOS Hydro (BAGs)', true);
                    }
                    else {
                        topic.publish('/ngdc/layer/visibility', 'NOS Hydro (BAGs)', false);
                    }                                     
                }));

                on(this.chkEmodNetMultibeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'EMODNet Multibeam Polygons', this.chkEmodNetMultibeam.checked);
                    topic.publish('/ngdc/layer/visibility', 'EMODNet Multibeam Lines', this.chkEmodNetMultibeam.checked);
                }));

                on(this.chkEmodNetSinglebeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'EMODNet Singlebeam Polygons', this.chkEmodNetSinglebeam.checked);
                    topic.publish('/ngdc/layer/visibility', 'EMODNet Singlebeam Lines', this.chkEmodNetSinglebeam.checked);
                }));

                on(this.chkDems, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'DEM Extents', this.chkDems.checked);
                })); 
                on(this.chkDemHillshades, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'DEM Hillshades', this.chkDemHillshades.checked);
                }));  

                on(this.searchButton, 'click', lang.hitch(this, function() {
                    if (!this.searchDialog) {
                        this.searchDialog = new SearchDialog({title: 'Crowdsourced Bathymetry Search'});
                    }
                    this.searchDialog.show();
                }));  

                on(this.resetButton, 'click', lang.hitch(this, function() {
                    topic.publish('/bathymetry/ResetSearch');
                })); 
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
                filterDiv.innerHTML = s;
            }
        });
    }
);