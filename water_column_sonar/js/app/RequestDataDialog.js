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
    'dojo/dom',
    'dojo/dom-attr',
    'dojo/on',
    'dijit/form/ValidationTextBox',
    'dojox/validate/web',
    'dojo/request/xhr',
    'dojo/json',
    'dojo/dom-style',
    'esri/geometry/Polygon',
    'esri/geometry/webMercatorUtils',
    'esri/SpatialReference',
    'esri/config',
    'esri/tasks/GeometryService',
    'esri/tasks/ProjectParameters',
    'esri/tasks/DensifyParameters',
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
        dom,
        domAttr,
        on,
        ValidationTextBox,
        validate,
        xhr,
        JSON,
        domStyle,
        Polygon,
        webMercatorUtils,
        SpatialReference,
        esriConfig,
        GeometryService,
        ProjectParameters,
        DensifyParameters,
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
                    if (this.state === '') {
                        this.submitButton.set('disabled', false);
                    }
                    else {
                        this.submitButton.set('disabled', true);
                    }
                });
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

            execute: function(formContents) {

                var orderParams = {
                    name: formContents.name,
                    email: formContents.email,
                    organization: formContents.organization,
                    files: this.fileInfos,
                    cruiseAndInstrumentPairs: this.cruiseInfos
                };

                if (this.geometry && this.chkPassGeometry.checked) {
                    var wkt = new Wkt.Wkt();

                    //Convert an extent to a polygon
                    if (this.geometry.type === 'extent') {
                        this.geometry = Polygon.fromExtent(this.geometry);
                    }

                    var geographicSR = new SpatialReference(4326);
                    if (this.geometry.spatialReference.wkid == 4326) {
                        //Geometry is in geographic
                        wkt.fromObject(this.geometry);
                        orderParams.geometry = wkt.write();
                        this.submitOrder(orderParams);
                    }
                    else if (webMercatorUtils.canProject(this.geometry, geographicSR)) {
                        //Geometry is is Web Mercator - convert to geographic and submit order
                        geographicGeometry = webMercatorUtils.webMercatorToGeographic(this.geometry);
                        wkt.fromObject(geographicGeometry);
                        orderParams.geometry = wkt.write();
                        this.submitOrder(orderParams);
                    }
                    else { 
                        //Geometry is in Arctic coordinates. Use the GeometryService to project to geographic.
                        var geometryService = esriConfig.defaults.geometryService;      
                        var projectParams = new ProjectParameters();   
                        projectParams.outSR = geographicSR;
                        projectParams.transformForward = true;           

                        if (this.geometry.type === 'polygon') {
                            //Geometry is a polygon in Arctic coordinates. First densify the polygon, then project to geographic.
                                                                                    
                            //Set the densify max segment length to be 1/20th of the width of the polygon in meters
                            var extent = this.geometry.getExtent();
                            var extentWidth = Math.abs(extent.xmax - extent.xmin);
                            var densifyParams = new DensifyParameters();
                            densifyParams.maxSegmentLength = extentWidth / 20;

                            densifyParams.geodesic = false;
                            densifyParams.geometries = [this.geometry];
                            //Densify the geometry
                            geometryService.densify(densifyParams, lang.hitch(this, function(geometries) {
                                projectParams.geometries = geometries;
                                
                                //Project the densififed geometry, then submit the order
                                geometryService.project(projectParams, lang.hitch(this, function(geometries) {                            
                                    wkt.fromObject(geometries[0]);
                                    orderParams.geometry = wkt.write();
                                    this.submitOrder(orderParams);
                                }), function(error) {
                                    logger.error(error);
                                });

                            }), function(error) {
                                logger.error(error);
                            });
                        }
                        else { 
                            //Geometry is a Point in Arctic coords
                            //Project the geometry, then submit the order
                            projectParams.geometries = [this.geometry];
                            geometryService.project(projectParams, lang.hitch(this, function(geometries) {                            
                                wkt.fromObject(geometries[0]);
                                orderParams.geometry = wkt.write();
                                this.submitOrder(orderParams);
                                
                            }), function(error) {
                                logger.error(error);
                            });
                        }
                    }
                }
                else {
                    this.submitOrder(orderParams);
                }
            },

            submitOrder: function(orderParams) {
                var jsonString = JSON.stringify(orderParams);

                var okDialog = new Dialog({
                    title: 'Request Submitted',
                    content: 'Your order has been received. We will contact you when your order is ready for pickup. Please contact the water column sonar data manager at <a href="mailto:wcd.info@noaa.gov">wcd.info@noaa.gov</a> if you have any questions.',
                    class: 'requestDataDialog',
                    style: 'width:300px'
                });
                new Button({
                    label: 'OK',
                    type: 'submit',
                    onClick: lang.hitch(this, function(){
                        okDialog.destroy();
                    })
                }).placeAt(okDialog.containerNode);

                xhr.post(
                    'http://maps.ngdc.noaa.gov/mapviewer-support/wcd/generateOrder.groovy', {
                        data: jsonString,
                        handleAs: 'json',
                        headers: {'Content-Type':'application/json'}
                    }).then(function(response){
                        logger.debug(response);
                        okDialog.show();
                    }, function(error) {
                        alert('Error: ' + error);
                    });
            }
        });
    });
