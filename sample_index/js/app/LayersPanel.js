define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/on',
    'dijit/registry',
    'dijit/form/RadioButton',
    'dijit/Tooltip',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!./templates/LayersPanel.html'],
    function(
        declare, 
        lang,
        topic,
        on,
        registry,
        RadioButton,
        Tooltip,
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

                on(registry.byId('AllInst'), 'click', lang.hitch(this, function() { this.selectInst('AllInst'); }));
                on(registry.byId('None'), 'click', lang.hitch(this, function() { this.selectInst('None'); }));
                on(registry.byId('AOML'), 'click', lang.hitch(this, function() { this.selectInst('AOML'); }));
                on(registry.byId('AWI'), 'click', lang.hitch(this, function() { this.selectInst('AWI'); }));
                on(registry.byId('BOSCORF'), 'click', lang.hitch(this, function() { this.selectInst('BOSCORF'); }));
                on(registry.byId('BPRC'), 'click', lang.hitch(this, function() { this.selectInst('BPRC'); }));
                on(registry.byId('Canada'), 'click', lang.hitch(this, function() { this.selectInst('Canada'); }));
                on(registry.byId('DSDP'), 'click', lang.hitch(this, function() { this.selectInst('DSDP'); }));
                on(registry.byId('ECS'), 'click', lang.hitch(this, function() { this.selectInst('ECS'); }));
                on(registry.byId('FSU'), 'click', lang.hitch(this, function() { this.selectInst('FSU'); }));
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
                on(registry.byId('URI'), 'click', lang.hitch(this, function() { this.selectInst('URI'); }));
                on(registry.byId('USC'), 'click', lang.hitch(this, function() { this.selectInst('USc'); }));
                on(registry.byId('USGSMP'), 'click', lang.hitch(this, function() { this.selectInst('USGSMP'); }));
                on(registry.byId('USGSWH'), 'click', lang.hitch(this, function() { this.selectInst('USGSWH'); }));
                on(registry.byId('USGSSP'), 'click', lang.hitch(this, function() { this.selectInst('USGSSP'); }));
                on(registry.byId('UT'), 'click', lang.hitch(this, function() { this.selectInst('UT'); }));
                on(registry.byId('WHOI'), 'click', lang.hitch(this, function() { this.selectInst('WHOI'); }));
                on(registry.byId('WISC'), 'click', lang.hitch(this, function() { this.selectInst('WISC'); }));
                on(registry.byId('NMNH'), 'click', lang.hitch(this, function() { this.selectInst('NMNH'); }));                                    
            },

            selectInst: function(/*String*/ inst) {
                topic.publish('/sample_index/SelectInst', inst);
            }
        });
    }
);