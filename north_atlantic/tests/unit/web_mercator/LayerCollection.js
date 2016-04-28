define([
    'intern!object',
    'intern/chai!assert',
    'app/web_mercator/LayerCollection',
    'ngdc/layers/AbstractLayerCollection',
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISImageServiceLayer',
    'esri/layers/WMSLayer',
    'esri/layers/WMSLayerInfo',
    'ngdc/layers/TiledWMSLayer',
    'ngdc/Logger'
], function(
    registerSuite,
    assert,
    MercatorLayerCollection,
    AbstractLayerCollection,
    ArcGISTiledMapServiceLayer,
    ArcGISDynamicMapServiceLayer,
    ArcGISImageServiceLayer,
    WMSLayer,
    WMSLayerInfo,
    TiledWMSLayer,
    Logger) {
    // local vars scoped to this module
    var layerCollection;

    registerSuite({
        name: 'LayerCollection',
        // before the suite starts
        setup: function() {

            //put the logger into global so all modules have access
            window.logger = new Logger(2);  //INFO == 2

            // create some objects for our tests
            layerCollection = new MercatorLayerCollection();
        },

        // before each test executes
        beforeEach: function() {
            // do noting
        },

        // after the suite is done (all tests)
        teardown: function() {
            // do nothing
        },

        // The tests, each function is a test
        'LayerCollection contains the number of layers': function() {
            assert.isTrue(layerCollection !== null, 'LayerCollection is not null');
            assert.equal(layerCollection.mapServices.length, 33, 'LayerCollection contains expected number of layers');
        },

        'Load an ArcGIS Online layer': function() {
            var layer = new ArcGISTiledMapServiceLayer('//services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer', {
            id: 'NatGeo',
                visible: false
            });
            assert.isNotNull(layer, 'layer is not null');
        }
    });
});
