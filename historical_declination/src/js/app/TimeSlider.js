define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/on',
    'dojo/topic',
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/form/HorizontalSlider', 
    'dijit/form/HorizontalRule', 
    'dijit/form/HorizontalRuleLabels',
    'dojo/text!./templates/TimeSlider.html'],
    function(
        declare, 
        lang,
        on,
        topic,
        _WidgetBase, 
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        HorizontalSlider,
        HorizontalRule,
        HorizontalRuleLabels,
        template){
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            // Our template - important!
            templateString: template,

            // A class to be applied to the root node in our template
            baseClass: 'timeSlider',

            postCreate: function() {
                this.inherited(arguments);

                this.waitToUpdate = false;
                this.timeout = null;

                this.onChangeHandler = on.pausable(this.slider, 'change', lang.hitch(this, function() {
                    this.publishYear(this.slider.get('value'));
                }));

                //When holding down the arrow keys on the time slider, prevent rapid-fire change events from being caught
                this.keyDownHandler = on.pausable(this.slider, 'keydown', lang.hitch(this, function() {
                    this.onChangeHandler.pause();
                }));

                this.keyUpHandler = on.pausable(this.slider, 'keyup', lang.hitch(this, function() {
                    this.onChangeHandler.resume();
                    this.publishYear(this.slider.get('value'));
                }));
            },

            publishYear: function(year) {
                this.declinationValue.innerHTML = 'Click on the map to highlight a line';
                this.currentYear.innerHTML = 'Year: ' + year;
                topic.publish('/declination/year', year, this.mapName);
            },

            setYear: function(year) { 
                this.declinationValue.innerHTML = 'Click on the map to highlight a line';
                this.currentYear.innerHTML = 'Year: ' + year;
                this.slider.set('value', year);
            }
        });
    }
);
