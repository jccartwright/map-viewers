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
                arguments[0].layerIds = [
                    'CSB',
                    'Multibeam', 
                    'Trackline Bathymetry', 
                    'DEM Extents'
                ];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

                //formatter specific to each sublayer, keyed by Layer/sublayer name.
                //formatter specific to each sublayer, keyed by Layer/sublayer name.
                this.formatters = {
                    'Multibeam/Multibeam Bathymetric Surveys': lang.hitch(this, this.multibeamFormatter),
                    'Trackline Bathymetry/Marine Trackline Surveys: Bathymetry': lang.hitch(this, this.tracklineFormatter),
                    'DEM Extents/NCEI Digital Elevation Models': lang.hitch(this, this.demFormatter),
                    'CSB/CSB': lang.hitch(this, this.csbFormatter)
                };
            } //end constructor
        });
    }
);