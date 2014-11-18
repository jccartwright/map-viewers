define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/on',
    'ngdc/MapToolbar',
    'dijit/form/Select',
    'dijit/form/FilteringSelect',
    'dojo/request/script',
    'dojo/store/Memory',
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
        script,
        Memory,
        template
        ){

        return declare([MapToolbar], {

            templateString: template,

            constructor: function() {
                this._basemaps = [
                    {base: 'Ocean Base', overlays: [{id: 'Ocean Reference'}], label: 'Ocean Basemap (Esri)'},
                    {base: 'GEBCO_08', overlays: [{id: 'World Boundaries and Places'}], label: 'Shaded Relief (GEBCO_08)'},
                    {base: 'ETOPO1', overlays: [{id: 'World Boundaries and Places'}], label: 'Shaded Relief (ETOPO1)'},
                    {base: 'Light Gray', overlays: [{id: 'Light Gray Reference'}], label: 'Light Gray (Esri)'},
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
                        label: 'Bathymetry Contours (from GEBCO_08)',
                        services: [{id: 'GEBCO_08 Contours'}],
                        visible: false
                    },
                    {
                        label: 'Graticule',
                        services: [{id: 'Graticule'}],
                        visible: false
                    },
                    {
                        label: 'EEZs (NOAA OCS and VLIZ)',
                        services: [{id: 'ECS Catalog', sublayers: [21, 22]}],
                        visible: true
                    },
                    {
                        label: 'International ECS Areas',
                        services: [{id: 'ECS Catalog', sublayers: [40]}],
                        visible: false
                    }
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

            }, //end constructor

            postCreate: function() {
                this.inherited(arguments);

                this.populateRegionSelect();
                this.populateScenarioSelect();

                on(this.regionSelect, 'change', lang.hitch(this, function() {
                    topic.publish('/ecs_catalog/selectRegion', parseInt(this.regionSelect.get('value')));
                }));

                on(this.scenarioSelect, 'change', lang.hitch(this, function() {
                    topic.publish('/ecs_catalog/selectScenario', parseInt(this.scenarioSelect.get('value')));
                }));
            },

            /*
             * Initialize the regions Select widget.
             * Gets the list of regions via ajax from the catalog app.
             */
            populateRegionSelect: function() {
                var ajaxArgs = {
                    preventCache: true,
                    //handleAs: 'json'
                    jsonp: 'callback'
                };
                script.get('https://www.ngdc.noaa.gov/ecs-catalog/rest/region.json', ajaxArgs).then(lang.hitch(this, function(regionData) {
                    //Create the store
                    regionData.identifier = 'objectid';
                    regionData.label = 'name';
                    this.regionStore = new Memory({data: regionData});

                    //Traverse the store and populate the regionSelect. Each region is checked to see if it has children (which are indented in the list)
                    var results = this.regionStore.query({name: 'Global'});
                    if ( results.length > 0 ) {
                        var globalRegionId = results[0].objectid;
                        this.regionSelect.addOption({label: '<i>Global</i>', value: String(globalRegionId)});

                        var children = this.regionStore.query({parent_id: globalRegionId});
                        for ( var i = 0; i < children.length; i++ ) {
                            var name = children[i].name;
                            var id = children[i].objectid;
                            this.regionSelect.addOption({label: '<i>' + name + '</i>', value: String(id)});

                            var subChildren = this.regionStore.query({parent_id: id});
                            for ( var j = 0; j < subChildren.length; j++ ) {
                                var name = subChildren[j].name;
                                var id = subChildren[j].objectid;
                                this.regionSelect.addOption({label: '&nbsp;&nbsp;' + name, value: String(id)});
                            }
                        }
                    }
                }), function(error) {
                    console.log('Error retrieving regions json');
                    alert('Error retrieving ECS regions. Are you logged into the ecs-catalog application?');
                });
            },

            /*
             * Initialize the scenarioSelect FilteringSelect widget.
             * Gets the list of scenarios via ajax from the catalog app.
             */
            populateScenarioSelect: function() {

                var ajaxArgs = {
                    preventCache: true,
                    //handleAs: 'json',
                    jsonp: 'callback'
                };
                script.get('https://www.ngdc.noaa.gov/ecs-catalog/rest/bosScenario.json', ajaxArgs).then(lang.hitch(this, function(jsonData) {
                    //Populate a new object from the json that will be used to create the store
                    var scenarioData = {};
                    scenarioData.identifier = 'id';
                    scenarioData.label = 'name';
                    scenarioData.items = [];
                    scenarioData.items[0] = {name: 'All Scenarios', id: 0, region: 0};

                    for ( var i = 0; i < jsonData.items.length; i++ ) {
                        scenarioData.items.push({
                            name: jsonData.items[i].title,
                            id: String(jsonData.items[i].id), //needs to be string to allow set('value', id) on the widget
                            region: jsonData.items[i].region.id
                        });
                    }

                    //Create the store. Apparently, we can't use a Memory with a FilteringSelect in Dojo 1.6
                    //this.scenarioStore = new dojo.data.ItemFileWriteStore({data: scenarioData});
                    this.scenarioStore = new Memory({data: scenarioData});

                    //Populate the FilteringSelect with the store.
                    this.scenarioSelect.store = this.scenarioStore;
                    
                    this.scenarioSelect.set('value', 0);
                    //selectScenario(0); //Select the "All Scenarios" option by default.                    
                }), function(error) {
                    console.log('Error retrieving regions json');
                    alert('Error retrieving ECS regions. Are you logged into the ecs-catalog application?');
                });
            },


        });
    }
);


