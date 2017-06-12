define([
    'dojo/_base/declare', 
    'dojo/_base/config', 
    'dojo/_base/array', 
    'dojo/string',
    'dojo/topic', 
    'dojo/_base/lang',
    'dojo/dom-style',
    'dijit/form/Button', 
    'dijit/Tooltip',
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
        Button,
        Tooltip,
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
                        } else if (this.currentItem.attributes['Item ID']) {
                            itemId = this.currentItem.attributes['Item ID'];
                        }
                        this.extractData(itemId);
                    })
                }).placeAt(this.infoPageBottomBar);
            },

            showResults: function() {
                this.inherited(arguments);
                // if (this.numFeatures >= 1000) {
                //     this.featurePageTitle = "Identified Features (" + this.numFeatures + "+, results limited to 1000)";
                //     this.setTitle(this.featurePageTitle);
                // }
            },

            getLayerDisplayLabel: function(item, count) {

                if (item.layerName === 'Multibeam Bathymetric Surveys') {
                    return '<i><b>Multibeam Bathymetric Surveys (' + this.formatCountString(count) + ')</b></i>';
                } 
                else if (item.layerName === 'Marine Trackline Surveys: Bathymetry') {
                    return '<i><b>Single-Beam Bathymetric Surveys (' + this.formatCountString(count) + ')</b></i>';
                } 
                else if (item.layerName === 'Surveys with BAGs') {
                    return '<i>Surveys wth BAGs (' + this.formatCountString(count) + ')</i>';
                } 
                else if (item.layerName === 'Surveys with Digital Sounding Data') {
                    return '<i>Surveys with Digital Sounding Data (' + this.formatCountString(count) + ')</i>';
                } 
                else if (item.layerName === 'Surveys without Digital Sounding Data') {
                    return '<i>Surveys without Digital Sounding Data (' + this.formatCountString(count) + ')</i>';
                } 
                else if (item.layerName === 'All NCEI Bathymetric DEMs') {
                    return '<i><b>Digital Elevation Models (' + this.formatCountString(count) + ')</b></i>';
                }
                else if (item.layerName === 'CSB') {
                    return '<i><b>Crowdsourced Bathymetry Files (' + this.formatCountString(count) + ')</b></i>';
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
                else if (item.layerName === 'All NCEI Bathymetric DEMs') {
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
            },

            getItemLabelSpan: function(text, uid) {
                return '<span id="itemLabel-' + uid + '">' + text + '</span>';
            },

            populateFeatureStore: function(results) {
                var totalFeatures = 0;
                var numFeaturesForLayer = 0;
                this.expandedNodePaths = [];
                this.identifyResults = results;

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
                                
                                if (svcName === 'NOS Hydrographic Surveys' || svcName === 'NOS Hydro (non-digital)') {
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
                                        parent: svcName === 'NOS Hydrographic Surveys' || svcName === 'NOS Hydro (non-digital)' ? 
                                            'NOS Hydrographic Surveys' : 'root'
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
                                    parent: layerName,
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

                if (layerName === 'CSB') {
                    this.extractSingleDatasetButton.set('label', 'Extract this File');
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

            //Construct an object containing the filter criteria, adhering to the format the NEXT API is expecting, 
            //i.e.: {items: [{dataset: 'Multibeam', platforms: 'Knorr,Okeanos Explorer'}, {dataset: 'Sounding', startYear: 2000}]}
            constructFilterCriteria: function(itemId /*optional survey/DEM id*/) {
                var filterCriteria = {items: []};
                var datasetInfo;
                var latLonExtent;
                var surveyIds;
                var identifyResults;
                var extent;

                // if (this.identify.searchGeometry.type === 'extent') {
                //     extent = this.identify.searchGeometry;
                // } else if (this.identify.searchGeometry.type === 'polygon') {
                //     extent = this.identify.searchGeometry.getExtent();
                // }

                datasetInfo = {dataset: 'csb'};
                
                //Pass the list of file names from the identifyResults
                names = [];
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
                
                return filterCriteria;
            },
            
            submitFormToNext: function(postBody) {
                console.debug("sending order via form submission to NEXT: ", postBody);
                
                var url = "https://www.ngdc.noaa.gov/next-web/orders/create";
                //var url = "https://acceptance.ngdc.noaa.gov/next-web/orders/create";                

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