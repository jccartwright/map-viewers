// Learn more about configuring this file at <https://theintern.github.io/intern/#configuration>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites
define({
	// Default desired capabilities for all environments. Individual capabilities can be overridden by any of the
	// specified browser environments in the `environments` array below as well. See
	// <https://theintern.github.io/intern/#option-capabilities> for links to the different capabilities options for
	// different services.
	//
	// Note that the `build` capability will be filled in with the current commit ID or build tag from the CI
	// environment automatically
	capabilities: {
		'browserstack.selenium_version': '2.45.0'
	},

	// Browsers to run integration testing against. Note that version numbers must be strings if used with Sauce
	// OnDemand. Options that will be permutated are browserName, version, platform, and platformVersion; any other
	// capabilities options specified for an environment will be copied as-is
	environments: [
		{ browserName: 'phantomjs' }
		//{ browserName: 'chrome' }
		//{ browserName: 'internet explorer', version: '11', platform: 'WIN8' },
		//{ browserName: 'internet explorer', version: '10', platform: 'WIN8' },
		//{ browserName: 'internet explorer', version: '9', platform: 'WINDOWS' },
		//{ browserName: 'firefox', version: '37', platform: [ 'WINDOWS', 'MAC' ] },
		//{ browserName: 'chrome', version: '39', platform: [ 'WINDOWS', 'MAC' ] },
		//{ browserName: 'safari', version: '8', platform: 'MAC' }
	],

	// Maximum number of simultaneous integration tests that should be executed on the remote WebDriver service
	maxConcurrency: 2,

	// Name of the tunnel class to use for WebDriver tests.
	// See <https://theintern.github.io/intern/#option-tunnel> for built-in options
	//tunnel: 'BrowserStackTunnel',
	tunnel: 'NullTunnel',

	// Configuration options for the module loader; any AMD configuration options supported by the AMD loader in use
	// can be used here.
	// If you want to use a different loader than the default loader, see
	// <https://theintern.github.io/intern/#option-useLoader> for instruction
/*
        loaders: {
            'host-node': 'bower_components/dojo/dojo',
            'host-browser': 'bower_components/dojo/dojo.js'
        },
*/
	loaderOptions: {
		// Packages that should be registered with the loader in each testing environment
		packages: [ 
	        {
                name: 'app',
                location: 'js/app'
            },
            {
                name: "ngdc",
                //location: '//maps.ngdc.noaa.gov/viewers/dijits-2.9/js/ngdc'
                location: '../../dijits/js/ngdc'
            },
            {
                name: "ncei",
                //location: '//maps.ngdc.noaa.gov/viewers/dijits-2.9/js/ncei'
                location: '../../dijits/js/ncei'
            },
            {
                name: 'dojo',
                location: 'bower_components/dojo'
            },
            {
                name: 'dijit',
                location: 'bower_components/dijit'
            },
            {
                name: 'dojox',
                location: 'bower_components/dojox'
            },
            {
                name: 'dgrid',
                location: 'bower_components/dgrid'
            },
            {
                name: 'dstore',
                location: 'bower_components/dstore'
            },
            {
                name: 'dmodel',
                location: 'bower_components/dmodel'
            },
            {
                name: 'xstyle',
                location: 'bower_components/xstyle'
            },
            {
                name: 'put-selector',
                location: 'bower_components/put-selector'
            },
            {
                name: 'esri',
                location: 'bower_components/arcgis-js-api'
            }
		 ]
	},

	// Non-functional test suite(s) to run in each browser
	suites: [
	'tests/unit/hello',
	'tests/unit/extent',
    'tests/unit/web_mercator/LayerCollection'
	 /* 'myPackage/tests/foo', 'myPackage/tests/bar' */ ],

	// Functional test suite(s) to execute against each browser once non-functional tests are completed
	functionalSuites: [ /* 'myPackage/tests/functional' */ ],

	// A regular expression matching URLs to files that should not be included in code coverage analysis
	excludeInstrumentation: /^(?:tests|node_modules|bower_components)\//
});
