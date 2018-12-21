define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/on',
    'dojo/dom',
    'dojo/dom-attr',
    'dijit/form/CheckBox',
    'dijit/form/Select',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!./templates/LayersPanel.html'],
    function(
        declare, 
        lang,
        topic,
        on,
        dom,
        domAttr,
        CheckBox,
        Select,
        _WidgetBase, 
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        template){
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            // Our template - important!
            templateString: template,
            // A class to be applied to the root node in our template
            baseClass: 'layersPanel',
            
            ctdStationsVisible: true,
            contoursVisible: true,

            yearStrings: ['2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008-Summer', '2008-Fall', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018'],


            postCreate: function() {
                this.inherited(arguments);

                on(this.selectYear, 'change', lang.hitch(this, function() {    
                    var yearIdx = parseInt(this.selectYear.get('value'));                
                    this.updateVisibleHypoxiaLayers();
                    this.updateDownloadUrls(this.yearStrings[yearIdx]);
                }));

                on(this.chkCtd, 'change', lang.hitch(this, function() {
                    this.ctdStationsVisible = this.chkCtd.checked;
                    this.updateVisibleHypoxiaLayers();
                    //topic.publish('/hypoxia/ctdVisible', this.chkCtd.checked);
                }));
                on(this.chkContours, 'change', lang.hitch(this, function() {
                    this.contoursVisible = this.chkContours.checked;
                    this.updateVisibleHypoxiaLayers();
                    //topic.publish('/hypoxia/contoursVisible', this.chkContours.checked);
                }));
            },

            updateVisibleHypoxiaLayers: function(layerIndex) {
                var yearIdx = parseInt(this.selectYear.get('value'));
                var layerIndex = yearIdx*2 + 10;
                var visibleLayers = [];
                if (this.ctdStationsVisible) {
                    visibleLayers.push(layerIndex);
                }
                if (this.contoursVisible) {
                    visibleLayers.push(layerIndex + 1);
                }
                this.hypoxiaLayer.setVisibleLayers([-1]);
                topic.publish('/ngdc/sublayer/visibility', 'Hypoxia', visibleLayers, true);
            },

            updateDownloadUrls: function(yearString) {
                //https://service.ncddc.noaa.gov/rdn/www/media/documents/hypoxia/metadata/2004-Hypoxia-Stations.html
                //https://service.ncddc.noaa.gov/rdn/www/media/hypoxia/maps/2004-hypoxia-stations.jpg
                //https://service.ncddc.noaa.gov/rdn/www/media/documents/hypoxia/data/2004-Hypoxia-Stations.zip

                //https://service.ncddc.noaa.gov/rdn/www/media/documents/hypoxia/metadata/2009-Hypoxia-Contours.html
                //https://service.ncddc.noaa.gov/rdn/www/media/hypoxia/maps/2009-hypoxia-contours.jpg
                //https://service.ncddc.noaa.gov/rdn/www/media/documents/hypoxia/data/2009-Hypoxia-Contours.zip

                dom.byId('ctdMetadataLink').href = 'https://service.ncddc.noaa.gov/rdn/www/media/documents/hypoxia/metadata/' + yearString + '-Hypoxia-Stations.html';
                dom.byId('ctdJpgLink').href = 'https://service.ncddc.noaa.gov/rdn/www/media/hypoxia/maps/' + yearString.toLowerCase() + '-hypoxia-stations.jpg';
                dom.byId('ctdShapefileLink').href = 'https://service.ncddc.noaa.gov/rdn/www/media/documents/hypoxia/data/' + yearString + '-Hypoxia-Stations.zip';

                dom.byId('ctrMetadataLink').href = 'https://service.ncddc.noaa.gov/rdn/www/media/documents/hypoxia/metadata/' + yearString + '-Hypoxia-Contours.html';
                dom.byId('ctrJpgLink').href = 'https://service.ncddc.noaa.gov/rdn/www/media/hypoxia/maps/' + yearString.toLowerCase() + '-hypoxia-contours.jpg';
                dom.byId('ctrShapefileLink').href = 'https://service.ncddc.noaa.gov/rdn/www/media/documents/hypoxia/data/' + yearString + '-Hypoxia-Contours.zip';
            }
        });
    }
);