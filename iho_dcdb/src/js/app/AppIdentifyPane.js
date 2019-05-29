define([
    'dojo/_base/declare', 
    'dojo/_base/config', 
    'dojo/_base/array', 
    'dojo/_base/lang',
    'dojo/dom-style',
    'dojo/io-query',
    'dijit/Dialog',
    'dijit/form/Button',
    'dijit/form/DropDownButton', 
    'dijit/DropDownMenu', 
    'dijit/MenuItem', 
    'dijit/Tooltip',
    'esri/geometry/webMercatorUtils',
    'ngdc/identify/IdentifyPane' 
    ],
    function(
        declare, 
        config, 
        array, 
        lang,
        domStyle,
        ioQuery,
        Dialog,
        Button,
        DropDownButton,
        DropDownMenu,
        MenuItem,
        Tooltip,
        webMercatorUtils,
        IdentifyPane
        ){

        return declare([IdentifyPane], {

            gebcoSIDDescriptions: {
                '0': 'Predicted based on satellite-derived gravity data - depth value is an interpolated value guided by satellite-derived gravity data (from SRTM15_plus)',
                '10': 'Singlebeam - depth value collected by a single beam echo-sounder',
                '11': 'Multibeam - depth value collected by a multibeam echo-sounder',
                '12': 'Seismic - depth value collected by seismic methods',
                '13': 'Isolated sounding - depth value that is not part of a regular survey or trackline',
                '14': 'ENC sounding - depth value extracted from an Electronic Navigation Chart (ENC)',
                '15': 'Interpolated based on a computer algorithm - depth value is an interpolated value based on a computer algorithm (e.g. Generic Mapping Tools)',
                '16': 'Digital bathymetric contours from charts - depth value taken from a bathymetric contour data set',
                '17': 'Digital bathymetric contours from ENCs - depth value taken from bathymetric contours from an Electronic Navigation Chart (ENC)',
                '18': 'Pre-generated grid - depth value is taken from a pre-generated grid that is based on mixed source data types, e.g. single beam, multibeam, interpolation etc.',
                '19': 'Unknown source - depth value from an unknown source',
                '20': 'Steering points - depth value used to constrain the grid in areas of poor data coverage',
                '21': 'Lidar - depth derived from a bathymetric lidar sensor',
                '22': 'Bathymetric sounding - depth value at this location is constrained by bathymetric sounding(s) from the SRTM15_plus data set. <i>Note: this includes many multibeam surveys from the IHO DCDB.</i>',
                '23': 'Pre-generated grid - depth value is based on the GEBCO_08 Grid. This data set is a global grid at 30 arc-seconds. It was largely generated from a data base of ship-track soundings with interpolation between soundings guided by satellite-derived gravity data',
                '-8888': 'Land elevations'
            },

            constructor: function() {
                this.magnifyingGlassIconUrl = config.app.ngdcDijitsUrl + '/identify/images/magnifier.png';
            },

            postCreate: function() {
                this.inherited(arguments);
                domStyle.set(this.domNode, 'height', '350px');
                domStyle.set(this.domNode, 'width', '400px');

                domStyle.set(this.featurePageBottomBar.domNode, 'height', '30px');
                this.featurePageBottomBar.style = 'height: 50px;';

                var menu = new DropDownMenu({ style: "display: none;"});
                this.multibeamMenuItem = new MenuItem({
                    label: 'Extract Multibeam Data',
                    disabled: true,
                    onClick: lang.hitch(this, function(){ 
                        this.openNextWarningDialog('multibeam');
                        //this.extractData('multibeam');
                    })
                });
                menu.addChild(this.multibeamMenuItem);

                this.tracklineMenuItem = new MenuItem({
                    label: 'Extract Single-Beam Data',
                    disabled: true,
                    onClick: lang.hitch(this, function(){ 
                        this.openNextWarningDialog('trackline');
                        //this.extractData('trackline');
                    })
                });
                menu.addChild(this.tracklineMenuItem);

                this.csbMenuItem = new MenuItem({
                    label: 'Extract CSB Data',
                    disabled: true,
                    onClick: lang.hitch(this, function(){ 
                        this.openNextWarningDialog('csb');
                        //this.extractData('csb');
                    })
                });
                menu.addChild(this.csbMenuItem);

                this.nosMenuItem = new MenuItem({
                    label: 'Extract NOAA Hydrographic Survey Data',
                    disabled: true,
                    onClick: lang.hitch(this, function(){ 
                        this.openNextWarningDialog('nos');
                        //this.extractData('nos');
                    })
                });
                menu.addChild(this.nosMenuItem);
                menu.startup();

                this.extractDataButton = new DropDownButton({
                    label: 'Extract NCEI/DCDB Data',
                    style: 'bottom: 5px; left: 15px;',
                    iconClass: 'downloadIcon',
                    dropDown: menu
                }).placeAt(this.featurePageBottomBar);
            },

            showResults: function() {
                this.inherited(arguments);
                
                if (this.isCsb || this.isMultibeam || this.isNosHydro || this.isTracklineBathymetry) {
                    domStyle.set(this.extractDataButton.domNode, 'display', '');
                    
                    this.multibeamMenuItem.set('disabled', true);
                    this.tracklineMenuItem.set('disabled', true);
                    this.nosMenuItem.set('disabled', true);
                    this.csbMenuItem.set('disabled', true);

                    if (this.isMultibeam) {
                        this.multibeamMenuItem.set('disabled', false);
                    }
                    if (this.isTracklineBathymetry) {
                        this.tracklineMenuItem.set('disabled', false);
                    }
                    if (this.isNosHydro) {
                        this.nosMenuItem.set('disabled', false);
                    }
                    if (this.isCsb) {
                        this.csbMenuItem.set('disabled', false);
                    }
                } else {
                    domStyle.set(this.extractDataButton.domNode, 'display', 'none');                    
                }

                this.inherited(arguments);

                // if (this.identifyResults['CSB'] && this.identifyResults['CSB']['CSB']) {
                //     domStyle.set(this.extractDataButton.domNode, 'display', '');
                // } else {
                //     domStyle.set(this.extractDataButton.domNode, 'display', 'none');
                // }
                
                // if (this.numFeatures >= 1000) {
                //     this.featurePageTitle = "Identified Features (" + this.numFeatures + "+, results limited to 1000)";
                //     this.setTitle(this.featurePageTitle);
                // }
            },

            getLayerDisplayLabel: function(item, count) {
                if (item.formatter === 'CSB/CSB Points' || item.formatter === 'CSB/CSB Lines' || item.formatter === 'CSB/CSB Polygons') {
                    item.formatter = 'CSB/CSB';
                }
                return '<i><b>' + this.getFolderName(item.formatter) + ' (' + this.formatCountString(this.folderCounts[this.getFolderName(item.formatter)]) + ')</b></i>';
            },


            getFolderName: function(layerKey) {
                if (layerKey === 'Multibeam/Multibeam Bathymetric Surveys') {
                    return 'NOAA NCEI Multibeam Bathymetric Surveys';
                } 
                else if (layerKey === 'Trackline Bathymetry/Marine Trackline Surveys: Bathymetry') {
                    return 'NOAA NCEI Single-Beam Bathymetric Surveys';
                }  
                else if (layerKey === 'NOS Hydrographic Surveys/Surveys with BAGs') {
                    return 'Surveys wth BAGs';
                } 
                else if (layerKey === 'NOS Hydrographic Surveys/Surveys with Digital Sounding Data') {
                    return 'Surveys with Digital Sounding Data';
                }               
                else if (layerKey === 'CSB/CSB') { //CSB points/lines/polygons have been collapsed into one layer (Identify.js:sortResults())
                    return 'Crowdsourced Bathymetry Files';
                }                                              
                else if (layerKey === 'NRCan Multibeam/Multibeam Bathymetry Index Map - Bathymétrie Multifaisceaux Couches Index ') {
                    return 'NRCan Multibeam Datasets';
                }
                else if (layerKey === 'EMODnet Singlebeam Polygons/default' || layerKey === 'EMODnet Singlebeam Lines/default') {
                    return 'EMODnet Single-Beam Bathymetric Surveys';
                }
                else if (layerKey === 'EMODnet Multibeam Polygons/default' || layerKey === 'EMODnet Multibeam Lines/default') {
                    return 'EMODnet Multibeam Bathymetric Surveys';
                }
                else if (layerKey === 'GEBCO_2019 SID/GEBCO_2019 SID') {
                    return 'GEBCO_2019 Source Identifier Grid';
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
                if (item.layerName === 'Multibeam Bathymetric Surveys') {
                    return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>', uid);
                } 
                else if (item.layerName === 'Marine Trackline Surveys: Bathymetry') {
                    return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>', uid);
                } 
                else if (item.layerName === 'Surveys with BAGs') {
                    return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + (item.feature.attributes['Survey Year'] === 'Null' ? '' : ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>'), uid);
                } 
                else if (item.layerName === 'Surveys with Digital Sounding Data') {
                    return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + (item.feature.attributes['Survey Year'] === 'Null' ? '' : ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>'), uid);
                } 
                else if (item.layerName === 'Surveys without Digital Sounding Data') {
                    return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + (item.feature.attributes['Survey Year'] === 'Null' ? '' : ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>'), uid);
                } 
                else if (item.layerName === 'NCEI Digital Elevation Models') {
                    return this.getItemLabelSpan(item.feature.attributes['Name'] + ' <i>(' + item.feature.attributes['Cell Size'] + ')</i>', uid);
                }
                else if (item.layerName === 'CSB') {
                    //return this.getItemLabelSpan(item.feature.attributes['NAME'], uid);
                    var startDate = item.feature.attributes['Start Date'];
                    var endDate = item.feature.attributes['End Date'];
                    if (startDate === 'Null' && endDate === 'Null') {
                        return 'Unknown date';
                    } else if (startDate !== 'Null' && endDate === 'Null') {
                        return this.getItemLabelSpan(this.identify.formatDate(startDate) + ' - Unknown date', uid);
                    } else if (startDate === 'Null' && endDate !== 'Null') {
                        return this.getItemLabelSpan('Unknown date - ' + this.identify.formatDate(endDate) , uid);
                    } else {
                        return this.getItemLabelSpan(this.identify.formatDate(startDate) + ' - ' + this.identify.formatDate(endDate) , uid);   
                    }
                }
                else if (item.formatter === 'NRCan Multibeam/Multibeam Bathymetry Index Map - Bathymétrie Multifaisceaux Couches Index ') {
                    return this.getItemLabelSpan(item.feature.attributes['TITLE_EN'], uid);
                }

                else if (item.formatter === 'EMODnet Singlebeam Polygons/default' || item.formatter === 'EMODnet Singlebeam Lines/default' ||
                    item.formatter === 'EMODnet Multibeam Polygons/default' || item.formatter === 'EMODnet Multibeam Lines/default') {
                    return this.getItemLabelSpan(item.feature.attributes['Data set name'], uid);
                }
                
                else if (item.layerName === 'GEBCO_2019 SID') {
                    return this.gebcoSIDDescriptions[item.feature.attributes['Pixel Value']];
                } 
            },

            getItemLabelSpan: function(text, uid) {
                return '<span id="itemLabel-' + uid + '">' + text + '</span>';
            },

            populateFeatureStore: function(results) {
                var totalFeatures = 0;
                var numFeaturesForLayer = 0;
                this.expandedNodePaths = [];
                this.isCsb = false;
                this.isNosHydro = false;
                this.isMultibeam = false;
                this.isTracklineBathymetry = false;
                this.identifyResults = results;

                this.computeFolderCounts(results);

                for (var i = 0; i < this.identify.layerIds.length; i++) { //Iterate through the layerIds, specified in Identify.js. This maintains the desired ordering of the layers.
                    var svcName = this.identify.layerIds[i];
                    for (var layerName in results[svcName]) {

                        numFeaturesForLayer = results[svcName][layerName].length;
                        totalFeatures += numFeaturesForLayer;

                        for (var j = 0; j < results[svcName][layerName].length; j++) {
                            var item = results[svcName][layerName][j];
                            var layerKey = svcName + '/' + layerName;
                            var layerUrl = results[svcName][layerName][j].layerUrl;
                            var layerType = results[svcName][layerName][j].layerType;

                            if (svcName === 'NOS Hydrographic Surveys') {
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
                                    parent: svcName === 'NOS Hydrographic Surveys' ? 
                                        'NOS Hydrographic Surveys' : 'root'
                                });
                            }

                            if (svcName === 'CSB') {
                                this.isCsb = true;
                            }
                            if (svcName === 'Multibeam') {
                                this.isMultibeam = true;
                            }
                            if (svcName === 'Trackline Bathymetry') {
                                this.isTracklineBathymetry = true;
                            }
                            
                            //Add the current item to the store, with the layerName folder as parent
                            this.featureStore.put({
                                uid: ++this.uid,
                                id: this.uid,                                
                                displayLabel: this.getItemDisplayLabel(item, this.uid),
                                label: this.getItemDisplayLabel(item, this.uid) + " <a id='zoom-" + this.uid + "' href='#' class='zoomto-link'><img src='" + this.magnifyingGlassIconUrl + "'></a>",
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
                if (this.identify.searchGeometry.type !== 'point') {
                    this.featureStore.put({
                        uid: ++this.uid,
                        id: 'EMODnet',
                        label: '<i>Note: WMS layers (EMODnet, MAREANO) are only available using a point (single-click) to identify.</i>',
                        type: 'item',
                        //If NOS Hydro, parent is the NOS Hydro folder, else parent is root.
                        parent: 'root'
                    });
                }
                return totalFeatures;
            },

            // constructFeatureTree: function() {
            //     this.inherited(arguments);

            //     //Add the NOS Hydro sub-layers to the list of nodes to be expanded to
            //     this.expandedNodePaths.push(['root', 'NOS Hydrographic Surveys', 'Surveys with BAGs']);
            //     this.expandedNodePaths.push(['root', 'NOS Hydrographic Surveys', 'Surveys with Digital Sounding Data']);

            //     this.tree.set('paths', this.expandedNodePaths);
            // },


            showInfo: function() {
                this.inherited(arguments);

                var layerName = this.currentItem.layerKey.split('/')[0];

                if (layerName === 'CSB') {
                    this.extractSingleDatasetButton.set('label', 'Extract this File');
                    domStyle.set(this.extractSingleDatasetButton.domNode, 'display', '');
                } else {
                    domStyle.set(this.extractSingleDatasetButton.domNode, 'display', 'none');
                }
            },

            openNextWarningDialog: function(datasetId, itemId) {
                //Temporary warning dialog for NEXT extract
                var okDialog = new Dialog({
                    title: 'Warning',
                    content: 'We are experiencing technical difficulties with the data delivery system for bathymetry  data. If you experience problems or do not receive your requested data, please contact <a href="mailto:mb.info@noaa.gov">mb.info@noaa.gov</a> for assistance.<br>',
                    'class': 'requestDataDialog',
                    style: 'width:300px'
                });
                new Button({
                    label: 'OK',
                    type: 'submit',
                    onClick: lang.hitch(this, function(){
                        this.extractData(datasetId, itemId);
                        okDialog.destroy();
                    })
                }).placeAt(okDialog.containerNode);
                okDialog.show();
            },

            extractData: function(datasetId, itemId /*Optional survey/DEM id*/) {   
                var filterCriteria = this.constructFilterCriteria(datasetId, itemId);
                if (filterCriteria.items.length > 0) {   
                    if (datasetId === 'trackline') {
                        this.openGetTracklineDataWindow(filterCriteria);
                    }            
                    this.submitFormToNext(filterCriteria);
                }
            },

            getFilterItemById: function(filterCriteria, id /*'Multibeam'|'Sounding'*/) {
                for (var i = 0; i < filterCriteria.items.length; i++) {
                    if (filterCriteria.items[i].dataset === id) {
                        return filterCriteria.items[i];
                    }
                }                
            },

            //Construct an object containing the filter criteria, adhering to the format the NEXT API is expecting, 
            //i.e.: {items: [{dataset: 'Multibeam', platforms: 'Knorr,Okeanos Explorer'}, {dataset: 'Sounding', startYear: 2000}]}
            constructFilterCriteria: function(datasetId, itemId /*optional survey/DEM id*/) {
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

                if (datasetId === 'csb') {
                    datasetInfo = {dataset: 'csb'};
                
                    //Pass the list of file names from the identifyResults
                    var names = [];
                    if (itemId) {
                        names.push(itemId);
                    } else {
                        if (this.identifyResults['CSB'] && this.identifyResults['CSB']['CSB']) {
                            array.forEach(this.identifyResults['CSB']['CSB'], lang.hitch(this, function(identifyResult) {
                                names.push(identifyResult.feature.attributes['Name']);
                            }));
                        }
                    }
                    datasetInfo.names = names.join(',');
                    filterCriteria.items.push(datasetInfo);    
                }               
                else if (datasetId === 'multibeam') {
                    datasetInfo = {dataset: 'Multibeam'};
                    
                    if (extent) {
                        if (extent.spatialReference.wkid === 4326) {
                            latLonExtent = extent;
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
                else if (datasetId === 'nos') {
                    datasetInfo = {dataset: 'nos', grouped: true};
                    
                    if (extent) {
                        if (extent.spatialReference.wkid === 4326) {
                            latLonExtent = extent;
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
                else if (datasetId === 'trackline') {
                    datasetInfo = {surveyTypes: 'Bathymetry'};

                    if (extent) {
                        if (extent.spatialReference.wkid === 4326) {
                            latLonExtent = extent;
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
                        if (this.identifyResults['Trackline Bathymetry']['Marine Trackline Surveys: Bathymetry']) {
                            identifyResults = this.identifyResults['Trackline Bathymetry']['Marine Trackline Surveys: Bathymetry'];
                            array.forEach(identifyResults, lang.hitch(this, function(identifyResult) {
                                var surveyId = identifyResult.feature.attributes['Survey ID'];
                                if (array.indexOf(identifyResults, surveyId) === -1) {
                                    surveyIds.push(surveyId);
                                }
                            }));
                        }                        
                    }
                    datasetInfo.surveyIds = surveyIds.join(',');
                    filterCriteria.items.push(datasetInfo);
                }
                return filterCriteria;
            },
            
            submitFormToNext: function(postBody) {
                console.debug('sending order via form submission to NEXT: ', postBody);
                
                var url = 'https://www.ngdc.noaa.gov/next-web/orders/create';

                //create a new form element and submit it.
                var form = document.createElement('form');
                form.action = url;
                form.method = 'POST';
                form.target = '_blank';

                //JSON payload goes in "order" parameter
                var inputElement = document.createElement('textarea');
                inputElement.name = 'order';
                inputElement.value = JSON.stringify(postBody);

                form.appendChild(inputElement);
                form.style.display = 'none';
                document.body.appendChild(form);
                form.submit();

                //once the form is sent, it's useless to keep it.
                document.body.removeChild(form);
            },

            openGetTracklineDataWindow: function(filterCriteria) {
                if (this.mapId === 'arctic' || this.mapId === 'antarctic') {
                    alert('Warning: The "Draw Rectangle" tool for Arctic/Antarctic projections is currently unsupported for NCEI single-beam data extraction. The full cruises will be requested.');
                }

                var url = 'https://www.ngdc.noaa.gov/trackline/request/?' + ioQuery.objectToQuery(filterCriteria.items[0]);
                window.open(url);
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