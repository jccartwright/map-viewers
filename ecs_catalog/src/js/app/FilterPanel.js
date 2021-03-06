define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/topic',
    'dojo/on',
    'dijit/form/Select',
    'dijit/form/FilteringSelect',
    'dojo/request/script',
    'dojo/request/xhr',
    'dojo/store/Memory',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!./templates/FilterPanel.html'
    ],
    function(
        declare,
        lang,
        array,
        topic,
        on,
        Select,
        FilteringSelect,
        script,
        xhr,
        Memory,
        _WidgetBase, 
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        template){

        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            // Our template - important!
            templateString: template,
            // A class to be applied to the root node in our template
            baseClass: 'filterPanel',

            postCreate: function() {
                this.inherited(arguments);

                this.populateRegionSelect();
                this.populateScenarioSelect();

                this.selectRegionHandler = on.pausable(this.regionSelect, 'change', lang.hitch(this, function() {
                    var regionId = parseInt(this.regionSelect.get('value'));                    
                    this.selectRegion(regionId);                    
                }));

                this.selectPhaseHandler = on.pausable(this.phaseSelect, 'change', lang.hitch(this, function() {
                    var phase = this.phaseSelect.get('value');
                    this.selectPhase(phase);                    
                }));

                this.selectScenarioHandler = on.pausable(this.scenarioSelect, 'change', lang.hitch(this, function() {
                    var scenarioId = parseInt(this.scenarioSelect.get('value'));
                    this.selectScenario(scenarioId);
                }));                
            },

            setRegion: function(region) {
                this.regionSelect.set('value', String(region)); //onChange calls selectRegion()
            },

            /*
             * Initialize the regions Select widget.
             * Gets the list of regions via ajax from the catalog app.
             */
            populateRegionSelect: function() {
                var ajaxArgs = {
                    preventCache: true,
                    handleAs: 'json'
                };

                var url = window.location.protocol + '//' + window.location.host + '/ecs-catalog/rest/region?max=100';

                xhr(url, ajaxArgs).then(lang.hitch(this, function(regionData) {
                //script.get(url, ajaxArgs).then(lang.hitch(this, function(regionData) {
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
                    topic.publish('/ecs_catalog/regionsPopulated');
                }), function(error) {
                    console.log('Error retrieving regions json');
                    //alert('Error retrieving ECS regions. Are you logged into the ecs-catalog application?');
                });
            },

            /*
             * Initialize the scenarioSelect FilteringSelect widget.
             * Gets the list of scenarios via ajax from the catalog app.
             */
            populateScenarioSelect: function() {

                var ajaxArgs = {
                    preventCache: true,
                    handleAs: 'json'
                };

                var url = window.location.protocol + '//' + window.location.host + '/ecs-catalog/rest/bosScenario?max=100';

                xhr(url, ajaxArgs).then(lang.hitch(this, function(jsonData) {
                //script.get(url, ajaxArgs).then(lang.hitch(this, function(jsonData) {
                    //Populate a new object from the json that will be used to create the store
                    var scenarioData = {};
                    scenarioData.identifier = 'id';
                    scenarioData.label = 'name';
                    scenarioData.items = [];
                    scenarioData.items[0] = {name: 'None Selected', id: 0, region: 0};

                    for ( var i = 0; i < jsonData.length; i++ ) {
                        scenarioData.items.push({
                            name: jsonData[i].title,
                            id: String(jsonData[i].id), //needs to be string to allow set('value', id) on the widget
                            region: jsonData[i].region.id,
                            phase: jsonData[i].phase
                        });
                    }

                    this.scenarioStore = new Memory({data: scenarioData});

                    //Populate the FilteringSelect with the store.
                    this.scenarioSelect.store = this.scenarioStore;
                    
                    this.scenarioSelect.set('value', 0); //Select the "None Selected" option by default.
                    this.selectPhase('ONE'); //Select Phase 1 by default.
                }), function(error) {
                    console.log('Error retrieving scenarios json');
                    //alert('Error retrieving BOS scenarios. Are you logged into the ecs-catalog application?');
                });
            },

            selectRegion: function(regionId) {
                var regions = [];
                var regionName = this.regionStore.query({objectid: regionId})[0].name;

                if (regionName !== 'Global') {
                    regions.push(regionId);

                    //Get the current region's children, if they exist
                    var children = this.regionStore.query({parent_id: regionId});
                    for (var i = 0; i < children.length; i++) {
                        regions.push(children[i].objectid);
                    }
                }

                //Filter the scenario FilteringSelect by region
                regions.push(0); //add the dummy region so "None Selected" shows up in the list
                if (regionName === 'Global') {
                    filter = /.*/; //show all scenarios
                } else {
                    filter = new RegExp('^(' + regions.join('|') + ')$', 'm'); //'m' or multiline seems to be required for FilteringSelect to work properly
                }
                this.scenarioSelect.query.region = filter;

                if (this.scenarioChosen) {
                    //The user just clicked on a scenario. After filtering the scenario list by region, make sure the current scenario is re-selected.
                    //Pause the handler so it doesn't go into a loop.
                    this.selectScenarioHandler.pause();
                    this.scenarioSelect.set('value', this.scenarioChosen);
                    this.selectScenarioHandler.resume();
                } else {
                    //Select "None Selected" scenario by default
                    this.scenarioSelect.set('value', 0);
                }
                this.scenarioChosen = 0; //Revert to original behavior; no scenario was just clicked on

                topic.publish('/ecs_catalog/selectRegion', parseInt(this.regionSelect.get('value'))); //Publish to AppLoader.js which will do the filtering
            },

            selectPhase: function(phase) {
                //Filter the scenario FilteringSelect by phase
                if (phase == 'ONE') {
                    this.scenarioSelect.query.phase = 1;
                } else if (phase == 'TWO') {
                    this.scenarioSelect.query.phase = 2;
                } else if (phase == 'THREE') {
                    this.scenarioSelect.query.phase = 3;
                } else if (phase == 'FOUR') {
                    this.scenarioSelect.query.phase = 4;
                }
                //Select "None Selected" scenario by default
                this.scenarioSelect.set('value', 0);          

                topic.publish('/ecs_catalog/selectPhase', phase); //Publish to AppLoader.js which will do the filtering
            },

            selectScenario: function(scenarioId) {
                //After selecting a scenario, also select that scenario's region.             
                if (scenarioId) {                 
                    this.scenarioChosen = scenarioId;
                    var regionId = this.scenarioStore.query({id: scenarioId})[0].region;
                    this.regionSelect.set('value', regionId);
                }
                topic.publish('/ecs_catalog/selectScenario', scenarioId); //Publish to AppLoader.js which will do the filtering
            }

        });
    }
);


