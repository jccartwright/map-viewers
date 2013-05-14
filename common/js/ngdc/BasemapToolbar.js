define(["dojo/_base/declare","dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin",
        "dijit/_OnDijitClickMixin", "dijit/Toolbar", "dijit/form/Button", "dojo/_base/lang", "dojo/_base/array",
        "dijit/form/DropDownButton", "dijit/Menu", "dijit/ToolbarSeparator", "dijit/MenuItem", "dijit/CheckedMenuItem",
        "dojo/_base/connect", "dojo/on", "dojo/text!./templates/BasemapToolbar.html"],
    function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _OnDijitClickMixin, Toolbar, Button, lang,
             array, DropDownButton, Menu, ToolbarSeparator, MenuItem, CheckedMenuItem, Connect, on, template ){
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _OnDijitClickMixin], {

            templateString: template,
            _basemaps: null,
            _overlays: null,
            defaultBasemapIndex: 0,

            // A class to be applied to the root node in template
            baseClass: "basemapToolbar",
            layerCollection: null,

            //constructor for parent called before constructor of child class
            constructor: function(arguments) {
                this.layerCollection = arguments.layerCollection;
            },

            showBasemap: function(selectedIndex) {
                //only one basemap showing at a time
                array.forEach(this._basemaps, function(basemap, idx) {
                    if (selectedIndex == idx) {
                        array.forEach(basemap.services, function(targetId){
                            this.layerCollection.getLayerById(targetId).setVisibility(true);
                            this.basemapMenu.getChildren()[idx].containerNode.style.fontWeight = "bold";
                        }, this);
                    } else {
                        array.forEach(basemap.services, function(targetId){
                            this.layerCollection.getLayerById(targetId).setVisibility(false);
                            this.basemapMenu.getChildren()[idx].containerNode.style.fontWeight = "normal";
                        }, this);
                    }
                }, this);
            },

            toggleOverlay: function(selectedIndex) {
                var layers = this._overlays[selectedIndex].services;
                array.forEach(layers, function(targetId){
                    var layer = this.layerCollection.getLayerById(targetId);
                    layer.setVisibility(! layer.visible);
                }, this);
            },

            postCreate: function() {
                //this.inherited(arguments);

                //add menu items to basemap menu
                array.forEach(this._basemaps, function(item, idx) {
                    this._addBasemapMenuItem(this.basemapMenu, item, idx, this);
                }, this);

                //add menu items to overlay menu
                array.forEach(this._overlays, function(item, idx) {
                    this._addOverlayMenuItem(this.overlayMenu, item, idx, this);
                }, this);
            },

            _addBasemapMenuItem: function(menu, item, idx, parent) {
                menu.addChild(new MenuItem({
                    label: item.label,
                    onClick: function() {
                        parent.showBasemap(idx);
                    }
                }));
            },

            _addOverlayMenuItem: function(menu, item, idx, parent) {
                var layer = this.layerCollection.getLayerById(item.services[0]);
                menu.addChild(new CheckedMenuItem({
                    label: item.label,
                    checked: layer.visible,
                    onClick: function() {
                        parent.toggleOverlay(idx);
                    }
                }));
            },

            _validateLayerIds: function() {
                //validate config by verifying each of the service ids are in LayerCollection
                var allLayerIds = this.layerCollection.getLayerIds();
                array.forEach(this._basemaps, function(basemap) {
                    array.forEach(basemap.services, function(targetId){
                        if (array.indexOf(allLayerIds, targetId) < 0) {
                            console.error("BasemapToolbar configuration error: layer "+targetId+" not found in LayerCollection");
                        }
                    });
                });

                array.forEach(this._overlays, function(overlay) {
                    array.forEach(overlay.services, function(targetId){
                        if (array.indexOf(allLayerIds, targetId) < 0) {
                            console.error("BasemapToolbar configuration error: overlay "+targetId+" not found in LayerCollection");
                        }
                    });
                });
            }
        });
    }
);
/*

        //Enable/disable the Boundaries/Labels checkbox
        if (this.basemaps[index].boundariesEnabled) {
            var menuItem = this._overlayMenu.getChildren()[this.boundariesIndex];
            menuItem.set('disabled', false);
            if (menuItem.checked) {
                this.setOverlayVisibility(this.boundariesIndex, true);
            }
        } else {
            this._overlayMenu.getChildren()[this.boundariesIndex].set('disabled', true);
            this.setOverlayVisibility(this.boundariesIndex, false);
        }

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
*/