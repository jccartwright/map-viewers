require(
    [
        "esri/config", "ngdc/Logger", "app/AppMapConfig",
        "app/AppLayerCollection", "esri/geometry/Extent", "esri/geometry/webMercatorUtils",
        "dojo/_base/config", "dojo/io-query", "dojo/_base/lang", "dojo/dom", "dojo/_base/fx",
        "dijit/layout/BorderContainer", "dijit/layout/ContentPane", "dijit/registry", "dojo/dom-style",
        "dijit/form/Button", "dijit/form/ToggleButton", 
        "dijit/TooltipDialog", "dijit/popup",
        "dojo/topic", "dojo/on", "dojo/aspect", "dojo/parser", "dojo/domReady!"
    ],
    function(esriConfig, Logger, AppMapConfig,
             AppLayerCollection, Extent, webMercatorUtils,
             config, ioQuery, lang, dom, baseFx,
             BorderContainer, ContentPane, registry, domStyle,
             Button, ToggleButton, 
             TooltipDialog, popup,
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

        var rncTooltip = new TooltipDialog({
            id: 'rncTooltip',
            content: '<a href="http://www.nauticalcharts.noaa.gov/mcd/Raster" target="_blank">NOAA Raster Navigational Charts</a>',
            onMouseLeave: function(){
                popup.close(rncTooltip);
            }
        });

        var tooltipTimeout;
        var mouseLeaveTimeout;
        var toggleRnc = dom.byId('toggleRnc')
        //Show the tooltip 1 sec after entering the toggle button
        on(toggleRnc, 'mouseenter', function(){
            tooltipTimeout = setTimeout(function() {
                popup.open({
                    popup: rncTooltip,
                    around: dom.byId('toggleRnc')
                });
            }, 1000);
        });

        //Hide the tooltip when toggle button is clicked
        on(toggleRnc, 'click', function(){
            clearTimeout(tooltipTimeout);
            popup.close(rncTooltip);
        });  

        //Hide the tooltip 1 sec after leaving the toggle button
        on(toggleRnc, 'mouseleave', function(){
            mouseLeaveTimeout = setTimeout(function() {
                popup.close(rncTooltip);
            }, 1000);
        }); 

        //Keep showing the tooltip when the tooltip is entered
        on(rncTooltip.domNode, 'mouseenter', function(){
            clearTimeout(mouseLeaveTimeout);
        });        

        //Get the survey ID and extent in lat/lon from the URL params
        if (queryParams.survey && queryParams.xmin && queryParams.ymin && queryParams.xmax && queryParams.ymax) { 
            var surveyExtent = new Extent(queryParams.xmin, queryParams.ymin, queryParams.xmax, queryParams.ymax, {
                spatialReference:{wkid:4326}
            });

            //create Map and add layers
            var mapConfig = new AppMapConfig("mapDiv", {
                //extent/fitExtent properties don't work properly (sometimes zooms out too far). Give it a dummy extent and call setExtent later
                center: [0,0],
                zoom: 3,
                surveyExtent: webMercatorUtils.geographicToWebMercator(surveyExtent),
                logo: false,
                showAttribution: false,
                survey: queryParams.survey
            }, new AppLayerCollection());
        }
        else {
            domStyle.set(registry.byId('toggleRnc').domNode, 'display', 'none');
            dom.byId('centerPane').innerHTML = 'Map disabled. Please provide survey, xmin, ymin, xmax, and ymax parameters.';
        }
    }
);