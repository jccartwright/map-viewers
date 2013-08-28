define(["dojo/_base/declare", "dojo/_base/array", "esri/tasks/IdentifyResult", "dojo/_base/lang"],
    function(declare, array, IdentifyResult, lang){
        return declare([], {
            _classname: 'IdentifyResultCollection',
            results: {},

            constructor: function(arguments) {
                logger.debug('inside constructor for '+this._classname);
            }
        });
    }
);
