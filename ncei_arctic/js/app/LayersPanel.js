define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/topic',
    'dojo/on',
    'dojo/aspect',
    'dojo/dom',
    'dojo/dom-attr',
    'dijit/TitlePane',
    'dijit/form/CheckBox',
    'dijit/form/Select',
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
        TitlePane,
        CheckBox,
        Select,
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

                on(this.chkMultibeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Multibeam', this.chkMultibeam.checked);
                }));
                on(this.chkNosHydroBags, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'NOS Hydrographic Surveys', [0], this.chkNosHydroBags.checked);

                    //If the BAG Hillshades are visible, toggle the extra "Surveys with BAGs" overlay on top of the hillshades.
                    if (this.chkBagHillshades.checked) {
                        topic.publish('/ngdc/layer/visibility', 'NOS Hydro (BAGs)', this.chkNosHydroBags.checked);
                    }
                    else {
                        topic.publish('/ngdc/layer/visibility', 'NOS Hydro (BAGs)', false);
                    }
                }));
                on(this.chkNosHydroDigital, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'NOS Hydrographic Surveys', [1], this.chkNosHydroDigital.checked);
                }));
                on(this.chkNosHydroNonDigital, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'NOS Hydro (non-digital)', this.chkNosHydroNonDigital.checked);
                }));
                on(this.chkBagHillshades, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'BAG Hillshades', this.chkBagHillshades.checked);   

                    //If the "Surveys with BAGs" are visible, toggle the extra overlay on top of the hillshades.
                    if (this.chkBagHillshades.checked && this.chkNosHydroBags.checked) {
                        topic.publish('/ngdc/layer/visibility', 'NOS Hydro (BAGs)', true);
                    }
                    else {
                        topic.publish('/ngdc/layer/visibility', 'NOS Hydro (BAGs)', false);
                    }                                     
                }));
                on(this.chkSinglebeam, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [1], this.chkSinglebeam.checked);                    
                }));
                on(this.chkGravity, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [2], this.chkGravity.checked);                    
                }));
                on(this.chkMagnetics, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [3], this.chkMagnetics.checked);                    
                }));
                on(this.chkMcs, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [4], this.chkMcs.checked);                    
                }));
                on(this.chkSeismicRefraction, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [5], this.chkSeismicRefraction.checked);                    
                }));
                on(this.chkShotPointNavigation, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [6], this.chkShotPointNavigation.checked);                    
                }));
                on(this.chkSideScan, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [7], this.chkSideScan.checked);                    
                }));
                on(this.chkScs, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [8], this.chkScs.checked);                    
                }));
                on(this.chkSubbottom, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [9], this.chkSubbottom.checked);                    
                }));
                on(this.chkAeromag, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/sublayer/visibility', 'Trackline Combined', [10], this.chkAeromag.checked);                    
                }));
                on(this.chkDems, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'DEM Extents', this.chkDems.checked);
                    topic.publish('/ngdc/layer/visibility', 'DEM Tiles', this.chkDems.checked);
                })); 
                on(this.chkDemHillshades, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'DEM Hillshades', this.chkDemHillshades.checked);
                }));  
                on(this.chkSampleIndex, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Sample Index', this.chkSampleIndex.checked);                    
                }));
                on(this.chkMarineGeology, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Marine Geology', this.chkMarineGeology.checked);                    
                }));
                on(this.chkDeclination, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Magnetic Declination', this.chkDeclination.checked);                    
                }));
                on(this.chkEMAG2, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'EMAG2', this.chkEMAG2.checked);                    
                }));
                on(this.chkUnderseaFeatures, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Undersea Features', this.chkUnderseaFeatures.checked);                    
                }));
                on(this.chkCrn, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'CRN', this.chkCrn.checked);                    
                }));
                on(this.chkGhcnd, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'GHCND', this.chkGhcnd.checked);                    
                }));
                on(this.chkGsom, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'GSOM', this.chkGsom.checked);                    
                }));
                on(this.chkGsoy, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'GSOY', this.chkGsoy.checked);                    
                }));
                on(this.chkIsd, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'ISD', this.chkIsd.checked);                    
                }));
                on(this.chkTemperature, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Sea Water Temperature', this.chkTemperature.checked);                    
                }));
                on(this.chkSalinity, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'Salinity', this.chkSalinity.checked);                    
                }));
                on(this.chkNARR, 'change', lang.hitch(this, function() {
                    topic.publish('/ngdc/layer/visibility', 'NARR-A Monthly', this.chkNARR.checked);                    
                }));
                
                var elevations = [0.0,-5.0,-10.0,-15.0,-20.0,-25.0,-30.0,-35.0,-40.0,-45.0,-50.0,-55.0,-60.0,-65.0,-70.0,-75.0,-80.0,-85.0,-90.0,-95.0,
                    -100.0,-125.0,-150.0,-175.0,-200.0,-225.0,-250.0,-275.0,-300.0,-325.0,-350.0,-375.0,-400.0,-425.0,-450.0,-475.0,-500.0,-550.0,-600.0,-650.0,-700.0,
                    -750.0,-800.0,-850.0,-900.0,-950.0,-1000.0,-1050.0,-1100.0,-1150.0,-1200.0,-1250.0,-1300.0,-1350.0,-1400.0,-1450.0,-1500.0,-1550.0,-1600.0,-1650.0,
                    -1700.0,-1750.0,-1800.0,-1850.0,-1900.0,-1950.0,-2000.0,-2100.0,-2200.0,-2300.0,-2400.0,-2500.0,-2600.0,-2700.0,-2800.0,-2900.0,-3000.0,-3100.0,
                    -3200.0,-3300.0,-3400.0,-3500.0,-3600.0,-3700.0,-3800.0,-3900.0,-4000.0,-4100.0,-4200.0,-4300.0,-4400.0,-4500.0,-4600.0,-4700.0,-4800.0,-4900.0,
                    -5000.0,-5100.0,-5200.0,-5300.0,-5400.0,-5500.0];

                array.forEach(elevations, lang.hitch(this, function(elevation) {
                    this.elevationSelect.addOption({label: elevation.toString(), value: elevation, disabled: false});
                }));
                on(this.elevationSelect, 'change', lang.hitch(this, function() {
                    topic.publish('/layersPanel/selectElevation', this.elevationSelect.get('value'));
                }));

                var timeOptions = [
                    {label: 'Annual', value: 'Annual'},
                    {label: 'Winter', value: 'Winter'},
                    {label: 'Spring', value: 'Spring'},
                    {label: 'Summer', value: 'Summer'},
                    {label: 'Autumn', value: 'Autumn'},
                    {label: 'January', value: 'January'},
                    {label: 'February', value: 'February'},
                    {label: 'March', value: 'March'},
                    {label: 'April', value: 'April'},
                    {label: 'May', value: 'May'},
                    {label: 'June', value: 'June'},
                    {label: 'July', value: 'July'},
                    {label: 'August', value: 'August'},
                    {label: 'September', value: 'September'},
                    {label: 'October', value: 'October'},
                    {label: 'November', value: 'November'},
                    {label: 'December', value: 'December'}
                ];

                var timeLookup = {
                    'Annual': {timeString: 'annual', time: '0000-06-29T14:54:22.987Z'},
                    'Winter': {timeString: 'seasonal', time: '0000-02-13T15:43:35.746Z'},
                    'Spring': {timeString: 'seasonal', time: '0000-05-14T23:10:47.240Z'},
                    'Summer': {timeString: 'seasonal', time: '0000-08-14T06:37:58.734Z'},
                    'Autumn': {timeString: 'seasonal', time: '0000-11-13T14:05:10.227Z'},
                    'January': {timeString: 'monthly', time: '0000-01-14T05:14:31.915Z'},
                    'February': {timeString: 'monthly', time: '0000-02-13T15:43:35.746Z'},
                    'March': {timeString: 'monthly', time: '0000-03-15T02:12:39.578Z'},
                    'April': {timeString: 'monthly', time: '0000-04-14T12:41:43.409Z'},
                    'May': {timeString: 'monthly', time: '0000-05-14T23:10:47.240Z'},
                    'June': {timeString: 'monthly', time: '0000-06-14T09:39:51.071Z'},
                    'July': {timeString: 'monthly', time: '0000-07-14T20:08:54.902Z'},
                    'August': {timeString: 'monthly', time: '0000-08-14T06:37:58.734Z'},
                    'September': {timeString: 'monthly', time: '0000-09-13T17:07:02.565Z'},
                    'October': {timeString: 'monthly', time: '0000-10-14T03:36:06.396Z'},
                    'November': {timeString: 'monthly', time: '0000-11-13T14:05:10.227Z'},
                    'December': {timeString: 'monthly', time: '0000-12-14T00:34:14.059Z'}
                };

                this.timeSelect.addOption(timeOptions);

                on(this.timeSelect, 'change', lang.hitch(this, function() {
                    var timeString = timeLookup[this.timeSelect.get('value')].timeString;
                    var time = timeLookup[this.timeSelect.get('value')].time;
                    topic.publish('/layersPanel/selectTime', timeString, time);

                    if (timeString === 'Monthly') {
                        this.setDeepElevationsDisabled(true);
                    } else {
                        this.setDeepElevationsDisabled(false);
                    }
                }));

                var narrYearOptions = [];
                for (var year = 2014; year >= 1979; year--) {
                    narrYearOptions.push({label: year.toString(), value: year.toString()});
                }
                this.narrYearSelect.addOption(narrYearOptions);
                on(this.narrYearSelect, 'change', lang.hitch(this, function() {
                    topic.publish('/layersPanel/selectNarrYear', this.narrYearSelect.get('value'));
                }));

                var narrMonthOptions = [
                    {label: 'January', value: '01'},
                    {label: 'February', value: '02'},
                    {label: 'March', value: '03'},
                    {label: 'April', value: '04'},
                    {label: 'May', value: '05'},
                    {label: 'June', value: '06'},
                    {label: 'July', value: '07'},
                    {label: 'August', value: '08'},
                    {label: 'September', value: '09'},
                    {label: 'October', value: '10'},
                    {label: 'November', value: '11'},
                    {label: 'December', value: '12'}
                ];
                this.narrMonthSelect.addOption(narrMonthOptions);
                this.narrMonthSelect.set('value', '08');
                on(this.narrMonthSelect, 'change', lang.hitch(this, function() {
                    topic.publish('/layersPanel/selectNarrMonth', this.narrMonthSelect.get('value'));
                }));

                var narrHourOptions = [
                    {label: '00', value: '00'},
                    {label: '03', value: '03'},
                    {label: '06', value: '06'},
                    {label: '09', value: '09'},
                    {label: '12', value: '12'},
                    {label: '15', value: '15'},
                    {label: '18', value: '18'},
                    {label: '21', value: '21'}
                ];
                this.narrHourSelect.addOption(narrHourOptions);
                on(this.narrHourSelect, 'change', lang.hitch(this, function() {
                    topic.publish('/layersPanel/selectNarrHour', this.narrHourSelect.get('value'));
                }));                
            },

            setDeepElevationsDisabled: function(disabled) {
                console.log('foo');
                array.forEach(this.elevationSelect.options, lang.hitch(this, function(option) {
                    if (option.value < -1500) {
                        option.disabled = disabled;
                    }
                }));
                this.elevationSelect.startup();
            }
        });
    }
);