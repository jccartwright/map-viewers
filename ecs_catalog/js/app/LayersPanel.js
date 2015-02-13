define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/on',
    'dojo/aspect',
    'dojo/dom',
    'dojo/dom-attr',
    'dijit/form/CheckBox',
    'dijit/TitlePane',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!./templates/LayersPanel.html'],
    function(
        declare, 
        lang,
        topic,
        on,
        aspect,
        dom,
        domAttr,
        CheckBox,
        TitlePane,
        _WidgetBase, 
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        template){
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            // Our template - important!
            templateString: template,
            // A class to be applied to the root node in our template
            baseClass: 'layersPanel',

            postCreate: function() {
                this.inherited(arguments);

                //Formula Line Products
                on(this.chkFosProfile, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['FOS Profile'], this.chkFosProfile.checked);                    
                }));
                on(this.chkFosPoint, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['FOS Point'], this.chkFosPoint.checked);                    
                }));
                on(this.chk60mFormula, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['60 M Formula'], this.chk60mFormula.checked);                     
                }));                
                on(this.chkSedimentThicknessFormula, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Sediment Thickness Formula Line'], this.chkSedimentThicknessFormula.checked);
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Sediment Thickness Formula Point'], this.chkSedimentThicknessFormula.checked);                    
                }));
                on(this.chkFinalFormulaLine, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Final Formula Line'], this.chkFinalFormulaLine.checked);                    
                }));

                //Constraint Line Products
                on(this.chkDistanceConstraintLine, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Distance Constraint Line'], this.chkDistanceConstraintLine.checked);                    
                }));
                
                on(this.chkEnvelopeFosPoints, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['FOS Envelope'], this.chkEnvelopeFosPoints.checked);                    
                }));
                on(this.chkClipped2500mIsobath, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Clipped 2500m Isobath'], this.chkClipped2500mIsobath.checked);                    
                }));
                on(this.chkDepthConstraint, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Depth Constraint Line'], this.chkDepthConstraint.checked);                    
                }));
                on(this.chkFinalConstraintLine, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Final Constraint Line'], this.chkFinalConstraintLine.checked);                    
                }));

                //Outer Limit Products
                on(this.chkOuterLimit, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Outer Limit Line'], this.chkOuterLimit.checked);
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Outer Limit Point'], this.chkOuterLimit.checked);                     
                }));
                on(this.chkEcsArea, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['ECS Area'], this.chkEcsArea.checked);                    
                }));

                //Boundaries
                on(this.chkEEZ, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['US EEZ'], this.chkEEZ.checked);                    
                }));
                on(this.chkBaselinePoints, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Baseline Point'], this.chkBaselinePoints.checked);                    
                }));
                on(this.chk2500mIsobath, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['2500m Isobath'], this.chk2500mIsobath.checked);                    
                }));
                on(this.chkCoastline, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Coastline'], this.chkCoastline.checked);                    
                }));
                on(this.chkInternational, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['International Boundary'], this.chkInternational.checked);                    
                }));

                //Data Products
                on(this.chkSedimentThickness, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Sediment Thickness Product (Point)'], this.chkSedimentThickness.checked);
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Sediment Thickness Product (Polygon)'], this.chkSedimentThickness.checked);                    
                }));
                on(this.chkBathymetricProduct, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Bathymetric Product'], this.chkBathymetricProduct.checked);                    
                }));
                on(this.chkBathymetricSlopeProduct, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Bathymetric Slope Product'], this.chkBathymetricSlopeProduct.checked);                    
                }));
                on(this.chkBathymetricCurvatureProduct, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Bathymetric Curvature Product'], this.chkBathymetricCurvatureProduct.checked);                    
                }));
                on(this.chkBackscatterProduct, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Backscatter Product'], this.chkBackscatterProduct.checked);                    
                }));

                on(this.chkSeismicProductMCS, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Seismic Product (MCS)'], this.chkSeismicProductMCS.checked);                    
                }));
                on(this.chkSeismicProductMCS3D, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Seismic Product (MCS-3D)'], this.chkSeismicProductMCS3D.checked);                    
                }));
                on(this.chkSeismicProductSCS, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Seismic Product (SCS)'], this.chkSeismicProductSCS.checked);                    
                }));
                on(this.chkSeismicProduct35kHz, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Seismic Product (3.5 kHz)'], this.chkSeismicProduct35kHz.checked);                    
                }));
                on(this.chkSeismicProductOBS, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Seismic Product (OBS)'], this.chkSeismicProductOBS.checked);                    
                }));
                on(this.chkSeismicProductSonobuoy, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Seismic Product (Sonobuoy)'], this.chkSeismicProductSonobuoy.checked);                    
                }));
                on(this.chkSeismicProductOther, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Seismic Product (Other)'], this.chkSeismicProductOther.checked);                    
                }));

                on(this.chkBasementGeologyProductMagnetic, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Basement Geology Product (Magnetic)'], this.chkBasementGeologyProductMagnetic.checked);                    
                }));
                on(this.chkBasementGeologyProductGravity, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Basement Geology Product (Gravity)'], this.chkBasementGeologyProductGravity.checked);                    
                }));
                on(this.chkBasementGeologyProductGeology, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Basement Geology Product (Geology)'], this.chkBasementGeologyProductGeology.checked);                    
                }));
                on(this.chkBasementGeologyProductComposite, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Basement Geology Product (Composite)'], this.chkBasementGeologyProductComposite.checked);                    
                }));

                //Source Data
                on(this.chkBathymetryDataMultibeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Bathymetric Data (Multibeam)'], this.chkBathymetryDataMultibeam.checked);                    
                }));
                on(this.chkBathymetryDataSingleBeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Bathymetric Data (Single-Beam)'], this.chkBathymetryDataSingleBeam.checked);                    
                }));
                on(this.chkBackscatterDataMultibeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Backscatter Data (Multibeam)'], this.chkBackscatterDataMultibeam.checked);                    
                }));
                on(this.chkBackscatterDataSideScanSonar, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Backscatter Data (Side-scan Sonar)'], this.chkBackscatterDataSideScanSonar.checked);                    
                }));
                on(this.chkSeismicDataMCS, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Seismic Data (MCS)'], this.chkSeismicDataMCS.checked);                    
                }));
                on(this.chkSeismicDataMCS3D, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Seismic Data (MCS-3D)'], this.chkSeismicDataMCS3D.checked);                    
                }));
                on(this.chkSeismicDataSCS, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Seismic Data (SCS)'], this.chkSeismicDataSCS.checked);                    
                }));
                on(this.chkSeismicData35kHz, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Seismic Data (3.5 kHz)'], this.chkSeismicData35kHz.checked);                    
                }));
                on(this.chkSeismicDataOBS, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Seismic Data (OBS)'], this.chkSeismicDataOBS.checked);                    
                }));
                on(this.chkSeismicDataSonobuoy, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Seismic Data (Sonobuoy)'], this.chkSeismicDataSonobuoy.checked);                    
                }));
                on(this.chkSeismicDataOther, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Seismic Data (Other)'], this.chkSeismicDataOther.checked);                    
                }));
                on(this.chkCombinedData, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Combined Data'], this.chkCombinedData.checked);                    
                }));
                on(this.chkGravityData, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Gravity Data'], this.chkGravityData.checked);                    
                }));
                on(this.chkMagneticsDataMarine, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Magnetics Data (Marine)'], this.chkMagneticsDataMarine.checked);                    
                }));
                on(this.chkMagneticsDataAirborne, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Magnetics Data (Airborne)'], this.chkMagneticsDataAirborne.checked);                    
                }));
                on(this.chkGeologicDataSeafloorPhoto, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Geologic Data (Seafloor Photo)'], this.chkGeologicDataSeafloorPhoto.checked);                    
                }));
                on(this.chkGeologicDataRockDredge, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Geologic Data (Rock Dredge)'], this.chkGeologicDataRockDredge.checked);                    
                }));
                on(this.chkGeologicDataCoreDescription, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Geologic Data (Core Description)'], this.chkGeologicDataCoreDescription.checked);                    
                }));
                on(this.chkGeologicDataBoreholeDescription, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayerByName/visibility', 'ECS Catalog', ['Geologic Data (Borehole Description)'], this.chkGeologicDataBoreholeDescription.checked);                    
                }));

                //Pre-2012 Source Data
                on(this.chkMultibeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Multibeam', this.chkMultibeam.checked);                    
                }));
                on(this.chkTracklineBathymetry, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline', [1], this.chkTracklineBathymetry.checked);                    
                }));
                on(this.chkTracklineGravity, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline', [2], this.chkTracklineGravity.checked);                    
                }));
                on(this.chkTracklineMagnetics, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline', [3], this.chkTracklineMagnetics.checked);                    
                }));
                on(this.chkTracklineMultiChannelSeismics, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline', [4], this.chkTracklineMultiChannelSeismics.checked);                    
                }));
                on(this.chkTracklineSeismicRefraction, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline', [5], this.chkTracklineSeismicRefraction.checked);                    
                }));
                on(this.chkTracklineShotPointNavigation, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline', [6], this.chkTracklineShotPointNavigation.checked);                    
                }));
                on(this.chkTracklineSideScanSonar, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline', [7], this.chkTracklineSideScanSonar.checked);                    
                }));
                on(this.chkTracklineSingleChannelSeismics, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline', [8], this.chkTracklineSingleChannelSeismics.checked);                    
                }));
                on(this.chkTracklineSubbottomProfile, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline', [9], this.chkTracklineSubbottomProfile.checked);                    
                }));
                on(this.chkGeologicSamples, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Sample Index', this.chkGeologicSamples.checked);                    
                }));
            }
        });
    }
);