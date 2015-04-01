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

            multibeamFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <h3>Multibeam Bathymetry Survey: ${surveyId}</h3>\
                    <div class="valueName"><span class="parameterValue"><a href="${url}" target="_blank">Link to Data</a></span></div>\
                    <div class="valueName">Survey ID: <span class="parameterValue">${surveyId}</span></div>\
                    <div class="valueName">Platform Name: <span class="parameterValue">${platformName}</span></div>\
                    <div class="valueName">Survey Year: <span class="parameterValue">${surveyYear}</span></div>\
                    <div class="valueName">Chief Scientist: <span class="parameterValue">${chiefScientist}</span></div>\
                    <div class="valueName">Instrument: <span class="parameterValue">${instrument}</span></div>\
                    <div class="valueName">File Count: <span class="parameterValue">${fileCount}</span></div>\
                    <div class="valueName">Track Length: <span class="parameterValue">${trackLength} km</span></div>\
                    <div class="valueName">Total Time: <span class="parameterValue">${totalTime} hours</span></div>\
                    <div class="valueName">Bathymetry Beams: <span class="parameterValue">${bathymetryBeams} million</span></div>\
                    <div class="valueName">Amplitude Beams: <span class="parameterValue">${amplitudeBeams} million</span></div>\
                    <div class="valueName">Sidescan: <span class="parameterValue">${sidescan} million pixels</span></div>';

                var html = string.substitute(template, {
                        url: a['Download URL'],
                        ngdcId: a['NGDC ID'],
                        surveyId: a['Survey ID'],
                        surveyYear: a['Survey Year'],
                        platformName: a['Platform Name'],
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

            tracklineFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <h3>Single-Beam Bathymetry Survey: ${surveyId}</h3>\
                    <div class="valueName"><span class="parameterValue"><a href="${url}" target="_blank">Link to Data</a></span></div>\
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

            nosHydroFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <h3>NOS Hydrographic Survey: ${surveyId}</h3>\
                    <div class="valueName"><span class="parameterValue"><a href="${url}" target="_blank">Link to Data</a></span></div>\
                    <div class="valueName">Survey ID: <span class="parameterValue">${surveyId}</span></div>\
                    <div class="valueName">Survey Year: <span class="parameterValue">${surveyYear}</span></div>\
                    <div class="valueName">Locality: <span class="parameterValue">${locality}</span></div>\
                    <div class="valueName">Sublocality: <span class="parameterValue">${sublocality}</span></div>\
                    <div class="valueName">Platform Name: <span class="parameterValue">${platformName}</span></div>';

                var html = string.substitute(template, {
                        url: a['Download URL'],
                        surveyId: a['Survey ID'],
                        surveyYear: a['Survey Year'],
                        locality: a['Locality'],
                        sublocality: a['Sublocality'],
                        platformName: a['Platform Name']
                    });                
                return html;
            },

            demFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <h3>Digital Elevation Model: ${name}</h3>\
                    <div class="valueName"><span class="parameterValue"><a href="${url}" target="_blank">Link to Data</a></span></div>\
                    <div class="valueName">Name: <span class="parameterValue">${name}</span></div>\
                    <div class="valueName">Cell Size: <span class="parameterValue">${cellSize}</span></div>\
                    <div class="valueName">Category: <span class="parameterValue">${category}</span></div>\
                    <div class="valueName">Source: <span class="parameterValue">${source}</span></div>\
                    <div class="valueName">Project: <span class="parameterValue">${project}</span></div>\
                    <div class="valueName">Vertical Datum: <span class="parameterValue">${verticalDatum}</span></div>\
                    <div class="valueName">Status: <span class="parameterValue">${status}</span></div>\
                    <div class="valueName">Type: <span class="parameterValue">${type}</span></div>\
                    <div class="valueName">Coverage: <span class="parameterValue">${coverage}</span></div>\
                    <div class="valueName">Completion Date: <span class="parameterValue">${completionDate}</span></div>';

                var html = string.substitute(template, {
                        url: a['DEMURL'],
                        name: a['Name'],
                        cellSize: a['Cell Size'],
                        category: a['Category'],
                        source: a['Source'],
                        project: a['Project'],
                        verticalDatum: a['Vertical Datum'],
                        status: a['STATUS'],
                        type: a['Type'],
                        coverage: a['Coverage'],
                        completionDate: a['Completion Date']
                    });                
                return html;
            },

            lidarFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <h3>Bathymetric Lidar: ${name}</h3>\
                    <div class="valueName">Name: <span class="parameterValue">${name}</span></div>\
                    <div class="valueName">Project: <span class="parameterValue">${project}</span></div>\
                    <div class="valueName">Year: <span class="parameterValue">${year}</span></div>\
                    <div class="valueName"><span class="parameterValue"><a href="${prefix}${id}" target="_blank">Link to Data</a></span></div>\
                    <div class="valueName"><span class="parameterValue"><a href="${metalink}" target="_blank">Metadata Link</a></span></div>';

                var html = string.substitute(template, {
                        id: a['ID'],
                        name: a['Name'],
                        project: a['Project'],
                        year: a['Year'],
                        metalink: a['Metalink'],
                        prefix: 'http://www.coast.noaa.gov/dataviewer/index.html?action=advsearch&qType=in&qFld=ID&qVal='
                    });                
                return html;
            },

            multibeamSort: function(a, b) {
                //Sort by year descending, then alphabetical by survey ID
                if (a.feature.attributes['Survey Year'] == b.feature.attributes['Survey Year']) {
                    return a.feature.attributes['Survey ID'] <= b.feature.attributes['Survey ID'] ? -1 : 1;
                }
                return a.feature.attributes['Survey Year'] < b.feature.attributes['Survey Year'] ? 1 : -1;
            },

            tracklineSort: function(a, b) {
                //Sort by year descending, then alphabetical by survey ID
                if (a.feature.attributes['Survey Start Year'] == b.feature.attributes['Survey Start Year']) {
                    return a.feature.attributes['Survey ID'] <= b.feature.attributes['Survey ID'] ? -1 : 1;
                }
                return a.feature.attributes['Survey Start Year'] < b.feature.attributes['Survey Start Year'] ? 1 : -1;
            },

            nosHydroSort: function(a, b) {
                //Sort by layer ID: BAGs, Digital, Non-Digital, then by year descending (nulls last) then alphabetical for hydro surveys.
                if (a.layerId == b.layerId) {                   
                    if (a.feature.attributes['Survey Year'] == 'Null') {                                           
                        return 1;
                    }
                    if (b.feature.attributes['Survey Year'] == 'Null') { 
                        return -1;
                    }
                    if (a.feature.attributes['Survey Year'] == b.feature.attributes['Survey Year']) {
                        return a.feature.attributes['Survey ID'] <= b.feature.attributes['Survey ID'] ? -1 : 1;
                    }
                    return a.feature.attributes['Survey Year'] < b.feature.attributes['Survey Year'] ? 1 : -1;
                }
                return a.layerId <= b.layerId ? -1 : 1;
            },

            demSort: function(a, b) {
                //Sort alphabetically, but Global relief (e.g. ETOPO1) should be at the end of the list
                if (a.feature.attributes['Category'] == 'Global Relief')
                    return 1;
                if (b.feature.attributes['Category'] == 'Global Relief')
                    return -1;
                return a.feature.attributes['Name'] <= b.feature.attributes['Name'] ? -1 : 1;
            },

            sortResults: function(results) {
                var features;
                if (results['Multibeam']) {    
                    if ((features = results['Multibeam']['Multibeam Bathymetric Surveys'])) {
                        features.sort(this.multibeamSort);
                    }                    
                }
                if (results['Trackline Bathymetry']) {    
                    if ((features = results['Trackline Bathymetry']['Marine Trackline Surveys: Bathymetry'])) {
                        features.sort(this.tracklineSort);
                    }                    
                }

                if (results['NOS Hydrographic Surveys']) {  
                    for (var sublayer in results['NOS Hydrographic Surveys']) {
                       results['NOS Hydrographic Surveys'][sublayer].sort(this.nosHydroSort);
                    }                                
                }
                
                if (results['DEM Extents']) {    
                    if ((features = results['DEM Extents']['All NGDC Bathymetric DEMs'])) {
                        features.sort(this.demSort);
                    }                    
                }
            }

        });
    }
);