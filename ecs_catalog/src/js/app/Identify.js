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

            //called after parent class constructor
            constructor: function() {
                logger.debug('inside constructor for app/web_mercator/Identify');

                //augment arguments object with list of layers to identify.
                arguments[0].layerIds = ['ECS Catalog', 'Multibeam', 'Trackline', 'Sample Index'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);
                this.layerCollection = arguments[0].layerCollection;

                var svc = this.layerCollection.getLayerById('ECS Catalog');

                //Attach each sublayer of the ECS Catalog service to the ecsCatalogFormatter function
                this.formatters = {};
                array.forEach(svc.layerInfos, lang.hitch(this, function(layerInfo) {
                    var key = 'ECS Catalog/' + layerInfo.name;
                    this.formatters[key] = lang.hitch(this, this.ecsCatalogFormatter);
                }));

                this.formatters['ECS Catalog/International ECS Polygons (UNEP GRID-Arendal)'] = lang.hitch(this, this.internationalEcsFormatter);
                this.formatters['ECS Catalog/World_Maritime_Boundaries_v8_20140228'] = lang.hitch(this, this.maritimeBoundaryFormatter);

                //formatters for Pre-2012 Source Data layers
                this.formatters['Sample Index/All Samples by Institution'] = lang.hitch(this, this.sampleIndexFormatter);
                this.formatters['Multibeam/Multibeam Bathymetric Surveys'] = lang.hitch(this, this.multibeamFormatter);
                this.formatters['Trackline/Marine Trackline Surveys: All Survey Types'] = lang.hitch(this, this.tracklineFormatter);
                this.formatters['Trackline/Marine Trackline Surveys: Bathymetry'] = lang.hitch(this, this.tracklineFormatter);
                this.formatters['Trackline/Marine Trackline Surveys: Gravity'] = lang.hitch(this, this.tracklineFormatter);
                this.formatters['Trackline/Marine Trackline Surveys: Magnetics'] = lang.hitch(this, this.tracklineFormatter);
                this.formatters['Trackline/Marine Trackline Surveys: Multi-Channel Seismics'] = lang.hitch(this, this.tracklineFormatter);
                this.formatters['Trackline/Marine Trackline Surveys: Seismic Refraction'] = lang.hitch(this, this.tracklineFormatter);
                this.formatters['Trackline/Marine Trackline Surveys: Shot-Point Navigation'] = lang.hitch(this, this.tracklineFormatter);
                this.formatters['Trackline/Marine Trackline Surveys: Side Scan Sonar'] = lang.hitch(this, this.tracklineFormatter);
                this.formatters['Trackline/Marine Trackline Surveys: Single-Channel Seismics'] = lang.hitch(this, this.tracklineFormatter);
                this.formatters['Trackline/Marine Trackline Surveys: Subbottom Profile'] = lang.hitch(this, this.tracklineFormatter);

            }, //end constructor

            getCatalogUrl: function(classStr, objectId) {
                var tokens = classStr.split('.');
                var type = tokens[tokens.length - 1];
                
                //All types (except EEZ) should have their first character converted to lowercase.
                if (type != 'EEZ') {    
                    type = type[0].toLowerCase() + type.substring(1);
                }

                return window.location.protocol + '//' + window.location.host + '/ecs-catalog/#/' + type + '/' + objectId;
            },

            internationalEcsFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <h3>International ECS Area: ${state}</h3>\
                    <div class="valueName">Status: <span class="parameterValue">${status}</span></div>\
                    <div class="valueName">Date: <span class="parameterValue">${date}</span></div>';                 

                var html = string.substitute(template, {
                        state: a['STATE'],
                        status: a['STATUS'],
                        date: a['DATE']
                    });                
                return html;
            },

            maritimeBoundaryFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <h3>Maritime Boundary: ${boundary}</h3>\
                    <div class="valueName">Type: <span class="parameterValue">${type}</span></div>\
                    <div class="valueName">Source: <span class="parameterValue">${source}</span></div>\
                    <div class="valueName">Treaty Date: <span class="parameterValue">${treatyDate}</span></div>';                 

                var html = string.substitute(template, {
                        boundary: a['Boundary'],
                        type: a['TYPE'],
                        source: a['Source'],
                        treatyDate: a['TreatyDate']
                    });                
                return html;
            },

            ecsCatalogFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <h3>ECS Catalog Entry: ${title}</h3>\
                    <div class="valueName"><span class="parameterValue"><a href="${url}" target="_blank">Link to Entry</a></span></div>\
                    <div class="valueName">Description: <span class="parameterValue">${description}</span></div>\
                    <div class="valueName">Phase: <span class="parameterValue">${phase}</span></div>';                 

                var html = string.substitute(template, {
                        url: this.getCatalogUrl(a['CLASS'], a['OBJECTID']),
                        title: a['TITLE'],
                        description: a['DESCRIPTION'],
                        classStr: a['CLASS'],
                        phase: a['PHASE']
                    });                
                return html;
            },

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

            sampleIndexFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <table>\
                    <tr><td class="valueName">Repository:</td><td class="parameterValue"><a href="${repositoryLink}" target="_blank" title="contact info/links to the sample repository"><b>${repository} [Contact the Curator]</b></a></td></tr>\
                    <tr><td class="valueName">Platform Name:</td><td class="parameterValue">${platform}</td></tr>\
                    <tr><td class="valueName">Lake:</td><td class="parameterValue">${lake}</td></tr>\
                    <tr><td class="valueName">Survey ' + (a['Alternate Cruise or Leg'] ? '(Alternate) ' : '') + 'ID:</td><td class="parameterValue"><a href="${cruiseOrLegLink}" target="_blank">${cruiseOrLeg}</a>' + (a['Alternate Cruise or Leg'] ? ' (<a href="${alternateCruiseOrLegLink}" target="_blank">${alternateCruiseOrLeg})' : '') + '</td></tr>\
                    <tr><td class="valueName">Sample:</td><td class="parameterValue"><a href="${dataLink}" target="_blank" title="go to more information, data, images, and links to related resources">${sampleId} [Data and images]</a></td></tr>\
                    <tr><td class="valueName">Device:</td><td class="parameterValue">${device}</td></tr>\
                    <tr><td class="valueName">Latitude:</td><td class="parameterValue">${latitude}' + (a['End Latitude'] ? ' to ${endLatitude}' : '') + '</td></tr>\
                    <tr><td class="valueName">Longitude:</td><td class="parameterValue">${longitude}' + (a['End Longitude'] ? ' to ${endLongitude}' : '') + '</td></tr>\
                    <tr><td class="valueName">Water Depth (m):</td><td class="parameterValue">${waterDepth}</td></tr>\
                    <tr><td class="valueName">Date:</td><td class="parameterValue">${dateCollected}</td></tr>\
                    <tr><td class="valueName">PI:</td><td class="parameterValue">${pi}</td></tr>\
                    <tr><td class="valueName">Core Len/Diam (cm):</td><td class="parameterValue">${coreLength}/${coreDiameter}</td></tr>\
                    <tr><td class="valueName">Province:</td><td class="parameterValue">${province}</td></tr>\
                    <tr><td class="valueName">IGSN:</td><td class="parameterValue">${igsn}</td></tr>\
                    <tr><td class="valueName">Sample Comments:</td><td class="parameterValue">${sampleComments}</td></tr>\
                    <tr><td class="valueName">Storage:</td><td class="parameterValue">${storageMethod}</td></tr>\
                    </table>';

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

            sampleIndexSort: function(a, b) {
                //Sort by Platform, Cruise, Alternate Cruise, Sample ID
                var attr1 = a.feature.attributes;
                var attr2 = b.feature.attributes;

                if (attr1['Platform'] == attr2['Platform']) {

                    if (attr1['Cruise or Leg'] == attr2['Cruise or Leg']) {
                        if (attr1['Alternate Cruise or Leg'] == attr2['Alternate Cruise or Leg']) {
                            return attr1['Sample ID'] <= attr2['Sample ID'] ? -1 : 1;
                        }
                        return attr1['Alternate Cruise or Leg'] <= attr2['Alternate Cruise or Leg'] ? -1 : 1;
                    }
                    return attr1['Cruise or Leg'] <= attr2['Cruise or Leg'] ? -1 : 1;
                }
                return attr1['Platform'] <= attr2['Platform'] ? -1 : 1;                
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
                if (results['Sample Index']) { 
                    if ((features = results['Sample Index']['All Samples by Institution'])) {
                        features.sort(this.sampleIndexSort);
                    }
                }
            }
        });
    }
);