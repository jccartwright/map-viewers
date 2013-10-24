define(["dojo/_base/declare", "dojo/_base/array", "esri/tasks/IdentifyResult", "dojo/_base/lang"],
    function(declare, array, IdentifyResult, lang){
        return declare([], {
            results: null,

            constructor: function(results) {
                logger.debug('inside constructor for ngdc/identify/IdentifyResultCollection');
                this.results = results;
            }
        });
    }
);
