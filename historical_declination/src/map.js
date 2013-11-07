/*
 * generic setup for viewers.  Expects to be paired with a local mapConfig.js
 * which is loaded prior to this script.
 * 
 * All maps have a few common elements:
 *   - toolbar in upper left containing select by rectangle, select by coordinate tools
 *   - coordinate readout in lower left
 *   - basemap toolbar in upper right
 *   - overview map in lower right
 *   
 * Lifecycle methods:
 *    - init. called when DOM and dojo.require() classes loaded (dojo.addOnLoad event)
 *    - preInit. defined in mapConfig, called prior to any other initialization
 *    - checkPrerequisities. standard implementation, but can be overridden in mapConfig
 *    - getMapServiceList. defined in mapConfig.
 *    - mapInitialized. called as soon as first layer added to map
 *    - mapInitializedCustom
 *    
 * Helper methods:
 * 	  - setLayerVisibility. Called on a /toc/layer/show event, can also be called manually. Publishes /Identify/setLayerVisibility
 *    
 * Events:
 *    - ngdc/mapReady
 *    - ngdc/mapClick
 *    - ngdc/drawRectangle
 * 	
 */
console.log('loading map.js...');

if (! globals.mapConfigLoaded) {
	console.warn ('mapConfig.js does not appear to have been loaded');
}

/*
 * set the initial extent.
 * Can be overridden in mapConfig.js
 */
var getInitialExtent;
if (!getInitialExtent) {
    getInitialExtent = function() {
        globals.srid = 3857; //Web Mercator 
        var geoExtent = new esri.geometry.Extent(globals.initialExtentString);
        
        var queryParams = dojo.queryToObject(window.location.search.slice(1));
        if (queryParams.minx !== undefined && queryParams.miny !== undefined && 
			queryParams.maxx !== undefined && queryParams.maxy !== undefined) {
            //override default initial extent based on request parameters
            var minx = parseFloat(queryParams.minx);
            var miny = parseFloat(queryParams.miny);
            var maxx = parseFloat(queryParams.maxx);
            var maxy = parseFloat(queryParams.maxy);
            if (minx !== undefined && miny !== undefined && 
				maxx !== undefined && maxy !== undefined) {
                geoExtent = new esri.geometry.Extent({
                    "xmin": minx,
                    "ymin": miny,
                    "xmax": maxx,
                    "ymax": maxy,
                    "spatialReference": {
                        "wkid": 4326
                    }
                });
            } else {
                console.error("invalid values provided for initial extent");
            }
        }
        return (esri.geometry.geographicToWebMercator(geoExtent));
    };
}


/*
 * verify that required DOM elements and global variables are set.
 * Can be overridden in mapConfig.js
 */
var checkPrerequisites;
if (!checkPrerequisites) {
    checkPrerequisites = function() {
        if (globals.debug) { console.log("checking prerequisites..."); }
        if (!dojo.byId('mapDiv')) { console.error("missing element 'mapDiv'"); }
        if (!dojo.byId('loadingImg')) { console.error("missing element 'loadingImg'"); }
        if (!dojo.byId('coordsDiv')) { console.error("missing element 'coordsDiv'"); }
        if (!dojo.byId('basemapToolbar')) { console.error("missing element 'basemapToolbar'"); }
        if (!globals) { console.error("globals container not initialized"); }
        if (!globals.lods) { console.error("LODs not set"); }
        if (!globals.initialExtentString) { console.error("initial extent not set"); }
    };
}


/*
 *  Standard Web Mercator zoom levels. Don't allow map zoom levels 0-2.
 *  Can be overridden in mapConfig.js
 */
if (!globals.lods) {
    globals.lods = 	[
        //{"level": 0, "resolution": 156543.03392800014,"scale": 5.91657527591555E8},
        //{"level": 1, "resolution": 78271.51696399994, "scale": 2.95828763795777E8},
        {"level": 2,"resolution": 39135.75848200009,"scale": 1.47914381897889E8},
        {"level": 3,"resolution": 19567.87924099992,"scale": 7.3957190948944E7},
        {"level": 4,"resolution": 9783.93962049996,"scale": 3.6978595474472E7},
        {"level": 5,"resolution": 4891.96981024998,"scale": 1.8489297737236E7},
        {"level": 6,"resolution": 2445.98490512499,"scale": 9244648.868618},
        {"level": 7,"resolution": 1222.992452562495,"scale": 4622324.434309},
        {"level": 8,"resolution": 611.4962262813797,"scale": 2311162.217155},
        {"level": 9,"resolution": 305.7481131405575,"scale": 1155581.108577},
        {"level": 10,"resolution": 152.87405657041106,"scale": 577790.554289},
        {"level": 11,"resolution": 76.43702828507324,"scale": 288895.277144},
        {"level": 12,"resolution": 38.21851414253662,"scale": 144447.638572},
        {"level": 13,"resolution": 19.10925707126831,"scale": 72223.819286},
        {"level": 14,"resolution": 9.554628535634155,"scale": 36111.909643},
        {"level": 15,"resolution": 4.77731426794937,"scale": 18055.954822},
        {"level": 16,"resolution": 2.388657133974685,"scale": 9027.977411},
        {"level": 17,"resolution": 1.1943285668550503,"scale": 4513.988705},
        {"level": 18,"resolution": 0.5971642835598172,"scale": 2256.994353},
        {"level": 19,"resolution": 0.29858214164761665,"scale": 1128.497176}
    ];
    globals.firstZoomLevel = globals.lods[0].level; 
}

//called after DOM elements loaded
function init() {
    if (globals.debug) {
        console.log('inside init...');
    }
    
    //application-specific initialization completed after common initialization.
    //defined in mapConfig.js
    preInit();
    
    //verify DOM elements and global variables needed by this point	
    checkPrerequisites();
    globals.servicesAdded = 0; //counter for layer add.
    globals.identifyTasksRunning = 0;
    globals.loadingImg = dojo.byId("loadingImg"); //busy loading image	
    globals.initialExtent = getInitialExtent();
    
    var mapOptions = {
        wrapAround180: true,
        fitExtent: true,
        extent: globals.initialExtent,
        lods: globals.lods,
        logo: false,
		navigationMode: 'classic'
    };
	
	// IE7 or earlier, disable wrapping around the antimeridian to work around problems with long URLs
	if (dojo.isIE <= 7) {
		mapOptions.wrapAround180 = false;
	}
    
    //populates the globals mapServices, basemapLayers, overlayLayers
    //defined in mapConfig.js
	if (globals.debug) {
		console.log("calling getMapServiceList...");
	}
    getMapServiceList();
    
    //Initialize the map. WARNING: depends on element 'mapDiv' defined in HTML page
    globals.map = new esri.Map("mapDiv", mapOptions);
    
    //Show the page. Prevents rendering of elements before they're ready. 
    //Entire body should be hidden until this call (CSS visibility:hidden)
    dojo.style(dojo.body(), "visibility", "visible");
    
    //setup event handlers
    dojo.connect(globals.map, "onMouseMove", showCoordinates);
    dojo.connect(globals.map, "onMouseDrag", showCoordinates);
    dojo.connect(globals.map, "onLoad", mapInitialized);
    
    dojo.connect(globals.map, 'onLayerAdd', function(layer){
        if (globals.debug) {
            console.log(globals.servicesAdded+1 + '/' + globals.mapServices.length + ' added layer ' + layer.url + " to map.");
        }
        globals.servicesAdded++;
        if (globals.servicesAdded === globals.mapServices.length) {
            dojo.publish("/ngdc/mapReady", [{
                map: globals.map
            }]);
        }
    });
    
    // standard buttons. WARNING: depends on elements defined in HTML page
    dojo.connect(dijit.byId('selectByRectBtn'), "onClick", function(){
        globals.map.graphics.clear();
        globals.drawToolbar.activate(esri.toolbars.Draw.EXTENT);
        globals.map.hideZoomSlider();
    });
    
    dojo.connect(dijit.byId('selectByCoordsBtn'), 'onClick', function(){
        globals.coordDialog.show();
    });
    		
	//Did the user double-click?
	var doubleClicked = false;
	dojo.connect(globals.map, "onDblClick", function(evt){
		doubleClicked = true;
    });
	
	//Record the current click point on an onMouseDown event 
	var clickPt = {};
	dojo.connect(globals.map, "onMouseDown", function(evt){
		clickPt.x = evt.mapPoint.x;
		clickPt.y = evt.mapPoint.y;
		doubleClicked = false;
    });
	
	/*
	 * Commented out this section for the Historical Declination Viewer. We aren't using the Identify and don't want the yellow X on the map
	 */
	//onMouseUp event is treated as a "mapClick" if 2 conditions are met:
	//  1) onMouseUp location is the same as the onMouseDown location
	//  2) The onDblClick event has not fired in the last 500ms.
	/*
	dojo.connect(globals.map, "onMouseUp", function(evt){
		if (clickPt.x === evt.mapPoint.x && clickPt.y === evt.mapPoint.y) {
			var dblClickTimer;
			clearTimeout(dblClickTimer);
			dblClickTimer = setTimeout(function(){
				if (!doubleClicked) {
					globals.identifyTasksRunning = 0;
					
					if (globals.locationGraphic) {
						globals.map.graphics.remove(globals.locationGraphic);
					}
					var locationMarker = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_X, 12, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 255, 0]), 3));

					globals.locationGraphic = new esri.Graphic(evt.mapPoint, locationMarker);
					globals.map.graphics.add(globals.locationGraphic);
										
					if (globals.srid === 3572) { //Arctic LAEA Alaska projection
						//Create a little extent around the click point (10 pixels on each side).
						//Normalize for the antimeridian, and publish it as a multipart polygon.
						var screenExtent = new esri.geometry.Extent(evt.screenPoint.x - 5, evt.screenPoint.y + 5, evt.screenPoint.x + 5, evt.screenPoint.y - 5, null);
						var mapExtent = esri.geometry.toMapGeometry(globals.map.extent, globals.map.width, globals.map.height, screenExtent);
						normalizeAndPublishArcticExtent(mapExtent);
					} else if (globals.srid === 102021) { //Antarctic Polar Stereographic
						//Create a little extent around the click point (10 pixels on each side).
						//Normalize for the antimeridian, and publish it as a multipart polygon.
						var screenExtent = new esri.geometry.Extent(evt.screenPoint.x - 5, evt.screenPoint.y + 5, evt.screenPoint.x + 5, evt.screenPoint.y - 5, null);
						var mapExtent = esri.geometry.toMapGeometry(globals.map.extent, globals.map.width, globals.map.height, screenExtent);
						normalizeAndPublishAntarcticExtent(mapExtent);
					} else {
						dojo.publish('/ngdc/mapClick', [evt.mapPoint]);		
					}					        		
				}
			}, 500);						
		}
    });
    */
		   
    //setup that can only happen after all layers added
    dojo.subscribe('/ngdc/mapReady', this, function(theMap){
        if (globals.debug) {
            console.log('All ' + globals.map.layerIds.length + ' layers added to map. Map ready!');
        }
        
        //defined in mapConfig.js
        mapReadyCustom(theMap);
    });
    
    dojo.subscribe('/toc/layer/show', this, function(data){
		if (globals.debug) {
			console.log("Show layer: " + data.service + " " + data.subLayers + " " + data.state);
		}
        setLayerVisibility(data.service, data.subLayers, data.state);
    });
    
    dojo.connect(globals.map, 'onUpdateStart', function(){
        showLoading();
    });
    
    dojo.connect(globals.map, 'onUpdateEnd', function(error){
        esri.hide(globals.loadingImg);
        //globals.map.enableMapNavigation();
        //globals.map.showZoomSlider();
    });
	
	//Show loading icon while any IdentifyTasks are running		
	dojo.subscribe('/Identify/execute', this, function(id){
		globals.identifyTasksRunning++;
		if (globals.debug) {
			console.log("identify execute " + globals.identifyTasksRunning);
		}
		showLoading();
	});
	
	//Hide loading icon when all IdentifyTasks are complete
	dojo.subscribe('/Identify/complete', this, function(id){
		globals.identifyTasksRunning--;
		if (globals.debug) {
			console.log("identify complete " + globals.identifyTasksRunning);
		}
		if (globals.identifyTasksRunning <= 0) {
			globals.identifyTasksRunning = 0;
		  	hideLoading();
		}
	});
	
	dojo.subscribe('/ngdc/BoundingBoxDialog', this, function(data) {
		var minx = data.minx, maxx = data.maxx, miny = data.miny, maxy = data.maxy;
		
		//Handle the fact that the poles are at infinity in the Mercator projection
		//TODO set max in Dialog number entries
		if (miny === -90)
			miny = -89.99;
		if (maxy === 90)
			maxy = 89.99;
		
		//TODO: Handle projections other than Web Mercator	
		var ll = esri.geometry.geographicToWebMercator(new esri.geometry.Point(minx, miny));
		var ur = esri.geometry.geographicToWebMercator(new esri.geometry.Point(maxx, maxy));
		if (maxx < minx) {
			//Assume the geometry crosses the antimeridian if maxx > minx. Convert it to a multipart polygon using the GeometryService.
			var geometry = new esri.geometry.Extent(ll.x, ll.y, ur.x, ur.y, new esri.SpatialReference({wkid: 3857}));	
			esri.geometry.normalizeCentralMeridian([geometry], globals.geometryService, function(geometries) {
				addToMap(geometries[0]);
				//globals.map.setExtent(geometries[0].getExtent(), true);		
			});		
		}
		else {
			var geometry = new esri.geometry.Extent(ll.x, ll.y, ur.x, ur.y, new esri.SpatialReference({wkid: 3857}));	
			addToMap(geometry);
			globals.map.setExtent(new esri.geometry.Extent(geometry.xmin, geometry.ymin, geometry.xmax, geometry.ymax, new esri.SpatialReference({wkid: 3857})), true);
		}	
	});
    
    //globals.mapServices defined in mapConfig.js
    dojo.forEach(globals.mapServices, function(service){
        globals.map.addLayer(service);
    });
    
	//Show coordinates when moving the mouse. 
	//For performance reasons, coordinates are only updated every 100ms.
	var waitToUpdate = false;
	var mouseMoveTimer;
	function showCoordinates(evt){
		if (!waitToUpdate) {
			waitToUpdate = true;
			var mp;
			if (globals.srid == 3857 || globals.srid == 102100) {
				//Transform Web Mercator coordinates to lat/long
				mp = esri.geometry.webMercatorToGeographic(evt.mapPoint);
				dojo.byId("coordsDiv").innerHTML = "Position: " + mp.x.toFixed(3) + ", " + mp.y.toFixed(3);
			} else {
				//Handle projections other than Web Mercator using Proj4js
				mp = {};
				mp.x = evt.mapPoint.x;
				mp.y = evt.mapPoint.y;
				if (Proj4js) {
					Proj4js.transform(globals.sourceProj, globals.destProj, mp);
				}
				dojo.byId("coordsDiv").innerHTML = "Position: " + mp.x.toFixed(3) + ", " + mp.y.toFixed(3);
			}
			//Wait 100ms before allowing another update
			clearTimeout(mouseMoveTimer);
			mouseMoveTimer = setTimeout(function(){
				waitToUpdate = false;
			}, 100);
		}
	};
    
    //application-specific initialization completed after common initialization.
    //defined in mapConfig.js
    postInit();
} //end init function

/*
 * setup that can happen as soon as first layer added to map
 */
function mapInitialized(/*esri.Map*/theMap) {
    if (globals.debug) {
        console.log('map initialized...');
    }
    
    var overviewMapDijit = new esri.dijit.OverviewMap({
        map: globals.map,
        attachTo: "bottom-right",
        width: 150,
        height: 120,
        visible: true,
        opacity: 0.3
    });
    overviewMapDijit.startup();
    
    //setup the toolbar for drawing
    globals.drawToolbar = new esri.toolbars.Draw(globals.map);
    dojo.connect(globals.drawToolbar, "onDrawEnd", addToMap);
    
    //resize the map when the browser resizes.
	//info here: http://help.arcgis.com/EN/webapi/javascript/arcgis/help/jshelp_start.htm#jshelp/new_v25.html
	dojo.connect(dijit.byId('mapDiv'), 'resize', globals.map, globals.map.resize);
	
    //application-specific processing required for the Map onLoad event. 
    //defined in mapConfig.js. 
    mapInitializedCustom(theMap);
}

function showLoading() {
    esri.show(globals.loadingImg);
    //globals.map.disableMapNavigation();
    //globals.map.hideZoomSlider();
}

function hideLoading(error){
    esri.hide(globals.loadingImg);
    //globals.map.enableMapNavigation();
    //globals.map.showZoomSlider();
}

/*
 * handler for onDrawEnd event. publishes event "/ngdc/drawRectangle"
 */
function addToMap(geometry) {
    if (globals.debug) {
        console.log('inside addToMap with ', geometry);
    }
    var symbol;
    switch (geometry.type) {
        case "polygon":
            symbol = new esri.symbol.SimpleFillSymbol(
				esri.symbol.SimpleFillSymbol.STYLE_SOLID, 
				new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH, new dojo.Color([255, 0, 0]), 2), 
				new dojo.Color([255, 255, 0, 0.25])
			);
            break;
        case "extent":
            symbol = new esri.symbol.SimpleFillSymbol(
				esri.symbol.SimpleFillSymbol.STYLE_SOLID, 
				new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH, new dojo.Color([255, 0, 0]), 2),
				new dojo.Color([255, 255, 0, 0.25]));
            break;
        default:
            console.log("invalid geometry type: " + geometry.type);
    }
    var graphic = new esri.Graphic(geometry, symbol);
    globals.map.graphics.add(graphic);
    
    //only allow one shape to be drawn
    globals.drawToolbar.deactivate();
    globals.map.showZoomSlider();
    
	if (globals.srid === 3572) { //Arctic LAEA Alaska projection
		normalizeAndPublishArcticExtent(geometry, symbol);
	} else if (globals.srid === 102021) { //Antarctic Polar Stereographic
		normalizeAndPublishAntarcticExtent(geometry, symbol);
	} else {
		//send geometry
    	dojo.publish('/ngdc/drawRectangle', [graphic]);	
	}   
}

/*
 *	Cut an extent in Arctic coordinates (EPSG:3572) along the antimeridian, producing a multipart polygon.
 *	First, the extent is densified to more closely represent the rectangle drawn on the map (instead of just the corner coordinates).
 *	The GeometryService is used to perform the Cut operation.
 *  Publish the '/ngdc/drawRectangle' message to communicate the geometry to the Identify dijit.
 */
function normalizeAndPublishArcticExtent(extent, symbol) {
	var antimeridian = new esri.geometry.Polyline(new esri.SpatialReference({wkid: 3572}));
	antimeridian.addPath([[-4504982.38061564, -7802858.37042889], [0, 0], [0, 0], [4504982.38061564, 7802858.37042889]]);
	
	var densifiedPoly = densifyExtent(extent, 50000, 3572);
	//globals.map.graphics.add(new esri.Graphic(densifiedPoly, symbol));
	
	showLoading();
	
	globals.geometryService.cut([densifiedPoly], antimeridian, function(results){
		var multipartPoly = new esri.geometry.Polygon(new esri.SpatialReference({wkid: 3572}));
		dojo.forEach(results.geometries, function(geometry){
			multipartPoly.addRing(geometry.rings[0]);
		});
		console.log(multipartPoly);
		//globals.map.graphics.add(new esri.Graphic(multipartPoly, symbol));
		dojo.publish('/ngdc/drawRectangle', [new esri.Graphic(multipartPoly, symbol)]);
	});	
}

/*
 *	Cut an extent in Antarctic Polar Stereographic coordinates (EPSG:102021) along the antimeridian, producing a multipart polygon.
 *	First, the extent is densified to more closely represent the rectangle drawn on the map (instead of just the corner coordinates).
 *	The GeometryService is used to perform the Cut operation.
 *  Publish the '/ngdc/drawRectangle' message to communicate the geometry to the Identify dijit.
 */
function normalizeAndPublishAntarcticExtent(extent, symbol) {
	var antimeridian = new esri.geometry.Polyline(new esri.SpatialReference({wkid: 102021}));
	antimeridian.addPath([[0, -10000000], [0, 10000000]]);
	
	var densifiedPoly = densifyExtent(extent, 50000, 102021);
	//globals.map.graphics.add(new esri.Graphic(densifiedPoly, symbol));
	
	showLoading();
						
	globals.geometryService.cut([densifiedPoly], antimeridian, function(results){
		var multipartPoly = new esri.geometry.Polygon(new esri.SpatialReference({wkid: 102021}));
		dojo.forEach(results.geometries, function(geometry){
			multipartPoly.addRing(geometry.rings[0]);
		});
		console.log(multipartPoly);
		//globals.map.graphics.add(new esri.Graphic(multipartPoly, symbol));
		dojo.publish('/ngdc/drawRectangle', [new esri.Graphic(multipartPoly, symbol)]);
	});	
}

/*
 * 	Densify an esri.geometry.Extent, returning a Polygon with more vertices, separated by a specified distance.
 *  Parameters:
 *		extent: An esri.geometry.Extent to densify
 *		distance: Interval in map units to insert new points along each line
 *		srid: Spatial reference of the poly
 */
function densifyExtent(extent, distance, srid) {
	var points = [];
	var x, y;
	
	//points.push([geometry.xmin, geometry.ymin]);
	
	for (y = extent.ymin; y < extent.ymax; y += distance) {
		points.push([extent.xmin, y]);
	}
	points.push([extent.xmin, extent.ymax]);
	
	for (x = extent.xmin; x < extent.xmax; x += distance) {
		points.push([x, extent.ymax]);
	}
	points.push([extent.xmax, extent.ymax]);
	
	for (y = extent.ymax; y > extent.ymin; y -= distance) {
		points.push([extent.xmax, y]);
	}
	points.push([extent.xmax, extent.ymin]);
	
	for (x = extent.xmax; x > extent.xmin; x -= distance) {
		points.push([x, extent.ymin]);
	}
	points.push([extent.xmin, extent.ymin]);
	
	var polygon = new esri.geometry.Polygon(new esri.SpatialReference({wkid: srid}));
	polygon.addRing(points);
	return polygon;
}


/*
 *  Set the visibility of the subLayers of a map service.
 *  Service can be an ArcGISDynamicMapServiceLayer, ArcGISTiledMapServiceLayer, or PairedMapServiceLayer.
 *  Called on a /toc/layer/show event. Can also be called manually if using custom layer-toggling controls.
 *  Parameters:
 *  	serviceId: string identifying the mapService in globals.mapServices
 *  	subLayers: array of subLayer indexes to operate on. If array is empty ([]), this refers to the service's default layer visibility.
 *  	isVisible: boolean
 */
function setLayerVisibility(serviceId, subLayers, isVisible) {
	if (globals.debug) {
		console.log("setLayerVisibility: " + serviceId + " " + subLayers + " " + isVisible);
	}
		
    //Get a reference to the map service layer
	var service = mapServiceById(serviceId);
    	
	//Only perform sublayer toggling if the layer type supports setVisibleLayers
	if (service instanceof esri.layers.ArcGISDynamicMapServiceLayer || service instanceof layers.PairedMapServiceLayer) {
		var newVisibleLayers = [];
		newVisibleLayers = service.visibleLayers.slice(0); //Make a copy of the service's visibleLayers array
		if (isVisible) {
			if (subLayers.length === 0) {
				newVisibleLayers = []; //Default sublayers. Empty array means default layers visible.
			} else {
				//Clear the visibleLayers array if it contains 9999
				if (newVisibleLayers[0] == 9999) {
					newVisibleLayers = [];
				}
				dojo.forEach(subLayers, function(subLayer){
					//If sublayer is not already in there, add it to the newVisibleLayers array.
					var idx = dojo.indexOf(newVisibleLayers, subLayer);
					if (idx == -1) {
						newVisibleLayers.push(subLayer);
					}
				}, this);
			}
			newVisibleLayers.sort(function(a, b){
				return a - b;
			}); //Sort the array numerically
			if (!(service instanceof esri.layers.ArcGISTiledMapServiceLayer)) {
				service.setVisibleLayers(newVisibleLayers); //Set the new layer visibility
			}
			service.show();
		} else {
			if (subLayers.length === 0) {
				newVisibleLayers = []; //default sublayers
				service.hide();
			} else {
				dojo.forEach(subLayers, function(subLayer){
					//Remove the sublayer index from the array
					var idx = dojo.indexOf(newVisibleLayers, subLayer);
					if (idx != -1) {
						newVisibleLayers.splice(idx, 1);
					}
					//If visible layers array is now empty, set it to [9999], so as not to confuse it with [] which means default layers. 
					if (newVisibleLayers.length === 0) {
						newVisibleLayers = [9999];
						service.hide();
					}
				}, this);
			}
			newVisibleLayers.sort(function(a, b){
				return a - b;
			}); //Sort the array numerically
			if (!(service instanceof esri.layers.ArcGISTiledMapServiceLayer)) {
				service.setVisibleLayers(newVisibleLayers); //Set the new layer visibility
			}
		}
	}
	else { //ArcGISTiledMapServiceLayers or ArcGISImageServiceLayers
		service.setVisibility(isVisible);
	}
        
    if (globals.legend) {
        globals.legend.refresh();
    }
}

//Return the map service with the specified id
function mapServiceById(id) {
	var i;
	for (i = 0; i < globals.mapServices.length; i++) {
		if (globals.mapServices[i].id === id) {
			return globals.mapServices[i];
		}
	}
	return null;
}


dojo.addOnLoad(init);
