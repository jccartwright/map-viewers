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
                logger.debug('inside constructor for app/arctic/Identify');

                //augment arguments object with list of layers to identify.
                arguments[0].layerIds = ['Sample Index'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

                //formatter specific to each sublayer, keyed by Layer/sublayer name.
                this.formatters = {
                    'Sample Index/All Samples by Institution': lang.hitch(this, this.sampleIndexFormatter)
                };
            } //end constructor
        });
    }
);