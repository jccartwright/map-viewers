define(["dojo/_base/declare", "dojo/_base/array", "dojo/string", "ngdc/identify/IdentifyPane", "dojo/topic", "esri/dijit/Popup", "dojo/_base/lang", "dijit/form/Button",
    "dojo/dom-style", "app/RequestDataDialog"],
    function(declare, array, string, IdentifyPane, topic, Popup, lang, Button,
             domStyle, RequestDataDialog){

        return declare([IdentifyPane], {

            postCreate: function() {
                this.inherited(arguments);
                domStyle.set(this.domNode, 'height', '350px');
                domStyle.set(this.domNode, 'width', '400px');

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
                    this.featurePageTitle = "Identified Features (" + this.numFeatures + "+, results limited to 1000)";
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
                console.log('inside requestData...');
                var items = this.storeModel.store.query({type: 'item'});
                var filenames = [];
                for (var i = 0; i < items.length; i++) {
                    filenames.push(items[i].displayLabel);
                }

                if (!this.requestDataDialog) {
                    this.requestDataDialog = new RequestDataDialog({style: 'width: 300px;'});
                }
                this.requestDataDialog.filenames = filenames;
                this.requestDataDialog.show();
            },

            requestDataFile: function() {
                var filename = this.currentItem.displayLabel;

                if (!this.requestDataDialog) {
                    this.requestDataDialog = new RequestDataDialog({style: 'width: 300px;'});
                }
                this.requestDataDialog.filenames = [filename];
                this.requestDataDialog.show();
            },

            populateFeatureStore: function(results) {
                console.log('Inside custom populateFeatureStore...');
                var numFeatures = 0;
                this.uid = 0;
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
                            var surveyId = item.feature.attributes['Survey ID'];
                            var surveyKey = layerName + '/' + surveyId;
                            if (this.featureStore.query({id: surveyKey}).length == 0) {
                                this.featureStore.put({
                                    uid: ++this.uid,
                                    id: surveyKey,
                                    label: '<b>Survey: ' + surveyId + '</b>',
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
                            }
                            //Add the current item to the store, with the layerName as parent
                            this.featureStore.put({
                                uid: ++this.uid,
                                id: this.uid,
                                //TODO: point to the magnifying glass image using a module path
                                displayLabel: this.getItemDisplayLabel(item),
                                label: this.getItemDisplayLabel(item) + " <a id='zoom-" + this.uid + "' href='#' class='zoomto-link'><img src='js/ngdc/identify/images/magnifying-glass.png'></a>",
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
            }
        });
    }
);