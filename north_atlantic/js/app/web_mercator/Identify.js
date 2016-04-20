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
                logger.debug('inside constructor for app/web_mercator/Identify');

                //augment arguments object with list of layers to identify.
                arguments[0].layerIds = [
                    'Multibeam',
                    'Trackline Bathymetry',
                    'NRCan Multibeam',
                    'Portugal',
                    'EMODNet Singlebeam Polygons',
                    'EMODNet Multibeam Polygons',
                    'EMODNet Singlebeam Lines',
                    'EMODNet Multibeam Lines'
                ];

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
                    'CSC Lidar/Lidar': lang.hitch(this, this.lidarFormatter),
                    'NRCan Multibeam/Multibeam Bathymetry Index Map - Bathymétrie Multifaisceaux Couches Index ': lang.hitch(this, this.nrCanFormatter),
                    'Portugal/Proprietary Bathymetric Surveys (Portugal)': lang.hitch(this, this.portugalFormatter)
                };
            } //end constructor
        });
    }
);