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
                arguments[0].layerIds = ['Multibeam', 'Trackline Combined', 'NOS Hydrographic Surveys', 'NOS Hydro (non-digital)', 'DEM Extents', 'CRN', 'GHCND', 'GSOM', 'GSOY', 'ISD'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

                //formatter specific to each sublayer, keyed by Layer/sublayer name.
                this.formatters = {
                    'Multibeam/Multibeam Bathymetric Surveys': lang.hitch(this, this.multibeamFormatter),
                    'Trackline Bathymetry/Marine Trackline Surveys: Bathymetry': lang.hitch(this, this.tracklineFormatter),
                    'NOS Hydrographic Surveys/Surveys with BAGs': lang.hitch(this, this.nosHydroFormatter),
                    'NOS Hydrographic Surveys/Surveys with Digital Sounding Data': lang.hitch(this, this.nosHydroFormatter),
                    'NOS Hydro (non-digital)/Surveys without Digital Sounding Data': lang.hitch(this, this.nosHydroFormatter),
                    'DEM Extents/All NCEI Bathymetric DEMs': lang.hitch(this, this.demFormatter),
                    'CRN/Climate Reference Network': lang.hitch(this, this.crnFormatter),
                    'GHCND/GHCN Daily': lang.hitch(this, this.ghcndFormatter),
                    'GSOM/Global Surface Summary of the Month': lang.hitch(this, this.gsomFormatter),
                    'GSOY/Global Surface Summary of the Year': lang.hitch(this, this.gsoyFormatter),
                    'ISD/Hourly Global': lang.hitch(this, this.isdFormatter),
                };
            } //end constructor
        });
    }
);