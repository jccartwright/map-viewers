define(["dojo/_base/declare", "dojo/promise/all", "dojo/_base/connect", "esri/tasks/IdentifyTask", "esri/tasks/IdentifyParameters",
    "esri/tasks/IdentifyResult"],
    function(declare, all, Connect, IdentifyTask, IdentifyParameters, IdentifyResult){
        return declare([], {
            _map: null,
            _identifyTask: null,
            _identifyParams: null,


            constructor: function(arguments) {
                this._map = arguments.map;
                console.log('inside constructor. map = ',this._map);
                Connect.connect(this._map, "onClick", this, this.identify);

                this._identifyTask = new IdentifyTask("http://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer");
                this._identifyParams = new esri.tasks.IdentifyParameters();
                this._identifyParams.tolerance = 3;
                this._identifyParams.returnGeometry = true;
                this._identifyParams.layerIds = [0];
                this._identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
                this._identifyParams.width  = this._map.width;
                this._identifyParams.height = this._map.height;
                console.log('leaving constructor...');
            },

            identify: function(evt) {
                console.log('inside identify...', evt);
                this._identifyParams.geometry = evt.mapPoint;
                this._identifyParams.mapExtent = this._map.extent;
                this._identifyTask.execute(this._identifyParams, function(results) {
                    //TODO
                    console.log(results, evt);
                });
            }

        });
    }
);