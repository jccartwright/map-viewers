define([
    'dojo/_base/declare', 
    'ngdc/MapToolbar'],
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
                        visible: false
                    }, 
                    {
                        label: 'Bathymetric Contours (IBCAO/GEBCO_08)',
                        services: [{id: 'IBCAO Contours'}],
                        visible: false
                    },
                    {
                        label: 'Graticule',
                        services: [{id: 'Graticule'}],
                        visible: true
                    }
                ];

                this._identifyTools = [
                    {label: 'Point (Single-Click)', id: 'point', iconClass: 'identifyByPointIcon'},
                    {label: 'Draw Rectangle', id: 'rect', iconClass: 'identifyByRectIcon'},
                    {label: 'Define Bounding Box', id: 'coords', iconClass: 'identifyByCoordsIcon'}
                ];

                //define the default base
                this.defaultBasemapIndex = 0;

                this._validateLayerIds();

            } //end constructor            
        });
    }
);


