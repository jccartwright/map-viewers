define([
    'dojo/_base/declare',
    'dojo/promise/all', 
    'dojo/Deferred',
    'dojo/_base/array',
    'dojo/on',
    'dojo/string',
    'dojo/json',
    'ngdc/identify/AbstractIdentify',
    'dojo/topic',
    'dojo/aspect',
    'esri/dijit/Popup',
    'esri/tasks/IdentifyTask',
    'esri/tasks/IdentifyParameters', 
    'esri/tasks/IdentifyResult', 
    'dojo/_base/lang',
    'ngdc/identify/IdentifyResultCollection'
    ],
    function(
        declare,
        all,
        Deferred,
        array,
        on,
        string,
        JSON,
        AbstractIdentify,
        topic,
        aspect,
        Popup,
        IdentifyTask,
        IdentifyParameters,
        IdentifyResult,
        lang,
        IdentifyResultCollection
        ){

        return declare([AbstractIdentify], {

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

            init: function(params) {
                logger.debug('Inside custom Identify.init');
                this.inherited(arguments);

                var layerCollection = params[0].layerCollection;

                this.fileTaskInfo = this.createFileTaskInfo(this.layerIds, layerCollection);

                topic.subscribe('/water_column_sonar/identifyForFiles', lang.hitch(this, 'identifyForFiles'));
            },

            wcdFileFormatter: function(feature) {
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
                    <div class="valueName">Instrument: <span class="parameterValue">${instrumentName}</span></div>';

                if (a['Instrument Name'] == 'EK60' || a['Instrument Name'] == 'EK500') {
                    template += '<div class="valueName">Frequency (kHz): <span class="parameterValue">${frequency}</span></div>';
                } else {
                    template += '\
                        <div class="valueName">Min Frequency (kHz): <span class="parameterValue">${minFrequency}</span></div>\
                        <div class="valueName">Max Frequency (kHz): <span class="parameterValue">${maxFrequency}</span></div>\
                        <div class="valueName">Beam Type: <span class="parameterValue">${beamType}</span></div>\
                        <div class="valueName">Number of Beams: <span class="parameterValue">${numBeams}</span></div>\
                        <div class="valueName">Swath Width (degrees): <span class="parameterValue">${swathWidth}</span></div>';   
                } 
                template += '\
                    <div class="valueName">Recording Range (m): <span class="parameterValue">${recordingRange}</span></div>\
                    <div class="valueName">Recorded Bottom?: <span class="parameterValue">${recordedBottom}</span></div>\
                    <div class="valueName">Calibration State: <span class="parameterValue">${calibrationState}</span></div>\
                    <div class="valueName">Collection Date: <span class="parameterValue">${collectionDate}</span></div>';
                var html = string.substitute(template, {
                        fileName: a['File Name'],
                        surveyID: a['Cruise ID'],
                        shipName: a['Ship Name'],
                        instrumentName: a['Instrument Name'],
                        projectName: this.replacePipesWithCommas(a['Project Name']),
                        sourceGroup: this.replacePipesWithCommas(a['Source Group']),
                        sourceName: this.replacePipesWithCommas(a['Source Name']),
                        scientistName: this.replacePipesWithCommas(a['Scientist Name']),
                        collectionDate: a['Collection Date'],
                        publishDate: a['Publish Date'],
                        beamType: a['Beam Type'],
                        calibrationState: a['Calibration State'],
                        numBeams: a['Number of Beams'],
                        swathWidth: a['Swath Width (degrees)'],
                        recordingRange: a['Recording Range (m)'],
                        frequency: a['Frequency'],
                        minFrequency: a['Min Frequency (kHz)'],
                        maxFrequency: a['Max Frequency (kHz)'],
                        recordedBottom: a['Recorded Bottom?'] == 'Y' ? 'Yes' : 'No'
                    });                
                return html;
            },

            wcdCruiseFormatter: function(feature) {
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
                    <div class="valueName">Instrument: <span class="parameterValue">${instrumentName}</span></div>';

                if (a['Instrument Name'] == 'EK60' || a['Instrument Name'] == 'EK500') {
                    template += '<div class="valueName">Frequency (kHz): <span class="parameterValue">${frequency}</span></div>';
                } else {
                    template += '\
                        <div class="valueName">Min Frequency (kHz): <span class="parameterValue">${minFrequency}</span></div>\
                        <div class="valueName">Max Frequency (kHz): <span class="parameterValue">${maxFrequency}</span></div>';
                }

                template += '<div class="valueName">Calibration State: <span class="parameterValue">${calibrationState}</span></div>';

                if (a['Citation Link'] != '') {
                    template += '<div class="valueName">Citation: <span class="parameterValue">${citationText}</span></div>';
                    template += '<div class="valueName"><span class="parameterValue"><a href="${citationLink}" target="_blank">${citationLink}</a></span></div>';
                }

                //Parse the variable number of key-value pairs from the ANCILLARY field, and display them as URLs.
                var ancillaryString = a['ANCILLARY'];
                var ancillaryObject = {};
                if (ancillaryString != '') {
                    template += '<br>';
                    ancillaryObject = JSON.parse(ancillaryString);
                    for (var key in ancillaryObject) {
                        console.log(key + ': ' + ancillaryObject[key]);
                        template += '<div class="valueName"><span class="parameterValue"><a href="' + ancillaryObject[key] + '" target="_blank">' + key + '</a></span></div>';
                    }
                }

                var html = string.substitute(template, {
                        surveyID: a['Cruise ID'],
                        shipName: a['Ship Name'],
                        departureDate: a['Start Date'],
                        arrivalDate: a['End Date'],
                        departurePort: a['Departure Port'],
                        arrivalPort: a['Arrival Port'],
                        projectName: this.replacePipesWithCommas(a['Project Name']),
                        sourceGroup: this.replacePipesWithCommas(a['Source Group']),
                        sourceName: this.replacePipesWithCommas(a['Source Name']),
                        scientistName: this.replacePipesWithCommas(a['Scientist Name']),
                        instrumentName: a['Instrument Name'],
                        frequency: a['Frequency'],
                        minFrequency: a['Min Frequency (kHz)'],
                        maxFrequency: a['Max Frequency (kHz)'],
                        calibrationState: a['Calibration State'],
                        citationText: a['Citation Text'],
                        citationLink: a['Citation Link']
                    });                
                return html;
            },

            //Strip leading and trailing pipe characters and replace the others with commas
            replacePipesWithCommas: function(str) {
                if (str.length >= 2) {
                    return str.slice(1, -1).replace(/\|/g, ',');
                } else {
                    return str;
                }
            },

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
            },

            createFileTaskInfo: function(layerIds, layerCollection) {
                logger.debug('inside createFileTaskInfo...');

                var layerId = layerIds[0];
                var layer = layerCollection.getLayerById(layerId);

                logger.debug('creating IdentifyTask for URL '+layer.url);
                taskInfo = {
                    layer: layer,
                    task: new IdentifyTask(layer.url),
                    enabled: layer.visible,
                    params: this.createFileIdentifyParams(layer)
                };
                return (taskInfo);
            },

            createFileIdentifyParams: function(layer) {
                logger.debug('inside createFileIdentifyParams...');

                var identifyParams = new IdentifyParameters();
                identifyParams.tolerance = 3;
                identifyParams.returnGeometry = false;
                identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL; //Identify on all specified sublayers even if not visible
                identifyParams.width  = this._map.width;
                identifyParams.height = this._map.height;
                identifyParams.mapExtent = this._map.extent;

                identifyParams.layerIds = [1, 2, 3, 4, 5, 6]; //Sublayers for file-level geometries
                identifyParams.layerDefinitions = layer.layerDefinitions;
                return(identifyParams);
            },

            identifyForFiles: function(geometry, cruiseId, instrument) {
                logger.debug('inside identifyForFiles...');

                if (!this.enabled) {
                    return;
                }

                //TODO still necessary since IdentifyResultCollection storing it?
                this.searchGeometry = geometry;

                //Use isFulfilled() instead of isResolved() to prevent getting into a state where it's stuck at isResolved()==false if an identify failed.
                if (this.promises && this.promises.isFulfilled() === false) {
                    logger.debug('cancelling an active promise...');
                    //this.cancelPromise();                    
                    this.promises.cancel('cancelled due to new request', true);
                }

                this.deferreds = {};

                this.fileTaskInfo.params.geometry = geometry;
                
                var previousLayerDefs = this.fileTaskInfo.params.layerDefinitions; //Keep the existing layer definitions
                //Add the cruise id to the layer definitions before identifying
                this.fileTaskInfo.params.layerDefinitions = this.addCruiseAndInstrumentToFileLayerDefs(cruiseId, instrument);

                if (this.fileTaskInfo.enabled) {
                    topic.publish('/ngdc/showLoading');

                    this.deferreds[this.fileTaskInfo.layer.id] = taskInfo.task.execute(this.fileTaskInfo.params);
                } else {
                    logger.debug('task not enabled: '+ this.fileTaskInfo.layer.url);
                }

                this.promises = new all(this.deferreds, true);

                this.promises.then(lang.hitch(this, function(results) {
                    topic.publish('/ngdc/hideLoading');
                    //produces an map of arrays where each key/value pair represents a mapservice. The keys are the Layer
                    // names, the values are an array of IdentifyResult instances.

                    //TODO necessary? reference the resultCollection instead?
                    //keep a reference to the last result
                    this.fileResults = results;

                    //create a list of service URLs for each layer to be used in IdentifyResultCollection
                    var serviceUrls = {};
                    serviceUrls[this.fileTaskInfo.layer.id] = taskInfo.layer.url;

                    var resultCollection = new IdentifyResultCollection(serviceUrls);
                    resultCollection.setResultSet(results);
                    resultCollection.setSearchGeometry(geometry);

                    //Sort the results (customized per viewer)
                    this.sortResults(resultCollection.results);

                    //publish message w/ results
                    topic.publish('/identify/file/results', resultCollection);
                }));

                //Reset the task info to the previous layer definitions, without the cruiseId appended.
                this.fileTaskInfo.params.layerDefinitions = previousLayerDefs;
            },

            addCruiseAndInstrumentToFileLayerDefs: function(cruiseId, instrument) {
                var newLayerDefs = [];
                array.forEach(this.fileTaskInfo.params.layerIds, lang.hitch(this, function(layerId) {
                    var layerDef = this.fileTaskInfo.params.layerDefinitions[layerId];
                    if (layerDef) {
                        newLayerDefs[layerId] = layerDef + " AND CRUISE_NAME = '" + cruiseId + "' AND INSTRUMENT_NAME = '" + instrument + "'";
                    } else {
                        newLayerDefs[layerId] = "CRUISE_NAME = '" + cruiseId + "' AND INSTRUMENT_NAME = '" + instrument + "'";
                    }
                }));
                return newLayerDefs;
            },

            updateLayerDefinitions: function(layer, layerDefinitions) {
                this.inherited(arguments);

                if (this.fileTaskInfo.layer.id == layer.id) {
                    this.fileTaskInfo.params.layerDefinitions = layerDefinitions;
                }
            },

            updateMapExtent: function() {
                this.inherited(arguments);

                this.fileTaskInfo.params.width  = this._map.width;
                this.fileTaskInfo.params.height = this._map.height;
                this.fileTaskInfo.params.mapExtent = this._map.extent;                
            }

        });
    }
);