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
                arguments[0].layerIds = ['Marine Geology', 'Sample Index', 'NOS Seabed'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

                //formatter specific to each sublayer, keyed by Layer/sublayer name.
                this.formatters = {
                    'Marine Geology/Marine Geology Data Sets/Reports': lang.hitch(this, this.marineGeologyFormatter),
                    'Sample Index/All Samples by Institution': lang.hitch(this, this.sampleIndexFormatter),
                    'NOS Seabed/NOS Seabed Type': lang.hitch(this, this.nosSeabedFormatter)
                };
            } //end constructor
        });
    }
);