define(["dojo/_base/declare", "ngdc/BasemapToolbar"],
    function(declare, BasemapToolbar){

        return declare([BasemapToolbar], {
            constructor: function() {
                //TODO redesign this data structure
                this._basemaps = [
                    {services: ['Bathy Hillshade2'], label: 'Shaded Relief', boundariesEnabled: true},
                    {services: ['GSHHS'], label: 'Simple', boundariesEnabled: true}
                ];

                this._overlays = [
                    {services: ['World Reference Map'], label: 'Boundaries/Labels'},
                    {services: ['Graticule'], label: 'Graticule'}
                ];

                //define the default base
                this.defaultBasemapIndex = 0;

                this._validateLayerIds();

            } //end constructor            
        });
    }
);


