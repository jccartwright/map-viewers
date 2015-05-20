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

                this.layerMode = 'cruise';

                this.searchDialog = new SearchDialog({title: 'Water Column Sonar Data Search'});

                on(this.chkNMFS, 'change', lang.hitch(this, function() {
                    if (this.layerMode === 'cruise') {
                        topic.publish('/ngdc/sublayer/visibility', 'Water Column Sonar', [8], this.chkNMFS.checked);
                    } else {
                        topic.publish('/ngdc/sublayer/visibility', 'Water Column Sonar', [1], this.chkNMFS.checked);
                    }
                }));
                on(this.chkOER, 'change', lang.hitch(this, function() {
                    if (this.layerMode === 'cruise') {
                        topic.publish('/ngdc/sublayer/visibility', 'Water Column Sonar', [9], this.chkOER.checked);
                    } else {
                        topic.publish('/ngdc/sublayer/visibility', 'Water Column Sonar', [2], this.chkOER.checked);
                    }
                }));
                on(this.chkUNOLS, 'change', lang.hitch(this, function() {
                    if (this.layerMode === 'cruise') {
                        topic.publish('/ngdc/sublayer/visibility', 'Water Column Sonar', [10], this.chkUNOLS.checked);
                    } else {
                        topic.publish('/ngdc/sublayer/visibility', 'Water Column Sonar', [3], this.chkUNOLS.checked);
                    }
                }));
                on(this.chkOtherNoaa, 'change', lang.hitch(this, function() {
                    if (this.layerMode === 'cruise') {
                        topic.publish('/ngdc/sublayer/visibility', 'Water Column Sonar', [11], this.chkOtherNoaa.checked);
                    } else {
                        topic.publish('/ngdc/sublayer/visibility', 'Water Column Sonar', [4], this.chkOtherNoaa.checked);
                    }
                }));
                on(this.chkOther, 'change', lang.hitch(this, function() {
                    if (this.layerMode === 'cruise') {
                        topic.publish('/ngdc/sublayer/visibility', 'Water Column Sonar', [12], this.chkOther.checked);
                    } else {
                        topic.publish('/ngdc/sublayer/visibility', 'Water Column Sonar', [5], this.chkOther.checked);
                    }
                }));
                on(this.chkNonUs, 'change', lang.hitch(this, function() {
                    if (this.layerMode === 'cruise') {
                        topic.publish('/ngdc/sublayer/visibility', 'Water Column Sonar', [13], this.chkNonUs.checked);
                    } else {
                        topic.publish('/ngdc/sublayer/visibility', 'Water Column Sonar', [6], this.chkNonUs.checked);
                    }
                }));

                on(this.searchButton, 'click', lang.hitch(this, function() {                    
                    this.searchDialog.show();
                }));

                on(this.resetButton, 'click', lang.hitch(this, function() {
                    topic.publish('/wcd/ResetSearch');
                }));
            },

            activateCruiseMode: function() {
                this.layerMode = 'cruise';
                var visibleLayers = [];
                if (this.chkNMFS.checked) {
                    visibleLayers.push(8);
                }
                if (this.chkOER.checked) {
                    visibleLayers.push(9);
                }
                if (this.chkUNOLS.checked) {
                    visibleLayers.push(10);
                }
                if (this.chkOtherNoaa.checked) {
                    visibleLayers.push(11);
                }
                if (this.chkOther.checked) {
                    visibleLayers.push(12);
                }
                if (this.chkNonUs.checked) {
                    visibleLayers.push(13);
                }

                topic.publish('/ngdc/setVisibleLayers', 'Water Column Sonar', visibleLayers);
                topic.publish('/water_column_sonar/layerMode', 'cruise');

                this.searchDialog.setFileCriteriaDisabled(true);
            },

            activateFileMode: function() {
                this.layerMode = 'file';
                var visibleLayers = [];
                if (this.chkNMFS.checked) {
                    visibleLayers.push(1);
                }
                if (this.chkOER.checked) {
                    visibleLayers.push(2);
                }
                if (this.chkUNOLS.checked) {
                    visibleLayers.push(3);
                }
                if (this.chkOtherNoaa.checked) {
                    visibleLayers.push(4);
                }
                if (this.chkOther.checked) {
                    visibleLayers.push(5);
                }
                if (this.chkNonUs.checked) {
                    visibleLayers.push(6);
                }

                topic.publish('/ngdc/setVisibleLayers', 'Water Column Sonar', visibleLayers);
                topic.publish('/water_column_sonar/layerMode', 'file');

                this.searchDialog.setFileCriteriaDisabled(false);
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

                if (values.ships && values.ships.length > 0) {
                    s += 'Ship: ' + values.ships.join(',') + '<br>';
                }
                if (values.institutions && values.institutions.length > 0) {
                    s += 'Institution: ' + values.institutions.join(',') + '<br>';
                }
                if (values.surveyIds && values.surveyIds.length > 0) {
                    s += 'Survey ID: ' + values.surveyIds.join(',') + '<br>';
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

                if (values.minSwathWidth && values.maxSwathWidth) {
                    s += 'Swath width: ' + values.minSwathWidth + ' to ' + values.maxSwathWidth + ' degrees<br>';
                }
                else if (values.minSwathWidth) {
                    s += 'Swath width: greater than ' + values.minSwathWidth + ' degrees<br>';
                }
                else if (values.maxSwathWidth) {
                    s += 'Swath width: less than ' + values.maxSwathWidth + ' degrees<br>';
                }

                if (values.bottomSoundingsOnly) {
                    s += 'Bottom soundings only';
                }

                if (values.frequencies) {
                    s += 'Frequency: ' + values.frequencies.join(',') + ' kHz<br>';
                }
                
                if (values.minFrequency && values.maxFrequency) {
                    s += 'Frequency: ' + values.minFrequency + ' to ' + values.maxFrequency + ' kHz<br>';
                }
                else if (values.minFrequency) {
                    s += 'Frequency: greater than ' + values.minFrequency + ' kHz<br>';
                }
                else if (values.maxFrequency) {
                    s += 'Frequency: less than ' + values.maxFrequency + ' kHz<br>';
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