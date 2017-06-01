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

            tracklineFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <h3>Trackline Geophysical Survey: ${surveyId}</h3>\
                    <div class="valueName">Survey ID: <span class="parameterValue">${surveyId}</span></div>\
                    <div class="valueName">Survey Type: <span class="parameterValue">${surveyType}</span></div>\
                    <div class="valueName">Platform Name: <span class="parameterValue">${platformName}</span></div>\
                    <div class="valueName">Survey Start Year: <span class="parameterValue">${startYear}</span></div>\
                    <div class="valueName">Survey End Year: <span class="parameterValue">${endYear}</span></div>\
                    <div class="valueName">Source Institution: <span class="parameterValue">${sourceInstitution}</span></div>\
                    <div class="valueName">Project: <span class="parameterValue">${project}</span></div>\
                    <div class="valueName">Country: <span class="parameterValue">${country}</span></div>\
                    <div class="valueName">Chief Scientist: <span class="parameterValue">${chiefScientist}</span></div>\
                    <div class="valueName">Date Added: <span class="parameterValue">${dateAdded}</span></div>';

                var html = string.substitute(template, {
                        url: a['Download URL'],
                        surveyId: a['Survey ID'],
                        surveyType: a['Survey Type'],
                        platformName: a['Platform Name'],
                        startYear: a['Survey Start Year'],
                        endYear: a['Survey End Year'],
                        sourceInstitution: a['Source Institution'],
                        project: a['Project'],
                        country: a['Country'],
                        chiefScientist: a['Chief Scientist'],
                        dateAdded: a['Date Added']
                    });                
                return html;
            },

            aeromagFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <h3>Aeromagnetic Survey: ${surveyId}</h3>\
                    <div class="valueName"><span class="parameterValue"><a href="${surveyUrl}" target="_blank">Survey URL</a></span></div>\
                    <div class="valueName"><span class="parameterValue"><a href="${projectUrl}" target="_blank">Project URL</a></span></div>\
                    <div class="valueName">Source Institution: <span class="parameterValue">${sourceInstitution}</span></div>\
                    <div class="valueName">Project ID: <span class="parameterValue">${projectId}</span></div>\
                    <div class="valueName">Full Project Name: <span class="parameterValue">${fullProjectName}</span></div>\
                    <div class="valueName">Departure Date: <span class="parameterValue">${departureDate}</span></div>\
                    <div class="valueName">Departure Airport: <span class="parameterValue">${departureAirport}</span></div>\
                    <div class="valueName">Arrival Date: <span class="parameterValue">${arrivalDate}</span></div>\
                    <div class="valueName">Arrival Airport: <span class="parameterValue">${arrivalAirport}</span></div>\
                    <div class="valueName">Total Field (F): <span class="parameterValue">${totalField}</span></div>\
                    <div class="valueName">Residual Field (R): <span class="parameterValue">${residualField}</span></div>\
                    <div class="valueName">North Vector Component (X): <span class="parameterValue">${northVectorComponent}</span></div>\
                    <div class="valueName">East Vector Component (Y): <span class="parameterValue">${eastVectorComponent}</span></div>\
                    <div class="valueName">Vertical Component (Z): <span class="parameterValue">${verticalComponent}</span></div>\
                    <div class="valueName">Magnetic Declination (D): <span class="parameterValue">${magneticDeclination}</span></div>\
                    <div class="valueName">Horizontal Intensity (H): <span class="parameterValue">${horizontalIntensity}</span></div>\
                    <div class="valueName">Magnetic Inclination (I): <span class="parameterValue">${magneticInclination}</span></div>\
                    <div class="valueName">Electromagnetics (E): <span class="parameterValue">${electromagnetics}</span></div>\
                    <div class="valueName">Other (e.g. Radiometrics): <span class="parameterValue">${other}</span></div>';

                var html = string.substitute(template, {                        
                        surveyId: a['Survey ID'],
                        surveyUrl: a['Survey URL'],
                        projectUrl: a['Project URL'],
                        sourceInstitution: a['Source Institution'],
                        projectId: a['Project ID'],
                        fullProjectName: a['Full Project Name'],
                        departureDate: a['Departure Date'],
                        departureAirport: a['Departure Airport'],
                        arrivalDate: a['Arrival Date'],
                        arrivalAirport: a['Arrival Airport'],
                        totalField: a['Total Field (T)'],
                        residualField: a['Residual Field (R)'],
                        northVectorComponent: a['North Vector Component (X)'],
                        eastVectorComponent: a['East Vector Component (Y)'],
                        verticalComponent: a['Vertical Component (Z)'],
                        magneticDeclination: a['Magnetic Declination (D)'],
                        horizontalIntensity: a['Horizontal Intensity (H)'],
                        magneticInclination: a['Magnetic Inclination (I)'],
                        electromagnetics: a['Electromagnetics (E)'],
                        other: a['Other (e.g. Radiometrics)']
                    });                
                return html;
            },

            tracklineSort: function(a, b) {
                //Sort by start year descending, then alphabetical by survey ID
                if (a.feature.attributes['Survey Start Year'] == b.feature.attributes['Survey Start Year']) {
                    return a.feature.attributes['Survey ID'] <= b.feature.attributes['Survey ID'] ? -1 : 1;
                }
                return a.feature.attributes['Survey Start Year'] < b.feature.attributes['Survey Start Year'] ? 1 : -1;
            },

            aeromagSort: function(a, b) {
                //Sort by start year descending, then alphabetical by survey ID
                if (a.feature.attributes['Start Year'] == b.feature.attributes['Start Year']) {
                    return a.feature.attributes['Survey ID'] <= b.feature.attributes['Survey ID'] ? -1 : 1;
                }
                return a.feature.attributes['Start Year'] < b.feature.attributes['Start Year'] ? 1 : -1;
            },

            sortResults: function(results) {
                var features;

                for (layerId in results) {
                    for (sublayerId in results[layerId]) {
                        features = results[layerId][sublayerId];
                        if (sublayerId === 'Aeromagnetic Surveys') {
                            features.sort(this.aeromagSort);
                        }
                        else {
                            features.sort(this.tracklineSort);
                        }
                    }
                }
            }

        });
    }
);