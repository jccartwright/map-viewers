define([
    'dojo/_base/declare',
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin', 
    'dojo/string', 
    'dojo/dom-attr',
    'dojo/text!./templates/Header.html'],
    function(
        declare, 
        _WidgetBase, 
        _TemplatedMixin, 
        string, 
        domAttr,
        template
        ){
        return declare([_WidgetBase, _TemplatedMixin], {
            // Our template - important!
            templateString: template,
            image: null,
            breadcrumbs: null,

            // A class to be applied to the root node in our template
            baseClass: 'nceiHeader',

            postCreate: function() {
                this.bannerTitle.innerHTML = this.title;         
                
                this.bannerTitleUrl.href = this.titleUrl;
                this.bannerTitleUrl.title = this.title;
                
                this.bannerImage.src = this.imageSrc;
                this.bannerImage.alt = this.imageAlt;

                this.bannerImageUrl.href = this.imageUrl;
                this.bannerImageUrl.title = this.imageUrlTitle;
            }
        });
    }
);
