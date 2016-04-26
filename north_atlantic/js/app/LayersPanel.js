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
                on(this.chkTrackline, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Trackline Bathymetry', this.chkTrackline.checked);                    
                }));

                on(this.chkEmodNetMultibeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'EMODNet Multibeam Polygons', this.chkEmodNetMultibeam.checked);
                    topic.publish('/ngdc/layer/visibility', 'EMODNet Multibeam Lines', this.chkEmodNetMultibeam.checked);
                }));

                on(this.chkEmodNetSinglebeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'EMODNet Singlebeam Polygons', this.chkEmodNetSinglebeam.checked);
                    topic.publish('/ngdc/layer/visibility', 'EMODNet Singlebeam Lines', this.chkEmodNetSinglebeam.checked);
                }));

                on(this.chkNRCanMultibeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'NRCan Multibeam', this.chkNRCanMultibeam.checked);
                }));
                // on(this.chkNRCanSinglebeam, 'change', lang.hitch(this, function() {
                //     topic.publish('/ngdc/layer/visibility', 'NRCan Single-Beam', this.chkNRCanSinglebeam.checked);
                // }));

                on(this.chkMareanoMultibeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'MAREANO Multibeam', this.chkMareanoMultibeam.checked);
                }));
                on(this.chkMareanoSinglebeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'MAREANO Single-Beam', this.chkMareanoSinglebeam.checked);
                }));

                on(this.chkPortugal, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Portugal', this.chkPortugal.checked);
                }));

                on(this.chkOsparBoundaries, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'OSPAR Boundaries', [19], this.chkOsparBoundaries.checked);
                }));
                on(this.chkOsparMpas, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Protected Sites', [61], this.chkOsparMpas.checked);
                }));
                on(this.chkNeafcFisheriesClosures, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Protected Sites', [56], this.chkNeafcFisheriesClosures.checked);
                }));
                on(this.chkPlannedOer, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'OER Planned Expeditions', this.chkPlannedOer.checked);
                }));

                // on(this.chkEmodNetDTM, 'change', lang.hitch(this, function() {
                //     topic.publish('/ngdc/layer/visibility', 'EMODNet DTM', this.chkEmodNetDTM.checked);
                // }));

                // on(this.searchButton, 'click', lang.hitch(this, function() {
                //     if (!this.searchDialog) {
                //         this.searchDialog = new SearchDialog({title: 'Bathymetry Survey Search'});
                //     }
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
                filterDiv.innerHTML = s;
            }
        });
    }
);