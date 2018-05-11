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
                arguments[0].layerIds = ['Multibeam', 'Trackline Combined', 'NOS Hydrographic Surveys', 
                    'DEM Extents', 'Sample Index', 'Marine Geology', 'Undersea Features', //'Magnetic Declination',
                    'CRN', 'GHCND', 'GSOM', 'GSOY', 'ISD', 'DSCRTP', 'AVHRR surface_albedo', 'AVHRR sea_ice_thickness', 'AVHRR cloud_binary_mask', 
                    'Sea Ice Index Daily Concentration', 'Sea Ice Index Monthly Concentration', 'NARR-A Monthly',
                    'Sea Water Temperature', 'Salinity'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

                //formatter specific to each sublayer, keyed by Layer/sublayer name.
                this.formatters = {
                    'Multibeam/Multibeam Bathymetric Surveys': lang.hitch(this, this.multibeamFormatter),
                    'Trackline Combined/Marine Trackline Surveys: Bathymetry': lang.hitch(this, this.tracklineFormatter),
                    'Trackline Combined/Marine Trackline Surveys: Gravity': lang.hitch(this, this.tracklineFormatter),
                    'Trackline Combined/Marine Trackline Surveys: Magnetics': lang.hitch(this, this.tracklineFormatter),
                    'Trackline Combined/Marine Trackline Surveys: Multi-Channel Seismics': lang.hitch(this, this.tracklineFormatter),
                    'Trackline Combined/Marine Trackline Surveys: Seismic Refraction': lang.hitch(this, this.tracklineFormatter),
                    'Trackline Combined/Marine Trackline Surveys: Shot-Point Navigation': lang.hitch(this, this.tracklineFormatter),
                    'Trackline Combined/Marine Trackline Surveys: Side Scan Sonar': lang.hitch(this, this.tracklineFormatter),
                    'Trackline Combined/Marine Trackline Surveys: Single-Channel Seismics': lang.hitch(this, this.tracklineFormatter),
                    'Trackline Combined/Marine Trackline Surveys: Subbottom Profile': lang.hitch(this, this.tracklineFormatter),
                    'Trackline Combined/Aeromagnetic Surveys': lang.hitch(this, this.aeromagFormatter),
                    'NOS Hydrographic Surveys/Surveys with BAGs': lang.hitch(this, this.nosHydroFormatter),
                    'NOS Hydrographic Surveys/Surveys with Digital Sounding Data': lang.hitch(this, this.nosHydroFormatter),
                    'NOS Hydro (non-digital)/Surveys without Digital Sounding Data': lang.hitch(this, this.nosHydroFormatter),
                    'DEM Extents/NCEI Digital Elevation Models': lang.hitch(this, this.demFormatter),
                    'Sample Index/All Samples by Institution': lang.hitch(this, this.sampleIndexFormatter),
                    'Marine Geology/Marine Geology Data Sets/Reports': lang.hitch(this, this.marineGeologyFormatter),
                    'Undersea Features/Point Features': lang.hitch(this, this.underseaFeaturesFormatter),
                    'Undersea Features/Line Features': lang.hitch(this, this.underseaFeaturesFormatter),
                    'Undersea Features/Polygon Features': lang.hitch(this, this.underseaFeaturesFormatter),
                    //'Magnetic Declination',
                    'CRN/Climate Reference Network': lang.hitch(this, this.crnFormatter),
                    'GHCND/GHCN Daily': lang.hitch(this, this.ghcndFormatter),
                    'GSOM/Global Surface Summary of the Month': lang.hitch(this, this.gsomFormatter),
                    'GSOY/Global Surface Summary of the Year': lang.hitch(this, this.gsoyFormatter),
                    'ISD/Hourly Global': lang.hitch(this, this.isdFormatter),
                    'DSCRTP/Locations': lang.hitch(this, this.deepSeaCoralFormatter)
                };
            } //end constructor
        });
    }
);