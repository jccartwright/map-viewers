define(["dojo/_base/declare", "dojo/_base/lang", "ngdc/web_mercator/MapConfig", "ngdc/Banner", "ngdc/MapToolbar", "app/BasemapToolbar",
        "ngdc/CoordinatesToolbar", "app/Identify", "app/AppIdentifyPane",
        "app/SearchDialog", "ngdc/bboxDialog/BoundingBoxDialog",
        "dojo/_base/lang", "dojo/dom", "dojo/_base/fx", "dijit/registry",        
        "dojo/topic", "dojo/on", "dojo/string"],
    function(declare, lang, MapConfig, Banner, MapToolbar, BasemapToolbar,
        CoordinatesToolbar, Identify, AppIdentifyPane,
        SearchDialog, BoundingBoxDialog,
        lang, dom, baseFx, registry,
        topic, on, string){
        
        return declare([MapConfig], {
            
            constructor: function() {
                this.banner = new Banner({
                    breadcrumbs: [
                        {url: 'http://www.noaa.gov', label: 'NOAA'},
                        {url: 'http://www.nesdis.noaa.gov', label: 'NESDIS'},
                        {url: 'http://www.ngdc.noaa.gov', label: 'NGDC'},
                        {url: 'http://maps.ngdc.noaa.gov/viewers', label: 'Maps'},
                        {url: 'http://www.ngdc.noaa.gov/mgg/wcd/', label: 'Water Column Sonar Data'}           
                    ],
                    dataUrl: "http://www.ngdc.noaa.gov/mgg/wcd/",
                    image: "/images/water_column_sonar_data_viewer_logo.png"
                });
                this.banner.placeAt('banner');   
            },

            //handle setup which requires all layers to be loaded
            mapReady: function() {
                this.inherited(arguments);

                //console.log("inside custom mapReady...");
                  
                this.wcdMapService = this.mapLayerCollection.getLayerById('Water Column Sonar');


                this.basemapToolbar = new BasemapToolbar({map: this.map, layerCollection: this.mapLayerCollection}, "basemapToolbar");
                this.basemapToolbar.startup();

                this.coordinatesToolbar = new CoordinatesToolbar({map: this.map}, "coordinatesToolbar");

                this.identify = new Identify({mapConfig: this});

                this.visibleLayers = {1: true, 2: true, 3: true, 4: true};
                
                
                this.identifyPane = new AppIdentifyPane({
                    map: this.map,
                    class: "identifyPane",
                    autoExpandTree: false
                }, dom.byId("identifyPaneDiv"));
                this.identifyPane.startup();
                

                //remove?
                this.map.identifyPane = this.identifyPane; 

                on(registry.byId("checkNMFS"), "change", lang.hitch(this, function(checked) {
                    this.setSublayerVisibility(1, checked);
                })); 
                on(registry.byId("checkOER"), "change", lang.hitch(this, function(checked) {
                    this.setSublayerVisibility(2, checked);
                })); 
                on(registry.byId("checkUNOLS"), "change", lang.hitch(this, function(checked) {
                    this.setSublayerVisibility(3, checked);
                })); 
                on(registry.byId("checkOther"), "change", lang.hitch(this, function(checked) {
                    this.setSublayerVisibility(4, checked);
                })); 

                on(registry.byId("searchButton"), "click", lang.hitch(this, function() {
                    if (!this.searchDialog) {
                        this.searchDialog = new SearchDialog({title: 'Water Column Sonar Data Search'});
                    }
                    this.searchDialog.show();
                }));

                on(registry.byId("resetButton"), "click", lang.hitch(this, function() {
                    this.resetWcd();
                }));

                //Subscribe to messages passed by the search dialogs
                topic.subscribe("/wcd/Search", lang.hitch(this, function(values) {
                    this.filterWcd(values);
                }));
                topic.subscribe("/wcd/ResetSearch", lang.hitch(this, function() {
                    this.resetWcd();
                }));

                //this.map.centerAt([0,40]);
            },

            setSublayerVisibility: function(index, visible) {
                if (visible) {
                    this.visibleLayers[index] = true;
                }
                else {
                    delete this.visibleLayers[index];
                }
                this.wcdMapService.setVisibleLayers(this.setToArray(this.visibleLayers));
            },

            filterWcd: function(values) {
                var layerDefinition;
                var layerDefinitions = [];
                var sql = [];   

                if (values.startDate) {
                    sql.push("COLLECTION_DATE>=date '" + this.toDateString(values.startDate) + "'");
                }
                if (values.endDate) {
                    sql.push("COLLECTION_DATE<=date '" + this.toDateString(values.endDate) + "'");
                }
                if (values.cruiseId) {
                    //sql.push("UPPER(CRUISE_NAME)='" + values.cruiseId.toUpperCase() + "'");
                    sql.push("UPPER(CRUISE_NAME) LIKE '" + values.cruiseId.toUpperCase().replace('*', '%') + "'");
                }
                if (values.instruments.length > 0) {
                    var quoted = [];
                    for (var i = 0; i < values.instruments.length; i++) {
                        //Surround each string with single quotes
                        quoted.push("'" + values.instruments[i] + "'");
                    }
                    sql.push("INSTRUMENT_NAME in (" + quoted.join(',') + ")");
                }
                if (values.minNumBeams) {
                    sql.push("NUMBEROFBEAMS >= " + values.minNumBeams);
                }
                if (values.maxNumBeams) {
                    sql.push("NUMBEROFBEAMS <= " + values.maxNumBeams);
                }
                if (values.minRecordingRange) {
                    sql.push("RECORDINGRANGE >= " + values.minRecordingRange);
                }
                if (values.maxRecordingRange) {
                    sql.push("RECORDINGRANGE <= " + values.maxRecordingRange);
                }
                if (values.minSwathWidth) {
                    sql.push("SWATHWIDTH >= " + values.minSwathWidth);
                }
                if (values.maxSwathWidth) {
                    sql.push("SWATHWIDTH <= " + values.maxSwathWidth);
                }
                //TODO: Add frequency select

                //Apply to all 4 sublayers
                layerDefinition = sql.join(' AND ');
                layerDefinitions[1] = layerDefinition;
                layerDefinitions[2] = layerDefinition;
                layerDefinitions[3] = layerDefinition;
                layerDefinitions[4] = layerDefinition;
                
                this.wcdMapService.setLayerDefinitions(layerDefinitions);
                
                registry.byId("resetButton").set("disabled", false);
                this.setCurrentFilterString(values);
            },

            resetWcd: function() {            
                this.wcdMapService.setLayerDefinitions([]);
                registry.byId("resetButton").set("disabled", true);
                this.searchDialog.clearForm();
                dom.byId('currentFilter').innerHTML = '';
            },

            setCurrentFilterString: function(values) {
                var filterDiv = dom.byId('currentFilter');
                var s = '<b>Current filter:</b><br>';
                
                if (values.startDate && values.endDate) {
                    s += 'Date: ' + this.toDateString(values.startDate) + ' to ' + this.toDateString(values.endDate) + '<br>';
                }
                else if (values.startDate) {
                    s += 'Starting date: ' + this.toDateString(values.startDate) + '<br>';
                }
                else if (values.endDate) {
                    s += 'Ending date: ' + this.toDateString(values.endDate) + '<br>';
                }

                if (values.cruiseId) {
                    s += 'Survey ID: ' + values.cruiseId + '<br>';
                }
                if (values.instruments.length > 0) {
                    s += 'Instrument: ' + values.instruments.join(',') + '<br>';
                }

                if (values.minNumBeams && values.maxNumBeams) {
                    s += 'Number of beams: ' + values.minNumBeams + ' to ' + values.maxNumBeams + '<br>';
                }
                else if (values.minNumBeams) {
                    s += 'Number of beams: greater than ' + values.minNumBeams + '<br>';
                }
                else if (values.maxNumBeams) {
                    s += 'Number of beams: less than ' + values.maxNumBeams + '<br>';
                }

                if (values.minRecordingRange && values.maxRecordingRange) {
                    s += 'Recording range: ' + values.minRecordingRange + ' to ' + values.maxRecordingRange + ' m<br>';
                }
                else if (values.minRecordingRange) {
                    s += 'Recording range: greater than ' + values.minRecordingRange + ' m<br>';
                }
                else if (values.maxRecordingRange) {
                    s += 'Recording range: less than ' + values.maxRecordingRange + ' m<br>';
                }

                if (values.minSwathWidth && values.maxSwathWidth) {
                    s += 'Swath width: ' + values.minSwathWidth + ' to ' + values.maxSwathWidth + ' degrees<br>';
                }
                else if (values.minSwathWidth) {
                    s += 'Swath width: greater than ' + values.minSwathWidth + ' degrees<br>';
                }
                else if (values.maxSwathWidth) {
                    s += 'Swath width: less than ' + values.maxSwathWidth + ' degrees<br>';
                }
                filterDiv.innerHTML = s;
            },

            //Format a date in the form yyyymmdd
            toDateString: function(date) {
                //return date.getFullYear() + '-' + padDigits(date.getMonth()+1,2) + '-' + padDigits(date.getDate(),2);
                return date.getFullYear() + '-' + string.pad(date.getMonth()+1, 2) + '-' + string.pad(date.getDate(), 2);
            },

            padDigits: function(n, totalDigits){
                n = n.toString();
                var pd = '';
                if (totalDigits > n.length) {
                    for (i = 0; i < (totalDigits - n.length); i++) {
                        pd += '0';
                    }
                }
                return pd + n.toString();
            },

            setToArray: function(set) {
                var array = [];
                for (key in set) {
                    if (set.hasOwnProperty(key)) {
                        array.push(parseInt(key));
                    }
                }
                if (array.length) {
                    return array;
                } else {
                    return [-1];
                }
            }          
            
        });
    }
);
