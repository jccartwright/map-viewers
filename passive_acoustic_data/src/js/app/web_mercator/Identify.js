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
                arguments[0].layerIds = ['PAD', 'MPA Inventory'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

                //formatter specific to each sublayer, keyed by Layer/sublayer name.
                this.formatters = {
                    'PAD/NRS Data Collections': lang.hitch(this, this.padFormatter),
                    'PAD/ADEON Data Collections': lang.hitch(this, this.padFormatter),
                    'PAD/SanctSound Data Collections': lang.hitch(this, this.padFormatter),
                    'PAD/NMFS Data Collections': lang.hitch(this, this.padFormatter),
                    'PAD/NPS Data Collections': lang.hitch(this, this.padFormatter),
                    'MPA Inventory/Major Federal Marine Protected Areas': lang.hitch(this, this.mpaFormatter)
                };
            } //end constructor
        });
    }
);