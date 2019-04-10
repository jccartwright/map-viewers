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
    'dojo/promise/all',
    'dijit/form/Button',
    'esri/geometry/webMercatorUtils', 
    'esri/tasks/QueryTask',
    'esri/tasks/query',
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
        all,
        Button,
        webMercatorUtils,
        QueryTask,
        Query,
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
                    return '<i><b>Multibeam Bathymetric Surveys (' + this.formatCountString(count) + ')</b></i><img src="images/drive-download.png" title="Data from this layer can be extracted using NEXT"></img>';
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
                else if (item.layerName == 'NCEI Digital Elevation Models') {
                    return '<i><b>Digital Elevation Models (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName == 'DEM Tiles') {
                    return '<i><b>DEM Tiles (' + this.formatCountString(count) + ')</b></i><img src="images/drive-download.png" title="Data from this layer can be extracted using NEXT"></img>';
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

            getItemDisplayLabel: function(item, uid) {
                //return item.value;
                if (item.layerName == 'Multibeam Bathymetric Surveys') {
                    return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>', uid);
                } 
                else if (item.layerName == 'Marine Trackline Surveys: Bathymetry') {
                    return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>', uid);
                } 
                else if (item.layerName == 'Surveys with BAGs') {
                    return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + (item.feature.attributes['Survey Year'] == 'Null' ? '' : ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>'), uid);
                } 
                else if (item.layerName == 'Surveys with Digital Sounding Data') {
                    return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + (item.feature.attributes['Survey Year'] == 'Null' ? '' : ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>'), uid);
                } 
                else if (item.layerName == 'Surveys without Digital Sounding Data') {
                    return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + (item.feature.attributes['Survey Year'] == 'Null' ? '' : ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>'), uid);
                } 
                else if (item.layerName == 'NCEI Digital Elevation Models') {
                    return this.getItemLabelSpan(item.feature.attributes['Name'] + ' <i>(' + item.feature.attributes['Cell Size'] + ')</i>', uid);
                }
                else if (item.layerName == 'DEM Tiles') {
                    return this.getItemLabelSpan(item.feature.attributes['NAME'] + ' <i>(' + item.feature.attributes['CELL_SIZE'] + ')</i>', uid);
                }
                else if (item.layerName == 'Lidar') {
                    return this.getItemLabelSpan(item.feature.attributes['Name'], uid);
                }
            },

            getItemLabelSpan: function(text, uid) {
                return '<span id="itemLabel-' + uid + '">' + text + '</span>';
            },
            
            populateFeatureStore: function(results) {
                var totalFeatures = 0;
                var numFeaturesForLayer = 0;
                this.expandedNodePaths = [];
                this.isNosHydro = false;
                this.isMultibeam = false;
                this.isDemTiles = false;
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

                            if (svcName =='DEM Tiles') {
                                this.isDemTiles = true;
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
                var filterCriteria = this.constructFilterCriteria();

                filterCriteria = this.replaceWildcardsAndSubmit(filterCriteria);
            },

            //If the 'platforms' or 'surveys' filters contain '*' wildcards, query the map services to get full lists of platforms/surveys.
            replaceWildcardsAndSubmit: function(filterCriteria) {
                var promises = {};
                var queryTask;

                array.forEach(filterCriteria.items, function(item) {                    
                    var query = new Query();
                    query.returnGeometry = false;

                    if (item.platforms && array.indexOf(item.platforms, '*') > -1) {                            
                        query.where = "UPPER(PLATFORM) LIKE '" + item.platforms.toUpperCase().replace(/\*/g, '%') + "'";
                        query.outFields = ["PLATFORM"];
                        if (item.dataset == 'Multibeam') {
                            queryTask = new QueryTask("http://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer/0");
                            promises.multibeamPlatformQuery = queryTask.execute(query);
                        }
                        if (item.dataset == 'Sounding') {
                            queryTask = new QueryTask("http://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer/1");
                            promises.nosHydroPlatformQuery = queryTask.execute(query);
                        }                        
                    }
                    if (item.surveys && array.indexOf(item.surveys, '*') > -1) {
                        query.where = "UPPER(SURVEY_ID) LIKE '" + item.surveys.toUpperCase().replace(/\*/g, '%') + "'";
                        query.outFields = ["SURVEY_ID"];
                        if (item.dataset == 'Multibeam') {
                            queryTask = new QueryTask("http://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer/0");
                            promises.multibeamSurveyQuery = queryTask.execute(query);
                        }
                        if (item.dataset == 'Sounding') {
                            queryTask = new QueryTask("http://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/nos_hydro_dynamic/MapServer/1");
                            promises.nosHydroSurveyQuery = queryTask.execute(query);
                        }
                    }
                });

                all(promises).then(lang.hitch(this, function(results) {
                    console.log('all promises fulfilled.');

                    var multibeamSurveyList, multibeamPlatformList, nosHydroSurveyList, nosHydroPlatformList;

                    if (results.multibeamPlatformQuery) {
                        this.getFilterItemById(filterCriteria, 'Multibeam').platforms = this.getPlatformListFromFeatureSet(results.multibeamPlatformQuery);
                    }
                    if (results.multibeamSurveyQuery) {
                        this.getFilterItemById(filterCriteria, 'Multibeam').surveys = this.getSurveyListFromFeatureSet(results.multibeamSurveyQuery);
                    }
                    if (results.nosHydroPlatformQuery) {
                        this.getFilterItemById(filterCriteria, 'Sounding').platforms = this.getPlatformListFromFeatureSet(results.nosHydroPlatformQuery);
                    }
                    if (results.nosHydroSurveyQuery) {
                        this.getFilterItemById(filterCriteria, 'Sounding').surveys = this.getSurveyListFromFeatureSet(results.nosHydroSurveyQuery);
                    }
                    console.log(filterCriteria);

                    if (filterCriteria.items.length > 0) {
                        this.submitFormToNext(filterCriteria);
                    }
                }));
                
            },

            getFilterItemById: function(filterCriteria, id /*'Multibeam'|'Sounding'*/) {
                for (var i = 0; i < filterCriteria.items.length; i++) {
                    if (filterCriteria.items[i].dataset == id) {
                        return filterCriteria.items[i];
                    }
                }                
            },

            //Scans a FeatureSet for unique platforms and returns a comma-separated string
            getPlatformListFromFeatureSet: function(featureSet) {
                var platforms = [];
                array.forEach(featureSet.features, function(feature) {
                    var platform = feature.attributes['PLATFORM'];
                    if (array.indexOf(platforms, platform) == -1) {
                        platforms.push(platform);
                    }
                });

                return platforms.join(',');
            },

            //Scans a FeatureSet for unique survey IDs and returns a comma-separated string
            getSurveyListFromFeatureSet: function(featureSet) {
                var surveys = [];
                array.forEach(featureSet.features, function(feature) {
                    var survey = feature.attributes['SURVEY_ID'];
                    if (array.indexOf(surveys, survey) == -1) {
                        surveys.push(survey);
                    }
                });

                if (surveys.length >= 1000) {
                    alert('Warning: Number of surveys returned by wildcard search exceeds 1000. Please narrow down your search criteria.');
                }

                return surveys.join(',');
            },

            //Construct an object containing the filter criteria, adhering to the format the NEXT API is expecting, 
            //i.e.: {items: [{dataset: 'Multibeam', platforms: 'Knorr,Okeanos Explorer'}, {dataset: 'Sounding', startYear: 2000}]}
            constructFilterCriteria: function(itemId /*optional survey/DEM id*/) {
                var filterCriteria = {items: []};
                var datasetInfo;
                var latLonExtent;
                var surveyIds;
                var identifyResults;
                var extent;

                if (this.identify.searchGeometry.type === 'extent') {
                    extent = this.identify.searchGeometry;
                } else if (this.identify.searchGeometry.type === 'polygon') {
                    extent = this.identify.searchGeometry.getExtent();
                }

                if (this.isMultibeam) {
                    datasetInfo = {dataset: 'Multibeam'};
                    
                    if (extent) {
                        if (extent.spatialReference.wkid === 4326) {
                            latLonExtent = this.identify.searchGeometry;
                        }
                        else if (extent.spatialReference.isWebMercator()) {
                            latLonExtent = webMercatorUtils.webMercatorToGeographic(extent);
                        }
                        datasetInfo.geometry = latLonExtent.xmin + ',' + latLonExtent.ymin + ',' + latLonExtent.xmax + ',' + latLonExtent.ymax;
                    }
                    
                    //Pass the list of survey IDs from the identifyResults
                    surveyIds = [];
                    if (itemId) {
                        surveyIds.push(itemId);
                    } else {
                        array.forEach(this.identifyResults['Multibeam']['Multibeam Bathymetric Surveys'], lang.hitch(this, function(identifyResult) {
                            surveyIds.push(identifyResult.feature.attributes['Survey ID']);
                        }));                        
                    }
                    datasetInfo.surveys = surveyIds.join(',');
                    filterCriteria.items.push(datasetInfo);
                }
                if (this.isNosHydro) {
                    datasetInfo = {dataset: 'nos', grouped: true};
                    
                    if (extent) {
                        if (extent.spatialReference.wkid === 4326) {
                            latLonExtent = this.identify.searchGeometry;
                        }
                        else if (extent.spatialReference.isWebMercator()) {
                            latLonExtent = webMercatorUtils.webMercatorToGeographic(extent);
                        }
                        datasetInfo.geometry = latLonExtent.xmin + ',' + latLonExtent.ymin + ',' + latLonExtent.xmax + ',' + latLonExtent.ymax;
                    }
                    
                    //Pass the list of survey IDs from the identifyResults
                    surveyIds = [];
                    if (itemId) {
                        surveyIds.push(itemId);
                    }
                    else {
                        if (this.identifyResults['NOS Hydrographic Surveys']['Surveys with Digital Sounding Data']) {
                            identifyResults = this.identifyResults['NOS Hydrographic Surveys']['Surveys with Digital Sounding Data'];
                            array.forEach(identifyResults, lang.hitch(this, function(identifyResult) {
                                var surveyId = identifyResult.feature.attributes['Survey ID'];
                                if (array.indexOf(identifyResults, surveyId) === -1) {
                                    surveyIds.push(surveyId);
                                }
                            }));
                        }

                        if (this.identifyResults['NOS Hydrographic Surveys']['Surveys with BAGs']) {
                            identifyResults = this.identifyResults['NOS Hydrographic Surveys']['Surveys with BAGs'];
                            array.forEach(identifyResults, lang.hitch(this, function(identifyResult) {
                                var surveyId = identifyResult.feature.attributes['Survey ID'];
                                if (array.indexOf(identifyResults, surveyId) === -1) {
                                    surveyIds.push(surveyId);
                                }
                            }));
                        }
                    }
                    datasetInfo.groupNames = surveyIds.join(',');
                    filterCriteria.items.push(datasetInfo);
                }
                if (this.isDemTiles) {
                    datasetInfo = {dataset: 'DEM'};
                    if (extent) {
                        if (extent.spatialReference.wkid === 4326) {
                            latLonExtent = this.identify.searchGeometry;
                        }
                        else if (extent.spatialReference.isWebMercator()) {
                            latLonExtent = webMercatorUtils.webMercatorToGeographic(extent);
                        }
                        datasetInfo.geometry = latLonExtent.xmin + ',' + latLonExtent.ymin + ',' + latLonExtent.xmax + ',' + latLonExtent.ymax;
                    }
                    
                    if (this.identify.searchGeometry.type === 'point') {
                        var itemIds = [];
                        array.forEach(this.identifyResults['DEM Tiles']['DEM Tiles'], lang.hitch(this, function(identifyResult) {
                            itemIds.push(identifyResult.feature.attributes['ITEM_ID']);
                        }));
                        datasetInfo.itemIds = itemIds.join(',');
                    }

                    if (itemId) {
                        datasetInfo.itemIds = itemId;
                    }
                    filterCriteria.items.push(datasetInfo);
                }
                return filterCriteria;
            },
            
            /*
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
            */

            submitFormToNext: function(postBody) {
                console.log("sending order via form submission to NEXT: ", postBody);
                
                var url = "//www.ngdc.noaa.gov/next-web/orders/create";

                //create a new form element and submit it.
                var form = document.createElement("form");
                form.action = url;
                form.method = 'POST';
                form.target = '_blank';

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