dojo.require("esri.map");
dojo.require("esri.dijit.OverviewMap");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.require("esri.dijit.OverviewMap");
dojo.require("esri.dijit.Scalebar");
dojo.require("esri.dijit.Legend");
dojo.require("help_panel.HelpPanel");
dojo.require("simple_basemap_toolbar.SimpleBasemapToolbar");
dojo.require("banner.Banner");
dojo.require("identify.Identify");
//dojo.require('dojo.io.script');
//dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.ToolbarSeparator");
dojo.require('layers.PairedMapServiceLayer');
dojo.require('bboxDialog.BoundingBoxDialog');
dojo.require("dojox.widget.Toaster");
dojo.require("checkBoxTreeTOC.CheckBoxTree");
dojo.require("dojo.data.ItemFileReadStore");

var globals = {}; //container for global variables

globals.debug = false;
globals.mapConfigLoaded = true;
globals.scalebarZoomEnabled = 3;
globals.maxCellCount = 5000 * 5000; //set in Mapserver mapfile

//set the initial extent. may be overridden with request parameters
globals.initialExtentString = {
	"xmin": -179.9,
	"ymin": -70,
	"xmax": 179.9,
	"ymax": 70,
	"spatialReference":{"wkid":4326}
};

//define the function getInitialExtent to override default behavior

//mandatory lifecycle methods
//called just before common initialization
function preInit() {
	var layersStore = new dojo.data.ItemFileReadStore({
		data: {
			identifier: 'name',
			label: 'label',
			items: [
			{
				name: 'etopo1',
				label: "ETOPO1 (ice)",
				resolution: "0.016666666666666667",  //1 degree
				previewUrl: "http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/etopo1_hillshade/MapServer",
				description: "Grid of Earth's surface depicting the top of the Antarctic and Greenland ice sheets (1-minute resolution)"
			},
			{
				name: 'etopo1_bedrock',
				label: "ETOPO1 (bedrock)",
				resolution: "0.016666666666666667",  //1 degree
				previewUrl: "http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/etopo1_hillshade/MapServer",
				description: "Grid of Earth's surface depicting the bedrock underneath the ice sheets (1-minute resolution)"
			},
/*			
			{
				name: 'DEM',
				label: "DEM",
				resolution: "0.016666666666666667",
				previewUrl: "http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/dem_hillshades_mosaic/MapServer"
			},
*/
			{
				name: 'crm',
				label: "Coastal Relief Models",
				resolution: "0.000833333333333334", //3 arcsecond
				previewUrl: "http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/dem_hillshades_mosaic/MapServer",
				description: "Coastal Relief Model (3-second resolution)"
			},
			{
				name: 'socal_3as',
				label: "Southern California Coastal Relief Model (3 arc-second)",
				resolution: "0.000833333333333334", //3 arcsecond
				previewUrl: "http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/dem_hillshades_mosaic/MapServer",
				description: "Southern California Coastal Relief Model (3-second resolution)"
			},
			{
				name: 'socal_3as_hs',
				label: "Southern California Coastal Relief Model Hillshade (3 arc-second)",
				resolution: "0.000833333333333334", //3 arcsond
				previewUrl: "http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/dem_hillshades_mosaic/MapServer",
				description: "Southern California Relief Model Hillshade (3 arc-second resolution)"
			},
			{
				name: 'socal_1as',
				label: "Southern California Coastal Relief Model (1 arc-second)",
				resolution: "0.000277777780000", //1 arcsecond
				previewUrl: "http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/dem_hillshades_mosaic/MapServer",
				description: "Southern California Coastal Relief Model (1 arc-second resolution)"
			},
			{
				name: 'socal_1as_hs',
				label: "Southern California Coastal Relief Model Hillshade (1 arc-second)",
				resolution: "0.000277777780000", //1 arcsecond
				previewUrl: "http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/dem_hillshades_mosaic/MapServer",
				description: "Southern California Coastal Relief Model Hillshade (1 arc-second resolution)"
			},
			{
				name: 'alaska_crm',
				label: 'Southern Alaska CRM',
				resolution: '0.00666666667',
				previewUrl: "http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/dem_hillshades_mosaic/MapServer",
				description: "Southern Alaska Coastal Relief Model (24-second resolution)"
			},
/*
			{
				name: 'globe',
				label: "GLOBE",
				resolution: "0.008333333333333334",  //30 arcsecond
				//no preview service yet for GLOBE
				previewUrl: "http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/etopo1_hillshade/MapServer",
			 	description: "GLOBE (30-second resolution)"
			},
*/
/*
			{
				name: 'calibration_1deg_gridcentered',
				label: "1deg_gridcenter",
				resolution: "1.0",  
				//no preview service
				previewUrl: "http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/etopo1_hillshade/MapServer",
			 	description: "grid-centered test (1 degree resolution)"
			},
*/
/*
			{
				name: 'calibration_1deg_cellcentered',
				label: "1deg_cellcenter",
				resolution: "1.0",  
				//no preview service
				previewUrl: "http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/etopo1_hillshade/MapServer",
			 	description: "cell-centered test (1 degree resolution)"
			}
*/
			{
				name: 'great_lakes',
				label: "Great Lakes Bathymetry",
				resolution: "0.000833333333333334", //3 arcsecond
				previewUrl: "http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/dem_hillshades_mosaic/MapServer",
				description: "Great Lakes Bathymetry (3-second resolution)"
			}
			]
		}
	});
	dijit.byId('layerSelect').store = layersStore;
	dijit.byId('layerSelect').set('value','etopo1');
	
	var formatsStore = new dojo.data.ItemFileReadStore({
		data: {
			identifier: 'name',
			label: 'label',
			items: [
			{
				name: 'geotiff',
				extension: 'tif',
				label: "GeoTIFF"
			},
			{
				name: 'aaigrid',
				extension: 'asc',
				label: "ArcGIS ASCII Grid"
			},
			{
				name: "xyz",
				extension: 'xyz',
				label:"XYZ"
			},
			{
				name: "gmt",
				extension: 'grd',
				label:"GMT NetCDF"
			},
			{
				name: "netcdf",
				extension: 'nc',
				label:"NetCDF"
			}]
		}
	});
	
	dijit.byId('formatSelect').store = formatsStore;
	dijit.byId('formatSelect').set('value','geotiff');

	dojo.connect(dijit.byId("formatSelect"),'onChange',function(value){
		formatsStore.fetchItemByIdentity({
      	identity: value,
      	onItem: function(item, request) {
				globals.selectedFormat = item;
				updateUrl();
			}
      });
	});

	dojo.connect(dijit.byId("layerSelect"),'onChange',function(value){
		layersStore.fetchItemByIdentity({
      	identity: value,
      	onItem: function(item, request) {
				globals.selectedLayer = item;
				changePreview(item.previewUrl);
				updateUrl();
				dojo.byId('layerDescDiv').innerHTML = item.description;
			}
      });
	});

	function changePreview(url) {
		dojo.forEach(globals.previewServices, function(svc) {
			if (url == svc.url) {
				svc.setVisibility(true);
			} else {
				svc.setVisibility(false);
			}
		});
	}

	function calculateCellCount() {
		var res = globals.selectedLayer.resolution;
		var extent = globals.selectedExtent;
		var xDist = extent.xmax - extent.xmin;
		var yDist = extent.ymax - extent.ymin;
		var rows = Math.ceil(xDist / res);
		var cols = Math.ceil(yDist / res);
		return (rows * cols);
	}
	
	function updateUrl() {
		//var urlTemplate = "http://mapserver.ngdc.noaa.gov/cgi-bin/public/wcs/${coverage}.${extension}?request=getcoverage&version=1.0.0&service=wcs&coverage=${coverage}&CRS=EPSG:4326&format=${format}&resx=${resolution}&resy=${resolution}&bbox=${extent.xmin},${extent.ymin},${extent.xmax},${extent.ymax}";
		var urlTemplate = "http://mapserver.ngdc.noaa.gov/wcs-proxy/wcs.groovy?filename=${coverage}.${extension}&request=getcoverage&version=1.0.0&service=wcs&coverage=${coverage}&CRS=EPSG:4326&format=${format}&resx=${resolution}&resy=${resolution}&bbox=${extent.xmin},${extent.ymin},${extent.xmax},${extent.ymax}";
		
		if (globals.selectedExtent != null && dijit.byId('layerSelect').isValid() && dijit.byId('formatSelect').isValid()) {
			var cellCount = calculateCellCount();
			if (cellCount > globals.maxCellCount) {
				var str = "Too many grid cells - please select a smaller area or a lower resolution dataset";
				dijit.byId('downloadDiv').set('content',str);
				dojo.byId('downloadDiv').style.color = 'red';
				return;
			}
			
			var url = dojo.string.substitute(urlTemplate, {'coverage': globals.selectedLayer.name, 'extension':globals.selectedFormat.extension, 'format': globals.selectedFormat.name, 'resolution': globals.selectedLayer.resolution, 'extent':globals.selectedExtent});
			//update URL
			//TODO create a <a> node
			var str = "<a href='"+url+"'>click here to download</a>";
			dijit.byId('downloadDiv').set('content',str);
			dojo.byId('downloadDiv').style.color = 'green';
		} else {
			dijit.byId('downloadDiv').set('content','');
			//dijit.byId('downloadDiv').set('content',"download unavailable due to missing/invalid input");
			//dojo.byId('downloadDiv').style.color = 'red';
		}
	}

	dojo.subscribe('/ngdc/drawRectangle', this, function(graphic) {
		globals.selectedExtent = esri.geometry.webMercatorToGeographic(graphic.geometry);
		dijit.byId('aoiDiv').set('content', formatExtent(globals.selectedExtent));
		updateUrl();
	});

	function formatExtent(extent) {
		var str = [extent.xmin.toPrecision(5),extent.ymin.toPrecision(5),extent.xmax.toPrecision(5),extent.ymax.toPrecision(5)].join(', ');
		return str;
	}
/*		
	var mybanner = new banner.Banner({
		breadcrumbs: [
			{url: 'http://www.noaa.gov', label: 'NOAA'},
			{url: 'http://www.nesdis.noaa.gov', label: 'NESDIS'},
			{url: 'http://www.ngdc.noaa.gov', label: 'NGDC'},
			{url: 'http://maps.ngdc.noaa.gov/viewers', label: 'Maps'},
			{url: 'http://ngdc.noaa.gov/mgg/bathymetry/relief.html', label: 'Bathymetry'}
		],
		dataUrl: "http://ngdc.noaa.gov/mgg/bathymetry/relief.html",
		image: "/images/mapservice.gif"
	});
	mybanner.placeAt('banner');
*/
	//create the dialog
	globals.coordDialog = new bboxDialog.BoundingBoxDialog({title:'Specify an Area of Interest', style: 'width:300px;'});

	//esri.config.defaults.io.proxyUrl = "http://maps.ngdc.noaa.gov/proxy.jsp";
	esri.config.defaults.io.proxyUrl = "http://agsdevel.ngdc.noaa.gov/proxy.php";
}

//called after common initialization
function postInit() {
	dojo.subscribe('/ngdc/BoundingBoxDialog', this, function(data) {
		var minx = data.minx, maxx = data.maxx, miny = data.miny, maxy = data.maxy;

		//Handle the fact that the poles are at infinity in the Mercator projection
		//TODO set max in Dialog number entries
		if (miny === -90)
			miny = -89.99;
		if (maxy === 90)
			maxy = 89.99;

		//TODO: Handle projections other than Web Mercator
		var ll = esri.geometry.geographicToWebMercator(new esri.geometry.Point(minx, miny));
		var ur = esri.geometry.geographicToWebMercator(new esri.geometry.Point(maxx, maxy));
		var geometry = new esri.geometry.Extent(ll.x, ll.y, ur.x, ur.y, new esri.SpatialReference({wkid: 3857}));
		addToMap(geometry);
		globals.map.setExtent(new esri.geometry.Extent(geometry.xmin, geometry.ymin, geometry.xmax, geometry.ymax, new esri.SpatialReference({wkid: 3857})), true);
	});

	//subset of global services used for previews
	globals.previewServices = [globals.mapServices[3],globals.mapServices[4]];
}

function getMapServiceList(){
	var imageParametersPng32 = new esri.layers.ImageParameters();
	imageParametersPng32.format = "png32";
	var imageParametersJpg = new esri.layers.ImageParameters();
	imageParametersJpg.format = "jpg";

	globals.mapServices = [
	new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer", {
		id: "Ocean",
		visible: false,
		opacity: 1
	}),
	new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer", {
		id: "Canvas",
		visible: true,
		opacity: 1
	}),
	new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/gebco08_hillshade/MapServer", {
	 	id: "GEBCO_08 (tiled)",
	 	visible: false,
	 	opacity: 1
	}),
	new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/etopo1_hillshade/MapServer", {
	 	id: "ETOPO1 (tiled)",
	 	visible: false,
	 	opacity: 1
	}),
	new esri.layers.ArcGISTiledMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/dem_hillshades_mosaic/MapServer", {
		id: "DEM Hillshades",
		visible: false,
		opacity: 1
	}),
	//5
//	new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/crm_hillshade/MapServer", {
//		id: "CRM Hillshade",
//		visible: false,
//		opacity: 1
//	}),	
	new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/graticule/MapServer", {
		id: "Graticule",
		visible: true,
		opacity: 0.7,
		imageParameters: imageParametersPng32
	})
	];
	return (globals.mapServices);
}


function initTOC(){
	//console.log('inside initTOC...');
}


function initBasemapToolbar() {
/*	
	var basemapToolbar = new simple_basemap_toolbar.SimpleBasemapToolbar({
		basemaps: [
			{service: globals.mapServices[2], label: 'Terrain (GEBCO_08)', boundariesEnabled: true},
			{service: globals.mapServices[0], label: 'Ocean', boundariesEnabled: false},
			{service: globals.mapServices[1], label: 'Simple', boundariesEnabled: false}
		],
		overlays: [
			{service: globals.mapServices[6], label: 'Boundaries/Labels', visible: true},
			{service: globals.mapServices[7], label: 'Graticule', visible: true}
		],
        selectedBasemapIndex: 2
	});
	basemapToolbar.placeAt('basemapToolbar');
	basemapToolbar.startup();
	return(basemapToolbar);
*/
}

//called on Map onLoad event
function mapInitializedCustom(theMap) {
	//console.log('inside mapInitializedCustom...');
}

//called after all layers added to map
function mapReadyCustom(theMap) {
	//console.log('inside mapReadyCustom...');

	globals.geometryService = new esri.tasks.GeometryService('http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer');

	initBasemapToolbar();
	initTOC();

	globals.scalebar = new esri.dijit.Scalebar({map: globals.map, scalebarUnit: "metric"}, dojo.byId("scalebar"));
	globals.scalebar.hide(); // scalebar is hidden by default at small scales

	dojo.connect(globals.map, "onZoomEnd", function(level){
		if (level <= globals.scalebarZoomEnabled - globals.firstZoomLevel) {
			globals.scalebar.hide();
			if (dojo.byId("bottomBar"))
				dojo.byId("bottomBar").style.width = "auto";
		} else {
			globals.scalebar.show();
			if (dojo.byId("bottomBar"))
				dojo.byId("bottomBar").style.width = "340px";
		}
	});
}
