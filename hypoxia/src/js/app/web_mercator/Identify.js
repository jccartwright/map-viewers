define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'app/Identify'],
    function(
        declare, 
        lang,
        Identify 
        ){

        return declare([Identify], {

            //called after parent class constructor
            constructor: function() {
                logger.debug('inside constructor for app/web_mercator/Identify');

                //augment arguments object with list of layers to identify.
                arguments[0].layerIds = ['Hypoxia'];

                //pass along reference to Map, LayerCollection, list of LayerIds
                this.init(arguments);

                //formatter specific to each sublayer, keyed by Layer/sublayer name.
                this.formatters = {
                    'Hypoxia/2001 Hypoxia Stations': lang.hitch(this, this.hypoxiaStationsFormatter),
                    'Hypoxia/2002 Hypoxia Stations': lang.hitch(this, this.hypoxiaStationsFormatter),
                    'Hypoxia/2003 Hypoxia Stations': lang.hitch(this, this.hypoxiaStationsFormatter),
                    'Hypoxia/2004 Hypoxia Stations': lang.hitch(this, this.hypoxiaStationsFormatter),
                    'Hypoxia/2005 Hypoxia Stations': lang.hitch(this, this.hypoxiaStationsFormatter),
                    'Hypoxia/2006 Hypoxia Stations': lang.hitch(this, this.hypoxiaStationsFormatter),
                    'Hypoxia/2007 Hypoxia Stations': lang.hitch(this, this.hypoxiaStationsFormatter),
                    'Hypoxia/2008 Summer Hypoxia Stations': lang.hitch(this, this.hypoxiaStationsFormatter),
                    'Hypoxia/2008 Fall Hypoxia Stations': lang.hitch(this, this.hypoxiaStationsFormatter),
                    'Hypoxia/2009 Hypoxia Stations': lang.hitch(this, this.hypoxiaStationsFormatter),
                    'Hypoxia/2010 Hypoxia Stations': lang.hitch(this, this.hypoxiaStationsFormatter),
                    'Hypoxia/2011 Hypoxia Stations': lang.hitch(this, this.hypoxiaStationsFormatter),
                    'Hypoxia/2012 Hypoxia Stations': lang.hitch(this, this.hypoxiaStationsFormatter),
                    'Hypoxia/2013 Hypoxia Stations': lang.hitch(this, this.hypoxiaStationsFormatter),
                    'Hypoxia/2014 Hypoxia Stations': lang.hitch(this, this.hypoxiaStationsFormatter),
                    'Hypoxia/2015 Hypoxia Stations': lang.hitch(this, this.hypoxiaStationsFormatter),
                    'Hypoxia/2016 Hypoxia Stations': lang.hitch(this, this.hypoxiaStationsFormatter),
                    'Hypoxia/2017 Hypoxia Stations': lang.hitch(this, this.hypoxiaStationsFormatter),
                    'Hypoxia/2018 Hypoxia Stations': lang.hitch(this, this.hypoxiaStationsFormatter),

                    'Hypoxia/2001 Hypoxia Contours': lang.hitch(this, this.hypoxiaContoursFormatter),
                    'Hypoxia/2002 Hypoxia Contours': lang.hitch(this, this.hypoxiaContoursFormatter),
                    'Hypoxia/2003 Hypoxia Contours': lang.hitch(this, this.hypoxiaContoursFormatter),
                    'Hypoxia/2004 Hypoxia Contours': lang.hitch(this, this.hypoxiaContoursFormatter),
                    'Hypoxia/2005 Hypoxia Contours': lang.hitch(this, this.hypoxiaContoursFormatter),
                    'Hypoxia/2006 Hypoxia Contours': lang.hitch(this, this.hypoxiaContoursFormatter),
                    'Hypoxia/2007 Hypoxia Contours': lang.hitch(this, this.hypoxiaContoursFormatter),
                    'Hypoxia/2008 Summer Hypoxia Contours': lang.hitch(this, this.hypoxiaContoursFormatter),
                    'Hypoxia/2008 Fall Hypoxia Contours': lang.hitch(this, this.hypoxiaContoursFormatter),
                    'Hypoxia/2009 Hypoxia Contours': lang.hitch(this, this.hypoxiaContoursFormatter),
                    'Hypoxia/2010 Hypoxia Contours': lang.hitch(this, this.hypoxiaContoursFormatter),
                    'Hypoxia/2011 Hypoxia Contours': lang.hitch(this, this.hypoxiaContoursFormatter),
                    'Hypoxia/2012 Hypoxia Contours': lang.hitch(this, this.hypoxiaContoursFormatter),
                    'Hypoxia/2013 Hypoxia Contours': lang.hitch(this, this.hypoxiaContoursFormatter),
                    'Hypoxia/2014 Hypoxia Contours': lang.hitch(this, this.hypoxiaContoursFormatter),
                    'Hypoxia/2015 Hypoxia Contours': lang.hitch(this, this.hypoxiaContoursFormatter),
                    'Hypoxia/2016 Hypoxia Contours': lang.hitch(this, this.hypoxiaContoursFormatter),
                    'Hypoxia/2017 Hypoxia Contours': lang.hitch(this, this.hypoxiaContoursFormatter),
                    'Hypoxia/2018 Hypoxia Contours': lang.hitch(this, this.hypoxiaContoursFormatter)
                };
            } //end constructor
        });
    }
);