define([
    'dojo/_base/declare', 
    'dojo/_base/config', 
    'dojo/_base/array', 
    'dojo/string',
    'dojo/topic', 
    'dojo/_base/lang',
    'dojo/dom-style',
    'dijit/form/Button', 
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
            },

            getLayerDisplayLabel: function(item, count) {
                return '<i><b>' + this.getFolderName(item.formatter) + ' (' + this.formatCountString(this.folderCounts[this.getFolderName(item.formatter)]) + ')</b></i>';
            },

            getFolderName: function(layerKey) {
                if (layerKey == 'Multibeam/Multibeam Bathymetric Surveys') {
                    return 'NOAA NCEI Multibeam Bathymetric Surveys';
                } 
                else if (layerKey == 'Trackline Bathymetry/Marine Trackline Surveys: Bathymetry') {
                    return 'NOAA NCEI Single-Beam Bathymetric Surveys';
                }                                 
                else if (layerKey == 'NRCan Multibeam/Multibeam Bathymetry Index Map - Bathymétrie Multifaisceaux Couches Index ') {
                    return 'NRCan Multibeam Datasets';
                }
                else if (layerKey == 'Portugal/Proprietary Bathymetric Surveys (Portugal)') {
                    return 'Proprietary Bathymetric Surveys (Portugal)';
                }
                else if (layerKey == 'EMODNet Singlebeam Polygons/default' || layerKey == 'EMODNet Singlebeam Lines/default') {
                    return 'EMODNet Single-Beam Bathymetric Surveys';
                }
                else if (layerKey == 'EMODNet Multibeam Polygons/default' || layerKey == 'EMODNet Multibeam Lines/default') {
                    return 'EMODNet Multibeam Bathymetric Surveys';
                }
                else if (layerKey == 'Protected Sites/OSPAR MPA Network') {
                    return 'OSPAR MPAs';
                }
                else if (layerKey == 'Protected Sites/NEAFC Closure Area') {
                    return 'NEAFC Fisheries Closures';
                }
                else if (layerKey == 'OER Planned Expeditions/Okeanos Explorer and Other 2017 Planned Mapping Areas') {
                    return 'NOAA/OER Planned Expeditions (areas)';
                }
                else if (layerKey == 'OER Planned Expeditions/Okeanos Explorer 2017 Planned Tracks') {
                    return 'NOAA/OER Planned Expeditions (tracks)';
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
                if (item.formatter == 'Multibeam/Multibeam Bathymetric Surveys') {
                    return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>', uid);
                } 
                else if (item.formatter == 'Trackline Bathymetry/Marine Trackline Surveys: Bathymetry') {
                    return this.getItemLabelSpan(item.feature.attributes['Survey ID'] + ' <i>(' + item.feature.attributes['Survey Year'] + ')</i>', uid);
                }
                else if (item.formatter == 'NRCan Multibeam/Multibeam Bathymetry Index Map - Bathymétrie Multifaisceaux Couches Index ') {
                    return this.getItemLabelSpan(item.feature.attributes['TITLE_EN'], uid);
                }
                else if (item.formatter == 'Portugal/Proprietary Bathymetric Surveys (Portugal)') {
                    return this.getItemLabelSpan(item.feature.attributes['AREA'] + ' ' + item.feature.attributes['P_START'] + '-' + item.feature.attributes['P_END'], uid);
                }
                else if (item.formatter == 'EMODNet Singlebeam Polygons/default' || item.formatter == 'EMODNet Singlebeam Lines/default' ||
                    item.formatter == 'EMODNet Multibeam Polygons/default' || item.formatter == 'EMODNet Multibeam Lines/default') {
                    return this.getItemLabelSpan(item.feature.attributes['Data set name'], uid);
                }
                else if (item.formatter == 'Protected Sites/OSPAR MPA Network') {
                    return this.getItemLabelSpan(item.feature.attributes['siteName'], uid);
                }
                else if (item.formatter == 'Protected Sites/NEAFC Closure Area') {
                    return this.getItemLabelSpan(item.feature.attributes['siteName'], uid);
                }   
                else if (item.formatter == 'OER Planned Expeditions/Okeanos Explorer and Other 2017 Planned Mapping Areas') {
                    return this.getItemLabelSpan(item.feature.attributes['Cruise ID'], uid);
                }
                else if (item.formatter == 'OER Planned Expeditions/Okeanos Explorer 2017 Planned Tracks') {
                    return this.getItemLabelSpan(item.feature.attributes['cruise_id'], uid);
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

                        numFeaturesForLayer = results[svcName][layerName].length;
                        totalFeatures += numFeaturesForLayer;

                        for (var j = 0; j < results[svcName][layerName].length; j++) {
                            var item = results[svcName][layerName][j];
                            var layerKey = svcName + '/' + layerName;
                            var layerUrl = results[svcName][layerName][j].layerUrl;
                            var layerType = results[svcName][layerName][j].layerType;
                            
                            //Create a layer "folder" node if it doesn't already exist
                            if (this.featureStore.query({id: this.getFolderName(layerKey)}).length === 0) {
                                this.featureStore.put({
                                    uid: ++this.uid,
                                    id: this.getFolderName(layerKey),
                                    label: this.getLayerDisplayLabel(item, this.folderCounts[this.getFolderName(layerKey)]),
                                    type: 'folder',
                                    parent: 'root'
                                });
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
                        id: 'EMODNet',
                        label: '<i>Note: WMS layers (EMODNet, MAREANO) are only available using a point (single-click) to identify.</i>',
                        type: 'item',
                        //If NOS Hydro, parent is the NOS Hydro folder, else parent is root.
                        parent: 'root'
                    });
                }
                return totalFeatures;
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