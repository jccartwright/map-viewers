define(["dojo/_base/declare", "ngdc/MapToolbar"],
    function(declare, MapToolbar){

        return declare([MapToolbar], {
            constructor: function() {
                this._basemaps = [
                    {base: 'Arctic Basemap', overlays: ['Reference'], label: 'Arctic Basemap (IBCAO/GEBCO_08)'}
                ];

                this._overlays = [
                    {services: ['Reference'], label: 'Boundaries/Labels'},
                    {services: ['IBCAO Contours'], label: 'Bathymetry Contours (IBCAO/GEBCO_08)'},
                    {services: ['Graticule'], label: 'Graticule'}
                ];

                this._identifyTools = [
                    {label: 'Point (Single-Click)', id: 'point', iconClass: 'identifyByPointIcon'},
                    {label: 'Draw Rectangle', id: 'rect', iconClass: 'identifyByRectIcon'},
                    {label: 'Draw Polygon', id: 'polygon', iconClass: 'identifyByPolygonIcon'},
                    {label: 'Draw Freehand Polygon', id: 'freehand-polygon', iconClass: 'identifyByPolygonIcon'}
                ];

                //define the default base
                this.defaultBasemapIndex = 0;

                this._validateLayerIds();

            } //end constructor            
        });
    }
);


