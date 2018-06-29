define([
    'dojo/_base/declare',    
    'dijit/Dialog',
    'dijit/_Widget',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/form/Button',
    'dijit/form/CheckBox',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/on',
    'dojo/io-query',
    'dijit/form/ValidationTextBox',
    'dojox/validate/web',
    'dojo/request/xhr',
    'dojo/json',
    'dojo/dom-style',
    'dojo/topic',
    'esri/geometry/Polygon',
    'esri/geometry/webMercatorUtils',
    'esri/geometry/geometryEngine',
    'esri/SpatialReference',
    'esri/config',
    'esri/tasks/ProjectParameters',
    'dojo/text!./templates/RequestDataDialog.html'
],
    function(
        declare,
        Dialog,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Button,
        CheckBox,
        lang,
        array,
        on,
        ioQuery,
        ValidationTextBox,
        validate,
        xhr,
        JSON,
        domStyle,
        topic,
        Polygon,
        webMercatorUtils,
        geometryEngine,
        SpatialReference,
        esriConfig,
        ProjectParameters,
        template
        ){
        return declare([Dialog, _TemplatedMixin, _WidgetsInTemplateMixin], {

            templateString: template,

            // A class to be applied to the root node in template
            baseClass: 'requestDataDialog',
            title: 'Request Data',

            constructor: function(/*Object*/ kwArgs) {
                this.filenames = arguments.filenames;
                lang.mixin(this, kwArgs);
            },

            postCreate: function() {
                this.inherited(arguments);

                on(this.cancelButton, 'click', lang.hitch(this, function(){
                    this.onCancel();
                }));

                //Is the form valid? Watch the 'state' property and enable/disable the submit button
                this.watch('state', function() {
                    this.updateSubmitButtonState();
                });

                on(this.chkPassGeometry, 'click', lang.hitch(this, function() {
                    if (this.chkPassGeometry.checked) {
                        this.hideFullCruiseWarning();
                        this.displayFileCountAndSize(this.cruiseList, this.instrumentList, this.geometry);
                    } else {
                        this.showFullCruiseWarning();
                        this.displayFileCountAndSize(this.cruiseList, this.instrumentList, null);
                    }
                }));

                //Subscribe to message sent by main SearchDialog to keep track of the current filter criteria
                topic.subscribe('/wcd/Search', lang.hitch(this, function(values) {
                    this.filterValues = values;
                }));
            },

            updateSubmitButtonState: function() {
                if (this.state === '' && this.fileCountAndSizeAvailable) {
                    this.submitButton.set('disabled', false);
                }
                else {
                    this.submitButton.set('disabled', true);
                }
            },

            setGeometryText: function(text) {
                this.passGeometryText.innerHTML = text;
            },

            showGeometryCheckBox: function() {
                domStyle.set(this.chkPassGeometry.domNode, 'display', '');
                domStyle.set(this.passGeometryText, 'display', '');
            },

            hideGeometryCheckBox: function() {
                domStyle.set(this.chkPassGeometry.domNode, 'display', 'none');
                domStyle.set(this.passGeometryText, 'display', 'none');
            },

            showFullCruiseWarning: function() {
                domStyle.set(this.fullCruiseWarning, 'display', '');
            },

            hideFullCruiseWarning: function() {
                domStyle.set(this.fullCruiseWarning, 'display', 'none');
            },

            showLargeSizeWarning: function() {
                domStyle.set(this.largeSizeWarning, 'display', '');
            },

            hideLargeSizeWarning: function() {
                domStyle.set(this.largeSizeWarning, 'display', 'none');
            },

            execute: function(formContents) {
                var orderParams = {
                    name: formContents.name,
                    email: formContents.email,
                    organization: formContents.organization,
                    files: this.fileInfos,
                    cruiseAndInstrumentPairs: this.cruiseInfos                    
                };

                if (this.wktGeometry && this.chkPassGeometry.checked) {
                    orderParams.wktGeometry = this.wktGeometry;
                }

                //Append file-level filter criteria to the payload if we're passing cruise/instrument pairs
                if (this.filterValues && this.cruiseInfos) {
                    if (this.filterValues.bottomSoundingsOnly) {
                        orderParams.bottomSoundingsOnly = true;
                    }
                }

                this.submitOrder(orderParams);
            },

            displayFileCountAndSize: function(cruiseList, instrumentList, geometry, /*optional*/ numFiles) {
                //Gray out the OK button while calculating
                this.fileCountAndSizeAvailable = false;
                this.updateSubmitButtonState();

                this.numFilesText.innerHTML = 'Calculating...';
                this.fileSizeText.innerHTML = 'Calculating...';
                this.hideLargeSizeWarning();

                this.cruiseList = cruiseList;
                this.instrumentList = instrumentList;

                if (!cruiseList && !instrumentList) {
                    //Case where one file is being requested, report as 1 file with unknown size
                    this.updateFileSizeText(1, null);
                    return;
                }
                if (geometry && geometry.type === 'point' && numFiles) {
                    //Case where multiple files are requested near a point, report as the number of files with unknown size
                    this.updateFileSizeText(numFiles, null);
                    return;
                }

                var queryParams = {
                    dataset: 'wcs',
                    surveys: cruiseList.join(','),
                    instruments: instrumentList.join(',')                 
                };
                
                //Handle the various projections for extents/polygons, then query for file count and size.
                if (geometry && geometry.type !== 'point') {
                    var wkt = new Wkt.Wkt();

                    //Convert an extent to a polygon
                    if (geometry.type === 'extent') {
                        geometry = Polygon.fromExtent(geometry);
                    }

                    var geographicSR = new SpatialReference(4326);
                    if (geometry.spatialReference.wkid === 4326) {
                        //Geometry is in geographic, immediately query for the file count and size 
                        wkt.fromObject(geometry);
                        this.wktGeometry = wkt.write();
                        queryParams.wktGeometry = this.wktGeometry;
                        this.queryForFileCountAndSize(queryParams);
                    }
                    else if (webMercatorUtils.canProject(geometry, geographicSR)) {
                        //Geometry is is Web Mercator - convert to geographic and and immediately query for the file count and size
                        var geographicGeometry = webMercatorUtils.webMercatorToGeographic(geometry);
                        wkt.fromObject(geographicGeometry);
                        this.wktGeometry = wkt.write();
                        queryParams.wktGeometry = this.wktGeometry;
                        this.queryForFileCountAndSize(queryParams);
                    }
                    else { 
                        //Geometry is in Arctic/Antarctic coordinates. Use the asynchronous GeometryService to project to geographic.
                        var geometryService = esriConfig.defaults.geometryService;      
                        var projectParams = new ProjectParameters();   
                        projectParams.outSR = geographicSR;
                        projectParams.transformForward = true;           

                        //Geometry is a polygon in Arctic coordinates. First densify the polygon, then project to geographic.                      
                        //Densify the polygon to approximately 80 vertices
                        geometry = this.densifyPolygon(geometry, 80);
                        projectParams.geometries = [geometry];
                        
                        //Project the densififed geometry to geographic, then query for the file count and size
                        geometryService.project(projectParams, lang.hitch(this, function(geometries) {                            
                            wkt.fromObject(geometries[0]);
                            this.wktGeometry = wkt.write();
                            queryParams.wktGeometry = this.wktGeometry;
                            this.queryForFileCountAndSize(queryParams);
                        }), function(error) {
                            logger.error(error);
                        });                             
                    }
                }
                else {
                    //Case where no geometry is selected, or the geometry is a point. Query for the file count and size for entire cruise(s).
                    this.queryForFileCountAndSize(queryParams);
                }
            },

            queryForFileCountAndSize: function(queryParams) {
                var queryString = ioQuery.objectToQuery(queryParams);

                xhr.get('https://www.ngdc.noaa.gov/catalog-index/extents', {
                    headers: {
                        //Set these headers to prevent a pre-flight OPTIONS request to the server. These requests are being blocked.
                        "X-Requested-With": null,
                        'Content-Type': 'text/plain'
                    },
                    query: queryString,
                    handleAs: 'json',
                    timeout: 120000 //2 minute timeout
                }).then(lang.hitch(this, function(response){
                    var numFiles = response.count;
                    var megabytes = Math.round(response.size / 1048576.0 * 100) / 100;
                    this.updateFileSizeText(numFiles, megabytes);
                }), lang.hitch(this, function(error) {
                    //alert('Error: ' + error);
                    console.error('Unable to retrieve file size and count. Error: ' + error);
                    this.updateFileSizeText(null, null);
                }));
            },

            submitOrder: function(orderParams) {
                var jsonString = JSON.stringify(orderParams);

                var okDialog = new Dialog({
                    title: 'Request Submitted',
                    //content: 'Your order has been received. ',
                    'class': 'requestDataDialog',
                    style: 'width:300px'
                });
                new Button({
                    label: 'OK',
                    type: 'submit',
                    onClick: lang.hitch(this, function(){
                        okDialog.destroy();
                    })
                }).placeAt(okDialog.containerNode);

                topic.publish('/ngdc/showLoading'); //Show the loading spinner
                xhr.post('//www.ngdc.noaa.gov/wcs-order/order', {
                    data: jsonString,
                    handleAs: 'json',
                    headers: {'Content-Type':'application/json'},
                    timeout: 120000 //2 minute timeout
                }).then(lang.hitch(this, function(response){
                    logger.debug(response);
                    topic.publish('/ngdc/hideLoading'); //Hide the loading spinner
                    this.showOrderConfirmationDialog(response);
                }), function(error) {
                    var message;
                    if (error.response && error.response.text) {
                        message = JSON.parse(error.response.text).message;
                        alert('Error: ' + message);
                    } else {
                        alert('Unspecified error. Please contact wcd.info@noaa.gov for assistance.');
                    }
                    topic.publish('/ngdc/hideLoading'); //Hide the loading spinner
                });
            },

            showOrderConfirmationDialog: function(response) {
                var megabytes = Math.round(response.totalFileSizeInBytes / 1048576.0 * 100) / 100;
                var gigabytes = Math.round(response.totalFileSizeInBytes / 1073741824.0 * 100) / 100;
                var okDialog = new Dialog({
                    title: 'Request Submitted',
                    content: 'Your order has been received. Check your email for an order confirmation.<br>Please contact <a href="mailto:wcd.info@noaa.gov">wcd.info@noaa.gov</a> with any questions.<br><br>' +
                            'Total files in order: ' + response.totalFilesOrder + '<br>' +
                            'Total file size: ' + (megabytes < 1024 ? megabytes + ' MB' : gigabytes + ' GB') + '<br>' +
                            (response.fulfillmentType === 'ManualOrder' ? '<br>Because the request is very large, you will be contacted by a data manager for manual delivery.<br>' : ''),
                    'class': 'requestDataDialog',
                    style: 'width:300px'
                });
                new Button({
                    label: 'OK',
                    type: 'submit',
                    onClick: lang.hitch(this, function(){
                        okDialog.destroy();
                    })
                }).placeAt(okDialog.containerNode); 

                okDialog.show();   
            },

            updateFileSizeText: function(numFiles, megabytes) {
                if (megabytes) {
                    var gigabytes = Math.round(megabytes / 1024 * 100) / 100;
                    this.fileSizeText.innerHTML = (megabytes < 1024 ? megabytes + ' MB' : gigabytes + ' GB');

                    if (gigabytes > 100) {
                        this.showLargeSizeWarning();
                    } else {
                        this.hideLargeSizeWarning();
                    }
                } else {
                    this.fileSizeText.innerHTML = 'unavailable';
                }

                if (numFiles && numFiles > 0) {
                    this.numFilesText.innerHTML = numFiles.toString();
                    this.fileCountAndSizeAvailable = true;
                } else if (numFiles === 0) {
                    this.numFilesText.innerHTML = '0 <b>(Indicates an error. Data extraction disabled.)</b>';
                    this.fileCountAndSizeAvailable = false;
                } else {
                    this.numFilesText.innerHTML = 'unavailable';
                    this.fileCountAndSizeAvailable = true;
                }

                this.updateSubmitButtonState();
            },

            getSurveyAndInstrumentLists: function() {
                this.cruiseList = [];
                this.instrumentList = [];

                array.forEach(this.cruiseInfos, lang.hitch(this, function(cruiseInfo) {
                    var cruise = cruiseInfo[0];
                    var instrument = cruiseInfo[1];

                    if (array.indexOf(this.cruiseList, cruise) === -1) {
                        this.cruiseList.push(cruise);
                    }
                    if (array.indexOf(this.instrumentList, instrument) === -1) {
                        this.instrumentList.push(instrument);
                    }
                }));
            },

            densifyPolygon: function(polygon, numVertices) {
                //Densify the polygon to approximately numVertices
                var perimeter = geometryEngine.planarLength(polygon);
                return geometryEngine.densify(polygon, perimeter / numVertices);
            }

        });
    });
