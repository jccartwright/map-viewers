define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'app/Identify'
    ],
    function(
        declare, 
        lang,
        Identify 
        ){

        return declare([Identify], {

            //called after parent class constructor
            constructor: function() {
                logger.debug('inside constructor for app/web_mercator/Identify');

                //augment arguments object with list of layers to identify.
                arguments[0].layerIds = [
                    'CSB',
                    'Multibeam', 
                    'Trackline Bathymetry',
                    'NOS Hydrographic Surveys',
                    'NRCan Multibeam',
                    'EMODnet Singlebeam Polygons',
                    'EMODnet Multibeam Polygons',
                    'EMODnet Singlebeam Lines',
                    'EMODnet Multibeam Lines',
                    'MAREANO Multibeam'
                ];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

                //formatter specific to each sublayer, keyed by Layer/sublayer name.
                this.formatters = {
                    'Multibeam/Multibeam Bathymetric Surveys': lang.hitch(this, this.multibeamFormatter),
                    'Trackline Bathymetry/Marine Trackline Surveys: Bathymetry': lang.hitch(this, this.tracklineFormatter),                    
                    'CSB/CSB': lang.hitch(this, this.csbFormatter),
                    'NRCan Multibeam/Multibeam Bathymetry Index Map - Bathymétrie Multifaisceaux Couches Index ': lang.hitch(this, this.nrCanFormatter),
                    'EMODnet Multibeam Polygons/default': lang.hitch(this, this.emodnetMultibeamFormatter),
                    'EMODnet Multibeam Lines/default': lang.hitch(this, this.emodnetMultibeamFormatter),
                    'EMODnet Singlebeam Polygons/default': lang.hitch(this, this.emodnetSinglebeamFormatter),
                    'EMODnet Singlebeam Lines/default': lang.hitch(this, this.emodnetSinglebeamFormatter),
                };
            } //end constructor
        });
    }
);