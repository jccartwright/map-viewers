define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/string',
    'ngdc/identify/AbstractIdentify',
    'dojo/topic',
    'esri/dijit/Popup',
    'dojo/_base/lang'
    ],
    function(
        declare,
        array,
        string,
        AbstractIdentify,
        topic,
        Popup,
        lang
        ){

        return declare([AbstractIdentify], {

            wcdFileFormatter: function(feature) {
                /*Attributes for ${fileName}
                Cruise Details:
                Survey: ${surveyID}
                Ship: ${shipName}
                Project(s): ${projectName}
                Source Group: ${sourceGroup}
                Institution: ${sourceName}
                Scientist(s): ${scientistName}
                Scientist(s): ${scientistName}
                Cruise Metadata
                Instrument Details:
                Instrument: ${instrumentName}
                Calibration State: ${calStateName}
                Recording Range (m): ${recordingRange}
                Swath Width (degrees): ${swathWidth}
                Number of Beams: ${numBeams}
                Beam Type: ${beamType}
                Frequency (kHz): ${frequency}
                Calibration State: ${CalStateName}
                Collection Date: ${collectionDate}
                Associated Data:
                Data at NODC: Get data
                Bathymetry at NGDC: Get data
                Products:*/
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <div class="fileName">Attributes for ${fileName}</div>\
                    <div class="fileHeader">Cruise Details:</div>\
                    <div class="valueName">Survey: <span class="parameterValue">${surveyID}</span></div>\
                    <div class="valueName">Ship: <span class="parameterValue">${shipName}</span></div>\
                    <div class="valueName">Project(s): <span class="parameterValue">${projectName}</span></div>\
                    <div class="valueName">Source Group: <span class="parameterValue">${sourceGroup}</span></div>\
                    <div class="valueName">Institution: <span class="parameterValue">${sourceName}</span></div>\
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
                    <div class="valueName">Hit Bottom?: <span class="parameterValue">${hitBottom}</span></div>\
                    <div class="valueName">Calibration State: <span class="parameterValue">${calibrationState}</span></div>\
                    <div class="valueName">Collection Date: <span class="parameterValue">${collectionDate}</span></div>\
                    <div class="fileHeader">Associated Data:</div>\
                    <div class="fileHeader">Products:</div>';
                var html = string.substitute(template, {
                        fileName: a['File Name'],
                        surveyID: a['Cruise ID'],
                        shipName: a['Ship Name'],
                        instrumentName: a['Instrument Name'],
                        scientistName: a['Scientist Name'],
                        sourceName: a['Source Name'],
                        sourceGroup: a['Source Group'],
                        projectName: a['Project Name'],
                        collectionDate: a['Collection Date'],
                        publishDate: a['Publish Date'],
                        beamType: a['Beam Type'],
                        calibrationState: a['Calibration State'],
                        numBeams: a['Number of Beams'],
                        swathWidth: a['Swath Width (degrees)'],
                        recordingRange: a['Recording Range (m)'],
                        frequency: a['Frequency'],
                        hitBottom: a['Hit Bottom?'] == 'Y' ? 'Yes' : 'No'
                    });                
                return html;
            },

            wcdCruiseFormatter: function(feature) {
                /*Attributes for ${surveyID}
Cruise Details:
Cruise ID: ${surveyID}
Ship: ${shipName}
Dates: ${departureDate} to ${arrivalDate}
Departure Port: ${departurePort}
Arrival Port: ${arrivalPort}
Project(s): ${projectName}
Source Group(s): ${sourceGroup}
Institutions(s)): ${sourceName}
Scientist(s): ${scientistName}
Instrument: ${instrumentName}
Calibration State: ${calStateName}
Associated Data:
Data at NODC: Get data
Bathymetry at NGDC: Get data*/
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <div class="fileName">Attributes for ${surveyID}</div>\
                    <div class="fileHeader">Cruise Details:</div>\
                    <div class="valueName">Cruise ID: <span class="parameterValue">${surveyID}</span></div>\
                    <div class="valueName">Ship: <span class="parameterValue">${shipName}</span></div>\
                    <div class="valueName">Dates: <span class="parameterValue">${departureDate} to ${arrivalDate}</span></div>\
                    <div class="valueName">Departure Port: <span class="parameterValue">${departurePort}</span></div>\
                    <div class="valueName">Arrival Port: <span class="parameterValue">${arrivalPort}</span></div>\
                    <div class="valueName">Project(s): <span class="parameterValue">${projectName}</span></div>\
                    <div class="valueName">Source Group: <span class="parameterValue">${sourceGroup}</span></div>\
                    <div class="valueName">Institution(s): <span class="parameterValue">${sourceName}</span></div>\
                    <div class="valueName">Scientist(s): <span class="parameterValue">${scientistName}</span></div>\
                    <div class="valueName">Instrument: <span class="parameterValue">${instrumentName}</span></div>\
                    <div class="valueName">Calibration State: <span class="parameterValue">${calibrationState}</span></div>';                
                var html = string.substitute(template, {
                        surveyID: a['Cruise ID'],
                        shipName: a['Ship Name'],
                        departureDate: a['Start Date'],
                        arrivalDate: a['End Date'],
                        departurePort: a['Departure Port'],
                        arrivalPort: a['Arrival Port'],
                        projectName: a['Project Name'],
                        sourceGroup: a['Source Group'],
                        sourceName: a['Source Name'],
                        scientistName: a['Scientist Name'],
                        instrumentName: a['Instrument Name'],
                        calibrationState: a['Calibration State']
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

                topic.subscribe('identifyPane/showInfo', lang.hitch(this, function(item) {
                    console.log('identifyPane/showInfo received ' + item);

                    var identifyPane = this._map.identifyPane;
                    if (identifyPane) {
                        var layerKey = item.layerKey;
                        identifyPane.setInfoPaneContent(this.formatters[layerKey](item));
                    }
                }));

                //formatter specific to each sublayer, keyed by Layer/sublayer name.
                this.formatters = {
                    'Water Column Sonar/File-Level: NMFS': lang.hitch(this, this.wcdFileFormatter),
                    'Water Column Sonar/File-Level: OER': lang.hitch(this, this.wcdFileFormatter), 
                    'Water Column Sonar/File-Level: UNOLS': lang.hitch(this, this.wcdFileFormatter), 
                    'Water Column Sonar/File-Level: Other NOAA': lang.hitch(this, this.wcdFileFormatter),
                    'Water Column Sonar/File-Level: Other': lang.hitch(this, this.wcdFileFormatter),
                    'Water Column Sonar/File-Level: Non-U.S.': lang.hitch(this, this.wcdFileFormatter),
                    'Water Column Sonar/Cruise-Level: NMFS': lang.hitch(this, this.wcdCruiseFormatter),
                    'Water Column Sonar/Cruise-Level: OER': lang.hitch(this, this.wcdCruiseFormatter), 
                    'Water Column Sonar/Cruise-Level: UNOLS': lang.hitch(this, this.wcdCruiseFormatter), 
                    'Water Column Sonar/Cruise-Level: Other NOAA': lang.hitch(this, this.wcdCruiseFormatter),
                    'Water Column Sonar/Cruise-Level: Other': lang.hitch(this, this.wcdCruiseFormatter),
                    'Water Column Sonar/Cruise-Level: Non-U.S.': lang.hitch(this, this.wcdCruiseFormatter)
                };
            }, //end constructor

            wcdFileSort: function(a, b) {
                //Sort alphabetically on File Name
                return a.feature.attributes['File Name'] > b.feature.attributes['File Name'] ? 1 : -1;
            },

            wcdCruiseSort: function(a, b) {
                //Sort alphabetically on File Name
                return a.feature.attributes['Cruise ID'] > b.feature.attributes['Cruise ID'] ? 1 : -1;
            },

            sortResults: function(results) {
                var features;
                if (results['Water Column Sonar']) {    
                    if ((features = results['Water Column Sonar']['File-Level: NMFS'])) {
                        features.sort(this.wcdFileSort);
                    }
                    if ((features = results['Water Column Sonar']['File-Level: OER'])) {
                        features.sort(this.wcdFileSort);
                    }
                    if ((features = results['Water Column Sonar']['File-Level: UNOLS'])) {
                        features.sort(this.wcdFileSort);
                    }
                    if ((features = results['Water Column Sonar']['File-Level: Other NOAA'])) {
                        features.sort(this.wcdFileSort);
                    }
                    if ((features = results['Water Column Sonar']['File-Level: Other'])) {
                        features.sort(this.wcdFileSort);
                    }
                    if ((features = results['Water Column Sonar']['File-Level: Non-U.S.'])) {
                        features.sort(this.wcdFileSort);
                    }
                    if ((features = results['Water Column Sonar']['Cruise-Level: NMFS'])) {
                        features.sort(this.wcdCruiseSort);
                    }
                    if ((features = results['Water Column Sonar']['Cruise-Level: OER'])) {
                        features.sort(this.wcdCruiseSort);
                    }
                    if ((features = results['Water Column Sonar']['Cruise-Level: UNOLS'])) {
                        features.sort(this.wcdCruiseSort);
                    }
                    if ((features = results['Water Column Sonar']['Cruise-Level: Other NOAA'])) {
                        features.sort(this.wcdCruiseSort);
                    }
                    if ((features = results['Water Column Sonar']['Cruise-Level: Other'])) {
                        features.sort(this.wcdCruiseSort);
                    }
                    if ((features = results['Water Column Sonar']['Cruise-Level: Non-U.S.'])) {
                        features.sort(this.wcdCruiseSort);
                    }
                }
            }

        });
    }
);