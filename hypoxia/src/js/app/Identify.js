define([
    'dojo/_base/declare', 
    'dojo/string', 
    'esri/geometry/webMercatorUtils',
    'ngdc/identify/AbstractIdentify'],
    function(
        declare, 
        string, 
        webMercatorUtils,
        AbstractIdentify 
        ){

        return declare([AbstractIdentify], {

            hypoxiaStationsFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                // Ship    Cruise Number   Leg Date    Time    Longitude   Latitude    Bottom Depth (m)    Dissolved Oxygen (mg/L)
                // OREGON II   328 3   7/15/2018   23:44:09    -89.475 28.8395 55  4.8347

                /*
                objectid ( type: esriFieldTypeOID , alias: ID )
                ship ( type: esriFieldTypeString , alias: Ship , length: 254 )
                cruiseno ( type: esriFieldTypeDouble , alias: Cruise Number )
                date_ ( type: esriFieldTypeDate , alias: Date , length: 36 )
                time ( type: esriFieldTypeString , alias: Time , length: 50 )
                leg ( type: esriFieldTypeString , alias: Leg , length: 5 )
                station ( type: esriFieldTypeDouble , alias: Station )
                cast_ ( type: esriFieldTypeDouble , alias: Cast )
                seamap ( type: esriFieldTypeString , alias: SEAMAP , length: 32 )
                longitude ( type: esriFieldTypeDouble , alias: Longitude )
                latitude ( type: esriFieldTypeDouble , alias: Latitude )
                waterdepth ( type: esriFieldTypeDouble , alias: Water Depth )
                botdepth_m ( type: esriFieldTypeDouble , alias: Bottom Depth (m) )
                oxmgl ( type: esriFieldTypeDouble , alias: Dissolved Oxygen (mg/l) )
                */

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
                /*
                objectid ( type: esriFieldTypeOID , alias: ID )
                ship ( type: esriFieldTypeString , alias: Ship , length: 16 )
                cruise ( type: esriFieldTypeDouble , alias: Cruise Number )
                begin ( type: esriFieldTypeDate , alias: Begin , length: 36 )
                end_ ( type: esriFieldTypeDate , alias: End , length: 36 )
                min_02 ( type: esriFieldTypeDouble , alias: Min Oxygen Level )
                max_02 ( type: esriFieldTypeDouble , alias: Max Oxygen Level )
                range_02 ( type: esriFieldTypeString , alias: Oxygen Range , length: 16 )
                */

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

        });
    }
);