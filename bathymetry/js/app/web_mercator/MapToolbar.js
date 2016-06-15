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
                    {base: 'Ocean Base', overlays: [{id: 'Ocean Reference'}], label: 'Ocean Basemap (Esri)'},
                    {base: 'GEBCO_2014', overlays: [{id: 'World Boundaries and Places'}], label: 'Shaded Relief (GEBCO_2014)'},
                    {base: 'GMRT Unmasked', overlays: [{id: 'Ocean Reference'}], label: 'Global Multi-Resolution Topography (GMRT)'},
                    {base: 'GMRT Masked', overlays: [{id: 'Ocean Reference'}], label: 'Global Multi-Resolution Topography (GMRT),<br/><i>High-Resolution Areas Highlighted</i>'},
                    {base: 'ETOPO1', overlays: [{id: 'World Boundaries and Places'}], label: 'Shaded Relief (ETOPO1)'},
                    {base: 'Light Gray', overlays: [{id: 'Light Gray Reference'}], label: 'Light Gray (Esri)'},
                    {base: 'Dark Gray', overlays: [{id: 'Dark Gray Reference'}], label: 'Dark Gray (Esri)'},
                    {base: 'World Imagery', overlays: [{id: 'World Boundaries and Places'}], label: 'World Imagery (Esri)'},
                    {base: 'NatGeo', label: 'National Geographic (Esri)'} //NatGeo has no boundaries overlay
                ];

                this._overlays = [
                    {
                        label: 'Boundaries/Labels',
                        services: [{id: 'Ocean Reference'}],
                        visible: true
                    }, 
                    {
                        label: 'Regional Bathymetric Contours (from GEBCO_2014)',
                        services: [{id: 'GEBCO_2014 Contours'}],
                        visible: false
                    },
                    {
                        label: '<a href="http://www.nauticalcharts.noaa.gov/mcd/Raster/" target="_blank">NOAA Raster Navigational Charts (RNC®)</a>',
                        services: [{id: 'RNC'}],
                        visible: false
                    },
                    {
                        label: 'Graticule',
                        services: [{id: 'Graticule'}],
                        visible: false
                    }//,
                    /*
                    {
                        label: 'EMODNet Survey Tracks/Polygons',
                        services: [{id: 'EMODNet'}],
                        visible: true
                    }
                    */
                ];

                this._identifyTools = [
                    {label: 'Point (Single-Click)', id: 'point', iconClass: 'identifyByPointIcon'},
                    {label: 'Draw Rectangle', id: 'rect', iconClass: 'identifyByRectIcon'},
                    {label: 'Draw Polygon', id: 'polygon', iconClass: 'identifyByPolygonIcon'},
                    {label: 'Define Bounding Box', id: 'coords', iconClass: 'identifyByCoordsIcon'}
                ];

                //define the default base
                this.defaultBasemapIndex = 0;

                this._validateLayerIds();

            } //end constructor            
        });
    }
);


