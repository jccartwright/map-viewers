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

                on(this.chkMultibeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Multibeam', this.chkMultibeam.checked);
                }));
                
                on(this.chkNosHydroBags, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'NOS Hydrographic Surveys', [0], this.chkNosHydroBags.checked);

                    //If the BAG Hillshades are visible, toggle the extra "Surveys with BAGs" overlay on top of the hillshades.
                    if (this.chkBagHillshades.checked) {
                        topic.publish('/ngdc/layer/visibility', 'NOS Hydro (BAGs)', this.chkNosHydroBags.checked);
                    }
                    else {
                        topic.publish('/ngdc/layer/visibility', 'NOS Hydro (BAGs)', false);
                    }
                }));
                on(this.chkNosHydroDigital, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'NOS Hydrographic Surveys', [1], this.chkNosHydroDigital.checked);
                }));
                on(this.chkNosHydroNonDigital, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'NOS Hydro (non-digital)', this.chkNosHydroNonDigital.checked);
                }));
                on(this.chkBagHillshades, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'BAG Hillshades', this.chkBagHillshades.checked);   

                    //If the "Surveys with BAGs" are visible, toggle the extra overlay on top of the hillshades.
                    if (this.chkBagHillshades.checked && this.chkNosHydroBags.checked) {
                        topic.publish('/ngdc/layer/visibility', 'NOS Hydro (BAGs)', true);
                    }
                    else {
                        topic.publish('/ngdc/layer/visibility', 'NOS Hydro (BAGs)', false);
                    }                                     
                }));

                on(this.chkSinglebeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [1], this.chkSinglebeam.checked);                    
                }));
                on(this.chkGravity, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [2], this.chkGravity.checked);                    
                }));
                on(this.chkMagnetics, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [3], this.chkMagnetics.checked);                    
                }));
                on(this.chkMcs, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [4], this.chkMcs.checked);                    
                }));
                on(this.chkSeismicRefraction, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [5], this.chkSeismicRefraction.checked);                    
                }));
                on(this.chkShotPointNavigation, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [6], this.chkShotPointNavigation.checked);                    
                }));
                on(this.chkSideScan, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [7], this.chkSideScan.checked);                    
                }));
                on(this.chkScs, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [8], this.chkScs.checked);                    
                }));
                on(this.chkSubbottom, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [9], this.chkSubbottom.checked);                    
                }));
                on(this.chkAeromag, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [10], this.chkAeromag.checked);                    
                }));

                // on(this.chkEmodNet, 'change', lang.hitch(this, function() {
                //     topic.publish('/ngdc/layer/visibility', 'EMODNet', this.chkEmodNet.checked);
                // }));

                on(this.chkDems, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'DEM Extents', this.chkDems.checked);
                    topic.publish('/ngdc/layer/visibility', 'DEM Tiles', this.chkDems.checked);
                })); 
                on(this.chkDemHillshades, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'DEM Hillshades', this.chkDemHillshades.checked);
                }));  

                // on(this.chkOcmLidar, 'change', lang.hitch(this, function() {
                //     topic.publish('/ngdc/sublayer/visibility', 'OCM Lidar', [4], this.chkOcmLidar.checked);                    
                // }));

                on(this.chkSampleIndex, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Sample Index', this.chkSampleIndex.checked);                    
                }));
                on(this.chkMarineGeology, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Marine Geology', this.chkMarineGeology.checked);                    
                }));

                on(this.chkDeclination, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Magnetic Declination', this.chkDeclination.checked);                    
                }));

                on(this.chkUnderseaFeatures, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Undersea Features', this.chkUnderseaFeatures.checked);                    
                }));

                // this.searchDialog = new SearchDialog({title: 'Search Bathymetric Surveys'});
                // on(this.searchButton, 'click', lang.hitch(this, function() {
                //     this.searchDialog.show();
                // }));  

                // on(this.resetButton, 'click', lang.hitch(this, function() {
                //     topic.publish('/bathymetry/ResetSearch');
                // })); 
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