define(["dojo/_base/declare", "dojo/_base/array", "dojo/string", "ngdc/identify/AbstractIdentify", "dojo/topic", "esri/dijit/Popup", "dojo/_base/lang"],
    function(declare, array, string, AbstractIdentify, topic, Popup, lang){

        return declare([AbstractIdentify], {

            //called after parent class constructor
            constructor: function() {
                logger.debug('inside constructor for app/web_mercator/Identify');

                //augment arguments object with list of layers to identify.
                // Don't use pairedMapserviceLayers as they're not yet available
                arguments[0].layerIds = ['Multibeam (dynamic)'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

                this.identifyPane = arguments[0].identifyPane;

                topic.subscribe("identifyPane/showInfo", lang.hitch(this, function(item) {
                    console.log('identifyPane/showInfo received ' + item);

                    //var identifyPane = this._map.identifyPane;
                    if (this.identifyPane) {
                        var layerKey = item.layerKey;
                        this.identifyPane.setInfoPaneContent(this.formatters[layerKey](item));
                    }
                }));

                //formatter specific to each sublayer, keyed by Layer/sublayer name.
                this.formatters = {
                    'Multibeam (dynamic)/Multibeam Bathymetric Surveys': lang.hitch(this, this.multibeamFormatter)                    
                };

                this.sortFunctions = {
                    'Multibeam (dynamic)/Multibeam Bathymetric Surveys': this.multibeamSort
                }

            }, //end constructor

            multibeamFormatter: function(feature) {
                var a = this.replaceNullAttributes(feature.attributes);

                var template = '\
                    <div class="valueName"><span class="parameterValue"><a href="${urlPrefix}${ngdcId}" target="_blank">Link to Data</a></span></div>\
                    <div class="valueName">Survey Name: <span class="parameterValue">${surveyName}</span></div>\
                    <div class="valueName">Ship: <span class="parameterValue">${shipName}</span></div>\
                    <div class="valueName">Chief Scientist: <span class="parameterValue">${chiefScientist}</span></div>\
                    <div class="valueName">Instrument: <span class="parameterValue">${instrument}</span></div>\
                    <div class="valueName">File Count: <span class="parameterValue">${fileCount}</span></div>\
                    <div class="valueName">Track Length: <span class="parameterValue">${trackLength} km</span></div>\
                    <div class="valueName">Total Time: <span class="parameterValue">${totalTime} hours</span></div>\
                    <div class="valueName">Bathymetry Beams: <span class="parameterValue">${bathymetryBeams} million</span></div>\
                    <div class="valueName">Amplitude Beams: <span class="parameterValue">${amplitudeBeams} million</span></div>\
                    <div class="valueName">Sidescan: <span class="parameterValue">${sidescan} million pixels</span></div>';

                var html = string.substitute(template, {
                        urlPrefix: 'http://www.ngdc.noaa.gov/nndc/struts/results?op_0=eq&t=101378&s=8&d=70&d=75&d=76&d=91&d=74&d=73&d=72&d=81&d=82&d=85&d=86&d=79&no_data=suppress&v_0=',
                        ngdcId: a['NGDC ID'],
                        surveyName: a['Survey Name'],
                        surveyYear: a['Survey Year'],
                        shipName: a['Ship Name'],
                        chiefScientist: a['Chief Scientist'],
                        instrument: a['Instrument'],
                        fileCount: a['File Count'],
                        trackLength: a['Track Length (km)'],
                        totalTime: a['Total Time (hrs)'],
                        bathymetryBeams: a['Bathymetry Beams'] / 1000000.0,
                        amplitudeBeams: a['Amplitude Beams'] / 1000000.0,
                        sidescan: a['Sidescan'] / 1000000.0
                    });                
                return html;
            },

            multibeamSort: function(a, b) {
                //Sort on survey year (descending)
                return a.feature.attributes['Survey Year'] < b.feature.attributes['Survey Year'] ? 1 : -1;
            },

            sortResults: function(results) {
                var features;
                if (results['Multibeam (dynamic)']) {    
                    if (features = results['Multibeam (dynamic)']['Multibeam Bathymetric Surveys']) {
                        features.sort(this.multibeamSort);
                    }                    
                }
            }

        });
    }
);