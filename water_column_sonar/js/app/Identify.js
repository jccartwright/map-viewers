define(["dojo/_base/declare", "dojo/_base/array", "dojo/string", "ngdc/identify/AbstractIdentify", "dojo/topic", "esri/dijit/Popup", "dojo/_base/lang"],
    function(declare, array, string, AbstractIdentify, topic, Popup, lang){

        return declare([AbstractIdentify], {

            wcdFormatter: function(feature) {
                var a = this.replaceNullAttributes(feature.attributes);
                /*'ID','Date String','Latitude','Longitude','Location Name','Area','Country','Cause','Event Validity','Earthquake Magnitude',
                        'Earthquake Depth','Max Event Runup','Tsunami Intensity','Comments','Damage in millions of dollars','Damage Description','Houses Destroyed','Houses Destroyed Description',
                        'Deaths','Deaths Description','Injuries','Injuries Description','Missing','Missing Description','Number of Observations'],*/
                var html = string.substitute('\
                    <table cellpadding="0" border="1" cellspacing="0">\
                        <tr><td><b>File Name:</b></td><td>${fileName}</td></tr>\
                        <tr><td><b>Survey ID:</b></td><td>${surveyID}</td></tr>\
                        <tr><td><b>Ship:</b></td><td>${shipName}</td></tr>\
                        <tr><td><b>Instrument:</b></td><td>${instrumentName}</td></tr>\
                        <tr><td><b>Scientist:</b></td><td>${scientistName}</td></tr>\
                        <tr><td><b>Source Name:</b></td><td>${sourceName}</td></tr>\
                        <tr><td><b>Source Group:</b></td><td>${sourceGroup}</td></tr>\
                        <tr><td><b>Project:</b></td><td>${projectName}</td></tr>\
                        <tr><td><b>Minimum Depth (m):</b></td><td>${minDepth}</td></tr>\
                        <tr><td><b>Collection Date:</b></td><td>${collectionDate}</td></tr>\
                        <tr><td><b>Publish Date:</b></td><td>${publishDate}</td></tr>\
                        <tr><td><b>Beam Type:</b></td><td>${beamType}</td></tr>\
                        <tr><td><b>Number of Beams:</b></td><td>${numBeams}</td></tr>\
                        <tr><td><b>Swath Width (degrees):</b></td><td>${swathWidth}</td></tr>\
                        <tr><td><b>Recording Range (m):</b></td><td>${recordingRange}</td></tr>\
                        <tr><td><b>Frequency (kHz):</b></td><td>${frequency}</td></tr>\
                    </table>', { 
                        fileName: a['File Name'],
                        surveyID: a['Survey ID'],
                        shipName: a['Ship Name'],
                        instrumentName: a['Instrument Name'],
                        scientistName: a['Scientist Name'],
                        sourceName: a['Source Name'],
                        sourceGroup: a['Source Group'],
                        projectName: a['Project Name'],
                        minDepth: a['Minimum Depth'],
                        collectionDate: a['Collection Date'],
                        publishDate: a['Publish Date'],
                        beamType: a['Beam Type'],
                        numBeams: a['Number of Beams'],
                        swathWidth: a['Swath Width (degrees)'],
                        recordingRange: a['Recording Range (m)'],
                        frequency: a['Frequency']
                    });                
                return html;
            },

            //called after parent class constructor
            constructor: function() {
                logger.debug('inside constructor for app/Identify');

                //configure for specific viewer
                arguments[0].layerIds = ['Water Column Sonar'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

                topic.subscribe("identifyPane/showInfo", lang.hitch(this, function(item) {
                    console.log('identifyPane/showInfo received ' + item);

                    var identifyPane = this._map.identifyPane;
                    if (identifyPane) {
                        var layerKey = item.layerKey;
                        identifyPane.setInfoPaneContent(this.formatters[layerKey](item));
                    }
                }));

                //formatter specific to each sublayer, keyed by Layer/sublayer name.
                this.formatters = {
                    'Water Column Sonar/Source Group: NMFS': lang.hitch(this, this.wcdFormatter),
                    'Water Column Sonar/Source Group: OER': lang.hitch(this, this.wcdFormatter), 
                    'Water Column Sonar/Source Group: UNOLS': lang.hitch(this, this.wcdFormatter), 
                    'Water Column Sonar/Source Group: Other': lang.hitch(this, this.wcdFormatter)
                };

                this.sortFunctions = {
                    'Water Column Sonar/Source Group: OER': this.wcdSort
                }

            }, //end constructor

            wcdSort: function(a, b) {
                //Sort alphabetically on File Name
                return a.feature.attributes['File Name'] > b.feature.attributes['File Name'] ? 1 : -1;
            },

            sortResults: function(results) {
                var features;
                if (results['Water Column Sonar']) {    
                    if (features = results['Water Column Sonar']['Source Group: NMFS']) {
                        features.sort(this.wcdSort);
                    }
                    if (features = results['Water Column Sonar']['Source Group: OER']) {
                        features.sort(this.wcdSort);
                    }
                    if (features = results['Water Column Sonar']['Source Group: UNOLS']) {
                        features.sort(this.wcdSort);
                    }
                    if (features = results['Water Column Sonar']['Source Group: Other']) {
                        features.sort(this.wcdSort);
                    }
                }
            }

        });
    }
);