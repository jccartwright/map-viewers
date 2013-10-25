define(["dojo/_base/declare", "dojo/_base/array", "ngdc/AbstractIdentify", "dojo/topic", "esri/dijit/Popup", "dojo/_base/lang"],
    function(declare, array, AbstractIdentify, topic, Popup, lang){

        return declare([AbstractIdentify], {

            //formatter specific to each sublayer, keyed by Layer/sublayer name.
            formatters: {
                'USA/Cities': function(feature) {
                    return (feature.attributes['AREANAME']+', '+feature.attributes['ST']);
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
                logger.debug('inside constructor for app/Identify');

                //configure for specific viewer
                arguments[0].layerIds = ['USA', 'cities'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

                topic.subscribe("/identify/results", lang.hitch(this, function(resultCollection){
                    var popup = this._map.infoWindow;
                    popup.show(resultCollection.searchGeometry);
                    popup.setFeatures(resultCollection.features);
                }));

                this._map.infoWindow.on('selection-change', lang.hitch(this, function() {
                    logger.debug('selection changed...');
                    var popup = this._map.infoWindow;

                    var feature = popup.getSelectedFeature();
                    console.debug('selectedFeature: ', feature);

                    var formatter = this.formatters[feature.formatter];
                    popup.setContent(formatter.call(this, feature));
                }));
            } //end constructor

        });
    }
);