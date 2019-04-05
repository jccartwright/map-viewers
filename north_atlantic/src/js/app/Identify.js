define([
    'dojo/_base/declare', 
    'dojo/_base/array', 
    'dojo/string', 
    'dojo/topic', 
    'dojo/_base/lang',
    'dojo/on',
    'esri/graphic',
    'ncei/tasks/WMSIdentifyParameters',
    'ncei/tasks/WMSIdentifyTask',
    'ncei/tasks/WMSIdentifyResult',
    'ngdc/identify/AbstractIdentify'
    ],
    function(
        declare, 
        array, 
        string, 
        topic,
        lang,
        on,
        Graphic,
        WMSIdentifyParameters,
        WMSIdentifyTask,
        WMSIdentifyResult,
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
                    <div class="valueName">Source Organization: <span class="parameterValue">${source}</span></div>\
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
                        source: a['Source'],
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

            nrCanFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <h3>NRCan Multibeam Dataset: ${title}</h3>\
                    <div class="valueName">Region: <span class="parameterValue">${region}</span></div>\
                    <div class="valueName">Subregion: <span class="parameterValue">${subregion}</span></div>\
                    <div class="valueName">Title: <span class="parameterValue">${title}</span></div>\
                    <div class="valueName">Dataset Name: <span class="parameterValue">${datasetName}</span></div>';

                var html = string.substitute(template, {
                        id: a['ID'],
                        region: a['REGION_EN'],
                        subregion: a['SUBREGION_EN'],
                        title: a['TITLE_EN'],
                        datasetName: a['DATASET_NAME']
                    });                
                return html;
            },

            portugalFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <h3>Proprietary Bathymetric Survey (Portugal)</h3>\
                    <div class="valueName">Start Date: <span class="parameterValue">${startDate}</span></div>\
                    <div class="valueName">End Date: <span class="parameterValue">${endDate}</span></div>\
                    <div class="valueName">Area: <span class="parameterValue">${area}</span></div>\
                    <div class="valueName">Platform: <span class="parameterValue">${platform}</span></div>';

                var html = string.substitute(template, {
                        startDate: a['P_START'],
                        endDate: a['P_END'],
                        area: a['AREA'],
                        platform: a['PLATFORM']
                    });                
                return html;
            },

            emodnetMultibeamFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <h3>EMODNet Multibeam Bathymetric Survey</h3>\
                    <div class="valueName">CDI Partner: <span class="parameterValue">${cdiPartner}</span></div>\
                    <div class="valueName">CDI Record ID: <span class="parameterValue">${cdiRecordId}</span></div>\
                    <div class="valueName">Dataset Name: <span class="parameterValue">${datasetName}</span></div>\
                    <div class="valueName"><span class="parameterValue"><a href="${details}" target="_blank">More Details from EMODNet</a></span></div>';

                var html = string.substitute(template, {
                        cdiPartner: a['CDI-partner'],
                        cdiRecordId: a['CDI-record id'],
                        datasetName: a['Data set name'],
                        details: a['Details']
                    });                
                return html;
            },

            emodnetSinglebeamFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <h3>EMODNet Single-Beam Bathymetric Survey</h3>\
                    <div class="valueName">CDI Partner: <span class="parameterValue">${cdiPartner}</span></div>\
                    <div class="valueName">CDI Record ID: <span class="parameterValue">${cdiRecordId}</span></div>\
                    <div class="valueName">Dataset Name: <span class="parameterValue">${datasetName}</span></div>\
                    <div class="valueName"><span class="parameterValue"><a href="${details}" target="_blank">More Details from EMODNet</a></span></div>';

                var html = string.substitute(template, {
                        cdiPartner: a['CDI-partner'],
                        cdiRecordId: a['CDI-record id'],
                        datasetName: a['Data set name'],
                        details: a['Details']
                    });                
                return html;
            },

            protectedSitesFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <h3>Protected Site:</h3>\
                    <div class="valueName">Site Name: <span class="parameterValue">${siteName}</span></div>\
                    <div class="valueName">Site Protection Classification: <span class="parameterValue">${siteProtectionClassificationDefinition}</span></div>\
                    <div class="valueName">Details: <span class="parameterValue"><a href="${dataSourceUrl}" target="_blank">${dataSource}</a></span></div>';

                var html = string.substitute(template, {
                        siteName: a['siteName'],
                        siteProtectionClassificationDefinition: a['siteProtectionClassificationDefinition'],
                        dataSource: a['dataSource'],
                        dataSourceUrl: a['dataSourceURL']
                    });                
                return html;
            },

            oerPlannedFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <h3>OER Planned Expedition:</h3>\
                    <div class="valueName">Cruise ID: <span class="parameterValue">${cruiseId}</span></div>\
                    <div class="valueName">Data Type: <span class="parameterValue">${datatype}</span></div>\
                    <div class="valueName">Collection Year: <span class="parameterValue">${collectionYear}</span></div>\
                    <div class="valueName">Project Status: <span class="parameterValue">${projectStatus}</span></div>\
                    <div class="valueName">Point of Contact: <span class="parameterValue">${pointofContact}</span></div>\
                    <div class="valueName">Collection Date: <span class="parameterValue">${collectionDate}</span></div>\
                    <div class="valueName">Owner: <span class="parameterValue">${owner}</span></div>';

                var html = string.substitute(template, {
                        cruiseId: a['Cruise ID'],
                        datatype: a['Data Type'],
                        collectionYear: a['Collection Year'],
                        projectStatus: a['Project Status'],
                        pointofContact: a['Point of Contact'],
                        collectionDate: a['Collection Date'],
                        owner: a['Owner']
                    });                
                return html;
            },

            //For the planned tracks, the field names are slightly different from the above layer (they don't have field aliases). Need to change this if they update their service.
            oerPlannedTracksFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <h3>OER Planned Expedition:</h3>\
                    <div class="valueName">Cruise ID: <span class="parameterValue">${cruiseId}</span></div>\
                    <div class="valueName">Data Type: <span class="parameterValue">${datatype}</span></div>\
                    <div class="valueName">Collection Year: <span class="parameterValue">${collectionYear}</span></div>\
                    <div class="valueName">Project Status: <span class="parameterValue">${projectStatus}</span></div>\
                    <div class="valueName">Point of Contact: <span class="parameterValue">${pointofContact}</span></div>\
                    <div class="valueName">Collection Date: <span class="parameterValue">${collectionDate}</span></div>\
                    <div class="valueName">Owner: <span class="parameterValue">${owner}</span></div>';

                var html = string.substitute(template, {
                        cruiseId: a['cruise_id'],
                        datatype: a['datatype'],
                        collectionYear: a['collyear'],
                        projectStatus: a['projstatus'],
                        pointofContact: a['poc'],
                        collectionDate: a['colldate'],
                        owner: a['owner']
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
                    if ((features = results['DEM Extents']['NCEI Digital Elevation Models'])) {
                        features.sort(this.demSort);
                    }                    
                }
            }

        });
    }
);