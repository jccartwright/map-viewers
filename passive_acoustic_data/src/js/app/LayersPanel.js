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
        CheckBox,
        TitlePane,
        _WidgetBase, 
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        SearchDialog,
        template){
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            // Our template - important!
            templateString: template,
            // A class to be applied to the root node in our template
            baseClass: 'layersPanel',

            postCreate: function() {
                this.inherited(arguments);

                on(this.chkPad, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'PAD', this.chkPad.checked);
                }));
                on(this.chkMpas, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'MPA Inventory', this.chkMpas.checked);
                }));

                on(this.searchButton, 'click', lang.hitch(this, function() {
                    if (!this.searchDialog) {
                        this.searchDialog = new SearchDialog({title: 'Passive Acoustic Data Search'});
                    }
                    this.searchDialog.show();
                }));  

                on(this.resetButton, 'click', lang.hitch(this, function() {
                    topic.publish('/pad/ResetSearch');
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

                var s = '<b>Current filter:</b>';
                  
                if (values.startDate) {
                    s += '<br>Start Date: ' + this.toDateString(values.startDate);
                } 
                if (values.endDate) {
                    s += '<br>End Date: ' + this.toDateString(values.endDate);
                }

                if (values.sourceOrganizations) {
                    s += '<br>Source Organization: ' + values.sourceOrganizations.join(', ');
                }
                if (values.fundingOrganizations) {
                    s += '<br>Funding Organization: ' + values.fundingOrganizations.join(', ');
                }
                if (values.instruments) {
                    s += '<br>Instrument Name: ' + values.instruments.join(', ');
                }
                if (values.platformTypes) {
                    s += '<br>Platform Type: ' + values.platformTypes.join(', ');
                }
                if (!isNaN(values.minSampleRate)) {
                    s += '<br>Min Sample Rate: ' + values.minSampleRate;
                }
                if (!isNaN(values.maxSampleRate)) {
                    s += '<br>Max Sample Rate: ' + values.maxSampleRate;
                }
                if (!isNaN(values.minSensorDepth)) {
                    s += '<br>Min Sensor Depth: ' + values.minSensorDepth;
                }
                if (!isNaN(values.maxSensorDepth)) {
                    s += '<br>Max Sensor Depth: ' + values.maxSensorDepth;
                }
                if (values.recordingDuration) {
                    s += '<br>Recording Duration: ' + values.recordingDuration;
                }
                if (values.numChannels) {
                    s += '<br>Number of Channels: ' + values.numChannels;
                }

                filterDiv.innerHTML = s;
            },

            //Format a date in the form yyyy-mm-dd
            toDateString: function(date) {  
                return date.getFullYear() + '-' + this.padDigits(date.getMonth()+1,2) + '-' + this.padDigits(date.getDate(),2);
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