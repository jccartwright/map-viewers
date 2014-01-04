define(["dojo/_base/declare", "ngdc/BasemapToolbar"],
    function(declare, BasemapToolbar){

        return declare([BasemapToolbar], {
            constructor: function() {
                //TODO redesign this data structure
                this._basemaps = [
                    {services: ['Ocean Basemap'], label: 'Ocean Basemap (Esri)', boundariesEnabled: false},
                    {services: ['GEBCO_08'], label: 'Shaded Relief (GEBCO_08)', boundariesEnabled: true},
                    {services: ['ETOPO1'], label: 'Shaded Relief (ETOPO1)', boundariesEnabled: true},
                    {services: ['Light Gray', 'Light Gray Reference'], label: 'Light Gray (Esri)', boundariesEnabled: false},
                    {services: ['World Imagery'], label: 'World Imagery (Esri)', boundariesEnabled: true},
                    {services: ['NatGeo Overview'], label: 'National Geographic (Esri)', boundariesEnabled: false}
                ];

                this._overlays = [
                    {services: ['World Boundaries and Places'], label: 'Boundaries/Labels'},
                    {services: ['Graticule'], label: 'Graticule'}
                ];

                //define the default base
                this.defaultBasemapIndex = 0;

                this._validateLayerIds();

            } //end constructor            
        });
    }
);


