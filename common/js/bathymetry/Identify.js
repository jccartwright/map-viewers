define(["dojo/_base/declare", "dojo/_base/array", "ngdc/AbstractIdentify"],
    function(declare, array, AbstractIdentify){

        return declare([AbstractIdentify], {
            classname: 'bathymetry/Identify',

            //called after parent class constructor
            constructor: function() {
                logger.debug('inside constructor of '+this.classname);

                //configure for specific viewer
                arguments[0].layerIds = ['Multibeam (dynamic)'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

            } //end constructor

        });
    }
);