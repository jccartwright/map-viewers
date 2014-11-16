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
            maxGridCells: 1000000,  //maximum number of grid cells (rows * cols) allowed in request
            maxSurveyCount: 3000,   //maximum number of surveys allowed in a request

            constructor: function() {
                console.log('inside constructor...');
                //listen for events from the maptoolbar containing envelope
                topic.subscribe('/ngdc/geometry', lang.hitch(this, 'updateGridOptions'));
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
                console.log('inside updateGridOptions...');
                var convertToGeographic = lang.hitch(this, 'convertToGeographic');
                var extentToString = lang.hitch(this, 'extentToString');
                var calculateGridSize = lang.hitch(this, 'calculateGridSize');

                this.extent = convertToGeographic(geom);

                this.aoiSpan.innerHTML = extentToString(this.extent, 2);

                //TODO update default grid resolution based on current area

                calculateGridSize();

                xhr("http://maps.ngdc.noaa.gov/mapviewer-support/autogrid/surveys.groovy", {
                    handleAs: "json",
                    query: {
                        bbox: extentToString(this.extent, 5)
                    }
                }).then(lang.hitch(this, function (data) {
                    topic.publish("/ngdc/surveyStats", data);

                    var msg = number.format(data.surveyCount)+' survey lines';
                    if (data.surveyCount >= this.maxSurveyCount) {
                        msg += "<br/>This exceeds the maximum of "+number.format(this.maxSurveyCount)+" - please reduce your area of interest";
                        domStyle.set(this.aoiMessage,'color','red');
                    } else {
                        domStyle.set(this.aoiMessage,'color','green');
                    }
                    this.aoiMessage.innerHTML = msg;
                }), function (err) {
                    console.log(err);
                });

            },

            extentToString: function(geom, precision) {
                return (
                    geom.xmin.toFixed(precision)+", "+
                    geom.ymin.toFixed(precision)+", "+
                    geom.xmax.toFixed(precision)+", "+
                    geom.ymax.toFixed(precision)
                );
            },

            gridSizeChanged: function(evt) {
                console.log('inside gridSizeChanged with: ', evt);
                var calculateGridSize = lang.hitch(this, 'calculateGridSize');
                this.cellSize = parseInt(evt.target.value);

                var results = calculateGridSize();
                console.log(results);
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
                console.log('inside validate...');
                console.log(this.extent);

                //only mandatory options
                if (this.extent && this.gridSizeText.value) {
                    return true;
                } else {
                    return false;
                }
            },

            getData: function() {
                return ({
                    "geom": this.extentToString(this.extent, 5),
                    "cellSize": parseInt(this.gridSizeText.value),
                    "saveXYZ": (this.saveXYZCheckbox.value === 'on') ? true : false,
                    "backgroundFill": (this.backgroundFillCheckbox.value === 'on') ? true : false,
                    "saveGrid": (this.saveGridCheckbox.value === 'on') ? true : false
                });
            },

            calculateGridSize: function() {
                console.log('inside calculateGridSize: ',this.extent, this.cellSize);

                //reset the message
                this.gridSizeMessage.innerHTML = '';

                if (!this.extent || ! this.cellSize) {
                    console.warn("missing bbox and/or cellSize");
                    return;
                }

                var calcHaversineDistance = lang.hitch(this, 'calcHaversineDistance');

                //calculate the x,y dimensions in meters using the mid-latitude as a reference
                var midLat = this.extent.getHeight() / 2;
                var xDistance = calcHaversineDistance(this.extent.xmin, midLat, this.extent.xmax, midLat);
                var yDistance = calcHaversineDistance(this.extent.xmin, this.extent.ymin, this.extent.xmin, this.extent.ymax);

                //conservative estimate. 90% of sqrt(maxcells) along longest side
                var defCellSize;
                if (xDistance > yDistance) {
                    defCellSize = xDistance / (Math.sqrt(this.maxGridCells) * 0.90); //90% of maximum 1000 columns
                } else {
                    defCellSize = yDistance / (Math.sqrt(this.maxGridCells) * 0.90); //90% of maximum 1000 rows
                }
                //round to the nearest 10
                this.gridSizeText.value = number.round(defCellSize, 0, 100);

                //given the above x,y dimensions, approximate the number of rows, columns
                var rows = Math.ceil(yDistance / this.cellSize);
                var cols = Math.ceil(xDistance / this.cellSize);

                //compare estimate vs. max number of total columns
                var totalGridCells = rows * cols;
                var msg = "output grid will have approximately "+number.format(totalGridCells)+" cells ("+
                    number.format(rows)+" rows, "+number.format(cols)+" columns)";
                if (totalGridCells >= this.maxGridCells) {
                    msg += "<br/>This exceeds the maximum of "+number.format(this.maxGridCells)+
                           " - please reduce your area of interest or increase the cell size";
                    domStyle.set(this.gridSizeMessage,'color','red');
                } else {
                    domStyle.set(this.gridSizeMessage,'color','green');
                }
                this.gridSizeMessage.innerHTML = msg;

                return ({'width':xDistance,
                         'height':yDistance,
                         'cols':cols,
                         'rows':rows});
            },

            /*
             * taken from http://www.opensourceconnections.com/2009/02/13/client-side-javascript-implementation-of-the-haversine-formula/
             */
            calcHaversineDistance: function (long1, lat1, long2, lat2) {
                console.log('inside calcHaversineDistance with ',long1, lat1, long2, lat2);
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
