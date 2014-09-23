define([
    "dojo/_base/declare", 
    "dojo/_base/array", 
    'dojo/_base/config',
    "dojo/string", 
    "dojo/dom-class",
    "ngdc/identify/IdentifyPane", 
    "dojo/topic", 
    "dojo/on",
    "esri/dijit/Popup", 
    "dojo/_base/lang", 
    "dijit/form/Button"
    ],
    function(
        declare, 
        array, 
        config,
        string,
        domClass, 
        IdentifyPane, 
        topic,
        on, 
        Popup, 
        lang, 
        Button
        ){

        return declare([IdentifyPane], {

            constructor: function() {
                this.magnifyingGlassIconUrl = config.app.ngdcDijitsUrl + '/identify/images/magnifier.png';
            },

            startup: function() {
                this.inherited(arguments);
        
                this.showTsObservationsButton = new Button({
                    label: "Show Tsunami Observations",
                    showLabel: true
                });
                this.showTsObservationsButton.domNode.style.display = "none";
                domClass.add(this.showTsObservationsButton.domNode, 'genid-button');
                this.showTsObservationsButton.startup(); //necessary?
                this.showTsObservationsButton.placeAt(this.zoomToButton.domNode, 'after');
                on(this.showTsObservationsButton, 'click', lang.hitch(this, function() {
                    console.log('ShowTsObsForEvent');
                    topic.publish('/hazards/ShowTsObsForEvent', this.currentItem.attributes['ID'], this.highlightGraphic.geometry);
                }));
                
                this.showTsEventButton = new Button({
                    label: "Show Tsunami Event",
                    showLabel: true
                });
                this.showTsEventButton.domNode.style.display = "none";
                domClass.add(this.showTsEventButton.domNode, 'genid-button');
                this.showTsEventButton.startup();
                this.showTsEventButton.placeAt(this.showTsObservationsButton.domNode, 'after');
                on(this.showTsEventButton, 'click', lang.hitch(this, function() {
                    console.log('ShowTsEventForObs');
                    topic.publish('/hazards/ShowTsEventForObs', this.currentItem.attributes['Tsunami Event ID'], this.highlightGraphic.geometry);
                }));
            },

            getLayerDisplayLabel: function(item, count) {
                if (item.layerName == 'Tsunami Events _green squares_' || item.layerName == 'Tsunami Events by Cause_Fatalities') {
                    return '<i><b>Tsunami Events (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName == 'Tide Gauges_Deep Ocean Gauges') {
                    return '<i><b>Tsunami Observations (Tide Gauges/Deep Ocean Gauges) (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName == 'Eyewitness_Post-Tsunami Surveys') {
                    return '<i><b>Tsunami Observations (Eyewitness/Post-Tsunami Surveys) (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName == 'Tsunami Observations _cross symbols_') {
                    return '<i><b>Tsunami Observations (' + this.formatCountString(count) + ')</b></i>';
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

            getItemDisplayLabel: function(item) {
                var attr = item.feature.attributes;
                if (item.layerName == 'Tsunami Events _green squares_' || 
                    item.layerName == 'Tsunami Events by Cause_Fatalities' ||                    
                    item.layerName == 'Significant Earthquakes') {

                    return attr['Location Name'] + ': ' + attr['Date String'];
                }
                else if (item.layerName == 'Tide Gauges_Deep Ocean Gauges' || 
                        item.layerName == 'Eyewitness_Post-Tsunami Surveys' || 
                        item.layerName == 'Tsunami Observations _cross symbols_') {
                    if (attr['Water Height'] == 'Null') {
                        return attr['Location Name'] + ': ' + attr['Date String'];
                    }
                    else {
                        return attr['Location Name'] + ': ' + attr['Date String'] + ' ' + attr['Water Height'] + 'm';
                    }
                }
                else if (item.layerName == 'Significant Volcanic Eruptions') {
                    return attr['YEAR'] + ': ' + attr['NAME'];
                }
                else if (item.layerName == 'Current DART Stations') {
                    return attr['Station'] + ': ' + attr['Description'];
                }
                else if (item.layerName == 'Retrospective BPR Stations') {
                    return attr['Station ID'] + ': ' + attr['Location'];
                }
                else if (item.layerName == 'Tsunami Tide Gauges') {
                    return attr['Station'] + ': ' + attr['Name'] + ', ' + attr['State'];
                }
                else {
                    return item.value;
                }
            },

            showResults: function() {
                this.inherited(arguments);
                
                this.showTsObservationsButton.domNode.style.display = "none";  //Hide the "Show Tsunami Observations" button
                this.showTsEventButton.domNode.style.display = "none";  //Hide the "Show Tsunami Event" button
            },

            showInfo: function() {
                this.inherited(arguments);

                var item = this.currentItem;
                var attr = this.currentItem.attributes;

                if (this.isTsEvent(item.layerKey)) {
                    this.tsEventId = attr["ID"];
                    var numRunups = attr['Number of Observations'];
                    if (numRunups > 1) {
                        this.showTsObservationsButton.set('label', "Show This Tsunami Event and " + numRunups + " Observations");
                    } 
                    else if (numRunups == 1) {
                        this.showTsObservationsButton.set('label', "Show This Tsunami Event and " + numRunups + " Observation");
                    } 
                    else if (numRunups == 0) {
                        //No tsunami observations - hide the button
                        this.showTsObservationsButton.set('label', '');
                        this.showTsObservationsButton.domNode.style.display = 'none';
                    }

                    if (numRunups > 0) {
                        this.showTsObservationsButton.domNode.style.display = ""; //Show the "Show Tsunami Observations" button
                        this.showTsEventButton.domNode.style.display = "none";  //Hide the "Show Tsunami Event" button
                    }
                }
                else if (this.isTsRunup(item.layerKey)) {
                    this.tsEventId = attr["Tsunami Event ID"];
                    this.showTsEventButton.set('label', "Show Associated Tsunami Event");
                    this.showTsEventButton.domNode.style.display = ""; //Show the "Show Tsunami Event" button
                    this.showTsObservationsButton.domNode.style.display = "none";  //Hide the "Show Tsunami Observations" button
                }

                this.stackContainer.resize();
                this.featurePage.resize();
                this.infoPage.resize();
            },

            isTsEvent: function(layerKey) {
                return layerKey == 'Hazards/Tsunami Events _green squares_' || layerKey == 'Hazards/Tsunami Events by Cause_Fatalities';
            },

            isTsRunup: function(layerKey) {
                return layerKey == 'Hazards/Tide Gauges_Deep Ocean Gauges' || layerKey == 'Hazards/Eyewitness_Post-Tsunami Surveys' || layerKey == 'Hazards/Tsunami Observations _cross symbols_';
            },

            populateFeatureStore: function(results) {
                var totalFeatures = 0;
                var numFeaturesForLayer = 0;
                this.expandedNodePaths = [];
                this.identifyResults = results;

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
                                displayLabel: this.getItemDisplayLabel(item),
                                label: this.getItemDisplayLabel(item) + " <a id='zoom-" + this.uid + "' href='#' class='zoomto-link'><img src='" + this.magnifyingGlassIconUrl + "'></a>",
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

        });
    }
);