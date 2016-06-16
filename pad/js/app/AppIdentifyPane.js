define([
    'dojo/_base/declare', 
    'dojo/_base/config', 
    'dojo/_base/array', 
    'dojo/string',
    'dojo/topic', 
    'dojo/_base/lang',
    'dojo/dom-style',
    'dijit/form/Button', 
    'ngdc/identify/IdentifyPane' 
    ],
    function(
        declare, 
        config, 
        array, 
        string, 
        topic,
        lang,
        domStyle,
        Button,
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
            },

            showResults: function() {
                this.inherited(arguments);
            },

            getLayerDisplayLabel: function(item, count) {
                return '<i><b>' + this.getFolderName(item.formatter) + ' (' + this.formatCountString(this.folderCounts[this.getFolderName(item.formatter)]) + ')</b></i>';
            },

            getFolderName: function(layerKey) {
                if (layerKey == 'PAD/DATA_COLLECTION') {
                    return 'Passive Acoustic Data';
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
                if (item.formatter == 'PAD/DATA_COLLECTION') {
                    return this.getItemLabelSpan(item.feature.attributes['DC_NAME'], uid);
                }                 
            },

            getItemLabelSpan: function(text, uid) {
                return '<span id="itemLabel-' + uid + '">' + text + '</span>';
            },

            populateFeatureStore: function(results) {
                var totalFeatures = 0;
                var numFeaturesForLayer = 0;
                this.expandedNodePaths = [];

                this.computeFolderCounts(results);

                for (var i = 0; i < this.identify.layerIds.length; i++) { //Iterate through the layerIds, specified in Identify.js. This maintains the desired ordering of the layers.
                    var svcName = this.identify.layerIds[i];
                    for (var layerName in results[svcName]) {

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
                                label: this.getItemDisplayLabel(item, this.uid) + " <a id='zoom-" + this.uid + "' href='#' class='zoomto-link'><img src='" + this.magnifyingGlassIconUrl + "'></a>",
                                layerUrl: layerUrl,
                                layerKey: layerKey,
                                attributes: item.feature.attributes,
                                objectIdField: item.objectIdField,
                                parent: layerName,
                                type: 'item'
                            });
                        }
                    }
                }
                return totalFeatures;
            },

            computeFolderCounts: function(results) {
                this.folderCounts = {};
                for (var i = 0; i < this.identify.layerIds.length; i++) { //Iterate through the layerIds, specified in Identify.js. This maintains the desired ordering of the layers.
                    var svcName = this.identify.layerIds[i];
                    for (var layerName in results[svcName]) {
                        var layerKey = svcName + '/' + layerName;
                        var folderName = this.getFolderName(layerKey);
                        if (!this.folderCounts[folderName]) {
                            this.folderCounts[folderName] = 0;
                        }
                        this.folderCounts[folderName] += results[svcName][layerName].length;                        
                    }
                }
            }         
        });
    }
);