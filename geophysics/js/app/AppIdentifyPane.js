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

                domStyle.set(this.featurePageBottomBar.domNode, 'height', '30px');
                this.featurePageBottomBar.style = 'height: 50px;';

                this.getMarineDataMultipleButton = new Button({
                    label: "Get Marine Data for These Surveys",
                    style: "bottom: 5px; left: 15px;",
                    onClick: lang.hitch(this, function(){
                        this.getMarineDataMultipleSurveys();
                    })
                }).placeAt(this.featurePageBottomBar);

                this.getMarineDataSingleButton = new Button({
                    label: "Get Marine Data for This Survey",
                    style: "bottom: 25px; left: 15px;",
                    onClick: lang.hitch(this, function(){
                        this.getMarineDataSingleSurvey();
                    })
                }).placeAt(this.infoPageBottomBar);
            },

            showResults: function() {
                this.isMarine = false;
                this.inherited(arguments);
                topic.publish('/geophysics/ShowIdentifyPane'); //Pass message to LayersPanel to disable the "Get Marine Data" button

                //Show/hide the "Get Marine Data" button on the FeaturePage depending on if there are any marine surveys shown
                if (this.isMarine) {
                    domStyle.set(this.getMarineDataMultipleButton.domNode, 'display', '');
                } else {
                    domStyle.set(this.getMarineDataMultipleButton.domNode, 'display', 'none');
                }
            },

            showInfo: function(item) {
                this.inherited(arguments);

                //Show/hide the "Get Marine Data" button on the InfoPage depending on if the current item is a marine survey
                if (item.layerKey.indexOf('Marine Trackline Surveys') > -1) {
                    domStyle.set(this.getMarineDataSingleButton.domNode, 'display', '');
                } else {
                    domStyle.set(this.getMarineDataSingleButton.domNode, 'display', 'none');
                }
            },

            close: function(){
                this.inherited(arguments);
                topic.publish('/geophysics/HideIdentifyPane'); //Pass message to LayersPanel to enable the "Get Marine Data" button
            },

            getLayerDisplayLabel: function(item, count) {
                if (item.layerName == 'Marine Trackline Surveys: All Survey Types') {
                    return '<i><b>All Survey Types (' + this.formatCountString(count) + ')</b></i>';
                } 
                else if (item.layerName == 'Marine Trackline Surveys: Bathymetry') {
                    return '<i><b>Single-Beam Bathymetry (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName == 'Marine Trackline Surveys: Gravity') {
                    return '<i><b>Gravity (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName == 'Marine Trackline Surveys: Magnetics') {
                    return '<i><b>Magnetics (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName == 'Marine Trackline Surveys: Multi-Channel Seismics') {
                    return '<i><b>Multi-Channel Seismics (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName == 'Marine Trackline Surveys: Seismic Refraction') {
                    return '<i><b>Seismic Refraction (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName == 'Marine Trackline Surveys: Shot-Point Navigation') {
                    return '<i><b>Shot-Point Navigation (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName == 'Marine Trackline Surveys: Side Scan Sonar') {
                    return '<i><b>Side Scan Sonar (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName == 'Marine Trackline Surveys: Single-Channel Seismics') {
                    return '<i><b>Single-Channel Seismics (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName == 'Marine Trackline Surveys: Subbottom Profile') {
                    return '<i><b>Subbottom Profile (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName == 'Aeromagnetic Surveys') {
                    return '<i><b>Aeromagnetic Surveys (' + this.formatCountString(count) + ')</b></i>';
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
                if (item.feature.attributes['Survey Year']) {
                    return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>', uid);              
                }
                else if (item.feature.attributes['Start Year'] && item.feature.attributes['End Year'] && 
                    item.feature.attributes['Start Year'] !== item.feature.attributes['End Year']) {
                    return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + ' <i>(' + item.feature.attributes['Start Year'] + '-' + item.feature.attributes['End Year'] + ')</i>', uid);                                  
                }
                else {
                    return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + ' <i>(' + item.feature.attributes['Start Year'] + ')</i>', uid);
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

                        if (layerName.indexOf('Marine Trackline Surveys') > -1) {
                            this.isMarine = true;
                        }

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
            },

            getMarineDataMultipleSurveys: function() {
                var surveyIds = [];

                var items = this.featureStore.query({type: 'item'});
                array.forEach(items, function(item) {
                    surveyIds.push(item.attributes['Survey ID']);
                });

                topic.publish('/geophysics/GetMarineData', this.identify.searchGeometry, surveyIds);
            },

            getMarineDataSingleSurvey: function() {
                var surveyId = this.currentItem.attributes['Survey ID'];
                topic.publish('/geophysics/GetMarineData', this.identify.searchGeometry, [surveyId]);
            }
        });
    }
);