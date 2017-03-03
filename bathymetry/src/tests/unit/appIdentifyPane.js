/*
* trivial example of testing a custom templated Dijit.  Note the constructed 
* instance is not attached to a page's DOM
*/
define([
    'intern!object',
    'intern/chai!assert',
    'app/AppIdentifyPane',
    'dojo/_base/config',
    'ngdc/Logger'

], function(registerSuite, assert, IdentifyPane, config, Logger) {
    // local vars scoped to this module
    var identifyPane;

    registerSuite({
        name: 'AppIdentifyPane dijit',
        // before the suite starts
        setup: function() {
            //TODO find a way to access the package configuration in intern.js
             config.app = {
                ngdcDijitsUrl: 'https://maps.ngdc.noaa.gov/viewers/dijits-2.11/js/ngdc',
                loglevel: 2
            }

            //TODO replace Logger w/ console.log statements which are stripped out during build process
            window.logger = new Logger(config.app.loglevel);

            //TODO mock or instantiate Map, Identify objects
            identifyPane = new IdentifyPane({
                map: null,
                identify: null,
                class: 'identifyPane',
                autoExpandTree: false
            });
        },

        // before each test executes
        beforeEach: function() {
            // do nothing
        },

        // after the suite is done (all tests)
        teardown: function() {
            // do nothing
        },

        // The tests, each function is a test
        'Dijit constructed': function() {
            assert.isOk(identifyPane, 'A valid instance was created');
        }
    });
});
