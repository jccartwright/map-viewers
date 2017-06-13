define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/on',    
    'dojo/dom',
    'dijit/registry',
    'dijit/form/RadioButton',
    'dijit/Tooltip',
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
        dom,
        registry,
        RadioButton,
        Tooltip,
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

                on(registry.byId('AllInst'), 'click', lang.hitch(this, function() { this.selectInst('AllInst'); }));
                on(registry.byId('None'), 'click', lang.hitch(this, function() { this.selectInst('None'); }));
                on(registry.byId('AOML'), 'click', lang.hitch(this, function() { this.selectInst('AOML'); }));
                on(registry.byId('ARFFSU'), 'click', lang.hitch(this, function() { this.selectInst('ARFFSU'); }));
                on(registry.byId('AWI'), 'click', lang.hitch(this, function() { this.selectInst('AWI'); }));
                on(registry.byId('BOSCORF'), 'click', lang.hitch(this, function() { this.selectInst('BOSCORF'); }));
                on(registry.byId('BPCRC'), 'click', lang.hitch(this, function() { this.selectInst('BPCRC'); }));
                on(registry.byId('BPCRR'), 'click', lang.hitch(this, function() { this.selectInst('BPCRR'); }));
                on(registry.byId('Canada'), 'click', lang.hitch(this, function() { this.selectInst('Canada'); }));
                on(registry.byId('DSDP'), 'click', lang.hitch(this, function() { this.selectInst('DSDP'); }));
                on(registry.byId('ECS'), 'click', lang.hitch(this, function() { this.selectInst('ECS'); }));
                on(registry.byId('France'), 'click', lang.hitch(this, function() { this.selectInst('France'); }));
                on(registry.byId('GEOMAR'), 'click', lang.hitch(this, function() { this.selectInst('GEOMAR'); }));
                on(registry.byId('IODP'), 'click', lang.hitch(this, function() { this.selectInst('IODP'); }));
                on(registry.byId('LDEO'), 'click', lang.hitch(this, function() { this.selectInst('LDEO'); }));
                on(registry.byId('LacCore'), 'click', lang.hitch(this, function() { this.selectInst('LacCore'); }));
                on(registry.byId('ODP'), 'click', lang.hitch(this, function() { this.selectInst('ODP'); }));
                on(registry.byId('OSU'), 'click', lang.hitch(this, function() { this.selectInst('OSU'); }));
                on(registry.byId('PMEL'), 'click', lang.hitch(this, function() { this.selectInst('PMEL'); }));
                on(registry.byId('RSMAS'), 'click', lang.hitch(this, function() { this.selectInst('RSMAS'); }));
                on(registry.byId('SIO'), 'click', lang.hitch(this, function() { this.selectInst('SIO'); }));
                on(registry.byId('SOEST'), 'click', lang.hitch(this, function() { this.selectInst('SOEST'); }));
                on(registry.byId('UWISC'), 'click', lang.hitch(this, function() { this.selectInst('U WISC'); }));
                on(registry.byId('URI'), 'click', lang.hitch(this, function() { this.selectInst('URI'); }));
                on(registry.byId('USC'), 'click', lang.hitch(this, function() { this.selectInst('USC'); }));
                on(registry.byId('USGSMP'), 'click', lang.hitch(this, function() { this.selectInst('USGSMP'); }));
                on(registry.byId('USGSWH'), 'click', lang.hitch(this, function() { this.selectInst('USGSWH'); }));
                on(registry.byId('USGSSP'), 'click', lang.hitch(this, function() { this.selectInst('USGSSP'); }));
                on(registry.byId('UT'), 'click', lang.hitch(this, function() { this.selectInst('UT'); }));
                on(registry.byId('WHOI'), 'click', lang.hitch(this, function() { this.selectInst('WHOI'); }));
                on(registry.byId('NMNH'), 'click', lang.hitch(this, function() { this.selectInst('NMNH'); }));

                on(this.searchButton, 'click', lang.hitch(this, function() {
                    if (!this.searchDialog) {
                        this.searchDialog = new SearchDialog({title: 'Filter Samples'});
                    }
                    this.searchDialog.show();
                }));  

                on(this.resetButton, 'click', lang.hitch(this, function() {
                    topic.publish('/sample_index/ResetSearch');
                }));                                  
            },

            selectInst: function(/*String*/ inst) {
                topic.publish('/sample_index/SelectInstitution', inst);
            },

            setSelectedInst: function(/*String*/ inst) {
                if (registry.byId(inst)) {                    
                    registry.byId(inst).set('checked', true);
                }
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
                
                if (values.startYear && values.endYear) {
                    s += '<i>Year:</i> ' + values.startYear + ' to ' + values.endYear + '<br>';
                }
                else if (values.startYear) {
                    s += '<i>Starting year:</i> ' + values.startYear + '<br>';
                }
                else if (values.endYear) {
                    s += '<i>Ending year:</i> ' + values.endYear + '<br>';
                }

                if (values.cruise) {
                    s += '<i>Cruise or Leg:</i> ' + values.cruise + '<br>';
                }
                if (values.platform) {
                    s += '<i>Platform Name:</i> ' + values.platform + '<br>';
                }
                if (values.lake) {
                    s += '<i>Lake Name:</i> ' + values.lake + '<br>';
                } 
                if (values.device) {
                    s += '<i>Device:</i> ' + values.device + '<br>';
                }   

                if (values.minWaterDepth && values.maxWaterDepth) {
                    s += '<i>Water Depth (m):</i> ' + values.minWaterDepth + ' to ' + values.maxWaterDepth + '<br>';
                }
                else if (values.minWaterDepth) {
                    s += '<i>Min Water Depth (m):</i> ' + values.minWaterDepth + '<br>';
                }
                else if (values.maxWaterDepth) {
                    s += '<i>Max Water Depth (m):</i> ' + values.maxWaterDepth + '<br>';
                }             
                filterDiv.innerHTML = s;
            }
        });
    }
);