/*
* trivial example of testing a custom templated Dijit.  Note the constructed 
* instance is not attached to a page's DOM
*/
define([
    'intern!object',
    'intern/chai!assert',
    'ngdc/Banner'
], function(registerSuite, assert, Banner) {
    // local vars scoped to this module
    var banner, expectedNumberOfBreadcrumbs;

    registerSuite({
        name: 'Banner dijit',
        // before the suite starts
        setup: function() {
            var breadcrumbs = [
                {url: 'https://www.noaa.gov', label: 'NOAA', title: 'Go to the National Oceanic and Atmospheric Administration home'},
                {url: 'https://www.nesdis.noaa.gov', label: 'NESDIS', title: 'Go to the National Environmental Satellite, Data, and Information Service home'},
                {url: 'https://www.ngdc.noaa.gov', label: 'NCEI (formerly NGDC)', title: 'Go to the National Centers for Environmental Information (formerly the National Geophysical Data Center) home'},
                {url: 'https://gis.ngdc.noaa.gov', label: 'Maps', title: 'Go to NCEI maps home'},
                {url: 'https://www.ngdc.noaa.gov/mgg/bathymetry/relief.html', label: 'Bathymetry'}           
            ];
            expectedNumberOfBreadcrumbs = breadcrumbs.length;

            banner = new Banner({
                breadcrumbs: breadcrumbs,    
                dataUrl: 'https://www.ngdc.noaa.gov/mgg/bathymetry/relief.html',
                image: 'images/bathymetry_viewer_logo.png',
                imageAlt: 'NCEI Bathymetric Data Viewer - go to data home'
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
            assert.isOk(banner, 'A valid instance was created');
            assert.equal(banner.breadcrumbs.length, expectedNumberOfBreadcrumbs, 'this banner should have 5 breadcrumbs');
        }
    });
});
