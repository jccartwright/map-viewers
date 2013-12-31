define(["dojo/_base/declare", "dojo/_base/array", "esri/tasks/IdentifyResult", "dojo/_base/lang"],
    function(declare, array, IdentifyResult, lang){
        return declare([], {
            results: null,
            features: null,
            searchGeometry: null,
            anchorPoint: null,
            serviceUrls: null,

            constructor: function(serviceUrls) {
                logger.debug('inside constructor for ngdc/identify/IdentifyResultCollection');
                this.serviceUrls = serviceUrls;
            },

            setResultSet: function(results) {
                //this.results = results;
                this.setFeatures(results);
            },

            setSearchGeometry: function(geometry) {
                this.searchGeometry = geometry;
                this.anchorPoint = (geometry.type === 'point') ? geometry : geometry.getCenter();
            },


            setFeatures: function(results) {
                //Build an object composed of a list of IdentifyResults for each sublayer in a service.
                //Augment each with formatter key composed of its layer and sublayer names, layerUrl, and service ID.
                this.results = {};
                for (svcId in results) {

                    for (var i=0; i<results[svcId].length; i++) {
                        var result = results[svcId][i];
                        result.formatter = svcId+'/'+results[svcId][i].layerName;
                        result.layerUrl = this.serviceUrls[svcId] + '/' + results[svcId][i].layerId;
                        result.svcId = svcId;

                        if (!this.results[svcId]) {
                            this.results[svcId] = {};
                        }
                        if (!this.results[svcId][result.layerName]) {
                            this.results[svcId][result.layerName] = [];
                        }
                        this.results[svcId][result.layerName].push(result);
                    }

                }
            }
        });
    }
);
