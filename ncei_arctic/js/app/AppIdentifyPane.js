define([
    'dojo/_base/declare', 
    'dojo/_base/config', 
    'dojo/_base/array', 
    'dojo/string',
    'dojo/topic', 
    'dojo/_base/lang',
    'dojo/dom-style',
    'dojo/json',
    'dijit/form/Button',
    'dijit/Tooltip',
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
        Button,
        Tooltip,
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
                    style: 'bottom: 5px; left: 15px;',
                    iconClass: 'downloadIcon',
                    onClick: lang.hitch(this, function(){
                        this.extractData();
                    })
                }).placeAt(this.featurePageBottomBar);

                new Tooltip({
                    connectId: [this.extractDataButton.domNode],
                    label: 'Extract data via NEXT (NCEI Extract System).<br><img src="images/drive-download.png">: Data for this layer can be extracted.'
                });

                //Add a button to the main cruise feature page to request cruises
                this.extractSingleDatasetButton = new Button({
                    label: 'Extract This Survey',
                    style: 'bottom: 5px; left: 5px;',
                    iconClass: 'downloadIcon',
                    onClick: lang.hitch(this, function() {
                        var itemId;
                        if (this.currentItem.attributes['Survey ID']) {
                            itemId = this.currentItem.attributes['Survey ID'];
                        } else if (itemId = this.currentItem.attributes['ITEM_ID']) {
                            itemId = this.currentItem.attributes['ITEM_ID'];
                        }
                        this.extractData(itemId);
                    })
                }).placeAt(this.infoPageBottomBar);
            },

            showResults: function() {
                this.inherited(arguments);
                
                if (this.isMultibeam || this.isNosHydro || this.isDemTiles) {
                    domStyle.set(this.extractDataButton.domNode, 'display', '');
                } else {
                    domStyle.set(this.extractDataButton.domNode, 'display', 'none');
                }
            },

            getLayerDisplayLabel: function(item, count) {
                return '<i><b>' + this.getFolderName(item.formatter) + ' (' + this.formatCountString(this.folderCounts[this.getFolderName(item.formatter)]) + ')</b></i>';
            },

            getFolderName: function(layerKey) {
                if (layerKey === 'Multibeam/Multibeam Bathymetric Surveys') {
                    return 'NOAA NCEI Multibeam Bathymetric Surveys';
                } 
                else if (layerKey === 'Trackline Bathymetry/Marine Trackline Surveys: Bathymetry') {
                    return 'NOAA NCEI Single-Beam Bathymetric Surveys';
                }

                else if (layerKey === 'CRN/Climate Reference Network') {
                    return 'U.S. Climate Reference Network (USCRN)';
                }
                else if (layerKey === 'GHCND/GHCN Daily') {
                    return 'Global Historical Climate Network- Daily (GHCND)';
                }
                else if (layerKey === 'GSOM/Global Surface Summary of the Month') {
                    return 'Global Summary of the Month (GSOM)';
                }
                else if (layerKey === 'GSOY/Global Surface Summary of the Year') {
                    return 'Global Summary of the Year (GSOY)';
                }
                else if (layerKey === 'ISD/Hourly Global') {
                    return 'Integrated Surface Global Hourly Data (ISD)';
                }
                            
            },

            // getLayerDisplayLabel: function(item, count) {

            //     if (item.layerName === 'Multibeam Bathymetric Surveys') {
            //         return '<i><b>Multibeam Bathymetric Surveys (' + this.formatCountString(count) + ')</b></i><img src="images/drive-download.png" title="Data from this layer can be extracted using NEXT">';
            //     } 
            //     else if (item.layerName === 'Marine Trackline Surveys: Bathymetry') {
            //         return '<i><b>Single-Beam Bathymetric Surveys (' + this.formatCountString(count) + ')</b></i>';
            //     } 
            //     else if (item.layerName === 'Surveys with BAGs') {
            //         return '<i>Surveys wth BAGs (' + this.formatCountString(count) + ')</i><img src="images/drive-download.png" title="Data from this layer can be extracted using NEXT">';
            //     } 
            //     else if (item.layerName === 'Surveys with Digital Sounding Data') {
            //         return '<i>Surveys with Digital Sounding Data (' + this.formatCountString(count) + ')</i><img src="images/drive-download.png" title="Data from this layer can be extracted using NEXT">';
            //     } 
            //     else if (item.layerName === 'Surveys without Digital Sounding Data') {
            //         return '<i>Surveys without Digital Sounding Data (' + this.formatCountString(count) + ')</i>';
            //     } 
            //     else if (item.layerName === 'All NCEI Bathymetric DEMs') {
            //         return '<i><b>Digital Elevation Models (' + this.formatCountString(count) + ')</b></i>';
            //     }
            //     else if (item.layerName === 'DEM Tiles') {
            //         return '<i><b>Digital Elevation Models (New Tiles) (' + this.formatCountString(count) + ')</b></i><img src="images/drive-download.png" title="Data from this layer can be extracted using NEXT">';
            //     }
            //     else if (item.layerName === 'Lidar') {
            //         return '<i><b>OCM Bathymetric Lidar (' + this.formatCountString(count) + ')</b></i>';
            //     }
            // },

            formatCountString: function(count) {
                if (count >= 1000) {
                    return 'results limited to 1000';
                } else {
                    return count;
                }
            },

            getItemDisplayLabel: function(item, uid) {
                if (item.formatter === 'Multibeam/Multibeam Bathymetric Surveys') {
                    return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>', uid);
                } 
                else if (item.formatter === 'Trackline Bathymetry/Marine Trackline Surveys: Bathymetry') {
                    return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>', uid);
                }

                else if (item.formatter === 'CRN/Climate Reference Network') {
                    return this.getItemLabelSpan(item.feature.attributes['STATION'] + ' (' + item.feature.attributes['STATE'] + ')', uid);
                }
                else if (item.formatter === 'GHCND/GHCN Daily') {
                    return this.getItemLabelSpan(item.feature.attributes['STATION_NAME'], uid);
                }
                else if (item.formatter === 'GSOM/Global Surface Summary of the Month') {
                    return this.getItemLabelSpan(item.feature.attributes['STATION_NAME'], uid);
                }
                else if (item.formatter === 'GSOY/Global Surface Summary of the Year') {
                    return this.getItemLabelSpan(item.feature.attributes['STATION_NAME'], uid);
                }
                else if (item.formatter === 'ISD/Hourly Global') {
                    return this.getItemLabelSpan(item.feature.attributes['STATION'], uid);
                }
                
            },

            // getItemDisplayLabel: function(item, uid) {
            //     //return item.value;
            //     if (item.layerName === 'Multibeam Bathymetric Surveys') {
            //         return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>', uid);
            //     } 
            //     else if (item.layerName === 'Marine Trackline Surveys: Bathymetry') {
            //         return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>', uid);
            //     } 
            //     else if (item.layerName === 'Surveys with BAGs') {
            //         return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + (item.feature.attributes['Survey Year'] === 'Null' ? '' : ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>'), uid);
            //     } 
            //     else if (item.layerName === 'Surveys with Digital Sounding Data') {
            //         return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + (item.feature.attributes['Survey Year'] === 'Null' ? '' : ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>'), uid);
            //     } 
            //     else if (item.layerName === 'Surveys without Digital Sounding Data') {
            //         return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + (item.feature.attributes['Survey Year'] === 'Null' ? '' : ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>'), uid);
            //     } 
            //     else if (item.layerName === 'All NCEI Bathymetric DEMs') {
            //         return this.getItemLabelSpan(item.feature.attributes['Name'] + ' <i>(' + item.feature.attributes['Cell Size'] + ')</i>', uid);
            //     }
            //     else if (item.layerName === 'DEM Tiles') {
            //         return this.getItemLabelSpan(item.feature.attributes['NAME'] + ' <i>(' + item.feature.attributes['CELL_SIZE'] + ')</i>', uid);
            //     }
            //     else if (item.layerName === 'Lidar') {
            //         return this.getItemLabelSpan(item.feature.attributes['Name'], uid);
            //     }
            // },

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
                                var layerType = results[svcName][layerName][j].layerType;
                                
                                if (svcName === 'NOS Hydrographic Surveys' || svcName === 'NOS Hydro (non-digital)') {
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
                                if (this.featureStore.query({id: this.getFolderName(layerKey)}).length === 0) {
                                    this.featureStore.put({
                                        uid: ++this.uid,
                                        id: this.getFolderName(layerKey),
                                        label: this.getLayerDisplayLabel(item, this.folderCounts[this.getFolderName(layerKey)]),
                                        type: 'folder',
                                        //If NOS Hydro, parent is the NOS Hydro folder, else parent is root.
                                        parent: svcName === 'NOS Hydrographic Surveys' || svcName === 'NOS Hydro (non-digital)' ? 
                                            'NOS Hydrographic Surveys' : 'root'
                                    });
                                    //this.expandedNodePaths.push(layerName);
                                }

                                if (svcName === 'Multibeam') {
                                    this.isMultibeam = true;
                                }

                                if (svcName ==='DEM Tiles') {
                                    this.isDemTiles = true;
                                }
                                
                                //Add the current item to the store, with the layerName folder as parent
                                this.featureStore.put({
                                    uid: ++this.uid,
                                    id: this.uid,                                
                                    displayLabel: this.getItemDisplayLabel(item, this.uid),
                                    label: this.getItemDisplayLabel(item, this.uid) + " <a id='zoom-" + this.uid + "' href='#' class='zoomto-link'><img src='" + this.magnifyingGlassIconUrl + "' title='Zoom to extent of feature'></a>",
                                    layerUrl: layerUrl,
                                    layerKey: layerKey,
                                    layerType: layerType,
                                    attributes: item.feature.attributes,
                                    parent: this.getFolderName(layerKey),
                                    type: 'item'
                                });
                            }
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

            showInfo: function() {
                this.inherited(arguments);

                var layerName = this.currentItem.layerKey.split('/')[0];

                if (layerName === 'Multibeam' || layerName === 'NOS Hydrographic Surveys' || layerName === 'NOS Hydro (non-digital)') {
                    this.extractSingleDatasetButton.set('label', 'Extract this Survey');
                    domStyle.set(this.extractSingleDatasetButton.domNode, 'display', '');
                } else if (layerName === 'DEM Tiles') {
                    this.extractSingleDatasetButton.set('label', 'Extract this DEM');
                    domStyle.set(this.extractSingleDatasetButton.domNode, 'display', '');
                } else {
                    domStyle.set(this.extractSingleDatasetButton.domNode, 'display', 'none');
                }
            },

            extractData: function(itemId /*Optional survey/DEM id*/) {                
                var filterCriteria = this.constructFilterCriteria(itemId);
                if (filterCriteria.items.length > 0) {
                    this.submitFormToNext(filterCriteria);
                }

                //filterCriteria = this.replaceWildcardsAndSubmit(filterCriteria);
            },

            getFilterItemById: function(filterCriteria, id /*'Multibeam'|'Sounding'*/) {
                for (var i = 0; i < filterCriteria.items.length; i++) {
                    if (filterCriteria.items[i].dataset === id) {
                        return filterCriteria.items[i];
                    }
                }                
            },

            //Scans a FeatureSet for unique platforms and returns a comma-separated string
            getPlatformListFromFeatureSet: function(featureSet) {
                var platforms = [];
                array.forEach(featureSet.features, function(feature) {
                    var platform = feature.attributes['PLATFORM'];
                    if (array.indexOf(platforms, platform) === -1) {
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
                    if (array.indexOf(surveys, survey) === -1) {
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

                if (this.isMultibeam) {
                    datasetInfo = {dataset: 'Multibeam'};
                    
                    if (this.identify.searchGeometry.type === 'extent') {
                        if (this.identify.searchGeometry.spatialReference.wkid === 4326) {
                            latLonExtent = this.identify.searchGeometry;
                        }
                        else if (this.identify.searchGeometry.spatialReference.wkid === 102100 || this.identify.searchGeometry.spatialReference.wkid === 3857) {
                            latLonExtent = webMercatorUtils.webMercatorToGeographic(this.identify.searchGeometry);
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
                    
                    if (this.identify.searchGeometry.type === 'extent') {
                        if (this.identify.searchGeometry.spatialReference.wkid === 4326) {
                            latLonExtent = this.identify.searchGeometry;
                        }
                        else if (this.identify.searchGeometry.spatialReference.wkid === 102100 || this.identify.searchGeometry.spatialReference.wkid === 3857) {
                            latLonExtent = webMercatorUtils.webMercatorToGeographic(this.identify.searchGeometry);
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
                    if (this.identify.searchGeometry.type === 'extent') {
                        if (this.identify.searchGeometry.spatialReference.wkid === 4326) {
                            latLonExtent = this.identify.searchGeometry;
                        }
                        else if (this.identify.searchGeometry.spatialReference.wkid === 102100 || this.identify.searchGeometry.spatialReference.wkid === 3857) {
                            latLonExtent = webMercatorUtils.webMercatorToGeographic(this.identify.searchGeometry);
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
            
            submitFormToNext: function(postBody) {
                console.debug("sending order via form submission to NEXT: ", postBody);
                
                var url = "http://www.ngdc.noaa.gov/next-web/orders/create";

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
            },

            computeFolderCounts: function(results) {
                this.folderCounts = {};
                for (var i = 0; i < this.identify.layerIds.length; i++) { //Iterate through the layerIds, specified in Identify.js. This maintains the desired ordering of the layers.
                    var svcName = this.identify.layerIds[i];
                    for (var layerName in results[svcName]) {
                        var layerKey = svcName + '/' + layerName;
                        var folderName = this.getFolderName(layerKey);
                        if (!this.folderCounts[folderName]) {
                            this.folderCounts[folderName] = 0;
                        }
                        this.folderCounts[folderName] += results[svcName][layerName].length;                        
                    }
                }
            }
        });
    }
);