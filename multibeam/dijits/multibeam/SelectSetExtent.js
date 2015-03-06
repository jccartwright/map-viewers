dojo.provide("multibeam.SelectSetExtent");

dojo.declare("multibeam.SelectSetExtent", null, {
	constructor: function(/*String*/ queryLayerUrl) {
		this._geometryService = new esri.tasks.GeometryService('http://maps.ngdc.noaa.gov/rest/services/Geometry/GeometryServer');
		this._queryTask = new esri.tasks.QueryTask(queryLayerUrl);
		this._query = new esri.tasks.Query();
		this._query.returnGeometry = true;
		this._query.maxAllowableOffset = 100000; //Generalize the geometries. Max tolerance of 100km (doesn't have to be accurate)
		this._query.outFields = [];
		//this.connect(this._queryTask, "onComplete", calcBbox);	
		dojo.connect(this._queryTask, "onComplete", this, this.calcBbox);	

	},

	setWhere: function(query) {
		console.log('inside setWhere with '+query);
		this._query.where = query;
		this._queryTask.execute(this._query);
	},
/*
	calcBbox: function(fset) {
		var bbox = null;
		if (fset.features.length == 0) {
			console.log("FeatureSet empty, bbox is null");
			dojo.publish('/toaster/show', ['No features found']);
			return null;
		}

		//initialize w/ the first feature's extent	
		bbox = esri.geometry.webMercatorToGeographic(fset.features[0].geometry.getExtent());
		dojo.forEach(fset.features, function(i){
			//console.log(i.geometry.getExtent());
			bbox = bbox.union(esri.geometry.webMercatorToGeographic(i.geometry.getExtent()));
		});
		console.log(bbox);

		//Normalize the geometry if it extends beyond the antimeridian. May result in a polygon with 2 rings.
		esri.geometry.normalizeCentralMeridian([bbox], this._geometryService, function (geometries) {
			var normalizedGeometry = esri.geometry.geographicToWebMercator(geometries[0]);
			console.log("normalizedGeometry: ",normalizedGeometry.getExtent());
			dojo.publish("/ngdc/FeatureSetExtent",[normalizedGeometry]);
		}, function () {
			console.log("normalize error;")
		});
	}
*/

/*
	calcBbox: function(fset) {
		//console.log('inside calcBbox with ',fset);
		var bbox = null;
		if (fset.features.length == 0) {
			console.log("FeatureSet empty, bbox is null");
			dojo.publish('/toaster/show', ['No features found']);
			return null;
		}

		//initialize w/ the first feature's extent	
		var bbox;
		var counter = 0;
		dojo.forEach(fset.features, function(i){
			esri.geometry.normalizeCentralMeridian([i.geometry.getExtent()], this._geometryService, function (geometries) {
				if (bbox) {
					bbox = bbox.union(geometries[0].getExtent());
				} else {
					bbox = geometries[0].getExtent();
				}
				counter++;
				if (counter >= fset.features.length) {
					dojo.publish("/ngdc/FeatureSetExtent",[bbox]);			
				}
			}, function () {
				console.log("normalize error;")
			});
		});
	}
*/
	calcBbox: function(fset) {
//		console.log('inside calcBbox with ',fset);
		var bbox = null;
		if (fset.features.length == 0) {
			console.log("FeatureSet empty, bbox is null");
			dojo.publish('toaster', ['No features found']);
			return null;
		}

		//initialize w/ the first feature's extent	
		bbox = fset.features[0].geometry.getExtent();
		dojo.forEach(fset.features, function(i){
			//console.log(i.geometry.getExtent());
			bbox = bbox.union(i.geometry.getExtent());
		});
//		console.log("calculated bbox: ",bbox);
		var geoBbox = esri.geometry.webMercatorToGeographic(bbox);
		console.log(geoBbox);
		if (geoBbox.getWidth() >= 180) {
			//TODO toaster not working
			dojo.publish('toaster',[{
				message: 'Unable to zoom to extent of features',
				type: 'fatal',
				duration: 5000
			}]);
			return;
		}
		dojo.publish("/ngdc/FeatureSetExtent",[bbox]);
/*
		//Normalize the geometry if it extends beyond the antimeridian. May result in a polygon with 2 rings.
		esri.geometry.normalizeCentralMeridian([bbox], this._geometryService, function (geometries) {
			var normalizedGeometry = geometries[0];
			console.log("normalizedGeometry: ",normalizedGeometry.getExtent());
			dojo.publish("/ngdc/FeatureSetExtent",[normalizedGeometry]);
		}, function () {
			console.log("normalize error;")
		});
*/
	}
});
