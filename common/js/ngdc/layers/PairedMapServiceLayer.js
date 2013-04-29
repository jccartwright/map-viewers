define(["dojo/_base/declare", "dojo/_base/array", "esri/layers/layer", "dojo/_base/connect"],
    function(declare, array, Layer, Connect) {
        //constructor options
        var id; //required
        var loaded = false;
        var opacity = 1.0;
        var url;
        var visible = true;
        var layerDefinitions;
        var visibleLayers;

        //internal state
        var _active;
        var _isDynamic = false;
        var _cutoffZoom = 5;
        var _dynamicService; //required, esri.layers.ArcGISDynamicMapServiceLayer
        var _tiledService;   //required, esri.layers.ArcGISTiledMapServiceLayer
        var _map;

        return declare([Layer], {
            constructor: function(params, map) {
                this._map = map;

                //options allowed in the constructor
                //TODO why should params ever be null?
                params = params || {};
                this.id = params.id;
                this._dynamicService = params.dynamicService;
                this._tiledService = params.tiledService;
                this._cutoffZoom = params.cutoffZoom;

                //TODO ??
                //based on values from layerInfos[], populated in layersLoaded()
                //opacity, visible, id seem to be set automatically. Why not others?
                this._defaultVisibleLayers = params.defaultVisibleLayers || [];

                Connect.connect(map, "onZoomEnd", this, function(extent, zoomFactor, anchor, level){
                    logger.debug('zoom level: '+level);
                    this._toggleService();
                });


                //verify layers loaded
                if (this._dynamicService.loaded && this._tiledService.loaded) {
                    this.layersLoaded();
                } else {
                    logger.warn("component layers in PairedMapServiceLayer not  loaded");
                }
            }, //end constructor function

            //called when both mapservices loaded
            layersLoaded: function () {
                if (this._dynamicService.loaded === false || this._tiledService.loaded === false) {
                    logger.warn('not ready yet...');
                    return;
                }

                //both layers loaded at this point;
                this.loaded = true;

                //The url field should always contain the dynamic service url.
                this.url = this._dynamicService.url;

                //maxRecordCount is the dynamic service's maxRecordCount.
                this.maxRecordCount = this._dynamicService.maxRecordCount;

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
                    array.forEach(this._dynamicService.layerInfos, function (layerInfo) {
                        if (layerInfo.defaultVisibility) {
                            this._defaultVisibleLayers.push(layerInfo.id);
                        }
                    }, this);
                }

                //set the initial active layer
                this._toggleService();
            },

            setVisibleLayers: function(ids){
                logger.debug('setting visibleLayers to ', ids);

                if (ids === null) {
                    logger.error("visibleLayers cannot be null");
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

            setLayerDefinitions: function(layerDefinitions){
                //console.log('setting layerDefinitions to ', layerDefinitions);
                //console.log(this._map.getLevel());

                //checks for both undefined and null via coercion
                if (layerDefinitions === null) {
                    logger.error('layerDefinitions cannot be null');
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


//defined in layers.Layer
            show: function(){
                //console.log('inside show: ', this._active);
                this.setVisibility(true);
            },


//defined in layers.Layer
            hide: function(){
                //console.log('inside hide:', this._active);
                this.setVisibility(false);
            },

//defined in layers.Layer
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

//defined in layers.Layer
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
                    this.logger.warn('visibleLayers is null');
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
                //logger.debug('inside _toggleService. level = ' + this._map.getLevel());

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
                logger.debug('activating tiled layer ' + this._tiledService.id + '...');

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
                logger.debug('activating dynamic layer ' + this._dynamicService.id + '...');

                this._active = this._dynamicService;
                this._isDynamic = true;
                this._tiledService.hide();

                if (this.visible) {
                    this._dynamicService.show();
                } else {
                    this._dynamicService.hide();
                }
                //this.url = this._dynamicService.url;
            }

        });
    }
);
