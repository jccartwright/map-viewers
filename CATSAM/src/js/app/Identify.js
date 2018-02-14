define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/string',
    'ngdc/identify/AbstractIdentify',
    'dojo/topic',
    'esri/dijit/Popup',
    'esri/tasks/IdentifyParameters',
    'dojo/_base/lang'
    ],
    function(
        declare, 
        array, 
        string, 
        AbstractIdentify, 
        topic, 
        Popup, 
        IdentifyParameters,
        lang
        ){

        return declare([AbstractIdentify], {

            //called after parent class constructor
            constructor: function() {
                logger.debug('inside constructor for app/Identify');

                //configure for specific viewer
                arguments[0].layerIds = ['Scenarios', 'Hazards'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

                //formatter specific to each sublayer, keyed by Layer/sublayer name.
                this.formatters = {
                    'Hazards/Tsunami Events [green squares]': lang.hitch(this, this.tsEventFormatter),                    
                    'Hazards/Tsunami Events by Cause/Fatalities': lang.hitch(this, this.tsEventFormatter),
                    'Hazards/Tide Gauge/Deep Ocean Gauge Tsunami Observations': lang.hitch(this, this.tsObsFormatter),
                    'Hazards/Eyewitness Tsunami Observations/Post-Tsunami Surveys': lang.hitch(this, this.tsObsFormatter),
                    'Hazards/Tsunami Observations [by measurement type]': lang.hitch(this, this.tsObsFormatter),
                    'Hazards/Significant Earthquakes': lang.hitch(this, this.signifEqFormatter),
                    'Hazards/Significant Volcanic Eruptions': lang.hitch(this, this.volEventFormatter),
                    'Hazards/Volcano Locations [from Smithsonian]': lang.hitch(this, this.volcanoFormatter),
                    'Hazards/Current DART Deployments': lang.hitch(this, this.dartFormatter),
                    'Hazards/Retrospective BPR Deployments': lang.hitch(this, this.retrospectiveBprFormatter),
                    'Hazards/Tsunami Capable Tide Stations': lang.hitch(this, this.tideGaugeFormatter),
                    'Hazards/Plate Boundaries [from UTIG]': lang.hitch(this, this.plateBoundariesFormatter),
                    'Scenarios/CARIBE-EWS Scenarios': lang.hitch(this, this.scenarioFormatter)
                };
            }, //end constructor

            //Override base class function to set the identify click tolerance to a higher value.
            createIdentifyParams: function(layer) {
                logger.debug('inside createIdentifyParams...');

                var identifyParams = new IdentifyParameters();
                identifyParams.tolerance = 5;
                identifyParams.returnGeometry = false;
                identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;
                identifyParams.width  = this._map.width;
                identifyParams.height = this._map.height;
                identifyParams.mapExtent = this._map.extent;

                //initialize these based on current layer settings
                identifyParams.layerIds = layer.visibleLayers;
                identifyParams.layerDefinitions = layer.layerDefinitions;
                return(identifyParams);
            },

            scenarioFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = 
                    '<h3>Tsunami Scenario</h3>' +
                    '<div class="valueName">Name: <span class="parameterValue">${name}</span></div>' +
                    '<div class="valueName">Basin: <span class="parameterValue">${basin}</span></div>' +
                    '<div class="valueName">Region: <span class="parameterValue">${region}</span></div>' +
                    '<div class="valueName">Depth (km): <span class="parameterValue">${depth}</span></div>' +
                    '<div class="valueName">Strike (deg): <span class="parameterValue">${strike}</span></div>' +
                    '<div class="valueName">Dip (deg): <span class="parameterValue">${dip}</span></div>' +
                    '<div class="valueName">Rake (deg): <span class="parameterValue">${rake}</span></div>' +
                    '<div class="valueName">Length (km): <span class="parameterValue">${length}</span></div>' +
                    '<div class="valueName">Width (km): <span class="parameterValue">${width}</span></div>' +
                    '<div class="valueName">Slip (m): <span class="parameterValue">${slip}</span></div>' +
                    '<div class="valueName">Mw: <span class="parameterValue">${mw}</span></div>' +
                    '<div class="valueName">Generated at Experts Meeting: <span class="parameterValue">${meeting}</span></div>' +
                    '<div class="valueName">Related Historical Events: <span class="parameterValue">${historical}</span></div>' +
                    '<div class="valueName">Used in Exercise: <span class="parameterValue">${exercise}</span></div>' +
                    '<div class="valueName">Shear Modulus (GPa): <span class="parameterValue">${shearModulus}</span></div>' +
                    '<div class="valueName">Model Employed: <span class="parameterValue">${modelEmployed}</span></div>' +
                    '<div class="valueName">Longitude (E): <span class="parameterValue">${lon}</span></div>' +
                    '<div class="valueName">Latitude (N): <span class="parameterValue">${lat}</span></div>' +
                    '<div class="valueName">Reference: <span class="parameterValue">${reference}</span></div>';

                var html = string.substitute(template, {                
                    name: a['Name'],
                    basin: a['Basin'],
                    region: a['Region'],
                    depth: a['Depth (km)'],
                    strike: a['Strike (deg)'],
                    dip: a['Dip (deg)'],
                    rake: a['Rake (deg)'],
                    length: a['Length (km)'],
                    width: a['Width (km)'],
                    slip: a['Slip (m)'],
                    mw: a['Mw'],
                    meeting: a['Generated at Experts Meeting'],
                    historical: a['Related Historical Events'],
                    exercise: a['Used in Exercise'],
                    shearModulus: a['Shear Modulus (GPa)'],
                    modelEmployed: a['Model Employed'],
                    lon: a['Longitude (E)'],
                    lat: a['Latitude (N)'],
                    reference: a['Reference']
                });                
                return html;
            },


            tsEventFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);
                /*'ID','Date String','Latitude','Longitude','Location Name','Area','Country','Cause','Event Validity','Earthquake Magnitude',
                        'Earthquake Depth','Max Event Runup','Tsunami Intensity','Comments','Damage in millions of dollars','Damage Description','Houses Destroyed','Houses Destroyed Description',
                        'Deaths','Deaths Description','Injuries','Injuries Description','Missing','Missing Description','Number of Observations'],*/
                var html = string.substitute(
                    '<i><b>Tsunami Event</b></i><br>' +
                    '<table class="idTable">' +
                        '<tr colspan="2">' +
                            '<td><a href="http://www.ngdc.noaa.gov/nndc/struts/results?EQ_0=${ID}&t=101650&s=9&d=99,91,95,93&nd=display" target="_blank">Additional Info</a>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Date (yyyy/mm/dd):</b></td>' +
                            '<td>${dateString}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Location Name:</b></td>' +
                            '<td>${locationName}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Latitude/Longitude</b></td>' +
                            '<td>${latitude}, ${longitude}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Country:</b></td>' +
                            '<td>${country}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Area:</b></td>' +
                            '<td>${area}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Cause:</b></td>' +
                            '<td>${cause}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Event Validity:</b></td>' +
                            '<td>${eventValidity}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Earthquake Magnitude:</b></td>' +
                            '<td>${eqMagnitude}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Earthquake Depth:</b></td>' +
                            '<td>${eqDepth}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Max Event Runup (m):</b></td>' +
                            '<td>${maxEventRunup}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Tsunami Intensity:</b></td>' +
                            '<td>${tsunamiIntensity}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Comments:</b></td>' +
                            '<td>${comments}</td>' +
                        '</tr>' +
                         '<tr class="idTr">' +
                            '<td><b>Deaths:</b></td>' +
                            '<td>${deaths}</td>' +
                        '</tr>' +
                         '<tr class="idTr">' +
                            '<td><b>Deaths Description:</b></td>' +
                            '<td>${deathsDescription}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Damage in millions of dollars:</b></td>' +
                            '<td>${damage}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Damage Description:</b></td>' +
                            '<td>${damageDescription}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Houses Destroyed:</b></td>' +
                            '<td>${housesDestroyed}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Houses Destroyed Description:</b></td>' +
                            '<td>${housesDestroyedDescription}</td>' +
                        '</tr>' +
                         '<tr class="idTr">' +
                            '<td><b>Injuries:</b></td>' +
                            '<td>${injuries}</td>' +
                        '</tr>' +
                         '<tr class="idTr">' +
                            '<td><b>Injuries Description:</b></td>' +
                            '<td>${injuriesDescription}</td>' +
                        '</tr>' +
                         '<tr class="idTr">' +
                            '<td><b>Missing:</b></td>' +
                            '<td>${missing}</td>' +
                        '</tr>' +
                         '<tr class="idTr">' +
                            '<td><b>Missing Description:</b></td>' +
                            '<td>${missingDescription}</td>' +
                        '</tr>' +
                         '<tr class="idTr">' +
                            '<td><b>Number of Observations:</b></td>' +
                            '<td>${numObs}</td>' +
                        '</tr>' +
                    '</table>', { 
                        ID: a['ID'],
                        dateString: a['Date String'],                         
                        locationName: a['Location Name'],
                        latitude: a['Latitude'],
                        longitude: a['Longitude'],
                        area: a['Area'],
                        country: a['Country'],
                        cause: a['Cause'],
                        eventValidity: a['Event Validity'],
                        eqMagnitude: a['Earthquake Magnitude'],
                        eqDepth: a['Earthquake Depth'],
                        maxEventRunup: a['Max Event Runup'],
                        tsunamiIntensity: a['Tsunami Intensity'],
                        comments: a['Comments'],
                        damage: a['Damage in millions of dollars'],
                        damageDescription: a['Damage Description'],
                        housesDestroyed: a['Houses Destroyed'],
                        housesDestroyedDescription: a['Houses Destroyed Description'],
                        deaths: a['Deaths'],
                        deathsDescription: a['Deaths Description'],
                        injuries: a['Injuries'],
                        injuriesDescription: a['Injuries Description'],
                        missing: a['Missing'],
                        missingDescription: a['Missing Description'],
                        numObs: a['Number of Observations']
                    });                
                return html;
            },

            tsObsFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);
                /*'ID','Location Name','Country','Area','Water Height','Type of Measurement','Date String','Arrival Day','Arrival Hour','Arrival Minute','Travel Time Hours','Travel Time Minutes',
                        'Period','First Motion','Latitude','Longitude','Inundation Distance','Comments','Damage in Millions of Dollars','Damage Description','Deaths','Deaths Description',
                        'Injuries','Injuries Description','Houses Destroyed','Houses Destroyed Description','Distance From Source','Doubtful'],*/
                var html = string.substitute(
                    '<i><b>Tsunami Observation</b></i><br>' +
                    '<table class="idTable">' +
                        '<tr colspan="2">' +
                            '<td><a href="http://www.ngdc.noaa.gov/nndc/struts/results?EQ_0=${ID}&t=101650&s=10&d=99,185,186,76,78&nd=display" target="_blank">Additional Info</a>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Location Name:</b></td>' +
                            '<td>${locationName}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Country:</b></td>' +
                            '<td>${country}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Area:</b></td>' +
                            '<td>${area}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Water Height (m):</b></td>' +
                            '<td>${waterHeight}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Type of Measurement:</b></td>' +
                            '<td>${typeOfMeasurement}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Date (yyyy/mm/dd):</b></td>' +
                            '<td>${dateString}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Arrival Day:</b></td>' +
                            '<td>${arrivalDay}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Arrival Hour:</b></td>' +
                            '<td>${arrivalHour}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Arrival Minute:</b></td>' +
                            '<td>${arrivalMinute}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Travel Time Hours:</b></td>' +
                            '<td>${travelTimeHours}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Travel Time Minutes:</b></td>' +
                            '<td>${travelTimeMinutes}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Period:</b></td>' +
                            '<td>${period}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>First Motion:</b></td>' +
                            '<td>${firstMotion}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Latitude/Longitude</b></td>' +
                            '<td>${latitude}, ${longitude}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Inundation Distance (m):</b></td>' +
                            '<td>${inundationDistance}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Comments:</b></td>' +
                            '<td>${comments}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Damage in Millions of Dollars:</b></td>' +
                            '<td>${damage}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Damage Description:</b></td>' +
                            '<td>${damageDescription}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Deaths:</b></td>' +
                            '<td>${deaths}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Deaths Description:</b></td>' +
                            '<td>${deathsDescription}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Injuries:</b></td>' +
                            '<td>${injuries}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Injuries Description:</b></td>' +
                            '<td>${injuriesDescription}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Houses Destroyed:</b></td>' +
                            '<td>${housesDestroyed}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Houses Destroyed Description:</b></td>' +
                            '<td>${housesDestroyedDescription}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Distance from Source (km):</b></td>' +
                            '<td>${distanceFromSource}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Doubtful:</b></td>' +
                            '<td>${doubtful}</td>' +
                        '</tr>' +
                    '</table>', {
                        ID: a['ID'],                       
                        locationName: a['Location Name'],
                        country: a['Country'],
                        area: a['Area'],
                        waterHeight: a['Water Height'],
                        typeOfMeasurement: a['Type of Measurement'],
                        dateString: a['Date String'],
                        arrivalDay: a['Arrival Day'],
                        arrivalHour: a['Arrival Hour'],
                        arrivalMinute: a['Arrival Minute'],
                        travelTimeHours: a['Travel Time Hours'],
                        travelTimeMinutes: a['Travel Time Minutes'],
                        period: a['Period'],
                        firstMotion: a['First Motion'],
                        latitude: a['Latitude'],
                        longitude: a['Longitude'],
                        inundationDistance: a['Inundation Distance'],
                        comments: a['Comments'],
                        damage: a['Damage in Millions of Dollars'],
                        damageDescription: a['Damage Description'],
                        deaths: a['Deaths'],
                        deathsDescription: a['Deaths Description'],
                        injuries: a['Injuries'],
                        injuriesDescription: a['Injuries Description'],
                        housesDestroyed: a['Houses Destroyed'],
                        housesDestroyedDescription: a['Houses Destroyed Description'],
                        distanceFromSource: a['Distance From Source'],
                        doubtful: a['Doubtful']
                    });                
                return html;
            },

            signifEqFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);
                /*'ID','Date String','Latitude','Longitude','Location Name','Area','Country','Region','Earthquake Depth','Earthquake Magnitude','Intensity','Comments',
                         'Damage in Millions of Dollars','Damage Description','Deaths','Deaths Description','Injuries','Injuries Description','Missing','Missing Description',
                         'Houses Destroyed','Houses Destroyed Description','Houses Damaged','Houses Damaged Description','Tsunami Associated?','Volcano Event Associated?'*/
                var html = string.substitute(
                    '<i><b>Significant Earthquake</b></i><br>' +
                    '<table class="idTable">' +
                        '<tr colspan="2">' +
                            '<td><a href="http://www.ngdc.noaa.gov/nndc/struts/results?EQ_0=${ID}&t=101650&s=13&d=22,26,13,12&nd=display" target="_blank">Additional Info</a>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Date (yyyy/mm/dd):</b></td>' +
                            '<td>${dateString}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Location Name:</b></td>' +
                            '<td>${locationName}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Country:</b></td>' +
                            '<td>${country}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Area:</b></td>' +
                            '<td>${area}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Region:</b></td>' +
                            '<td>${region}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Latitude/Longitude</b></td>' +
                            '<td>${latitude}, ${longitude}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Earthquake Depth (km):</b></td>' +
                            '<td>${eqDepth}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Earthquake Magnitude:</b></td>' +
                            '<td>${eqMagnitude}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Intensity:</b></td>' +
                            '<td>${intensity}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Comments:</b></td>' +
                            '<td>${comments}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Damage in Millions of Dollars:</b></td>' +
                            '<td>${damage}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Damage Description:</b></td>' +
                            '<td>${damageDescription}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Deaths:</b></td>' +
                            '<td>${deaths}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Deaths Description:</b></td>' +
                            '<td>${deathsDescription}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Injuries:</b></td>' +
                            '<td>${injuries}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Injuries Description:</b></td>' +
                            '<td>${injuriesDescription}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Missing:</b></td>' +
                            '<td>${missing}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Missing Description:</b></td>' +
                            '<td>${missingDescription}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Houses Destroyed:</b></td>' +
                            '<td>${housesDestroyed}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Houses Destroyed Description:</b></td>' +
                            '<td>${housesDestroyedDescription}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Houses Damaged:</b></td>' +
                            '<td>${housesDamaged}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Houses Damaged Description:</b></td>' +
                            '<td>${housesDamagedDescription}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Tsunami Associated?:</b></td>' +
                            '<td>${tsunamiAssoc}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Volcano Event Associated?:</b></td>' +
                            '<td>${volEventAssoc}</td>' +
                        '</tr>' +
                    '</table>', {
                        ID: a['ID'],
                        dateString: a['Date String'],
                        latitude: a['Latitude'],
                        longitude: a['Longitude'],
                        locationName: a['Location Name'],
                        area: a['Area'],
                        country: a['Country'],
                        region: a['Region'],
                        eqDepth: a['Earthquake Depth'],
                        eqMagnitude: a['Earthquake Magnitude'],
                        intensity: a['Intensity'],
                        comments: a['Comments'],
                        damage: a['Damage in Millions of Dollars'],
                        damageDescription: a['Damage Description'],
                        deaths: a['Deaths'],
                        deathsDescription: a['Deaths Description'],
                        injuries: a['Injuries'],
                        injuriesDescription: a['Injuries Description'],
                        missing: a['Missing'],
                        missingDescription: a['Missing Description'],
                        housesDestroyed: a['Houses Destroyed'],
                        housesDestroyedDescription: a['Houses Destroyed Description'],
                        housesDamaged: a['Houses Damaged'],
                        housesDamagedDescription: a['Houses Damaged Description'],
                        tsunamiAssoc: a['Tsunami Associated?'],
                        volEventAssoc: a['Volcano Event Associated?']
                    });                
                return html;
            },

            volEventFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);
                /*'Event ID','Name','Year','Month','Day','Location','Country','Latitude','Longitude','VEI','Comments','Damage in Millions of Dollars',
                'Damage Description', 'Deaths','Deaths Description','Injuries','Injuries Description','Missing','Missing Description','Houses Destroyed','Houses Destroyed Description'*/
                var html = string.substitute(
                    '<i><b>Significant Volcanic Eruption</b></i><br>' +
                    '<table class="idTable">' +
                        '<tr colspan="2">' +
                            '<td><a href="http://www.ngdc.noaa.gov/nndc/struts/results?EQ_0=${ID}&t=102557&s=1&d=140,145,175,180&nd=display" target="_blank">Additional Info</a>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Name:</b></td>' +
                            '<td>${name}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Year:</b></td>' +
                            '<td>${year}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Month:</b></td>' +
                            '<td>${month}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Day:</b></td>' +
                            '<td>${day}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Location:</b></td>' +
                            '<td>${location}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Country:</b></td>' +
                            '<td>${country}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Latitude/Longitude</b></td>' +
                            '<td>${latitude}, ${longitude}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>VEI:</b></td>' +
                            '<td>${vei}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Comments:</b></td>' +
                            '<td>${comments}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Damage in Millions of Dollars:</b></td>' +
                            '<td>${damage}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Damage Description:</b></td>' +
                            '<td>${damageDescription}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Deaths:</b></td>' +
                            '<td>${deaths}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Deaths Description:</b></td>' +
                            '<td>${deathsDescription}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Injuries:</b></td>' +
                            '<td>${injuries}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Injuries Description:</b></td>' +
                            '<td>${injuriesDescription}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Missing:</b></td>' +
                            '<td>${missing}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Missing Description:</b></td>' +
                            '<td>${missingDescription}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Houses Destroyed:</b></td>' +
                            '<td>${housesDestroyed}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Houses Destroyed Description:</b></td>' +
                            '<td>${housesDestroyedDescription}</td>' +
                        '</tr>' +
                    '</table>', {
                        ID: a['HAZ_EVENT_ID'],
                        name: a['NAME'],
                        year: a['YEAR'],
                        month: a['MO'],
                        day: a['DAY'],
                        location: a['LOCATION'],
                        country: a['COUNTRY'],
                        latitude: a['LATITUDE'],
                        longitude: a['LONGITUDE'],
                        vei: a['VEI'],
                        comments: a['COMMENTS'],
                        damage: a['DAMAGE_MILLIONS_DOLLARS'],
                        damageDescription: a['DAMAGE_DESCRIPTION'],
                        deaths: a['DEATHS'],
                        deathsDescription: a['DEATHS_DESCRIPTION'],
                        injuries: a['INJURIES'],
                        injuriesDescription: a['INJURIES_DESCRIPTION'],
                        missing: a['MISSING'],
                        missingDescription: a['MISSING_DESCRIPTION'],
                        housesDestroyed: a['HOUSES_DESTROYED'],
                        housesDestroyedDescription: a['HOUSES_DESCRIPTION']
                    });                
                return html;
            },

            volcanoFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);
                var html = string.substitute(
                    '<i><b>Volcano</b></i><br>' +
                    '<table class="idTable">' +
                        '<tr colspan="2">' +
                            '<td><a href="http://www.ngdc.noaa.gov/nndc/struts/results?type_0=Like&op_8=eq&v_8=&type_10=EXACT&query_10=None+Selected&le_2=&ge_3=&le_3=&ge_2=&op_5=eq&v_5=&op_6=eq&v_6=&op_7=eq&v_7=&t=102557&s=5&d=5&query_0=${name}" target="_blank">Additional Info</a>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Name:</b></td>' +
                            '<td>${name}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Location:</b></td>' +
                            '<td>${location}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Latitude/Longitude</b></td>' +
                            '<td>${latitude}, ${longitude}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Country:</b></td>' +
                            '<td>${country}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Elevation:</b></td>' +
                            '<td>${elevation}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Morphology:</b></td>' +
                            '<td>${morphology}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Status:</b></td>' +
                            '<td>${status}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Time of Last Eruption:</b></td>' +
                            '<td>${timeOfLastEruption}</td>' +
                        '</tr>' +
                    '</table>', {
                        name: a['Name'],
                        location: a['Location'],
                        latitude: a['Latitude'],
                        longitude: a['Longitude'],
                        country: a['Country'],
                        elevation: a['Elevation'],
                        morphology: a['Morphology'],
                        status: a['Status'],
                        timeOfLastEruption: a['Time of Last Eruption']
                    });                
                return html;
            },

            dartFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);
                var html = string.substitute(
                    '<i><b>Current DART® Deployment</b></i><br>' +
                    '<table class="idTable">' +
                        '<tr colspan="2">' +
                            '<td><a href="${dataUrl}" target="_blank">Additional Info</a>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Deployment ID:</b></td>' +
                            '<td>${deploymentId}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Description:</b></td>' +
                            '<td>${description}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Latitude/Longitude</b></td>' +
                            '<td>${latitude}, ${longitude}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Depth (m):</b></td>' +
                            '<td>${depth}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Deployment Date:</b></td>' +
                            '<td>${deploymentDate}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Type:</b></td>' +
                            '<td>${type}</td>' +
                        '</tr>' +
                    '</table>', {
                        deploymentId: a['Deployment ID'],
                        description: a['Description'],
                        latitude: a['Latitude'],
                        longitude: a['Longitude'],
                        depth: a['Depth'],
                        deploymentDate: a['Deployment Date'],
                        type: a['Type'],
                        dataUrl: a['Data URL']
                    });                
                return html;
            },

            retrospectiveBprFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);
                var html = string.substitute(
                    '<i><b>Retrospective BPR Deployment</b></i><br>' +
                    '<table class="idTable">' +
                        '<tr colspan="2">' +
                            '<td><a href="${metadataUrl}" target="_blank">Metadata Link</a>' +
                        '</tr>' +
                        '<tr colspan="2">' +
                            '<td><a href="${dataUrl}" target="_blank">Data URL</a>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Deployment ID:</b></td>' +
                            '<td>${deploymentId}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Latitude/Longitude</b></td>' +
                            '<td>${latitude}, ${longitude}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Depth (m):</b></td>' +
                            '<td>${depth}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Deployment Date:</b></td>' +
                            '<td>${deploymentDate}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Recovery Date:</b></td>' +
                            '<td>${recoveryDate}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Data Start Date:</b></td>' +
                            '<td>${dataStartDate}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Data End Date:</b></td>' +
                            '<td>${dataEndDate}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Sample Rate (minutes):</b></td>' +
                            '<td>${sampleRate}</td>' +
                        '</tr>' +
                    '</table>', {
                        deploymentId: a['Deployment ID'],
                        dataUrl: a['Data URL'],
                        latitude: a['Latitude'],
                        longitude: a['Longitude'],
                        depth: a['Depth'],
                        deploymentDate: a['Deployment Date'],
                        recoveryDate: a['Recovery Date'],
                        dataStartDate: this.formatIsoDate(a['Data Start Date']),
                        dataEndDate: this.formatIsoDate(a['Data End Date']),
                        sampleRate: a['Sample Rate'],
                        metadataUrl: a['Metadata URL']
                    });                
                return html;
            },

            tideGaugeFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);

                var template = 
                    '<i><b>Tsunami Capable Tide Station</b></i><br>' +
                    '<table class="idTable">';

                if (a['URL (Real-Time)'] !== '') {
                    template += 
                        '<tr colspan="2">' +
                        '<td><a href="${realTimeUrl}" target="_blank">Real-Time Data</a>' +
                        '</tr>';
                }
                if (a['URL (Retrospective)'] !== '') {
                    template += 
                        '<tr colspan="2">' +
                        '<td><a href="${retrospectiveUrl}" target="_blank">Retrospective Data</a>' +
                        '</tr>';
                }
                        
                template +=        
                    '<tr class="idTr">' +
                        '<td><b>Station:</b></td>' +
                        '<td>${nosId}</td>' +
                    '</tr>' +
                    '<tr class="idTr">' +
                        '<td><b>Station Name:</b></td>' +
                        '<td>${stationName}</td>' +
                    '</tr>' +
                    '<tr class="idTr">' +
                        '<td><b>Organization:</b></td>' +
                        '<td>${organization}</td>' +
                    '</tr>' +
                    '<tr class="idTr">' +
                        '<td><b>State:</b></td>' +
                        '<td>${state}</td>' +
                    '</tr>' +
                    '<tr class="idTr">' +
                        '<td><b>Latitude/Longitude</b></td>' +
                        '<td>${latitude}, ${longitude}</td>' +
                    '</tr>' +
                    '</table>';

                var html = string.substitute(template, {
                    nosId: a['ID'],
                    stationName: a['Name'],
                    state: a['State'],
                    latitude: a['Latitude'],
                    longitude: a['Longitude'],
                    realTimeUrl: a['URL (Real-Time)'],
                    retrospectiveUrl: a['URL (Retrospective)'],
                    organization: a['Organization']
                });    
                return html;
            },

            plateBoundariesFormatter: function(feature) {
                var a = this.replaceNullAttributesWithEmptyString(feature.attributes);
                var html = string.substitute(
                    '<i><b>Plate Boundary</b></i><br>' +
                    '<table class="idTable">' +
                        '<tr class="idTr">' +
                            '<td><b>Description:</b></td>' +
                            '<td>${description}</td>' +
                        '</tr>' +
                        '<tr class="idTr">' +
                            '<td><b>Type:</b></td>' +
                            '<td>${type}</td>' +
                        '</tr>' +
                    '</table>', {
                        description: a['Description'],
                        type: a['Type']                        
                    });                
                return html;
            },

            tsEventSort: function(a, b) {
                if (parseInt(a.feature.attributes['Year']) === parseInt(b.feature.attributes['Year'])) {
                    if (parseInt(a.feature.attributes['Month']) === parseInt(b.feature.attributes['Month'])) {
                        if (parseInt(a.feature.attributes['Day']) === parseInt(b.feature.attributes['Day'])) {
                            if (parseInt(a.feature.attributes['Hour']) === parseInt(b.feature.attributes['Hour'])) {
                                if (parseInt(a.feature.attributes['Minute']) === parseInt(b.feature.attributes['Minute'])) {
                                    if (parseFloat(a.feature.attributes['Second']) === parseFloat(b.feature.attributes['Second'])) {
                                        return a.feature.attributes['Location Name'] > b.feature.attributes['Location Name'] ? 1 : -1;
                                    }
                                    return parseFloat(a.feature.attributes['Second']) < parseFloat(b.feature.attributes['Second']) ? 1 : -1;
                                }
                                return parseInt(a.feature.attributes['Minute']) < parseInt(b.feature.attributes['Minute']) ? 1 : -1;
                            }
                            return parseInt(a.feature.attributes['Hour']) < parseInt(b.feature.attributes['Hour']) ? 1 : -1;
                        }
                        return parseInt(a.feature.attributes['Day']) < parseInt(b.feature.attributes['Day']) ? 1 : -1;
                    }
                    return parseInt(a.feature.attributes['Month']) < parseInt(b.feature.attributes['Month']) ? 1 : -1;
                }
                return parseInt(a.feature.attributes['Year']) < parseInt(b.feature.attributes['Year']) ? 1 : -1;                
            },

            tsRunupSort: function(a, b) {
                if (parseInt(a.feature.attributes['Year']) === parseInt(b.feature.attributes['Year'])) {
                    if (parseInt(a.feature.attributes['Month']) === parseInt(b.feature.attributes['Month'])) {
                        if (parseInt(a.feature.attributes['Day']) === parseInt(b.feature.attributes['Day'])) {
                            return a.feature.attributes['Location Name'] > b.feature.attributes['Location Name'] ? 1 : -1;   
                        }
                        return parseInt(a.feature.attributes['Day']) < parseInt(b.feature.attributes['Day']) ? 1 : -1;
                    }
                    return parseInt(a.feature.attributes['Month']) < parseInt(b.feature.attributes['Month']) ? 1 : -1;
                }
                return parseInt(a.feature.attributes['Year']) < parseInt(b.feature.attributes['Year']) ? 1 : -1;                
            },

            signifEqSort: function(a, b) {
                if (parseInt(a.feature.attributes['Year']) === parseInt(b.feature.attributes['Year'])) {
                    if (parseInt(a.feature.attributes['Month']) === parseInt(b.feature.attributes['Month'])) {
                        if (parseInt(a.feature.attributes['Day']) === parseInt(b.feature.attributes['Day'])) {
                            return a.feature.attributes['Location Name'] > b.feature.attributes['Location Name'] ? 1 : -1;   
                        }
                        return parseInt(a.feature.attributes['Day']) < parseInt(b.feature.attributes['Day']) ? 1 : -1;
                    }
                    return parseInt(a.feature.attributes['Month']) < parseInt(b.feature.attributes['Month']) ? 1 : -1;
                }
                return parseInt(a.feature.attributes['Year']) < parseInt(b.feature.attributes['Year']) ? 1 : -1;                
            },

            volEventSort: function(a, b) {
                if (parseInt(a.feature.attributes['YEAR']) === parseInt(b.feature.attributes['YEAR'])) {
                    if (parseInt(a.feature.attributes['MO']) === parseInt(b.feature.attributes['MO'])) {
                        if (parseInt(a.feature.attributes['DAY']) === parseInt(b.feature.attributes['DAY'])) {
                            return a.feature.attributes['LOCATION'] > b.feature.attributes['LOCATION'] ? 1 : -1;   
                        }
                        return parseInt(a.feature.attributes['DAY']) < parseInt(b.feature.attributes['DAY']) ? 1 : -1;
                    }
                    return parseInt(a.feature.attributes['MO']) < parseInt(b.feature.attributes['MO']) ? 1 : -1;
                }
                return parseInt(a.feature.attributes['YEAR']) < parseInt(b.feature.attributes['YEAR']) ? 1 : -1;                
            },

            volLocSort: function(a, b) {
                return a.feature.attributes['Name'] > b.feature.attributes['Name'] ? 1 : -1;
            },

            dartSort: function(a, b) {
                return a.feature.attributes['Deployment ID'] > b.feature.attributes['Deployment ID'] ? 1 : -1;
            },

            retrospectiveBprSort: function(a, b) {
                var stationPrefixA = a.feature.attributes['Deployment ID'].split('_')[0];
                var stationPrefixB = b.feature.attributes['Deployment ID'].split('_')[0];
                if (stationPrefixA === stationPrefixB) {
                    var dateA = new Date(a.feature.attributes['Data Start Date']);
                    var dateB = new Date(b.feature.attributes['Data Start Date']);
                    return dateA < dateB ? 1 : -1;
                }
                return stationPrefixA > stationPrefixB ? 1 : -1;
            },

            tideGaugeSort: function(a, b) {
                return a.feature.attributes['ID'] > b.feature.attributes['ID'] ? 1 : -1;
            },

            sortResults: function(results) {
                var features;
                if (results['Hazards']) {    
                    if ((features = results['Hazards']['Tsunami Events [green squares]'])) {
                        features.sort(this.tsEventSort);
                    }   
                    if ((features = results['Hazards']['Tsunami Events by Cause/Fatalities'])) {
                        features.sort(this.tsEventSort);
                    }
                    if ((features = results['Hazards']['Tide Gauge/Deep Ocean Gauge Tsunami Observations'])) {
                        features.sort(this.tsEventSort);
                    }
                    if ((features = results['Hazards']['Eyewitness Tsunami Observations/Post-Tsunami Surveys'])) {
                        features.sort(this.tsEventSort);
                    }
                    if ((features = results['Hazards']['Tsunami Observations [by measurement type]'])) {
                        features.sort(this.tsEventSort);
                    }
                    if ((features = results['Hazards']['Significant Earthquakes'])) {
                        features.sort(this.signifEqSort);
                    }
                    if ((features = results['Hazards']['Significant Volcanic Eruptions'])) {
                        features.sort(this.volEventSort);
                    }
                    if ((features = results['Hazards']['Volcano Locations [from Smithsonian]'])) {
                        features.sort(this.volLocSort);
                    }
                    if ((features = results['Hazards']['Current DART Deployments'])) {
                        features.sort(this.dartSort);
                    }
                    if ((features = results['Hazards']['Retrospective BPR Deployments'])) {
                        features.sort(this.retrospectiveBprSort);
                    }
                    if ((features = results['Hazards']['Tsunami Capable Tide Stations'])) {
                        features.sort(this.tideGaugeSort);
                    }
                }
            },

            formatIsoDate: function(dateString) {
                if (dateString) {
                    var date = new Date(dateString);
                    return date.toISOString();
                }
            }
        });
    }
);