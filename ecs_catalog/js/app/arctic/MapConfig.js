define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/dom',
    'ngdc/arctic/MapConfig',
    'app/arctic/MapToolbar',
    'app/Identify',
    'app/AppIdentifyPane'
    ],
    function(
        declare, 
        lang, 
        dom,
        MapConfig,
        MapToolbar,
        Identify,
        IdentifyPane
        ){
        
        return declare([MapConfig], {
                        
            //handle setup which requires all layers to be loaded
            mapReady: function() {
                this.inherited(arguments);

                //console.log('inside custom Arctic mapReady...');   

                this.mapToolbar = new MapToolbar({map: this.map, layerCollection: this.mapLayerCollection}, 'arcticMapToolbar');
                this.mapToolbar.startup();

                this.identify = new Identify({map: this.map, layerCollection: this.mapLayerCollection});

                this.identifyPane = new IdentifyPane({
                    map: this.map,
                    identify: this.identify,
                    class: 'identifyPane',
                    autoExpandTree: false
                }, dom.byId('arcticIdentifyPaneDiv'));
                this.identifyPane.startup();
                this.identifyPane.enabled = false;
                
                this.mapLayerCollection.getLayerById('ECS Catalog').setVisibleLayers([19, 20]); //US EEZ and International EEZs should be the only layers visible by default.

                //Layer definitions for NGDC pre-2012 source data
                this.mapLayerCollection.getLayerById('Multibeam').setLayerDefinitions(["ENTERED_DATE < date '2012-01-01' or ENTERED_DATE is null"]);
    
                var layerDefs = [];
                for (var i = 0; i < 10; i++) {
                    layerDefs[i] = "DATE_ADDED < date '2012-01-01' or DATE_ADDED is null";
                }
                this.mapLayerCollection.getLayerById('Trackline').setLayerDefinitions(layerDefs);
                this.mapLayerCollection.getLayerById('Trackline').setVisibleLayers([-1]);

                this.mapLayerCollection.getLayerById('Sample Index').setLayerDefinitions(["CAST(SUBSTR(BEGIN_DATE,0,4) AS NUMBER) < 2012 or BEGIN_DATE is null"]);
            }
        });
    }
);
