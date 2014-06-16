define([
    "dojo/_base/declare", 
    "dojo/_base/config", 
    "dojo/_base/array", 
    "dojo/string", 
    "ngdc/identify/IdentifyPane", 
    "dojo/topic", 
    "esri/dijit/Popup",
    "dojo/_base/lang", 
    "dijit/form/Button",
    "dojo/dom-style", 
    "app/RequestDataDialog"
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
                this.magnifyingGlassIconUrl = config.app.ngdcDijitsUrl + "/identify/images/magnifier.png";
            },

            postCreate: function() {
                this.inherited(arguments);
                domStyle.set(this.domNode, 'height', '350px');
                domStyle.set(this.domNode, 'width', '450px');

                domStyle.set(this.featurePageBottomBar.domNode, 'height', '30px');
                //this.featurePageBottomBar.style = 'height: 50px;';

                this.requestDataFilesButton = new Button({
                    label: "Request These Data Files",
                    style: "bottom: 5px; left: 15px;",
                    onClick: lang.hitch(this, function(){
                        this.requestDataFiles();
                    })
                }).placeAt(this.featurePageBottomBar);

                this.requestDataFileButton = new Button({
                    label: "Request This Data File",
                    style: "bottom: 25px; left: 15px;",
                    onClick: lang.hitch(this, function(){
                        this.requestDataFile();
                    })
                }).placeAt(this.infoPageBottomBar);
            },

            showResults: function(resultCollection) {
                this.inherited(arguments);
                if (this.numFeatures >= 1000) {
                    this.featurePageTitle = "Identified Features (results limited to 1000 files. Zoom in for greater detail)";
                    this.setTitle(this.featurePageTitle);
                }
            },

            getLayerDisplayLabel: function(item) {
                return '<i><b>' + item.layerName + '</b></i>';
            },

            getItemDisplayLabel: function(item) {
                return item.value;
            },

            requestDataFiles: function() {
                var items = this.storeModel.store.query({type: 'item'});
                var fileInfos = [];
                for (var i = 0; i < items.length; i++) {
                    fileInfos.push({
                        file: items[i].displayLabel,
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
                    file: this.currentItem.displayLabel,
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
                            if (this.featureStore.query({id: layerName}).length == 0) {
                                this.featureStore.put({
                                    uid: ++this.uid,
                                    id: layerName,
                                    label: this.getLayerDisplayLabel(item),
                                    type: 'folder',
                                    parent: 'root'
                                });
                            }
                            //Create a survey "folder" node if it doesn't already exist
                            var surveyId = item.feature.attributes['Cruise ID'];
                            var surveyKey = layerName + '/' + surveyId;
                            if (this.featureStore.query({id: surveyKey}).length == 0) {
                                this.featureStore.put({
                                    uid: ++this.uid,
                                    id: surveyKey,
                                    label: '<b>Cruise ID: ' + surveyId + '</b>',
                                    type: 'folder',
                                    parent: layerName
                                });
                            }
                            //Create an instrument "folder" node if it doesn't already exist
                            var instrument = item.feature.attributes['Instrument Name'];
                            var instrumentKey = layerName + '/' + surveyId + '/' + instrument;
                            if (this.featureStore.query({id: instrumentKey}).length == 0) {
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

                            //Add the current item to the store, with the layerName as parent
                            this.featureStore.put({
                                uid: ++this.uid,
                                id: this.uid,
                                //TODO: point to the magnifying glass image using a module path
                                displayLabel: this.getItemDisplayLabel(item),
                                label: this.getItemDisplayLabel(item) + " <a id='zoom-" + this.uid + "' href='#' class='zoomto-link'><img src='" + this.magnifyingGlassIconUrl + "'></a>",
                                layerUrl: layerUrl,
                                layerKey: layerKey,
                                attributes: item.feature.attributes,
                                parent: instrumentKey,
                                type: 'item'
                            });
                        }
                    }
                }
                return numFeatures;
            },

            constructFeatureTree: function() {
                this.inherited(arguments);
                //Expand the tree to the instrument level. All nodes will be opened except for these.
                this.tree.set('paths', this.expandedNodePaths);
            }
        });
    }
);
