define(["dojo/_base/declare", "dojo/_base/array", "esri/tasks/IdentifyResult", "dojo/_base/lang"],
    function(declare, array, IdentifyResult, lang){
        return declare([], {
            results: null,
            features: null,
            searchGeometry: null,
            anchorPoint: null,

            constructor: function() {
                logger.debug('inside constructor for ngdc/identify/IdentifyResultCollection');
            },

            setResultSet: function(results) {
                console.log('inside setResultSet...');
                this.results = results;
                this.setFeatures(results);
            },

            setSearchGeometry: function(geometry) {
                this.searchGeometry = geometry;
                this.anchorPoint = (geometry.type === 'point') ? geometry : geometry.getCenter();
            },


            setFeatures: function(results) {
                var feature;

                //build a list of Feature, augmenting each with formatter key composed of it's layer and sublayer names
                this.features = [];
                for (key in results) {
                    for (var i=0; i<results[key].length; i++) {
                        feature = results[key][i].feature;
                        feature.formatter = key+'/'+results[key][i].layerName;
                        this.features.push(feature);
                    }
                }
            }
        });
    }
);
