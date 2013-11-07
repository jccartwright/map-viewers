dojo.provide("identify.Identify");

dojo.require("esri.tasks.identify");
dojo.require("esri.tasks.query");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dojox.grid.DataGrid");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.StackContainer");
dojo.require("dojo.fx");
dojo.require("dijit.form.NumberSpinner");
dojo.require("dijit.form.CheckBox");
dojo.require("identify.InfoWindowConnector");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.SimpleTextarea");

/***************
 * CSS Includes
 ***************/
//anonymous function to load CSS files required for this module
(function(){
	var css = [dojo.moduleUrl("dojox", "grid/resources/Grid.css"), // required css for grids
 dojo.moduleUrl("dojox", "grid/resources/tundraGrid.css")//, // tundra theme for grids
 //dojo.moduleUrl("identify", "css/identify.css") // custom css used by this dijit: you can customize this file to change the look and feel of this dijit
];
	
	var head = document.getElementsByTagName("head").item(0), link;
	for (var i = 0, il = css.length; i < il; i++) {
		link = document.createElement("link");
		link.type = "text/css";
		link.rel = "stylesheet";
		link.href = css[i];
		head.appendChild(link);
	}
})();


/**************************
 * Third-party JS Includes
 **************************/
// This script is required to apply rounded-corners to this dijit
// in Internet Explorer. More info here:
// http://dillerdesign.com/experiment/DD_roundies/ 
/*
if (dojo.isIE) {
	(function(){
		var js = [dojo.moduleUrl("identify", "libraries/DD_roundies_0.0.2a-min.js")];
		
		var head = document.getElementsByTagName("head").item(0), script;
		for (var i = 0, il = js.length; i < il; i++) {
			script = document.createElement("script");
			script.type = "text/javascript";
			script.src = js[i];
			head.appendChild(script);
		}
	})();
}
*/

/*****************
 * Identify Dijit
 *****************/
dojo.declare("identify.Identify", [dijit._Widget, dijit._Templated], {
	// Let the dijit framework know that the template for this dijit 
	// uses other dijits such as BorderContainer, StackContainer, Grid etc
	widgetsInTemplate: true,
	
	// Let the dijit framework know the location of the template file where
	// the UI for this dijit is defined 
	templatePath: dojo.moduleUrl("identify", "templates/identify.html"),
	
	// Path to the folder containing the resources used by this dijit.
	// This can be used to refer to images in the template or other
	// resources
	basePath: dojo.moduleUrl("identify"),
	
	/*************
	 * Overrides
	 *************/
	// This section provides implementation for some of the extension points
	// (methods) exposed by the dijit framework. See the following document
	// for more information about a dijit's life-cycle and when these methods
	// are called, see:
	// http://docs.dojocampus.org/dijit/_Widget#lifecycle
	
	constructor: function(params, srcNodeRef){
		params = params || {};
		if (!params.map) {
			console.error("identify.Identify: please provide 'map' property in the constructor");
		}
		
		this._chainHandler = dojo.hitch(this, this._chainHandler);
		this._showOptionsPage = dojo.hitch(this, this._showOptionsPage);
		this._closeWidget = dojo.hitch(this, this._closeWidget);
		this._gridRowClickHandler = dojo.hitch(this, this._gridRowClickHandler);
		this._gridRowMouseOverHandler = dojo.hitch(this, this._gridRowMouseOverHandler);
		this._backButtonClickHandler = dojo.hitch(this, this._backButtonClickHandler);
		this._showSummary = dojo.hitch(this, this._showSummary);
		this._summaryFetchComplete = dojo.hitch(this, this._summaryFetchComplete);	
		this._showNewWindow = dojo.hitch(this, this._showNewWindow);		
		this._getData = dojo.hitch(this, this._getData);		
		this._gridUpdated = dojo.hitch(this, this._gridUpdated);
		this._mouseOverQuery = dojo.hitch(this, this._mouseOverQuery);
		this._onMouseOverQueryComplete = dojo.hitch(this, this._onMouseOverQueryComplete);
		//this._mapClickHandler = dojo.hitch(this, this._mapClickHandler);
		this._executeIdentify = dojo.hitch(this, this._executeIdentify);
		this._showFeatures = dojo.hitch(this, this._showFeatures);
		this._focusButtonClicked = dojo.hitch(this, this._focusButtonClicked);
		this._pageSelectHandler = dojo.hitch(this, this._pageSelectHandler);
		
		this._featureRowTemplate = "${value}<br/><span id='${spanId}' class='genid-grid-row'><a id='${linkId}' href='#' class='genid-focus-link'>Zoom To</a></span><span class='genid-layer-name'>${layerName}</span>";
		this._attributeRowTemplate = "${value}<br/><span class='genid-attr-name'>${attr}</span>";
		this._optionsTemplate = "<input id='${id}' type='checkbox' title='${name}' dojoType='dijit.form.CheckBox' checked='checked'/><label for='${id}'>${name}</label><br/><br/>";
		this._identifyTasksRunning = 0;
		this._uid = 0;
		this._maxSummaryResults = 300;
		this._serviceLayerDefinitions = [];
		
		/**************************
		 * Configurable Properties
		 **************************/
		// This section contains properties that can be used to customize the behavior
		// of this dijit. You can assign values to these properties when creating 
		// the dijit. All properties except "map" are optional
		
		// this dijit needs a reference to the map object for various reasons
		this.map = params.map; // [REQUIRED]
		this.label = params.label || "Identify";
		this.mapServices = params.mapServices || [];
		this.spatialReference = params.map.spatialReference;
		
		// the default tolerance in pixels for identify operation
		this.defaultTolerance = params.defaultTolerance || 1;
		
		// the symbol used to display polygon features
		this.fillSymbol = params.fillSymbol ||
		new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([64, 64, 64, 1]), 2), new dojo.Color([255, 0, 0, 0.5]));
		
		// the symbol used to display polyline features  
		this.lineSymbol = params.lineSymbol || new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 255]), 2);
		
		// the symbol used to display point/multipoint features
		this.markerSymbol = params.markerSymbol ||
		new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 13, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 128, 0]), 2), new dojo.Color([0, 255, 0]));
		
		// the symbol used to represent the location where the user clicked on the map
		this.locationMarker = params.locationMarker ||
		new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_X, 12, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 255]), 3));
		
		this.featureGridHeaderText = params.featureGridHeaderText || '';
		
		this.showGetDataButton = params.showGetDataButton || false;
	},
	
	postMixInProperties: function(){
		// overriding methods typically call their implementation up the inheritance chain 
		this.inherited(arguments);
		
		// create a list of map services to be displayed in the options page
		var services = this.mapServices, i, len = services.length, html = "";
		if (len > 0) {
			for (i = 0; i < len; i++) {
				services[i] = this._getTaskInfo(services[i]);
				html += services[i]._optionsHtml;
			}
		}
		else { // get the map services from map
			var layerIds = this.map.layerIds, layer, info;
			len = layerIds.length;
			for (i = 0; i < len; i++) {
				layer = this.map.getLayer(layerIds[i]);
				if (layer.declaredClass === "esri.layers.ArcGISTiledMapServiceLayer" || layer.declaredClass === "esri.layers.ArcGISDynamicMapServiceLayer") {
					info = this._getTaskInfo({
						url: layer.url,
						name: null,
						layerIds: null,
						layerOption: esri.tasks.IdentifyParameters.LAYER_OPTION_ALL,
						displayOptions: null,
						id: layer.id
					});
					services.push(info);
					html += info._optionsHtml;
				}
			}
		}
		
		// "_optionsHtml" property will be used by the dijit framework to render 
		// the options page of this dijit. The value of this property will be 
		// substituted in this dijit's template in places where the variable
		// ${_optionsHtml} is used
		this._optionsHtml = html;
	},
	
	startup: function(){
		// overriding methods typically call their implementation up the inheritance chain
		this.inherited(arguments);
		
		// apply rounded-corners to the dijit in IE
		/*
		if (dojo.isIE) {
			DD_roundies.addRule('.genid-rounded-corner', '10px');
		}
		*/
		
		// [GOTCHA] add the domNode of this dijit to the page if it is not added already
		if (dojo.isIE) {
			if (!this.domNode.parentElement) {
				document.body.appendChild(this.domNode);
			}
		}
		else {
			if (!this.domNode.parentNode) {
				document.body.appendChild(this.domNode);
			}
		}
		
		// [GOTCHA] without this little piece of code, if the user did not provide a div 
		// while creating this dijit, we won't see it
		this._borderContainer.resize();
		
		this._uid1 = 0;
		this._featureGrid.setStore(new dojo.data.ItemFileWriteStore({
			data: {
				identifier: "UNIQ_ID",
				label: "UNIQ_ID",
				items: []
			}
		}));
		this._featureGrid.updateDelay = 10;
		this._fguConnect = dojo.connect(this._featureGrid, "update", this._gridUpdated);
		this._optTolerance.attr("value", this.defaultTolerance);
		this._selectedFeature = null;
		this._locationGraphic = null;
		
		for (var i = 0; i < this.mapServices.length; i++) {
			var service = this.mapServices[i], node = dijit.byId(service.chkId);
			node.associatedWidget = this;
			service._optConnect = dojo.connect(node, "onChange", this._layerSelectionChanged);
		}
		// number of map services currently enabled by the end-user for identify operation
		// This cannot go below '0'
		this._enabledCount = this.mapServices.length;
		this._pgsConnect = dojo.subscribe(this.id + "-stack-selectChild", this._pageSelectHandler);
		//this._mclConnect = dojo.connect(this.map, "onClick", this._mapClickHandler);
		
		this._backButtonRegion.domNode.style.lineHeight = dojo.coords(this._backButtonRegion.domNode, true).h + "px";
		this._iwconnector = new identify.InfoWindowConnector(this.id);
		this._iwconnector.attachToMap(this.map);
		this._iwconnector.hide();
		
		dojo.subscribe('/Identify/setLayerVisibility', this, function(params) {
			//console.log("/Identify/setLayerVisibility " + params.serviceId + " " + params.serviceUrl + " " + params.visibleLayers);	
			for (var i = 0; i < this.mapServices.length; i++) {				
				if (this.mapServices[i].name == params.serviceId) {																																																						
					this.mapServices[i].layerIds = params.visibleLayers.slice();
					
					for (var j = 0; j < params.visibleLayers.length; j++) {
						//console.log(this.mapServices[i].displayOptions[params.visibleLayers[j]]);
						if (typeof this.mapServices[i].displayOptions[params.visibleLayers[j]] == "undefined" ) {
							this.mapServices[i].layerIds.splice(j, 1);
							if (this.mapServices[i].layerIds.length == 0) {
								this.mapServices[i].layerIds = [9999];
								this.mapServices[i].selected = false;
							}								
						}	
					}
																										
					//console.log(this.mapServices[i].name + " " + params.visibleLayers);
					if (params.visibleLayers[0] == 9999)
						this.mapServices[i].selected = false;
					else
						this.mapServices[i].selected = true;
				}
			}
		});
		
		dojo.subscribe('/Identify/setLayerDefinitions', this, function(params){
			console.log("setLayerDefinitions " + params.serviceId + " " + params.layerDefinitions);
			this._serviceLayerDefinitions[params.serviceId] = params.layerDefinitions;
		});
		
		dojo.subscribe('Identify/mapClick', this, function(geometry) {
			//console.log('Identify/mapClick');
			
			this._currentGeometry = geometry;
			
			if (this._locationGraphic) {
				this.map.graphics.remove(this._locationGraphic);
			}
			if (this._selectedFeature) {
				this.map.graphics.remove(this._selectedFeature);
			}
			
			if (geometry instanceof esri.geometry.Point) {
				// mark the current location
				this._locationGraphic = new esri.Graphic(geometry, this.locationMarker);
				this.map.graphics.add(this._locationGraphic);
			}
			
			this._executeIdentify(geometry);
		});
		
		dojo.subscribe('/ngdc/drawRectangle', this, function(graphic) {
			//console.log('/ngdc/drawRectangle');						
			if (this._locationGraphic) {
				this.map.graphics.remove(this._locationGraphic);
			}
			if (this._selectedFeature) {
				this.map.graphics.remove(this._selectedFeature);
			}
			this._locationGraphic = graphic;
			this._currentGeometry = graphic.geometry;
			
			this._executeIdentify(graphic.geometry);
		});	
	},
	
	destroy: function(){
		this._disconnectHandlers();
		this._clearGraphics();
		this._iwconnector.destroy();
		this._locationGraphic = this._selectedFeature = this._stackContainer = this._backButtonRegion = this._featureGrid = this._infoGrid = this._iwconnector = this._optTolerance = this._focusSpan = null;
		this.inherited(arguments);
	},
	
	/*****************
	 * Public Methods
	 *****************/
	getInfoWindowConnector: function(){
		return this._iwconnector;
	},
	
	/*******************
	 * Internal Methods
	 *******************/
	_disconnectHandlers: function(){
		dojo.disconnect(this._fguConnect);
		dojo.unsubscribe(this._pgsConnect);
		dojo.disconnect(this._mclConnect);
		dojo.disconnect(this._focusAConnect);
		dojo.disconnect(this._summaryOrBackConnect)
		var i, service;
		for (i = 0; i < this.mapServices.length; i++) {
			service = this.mapServices[i];
			dijit.byId(service.chkId).associatedWidget = null;
			dojo.disconnect(service._optConnect);
			dojo.disconnect(service._onCompleteConnect);
			dojo.disconnect(service._onErrorConnect);
		}
	},
	
	_clearGraphics: function(){
		this.map.graphics.clear(); //Clear all the map graphics
		/*
		if (this._locationGraphic) {
			this.map.graphics.remove(this._locationGraphic);
		}
		if (this._selectedFeature) {
			this.map.graphics.remove(this._selectedFeature);
		}
		*/
	},
		
	_executeIdentify: function(geometry) {		
		// cancel all previous identify requests
		var i, service, services = this.mapServices, map = this.map, servicesVisible = false;
		for (i = 0; i < services.length; i++) {
			dojo.disconnect(services[i]._onCompleteConnect);
			dojo.disconnect(services[i]._onErrorConnect);
			if (services[i].selected)
				servicesVisible = true;
		}
		map.infoWindow.hide();
		
		// remove previously selected location and feature
		if (this._iwconnector.isAttached()) {
			this._iwconnector.hide();
		}
		
		// clear all items in the featureGrid
		var item, grid = this._featureGrid, store = grid.store;
		while (item = grid.getItem(0)) {
			store.deleteItem(item);
		}
		//dojo.byId(this.id + "-count").innerHTML = "(0)";

		if (!servicesVisible) {
			if (this._locationGraphic) {
				this.map.graphics.remove(this._locationGraphic);
			}
			if (this._selectedFeature) {
				this.map.graphics.remove(this._selectedFeature);
			}
			dojo.publish('/Identify/message', ['No layers visible']);
		  	return;
		}
		
		// execute identify task
		var params, tol = this._optTolerance.attr("value") || this.defaultTolerance;
		for (i = 0; i < services.length; i++) {
			service = services[i];
			if (!service.selected) 
				continue;
			
			params = new esri.tasks.IdentifyParameters();
			params.geometry = geometry;
			params.tolerance = tol;
			params.layerIds = service.layerIds;
			params.layerOption = service.layerOption;
			params.mapExtent = map.extent;
			params.returnGeometry = false;
			params.spatialReference = this.spatialReference;
			params.timeExtent = this.map.timeExtent;
			if (this._serviceLayerDefinitions[service.name])
				params.layerDefinitions = this._serviceLayerDefinitions[service.name];
			
			service._onCompleteConnect = dojo.connect(service.task, "onComplete", dojo.hitch(this, 
			function(){
				var options = service.displayOptions;
				var serviceUrl = service.url;
				var sortFunction = service.sortFunction;
				return function(response){
					//console.log("Identify onComplete " + response.length);
					this._identifyTasksRunning--;
					if (this._identifyTasksRunning <= 0)
						this._identifyTasksRunning = 0;
					this._showFeatures(response, geometry, options, serviceUrl, sortFunction);
					dojo.publish('/Identify/complete', []);
				}
			}()));
			
			service._onErrorConnect = dojo.connect(service.task, "onError", dojo.hitch(this, 
			function(){
				var serviceUrl = service.url;
				return function(response){
					console.log("Identify error for " + serviceUrl + ": " + response);
					this._identifyTasksRunning--;
					if (this._identifyTasksRunning <= 0)
						this._identifyTasksRunning = 0;						
						if (this._locationGraphic) {
							this.map.graphics.remove(this._locationGraphic);
						}
						if (this._selectedFeature) {
							this.map.graphics.remove(this._selectedFeature);
						}
					dojo.publish('/Identify/complete', []);
					dojo.publish('/Identify/message', ['An error occurred during the identify operation. Please try again in another area.']);
				}
			}()));
			
			//console.log("executing Identify task");
			dojo.publish('/Identify/execute', []); //Publish status to main web app
			this._identifyTasksRunning++;
			service.task.execute(params);
		}	
	},
	
	_showFeatures: function(idResults, geometry, options, serviceUrl, sortFunction){
		// add the list of identified features to the featureGrid
		var i, feature, idResult, store = this._featureGrid.store, uid, lid, fname, fnames, fnamedelimiters, lalias;
		
		if (sortFunction)		
			idResults.sort(sortFunction);
		
		for (i = 0; i < idResults.length; i++) {
			idResult = idResults[i];
			feature = idResult.feature;
			uid = ++this._uid1;
			lid = idResult.layerId;
			feature._displayAttributes = options[lid] ? options[lid].attributes : null;
			feature._fieldAliases = (options[lid] && options[lid].fieldAliases) || {};
			feature._fieldUrls = (options[lid] && options[lid].fieldUrls) || {};
			fname = options[lid] ? options[lid].displayFieldName : "";
			fnames = options[lid] ? options[lid].displayFieldNames : null;
			fnamedelimiters = options[lid] ? options[lid].displayFieldDelimiters : null;
			lalias = options[lid] ? options[lid].layerAlias : "";
			
			var compoundFeatureName;
			if (fnames) {
				var names = [];
				dojo.forEach( fnames, function(fname) {
					names.push((feature.attributes[fname] == 'Null' ? 'unknown' : feature.attributes[fname]) + fnamedelimiters[fname]);	
				}, this);
				compoundFeatureName = names.join('');				
			}
				
			store.newItem({
				UNIQ_ID: uid,
				layerUrl: serviceUrl + '/' + lid,
				layerName: lalias || idResult.layerName,
				displayName: compoundFeatureName || feature.attributes[fname || idResult.displayFieldName] || "",
				feature_name: dojo.string.substitute(this._featureRowTemplate, {
					value: compoundFeatureName || feature.attributes[fname || idResult.displayFieldName] || "",
					layerName: lalias || idResult.layerName,
					spanId: this.id + "-fspan-" + uid,
					linkId: this.id + "-flink-" + uid
				}),				
				ref: feature
			});
			this._featureGrid.rowCount++;
		}
		this._featureGrid.render();
		dojo.byId(this.id + "-label").innerHTML = "Identified Features (" + this._featureGrid.rowCount + ")";
	
		// show the widget at the clicked location
		if (this._identifyTasksRunning == 0) {
			
			dojo.byId("showSummaryOrBackButton").innerHTML = "Show Summary";
			dojo.disconnect(this._summaryOrBackConnect);
			this._summaryOrBackConnect = dojo.connect(this._showSummaryOrBackButton, "onClick", this._showSummary);
			
			dijit.byId("showNewWindowButton").domNode.style.display = "none";  //Hide the "Show in New Window" button
			if (this.showGetDataButton)
				dijit.byId("getDataButton").domNode.style.display = ""; //Show the "Get Data" button
			
			dojo.byId(this.id + "-featureGridHeader").innerHTML = this.featureGridHeaderText;
			
			this._featureGrid.resize();
			this._featureGrid.render();
			
			this._stackContainer.selectChild(this._stackContainer.getChildren()[0]);
			this._iwconnector.show(geometry);
												
			//this._borderContainer.layout();
			//this._borderContainer.resize(); //resize() does a better job of ensuring the DataGrid gets shown correctly?
			
			var img = this._chainIcon;
			
			//JDV: InfoWindow should be detached from the map by default
			if (this._iwconnector.isAttached()) { // detach the dijit from map
				//img.src = this._unchainImg || (this._unchainImg = dojo.moduleUrl("identify", "images/detached.png"));
				//img.title = "click to attach to the map";
				this._iwconnector.detachFromMap(this.id + "-titlebar");
			}
		}
	},
	
	_gridRowClickHandler: function(evt){
		var item = evt.grid.getItem(evt.rowIndex), graphic = evt.grid.getItem(evt.rowIndex).ref[0], attr = graphic.attributes, dispAttr = graphic._displayAttributes, aliases = graphic._fieldAliases, urls = graphic._fieldUrls;
		var displayName = item.displayName[0];
		
		// add the field values to the infoGrid 
		var items = [], field, i = 0, len;
		if (dispAttr) {
			len = dispAttr.length;
			for (i = 0; i < len; i++) {
				field = dispAttr[i];
				var theValue;
				if (urls[field]) {
					if (urls[field].urlField != null) 
						url = urls[field].prefix + attr[urls[field].urlField] + urls[field].postfix;
					else
						url = urls[field].prefix + attr[field] + urls[field].postfix;					
					if (urls[field].linkText != null) 
						linkText = urls[field].linkText;
					else 
						linkText = attr[field];
					theValue = '<a href="' + url + '" onClick="window.open(\'' + url + '\'); return false;" target="_blank">' + linkText + '</a>';
				}
				else 
					theValue = attr[field];
				if (theValue === 'Null' || theValue === 'null')
					theValue = '';
				if (!theValue) 
					theValue = '';
				items.push({
					UNIQ_ID: i,
					field_value: dojo.string.substitute(this._attributeRowTemplate, {
						attr: aliases[field] || field,
						value: theValue
					})
				});
			}
		}
		else {
			for (field in attr) {
				items.push({
					UNIQ_ID: i++,
					field_value: dojo.string.substitute(this._attributeRowTemplate, {
						attr: aliases[field] || field,
						value: attr[field]
					})
				});
			}
		}
		this._infoGrid.setStore(new dojo.data.ItemFileWriteStore({
			data: {
				identifier: "UNIQ_ID",
				label: "UNIQ_ID",
				items: items
			}
		}));
		
		// show the page containing the infoGrid
		//dojo.byId(this.id + "-label").innerHTML = "Attributes for " + displayName;
		dojo.byId(this.id + "-label").innerHTML = "Attributes";
		dojo.byId(this.id + "-infoGridHeader").innerHTML = displayName;
		this._stackContainer.selectChild(this._stackContainer.getChildren()[1]);
		dojo.byId("showSummaryOrBackButton").innerHTML = "< Back";
		if (this.showGetDataButton)
			dijit.byId("getDataButton").domNode.style.display = "none"; //Hide the "Get Data" button
		dojo.disconnect(this._summaryOrBackConnect);
		this._summaryOrBackConnect = dojo.connect(this._showSummaryOrBackButton, "onClick", this._backButtonClickHandler);
	},
	
	_gridRowMouseOverHandler: function(evt){
		var item = evt.grid.getItem(evt.rowIndex), graphic = item.ref[0], layerUrl = item.layerUrl[0];	
		this._uid = item.UNIQ_ID[0];
		var mouseOverQuery = this._mouseOverQuery;
			
		clearTimeout(this._mouseOverTimer);					
		this._mouseOverTimer = setTimeout(function(){
			mouseOverQuery(graphic, layerUrl)
		}, 100);	
	},
	
	_mouseOverQuery: function(graphic, layerUrl) {
		var queryTask = new esri.tasks.QueryTask(layerUrl);
		var query = new esri.tasks.Query();
		query.where = "OBJECTID = " + graphic.attributes['OBJECTID'];
		query.outSpatialReference = this.spatialReference;		
		query.returnGeometry = true;
		query.outFields = [];
		
		dojo.connect(queryTask, "onComplete", this._onMouseOverQueryComplete);
		
		queryTask.execute(query);
	},
	
	_onMouseOverQueryComplete: function(featureSet){
		//console.log("onQueryComplete " + featureSet.features[0].geometry.toString());
		var graphic = featureSet.features[0];
			
		// set the symbol for the feature
		if (graphic != null) {
			switch (graphic.geometry.type) {
				case "point":
					graphic.setSymbol(this.markerSymbol);
					break;
				case "multipoint":
					graphic.setSymbol(this.markerSymbol);
					break;
				case "polyline":
					graphic.setSymbol(this.lineSymbol);
					break;
				case "polygon":
					graphic.setSymbol(this.fillSymbol);
					break;
			}
		}
			
		// remove previously selected feature
		if (this._selectedFeature) {
			this.map.graphics.remove(this._selectedFeature);
		}
		
		// add the selected feature to the map
		if (graphic != null) {
		  	this.map.graphics.add(graphic);
		  	this._selectedFeature = graphic;
		}
		
		// show the focus button
		this._focusSpan && esri.hide(this._focusSpan);
		esri.show(this._focusSpan = dojo.byId(this.id + "-fspan-" + this._uid));
		
		dojo.disconnect(this._focusAConnect);
		this._focusAConnect = dojo.connect(dojo.byId(this.id + "-flink-" + this._uid), "onclick", dojo.hitch(this, function(evt2){
			this._focusButtonClicked(evt2, graphic.geometry);
		}));
	},
	
	_gridUpdated: function(){
		// [GOTCHA] For some reason, whenever the list of features is displayed, 
		// dojo re-renders the Grid headers. So, here we need to set the feature 
		// count again.
		console.log("gridUpdated")
		dojo.byId(this.id + "-featureGridHeader").innerHTML = this.featureGridHeaderText;
	},
	
	_pageSelectHandler: function(selectedPage){
		if (selectedPage === this._stackContainer.getChildren()[0]) {
			this._backButtonRegion.attr("content", "");
		}
		else {
			//this._backButtonRegion.attr("content", "&laquo;");
		}
	},
	
	_backButtonClickHandler: function(){
		//console.log("_backButtonClickHandler");		
		dojo.byId(this.id + "-label").innerHTML = "Identified Features (" + this._featureGrid.rowCount + ")";
		
		dojo.byId("showSummaryOrBackButton").innerHTML = "Show Summary";
		dojo.disconnect(this._summaryOrBackConnect);
		this._summaryOrBackConnect = dojo.connect(this._showSummaryOrBackButton, "onClick", this._showSummary);
		
		dijit.byId("showNewWindowButton").domNode.style.display = "none";  //Hide the "Show in New Window" button
		if (this.showGetDataButton)
			dijit.byId("getDataButton").domNode.style.display = "";  //Show the "Get Data" button
		
		this._stackContainer.selectChild(this._stackContainer.getChildren()[0]);		
	},
	
	_showSummary: function(){		
		//console.log("showSummary");
		
		if (true) {
		//if (this._featureGrid.rowCount <= this._maxSummaryResults) {
			this._featureGrid.store.fetch({
				onComplete: this._summaryFetchComplete
			});
		}
		else {
			var dialog = new dijit.Dialog({
				title: "Warning",
				style: "width: 200px"
			});
			dialog.attr("content", "Too many results to show summary view. Please select a smaller area.");
			dialog.show();
	
		}
	},
	
	_summaryFetchComplete: function(items, request){
		//console.log("summaryFetchComplete");
		
		var summaryStrings = [];				
		var latLonGeometry = esri.geometry.webMercatorToGeographic(this._currentGeometry);
		
		if (latLonGeometry instanceof esri.geometry.Point) {
			summaryStrings.push("<h3>Results found near point: (" + latLonGeometry.x.toFixed(3)	+ ", " + latLonGeometry.y.toFixed(3) + ")</h3>");
		}
		else if (latLonGeometry instanceof esri.geometry.Extent) {
			summaryStrings.push("<h3>Results found in extent:<br>" + 
				"&nbsp;&nbsp;Upper-left: (" + latLonGeometry.xmin.toFixed(3) + ", " + latLonGeometry.ymax.toFixed(3) + ")<br>" +
				"&nbsp;&nbsp;Lower-right: (" + latLonGeometry.xmax.toFixed(3) + ", " + latLonGeometry.ymin.toFixed(3) + ")</h3>");
		}
				
		for (var i = 0; i < items.length; i++) {
			summaryStrings.push("<b>" + items[i].displayName[0] + "</b>");
			if (items[i].layerName != ' ')
				summaryStrings.push("(" + items[i].layerName + ")");
			summaryStrings.push("<br>");			
			//summaryStrings.push(items[i].displayName[0] + " (" + items[i].layerName + ")<br><table border=\"1\" cellspacing=\"0\" cellpadding=\"1\">");
			var dispAttr = items[i].ref[0]._displayAttributes;
			var attr = items[i].ref[0].attributes;
			var aliases = items[i].ref[0]._fieldAliases;
			var urls = items[i].ref[0]._fieldUrls;
			
			if (dispAttr) {
				for (var j = 0; j < dispAttr.length; j++) {					
					var field = dispAttr[j];
					var theValue;
					if (urls[field]) {
						if (urls[field].urlField != null) 
							url = urls[field].prefix + attr[urls[field].urlField] + urls[field].postfix;
						else 
							url = urls[field].prefix + attr[field] + urls[field].postfix;
						if (urls[field].linkText != null) 
							linkText = urls[field].linkText;
						else 
							linkText = attr[field];
						theValue = '<a href="' + url + '" onClick="window.open(\'' + url + '\'); return false;" target="_blank">' + linkText + '</a>';
					}
					else 
						theValue = attr[field];
					if (theValue === 'Null' || theValue === 'null')
						theValue = '';
					if (!theValue) 
						theValue = '';
					summaryStrings.push("&nbsp;&nbsp;&nbsp;&nbsp;<b>" + (aliases[field] || field) + "</b>: " + theValue + '<br>');
					//summaryStrings.push("<tr><td>" + (aliases[field] || field) + "</td><td>: " + theValue + '</td></tr>');					
				}
			}
			else {
				for (var field in attr) {
					summaryStrings.push("&nbsp;&nbsp;&nbsp;&nbsp;<b>" + (aliases[field] || field) + "</b>: " + attr[field] + '<br>');
					//summaryStrings.push("<tr><td>" + (aliases[field] || field) + "</td><td>: " + attr[field] + '</td></tr>');															
				}
			}
			summaryStrings.push("<br>");		
		}	
		
		dojo.byId("summaryDiv").innerHTML = summaryStrings.join('');
		
		this._stackContainer.selectChild(this._stackContainer.getChildren()[3]);
		dojo.byId("showSummaryOrBackButton").innerHTML = "< Back";
		dojo.disconnect(this._summaryOrBackConnect);
		this._summaryOrBackConnect = dojo.connect(this._showSummaryOrBackButton, "onClick", this._backButtonClickHandler);
		
		dijit.byId("showNewWindowButton").domNode.style.display = ""; //Display the "Show in New Window" button
		if (this.showGetDataButton)
			dijit.byId("getDataButton").domNode.style.display = "none"; //Hide the "Get Data" button
	},
	
	_showNewWindow: function(){		
		//console.log("showNewWindow");

    	var displayWindow = window.open("","SummaryWindow" + Math.floor(Math.random()*1000));
    	displayWindow.document.write("<html><head><title>Summary</title></head>\n");
    	displayWindow.document.write("<body>\n");
		displayWindow.document.write(dojo.byId("summaryDiv").innerHTML + "\n");
    	displayWindow.document.write("</body></html>");
		displayWindow.document.close();
	},
	
	_getData: function(){
		//Publish the current identify geometry to the main app
		dojo.publish('/Identify/getData', [this._currentGeometry]);
	},
	
	_showOptionsPage: function(){
		this._stackContainer.selectChild(this._stackContainer.getChildren()[2]);
	},
	
	_closeWidget: function(){
		this._iwconnector.hide();
		this._clearGraphics();
		//this.destroy();
	},
	
	_chainHandler: function(){
		var img = this._chainIcon;
		if (this._iwconnector.isAttached()) { // detach the dijit from map
			img.src = this._unchainImg || (this._unchainImg = dojo.moduleUrl("identify", "images/detached.png"));
			img.title = "click to attach to the map";
			this._iwconnector.detachFromMap(this.id + "-titlebar");
		}
		else { // attach dijit to the map
			img.src = this._chainImg || (this._chainImg = dojo.moduleUrl("identify", "images/attached.png"));
			img.title = "click to detach from the map";
			this._iwconnector.attachToMap(this.map);
		}
	},
	
	_layerSelectionChanged: function(checked){
		var i, checkBox = this, self = checkBox.associatedWidget, chkId = checkBox.id, service;
		for (i = 0; i < self.mapServices.length; i++) {
			service = self.mapServices[i];
			if (service.chkId === chkId) {
				service.selected = checked;
				if (checked) {
					self._enabledCount++;
				}
				else {
					self._enabledCount--;
				}
				break;
			}
		}
		if (!self._enabledCount) {
			checkBox.setChecked(true);
		}
	},
	
	_getTaskInfo: function(service){
		var url = service.url, name = service.name, segs = url.replace(/[\/]+$/, "").split("/"), name = name || segs[segs.length - 2].replace(/_/g, " "), chkId = this.id + "-opt-layers-" + (service.id || ++this._uid1);
		return {
			url: url,
			name: name,
			task: new esri.tasks.IdentifyTask(url),
			chkId: chkId,
			selected: true,
			layerIds: service.layerIds,
			sortFunction: service.sortFunction,
			layerOption: service.layerOption || esri.tasks.IdentifyParameters.LAYER_OPTION_ALL,
			displayOptions: service.displayOptions || {},
			_optionsHtml: dojo.string.substitute(this._optionsTemplate, {
				id: chkId,
				name: name
			})
		};
	},
	
	_focusButtonClicked: function(evt, geometry){
		if (geometry.type === "point") {
			//this.map.centerAt(geometry);
			this.map.centerAndZoom(geometry, this.map.getLevel() + 3); //Center on the point and zoom in 3 more levels 		
		}
		else {
			this.map.setExtent(geometry.getExtent(), true);
		}
		dojo.stopEvent(evt);
	}
});

dojo.mixin(identify.Identify, {
	// At Dojo 1.3.1, DataGrid escapes any HTML data.
	// Overrride that behavior by adding a formatter function 
	// for the grid cells and convert all &lt; back to <
	// See also: templates/identify.html where this formatter is bound to the grid column.
	// http://docs.dojocampus.org/dojox/grid#important-information-about-formatting-and-security
	_cellFormatter: function(value){
		return value.replace(/&lt;/g, "<");
	}
});

// disable sorting
// inSortInfo is the 1-based index of the field column and can be negative or positive
function noSort(inSortInfo){
	return false;
}
