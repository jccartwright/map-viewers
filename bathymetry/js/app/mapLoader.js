require(
    [
        "esri/config", "ngdc/Logger", "app/AppMapConfig",
        "app/CreditsPanel", "app/AppLayerCollection",
        "dojo/_base/config", "dojo/io-query", "dojo/_base/lang", "dojo/dom", "dojo/_base/fx",
        "dijit/layout/BorderContainer", "dijit/layout/ContentPane", "dijit/layout/AccordionContainer", "dijit/form/CheckBox", "dijit/registry",
        "dijit/form/Button", "dijit/form/RadioButton",
        "ngdc/MapToolbar", "ngdc/BasemapToolbar",
        "dojo/topic", "dojo/on", "dojo/aspect", "dojo/parser", "dojo/domReady!"
    ],
    function(esriConfig, Logger, AppMapConfig,
             CreditsPanel, AppLayerCollection,
             config, ioQuery, lang, dom, baseFx,
             BorderContainer, ContentPane, AccordionContainer, CheckBox, registry,
             Button, RadioButton,
             MapToolbar, BasemapToolbar,
             topic, on, aspect, parser) {
        parser.parse();

        esriConfig.defaults.io.corsEnabledServers = ["http://maps.ngdc.noaa.gov/arcgis/rest/services", "http://agsdevel.ngdc.noaa.gov/arcgis/rest/services"];

        //add queryParams into config object, values in queryParams take precedence
        var queryParams = ioQuery.queryToObject(location.search.substring(1));
        lang.mixin(config.app, queryParams);

        //put the logger into global so all modules have access
        window.logger = new Logger(config.app.loglevel);

        //fade out the loader, exposing the layout
        var loader = dom.byId("loader");
        baseFx.fadeOut({ node: loader, duration: 500, onEnd: function(){ loader.style.display = "none"; }}).play();

        //create Map and add layers
        var mapConfig = new AppMapConfig("mapDiv", {
            center:[-45,45],
            zoom: 3,
            logo: false,
            showAttribution: false,
            overview: true,
            sliderStyle: 'large'
        }, new AppLayerCollection());
    }
);