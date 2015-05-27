define([
    'dojo/_base/declare', 
    'ngdc/MapToolbar'
    ],
    function(
        declare, 
        MapToolbar
        ){

        return declare([MapToolbar], {
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
                    {
                        label: 'Boundaries/Labels',
                        services: [{id: 'Ocean Reference'}],
                        visible: true
                    }, 
                    {
                        label: 'Graticule',
                        services: [{id: 'Graticule'}],
                        visible: false
                    }
                ];

                //define the default base
                this.defaultBasemapIndex = 0;

                this._validateLayerIds();

            } //end constructor            
        });
    }
);


