define([
    'dojo/_base/declare',
    'dijit/registry',
    'dojo/dom',
    'dojo/_base/config',
    'dojo/io-query',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/on',
    'dojo/aspect',
    'dojo/dom-style',
    'dojo/dom',
    'dijit/form/CheckBox',
    'dijit/TooltipDialog',
    'dijit/popup',
    'esri/config',
    'esri/geometry/Extent',
    'esri/geometry/webMercatorUtils',
    'esri/SpatialReference',
    'ngdc/Logger',
    'app/MapConfig',
    'app/LayerCollection',
    'dojo/domReady!'],
    function(
        declare,
        registry,
        dom,
        config,
        ioQuery,
        lang,
        topic,
        on,
        aspect,
        domStyle,
        dom,
        CheckBox,
        TooltipDialog,
        popup,
        esriConfig,
        Extent,
        webMercatorUtils,
        SpatialReference,
        Logger,
        MapConfig,
        LayerCollection
        ) {

        return declare(null, {

            constructor: function(args){
                declare.safeMixin(this,args);
                this.overlayNode = dom.byId(this.overlayNodeId);
            },

            init: function() {
                esriConfig.defaults.io.corsEnabledServers = [
                    '//maps.ngdc.noaa.gov/arcgis/rest/services',
                    '//mapdevel.ngdc.noaa.gov/arcgis/rest/services'];

                //put the logger into global so all modules have access
                window.logger = new Logger(config.app.loglevel);

                //add queryParams into config object, values in queryParams take precedence
                var queryParams = ioQuery.queryToObject(location.search.substring(1));
                lang.mixin(config.app, queryParams);

                //Get the survey ID and extent in lat/lon from the URL params
                if (queryParams.survey && queryParams.xmin && queryParams.ymin && queryParams.xmax && queryParams.ymax) { 
                    var surveyExtent = new this.clampExtentTo85(Extent(queryParams.xmin, queryParams.ymin, queryParams.xmax, queryParams.ymax, {
                        spatialReference:{wkid:4326}
                    }));

                    var webMercatorExtent = webMercatorUtils.geographicToWebMercator(surveyExtent);
                    if (webMercatorExtent.xmax < webMercatorExtent.xmin) {
                        var worldWidth = 40075014.13432359; //Width of the map in Web Mercator
                        webMercatorExtent.xmin -= worldWidth;
                    }

                    //create Map and add layers
                    var mapConfig = new MapConfig("mapDiv", {
                        //extent/fitExtent properties don't work properly (sometimes zooms out too far). Give it a dummy extent and call setExtent later
                        center: [0,0],
                        zoom: 3,
                        surveyExtent: webMercatorExtent,
                        logo: false,
                        showAttribution: false,
                        survey: queryParams.survey,
                        noElevation: true
                    }, new LayerCollection());
                }
                else {
                    domStyle.set(registry.byId('toggleGmrt').domNode, 'display', 'none');
                    dom.byId('centerPane').innerHTML = 'Map disabled. Please provide survey, xmin, ymin, xmax, and ymax parameters.';
                }

                var gmrtTooltip = new TooltipDialog({
                    id: 'gmrtTooltip',
                    content: '<a href="http://www.marine-geo.org/portals/gmrt/" target="_blank">Global Multi-Resolution Topography Synthesis, Lamont-Doherty Earth Observatory</a>',
                    onMouseLeave: function(){
                        popup.close(gmrtTooltip);
                    }
                });

                var tooltipTimeout;
                var mouseLeaveTimeout;
                var toggleGmrt = registry.byId('toggleGmrt')
                //Show the tooltip 1/2 sec after entering the toggle button
                on(toggleGmrt, 'mouseenter', lang.hitch(this, function() {
                    tooltipTimeout = setTimeout(lang.hitch(this, function() {
                        popup.open({
                            popup: gmrtTooltip,
                            around: toggleGmrt.domNode
                        });
                    }), 500);
                }));

                //Hide the tooltip when toggle button is clicked
                on(toggleGmrt, 'click', lang.hitch(this, function() {
                    clearTimeout(tooltipTimeout);
                    popup.close(gmrtTooltip);
                }));  

                //Hide the tooltip 1 sec after leaving the toggle button
                on(toggleGmrt, 'mouseleave', lang.hitch(this, function() {
                    mouseLeaveTimeout = setTimeout(function() {
                        popup.close(gmrtTooltip);
                    }, 1000);
                })); 

                //Keep showing the tooltip when the tooltip is entered
                on(gmrtTooltip.domNode, 'mouseenter', lang.hitch(this, function() {                    
                    setTimeout(function() {
                        //short timeout to make sure this happens after the above mouseleave event
                        clearTimeout(mouseLeaveTimeout);
                    }, 50);
                }));   
            },

            //Ensure the extent doesn't go beyond the bounds of the Mercator map (85 N/S)
            clampExtentTo85: function(extent) {
                if (extent.ymax > 85) {
                    extent.ymax = 85;
                }
                if (extent.ymin > 85) {
                    extent.ymin = 85;
                }
                if (extent.ymax < -85) {
                    extent.ymax = -85;
                }
                if (extent.ymin < -85) {
                    extent.ymin = -85;
                }
                return extent;
            },
        });
    }
);
