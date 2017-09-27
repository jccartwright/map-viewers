define([
    'dojo/_base/declare',
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/topic',
    'dojo/_base/lang',
    'dojo/number',
    'dojo/dom-style',
    'dojo/request/xhr',
    'esri/geometry/webMercatorUtils',
    'dojo/text!./templates/GridOptionsPanel.html'
    ],
    function(
        declare, 
        _WidgetBase, 
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        topic,
        lang,
        number,
        domStyle,
        xhr,
        webMercatorUtils,
        template
        ){
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            // Our template - important!
            templateString: template,

            // A class to be applied to the root node in our template
            baseClass: 'gridOptionsPanel',
            extent: null,
            cellSize: 1000,
            maxGridCells: 2500000,  //maximum number of grid cells (rows * cols) allowed in request
            maxSurveyCount: 5000,   //maximum number of surveys allowed in a request,
            gridSize: null,         //gridSize based on the current geographic extent and cellSize
            surveyCount: null,      //number of surveys found w/in the current geographic extent

            constructor: function() {
                //listen for events from the maptoolbar containing envelope
                topic.subscribe('/ngdc/geometry', lang.hitch(this, 'updateGridOptions'));

                //used by BoundingBoxDialog
                topic.subscribe('/ngdc/BoundingBoxDialog/extent', lang.hitch(this, 'updateGridOptions'));
            },

            postCreate: function() {
                this.inherited(arguments);

/*
                //TODO enable/disable submit button based on whether entries are valid
                //Is the form valid? Watch the 'state' property and enable/disable the submit button
                this.watch('state', function() {
                    if (this.state === '') {
                        this.submitButton.set('disabled', false);
                    }
                    else {
                        this.submitButton.set('disabled', true);
                    }
                });
*/
               //initialize value of text entry w/ default cell size
               this.gridSizeText.value = this.cellSize;
            },


            //called when area of interest changes
            updateGridOptions: function(geom) {
                var convertToGeographic = lang.hitch(this, 'convertToGeographic');
                var extentToString = lang.hitch(this, 'extentToString');
                var calculateGridSize = lang.hitch(this, 'calculateGridSize');
                var estimateGridCellSize = lang.hitch(this, 'estimateGridCellSize');
                var updateGridSizeMessage = lang.hitch(this, 'updateGridSizeMessage');

                this.extent = convertToGeographic(geom);
                if (this.extent.xmin > this.extent.xmax) {
                    alert("WARNING: the Area of Interest cannot cross the antimeridian");
                }
                this.aoiSpan.innerHTML = extentToString(this.extent, 2);

                //suggest a grid cell size based on the current extent and max number of allowable grid cells
                var suggestedGridCellSize = estimateGridCellSize(this.extent);
                this.gridSizeText.value = suggestedGridCellSize;

                //calc the number of rows and columns based on the gridCellSize and extent
                this.gridSize = calculateGridSize(this.extent, suggestedGridCellSize);
                updateGridSizeMessage(this.gridSize);

                //find the number of surveys w/in the area of interest
                xhr("//www.ngdc.noaa.gov/next-catalogs/rest/autogrid/catalog/extents", {
                    handleAs: "json",
                    query: {
                        geometry: extentToString(this.extent, 5),
                        gridCellSize: this.gridSizeText.value
                    }
                }).then(lang.hitch(this, function (data) {
                    topic.publish("/ngdc/surveyStats", data);
                    this.surveyCount = data.surveyCount;

                    var msg = number.format(data.surveyCount)+' survey lines';
                    if (this.isSurveyCountValid()) {
                        domStyle.set(this.aoiMessage,'color','green');
                    } else if (this.surveyCount == 0) {
                        //add warning message and change text color
                        msg += "<br/>No surveys are available in your specified area of interest. Please choose an area containing at least one survey";
                        domStyle.set(this.aoiMessage,'color','red');
                    } else {
                        //add warning message and change text color
                        msg += "<br/>This exceeds the maximum of "+number.format(this.maxSurveyCount)+" - please reduce your area of interest";
                        domStyle.set(this.aoiMessage,'color','red');
                    }
                    this.aoiMessage.innerHTML = msg;
                }), function (err) {
                    console.log(err);
                });

            },

            extentToString: function(geom, precision) {
                if (geom.type !== 'extent') {
                    geom = geom.getExtent();
                }

                return (
                    geom.getExtent().xmin.toFixed(precision)+","+
                    geom.getExtent().ymin.toFixed(precision)+","+
                    geom.getExtent().xmax.toFixed(precision)+","+
                    geom.getExtent().ymax.toFixed(precision)
                );
            },

            gridCellSizeChanged: function(evt) {
                var calculateGridSize = lang.hitch(this, 'calculateGridSize');
                var updateGridSizeMessage = lang.hitch(this, 'updateGridSizeMessage');

                this.cellSize = parseInt(evt.target.value);
                this.gridSize = calculateGridSize(this.extent, this.cellSize);
                updateGridSizeMessage(this.gridSize);
            },


            updateGridSizeMessage: function(gridSize) {
                //compare grid size vs. max number of total columns and update message
                var msg = "output grid will have approximately "+number.format(gridSize.totalCells)+" cells ("+
                    number.format(gridSize.rows)+" rows, "+number.format(gridSize.cols)+" columns)";

                if (this.isGridSizeValid()) {
                    domStyle.set(this.gridSizeMessage,'color','green');

                } else {
                    //add warning and change text color
                    msg += "<br/>This exceeds the maximum of "+number.format(this.maxGridCells)+
                    " - please reduce your area of interest or increase the cell size";
                    domStyle.set(this.gridSizeMessage,'color','red');
                }
                this.gridSizeMessage.innerHTML = msg;
            },


            isGridSizeValid: function() {
                return (this.gridSize.totalCells <= this.maxGridCells);
            },

            isSurveyCountValid: function() {
                return (this.surveyCount > 0 && this.surveyCount <= this.maxSurveyCount);
            },

            //TODO add support for arctic coords
            convertToGeographic: function(geom) {
                if (geom.spatialReference.wkid == 4326) {
                    //no action necessary
                    return(geom);
                } else if (geom.spatialReference.wkid == 102100) {
                    //convert from web mercator
                    return(webMercatorUtils.webMercatorToGeographic(geom));

                } else {
                    console.warn("unsupported SRID: "+geom.spatialReference.wkid);
                }
            },


            validate: function() {
                if (this.extent.type !== 'extent') {
                    this.extent = this.extent.getExtent();
                }

                if (this.extent &&
                    this.gridSizeText.value &&
                    this.isGridSizeValid() &&
                    this.isSurveyCountValid() &&
                    this.extent.xmin < this.extent.xmax) {
                    return true;
                } else {
                    return false;
                }
            },

            getData: function() {
                return ({
                    "geometry": this.extentToString(this.extent, 5),
                    "gridCellSize": parseInt(this.gridSizeText.value),
                    "backgroundFill": (this.backgroundFillCheckbox.checked)
                });
            },


            estimateGridCellSize: function(extent) {
                var calcHaversineDistance = lang.hitch(this, 'calcHaversineDistance');

                if (extent.type !== 'extent') {
                    extent = extent.getExtent();
                }

                //calculate the x,y dimensions in meters using the mid-latitude as a reference
                var midLat = extent.getHeight() / 2;
                var xDistance = calcHaversineDistance(extent.xmin, midLat, extent.xmax, midLat);
                var yDistance = calcHaversineDistance(extent.xmin, extent.ymin, extent.xmin, extent.ymax);

                //conservative estimate. 90% of sqrt(maxcells) along longest side
                var defCellSize;
                if (xDistance > yDistance) {
                    defCellSize = xDistance / (Math.sqrt(this.maxGridCells) * 0.90); //90% of maximum 1000 columns
                } else {
                    defCellSize = yDistance / (Math.sqrt(this.maxGridCells) * 0.90); //90% of maximum 1000 rows
                }
                //round to the nearest 10
                return (number.round(defCellSize, 0, 100));
            },


            calculateGridSize: function(extent, cellSize) {
                //reset the message
                this.gridSizeMessage.innerHTML = '';

                if (!extent || ! cellSize) {
                    console.warn("missing bbox and/or cellSize");
                    return;
                }

                if (extent.type !== 'extent') {
                    extent = extent.getExtent();
                }

                var calcHaversineDistance = lang.hitch(this, 'calcHaversineDistance');

                //calculate the x,y dimensions in meters using the mid-latitude as a reference
                var midLat = extent.getHeight() / 2;
                var xDistance = calcHaversineDistance(extent.xmin, midLat, extent.xmax, midLat);
                var yDistance = calcHaversineDistance(extent.xmin, extent.ymin, extent.xmin, extent.ymax);

                //given the above x,y dimensions, approximate the number of rows, columns
                var rows = Math.ceil(yDistance / cellSize);
                var cols = Math.ceil(xDistance / cellSize);

                return ({'width':xDistance,
                         'height':yDistance,
                         'cols':cols,
                         'rows':rows,
                         'totalCells': rows * cols});
            },

            /*
             * taken from //www.opensourceconnections.com/2009/02/13/client-side-javascript-implementation-of-the-haversine-formula/
             */
            calcHaversineDistance: function (long1, lat1, long2, lat2) {
                var toRadians = lang.hitch(this, 'toRadians');

                var radius = 6378100;  //radius of earth (meters)
                var radianLat1 = toRadians(lat1);
                var radianLong1 = toRadians(long1);
                var radianLat2 = toRadians(lat2);
                var radianLong2 = toRadians(long2);
                var radianDistanceLat = radianLat1 - radianLat2;
                var radianDistanceLong = radianLong1 - radianLong2;
                var sinLat = Math.sin(radianDistanceLat / 2.0);
                var sinLong = Math.sin(radianDistanceLong / 2.0);
                var a = Math.pow(sinLat, 2.0) + Math.cos(radianLat1) * Math.cos(radianLat2) * Math.pow(sinLong, 2.0);
                var distance = radius * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
                return distance;
            },

            toRadians: function(degree) {
                return (degree * (Math.PI / 180));
            }
        });
    }
);
