define([
    'dojo/_base/declare', 
    'dojo/_base/config', 
    'dojo/_base/array', 
    'dojo/string',
    'dojo/topic', 
    'dojo/_base/lang',
    'dojo/dom-style',
    'dijit/form/Button', 
    'ngdc/identify/IdentifyPane',
    'app/RequestDataDialog'
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
        IdentifyPane,
        RequestDataDialog
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

                this.extractDataButton = new Button({
                    label: 'Request These Data',
                    style: 'bottom: 5px; left: 15px;',
                    iconClass: 'downloadIcon',
                    onClick: lang.hitch(this, function(){
                        this.requestDataFiles();
                    })
                }).placeAt(this.featurePageBottomBar);

                //Add a button to the main deployment feature page to request cruises
                this.extractSingleDatasetButton = new Button({
                    label: 'Request This Data Collection',
                    style: 'bottom: 5px; left: 5px;',
                    iconClass: 'downloadIcon',
                    onClick: lang.hitch(this, function() {
                        //var itemId = this.currentItem.attributes['Data Collections ID'];
                        this.requestDataFile();
                    })
                }).placeAt(this.infoPageBottomBar);

                //Create the Request Data Dialog
                this.requestDataDialog = new RequestDataDialog({style: 'width: 300px;'});
            },

            showResults: function() {
                this.inherited(arguments);
            },

            getLayerDisplayLabel: function(item) {
                return '<i><b>' + this.getFolderName(item.formatter) + ' (' + this.formatCountString(this.folderCounts[this.getFolderName(item.formatter)]) + ')</b></i>';
            },

            getFolderName: function(layerKey) {
                if (layerKey === 'PAD/Data Collections') {
                    return 'Passive Acoustic Data';
                }
                else if (layerKey === 'MPA Inventory/Major Federal Marine Protected Areas') {
                    return 'Major Federal Marine Protected Areas';
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
                if (item.formatter === 'PAD/Data Collections') {
                    return this.getItemLabelSpan(item.feature.attributes['Data Collection Name'], uid);
                }
                else if (item.formatter === 'MPA Inventory/Major Federal Marine Protected Areas') {
                    return this.getItemLabelSpan(item.feature.attributes['Site Name'], uid);
                }
            },

            getItemLabelSpan: function(text, uid) {
                return '<span id="itemLabel-' + uid + '">' + text + '</span>';
            },

            populateFeatureStore: function(results) {
                var totalFeatures = 0;
                var numFeaturesForLayer = 0;
                this.expandedNodePaths = [];

                this.computeFolderCounts(results);

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
                                    objectIdField: item.objectIdField,
                                    parent: layerName,
                                    type: 'item'
                                });
                            }
                        }
                    }
                }
                return totalFeatures;
            },

            computeFolderCounts: function(results) {
                this.folderCounts = {};
                for (var i = 0; i < this.identify.layerIds.length; i++) { //Iterate through the layerIds, specified in Identify.js. This maintains the desired ordering of the layers.
                    var svcName = this.identify.layerIds[i];
                    for (var layerName in results[svcName]) {
                        if (results[svcName].hasOwnProperty(layerName)) {
                            var layerKey = svcName + '/' + layerName;
                            var folderName = this.getFolderName(layerKey);
                            if (!this.folderCounts[folderName]) {
                                this.folderCounts[folderName] = 0;
                            }
                            this.folderCounts[folderName] += results[svcName][layerName].length;
                        }
                    }
                }
            },

            // extractData: function(itemId /*Optional data collection id*/) {
            //     console.log('extractData ' + itemId);

            //     // var filterCriteria = this.constructFilterCriteria(itemId);
            //     // if (filterCriteria.items.length > 0) {
            //     //     this.submitFormToNext(filterCriteria);
            //     // }

            //     //filterCriteria = this.replaceWildcardsAndSubmit(filterCriteria);
            // },

            requestDataFiles: function() {
                var items = this.storeModel.store.query({type: 'item'});
                var fileInfos = [];
                for (var i = 0; i < items.length; i++) {
                    fileInfos.push({
                        file: items[i].attributes['Data Collection Name']
                    });
                }
                this.requestDataDialog.fileInfos = fileInfos;
                this.requestDataDialog.show();
            },

            requestDataFile: function() {
                var fileInfo = {
                    file: this.currentItem.attributes['Data Collection Name'],
                };

                this.requestDataDialog.fileInfos = [fileInfo];
                this.requestDataDialog.show();
            },

            // submitFormToNext: function(postBody) {
            //     console.debug("sending order via form submission to NEXT: ", postBody);
                
            //     var url = "https://www.ngdc.noaa.gov/next-web/orders/create";

            //     //create a new form element and submit it.
            //     var form = document.createElement("form");
            //     form.action = url;
            //     form.method = 'POST';
            //     form.target = '_blank';

            //     //JSON payload goes in "order" parameter
            //     var inputElement = document.createElement("textarea");
            //     inputElement.name = "order";
            //     inputElement.value = JSON.stringify(postBody);

            //     form.appendChild(inputElement);
            //     form.style.display = 'none';
            //     document.body.appendChild(form);
            //     form.submit();

            //     //once the form is sent, it's useless to keep it.
            //     document.body.removeChild(form);
            // }
        });
    }
);