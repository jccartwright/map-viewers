dojo.provide('layers.PairedMapServiceLayer');

dojo.declare('layers.PairedMapServiceLayer', [esri.layers.Layer], {
    //constructor options
    id: null, //required
    loaded: false,
    opacity: 1.0,
    url: null,
    visible: true,
    layerDefinitions: null,
    visibleLayers: null,
    
    //internal state
    _active: null,
    _isDynamic: false,
    _map: null, //required
    _mapServiceList: null, //required
    _dynamicServiceId: null, //required
    _tiledServiceId: null, //required
    _cutoffZoom: 5,
    _dynamicService: null, //esri.layers.ArcGISDynamicMapServiceLayer
    _tiledService: null, //esri.layers.ArcGISTiledMapServiceLayer
    
	//called when both mapservices loaded
    layersLoaded: function(){
        //console.log('inside layersLoaded...');
        if (this._dynamicService.loaded === false || this._tiledService.loaded === false) {
            //console.log('not ready yet...');
            return;
        }
        
        //both layers loaded at this point;
        
        this.loaded = true;
        
        //The url field should always contain the dynamic service url.
        this.url = this._dynamicService.url;
        
        if (!this.visible) {
            this._dynamicService.setVisibility(false);
            this._tiledService.setVisibility(false);
        }
        
        //copy the Dynamic Layer properties to make them visible in the PairedLayer
        this.visibleLayers = this._dynamicService.visibleLayers;
        this.layerDefinitions = this._dynamicService.layerDefinitions;
        
        this.setOpacity(this.opacity);
        
        //build list of layer ids visible by default, if not already set in the constructor
		if (this._defaultVisibleLayers.length === 0) {
			dojo.forEach(this._dynamicService.layerInfos, function(layerInfo){
				if (layerInfo.defaultVisibility) {
					this._defaultVisibleLayers.push(layerInfo.id);
				}
			}, this);
		}     
        //set the initial active layer
        this._toggleService();
    },
    
    
    setVisibleLayers: function(/*Number[]*/ids){
        //console.log('setting visibleLayers to ', ids);
        
        if (ids === null) {
            console.error("visibleLayers cannot be null");
            return;
        }
		//Empty array means default layer visibility defined in the mapservice
        if (ids.length === 0) {
            ids = this._defaultVisibleLayers;
        }
        //store in public property
        this.visibleLayers = ids;
        this._toggleService();
        this._dynamicService.setVisibleLayers(ids);
    },
    
    setLayerDefinitions: function(/*String[]*/layerDefinitions){
        //console.log('setting layerDefinitions to ', layerDefinitions);
        //console.log(this._map.getLevel());
        
        //checks for both undefined and null via coercion
        if (layerDefinitions === null) {
            console.error('layerDefinitions cannot be null');
            return;
        }
		
		if (layerDefinitions.length === 0) {
			this.layerDefinitions = [];
		}
		if (layerDefinitions.length > 0) { //Prevent an unnecessary dynamic image export when setting layerDefs to default
			this._dynamicService.setLayerDefinitions(layerDefinitions);
			//store in public property
        	this.layerDefinitions = this._dynamicService.layerDefinitions;
		}
             
        this._toggleService();
		
		if (layerDefinitions.length === 0) {
			this._dynamicService.setLayerDefinitions([]);			
		}
    },
    
	/*
     * defined in layers.Layer
     */
    show: function(){
        //console.log('inside show: ', this._active);
        this.setVisibility(true);
    },
	
    /*
     * defined in layers.Layer
     */
    hide: function(){
        //console.log('inside hide:', this._active);	
        this.setVisibility(false);
    },
    
    /*
     * defined in layers.Layer
     */
    setVisibility: function(isVisible){
        //console.log("setting visibility to ",isVisible);
        this.visible = isVisible;
        if (isVisible) {
            this._toggleService();
        } else {
            this._tiledService.hide();
            this._dynamicService.hide();
        }
    },
	
	/*
     * defined in layers.Layer
     */
    setOpacity: function(value){
        //console.log("setting opacity to ",value);
        this._tiledService.setOpacity(value);
        this._dynamicService.setOpacity(value);
        this.opacity = value;
    },
       
    //checks whether the current visibleLayers setting matches the default values
    isDefaultVisibleLayers: function(){
        //console.log('inside isDefaultVisibleLayers...');
        if (this.visibleLayers === null) {
            console.warn('visibleLayers is null');
            return (false);
        }
        //Empty array means default layers defined in the mapservice
        if (this.visibleLayers === []) {
            return true;
        }
        if (this.visibleLayers.length !== this._defaultVisibleLayers.length) {
            return (false);
        }
        
        var result = dojo.every(this._defaultVisibleLayers, function(item){
			return (dojo.indexOf(this.visibleLayers, item) > -1);
        }, this);
        return (result);
    },
    
    //implement rules for switching between tiled, dynamic services.
    //dynamic service should be used in any of these cases
    // 1) zoom level > threshold
    // 2) definition query applied
    // 3) sublayer visibility does not match default
    _toggleService: function(){
        //console.log('inside _toggleService. level = ' + this._map.getLevel());
        
        // 1) zoom level > threshold
        if (this._map.getLevel() > this._cutoffZoom) {
            //console.log('zoomLevel exceeded - switching to dynamic...');
            this._activateDynamicService();
            return;
        }
        
        // 2) definition query applied
        if (this.layerDefinitions && this.layerDefinitions.length > 0) {
            //console.log('definition query set - switching to dynamic...');
            this._activateDynamicService();
            return;
        }
        
        // 3) sublayer visibility does not match default
        if (!this.isDefaultVisibleLayers()) {
            //console.log('visibleLayers not equal to default - switching to dynamic...');
            this._activateDynamicService();
            return;
        }
        
        //console.log('switching to tiled service...');
        this._activateTiledService();
    },
    
    _activateTiledService: function(){        
        //console.log('activating tiled layer ' + this._tiledService.id + '...');
        
        this._active = this._tiledService;
        this._isDynamic = false;       
		this._dynamicService.hide();
		
        if (this.visible) {
            this._tiledService.show();
        } else {
            this._tiledService.hide();
        }     
        //this.url = this._tiledService.url;
    },
    
    _activateDynamicService: function(){        
        //console.log('activating dynamic layer ' + this._dynamicService.id + '...');
        
        this._active = this._dynamicService;
        this._isDynamic = true;
        this._tiledService.hide();
		
        if (this.visible) {
            this._dynamicService.show();            
        } else {
			this._dynamicService.hide();
		}
        //this.url = this._dynamicService.url;
    },
    
    constructor: function(params){
        //console.log('inside PairedMapServiceLayer constructor...');
        //options allowed in the constructor
		params = params || {};
        this._map = params.map;
        this._dynamicServiceId = params.dynamicServiceId;
        this._tiledServiceId = params.tiledServiceId;
        this._mapServiceList = params.mapServiceList;
        this._cutoffZoom = params.cutoffZoom;
        
		this._defaultVisibleLayers = params.defaultVisibleLayers || []; //based on values from layerInfos[], populated in layersLoaded()
        //opacity, visible, id seem to be set automatically. Why not others?
        
        dojo.connect(this._map, "onZoomEnd", this, function(extent, zoomFactor, anchor, level){
            //console.log('zoom level: '+level);
            this._toggleService();
        });
        
        //determine the original array index of each of the layers
        var idx = [];
        dojo.forEach(this._mapServiceList, function(svc, i){
            if (svc.id === this._dynamicServiceId) {
                this._dynamicService = svc;
                idx.push(i);
                return;
            }
        }, this);
        
        dojo.forEach(this._mapServiceList, function(svc, i){
            if (svc.id === this._tiledServiceId) {
                this._tiledService = svc;
                idx.push(i);
                return;
            }
        }, this);
        idx.sort();
        
        //place the new PairedMapServiceLayer at the lowest index, remove the other
        //WARNING: modifies the original list
        this._mapServiceList.splice(idx[0], 1, this);
        this._mapServiceList.splice(idx[1], 1);
        
        //verify layers loaded
        if (this._dynamicService.loaded && this._tiledService.loaded) {
            //console.log('layers immediately loaded');
            this.layersLoaded();
        } else {
            if (!this._dynamicService.loaded) {
                //console.log('waiting on dynamic service');
                dojo.connect(this._dynamicService, "onLoad", this, function(service){
                    //console.log(service.id+' loaded');
                    this.layersLoaded();
                });
            }
            
            if (!this._tiledService.loaded) {
                //console.log('waiting on tiled service');
                dojo.connect(this._tiledService, "onLoad", this, function(service){
                    //console.log(service.id+' loaded');
                    this.layersLoaded();
                });
            }
        }
    } //end constructor function
});


