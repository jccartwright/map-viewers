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
                arguments[0].layerIds = ['PAD'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

                //formatter specific to each sublayer, keyed by Layer/sublayer name.
                this.formatters = {
                    'PAD/Data Collections': lang.hitch(this, this.padFormatter)
                };
            } //end constructor
        });
    }
);