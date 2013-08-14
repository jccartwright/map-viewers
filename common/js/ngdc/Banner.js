define(["dojo/_base/declare","dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/text!./templates/Banner.html"],
    function(declare, _WidgetBase, _TemplatedMixin, template){
        return declare([_WidgetBase, _TemplatedMixin], {
            // Our template - important!
            templateString: template,

            // A class to be applied to the root node in our template
            baseClass: "banner",

            imageUrl: null,
            breadcrumbs: null,

            constructor: function() {
                //logger.debug('inside constructor...');
            },

            postMixInProperties: function() {
                //logger.debug('inside postMixInProperties...');

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

                /*
                 * construct URL for viewer logo
                 * TODO: streamline?
                 */
                if (this.imageUrl != null && this.imageUrl.slice(0, 4) === 'http') {
                    //absolute URL - use as is
                } else {
                    //relative to page
                    var img = this.imageUrl;
                    if (!this.imageUrl) {
                        img = "images/mapservice.gif";
                    }

                    //calculate absolute image location
                    var a = window.location.href.split('/');
                    a.pop();
                    a.push(img);
                    this.imageUrl = a.join('/');
                }
            },

            postCreate: function() {
                //logger.debug('inside postCreate...');

                /*
                 * construct HTML for breadcrumbs
                 * TODO: streamline?
                 */
                var template = '<a href="${url}" class="topnav" target="_blank">${label}</a>';
                var content = dojo.string.substitute(template, this.breadcrumbs[0]);
                var i = 0;
                for (i = 1; i < this.breadcrumbs.length; i++) {
                    content += '&nbsp;&gt;&nbsp;' + dojo.string.substitute(template, this.breadcrumbs[i]);
                }
                this.breadcrumbsContainer.innerHTML = content;

                this.bannerDataUrl.href = this.dataUrl;
            }
        });
    }
);