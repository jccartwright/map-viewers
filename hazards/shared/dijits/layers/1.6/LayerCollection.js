dojo.provide('layers.LayerCollection');

dojo.declare('layers.LayerCollection', null, {
	//WARNING: no check to insure unique id
	mapServices: null,

	constructor: function(mapServiceList) {
		this.mapServices = mapServiceList;
	},

	/**
	 * return layer with the specified ID.
	 *
	 * If more than one layer share an ID, return the first
	 * return undefined if list is null or layer not found
	 */
	getLayerById: function(/*String*/ id) {
		if (! this.mapServices) { return (undefined)}

		var foundValues = dojo.filter(this.mapServices,function(item){
			return(item.id === id);
		});
		return foundValues[0];
	}
});