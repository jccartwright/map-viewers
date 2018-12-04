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
  "calcite-maps/calcitemaps-v0.8",
  "calcite-maps/calcitemaps-arcgis-support-v0.8",

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
        boundariesLabelsVisible: true,
        popupLon: 0,
        popupLat: 0
    };

    getPopupPosition = function() {
        //return the popup's lat/lon
        return Math.round(app.popupLon * 1000) / 1000 + ", " + Math.round(app.popupLat * 1000) / 1000;
    };

    var nightlyRadianceLayer = new ImageryLayer({
        url: "https://gis.ngdc.noaa.gov/arcgis/rest/services/NPP_VIIRS_DNB/Nightly_Radiance/ImageServer",
        opacity: 0.9,
        //visible: false,
        format: "jpg",
        popupTemplate: { // autocasts as new PopupTemplate()
            title: "Nightly Radiance",
            content: "{Raster.ServicePixelValue} nanowatts/cm²/sr<br>Location: {Name:getPopupPosition}" //hack to print the lat/lon of the click point. Get the Name attribute, which instead calls the getPopupPosition() function.
        },
        renderingRule: null //this causes it to work the way we want. The default processing template for the service is "Stretch_SquareRoot_Grayscale". But, when identifying, we don't want the grayscale (0-255) value returned.
    });

    var monthlyAvgRadianceLayer1 = new ImageryLayer({
        url: "https://gis.ngdc.noaa.gov/arcgis/rest/services/NPP_VIIRS_DNB/Monthly_AvgRadiance/ImageServer",
        opacity: 0.9,
        visible: false,
        format: "jpg",
        popupTemplate: { // autocasts as new PopupTemplate()
            title: "Monthly Average Radiance",
            content: "{Raster.ServicePixelValue} nanowatts/cm²/sr<br>Location: {Name:getPopupPosition}"
        },
        renderingRule: null //this causes it to work the way we want. The default processing template for the service is "Stretch_SquareRoot_Grayscale". But, when identifying, we don't want the grayscale (0-255) value returned.
    });

    var monthlyAvgRadianceLayer2 = new ImageryLayer({
        url: "https://gis.ngdc.noaa.gov/arcgis/rest/services/NPP_VIIRS_DNB/Monthly_AvgRadiance_StrayLightImpacted/ImageServer",
        opacity: 0.9,
        visible: false,
        format: "jpg",
        popupTemplate: { // autocasts as new PopupTemplate()
            title: "Monthly Average Radiance (Stray Light Impacted)",
            content: "{Raster.ServicePixelValue} nanowatts/cm²/sr<br>Location: {Name:getPopupPosition}"
        },
        renderingRule: null //this causes it to work the way we want. The default processing template for the service is "Stretch_SquareRoot_Grayscale". But, when identifying, we don't want the grayscale (0-255) value returned.
    });

    var monthlyCloudFreeCoverageLayer1 = new ImageryLayer({
        url: "https://gis.ngdc.noaa.gov/arcgis/rest/services/NPP_VIIRS_DNB/Monthly_CloudFreeCoverage/ImageServer",
        opacity: 0.9,
        visible: false,
        format: "jpg",
        popupTemplate: { // autocasts as new PopupTemplate()
            title: "Monthly Cloud-Free Coverage",
            content: "{Raster.ServicePixelValue} cloud-free observations<br>Location: {Name:getPopupPosition}"
        }
    });

    var monthlyCloudFreeCoverageLayer2 = new ImageryLayer({
        url: "https://gis.ngdc.noaa.gov/arcgis/rest/services/NPP_VIIRS_DNB/Monthly_CloudFreeCoverage_StrayLightImpacted/ImageServer",
        opacity: 0.9,
        visible: false,
        format: "jpg",
        popupTemplate: { // autocasts as new PopupTemplate()
            title: "Monthly Cloud-Free Coverage (Stray Light Impacted)",
            content: "{Raster.ServicePixelValue} cloud-free observations<br>Location: {Name:getPopupPosition}"
        }
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
        layers: [nightlyRadianceLayer, monthlyAvgRadianceLayer1, monthlyAvgRadianceLayer2, monthlyCloudFreeCoverageLayer1, monthlyCloudFreeCoverageLayer2, referenceLayer, countriesImageLayer, citiesGroupLayer]
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

    //Whenever the popup is shown, set the lat/lon of the click point to be globally visible, for reporting by the getPopupPosition() function
    watchUtils.whenTrue(app.mapView.popup, "visible", function() {
        app.popupLon = app.mapView.popup.location.longitude;
        app.popupLat = app.mapView.popup.location.latitude;
    });
    watchUtils.whenTrue(app.sceneView.popup, "visible", function() {
        app.popupLon = app.sceneView.popup.location.longitude;
        app.popupLat = app.sceneView.popup.location.latitude;
    });

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

    var selectLayer = query("#selectLayer")[0];
    on(selectLayer, "change", function() {
        toggleLayer(selectLayer.value);
    });

    var opacitySlider = query("#opacitySlider");
    on(opacitySlider, "input", function() {
        var opacity = document.getElementById("opacitySlider").value;
        document.getElementById("opacityText").innerHTML = opacity + '%';
        nightlyRadianceLayer.opacity = opacity / 100.0;
        monthlyAvgRadianceLayer1.opacity = opacity / 100.0;
        monthlyAvgRadianceLayer2.opacity = opacity / 100.0;
        monthlyCloudFreeCoverageLayer1.opacity = opacity / 100.0;
        monthlyCloudFreeCoverageLayer2.opacity = opacity / 100.0;
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

    //After the VIIRS imagery layers load, get the available date ranges and initialize the sliders
    nightlyRadianceLayer.when(getDateRangeAndSetupNightlySlider(nightlyRadianceLayer));
    monthlyAvgRadianceLayer1.when(getDateRangeAndSetupMonthlySlider1(monthlyAvgRadianceLayer1));
    monthlyAvgRadianceLayer2.when(getDateRangeAndSetupMonthlySlider2(monthlyAvgRadianceLayer2));

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
        nightlyRadianceLayer.visible = false;
        window.setTimeout(function() { 
            nightlyRadianceLayer.visible = true; 
        }, 1000);
    });

    function toggleLayer(id) {
        var sliderContainer1 = document.getElementById('sliderContainer1');
        var sliderContainer2 = document.getElementById('sliderContainer2');
        var sliderContainer3 = document.getElementById('sliderContainer3');

        nightlyRadianceLayer.visible = false;
        monthlyAvgRadianceLayer1.visible = false;
        monthlyAvgRadianceLayer2.visible = false;
        monthlyCloudFreeCoverageLayer1.visible = false;
        monthlyCloudFreeCoverageLayer2.visible = false;

        if (id === 'nightlyRadiance') {
            nightlyRadianceLayer.visible = true;
            sliderContainer1.style.display = 'block';
            sliderContainer2.style.display = 'none';
            sliderContainer3.style.display = 'none';
        } else if (id === 'monthlyAvgRadiance') {
            monthlyAvgRadianceLayer1.visible = true;
            sliderContainer1.style.display = 'none';
            sliderContainer2.style.display = 'block';
            sliderContainer3.style.display = 'none';
        } else if (id === 'monthlyAvgRadianceStrayLightImpacted') {
            monthlyAvgRadianceLayer2.visible = true;
            sliderContainer1.style.display = 'none';
            sliderContainer2.style.display = 'none';
            sliderContainer3.style.display = 'block';
        } else if (id === 'monthlyCloudFreeCoverage') {
            monthlyCloudFreeCoverageLayer1.visible = true;
            sliderContainer1.style.display = 'none';
            sliderContainer2.style.display = 'block';
            sliderContainer3.style.display = 'none';
        } else if (id === 'monthlyCloudFreeCoverageStrayLightImpacted') {
            monthlyCloudFreeCoverageLayer2.visible = true;
            sliderContainer1.style.display = 'none';
            sliderContainer2.style.display = 'none';
            sliderContainer3.style.display = 'block';
        }       
    }

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
    function getDateRangeAndSetupNightlySlider(layer) {
        var queryTask = new QueryTask({url: layer.url});
        var myQuery = new Query();
        myQuery.returnGeometry = false;
        myQuery.outFields = ["Day"];
        myQuery.orderByFields = ["Day"];
        myQuery.returnDistinctValues = true;

        queryTask.execute(myQuery).then(function(results) {
            var days = results.features;
            setupNightlyTimeSlider(days);

            var timeSlider = document.getElementById("timeSliderNightly");
            var leftButton = document.getElementById("timeSliderNightlyLeftButton");
            var rightButton = document.getElementById("timeSliderNightlyRightButton");
            var dateTextSpan = document.getElementById("dateTextNightly");

            on(timeSlider, "change", function() {
                updateNightlyTime(days);   
            });
            on(timeSlider, "input", function() {
                var index = parseInt(timeSlider.value);
                var dateText = days[index].attributes['Day'];
                dateTextSpan.innerHTML = formatDayText(dateText);
            });
            on(leftButton, "click", function() {
                //console.log("left clicked");
                timeSlider.value = parseInt(timeSlider.value) - 1;
                updateNightlyTime(days);
            });
            on(rightButton, "click", function() {
                //console.log("right clicked");
                timeSlider.value = parseInt(timeSlider.value) + 1;
                updateNightlyTime(days);
            });

            updateNightlyTime(days);
        });
    }

    //Get the list of unique months from the image service and setup the time slider accordingly
    function getDateRangeAndSetupMonthlySlider1(layer) {
        var queryTask = new QueryTask({url: layer.url});
        var myQuery = new Query();
        myQuery.returnGeometry = false;
        myQuery.outFields = ["Month"];
        myQuery.orderByFields = ["Month"];
        myQuery.returnDistinctValues = true;

        queryTask.execute(myQuery).then(function(results) {
            var months = results.features;
            setupMonthlyTimeSlider1(months);

            var timeSlider = document.getElementById("timeSliderMonthly1");
            var leftButton = document.getElementById("timeSliderMonthlyLeftButton1");
            var rightButton = document.getElementById("timeSliderMonthlyRightButton1");
            var dateTextSpan = document.getElementById("dateTextMonthly1");

            on(timeSlider, "change", function() {
                updateMonthlyTime1(months);   
            });
            on(timeSlider, "input", function() {
                var index = parseInt(timeSlider.value);
                var dateText = months[index].attributes['Month'];
                dateTextSpan.innerHTML = formatMonthText(dateText);
            });
            on(leftButton, "click", function() {
                timeSlider.value = parseInt(timeSlider.value) - 1;
                updateMonthlyTime1(months);
            });
            on(rightButton, "click", function() {
                timeSlider.value = parseInt(timeSlider.value) + 1;
                updateMonthlyTime1(months);
            });

            updateMonthlyTime1(months);
        });
    }

    //Get the list of unique months from the image service and setup the time slider accordingly
    function getDateRangeAndSetupMonthlySlider2(layer) {
        var queryTask = new QueryTask({url: layer.url});
        var myQuery = new Query();
        myQuery.returnGeometry = false;
        myQuery.outFields = ["Month"];
        myQuery.orderByFields = ["Month"];
        myQuery.returnDistinctValues = true;

        queryTask.execute(myQuery).then(function(results) {
            var months = results.features;
            setupMonthlyTimeSlider2(months);

            var timeSlider = document.getElementById("timeSliderMonthly2");
            var leftButton = document.getElementById("timeSliderMonthlyLeftButton2");
            var rightButton = document.getElementById("timeSliderMonthlyRightButton2");
            var dateTextSpan = document.getElementById("dateTextMonthly2");

            on(timeSlider, "change", function() {
                updateMonthlyTime2(months);   
            });
            on(timeSlider, "input", function() {
                var index = parseInt(timeSlider.value);
                var dateText = months[index].attributes['Month'];
                dateTextSpan.innerHTML = formatMonthText(dateText);
            });
            on(leftButton, "click", function() {
                timeSlider.value = parseInt(timeSlider.value) - 1;
                updateMonthlyTime2(months);
            });
            on(rightButton, "click", function() {
                timeSlider.value = parseInt(timeSlider.value) + 1;
                updateMonthlyTime2(months);
            });

            updateMonthlyTime2(months);
        });
    }

    function updateNightlyTime(days) {
        var index = parseInt(document.getElementById("timeSliderNightly").value);
        var dateText = days[index].attributes['Day'];
        document.getElementById("dateTextNightly").innerHTML = formatDayText(dateText);
        updateNightlyImageryLayer(dateText);   
    }

    function updateMonthlyTime1(months) {
        var index = parseInt(document.getElementById("timeSliderMonthly1").value);
        var dateText = months[index].attributes['Month'];
        document.getElementById("dateTextMonthly1").innerHTML = formatMonthText(dateText);
        updateMonthlyImageryLayers1(dateText);   
    }

    function updateMonthlyTime2(months) {
        var index = parseInt(document.getElementById("timeSliderMonthly2").value);
        var dateText = months[index].attributes['Month'];
        document.getElementById("dateTextMonthly2").innerHTML = formatMonthText(dateText);
        updateMonthlyImageryLayers2(dateText);   
    }

    function formatDayText(dateText) {
        return dateText.substring(0, 4) + '/' + dateText.substring(4, 6) + '/' + dateText.substring(6, 8);
    }

    function formatMonthText(dateText) {
        var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthNames[parseInt(dateText.substring(4, 6))-1] + ' ' + dateText.substring(0, 4);
    }

    function setupNightlyTimeSlider(features) {
        var numDays = features.length;
        //var startDay = features[0].attributes['Day'];
        var endDay = features[numDays-1].attributes['Day'];
        document.getElementById("dateTextNightly").innerHTML = formatDayText(endDay);

        var timeSlider = document.getElementById("timeSliderNightly");
        timeSlider.max = numDays - 1;
        timeSlider.value = numDays - 1;
    }

    function setupMonthlyTimeSlider1(features) {
        var numMonths = features.length;
        var endMonth = features[numMonths-1].attributes['Month'];
        document.getElementById("dateTextMonthly1").innerHTML = formatMonthText(endMonth);

        var timeSlider = document.getElementById("timeSliderMonthly1");
        timeSlider.max = numMonths - 1;
        timeSlider.value = numMonths - 1;
    }

    function setupMonthlyTimeSlider2(features) {
        var numMonths = features.length;
        var endMonth = features[numMonths-1].attributes['Month'];
        document.getElementById("dateTextMonthly2").innerHTML = formatMonthText(endMonth);

        var timeSlider = document.getElementById("timeSliderMonthly2");
        timeSlider.max = numMonths - 1;
        timeSlider.value = numMonths - 1;
    }

    function updateNightlyImageryLayer(dateText) {
        nightlyRadianceLayer.definitionExpression = "Day = '" + dateText + "'";
    }

    function updateMonthlyImageryLayers1(dateText) {
        monthlyAvgRadianceLayer1.definitionExpression = "Month = '" + dateText + "'";
        monthlyCloudFreeCoverageLayer1.definitionExpression = "Month = '" + dateText + "'";
    }

    function updateMonthlyImageryLayers2(dateText) {
        monthlyAvgRadianceLayer2.definitionExpression = "Month = '" + dateText + "'";
        monthlyCloudFreeCoverageLayer2.definitionExpression = "Month = '" + dateText + "'";
    }
});