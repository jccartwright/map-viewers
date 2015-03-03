define([
    'dojo/_base/declare',
    'ngdc/MapToolbar',
    'dojo/text!./templates/MapToolbar.html'
    ],
    function(
        declare,
        MapToolbar,
        template 
        ){
        return declare([MapToolbar], {

            templateString: template,
        });
    }
);
