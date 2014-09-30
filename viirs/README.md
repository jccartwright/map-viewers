# viewer for the VIIRS CSPP data

depends on a GeoJSON file generated via cron job,three small webservices:
* http://maps.ngdc.noaa.gov/mapviewer-support/viirs/irsources.groovy
* http://maps.ngdc.noaa.gov/mapviewer-support/viirs/AvailableGeotiffs.groovy
* http://maps.ngdc.noaa.gov/mapviewer-support/viirs/AvailableDates.groovy
and a WMS service at http://mapserver.ngdc.noaa.gov/cgi-bin/public/viirs 
