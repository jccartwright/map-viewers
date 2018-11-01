define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/on',
    'dojo/dom',
    'dojo/dom-attr',
    'dojo/dom-construct',
    'dijit/form/CheckBox',
    'dijit/form/RadioButton',
    'dijit/form/Button',
    'dijit/TitlePane',
    'dijit/Tooltip',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'app/CsbSearchDialog',
    'app/BathySurveySearchDialog',
    'dojo/text!./templates/LayersPanel.html'],
    function(
        declare, 
        lang,
        topic,
        on,
        dom,
        domAttr,
        domConstruct,
        CheckBox,
        RadioButton,
        Button,
        TitlePane,
        Tooltip,
        _WidgetBase, 
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        CsbSearchDialog,
        BathySurveySearchDialog,
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
                on(this.chkGMRT, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'GMRT', this.chkGMRT.checked);
                }));
                on(this.chkTrackline, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Trackline Bathymetry', this.chkTrackline.checked);                    
                }));
                on(this.chkTracklineDensity, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Trackline Bathymetry Density', this.chkTracklineDensity.checked);                    
                }));
                on(this.chkBathyGapAnalysis, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Bathy Gap Analysis', this.chkBathyGapAnalysis.checked);                    
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
                on(this.chkBagHillshades, 'change', lang.hitch(this, function() {
                    this.bagHillshadesVisible = this.chkBagHillshades.checked;
                    topic.publish('/ngdc/layer/visibility', 'BAG Hillshades', this.bagHillshadesVisible);                       
                }));

                on(this.chkNRCanMultibeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'NRCan Multibeam', this.chkNRCanMultibeam.checked);
                }));
                on(this.chkNRCanMultibeamHillshade, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'NRCan Multibeam East', this.chkNRCanMultibeamHillshade.checked);
                    topic.publish('/ngdc/layer/visibility', 'NRCan Multibeam West', this.chkNRCanMultibeamHillshade.checked);
                    topic.publish('/ngdc/layer/visibility', 'NRCan Multibeam North', this.chkNRCanMultibeamHillshade.checked);
                }));

                on(this.chkMareanoMultibeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'MAREANO Multibeam', this.chkMareanoMultibeam.checked);
                }));
                on(this.chkMareanoSinglebeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'MAREANO Single-Beam', this.chkMareanoSinglebeam.checked);
                }));
                on(this.chkMareanoMultibeamShadedRelief, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'MAREANO Multibeam Shaded Relief', this.chkMareanoMultibeamShadedRelief.checked);
                }));
                
                on(this.chkEmodNetMultibeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'EMODnet Multibeam Polygons', this.chkEmodNetMultibeam.checked);
                    topic.publish('/ngdc/layer/visibility', 'EMODnet Multibeam Lines', this.chkEmodNetMultibeam.checked);
                }));

                on(this.chkEmodNetSinglebeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'EMODnet Singlebeam Polygons', this.chkEmodNetSinglebeam.checked);
                    topic.publish('/ngdc/layer/visibility', 'EMODnet Singlebeam Lines', this.chkEmodNetSinglebeam.checked);
                }));
                on(this.chkEmodNetDtm, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'EMODnet DTM', this.chkEmodNetDtm.checked);
                }));

                on(this.chkCanadaBathy, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Canada 500m Bathymetry', this.chkCanadaBathy.checked);
                }));
                
                this.csbSearchDialog = new CsbSearchDialog({title: 'Search Crowdsourced Bathymetry Files'});
                on(this.csbSearchButton, 'click', lang.hitch(this, function() {
                    if (!this.csbSearchDialog) {
                        this.csbSearchDialog = new CsbSearchDialog({title: 'Search Crowdsourced Bathymetry Files'});
                    }
                    this.csbSearchDialog.show();
                }));

                this.bathySurveySearchDialog = new BathySurveySearchDialog({title: 'Search NOAA NCEI/IHO DCDB Bathymetric Surveys'});
                on(this.bathySurveySearchButton, 'click', lang.hitch(this, function() {
                    if (!this.bathySurveySearchDialog) {
                        this.bathySurveySearchDialog = new BathySurveySearchDialog({title: 'Search NOAA NCEI/IHO DCDB Bathymetric Surveys'});
                    }
                    this.bathySurveySearchDialog.show();
                }));

                on(this.csbResetButton, 'click', lang.hitch(this, function() {
                    topic.publish('/csb/ResetSearch');
                })); 
                on(this.bathySurveyResetButton, 'click', lang.hitch(this, function() {
                    topic.publish('/bathymetry/ResetSearch');
                })); 

                domConstruct.place('<img id="nceiHelp" class="tooltipButtonMiddle" src="images/question-white.png">', this.nceiTitlePane.focusNode);
                domConstruct.place('<img id="otherIhoHelp" class="tooltipButtonMiddle" src="images/question-white.png">', this.otherIhoTitlePane.focusNode);   
            },

            disableCsbResetButton: function() {
                this.csbResetButton.set('disabled', true);
            },

            enableCsbResetButton: function() {
                this.csbResetButton.set('disabled', false);
            },

            disableBathySurveyResetButton: function() {
                this.bathySurveyResetButton.set('disabled', true);
            },

            enableBathySurveyResetButton: function() {
                this.bathySurveyResetButton.set('disabled', false);
            },

            setCurrentCsbFilterString: function(values) {
                var filterDiv = dom.byId('currentCsbFilter');
                if (!values) {
                    filterDiv.innerHTML = '';
                    return;
                }

                var s = '<b>Current filter:</b><br>';
                  
                if (values.startDate) {
                    s += 'Start Date of Data Collection: ' + this.toDateString(values.startDate) + '<br>';
                } 
                if (values.endDate) {
                    s += 'End Date of Data Collection: ' + this.toDateString(values.endDate) + '<br>';
                }
                if (values.startDateAdded) {
                    s += 'Start Date Added to Database: ' + this.toDateString(values.startDateAdded) + '<br>';
                } 
                if (values.endDateAdded) {
                    s += 'End Date Added to Database: ' + this.toDateString(values.endDateAdded) + '<br>';
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

            setCurrentBathySurveyFilterString: function(values) {
                var filterDiv = dom.byId('currentBathySurveyFilter');
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