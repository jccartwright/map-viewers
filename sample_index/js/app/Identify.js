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

                var template = '\
                    <div class="valueName"><span class="parameterValue"><a href="${dataLink}" target="_blank">Data and Images</a></span></div>\
                    <div class="valueName">Repository: <span class="parameterValue">${repository}</span></div>\
                    <div class="valueName">Platform: <span class="parameterValue">${platform}</span></div>\
                    <div class="valueName">Cruise or Leg: <span class="parameterValue"><a href="${cruiseOrLegLink}" target="_blank">${cruiseOrLeg}</a></span></div>\
                    <div class="valueName">Alternate Cruise or Leg: <span class="parameterValue"><a href="${alternateCruiseOrLegLink}" target="_blank">${alternateCruiseOrLeg}</a></span></div>\
                    <div class="valueName">Sample ID: <span class="parameterValue">${sampleId}</span></div>';

                var html = string.substitute(template, {
                    dataLink: a['Data Link'],
                    repository: a['Repository'],
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
                //Sort by Repository, Cruise, Sample ID, Device  
                var attr1 = a.feature.attributes;
                var attr2 = b.feature.attributes;

                if (attr1['Repository'] == attr2['Repository']) {

                    if (attr1['Cruise or Leg'] == attr2['Cruise or Leg']) {
                        if (attr1['Sample ID'] == attr2['Sample ID']) {
                            return attr1['Device'] <= attr2['Device'] ? -1 : 1;
                        }
                        return attr1['Sample ID'] <= attr2['Sample ID'] ? -1 : 1;
                    }
                    return attr1['Cruise or Leg'] <= attr2['Cruise or Leg'] ? -1 : 1;
                }
                return attr1['Repository'] <= attr2['Repository'] ? -1 : 1;
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