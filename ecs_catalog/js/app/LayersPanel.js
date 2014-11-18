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
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [7], this.chkFosProfile.checked);                    
                }));
                on(this.chkFosPoint, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [1], this.chkFosPoint.checked);                    
                }));
                on(this.chk60mFormulaPoint, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [2], this.chk60mFormulaPoint.checked);                    
                }));
                on(this.chk60mFormulaLine, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [9], this.chk60mFormulaLine.checked);                    
                }));
                on(this.chkSedimentThicknessFormula, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [10], this.chkSedimentThicknessFormula.checked);                    
                }));
                on(this.chkFinalFormulaLine, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [11], this.chkFinalFormulaLine.checked);                    
                }));

                //Constraint Line Products
                on(this.chkDistanceConstraintLine, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [12], this.chkDistanceConstraintLine.checked);                    
                }));
                on(this.chk2500mIsobath, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [13], this.chk2500mIsobath.checked);                    
                }));
                on(this.chkEnvelopeFosPoints, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [19], this.chkEnvelopeFosPoints.checked);                    
                }));
                on(this.chkClipped2500mIsobath, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [14], this.chkClipped2500mIsobath.checked);                    
                }));
                on(this.chkDepthConstraintPoint, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [4], this.chkDepthConstraintPoint.checked);                    
                }));
                on(this.chkDepthConstraintLine, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [15], this.chkDepthConstraintLine.checked);                    
                }));
                on(this.chkFinalConstraintLine, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [8], this.chkFinalConstraintLine.checked);                    
                }));

                //Outer Limit Products
                on(this.chkOuterLimitPoint, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [6], this.chkOuterLimitPoint.checked);                    
                }));
                on(this.chkOuterLimitLine, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [17], this.chkOuterLimitLine.checked);                    
                }));
                on(this.chkEcsArea, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [20], this.chkEcsArea.checked);                    
                }));

                //Boundaries
                on(this.chkBaselinePoints, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [5], this.chkBaselinePoints.checked);                    
                }));
                on(this.chkCoastline, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [16], this.chkCoastline.checked);                    
                }));
                on(this.chkInternational, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [18], this.chkInternational.checked);                    
                }));

                //Data Products
                on(this.chkSedimentThickness, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [32], this.chkSedimentThickness.checked);                    
                }));
                on(this.chkBathymetricProduct, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [33], this.chkBathymetricProduct.checked);                    
                }));
                on(this.chkBathymetricSlopeProduct, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [34], this.chkBathymetricSlopeProduct.checked);                    
                }));
                on(this.chkBathymetricCurvatureProduct, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [35], this.chkBathymetricCurvatureProduct.checked);                    
                }));
                on(this.chkBackscatterProduct, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [36], this.chkBackscatterProduct.checked);                    
                }));
                on(this.chkSeismicProduct, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [37], this.chkSeismicProduct.checked);                    
                }));
                on(this.chkVelocityGrid, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [38], this.chkVelocityGrid.checked);                    
                }));
                on(this.chkBasementGeologyProduct, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [39], this.chkBasementGeologyProduct.checked);                    
                }));

                //Source Data
                on(this.chkBathymetryData, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [24], this.chkBathymetryData.checked);                    
                }));
                on(this.chkBackscatterData, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [25], this.chkBackscatterData.checked);                    
                }));
                on(this.chkSeismicData, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [26], this.chkSeismicData.checked);                    
                }));
                on(this.chkCombinedData, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [27], this.chkCombinedData.checked);                    
                }));
                on(this.chkGravityData, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [28], this.chkGravityData.checked);                    
                }));
                on(this.chkMagneticsData, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [29], this.chkMagneticsData.checked);                    
                }));
                on(this.chkGeologicData, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'ECS Catalog', [30], this.chkGeologicData.checked);                    
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