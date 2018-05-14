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

                var template = 
                    '<h3>Multibeam Bathymetric Survey: ${surveyId}</h3>' +
                    '<div class="valueName"><span class="parameterValue"><a href="${url}" target="_blank">Link to Data</a></span></div>' +
                    '<div class="valueName">Survey ID: <span class="parameterValue">${surveyId}</span></div>' +
                    '<div class="valueName">Platform Name: <span class="parameterValue">${platformName}</span></div>' +
                    '<div class="valueName">Survey Year: <span class="parameterValue">${surveyYear}</span></div>' +
                    '<div class="valueName">Source Organization: <span class="parameterValue">${source}</span></div>' +
                    '<div class="valueName">Chief Scientist: <span class="parameterValue">${chiefScientist}</span></div>' +
                    '<div class="valueName">Instrument: <span class="parameterValue">${instrument}</span></div>' +
                    '<div class="valueName">File Count: <span class="parameterValue">${fileCount}</span></div>' +
                    '<div class="valueName">Track Length: <span class="parameterValue">${trackLength} km</span></div>' +
                    '<div class="valueName">Total Time: <span class="parameterValue">${totalTime} hours</span></div>' +
                    '<div class="valueName">Bathymetry Beams: <span class="parameterValue">${bathymetryBeams} million</span></div>' +
                    '<div class="valueName">Amplitude Beams: <span class="parameterValue">${amplitudeBeams} million</span></div>' +
                    '<div class="valueName">Sidescan: <span class="parameterValue">${sidescan} million pixels</span></div>';

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

                var template = 
                    '<h3>Single-Beam Bathymetric Survey: ${surveyId}</h3>' +
                    '<div class="valueName"><span class="parameterValue"><a href="${url}" target="_blank">Link to Data</a></span></div>' +
                    '<div class="valueName">Survey ID: <span class="parameterValue">${surveyId}</span></div>' +
                    '<div class="valueName">Survey Type: <span class="parameterValue">${surveyType}</span></div>' +
                    '<div class="valueName">Platform Name: <span class="parameterValue">${platformName}</span></div>' +
                    '<div class="valueName">Survey Start Year: <span class="parameterValue">${startYear}</span></div>' +
                    '<div class="valueName">Survey End Year: <span class="parameterValue">${endYear}</span></div>' +
                    '<div class="valueName">Source Institution: <span class="parameterValue">${sourceInstitution}</span></div>' +
                    '<div class="valueName">Project: <span class="parameterValue">${project}</span></div>' +
                    '<div class="valueName">Country: <span class="parameterValue">${country}</span></div>' +
                    '<div class="valueName">Chief Scientist: <span class="parameterValue">${chiefScientist}</span></div>' +
                    '<div class="valueName">Date Added: <span class="parameterValue">${dateAdded}</span></div>';

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

                var template =
                    '<h3>Aeromagnetic Survey: ${surveyId}</h3>' +
                    '<div class="valueName"><span class="parameterValue"><a href="${surveyUrl}" target="_blank">Survey URL</a></span></div>' +
                    '<div class="valueName"><span class="parameterValue"><a href="${projectUrl}" target="_blank">Project URL</a></span></div>' +
                    '<div class="valueName">Source Institution: <span class="parameterValue">${sourceInstitution}</span></div>' +
                    '<div class="valueName">Project ID: <span class="parameterValue">${projectId}</span></div>' +
                    '<div class="valueName">Full Project Name: <span class="parameterValue">${fullProjectName}</span></div>' +
                    '<div class="valueName">Departure Date: <span class="parameterValue">${departureDate}</span></div>' +
                    '<div class="valueName">Departure Airport: <span class="parameterValue">${departureAirport}</span></div>' +
                    '<div class="valueName">Arrival Date: <span class="parameterValue">${arrivalDate}</span></div>' +
                    '<div class="valueName">Arrival Airport: <span class="parameterValue">${arrivalAirport}</span></div>' +
                    '<div class="valueName">Total Field (F): <span class="parameterValue">${totalField}</span></div>' +
                    '<div class="valueName">Residual Field (R): <span class="parameterValue">${residualField}</span></div>' +
                    '<div class="valueName">North Vector Component (X): <span class="parameterValue">${northVectorComponent}</span></div>' +
                    '<div class="valueName">East Vector Component (Y): <span class="parameterValue">${eastVectorComponent}</span></div>' +
                    '<div class="valueName">Vertical Component (Z): <span class="parameterValue">${verticalComponent}</span></div>' +
                    '<div class="valueName">Magnetic Declination (D): <span class="parameterValue">${magneticDeclination}</span></div>' +
                    '<div class="valueName">Horizontal Intensity (H): <span class="parameterValue">${horizontalIntensity}</span></div>' +
                    '<div class="valueName">Magnetic Inclination (I): <span class="parameterValue">${magneticInclination}</span></div>' +
                    '<div class="valueName">Electromagnetics (E): <span class="parameterValue">${electromagnetics}</span></div>' +
                    '<div class="valueName">Other (e.g. Radiometrics): <span class="parameterValue">${other}</span></div>';

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

            nosHydroFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template =
                    '<h3>NOS Hydrographic Survey: ${surveyId}</h3>' +
                    '<div class="valueName"><span class="parameterValue"><a href="${url}" target="_blank">Link to Data</a></span></div>' +
                    '<div class="valueName">Survey ID: <span class="parameterValue">${surveyId}</span></div>' +
                    '<div class="valueName">Survey Year: <span class="parameterValue">${surveyYear}</span></div>' +
                    '<div class="valueName">Locality: <span class="parameterValue">${locality}</span></div>' +
                    '<div class="valueName">Sublocality: <span class="parameterValue">${sublocality}</span></div>' +
                    '<div class="valueName">Platform Name: <span class="parameterValue">${platformName}</span></div>';

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

                var template =
                    '<h3>Digital Elevation Model: ${name}</h3>' +
                    '<div class="valueName"><span class="parameterValue"><a href="${metadataUrl}" target="_blank">Link to Metadata</a></span></div>';

                if (a['DEM URL'] !== '') {
                    template += '<div class="valueName"><span class="parameterValue"><a href="${downloadUrl}" target="_blank">DEM Download</a></span></div>';
                }
                template +=
                    '<div class="valueName">Name: <span class="parameterValue">${name}</span></div>' +
                    '<div class="valueName">Cell Size: <span class="parameterValue">${cellSize}</span></div>' +                    
                    '<div class="valueName">Vertical Datum: <span class="parameterValue">${verticalDatum}</span></div>' +                    
                    '<div class="valueName">Horizontal Datum: <span class="parameterValue">${horizontalDatum}</span></div>' + 
                    '<div class="valueName">Completion Date: <span class="parameterValue">${completionDate}</span></div>';

                var html = string.substitute(template, {
                    metadataUrl: a['Metadata URL'],
                    downloadUrl: a['DEM URL'],
                    name: a['Name'],
                    cellSize: a['Cell Size'],
                    verticalDatum: a['Vertical Datum'],
                    horizontalDatum: a['Horizontal Datum'],
                    completionDate: this.formatDate(a['Completion Date'])
                });               
                return html;
            },

            demTileFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template =
                    '<h3>DEM Tile: ${name}</h3>' +
                    '<div class="valueName">Name: <span class="parameterValue">${name}</span></div>' +
                    '<div class="valueName">Cell Size: <span class="parameterValue">${cellSize}</span></div>' +
                    '<div class="valueName">Dataset: <span class="parameterValue">${dataset}</span></div>' +
                    '<div class="valueName">File Size: <span class="parameterValue">${fileSize}</span></div>' +
                    '<div class="valueName">Vertical Datum: <span class="parameterValue">${verticalDatum}</span></div>';
                    
                var html = string.substitute(template, {
                        itemId: a['ITEM_ID'],
                        name: a['NAME'],
                        dataset: a['DATASET'],
                        fileSize: a['FILE_SIZE'],
                        cellSize: a['CELL_SIZE'],
                        verticalDatum: a['VERTICAL_DATUM']
                    });                
                return html;
            },

            marineGeologyFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template =
                    '<table>' +
                    '<tr><td class="valueName">Dataset Title:</td><td class="parameterValue"><a href="${url}" target="_blank">${datasetTitle}</a></td></tr>' +
                    '<tr><td class="valueName">MGGID:</td><td class="parameterValue">${mggId}</td></tr>' +
                    '<tr><td class="valueName">Institution:</td><td class="parameterValue">${institution}</td></tr>' +
                    '<tr><td class="valueName">Cruise:</td><td class="parameterValue">${cruise}</td></tr>' +
                    '<tr><td class="valueName">Platform:</td><td class="parameterValue">${platform}</td></tr>' +
                    '<tr><td class="valueName">Hole/Sample ID:</td><td class="parameterValue">${holeSampleId}</td></tr>' +
                    '<tr><td class="valueName">Device:</td><td class="parameterValue">${device}</td></tr>' +
                    '<tr><td class="valueName">Collection Date:</td><td class="parameterValue">${collectionDate}</td></tr>' +
                    '<tr><td class="valueName">Latitude:</td><td class="parameterValue">${latitude}</td></tr>' +
                    '<tr><td class="valueName">Longitude:</td><td class="parameterValue">${longitude}</td></tr>';
                    if (a['Metadata URL'] !== '') {
                        template += '<tr><td colspan="2" class="parameterValue"><b><a href="${metadataUrl}" target="_blank">Metadata Link</a></b></td></tr>';
                    }
                    template += '</table>';

                var html = string.substitute(template, {
                    datasetTitle: a['Dataset Title'],
                    mggId: a['MGGID'],
                    institution: a['Institution'],
                    cruise: a['Cruise'],
                    platform: a['Platform'],
                    holeSampleId: a['Hole/Sample ID'],
                    device: a['Device'],
                    collectionDate: a['Collection Date'],
                    latitude: a['Latitude'],
                    longitude: a['Longitude'],
                    metadata: a['Metadata gov.noaa.ngdc.mgg:'],
                    url: a['URL'],
                    metadataUrl: a['Metadata URL']
                });                
                return html;
            },

            sampleIndexFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template =
                    '<table>' +
                    '<tr><td class="valueName">Repository:</td><td class="parameterValue"><a href="${repositoryLink}" target="_blank" title="contact info/links to the sample repository"><b>${repository} [Contact the Curator]</b></a></td></tr>' +
                    '<tr><td class="valueName">Platform Name:</td><td class="parameterValue">${platform}</td></tr>' +
                    '<tr><td class="valueName">Lake:</td><td class="parameterValue">${lake}</td></tr>' +
                    '<tr><td class="valueName">Survey ' + (a['Alternate Cruise or Leg'] ? '(Alternate) ' : '') + 'ID:</td><td class="parameterValue"><a href="${cruiseOrLegLink}" target="_blank">${cruiseOrLeg}</a>' + (a['Alternate Cruise or Leg'] ? ' (<a href="${alternateCruiseOrLegLink}" target="_blank">${alternateCruiseOrLeg})' : '') + '</td></tr>' +
                    '<tr><td class="valueName">Sample:</td><td class="parameterValue"><a href="${dataLink}" target="_blank" title="go to more information, data, images, and links to related resources">${sampleId} [Data and images]</a></td></tr>' +
                    '<tr><td class="valueName">Device:</td><td class="parameterValue">${device}</td></tr>' +
                    '<tr><td class="valueName">Latitude:</td><td class="parameterValue">${latitude}' + (a['End Latitude'] ? ' to ${endLatitude}' : '') + '</td></tr>' +
                    '<tr><td class="valueName">Longitude:</td><td class="parameterValue">${longitude}' + (a['End Longitude'] ? ' to ${endLongitude}' : '') + '</td></tr>' +
                    '<tr><td class="valueName">Water Depth (m):</td><td class="parameterValue">${waterDepth}</td></tr>' +
                    '<tr><td class="valueName">Date:</td><td class="parameterValue">${dateCollected}</td></tr>' +
                    '<tr><td class="valueName">PI:</td><td class="parameterValue">${pi}</td></tr>' +
                    '<tr><td class="valueName">Core Len/Diam (cm):</td><td class="parameterValue">${coreLength}/${coreDiameter}</td></tr>' +
                    '<tr><td class="valueName">Province:</td><td class="parameterValue">${province}</td></tr>' +
                    '<tr><td class="valueName">IGSN:</td><td class="parameterValue">${igsn}</td></tr>' +
                    '<tr><td class="valueName">Sample Comments:</td><td class="parameterValue">${sampleComments}</td></tr>' +
                    '<tr><td class="valueName">Storage:</td><td class="parameterValue">${storageMethod}</td></tr>' +
                    '</table>';

                var html = string.substitute(template, {
                    dataLink: a['Data Link'],
                    repository: a['Repository'],
                    repositoryLink: a['Repository Link'],
                    platform: a['Platform'],
                    cruiseOrLeg: a['Cruise or Leg'],
                    cruiseOrLegLink: a['Cruise or Leg Link'],
                    alternateCruiseOrLeg: a['Alternate Cruise or Leg'],
                    alternateCruiseOrLegLink: a['Alternate Cruise or Leg Link'],
                    sampleId: a['Sample ID'],
                    device: a['Device'],
                    dateCollected: a['Date Collected'],
                    endDateOfCollection: a['End Date of Collection'],
                    latitude: a['Latitude'],
                    longitude: a['Longitude'],
                    endLatitude: a['End Latitude'],
                    endLongitude: a['End Longitude'],
                    waterDepth: a['Water Depth (m)'],
                    endWaterDepth: a['End Water Depth (m)'],
                    storageMethod: a['Storage Method'],
                    coreLength: a['Core Length (cm)'],
                    coreDiameter: a['Core Diameter (cm)'],
                    pi: a['PI'],
                    province: a['Province'],
                    lake: a['Lake'],
                    dateLastUpdated: a['Date Information Last Updated'],
                    igsn: a['IGSN'],
                    sampleComments: a['Sample Comments'],
                    imlgs: a['IMLGS']
                });                
                return html;
            },

            underseaFeaturesFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template =
                    '<h3>Undersea Feature: ${name} ${type}</h3>';

                var html = string.substitute(template, {
                    name: a['NAME'],
                    type: a['TYPE']
                });
                return html;
            },

            crnFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template =
                    '<h3>Climate Reference Network: ${station} (${state})</h3>' +   
                    '<div class="valueName">Period of Record: <span class="parameterValue">${begDate} to ${endDate}</span></div>' +                
                    '<div class="valueName"><span class="parameterValue"><a href="${url}" target="_blank">Station Details</a></span></div>';

                var html = string.substitute(template, {
                    station: a['STATION'],
                    state: a['STATE'],
                    begDate: a['BEG_DATE'],
                    endDate: a['END_DATE'],
                    url: 'https://www.ncdc.noaa.gov/crn/station.htm?stationId=' + a['STATION_ID']
                });
                return html;
            },

            ghcndFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template =
                    '<h3>GCHN Daily: ${stationName}</h3>' +
                    '<div class="valueName">Period of Record: <span class="parameterValue">${dataBeginDate} to ${dataEndDate}</span></div>' +    
                    '<div class="valueName"><span class="parameterValue"><a href="${url}" target="_blank">Station Details</a></span></div>';

                var html = string.substitute(template, {
                    stationName: a['STATION_NAME'],
                    dataBeginDate: a['DATA_BEGIN_DATE'],
                    dataEndDate: a['DATA_END_DATE'],                        
                    url: 'https://www.ncdc.noaa.gov/cdo-web/datasets/GHCND/stations/' + a['STATION_ID'] + '/detail'
                });
                return html;
            },

            gsomFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template =
                    '<h3>Global Surface Summary of the Month: ${stationName}</h3>' +
                    '<div class="valueName">Period of Record: <span class="parameterValue">${dataBeginDate} to ${dataEndDate}</span></div>' +    
                    '<div class="valueName"><span class="parameterValue"><a href="${url}" target="_blank">Station Details</a></span></div>';

                var html = string.substitute(template, {
                    stationName: a['STATION_NAME'],
                    dataBeginDate: a['DATA_BEGIN_DATE'],
                    dataEndDate: a['DATA_END_DATE'],
                    url: 'https://www.ncdc.noaa.gov/cdo-web/datasets/GSOM/stations/' + a['STATION_ID'] + '/detail'
                });
                return html;
            },

            gsoyFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template =
                    '<h3>Global Surface Summary of the Month: ${stationName}</h3>' +
                    '<div class="valueName">Period of Record: <span class="parameterValue">${dataBeginDate} to ${dataEndDate}</span></div>' +    
                    '<div class="valueName"><span class="parameterValue"><a href="${url}" target="_blank">Station Details</a></span></div>';

                var html = string.substitute(template, {
                    stationName: a['STATION_NAME'],
                    dataBeginDate: a['DATA_BEGIN_DATE'],
                    dataEndDate: a['DATA_END_DATE'],
                    url: 'https://www.ncdc.noaa.gov/cdo-web/datasets/GSOY/stations/' + a['STATION_ID'] + '/detail'
                });
                return html;
            },

            isdFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template =
                    '<h3>Integrated Surface Global Hourly Data: ${station}</h3>' +
                    '<div class="valueName">Period of Record: <span class="parameterValue">${beginDate} to ${endDate}</span></div>' +    
                    '<div class="valueName"><span class="parameterValue"><a href="${simpleUrl}" target="_blank">Data Access (Simplified)</a></span></div>' +
                    '<div class="valueName"><span class="parameterValue"><a href="${advancedUrl}" target="_blank">Data Access (Advanced)</a></span></div>';

                var html = string.substitute(template, {
                    station: a['STATION'],
                    beginDate: a['BEG_DATE'],
                    endDate: a['END_DATE'],
                    advancedUrl: 'https://www7.ncdc.noaa.gov/CDO/cdodataelem.cmd?p_ndatasetid=11&datasetabbv=DS3505&p_cqueryby=ENTIRE&p_ncntryid=&p_nrgnid=' +
                        '&p_nstprovid=&p_cfileform=&p_csubqueryby=STATION&resolution=40&poeoption=ADVANCED&p_asubqueryitems=' + a['AWSBAN'],
                    simpleUrl: 'https://www7.ncdc.noaa.gov/CDO/cdodateoutmod.cmd?p_ndatasetid=11&datasetabbv=DS3505&p_cqueryby=ENTIRE&p_ncntryid=&p_nrgnid=' +
                        '&p_nstprovid=&p_cfileform=&p_csubqueryby=STATION&resolution=40&poeoption=SIMPLE&p_asubqueryitems=' + a['AWSBAN']
                });
                return html;
            },

            deepSeaCoralFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template =
                    '<h3><i>${scientificName}</i> (${vernacularNameCategory})</h3>' +
                    '<div class="valueName">Date: <span class="parameterValue">${observationDate}</span></div>' +
                    '<div class="valueName">Depth (m): <span class="parameterValue">${depthInMeters}</span></div>' +  
                    '<div class="valueName">Position (lat/lon): <span class="parameterValue">${latitude} ${longitude}</span></div>' +  
                    '<div class="valueName">Location Accuracy (m): <span class="parameterValue">${locationAccuracy}</span></div>' +  
                    '<div class="valueName">Sample ID: <span class="parameterValue">${sampleId}</span></div>' + 
                    '<div class="valueName">Data Provider: <span class="parameterValue">${repository}</span></div>' +  
                    '<div class="valueName">Identification Qualifier: <span class="parameterValue">${identificationQualifier}</span></div>' +  
                    '<div class="valueName">Citation: <span class="parameterValue">${citation}</span></div>' +  
                    '<div class="valueName">Catalog Number: <span class="parameterValue">${catalogNumber}</span></div>' +  
                    '<div class="valueName">Taxonomic Rank: <span class="parameterValue">${taxonomicRank}</span></div>' +  
                    '<div class="valueName">Sampling Equipment: <span class="parameterValue">${samplingEquipment}</span></div>' +  
                    '<div class="valueName">Location: <span class="parameterValue">${locality}</span></div>';
                    
                var html = string.substitute(template, {
                    scientificName: a['scientificname'],
                    vernacularNameCategory: a['vernacularnamecategory'],
                    observationDate: a['observationdate'],
                    depthInMeters: a['depthinmeters'],
                    latitude: a['latitude'],
                    longitude: a['longitude'],
                    locationAccuracy: a['locationaccuracy'],
                    sampleId: a['sampleid'],
                    repository: a['repository'],
                    identificationQualifier: a['identificationqualifier'],
                    citation: a['citation'],
                    catalogNumber: a['catalognumber'],
                    taxonomicRank: a['taxonrank'],
                    samplingEquipment: a['samplingequipment'],
                    locality: a['locality']
                });
                return html;
            },

            seaIceIndexFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = 
                    '<div class="valueName">Sea Ice Concentration: <span class="parameterValue">${seaIceConcentration}</span></div>';
                    
                var html = string.substitute(template, {
                    seaIceConcentration: a['GRAY_INDEX']
                });
                return html;
            },

            threddsWmsFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = 
                    '<div class="valueName">Value: <span class="parameterValue">${value}</span></div>';
                    
                var html = string.substitute(template, {
                    value: a['Value']
                });
                return html;
            },

            multibeamSort: function(a, b) {
                //Sort by year descending, then alphabetical by survey ID
                if (a.feature.attributes['Survey Year'] === b.feature.attributes['Survey Year']) {
                    return a.feature.attributes['Survey ID'] <= b.feature.attributes['Survey ID'] ? -1 : 1;
                }
                return a.feature.attributes['Survey Year'] < b.feature.attributes['Survey Year'] ? 1 : -1;
            },

            tracklineSort: function(a, b) {
                //Sort by year descending, then alphabetical by survey ID
                if (a.feature.attributes['Survey Start Year'] === b.feature.attributes['Survey Start Year']) {
                    return a.feature.attributes['Survey ID'] <= b.feature.attributes['Survey ID'] ? -1 : 1;
                }
                return a.feature.attributes['Survey Start Year'] < b.feature.attributes['Survey Start Year'] ? 1 : -1;
            },

            aeromagSort: function(a, b) {
                //Sort by start year descending, then alphabetical by survey ID
                if (a.feature.attributes['Start Year'] === b.feature.attributes['Start Year']) {
                    return a.feature.attributes['Survey ID'] <= b.feature.attributes['Survey ID'] ? -1 : 1;
                }
                return a.feature.attributes['Start Year'] < b.feature.attributes['Start Year'] ? 1 : -1;
            },

            nosHydroSort: function(a, b) {
                //Sort by layer ID: BAGs, Digital, Non-Digital, then by year descending (nulls last) then alphabetical for hydro surveys.
                if (a.layerId === b.layerId) {                   
                    if (a.feature.attributes['Survey Year'] === 'Null') {                                           
                        return 1;
                    }
                    if (b.feature.attributes['Survey Year'] === 'Null') { 
                        return -1;
                    }
                    if (a.feature.attributes['Survey Year'] === b.feature.attributes['Survey Year']) {
                        return a.feature.attributes['Survey ID'] <= b.feature.attributes['Survey ID'] ? -1 : 1;
                    }
                    return a.feature.attributes['Survey Year'] < b.feature.attributes['Survey Year'] ? 1 : -1;
                }
                return a.layerId <= b.layerId ? -1 : 1;
            },

            demSort: function(a, b) {
                //Sort alphabetically, but Global relief (e.g. ETOPO1) should be at the end of the list
                if (a.feature.attributes['Category'] === 'Global Relief') {
                    return 1;
                }
                if (b.feature.attributes['Category'] === 'Global Relief') {
                    return -1;
                }
                return a.feature.attributes['Name'] <= b.feature.attributes['Name'] ? -1 : 1;
            },

            demTileSort: function(a, b) {
                //Sort alphabetically
                return a.feature.attributes['NAME'] <= b.feature.attributes['NAME'] ? -1 : 1;
            },

            marineGeologySort: function(a, b) {
                //Sort by NOS Survey ID, then Sample ID within surveys
                var attr1 = a.feature.attributes;
                var attr2 = b.feature.attributes;
                if (attr1['MGGID'] === attr2['MGGID']) {                   
                    return attr1['Hole/Sample ID'] <= attr2['Hole/Sample ID'] ? -1 : 1;
                }
                return attr1['MGGID'] <= attr2['MGGID'] ? -1 : 1;
            },

            sampleIndexSort: function(a, b) {
                //Sort by Platform, Cruise, Alternate Cruise, Sample ID
                var attr1 = a.feature.attributes;
                var attr2 = b.feature.attributes;

                if (attr1['Platform'] === attr2['Platform']) {

                    if (attr1['Cruise or Leg'] === attr2['Cruise or Leg']) {
                        if (attr1['Alternate Cruise or Leg'] === attr2['Alternate Cruise or Leg']) {
                            return attr1['Sample ID'] <= attr2['Sample ID'] ? -1 : 1;
                        }
                        return attr1['Alternate Cruise or Leg'] <= attr2['Alternate Cruise or Leg'] ? -1 : 1;
                    }
                    return attr1['Cruise or Leg'] <= attr2['Cruise or Leg'] ? -1 : 1;
                }
                return attr1['Platform'] <= attr2['Platform'] ? -1 : 1;                
            },

            sortResults: function(results) {
                var features;
                var sublayerId;

                if (results['Multibeam']) {    
                    if ((features = results['Multibeam']['Multibeam Bathymetric Surveys'])) {
                        features.sort(this.multibeamSort);
                    }                    
                }
                if (results['Trackline Combined']) {   
                    for (sublayerId in results['Trackline Combined']) {
                        if (results['Trackline Combined'].hasOwnProperty(sublayerId)) {
                            features = results['Trackline Combined'][sublayerId];
                            if (sublayerId === 'Aeromagnetic Surveys') {
                                features.sort(this.aeromagSort);
                            }
                            else {
                                features.sort(this.tracklineSort);
                            }
                        }
                    }                    
                }
                if (results['NOS Hydrographic Surveys']) {  
                    for (sublayerId in results['NOS Hydrographic Surveys']) {
                        if (results['NOS Hydrographic Surveys'].hasOwnProperty(sublayerId)) {
                            results['NOS Hydrographic Surveys'][sublayerId].sort(this.nosHydroSort);
                        }
                    }                                
                }               
                if (results['DEM Extents']) {    
                    if ((features = results['DEM Extents']['NCEI Digital Elevation Models'])) {
                        features.sort(this.demSort);
                    }                    
                }
                if (results['DEM Tiles']) {    
                    if ((features = results['DEM Tiles']['DEM Tiles'])) {
                        features.sort(this.demTileSort);
                    }                    
                }
                if (results['Sample Index']) { 
                    features = results['Sample Index']['All Samples by Institution'];
                    features.sort(this.sampleIndexSort);                
                }
                if (results['Marine Geology']) {
                    features = results['Marine Geology']['Marine Geology Data Sets/Reports'];
                    features.sort(this.marineGeologySort);
                }
            },

            //Convert a date string from mm/dd/yyyy to yyyy-mm-dd
            formatDate: function(dateStr) {
                var tokens = dateStr.split('/');
                if (tokens.length === 3) {
                    var date = new Date(tokens[2], tokens[0]-1, tokens[1]);
                    return date.getFullYear() + '-' + this.padDigits(date.getMonth()+1,2) + '-' + this.padDigits(date.getDate(),2);
                } else {
                    return '';
                }
            },

            padDigits: function(n, totalDigits){
                n = n.toString();
                var pd = '';
                if (totalDigits > n.length) {
                    for (var i = 0; i < (totalDigits - n.length); i++) {
                        pd += '0';
                    }
                }
                return pd + n.toString();
            }

        });
    }
);