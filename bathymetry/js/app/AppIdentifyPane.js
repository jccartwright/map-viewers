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

                if (item.layerName == 'Multibeam Bathymetric Surveys') {
                    return '<i><b>' + item.layerName + '</b></i>';
                } 
                else if (item.layerName == 'Marine Trackline Surveys: Bathymetry') {
                    return '<i><b>Trackline Bathymetry Surveys (single-beam)</b></i>';
                } 
                else if (item.layerName == 'Surveys with BAGs') {
                    return '<i><b>NOS Hydrographic Surveys wth BAGs</b></i>';
                } 
                else if (item.layerName == 'Digital Data') {
                    return '<i><b>NOS Hydrographic Surveys with Digital Sounding Data</b></i>';
                } 
                else if (item.layerName == 'Non-Digital') {
                    return '<i><b>NOS Hydrographic Surveys without Digital Sounding Data</b></i>';
                } 
                else if (item.layerName == 'All NGDC Bathymetry DEMs') {
                    return '<i><b>Bathymetry DEMs</b></i>';
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
                    return item.feature.attributes['Survey ID'] + ' <i>(' + item.feature.attributes['Year'] + ')</i>';
                } 
                else if (item.layerName == 'Digital Data') {
                    return item.feature.attributes['Survey ID'] + ' <i>(' + item.feature.attributes['Year'] + ')</i>';
                } 
                else if (item.layerName == 'Non-Digital') {
                    return item.feature.attributes['Survey ID'] + ' <i>(' + item.feature.attributes['Year'] + ')</i>';
                } 
                else if (item.layerName == 'All NGDC Bathymetry DEMs') {
                    return item.feature.attributes['Name'] + ' <i>(' + item.feature.attributes['Cell Size'] + ')</i>';
                }
            },

            populateFeatureStore: function(results) {
                var numFeatures = 0;
                this.uid = 0;
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
                            
                            //Add the current item to the store, with the layerName as parent
                            this.featureStore.put({
                                uid: ++this.uid,
                                id: this.uid,                                
                                displayLabel: this.getItemDisplayLabel(item),
                                //TODO: point to the magnifying glass image using a module path?
                                label: this.getItemDisplayLabel(item) + " <a id='zoom-" + this.uid + "' href='#' class='zoomto-link'><img src='../../dijits/js/ngdc/identify/images/magnifier.png'></a>",
                                layerUrl: layerUrl,
                                layerKey: layerKey,
                                attributes: item.feature.attributes,
                                parent: layerName,
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
                //this.tree.set('paths', this.expandedNodePaths);
            }
        });
    }
);