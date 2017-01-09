define([
    'dojo/_base/declare', 
    'dojo/_base/array', 
    'dojo/string', 
    'dojo/topic', 
    'dojo/_base/lang',
    'ngdc/identify/AbstractIdentify'
    ],
    function(
        declare, 
        array, 
        string, 
        topic,
        lang,
        AbstractIdentify 
        ){

        return declare([AbstractIdentify], {

            padFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template =
                    //'<h3>Passive Acoustic Data: ${name}</h3>' +
                    '<div class="valueName">Deployment Name: <span class="parameterValue">${name}</span></div>' +
                    '<div class="valueName">Dates: <span class="parameterValue">${startDate} to ${endDate}</span></div>' +
                    '<div class="valueName">Source Organization: <span class="parameterValue">${sourceOrganization}</span></div>' + 
                    '<div class="valueName">Funding Organization: <span class="parameterValue">${fundingOrganization}</span></div>' + 
                    '<div class="valueName">Instrument Name: <span class="parameterValue">${instrumentName}</span></div>' + 
                    '<div class="valueName">Platform Type: <span class="parameterValue">${platformName}</span></div>' + 
                    '<div class="valueName">Sensor Depth: <span class="parameterValue">${minSensorDepth} to ${maxSensorDepth} m</span></div>' + 
                    '<div class="valueName">Number of Channels: <span class="parameterValue">${numChannels}</span></div>';

                //TODO figure out how we should parse the "Sample Rate" and "Recording Duration" fields. Recording duration is missing from the view?
                
                // var samplingDetailsString = a['Sampling Details'];
                // var samplingDetailsObject = {};
                // if (samplingDetailsString && samplingDetailsString !== '') {
                //     template += '<br>';
                //     samplingDetailsObject = JSON.parse(samplingDetailsString);
                //     for (var key in samplingDetailsObject) {
                //         if (samplingDetailsObject.hasOwnProperty(key)) {
                //             console.log(samplingDetailsObject[key]);
                //             //template += '<div class="valueName"><span class="parameterValue"><a href="' + samplingDetailsObject[key] + '" target="_blank">' + key + '</a></span></div>';
                //         }
                //     }
                // }

                var dataQualityString = a['Data Quality'];
                var dataQualityObject = {};
                if (dataQualityString && dataQualityString !== '') {
                    template += '<div class="valueName">Data Quality:</div>';
                    dataQualityObject = JSON.parse(dataQualityString);
                    for (var key in dataQualityObject) {
                        if (dataQualityObject.hasOwnProperty(key)) {
                            var values = dataQualityObject[key];
                            if (values['quality'] && values['channels'] && values['range'] && values['start'] && values['end']) {
                                template += '<div class="objectValue">' + values['quality'] + ': Channel ' + values['channels'] + ': ' + values['range'] + ' ' + values['start'] + ' to ' + values['end'] + '</div>';
                            }
                        }
                    }
                }

                var html = string.substitute(template, {                        
                        id: a['Data Collections ID'],
                        name: a['Data Collection Name'],
                        startDate: a['Start Date'],
                        endDate: a['End Date'],
                        sourceOrganization: a['Source Organization'],
                        fundingOrganization: a['Funding Organization'],
                        chiefScientist: a['Chief Scientst'],
                        projectName: a['Project Name'],
                        minSampleRate: a['Min Sample Rate'],
                        maxSampleRate: a['Max Sample Rate'],
                        minDuration: a['Min Recording Duration'],
                        maxDuration: a['Max Recording Duration'],
                        minInterval: a['Min Recording Interval'],
                        maxInterval: a['Max Recording Interval'],
                        recordingPercent: a['Recording Percent'],
                        recordingLength: a['Recording Length'],
                        minBottomDepth: a['Min Bottom Depth (m)'],
                        maxBottomDepth: a['Max Bottom Depth (m)'],
                        minSensorDepth: a['Min Sensor Depth (m)'],
                        maxSensorDepth: a['Max Sensor Depth (m)'],
                        numChannels: a['Number of Channels'],
                        instrumentName: a['Instrument Name'],
                        platformName: a['Platform Name']
                    });               
                return html;

                /*
                DATA_COLLECTIONS_ID ( type: esriFieldTypeOID , alias: Data Collections ID )
DATA_COLLECTION_NAME ( type: esriFieldTypeString , alias: Data Collection Name , length: 50 )
START_DATE ( type: esriFieldTypeDate , alias: Start Date , length: 8 )
END_DATE ( type: esriFieldTypeDate , alias: End Date , length: 8 )
PUBLISH ( type: esriFieldTypeString , alias: PUBLISH , length: 1 )
SOURCE_ORGANIZATION ( type: esriFieldTypeString , alias: Source Organization , length: 100 )
FUNDING_ORGANIZATION ( type: esriFieldTypeString , alias: Funding Organization , length: 100 )
CHIEF_SCIENTIST ( type: esriFieldTypeString , alias: Chief Scientst , length: 100 )
PROJECT_NAME ( type: esriFieldTypeString , alias: Project Name , length: 100 )
DATA_QUALITY ( type: esriFieldTypeString , alias: Data Quality , length: 2147483647 )
SAMPLING_DETAILS ( type: esriFieldTypeString , alias: Sampling Details , length: 2147483647 )
MIN_SAMPLE_RATE ( type: esriFieldTypeDouble , alias: Min Sample Rate )
MAX_SAMPLE_RATE ( type: esriFieldTypeDouble , alias: Max Sample Rate )
MIN_DURATION ( type: esriFieldTypeDouble , alias: Min Recording Duration )
MAX_DURATION ( type: esriFieldTypeDouble , alias: Max Recording Duration )
MIN_INTERVAL ( type: esriFieldTypeDouble , alias: Min Recording Interval )
MAX_INTERVAL ( type: esriFieldTypeDouble , alias: Max Recording Interval )
RECORDING_PERCENT ( type: esriFieldTypeDouble , alias: Recording Percent )
RECORDING_LENGTH ( type: esriFieldTypeDouble , alias: Recording Length )
MIN_BOTTOM_DEPTH ( type: esriFieldTypeDouble , alias: Min Bottom Depth (m) )
MAX_BOTTOM_DEPTH ( type: esriFieldTypeDouble , alias: Max Bottom Depth (m) )
MIN_SENSOR_DEPTH ( type: esriFieldTypeDouble , alias: Min Sensor Depth (m) )
MAX_SENSOR_DEPTH ( type: esriFieldTypeDouble , alias: Max Sensor Depth (m) )
NUMBER_CHANNELS ( type: esriFieldTypeDouble , alias: Number of Channels )
SHAPE ( type: esriFieldTypeGeometry , alias: SHAPE )
INSTRUMENT_NAME ( type: esriFieldTypeString , alias: Instrument Name , length: 40 )
PLATFORM_NAME ( type: esriFieldTypeString , alias: Platform Name , length: 50 )*/
            },

            sortResults: function(results) {
                var features;
                if (results['PAD']) {    
                    if ((features = results['PAD']['DATA_COLLECTION'])) {
                        features.sort(this.padSort);
                    }                    
                }                
            },

            padSort: function(a, b) {
                //Sort alphabetically
                return a.feature.attributes['DC_NAME'] <= b.feature.attributes['DC_NAME'] ? -1 : 1;
            },

        });
    }
);