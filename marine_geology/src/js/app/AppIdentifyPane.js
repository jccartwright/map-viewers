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

                if (item.layerName == 'Marine Geology Data Sets/Reports') {
                    return '<i><b>Marine Geology Data Sets/Reports (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName == 'All Samples by Institution') {
                    return '<i><b>Sample Index (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName == 'NOS Seabed Type') {
                    return '<i><b>NOS Seabed Descriptions (' + this.formatCountString(count) + ')</b></i>';
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
                var a = item.feature.attributes;
                if (item.layerName == 'Marine Geology Data Sets/Reports') {
                    if (a['Hole/Sample ID'] != 'Null') {
                        return this.getItemLabelSpan('Sample: ' + a['Hole/Sample ID'], uid);
                    } else {
                        return this.getItemLabelSpan('Sample ID not available', uid);
                    }
                }
                else if (item.layerName == 'All Samples by Institution') {
                    if (a['Alternate Cruise or Leg'] == 'Null') {
                        return this.getItemLabelSpan(a['Cruise or Leg'] + ':' + a['Sample ID'] + ':' + a['Device'] + ' (' + a['Repository'] + ')', uid);
                    }
                    else {
                        return this.getItemLabelSpan(a['Cruise or Leg'] + ' (' + a['Alternate Cruise or Leg'] + '):' + a['Sample ID'] + ':' + a['Device'] + ' (' + a['Repository'] + ')', uid);
                    }
                }
                else if (item.layerName == 'NOS Seabed Type') {
                    if (a['Sample ID'] != 'Null') {
                        return this.getItemLabelSpan('Sample: ' + a['Sample ID'], uid);
                    } else {
                        return this.getItemLabelSpan('Sample ID not available', uid);
                    }
                }                
            },

            getItemLabelSpan: function(text, uid) {
                return '<span id="itemLabel-' + uid + '">' + text + '</span>';
            },

            populateFeatureStore: function(results) {
                var totalFeatures = 0;
                var numFeaturesForLayer = 0;
                this.expandedNodePaths = [];

                var marineGeologyCounts = this.getMarineGeologyCounts(results);
                var sampleIndexCounts = this.getSampleIndexCounts(results);
                var nosSeabedCounts = this.getNosSeabedCounts(results);

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
                                    //If NOS Hydro, parent is the NOS Hydro folder, else parent is root.
                                    parent: 'root'
                                });
                                //this.expandedNodePaths.push(layerName);
                            }

                            if (svcName == 'Marine Geology') {
                                this.addMarineGeologyFeature(item, layerName, layerKey, layerUrl, marineGeologyCounts);
                            }
                            else if (svcName == 'Sample Index') {
                                this.addSampleIndexFeature(item, layerName, layerKey, layerUrl, sampleIndexCounts);
                            }
                            else if (svcName =='NOS Seabed') {
                                this.addNosSeabedFeature(item, layerName, layerKey, layerUrl, nosSeabedCounts);
                            }
                        }
                    }
                }
                return totalFeatures;
            },

            addMarineGeologyFeature: function(item,  layerName, layerKey, layerUrl, sampleCounts) {
                var attr = item.feature.attributes;
                var mggid = attr['MGGID'];
                var datasetTitle = attr['Dataset Title'];

                //Create an MGGID "folder" node if it doesn't already exist, with the Dataset Title as the label
                if (this.featureStore.query({id: mggid}).length === 0) {
                    this.featureStore.put({
                        uid: ++this.uid,
                        id: mggid,
                        label: '<b>' + datasetTitle + '</b>&nbsp;&nbsp<i>(' + sampleCounts[mggid].count + ')</i>',
                        type: 'folder',
                        parent: layerName
                    });
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
                    parent: mggid,
                    type: 'item'
                });
            },

            addSampleIndexFeature: function(item, layerName, layerKey, layerUrl, sampleCounts) {
                var attr = item.feature.attributes;
                var lakeAndPlatform = this.getLakeAndPlatformString(attr);
                var cruiseAndAlternate = this.getCruiseAndAlternateString(attr);

                //Create a lake/platform "folder" node if it doesn't already exist  
                if (this.featureStore.query({id: lakeAndPlatform}).length === 0) {
                    this.featureStore.put({
                        uid: ++this.uid,
                        id: lakeAndPlatform,
                        label: '<b>' + lakeAndPlatform + '</b>&nbsp;&nbsp<i>(' + sampleCounts[lakeAndPlatform].count + ')</i>',
                        type: 'folder',
                        parent: layerName
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
            },

            addNosSeabedFeature: function(item,  layerName, layerKey, layerUrl, sampleCounts) {
                var attr = item.feature.attributes;
                var survey = attr['NOS Survey ID'];

                //Create a survey "folder" node if it doesn't already exist  
                if (this.featureStore.query({id: survey}).length === 0) {
                    this.featureStore.put({
                        uid: ++this.uid,
                        id: survey,
                        label: '<b>' + survey + '</b>&nbsp;&nbsp<i>(' + sampleCounts[survey].count + ')</i>',
                        type: 'folder',
                        parent: layerName
                    });
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
                    parent: survey,
                    type: 'item'
                });
            },

            getMarineGeologyCounts: function(results) {
                if (!results['Marine Geology']) {
                    return null;                
                }
                if (!results['Marine Geology']['Marine Geology Data Sets/Reports']) {
                    return null;
                }

                // Example: {mggid: {count: 45}}
                var counts = {};

                var marineGeologyResults = results['Marine Geology']['Marine Geology Data Sets/Reports'];
                for (var i = 0; i < marineGeologyResults.length; i++) {
                    var attr = marineGeologyResults[i].feature.attributes;
                    
                    var mggid = attr['MGGID'];

                    if (mggid in counts) {
                        counts[mggid].count++;
                    } else {
                        counts[mggid] = {};
                        counts[mggid].count = 1;
                    }
                }
                return counts;
            },

            getSampleIndexCounts: function(results) {
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

            getNosSeabedCounts: function(results) {
                if (!results['NOS Seabed']) {
                    return null;                
                }
                if (!results['NOS Seabed']['NOS Seabed Type']) {
                    return null;
                }

                // Example: {mggid: {count: 45}}
                var counts = {};

                var marineGeologyResults = results['NOS Seabed']['NOS Seabed Type'];
                for (var i = 0; i < marineGeologyResults.length; i++) {
                    var attr = marineGeologyResults[i].feature.attributes;
                    
                    var survey = attr['NOS Survey ID'];

                    if (survey in counts) {
                        counts[survey].count++;
                    } else {
                        counts[survey] = {};
                        counts[survey].count = 1;
                    }
                }
                return counts;
            },

            constructFeatureTree: function() {
                this.inherited(arguments);
            },

            getLakeAndPlatformString: function(attr) {
                return (attr['Lake'] == 'Null' ? '' : '(' + attr['Lake'] + ') ') + 
                    (attr['Platform'] == 'Unknown Platform' ? '' : 'Platform: ') + 
                    attr['Platform'];   
            },

            getCruiseAndAlternateString: function(attr) {
                return attr['Cruise or Leg'] + (attr['Alternate Cruise or Leg'] == 'Null' ? '' : ' (' + attr['Alternate Cruise or Leg'] + ')');
            }
        });
    }
);