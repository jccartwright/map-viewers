define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/on',
    'dojo/dom',
    'dojo/dom-attr',
    'dijit/form/CheckBox',
    'dijit/form/Select',
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
        dom,
        domAttr,
        CheckBox,
        Select,
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
            
            yearStrings: ['2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008-Summer', '2008-Fall', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018'],

            cruiseNumbers: {
                '2001': 246,
                '2002': 250,
                '2003': 254,
                '2004': 259,
                '2005': 265,
                '2006': 271,
                '2007': 276,
                '2008-Summer': 282,
                '2008-Fall': 284,
                '2009': 287,
                '2010': 290,
                '2011': 295,
                '2012': 299,
                '2013': 304,
                '2014': 308,
                '2015': 313,
                '2016': 318,
                '2017': 323,
                '2018': 328
            },

            visibleSstLayer: 3,

            postCreate: function() {
                this.inherited(arguments);

                on(this.selectYear, 'change', lang.hitch(this, function() {    
                    var yearString = this.selectYear.get('value');
                    this.updateHypoxiaCruise(yearString);
                    this.updateDownloadUrls(yearString);
                }));

                on(this.chkCtd, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Hypoxia', [1], this.chkCtd.checked);
                }));
                on(this.chkContours, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Hypoxia', [2], this.chkContours.checked);
                }));

                on(this.chkSst, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Hypoxia', [3, 4, 5, 6, 7, 8, 9, 10, 11], false);
                    topic.publish('/ngdc/sublayer/visibility', 'Hypoxia', [this.visibleSstLayer], this.chkSst.checked);
                }));
                on(this.selectSst, 'change', lang.hitch(this, function() {
                    this.visibleSstLayer = parseInt(this.selectSst.get('value'));
                    var timeFrame = this.selectSst.get('containerNode').innerText.split(' ')[0]
                    topic.publish('/sst/timeFrame', timeFrame);
                    topic.publish('/ngdc/sublayer/visibility', 'Hypoxia', [3, 4, 5, 6, 7, 8, 9, 10, 11], false);
                    topic.publish('/ngdc/sublayer/visibility', 'Hypoxia', [this.visibleSstLayer], this.chkSst.checked);
                }));

                on(this.chkDepth10, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', '10m Contour', this.chkDepth10.checked);
                }));
                 on(this.chkDepth200, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', '200m Contour', this.chkDepth200.checked);
                }));
            },

            updateHypoxiaCruise: function(yearString) {
                var cruiseNumber = this.cruiseNumbers[yearString];

                var layerDefs = [];
                layerDefs[1] = 'cruiseno=' + cruiseNumber;
                layerDefs[2] = 'cruise=' + cruiseNumber;
                this.hypoxiaLayer.setLayerDefinitions(layerDefs);
            },

            updateDownloadUrls: function(yearString) {
                dom.byId('selectedSeasonSpan').innerHTML = yearString;

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