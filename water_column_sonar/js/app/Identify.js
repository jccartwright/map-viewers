define(["dojo/_base/declare", "dojo/_base/array", "dojo/string", "ngdc/identify/AbstractIdentify", "dojo/topic", "esri/dijit/Popup", "dojo/_base/lang"],
    function(declare, array, string, AbstractIdentify, topic, Popup, lang){

        return declare([AbstractIdentify], {

            wcdFormatter: function(feature) {
                var a = this.replaceNullAttributes(feature.attributes);

                var template = '\
                    <div class="fileName">Attributes for ${fileName}</div>\
                    <div class="fileHeader">Survey Details:</div>\
                    <div class="valueName">Survey ID: <span class="parameterValue">${surveyID}</span></div>\
                    <div class="valueName">Ship: <span class="parameterValue">${shipName}</span></div>\
                    <div class="valueName"> Project(s): <span class="parameterValue">${projectName}</span></div>\
                    <div class="valueName">Source Group: <span class="parameterValue">${sourceGroup}</span></div>\
                    <div class="valueName">Source Name: <span class="parameterValue">${sourceName}</span></div>\
                    <div class="valueName">Scientist(s): <span class="parameterValue">${scientistName}</span></div>\
                    <div class="fileHeader">Instrument Details:</div>\
                    <div class="valueName">Instrument: <span class="parameterValue">${instrumentName}</span></div>\
                    <div class="valueName">Recording Range (m): <span class="parameterValue">${recordingRange}</span></div>';
                if (a['Instrument Name'] == 'EK60') {
                    template += '<div class="valueName">Frequency (kHz): <span class="parameterValue">${frequency}</span></div>';
                }
                else {
                    template += '\
                        <div class="valueName">Swath Width (degrees): <span class="parameterValue">${swathWidth}</span></div>\
                        <div class="valueName">Number of Beams: <span class="parameterValue">${numBeams}</span></div>\
                        <div class="valueName">Beam Type: <span class="parameterValue">${beamType}</span></div>';
                }
                template += '\
                    <div class="valueName">Collection Date: <span class="parameterValue">${collectionDate}</span></div>\
                    <div class="fileHeader">Products</div>';

                var html = string.substitute(template, {
                        fileName: a['File Name'],
                        surveyID: a['Survey ID'],
                        shipName: a['Ship Name'],
                        instrumentName: a['Instrument Name'],
                        scientistName: a['Scientist Name'],
                        sourceName: a['Source Name'],
                        sourceGroup: a['Source Group'],
                        projectName: a['Project Name'],
                        minDepth: a['Minimum Depth'],
                        collectionDate: a['Collection Date'],
                        publishDate: a['Publish Date'],
                        beamType: a['Beam Type'],
                        numBeams: a['Number of Beams'],
                        swathWidth: a['Swath Width (degrees)'],
                        recordingRange: a['Recording Range (m)'],
                        frequency: a['Frequency']
                    });                
                return html;
            },

            //called after parent class constructor
            constructor: function() {
                logger.debug('inside constructor for app/Identify');

                //configure for specific viewer
                arguments[0].layerIds = ['Water Column Sonar'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

                topic.subscribe("identifyPane/showInfo", lang.hitch(this, function(item) {
                    console.log('identifyPane/showInfo received ' + item);

                    var identifyPane = this._map.identifyPane;
                    if (identifyPane) {
                        var layerKey = item.layerKey;
                        identifyPane.setInfoPaneContent(this.formatters[layerKey](item));
                    }
                }));

                //formatter specific to each sublayer, keyed by Layer/sublayer name.
                this.formatters = {
                    'Water Column Sonar/Source Group: NMFS': lang.hitch(this, this.wcdFormatter),
                    'Water Column Sonar/Source Group: OER': lang.hitch(this, this.wcdFormatter), 
                    'Water Column Sonar/Source Group: UNOLS': lang.hitch(this, this.wcdFormatter), 
                    'Water Column Sonar/Source Group: Other': lang.hitch(this, this.wcdFormatter)
                };

                this.sortFunctions = {
                    'Water Column Sonar/Source Group: OER': this.wcdSort
                }

            }, //end constructor

            wcdSort: function(a, b) {
                //Sort alphabetically on File Name
                return a.feature.attributes['File Name'] > b.feature.attributes['File Name'] ? 1 : -1;
            },

            sortResults: function(results) {
                var features;
                if (results['Water Column Sonar']) {    
                    if (features = results['Water Column Sonar']['Source Group: NMFS']) {
                        features.sort(this.wcdSort);
                    }
                    if (features = results['Water Column Sonar']['Source Group: OER']) {
                        features.sort(this.wcdSort);
                    }
                    if (features = results['Water Column Sonar']['Source Group: UNOLS']) {
                        features.sort(this.wcdSort);
                    }
                    if (features = results['Water Column Sonar']['Source Group: Other']) {
                        features.sort(this.wcdSort);
                    }
                }
            }

        });
    }
);