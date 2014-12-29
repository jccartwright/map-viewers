define([
    'dojo/_base/declare', 
    'ngdc/MapToolbar',
    'dojo/text!../templates/MapToolbar.html' //Override standard MapToolbar template to remove the identify menu
    ],
    function(
        declare, 
        MapToolbar,
        template
        ){

        return declare([MapToolbar], {
            templateString: template,

            constructor: function() {
                this._basemaps = [
                    {base: 'Arctic Basemap', overlays: ['Reference'], label: 'Arctic Basemap (IBCAO/GEBCO_08)'}
                ];

                this._overlays = [
                    {services: ['Reference'], label: 'Boundaries/Labels'},
                    {services: ['Graticule'], label: 'Graticule'}
                ];

                //define the default base
                this.defaultBasemapIndex = 0;

                this._validateLayerIds();

            } //end constructor            
        });
    }
);


