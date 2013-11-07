dojo.provide('simple_basemap_toolbar.SimpleBasemapToolbar');

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.form.CheckBox');
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.DropDownButton");
dojo.require("dijit.Menu");
dojo.require("dijit.MenuItem");
dojo.require("dijit.CheckedMenuItem");

dojo.declare('simple_basemap_toolbar.SimpleBasemapToolbar', [dijit._Widget, dijit._Templated], {
	templatePath: dojo.moduleUrl('simple_basemap_toolbar', 'templates/SimpleBasemapToolbar.html'),
	widgetsInTemplate: true,
	basemaps: null,
	overlays: null,
	selectedBasemapIndex: 0,
	boundariesIndex: 0,
		
	constructor: function(params, srcNodeRef){
		this.selectBasemap = dojo.hitch(this, this.selectBasemap);
		this.toggleOverlay = dojo.hitch(this, this.toggleOverlay);
		
		dojo.subscribe("selectBasemap", this.selectBasemap);
		dojo.subscribe("toggleOverlay", this.toggleOverlay);
	},

	postCreate: function() {
		var i = 0;
		for (i = 0; i < this.basemaps.length; i++) {
			this._basemapMenu.addChild(new dijit.MenuItem({
				basemapIndex: i,
				label: this.basemaps[i].label,
				onClick: function(evt){
					//scope is the current MenuItem. Publish a message in order to call selectBasemap.
					dojo.publish('selectBasemap', [this.basemapIndex]);
				}
			}));	
		}
		
		for (i = 0; i < this.overlays.length; i++) {
			this._overlayMenu.addChild(new dijit.CheckedMenuItem({
				overlayIndex: i,
				label: this.overlays[i].label,
				checked: this.overlays[i].visible,
				onClick: function(evt){
					//scope is the current MenuItem. Publish a message in order to call toggleOverlay.
					dojo.publish('toggleOverlay', [this.overlayIndex]);
				}
			}));
			this.setOverlayVisibility(i, this._overlayMenu.getChildren()[i].checked);
		}
               
		this.selectBasemap(this.selectedBasemapIndex);
	},
		
	selectBasemap: function(index) {
		if (globals.debug) {
			console.log("selectBasemap " + index);
		}
		this.selectedBasemapIndex = index;
		
		var i = 0;
		for (i = 0; i < this.basemaps.length; i++) {
			if (i != index) {
				this.setBasemapVisibility(i, false);
				this._basemapMenu.getChildren()[i].containerNode.style.fontWeight = "normal";
			}
		}		
		this.setBasemapVisibility(index, true);
		this._basemapMenu.getChildren()[index].containerNode.style.fontWeight = "bold";
		
		//Enable/disable the Boundaries/Labels checkbox
		if (this.basemaps[index].boundariesEnabled) {
			var menuItem = this._overlayMenu.getChildren()[this.boundariesIndex];
			menuItem.set('disabled', false);	
			if (menuItem.checked) {
				this.setOverlayVisibility(this.boundariesIndex, true);
			}
		}
		else {
			this._overlayMenu.getChildren()[this.boundariesIndex].set('disabled', true);
			this.setOverlayVisibility(this.boundariesIndex, false);
		}
		
		//dojo.publish('/basemap/show',[this.basemaps[index]]);		
	},	
	
	toggleOverlay: function(index) {
		this.setOverlayVisibility(index, this._overlayMenu.getChildren()[index].checked);
	},
	
	setBasemapVisibility: function(index, value) {
		dojo.forEach(this.basemaps[index].services, function(service) {
			dojo.publish("/toc/layer/show", [{
				service: service.id,
				subLayers: service.subLayers || [],
				state: value
			}]);		
		});	
	},
	
	setOverlayVisibility: function(index, value) {
		dojo.forEach(this.overlays[index].services, function(service) {
			dojo.publish("/toc/layer/show", [{
				service: service.id,
				subLayers: service.subLayers || [],
				state: value
			}]);		
		});			
	}
});
