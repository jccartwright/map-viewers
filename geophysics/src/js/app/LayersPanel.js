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
    'esri/tasks/QueryTask',
    'esri/tasks/query',
    'app/MarineSearchDialog',
    'app/AeroSearchDialog',
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
        QueryTask,
        Query,
        MarineSearchDialog,
        AeroSearchDialog,
        template){
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            // Our template - important!
            templateString: template,
            // A class to be applied to the root node in our template
            baseClass: 'layersPanel',

            postCreate: function() {
                this.inherited(arguments);

                this.marineSearchDialog = new MarineSearchDialog({title: 'Search Marine Surveys'});
                this.aeroSearchDialog = new AeroSearchDialog({title: 'Search Airborne Surveys'});

                this.visibleTracklineLayers = {
                    'All Parameters': true,
                    'Bathymetry': false,
                    'Gravity': false,
                    'Magnetics': false,
                    'Multi-Channel Seismics': false,
                    'Seismic Refraction': false,
                    'Shot-Point Navigation': false,
                    'Side Scan Sonar': false,
                    'Single-Channel Seismics': false,
                    'Subbottom Profile': false
                };

                on(this.chkAllParameters, 'change', lang.hitch(this, function() {
                    topic.publish('/geophysics/layer/visibility', 'All Parameters', this.chkAllParameters.checked);
                    this.visibleTracklineLayers['All Parameters'] = this.chkAllParameters.checked;
                }));
                on(this.chkBathymetry, 'change', lang.hitch(this, function() {
                    topic.publish('/geophysics/layer/visibility', 'Bathymetry', this.chkBathymetry.checked);
                    this.visibleTracklineLayers['Bathymetry'] = this.chkBathymetry.checked;
                }));
                on(this.chkGravity, 'change', lang.hitch(this, function() {
                    topic.publish('/geophysics/layer/visibility', 'Gravity', this.chkGravity.checked);
                    this.visibleTracklineLayers['Gravity'] = this.chkGravity.checked;
                }));
                on(this.chkMagnetics, 'change', lang.hitch(this, function() {
                    topic.publish('/geophysics/layer/visibility', 'Magnetics', this.chkMagnetics.checked);
                    this.visibleTracklineLayers['Magnetics'] = this.chkMagnetics.checked;
                }));
                on(this.chkMultiChannelSeismics, 'change', lang.hitch(this, function() {
                    topic.publish('/geophysics/layer/visibility', 'Multi-Channel Seismics', this.chkMultiChannelSeismics.checked);
                    this.visibleTracklineLayers['Multi-Channel Seismics'] = this.chkMultiChannelSeismics.checked;
                }));
                on(this.chkSeismicRefraction, 'change', lang.hitch(this, function() {
                    topic.publish('/geophysics/layer/visibility', 'Seismic Refraction', this.chkSeismicRefraction.checked);
                    this.visibleTracklineLayers['Seismic Refraction'] = this.chkSeismicRefraction.checked;
                }));
                on(this.chkShotPointNavigation, 'change', lang.hitch(this, function() {
                    topic.publish('/geophysics/layer/visibility', 'Shot-Point Navigation', this.chkShotPointNavigation.checked);
                    this.visibleTracklineLayers['Shot-Point Navigation'] = this.chkShotPointNavigation.checked;
                }));
                on(this.chkSideScanSonar, 'change', lang.hitch(this, function() {
                    topic.publish('/geophysics/layer/visibility', 'Side Scan Sonar', this.chkSideScanSonar.checked);
                    this.visibleTracklineLayers['Side Scan Sonar'] = this.chkSideScanSonar.checked;
                }));
                on(this.chkSingleChannelSeismics, 'change', lang.hitch(this, function() {
                    topic.publish('/geophysics/layer/visibility', 'Single-Channel Seismics', this.chkSingleChannelSeismics.checked);
                    this.visibleTracklineLayers['Single-Channel Seismics'] = this.chkSingleChannelSeismics.checked;
                }));
                on(this.chkSubbottomProfile, 'change', lang.hitch(this, function() {
                    topic.publish('/geophysics/layer/visibility', 'Subbottom Profile', this.chkSubbottomProfile.checked);
                    this.visibleTracklineLayers['Subbottom Profile'] = this.chkSubbottomProfile.checked;
                }));
                on(this.chkAeromag, 'change', lang.hitch(this, function() {
                    topic.publish('/geophysics/layer/visibility', 'Aeromagnetics', this.chkAeromag.checked);
                }));

                on(this.filterMarineButton, 'click', lang.hitch(this, function() {
                    this.marineSearchDialog.show();
                })); 
                on(this.filterAeroButton, 'click', lang.hitch(this, function() {
                    this.aeroSearchDialog.show();
                }));

                on(this.resetButton, 'click', lang.hitch(this, function() {
                    topic.publish('/geophysics/ResetSearch');
                    this.disableGetMarineDataButton();
                })); 

                on(this.getMarineDataButton, 'click', lang.hitch(this, function() {
                    topic.publish('/geophysics/GetMarineDataMultipleSurveys')
                }));

                //Subscribe to messages from the IdentifyPane to enable/disable the "Get Marine Data" button
                topic.subscribe('/geophysics/ShowIdentifyPane', lang.hitch(this, function() {
                    this.disableGetMarineDataButton();
                }));
                topic.subscribe('/geophysics/HideIdentifyPane', lang.hitch(this, function() {
                    this.enableGetMarineDataButton();
                }));
            },

            disableResetButton: function() {
                this.resetButton.set('disabled', true);
            },

            enableResetButton: function() {
                this.resetButton.set('disabled', false);
            },

            disableGetMarineDataButton: function() {
                this.getMarineDataButton.set('disabled', true);
            },

            enableGetMarineDataButton: function() {
                if (!this.marineSearchDialog.isDefault()) {
                    this.getMarineDataButton.set('disabled', false);
                }
            },

            setCurrentMarineFilterString: function(values) {
                //Update the display w/ filter criteria.
                //Truncate long lists of surveys, ships, or institutions to 5, appending '...'
                var txt = '';
                var firstFive = [];
                if (values.surveyIds) {
                    var numSurveys = values.surveyIds.length;   
                    
                    firstFive = values.surveyIds;
                    if (numSurveys > 5) {
                        firstFive = values.surveyIds.slice(0, 5);
                    }
                    txt += 'Survey: ' + firstFive.join(', ');   
                    if (numSurveys > 5) {
                        txt += ', ...';
                    }
                    txt += '<br>';
                }
                else {      
                    if (values.institutions && values.institutions.length > 0) {
                        var numInst = values.institutions.length;   
                        firstFive = values.institutions;
                        if (numInst > 5) {              
                            firstFive = values.institutions.slice(0, 5);
                        }
                        txt += 'Institution: ' + firstFive.join(', ');  
                        if (numInst > 5) {
                            txt += ', ...';
                        }
                        txt += '<br>';
                    }       
                    if (values.ships && values.ships.length > 0) {
                        var numShips = values.ships.length; 
                        firstFive = values.ships;
                        if (numShips > 5) {
                            firstFive = values.ships.slice(0, 5);
                        }
                        txt += 'Ship: ' + firstFive.join(', '); 
                        if (numShips > 5) {
                            txt += ', ...';
                        }                       
                    } else {
                        txt += 'All Ships';
                    }
                    if (values.startYear && !values.endYear) {
                        txt += ' ' + values.startYear + '-present';
                    } else if (values.startYear && values.endYear) {
                        txt += ' ' + values.startYear + '-' + values.endYear + '';
                    } else if (!values.startYear && values.endYear) {
                        txt += ' ' + values.endYear + ' and earlier';
                    }   
                            
                    if (values.startDateAdded && !values.endDateAdded) {
                        txt += '<br>Date Added: ' + this.toDateString(values.startDateAdded) + '-present';
                    } else if (values.startDateAdded && values.endDateAdded) {
                        txt += '<br>Date Added: ' + this.toDateString(values.startDateAdded) + '-' + this.toDateString(values.endDateAdded) + '';
                    } else if (!values.startDateAdded && values.endDateAdded) {
                        txt += '<br>Date Added: ' + this.toDateString(values.endDateAdded) + ' and earlier';
                    }                   
                }
                this.marineFilterDiv.domNode.innerHTML = '<b>Current search criteria:</b><br/> ' + txt;
            },

            setCurrentAeroFilterString: function(values) {
                //Update the display w/ filter criteria.
                //Truncate long lists of surveys, ships, or institutions to 5, appending '...'
                var txt = '';
                var firstFive = [];
                if (values.surveyIds) {
                    var numSurveys = values.surveyIds.length;   
                    
                    firstFive = values.surveyIds;
                    if (numSurveys > 5) {
                        firstFive = values.surveyIds.slice(0, 5);
                    }
                    txt += 'Survey: ' + firstFive.join(', ');   
                    if (numSurveys > 5) {
                        txt += ', ...';
                    }
                    txt += '<br>';
                }
                else {      
                    if (values.projects && values.projects.length > 0) {
                        var numProjects = values.projects.length;   
                        firstFive = values.projects;
                        if (numProjects > 5) {              
                            firstFive = values.projects.slice(0, 5);
                        }
                        txt += 'Project: ' + firstFive.join(', ');  
                        if (numProjects > 5) {
                            txt += ', ...';
                        }
                        txt += '<br>';
                    } 
                    
                    if (values.startYear && !values.endYear) {
                        txt += ' ' + values.startYear + '-present';
                    } else if (values.startYear && values.endYear) {
                        txt += ' ' + values.startYear + '-' + values.endYear + '';
                    } else if (!values.startYear && values.endYear) {
                        txt += ' ' + values.endYear + ' and earlier';
                    }   
                    if (values.aeroParams && values.aeroParams.length > 0) {
                        txt += 'Aeromag Params: ' + values.aeroParams.join(',');
                    }
                            
                    if (values.startDateAdded && !values.endDateAdded) {
                        txt += '<br>Date Added: ' + this.toDateString(values.startDateAdded) + '-present';
                    } else if (values.startDateAdded && values.endDateAdded) {
                        txt += '<br>Date Added: ' + this.toDateString(values.startDateAdded) + '-' + this.toDateString(values.endDateAdded) + '';
                    } else if (!values.startDateAdded && values.endDateAdded) {
                        txt += '<br>Date Added: ' + this.toDateString(values.endDateAdded) + ' and earlier';
                    }                   
                }
                this.aeroFilterDiv.domNode.innerHTML = '<b>Current search criteria:</b><br/> ' + txt;
            },

            /**
             * Update the counts displayed in the TOC of how many surveys fit the filter criteria
             */
            updateSurveyCounts: function(layerDefinitions) {
                var tracklineMapServiceUrl = '//maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/trackline_combined_dynamic/MapServer';
                var marineQuery = new Query();
                var aeroQuery = new Query;

                if (layerDefinitions && layerDefinitions.length > 0) {
                    if (layerDefinitions[0]) {
                        marineQuery.where = layerDefinitions[0];
                        
                    } else {
                        marineQuery.where = '1 = 1';
                    }
                    if (layerDefinitions[10]) {
                        aeroQuery.where = layerDefinitions[10];
                        
                    } else {
                        aeroQuery.where = '1 = 1';
                    }
                } else {
                    marineQuery.where = '1 = 1';
                    aeroQuery.where = '1 = 1';
                }
                
                var queryTask0 = new QueryTask(tracklineMapServiceUrl + "/0");
                var queryTask1 = new QueryTask(tracklineMapServiceUrl + "/1");
                var queryTask2 = new QueryTask(tracklineMapServiceUrl + "/2");
                var queryTask3 = new QueryTask(tracklineMapServiceUrl + "/3");
                var queryTask4 = new QueryTask(tracklineMapServiceUrl + "/4");
                var queryTask5 = new QueryTask(tracklineMapServiceUrl + "/5");
                var queryTask6 = new QueryTask(tracklineMapServiceUrl + "/6");
                var queryTask7 = new QueryTask(tracklineMapServiceUrl + "/7");
                var queryTask8 = new QueryTask(tracklineMapServiceUrl + "/8");
                var queryTask9 = new QueryTask(tracklineMapServiceUrl + "/9");
                var queryTask10 = new QueryTask(tracklineMapServiceUrl + "/10");
                
                queryTask0.executeForCount(marineQuery, lang.hitch(this, function(count){
                    dom.byId('countLayer0').innerHTML = this.formatSurveyCountString(count);
                }), function(error){ logger.error(error);});
                
                queryTask1.executeForCount(marineQuery, lang.hitch(this, function(count){
                    dom.byId('countLayer1').innerHTML = this.formatSurveyCountString(count);
                }), function(error){ logger.error(error);});  
                
                queryTask2.executeForCount(marineQuery, lang.hitch(this, function(count){
                    dom.byId('countLayer2').innerHTML = this.formatSurveyCountString(count);
                }), function(error){ logger.error(error);});  
                
                queryTask3.executeForCount(marineQuery, lang.hitch(this, function(count){
                    dom.byId('countLayer3').innerHTML = this.formatSurveyCountString(count);
                }), function(error){ logger.error(error);});  
                
                queryTask4.executeForCount(marineQuery, lang.hitch(this, function(count){
                    dom.byId('countLayer4').innerHTML = this.formatSurveyCountString(count);
                }), function(error){ logger.error(error);});  
                
                queryTask5.executeForCount(marineQuery, lang.hitch(this, function(count){
                    dom.byId('countLayer5').innerHTML = this.formatSurveyCountString(count);
                }), function(error){ logger.error(error);});  
                
                queryTask6.executeForCount(marineQuery, lang.hitch(this, function(count){
                    dom.byId('countLayer6').innerHTML = this.formatSurveyCountString(count);
                }), function(error){ logger.error(error);});  
                
                queryTask7.executeForCount(marineQuery, lang.hitch(this, function(count){
                    dom.byId('countLayer7').innerHTML = this.formatSurveyCountString(count);
                }), function(error){ logger.error(error);});
                    
                queryTask8.executeForCount(marineQuery, lang.hitch(this, function(count){
                    dom.byId('countLayer8').innerHTML = this.formatSurveyCountString(count);
                }), function(error){ logger.error(error);});
                    
                queryTask9.executeForCount(marineQuery, lang.hitch(this, function(count){
                    dom.byId('countLayer9').innerHTML = this.formatSurveyCountString(count);
                }), function(error){ logger.error(error);});  
                
                queryTask10.executeForCount(aeroQuery, lang.hitch(this, function(count){
                    dom.byId('countLayer10').innerHTML = this.formatSurveyCountString(count);
                }), function(error){ logger.error(error);});
            },

            formatSurveyCountString: function(count) {
                if (count === 1) {
                    return '<i>(1 survey)</i>';
                } else {
                    return '<i>(' + count + ' surveys)</i>';
                }
            },

            clearCurrentMarineFilterString: function() {
                this.marineFilterDiv.domNode.innerHTML = '';
            },

            clearCurrentAeroFilterString: function() {
                this.aeroFilterDiv.domNode.innerHTML = '';
            },

            //Format a date in the form mm/dd/yyyy
            toDateString: function(date) {
                return date.getMonth()+1 + '/' + date.getDate() + '/' + date.getFullYear();
            }
        });
    }
);