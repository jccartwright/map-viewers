define([
    "dojo/_base/declare", 
    "ngdc/MapToolbar"
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
                    {base: 'World Imagery', overlays: ['World Boundaries and Places'], label: 'World Imagery (Esri)'},
                    {base: 'NatGeo', label: 'National Geographic (Esri)'} //NatGeo has no boundaries overlay
                ];

                this._overlays = [
                    {services: ['Ocean Reference'], label: 'Boundaries/Labels'}, //Ocean Basemap/Reference is the default combo
                    {services: ['GEBCO_08 Contours'], label: 'Bathymetry Contours (from GEBCO_08)'},
                    {services: ['RNC'], label: '<a href="http://www.nauticalcharts.noaa.gov/mcd/Raster/" target="_blank">NOAA Raster Navigational Charts (RNC®)</a>'},
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


