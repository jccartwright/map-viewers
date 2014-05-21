define(["dojo/_base/declare","dojo/_base/config", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/text!./templates/HelpPanel.html"],
    function(declare, config, _WidgetBase, _TemplatedMixin, template){
        return declare([_WidgetBase, _TemplatedMixin], {
            // Our template - important!
            templateString: template,
            // A class to be applied to the root node in our template
            baseClass: "helpPanel",

            constructor: function() {
                this.magnifyingGlassIconUrl = config.app.ngdcDijitsUrl+"/identify/images/magnifying-glass.png";
            }
        });
    }
);