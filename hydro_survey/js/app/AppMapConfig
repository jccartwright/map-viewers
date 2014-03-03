define(["dojo/_base/declare", "dojo/_base/lang", "ngdc/web_mercator/MapConfig",
        "dojo/_base/lang", "dojo/dom", "dojo/_base/fx", "dijit/registry", "esri/dijit/HomeButton",
        "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "dojo/_base/Color", "esri/renderers/SimpleRenderer",  
        "dojo/topic", "dojo/on", "esri/config"],
    function(declare, lang, MapConfig,  
        lang, dom, baseFx, registry, HomeButton,
        SimpleFillSymbol, SimpleLineSymbol, Color, SimpleRenderer,
        topic, on, esriConfig){
        
        return declare([MapConfig], {

            constructor: function() {                
                if (arguments[1].survey) {
                    this.survey = arguments[1].survey;
                }
                if (arguments[1].surveyExtent) {
                    this.surveyExtent = arguments[1].surveyExtent;
                }
                            
                //When the mouse leaves the map div, manually fire a mouseup event that will be caught by the map.    
                //This prevents the "stuck panning" problem when dragging off the iframe.
                //Note: several pixels of padding are required in the iframe to catch the map mouse-out
                this.map.on('mouse-out', lang.hitch(this, function(evt) {
                    this.fireMapMouseUp(evt);                    
                }));     

                //If a service doesn't respond within 5 seconds, proceed with the viewer loading regardless
                esriConfig.defaults.io.timeout = 5000;           
            },

            //Manually fire a mouseup event. From this thread: http://forums.esri.com/Thread.asp?c=158&f=2396&t=271961
            fireMapMouseUp: function(e) {
                var oEvent = null;

                if (document.createEvent) {
                    oEvent = document.createEvent("MouseEvents");
                    oEvent.initMouseEvent("mouseup", true, true, window, 0, 0, 0, e.pageX, e.pageY, false, false, false, false, 0, null);
                } 
                else if (document.createEventObject) {
                    oEvent = document.createEventObject();
                    oEvent.detail = 0;
                    oEvent.screenX = 0;
                    oEvent.screenY = 0;
                    oEvent.clientX = e.pageX;
                    oEvent.clientY = e.pageY;
                    oEvent.ctrlKey = false;
                    oEvent.altKey = false;
                    oEvent.shiftKey = false;
                    oEvent.metaKey = false;
                    oEvent.button = 0;
                    oEvent.relatedTarget = null;
                }

                var mapElement = document.getElementById('mapDiv');

                if (document.createEvent) {
                    mapElement.dispatchEvent(oEvent);
                } 
                else if (document.createEventObject) {
                    mapElement.fireEvent('onmouseup', oEvent);
                }
            },

            //handle setup which requires all layers to be loaded
            mapReady: function() {
                this.inherited(arguments);

                var homeButton;
                //Set the map extent to the survey extent.
                //When the zoom-to is finished, initialize the home button.
                this.map.setExtent(this.surveyExtent, true).then(lang.hitch(this, function() {                    
                    homeButton = new HomeButton({
                        map: this.map,
                        extent: this.map.extent
                    }, "homeButton");
                    home.startup();
                }));
                                      
                var imageryLayer = this.mapLayerCollection.getLayerById('World Imagery');
                var rncLayer = this.mapLayerCollection.getLayerById('RNC');

                //For testing
                //rncLayer.loaded = false;

                var toggleRnc = registry.byId('toggleRnc');

                //Disable the toggle button if the RNC service failed to load
                if (!rncLayer.loaded) {
                    toggleRnc.set('disabled', true);
                }

                on(toggleRnc, "click", lang.hitch(this, function() {
                    var checked = toggleRnc.get('checked');
                    if (checked) {                        
                        toggleRnc.set('label', 'Hide RNCs');
                        //50% opaque RNC over 70% opaque imagery
                        imageryLayer.setOpacity(0.7);
                        rncLayer.show();
                    }
                    else {                        
                        toggleRnc.set('label', 'Show RNCs');
                        //100% opaque imagery
                        imageryLayer.setOpacity(1);
                        rncLayer.hide();
                    }
                }));
                imageryLayer.show();

                //Set the BAG Hillshades definition query
                var bagLayer = this.mapLayerCollection.getLayerById('BAG Hillshades');
                bagLayer.setDefinitionExpression("NAME LIKE '" + this.survey + "%'");
                bagLayer.show();

                //The survey outline will be in either the Digital or Non-Digital FeatureLayer.
                //Set the definition queries and display both layers.
                var outlineLayers = [];
                outlineLayers.push(this.mapLayerCollection.getLayerById('NOS Hydro Digital'));
                outlineLayers.push(this.mapLayerCollection.getLayerById('NOS Hydro Non-Digital'));

                var outlineSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NULL,
                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                    new Color([230, 0, 169]), 2), new Color([0, 0, 0, 255])
                );

                for (var i = 0; i < 2; i++) {
                    outlineLayers[i].setDefinitionExpression("SURVEY = '" + this.survey + "'");
                    outlineLayers[i].setRenderer(new SimpleRenderer(outlineSymbol));
                    outlineLayers[i].show();
                }                          
            }

            
        });
    }
);



