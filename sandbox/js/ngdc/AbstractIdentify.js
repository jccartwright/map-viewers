define(["dojo/_base/declare", "dojo/_base/array", "dojo/promise/all", "dojo/Deferred", "esri/tasks/IdentifyTask", "esri/tasks/IdentifyParameters",
    "esri/tasks/IdentifyResult", "dojo/_base/lang", "dojo/topic", "dojo/aspect"],
    function(declare, array, all, Deferred, IdentifyTask, IdentifyParameters, IdentifyResult, lang, topic, aspect){
        return declare([], {
            _map: null,
            _classname: 'AbstractIdentify',
            taskInfos: null, //list of IdentifyTasks
            results: null,   //reference to the most recent resultset
            promises: null,  //promise issued by the most recent "all"
            //TODO this only needs to be "instance" variable if need to cancel deferreds individually
            deferreds: null, //list of promises bundled into single promise.
            searchGeometry: null,

            //called prior to subclass constructor
            constructor: function(arguments) {
                logger.debug('inside constructor for '+this._classname);
            },

            init: function(params) {
                logger.debug('inside init...');

                var layerIds = params[0].layerIds,
                    layerCollection = params[0].layerCollection;

                this._map = params[0].map;

                this._map.on("click", lang.hitch(this, "identifyPoint"));

                topic.subscribe("/ngdc/boundingBox", lang.hitch(this, "identifyBBox"));

                this._map.on("extent-change", lang.hitch(this, "updateMapExtent"));

                this.taskInfos = this.createTaskInfos(layerIds, layerCollection);
            },

            /*
            //only used for debugging
            slowTask: function() {
                var deferred = new Deferred();
                setTimeout(function() {
                    deferred.resolve(new Date());
                }, 5*1000);
                return deferred.promise;
            },
            */

            identifyBBox: function(bbox) {
                logger.debug('inside identifyBBox');
                this.identify(bbox);
            },

            identifyPoint: function(evt) {
                this.identify(evt.mapPoint);
            },

            identify: function(geometry) {
                logger.debug('inside identify...');

                this.searchGeometry = geometry;
                //TODO use isResolved() or isFulFilled()?
                if (this.promises && this.promises.isResolved() == false) {
                    logger.debug('cancelling an active promise...');
                    //this.cancelPromise();
                    this.promises.cancel('cancelled due to new request', true);
                }

                //only used for debugging
                //this.deferreds = {'slowTask': this.slowTask()};

                this.deferreds = {};

                array.forEach(this.taskInfos, function(taskInfo){
                    taskInfo.params.geometry = geometry;

                    if (taskInfo.enabled) {
                        this.deferreds[taskInfo.layer.id] = taskInfo.task.execute(taskInfo.params);
                    } else {
                        logger.debug('task not enabled: '+taskInfo.layer.url);
                    }
                }, this);

                this.promises = new all(this.deferreds, true);

                this.promises.then(function(results) {
                    //produces an array of arrays. Each element of top-level array corresponds to a mapservice. The
                    // inner array is a list of IdentifyResult instances which the results from the sublayers intermingled

                    //keep a reference to the last result
                    this.results = results;

                    //publish message w/ results
                    //TODO place into a Store instead?
                    topic.publish("/identify/results", results);
                });
            },

            //not currently used
            cancelPromise: function() {
                //not sure this is necessary. Documentation says that cancelling a promise returned by "all" will
                //not cancel it's constituent promises.  However, it seems to work.
//                for(var i in this.deferreds) {
//                    this.deferreds[i].cancel();
//                }
                this.promises.cancel('cancelled due to new request', true);
            },


            createTaskInfos: function(layerIds, layerCollection) {
                logger.debug('inside createTaskInfos...');

                var taskInfos = [], layer;

                array.forEach(layerIds, function(layerId) {
                    layer = layerCollection.getLayerById(layerId);
                    //listen for changes to visibility in sublayers
                    aspect.after(layer, "setVisibleLayers", lang.hitch(this, lang.partial(this.updateVisibleLayers, layer)), true);

                    //listen for changes in layer definitions in sublayers
                    aspect.after(layer, "setLayerDefinitions", lang.hitch(this, lang.partial(this.updateLayerDefinitions, layer)), true);

                    logger.debug('creating IdentifyTask for URL '+layer.url);
                    taskInfos.push({
                        layer: layer,
                        task: new IdentifyTask(layer.url),
                        //enabled: layer.visible,
                        enabled: true,
                        params: this.createIdentifyParams(layer)
                    });
                }, this);
                return (taskInfos);
            },

            createIdentifyParams: function(layer) {
                logger.debug('inside createIdentifyParams...');

                var identifyParams = new IdentifyParameters();
                identifyParams.tolerance = 3;
                identifyParams.returnGeometry = true;
                identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

                //initialize these based on current layer settings
                identifyParams.layerIds = layer.visibleLayers
                identifyParams.layerDefinitions = layer.layerDefinitions;
                return(identifyParams);
            },

            updateVisibleLayers: function(layer, visibleLayers) {
                logger.debug('inside updateVisibleLayers with '+layer.id+' visibleLayers: '+visibleLayers);

                array.forEach(this.taskInfos, function(taskInfo){
                    if (taskInfo.layer.id == layer.id) {
                        taskInfo.params.layerIds = visibleLayers;
                    }
                });
            },

            updateLayerDefinitions: function(layer, visibleLayers) {
                logger.debug('inside updateVisibleLayers with '+layer.id+' visibleLayers: '+visibleLayers);

                array.forEach(this.taskInfos, function(taskInfo){
                    if (taskInfo.layer.id == layer.id) {
                        taskInfo.params.layerIds = visibleLayers;
                    }
                });
            },

            updateMapExtent: function(evt) {
                logger.debug('inside updateMapExtent: ');
                array.forEach(this.taskInfos, function(taskInfo){
                    taskInfo.params.width  = this._map.width;
                    taskInfo.params.height = this._map.height;
                    taskInfo.params.mapExtent = this._map.extent;
                    //TODO set maxAllowableOffset based on scale?
                }, this);

            }

        });
    }
);
