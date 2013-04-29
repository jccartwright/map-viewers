define(["dojo/_base/declare","dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin",
        "dijit/_OnDijitClickMixin", "dijit/Toolbar", "dijit/form/Button", "dojo/_base/lang", "dojo/_base/array", "dojo/aspect",
        "dojo/topic", "dijit/form/DropDownButton", "dijit/Menu", "dijit/ToolbarSeparator", "dijit/MenuItem", "dijit/CheckedMenuItem",
        "dojo/_base/connect", "dojo/topic", "dojo/on", "dojo/text!./templates/BasemapToolbar.html"],
    function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _OnDijitClickMixin, Toolbar, Button, lang,
             array, aspect, topic, DropDownButton, Menu, ToolbarSeparator, MenuItem, CheckedMenuItem, Connect, topic, on, template ){
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _OnDijitClickMixin], {

            templateString: template,
            _basemaps: null,
            _overlays: null,
            defaultBasemapIndex: 0,


            // A class to be applied to the root node in template
            baseClass: "basemapToolbar",
            layerCollection: null,

            constructor: function(arguments) {
                this.layerCollection = arguments.layerCollection;

                //console.log(this.layerCollection);
                //bring in the (potentially custom) configuration
                this.init();
                this._validateLayerIds();

                //messaging w/in module bit of a hack to avoid scoping complications
                topic.subscribe("/ngdc/showBasemap", lang.hitch(this, this.showBasemap));
                topic.subscribe("/ngdc/toggleOverlay", lang.hitch(this, this.toggleOverlay));

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
                    this._addBasemapMenuItem(this.basemapMenu, item, idx);
                }, this);

                //add menu items to overlay menu
                array.forEach(this._overlays, function(item, idx) {
                    this._addOverlayMenuItem(this.overlayMenu, item, idx);
                }, this);

                topic.publish("/ngdc/showBasemap", this.defaultBasemapIndex);
            },

            _addBasemapMenuItem: function(menu, item, idx) {
                menu.addChild(new MenuItem({
                    label: item.label,
                    onClick: function() {
                        topic.publish("/ngdc/showBasemap", idx);
                    }
                }));
            },

            _addOverlayMenuItem: function(menu, item, idx) {
                var layer = this.layerCollection.getLayerById(item.services[0]);
                menu.addChild(new CheckedMenuItem({
                    label: item.label,
                    checked: layer.visible,
                    onClick: function() {
                        topic.publish("/ngdc/toggleOverlay", idx);
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

            },

            //define the configuration for the toolbar. override for custom selection of basemaps, overlays
            init: function() {
                //TODO redesign this data structure
                this._basemaps = [
                    {services: ['Ocean Basemap'], label: 'Ocean Basemap (Esri)', boundariesEnabled: false},
                    {services: ['GEBCO_08 (tiled)'], label: 'Shaded Relief (GEBCO_08)', boundariesEnabled: true},
                    {services: ['ETOPO1 (tiled)'], label: 'Shaded Relief (ETOPO1)', boundariesEnabled: true},
                    {services: ['Light Gray', 'Light Gray Reference'], label: 'Light Gray (Esri)', boundariesEnabled: false},
                    //{services: ['World Imagery'], label: 'Imagery (Esri)', boundariesEnabled: true},
                    {services: ['NatGeo Overview'], label: 'National Geographic (Esri)', boundariesEnabled: false}
                ];

                this._overlays = [
                    {services: ['World Boundaries and Places'], label: 'Boundaries/Labels'},
                    {services: ['Graticule'], label: 'Graticule'}
                ];

                //define the default base
                this.defaultBasemapIndex = 2;
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