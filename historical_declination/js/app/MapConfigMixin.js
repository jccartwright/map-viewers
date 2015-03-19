define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/dom',
    'dojo/on',
    'esri/layers/FeatureLayer',
    "esri/layers/LabelLayer",
    'esri/geometry/Extent',
    'esri/symbols/SimpleLineSymbol',
    "esri/Color",
    'esri/graphic',
    'esri/layers/LayerDrawingOptions',
    'ngdc/web_mercator/MapConfig',
    'app/web_mercator/MapToolbar'
    ],
    function(
        declare, 
        lang, 
        dom,
        on,
        FeatureLayer,
        LabelLayer,
        Extent,
        SimpleLineSymbol,
        Color,
        Graphic,
        LayerDrawingOptions,
        MapConfig,
        MapToolbar
        ){
        
        return declare(null, {

            setupListeners: function() {
                //Listen for the mouse-up event to identify a line at the click point.
                //We are not using map.click, since there is a ~500ms delay after clicking before the event is fired.
                //Using this method, the line is highlighted immediately.
                on(this.map, 'mouse-up', lang.hitch(this, function(evt) {
                    if (!this.panning) {
                        this.onMapClick(evt);
                    }
                })); 

                //Keep track of whether the map is currently panning, so we can treat onMouseUp as a mapClick when appropriate
                on(this.map, 'mouse-down', lang.hitch(this, function() {
                    this.panning = false;
                }));                
                on(this.map, 'pan-start', lang.hitch(this, function() {
                    this.panning = true;
                }));
            },
                        
            //Append a modulus operator to the definition expression string.
            //Can be negated to get the opposite.
            appendMod: function(str, value, negate) {
                if (negate) {
                    return str + ' AND NOT MOD(CONTOUR, ' + value + ')=0';
                } else {
                    return str + ' AND MOD(CONTOUR, ' + value + ')=0';
                }
            },

            setYear: function(year) {
                this.year = year;

                //Only refresh a layer if the year has changed
                if (this.linesLayer.year != year) {
                    this.map.graphics.clear();
                    this.linesLayer.year = year;
                    this.linesLayer.setDefinitionExpression(this.appendMod('YEAR=' + year, 2, false));
                }
                if (this.linesLayer2.year != year) {
                    this.map.graphics.clear();
                    this.linesLayer2.year = year;
                    this.linesLayer2.setDefinitionExpression(this.appendMod('YEAR=' + year, 2, true));
                }
                if (this.polesLayer.year != year) {
                    this.map.graphics.clear();
                    this.polesLayer.year = year;
                    this.polesLayer.setDefinitionExpression(this.northSouthClause + 'Year=' + year);
                }                    

                this.timeSlider.setYear(year);
            },

            onMapClick: function(evt) {                
                //Click point in map coordinates 
                var x = evt.mapPoint.x;
                var y = evt.mapPoint.y;
                logger.debug('map click X: ' + x);
                
                //If in Web Mercator, normalize the x coordinate so it's between -180 and 180 degrees
                if (this.map.srid == 3857 || this.map.srid == 102100) {
                    var worldWidth = 40075014.4591886;
                    while (x > worldWidth/2) {
                        x -= worldWidth;
                    }
                    while (x < -worldWidth/2) {
                        x += worldWidth;
                    }
                    logger.debug('normalized X: ' + x);
                }
                
                //Find the first isogonic line which is near the click point
                if (!this.findIntersectingLine(x, y, this.linesLayer)) {
                    this.findIntersectingLine(x, y, this.linesLayer2);
                }
            },

            //Find the first isogonic line which intersects a tiny box around the click point.
            //Highlight the line and update the declination text.
            //Returns boolean indicating if a line was found.
            findIntersectingLine: function(x, y, layer) {
                this.map.graphics.clear();
                
                //Immediately return if the layer is hidden
                if (!layer.visible || !layer.visibleAtMapScale) {
                    return;
                }
                var map = this.map;
                var value, highlightGraphic;
                
                var metersPerPixel = (map.extent.xmax - map.extent.xmin) / map.width;
                var boxWidth = metersPerPixel * 5; //10 pixel square
                
                //Construct a tiny extent around the click point in map coordinates
                var mapClickExtent = new Extent(x-boxWidth, y-boxWidth, x+boxWidth, y+boxWidth, map.spatialReference);    
                
                var declinationStr = 'Declination of highlighted line: ';
                var highlightSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 255, 0]), 3);
                
                //Loop through the graphics in the FeatureLayer
                for (var i = 0; i < layer.graphics.length; i++) {
                    var graphic = layer.graphics[i];
                    
                    if (mapClickExtent.intersects(layer.graphics[i].geometry)) {
                        //Feature intersects the map click box, highlight the feature and update text.
                        
                        logger.debug(i + ' intersects');
                        value = graphic.attributes.Contour;
                        
                        if (value == 0) {
                            declinationStr = declinationStr + value + ' degrees'; 
                        } else if (value > 0) {
                            declinationStr = declinationStr + value + ' degrees east of north';
                        } else {
                            declinationStr = declinationStr + (-value) + ' degrees west of north';
                        }
                        this.timeSlider.declinationValue.innerHTML = declinationStr;
                        
                        map.graphics.clear();
                        highlightGraphic = new Graphic(graphic.geometry, highlightSymbol);
                        map.graphics.add(highlightGraphic);
                        return true; //Return after the first feature is found
                    }
                }
                //No line was found. Update the text and return.
                this.timeSlider.declinationValue.innerHTML = 'Click on the map to highlight a line';
                return false;
            },

            setIsogonicLinesVisibile: function(visible) {
                this.linesLayer.setVisibility(visible);
                this.linesLayer2.setVisibility(visible);
            },

            setPolesVisibile: function(visible) {
                this.polesLayer.setVisibility(visible);
            },

            setPolesTrackVisible: function(visible) {
                this.historicPolesLayer.setVisibility(visible);
            },

            setObservedPolesVisible: function(visible) {
                this.observedPolesLayer.setVisibility(visible);
            }
        });
    }
);
