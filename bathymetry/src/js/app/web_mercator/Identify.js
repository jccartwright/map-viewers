define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'app/Identify'],
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
                arguments[0].layerIds = ['Multibeam', 'Trackline Bathymetry', 'NOS Hydrographic Surveys', 'BAG Footprints', 'DEM Extents', 'OCM Lidar'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

                //formatter specific to each sublayer, keyed by Layer/sublayer name.
                this.formatters = {
                    'Multibeam/Multibeam Bathymetric Surveys': lang.hitch(this, this.multibeamFormatter),
                    'Trackline Bathymetry/Marine Trackline Surveys: Bathymetry': lang.hitch(this, this.tracklineFormatter),
                    'NOS Hydrographic Surveys/Surveys with BAGs': lang.hitch(this, this.nosHydroFormatter),
                    'NOS Hydrographic Surveys/Surveys with Digital Sounding Data': lang.hitch(this, this.nosHydroFormatter),
                    'NOS Hydrographic Surveys/Surveys without Digital Sounding Data': lang.hitch(this, this.nosHydroFormatter),
                    'BAG Footprints/BAG Footprints': lang.hitch(this, this.bagFootprintFormatter),
                    'DEM Extents/NCEI Digital Elevation Models': lang.hitch(this, this.demFormatter),
                    'OCM Lidar/Elevation >1:20M': lang.hitch(this, this.lidarFormatter),
                    'OCM Lidar/Elevation 1:12.5M - 1:20M': lang.hitch(this, this.lidarFormatter),
                    'OCM Lidar/Elevation 1:1.25M - 1:12.5M': lang.hitch(this, this.lidarFormatter),
                    'OCM Lidar/Elevation <1:1.25M scale': lang.hitch(this, this.lidarFormatter)
                };
            } //end constructor
        });
    }
);