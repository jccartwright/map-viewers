define([
    'dojo/_base/declare', 
    'app/MapToolbar'],
    function(
        declare, 
        MapToolbar
        ){

        return declare([MapToolbar], {
            constructor: function() {
                this._basemaps = [
                    {base: 'Arctic Basemap', overlays: [{id: 'Reference'}], label: 'Arctic Basemap (IBCAO/GEBCO_08)'}
                ];

                this._overlays = [
                    {
                        label: 'Boundaries/Labels',
                        services: [{id: 'Reference'}],
                        visible: true
                    }, 
                    {
                        label: 'Bathymetry Contours (IBCAO/GEBCO_08)',
                        services: [{id: 'IBCAO Contours'}],
                        visible: false
                    },
                    {
                        label: 'Graticule',
                        services: [{id: 'Graticule'}],
                        visible: false
                    },
                    {
                        label: 'Multibeam Surveys',
                        services: [{id: 'Multibeam'}],
                        visible: true
                    }
                ];

                this._identifyTools = [
                    //{label: 'Point (Single-Click)', id: 'point', iconClass: 'identifyByPointIcon'},
                    //{label: 'Draw Rectangle', id: 'rect', iconClass: 'identifyByRectIcon'},
                    //{label: 'Draw Polygon', id: 'polygon', iconClass: 'identifyByPolygonIcon'},
                    {label: 'Define Bounding Box', id: 'coords', iconClass: 'identifyByCoordsIcon'}
                ];

                //define the default base
                this.defaultBasemapIndex = 0;

                this._validateLayerIds();

            } //end constructor            
        });
    }
);


