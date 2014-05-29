define([
    "dojo/_base/declare", 
    "dojo/_base/config", 
    "dojo/_base/array", 
    "dojo/string",
    "dojo/topic", 
    "dojo/_base/lang",
    "dojo/dom-style",
    "dijit/form/Button", 
    "ngdc/identify/IdentifyPane", 
    "app/RequestDataDialog"
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
                this.magnifyingGlassIconUrl = config.app.ngdcDijitsUrl + "/identify/images/magnifier.png";
            },

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

            getLayerDisplayLabel: function(item, count) {

                if (item.layerName == 'Multibeam Bathymetric Surveys') {
                    return '<i><b>Multibeam Bathymetry Surveys (' + count + ')</b></i>';
                } 
                else if (item.layerName == 'Marine Trackline Surveys: Bathymetry') {
                    return '<i><b>Single-Beam Bathymetry Surveys (' + count + ')</b></i>';
                } 
                else if (item.layerName == 'Surveys with BAGs') {
                    return '<i>Surveys wth BAGs (' + count + ')</i>';
                } 
                else if (item.layerName == 'Digital Data') {
                    return '<i>Surveys with Digital Sounding Data (' + count + ')</i>';
                } 
                else if (item.layerName == 'Non-Digital') {
                    return '<i>Surveys without Digital Sounding Data (' + count + ')</i>';
                } 
                else if (item.layerName == 'All NGDC Bathymetry DEMs') {
                    return '<i><b>Digital Elevation Models (' + count + ')</b></i>';
                }
                else {
                    return item.layerName;
                }
            },

            getItemDisplayLabel: function(item) {
                //return item.value;
                if (item.layerName == 'Multibeam Bathymetric Surveys') {
                    return item.feature.attributes['Survey Name'] + ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>';
                } 
                else if (item.layerName == 'Marine Trackline Surveys: Bathymetry') {
                    return item.feature.attributes['Survey ID'] + ' <i>(' + item.feature.attributes['Survey Start Year'] + ')</i>';
                } 
                else if (item.layerName == 'Surveys with BAGs') {
                    return item.feature.attributes['Survey ID'] + (item.feature.attributes['Year'] == 'Null' ? '' : ' <i>(' + item.feature.attributes['Year'] + ')</i>');
                } 
                else if (item.layerName == 'Digital Data') {
                    return item.feature.attributes['Survey ID'] + (item.feature.attributes['Year'] == 'Null' ? '' : ' <i>(' + item.feature.attributes['Year'] + ')</i>');
                } 
                else if (item.layerName == 'Non-Digital') {
                    return item.feature.attributes['Survey ID'] + (item.feature.attributes['Year'] == 'Null' ? '' : ' <i>(' + item.feature.attributes['Year'] + ')</i>');
                } 
                else if (item.layerName == 'All NGDC Bathymetry DEMs') {
                    return item.feature.attributes['Name'] + ' <i>(' + item.feature.attributes['Cell Size'] + ')</i>';
                }
            },

            populateFeatureStore: function(results) {
                var totalFeatures = 0;
                var numFeaturesForLayer = 0;
                this.uid = 0;
                this.expandedNodePaths = [];
                //for (var svcName in results) {
                for (var i = 0; i < this.layerIds.length; i++) { //Iterate through the layerIds, specified in Identify.js. This maintains the desired ordering of the layers.
                    var svcName = this.layerIds[i];
                    for (var layerName in results[svcName]) {

                        numFeaturesForLayer = results[svcName][layerName].length;
                        totalFeatures += numFeaturesForLayer;

                        for (var j = 0; j < results[svcName][layerName].length; j++) {
                            var item = results[svcName][layerName][j];
                            var layerKey = svcName + '/' + layerName;
                            var layerUrl = results[svcName][layerName][j].layerUrl;
                            
                            if (svcName == 'NOS Hydrographic Surveys' || svcName == 'NOS Hydro (non-digital)') {
                                //Create an "NOS Hydrographic Surveys" folder if it doesn't already exist
                                if (this.featureStore.query({id: 'NOS Hydrographic Surveys'}).length == 0) {
                                    this.featureStore.put({
                                        uid: ++this.uid,
                                        id: 'NOS Hydrographic Surveys',
                                        label: '<b><i>NOS Hydrographic Surveys</i></b>',
                                        type: 'folder',
                                        parent: 'root'
                                    });                                      
                                }
                            }

                            //Create a layer "folder" node if it doesn't already exist
                            if (this.featureStore.query({id: layerName}).length == 0) {
                                this.featureStore.put({
                                    uid: ++this.uid,
                                    id: layerName,
                                    label: this.getLayerDisplayLabel(item, numFeaturesForLayer),
                                    type: 'folder',
                                    //If NOS Hydro, parent is the NOS Hydro folder, else parent is root.
                                    parent: svcName == 'NOS Hydrographic Surveys' || svcName == 'NOS Hydro (non-digital)' ? 
                                        'NOS Hydrographic Surveys' : 'root'
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



            constructFeatureTree: function() {
                this.inherited(arguments);

                //Add the NOS Hydro sub-layers to the list of nodes to be expanded to
                this.expandedNodePaths.push(['root', 'NOS Hydrographic Surveys', 'Surveys with BAGs']);
                this.expandedNodePaths.push(['root', 'NOS Hydrographic Surveys', 'Digital Data']);
                this.expandedNodePaths.push(['root', 'NOS Hydrographic Surveys', 'Non-Digital']); 

                this.tree.set('paths', this.expandedNodePaths);
            }
        });
    }
);