define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/topic',
    'dojo/on',    
    'dojo/dom',
    'dojo/request/xhr',
    'dojo/store/Memory',
    'dijit/registry',
    'dijit/form/RadioButton',
    'dijit/form/FilteringSelect',
    'esri/tasks/query', 
    'esri/tasks/QueryTask',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'app/SearchDialog',
    'dojo/text!./templates/LayersPanel.html'],
    function(
        declare, 
        lang,
        array,
        topic,
        on,
        dom,
        xhr,
        Memory,
        registry,
        RadioButton,
        FilteringSelect,
        Query,
        QueryTask,
        _WidgetBase, 
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        SearchDialog,
        template){
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            // Our template - important!
            templateString: template,
            // A class to be applied to the root node in our template
            baseClass: 'layersPanel',

            postCreate: function() {
                this.inherited(arguments);

                xhr.get('repositories.json', {
                    preventCache: true,
                    handleAs: 'json',
                }).then(lang.hitch(this, function(data){
                    if (data.items) {
                        //data.items.unshift({id: 'All', name: 'All'});
                        this.populateRepositorySelect(data.items);
                    }
                }), function(err){
                    logger.error('Error retrieving repositories JSON: ' + err);
                });

                var queryTask = new QueryTask('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/sample_index_dynamic/MapServer/0');

                var query = new Query();
                query.where = '1=1';
                query.returnGeometry = false;
                query.returnDistinctValues = true;

                query.outFields = ['CRUISE', 'FACILITY_CODE'];
                query.orderByFields = ['CRUISE', 'FACILITY_CODE'];
                queryTask.execute(query, lang.hitch(this, function(results) {
                    this.populateCruiseSelect(results);
                }), function(error) {
                    logger.error(error);
                });

                query.outFields = ['PLATFORM'];
                query.orderByFields = ['PLATFORM'];
                queryTask.execute(query, lang.hitch(this, function(results) {
                    this.populatePlatformSelect(results);
                }), function(error) {
                    logger.error(error);
                });

                query.outFields = ['LAKE'];
                query.orderByFields = ['LAKE'];
                queryTask.execute(query, lang.hitch(this, function(results) {
                    this.populateLakeSelect(results);
                }), function(error) {
                    logger.error(error);
                });

                query.outFields = ['DEVICE'];
                query.orderByFields = ['DEVICE'];
                queryTask.execute(query, lang.hitch(this, function(results) {
                    this.populateDeviceSelect(results);
                }), function(error) {
                    logger.error(error);
                });

                on(this.searchButton, 'click', lang.hitch(this, function() {
                    this.executeSearch();
                }));  

                on(this.resetButton, 'click', lang.hitch(this, function() {
                    this.resetSearch();
                }));  

                this.isShowTableToggled = true;
                on(this.showHideTableButton, 'click', lang.hitch(this, function() {
                    if (this.isShowTableToggled) {
                        this.showHideTableButton.set('label', 'Hide Table');
                        this.isShowTableToggled = false;
                        topic.publish('/sample_index/ShowFeatureTable');
                    }
                    else {
                        this.showHideTableButton.set('label', 'Show Table');
                        this.isShowTableToggled = true;
                        topic.publish('/sample_index/HideFeatureTable');
                    }
                }));
            },

            setSelectedRepository: function(repository) {
                this.repositorySelect.set('value', repository);
            },

            populateRepositorySelect: function(items) {
                this.repositorySelect = new FilteringSelect({
                    name: 'id',
                    searchAttr: 'id',
                    labelAttr: 'label',
                    labelType: 'html',
                    placeHolder: 'All Repositories',
                    maxHeight: -1,
                    required: false,
                    style: 'width: 100%; max-width: 350px'
                });

                this.repositorySelect.store = new Memory({data: items});
                this.repositorySelect.placeAt(this.repositorySelectDiv);
                this.repositorySelect.startup();

                on(this.repositorySelect, 'change', lang.hitch(this, function(){
                    this.cruiseSelect.set('value', '');
                    this.filterCruiseSelect(this.repositorySelect.get('value'));
                }));  
            },

            populateCruiseSelect: function(results) {   
                var items = this.getCruiseStoreItems(results, 'CRUISE');
                this.cruiseStore = new Memory({data: {identifier: 'id', items: items}});

                this.cruiseSelect = new FilteringSelect({
                    name: 'id',
                    store: this.cruiseStore,
                    searchAttr: 'id',
                    required: false,
                    placeHolder: 'All Cruises',
                    style: 'width: 100%; max-width: 350px'
                });

                //Disable the validator so we can type any value into the box (e.g. wildcards).
                this.cruiseSelect.validate = function() { 
                    return true; 
                };
                this.cruiseSelect.placeAt(this.cruiseSelectDiv);  
            },

            populatePlatformSelect: function(results) {   
                var items = this.getStoreItems(results, 'PLATFORM');
                this.platformStore = new Memory({data: {identifier: 'id', items: items}});

                this.platformSelect = new FilteringSelect({
                    name: 'id',
                    store: this.platformStore,
                    searchAttr: 'id',
                    required: false,
                    placeHolder: 'All Platforms',
                    style: 'width: 100%; max-width: 350px'
                });

                //Disable the validator so we can type any value into the box (e.g. wildcards).
                this.platformSelect.validate = function() { 
                    return true; 
                };
                this.platformSelect.placeAt(this.platformSelectDiv);  
            },

            populateLakeSelect: function(results) {   
                var items = this.getStoreItems(results, 'LAKE');
                this.lakeStore = new Memory({data: {identifier: 'id', items: items}});

                this.lakeSelect = new FilteringSelect({
                    name: 'id',
                    store: this.lakeStore,
                    searchAttr: 'id',
                    required: false,
                    placeHolder: 'All Lakes',
                    style: 'width: 100%; max-width: 350px'
                });

                //Disable the validator so we can type any value into the box (e.g. wildcards).
                this.lakeSelect.validate = function() { 
                    return true; 
                };
                this.lakeSelect.placeAt(this.lakeSelectDiv);  
            },

            populateDeviceSelect: function(results) {   
                var items = this.getStoreItems(results, 'DEVICE');
                this.deviceStore = new Memory({data: {identifier: 'id', items: items}});

                this.deviceSelect = new FilteringSelect({
                    name: 'id',
                    store: this.deviceStore,
                    searchAttr: 'id',
                    required: false,
                    placeHolder: 'All Devices',
                    style: 'width: 100%; max-width: 350px'
                });

                //Disable the validator so we can type any value into the box (e.g. wildcards).
                this.deviceSelect.validate = function() { 
                    return true; 
                };
                this.deviceSelect.placeAt(this.deviceSelectDiv);  
            },

            filterCruiseSelect: function(repository) {
                if (repository === '') {
                    this.cruiseSelect.set('query', {repository: /.*/});
                    this.cruiseSelect.set('placeHolder', 'All Cruises');
                } else {
                    this.cruiseSelect.set('query', {repository: repository});
                    this.cruiseSelect.set('placeHolder', 'All ' + repository + ' Cruises');
                }
            },

            getCruiseStoreItems: function(results) {
                var items = [];

                array.forEach(results.features, function(feature) {
                    var cruise = feature.attributes['CRUISE'];
                    var repository = feature.attributes['FACILITY_CODE'];
                    var id = cruise + ' (' + repository + ')';
                    //var id = cruise;
                    items.push({id: id, cruise: cruise, repository: repository});
                });

                return items;
            },

            getStoreItems: function(results, attributeName) {
                var items = [];

                array.forEach(results.features, function(feature) {
                    var value = feature.attributes[attributeName];
                    if (value && value !== 'null') {
                        items.push({id: value});
                    }
                });

                return items;
            },
            
            disableResetButton: function() {
                this.resetButton.set('disabled', true);
            },

            enableResetButton: function() {
                this.resetButton.set('disabled', false);
            },

            disableShowTableButton: function() {
                this.showHideTableButton.set('disabled', true);
                this.showHideTableButton.set('label', 'Show Table');
            },

            enableShowTableButton: function() {
                this.showHideTableButton.set('disabled', false);
                this.showHideTableButton.set('label', 'Show Table');
            },

            executeSearch: function() {
                var values = {};

                //Use _lastDisplayedValue instead of value to handle if a user typed in a string (i.e. with wildcard) that doesn't match anything in the store. Otherwise value is empty.
                values.repository = this.repositorySelect.get('_lastDisplayedValue');

                //values.cruise = this.cruiseSelect.get('_lastDisplayedValue');
                if (this.cruiseSelect.get('_lastDisplayedValue') !== '') {
                    values.cruise = this.cruiseSelect.get('item').cruise;
                    values.repository = this.cruiseSelect.get('item').repository;
                }

                values.platform = this.platformSelect.get('_lastDisplayedValue');
                values.lake = this.lakeSelect.get('_lastDisplayedValue');
                values.device = this.deviceSelect.get('_lastDisplayedValue');
                values.minWaterDepth = this.minWaterDepthSpinner.get('value');
                values.maxWaterDepth = this.maxWaterDepthSpinner.get('value');
                values.startYear = this.startYearSpinner.get('value');
                values.endYear = this.endYearSpinner.get('value');

                if (this.isDefault(values)) {
                    topic.publish('/sample_index/ResetSearch');
                } else {       
                    topic.publish('/sample_index/Search', values);
                }                
            },
                
            isDefault: function(values) {
                return (!values.startYear && !values.endYear && 
                    this.repositorySelect.get('_lastDisplayedValue') === '' &&
                    this.cruiseSelect.get('_lastDisplayedValue') === '' && 
                    this.platformSelect.get('_lastDisplayedValue') === '' && 
                    this.lakeSelect.get('_lastDisplayedValue') === '' &&
                    this.deviceSelect.get('_lastDisplayedValue') === '' &&
                    !values.minWaterDepth && !values.maxWaterDepth);
            },
                   
            clearForm: function() {     
                this.repositorySelect.set('value', '');
                this.cruiseSelect.set('value', '');
                this.platformSelect.set('value', '');    
                this.lakeSelect.set('value', '');    
                this.deviceSelect.set('value', '');    
                this.minWaterDepthSpinner.set('value', ''); 
                this.maxWaterDepthSpinner.set('value', '');                                 
                this.startYearSpinner.set('value', '');
                this.endYearSpinner.set('value', '');                             
            },

            resetSearch: function() {
                this.clearForm();
                topic.publish('/sample_index/ResetSearch');
            }
        });
    }
);