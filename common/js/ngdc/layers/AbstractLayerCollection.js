define(["dojo/_base/declare", "dojo/_base/array", "esri/layers/ImageParameters", "ngdc/layers/PairedMapServiceLayer"],
    function(declare, array, ImageParameters, PairedMapServiceLayer){

        var mapServices;
        var pairedMapServices;
        var imageParameters;

        //TODO necessary?
        var firstZoomLevel;

        return declare([], {
            constructor: function() {
                this.firstZoomLevel = 2;
                //TODO check to ensure unique id
                //this.mapServices = mapServiceList;

                this.createImageParameters();
            },

            //if >1 layers share an ID, return the first. return undefined if list is null or layer not found
            getLayerById: function(/*String*/ id) {
                if (! this.mapServices) { return (undefined)}

                var foundValues = array.filter(this.mapServices,function(item){
                    return(item.id === id);
                });
                return foundValues[0];
            },

            getLayerIds: function() {
                return array.map(this.mapServices, function(svc){
                    return svc.id;
                })
            },

            createImageParameters: function() {
                this.imageParameters = {};
                this.imageParameters.png32 = new ImageParameters();
                this.imageParameters.png32.format = "png32";
                this.imageParameters.jpg = new ImageParameters();
                this.imageParameters.jpg.format = "jpg";
            },

            buildPairedMapServices: function(map) {
                logger.debug('building '+this.pairedMapServices.length+' PairedMapServices...');

                var layer;
                array.forEach(this.pairedMapServices, function(layerDef){
                    layer = new PairedMapServiceLayer(layerDef, map);

                    //insert into mapServices list replacing two existing entries
                    this.updateMapServiceList(layer);
                }, this);
            },

            //TODO refactor
            updateMapServiceList: function(layer) {
                //determine the original array index of each of the layers
                var idx = [];
                array.forEach(this.mapServices, function(svc, i){
                    if (svc.id === layer._dynamicService.id) {
                        idx.push(i);
                    }
                }, this);

                array.forEach(this.mapServices, function(svc, i){
                    if (svc.id === layer._tiledService.id) {
                        idx.push(i);
                    }
                }, this);
                if (idx.length != 2) {
                    logger.warn("There should only be two elements in this array")
                }
                idx.sort();

                //place the new PairedMapServiceLayer at the lowest index, remove the other
                //WARNING: modifies the original list
                this.mapServices.splice(idx[0], 1, layer);
                this.mapServices.splice(idx[1], 1);
            }
        });
    }
);
