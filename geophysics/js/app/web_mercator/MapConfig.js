define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/dom',
    'dojo/topic',
    'ngdc/web_mercator/MapConfig',
    'app/web_mercator/MapToolbar',
    'app/web_mercator/Identify',
    'app/AppIdentifyPane'
    ],
    function(
        declare, 
        lang, 
        dom,
        topic,
        MapConfig,
        MapToolbar,
        Identify,
        IdentifyPane
        ){
        
        return declare([MapConfig], {
                        
            //handle setup which requires all layers to be loaded
            mapReady: function() {
                this.inherited(arguments);

                //console.log('inside custom Web Mercator mapReady...');   

                this.mapToolbar = new MapToolbar({
                    map: this.map, 
                    layerCollection: this.mapLayerCollection, 
                }, 'mercatorMapToolbar');
                this.mapToolbar.startup();

                this.identify = new Identify({map: this.map, layerCollection: this.mapLayerCollection});

                this.identifyPane = new IdentifyPane({
                    map: this.map,
                    identify: this.identify,
                    class: 'identifyPane',
                    autoExpandTree: false
                }, dom.byId('mercatorIdentifyPaneDiv'));
                this.identifyPane.startup();

                this.mapLayerCollection.getLayerById('Trackline Combined').setVisibleLayers([-1]);

                topic.subscribe('/geophysics/layer/visibility', lang.hitch(this, function(id, visible) {
                    if (id == 'All Parameters') {
                        topic.publish('/ngdc/layer/visibility', 'All Parameters', visible);
                    } else if (id == 'Bathymetry') {
                        topic.publish('/ngdc/layer/visibility', 'Bathymetry', visible);
                    } else if (id == 'Gravity') {
                        topic.publish('/ngdc/layer/visibility', 'Gravity', visible);
                    } else if (id == 'Magnetics') {
                        topic.publish('/ngdc/layer/visibility', 'Magnetics', visible);
                    } else if (id == 'Multi-Channel Seismics') {
                        topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [4], visible);
                    } else if (id == 'Seismic Refraction') {
                        topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [5], visible);
                    } else if (id == 'Shot-Point Navigation') {
                        topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [6], visible);
                    } else if (id == 'Side Scan Sonar') {
                        topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [7], visible);
                    } else if (id == 'Single-Channel Seismics') {
                        topic.publish('/ngdc/layer/visibility', 'Single-Channel Seismics', visible);
                    } else if (id == 'Subbottom Profile') {
                        topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [9], visible);
                    } else if (id == 'Aeromagnetics') {
                        topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [10], visible);
                    }
                }));
            }
         
            
        });
    }
);
