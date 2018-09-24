define([
    "dojo/topic",
    "dojo/io-query"
    ], function(
        topic,
        ioQuery
    ) {
    /*
    * Custom Javascript to be executed while the application is initializing goes here
    */
    
    // The application is ready
    topic.subscribe("tpl-ready", function(){
        /*
         * Custom Javascript to be executed when the application is ready goes here
         */

        /*
         * Summary of customizations for Deep-Sea Corals story map, which has a "top-level" Story Map Series with an embedded Story Map Series for each region:
         * -Optional 'entry' (already part of API), 'subentry', and 'region' URL parameters.
         *    'entry' is used to choose a top-level entry.
         *    'subentry' is used to choose a slide within one of the embedded story maps
         *    'region' should be specified for the embedded story maps, to ensure only the points for that region respond to a click event, which navigates to the corresponding slide
         * -When a deep-sea-corals site is clicked, navigate to the the corresponding slide (specified in the StorymapIndex field in the feature layer)
         * -Make the tooltips for the bullets appear below the button instead of above (was getting cut off outside of the iframe when using &embed to hide the header). This modification is in app/storymaps/tpl/ui/desktop/NavBar.js.
         */

        var queryParams = ioQuery.queryToObject(location.search.substring(1));
        
        //Get the optional 'entry' parameter
        var entry = 0;
        if (queryParams.entry) {
            entry = queryParams.entry;
        }

        //Get the optional 'subentry' parameter
        var subentry = 0;
        if (queryParams.subentry) {
            subentry = queryParams.subentry;
        }

        //Get the optional 'region' parameter
        var region;
        if (queryParams.region) { 
            region = queryParams.region;
        }

        //Navigate to the specified entry. 
        //This is default behavior in the stock javascript, but doing it here to ensure that "story-loaded-map" message gets published on initial load (subscribe is below)
        topic.publish("story-navigate-entry", entry);

        //If subentry is specified, append the value as the 'entry' parameter for the embedded story map.
        if (subentry) {
            var webAppData = app.data.getWebAppData();
            var entries = webAppData.getStoryEntries();
            var url;
            if (entries && entries[entry] && entries[entry].media && entries[entry].media.webpage) {
                url = entries[entry].media.webpage.url; //Get the URL for the webpage embedded at story map position 'entry'
                var embedContainer = $('.embedContainer[data-src="' + btoa(url) + '"]'); //Get the iframe corresponding to the unmodified URL (uses base64 encoding)
                var newUrl = url + "&entry=" + subentry;
                embedContainer.attr("src", newUrl); //Modify the src parameter of the iframe with the new URL
            }
        }

        /*
        * Set up a click handler on the feature of the map to navigate the story
        */

        //
        // *************************************
        // Configure the webmap id and layer id
        // *************************************
        //
        // First find the webmap id through the URL when you open the map in Map Viewer
        // To get the layer id, paste the webmap id below and open the application,
        //   then open the developer console, all the layers ids will be listed,
        //   find the correct one and paste it below
        var WEBMAP_ID = "bffe6553e9bb485eb1339fc3e43184f2";
        var LAYER_ID = "SiteCharacterizationPoints_8845";

        var clickHandlerIsSetup = false;

        topic.subscribe("story-loaded-map", function(result) {
            if (result.id === WEBMAP_ID && !clickHandlerIsSetup) {
                var map = app.maps[result.id].response.map;
                var layer = map.getLayer(LAYER_ID);

                if (layer) {
                    layer.on("click", function(e){
                        if (e.graphic.attributes["Region"] === region) { //Only respond to the points clicked that have the same Region specified in the 'region' URL parameter
                            var index = e.graphic.attributes["StorymapIndex"] - 1; //Get the StorymapIndex field from the point

                            // Temporarily prevent the new bullet to be focused
                            app.isLoading = true;

                            topic.publish("story-navigate-entry", index);

                            // Set back isLoading
                            setTimeout(function(){
                                app.isLoading = false;
                            }, 100);
                        }
                    });
                }

                clickHandlerIsSetup = true;
            }
        });
    });
});