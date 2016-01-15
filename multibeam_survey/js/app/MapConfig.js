define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "ngdc/web_mercator/MapConfig",
    "dojo/_base/lang",
    "dojo/dom",
    "dojo/_base/fx",
    "dijit/registry",
    "esri/dijit/HomeButton",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "dojo/_base/Color",
    "esri/renderers/SimpleRenderer",
    "dojo/dom-construct",
    "dojo/dom",
    "dojo/topic",
    "dojo/on",
    "esri/config"
    ],
    function(
        declare,
        lang,
        MapConfig,  
        lang,
        dom,
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
                domConstruct.place(dom.byId('mapDiv_Ocean Reference'), dom.byId('mapDiv_gc'), "after");

                var homeButton;
                //Set the map extent to the survey extent.
                //When the zoom-to is finished, initialize the home button.
                this.map.setExtent(this.surveyExtent, true).then(lang.hitch(this, function() {                    
                    homeButton = new HomeButton({
                        map: this.map,
                        extent: this.map.extent
                    }, "homeButton");
                    homeButton.startup();
                }));
                                      
                var basemapLayer = this.mapLayerCollection.getLayerById('Ocean Base');
                var boundariesLayer = this.mapLayerCollection.getLayerById('Ocean Reference');
                var gmrtLayer = this.mapLayerCollection.getLayerById('GMRT');

                //For testing
                //gmrtLayer.loaded = false;

                var toggleGmrt = registry.byId('toggleGmrt');

                //Disable the toggle button if the GMRT service failed to load
                // if (!gmrtLayer.loaded) {
                //     toggleGmrt.set('disabled', true);
                // }

                on(toggleGmrt, "click", lang.hitch(this, function() {
                    var checked = toggleGmrt.get('checked');
                    if (checked) {                        
                        toggleGmrt.set('label', 'Hide GMRT');
                        gmrtLayer.show();
                    }
                    else {                        
                        toggleGmrt.set('label', 'Show GMRT');
                        gmrtLayer.hide();
                    }
                }));
                basemapLayer.show();
                boundariesLayer.show();

                var mbLayer = this.mapLayerCollection.getLayerById('Multibeam');

                var lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 255, 0]), 2);

                mbLayer.setDefinitionExpression("SURVEY_ID = '" + this.survey + "'");
                mbLayer.setRenderer(new SimpleRenderer(lineSymbol));
                mbLayer.show();

                this.hideLoading(); //Manually hide the loading icon... seems to be getting stuck sometimes.                  
            }

            
        });
    }
);



