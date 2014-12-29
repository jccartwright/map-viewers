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
                    {base: 'Ocean Base', overlays: ['Ocean Reference'], label: 'Ocean Basemap (Esri)'},
                    {base: 'GEBCO_08', overlays: ['World Boundaries and Places'], label: 'Shaded Relief (GEBCO_08)'},
                    {base: 'ETOPO1', overlays: ['World Boundaries and Places'], label: 'Shaded Relief (ETOPO1)'},
                    {base: 'Light Gray', overlays: ['Light Gray Reference'], label: 'Light Gray (Esri)'},
                    {base: 'Dark Gray', overlays: ['Dark Gray Reference'], label: 'Dark Gray (Esri)'},
                    {base: 'World Imagery', overlays: ['World Boundaries and Places'], label: 'World Imagery (Esri)'},
                    {base: 'NatGeo', label: 'National Geographic (Esri)'} //NatGeo has no boundaries overlay
                ];

                this._overlays = [
                    {services: ['Ocean Reference'], label: 'Boundaries/Labels'}, //Ocean Basemap/Reference is the default combo
                    {services: ['Graticule'], label: 'Graticule'}
                ];

                //define the default base
                this.defaultBasemapIndex = 1;

                this._validateLayerIds();

            } //end constructor            
        });
    }
);


