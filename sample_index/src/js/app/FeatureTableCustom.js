define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'esri/dijit/FeatureTable',
    'esri/tasks/query', 
    ],
    function(
        declare, 
        lang,
        FeatureTable,
        Query
        ){

        return declare([FeatureTable], {
            //Taken from the stock FeatureTable, with a couple functions overridden, to allow sorting across the entire set of features in the FeatureLayer, instead of just a chunk at a time.

            _generateStoreForNonPaginatedLayer: function(a) {
                var grid = a.grid;
                var layer = a.layer;
                var layerInfo = a.layerInfo;
                var where = a.where || null;
                var orderByFields = a.orderByFields || null;
                return this.queryLayerForIds({
                    layer: layer,
                    idProperty: layerInfo.idProperty,
                    where: where,
                    orderByFields: orderByFields //Modification: pass the orderByFields when querying for the IDs
                }).then(lang.hitch(this, function(ids) {
                    layerInfo._cachedIds = ids;
                    grid.layerInfo.cachedIds = ids;
                    return this._generateCacheStore({
                        grid: grid,
                        ids: ids,
                        where: where,
                        orderByFields: orderByFields
                    });
                })).otherwise(lang.hitch(this, function() {
                    this._showLoadError();
                }));
            },

            queryLayerForIds: function(a) {
                var layer = a.layer;
                var idProperty = a.idProperty;
                var where = a.where || "1\x3d1";
                var query = new Query();
                var orderByFields = a.orderByFields || null;

                query.returnGeometry = false;
                query.outFields = [idProperty];
                query.where = where;
                query.returnIdsOnly = true;
                query.orderByFields = orderByFields; //Modification: add the orderByFields to the query - this will return an ordered set of OBJECTIDs.
                return layer.queryIds(query);
            }
        });
    }
);