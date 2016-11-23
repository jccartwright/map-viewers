dojo.provide('mosaic.WCSPanel');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require("dijit.form.NumberTextBox");
dojo.require("dijit.form.Textarea");
dojo.require("dijit.form.Button");
dojo.require('dojo.string');

dojo.declare('mosaic.WCSPanel',[dijit._Widget, dijit._Templated],{
	templatePath: dojo.moduleUrl('mosaic','templates/WCSPanel.html'),
	templateString: null,
	widgetsInTemplate: true,
	geoextentSub: null,
	imageSelectSub: null,
	imageName: null,

	buildWcsUrl: function() {
		//image name required.  TODO: also check for bbox
		if (this.imageName) {
			url += this.imageName;
		} else {
			//TODO popup toaster
			console.warn("No image selected");
			return;
		} 

		var urlTemplate = 'https://gis.ngdc.noaa.gov/cgi-bin/public/mosaic/${0}?request=GetCoverage&service=WCS&version=1.0.0&COVERAGE=${0}&crs=EPSG:4326&format=geotiff&resx=0.05&resy=0.05&bbox=${1},${2},${3},${4}';
		var url = dojo.string.substitute(urlTemplate,[
			this.imageName,
			this.minx.get('value'),
			this.miny.get('value'),
			this.maxx.get('value'),
			this.maxy.get('value')]);   

		this.wcsUrl.set('value',url);
	},
	
	postCreate: function() {
		this.imageSelectSub = dojo.subscribe('/ngdc/imageSelected', this, function(name){
			this.imageName = name;
		});
		
		this.geoextentSub = dojo.subscribe('/ngdc/drawRectangle', this, function(graphic) {
			var extent = graphic.geometry;  //should always be type esri.geometry.Extent
			//console.log('caught /ngdc/drawRectangle event with ', extent);
			
			this.minx.set('value', extent.xmin);
			this.miny.set('value', extent.ymin);
            this.maxx.set('value', extent.xmax);
            this.maxy.set('value', extent.ymax);
			
			//this.minx.attr('value',(bbox.xmin < -180)? -180: bbox.xmin);
            //this.miny.attr('value',(bbox.ymin < -90) ? -90: bbox.ymin);
            //this.maxx.attr('value',(bbox.xmax > 180) ? 180: bbox.xmax);
            //this.maxy.attr('value',(bbox.ymax > 90) ? 90: bbox.ymax);
			
			this.buildWcsUrl();
		});
		
		this.connect(this.minx, "onBlur", "buildWcsUrl");
		this.connect(this.miny, "onBlur", "buildWcsUrl");
		this.connect(this.maxx, "onBlur", "buildWcsUrl");
		this.connect(this.maxy, "onBlur", "buildWcsUrl");

		this.connect(this.resetBtn, "onClick", function() {
			this.minx.attr('value','');
            this.miny.attr('value','');
            this.maxx.attr('value','');
            this.maxy.attr('value','');
			if (globals.map) {
				globals.map.graphics.clear();	
			} else {
				console.warn("no Map instance found");
			}
        });

		this.connect(this.wcsUrl,'onChange',function(e){
			console.log(e);
			this.downloadBtn.href = this.wcsUrl.get('value');
		});
/*		
		this.connect(this.downloadBtn, "onClick", function() {
			var url = this.wcsUrl.get('value');
			console.log('downloading URL:'+url);
			var win = window.open(url);
			//globals.downloadDialog.set('href',url);
			//globals.downloadDialog.show();
        });
*/
	},
	
	destroy: function() {
		if (this.geoextentSub) {
			dojo.unsubscribe(this.geoextentSub);
		}
		if (this.imageSelectSub) {
			dojo.unsubscribe(this.imageSelectSub);
		}
	}
});