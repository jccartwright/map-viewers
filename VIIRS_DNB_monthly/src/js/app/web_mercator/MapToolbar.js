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
                    {base: 'Ocean Base', overlays: [{id: 'Ocean Reference'}], label: 'Ocean Basemap (Esri)'},
                    {base: 'GEBCO_2014', overlays: [{id: 'World Boundaries and Places'}], label: 'Shaded Relief (GEBCO_08)'},
                    {base: 'ETOPO1', overlays: [{id: 'World Boundaries and Places'}], label: 'Shaded Relief (ETOPO1)'},
                    {base: 'Light Gray', overlays: [{id: 'Light Gray Reference'}], label: 'Light Gray (Esri)'},
                    {base: 'Dark Gray', overlays: [{id: 'Dark Gray Reference'}], label: 'Dark Gray (Esri)'},
                    {base: 'World Imagery', overlays: [{id: 'World Boundaries and Places'}], label: 'World Imagery (Esri)'},
                    {base: 'NatGeo', label: 'National Geographic (Esri)'} //NatGeo has no boundaries overlay
                ];

                this._overlays = [
                    {
                        label: 'Boundaries/Labels',
                        services: [{id: 'World Boundaries and Places'}],
                        visible: false
                    },
                    {
                        label: 'Graticule',
                        services: [{id: 'Graticule'}],
                        visible: false
                    }
                ];

                //define the default base
                this.defaultBasemapIndex = 5;

                this._validateLayerIds();

            } //end constructor            
        });
    }
);


