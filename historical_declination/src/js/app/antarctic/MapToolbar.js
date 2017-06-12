define([
    'dojo/_base/declare', 
    'ngdc/MapToolbar',
    'dojo/text!../templates/MapToolbar.html' //Override standard MapToolbar template to remove the identify menu
    ],
    function(
        declare, 
        MapToolbar,
        template
        ){

        return declare([MapToolbar], {
            templateString: template,

            constructor: function() {
                this._basemaps = [
                    {base: 'Antarctic Basemap', overlays: [{id: 'Reference'}], label: 'Antarctic Basemap (IBCSO/GEBCO_08)'}
                ];

                this._overlays = [
                    {
                        label: 'Boundaries/Labels',
                        services: [{id: 'Reference'}],
                        visible: false
                    },
                    {
                        label: 'Graticule',
                        services: [{id: 'Graticule'}],
                        visible: true
                    }
                ];

                //define the default base
                this.defaultBasemapIndex = 0;

                this._validateLayerIds();

            } //end constructor            
        });
    }
);


