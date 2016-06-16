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
                    '<div class="valueName">Name: <span class="parameterValue">${name}</span></div>' +
                    '<div class="valueName">Start Date: <span class="parameterValue">${startDate}</span></div>' +
                    '<div class="valueName">End Date: <span class="parameterValue">${endDate}</span></div>' + 
                    '<div class="valueName">Source Organization: <span class="parameterValue">${sourceOrganization}</span></div>' + 
                    '<div class="valueName">Instrument Name: <span class="parameterValue">${instrumentName}</span></div>' + 
                    '<div class="valueName">Platform Type: <span class="parameterValue">${platformType}</span></div>' + 
                    '<div class="valueName">Min Sample Rate: <span class="parameterValue">${minSampleRate}</span></div>' + 
                    '<div class="valueName">Max Sample Rate: <span class="parameterValue">${maxSampleRate}</span></div>' + 
                    '<div class="valueName">Sensor Depth: <span class="parameterValue">${sensorDepth}</span></div>';

                var html = string.substitute(template, {                        
                        name: a['DC_NAME'],
                        startDate: a['DC_START_DATE'],
                        endDate: a['DC_END_DATE'],
                        sourceOrganization: a['SOURCE_ORGANIZATION'],
                        instrumentName: a['INSTRUMENT_NAME'],
                        platformType: a['PLATFORM_TYPE_NAME'],
                        minSampleRate: a['MIN_SAMPLE_RATE'],
                        maxSampleRate: a['MAX_SAMPLE_RATE'],
                        sensorDepth: a['SENSOR_DEPTH']
                    });               
                return html;
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