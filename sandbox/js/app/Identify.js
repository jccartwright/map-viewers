define(["dojo/_base/declare", "dojo/_base/array", "ngdc/AbstractIdentify", "dojo/topic", "esri/dijit/Popup", "dojo/_base/lang"],
    function(declare, array, AbstractIdentify, topic, Popup, lang){

        return declare([AbstractIdentify], {

            //called after parent class constructor
            constructor: function() {
                logger.debug('inside constructor for app/Identify');

                //configure for specific viewer
                arguments[0].layerIds = ['USA', 'cities'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);


//                topic.subscribe("/identify/start-query", lang.hitch(this, function(deferreds){
//                    console.log(deferreds);
//                    var popup = this._map.infoWindow;
//                    popup.setFeatures(deferreds);
//                    popup.show(this.searchGeometry);
//                    console.log('leaving start-query...');
//                }));
//

//                topic.subscribe("/identify/results", lang.hitch(this, function(results){
                    //console.log(identify.searchGeometry);
//                    console.log('identify results: ', results);
//
//                    var popup = this._map.infoWindow;
//                    popup.show(this.searchGeometry);
//                    popup.setFeatures(results[0]);
//                }));

            } //end constructor

        });
    }
);