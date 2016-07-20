define([
    'dojo/_base/declare', 
    'dojo/_base/array', 
    'dojo/_base/config',
    'dojo/string', 
    'dojo/dom-class',
    'ngdc/identify/IdentifyPane', 
    'dojo/topic', 
    'dojo/on',
    'dojo/dom-style',
    'esri/dijit/Popup', 
    'dojo/_base/lang', 
    'dijit/form/Button'
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
        domStyle,
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
                domStyle.set(this.showTsObservationsButton.domNode, 'display', 'none');
                domClass.add(this.showTsObservationsButton.domNode, 'genid-button');
                this.showTsObservationsButton.startup(); //necessary?
                this.showTsObservationsButton.placeAt(this.zoomToButton.domNode, 'after');
                on(this.showTsObservationsButton, 'click', lang.hitch(this, function() {
                    topic.publish('/hazards/ShowTsObsForEvent', this.currentItem.attributes['ID'], this.highlightGraphic.geometry);
                }));
                
                this.showTsEventButton = new Button({
                    label: "Show Tsunami Event",
                    showLabel: true
                });
                domStyle.set(this.showTsEventButton.domNode, 'display', 'none');
                domClass.add(this.showTsEventButton.domNode, 'genid-button');
                this.showTsEventButton.startup();
                this.showTsEventButton.placeAt(this.showTsObservationsButton.domNode, 'after');
                on(this.showTsEventButton, 'click', lang.hitch(this, function() {
                    topic.publish('/hazards/ShowTsEventForObs', this.currentItem.attributes['Tsunami Event ID'], this.highlightGraphic.geometry);
                }));
            },

            getLayerDisplayLabel: function(item, count) {
                if (item.layerName === 'Tsunami Events [green squares]' || item.layerName === 'Tsunami Events by Cause/Fatalities') {
                    return '<i><b>Tsunami Events (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName === 'Tide Gauge/Deep Ocean Gauge Tsunami Observations') {
                    return '<i><b>Tsunami Observations (Tide Gauges/Deep Ocean Gauges) (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName === 'Eyewitness Tsunami Observations/Post-Tsunami Surveys') {
                    return '<i><b>Tsunami Observations (Eyewitness/Post-Tsunami Surveys) (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName === 'Tsunami Observations [by measurement type]') {
                    return '<i><b>Tsunami Observations (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName === 'Volcano Locations [from Smithsonian]') {
                    return '<i><b>Volcanoes (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName === 'Plate Boundaries [from UTIG]') {
                    return '<i><b>Plate Boundaries (' + this.formatCountString(count) + ')</b></i>';
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
                var attr = item.feature.attributes;
                if (item.layerName === 'Tsunami Events [green squares]' || 
                    item.layerName === 'Tsunami Events by Cause/Fatalities' ||                    
                    item.layerName === 'Significant Earthquakes') {

                    return this.getItemLabelSpan(attr['Location Name'] + ': ' + attr['Date String'], uid);
                }
                else if (item.layerName === 'Tide Gauge/Deep Ocean Gauge Tsunami Observations' || 
                        item.layerName === 'Eyewitness Tsunami Observations/Post-Tsunami Surveys' || 
                        item.layerName === 'Tsunami Observations [by measurement type]') {
                    if (attr['Water Height'] === 'Null') {
                        return this.getItemLabelSpan(attr['Location Name'] + ': ' + attr['Date String'], uid);
                    }
                    else {
                        return this.getItemLabelSpan(attr['Location Name'] + ': ' + attr['Date String'] + ' ' + attr['Water Height'] + 'm', uid);
                    }
                }
                else if (item.layerName === 'Significant Volcanic Eruptions') {
                    return this.getItemLabelSpan(attr['YEAR'] + ': ' + attr['NAME'], uid);
                }
                else if (item.layerName === 'Current DART Deployments') {
                    return this.getItemLabelSpan(attr['Deployment ID'] + ': ' + attr['Description'], uid);
                }
                else if (item.layerName === 'Retrospective BPR Deployments') {
                    return this.getItemLabelSpan(attr['Deployment ID'], uid);
                }
                else if (item.layerName === 'NOS/COOPS Tsunami Tide Gauges') {
                    return this.getItemLabelSpan(attr['Station'] + ': ' + attr['Name'] + ', ' + attr['State'], uid);
                }
                else {
                    return this.getItemLabelSpan(item.value, uid);
                }
            },

            getItemLabelSpan: function(text, uid) {
                return '<span id="itemLabel-' + uid + '">' + text + '</span>';
            },

            showResults: function() {
                this.inherited(arguments);
                
                domStyle.set(this.showTsObservationsButton.domNode, 'display', 'none'); //Hide the "Show Tsunami Observations" button
                domStyle.set(this.showTsEventButton.domNode, 'display', 'none'); //Hide the "Show Tsunami Event" button
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
                    else if (numRunups === 1) {
                        this.showTsObservationsButton.set('label', "Show This Tsunami Event and " + numRunups + " Observation");
                    } 
                    else if (numRunups === 0) {
                        //No tsunami observations - hide the button
                        this.showTsObservationsButton.set('label', '');
                        domStyle.set(this.showTsObservationsButton.domNode, 'display', 'none'); //Hide the "Show Tsunami Observations" button
                    }

                    if (numRunups > 0) {
                        domStyle.set(this.showTsObservationsButton.domNode, 'display', ''); //Show the "Show Tsunami Observations" button
                        domStyle.set(this.showTsEventButton.domNode, 'display', 'none'); //Hide the "Show Tsunami Event" button
                    }
                }
                else if (this.isTsRunup(item.layerKey)) {
                    this.tsEventId = attr["Tsunami Event ID"];
                    this.showTsEventButton.set('label', "Show Associated Tsunami Event");
                    domStyle.set(this.showTsEventButton.domNode, 'display', ''); //Show the "Show Tsunami Event" button
                    domStyle.set(this.showTsObservationsButton.domNode, 'display', 'none'); //Hide the "Show Tsunami Observations" button
                }

                this.stackContainer.resize();
                this.featurePage.resize();
                this.infoPage.resize();
            },

            isTsEvent: function(layerKey) {
                return layerKey === 'Hazards/Tsunami Events [green squares]' || layerKey === 'Hazards/Tsunami Events by Cause/Fatalities';
            },

            isTsRunup: function(layerKey) {
                return layerKey === 'Hazards/Tide Gauge/Deep Ocean Gauge Tsunami Observations' || layerKey === 'Hazards/Eyewitness Tsunami Observations/Post-Tsunami Surveys' || layerKey === 'Hazards/Tsunami Observations [by measurement type]';
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
                }
                return totalFeatures;
            },

        });
    }
);