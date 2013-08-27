define(["dojo/_base/declare", "dojo/_base/array", "dojo/promise/all", "dojo/_base/connect", "esri/tasks/IdentifyTask", "esri/tasks/IdentifyParameters",
    "esri/tasks/IdentifyResult", "dojo/_base/lang"],
    function(declare, array, all, Connect, IdentifyTask, IdentifyParameters, IdentifyResult, lang){
        return declare([], {
            _map: null,
            _classname: 'AbstractIdentify',
            taskInfos: null,    //list of IdentifyTasks. set by subclass


            //called prior to subclass constructor
            constructor: function(arguments) {
                logger.debug('inside constructor for '+this._classname);
            },

            init: function(params) {
                logger.debug('inside init...');

                var layerIds = params[0].layerIds,
                    layerCollection = params[0].layerCollection;

                this._map = params[0].map;

                //Connect.connect(this._map, "onClick", this, this.identify);
                this._map.on("click", lang.hitch(this, "identify"));


//				array.forEach(layerCollection.getVisibleLayerIds(), function(id) {
//					console.debug(id);
//				});

                this.taskInfos = this.createTaskInfos(layerIds, layerCollection);
            },


            identify: function(evt) {
                logger.debug('inside identify...');

                var promises = [], deferreds = [], activeLayers = [];

                array.forEach(this.taskInfos, function(taskInfo){
                    if (taskInfo.enabled) {
                        //reset since map may have been resized since dijit initialized
                        taskInfo.params.width  = this._map.width;
                        taskInfo.params.height = this._map.height;
                        taskInfo.params.mapExtent = this._map.extent;
                        taskInfo.params.geometry = evt.mapPoint;

                        deferreds.push(taskInfo.task.execute(taskInfo.params));

                        //keep a list of layers corresponding to deferreds in
                        //order to label results which appear in same order
                        activeLayers.push(taskInfo.layer);
                    } else {
                        logger.debug('task not enabled: '+taskInfo.layer.url);
                    }
                }, this);

                promises = new all(deferreds);
                promises.then(function(results){
                    var identifyResult = new IdentifyResult()
                    //produces an array of arrays each element of which is an IdentifyResult instance
                    console.log('results: ',results);
                });
            },

            createTaskInfos: function(layerIds, layerCollection) {
                logger.debug('inside createTaskInfos...');

                var taskInfos = [], layer;

                array.forEach(layerIds, function(layerId) {
                    layer = layerCollection.getLayerById(layerId);
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
                identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;  //use LAYER_OPTION_VISIBLE?
                //TODO layerDefinitions, layerIds?, maxAllowableOffset?
                return(identifyParams);
            }
        });
    }
);
