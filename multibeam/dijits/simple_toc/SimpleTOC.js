/*
 * Simple TOC Widget
 * 
 * based on example by Trent Tinker - http://www.roktech.net/
 * http://resources.esri.com/arcgisserver/apis/javascript/arcgis/index.cfm?fa=codeGalleryDetails&scriptID=16193
 */
dojo.require('dijit._Widget');

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

	postCreate: function() {
		dojo.connect(this.zoomToLayerBtn,'onclick',this.zoomToLayer);
	},

	destroy: function(){

	//widget-specific

	buildLayerListRoot: function(layer) {
	
	buildLayerRootNode: function (layer, imgSrc) {
		var chkBox = document.createElement("input");
		chkBox.id = layer.id;
		dojo.connect(chkBox,'onclick',this,function(evt){
		div.appendChild(chkBox);
		var label = document.createElement("label");
		return(div);
	},
	zoomToLayer: function(id) {
		var layer = map.getLayer(id);
  /**
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
	buildLayerNode: function (layer,sublayer) {
		//add spacer icons
		var chkBox = document.createElement("input");
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

  /**
		var icon = dojo.byId(layerId + '_icon');
  /**	
	addToTransparencyList: function(layer){
		var list = new Array();
		selectObject.options.length = 0;


	updateTransparencyLayer: function(event) {
		transparencyLayerId = event.target.value;
		var layer = map.getLayer(transparencyLayerId);
		if (layer != null) {
			dijit.byId('slider').attr('value',layer.opacity * 100);
		}
	},

	changeTransparency: function(value) {
	}
});