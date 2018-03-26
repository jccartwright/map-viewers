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

            sortResults: function(results) {
                if (results['Sample Index']) { 
                    var features = results['Sample Index']['All Samples by Institution'];
                    features.sort(this.sampleIndexSort);                
                }
            }

        });
    }
);