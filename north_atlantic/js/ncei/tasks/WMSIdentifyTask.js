define([
    "dojo/_base/declare",
    "dojo/request",
    "dojo/dom-construct",
    "dojo/query",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/Evented",
    "ncei/tasks/WMSIdentifyResult",
    "ncei/tasks/WMSIdentifyParameters"
], function(
    declare,
    request,
    domConstruct,
    query,
    lang,
    topic,
    Evented,
    WMSIdentifyResult,
    WMSIdentifyParameters) {

    //"static" variables - shared across instances
    var SAMPLE_URL = "http://geoservice.maris2.nl/wms/seadatanet/emodnet_hydrography";

    return declare([Evented], {
        url: null,

        constructor: function(url, options) {
            //use sample request if no URL provided
            this.url = url || SAMPLE_URL;

            this.standardizeUrl();
        },


        //standardize URL. default to http protocol and add ? if necessary
        standardizeUrl: function() {
            if (! this.url.startsWith('http')) {
                this.url = 'http:' + this.url;
            }
            if (! this.url.endsWith('?')) {
                this.url = this.url + '?'
            }
        },


        execute: function(identifyParameters, callback, errback) {
            console.log(this.url + identifyParameters.getQueryInfo());

            var deferred = request.get(this.url + identifyParameters.getQueryInfo());

            deferred.then(
                lang.hitch(this, function(text) {

                    //scrape the HTML response for data since the plain text
                    //format does not seem to contain all the information
                    var responseFragment = domConstruct.toDom(text);
                    var headerFields = [];
                    query("th", responseFragment).forEach(function(node, index, nodelist){
                        headerFields.push(node.innerHTML);
                    });

                    //list of returned features. Each element is a hash of attribute values
                    var responseData = [];

                    query("tbody > tr", responseFragment).forEach(function(node, index, nodelist){
                        var tr = {};
                        query("td", node).forEach(function (node, index, nodelist) {
                            tr[headerFields[index]] = node.innerHTML;
                        });
                        responseData.push(tr);
                    });

                    //console.log(responseData);
                    this.emit('complete', {results: responseData});
                }),


                function(error) {
                    console.error("Error occurred with GetFeatureInfo request: ", error);
                    this.emit('error', {error: error});
                }
            );

            return deferred;
        }
    });
});