/* eslint-disable quotes */
define([
    'dojo/_base/declare', 
    'dojo/_base/config', 
    'dojo/_base/array', 
    'dojo/_base/lang',
    'dojo/dom-style',
    'dojo/json',
    'dijit/form/Button',
    'dijit/Tooltip',
    'esri/geometry/webMercatorUtils', 
    'ngdc/identify/IdentifyPane'
],
    function(
        declare, 
        config, 
        array, 
        lang,
        domStyle,
        JSON,
        Button,
        Tooltip,
        webMercatorUtils,
        IdentifyPane
        ){

        return declare([IdentifyPane], {

            constructor: function() {
                this.magnifyingGlassIconUrl = config.app.ngdcDijitsUrl + '/identify/images/magnifier.png';
            },

            postCreate: function() {
                this.inherited(arguments);
                domStyle.set(this.domNode, 'height', '350px');
                domStyle.set(this.domNode, 'width', '400px');

                domStyle.set(this.featurePageBottomBar.domNode, 'height', '30px');
                this.featurePageBottomBar.style = 'height: 50px;';
            },

            showResults: function() {
                this.inherited(arguments);
            },

            getLayerDisplayLabel: function(item, count) {

                if (item.layerName.indexOf('Hypoxia Stations') > 0) {
                    return '<i><b>Hypoxia Stations (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName.indexOf('Hypoxia Contours') > 0) {
                    return '<i><b>Hypoxia Contours (' + this.formatCountString(count) + ')</b></i>';
                }
            },

            formatCountString: function(count) {
                if (count >= 1000) {
                    return 'results limited to 1000';
                } else {
                    return count;
                }
            },

            getItemDisplayLabel: function(item, uid) {
                //return item.value;
                if (item.layerName.indexOf('Hypoxia Stations') > 0) {
                    return this.getItemLabelSpan(item.feature.attributes['Station'], uid);
                }
                else if (item.layerName.indexOf('Hypoxia Contours') > 0) {
                    //return this.getItemLabelSpan(item.feature.attributes['Survey ID'], uid);
                    return this.getItemLabelSpan('Hypoxia Contours', uid);
                }
            },

            getItemLabelSpan: function(text, uid) {
                return '<span id="itemLabel-' + uid + '">' + text + '</span>';
            },

            populateFeatureStore: function(results) {
                var totalFeatures = 0;
                var numFeaturesForLayer = 0;
                this.expandedNodePaths = [];
                this.identifyResults = results;

                for (var i = 0; i < this.identify.layerIds.length; i++) { //Iterate through the layerIds, specified in Identify.js. This maintains the desired ordering of the layers.
                    var svcName = this.identify.layerIds[i];
                    for (var layerName in results[svcName]) {
                        if (results[svcName].hasOwnProperty(layerName)) {

                            numFeaturesForLayer = results[svcName][layerName].length;
                            totalFeatures += numFeaturesForLayer;

                            for (var j = 0; j < results[svcName][layerName].length; j++) {
                                var item = results[svcName][layerName][j];
                                var layerKey = svcName + '/' + layerName;
                                var layerUrl = results[svcName][layerName][j].layerUrl;
                                
                                //Create a layer "folder" node if it doesn't already exist
                                if (this.featureStore.query({id: layerName}).length === 0) {
                                    this.featureStore.put({
                                        uid: ++this.uid,
                                        id: layerName,
                                        label: this.getLayerDisplayLabel(item, numFeaturesForLayer),
                                        type: 'folder',
                                        parent: 'root'
                                    });
                                    //this.expandedNodePaths.push(layerName);
                                }
                                
                                //Add the current item to the store, with the layerName folder as parent
                                this.featureStore.put({
                                    uid: ++this.uid,
                                    id: this.uid,                                
                                    displayLabel: this.getItemDisplayLabel(item, this.uid),
                                    label: this.getItemDisplayLabel(item, this.uid) + " <a id='zoom-" + this.uid + "' href='#' class='zoomto-link'><img src='" + this.magnifyingGlassIconUrl + "' title='Zoom to extent of feature'></a>",
                                    layerUrl: layerUrl,
                                    layerKey: layerKey,
                                    attributes: item.feature.attributes,
                                    parent: layerName,
                                    type: 'item'
                                });
                            }
                        }
                    }
                }
                return totalFeatures;
            },

            constructFeatureTree: function() {
                this.inherited(arguments);
            },

            showInfo: function() {
                this.inherited(arguments);

                var layerName = this.currentItem.layerKey.split('/')[0];
            }
        });
    }
);