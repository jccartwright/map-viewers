define(["dojo/_base/declare", "dojo/_base/array", "../../ngdc/AbstractIdentify", "dojo/topic", "esri/dijit/Popup", "dojo/_base/lang"],
    function(declare, array, AbstractIdentify, topic, Popup, lang){

        return declare([AbstractIdentify], {

            //formatter specific to each sublayer, keyed by Layer/sublayer name.
            formatters: {
                'USA/Cities': function(feature) {
                    return ('<b>'+feature.attributes['AREANAME']+', '+feature.attributes['ST'] + '</b><br/>Population: ' + feature.attributes['POP2000']);
                },
                'USA/Highways': function(feature) {
                    return(feature.attributes['ROUTE']);
                },

                'cities/Cities': function(feature) {
                    return(feature.attributes['CITY_NAME']);
                }
            },

            //called after parent class constructor
            constructor: function() {
                logger.debug('inside constructor for app/identify/IdentifyPaneTest');

                //configure for specific viewer
                arguments[0].layerIds = ['USA', 'cities'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

                topic.subscribe("identifyPane/showInfo", lang.hitch(this, function(item) {
                    console.log('identifyPane/showInfo received ' + item);

                    var identifyPane = this._map.identifyPane;
                    if (identifyPane) {
                        var layerKey = item.layerKey;
                        identifyPane.setInfoPaneContent(this.formatters[layerKey](item));
                    }
                }));

            } //end constructor

        });
    }
);