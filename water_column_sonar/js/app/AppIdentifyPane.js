define([
    'dojo/_base/declare', 
    'dojo/_base/config', 
    'dojo/_base/array', 
    'dojo/string', 
    'ngdc/identify/IdentifyPane', 
    'dojo/topic', 
    'dojo/on',
    'dojo/dom',
    'esri/dijit/Popup',    
    'dojo/_base/lang', 
    'dojo/store/Memory',
    'dojo/store/Observable',
    'dijit/registry',
    'dijit/tree/ObjectStoreModel',
    'dijit/layout/BorderContainer',
    'dijit/layout/ContentPane',
    'dijit/form/Button',
    'dijit/Tree',
    'dijit/TooltipDialog',
    'dijit/popup',
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
        on,
        dom,
        Popup, 
        lang, 
        Memory,
        Observable,
        registry,
        ObjectStoreModel,
        BorderContainer,
        ContentPane,
        Button,
        Tree,
        TooltipDialog,
        popup,
        domStyle, 
        RequestDataDialog
        ){

        return declare([IdentifyPane], {

            constructor: function() {
                this.magnifyingGlassIconUrl = config.app.ngdcDijitsUrl + '/identify/images/magnifier.png';

                topic.subscribe('/identify/file/results', lang.hitch(this, function (results) {
                    //console.log('identify results: ', results);
                    if (this.enabled) {
                        this.fileFeaturesStale = false;
                        this.fileResults = results;
                        this.showFileResults(results);
                    }
                }));

                this.fileFeaturesStale = true;
                this.isFileFeatures = false;
            },

            close: function() {
                this.inherited(arguments);
                this.hideImagePreview();
            },

            postCreate: function() {
                this.inherited(arguments);
                domStyle.set(this.domNode, 'height', '350px');
                domStyle.set(this.domNode, 'width', '450px');

                domStyle.set(this.featurePageBottomBar.domNode, 'height', '30px');

                this.fileFeaturePage = new ContentPane({
                    style: 'height: 100%; width: 100%; padding: 0px;',
                    'class': 'identifyPane-featurePage'
                }).placeAt(this.containerNode);
                this.stackContainer.addChild(this.fileFeaturePage);

                //Create a BorderContainer for the fileFeaturePage.
                //The top part (featurePane) contains the tree; the bottom part is a spacer for the resize handle and buttons
                var bc = new BorderContainer({
                    style: 'height: 100%; width: 100%; padding: 0px;',
                    gutters: false
                });

                this.fileFeaturePane = new ContentPane({
                    region: 'center',
                    style: 'background: #EEE; border: 1px solid #BFBFBF; padding: 2px;'
                });
                bc.addChild(this.fileFeaturePane);

                this.fileFeaturePageBottomBar = new ContentPane({
                    region: 'bottom',
                    style: 'height: 30px; border: 0px !important; padding: 2px !important;'
                });
                bc.addChild(this.fileFeaturePageBottomBar);
                bc.placeAt(this.fileFeaturePage);

                this.imageThumbnailDialog = new TooltipDialog({
                    content: 'No image available'
                });

                //Initialize the fileFeaturePage with a back button
                this.fileFeaturePageBackButton = new Button({
                    label: 'Back',
                    style: 'bottom: 5px; left: 5px;',
                    onClick: lang.hitch(this, function(){
                        this.isFileFeatures = false;
                        this.requestFileOrCruiseButton.set('label', 'Request This Cruise');
                        domStyle.set(this.showFileFeaturesButton.domNode, 'display', ''); //Show the "Show Files" button
                        this.showInfo(this.currentCruiseItem);
                        this.hideImagePreview();
                    })
                }).placeAt(this.fileFeaturePageBottomBar);

                //Override the onClick method of the existing infoPage backButton to go back to either the main cruise featurePage or the fileFeaturePage.
                this.backButton.onClick = lang.hitch(this, function(){
                    if (this.isFileFeatures) {
                        this.setTitle(this.fileFeaturePageTitle);
                        
                        //Put this selectChild on a very short timer. This seems to solve the "blank page" problem when hitting the back button.
                        setTimeout(lang.hitch(this, function() {
                            this.stackContainer.selectChild(this.fileFeaturePage);
                        }), 10);                        
                        this.showImagePreview();
                    } else {
                        this.setTitle(this.featurePageTitle);

                        //Put this selectChild on a very short timer. This seems to solve the "blank page" problem when hitting the back button.
                        setTimeout(lang.hitch(this, function() {
                            this.stackContainer.selectChild(this.featurePage);
                        }), 10);
                    }
                });

                //Add a button to the main cruise feature page to request cruises
                this.requestCruisesButton = new Button({
                    label: 'Request These Cruises',
                    style: 'bottom: 5px; left: 5px;',
                    onClick: lang.hitch(this, function(){    
                        this.requestCruises();
                    })
                }).placeAt(this.featurePageBottomBar);

                //Add a button to the files page to request files
                this.requestFilesButton = new Button({
                    label: 'Request These Files',
                    style: 'bottom: 5px; left: 5px;',
                    onClick: lang.hitch(this, function(){    
                        this.requestDataFiles();
                    })
                }).placeAt(this.fileFeaturePageBottomBar);

                //Button to identify the files for the current identify geometry
                this.showFileFeaturesButton = new Button({
                    label: 'Show Files',
                    style: 'bottom: 5px;',
                    onClick: lang.hitch(this, function(){
                        this.isFileFeatures = true;
                        this.currentCruiseItem = this.currentItem;

                        //Pass message to identify.js to identify for files
                        this.cruiseId = this.currentItem.attributes['Cruise ID'];
                        this.instrument = this.currentItem.attributes['Instrument Name'];
                        topic.publish('/water_column_sonar/identifyForFiles', this.identify.searchGeometry, this.cruiseId, this.instrument);   

                        this.showImagePreview();             
                    })
                }).placeAt(this.infoPageBottomBar);

                this.requestFileOrCruiseButton = new Button({
                    label: 'Request This Cruise',
                    style: 'bottom: 25px; left: 15px;',
                    onClick: lang.hitch(this, function(){
                        if (this.isFileFeatures) {
                            this.requestDataFile();
                        }
                        else {
                            this.requestCruise();
                        }
                    })
                }).placeAt(this.infoPageBottomBar);

                //Initialize a Memory store with a root only
                this.fileFeatureStore = new Observable(Memory({
                    data: [
                        {id: 'root', label: 'root'}
                    ],
                    getChildren: function(object){
                        return this.query({parent: object.id});
                    }
                }));

                //Create the store model used by the file Tree
                this.fileStoreModel = new ObjectStoreModel({
                    store: this.fileFeatureStore,
                    query: {id: 'root'},
                    labelAttr: 'label',
                    mayHaveChildren: function(item) {
                        //items of type 'item' never have children.
                        return (item.type !== 'item');
                    }
                });

                //Create the Request Data Dialog
                this.requestDataDialog = new RequestDataDialog({style: 'width: 300px;'});
            },

            showResults: function() {
                this.featurePane.domNode.innerHTML = '';

                this.fileFeaturesStale = true;
                this.isFileFeatures = false;

                this.inherited(arguments);

                this.featurePageTitle = 'Identified Cruises (' + this.numFeatures + ')';
                this.setTitle(this.featurePageTitle);

                if (this.numFeatures > 0) {
                    this.showRequestCruisesButton();
                }
                else {
                    this.hideRequestCruisesButton();
                }

                this.imageThumbnailDialog.set('content', 'No image available');
            },

            showRequestCruisesButton: function() {
                domStyle.set(this.requestCruisesButton.domNode, 'display', ''); //Display the request data button
            },

            hideRequestCruisesButton: function() {
                domStyle.set(this.requestCruisesButton.domNode, 'display', 'none'); //Display the request data button
            },

            showFileResults: function(resultCollection) {
                logger.debug('inside showFileResults...');

                this.fileFeaturePane.domNode.innerHTML = '';
                this.showFileFeaturePage();

                //Destroy the existing tree and clear the feature store
                if (this.fileFeatureTree) {
                    this.fileFeatureTree.destroyRecursive();
                }
                this.clearFileFeatureStore();

                //Populate the store used by the tree
                this.numFileFeatures = this.populateFileFeatureStore(resultCollection.results);

                //Construct a new tree and place it in the feature pane.
                this.constructFileFeatureTree();

                if (this.identify.searchGeometry.type === 'point') {
                    this.fileFeaturePageTitle = 'Files for ' + this.cruiseId + ' near clicked point (' + this.numFileFeatures + ')';
                } else {
                    this.fileFeaturePageTitle = 'Files for ' + this.cruiseId + ' inside polygon (' + this.numFileFeatures + ')'; 
                }
                this.setTitle(this.fileFeaturePageTitle);

                if (this.numFileFeatures >= 1000) {

                    //Destroy the existing tree and clear the feature store
                    if (this.fileFeatureTree) {
                        this.fileFeatureTree.destroyRecursive();
                    }
                    this.clearFileFeatureStore();

                    this.fileFeaturePageTitle = 'Too Many Files Identified';
                    this.setTitle(this.fileFeaturePageTitle);
                    this.fileFeaturePane.domNode.innerHTML = '<b>More than 1000 files have been identified. Unable to display all results. Please select a smaller area.</b>';

                    domStyle.set(this.requestFileOrCruiseButton.domNode, 'display', 'none');
                }
                else {
                    domStyle.set(this.requestFileOrCruiseButton.domNode, 'display', '');
                }
            },

            clearFileFeatureStore: function() {
                //Remove all items except for the root
                var allItems = this.fileFeatureStore.query();
                array.forEach(allItems, lang.hitch(this, function(item) {
                    if (item.id !== 'root') {
                        this.fileFeatureStore.remove(item.id);
                    }
                }));
            },

            showFileFeaturePage: function() {
                this.stackContainer.selectChild(this.fileFeaturePage);
            },

            populateFeatureStore: function(results) {
                var totalFeatures = 0;
                var numFeaturesForLayer = 0;

                this.expandedNodePaths = [];
                for (var svcName in results) {
                    if (results.hasOwnProperty(svcName)) {
                        for (var layerName in results[svcName]) {
                            if (results[svcName].hasOwnProperty(layerName)) {

                                numFeaturesForLayer = results[svcName][layerName].length;
                                totalFeatures += numFeaturesForLayer;

                                for (var i = 0; i < results[svcName][layerName].length; i++) {
                                    var item = results[svcName][layerName][i];
                                    var layerKey = svcName + '/' + layerName;
                                    var layerUrl = results[svcName][layerName][i].layerUrl;

                                    //Create a layer "folder" node if it doesn't already exist
                                    if (this.featureStore.query({id: layerName}).length === 0) {
                                        this.featureStore.put({
                                            uid: ++this.uid,
                                            id: layerName,
                                            label: this.getLayerDisplayLabel(item, numFeaturesForLayer),
                                            type: 'folder',
                                            parent: 'root'
                                        });
                                    }
                                    //Create a cruise "folder" node if it doesn't already exist
                                    var surveyId = item.feature.attributes['Cruise ID'];
                                    var surveyYear = this.getYear(item.feature.attributes['End Date']);
                                    var surveyKey = layerName + '/' + surveyId;
                                    if (this.featureStore.query({id: surveyKey}).length === 0) {
                                        this.featureStore.put({
                                            uid: ++this.uid,
                                            id: surveyKey,
                                            label: '<b>Cruise ID: ' + surveyId + ' (' + surveyYear + ')</b>',
                                            type: 'folder',
                                            parent: layerName
                                        });
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
                                        parent: surveyKey,
                                        type: 'item'
                                    });
                                }
                            }
                        }
                    }
                }
                return totalFeatures;
            },

            populateFileFeatureStore: function(results) {
                var totalFeatures = 0;
                var numFeaturesForLayer = 0;
                this.fileExpandedNodePaths = [];

                for (var svcName in results) {
                    if (results.hasOwnProperty(svcName)) {
                        for (var layerName in results[svcName]) {
                            if (results[svcName].hasOwnProperty(layerName)) {

                                numFeaturesForLayer = results[svcName][layerName].length;
                                totalFeatures += numFeaturesForLayer;

                                //numFeatures += results[svcName][layerName].length;
                                for (var i = 0; i < results[svcName][layerName].length; i++) {
                                    var item = results[svcName][layerName][i];
                                    var layerKey = svcName + '/' + layerName;
                                    var layerUrl = results[svcName][layerName][i].layerUrl;
                                    var surveyId = item.feature.attributes['Cruise ID'];
                                    var instrumentKey;

                                    //Create an instrument "folder" node if it doesn't already exist
                                    var instrument = item.feature.attributes['Instrument Name'];
                                    instrumentKey = layerName + '/' + surveyId + '/' + instrument;
                                    if (this.fileFeatureStore.query({id: instrumentKey}).length === 0) {
                                        this.fileFeatureStore.put({
                                            uid: ++this.uid,
                                            id: instrumentKey,
                                            label: '<b>Instrument: ' + instrument + '</b>',
                                            type: 'folder',
                                            parent: 'root'
                                        });
                                    }
                                    
                                    //Add the current item to the store
                                    this.fileFeatureStore.put({
                                        uid: ++this.uid,
                                        id: this.uid,
                                        //TODO: point to the magnifying glass image using a module path
                                        displayLabel: this.getItemDisplayLabel(item, this.uid),
                                        label: this.getItemDisplayLabel(item, this.uid) + " <a id='zoom-" + this.uid + 
                                            "' href='#' class='zoomto-link'><img src='" + this.magnifyingGlassIconUrl + "' title='Zoom to this feature'></a>",
                                        layerUrl: layerUrl,
                                        layerKey: layerKey,
                                        attributes: item.feature.attributes,
                                        parent: instrumentKey,
                                        type: 'item'
                                    });
                                }
                            }
                        }
                    }
                }
                return totalFeatures;
            },

            constructFeatureTree: function() {
                //Construct a new Tree
                this.tree = new Tree({
                    model: this.storeModel,
                    showRoot: false,
                    persist: false,
                    autoExpand: false, //seems to be more efficient to call expandAll() later.
                    openOnClick: true,
                    onClick: lang.hitch(this, function(item) {
                        this.requestFileOrCruiseButton.set('label', 'Request This Cruise');
                        domStyle.set(this.showFileFeaturesButton.domNode, 'display', ''); //Show the "Show Files" button
                        this.showInfo(item);
                    }),
                    getIconClass: function(item, opened) {
                        if (item.type === 'item') {
                            return 'iconBlank';
                        }
                        else if (item.type === 'folder') {
                            return (opened ? 'dijitFolderOpened' : 'dijitFolderClosed');
                        }
                        else {
                            return 'dijitLeaf';
                        }
                    },
                    _createTreeNode: lang.hitch(this, function(args){
                        return new this.CustomTreeNode(args);
                    })
                });

                //Attach the onMouseOver handler for highlighting features.
                //It's pausable so we can pause it when hiding the dijit to avoid extraneous mouseovers firing
                this.onMouseOverHandler = on.pausable(this.tree, 'mouseOver', lang.hitch(this, function(item) {
                    this.onMouseOverNode(item);
                }));
                this.tree.placeAt(this.featurePane);
                this.tree.startup();
                this.tree.expandAll();
            },

            constructFileFeatureTree: function() {
                //Construct a new Tree
                this.fileFeatureTree = new Tree({
                    model: this.fileStoreModel,
                    showRoot: false,
                    persist: false,
                    autoExpand: false, //seems to be more efficient to call expandAll() later.
                    openOnClick: true,
                    onClick: lang.hitch(this, function(item) {
                        this.requestFileOrCruiseButton.set('label', 'Request This Data File');
                        domStyle.set(this.showFileFeaturesButton.domNode, 'display', 'none'); //Hide the "Show Files" button
                        this.showInfo(item);
                    }),
                    getIconClass: function(item, opened) {
                        if (item.type === 'item') {
                            return 'iconBlank';
                        }
                        else if (item.type === 'folder') {
                            return (opened ? 'dijitFolderOpened' : 'dijitFolderClosed');
                        }
                        else {
                            return 'dijitLeaf';
                        }
                    },
                    _createTreeNode: lang.hitch(this, function(args){
                        return new this.CustomTreeNode(args);
                    })
                });

                //Attach the onMouseOver handler for highlighting features.
                //It's pausable so we can pause it when hiding the dijit to avoid extraneous mouseovers firing
                this.onMouseOverHandler = on.pausable(this.fileFeatureTree, 'mouseOver', lang.hitch(this, function(item) {
                    this.onMouseOverFileNode(item);
                }));
                this.fileFeatureTree.placeAt(this.fileFeaturePane);
                this.fileFeatureTree.startup();

                this.fileFeatureTree.expandAll();
                //this.fileFeatureTree.set('paths', this.fileExpandedNodePaths); //Expand the tree to the instrument level. All nodes will be opened except for these.
            },

            onMouseOverFileNode: function(evt) {
                this.onMouseOverNode(evt); //Call the main onMouseOverNode function

                //The event references the TreeRow. Get the enclosing TreeNode widget.
                var treeNode = registry.getEnclosingWidget(evt.target);
                var item = treeNode.item;

                //Display the current image thumbnail in the popup dialog
                if (item && item.type === 'item') {
                    if (item.attributes['Image Thumbnail'] === 'Null') {
                        this.imageThumbnailDialog.set('content', 'No image available');
                    } else {
                        this.imageThumbnailDialog.set('content', '<a href="' + item.attributes['Image Full Size'] + '" target="_blank"><img src="' + 
                            item.attributes['Image Thumbnail'] + '" width="300"></img></a>');
                    }
                }
            },

            showImagePreview: function() {
                //Show the image thumbnail dialog   
                popup.open({
                    popup: this.imageThumbnailDialog,
                    around: this.domNode,
                    orient: ['below']
                });    
            },

            hideImagePreview: function() {
                popup.close(this.imageThumbnailDialog);
            },
            
            showInfoPage: function() {
                this.inherited(arguments);
                this.hideImagePreview();
            },

            getLayerDisplayLabel: function(item, count) {

                if (item.layerName === 'File Geometries') {
                    return '<i><b>Files (' + this.formatCount(count, 'file') + ')</b></i>';
                }                
                else if (item.layerName === 'NMFS') {
                    return '<i><b>NMFS (' + this.formatCount(count, 'cruise') + ')</b></i>';
                }
                else if (item.layerName === 'OER') {
                    return '<i><b>OER (' + this.formatCount(count, 'cruise') + ')</b></i>';
                }
                else if (item.layerName === 'UNOLS') {
                    return '<i><b>UNOLS (' + this.formatCount(count, 'cruise') + ')</b></i>';
                }
                else if (item.layerName === 'NOS') {
                    return '<i><b>Other NOAA (' + this.formatCount(count, 'cruise') + ')</b></i>';
                }
                else if (item.layerName === 'Other Sources') {
                    return '<i><b>Other (' + this.formatCount(count, 'cruise') + ')</b></i>';
                }
                else if (item.layerName === 'Non-U.S.') {
                    return '<i><b>Non-U.S. (' + this.formatCount(count, 'cruise') + ')</b></i>';
                }
            },

            formatCount: function(count, noun) {
                if (count > 1) {
                    if (noun === 'cruise') {
                        return count + ' cruises';
                    } else {
                        return count + ' files';
                    }
                } else {
                    if (noun === 'cruise') {
                        return count + ' cruise';
                    } else {
                        return count + ' file';
                    }
                }
            },

            getItemDisplayLabel: function(item, uid) {
                if (this.isFileFeatures) {
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
                var items = this.fileStoreModel.store.query({type: 'item'});
                var fileInfos = [];
                for (var i = 0; i < items.length; i++) {
                    fileInfos.push({
                        file: items[i].attributes['File Name'],
                        cruise: items[i].attributes['Cruise ID'],
                        ship: items[i].attributes['Ship Name'],
                        instrument: items[i].attributes['Instrument Name']
                    });
                }
                var cruiseList = [this.currentItem.attributes['Cruise ID']];
                var instrumentList = [this.currentItem.attributes['Instrument Name']];

                this.requestDataDialog.fileInfos = fileInfos;
                this.requestDataDialog.cruiseInfos = null;
                this.requestDataDialog.geometry = null;
                this.requestDataDialog.hideGeometryCheckBox();
                this.requestDataDialog.hideFullCruiseWarning();
                this.requestDataDialog.displayFileCountAndSize(cruiseList, instrumentList, this.identify.searchGeometry, fileInfos.length);
                this.requestDataDialog.show();
            },

            requestDataFile: function() {
                var fileInfo = {
                    file: this.currentItem.attributes['File Name'],
                    cruise: this.currentItem.attributes['Cruise ID'],
                    ship: this.currentItem.attributes['Ship Name'],
                    instrument: this.currentItem.attributes['Instrument Name']
                };

                this.requestDataDialog.fileInfos = [fileInfo];
                this.requestDataDialog.cruiseInfos = null;
                this.requestDataDialog.geometry = null;
                this.requestDataDialog.hideGeometryCheckBox();
                this.requestDataDialog.hideFullCruiseWarning();
                this.requestDataDialog.displayFileCountAndSize(null, null, null);
                this.requestDataDialog.show();
            },

            requestCruises: function() {
                var items = this.storeModel.store.query({type: 'item'});
                var cruiseInfos = [];
                for (var i = 0; i < items.length; i++) {
                    cruiseInfos.push([items[i].attributes['Cruise ID'], items[i].attributes['Instrument Name']]);
                }
                var cruiseList = this.getCruiseList(cruiseInfos);
                var instrumentList = this.getInstrumentList(cruiseInfos);

                this.requestDataDialog.cruiseInfos = cruiseInfos;
                this.requestDataDialog.fileInfos = null;
                this.requestDataDialog.geometry = this.identify.searchGeometry;
                if (this.identify.searchGeometry.type === 'point') {
                    this.requestDataDialog.showFullCruiseWarning();
                    this.requestDataDialog.hideGeometryCheckBox();
                    this.requestDataDialog.displayFileCountAndSize(cruiseList, instrumentList, null);
                }
                else {
                    if (this.requestDataDialog.chkPassGeometry.checked) {
                        this.requestDataDialog.hideFullCruiseWarning();
                        this.requestDataDialog.displayFileCountAndSize(cruiseList, instrumentList, this.identify.searchGeometry);
                    } else {
                        this.requestDataDialog.showFullCruiseWarning();
                        this.requestDataDialog.displayFileCountAndSize(cruiseList, instrumentList, null);
                    }
                    this.requestDataDialog.showGeometryCheckBox();
                }
                this.requestDataDialog.show();
            },

            requestCruise: function() {
                var cruiseInfo = [
                    this.currentItem.attributes['Cruise ID'],
                    this.currentItem.attributes['Instrument Name']
                ];
                var cruiseInfos = [cruiseInfo];
                this.requestDataDialog.cruiseInfos = cruiseInfos;
                var cruiseList = this.getCruiseList(cruiseInfos);
                var instrumentList = this.getInstrumentList(cruiseInfos);

                this.requestDataDialog.fileInfos = null;
                this.requestDataDialog.geometry = this.identify.searchGeometry;
                if (this.identify.searchGeometry.type === 'point') {
                    this.requestDataDialog.showFullCruiseWarning();
                    this.requestDataDialog.hideGeometryCheckBox();
                    this.requestDataDialog.displayFileCountAndSize(cruiseList, instrumentList, null);
                }
                else {
                    if (this.requestDataDialog.chkPassGeometry.checked) {
                        this.requestDataDialog.hideFullCruiseWarning();
                        this.requestDataDialog.displayFileCountAndSize(cruiseList, instrumentList, this.identify.searchGeometry);
                    } else {
                        this.requestDataDialog.showFullCruiseWarning();
                        this.requestDataDialog.displayFileCountAndSize(cruiseList, instrumentList, null);
                    }
                    this.requestDataDialog.showGeometryCheckBox();
                }
                this.requestDataDialog.show();
            },

            getCruiseList: function(cruiseInfos) {
                var cruiseList = [];

                array.forEach(cruiseInfos, function(cruiseInfo) {
                    var cruise = cruiseInfo[0];

                    if (array.indexOf(cruiseList, cruise) === -1) {
                        cruiseList.push(cruise);
                    }
                });
                return cruiseList;
            },

            getInstrumentList: function(cruiseInfos) {
                var instrumentList = [];

                array.forEach(cruiseInfos, function(cruiseInfo) {
                    var instrument = cruiseInfo[1];

                    if (array.indexOf(instrumentList, instrument) === -1) {
                        instrumentList.push(instrument);
                    }
                });
                return instrumentList;
            },

            getYear: function(dateStr) {
                var tokens = dateStr.split('/');
                if (tokens.length === 3) {
                    return tokens[2];
                } else {
                    return '';
                }
            }
        });
    }
);
