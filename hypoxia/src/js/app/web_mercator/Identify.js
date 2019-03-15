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
                arguments[0].layerIds = ['Hypoxia'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

                //formatter specific to each sublayer, keyed by Layer/sublayer name.
                this.formatters = {
                    'Hypoxia/Hypoxia Stations': lang.hitch(this, this.hypoxiaStationsFormatter),
                    'Hypoxia/Hypoxia Contours': lang.hitch(this, this.hypoxiaContoursFormatter),
                    'Hypoxia/Mean SST Day for June': lang.hitch(this, this.sstContoursFormatter),
                    'Hypoxia/Mean SST Night for June': lang.hitch(this, this.sstContoursFormatter),
                    'Hypoxia/Mean SST Combined for June': lang.hitch(this, this.sstContoursFormatter),
                    'Hypoxia/Mean SST Day for July': lang.hitch(this, this.sstContoursFormatter),
                    'Hypoxia/Mean SST Night for July': lang.hitch(this, this.sstContoursFormatter),
                    'Hypoxia/Mean SST Combined for July': lang.hitch(this, this.sstContoursFormatter),
                    'Hypoxia/Mean SST Day for August': lang.hitch(this, this.sstContoursFormatter),
                    'Hypoxia/Mean SST Night for August': lang.hitch(this, this.sstContoursFormatter),
                    'Hypoxia/Mean SST Combined for August': lang.hitch(this, this.sstContoursFormatter)
                };
            } //end constructor
        });
    }
);