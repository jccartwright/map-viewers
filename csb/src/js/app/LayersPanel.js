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
                on(this.chkMultibeamMosaic, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Multibeam Mosaic', this.chkMultibeamMosaic.checked);
                }));
                on(this.chkTrackline, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Trackline Bathymetry', this.chkTrackline.checked);                    
                }));
                on(this.chkTracklineDensity, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Trackline Bathymetry Density', this.chkTracklineDensity.checked);                    
                }));

                on(this.chkNosHydro, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'NOS Hydrographic Surveys', this.chkNosHydro.checked);
                }));                
                on(this.chkBagHillshades, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'BAG Hillshades', this.chkBagHillshades.checked);                                      
                }));

                on(this.chkEmodNetMultibeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'EMODnet Multibeam Polygons', this.chkEmodNetMultibeam.checked);
                    topic.publish('/ngdc/layer/visibility', 'EMODnet Multibeam Lines', this.chkEmodNetMultibeam.checked);
                }));

                on(this.chkEmodNetSinglebeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'EMODnet Singlebeam Polygons', this.chkEmodNetSinglebeam.checked);
                    topic.publish('/ngdc/layer/visibility', 'EMODnet Singlebeam Lines', this.chkEmodNetSinglebeam.checked);
                }));

                on(this.chkDems, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'DEM Extents', this.chkDems.checked);
                    topic.publish('/ngdc/layer/visibility', 'DEM Tiles', this.chkDems.checked);
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
                    topic.publish('/csb/ResetSearch');
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
                  
                if (values.startDate) {
                    s += '<br>Start Date: ' + this.toDateString(values.startDate);
                } 
                if (values.endDate) {
                    s += '<br>End Date: ' + this.toDateString(values.endDate);
                } 
                if (values.provider) {
                    s += 'Provider: ' + values.provider + '<br>';
                }                                   
                if (values.platformName) {
                    s += 'Platform Name: ' + values.platformName + '<br>';
                }
                if (values.platformId) {
                    s += 'Platform ID: ' + values.platformId + '<br>';
                }
                if (values.instrument) {
                    s += 'Instrument: ' + values.instrument + '<br>';
                }
                
                filterDiv.innerHTML = s;
            },

            //Format a date as yyyy-mm-dd
            toDateString: function(dateStr) {
                var date = new Date(dateStr);
                return date.getFullYear() + '-' + this.padDigits(date.getMonth()+1,2) + '-' + this.padDigits(date.getDate(),2);
            },

            padDigits: function(n, totalDigits){
                n = n.toString();
                var pd = '';
                if (totalDigits > n.length) {
                    for (var i = 0; i < (totalDigits - n.length); i++) {
                        pd += '0';
                    }
                }
                return pd + n.toString();
            }


        });
    }
);