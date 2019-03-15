define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/string', 
    'dojo/topic',
    'esri/geometry/webMercatorUtils',
    'ngdc/identify/AbstractIdentify'],
    function(
        declare, 
        lang,
        string, 
        topic,
        webMercatorUtils,
        AbstractIdentify 
        ){

        return declare([AbstractIdentify], {

            sstTimeFrame: 'Day',

            init: function() {
                this.inherited(arguments);

                topic.subscribe('/sst/timeFrame', lang.hitch(this, function(timeFrame) {
                    this.sstTimeFrame = timeFrame;
                }));
            },

            hypoxiaStationsFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template =                     
                    '<div class="valueName">Ship: <span class="parameterValue">${ship}</span></div>' +
                    '<div class="valueName">Cruise Number: <span class="parameterValue">${cruiseNumber}</span></div>' +
                    '<div class="valueName">Date: <span class="parameterValue">${date}</span></div>' +
                    '<div class="valueName">Time: <span class="parameterValue">${time}</span></div>' +
                    '<div class="valueName">Leg: <span class="parameterValue">${leg}</span></div>' +
                    '<div class="valueName">Station: <span class="parameterValue">${station}</span></div>' +
                    '<div class="valueName">Longitude: <span class="parameterValue">${longitude}</span></div>' +
                    '<div class="valueName">Latitude: <span class="parameterValue">${latitude}</span></div>' +
                    '<div class="valueName">Bottom Depth (m): <span class="parameterValue">${bottomDepth}</span></div>' +
                    '<div class="valueName">Dissolved Oxygen (mg/l): <span class="parameterValue">${dissolvedOxygen}</span></div>';
                var html = string.substitute(template, {
                    ship: a['Ship'],
                    cruiseNumber: a['Cruise Number'],
                    date: a['Date'],
                    time: a['Time'],
                    leg: a['Leg'],
                    station: a['Station'],
                    longitude: a['Longitude'],
                    latitude: a['Latitude'],
                    bottomDepth: a['Bottom Depth (m)'],
                    dissolvedOxygen: a['Dissolved Oxygen (mg/l)']
                });                
                return html;
            },

            hypoxiaContoursFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template =                     
                    '<div class="valueName">Ship: <span class="parameterValue">${ship}</span></div>' +
                    '<div class="valueName">Cruise Number: <span class="parameterValue">${cruiseNumber}</span></div>' +
                    '<div class="valueName">Begin: <span class="parameterValue">${begin}</span></div>' +
                    '<div class="valueName">End: <span class="parameterValue">${end}</span></div>' +
                    '<div class="valueName">Mix Oxygen Level: <span class="parameterValue">${minOxygenLevel}</span></div>' +
                    '<div class="valueName">Max Oxygen Level: <span class="parameterValue">${maxOxygenLevel}</span></div>' +
                    '<div class="valueName">Oxygen Range: <span class="parameterValue">${oxygenRange}</span></div>';
                var html = string.substitute(template, {
                    ship: a['Ship'],
                    cruiseNumber: a['Cruise Number'],
                    begin: a['Begin'],
                    end: a['End'],
                    minOxygenLevel: a['Min Oxygen Level'],
                    maxOxygenLevel: a['Max Oxygen Level'],
                    oxygenRange: a['Oxygen Range']
                });                
                return html;
            },

            sstContoursFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template =                     
                    '<div class="valueName">Month: <span class="parameterValue">${month}</span></div>' +
                    '<div class="valueName">Years: <span class="parameterValue">${years}</span></div>' +
                    '<div class="valueName">Time Frame: <span class="parameterValue">${timeFrame}</span></div>' +
                    '<div class="valueName">Mean Temperature (°C): <span class="parameterValue">${meanTemp}</span></div>';
                var html = string.substitute(template, {
                    month: a['Month'],
                    years: a['Years'],
                    timeFrame: this.sstTimeFrame,
                    meanTemp: a['Mean Temperature']
                });                
                return html;
            },

            hypoxiaStationsSort: function(a, b) {
                return parseInt(a.feature.attributes['Station']) > parseInt(b.feature.attributes['Station']) ? 1 : -1;
            },

            hypoxiaContoursSort: function(a, b) {
                return parseFloat(a.feature.attributes['Min Oxygen Level']) > parseFloat(b.feature.attributes['Min Oxygen Level']) ? 1 : -1;
            },

            sortResults: function(results) {
                var features;
                if (results['Hypoxia']) {    
                    if ((features = results['Hypoxia']['Hypoxia Stations'])) {
                        features.sort(this.hypoxiaStationsSort);
                    }
                    if ((features = results['Hypoxia']['Hypoxia Contours'])) {
                        features.sort(this.hypoxiaContoursSort);
                    }
                }
            }

        });
    }
);