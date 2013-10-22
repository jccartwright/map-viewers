define(["dojo/_base/declare", "dojo/_base/array", "ngdc/AbstractIdentify"],
    function(declare, array, AbstractIdentify){

        return declare([AbstractIdentify], {

            //called after parent class constructor
            constructor: function() {
                logger.debug('inside constructor for app/Identify');

                //configure for specific viewer
                arguments[0].layerIds = ['USA', 'cities'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

            } //end constructor

        });
    }
);