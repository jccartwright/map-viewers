define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/on',
    'app/MapToolbar',
    'dijit/form/Select',
    'dijit/form/FilteringSelect',
    'dojo/text!../templates/MapToolbar.html'
    ],
    function(
        declare,
        lang,
        topic,
        on,
        MapToolbar,
        Select,
        FilteringSelect,
        template
        ){

        return declare([MapToolbar], {

            templateString: template,
            
            constructor: function() {
                this._basemaps = [
                    {base: 'Arctic Basemap', overlays: [{id: 'Reference'}], label: 'Arctic Basemap (IBCAO/GEBCO_08)'},
                    {base: 'Gray Continents', overlays: [{id: 'Reference'}], label: 'Gray Continents'}
                ];

                this._overlays = [
                    {
                        label: 'Boundaries/Labels',
                        services: [{id: 'Reference'}],
                        visible: true
                    }, 
                    {
                        label: 'Graticule',
                        services: [{id: 'Graticule'}],
                        visible: false
                    },
                    {
                        label: 'EEZs (NOAA OCS and VLIZ)',
                        services: [{id: 'ECS Catalog', sublayers: [19, 20]}],
                        visible: true
                    },
                    {
                        label: 'International ECS Areas',
                        services: [{id: 'ECS Catalog', sublayers: [59]}],
                        visible: false
                    }
                ];

                this._identifyTools = [
                    {label: 'Point (Single-Click)', id: 'point', iconClass: 'identifyByPointIcon'},
                    {label: 'Draw Rectangle', id: 'rect', iconClass: 'identifyByRectIcon'},
                    {label: 'Draw Polygon', id: 'polygon', iconClass: 'identifyByPolygonIcon'}
                ];

                //define the default base
                this.defaultBasemapIndex = 0;

                this._validateLayerIds();
            } //end constructor            
        });
    }
);


