define([
    'dojo/_base/declare', 
    'dojo/_base/config', 
    'dojo/dom-style',
    'ngdc/identify/IdentifyPane' 
    ],
    function(
        declare, 
        config, 
        domStyle,
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
                //this.featurePageTitle = 'foo';
                if (!this.numFeatures) {
                    this.featurePageTitle = 'No Samples Found';
                }
                else if (this.numFeatures < 1000) {
                    this.featurePageTitle = 'Identified Samples (' + this.numFeatures + ')<br><span class="identifyPane-titleDescription"><i>Cruise (Alternate Cruise):Sample ID:Device (Repository)</i></span>';
                }
                else {
                    this.featurePageTitle = 'Identified Samples (results limited to 1000)<br><span class="identifyPane-titleDescription"><i>Cruise (Alternate Cruise):Sample ID:Device (Repository)</i></span>';
                }
                this.setTitle(this.featurePageTitle);
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
                if (a['Alternate Cruise or Leg'] === 'Null') {
                    return a['Cruise or Leg'] + ':' + a['Sample ID'] + ':' + a['Device'] + ' (' + a['Repository'] + ')';
                }
                else {
                    return a['Cruise or Leg'] + ' (' + a['Alternate Cruise or Leg'] + '):' + a['Sample ID'] + ':' + a['Device'] + ' (' + a['Repository'] + ')';
                }
            },

            populateFeatureStore: function(results) {
                if (!results['Sample Index']) {
                    return;
                }
                if (!results['Sample Index']['All Samples by Institution']) {
                    return;
                }

                var sampleCounts = this.getSampleCounts(results);

                var svcName = this.identify.layerIds[0];
                var layerName = 'All Samples by Institution';
                var layerResults = results[svcName][layerName];

                for (var i = 0; i < layerResults.length; i++) {
                    var item = layerResults[i];
                    var attr = item.feature.attributes;
                    var layerKey = svcName + '/' + layerName;
                    var layerUrl = layerResults[i].layerUrl;
                    var lakeAndPlatform = this.getLakeAndPlatformString(attr);
                    var cruiseAndAlternate = this.getCruiseAndAlternateString(attr);
                     
                    //Create a lake/platform "folder" node if it doesn't already exist  
                    if (this.featureStore.query({id: lakeAndPlatform}).length === 0) {
                        this.featureStore.put({
                            uid: ++this.uid,
                            id: lakeAndPlatform,
                            label: '<b>' + lakeAndPlatform + '</b>&nbsp;&nbsp<i>(' + sampleCounts[lakeAndPlatform].count + ')</i>',
                            type: 'folder',
                            parent: 'root'
                        });
                    }

                    //Create a cruise/alternate "folder" node if it doesn't already exist, with the lake/platform as parent
                    if (this.featureStore.query({id: cruiseAndAlternate}).length === 0) {
                        this.featureStore.put({
                            uid: ++this.uid,
                            id: lakeAndPlatform + '/' + cruiseAndAlternate,
                            label: '<b>' + cruiseAndAlternate + '</b>&nbsp;&nbsp<i>(' + sampleCounts[lakeAndPlatform].cruiseCounts[cruiseAndAlternate] + ')</i>',
                            type: 'folder',
                            parent: lakeAndPlatform
                        });
                    }
                    
                    //Add the current item to the store, with the cruise/alternate folder as parent
                    this.featureStore.put({
                        uid: ++this.uid,
                        id: this.uid,                                
                        displayLabel: this.getItemDisplayLabel(item),
                        label: this.getItemDisplayLabel(item) + " <a id='zoom-" + this.uid + "' href='#' class='zoomto-link'><img src='" + this.magnifyingGlassIconUrl + "'></a>",
                        layerUrl: layerUrl,
                        layerKey: layerKey,
                        attributes: item.feature.attributes,
                        parent: lakeAndPlatform + '/' + cruiseAndAlternate,
                        type: 'item'
                    });
                }
                
                
                return layerResults.length;
            },

            getSampleCounts: function(results) {
                if (!results['Sample Index']) {
                    return null;                
                }
                if (!results['Sample Index']['All Samples by Institution']) {
                    return null;
                }

                // Example: {lakeAndPlatformString: {count: 45, cruiseCounts: {'CRUISE1': 20, 'CRUISE2': 25}} }
                var counts = {};

                var sampleIndexResults = results['Sample Index']['All Samples by Institution'];
                for (var i = 0; i < sampleIndexResults.length; i++) {
                    var attr = sampleIndexResults[i].feature.attributes;
                    var lakeAndPlatform = this.getLakeAndPlatformString(attr);
                    var cruiseAndAlternate = this.getCruiseAndAlternateString(attr);

                    if (lakeAndPlatform in counts) {
                        counts[lakeAndPlatform].count++;
                    } else {
                        counts[lakeAndPlatform] = {};
                        counts[lakeAndPlatform].cruiseCounts = {};
                        counts[lakeAndPlatform].count = 1;
                    }

                    if (cruiseAndAlternate in counts[lakeAndPlatform].cruiseCounts) {
                        counts[lakeAndPlatform].cruiseCounts[cruiseAndAlternate]++;
                    } else {
                        counts[lakeAndPlatform].cruiseCounts[cruiseAndAlternate] = 1;
                    }
                }
                return counts;                
            },

            getLakeAndPlatformString: function(attr) {
                return (attr['Lake'] === 'Null' ? '' : '(' + attr['Lake'] + ') ') + 
                    (attr['Platform'] === 'Unknown Platform' ? '' : 'Platform: ') + 
                    attr['Platform'];   
            },

            getCruiseAndAlternateString: function(attr) {
                return attr['Cruise or Leg'] + (attr['Alternate Cruise or Leg'] === 'Null' ? '' : ' (' + attr['Alternate Cruise or Leg'] + ')');
            }
        });
    }
);