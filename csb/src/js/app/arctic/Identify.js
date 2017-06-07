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
                logger.debug('inside constructor for app/arctic/Identify');

                //augment arguments object with list of layers to identify.
                arguments[0].layerIds = ['Multibeam', 'Trackline Bathymetry', 'NOS Hydrographic Surveys', 'DEM Extents', 'DEM Tiles', 'CSB'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

                //formatter specific to each sublayer, keyed by Layer/sublayer name.
                this.formatters = {
                    'Multibeam/Multibeam Bathymetric Surveys': lang.hitch(this, this.multibeamFormatter),
                    'Trackline Bathymetry/Marine Trackline Surveys: Bathymetry': lang.hitch(this, this.tracklineFormatter),
                    'NOS Hydrographic Surveys/Surveys with BAGs': lang.hitch(this, this.nosHydroFormatter),
                    'NOS Hydrographic Surveys/Surveys with Digital Sounding Data': lang.hitch(this, this.nosHydroFormatter),
                    'NOS Hydrographic Surveys/Surveys without Digital Sounding Data': lang.hitch(this, this.nosHydroFormatter),
                    'DEM Extents/All NCEI Bathymetric DEMs': lang.hitch(this, this.demFormatter),
                    'DEM Tiles/DEM Tiles': lang.hitch(this, this.demTileFormatter),
                    'CSB/CSB': lang.hitch(this, this.csbFormatter)
                };
            } //end constructor
        });
    }
);