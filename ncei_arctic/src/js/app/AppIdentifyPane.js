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
            },

            showResults: function() {
                this.inherited(arguments);
            },

            getLayerDisplayLabel: function(item) {
                return '<i><b>' + this.getFolderName(item.formatter) + ' (' + this.formatCountString(this.folderCounts[this.getFolderName(item.formatter)]) + ')</b></i>';
            },

            getFolderName: function(layerKey) {

                if (layerKey === 'Multibeam/Multibeam Bathymetric Surveys') {
                    return 'Multibeam Bathymetric Surveys';
                } 
                else if (layerKey === 'Trackline Combined/Marine Trackline Surveys: Bathymetry') {
                    return 'Single-Beam Bathymetric Surveys';
                }
                else if (layerKey === 'Trackline Combined/Marine Trackline Surveys: Gravity') {
                    return 'Trackline Gravity';
                }
                else if (layerKey === 'Trackline Combined/Marine Trackline Surveys: Magnetics') {
                    return 'Trackline Magnetics';
                }
                else if (layerKey === 'Trackline Combined/Marine Trackline Surveys: Multi-Channel Seismics') {
                    return 'Trackline Multi-Channel Seismics';
                }
                else if (layerKey === 'Trackline Combined/Marine Trackline Surveys: Seismic Refraction') {
                    return 'Trackline Seismic Refraction';
                }
                else if (layerKey === 'Trackline Combined/Marine Trackline Surveys: Shot-Point Navigation') {
                    return 'Trackline Shot-Point Navigation';
                }
                else if (layerKey === 'Trackline Combined/Marine Trackline Surveys: Side Scan Sonar') {
                    return 'Trackline Side Scan Sonar';
                }
                else if (layerKey === 'Trackline Combined/Marine Trackline Surveys: Single-Channel Seismics') {
                    return 'Trackline Single-Channel Seismics';
                }
                else if (layerKey === 'Trackline Combined/Marine Trackline Surveys: Subbottom Profile') {
                    return 'Trackline Subbottom Profile';
                }
                else if (layerKey === 'Trackline Combined/Aeromagnetic Surveys') {
                    return 'Aeromagnetic Surveys';
                }
                else if (layerKey === 'NOS Hydrographic Surveys/Surveys with BAGs') {
                    return 'Surveys wth BAGs';
                } 
                else if (layerKey === 'NOS Hydrographic Surveys/Surveys with Digital Sounding Data') {
                    return 'Surveys with Digital Sounding Data';
                } 
                else if (layerKey === 'NOS Hydrographic Surveys/Surveys without Digital Sounding Data') {
                    return 'Surveys without Digital Sounding Data';
                } 
                else if (layerKey === 'DEM Extents/NCEI Digital Elevation Models') {
                    return 'Digital Elevation Models';
                }
                else if (layerKey === 'DEM Tiles/DEM Tiles') {
                    return 'Digital Elevation Models (New Tiles)';
                }
                else if (layerKey === 'Marine Geology/Marine Geology Data Sets/Reports') {
                    return 'Marine Geology Data Sets/Reports';
                }
                else if (layerKey === 'Sample Index/All Samples by Institution') {
                    return 'Sample Index';
                }
                else if (layerKey === 'Sample Index/All Samples by Institution') {
                    return 'Sample Index';
                }
                else if (layerKey === 'Undersea Features/Point Features' || layerKey === 'Undersea Features/Line Features' || layerKey === 'Undersea Features/Polygon Features') {
                    return 'Undersea Features';
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
                else if (layerKey === 'DSCRTP/Locations') {
                    return 'Deep Sea Corals';
                }
                else if (layerKey === 'Sea Ice Index Daily Concentration/default') {
                    return 'Sea Ice Daily Concentration';
                }
                else if (layerKey === 'Sea Ice Index Monthly Concentration/default') {
                    return 'Sea Ice Monthly Concentration';
                }
                else if (layerKey === 'AVHRR surface_albedo/default') {
                    return 'AVHRR APP-x Surface Albedo';
                }
                else if (layerKey === 'AVHRR sea_ice_thickness/default') {
                    return 'AVHRR APP-x Sea Ice Thickness';
                }
                else if (layerKey === 'AVHRR cloud_binary_mask/default') {
                    return 'AVHRR APP-x Cloud Binary Mask';
                }
                else if (layerKey === 'NARR-A Monthly/default') {
                    return 'NARR-A Monthly (Ground Heat Flux)';
                }
                else if (layerKey === 'Sea Water Temperature/default') {
                    return 'Arctic Regional Climatology (Sea Water Temperature)';
                }
                else if (layerKey === 'Salinity/default') {
                    return 'Arctic Regional Climatology (Salinity)';
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
                var a = item.feature.attributes;

                if (item.formatter === 'Multibeam/Multibeam Bathymetric Surveys') {
                    return this.getItemLabelSpan(a['Survey ID'] + ' <i>(' + a['Survey Year'] + ')</i>', uid);
                } 
                else if (item.formatter === 'Trackline Bathymetry/Marine Trackline Surveys: Bathymetry') {
                    return this.getItemLabelSpan(a['Survey ID'] + ' <i>(' + a['Survey Year'] + ')</i>', uid);
                }
                else if (item.formatter === 'Trackline Combined/Marine Trackline Surveys: Gravity') {
                    return this.getItemLabelSpan(a['Survey ID'] + ' <i>(' + a['Survey Year'] + ')</i>', uid);
                }
                else if (item.formatter === 'Trackline Combined/Marine Trackline Surveys: Magnetics') {
                    return this.getItemLabelSpan(a['Survey ID'] + ' <i>(' + a['Survey Year'] + ')</i>', uid);
                }
                else if (item.formatter === 'Trackline Combined/Marine Trackline Surveys: Multi-Channel Seismics') {
                    return this.getItemLabelSpan(a['Survey ID'] + ' <i>(' + a['Survey Year'] + ')</i>', uid);
                }
                else if (item.formatter === 'Trackline Combined/Marine Trackline Surveys: Seismic Refraction') {
                    return this.getItemLabelSpan(a['Survey ID'] + ' <i>(' + a['Survey Year'] + ')</i>', uid);
                }
                else if (item.formatter === 'Trackline Combined/Marine Trackline Surveys: Shot-Point Navigation') {
                    return this.getItemLabelSpan(a['Survey ID'] + ' <i>(' + a['Survey Year'] + ')</i>', uid);
                }
                else if (item.formatter === 'Trackline Combined/Marine Trackline Surveys: Side Scan Sonar') {
                    return this.getItemLabelSpan(a['Survey ID'] + ' <i>(' + a['Survey Year'] + ')</i>', uid);
                }
                else if (item.formatter === 'Trackline Combined/Marine Trackline Surveys: Single-Channel Seismics') {
                    return this.getItemLabelSpan(a['Survey ID'] + ' <i>(' + a['Survey Year'] + ')</i>', uid);
                }
                else if (item.formatter === 'Trackline Combined/Marine Trackline Surveys: Subbottom Profile') {
                    return this.getItemLabelSpan(a['Survey ID'] + ' <i>(' + a['Survey Year'] + ')</i>', uid);
                }
                else if (item.formatter === 'Trackline Combined/Aeromagnetic Surveys') {
                    if (item.feature.attributes['Start Year'] && item.feature.attributes['End Year'] && 
                        item.feature.attributes['Start Year'] !== item.feature.attributes['End Year']) {
                        return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + ' <i>(' + item.feature.attributes['Start Year'] + '-' + item.feature.attributes['End Year'] + ')</i>', uid);
                    }
                    else {
                        return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + ' <i>(' + item.feature.attributes['Start Year'] + ')</i>', uid);
                    }
                }
                else if (item.formatter === 'NOS Hydrographic Surveys/Surveys with BAGs') {
                    return this.getItemLabelSpan(a['Survey ID'] + (a['Survey Year'] === 'Null' ? '' : ' <i>(' + a['Survey Year'] + ')</i>'), uid);
                } 
                else if (item.formatter === 'NOS Hydrographic Surveys/Surveys with Digital Sounding Data') {
                    return this.getItemLabelSpan(a['Survey ID'] + (a['Survey Year'] === 'Null' ? '' : ' <i>(' + a['Survey Year'] + ')</i>'), uid);
                }
                else if (item.formatter === 'NOS Hydrographic Surveys/Surveys without Digital Sounding Data') {
                    return this.getItemLabelSpan(a['Survey ID'] + (a['Survey Year'] === 'Null' ? '' : ' <i>(' + a['Survey Year'] + ')</i>'), uid);
                } 
                else if (item.formatter === 'DEM Extents/NCEI Digital Elevation Models') {
                    return this.getItemLabelSpan(a['Name'] + ' <i>(' + a['Cell Size'] + ')</i>', uid);
                }
                else if (item.formatter === 'DEM Tiles/DEM Tiles') {
                    return this.getItemLabelSpan(a['NAME'] + ' <i>(' + a['CELL_SIZE'] + ')</i>', uid);
                }

                else if (item.formatter === 'Marine Geology/Marine Geology Data Sets/Reports') {
                    if (a['Hole/Sample ID'] !== 'Null') {
                        return this.getItemLabelSpan('Sample: ' + a['Hole/Sample ID'], uid);
                    } else {
                        return this.getItemLabelSpan('Sample ID not available', uid);
                    }
                }
                else if (item.formatter === 'Sample Index/All Samples by Institution') {
                    if (a['Alternate Cruise or Leg'] === 'Null') {
                        return this.getItemLabelSpan(a['Cruise or Leg'] + ':' + a['Sample ID'] + ':' + a['Device'] + ' (' + a['Repository'] + ')', uid);
                    }
                    else {
                        return this.getItemLabelSpan(a['Cruise or Leg'] + ' (' + a['Alternate Cruise or Leg'] + '):' + a['Sample ID'] + ':' + a['Device'] + ' (' + a['Repository'] + ')', uid);
                    }
                }

                else if (item.formatter === 'Undersea Features/Point Features' || item.formatter === 'Undersea Features/Line Features' || item.formatter === 'Undersea Features/Polygon Features') {
                    return this.getItemLabelSpan(a['NAME'] + ' ' + a['TYPE'], uid);
                } 

                else if (item.formatter === 'CRN/Climate Reference Network') {
                    return this.getItemLabelSpan(a['STATION'] + ' (' + a['STATE'] + ')', uid);
                }
                else if (item.formatter === 'GHCND/GHCN Daily') {
                    return this.getItemLabelSpan(a['STATION_NAME'], uid);
                }
                else if (item.formatter === 'GSOM/Global Surface Summary of the Month') {
                    return this.getItemLabelSpan(a['STATION_NAME'], uid);
                }
                else if (item.formatter === 'GSOY/Global Surface Summary of the Year') {
                    return this.getItemLabelSpan(a['STATION_NAME'], uid);
                }
                else if (item.formatter === 'ISD/Hourly Global') {
                    return this.getItemLabelSpan(a['STATION'], uid);
                }
                else if (item.formatter === 'DSCRTP/Locations') {
                    return this.getItemLabelSpan(a['scientificname'] + '(' + a['vernacularnamecategory'] + ')', uid);
                }
                else if (item.formatter === 'Sea Ice Index Daily Concentration/default') {
                    return this.getSeaIceIndexLabel(a['GRAY_INDEX']);
                }
                else if (item.formatter === 'Sea Ice Index Monthly Concentration/default') {
                    return this.getSeaIceIndexLabel(a['GRAY_INDEX']);
                }
                else if (item.formatter === 'AVHRR surface_albedo/default') {
                    return a['Value'];
                }
                else if (item.formatter === 'AVHRR sea_ice_thickness/default') {
                    return a['Value'] + ' m';
                }
                else if (item.formatter === 'AVHRR cloud_binary_mask/default') {
                    return a['Value'];
                }
                else if (item.formatter === 'NARR-A Monthly/default') {
                    return a['Value'] + ' W/m^2';
                }
                else if (item.formatter === 'Sea Water Temperature/default') {
                    return a['Value'] + '°C';
                }
                else if (item.formatter === 'Salinity/default') {
                    return a['Value'];
                }
                
            },

            getSeaIceIndexLabel: function(value) {
                var val = parseFloat(value);
                if (val <= 100) {
                    return val.toFixed(1) + '%';
                } else {
                    return '0.0%';
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
                                    objectIdField: item.objectIdField,
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
                
                var url = "https://www.ngdc.noaa.gov/next-web/orders/create";

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
            }
        });
    }
);