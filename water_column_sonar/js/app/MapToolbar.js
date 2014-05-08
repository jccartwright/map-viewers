define(["dojo/_base/declare", "ngdc/MapToolbar"],
    function(declare, MapToolbar){

        return declare([MapToolbar], {
            constructor: function() {
                //TODO redesign this data structure
                this._basemaps = [
                    {services: ['Ocean Base', 'Ocean Reference'], label: 'Ocean Basemap (Esri)', boundariesEnabled: false},

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

                this._identifyTools = [
                    {label: 'Point (Single-Click)', id: 'point', iconClass: 'identifyByPointIcon'},
                    {label: 'Draw Rectangle', id: 'rect', iconClass: 'identifyByRectIcon'},
                    {label: 'Draw Polygon', id: 'polygon', iconClass: 'identifyByPolygonIcon'},
                    {label: 'Draw Freehand Polygon', id: 'freehand-polygon', iconClass: 'identifyByPolygonIcon'},
                    {label: 'Define Bounding Box', id: 'coords', iconClass: 'identifyByCoordsIcon'}
                ];

                //define the default base
                this.defaultBasemapIndex = 0;

                this._validateLayerIds();

            } //end constructor            
        });
    }
);


