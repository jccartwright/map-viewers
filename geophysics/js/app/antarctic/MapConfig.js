define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/dom',
    'dojo/topic',
    'ngdc/antarctic/MapConfig',
    'app/antarctic/MapToolbar',
    'app/antarctic/Identify',
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
                
                this.mapToolbar = new MapToolbar({
                    map: this.map, 
                    layerCollection: this.mapLayerCollection, 
                    maxLat: -50, 
                    minLat: -90
                }, 'antarcticMapToolbar');
                this.mapToolbar.startup();
                this.mapToolbar.enabled = false;
                
                this.identify = new Identify({map: this.map, layerCollection: this.mapLayerCollection});
                this.identify.enabled = false;

                this.identifyPane = new IdentifyPane({
                    map: this.map,
                    identify: this.identify,
                    class: 'identifyPane',
                    autoExpandTree: false
                }, dom.byId('antarcticIdentifyPaneDiv'));
                this.identifyPane.startup();
                this.identifyPane.enabled = false;  

                topic.subscribe('/geophysics/layer/visibility', lang.hitch(this, function(id, visible) {
                    if (id == 'All Parameters') {
                        topic.publish('/ngdc/sublayer/visibility', '(Antarctic) Trackline Combined', [0], visible);
                    } else if (id == 'Bathymetry') {
                        topic.publish('/ngdc/sublayer/visibility', '(Antarctic) Trackline Combined', [1], visible);
                    } else if (id == 'Gravity') {
                        topic.publish('/ngdc/sublayer/visibility', '(Antarctic) Trackline Combined', [2], visible);
                    } else if (id == 'Magnetics') {
                        topic.publish('/ngdc/sublayer/visibility', '(Antarctic) Trackline Combined', [3], visible);
                    } else if (id == 'Multi-Channel Seismics') {
                        topic.publish('/ngdc/sublayer/visibility', '(Antarctic) Trackline Combined', [4], visible);
                    } else if (id == 'Seismic Refraction') {
                        topic.publish('/ngdc/sublayer/visibility', '(Antarctic) Trackline Combined', [5], visible);
                    } else if (id == 'Shot-Point Navigation') {
                        topic.publish('/ngdc/sublayer/visibility', '(Antarctic) Trackline Combined', [6], visible);
                    } else if (id == 'Side Scan Sonar') {
                        topic.publish('/ngdc/sublayer/visibility', '(Antarctic) Trackline Combined', [7], visible);
                    } else if (id == 'Single-Channel Seismics') {
                        topic.publish('/ngdc/sublayer/visibility', '(Antarctic) Trackline Combined', [8], visible);
                    } else if (id == 'Subbottom Profile') {
                        topic.publish('/ngdc/sublayer/visibility', '(Antarctic) Trackline Combined', [9], visible);
                    } else if (id == 'Aeromagnetics') {
                        topic.publish('/ngdc/sublayer/visibility', '(Antarctic) Trackline Combined', [10], visible);
                    }
                }));
            }
         
            
        });
    }
);
