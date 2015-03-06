define([
    'dojo/_base/declare', 
    'dojo/_base/config', 
    'dojo/_base/array', 
    'dojo/string', 
    'ngdc/identify/IdentifyPane', 
    'dojo/topic', 
    'esri/dijit/Popup',
    'dojo/_base/lang', 
    'dijit/form/Button',
    'dojo/dom-style', 
    'app/RequestDataDialog'
    ],
    function(
        declare, 
        config,
        array, 
        string, 
        IdentifyPane, 
        topic, 
        Popup, 
        lang, 
        Button,
        domStyle, 
        RequestDataDialog
        ){

        return declare([IdentifyPane], {

            constructor: function() {
                this.magnifyingGlassIconUrl = config.app.ngdcDijitsUrl + '/identify/images/magnifier.png';
            },

            postCreate: function() {
                this.inherited(arguments);
                domStyle.set(this.domNode, 'height', '350px');
                domStyle.set(this.domNode, 'width', '450px');

                domStyle.set(this.featurePageBottomBar.domNode, 'height', '30px');
                //this.featurePageBottomBar.style = 'height: 50px;';

                this.requestDataFilesOrSurveysButton = new Button({
                    label: 'Request These Cruises',
                    style: 'bottom: 5px; left: 15px;',
                    onClick: lang.hitch(this, function(){    
                        if (this.layerMode == 'file') {
                            this.requestDataFiles();
                        }
                        else {
                            this.requestCruises();
                        }
                    })
                }).placeAt(this.featurePageBottomBar);

                this.requestDataFileOrSurveyButton = new Button({
                    label: 'Request This Cruise',
                    style: 'bottom: 25px; left: 15px;',
                    onClick: lang.hitch(this, function(){
                        if (this.layerMode == 'file') {
                            this.requestDataFile();
                        }
                        else {
                            this.requestCruise();
                        }
                    })
                }).placeAt(this.infoPageBottomBar);

                //Subscribe to message passed by the LayersPanel to toggle between cruise/file mode
                topic.subscribe('/water_column_sonar/layerMode', lang.hitch(this, function(layerMode) {
                    this.setLayerMode(layerMode);
                }));
            },

            showResults: function() {
                this.featurePane.domNode.innerHTML = '';

                this.inherited(arguments);

                if (this.numFeatures >= 1000) {

                    //Destroy the existing tree and clear the feature store
                    if (this.tree) {
                        this.tree.destroyRecursive();
                    }
                    this.clearFeatureStore();

                    this.featurePageTitle = 'Too Many Features Identified';
                    //this.featurePageTitle = 'More than 1000 files have been selected. Please select a smaller area or change to Cruise View.';
                    this.setTitle(this.featurePageTitle);
                    this.featurePane.domNode.innerHTML = '<b>More than 1000 files have been selected. Please select a smaller area or change to Cruise View.</b>';

                    domStyle.set(this.requestDataFilesOrSurveysButton.domNode, 'display', 'none');
                }
                else {
                    domStyle.set(this.requestDataFilesOrSurveysButton.domNode, 'display', 'block');
                }
            },

            getLayerDisplayLabel: function(item) {
                return '<i><b>' + item.layerName + '</b></i>';
            },

            getItemDisplayLabel: function(item, uid) {
                if (this.layerMode == 'file') {
                    return this.getItemLabelSpan(item.value, uid);
                }
                else {
                    return this.getItemLabelSpan(item.value + ' (Instrument: ' + item.feature.attributes['Instrument Name'] + ')', uid);
                }
            },

            getItemLabelSpan: function(text, uid) {
                return '<span id="itemLabel-' + uid + '">' + text + '</span>';
            },

            requestDataFiles: function() {
                var items = this.storeModel.store.query({type: 'item'});
                var fileInfos = [];
                for (var i = 0; i < items.length; i++) {
                    fileInfos.push({
                        file: items[i].attributes['File Name'],
                        cruise: items[i].attributes['Cruise ID'],
                        ship: items[i].attributes['Ship Name'],
                        instrument: items[i].attributes['Instrument Name']
                    });
                }

                if (!this.requestDataDialog) {
                    this.requestDataDialog = new RequestDataDialog({style: 'width: 300px;'});
                }
                this.requestDataDialog.fileInfos = fileInfos;
                this.requestDataDialog.show();
            },

            requestDataFile: function() {
                var fileInfo = {
                    file: this.currentItem.attributes['File Name'],
                    cruise: this.currentItem.attributes['Cruise ID'],
                    ship: this.currentItem.attributes['Ship Name'],
                    instrument: this.currentItem.attributes['Instrument Name']
                };

                if (!this.requestDataDialog) {
                    this.requestDataDialog = new RequestDataDialog({style: 'width: 300px;'});
                }
                this.requestDataDialog.fileInfos = [fileInfo];
                this.requestDataDialog.show();
            },

            requestCruises: function() {
                var items = this.storeModel.store.query({type: 'item'});
                var cruiseInfos = [];
                for (var i = 0; i < items.length; i++) {
                    cruiseInfos.push([items[i].attributes['Cruise ID'], items[i].attributes['Instrument Name']]);
                }

                if (!this.requestDataDialog) {
                    this.requestDataDialog = new RequestDataDialog({style: 'width: 300px;'});
                }
                this.requestDataDialog.cruiseInfos = cruiseInfos;
                this.requestDataDialog.show();
            },

            requestCruise: function() {
                var cruiseInfo = [
                    [this.currentItem.attributes['Cruise ID']],
                    [this.currentItem.attributes['Instrument Name']]
                ];

                if (!this.requestDataDialog) {
                    this.requestDataDialog = new RequestDataDialog({style: 'width: 300px;'});
                }
                this.requestDataDialog.cruiseInfos = [cruiseInfo];
                this.requestDataDialog.show();
            },

            populateFeatureStore: function(results) {
                var numFeatures = 0;
                this.expandedNodePaths = [];
                for (var svcName in results) {
                    for (var layerName in results[svcName]) {

                        numFeatures += results[svcName][layerName].length;
                        for (var i = 0; i < results[svcName][layerName].length; i++) {
                            var item = results[svcName][layerName][i];
                            var layerKey = svcName + '/' + layerName;
                            var layerUrl = results[svcName][layerName][i].layerUrl;
                            //Create a layer "folder" node if it doesn't already exist
                            if (this.featureStore.query({id: layerName}).length === 0) {
                                this.featureStore.put({
                                    uid: ++this.uid,
                                    id: layerName,
                                    label: this.getLayerDisplayLabel(item),
                                    type: 'folder',
                                    parent: 'root'
                                });
                            }
                            //Create a cruise "folder" node if it doesn't already exist
                            var surveyId = item.feature.attributes['Cruise ID'];
                            var surveyKey = layerName + '/' + surveyId;
                            if (this.featureStore.query({id: surveyKey}).length === 0) {
                                this.featureStore.put({
                                    uid: ++this.uid,
                                    id: surveyKey,
                                    label: '<b>Cruise ID: ' + surveyId + '</b>',
                                    type: 'folder',
                                    parent: layerName
                                });
                            }

                            var instrumentKey;
                            if (this.layerMode == 'file') {
                                //Create an instrument "folder" node if it doesn't already exist
                                var instrument = item.feature.attributes['Instrument Name'];
                                instrumentKey = layerName + '/' + surveyId + '/' + instrument;
                                if (this.featureStore.query({id: instrumentKey}).length === 0) {
                                    this.featureStore.put({
                                        uid: ++this.uid,
                                        id: instrumentKey,
                                        label: '<b>Instrument: ' + instrument + '</b>',
                                        type: 'folder',
                                        parent: surveyKey
                                    });

                                    //Add this node to the list of nodes to be expanded to in constructFeatureTree
                                    this.expandedNodePaths.push(['root', layerName, surveyKey, instrumentKey]);
                                }
                            }

                            //Add the current item to the store
                            this.featureStore.put({
                                uid: ++this.uid,
                                id: this.uid,
                                //TODO: point to the magnifying glass image using a module path
                                displayLabel: this.getItemDisplayLabel(item, this.uid),
                                label: this.getItemDisplayLabel(item, this.uid) + " <a id='zoom-" + this.uid + 
                                    "' href='#' class='zoomto-link'><img src='" + this.magnifyingGlassIconUrl + "' title='Zoom to this feature'></a>",
                                layerUrl: layerUrl,
                                layerKey: layerKey,
                                attributes: item.feature.attributes,
                                parent: this.layerMode == 'file' ? instrumentKey : surveyKey,
                                type: 'item'
                            });
                        }
                    }
                }
                return numFeatures;
            },

            constructFeatureTree: function() {
                this.inherited(arguments);

                if (this.layerMode == 'file') {
                    //Expand the tree to the instrument level. All nodes will be opened except for these.
                    this.tree.set('paths', this.expandedNodePaths);
                }
                else {
                    this.tree.expandAll();
                }
            },

            setLayerMode: function(layerMode) {
                this.layerMode = layerMode;
                if (layerMode == 'cruise') {
                    this.requestDataFilesOrSurveysButton.set('label', 'Request These Cruises');
                    this.requestDataFileOrSurveyButton.set('label', 'Request This Cruise');
                }
                else {
                    this.requestDataFilesOrSurveysButton.set('label', 'Request These Data Files');
                    this.requestDataFileOrSurveyButton.set('label', 'Request This Data File');
                }
            }
        });
    }
);
