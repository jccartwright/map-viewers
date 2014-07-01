dojo.require("esri.map");
dojo.require("esri.dijit.OverviewMap");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.require("esri.dijit.OverviewMap");
dojo.require("esri.dijit.Scalebar");
dojo.require("help_panel.HelpPanel");
dojo.require("simple_basemap_toolbar.SimpleBasemapToolbar");
dojo.require("banner.Banner");
dojo.require("identify.Identify");
dojo.require('dojo.io.script');
dojo.require("dijit.ToolbarSeparator");
dojo.require('layers.PairedMapServiceLayer');
dojo.require("dojox.widget.Toaster");
dojo.require('bboxDialog.BoundingBoxDialog');
dojo.require('sample_index.CreditsPanel');

var globals = {}; //container for global variables

globals.debug = false;
globals.mapConfigLoaded = true;

globals.publicAgsHost = "http://maps.ngdc.noaa.gov/arcgis";
globals.privateAgsHost = "http://agsdevel.ngdc.noaa.gov:6080/arcgis";
globals.arcgisOnlineHost = "http://server.arcgisonline.com/ArcGIS";

//mandatory lifecycle methods
//called just before common initialization
function preInit() {
    console.log("inside preInit..."); 
	
	var mybanner = new banner.Banner({
		breadcrumbs: [
			{url: 'http://www.noaa.gov', label: 'NOAA'},
			{url: 'http://www.nesdis.noaa.gov', label: 'NESDIS'},
			{url: 'http://www.ngdc.noaa.gov', label: 'NGDC'},
			{url: 'http://www.ngdc.noaa.gov/maps/interactivemaps.html', label: 'Maps'},
			{url: 'http://www.ngdc.noaa.gov/mgg/curator/curator.html', label: 'Sample Index'}			
		],
		dataUrl: "http://www.ngdc.noaa.gov/mgg/curator/"
	});
	mybanner.placeAt('banner');
	
	esri.config.defaults.io.proxyUrl = "http://maps.ngdc.noaa.gov/proxy.jsp";
	//esri.config.defaults.io.proxyUrl = "http://agsdevel.ngdc.noaa.gov/proxy.php";
	
	//create the "Select by Coordinates" dialog
	globals.coordDialog = new bboxDialog.BoundingBoxDialog({title:'Specify an Area of Interest', style: 'width:300px;'}); 
}

//called after common initialization
function postInit(){
	//  console.log("inside postInit...");	
	globals.geometryService = new esri.tasks.GeometryService("http://maps.ngdc.noaa.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer");
}

function initIdentify() {
	var attributes = [ 'Data Link', 'Repository', 'Platform', 'Cruise or Leg',
			'Alternate Cruise or Leg', 'Sample ID', 'Device', 'Date Collected',
			'End Date of Collection', 'Latitude', 'Longitude', 'End Latitude',
			'End Longitude', 'Water Depth (m)', 'End Water Depth (m)',
			'Storage Method', 'Core Length (cm)', 'Core Diameter (cm)', 'PI',
			'Province', 'Lake', 'Date Information Last Updated', 'IGSN',
			'Sample Comments', 'IMLGS' ];
	
	var fieldUrls = {
        'Data Link': {
            prefix: '',
            postfix: '',
            linkText: 'Data and Images'
        },
        'Cruise or Leg': {
        	prefix: 'http://www.ngdc.noaa.gov/geosamples/leg.jsp?leg=',
            postfix: ''         
        },
        'Alternate Cruise or Leg': {
        	prefix: 'http://www.ngdc.noaa.gov/geosamples/leg.jsp?leg=',
            postfix: ''
        },
        'Repository': {
            prefix: 'http://www.ngdc.noaa.gov/geosamples/displayfacility.jsp?fac=',
            postfix: ''         
        }
    };
	
    globals.identifyDijit = new identify.Identify({
        map: globals.map,
        label: "Identify",
        defaultTolerance: 2,
        featureGridHeaderText: 'Cruise:Sample ID:Device (Repository)',
        mapServices: [
        {
            id: "Sample Index",
            //url: globals.publicAgsHost + "/rest/services/web_mercator/sample_index_dynamic/MapServer",
            name: "Sample Index",
			service: mapServiceById('Sample Index'),
            displayOptions: {
                0: {
                    layerAlias: " ",
                    attributes: attributes,
                    fieldUrls: fieldUrls,
                    visible: false,
                    displayFieldNames: ['Cruise or Leg', 'Sample ID', 'Device', 'Repository'],
                    displayFieldDelimiters: {
                        'Cruise or Leg': ':',
                        'Sample ID': ':',
                        'Device': ' (',
                        'Repository': ')'
                    }
                }
            },
            sortFunction: function(a, b) {
                //Sort by Cruise, Sample ID, Device             
                if (a.feature.attributes['Cruise or Leg'] == b.feature.attributes['Cruise or Leg']) {
                    if (a.feature.attributes['Sample ID'] == b.feature.attributes['Sample ID']) {
                        return a.feature.attributes['Device'] <= b.feature.attributes['Device'] ? -1 : 1;
                    }
                    return a.feature.attributes['Sample ID'] <= b.feature.attributes['Sample ID'] ? -1 : 1;
                }
                return a.feature.attributes['Cruise or Leg'] <= b.feature.attributes['Cruise or Leg'] ? -1 : 1;             
            }
        }       
        ],
        lineSymbol: new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 255, 0]), 2),
        fillSymbol: new esri.symbol.SimpleFillSymbol(
            esri.symbol.SimpleFillSymbol.STYLE_SOLID, 
            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([ 64, 64, 64, 1 ]), 2), 
            new dojo.Color([ 255, 255, 0, 0.3 ]))
    });
    
    globals.identifyDijit.startup();    
}

//called on Map onLoad event
function mapInitializedCustom(theMap) {
    //console.log('inside mapInitializedCustom...');
    
	dojo.connect(dijit.byId("selectInstMenu"), "onItemClick", selectInstitution);
}

function selectInstitution(id){
	var layerDefinitions = [], hidden = false;
	//dijit.byId("selectInst").set('label', item.label);
	
	globals.selectedInstitution = id;
	
	var service = mapServiceById('Sample Index');
	
	if (id === 'AllInst') {
		service.hide();
		service.setLayerDefinitions(layerDefinitions);
		service.show();
	} else if (id === 'None') {
		service.hide();
		layerDefinitions = [9999];
	} else {
		service.hide();
		
		if (id === 'FSU') {
			id = 'ARFFSU';
		}
		if (id === 'WISC') {
			id = 'U WISC';
		}
		
		layerDefinitions = ["FACILITY_CODE in ('" + id + "')"];
		service.setLayerDefinitions(layerDefinitions);   
		service.show();
	}
}

function launchViewer(name) {	
	if (name === 'Mercator') {
		window.open('index.html?institution=' + globals.selectedInstitution, 'sample_index');
	} else if (name === 'Arctic') {
		window.open('index_arctic.html?institution=' + globals.selectedInstitution, 'sample_index_arctic');
	} else { //Antarctic
		window.open('index_antarctic.html?institution=' + globals.selectedInstitution, 'sample_index_antarctic');
	}
}