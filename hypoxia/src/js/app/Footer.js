define([
    'dojo/_base/declare',
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin', 
    'dojo/text!./templates/Footer.html'],
    function(
        declare, 
        _WidgetBase, 
        _TemplatedMixin, 
        template
        ){
        return declare([_WidgetBase, _TemplatedMixin], {
            // Our template - important!
            templateString: template,
            image: null,
            breadcrumbs: null,

            // A class to be applied to the root node in our template
            baseClass: 'nceiFooter'
        });
    }
);
