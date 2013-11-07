dojo.provide('banner.Banner');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require("dojo.string");


dojo.declare('banner.Banner', [dijit._Widget, dijit._Templated], {
	templatePath: dojo.moduleUrl('banner', 'templates/Banner.html'),
	image: null,
	breadcrumbs: null,
	
	//lifecycle extension points
	postMixInProperties: function(){
		//dojo.moduleUrl('banner','resources/sample.gif') points to image w/in dijit directory
		
		if (!this.breadcrumbs) {
			//set default breadcrumbs
			this.breadcrumbs = [
				{url: 'http://www.noaa.gov', label: 'NOAA'}, 
				{url: 'http://www.nesdis.noaa.gov', label: 'NESDIS'}, 
				{url: 'http://www.ngdc.noaa.gov', label: 'NGDC'}
			];
		}
		
		if (!this.dataUrl) {
			//set default data URL to point to current viewer root
			this.dataUrl = '';
		}
		
		if (this.image != null && this.image.slice(0, 4) === 'http') {
			//absolute URL - use as is
		} else {
			//relative to page
			var img = this.image;
			if (!this.image) {
				img = "images/mapservice.gif";
			}
			
			//calculate absolute image location
			var a = window.location.href.split('/');
			a.pop();
			a.push(img);
			this.image = a.join('/');
		}
	},
	
	postCreate: function(){
		var template = '<a href="${url}" class="topnav" target="_blank">${label}</a>';
		var content = dojo.string.substitute(template, this.breadcrumbs[0]);
		var i = 0;
		for (i = 1; i < this.breadcrumbs.length; i++) {
			content += '&nbsp;&gt;&nbsp;' + dojo.string.substitute(template, this.breadcrumbs[i]);
		}
		this.breadcrumbsCell.innerHTML = content;
		
		this.bannerDataUrl.href = this.dataUrl;
	}
});
