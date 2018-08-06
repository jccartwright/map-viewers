var app;

require(["esri/Map",
  "esri/views/MapView",
  "esri/views/SceneView",
  "esri/widgets/Search",
  "esri/core/watchUtils",
  "esri/layers/TileLayer",
  "esri/layers/MapImageLayer",
  "esri/layers/GroupLayer",
  "esri/layers/FeatureLayer",
  "esri/layers/ImageryLayer",
  "esri/tasks/QueryTask", 
  "esri/tasks/support/Query",
  "esri/Ground",
  "dojo/query",
  "dojo/on",
  "dojo/dom-class",

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
    MapView, 
    SceneView, 
    Search, 
    watchUtils, 
    TileLayer,
    MapImageLayer,
    GroupLayer,
    FeatureLayer,
    ImageryLayer, 
    QueryTask,
    Query,
    Ground,
    query,
    on,
    domClass,
    CalciteMaps, 
    CalciteMapsArcGIS) {
    
    // App
    app = {
        zoom: 3,
        center: [-100,20],
        basemap: "satellite",
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
        containerScene: "sceneViewDiv",
        loadingIconEnabled: true,
        boundariesLabelsVisible: true
    };

    var viirsDailyLayer = new ImageryLayer({
        url: "https://gis.ngdc.noaa.gov/arcgis/rest/services/NPP_VIIRS_DNB/Daily_Radiance/ImageServer",
        opacity: 0.9,
        format: "jpg",
        popupTemplate: { // autocasts as new PopupTemplate()
            title: "Radiance",
            content: "{Raster.ServicePixelValue} nanowatts/cm²/sr"
        },
        renderingRule: null //this causes it to work the way we want. The default processing template for the service is "Stretch_SquareRoot_Grayscale". But, when identifying, we don't want the grayscale (0-255) value returned.
    });

    var referenceLayer = new TileLayer({
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer",
        opacity: 0.5
    });

    var countriesImageLayer = new MapImageLayer({
        url: "https://gis.ngdc.noaa.gov/arcgis/rest/services/reference/world_countries_overlay/MapServer",
        visible: false,
        opacity: 0.5
    });

    var citiesLayer0 = new FeatureLayer({
        portalItem: {id: "eaf94590d1554b7690608c64db027ead"},
        layerId: 0,
        popupEnabled: false
    });
    var citiesLayer1 = new FeatureLayer({
        portalItem: {id: "eaf94590d1554b7690608c64db027ead"},
        layerId: 1,
        popupEnabled: false
    });
    var citiesLayer2 = new FeatureLayer({
        portalItem: {id: "eaf94590d1554b7690608c64db027ead"},
        layerId: 2,
        popupEnabled: false
    });
    var citiesLayer3 = new FeatureLayer({
        portalItem: {id: "eaf94590d1554b7690608c64db027ead"},
        layerId: 3,
        popupEnabled: false
    });
    var citiesLayer4 = new FeatureLayer({
        portalItem: {id: "eaf94590d1554b7690608c64db027ead"},
        layerId: 4,
        popupEnabled: false
    });
    var citiesLayer5 = new FeatureLayer({
        portalItem: {id: "eaf94590d1554b7690608c64db027ead"},
        layerId: 5,
        popupEnabled: false
    });
    var citiesLayer6 = new FeatureLayer({
        portalItem: {id: "eaf94590d1554b7690608c64db027ead"},
        layerId: 6,
        popupEnabled: false
    });

    var citiesGroupLayer = new GroupLayer({
        layers: [citiesLayer0, citiesLayer1, citiesLayer2, citiesLayer3, citiesLayer4, citiesLayer5, citiesLayer6],
        visible: false,
        opacity: 0.5
    });

    // Map 
    app.map = new Map({
        basemap: app.basemap,
        ground: new Ground({
            layers: [] //Initialize with an empty ground layer. Prevents unneeded calls to the elevation service.
        }),
        layers: [viirsDailyLayer, referenceLayer, countriesImageLayer, citiesGroupLayer]
    });

    // 3D View
    app.sceneView = new SceneView({
        container: null,
        //container: app.containerScene, // activate
        map: app.map,
        zoom: app.zoom,
        center: app.center,
        padding: app.viewPadding,
        ui: {
            padding: app.uiPadding
        },
        popup: {
          actions: []
        },
        environment: {
            atmosphereEnabled: false
        }
    });

    // 2D View
    app.mapView = new MapView({
        //container: null,
        container: app.containerMap, // activate
        map: app.map,
        zoom: app.zoom,
        center: app.center,
        padding: app.viewPadding,
        ui: {
            components: ["zoom", "attribution"],
            padding: app.uiPadding
        },
        constraints: {
            rotationEnabled: false
        },
        popup: {
          actions: []
        }
    });

    // Display popup when the layer view loads
    // app.mapView.whenLayerView(viirsDailyLayer).then(function(layerView) {
    //     watchUtils.whenFalseOnce(layerView, "updating", function(newVal) {
    //         app.mapView.popup.open({
    //             title: "VIIRS Daily Radiance",
    //             content: "Click anywhere on the map to view the radiance at that location.",
    //             location: app.mapView.center
    //         });
    //     });
    // });

    // Active view is map
    setActiveView(app.mapView);

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
    // query("#selectBasemapPanel").on("change", function(e){
    //     app.mapView.map.basemap = e.target.options[e.target.selectedIndex].dataset.vector;
    //     app.sceneView.map.basemap = e.target.value;
    // });  

    // Tab UI - switch views
    query(".calcite-navbar li a[data-toggle='tab']").on("click", function(e) {
        if (e.target.text.indexOf("Map") > -1) {
            syncViews(app.sceneView, app.mapView);
            app.mapView.viewpoint.rotation = 0; //always reset the mapView's rotation to 0
            setActiveView(app.mapView);
        } else {
            syncViews(app.mapView, app.sceneView);
            setActiveView(app.sceneView);
        }
        toggleBoundariesLabels(app.boundariesLabelsVisible);
        syncSearch(app.activeView);
    }); 

    var opacitySlider = query("#opacitySlider");
    on(opacitySlider, "input", function() {
        var opacity = document.getElementById("opacitySlider").value;
        document.getElementById("opacityText").innerHTML = opacity + '%';
        viirsDailyLayer.opacity = opacity / 100.0;
    });
    on(opacitySlider, "mousedown", function() {
        console.log("mousedown");
        app.loadingIconEnabled = false;
    });
    on(opacitySlider, "mouseup", function() {
        console.log("mouseup");
        app.loadingIconEnabled = true;
    });

    query("#chkBoundariesLabels").on("click", function(e) {
        var checked = e.target.checked;
        toggleBoundariesLabels(checked);
    });

    //After the VIIRS layer loads, get the available date range and initialize the slider
    viirsDailyLayer.when(getDateRangeAndSetupSlider(viirsDailyLayer));

    app.sceneView.watch("updating", function(updating) {
        console.log("sceneView updating: " + updating);
        if (updating && app.loadingIconEnabled) {
            showLoading();
        } else {
            hideLoading();
        }
    });
    app.mapView.watch("updating", function(updating) {
        if (updating && app.loadingIconEnabled) {
            showLoading();
        } else {
            hideLoading();
        }
    });
    app.sceneView.watch("stationary", function(stationary) {
        console.log("sceneView stationary: " + stationary);
        if (stationary) {
            if (app.sceneView.updating) {
                showLoading();
            }
            app.loadingIconEnabled = true;
        } else {
            hideLoading();
            app.loadingIconEnabled = false;
        }
    });
    app.mapView.watch("stationary", function(stationary) {
        if (stationary) {
            if (app.mapView.updating) {
                showLoading();
            }
            app.loadingIconEnabled = true;
        } else {
            hideLoading();
            app.loadingIconEnabled = false;
        }
    });

    app.mapView.watch("ready", function(ready) {
        console.log('mapView ready: ' + ready);
        viirsDailyLayer.visible = false;
        window.setTimeout(function() { 
            viirsDailyLayer.visible = true; 
        }, 1000);
    });

    // app.mapView.watch("container", function(container) {
    //     console.log('mapView container: ' + container);
    // });
    // app.sceneView.watch("ready", function(ready) {
    //     console.log('sceneView ready: ' + ready);
    //     viirsDailyLayer.visible = false;
    //     window.setTimeout(function() { 
    //         viirsDailyLayer.visible = true; 
    //     }, 0);
    // });

    function toggleBoundariesLabels(visible) {
        app.boundariesLabelsVisible = visible;
        if (app.activeView === app.mapView) {
            referenceLayer.visible = visible;
            countriesImageLayer.visible = false;
            citiesGroupLayer.visible = false;
        } else {
            referenceLayer.visible = false;
            countriesImageLayer.visible = visible;
            citiesGroupLayer.visible = visible;
        }
    }

    function showLoading() {
        domClass.add("loader", "is-active");
    }

    function hideLoading() {
        domClass.remove("loader", "is-active");
    }

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
        //viirsDailyLayer.refresh();
        // viirsDailyLayer.visible = false;
        // window.setTimeout(function() { 
        //     viirsDailyLayer.visible = true; 
        // }, 3000);
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
            var days = results.features;
            setupTimeSlider(days);

            var timeSlider = query("#timeSlider");
            var leftButton = query("#timeSliderLeftButton");
            var rightButton = query("#timeSliderRightButton");

            on(timeSlider, "change", function() {
                updateTime(days);   
            });
            on(timeSlider, "input", function() {
                var index = parseInt(document.getElementById("timeSlider").value);
                var dateText = days[index].attributes['Day'];
                document.getElementById("dateText").innerHTML = formatDateText(dateText);
            });
            on(leftButton, "click", function() {
                console.log("left clicked");
                document.getElementById("timeSlider").value = parseInt(document.getElementById("timeSlider").value) - 1;
                updateTime(days);
            });
            on(rightButton, "click", function() {
                console.log("right clicked");
                document.getElementById("timeSlider").value = parseInt(document.getElementById("timeSlider").value) + 1;
                updateTime(days);
            });
        });
    }

    function updateTime(days) {
        var index = parseInt(document.getElementById("timeSlider").value);
        var dateText = days[index].attributes['Day'];
        document.getElementById("dateText").innerHTML = formatDateText(dateText);
        updateImageryLayer(dateText);   
    }

    function formatDateText(dateText) {
        return dateText.substring(0, 4) + '/' + dateText.substring(4, 6) + '/' + dateText.substring(6, 8);
    }

    function setupTimeSlider(features) {
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
    }
});