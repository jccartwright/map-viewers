define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
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
        array,
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

                this.searchDialog = new SearchDialog({title: 'Water Column Sonar Data Search'});

                on(this.chkNMFS, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Water Column Sonar', [5], this.chkNMFS.checked);
                }));
                on(this.chkOER, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Water Column Sonar', [3], this.chkOER.checked);
                }));
                on(this.chkR2R, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Water Column Sonar', [4], this.chkR2R.checked);
                }));
                on(this.chkNos, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Water Column Sonar', [2], this.chkNos.checked);
                }));
                on(this.chkOther, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Water Column Sonar', [0], this.chkOther.checked);
                }));
                on(this.chkNonUs, 'change', lang.hitch(this, function() {                    
                    topic.publish('/ngdc/sublayer/visibility', 'Water Column Sonar', [1], this.chkNonUs.checked);
                }));

                on(this.searchButton, 'click', lang.hitch(this, function() {                    
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

                if (values.ships && values.ships.length > 0) {
                    s += 'Ship: ' + values.ships.join(', ') + '<br>';
                }
                if (values.institutions && values.institutions.length > 0) {
                    s += 'Institution: ' + values.institutions.join(', ') + '<br>';
                }
                if (values.surveyIds && values.surveyIds.length > 0) {
                    s += 'Survey ID: ' + values.surveyIds.join(', ') + '<br>';
                }
                if (values.instruments && values.instruments.length > 0) {
                    s += 'Instrument: ' + values.instruments.join(', ') + '<br>';
                }
                if (values.calibrationStates && values.calibrationStates.length > 0) {
                    var calibrationStateStrings = [];
                    array.forEach(values.calibrationStates, function(calibrationState) {
                        if (calibrationState === '0') {
                            calibrationStateStrings.push('Unknown');
                        } else if (calibrationState === '1') {
                            calibrationStateStrings.push('Uncalibrated');
                        } else if (calibrationState === '2') {
                            calibrationStateStrings.push('Uncalibrated with calibration data');
                        } else if (calibrationState === '3') {
                            calibrationStateStrings.push('Calibrated without calibration data');
                        } else if (calibrationState === '4') {
                            calibrationStateStrings.push('Calibrated with calibration data');
                        }
                    });
                    s += 'Calibration State: ' + calibrationStateStrings.join(', ') + '<br>';
                }

                if (values.bottomSoundingsOnly) {
                    s += 'Bottom soundings only';
                }

                if (this.isFrequencyFilter(values.frequencies)) {
                    s += 'Frequency (kHz): ';
                    var frequencyList = [];

                    array.forEach(values.frequencies, function(frequency) {
                        var subFrequencyList = [];
                        array.forEach(frequency, function(subFrequency) {
                            subFrequencyList.push(subFrequency.replace('W', ' broadband'));
                        });

                        if (subFrequencyList.length > 0) {
                            frequencyList.push(subFrequencyList.join(' or '));
                        }
                    });

                    s += frequencyList.join(', ');
                }
                
                filterDiv.innerHTML = s;
            },

            isFrequencyFilter: function(frequencies) {
                var isFrequencyFilter = false;
                array.forEach(frequencies, function(frequency) {
                    if (frequency.length > 0) {
                        isFrequencyFilter = true;
                    }
                });
                return isFrequencyFilter;
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