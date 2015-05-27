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

            datasetsReportsFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <table>\
                    <tr><td class="valueName">Dataset Title:</td><td class="parameterValue"><a href="http://www.ngdc.noaa.gov/nndc/struts/results?op_28=eq&t=101477&s=1&d=2&v_28=${mggId}" target="_blank">${datasetTitle}</a></td></tr>\
                    <tr><td class="valueName">MGGID:</td><td class="parameterValue">${mggId}</td></tr>\
                    <tr><td class="valueName">Cruise:</td><td class="parameterValue">${cruise}</td></tr>\
                    <tr><td class="valueName">Platform:</td><td class="parameterValue">${platform}</td></tr>\
                    <tr><td class="valueName">Hole/Sample ID:</td><td class="parameterValue">${holeSampleId}</td></tr>\
                    <tr><td class="valueName">Device:</td><td class="parameterValue">${device}</td></tr>\
                    <tr><td class="valueName">Collection Date:</td><td class="parameterValue">${collectionDate}</td></tr>\
                    <tr><td class="valueName">Latitude:</td><td class="parameterValue">${latitude}</td></tr>\
                    <tr><td class="valueName">Longitude:</td><td class="parameterValue">${longitude}</td></tr>\
                    <tr><td class="valueName">Metadata gov.noaa.ngdc.mgg:</td><td class="parameterValue"><a href="http://www.ngdc.noaa.gov/docucomp/page?xml=NOAA/NESDIS/NGDC/MGG/Geology/iso/xml/${metadata}.xml&amp;view=getDataView&amp;header=none" target="_blank">${metadata}</a></td></tr>\
                    </table>';

                var html = string.substitute(template, {
                    datasetTitle: a['Dataset Title'],
                    mggId: a['MGGID'],
                    cruise: a['Cruise'],
                    platform: a['Platform'],
                    holeSampleId: a['Hole/Sample ID'],
                    device: a['Device'],
                    collectionDate: a['Collection Date'],
                    latitude: a['Latitude'],
                    longitude: a['Longitude'],
                    metadata: a['Metadata gov.noaa.ngdc.mgg:']
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

            nosSeabedFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <table>\
                    <tr><td class="valueName">NOS Survey ID:</td><td class="parameterValue"><a href="http://www.ngdc.noaa.gov/geosamples/survey.jsp?s=${nosSurveyId}&d=include" target="_blank">${nosSurveyId}</a></td></tr>\
                    <tr><td class="valueName">Sample ID:</td><td class="parameterValue">${sampleId}</td></tr>\
                    <tr><td class="valueName">Latitude:</td><td class="parameterValue">${latitude}</td></tr>\
                    <tr><td class="valueName">Longitude:</td><td class="parameterValue">${longitude}</td></tr>\
                    <tr><td class="valueName">Begin Observation Time:</td><td class="parameterValue">${beginObservationTime}</td></tr>\
                    <tr><td class="valueName">Description:</td><td class="parameterValue">${description}</td></tr>\
                    <tr><td class="valueName">Color:</td><td class="parameterValue">${color}</td></tr>\
                    <tr><td class="valueName">Nature of Surface:</td><td class="parameterValue">${natureOfSurface}</td></tr>\
                    <tr><td class="valueName">Qualifying Terms:</td><td class="parameterValue">${qualifyingTerms}</td></tr>\
                    <tr><td class="valueName">Data Source:</td><td class="parameterValue">${dataSource}</td></tr>\
                    </table>';

                var html = string.substitute(template, {
                    nosSurveyId: a['NOS Survey ID'],
                    sampleId: a['Sample ID'],
                    latitude: a['Latitude'],
                    longitude: a['Longitude'],
                    beginObservationTime: a['Begin Observation Time'],
                    description: a['Description'],
                    color: a['Color'],
                    natureOfSurface: a['Nature of the Surface'],
                    qualifyingTerms: a['Qualifying Terms'],
                    dataSource: a['Data Source']
                });                
                return html;
            },

            datasetsReportsSort: function(a, b) {
                return a.feature.attributes['MGGID'] <= b.feature.attributes['MGGID'] ? -1 : 1;     
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

            nosSeabedSort: function(a, b) {
                //Sort by NOS Survey ID, then Sample ID within surveys
                var attr1 = a.feature.attributes;
                var attr2 = b.feature.attributes;
                if (attr1['NOS Survey ID'] == attr2['NOS Survey ID']) {                   
                    return attr1['Sample ID'] <= attr2['Sample ID'] ? -1 : 1;
                }
                return attr1['NOS Survey ID'] <= attr2['NOS Survey ID'] ? -1 : 1;     
            },

            sortResults: function(results) {
                var features;
                if (results['Sample Index']) { 
                    features = results['Sample Index']['All Samples by Institution'];
                    features.sort(this.sampleIndexSort);                
                }
                else if (results['Datasets/Reports']) {
                    features = results['Datasets/Reports']['Geology_Datasets/Reports_NGDC_Archive'];
                    features.sort(this.datasetsReportsSort);
                }
                else if (results['NOS Seabed']) {
                    features = results['NOS Seabed']['NOS Seabed Type'];
                    features.sort(this.nosSeabedSort);
                }
            }

        });
    }
);