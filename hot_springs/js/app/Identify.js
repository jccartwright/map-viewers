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

            hotSpringsFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <h3>Thermal Spring: ${springName}</h3>\
                    <div class="valueName">State: <span class="parameterValue">${state}</span></div>\
                    <div class="valueName">Temperature (F): <span class="parameterValue">${tempF}</span></div>\
                    <div class="valueName">Temperature (C): <span class="parameterValue">${tempC}</span></div>\
                    <div class="valueName">Temperature Category: <span class="parameterValue">${tempCat}</span></div>\
                    <div class="valueName">Latitude: <span class="parameterValue">${latitude}</span></div>\
                    <div class="valueName">Longitude: <span class="parameterValue">${longitude}</span></div>'; 
                
                var tempCatStr;
                if (a['Temperature Category'] == 'B') {
                    tempCatStr = 'Boiling'
                } else if (a['Temperature Category'] == 'H') {
                    tempCatStr = 'Hot'
                } else if (a['Temperature Category'] == 'W') {
                    tempCatStr = 'Warm'
                } else {
                    tempCatStr = 'Unknown'
                }
                var html = string.substitute(template, {
                        springName: a['Spring Name'],
                        state: a['State'],
                        tempF: a['Temperature (F)'],
                        tempC: a['Temperature (C)'],
                        tempCat: tempCatStr,
                        latitude: a['Latitude'],
                        longitude: a['Longitude']
                    });                
                return html;
            },
            
            hotSpringsSort: function(a, b) {
                //Sort alphabetical by spring name
                return a.feature.attributes['Spring Name'] <= b.feature.attributes['Spring Name'] ? -1 : 1;
            },
            
            sortResults: function(results) {
                var features;
                if (results['Hot Springs']) {    
                    if ((features = results['Hot Springs']['Hot Springs'])) {
                        features.sort(this.hotSpringsSort);
                    }                    
                }                
            }

        });
    }
);