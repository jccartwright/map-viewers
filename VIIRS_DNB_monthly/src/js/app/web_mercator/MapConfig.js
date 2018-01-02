define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/_base/config',
    'dojo/_base/array',
    'dojo/dom',
    'dojo/on',
    'dojo/topic',
    'dojo/dom-construct',
    'esri/layers/FeatureLayer',
    'esri/layers/LabelLayer',
    'esri/geometry/Extent',
    'esri/symbols/TextSymbol',
    'esri/symbols/Font',
    'esri/renderers/SimpleRenderer',
    'esri/layers/LabelLayer',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/SimpleFillSymbol',
    'esri/Color',
    'esri/graphic',
    'esri/layers/LayerDrawingOptions',
    'esri/TimeExtent', 
    'esri/dijit/TimeSlider',
    "esri/tasks/ImageServiceIdentifyTask",
    "esri/tasks/ImageServiceIdentifyParameters",
    "esri/dijit/Popup",
    'ngdc/web_mercator/MapConfig',
    'app/web_mercator/MapToolbar',
    ],
    function(
        declare, 
        lang, 
        config,
        array,
        dom,
        on,
        topic,
        domConstruct,
        FeatureLayer,
        LabelLayer,
        Extent,
        TextSymbol,
        Font,
        SimpleRenderer,
        LabelLayer,
        SimpleLineSymbol,
        SimpleFillSymbol,
        Color,
        Graphic,
        LayerDrawingOptions,
        TimeExtent,
        TimeSlider,
        ImageServiceIdentifyTask,
        ImageServiceIdentifyParameters,
        Popup,
        MapConfig,
        MapToolbar
        ){
        
        return declare([MapConfig], {
                        
            //handle setup which requires all layers to be loaded
            mapReady: function() {
                this.inherited(arguments);

                //console.log('inside custom Web Mercator mapReady...');   

                var mapToolbar = new MapToolbar({map: this.map, layerCollection: this.mapLayerCollection}, 'mercatorMapToolbar');
                mapToolbar.startup();

                // this.identify = new Identify({map: this.map, layerCollection: this.mapLayerCollection});

                // this.identifyPane = new IdentifyPane({
                //     map: this.map,
                //     identify: this.identify,
                //     'class': 'identifyPane',
                //     autoExpandTree: false,
                //     lineSymbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 255, 255]), 2)
                // }, dom.byId('mercatorIdentifyPaneDiv'));
                // this.identifyPane.startup();

                this.map.on('click', lang.hitch(this, this.executeIdentifyTask));

                this.initSlider();  

                // var popup = new Popup({
                //     fillSymbol: new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                //     new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                //     new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]))
                // }, domConstruct.create('div'));

                //this.map.infoWindow = popup;
                var identifyTask0 = new ImageServiceIdentifyTask(this.mapLayerCollection.getLayerById('Monthly_AvgRadiance').url);
                var identifyTask1 = new ImageServiceIdentifyTask(this.mapLayerCollection.getLayerById('Monthly_CloudFreeCoverage').url);
                var identifyTask2 = new ImageServiceIdentifyTask(this.mapLayerCollection.getLayerById('Monthly_AvgRadiance_StrayLightImpacted').url);
                var identifyTask3 = new ImageServiceIdentifyTask(this.mapLayerCollection.getLayerById('Monthly_CloudFreeCoverage_StrayLightImpacted').url);
                
                this.identifyTask = identifyTask0;
                this.currentPopupTitle = 'Average Radiance';
                this.unit = 'nanowatts/cm²/sr';

                topic.subscribe('toggleLayer', lang.hitch(this, function(idx) {                    
                    if (idx === 0) {
                        this.identifyTask = identifyTask0;
                        this.currentPopupTitle = 'Average Radiance';
                        this.unit = 'nanowatts/cm²/sr';
                    } else if (idx === 1) {
                        this.identifyTask = identifyTask1;
                        this.currentPopupTitle = 'Cloud-Free Coverage';
                        this.unit = 'cloud-free observations';
                    } else if (idx === 2) {
                        this.identifyTask = identifyTask2;
                        this.currentPopupTitle = 'Average Radiance';
                        this.unit = 'nanowatts/cm²/sr';
                    } else {
                        this.identifyTask = identifyTask3;
                        this.currentPopupTitle = 'Cloud-Free Coverage';
                        this.unit = 'cloud-free observations';
                    }
                    this.map.infoWindow.hide();
                }));

                this.identifyParams = new ImageServiceIdentifyParameters();
                this.identifyParams.returnCatalogItems = true;
                this.identifyParams.timeExtent = this.timeExtent;           
            },

            executeIdentifyTask: function(evt) {
                this.identifyParams.geometry = evt.mapPoint;
                this.identifyParams.timeExtent = this.timeExtent;

                this.identifyTask.execute(this.identifyParams).then(lang.hitch(this, function(response) {
                    
                    this.map.infoWindow.setTitle(this.currentPopupTitle);
                    if (response.value !== 'NoData') {
                        this.map.infoWindow.setContent(                        
                            'Pixel Value: ' + response.value + ' ' + this.unit + '<br>' +
                            'Longitude: ' + response.location.x.toFixed(3) + '<br>' +
                            'Latitude: ' + response.location.y.toFixed(3)
                        );
                    } else {
                        this.map.infoWindow.setContent('Data unavailable');
                    }
                    this.map.infoWindow.resize(300, 300);
                    this.map.infoWindow.show(evt.mapPoint);
                }));
            },

            initSlider: function() {
                var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                var timeSlider = new TimeSlider({
                    style: 'width: 100%;'
                }, dom.byId('timeSliderDiv'));
                
                this.map.setTimeSlider(timeSlider);
              
                var timeExtent = new TimeExtent();
                timeExtent.startTime = new Date('4/1/2012 UTC');
                timeExtent.endTime = this.mapLayerCollection.getLayerById('Monthly_AvgRadiance').timeInfo.timeExtent.endTime; //Set the time slider's end time to be the endTime of the Monthly_AvgRadiance service.
                
                this.timeExtent = new TimeExtent(timeExtent.endTime, timeExtent.endTime); //Default is the instant at the endTime
                
                timeSlider.setThumbCount(1);
                timeSlider.createTimeStopsByTimeInterval(timeExtent, 1, 'esriTimeUnitsMonths');
                timeSlider.setThumbMovingRate(1000);
                timeSlider.singleThumbAsTimeInstant(true);
                timeSlider.setLoop(true);
                //timeSlider.setTickCount(10);
                timeSlider.startup();

                timeSlider.setThumbIndexes([timeSlider._numStops-1, timeSlider._numStops-1]);
              
                var labels = array.map(timeSlider.timeStops, function(timeStop, i) { 
                    if (timeStop.getUTCMonth() === 0) {
                        return timeStop.getUTCFullYear(); 
                    } else {
                        return '';
                    }
                }); 
              
                timeSlider.setLabels(labels);

                var monthYear = monthNames[timeExtent.endTime.getUTCMonth()] + ' ' + timeExtent.endTime.getUTCFullYear();
                dom.byId('monthYear').innerHTML = '<i>' + monthYear + '<\/i>';
              
                timeSlider.on('time-extent-change', lang.hitch(this, function(evt) {
                    this.timeExtent = new TimeExtent(evt.startTime, evt.endTime);
                    var monthYear = monthNames[evt.endTime.getUTCMonth()] + ' ' + evt.endTime.getUTCFullYear();
                    dom.byId('monthYear').innerHTML = '<i>' + monthYear + '<\/i>';
                    this.map.infoWindow.hide();
                }));
            }            
        });
    }
);
