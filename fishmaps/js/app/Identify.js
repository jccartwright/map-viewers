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

            fishmapsFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = '\
                    <div class="valueName">Map Name: <span class="parameterValue">${mapName}</span></div>\
                    <div class="valueName">Type: <span class="parameterValue">${type}</span></div>\
                    <div class="valueName">NOAA Map Number: <span class="parameterValue">${noaaMapNumber}</span></div>';

                if (a['NOAA Map Number'] != '') {
                    var pdfPreviewUrl = '//www.ngdc.noaa.gov/mgg/bathymetry/maps/previews/' + a['NOAA Map Number'] + '.pdf';
                    var downloadUrl = '//www.ngdc.noaa.gov/mgg/bathymetry/maps/finals/' + a['NOAA Map Number'];
                    template += '\
                        <div class="valueName">Preview: <span class="parameterValue"><a href="' + pdfPreviewUrl + '" target="_blank">PDF Preview</a></span></div>\
                        <div class="valueName">Download: <span class="parameterValue"><a href="' + downloadUrl + '" target="_blank">Full-Size Map Download</a></span></div>';
                }

                template += '\
                    <div class="valueName">USGS Map Number: <span class="parameterValue">${usgsMapNumber}</span></div>\
                    <div class="valueName">Year Compiled: <span class="parameterValue">${yearCompiled}</span></div>\
                    <div class="valueName">Map Scale: <span class="parameterValue">${mapScale}</span></div>\
                    <div class="valueName">Contour Unit: <span class="parameterValue">${contourUnit}</span></div>\
                    <div class="valueName">Format: <span class="parameterValue">${format}</span></div>\
                    <div class="valueName">Cost: <span class="parameterValue">${cost}</span></div>\
                    <div class="valueName">North: <span class="parameterValue">${north}</span></div>\
                    <div class="valueName">South: <span class="parameterValue">${south}</span></div>\
                    <div class="valueName">East: <span class="parameterValue">${east}</span></div>\
                    <div class="valueName">West: <span class="parameterValue">${west}</span></div>';
                
                var html = string.substitute(template, {
                        noaaMapNumber: a['NOAA Map Number'],
                        usgsMapNumber: a['USGS Map Number'],
                        mapName: a['Map Name'],
                        yearCompiled: a['Year Compiled'],
                        mapScale: a['Map Scale'],
                        contourUnit: a['Contour Unit'],
                        format: a['Format'],
                        cost: a['Cost'],
                        type: a['Type'],
                        north: a['North'],
                        south: a['South'],
                        east: a['East'],
                        west: a['West']
                    });                
                return html;
            },
                        
            sortResults: function(results) {
                //no sorting              
            }

        });
    }
);