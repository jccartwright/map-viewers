define(["dojo/_base/declare", "ngdc/BasemapToolbar"],
    function(declare, BasemapToolbar){

        return declare([BasemapToolbar], {
            constructor: function() {
                //TODO redesign this data structure
                this._basemaps = [
                    {services: ['basemap'], label: 'IBCAO/GEBCO Shaded Relief', boundariesEnabled: false}
                ];

                this._overlays = [
                    {services: ['reference'], label: 'Boundaries/Labels'},
                    {services: ['contours'], label: 'Contours'},
                    {services: ['Graticule'], label: 'Graticule'}
                ];

                //define the default base
                this.defaultBasemapIndex = 0;

                this._validateLayerIds();
            } //end constructor
        });
    }
);


