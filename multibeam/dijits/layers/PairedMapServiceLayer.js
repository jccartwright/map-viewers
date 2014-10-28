dojo.provide('layers.PairedMapServiceLayer');

dojo.declare('layers.PairedMapServiceLayer',[esri.layers.Layer],{
	//constructor options
	id: null,				//required
	loaded: false,
	opacity: 1.0,
	url: null,
	visible: true,
	layerDefinitions: null,
	
	//internal state
	_debug: false,
	_active: null,
	_isDynamic: false,
	_map: null,                //required
	_mapServiceList: null,     //required
	_dynamicServiceId: null,   //required
	_tiledServiceId: null,     //required
	_cutoffZoom: 5,
	_dynamicService: null,   //esri.layers.ArcGISDynamicMapServiceLayer
	_tiledService: null,     //esri.layers.ArcGISTiledMapServiceLayer
	_selectionApplied: false,
	
	//called when both mapservices loaded
	layersLoaded: function() {
		this.loaded = true;

		if (!this.visible) {
			this._dynamicService.setVisibility(false);
			this._tiledService.setVisibility(false);
		}

		//set the initial active layer
		this._toggleService();
	},
		
	setLayerDefinitions: function(/*String[]*/ layerDefinitions) {
		if (this._debug) {
			console.log('setting layerDefinitions to ', layerDefinitions);
		}
		this._dynamicService.setLayerDefinitions(layerDefinitions);
		this.layerDefinitions = this._dynamicService.layerDefinitions;
		
		if (layerDefinitions && layerDefinitions.length > 0) {
			this._selectionApplied = true;
		} else {
			this._selectionApplied = false;
		}
		this._toggleService();
	},

	hide: function() {
		//console.log('inside hide:',this._active );
		this._active.hide();	
	},
	
	setOpacity: function(value) {
		//console.log("setting opacity to ",value);
		this._tiledService.setOpacity(value);
		this._dynamicService.setOpacity(value);
		this.opacity = value;
	},
	
	setVisibility: function(isVisible) {
		//console.log("setting visibility to ",isVisible);
		this._active.setVisibility(isVisible);
		this.visible = isVisible;
	},
	
	show: function() {
		//console.log('inside show: ',this._active);
		this._active.show();
	},
	
	//implement rules for switching between tiled, dynamic services
	_toggleService: function() {
		var zoomLevel = this._map.getLevel();
//		if (this._debug) {
//			console.log('inside _toggleService, level = ', zoomLevel);
//		}
		
		if (this._selectionApplied || zoomLevel > this._cutoffZoom) {
			if (this._debug) {
				console.log('activating dynamic service...');
			}
			this._activateDynamicService();
		} else {
			if (this._debug) {
				console.log('activating tiled service...');
			}
			this._activateTiledService();			
		}
		//console.log('tiled: '+this._tiledService.visible);
		//console.log('dynamic: '+this._dynamicService.visible);
	},
	
	_activateTiledService: function() {
		//already using tiled service
		if (!this._isDynamic) { return; }
		if (this._debug) {
			console.log('activating tiled layer ' + this._tiledService.id + '...');
		}
		this._active = this._tiledService;
		this._isDynamic = false;
		//console.log('inside _activateTiledService. visible = ',this.visible);
		if (this.visible) {
			this._tiledService.show();
			this._dynamicService.hide();
		} /* else {
			console.log('layer is not visible');
		}
		*/
		this.url = this._tiledService.url;
	},
	
	_activateDynamicService: function() {
		//already using dynamic service
		if (this._isDynamic) { return; }
		if (this._debug) {
			console.log('activating dynamic layer ' + this._dynamicService.id + '...');
		}
		this._active = this._dynamicService;
		this._isDynamic = true;
		//console.log('inside _activateDynamicService. visible = ',this.visible);
		if (this.visible) {
			this._dynamicService.show();
			this._tiledService.hide();
		} /* else {
			console.log('layer is not visible');
		}
		*/
		this.url = this._dynamicService.url;
	},
	
	constructor: function(params) {
		//console.log('inside constructor...');
		//options allowed in the constructor
		this._map = params.map;
		this._dynamicServiceId = params.dynamicServiceId;
		this._tiledServiceId = params.tiledServiceId;
		this._mapServiceList = params.mapServiceList;
		this._cutoffZoom = params.cutoffZoom;
		//opacity, visible, id seem to be set automatically. Why not others?
		
		dojo.connect(this._map, "onZoomEnd", this, function(extent, zoomFactor, anchor, level) {
			//console.log('zoom level: '+level);
			this._toggleService();	
		});
				
		//determine the original array index of each of the layers
		var idx = [];
		dojo.forEach(this._mapServiceList, function(svc,i) {
			if (svc.id === this._dynamicServiceId) {
				this._dynamicService = svc;
				//TODO check for definition query
				idx.push(i);
				return; 
			}			
		},this);

		dojo.forEach(this._mapServiceList, function(svc,i) {
			if (svc.id === this._tiledServiceId) {
				this._tiledService = svc; 
				idx.push(i);
				return; 
			}			
		},this);
		idx.sort();

		//place the new PairedMapServiceLayer at the lowest index, remove the other
		//WARNING: modifies the original list
		this._mapServiceList.splice(idx[0],1,this);
		this._mapServiceList.splice(idx[1],1);
		
		if (this._dynamicService.loaded && this._tiledService.loaded) {
			//console.log('layers immediately loaded');
			this.layersLoaded();
		} else {
			dojo.connect(this._dynamicService, "onLoad", this, function(service){
				if (this._dynamicService.loaded && this._tiledService.loaded) {
					//console.log('dynamic loaded last');
					this.layersLoaded();
				}
			});
			dojo.connect(this._tiledService, "onLoad", this, function(service){
				if (this._dynamicService.loaded && this._tiledService.loaded) {
					//console.log('tiled loaded last');
					this.layersLoaded();
				}
			});
		}

		//initialize layer definitions in case dynamic layer has them already set
		if (this._dynamicService.layerDefinitions && this._dynamicService.layerDefinitions.length > 0) {
			//console.log('initializing layer definitions');
			this._selectionApplied = true;
			this.layerDefinitions = this._dynamicService.layerDefinitions;
		}
		
		if (this.opacity < 1.0) {
			this.setOpacity(this.opacity);
		}
		
	} //end constructor function
});

	   
