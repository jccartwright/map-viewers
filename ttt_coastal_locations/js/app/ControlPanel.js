define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/on',
    'dojo/topic',    
    'dojo/store/Memory',
    'dijit/registry',
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/form/FilteringSelect',
    'dijit/form/Button',
    'esri/geometry/Extent',
    'esri/geometry/webMercatorUtils',
    'dojo/text!./templates/ControlPanel.html'],
    function(
        declare, 
        lang,
        on,
        topic,
        Memory,
        registry,
        _WidgetBase, 
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        FilteringSelect,
        Button,
        Extent,
        webMercatorUtils,
        template){
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            // Our template - important!
            templateString: template,

            // A class to be applied to the root node in our template
            baseClass: 'controlPanel',

            pacificExtent: {
                "xmin": -270,
                "ymin": -80,
                "xmax": -65,
                "ymax": 65,
                "spatialReference":{"wkid":4326}
            },

            indianExtent: {
                "xmin": 10,
                "ymin": -68,
                "xmax": 150,
                "ymax": 32,
                "spatialReference":{"wkid":4326}
            },

            caribExtent: {
                "xmin": -98,
                "ymin": 5,
                "xmax": -50,
                "ymax": 35,
                "spatialReference":{"wkid":4326}
            },

            stationDataPacific: {
                identifier: 'name',
                items: [
                    {name: 'Aburatsu, Japan', id: 'ABURATSU'},
                    {name: 'Acajutla, El Salvador', id: 'ACAJUTLA'},
                    {name: 'Acapulco, Mexico', id: 'ACAPULCO'},
                    {name: 'Adak, AK', id: 'ADAK'},
                    {name: 'Antofagasta, Chile', id: 'ANTOFAGASTA'},
                    {name: 'Auckland, New Zealand', id: 'AUCKLAND'},
                    {name: 'Brisbane, Australia', id: 'BRISBANE'},
                    {name: 'Cabo San Lucas, Mexico', id: 'CABO'},
                    {name: 'Cairns, Australia', id: 'CAIRNS'},
                    {name: 'Crescent City, CA', id: 'CRESCENT'},
                    {name: 'Guam', id: 'GUAM'},
                    {name: 'Hilo, HI', id: 'HILO'},
                    {name: 'Hong Kong, China', id: 'HONGKONG'},
                    {name: 'Jackson Bay, New Zealand', id: 'JACKSONBAY'},
                    {name: 'Keelung, Taiwan', id: 'KEELUNG'},
                    {name: 'Kushimoto, Japan', id: 'KUSHIMOTO'},
                    {name: 'Kushiro, Japan', id: 'KUSHIRO'},
                    {name: 'La Libertad, Ecuador', id: 'LALIBERTAD'},
                    {name: 'Legaspi, Philippines', id: 'LEGASPI'},
                    {name: 'Los Angeles, CA', id: 'LOSANGELES'},
                    {name: 'Okinawa, Japan', id: 'OKINAWA'},
                    {name: 'Noumea, New Caledonia', id: 'NOUMEA'},
                    {name: 'Ofunato, Japan', id: 'OFUNATO'},
                    {name: 'Pago Pago, American Samoa', id: 'PAGOPAGO'},
                    {name: 'Petropavlosk, Russia', id: 'PETROPAVLOSK'},
                    {name: 'Pohnpei, Micronesia', id: 'POHNPEI'},
                    {name: 'Rabaul, Papua New Guinea', id: 'RABAUL'},
                    {name: 'San Francisco, CA', id: 'SANFRAN'},
                    {name: 'Seaside, OR', id: 'SEASIDE'},
                    {name: 'Seward, AK', id: 'SEWARD'},
                    {name: 'Sitka, AK', id: 'SITKA'},
                    {name: 'Sydney, Australia', id: 'SYDNEY'},
                    {name: 'Tahiti', id: 'TAHITI'},
                    {name: 'Tofino, BC, Canada', id: 'TOFINO'},
                    {name: 'Valparaiso, Chile', id: 'VALPARAISO'}
                ]
            },

            stationDataIndian: {
                identifier: 'name',
                items: [
                    {name: 'Chennai, India', id: 'CHENNAI'},
                    {name: 'Colombo, Sri Lanka', id: 'COLOMBO'},
                    {name: 'Male, Maldives', id: 'MALE'},
                    {name: 'Banda Aceh, Indonesia', id: 'BANDAACEH'},
                    {name: 'Phuket, Thailand', id: 'PHUKET'},
                    {name: 'Chittagong, Bangladesh', id: 'CHITTAGONG'},
                    {name: 'Vishakhapatnam, India', id: 'VISHAKHAPATNAM'},
                    {name: 'Mumbai, India', id: 'MUMBAI'},
                    {name: 'Panaji, India', id: 'PANAJI'},
                    {name: 'Karachi, Pakistan', id: 'KARACHI'},
                    {name: 'Muscat, Oman', id: 'MUSCAT'},
                    {name: 'Aden, Yemen', id: 'ADEN'},
                    {name: 'Dar es Salaam, Tanzania', id: 'DARESSALAAM'},
                    {name: 'Broome, Australia', id: 'BROOME'},
                    {name: 'Mogadishu, Somalia', id: 'MOGADISHU'},
                    {name: 'Diego Garcia, UK Territory', id: 'DIEGOGARCIA'},
                    {name: 'Port Louis, Mauritius', id: 'PORTLOUIS'},
                    {name: 'Mombasa, Kenya', id: 'MOMBASA'},
                    {name: 'Durban, South Africa', id: 'DURBAN'},
                    {name: 'Port Elizabeth, South Africa', id: 'PORTELIZABETH'},
                    {name: 'Cape Town, South Africa', id: 'CAPETOWN'},
                    {name: 'Beira, Mozambique', id: 'BEIRA'},
                    {name: 'Kuta, Bali, Indonesia', id: 'BALI'},
                    {name: 'Chilachap, Java, Indonesia', id: 'CHILACHAP'},
                    {name: 'Pointe La Rue, Seychelles', id: 'POINTLARUE'},
                    {name: 'Tamatave, Madagascar', id: 'TAMATAVE'},
                    {name: 'Salalah, Oman', id: 'SALALAH'},
                    {name: 'Padang, Indonesia', id: 'PADANG'},
                    {name: 'Hillarys, Australia', id: 'HILLARYS'},
                    {name: 'Cocos (Keeling) Is., Australia', id: 'COCOSISLANDS'}
                ]
            },

            stationDataCarib: {
                identifier: 'name',
                items: [
                    {name: 'Bermuda', id: 'BERMUDA'},
                    {name: 'Bridgetown, Barbados', id: 'BRIDGETOWN'},
                    {name: 'Havana, Cuba', id: 'HAVANA'},
                    {name: 'Santiago de Cuba, Cuba', id: 'SANTIAGO'},
                    {name: 'Santo Domingo, Dominican Republic', id: 'SANTO'},
                    {name: 'St Georges, Grenada', id: 'STGEORGES'},
                    {name: 'Port-au-Prince, Haiti', id: 'PORTAUPRINCE'},
                    {name: 'Puerto Cortes, Honduras', id: 'PUERTOCORTES'},
                    {name: 'Kingston, Jamaica', id: 'KINGSTON'},
                    {name: 'Saint Pierre, Martinique', id: 'SAINTPIERRE'},
                    {name: 'Montserrat', id: 'MONTSERRAT'},
                    {name: 'Colon, Panama', id: 'COLON'},
                    {name: 'Nassau, Bahamas', id: 'NASSAU'},
                    {name: 'Georgeown, Cayman Islands', id: 'GEORGETOWN'},
                    {name: 'Barranquilla, Colombia', id: 'BARRANQUILLA'},
                    {name: 'Trujillo, Honduras', id: 'TRUJILLO'},
                    {name: 'Port-of-Spain, Trinidad and Tobago', id: 'PORTOFSPAIN'},
                    {name: 'Cockburn Town, Turks and Caicos Is.', id: 'COCKBURN'},
                    {name: 'Galveston, TX, USA', id: 'GALVESTON'},
                    {name: 'Grand Isle, LA, USA', id: 'GRANDISLE'},
                    {name: 'Charlotte Amalie, VI, USA Territory', id: 'CHARLOTTE'},
                    {name: 'San Juan, PR, USA Territory', id: 'SANJUAN'},
                    {name: 'Cumana, Venezuela', id: 'CUMANA'},
                    {name: 'Maracaibo, Venezuela', id: 'MARACAIBO'},
                    {name: 'Puerto Cabezas, Nicaragua', id: 'PUERTOCABEZAS'},
                    {name: 'Tampico, Mexico', id: 'TAMPICO'}
                ]
            },

            postCreate: function() {
                this.inherited(arguments);

                this.stationStorePacific = new Memory({data: this.stationDataPacific});
                this.stationStoreIndian = new Memory({data: this.stationDataIndian});
                this.stationStoreCarib = new Memory({data: this.stationDataCarib});
                
                //Initialize the stationStore FilteringSelect with the Pacific stations by default
                this.stationSelect = new FilteringSelect({
                    name : "station",
                    store : this.stationStorePacific,
                    searchAttr : "name"
                }, 'stationSelectInput');
                //this.stationSelect.placeAt("stationSelectInput")
                this.stationSelect.startup();

                on(this.stationSelect, 'change', lang.hitch(this, function() {
                    var station = this.stationSelect.get('value');
                    this.selectStation(station);
                }));

                on(this.regionSelect, 'change', lang.hitch(this, function() {
                    var region = this.regionSelect.get('value');
                    this.selectRegion(region);
                }));

                on(this.resetExtentButton, 'click', lang.hitch(this, function() {
                    this.recenterMapToCurrentRegion()
                }));

                this.selectRegion('Pacific');
            },

            selectRegion: function(region) {
                this.region = region;
                var select = this.stationSelect;

                //Set the FilteringSelect to use the appropriate store

                if (region === 'Pacific') {
                    select.set('store', this.stationStorePacific);       
                } else if (region === 'Indian') {
                    select.set('store', this.stationStoreIndian);
                } else {
                    select.set('store', this.stationStoreCarib);
                }
                //Select the first item
                select.set('item', select.store.data[0]);
                    
                this.recenterMapToCurrentRegion();
            },

            selectStation: function(station) {                
                var station = this.stationSelect.get('item').id;

                this.recenterMapToCurrentRegion(this.region);
                
                var layerDefs = [];
                layerDefs[0] = "ID = '" + station + "'";
                layerDefs[1] = "Name = '" + station + "'";

                topic.publish('tttLayerDefs', layerDefs);
            },

            recenterMapToCurrentRegion: function() {
                var extent;

                if (this.region === 'Pacific') {
                    extent = new Extent(this.pacificExtent);
                } else if (this.region === 'Indian') {
                    extent = new Extent(this.indianExtent);
                } else {
                    extent = new Extent(this.caribExtent);
                }
                topic.publish('recenterMapToExtent', extent);
            }
        });
    }
);
