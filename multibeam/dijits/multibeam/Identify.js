dojo.provide('multibeam.Identify');

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

dojo.declare(
	'multibeam.Identify',
	null, //no superclass
	{		
		//templates for formatting tabs
		summaryRowTemplate: null,
		detailRowTemplate: null,
		statsRowTemplate: null,
		
		fileListUrl: "http://www.ngdc.noaa.gov/nndc/struts/results?op_0=l&t=101378&s=8&d=70&d=81&d=75&d=76&d=74&d=73&d=72&d=82&d=85&d=86&d=79&no_data=suppress&v_0=${NGDC_ID}",
		
		//buffer size (in pixels) to use in query 
		searchTolerance: 4,
		
		//point to which the map InfoWindow is anchored
		anchorPoint: null,
		
		query: null,
		
		//Query service Endpoint
		queryTask: null,
		
		//Map layer used to query
		layerUrl: null,
		map: null,
		
		//Geometry service Endpoint
		gsvc: null,

		//symbol used to show search window on map
		queryWindowSymbol: null,
		
		//symbol used to show selected feature on map
		selectedFeatureSymbol: null,
		
		//array of most recent search results
		results: null,
		resultBbox: null,
		
		summaryTab: null,
		detailTab: null,
		statsTab: null,
		
		constructor: function(params) {
			//console.log('inside constructor...');
			this.map = params.map;
			this.layerUrl = params.layerUrl;
			this.summaryTab = params.summaryTab;
			this.detailTab = params.detailTab;
			this.statsTab = params.statsTab;

			this.queryTask = new esri.tasks.QueryTask(this.layerUrl);
			this.query = new esri.tasks.Query();
		   this.query.returnGeometry = true;
		   this.query.outFields = ["SURVEY_NAME","SHIP_NAME","NGDC_ID", "SOURCE", "INSTRUMENT","START_DATE","END_DATE","FILE_COUNT","TRACK_LENGTH","TOTAL_TIME","BATHY_BEAMS","AMP_BEAMS","SIDESCANS"];

			this.summaryRowTemplate = "<tr>";
			this.summaryRowTemplate += "<td><a href=\"#\" onclick=\"showFeature(${loopCounter}); return false;\">${SURVEY_NAME}</a> ";
			this.summaryRowTemplate += "<a target='_blank' href="+this.fileListUrl+">(file list)</a></td>";
			this.summaryRowTemplate +="<td>${SHIP_NAME}</td></tr>";
			this.summaryRowTemplate += "</tr>";
			
			this.detailRowTemplate = "<tr>";
			this.detailRowTemplate += "<td><a href='#' onclick='showFeature(${loopCounter}); return false;'>${SURVEY_NAME}</a></td>";
			this.detailRowTemplate += "<td>${START_DATE}</td>";
			this.detailRowTemplate += "<td>${END_DATE}</td>";
			this.detailRowTemplate += "<td>${INSTRUMENT}</td>";
			this.detailRowTemplate += "<td>${SOURCE}</td>";
			this.detailRowTemplate += "</tr>";

			this.statsRowTemplate = "<tr>";
			this.statsRowTemplate += "<td><a href='#' onclick='showFeature(${loopCounter}); return false;'>${SURVEY_NAME}</a></td>";
			this.statsRowTemplate += "<td><a target=\"_blank\" href=\""+this.fileListUrl+"\">${FILE_COUNT}</a></td>";
			this.statsRowTemplate += "<td>${TRACK_LENGTH}</td>";
			this.statsRowTemplate += "<td>${TOTAL_TIME}</td>";
			this.statsRowTemplate += "<td>${BATHY_BEAMS}</td>";
			this.statsRowTemplate += "<td>${AMP_BEAMS}</td>";
			this.statsRowTemplate += "<td>${SIDESCANS}</td>";
			this.statsRowTemplate += "</tr>";

			//this.gsvc = new esri.tasks.GeometryService("http://arcgis.ngdc.noaa.gov/restsvc/services/Geometry/GeometryServer");

			//hollow shape w/ 2px red border
			this.queryWindowSymbol = new esri.symbol.SimpleFillSymbol(
				"none", 
				new esri.symbol.SimpleLineSymbol("solid", new dojo.Color([255,0,0]),2),
				new dojo.Color([255,255,0,0.25])
			);
			
			this.selectedFeatureSymbol = new esri.symbol.SimpleLineSymbol("solid",new dojo.Color([255,255,0]),2);

			dojo.connect(this.queryTask, "onComplete", this, this.processQuery);	
		},   
		
		formatSummaryTab: function(results,rowTemplate) {
			//console.log('inside formatSummaryTab...');			
			var content = dojo.string.substitute("<i>Total features returned: ${0}</i>", [results.length]);
			content += "<table border='1'><tr><th>Survey</th><th>Ship</th></tr>";
			
			//template match cannot tolerate nulls. SURVEY_NAME, SHIP_NAME assumed to be non-null			
			for (var i=0; i<results.length; i++) {
				results[i].attributes['loopCounter'] = i;
				content += dojo.string.substitute(rowTemplate,results[i].attributes);
			}
			content+="</table>";
			//console.log("summaryTab: ",content);
			return(content);
		},
		
		formatDetailTab: function(results,rowTemplate) {
			//console.log("inside formatDetailTab...");
			var content = dojo.string.substitute("<i>Total features returned: ${0}</i>", [results.length]);
			content += '<table border="1"><tr><th>Survey</th><th>Start Time</th><th>End Time</th><th>Instrument</th><th>Source</th></tr>';
			
			for (var i=0; i<results.length; i++) {
				results[i].attributes['loopCounter'] = i;
				//template match cannot tolerate nulls. SURVEY_NAME assumed to be non-null
				if (! results[i].attributes.START_DATE) { results[i].attributes.START_DATE = "not available"; }
				if (! results[i].attributes.END_DATE) { results[i].attributes.END_DATE = "not available"; }
				if (! results[i].attributes.INSTRUMENT) { results[i].attributes.INSTRUMENT = "not available"; }
				if (! results[i].attributes.SOURCE) { results[i].attributes.SOURCE = "not available"; }
				content += dojo.string.substitute(rowTemplate,results[i].attributes);
			}
			content+="</table>";
			//console.log("detailTab: ",content);
			return(content);
		},
		
		formatStatsTab: function(results,rowTemplate) {
			//console.log("inside formatStatsTab...");
			var content = dojo.string.substitute("<i>Total features returned: ${0}</i>", [results.length]);
			content += '<table border="1"><tr><th>Survey</th><th>Files</th><th>Distance(km)</th><th>Time(hr)</th><th>Bathy beams</th><th>Amplitude beams</th><th>Sidescan Pixels</th></tr>';
			
			for (var i=0; i<results.length; i++) {
				results[i].attributes['loopCounter'] = i;
				//template match cannot tolerate nulls. SURVEY_NAME assumed to be non-null
				if (! results[i].attributes.FILE_COUNT) { results[i].attributes.FILE_COUNT = "not available"; }
				if (! results[i].attributes.TRACK_LENGTH) { results[i].attributes.TRACK_LENGTH = "not available"; }
				if (! results[i].attributes.TOTAL_TIME) { results[i].attributes.TOTAL_TIME = "not available"; }
				if (! results[i].attributes.BATHY_BEAMS) { results[i].attributes.BATHY_BEAMS = "not available"; }
				if (! results[i].attributes.AMP_BEAMS) { results[i].attributes.AMP_BEAMS = "not available"; }
				if (! results[i].attributes.SIDESCANS) { results[i].attributes.SIDESCANS = "not available"; }
				content += dojo.string.substitute(rowTemplate,results[i].attributes);
			}
			content+="</table>";
			//console.log("statsTab: ",content);
			return(content);
		},
		
		onClickHandler: function(evt) {
			//console.log('inside onClickHandler...');
			//replace point w/ a small envelope
			var geom = this.buildQueryWindow(evt.mapPoint);
			
			//clear graphics
			this.map.graphics.clear();

			//display search window
			var graphic = new esri.Graphic(geom,this.queryWindowSymbol);
			this.map.graphics.add(graphic);

			this.envelopeQuery(geom);
		},
		
		envelopeQuery: function(geometry) {
			//console.log('inside envelopeQuery...');
			this.anchorPt = this.map.toScreen(geometry.getCenter());
			
			this.query.geometry = geometry;
			
			//apply any SQL set by SurveySelectDialog
			//TODO derive rather than hardcode layer index
			this.query.where = selectMapService.layerDefinitions[0];	
			
			//console.log("query geometry: ",this.query.geometry);
			//console.log("query constraint: ",this.query.where);	
	
			//hide toaster
			dojo.publish("/toaster/hide");
			
			//show status
			dojo.publish("/status/show",['Search in progress...']);
			
			//hide infowindow
			//this.map.infoWindow.hide();
						
			//execute query
			this.queryTask.execute(this.query);
		},

		processQuery: function(fset) {
			//console.log("inside processQuery - found ",fset.features.length+" features.");
			
			dojo.publish('/status/hide');
			dojo.publish('/toaster/hide');
			//this.map.graphics.clear();
			
			if (fset.features.length == 0) {
				dojo.publish('/toaster/show', ['No features found']);
				this.map.infoWindow.hide();
				return;
			}
			
			//transfer features to global array
			this.results = [];
			this.resultBbox = fset.features[0].geometry.getExtent();
						
			//provide scope to access this.results
			dojo.forEach(fset.features, function(i){
				this.results.push(i); 
				if ((this.resultBbox.xmin < 0 && i.geometry.getExtent().xmin < 0) ||
				(this.resultBbox.xmin > 0 && i.geometry.getExtent().xmin > 0)) {
					this.resultBbox = this.resultBbox.union(i.geometry.getExtent());
					//console.log("bbox now ",this.resultBBOX.xmin+", "+this.resultBBOX.ymin+", "+this.resultBBOX.xmax+", "+this.resultBBOX.ymax);
				}
			},this);
			
			this.summaryTab.attr('content',this.formatSummaryTab(this.results,this.summaryRowTemplate));
			this.detailTab.attr('content',this.formatDetailTab(this.results,this.detailRowTemplate));
			this.statsTab.attr('content',this.formatStatsTab(this.results,this.statsRowTemplate));
			//this.map.setExtent(this.resultBbox,false);
			//this.map.infoWindow.setContent(this.domNode);
			this.map.infoWindow.show(this.anchorPt, this.map.getInfoWindowAnchor(this.anchorPt));			
		},
				
		
		/**
		* calculate search window based on mouseclick location and the search tolerance
		*
		* originally used GeometryService to create buffer but resulting geometry 
		* was too large for GET request and therefore required use of proxy which
		* is not yet working correctly
		* 
		* return Extent geometry 
		*/
		buildQueryWindow: function(mapPoint) {
			var radius = this.searchTolerance / 2;
			var resolution = this.map.extent.getWidth() / this.map.width;
			var queryWindow = new esri.geometry.Extent(
				mapPoint.x - (resolution*radius),
				mapPoint.y - (resolution*radius),
				mapPoint.x + (resolution*radius),
				mapPoint.y + (resolution*radius),
				this.map.extent.spatialReference);
			return(queryWindow);
		}
	}
);