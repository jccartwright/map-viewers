define(["dojo/_base/declare","dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin",
        "dojo/_base/lang", "dojo/_base/connect", "dojo/topic", "dojo/on", "dijit/Destroyable",
        "dojo/text!./templates/CoordinatesToolbar.html"],
    function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, lang,
             Connect, topic, on, Destroyable, template ){
        return declare([Destroyable, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

            templateString: template,

            // A class to be applied to the root node in template
            baseClass: "coordinatesToolbar",
            _map: null,

            constructor: function(arguments) {
                this._map = arguments.map;
            },

            postCreate: function() {
                //TODO dispose of handle on unload
                var handle = topic.subscribe("/ngdc/mouseposition", lang.hitch(this, function(mapPoint) {
                    this.coordsDiv.innerHTML = mapPoint.x.toFixed(3) + ", " + mapPoint.y.toFixed(3);
                }));
            }
        });
    });


