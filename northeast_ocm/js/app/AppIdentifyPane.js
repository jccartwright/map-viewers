define([
    'dojo/_base/declare', 
    'dojo/_base/config', 
    'dojo/_base/array', 
    'dojo/string',
    'dojo/topic', 
    'dojo/_base/lang',
    'dojo/dom-style',
    'dojo/json',
    'dojo/request/xhr',
    'dijit/form/Button',
    'esri/geometry/webMercatorUtils', 
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
        JSON,
        xhr,
        Button,
        webMercatorUtils,
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

                this.extractDataButton = new Button({
                    label: 'Extract Data',
                    style: "bottom: 5px; left: 15px;",
                    iconClass: 'downloadIcon',
                    onClick: lang.hitch(this, function(){
                        this.extractData();
                    })
                }).placeAt(this.featurePageBottomBar);
            },

            showResults: function() {
                this.inherited(arguments);
                // if (this.numFeatures >= 1000) {
                //     this.featurePageTitle = "Identified Features (" + this.numFeatures + "+, results limited to 1000)";
                //     this.setTitle(this.featurePageTitle);
                // }
            },

            getLayerDisplayLabel: function(item, count) {

                if (item.layerName == 'Multibeam Bathymetric Surveys') {
                    return '<i><b>Multibeam Bathymetry Surveys (' + this.formatCountString(count) + ')</b></i><img src="images/drive-download.png" title="Data from this layer can be extracted using NEXT"></img>';
                } 
                else if (item.layerName == 'Marine Trackline Surveys: Bathymetry') {
                    return '<i><b>Single-Beam Bathymetry Surveys (' + this.formatCountString(count) + ')</b></i>';
                } 
                else if (item.layerName == 'Surveys with BAGs') {
                    return '<i>Surveys wth BAGs (' + this.formatCountString(count) + ')</i><img src="images/drive-download.png" title="Data from this layer can be extracted using NEXT"></img>';
                } 
                else if (item.layerName == 'Surveys with Digital Sounding Data') {
                    return '<i>Surveys with Digital Sounding Data (' + this.formatCountString(count) + ')</i><img src="images/drive-download.png" title="Data from this layer can be extracted using NEXT"></img>';
                } 
                else if (item.layerName == 'Surveys without Digital Sounding Data') {
                    return '<i>Surveys without Digital Sounding Data (' + this.formatCountString(count) + ')</i>';
                } 
                else if (item.layerName == 'All NGDC Bathymetry DEMs') {
                    return '<i><b>Digital Elevation Models (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName == 'Lidar') {
                    return '<i><b>Bathymetric Lidar (' + this.formatCountString(count) + ')</b></i>';
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
                //return item.value;
                if (item.layerName == 'Multibeam Bathymetric Surveys') {
                    return item.feature.attributes['Survey ID'] + ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>';
                } 
                else if (item.layerName == 'Marine Trackline Surveys: Bathymetry') {
                    return item.feature.attributes['Survey ID'] + ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>';
                } 
                else if (item.layerName == 'Surveys with BAGs') {
                    return item.feature.attributes['Survey ID'] + (item.feature.attributes['Survey Year'] == 'Null' ? '' : ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>');
                } 
                else if (item.layerName == 'Surveys with Digital Sounding Data') {
                    return item.feature.attributes['Survey ID'] + (item.feature.attributes['Survey Year'] == 'Null' ? '' : ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>');
                } 
                else if (item.layerName == 'Surveys without Digital Sounding Data') {
                    return item.feature.attributes['Survey ID'] + (item.feature.attributes['Survey Year'] == 'Null' ? '' : ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>');
                } 
                else if (item.layerName == 'All NGDC Bathymetry DEMs') {
                    return item.feature.attributes['Name'] + ' <i>(' + item.feature.attributes['Cell Size'] + ')</i>';
                }
                else if (item.layerName == 'Lidar') {
                    return item.feature.attributes['Name'];
                }
            },

            populateFeatureStore: function(results) {
                var totalFeatures = 0;
                var numFeaturesForLayer = 0;
                this.expandedNodePaths = [];
                this.isNosHydro = false;
                this.isMultibeam = false;
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
                            
                            if (svcName == 'NOS Hydrographic Surveys' || svcName == 'NOS Hydro (non-digital)') {
                                this.isNosHydro = true;
                                //Create an "NOS Hydrographic Surveys" folder if it doesn't already exist
                                if (this.featureStore.query({id: 'NOS Hydrographic Surveys'}).length === 0) {
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
                            if (this.featureStore.query({id: layerName}).length === 0) {
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

                            if (svcName == 'Multibeam') {
                                this.isMultibeam = true;
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
                this.expandedNodePaths.push(['root', 'NOS Hydrographic Surveys', 'Surveys with Digital Sounding Data']);
                this.expandedNodePaths.push(['root', 'NOS Hydrographic Surveys', 'Surveys without Digital Sounding Data']); 

                this.tree.set('paths', this.expandedNodePaths);
            },

            extractData: function() {
                var str = 'Extract Data:\n';
                var postBody = {};
                postBody.items = [];
                var geometry;
                            
                if (this.isMultibeam) {
                    var datasetInfo = {dataset: 'Multibeam'};
                    
                    if (this.identify.searchGeometry.type == 'extent') {
                        var latLonExtent = webMercatorUtils.webMercatorToGeographic(this.identify.searchGeometry);
                        datasetInfo.geometry = latLonExtent.xmin + ',' + latLonExtent.ymin + ',' + latLonExtent.xmax + ',' + latLonExtent.ymax;
                    }
                    
                    if (this.identify.searchGeometry.type == 'point') {
                        //Pass the list of survey IDs from the identifyResults
                        var surveyIds = [];
                        array.forEach(this.identifyResults['Multibeam']['Multibeam Bathymetric Surveys'], lang.hitch(this, function(identifyResult) {
                            surveyIds.push(identifyResult.feature.attributes['Survey ID']);
                        }));
                        datasetInfo.surveys = surveyIds;                        
                    }
                    else if (this.identify.currentFilter) {
                        var filter = this.identify.currentFilter;
                        if (filter.startYear) {
                            datasetInfo.startYear = filter.startYear;
                        }
                        if (filter.endYear) {
                            datasetInfo.endYear = filter.endYear;
                        }
                        if (filter.platform) {
                            datasetInfo.platforms = filter.platform;
                        }
                        if (filter.survey) {
                            datasetInfo.surveys = filter.survey;
                        }
                    }

                    postBody.items.push(datasetInfo);
                }
                if (this.isNosHydro) {
                    var datasetInfo = {dataset: 'Sounding'};
                    
                    if (this.identify.searchGeometry.type == 'extent') {
                        var latLonExtent = webMercatorUtils.webMercatorToGeographic(this.identify.searchGeometry);
                        datasetInfo.geometry = latLonExtent.xmin + ',' + latLonExtent.ymin + ',' + latLonExtent.xmax + ',' + latLonExtent.ymax;
                    }
                    
                    if (this.identify.searchGeometry.type == 'point') {
                        //Pass the list of survey IDs from the identifyResults
                        var surveyIds = [];

                        if (this.identifyResults['NOS Hydrographic Surveys']['Surveys with Digital Sounding Data']) {
                            var identifyResults = this.identifyResults['NOS Hydrographic Surveys']['Surveys with Digital Sounding Data'];
                            array.forEach(identifyResults, lang.hitch(this, function(identifyResult) {
                                var surveyId = identifyResult.feature.attributes['Survey ID'];
                                if (array.indexOf(identifyResults, surveyId) == -1) {
                                    surveyIds.push(surveyId);
                                }
                            }));
                        }

                        if (this.identifyResults['NOS Hydrographic Surveys']['Surveys with BAGs']) {
                            var identifyResults = this.identifyResults['NOS Hydrographic Surveys']['Surveys with BAGs'];
                            array.forEach(identifyResults, lang.hitch(this, function(identifyResult) {
                                var surveyId = identifyResult.feature.attributes['Survey ID'];
                                if (array.indexOf(identifyResults, surveyId) == -1) {
                                    surveyIds.push(surveyId);
                                }
                            }));
                        }
                        datasetInfo.survey = surveyIds;                        
                    }
                    else if (this.identify.currentFilter) {
                        var filter = this.identify.currentFilter;
                        if (filter.startYear) {
                            datasetInfo.startYear = filter.startYear;
                        }
                        if (filter.endYear) {
                            datasetInfo.endYear = filter.endYear;
                        }
                        if (filter.platform) {
                            datasetInfo.platforms = filter.platform;
                        }
                        if (filter.survey) {
                            datasetInfo.surveys = filter.survey;
                        }
                    }

                    postBody.items.push(datasetInfo);
                }
                
                str += JSON.stringify(postBody);
                //this.postToNext(postBody);
                this.submitFormToNext(postBody);
            },

            postToNext: function(postBody) {
                console.log('POSTing to NEXT: ' + JSON.stringify(postBody));

                xhr.post("http://agile.ngdc.noaa.gov/next-web/orders/create", {
                    handleAs: "text",
                    headers: {'Content-Type':'application/json'},
                    data: JSON.stringify(postBody)

                }).then(function(data) {
                    //HACK convert relative next-web references to absolute URLs
                    var re = new RegExp("/next-web/", 'gm');
                    var parsedData = data.replace(re,"http://agile.ngdc.noaa.gov/next-web/");
                    var displayWindow = window.open("", "_blank", "status=no, toolbar=no, titlebar=no, resizable=yes, scrollbars=yes, width=500, height=400");
                    displayWindow.document.writeln(parsedData);

                }, function(err) {
                    console.log('xhrPost err');
                    //TODO Handle the error condition
                });

            },

            submitFormToNext: function(postBody) {
                console.log("sending order via form submission to NEXT: ", postBody);
                //var url = 'http://maps.ngdc.noaa.gov/mapviewer-support/testForm.groovy';
                var url = "http://agile.ngdc.noaa.gov/next-web/orders/create";

                //create a new form element and submit it.
                var form = document.createElement("form");
                form.action = url;
                form.method = 'POST';
                form.target = '_blank';

                postBody = {"items":[{"dataset":"Multibeam", "surveys": "RR0903"}]};
                //JSON payload goes in "order" parameter
                var inputElement = document.createElement("textarea");
                inputElement.name = "order";
                inputElement.value = JSON.stringify(postBody);

                form.appendChild(inputElement);
                form.style.display = 'none';
                document.body.appendChild(form);
                form.submit();

                //once the form is sent, it's useless to keep it.
                document.body.removeChild(form);
            }
        });

    }
);