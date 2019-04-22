define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/on',
    'dojo/dom',
    'dojo/dom-attr',
    'dojo/dom-style',
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
        domStyle,
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
            
            cruiseInfos: [
                {yearString: '2001', cruiseNumber: 246, accessionLink: ''},
                {yearString: '2002', cruiseNumber: 250, accessionLink: ''},
                {yearString: '2003', cruiseNumber: 254, accessionLink: ''},
                {yearString: '2004', cruiseNumber: 259, accessionLink: ''},
                {yearString: '2005', cruiseNumber: 265, accessionLink: ''},
                {yearString: '2006', cruiseNumber: 271, accessionLink: ''},
                {yearString: '2007', cruiseNumber: 276, accessionLink: ''},
                {yearString: '2008-Summer', cruiseNumber: 282, accessionLink: ''},
                {yearString: '2008-Fall', cruiseNumber: 284, accessionLink: ''},
                {yearString: '2009', cruiseNumber: 287, accessionLink: ''},
                {yearString: '2010', cruiseNumber: 290, accessionLink: ''},
                {yearString: '2011', cruiseNumber: 295, accessionLink: ''},
                {yearString: '2012', cruiseNumber: 299, accessionLink: ''},
                {yearString: '2013', cruiseNumber: 304, accessionLink: ''},
                {yearString: '2014', cruiseNumber: 308, accessionLink: ''},
                {yearString: '2015', cruiseNumber: 313, accessionLink: ''},
                {yearString: '2016', cruiseNumber: 318, accessionLink: ''},
                {yearString: '2017', cruiseNumber: 323, accessionLink: ''},
                //{yearString: '2018', cruiseNumber: 328, accessionLink: 'https://www.ncei.noaa.gov/metadata/geoportal/rest/metadata/item/gov.noaa.nodc:0174810/html'}
                {yearString: '2018', cruiseNumber: 328, accessionLink: 'https://data.nodc.noaa.gov/cgi-bin/iso?id=gov.noaa.nodc:0174810'}                
            ],

            visibleSstLayer: 3,

            startup: function() {
                this.inherited(arguments);

                this.updateDownloadUrls();
                this.updateAccessionLink();
            },

            postCreate: function() {
                this.inherited(arguments);

                var numCruises = this.cruiseInfos.length;
                this.timeSpanIndex = numCruises - 1;                

                on(this.selectYear, 'change', lang.hitch(this, function() {    
                    this.timeSpanIndex = parseInt(this.selectYear.get('value'));
                    this.updateHypoxiaCruise();
                    this.updateDownloadUrls();
                    this.updateAccessionLink();
                }));

                on(this.leftButton, 'click', lang.hitch(this, function() {    
                    if (this.timeSpanIndex > 0) {
                        this.timeSpanIndex--;
                        this.selectYear.set('value', this.timeSpanIndex);
                    }
                }));
                on(this.rightButton, 'click', lang.hitch(this, function() {    
                    if (this.timeSpanIndex < numCruises - 1) {
                        this.timeSpanIndex++;
                        this.selectYear.set('value', this.timeSpanIndex);
                    }
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

            updateHypoxiaCruise: function() {
                var cruiseNumber = this.cruiseInfos[this.timeSpanIndex].cruiseNumber;

                var layerDefs = [];
                layerDefs[1] = 'cruiseno=' + cruiseNumber;
                layerDefs[2] = 'cruise=' + cruiseNumber;
                this.hypoxiaLayer.setLayerDefinitions(layerDefs);
            },

            updateDownloadUrls: function() {
                var yearString = this.cruiseInfos[this.timeSpanIndex].yearString;
                dom.byId('selectedSeasonSpan').innerHTML = yearString;

                dom.byId('ctdMetadataLink').href = 'https://service.ncddc.noaa.gov/rdn/www/media/documents/hypoxia/metadata/' + yearString + '-Hypoxia-Stations.html';
                dom.byId('ctdJpgLink').href = 'https://service.ncddc.noaa.gov/rdn/www/media/hypoxia/maps/' + yearString.toLowerCase() + '-hypoxia-stations.jpg';
                dom.byId('ctdShapefileLink').href = 'https://service.ncddc.noaa.gov/rdn/www/media/documents/hypoxia/data/' + yearString + '-Hypoxia-Stations.zip';

                dom.byId('ctrMetadataLink').href = 'https://service.ncddc.noaa.gov/rdn/www/media/documents/hypoxia/metadata/' + yearString + '-Hypoxia-Contours.html';
                dom.byId('ctrJpgLink').href = 'https://service.ncddc.noaa.gov/rdn/www/media/hypoxia/maps/' + yearString.toLowerCase() + '-hypoxia-contours.jpg';
                dom.byId('ctrShapefileLink').href = 'https://service.ncddc.noaa.gov/rdn/www/media/documents/hypoxia/data/' + yearString + '-Hypoxia-Contours.zip';
            },

            updateAccessionLink: function() {
                var accessionLink = this.cruiseInfos[this.timeSpanIndex].accessionLink;
                var accessionLinkNode = dom.byId('accessionLink');
                accessionLinkNode.href = accessionLink;

                if (accessionLink == '') {
                    domStyle.set(accessionLinkNode, 'display', 'none');
                } else {
                    domStyle.set(accessionLinkNode, 'display', 'block');
                }
            }
        });
    }
);