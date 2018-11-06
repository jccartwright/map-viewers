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

            multibeamFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = 
                    '<h3>Multibeam Bathymetric Survey: ${surveyId}</h3>' +
                    '<div class="valueName"><span class="parameterValue"><a href="${url}" target="_blank">Link to Data</a></span></div>' +
                    '<div class="valueName">Survey ID: <span class="parameterValue">${surveyId}</span></div>' +
                    '<div class="valueName">Platform Name: <span class="parameterValue">${platformName}</span></div>' +
                    '<div class="valueName">Survey Start Date: <span class="parameterValue">${startDate}</span></div>' +
                    '<div class="valueName">Survey End Date: <span class="parameterValue">${endDate}</span></div>' +
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
                    surveyId: a['Survey ID'],
                    surveyYear: a['Survey Year'],
                    startDate: this.formatDate(a['Start Date']),
                    endDate: this.formatDate(a['End Date']),
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
                    dateAdded: this.formatDate(a['Date Added'])
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

            bagFootprintFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template =
                    '<h3>BAG Footprint: ${name}</h3>' +
                    '<div class="valueName"><span class="parameterValue"><a href="${url}" target="_blank">Link to Data</a></span></div>' +
                    '<div class="valueName">Survey ID: <span class="parameterValue">${surveyId}</span></div>' +
                    '<div class="valueName">Cell Size (m): <span class="parameterValue">${cellSize}</span></div>';

                var html = string.substitute(template, {
                    name: a['Name'],
                    surveyId: a['Survey ID'],
                    cellSize: a['Cell Size (m)'],
                    url: a['Download URL']
                });
                return html;
            },

            demFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '<h3>Digital Elevation Model: ${name}</h3>';

                if (a['Metadata URL'] !== '') {
                    template += '<div class="valueName"><span class="parameterValue"><a href="${metadataUrl}" target="_blank">Link to Metadata</a></span></div>';
                }
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

            demTilesFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var id = parseInt(a['ID']);
                var cellSize = '';
                var metadataUrl = '';
                var downloadUrl = '';
                var bulkDownloadUrl = '';
                if (id === 8483) {
                    cellSize = '1/9 arc-second';
                    metadataUrl = 'https://www.ncei.noaa.gov/metadata/geoportal/rest/metadata/item/gov.noaa.ngdc.mgg.dem:999919/html';
                    downloadUrl = 'https://coast.noaa.gov/dataviewer/#/lidar/search/where:ID=8483';
                    bulkDownloadUrl = 'https://coast.noaa.gov/htdata/raster2/elevation/NCEI_ninth_Topobathy_2014_8483/';
                }
                else if (id === 8580) {
                    cellSize = '1/3 arc-second';
                    metadataUrl = 'https://www.ncei.noaa.gov/metadata/geoportal/rest/metadata/item/gov.noaa.ngdc.mgg.dem:999913/html';
                    downloadUrl = 'https://coast.noaa.gov/dataviewer/#/lidar/search/where:ID=8580';
                    bulkDownloadUrl = 'https://coast.noaa.gov/htdata/raster2/elevation/NCEI_third_Topobathy_2014_8580/';
                }

                if (this.searchGeometry && this.searchGeometry.type !== 'point') {
                    var extent = this.searchGeometry.getExtent();
                    if (extent.spatialReference.wkid === 4326) {
                        extent = webMercatorUtils.geographicToWebMercator(extent);
                    }
                    downloadUrl += '&extent:' + extent.xmin + ',' + extent.ymin + ',' + extent.xmax + ',' + extent.ymax;
                }

                var template = '<h3>NCEI Tiled DEMs: ${name}</h3>';

                if (metadataUrl !== '') {
                    template += '<div class="valueName"><span class="parameterValue"><a href="${metadataUrl}" target="_blank">Link to Metadata</a></span></div>';
                }
                if (downloadUrl !== '') {
                    template += '<div class="valueName"><span class="parameterValue"><a href="${downloadUrl}" target="_blank">Extract DEM data from Data Access Viewer (NOAA Office for Coastal Management)</a></span></div>';
                }
                if (bulkDownloadUrl !== '') {
                    template += '<div class="valueName"><span class="parameterValue"><a href="${bulkDownloadUrl}" target="_blank">Bulk DEM Download</a></span></div>';
                }
                template +=
                    '<div class="valueName">Name: <span class="parameterValue">${name}</span></div>' +
                    '<div class="valueName">Cell Size: <span class="parameterValue">${cellSize}</span></div>' +                    
                    '<div class="valueName">Vertical Datum: <span class="parameterValue">${verticalDatum}</span></div>';

                var html = string.substitute(template, {
                    metadataUrl: metadataUrl,
                    downloadUrl: downloadUrl,
                    bulkDownloadUrl: bulkDownloadUrl,
                    name: a['Name'],
                    cellSize: cellSize,
                    verticalDatum: a['NativeVdatum']
                });               
                return html;
            },

            lidarFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template =
                    '<h3>Bathymetric Lidar: ${name}</h3>' +
                    '<div class="valueName">Name: <span class="parameterValue">${name}</span></div>' +
                    '<div class="valueName">Project: <span class="parameterValue">${project}</span></div>' +
                    '<div class="valueName">Year: <span class="parameterValue">${year}</span></div>' +
                    '<div class="valueName"><span class="parameterValue"><a href="${prefix}${id}/details/${id}" target="_blank">Link to Data</a></span></div>' +
                    '<div class="valueName"><span class="parameterValue"><a href="${metalink}" target="_blank">Metadata Link</a></span></div>';

                var html = string.substitute(template, {
                    id: a['ID'],
                    name: a['Name'],
                    project: a['Project'],
                    year: a['Year'],
                    metalink: a['Metalink'],
                    prefix: 'https://coast.noaa.gov/dataviewer/#/lidar/search/where:ID='
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

            bagFootprintSort: function(a, b) {
                //Sort alphabetically
                return a.feature.attributes['Name'] <= b.feature.attributes['Name'] ? -1 : 1;
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
                        if (results['NOS Hydrographic Surveys'].hasOwnProperty(sublayer)) {
                            results['NOS Hydrographic Surveys'][sublayer].sort(this.nosHydroSort);
                        }
                    }                                
                }
                
                if (results['DEM Extents']) {    
                    if ((features = results['DEM Extents']['NCEI Digital Elevation Models'])) {
                        features.sort(this.demSort);
                    }                    
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