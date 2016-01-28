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
                // if (this.numFeatures >= 1000) {
                //     this.featurePageTitle = "Identified Features (" + this.numFeatures + "+, results limited to 1000)";
                //     this.setTitle(this.featurePageTitle);
                // }
            },

            getLayerDisplayLabel: function(item, count) {
                // if (item.layerName == 'Multibeam Bathymetric Surveys') {
                //     return '<i><b>Multibeam Bathymetric Surveys (' + this.formatCountString(count) + ')</b></i>';
                // } 
                // else if (item.layerName == 'Marine Trackline Surveys: Bathymetry') {
                //     return '<i><b>Single-Beam Bathymetric Surveys (' + this.formatCountString(count) + ')</b></i>';
                // }
                if (item.layerName == 'All Samples by Institution') {
                    return '<i><b>Sample Index (' + this.formatCountString(count) + ')</b></i>';
                }
                else {
                    return '<i><b>' + item.layerName + ' (' + this.formatCountString(count) + ')</b></i>';
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
                if (item.svcId == 'Multibeam' || item.svcId == 'Trackline') {
                    return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>', uid);
                }
                else if (item.layerName == 'International ECS Polygons (UNEP GRID-Arendal)') {
                    return this.getItemLabelSpan(item.feature.attributes['STATE'], uid);
                }
                else if (item.layerName == 'World_Maritime_Boundaries_v8_20140228') {
                    return this.getItemLabelSpan(item.feature.attributes['Boundary'], uid);
                }
                else if (item.svcId == 'ECS Catalog') {
                    return this.getItemLabelSpan(item.feature.attributes['TITLE'], uid);
                }
                else {
                    return this.getItemLabelSpan(item.value, uid);
                }
            },

            getItemLabelSpan: function(text, uid) {
                return '<span id="itemLabel-' + uid + '">' + text + '</span>';
            },

            populateFeatureStore: function(results) {
                var totalFeatures = 0;
                var numFeaturesForLayer = 0;
                this.expandedNodePaths = [];

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
                                parent: layerName,
                                type: 'item'
                            });
                        }
                    }
                }
                return totalFeatures;
            },



            constructFeatureTree: function() {
                this.inherited(arguments);

                //this.tree.set('paths', this.expandedNodePaths);
            }
        });
    }
);