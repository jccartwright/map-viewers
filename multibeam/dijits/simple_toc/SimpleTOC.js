/*
 * Simple TOC Widget
 * 
 * based on example by Trent Tinker - http://www.roktech.net/
 * http://resources.esri.com/arcgisserver/apis/javascript/arcgis/index.cfm?fa=codeGalleryDetails&scriptID=16193
 */dojo.provide('simple_toc.SimpleTOC');
dojo.require('dijit._Widget');dojo.require('dijit._Templated');dojo.require('dijit.form.CheckBox');

dojo.declare('simple_toc.SimpleTOC', [dijit._Widget, dijit._Templated], {
	templatePath: dojo.moduleUrl('simple_toc', 'templates/SimpleTOC.html'),
	widgetsInTemplate: true,
	addLayerSub: null,
	tocHTML: null,
	visible: [],
	//Layer currently selected and to which the transparency slider will be applied
	transparencyLayerId: "",
	imagePath: dojo.moduleUrl('simple_toc','images'),
	//lifecycle extension points
	postMixInProperties: function(){
	},

	postCreate: function() {		//console.log('inside postCreate...');		addLayerSub = dojo.subscribe('/Layer/add', this, function(svc) {			//console.log("received layer "+svc.url);			this.addToTOC(svc, true);		});
		dojo.connect(this.zoomToLayerBtn,'onclick',this.zoomToLayer);		//this is a DOM node so fires onchange		dojo.connect(this.transparencyList, 'onchange',this.updateTransparencyLayer);		//this is a dijit so fires onChange		dojo.connect(this.slider, 'onChange', this.changeTransparency);
	},

	destroy: function(){      dojo.unsubscribe(addLayerSub);      this.inherited(arguments);	},

	//widget-specific  /**   * called for each Layer (i.e. mapservice) added   * @param {Object} layer   * @param {Object} listLayers   */	addToTOC: function(layer){		//console.log('inside addToTOC with layer '+layer.url);		if (layer.listLayers) {			//show all layers w/in mapservice			if (layer.loaded) {				//console.log("loaded: "+layer.url);				this.buildLayerList(layer);			} else {				//console.log("WARNING: "+layer.url+" should already be loaded");				//dojo.connect(layer, "onLoad", buildLayerList);			}		} else {			//show only the mapservice as a node			if (layer.loaded) {				//console.log("loaded: "+layer.url);				this.buildLayerListRoot(layer);			} else {				//console.log("WARNING: "+layer.url+" should already be loaded");				//dojo.connect(layer, "onLoad", buildLayerListRoot);			}		}	},

	buildLayerListRoot: function(layer) {		//console.log('inside buildLayerListRoot with layer '+layer.url);		var icon = this.imagePath+"/blank.bmp";		this.addToTransparencyList(layer, icon);		this.layerList.appendChild(this.buildLayerRootNode(layer));	},
	
	buildLayerRootNode: function (layer, imgSrc) {		var div = document.createElement("div");		if (imgSrc) {			var icon = document.createElement("img");			icon.src = imgSrc;			icon.id = layer.id + "_icon";			div.appendChild(icon);		}
		var chkBox = document.createElement("input");		chkBox.type = "checkbox";		chkBox.className = "TOC_Root";		if (layer.visible) {			chkBox.checked = true;		}
		chkBox.id = layer.id;
		dojo.connect(chkBox,'onclick',this,function(evt){			this.toggleService(layer.id);		});
		div.appendChild(chkBox);
		var label = document.createElement("label");		label.htmlFor = layer.id;		label.appendChild(document.createTextNode(layer.id));		div.appendChild(label);
		return(div);
	},
	zoomToLayer: function(id) {		//console.log('inside zoomToLayer');		//onClick='this.zoomToLayer(dojo.byId("transparencyList").value);'
		var layer = map.getLayer(id);		//console.log(layer);		if (layer != null) {			map.setExtent(layer.fullExtent);		}	},	
  /**   * build the list of layers w/in a mapservice   * @param {Object} layer   */			buildLayerList: function(layer) {		//console.log('inside buildLayerList with layer '+layer.url);		icon = this.imagePath+'/expand.bmp';		this.addToTransparencyList(layer);		var currentLayer = layer;		
		//create root node
		var root = this.buildLayerRootNode(currentLayer,icon);
		root.appendChild(document.createElement("br"));
		this.layerList.appendChild(root);

		//attach event to icon
		var img = dojo.byId(currentLayer.id+'_icon');
		dojo.connect(img,'onclick',this,function(evt){
			this.toggleLayer(currentLayer.id);
		});
		//create the sublayers container
		var div = dojo.create("div",{id:currentLayer.id+"_layers", style:"display:none;"}, root );
		var subLayers = currentLayer.layerInfos;
		var currentSubLayer = null;
		for (var i = 0; i < subLayers.length; i++) {
			currentSubLayer = subLayers[i];
			if (currentSubLayer.defaultVisibility) {
				this.visible.push(currentSubLayer.id);
			}
			div.appendChild(this.buildLayerNode(layer,currentSubLayer));
		}
	},	
	buildLayerNode: function (layer,sublayer) {		var div = document.createElement("div");
		//add spacer icons		var icon1 = document.createElement("img");		icon1.src = this.imagePath+"/blank.bmp";		div.appendChild(icon1);		var icon2 = document.createElement("img");		icon2.src = this.imagePath+"/blank.bmp";		div.appendChild(icon2);
		var chkBox = document.createElement("input");		chkBox.type = "checkbox";
		chkBox.className = layer.id+"_TOC";
		//console.log(sublayer);
		if (sublayer.defaultVisibility) {
			chkBox.checked = true;
		}
		chkBox.id = sublayer.id;
		dojo.connect(chkBox,'onclick',this,function(evt){
			this.updateLayerVisibility(layer.id,sublayer.id);
		});
		div.appendChild(chkBox);
		var label = document.createElement("label");
		label.htmlFor = sublayer.id;
		label.appendChild(document.createTextNode(sublayer.name));
		div.appendChild(label);

		div.appendChild(document.createElement("br"));
		
		return(div);
	},	
  /**
   * toggle the visibility of a layer w/in a map service
   * @param {Object} serviceId
   * @param {Object} layerId
   */	
	updateLayerVisibility: function(serviceId, layerId){
		//console.log('inside updateLayerVisibility with service, layer:'+serviceId+", "+layerId);
		var inputs = dojo.query("." + serviceId + "_TOC"), input;
		this.visible = [];
		for (var i = 0, il = inputs.length; i < il; i++) {
			if (inputs[i].checked) {
				this.visible.push(inputs[i].id);
			}
		}
		var layer = map.getLayer(serviceId);
		layer.setVisibleLayers(this.visible);
	},

  /**   * toggle the display in the TOC of layers w/in the given service. Does NOT   * affect map display   * @param {Object} id   */	toggleLayer: function(layerId) {		//console.log('inside toggleLayer w/ id '+layerId);		var layerDiv = dojo.byId(layerId + '_layers');		var theId = layerId + '_layers';
		var icon = dojo.byId(layerId + '_icon');		if ( dojo.style(dojo.byId(theId),'display') == 'block' ) {			icon.src = this.imagePath+"/expand.bmp";			dojo.style(dojo.byId(theId),'display','none');		} else {			icon.src = this.imagePath+"/close.bmp";			dojo.style(dojo.byId(theId),'display','block');					}	},	
  /**	   * toggle the visibility of the given service on the map   * @param {Object} layerID   */	toggleService: function(layerId){		//console.log('inside toggleService');		var layer = map.getLayer(layerId);		if (layer.visible) {			layer.hide();		} else {			layer.show();		}	},	
	addToTransparencyList: function(layer){		//console.log('inside addToTransparencyList w/ '+layer.id);		var selectObject = dojo.byId("transparencyList");		var optionObject = new Option(layer.id, layer.id);		selectObject.options[selectObject.options.length] = optionObject;
		var list = new Array();		for (var i = 0; i < selectObject.options.length; i++) {			list.push(selectObject.options[i].value);		}
		selectObject.options.length = 0;		list.sort();		for (var j = 0; j < list.length; j++) {			var optionObject = new Option(list[j], list[j]);			selectObject.options[selectObject.options.length] = optionObject;		}	},


	updateTransparencyLayer: function(event) {		//console.log('inside updateTransparencyLayer...');
		transparencyLayerId = event.target.value;
		var layer = map.getLayer(transparencyLayerId);
		if (layer != null) {
			dijit.byId('slider').attr('value',layer.opacity * 100);
		}
	},

	changeTransparency: function(value) {		//console.log('inside changeTransparency...');				value = value /100;		var layer = map.getLayer(transparencyLayerId);		if (layer != null) {			layer.setOpacity(value);		}
	}
});