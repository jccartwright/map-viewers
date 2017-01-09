define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/on',
    'dojo/aspect',
    'dojo/dom',
    'dojo/dom-attr',
    'dijit/form/CheckBox',
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

                // on(this.chkPad, 'change', lang.hitch(this, function() {
                //     topic.publish('/ngdc/layer/visibility', 'PAD', this.chkPad.checked);
                // }));

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
                if (values.institution) {
                    s += '<br>Source Organization: ' + values.institution;
                }
                if (values.instrument) {
                    s += '<br>Instrument Name: ' + values.instrument;
                }
                if (values.platformType) {
                    s += '<br>Platform Type: ' + values.platformType;
                }
                if (values.minSampleRate) {
                    s += '<br>Min Sample Rate: ' + values.minSampleRate;
                }
                if (values.maxSamplerate) {
                    s += '<br>Max Sample Rate: ' + values.maxSamplerate;
                }         
                filterDiv.innerHTML = s;
            },

            //Format a date in the form mm/dd/yyyy
            toDateString: function(date) {
                return date.getMonth()+1 + '/' + date.getDate() + '/' + date.getFullYear();
            }
        });
    }
);