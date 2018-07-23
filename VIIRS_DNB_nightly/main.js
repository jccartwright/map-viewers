var app;

require(["esri/Map",
  "esri/Basemap",
  "esri/views/MapView",
  "esri/views/SceneView",
  "esri/widgets/Search",
  "esri/core/watchUtils",
  "esri/layers/ImageryLayer",
  "esri/layers/support/RasterFunction",
  "esri/tasks/QueryTask", 
  "esri/tasks/support/Query",
  "esri/layers/support/MosaicRule",
  "esri/core/watchUtils",
  "dojo/query",
  "dojo/_base/array",
  "dojo/on",
  "dijit/form/HorizontalSlider",

  // Calcite-maps
  "calcite-maps/calcitemaps-v0.7",
  "calcite-maps/calcitemaps-arcgis-support-v0.7",

  // Bootstrap
  "bootstrap/Collapse", 
  "bootstrap/Dropdown",
  "bootstrap/Tab",      

  "dojo/domReady!"
], function(
    Map, 
    Basemap, 
    MapView, 
    SceneView, 
    Search, 
    watchUtils, 
    ImageryLayer, 
    RasterFunction,
    QueryTask,
    Query,
    MosaicRule,
    watchUtils,
    query,
    array,
    on,
    HorizontalSlider,
    CalciteMaps, 
    CalciteMapsArcGIS) {
    
    // App
    app = {
        zoom: 1,
        center: [-40,40],
        basemap: "hybrid",
        viewPadding: {
            top: 50, bottom: 0
        },
        uiPadding: {
            top: 15, bottom: 15
        },
        map: null,
        mapView: null,
        sceneView: null,
        activeView: null,
        searchWidgetNav: null,
        containerMap: "mapViewDiv",
        containerScene: "sceneViewDiv"
    };

    var viirsDailyLayer = new ImageryLayer({
        url: "https://gis.ngdc.noaa.gov/arcgis/rest/services/NPP_VIIRS_DNB/Daily_Radiance/ImageServer",
        opacity: 0.85,
        format: "jpg",
        popupTemplate: { // autocasts as new PopupTemplate()
            title: "Radiance",
            content: "{Raster.ServicePixelValue} nanowatts/cm²/sr"
        },
        renderingRule: null //this causes it to work the way we want. The default processing template for the service is "Stretch_SquareRoot_Grayscale". But, when identifying, we don't want the grayscale (0-255) value returned.

        // renderingRule: new RasterFunction({
        //     functionName: "None"
        // })
    });

    // Map 
    app.map = new Map({
        basemap: app.basemap,
        ground: "world-elevation",
        layers: [viirsDailyLayer]
    });

    // 2D View
    app.mapView = new MapView({
        container: null, // deactivate
        map: app.map,
        zoom: app.zoom,
        center: app.center,
        padding: app.viewPadding,
        ui: {
            components: ["zoom", "compass", "attribution"],
            padding: app.uiPadding
        },
        popup: {
          actions: []
        }
    });

    // 3D View
    app.sceneView = new SceneView({
        container: app.containerScene, // activate
        map: app.map,
        zoom: app.zoom,
        center: app.center,
        padding: app.viewPadding,
        ui: {
            padding: app.uiPadding
        },
        popup: {
          actions: []
        }
    });

    // Display popup when the layer view loads
    app.sceneView.whenLayerView(viirsDailyLayer).then(function(layerView) {
        watchUtils.whenFalseOnce(layerView, "updating", function(newVal) {
            app.sceneView.popup.open({
                title: "VIIRS Daily Radiance",
                content: "Click anywhere on the map to view the radiance at that location.",
                location: app.sceneView.center
            });
        });
    });

    // Active view is scene
    setActiveView(app.sceneView);

    // Create search widget
    app.searchWidgetNav = new Search({
        container: "searchNavDiv",
        view: app.activeView
    });

    // Wire-up expand events
    CalciteMapsArcGIS.setSearchExpandEvents(app.searchWidgetNav);
    CalciteMapsArcGIS.setPopupPanelSync(app.mapView);
    CalciteMapsArcGIS.setPopupPanelSync(app.sceneView);

    // Menu UI - change Basemaps
    query("#selectBasemapPanel").on("change", function(e){
        app.mapView.map.basemap = e.target.options[e.target.selectedIndex].dataset.vector;
        app.sceneView.map.basemap = e.target.value;
    });  

    // Tab UI - switch views
    query(".calcite-navbar li a[data-toggle='tab']").on("click", function(e) {
        if (e.target.text.indexOf("Map") > -1) {
            syncViews(app.sceneView, app.mapView);
            setActiveView(app.mapView);
        } else {
            syncViews(app.mapView, app.sceneView);
            setActiveView(app.sceneView);
        }
        syncSearch(app.activeView);
    }); 

    var opacitySlider = query("#opacitySlider");
    on(opacitySlider, "input", function() {
        var opacity = document.getElementById("opacitySlider").value;
        document.getElementById("opacityText").innerHTML = opacity + '%';
        viirsDailyLayer.opacity = opacity / 100.0;
    });

    viirsDailyLayer.when(getDateRangeAndSetupSlider(viirsDailyLayer));

    // app.sceneView.watch("updating", function(updating) {
    //     console.log('updating: ' + updating);
    // });

    // Views
    function syncViews(fromView, toView) {
        var viewPt = fromView.viewpoint.clone();
        fromView.container = null;
        if (fromView.type === "3d") {          
            toView.container = app.containerMap;
        } else {
            toView.container = app.containerScene;
        }
        toView.viewpoint = viewPt;
        toView.padding = app.viewPadding;
    }

    // Search Widget
    function syncSearch(view) {
        app.searchWidgetNav.view = view;
        if (app.searchWidgetNav.selectedResult) {
            watchUtils.whenTrueOnce(view,"ready",function(){
                app.searchWidgetNav.autoSelect = false;
                app.searchWidgetNav.search(app.searchWidgetNav.selectedResult.name);
                app.searchWidgetNav.autoSelect = true;            
            });
        }
    }

    // Active view
    function setActiveView(view) {
        app.activeView = view;
        viirsDailyLayer.refresh();
    }

    //Get the list of unique days from the image service and setup the time slider accordingly
    function getDateRangeAndSetupSlider(layer) {
        var queryTask = new QueryTask({url: layer.url});
        var myQuery = new Query();
        myQuery.returnGeometry = false;
        myQuery.outFields = ["Day"];
        myQuery.orderByFields = ["Day"];
        myQuery.returnDistinctValues = true;

        queryTask.execute(myQuery).then(function(results) {
            setupTimeSlider(results.features);

            var timeSlider = query("#timeSlider");
            on(timeSlider, "change", function() {
                var index = parseInt(document.getElementById("timeSlider").value);
                var dateText = results.features[index].attributes['Day'];
                console.log(dateText);
                updateImageryLayer(dateText);
            });
            on(timeSlider, "input", function() {
                var index = parseInt(document.getElementById("timeSlider").value);
                var dateText = results.features[index].attributes['Day'];
                document.getElementById("dateText").innerHTML = formatDateText(dateText);
            });
        });
    }

    function formatDateText(dateText) {
        return dateText.substring(0, 4) + '/' + dateText.substring(4, 6) + '/' + dateText.substring(6, 8);
    }

    function setupTimeSlider(features) {
        console.log(features);
        var numDays = features.length;
        //var startDay = features[0].attributes['Day'];
        var endDay = features[numDays-1].attributes['Day'];
        document.getElementById("dateText").innerHTML = formatDateText(endDay);

        var timeSlider = query("#timeSlider")[0];
        timeSlider.max = numDays - 1;
        timeSlider.value = numDays - 1;
    }

    function updateImageryLayer(dateText) {
        viirsDailyLayer.mosaicRule.where = "Day = '" + dateText + "'";
        viirsDailyLayer.mosaicRule = viirsDailyLayer.mosaicRule;
        viirsDailyLayer.visible = viirsDailyLayer.visible;
        viirsDailyLayer.format = viirsDailyLayer.format;
        
        //viirsDailyLayer.refresh();
        //viirsDailyLayer.redraw();
    }
});