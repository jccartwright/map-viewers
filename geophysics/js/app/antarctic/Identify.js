define([
    'dojo/_base/declare', 
    'dojo/_base/array', 
    'dojo/string', 
    'dojo/topic', 
    'dojo/_base/lang',
    'app/Identify'
    ],
    function(
        declare, 
        array, 
        string, 
        topic,
        lang,
        Identify 
        ){

        return declare([Identify], {

            //called after parent class constructor
            constructor: function() {
                logger.debug('inside constructor for app/antarctic/Identify');

                //augment arguments object with list of layers to identify.
                arguments[0].layerIds = ['(Antarctic) Trackline Combined'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

                //formatter specific to each sublayer, keyed by Layer/sublayer name.
                this.formatters = {
                    '(Antarctic) Trackline Combined/Marine Trackline Surveys: All Survey Types': lang.hitch(this, this.tracklineFormatter),
                    '(Antarctic) Trackline Combined/Marine Trackline Surveys: Bathymetry': lang.hitch(this, this.tracklineFormatter),
                    '(Antarctic) Trackline Combined/Marine Trackline Surveys: Gravity': lang.hitch(this, this.tracklineFormatter),
                    '(Antarctic) Trackline Combined/Marine Trackline Surveys: Magnetics': lang.hitch(this, this.tracklineFormatter),
                    '(Antarctic) Trackline Combined/Marine Trackline Surveys: Multi-Channel Seismics': lang.hitch(this, this.tracklineFormatter),
                    '(Antarctic) Trackline Combined/Marine Trackline Surveys: Seismic Refraction': lang.hitch(this, this.tracklineFormatter),
                    '(Antarctic) Trackline Combined/Marine Trackline Surveys: Shot-Point Navigation': lang.hitch(this, this.tracklineFormatter),
                    '(Antarctic) Trackline Combined/Marine Trackline Surveys: Side Scan Sonar': lang.hitch(this, this.tracklineFormatter),
                    '(Antarctic) Trackline Combined/Marine Trackline Surveys: Single-Channel Seismics': lang.hitch(this, this.tracklineFormatter),
                    '(Antarctic) Trackline Combined/Marine Trackline Surveys: Subbottom Profile': lang.hitch(this, this.tracklineFormatter),
                    '(Antarctic) Trackline Combined/Aeromagnetic Surveys': lang.hitch(this, this.aeromagFormatter),
                };
            } //end constructor
        });
    }
);