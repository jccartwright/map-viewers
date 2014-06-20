define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/on',
    'dojo/aspect',
    'dojo/dom',
    'dojo/dom-attr',
    'dojo/string',
    'dijit/form/CheckBox',
    'dijit/form/Button',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'app/SearchDialog',
    'dojo/text!./templates/LayersPanel.html'],
    function(
        declare, 
        lang,
        topic,
        on,
        aspect,
        dom,
        domAttr,
        string,
        CheckBox,
        Button,
        _WidgetBase, 
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        SearchDialog,
        template
        ){
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            // Our template - important!
            templateString: template,
            // A class to be applied to the root node in our template
            baseClass: 'layersPanel',

            searchDialog: null,

            postCreate: function() {
                this.inherited(arguments);

                on(this.chkNMFS, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Water Column Sonar', [1], this.chkNMFS.checked);
                }));
                on(this.chkOER, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Water Column Sonar', [2], this.chkOER.checked);
                }));
                on(this.chkUNOLS, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Water Column Sonar', [3], this.chkUNOLS.checked);                    
                }));
                on(this.chkOther, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Water Column Sonar', [4], this.chkOther.checked);                    
                }));
                
                on(this.searchButton, 'click', lang.hitch(this, function() {
                    if (!this.searchDialog) {
                        this.searchDialog = new SearchDialog({title: 'Water Column Sonar Data Search'});
                    }
                    this.searchDialog.show();
                }));

                on(this.resetButton, 'click', lang.hitch(this, function() {
                    topic.publish('/wcd/ResetSearch');
                }));
            },

            disableResetButton: function() {
                this.resetButton.set('disabled', true);
            },

            enableResetButton: function() {
                this.resetButton.set('disabled', false);
            },

            setCurrentFilterString: function(values) {
                var filterDiv = dom.byId('currentFilter');
                if (!values) {
                    filterDiv.innerHTML = '';
                    return;
                }

                var s = '<b>Current filter:</b><br>';
                
                if (values.startDate && values.endDate) {
                    s += 'Date: ' + this.toDateString(values.startDate) + ' to ' + this.toDateString(values.endDate) + '<br>';
                }
                else if (values.startDate) {
                    s += 'Starting date: ' + this.toDateString(values.startDate) + '<br>';
                }
                else if (values.endDate) {
                    s += 'Ending date: ' + this.toDateString(values.endDate) + '<br>';
                }

                if (values.cruiseId) {
                    s += 'Survey ID: ' + values.cruiseId + '<br>';
                }
                if (values.instruments && values.instruments.length > 0) {
                    s += 'Instrument: ' + values.instruments.join(',') + '<br>';
                }

                if (values.minNumBeams && values.maxNumBeams) {
                    s += 'Number of beams: ' + values.minNumBeams + ' to ' + values.maxNumBeams + '<br>';
                }
                else if (values.minNumBeams) {
                    s += 'Number of beams: greater than ' + values.minNumBeams + '<br>';
                }
                else if (values.maxNumBeams) {
                    s += 'Number of beams: less than ' + values.maxNumBeams + '<br>';
                }

                if (values.minRecordingRange && values.maxRecordingRange) {
                    s += 'Recording range: ' + values.minRecordingRange + ' to ' + values.maxRecordingRange + ' m<br>';
                }
                else if (values.minRecordingRange) {
                    s += 'Recording range: greater than ' + values.minRecordingRange + ' m<br>';
                }
                else if (values.maxRecordingRange) {
                    s += 'Recording range: less than ' + values.maxRecordingRange + ' m<br>';
                }

                if (values.minSwathWidth && values.maxSwathWidth) {
                    s += 'Swath width: ' + values.minSwathWidth + ' to ' + values.maxSwathWidth + ' degrees<br>';
                }
                else if (values.minSwathWidth) {
                    s += 'Swath width: greater than ' + values.minSwathWidth + ' degrees<br>';
                }
                else if (values.maxSwathWidth) {
                    s += 'Swath width: less than ' + values.maxSwathWidth + ' degrees<br>';
                }
                filterDiv.innerHTML = s;
            },

            //Format a date in the form yyyymmdd
            toDateString: function(date) {
                //return date.getFullYear() + '-' + padDigits(date.getMonth()+1,2) + '-' + padDigits(date.getDate(),2);
                return date.getFullYear() + '-' + string.pad(date.getMonth()+1, 2) + '-' + string.pad(date.getDate(), 2);
            },

            padDigits: function(n, totalDigits){
                n = n.toString();
                var pd = '';
                if (totalDigits > n.length) {
                    for (var i = 0; i < (totalDigits - n.length); i++) {
                        pd += '0';
                    }
                }
                return pd + n.toString();
            }            
        });
    }
);