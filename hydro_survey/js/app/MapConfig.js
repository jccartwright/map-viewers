define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'ngdc/web_mercator/MapConfig',
    'dojo/_base/fx',
    'dijit/registry',
    'esri/dijit/HomeButton',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol',
    'dojo/_base/Color',
    'esri/renderers/SimpleRenderer',
    'dojo/dom-construct',
    'dojo/dom',
    'dojo/topic',
    'dojo/on',
    'esri/config'
    ],
    function(
        declare,
        lang,
        MapConfig,  
        baseFx,
        registry,
        HomeButton,
        SimpleFillSymbol,
        SimpleLineSymbol,
        Color,
        SimpleRenderer,
        domConstruct,
        dom,
        topic,
        on,
        esriConfig
        ){
        
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

                //The Popup 'auto' anchor behavior is not always working correctly. Manually put it left or right of the click point depending on where clicked.
                on(this.map, 'click', lang.hitch(this, function(evt) {
                    if (evt.x > this.map.width/2) {
                        this.map.infoWindow.set('anchor', 'left');
                    } else {
                        this.map.infoWindow.set('anchor', 'right');
                    }
                }));
            },

            //Manually fire a mouseup event. From this thread: http://forums.esri.com/Thread.asp?c=158&f=2396&t=271961
            fireMapMouseUp: function(e) {
                var oEvent = null;

                if (document.createEvent) {
                    oEvent = document.createEvent('MouseEvents');
                    oEvent.initMouseEvent('mouseup', true, true, window, 0, 0, 0, e.pageX, e.pageY, false, false, false, false, 0, null);
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

                var mapElement = dom.byId('mapDiv');

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

                //Manually place the Boundaries/Labels tiled service above the graphics layer.
                //Be aware that this can cause problems if we need to be able to click on the graphics layer.
                domConstruct.place(dom.byId('mapDiv_Boundaries/Labels'), dom.byId('mapDiv_gc'), 'after');

                var homeButton = new HomeButton({
                    map: this.map,
                    extent: this.webMercatorExtent
                }, 'homeButton');
                homeButton.startup();
                                      
                var imageryLayer = this.mapLayerCollection.getLayerById('World Imagery');
                var boundariesLayer = this.mapLayerCollection.getLayerById('Boundaries/Labels');
                var rncLayer = this.mapLayerCollection.getLayerById('RNC');

                //For testing
                //rncLayer.loaded = false;

                var toggleRnc = registry.byId('toggleRnc');

                //Disable the toggle button if the RNC service failed to load
                if (!rncLayer.loaded) {
                    toggleRnc.set('disabled', true);
                }

                on(toggleRnc, 'click', lang.hitch(this, function() {
                    var checked = toggleRnc.get('checked');
                    if (checked) {
                        toggleRnc.set('label', 'Hide RNCs');
                        //50% opaque RNC over 70% opaque imagery
                        imageryLayer.setOpacity(0.7);
                        boundariesLayer.hide();
                        rncLayer.show();
                    }
                    else {
                        toggleRnc.set('label', 'Show RNCs');
                        //100% opaque imagery
                        imageryLayer.setOpacity(1);
                        boundariesLayer.show();
                        rncLayer.hide();
                    }
                }));

                var toggleBagFootprints = registry.byId('toggleBagFootprints');
                on(toggleBagFootprints, 'click', lang.hitch(this, function() {
                    var checked = toggleBagFootprints.get('checked');
                    if (checked) {
                        toggleBagFootprints.set('label', 'Hide BAG Footprints');
                        bagFootprintsLayer.show();
                    }
                    else {
                        toggleBagFootprints.set('label', 'Show BAG Footprints');
                        bagFootprintsLayer.hide();
                        this.map.infoWindow.hide();
                        this.map.graphicsLayer.clear();
                    }
                }));
                imageryLayer.show();
                boundariesLayer.show();

                //Set the BAG Hillshades definition query
                var bagLayer = this.mapLayerCollection.getLayerById('BAG Hillshades');
                bagLayer.setDefinitionExpression("NAME LIKE '" + this.survey + "%'");
                bagLayer.show();

                //Set the BAG Footprints definition query
                var bagFootprintsLayer = this.mapLayerCollection.getLayerById('BAG Footprints');
                bagFootprintsLayer.setDefinitionExpression("SURVEY_ID='" + this.survey + "'");
                //bagFootprintsLayer.show();

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
                    outlineLayers[i].setDefinitionExpression("SURVEY_ID='" + this.survey + "'");
                    outlineLayers[i].setRenderer(new SimpleRenderer(outlineSymbol));
                    outlineLayers[i].show();
                }                          
            }

            
        });
    }
);



