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
                arguments[0].layerIds = ['Fish Maps'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

                //formatter specific to each sublayer, keyed by Layer/sublayer name.
                this.formatters = {
                    'Fish Maps/Fishing Maps': lang.hitch(this, this.fishmapsFormatter),
                    'Fish Maps/Topo/Bathy Maps': lang.hitch(this, this.fishmapsFormatter),
                    'Fish Maps/Bathymetry Maps': lang.hitch(this, this.fishmapsFormatter),
                    'Fish Maps/Preliminary Maps': lang.hitch(this, this.fishmapsFormatter)
                };
            } //end constructor
        });
    }
);