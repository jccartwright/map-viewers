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
                if (this.numFeatures >= 1000) {
                    this.featurePageTitle = "Identified Features (results limited to 1000)";
                    this.setTitle(this.featurePageTitle);
                }
            },

            getLayerDisplayLabel: function(item, count) {
                return '<i><b>Sample Index (' + this.formatCountString(count) + ')</b></i>';               
            },

            formatCountString: function(count) {
                if (count >= 1000) {
                    return 'results limited to 1000';
                } else {
                    return count;
                }
            },

            getItemDisplayLabel: function(item) {
                //'Cruise:Sample ID:Device (Repository)'
                var a = item.feature.attributes;
                return a['Cruise or Leg'] + ':' + a['Sample ID'] + ':' + a['Device'] + ' (' + a['Repository'] + ')';
            },

            populateFeatureStore: function(results) {
                var totalFeatures = 0;
                var numFeaturesForLayer = 0;
                this.expandedNodePaths = [];
                var repositoryCounts = this.getRepositoryCounts(results);

                for (var i = 0; i < this.identify.layerIds.length; i++) { //Iterate through the layerIds, specified in Identify.js. This maintains the desired ordering of the layers.
                    var svcName = this.identify.layerIds[i];
                    for (var layerName in results[svcName]) {

                        numFeaturesForLayer = results[svcName][layerName].length;
                        totalFeatures += numFeaturesForLayer;

                        for (var j = 0; j < results[svcName][layerName].length; j++) {
                            var item = results[svcName][layerName][j];
                            var layerKey = svcName + '/' + layerName;
                            var layerUrl = results[svcName][layerName][j].layerUrl;
                            var repositoryName = item.feature.attributes['Repository'];
                                                                                    
                            //Create a repository "folder" node if it doesn't already exist
                            if (this.featureStore.query({id: repositoryName}).length === 0) {
                                this.featureStore.put({
                                    uid: ++this.uid,
                                    id: repositoryName,
                                    label: '<b>' + repositoryName + ' (' + repositoryCounts[repositoryName] + ')</b>',
                                    type: 'folder',
                                    parent: 'root'
                                });
                                //this.expandedNodePaths.push(layerName);
                            }
                            
                            //Add the current item to the store, with the layerName folder as parent
                            this.featureStore.put({
                                uid: ++this.uid,
                                id: this.uid,                                
                                displayLabel: this.getItemDisplayLabel(item),
                                label: this.getItemDisplayLabel(item) + " <a id='zoom-" + this.uid + "' href='#' class='zoomto-link'><img src='" + this.magnifyingGlassIconUrl + "'></a>",
                                layerUrl: layerUrl,
                                layerKey: layerKey,
                                attributes: item.feature.attributes,
                                parent: repositoryName,
                                type: 'item'
                            });
                        }
                    }
                }
                return totalFeatures;
            },

            getRepositoryCounts: function(results) {
                if (!results['Sample Index']) {
                    return;                
                }
                if (!results['Sample Index']['All Samples by Institution']) {
                    return;
                }

                var repositoryCounts = {};

                var sampleIndexResults = results['Sample Index']['All Samples by Institution'];
                for (var i = 0; i < sampleIndexResults.length; i++) {
                    var repositoryName = sampleIndexResults[i].feature.attributes['Repository'];

                    if (repositoryName in repositoryCounts) {
                        repositoryCounts[repositoryName]++;
                    } else {
                        repositoryCounts[repositoryName] = 1;
                    }
                }
                return repositoryCounts;                
            },

            constructFeatureTree: function() {
                this.inherited(arguments);

                // //Add the NOS Hydro sub-layers to the list of nodes to be expanded to
                // this.expandedNodePaths.push(['root', 'NOS Hydrographic Surveys', 'Surveys with BAGs']);
                // this.expandedNodePaths.push(['root', 'NOS Hydrographic Surveys', 'Surveys with Digital Sounding Data']);
                // this.expandedNodePaths.push(['root', 'NOS Hydrographic Surveys', 'Surveys without Digital Sounding Data']); 

                //this.tree.set('paths', this.expandedNodePaths);
            }
        });
    }
);