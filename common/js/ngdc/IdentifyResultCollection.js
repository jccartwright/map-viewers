define(["dojo/_base/declare", "dojo/_base/array", "esri/tasks/IdentifyResult", "dojo/_base/lang"],
    function(declare, array, IdentifyResult, lang){
        return declare([], {
            _classname: 'IdentifyResultCollection',

            constructor: function(arguments) {
                logger.debug('inside constructor for '+this._classname);
            }
        });
    }
);
