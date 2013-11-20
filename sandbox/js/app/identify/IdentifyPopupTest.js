define(["dojo/_base/declare", "dojo/_base/array", "ngdc/AbstractIdentify", "dojo/topic", "esri/dijit/Popup", "dojo/_base/lang"],
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
                logger.debug('inside constructor for app/identify/IdentifyPopupTest');

                //configure for specific viewer
                arguments[0].layerIds = ['USA', 'cities'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

                topic.subscribe("/identify/results", lang.hitch(this, function(resultCollection){
                    var popup = this._map.infoWindow;
                    popup.show(resultCollection.anchorPoint);
                    popup.setFeatures(resultCollection.features);
                }));

                //TODO something is causing this event to fire at a time when there is not selectedFeature
                this._map.infoWindow.on('selection-change', lang.hitch(this, function() {
                    var popup = this._map.infoWindow;

                    var feature = popup.getSelectedFeature();
                    if (! feature) {
                        return
                    }
                    //console.debug('selectedFeature: ', feature);

                    var formatter = this.formatters[feature.formatter];
                    popup.setContent(formatter.call(this, feature));
                }));
            } //end constructor

        });
    }
);