/*
  mapFunctions.js -- Data Atlas Library
*/

/*  If using WMS service for creating map layer, example below:
 *
 *    var elementURL = serviceURL + "/arcgis/rest/services/DataAtlas/NODC_DissolvedOxygen_Summer_10mDepth/MapServer/export"
 *    var dataLayer = new OpenLayers.Layer.ArcGIS93Rest("Dissolved Oxygen - Summer - 10M Depth", elementURL, {layers: "show:0,1,2,3", transparent: "true", format: "image/png"}, {isBaseLayer: false, displayInLayerSwitcher: false, extractAttributes: true, singleTile: true})
 *    map.addLayer(dataLayer)
 *    mapLayer.push(dataLayer)
 *------------------------------*/

/*  If using cached (tiled) service for creating map layer and using ArcGIS Server to retrieve them, example below:

 *    var elementURL = serviceURL + "/arcgis/rest/services/DataAtlas/NODC_DissolvedOxygen_Summer_10mDepth/MapServer";
 *    var jsonp_url = elementURL + '?f=json&pretty=true&callback=?';
 *    $.getJSON(jsonp_url, function(data) {            
 *      var dataLayer = new OpenLayers.Layer.ArcGISCache("Dissolved Oxygen - Summer - 10M Depth", elementURL, {layerInfo: data, isBaseLayer: false, displayInLayerSwitcher: false, opacity: 0.9});
 *      addTiledMap(dataLayer);
 *      mapLayer.push(dataLayer);
 *    });
 *-------------------------------*/
 
/*  If using cached (tiled) service for creating map layer and not using ArcGIS Server to retrieve them, example below:

 *    var elementURL = serviceURL + "/arcgiscache/NODC_DissolvedOxygen_Summer_10mDepth/_alllayers";
 *    var dataLayer = new OpenLayers.Layer.ArcGISCache("Dissolved Oxygen - Summer - 10M Depth", elementURL, {layerInfo: layerInfo, useArcGISServer: false, isBaseLayer: false, displayInLayerSwitcher: false, opacity: 0.9});
 *    addTiledMap(dataLayer);
 *    mapLayer.push(dataLayer);
 *
 *  Note:  layerInfo was defined and populated in atlas.htm ... it contains resolution and tile information
 *-------------------------------*/
 
  // function to handle loading page into right frame of map and still be able to change content of map
  function loadPage(sourceURL) {
    console.log('inside loadPage with ', sourceURL);
    var callString = ""+sourceURL+"";
    var pageBlock = document.getElementById('rightCol');
    var xmlhttp = null;
    var success = false;

    /* List of MS XMLHTTP versions - newest first */
    var MSXML_XMLHTTP_PROGIDS = new Array(
     'MSXML2.XMLHTTP.8.0',
     'MSXML2.XMLHTTP.7.0',
     'MSXML2.XMLHTTP.6.0',
     'MSXML2.XMLHTTP.5.0',
     'MSXML2.XMLHTTP.4.0',
     'MSXML2.XMLHTTP.3.0',
     'MSXML2.XMLHTTP',
     'Microsoft.XMLHTTP');

    /* test for IE implementations first*/
    for (var i = 0; i < MSXML_XMLHTTP_PROGIDS.length && !success; i++) {
      try
         {
           xmlhttp = new ActiveXObject(MSXML_XMLHTTP_PROGIDS[i]);
           success = true;
         }
      catch (e){xmlhttp = false;}
    }
    /* Now test for non-IE implementations*/
    if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
      try {xmlhttp = new XMLHttpRequest();}
      catch (e){xmlhttp = false;}
    }
    xmlhttp.open("GET", callString, true);
    xmlhttp.onreadystatechange=function() {
        /* If the stream has been successfully received*/
        if (xmlhttp.readyState==4 && xmlhttp.status == 200) {
            //alert('Before inserting the page... NOTE that the original div block has no styling - but the inserted page does...');
            pageBlock.innerHTML = xmlhttp.responseText;
        }
    }
    xmlhttp.send(null)
  }

  // add an overlay to the map
  function addOverlay(overlayName)  {
    if (overlayName.indexOf("contours") != -1)  {
      if (!contourOverlay)  {
        contourOverlay = true;
        bathymetryLayer1.setVisibility(true);
      }
      else  {
        contourOverlay = false;
        bathymetryLayer1.setVisibility(false);
      }
    }
    if (overlayName.indexOf("placeNames") != -1)  {
      if (!placeNameOverlay)  {
        placeNameOverlay = true;
        gazetteerLayer.setVisibility(true);
      }
      else  {
        placeNameOverlay = false;
        gazetteerLayer.setVisibility(false);
      }
    }
    if (overlayName.indexOf("bathySources") != -1)  {
      if (!bathySourcesOverlay) {
        bathySourcesOverlay = true;
        bathySourceLayer.setVisibility(true);
        bathySourceLayer1.setVisibility(true);
        map.addLayers([bathySourceLayer1,bathySourceLayer]); 
        map.raiseLayer(bathySourceLayer1,6500);
        map.raiseLayer(bathySourceLayer,7000);       
      }
      else  {
        bathySourcesOverlay = false;
        bathySourceLayer.setVisibility(false);
        bathySourceLayer1.setVisibility(false);
      }
    }
  }

  // add a selected dataset to the map
  function createMainPlate(dataSetName)  {

    // determine if map has an image already drawn on it
    if (mapLayer.length != 0)  {
      map.removeLayer(mapLayer[0]);
      mapLayer = [];
    }

    // determine if map has points of interest already drawn on it
    if (mapPOI.length != 0)  {
      map.removeLayer(mapPOI[0]);
      mapPOI = [];
    }

    // make sure world reference map is checked ... gets turned off by trade statistics plate as well as food habits plates
    referenceLayer.setVisibility(true);

    if (contourOverlay)  {
      contourOverlay = false;
      bathymetryLayer1.setVisibility(false);
    }
    if (placeNameOverlay)  {
      placeNameOverlay = false;
      gazetteerLayer.setVisibility(false);
    }
    if (bathySourcesOverlay)  {
      bathySourcesOverlay = false;
      bathySourceLayer.setVisibility(false);
      bathySourceLayer1.setVisibility(false);
    }

    // reset to original center
    map.zoomToExtent(new OpenLayers.Bounds(-11077478.10883,2218165.88923,-8932349.34703,3653959.02853));

    var localDataLayerAdded = true;

    // physical plates to add to map
    if (dataSetName.indexOf("Bathymetry") != -1)  {
      if (dataSetName.indexOf("Gulf") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_Bathymetry_0/_alllayers";
        var elementTitle = "Bathymetry - Gulf wide";
        var elementTopic = "Physical";
        var elementPlateDetails = "physicalPlates/Bathymetry.htm";    
      }
      if (dataSetName.indexOf("Estuarine") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_EstuarineBathymetry_30m/_alllayers";
        var elementTitle = "Bathymetry - Estuarine";
        var elementTopic = "Physical";
        var elementPlateDetails = "physicalPlates/Bathymetry_Estuarine.htm";
      }         
    }
    if (dataSetName.indexOf("Coastal Relief") != -1)  {
      if (dataSetName.indexOf("Northern Gulf") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NGDC_CoastalRelief/_alllayers";
        var elementTitle = "Coastal Relief - Northern Gulf";
        var elementTopic = "Physical";
        var elementPlateDetails = "physicalPlates/CoastalRelief.htm";
        map.zoomToExtent(new OpenLayers.Bounds(-11010210,2423970,-8872422,3879330));
      }      
    }  
    if (dataSetName.indexOf("Seawater Temperature") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_WaterTemperature_Winter_10mDepth/_alllayers";
      var elementTitle = "Seawater Temperature - Climatological Mean - Winter (January - March) - 10m Water Depth";
      var elementTopic = "Physical";
      var elementPlateDetails = "physicalPlates/SeawaterTemperature.htm";
    }  
    if (dataSetName.indexOf("SST") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_SST_AnnualMean/_alllayers";
      var elementTitle = "Remotely Sensed Sea Surface Temperature - Annual - Average";
      var elementTopic = "Physical";
      var elementPlateDetails = "physicalPlates/RemotelySensedSST.htm";
    }
    if (dataSetName.indexOf("Temperature - CMECS") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_Temperature_Fall/_alllayers";
      var elementTitle = "Remotely Sensed Sea Surface Temperature - CMECS Sea Surface Temperature Subcomponent - Mean - Fall";
      var elementTopic = "Physical";
      var elementPlateDetails = "physicalPlates/CMECS_TemperatureSubcomponent.htm";
    }  
    if (dataSetName.indexOf("Water Column Stability - CMECS") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_WaterColumnStabilityModifier_Fall/_alllayers";
      var elementTitle = "Remotely Sensed Sea Surface Temperature - CMECS Water Column Temperature Change - Mean - Fall";
      var elementTopic = "Physical";
      var elementPlateDetails = "physicalPlates/CMECS_WaterColumn_DeltaT.htm";
    }  
    if (dataSetName.indexOf("Salinity") != -1)  {
      if (dataSetName.indexOf("Mean") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Salinity_Winter_10mDepth/_alllayers";
        var elementTitle = "Seawater Salinity - Climatological Mean - Winter (January - March) - 10m Water Depth";
        var elementTopic = "Physical";
        var elementPlateDetails = "physicalPlates/SeawaterSalinity.htm";
      }
      if (dataSetName.indexOf("CMECS") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_Salinity_Fall/_alllayers";
        var elementTitle = "Seawater Salinity - CMECS Sea Surface Salinity Subcomponent - Mean - Fall";
        var elementTopic = "Physical";
        var elementPlateDetails = "physicalPlates/CMECS_SalinitySubcomponent.htm";
      }
      if (dataSetName.indexOf("Zones") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NOS_SalinityZones/_alllayers";
        var elementTitle = "Salinity Zones - Estuarine";
        var elementTopic = "Physical";
        var elementPlateDetails = "physicalPlates/SalinityZones_Estuarine.htm";
      }
    }  
    if (dataSetName.indexOf("Dissolved Oxygen") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_DissolvedOxygen_Winter_10mDepth/_alllayers";
      var elementTitle = "Dissolved Oxygen - Climatological Mean - Winter (January - March) - 10m Water Depth";
      var elementTopic = "Physical";
      var elementPlateDetails = "physicalPlates/DissolvedOxygen.htm";
    }
    if (dataSetName.indexOf("Hypoxia") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Hypoxia_2001-2011/_alllayers";
      var elementTitle = "Dissolved Oxygen - Frequency of Hypoxia - 2001 to 2011";
      var elementTopic = "Physical";
      var elementPlateDetails = "physicalPlates/Hypoxia.htm";
    }
    if (dataSetName.indexOf("Nutrients") != -1)  {
      if (dataSetName.indexOf("Nitrates") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Nitrates_Winter_10mDepth/_alllayers";
        var elementTitle = "Nitrates - Climatological Mean - Winter (January - March) - 10m Water Depth";
        var elementTopic = "Physical";
        var elementPlateDetails = "physicalPlates/Nitrates.htm";
      }
      if (dataSetName.indexOf("Phosphate") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Phosphate_Winter_10mDepth/_alllayers";
        var elementTitle = "Phosphate - Climatological Mean - Winter (January - March) - 10m Water Depth";
        var elementTopic = "Physical";
        var elementPlateDetails = "physicalPlates/Phosphate.htm";
      }
      if (dataSetName.indexOf("Silicate") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Silicate_Winter_10mDepth/_alllayers";
        var elementTitle = "Silicate - Climatological Mean - Winter (January - March) - 10m Water Depth";
        var elementTopic = "Physical";
        var elementPlateDetails = "physicalPlates/Silicate.htm";
      }
    }
    if (dataSetName.indexOf("Precipitation") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_PERSIANN_MedianPrecip_Annual/_alllayers";
      var elementTitle = "Median Annual Precipitation";
      var elementTopic = "Physical";
      var elementPlateDetails = "physicalPlates/PERSIANN.htm";
    }       
    if (dataSetName.indexOf("Prevailing Winds") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCDC_SeaWinds_Spring/_alllayers";
      var elementTitle = "Prevailing Winds - Climatological Average (1991 to 2010) - Spring (March - May)";
      var elementTopic = "Physical";
      var elementPlateDetails = "physicalPlates/PrevailingWinds.htm";
    }
    if (dataSetName.indexOf("Bottom Sediments") != -1)  {
      if (dataSetName.indexOf("Types") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_usSEABED_DominantSediments/_alllayers";
        var elementTitle = "Bottom Sediments - Dominant Bottom Types and Habitats";
        var elementTopic = "Physical";
        var elementPlateDetails = "physicalPlates/BottomSediments_Types.htm";
      }
      if (dataSetName.indexOf("Properties") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_usSEABED_LooseSediments/_alllayers";
        var elementTitle = "Bottom Sediments - Seabed Sediment Folk Codes";
        var elementTopic = "Physical";
        var elementPlateDetails = "physicalPlates/BottomSediments_Properties.htm";
      }  
    }
    if (dataSetName.indexOf("Geomorphology") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_BlueHabitats_Geomorphology_Base/_alllayers";
      var elementTitle = "Gulf of Mexico Geomorphic Base Layers";
      var elementTopic = "Physical";
      var elementPlateDetails = "physicalPlates/Geomorphology.htm";
    }
    if (dataSetName.indexOf("Hurricanes") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_HurricaneGrid_Intensity/_alllayers";
      var elementTitle = "Maximum Storm Intensity - 1851 to 2012";
      var elementTopic = "Physical";
      var elementPlateDetails = "physicalPlates/Hurricanes.htm";
    }

    // biotic plates to add to map
    if (dataSetName.indexOf("CCAP") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_CCAP_2010/_alllayers";
      var elementTitle = "Coastal Change Analysis Program - 2010";
      var elementTopic = "Biotic";
      var elementPlateDetails = "bioticPlates/Shoreline_CoastalWetlands.htm";
    } 
    if (dataSetName.indexOf("Grand Bay") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_GrandBayNERR/_alllayers";
      var elementTitle = "Grand Bay NERR";
      var elementTopic = "Biotic";
      var elementPlateDetails = "bioticPlates/GrandBay.htm";
      map.zoomToExtent(new OpenLayers.Bounds(-9913800,3506970,-9779883,3597930));
    }
    if (dataSetName.indexOf("MBCC and Habitat - LCLU 1992") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_LCLU_1992/_alllayers";
      var elementTitle = "Mobile Bay - Land Cover Land Use - 1992";
      var elementTopic = "Biotic";
      var elementPlateDetails = "bioticPlates/MBCC_Habitat_Project.htm";
      map.zoomToExtent(new OpenLayers.Bounds(-9906402,3503271,-9686569,3676018.7));
    }  
    if (dataSetName.indexOf("Perdido Coastal Lagoons") != -1)  {
      var elementTitle = "Perdido Coastal Lagoons";
      var elementTopic = "Biotic";
      var elementPlateDetails = "bioticPlates/PerdidoCoastalLagoons.htm";
      map.zoomToExtent(new OpenLayers.Bounds(-9797769.38,3492524.02,-9664157.46,3583178.34));
      createPOIs("PerdidoCoastalLagoons");
      localDataLayerAdded = false;
    }
    if (dataSetName.indexOf("Productivity - CMECS") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_Chlorophyll_Fall/_alllayers";
      var elementTitle = "CMECS Water Column Productivity Modifier - Mean - Fall";
      var elementTopic = "Biotic";
      var elementPlateDetails = "bioticPlates/CMECS_Chlorophyll.htm";
    }
    if (dataSetName.indexOf("Mangroves") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_Mangroves_GOM/_alllayers";
      var elementTitle = "Mangrove Communities - US and Mexico";
      var elementTopic = "Biotic";
      var elementPlateDetails = "bioticPlates/Mangroves.htm";
    }
    if (dataSetName.indexOf("Marsh Vegetation") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_USGS_MarshTypeFourClass/_alllayers";
      var elementTitle = "Four-Class Marsh Vegetation Type - TX, LA, MS, AL";
      var elementTopic = "Biotic";
      var elementPlateDetails = "bioticPlates/MarshVegetation.htm";
    }
    if (dataSetName.indexOf("Wetlands") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_FWS_NationalWetlandsInventory/_alllayers";
      var elementTitle = "Wetlands";
      var elementTopic = "Biotic";
      var elementPlateDetails = "bioticPlates/FWS_Wetlands.htm";
    } 
    if (dataSetName.indexOf("Seagrasses") != -1)  {
      if (dataSetName.indexOf("Gulf-wide") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SAV_Gulfwide/_alllayers";
        var elementTitle = "Submerged Aquatic Vegetation - Gulf-wide";
        var elementTopic = "Biotic";
        var elementPlateDetails = "bioticPlates/SAV.htm";
      }  
      if (dataSetName.indexOf("Gulf Islands") != -1)  {
        var elementTitle = "Seagrasses - Barrier Islands - Mississippi";
        var elementTopic = "Biotic";
        var elementPlateDetails = "bioticPlates/SAV_GulfIslands.htm";
        map.zoomToExtent(new OpenLayers.Bounds(-10015390,3449449,-9748472,3630758));
        createPOIs("GulfIslandsSAV");
        localDataLayerAdded = false;
      }
    }
    if (dataSetName.indexOf("Chemosynthetic Communities") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_BOEMRE_ChemosyntheticCommunities/_alllayers";
      var elementTitle = "Corals and Hard Bottom - Known Chemosynthetic Communities";
      var elementTopic = "Biotic";
      var elementPlateDetails = "bioticPlates/ChemoSites.htm";
    }
    if (dataSetName.indexOf("Hydrocarbon Seeps") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_BOEM_SeismicWaterBottomAnomalies/_alllayers";
      var elementTitle = "Corals and Hard Bottom - Hydrocarbon Seeps";
      var elementTopic = "Biotic";
      var elementPlateDetails = "bioticPlates/HydrocarbonSeeps.htm";
    }    
    if (dataSetName.indexOf("Deep-Sea Corals") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCCOS_DeepSeaCorals_2016/_alllayers";
      var elementTitle = "Deep-Sea Corals";
      var elementTopic = "Biotic";
      var elementPlateDetails = "bioticPlates/DeepSeaCoral.htm";
    }  
    if (dataSetName.indexOf("Suitable Coral Habitat - All") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCCOS_CoralHabitat_AllFrameworkFormingCorals/_alllayers";
      var elementTitle = "Deep-Sea Corals - Suitable Habitat - All Framework-Forming Corals";
      var elementTopic = "Biotic";
      var elementPlateDetails = "bioticPlates/CoralHabitatSuitabilityModels.htm";
    }
    if (dataSetName.indexOf("HABs") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCCOS_ToxicBlooms_PMN/_alllayers";
      var elementTitle = "Phytoplankton Monitoring Network - Harmful Algal Blooms (2007 - 2012)";
      var elementTopic = "Biotic";
      var elementPlateDetails = "bioticPlates/PMN_HABs.htm";
    }  
    if (dataSetName.indexOf("Nonindigenous Aquatic Species") != -1)  {
      if (dataSetName.indexOf("Lionfish") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_USGS_InvasiveSpecies_Lionfish/_alllayers";
        var elementTitle = "Nonindigenous Aquatic Species - Lionfish (2006 - 2013) - Gulf of Mexico";
        var elementTopic = "Biotic";
        var elementPlateDetails = "bioticPlates/InvasiveSpecies_Lionfish.htm";
      }
      if (dataSetName.indexOf("Asian Tiger Shrimp") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_USGS_InvasiveSpecies_AsianTigerShrimp/_alllayers";
        var elementTitle = "Nonindigenous Aquatic Species - Asian Tiger Shrimp (2006 - 2013) - Gulf of Mexico";
        var elementTopic = "Biotic";
        var elementPlateDetails = "bioticPlates/InvasiveSpecies_AsianTigerShrimp.htm";
      }
    } 


    // living marine resources plates to add to map
    if (dataSetName.indexOf("EFH") != -1)  {
      if (dataSetName.indexOf("Council Managed") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_EssentialFishHabitats/_alllayers";
        var elementTitle = "Essential Fish Habitats - Council Managed Species - Gulf-wide";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/EssentialFishHabitats.htm";
      }
      if (dataSetName.indexOf("Highly migratory") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_EssentialFishHabitats_BluefinTuna/_alllayers";
        var elementTitle = "Essential Fish Habitats - Highly Migratory Species - Atlantic Bluefin Tuna";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/EssentialFishHabitats_BluefinTuna.htm";
      }
    }
    if (dataSetName.indexOf("Suitable Habitat") != -1)  {
       referenceLayer.setVisibility(false);
      if (dataSetName.indexOf("Bluefin Tuna") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_BluefinTuna_Spawning/_alllayers";
        var elementTitle = "Percent Daily Occurrence of Potential Spawning Habitat - Large Atlantic Bluefin Tuna- March to May";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/HabitatSuitability_BluefinTuna.htm";
      }
    }
    if (dataSetName.indexOf("Food Habits") != -1)  {
       referenceLayer.setVisibility(false);
      if (dataSetName.indexOf("King Mackerel") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_KingMackerel_DietCompositionByFoodWebs/_alllayers";
        var elementTitle = "King Mackerel Diet Composition (Percent Volume) per Food Web";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/FoodHabits_KingMackerel.htm";
      }
    }
    if (dataSetName.indexOf("Critical Habitats") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_CriticalHabitats/_alllayers";
      var elementTitle = "Critical Habitats - Gulfwide";
      var elementTopic = "LivingMarineResources";
      var elementPlateDetails = "lmrPlates/CriticalHabitats.htm";
    }
    if (dataSetName.indexOf("Invertebrates") != -1)  {
      if (dataSetName.indexOf("Eastern Oyster") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_Oysters_GOM/_alllayers";
        var elementTitle = "Eastern Oyster";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/EasternOyster.htm";
      }  
      if (dataSetName.indexOf("Brown Shrimp") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP-CAGES_Trawl_Stations/_alllayers";
        var elementTitle = "Brown Shrimp - Trawl Stations (State and Federal) - Fisheries-Independent";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/BrownShrimp.htm";
      }  
      if (dataSetName.indexOf("Pink Shrimp") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP-CAGES_Trawl_Stations/_alllayers";
        var elementTitle = "Pink Shrimp - Trawl Stations (State and Federal) - Fisheries-Independent";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/PinkShrimp.htm";
      }  
      if (dataSetName.indexOf("White Shrimp") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP-CAGES_Trawl_Stations/_alllayers";
        var elementTitle = "White Shrimp - Trawl Stations (State and Federal) - Fisheries-Independent";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/WhiteShrimp.htm";
      }  
    }
    if (dataSetName.indexOf("Fishes") != -1)  {
      if (dataSetName.indexOf("Atlantic Croaker") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP-CAGES_Trawl_Stations/_alllayers";
        var elementTitle = "Atlantic Croaker - Trawl Stations (State and Federal) - Fisheries-Independent";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/AtlanticCroaker.htm";
      }
      if (dataSetName.indexOf("Gag Grouper") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_GagGrouper_Occurrence/_alllayers";
        var elementTitle = "Gag Grouper - Occurrence/No Occurrence - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/GagGrouper.htm";
      }
      if (dataSetName.indexOf("Gray Triggerfish") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_GrayTriggerfish_Abundance/_alllayers";
        var elementTitle = "Gray Triggerfish - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/GrayTriggerfish.htm";
      }
      if (dataSetName.indexOf("Gulf Butterfish") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_GulfButterfish_Abundance/_alllayers";
        var elementTitle = "Gulf Butterfish - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/GulfButterfish.htm";
      } 
      if (dataSetName.indexOf("King Mackerel") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_FallPlankton_KingMackerel_Abundance/_alllayers";
        var elementTitle = "King Mackerel - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/KingMackerel.htm";
      }
      if (dataSetName.indexOf("Lane Snapper") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_LaneSnapper_Abundance/_alllayers";
        var elementTitle = "Lane Snapper - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/LaneSnapper.htm";
      }  
      if (dataSetName.indexOf("Red Grouper") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_RedGrouper_Occurrence/_alllayers";
        var elementTitle = "Red Grouper - Occurrence/No Occurrence - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/RedGrouper.htm";
      }  
      if (dataSetName.indexOf("Red Snapper") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_RedSnapper_Occurrence/_alllayers";
        var elementTitle = "Red Snapper - Occurrence/No Occurrence - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/RedSnapper.htm";
      }  
      if (dataSetName.indexOf("Sand Seatrout") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP-CAGES_Trawl_Stations/_alllayers";
        var elementTitle = "Sand Seatrout - Trawl Stations (State and Federal) - Fisheries-Independent";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/SandSeatrout.htm";
      }
      if (dataSetName.indexOf("Silver Seatrout") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_SilverSeatrout_Abundance/_alllayers";
        var elementTitle = "Silver Seatrout - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/SilverSeatrout.htm";
      }
      if (dataSetName.indexOf("Spanish Mackerel") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP-CAGES_SpanishMackerel_Stations/_alllayers";
        var elementTitle = "Spanish Mackerel - Sampling Locations (State and Federal) - Fisheries-Independent";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/SpanishMackerel.htm";
      }
      if (dataSetName.indexOf("Spot") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP-CAGES_Trawl_Stations/_alllayers";
        var elementTitle = "Spot - Trawl Stations (State and Federal) - Fisheries-Independent";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/Spot.htm";
      }
      if (dataSetName.indexOf("Vermilion Snapper") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_VermilionSnapper_Occurrence/_alllayers";
        var elementTitle = "Vermilion Snapper - Occurrence/No Occurrence - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/VermilionSnapper.htm";
      }
      if (dataSetName.indexOf("Yellowedge Grouper") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_YellowedgeGrouper_Abundance/_alllayers";
        var elementTitle = "Yellowedge Grouper - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/YellowedgeGrouper.htm";
      }
    }
    if (dataSetName.indexOf("Reptiles") != -1)  {
      if (dataSetName.indexOf("Green Sea Turtle") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SWOT_GreenSeaTurtles_NestingSites/_alllayers";
        var elementTitle = "Green Sea Turtles - Nesting Sites";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/GreenSeaTurtle.htm";
      }
      if (dataSetName.indexOf("Hawksbill Sea Turtle") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SWOT_HawksbillSeaTurtles_NestingSites/_alllayers";
        var elementTitle = "Hawksbill Sea Turtles - Nesting Sites";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/HawksbillSeaTurtle.htm";
      }
      if (dataSetName.indexOf("Leatherback Sea Turtle") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SWOT_LeatherbackSeaTurtles_NestingSites/_alllayers";
        var elementTitle = "Leatherback Sea Turtles - Nesting Sites";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/LeatherbackSeaTurtle.htm";
      }
      if (dataSetName.indexOf("Loggerhead Sea Turtle") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SWOT_LoggerheadSeaTurtles_NestingSites/_alllayers";
        var elementTitle = "Loggerhead Sea Turtles - Nesting Sites";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/LoggerheadSeaTurtle.htm";
      }
      if (dataSetName.indexOf("Kemp Ridley Sea Turtle") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SWOT_RidleyKempSeaTurtles_NestingSites/_alllayers";
        var elementTitle = "Kemp's Ridley Sea Turtles - Nesting Sites";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/KempRidleySeaTurtle.htm";
      }
    }
    if (dataSetName.indexOf("Sharks") != -1)  {
      if (dataSetName.indexOf("Atlantic Sharpnose Shark") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_AtlanticSharpnoseShark_Abundance/_alllayers";
        var elementTitle = "Atlantic Sharpnose Shark - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/AtlanticSharpnoseShark.htm";
      }
      if (dataSetName.indexOf("Blacknose Shark") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_BlacknoseShark_Abundance/_alllayers";
        var elementTitle = "Blacknose Shark - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/BlacknoseShark.htm";
      }
      if (dataSetName.indexOf("Blacktip Shark") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_BlacktipShark_Abundance/_alllayers";
        var elementTitle = "Blacktip Shark - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
        var elementPlateDetails = "lmrPlates/BlacktipShark.htm";
      }
    }

    // socioeconomic conditions plates to be added to map (formerly called economic activities)
    if (dataSetName.indexOf("CSVI - Poverty") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_SocialIndicators_FishingCommunities_GulfCoast_PovertyIndex/_alllayers";
      var elementTitle = "Community Social Vulnerability Indicators - Poverty (US Gulf Coast)";
      var elementTopic = "SocioeconomicConditions";
      var elementPlateDetails = "socioeconomicPlates/CSVI.htm";
    }
    if (dataSetName.indexOf("Social WellBeing - Social Services") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCCOS_SocialWellBeing_AccessToSocialServices_2012/_alllayers";
      var elementTitle = "Coastal Community Well-Being Indicators - Access to Social Services (US Gulf Coast) - 2012";
      var elementTopic = "SocioeconomicConditions";
      var elementPlateDetails = "socioeconomicPlates/NCCOS_SocialWellBeingData.htm";
    } 
    if (dataSetName.indexOf("Population Density") != -1)  {
      var elementURL = "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Population_Density/MapServer";
      var elementTitle = "Population Density - 2010 (US only)";
      var elementTopic = "SocioeconomicConditions";
      var elementPlateDetails = "socioeconomicPlates/PopulationDensity.htm";
      var jsonp_url = elementURL + '?f=json&pretty=true&callback=?';
      $.getJSON(jsonp_url, function(data) {            
          var dataLayer = new OpenLayers.Layer.ArcGISCache(elementTitle, elementURL, {layerInfo: data, isBaseLayer: false, displayInLayerSwitcher: false, opacity: 0.9});
          addTiledMap(dataLayer);
          mapLayer.push(dataLayer);
      });
      localDataLayerAdded = false;
    }
    if (dataSetName.indexOf("Recreational Facilities") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_RecFac_MarinasRamps/_alllayers";
      var elementTitle = "Recreational Facilities - Marinas and Boat Ramps (US only)";
      var elementTopic = "SocioeconomicConditions";
      var elementPlateDetails = "socioeconomicPlates/RecreationalFacilities.htm";
    } 
    if (dataSetName.indexOf("Trade Statistics") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_TotalTradeStatistics_GOM_2005_2012/_alllayers";
      var elementTitle = "Trade Statistics (2005-2012) - US and Mexican Ports";
      var elementTopic = "SocioeconomicConditions";
      var elementPlateDetails = "socioeconomicPlates/US-MX-GOM_TradeStatistics.htm";
      referenceLayer.setVisibility(false);
    }  
    if (dataSetName.indexOf("Waterways") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_USACE_NatlWaterWayNetwork_TypeNN/_alllayers";
      var elementTitle = "Navigable Waterway Routes (United States National Waterway Network)";
      var elementTopic = "SocioeconomicConditions";
      var elementPlateDetails = "socioeconomicPlates/Waterways.htm";
    } 
    if (dataSetName.indexOf("Shipping and Navigation") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_ShippingAndNavigation/_alllayers";
      var elementTitle = "Shipping and Navigation";
      var elementTopic = "SocioeconomicConditions";
      var elementPlateDetails = "socioeconomicPlates/ShippingNavigation.htm";
    } 
    if (dataSetName.indexOf("Shipping Density") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_AIS_CommercialVesselDensity2009_2010/_alllayers";
      var elementTitle = "Shipping Density - Commercial Vessels - 2010";
      var elementTopic = "SocioeconomicConditions";
      var elementPlateDetails = "socioeconomicPlates/ShippingDensity-AIS.htm";
    }
    if (dataSetName.indexOf("Offshore Structures") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_BOEMRE_DrillingPlatforms/_alllayers";
      var elementTitle = "Oil and Gas Structures";
      var elementTopic = "SocioeconomicConditions";
      var elementPlateDetails = "socioeconomicPlates/OffshoreStructures.htm";
    } 
    if (dataSetName.indexOf("Gas and Oil Pipelines") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_BOEMRE_OilAndGasPipelines/_alllayers";
      var elementTitle = "Oil and Gas Pipelines";
      var elementTopic = "SocioeconomicConditions";
      var elementPlateDetails = "socioeconomicPlates/Pipelines.htm";
    } 
    if (dataSetName.indexOf("Borrow Sites") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_BOEMRE_BorrowSites/_alllayers";
      var elementTitle = "Borrow Sites";
      var elementTopic = "SocioeconomicConditions";
      var elementPlateDetails = "socioeconomicPlates/BorrowSites.htm";
      map.zoomToExtent(new OpenLayers.Bounds(-10488607,3234473,-9953548,3597090));
    } 

    // environmental quality plates to add to map
    if (dataSetName.indexOf("DWH - Surface Monitoring") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_DeepwaterHorizonEvent_Surface/_alllayers";
      var elementTitle = "Deepwater Horizon Oil Spill - Surface Monitoring";
      var elementTopic = "EnvironmentalQuality";
      var elementPlateDetails = "environmentalPlates/DWH2010_SurfaceMonitoring.htm";
    }
    if (dataSetName.indexOf("MusselWatch - PAHs") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCCOS_PAHMaximums_MusselWatch/_alllayers";
      var elementTitle = "Discharges - Polynuclear Aromatic Hydrocarbons (PAH)";
      var elementTopic = "EnvironmentalQuality";
      var elementPlateDetails = "environmentalPlates/PAHs_MusselWatch.htm";
    } 
    if (dataSetName.indexOf("Incidents - Oil Spills") != -1)  {  
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_ORR_OilSpill_Incidents_2000-2010/_alllayers";
      var elementTitle = "Incidents - Oil Spills (2000 - 2010)";
      var elementTopic = "EnvironmentalQuality";
      var elementPlateDetails = "environmentalPlates/OilSpills.htm";
    }
    if (dataSetName.indexOf("Photic Quality - CMECS") != -1)  {  
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_EuphoticDepth_Fall/_alllayers";
      var elementTitle = "CMECS Photic Quality - Euphotic Depth - Mean - Fall";
      var elementTopic = "EnvironmentalQuality";
      var elementPlateDetails = "environmentalPlates/CMECS_PhoticQuality.htm";
    }
    if (dataSetName.indexOf("Water Quality - Nutrients") != -1)  {  
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_NAWQA_Nitrogen_TotalYieldDelivered_GOM/_alllayers";
      var elementTitle = "Water Quality - Total Yield Delivered - Nitrogen - Estuarine";
      var elementTopic = "EnvironmentalQuality";
      var elementPlateDetails = "environmentalPlates/WaterQuality_Nutrients.htm";
    }

    // jurisdiction plates to add to map
    if (dataSetName.indexOf("Marine Jurisdictions") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_MarineJurisdictions/_alllayers";
      var elementTitle = "Marine Jurisdictions";
      var elementTopic = "Jurisdictions";
      var elementPlateDetails = "jurisdictionPlates/MarineJurisdictions.htm";
    } 
    if (dataSetName.indexOf("Fishery Closures") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_FMAs/_alllayers";
      var elementTitle = "Fishery Closures (Seasonal/Area/Quota Closures)";
      var elementTopic = "Jurisdictions";
      var elementPlateDetails = "jurisdictionPlates/FisheryClosure.htm";
    }
    if (dataSetName.indexOf("Watersheds") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_Watersheds/_alllayers";
      var elementTitle = "Watersheds";
      var elementTopic = "Jurisdictions";
      var elementPlateDetails = "jurisdictionPlates/Watersheds.htm";
    }
    if (dataSetName.indexOf("Federal Protected Areas - Cuba") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_FederalProtectedAreas_Cuba/_alllayers";
      var elementTitle = "National Protected Areas - Cuba";
      var elementTopic = "Jurisdictions";
      var elementPlateDetails = "jurisdictionPlates/FederalProtectedAreas_Cuba.htm";
      map.zoomToExtent(new OpenLayers.Bounds(-9962108.6,1720407.9,-7824317.8,3173322.9));
    }
    if (dataSetName.indexOf("Federal Protected Areas - Mexico") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_FederalProtectedAreas_Mexico/_alllayers";
      var elementTitle = "Federal Protected Areas - Mexico";
      var elementTopic = "Jurisdictions";
      var elementPlateDetails = "jurisdictionPlates/FederalProtectedAreas_Mexico.htm";
      map.zoomToExtent(new OpenLayers.Bounds(-11226682.8,1720407.9,-9101121.9,3158647.0));
    }
    if (dataSetName.indexOf("Federal Protected Areas - United States") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_FederalProtectedAreas/_alllayers";
      var elementTitle = "Federal Protected Areas - United States";
      var elementTopic = "Jurisdictions";
      var elementPlateDetails = "jurisdictionPlates/FederalProtectedAreas_UnitedStates.htm";
    } 

    if (localDataLayerAdded)  {
      var dataLayer = new OpenLayers.Layer.ArcGISCache(elementTitle, elementURL, {layerInfo: layerInfo, useArcGISServer: false, isBaseLayer: false, displayInLayerSwitcher: false, opacity: 0.9});
      addTiledMap(dataLayer);
      mapLayer.push(dataLayer);
    }

    // var linkURL = htmlURL;
    // linkURL += "/website/DataAtlas/plateDetails/";
    var linkURL = 'plateDetails/';
    linkURL += elementPlateDetails;
    loadPage(linkURL);
    var barColor = "#d2ebf0";
    //if (elementTopic.indexOf("Physical") != -1)  barColor = "#4d8777";
    //if (elementTopic.indexOf("Biotic") != -1)  barColor = "#799c4b";
    //if (elementTopic.indexOf("LivingMarineResources") != -1)  barColor = "#2851c3";
    //if (elementTopic.indexOf("SocioeconomicConditions") != -1)  barColor = "#124c82";
    //if (elementTopic.indexOf("EnvironmentalQuality") != -1)  barColor = "#6a7a3d";
    //if (elementTopic.indexOf("Jurisdictions") != -1)  barColor = "#88bd6f";
    var colorBarHTML = "";
    colorBarHTML += '<table cellpadding="0" cellspacing="0">';
    colorBarHTML += '<tr align="center">';
    colorBarHTML += '<td bgcolor="'+barColor+'" width="900" height="25" class="smallText4">'+elementTitle+'</td>';
    colorBarHTML += '<td bgcolor="'+barColor+'" width="300" height="25"></td>';
    colorBarHTML += '</tr>';
    colorBarHTML += '</table>';
    document.getElementById("colorBar").innerHTML = colorBarHTML;

    // add opacity bar
    var opacityBarHTML = "";
    opacityBarHTML += '<table width="880" border="0" cellspacing="0" cellpadding="0" align="center" height="25">';
    opacityBarHTML += '<tr align="center" valign="middle">';
    opacityBarHTML += '<td bgcolor="#d0ecf0" class="opacityText" height="25" width="880">';
    opacityBarHTML += 'Set Opacity: ';
    opacityBarHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
    opacityBarHTML += '<a title="decrease opacity" href="javascript: changeOpacity(-10);"><font size="3"><b>-</b></font></a>&nbsp;&nbsp;';
    opacityBarHTML += '<input id="opacity" type="text" value="90" size="1" disabled="true" style="width: 30px; height: 20px; font: bold 12px arial; text-align: center; background-color: #ffffff;"/>';
    opacityBarHTML += '&nbsp;&nbsp;<a title="increase opacity" href="javascript: changeOpacity(10);"><font size="3"><b>+</b></font></a>';
    opacityBarHTML += '</td>';
    opacityBarHTML += '<td></td>';
    opacityBarHTML += '</tr>';
    opacityBarHTML += '</table>';
    document.getElementById("opacityBar").innerHTML = opacityBarHTML;

    // reset the collapsible variable  ... this is so the collapsible folders within the "More Information" tab don't get replicated
    collapsibleFirstTime = true;
  }

  // get the tile schema to be overlayed on map
  function addTiledMap(cacheLayer)  {
    map.addLayer(cacheLayer);
    // set any overlayers found in the LayerSwitcher to be on top of the tiled map 
    map.raiseLayer(referenceLayer,1000);
    map.raiseLayer(referenceLayer1,1000);
    map.raiseLayer(bathymetryLayer,2000);
    map.raiseLayer(bathymetryLayer1,2000);
    map.raiseLayer(shorelineLayer,3000);
    map.raiseLayer(gazetteerLayer,4000);
    map.raiseLayer(loopcurrentLayer,5000);
    map.raiseLayer(graticuleLayer,6000);
  }

  // add point of interest on the map which represent locations of subplates
  function createPOIs(poiType)  {
    // determine what POI to be added to map
    if (poiType.indexOf("PerdidoCoastalLagoons") != -1)  {
      var urlLink = "products/bioticPlates/PerdidoCoastalLagoons/lagoons.txt";
      var poiLayer = new OpenLayers.Layer.Vector("Perdido Coastal Lagoons", {
                     displayInLayerSwitcher: false,
                     strategies: [new OpenLayers.Strategy.Fixed()],
                     protocol: new OpenLayers.Protocol.HTTP({  
                       url: urlLink,
                       format: new OpenLayers.Format.Text()
                     })
      });
    }
    if (poiType.indexOf("GulfIslandsSAV") != -1)  {
      var urlLink = "products/bioticPlates/MSBarrierIslands_SeagrassChange/seagrasschanges.txt";
      var poiLayer = new OpenLayers.Layer.Vector("Seagrass Study", {
                     displayInLayerSwitcher: false,
                     strategies: [new OpenLayers.Strategy.Fixed()],
                     protocol: new OpenLayers.Protocol.HTTP({
                       url: urlLink,
                       format: new OpenLayers.Format.Text()
                     })
      });
    }
    map.addLayer(poiLayer);
    mapPOI.push(poiLayer);
  }

  // create subplates based on main topic section
  function createSubPlate(subplateData)  {

    // determine if map has an image already drawn on it
    if (mapLayer.length != 0)  {
      map.removeLayer(mapLayer[0]);
      mapLayer = [];
    }

    // determine if map has points of interest already drawn on it
    if (mapPOI.length != 0)  {
      map.removeLayer(mapPOI[0]);
      mapPOI = [];
    }

    // add physical subplate data to map
    if (subplateData.indexOf("Coastal Relief") != -1)  {
      if (subplateData.indexOf("Northern Gulf") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NGDC_CoastalRelief/_alllayers";
        var elementTitle = "Coastal Relief - Northern Gulf";
        var elementTopic = "Physical";
        map.zoomToExtent(new OpenLayers.Bounds(-11010210,2423970,-8872422,3879330));
      }
      if (subplateData.indexOf("New Orleans") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NGDC_CoastalRelief_NewOrleans/_alllayers";
        var elementTitle = "Coastal Relief - New Orleans, LA";
        var elementTopic = "Physical";
        map.zoomToExtent(new OpenLayers.Bounds(-10155800.2,3415399.2,-9887964.9,3597013.5));
      }  
      if (subplateData.indexOf("Biloxi") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NGDC_CoastalRelief_Biloxi/_alllayers";
        var elementTitle = "Coastal Relief - Biloxi, MS";
        var elementTopic = "Physical";
        map.zoomToExtent(new OpenLayers.Bounds(-10030149.5,3429616.3,-9762925.7,3611536.5));
      }
      if (subplateData.indexOf("Corpus Christi") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NGDC_CoastalRelief_CorpusChristi/_alllayers";
        var elementTitle = "Coastal Relief - Corpus Christi, TX";
        var elementTopic = "Physical";
        map.zoomToExtent(new OpenLayers.Bounds(-10970313.4,3125091.0,-10702478.0,3306705.4));
      }
      if (subplateData.indexOf("Galveston") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NGDC_CoastalRelief_Galveston/_alllayers";
        var elementTitle = "Coastal Relief - Galveston, TX";
        var elementTopic = "Physical";
        map.zoomToExtent(new OpenLayers.Bounds(-10697127.4,3327037.6,-10429903.6,3508652.0));
      }
      if (subplateData.indexOf("Key West") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NGDC_CoastalRelief_KeyWest/_alllayers";
        var elementTitle = "Coastal Relief - Key West, FL";
        var elementTopic = "Physical";
        map.zoomToExtent(new OpenLayers.Bounds(-9248185,2717029,-8980655,2897114));
      }  
      if (subplateData.indexOf("Mobile") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NGDC_CoastalRelief_Mobile/_alllayers";
        var elementTitle = "Coastal Relief - Mobile, AL";
        var elementTopic = "Physical";
        map.zoomToExtent(new OpenLayers.Bounds(-9940176.5,3469934.9,-9672646.9,3651549.3));
      }  
      if (subplateData.indexOf("Panama City") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NGDC_CoastalRelief_PanamaCity/_alllayers";
        var elementTitle = "Coastal Relief - Panama City, FL";
        var elementTopic = "Physical";
        map.zoomToExtent(new OpenLayers.Bounds(-9673788.5,3419067.8,-9406258.9,3600682.2));
      }
      if (subplateData.indexOf("Southern Louisiana") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NGDC_CoastalRelief_SouthernLouisiana/_alllayers";
        var elementTitle = "Coastal Relief - Southern Louisiana";
        var elementTopic = "Physical";
        map.zoomToExtent(new OpenLayers.Bounds(-10322361.3,3220972.1,-9788525.1,3584200.8));
      }
      if (subplateData.indexOf("South Padre Island") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NGDC_CoastalRelief_SouthPadreIsland/_alllayers";
        var elementTitle = "Coastal Relief - South Padre Island, TX";
        var elementTopic = "Physical";
        map.zoomToExtent(new OpenLayers.Bounds(-10978413,2948786,-10711495,3129483));
      }
      if (subplateData.indexOf("Tampa Bay") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NGDC_CoastalRelief_TampaBay/_alllayers";
        var elementTitle = "Coastal Relief - Tampa Bay, FL";
        var elementTopic = "Physical";
        map.zoomToExtent(new OpenLayers.Bounds(-9344273.1,3120311.9,-9077049.2,3302843.5));
      }  
    }
    if (subplateData.indexOf("Seawater Temperature") != -1)  {
      if (subplateData.indexOf("DD") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_SWTemp_Annual_DD.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_WaterTemperature_AnnualDD/_alllayers";
        var elementTitle = "Seawater Temperature - Annual Data Distribution";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Winter - 10m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_SWTemp_Winter_10m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_WaterTemperature_Winter_10mDepth/_alllayers";
        var elementTitle = "Seawater Temperature - Climatological Mean - Winter (January - March) - 10m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Spring - 10m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_SWTemp_Spring_10m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_WaterTemperature_Spring_10mDepth/_alllayers";
        var elementTitle = "Seawater Temperature - Climatological Mean - Spring (April - June) - 10m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Summer - 10m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_SWTemp_Summer_10m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_WaterTemperature_Summer_10mDepth/_alllayers";
        var elementTitle = "Seawater Temperature - Climatological Mean - Summer (July - September) - 10m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Fall - 10m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_SWTemp_Fall_10m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_WaterTemperature_Fall_10mDepth/_alllayers";
        var elementTitle = "Seawater Temperature - Climatological Mean - Fall (October - December) - 10m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Winter - 250m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_SWTemp_250m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_WaterTemperature_Winter_250mDepth/_alllayers";
        var elementTitle = "Seawater Temperature - Climatological Mean - Winter (January - March) - 250m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Spring - 250m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_SWTemp_250m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_WaterTemperature_Spring_250mDepth/_alllayers";
        var elementTitle = "Seawater Temperature - Climatological Mean - Spring (April - June) - 250m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Summer - 250m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_SWTemp_250m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_WaterTemperature_Summer_250mDepth/_alllayers";
        var elementTitle = "Seawater Temperature - Climatological Mean - Summer (July - September) - 250m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Fall - 250m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_SWTemp_250m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_WaterTemperature_Fall_250mDepth/_alllayers";
        var elementTitle = "Seawater Temperature - Climatological Mean - Fall (October - December) - 250m Water Depth";
        var elementTopic = "Physical";
      }
    }
    if (subplateData.indexOf("SST") != -1)  {
      if (subplateData.indexOf("Annual") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_SST_AnnualMean/_alllayers";
        var elementTitle = "Remotely Sensed Sea Surface Temperature - Annual - Average";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Winter") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_SST_JanMar_Mean/_alllayers";
        var elementTitle = "Remotely Sensed Sea Surface Temperature - Winter (January - March) - Average";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Spring") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_SST_AprJun_Mean/_alllayers";
        var elementTitle = "Remotely Sensed Sea Surface Temperature - Spring (April - June) - Average";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Summer") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_SST_JulSep_Mean/_alllayers";
        var elementTitle = "Remotely Sensed Sea Surface Temperature - Summer (July - September) - Average";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Fall") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_SST_OctDec_Mean/_alllayers";
        var elementTitle = "Remotely Sensed Sea Surface Temperature - Fall (October - December) - Average";
        var elementTopic = "Physical";
      }
    }
    if (subplateData.indexOf("Salinity") != -1)  {
      if (subplateData.indexOf("Mean") != -1)  {
        if (subplateData.indexOf("DD") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/physicalLegends/NODC_Salinity_Annual_DD.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Salinity_AnnualDD/_alllayers";
          var elementTitle = "Seawater Salinity - Annual Data Distribution";
          var elementTopic = "Physical";
        }
        if (subplateData.indexOf("Winter - 10m") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/physicalLegends/NODC_Salinity_Winter_10m.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Salinity_Winter_10mDepth/_alllayers";
          var elementTitle = "Seawater Salinity - Climatological Mean - Winter (January - March) - 10m Water Depth";
          var elementTopic = "Physical";
        }
        if (subplateData.indexOf("Spring - 10m") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/physicalLegends/NODC_Salinity_Spring_10m.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Salinity_Spring_10mDepth/_alllayers";
          var elementTitle = "Seawater Salinity - Climatological Mean - Spring (April - June) - 10m Water Depth";
          var elementTopic = "Physical";
        }
        if (subplateData.indexOf("Summer - 10m") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/physicalLegends/NODC_Salinity_Summer_10m.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Salinity_Summer_10mDepth/_alllayers";
          var elementTitle = "Seawater Salinity - Climatological Mean - Summer (July - September) - 10m Water Depth";
          var elementTopic = "Physical";
        }
        if (subplateData.indexOf("Fall - 10m") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/physicalLegends/NODC_Salinity_Fall_10m.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Salinity_Fall_10mDepth/_alllayers";
          var elementTitle = "Seawater Salinity - Climatological Mean - Fall (October - December) - 10m Water Depth";
          var elementTopic = "Physical";
        }
        if (subplateData.indexOf("Winter - 250m") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/physicalLegends/NODC_Salinity_250m.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Salinity_Winter_250mDepth/_alllayers";
          var elementTitle = "Seawater Salinity - Climatological Mean - Winter (January - March) - 250m Water Depth";
          var elementTopic = "Physical";
        }
        if (subplateData.indexOf("Spring - 250m") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/physicalLegends/NODC_Salinity_250m.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Salinity_Spring_250mDepth/_alllayers";
          var elementTitle = "Seawater Salinity - Climatological Mean - Spring (April - June) - 250m Water Depth";
          var elementTopic = "Physical";
        }
        if (subplateData.indexOf("Summer - 250m") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/physicalLegends/NODC_Salinity_250m.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Salinity_Summer_250mDepth/_alllayers";
          var elementTitle = "Seawater Salinity - Climatological Mean - Summer (July - September) - 250m Water Depth";
          var elementTopic = "Physical";
        }
        if (subplateData.indexOf("Fall - 250m") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/physicalLegends/NODC_Salinity_250m.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Salinity_Fall_250mDepth/_alllayers";
          var elementTitle = "Seawater Salinity - Climatological Mean - Fall (October - December) - 250m Water Depth";
          var elementTopic = "Physical";
        }
      }
      if (subplateData.indexOf("Zones") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/GOM_SalinityZones.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NOS_SalinityZones/_alllayers";
        var elementTitle = "Salinity Zones - Estuarine";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Seasons") != -1)  {
        if (subplateData.indexOf("High") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/physicalLegends/NOS_HighSalinitySeason.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_NOS_HighSalinitySeason/_alllayers";
          var elementTitle = "Salinity Zones - High Season - Estuarine";
          var elementTopic = "Physical";
        }
        if (subplateData.indexOf("Low") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/physicalLegends/NOS_LowSalinitySeason.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_NOS_LowSalinitySeason/_alllayers";
          var elementTitle = "Salinity Zones - Low Season - Estuarine";
          var elementTopic = "Physical";
        }
      }
    }
    if (subplateData.indexOf("Nitrates") != -1)  {
      if (subplateData.indexOf("DD") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Nitrates_Annual_DD.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Nitrates_AnnualDD/_alllayers";
        var elementTitle = "Nitrates - Annual Data Distribution";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Winter - 10m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Nitrates_Winter_10m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Nitrates_Winter_10mDepth/_alllayers";
        var elementTitle = "Nitrates - Climatological Mean - Winter (January - March) - 10m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Spring - 10m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Nitrates_Spring_10m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Nitrates_Spring_10mDepth/_alllayers";
        var elementTitle = "Nitrates - Climatological Mean - Spring (April - June) - 10m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Summer - 10m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Nitrates_Summer_10m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Nitrates_Summer_10mDepth/_alllayers";
        var elementTitle = "Nitrates - Climatological Mean - Summer (July - September) - 10m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Fall - 10m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Nitrates_Fall_10m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Nitrates_Fall_10mDepth/_alllayers";
        var elementTitle = "Nitrates - Climatological Mean - Fall (October - December) - 10m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Winter - 250m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Nitrates_250m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Nitrates_Winter_250mDepth/_alllayers";
        var elementTitle = "Nitrates - Climatological Mean - Winter (January - March) - 250m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Spring - 250m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Nitrates_250m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Nitrates_Spring_250mDepth/_alllayers";
        var elementTitle = "Nitrates - Climatological Mean - Spring (April - June) - 250m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Summer - 250m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Nitrates_250m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Nitrates_Summer_250mDepth/_alllayers";
        var elementTitle = "Nitrates - Climatological Mean - Summer (July - September) - 250m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Fall - 250m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Nitrates_250m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Nitrates_Fall_250mDepth/_alllayers";
        var elementTitle = "Nitrates - Climatological Mean - Fall (October - December) - 250m Water Depth";
        var elementTopic = "Physical";
      }
    }

    if (subplateData.indexOf("Phosphate") != -1)  {
      if (subplateData.indexOf("DD") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Phosphate_Annual_DD.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Phosphate_AnnualDD/_alllayers";
        var elementTitle = "Phosphate - Annual Data Distribution";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Winter - 10m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Phosphate_10m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Phosphate_Winter_10mDepth/_alllayers";
        var elementTitle = "Phosphate - Climatological Mean - Winter (January - March) - 10m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Spring - 10m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Phosphate_10m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Phosphate_Spring_10mDepth/_alllayers";
        var elementTitle = "Phosphate - Climatological Mean - Spring (April - June) - 10m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Summer - 10m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Phosphate_10m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Phosphate_Summer_10mDepth/_alllayers";
        var elementTitle = "Phosphate - Climatological Mean - Summer (July - September) - 10m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Fall - 10m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Phosphate_10m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Phosphate_Fall_10mDepth/_alllayers";
        var elementTitle = "Phosphate - Climatological Mean - Fall (October - December) - 10m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Winter - 250m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Phosphate_250m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Phosphate_Winter_250mDepth/_alllayers";
        var elementTitle = "Phosphate - Climatological Mean - Winter (January - March) - 250m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Spring - 250m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Phosphate_250m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Phosphate_Spring_250mDepth/_alllayers";
        var elementTitle = "Phosphate - Climatological Mean - Spring (April - June) - 250m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Summer - 250m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Phosphate_250m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Phosphate_Summer_250mDepth/_alllayers";
        var elementTitle = "Phosphate - Climatological Mean - Summer (July - September) - 250m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Fall - 250m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Phosphate_250m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Phosphate_Fall_250mDepth/_alllayers";
        var elementTitle = "Phosphate - Climatological Mean - Fall (October - December) - 250m Water Depth";
        var elementTopic = "Physical";
      }
    }
    if (subplateData.indexOf("Silicate") != -1)  {
      if (subplateData.indexOf("DD") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Silicate_Annual_DD.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Silicate_AnnualDD/_alllayers";
        var elementTitle = "Silicate - Annual Data Distribution";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Winter - 10m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Silicate_10m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Silicate_Winter_10mDepth/_alllayers";
        var elementTitle = "Silicate - Climatological Mean - Winter (January - March) - 10m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Spring - 10m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Silicate_10m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Silicate_Spring_10mDepth/_alllayers";
        var elementTitle = "Silicate - Climatological Mean - Spring (April - June) - 10m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Summer - 10m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Silicate_10m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Silicate_Summer_10mDepth/_alllayers";
        var elementTitle = "Silicate - Climatological Mean - Summer (July - September) - 10m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Fall - 10m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Silicate_10m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Silicate_Fall_10mDepth/_alllayers";
        var elementTitle = "Silicate - Climatological Mean - Fall (October - December) - 10m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Winter - 250m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Silicate_250m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Silicate_Winter_250mDepth/_alllayers";
        var elementTitle = "Silicate - Climatological Mean - Winter (January - March) - 250m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Spring - 250m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Silicate_250m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Silicate_Spring_250mDepth/_alllayers";
        var elementTitle = "Silicate - Climatological Mean - Spring (April - June) - 250m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Summer - 250m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Silicate_250m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Silicate_Summer_250mDepth/_alllayers";
        var elementTitle = "Silicate - Climatological Mean - Summer (July - September) - 250m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Fall - 250m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_Silicate_250m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_Silicate_Fall_250mDepth/_alllayers";
        var elementTitle = "Silicate - Climatological Mean - Fall (October - December) - 250m Water Depth";
        var elementTopic = "Physical";
      }
    }
    if (subplateData.indexOf("Dissolved Oxygen") != -1)  {
      if (subplateData.indexOf("DD") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_DO_Annual_DD.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_DissolvedOxygen_AnnualDD/_alllayers";
        var elementTitle = "Dissolved Oxygen - Annual Data Distribution";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Winter - 10m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_DO_10m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_DissolvedOxygen_Winter_10mDepth/_alllayers";
        var elementTitle = "Dissolved Oxygen - Climatological Mean - Winter (January - March) - 10m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Spring - 10m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_DO_10m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_DissolvedOxygen_Spring_10mDepth/_alllayers";
        var elementTitle = "Dissolved Oxygen - Climatological Mean - Spring (April - June) - 10m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Summer - 10m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_DO_10m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_DissolvedOxygen_Summer_10mDepth/_alllayers";
        var elementTitle = "Dissolved Oxygen - Climatological Mean - Summer (July - September) - 10m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Fall - 10m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_DO_10m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_DissolvedOxygen_Fall_10mDepth/_alllayers";
        var elementTitle = "Dissolved Oxygen - Climatological Mean - Fall (October - December) - 10m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Winter - 250m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_DO_250m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_DissolvedOxygen_Winter_250mDepth/_alllayers";
        var elementTitle = "Dissolved Oxygen - Climatological Mean - Winter (January - March) - 250m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Spring - 250m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_DO_250m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_DissolvedOxygen_Spring_250mDepth/_alllayers";
        var elementTitle = "Dissolved Oxygen - Climatological Mean - Spring (April - June) - 250m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Summer - 250m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_DO_250m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_DissolvedOxygen_Summer_250mDepth/_alllayers";
        var elementTitle = "Dissolved Oxygen - Climatological Mean - Summer (July - September) - 250m Water Depth";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Fall - 250m") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/NODC_DO_250m.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NODC_DissolvedOxygen_Fall_250mDepth/_alllayers";
        var elementTitle = "Dissolved Oxygen - Climatological Mean - Fall (October - December) - 250m Water Depth";
        var elementTopic = "Physical";
      }
    }
    if (subplateData.indexOf("Hypoxia") != -1)  {
      if (subplateData.indexOf("Frequency") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/SEAMAP_HypoxiaAnalysis_2001-2011.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Hypoxia_2001-2011/_alllayers";
        var elementTitle = "Dissolved Oxygen - Frequency of Hypoxia - 2001 to 2011";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Sites") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/SEAMAP_Hypoxia_Sites_2001-2011.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Sites_2001-2011/_alllayers";
        var elementTitle = "Dissolved Oxygen - Hypoxia - SEAMAP Sampling Sites - 2001 to 2011";
        var elementTopic = "Physical";
      }
    }
    if (subplateData.indexOf("Precipitation") != -1)  {
      if (subplateData.indexOf("IQRAnnual") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/legend_iqr_annual.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PERSIANN_PrecipRange_Annual/_alllayers";
        var elementTitle = "Annual Precipitation Range";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("IQRFall") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/legend_iqr_fall.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PERSIANN_PrecipRange_Fall/_alllayers";
        var elementTitle = "Precipitation Range - Fall (September-November)";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("IQRSpring") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/legend_iqr_spring.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PERSIANN_PrecipRange_Spring/_alllayers";
        var elementTitle = "Precipitation Range - Spring (March-May)";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("IQRSummer") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/legend_iqr_summer.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PERSIANN_PrecipRange_Summer/_alllayers";
        var elementTitle = "Precipitation Range - Summer (June-August)";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("IQRWinter") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/legend_iqr_winter.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PERSIANN_PrecipRange_Winter/_alllayers";
        var elementTitle = "Precipitation Range - Winter (December-February)";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("MEDAnnual") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/legend_med_annual.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PERSIANN_MedianPrecip_Annual/_alllayers";
        var elementTitle = "Median Annual Precipitation";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("MEDSpring") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/legend_med_spring.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PERSIANN_MedianPrecip_Spring/_alllayers";
        var elementTitle = "Median Precipitation - Spring (March-May)";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("MEDWinter") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/legend_med_winter.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PERSIANN_MedianPrecip_Winter/_alllayers";
        var elementTitle = "Median Precipitation - Winter (December-February)";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("MEDSummer") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/legend_med_summer.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PERSIANN_MedianPrecip_Summer/_alllayers";
        var elementTitle = "Median Precipitation - Summer (June-August)";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("MEDFall") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/legend_med_fall.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PERSIANN_MedianPrecip_Fall/_alllayers";
        var elementTitle = "Median Precipitation - Fall (September-November)";
        var elementTopic = "Physical";
      }
    }  
    if (subplateData.indexOf("Prevailing Winds") != -1)  {
      if (subplateData.indexOf("Spring") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCDC_SeaWinds_Spring/_alllayers";
        var elementTitle = "Prevailing Winds - Climatological Average (1991 to 2010) - Spring (March - May)";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Summer") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCDC_SeaWinds_Summer/_alllayers";
        var elementTitle = "Prevailing Winds - Climatological Average (1991 to 2010) - Summer (June - August)";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Fall") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCDC_SeaWinds_Fall/_alllayers";
        var elementTitle = "Prevailing Winds - Climatological Average (1991 to 2010) - Fall (September - November)";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Winter") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCDC_SeaWinds_Winter/_alllayers";
        var elementTitle = "Prevailing Winds - Climatological Average (1991 to 2010) - Winter (December - February)";
        var elementTopic = "Physical";
      }
    }  
    if (subplateData.indexOf("Bottom Sediments - Dominant") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/usSEABED_DominantSediments.png'/>";
      legend.innerHTML = imgTag;
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_usSEABED_DominantSediments/_alllayers";
      var elementTitle = "Bottom Sediments - Dominant Bottom Types and Habitats";
      var elementTopic = "Physical";
    }
    if (subplateData.indexOf("Bottom Sediments - Loose") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/usSEABED_LooseSediments.png'/>";
      legend.innerHTML = imgTag;
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_usSEABED_LooseSediments/_alllayers";
      var elementTitle = "Bottom Sediments - Seabed Sediment Folk Codes";
      var elementTopic = "Physical";
    }
    if (subplateData.indexOf("Bottom Sediments - Mud") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/usSEABED_Properties_Mud.png'/>";
      legend.innerHTML = imgTag;
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_usSEABED_Mud/_alllayers";
      var elementTitle = "Bottom Sediments - Sedbed Physical Properties - Mud";
      var elementTopic = "Physical";
    }
    if (subplateData.indexOf("Bottom Sediments - Sand") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/usSEABED_Properties_Sand.png'/>";
      legend.innerHTML = imgTag;
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_usSEABED_Sand/_alllayers";
      var elementTitle = "Bottom Sediments - Seabed Physical Properties - Sand";
      var elementTopic = "Physical";
    }
    if (subplateData.indexOf("Bottom Sediments - Gravel") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/usSEABED_Properties_Gravel.png'/>";
      legend.innerHTML = imgTag;
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_usSEABED_Gravel/_alllayers";
      var elementTitle = "Bottom Sediments - Seabed Physical Properties - Gravel";
      var elementTopic = "Physical";
    }
    if (subplateData.indexOf("Bottom Sediments - Rock") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/usSEABED_Properties_Rock.png'/>";
      legend.innerHTML = imgTag;
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_usSEABED_Rock/_alllayers";
      var elementTitle = "Bottom Sediments - Seabed Physical Properties - Rock";
      var elementTopic = "Physical";
    }
    if (subplateData.indexOf("Geomorphology") != -1)  {
      if (subplateData.indexOf("Class") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/GeomorphClass.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_BlueHabitats_Geomorphology_Class/_alllayers";
        var elementTitle = "Gulf of Mexico Continental Shelf and Abyssal Classifications";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Features") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/GeomorphFeature.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_BlueHabitats_Geomorphology_Features/_alllayers";
        var elementTitle = "Gulf of Mexico Geomorphic Features";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Base") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/GeomorphBase.png'/>";
        legend.innerHTML = imgTag;        
	var elementURL = serviceURL + "/arcgiscache/DataAtlas_BlueHabitats_Geomorphology_Base/_alllayers";
        var elementTitle = "Gulf of Mexico Geomorphic Base Layers";
        var elementTopic = "Physical";
      }
    }
    if (subplateData.indexOf("Hurricanes") != -1)  {
      if (subplateData.indexOf("Tracks") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/TropicalStormTracks.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_HurricaneTracks/_alllayers";
        var elementTitle = "Storm Tracks by Categories - 1851 to 2012";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Frequency") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/TropicalStormFrequency.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_HurricaneGrid_Frequency/_alllayers";
        var elementTitle = "Storm Frequency - 1851 to 2012";
        var elementTopic = "Physical";
      }
      if (subplateData.indexOf("Intensity") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/physicalLegends/TropicalStormIntensity.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_HurricaneGrid_Intensity/_alllayers";
        var elementTitle = "Maximum Storm Intensity - 1851 to 2012";
        var elementTopic = "Physical";
      }
    }

    // add biotic subplate data to the map 
    if (subplateData.indexOf("CCAP - 2010") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_CCAP_2010/_alllayers";
      var elementTitle = "Coastal Change Analysis Program - 2010";
      var elementTopic = "Biotic";
    }
    if (subplateData.indexOf("CCAP - 2006") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_CCAP_2006/_alllayers";
      var elementTitle = "Coastal Change Analysis Program - 2006";
      var elementTopic = "Biotic";
    }
    if (subplateData.indexOf("CCAP - 2001") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_CCAP_2001/_alllayers";
      var elementTitle = "Coastal Change Analysis Program - 2001";
      var elementTopic = "Biotic";
    }
    if (subplateData.indexOf("CCAP - 1996") != -1)  {
      var elementURL = serviceURL + "/arcgiscache/DataAtlas_CCAP_1996/_alllayers";
      var elementTitle = "Coastal Change Analysis Program - 1996";
      var elementTopic = "Biotic";
    }
    if (subplateData.indexOf("MBCC and Habitat") != -1)  {
      if (subplateData.indexOf("- LCLU 1948") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/bioticLegends/MBCC_Habitat_LCLU_1948.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_LCLU_1948/_alllayers";
        var elementTitle = "Mobile Bay - Land Cover Land Use - 1948";
        var elementTopic = "Biotic";
      }
      if (subplateData.indexOf("- LCLU 1992") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/bioticLegends/MBCC_Habitat_LCLU_1992-2030.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_LCLU_1992/_alllayers";
        var elementTitle = "Mobile Bay - Land Cover Land Use - 1992";
        var elementTopic = "Biotic";
      }
      if (subplateData.indexOf("- LCLU 2001") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/bioticLegends/MBCC_Habitat_LCLU_1992-2030.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_LCLU_2001/_alllayers";
        var elementTitle = "Mobile Bay - Land Cover Land Use - 2001";
        var elementTopic = "Biotic";
      }
      if (subplateData.indexOf("- LCLU 2030") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/bioticLegends/MBCC_Habitat_LCLU_1992-2030.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_LCLU_2030/_alllayers";
        var elementTitle = "Mobile Bay - Land Cover Land Use - 2030";
        var elementTopic = "Biotic";
      }
      if (subplateData.indexOf("- CC2005") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/bioticLegends/MBCC_Habitat_PredictedHabitat.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PredictedHabitat_CC2005/_alllayers";
        var elementTitle = "Mobile Bay - Habitat Suitability for Climate Change Scenario (no SAV) - 2005";
        var elementTopic = "Biotic";
      }
      if (subplateData.indexOf("- CC2025") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/bioticLegends/MBCC_Habitat_PredictedHabitat.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PredictedHabitat_CC2025/_alllayers";
        var elementTitle = "Mobile Bay - Habitat Suitability for Climate Change Scenario (no SAV) - 2025";
        var elementTopic = "Biotic";
      } 
      if (subplateData.indexOf("- CC2050") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/bioticLegends/MBCC_Habitat_PredictedHabitat.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PredictedHabitat_CC2050/_alllayers";
        var elementTitle = "Mobile Bay - Habitat Suitability for Climate Change Scenario (no SAV) - 2050";
        var elementTopic = "Biotic";
      }
      if (subplateData.indexOf("SAV_CC2005") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/bioticLegends/MBCC_Habitat_PredictedHabitat_SAV.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PredictedHabitat_SAV_CC_2005/_alllayers";
        var elementTitle = "Mobile Bay - Habitat Suitability for Climate Change Scenario with SAV - 2005";
        var elementTopic = "Biotic";
      }
      if (subplateData.indexOf("SAV_CC2025") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/bioticLegends/MBCC_Habitat_PredictedHabitat_SAV.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PredictedHabitat_SAV_CC_2025/_alllayers";
        var elementTitle = "Mobile Bay - Habitat Suitability for Climate Change Scenario with SAV - 2025";
        var elementTopic = "Biotic";
      }
      if (subplateData.indexOf("SAV_CC2050") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/bioticLegends/MBCC_Habitat_PredictedHabitat_SAV.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PredictedHabitat_SAV_CC_2050/_alllayers";
        var elementTitle = "Mobile Bay - Habitat Suitability for Climate Change Scenario with SAV - 2050";
        var elementTopic = "Biotic";
      }
      if (subplateData.indexOf("- LU1948") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/bioticLegends/MBCC_Habitat_PredictedHabitat.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PredictedHabitat_LU1948/_alllayers";
        var elementTitle = "Mobile Bay - Habitat Suitability for LCLU Scenario (no SAV) - 1948";
        var elementTopic = "Biotic";
      }  
      if (subplateData.indexOf("- LU1992") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/bioticLegends/MBCC_Habitat_PredictedHabitat.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PredictedHabitat_LU1992/_alllayers";
        var elementTitle = "Mobile Bay - Habitat Suitability for LCLU Scenario (no SAV) - 1992";
        var elementTopic = "Biotic";
      } 
      if (subplateData.indexOf("- LU2001") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/bioticLegends/MBCC_Habitat_PredictedHabitat.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PredictedHabitat_LU2001/_alllayers";
        var elementTitle = "Mobile Bay - Habitat Suitability for LCLU Scenario (no SAV) - 2001";
        var elementTopic = "Biotic";
      }      
      if (subplateData.indexOf("- LU2030") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/bioticLegends/MBCC_Habitat_PredictedHabitat.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PredictedHabitat_LU2030/_alllayers";
        var elementTitle = "Mobile Bay - Habitat Suitability for LCLU Scenario (no SAV) - 2030";
        var elementTopic = "Biotic";
      }
      if (subplateData.indexOf("SAV_LU1948") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/bioticLegends/MBCC_Habitat_PredictedHabitat_SAV.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PredictedHabitat_SAV_LU_1948/_alllayers";
        var elementTitle = "Mobile Bay - Habitat Suitability for LCLU Scenario with SAV - 1948";
        var elementTopic = "Biotic";
      }
      if (subplateData.indexOf("SAV_LU2001") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/bioticLegends/MBCC_Habitat_PredictedHabitat_SAV.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PredictedHabitat_SAV_LU_2001/_alllayers";
        var elementTitle = "Mobile Bay - Habitat Suitability for LCLU Scenario with SAV - 2001";
        var elementTopic = "Biotic";
      }
      if (subplateData.indexOf("SAV_LU2030") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/bioticLegends/MBCC_Habitat_PredictedHabitat_SAV.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_PredictedHabitat_SAV_LU_2030/_alllayers";
        var elementTitle = "Mobile Bay - Habitat Suitability for LCLU Scenario with SAV - 2030";
        var elementTopic = "Biotic";
      }
    }
    if (subplateData.indexOf("Mangroves") != -1)  {
      if (subplateData.indexOf("Florida") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/bioticLegends/Mangroves_Florida.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_Mangroves_byYears/_alllayers";
        var elementTitle = "Mangrove Communities - Florida";
        var elementTopic = "Biotic";
        map.zoomToExtent(new OpenLayers.Bounds(-9665533,2780742,-8601529,3502307));
        var textLinkURL = "/website/DataAtlas/plateDetails/bioticPlates/MangrovesByState/MangroveCommunities_Florida.htm";
        openGraphicPortrait(textLinkURL);
      }
      if (subplateData.indexOf("Texas") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/bioticLegends/Mangroves.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_Mangroves_GOM/_alllayers";
        var elementTitle = "Mangrove Communities - Texas";
        var elementTopic = "Biotic";
        map.zoomToExtent(new OpenLayers.Bounds(-11112333,2940954,-10579720,3301125));
        var textLinkURL = "/website/DataAtlas/plateDetails/bioticPlates/MangrovesByState/MangroveCommunities_Texas.htm";
        openGraphicPortrait(textLinkURL);
      }
      if (subplateData.indexOf("Mexico") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/bioticLegends/Mangroves.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_Mangroves_GOM/_alllayers";
        var elementTitle = "Mangrove Communities - Mexico";
        var elementTopic = "Biotic";
        map.zoomToExtent(new OpenLayers.Bounds(-11249920,1414659,-9109683,2865128));
        var textLinkURL = "/website/DataAtlas/plateDetails/bioticPlates/MangrovesByState/MangroveCommunities_Mexico.htm";
        openGraphicPortrait(textLinkURL);
      }
      if (subplateData.indexOf("GOM") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/bioticLegends/Mangroves.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_Mangroves_GOM/_alllayers";
        var elementTitle = "Mangrove Communities - US and Mexico";
        var elementTopic = "Biotic";
        map.zoomToExtent(new OpenLayers.Bounds(-11077478.10883,2218165.88923,-8932349.34703,3653959.02853));
      }
    }
    if (subplateData.indexOf("Suitable Coral Habitat") != -1)  {
      if (subplateData.indexOf("All") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCCOS_CoralHabitat_AllFrameworkFormingCorals/_alllayers";
        var elementTitle = "Deep-Sea Corals - Suitable Habitat - All Framework-Forming Corals";
        var elementTopic = "Biotic";
      }
      if (subplateData.indexOf("Black Corals") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCCOS_CoralHabitat_BlackCorals/_alllayers";
        var elementTitle = "Deep-Sea Corals - Suitable Habitat - Black Corals (Antipatharia)";
        var elementTopic = "Biotic";
      }
      if (subplateData.indexOf("Gorgonians") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCCOS_CoralHabitat_Gorgonians/_alllayers";
        var elementTitle = "Deep-Sea Corals - Suitable Habitat - Gorgonian Alcyonacea";
        var elementTopic = "Biotic";
      }
      if (subplateData.indexOf("Lophelia") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCCOS_CoralHabitat_LopheliaCorals/_alllayers";
        var elementTitle = "Deep-Sea Corals - Suitable Habitat - Lophelia pertusa";
        var elementTopic = "Biotic";
      }
      if (subplateData.indexOf("Scleractinia") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCCOS_CoralHabitat_AllFrameworkFormingStonyCorals/_alllayers";
        var elementTitle = "Deep-Sea Corals - Suitable Habitat - All Framework-Forming Stony Corals";
        var elementTopic = "Biotic";
      }
    }

    // add living marine resource subplate data to the map
    if (subplateData.indexOf("Oysters") != -1)  {
      if (subplateData.indexOf("Alabama") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/StatesOysters.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_Oysters_GOM/_alllayers";
        var elementTitle = "Invertebrates - Eastern Oyster - Alabama";
        var elementTopic = "LivingMarineResources";
        map.zoomToExtent(new OpenLayers.Bounds(-9927559,3460420,-9660641,3641729));
        if (subplateData.indexOf("HTML") != -1)  {
          var textLinkURL = "/website/DataAtlas/plateDetails/lmrPlates/EasternOystersByState/AL_oysters.htm";
        }
        else  {
          var textLinkURL = "/website/DataAtlas/plateDetails/lmrPlates/EasternOystersByState/EasternOyster_AL/index.html";
        }
        openGraphicPortrait(textLinkURL);
      }
      if (subplateData.indexOf("Florida") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/StatesOysters.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_Oysters_GOM/_alllayers";
        var elementTitle = "Invertebrates - Eastern Oyster - Florida";
        var elementTopic = "LivingMarineResources";
        map.zoomToExtent(new OpenLayers.Bounds(-9743805,2863600,-8674909,3588835));
        if (subplateData.indexOf("HTML") != -1)  {
          var textLinkURL = "/website/DataAtlas/plateDetails/lmrPlates/EasternOystersByState/FL_oysters.htm";
        }
        else  {
          var textLinkURL = "/website/DataAtlas/plateDetails/lmrPlates/EasternOystersByState/EasternOyster_FL/index.html";
        }
        openGraphicPortrait(textLinkURL);
      }
      if (subplateData.indexOf("Louisiana") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/StatesOysters.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_Oysters_GOM/_alllayers";
        var elementTitle = "Invertebrates - Eastern Oyster - Louisiana";
        var elementTopic = "LivingMarineResources";
        map.zoomToExtent(new OpenLayers.Bounds(-10458032,3292664,-9923585,3653347));
        if (subplateData.indexOf("HTML") != -1)  {
          var textLinkURL = "/website/DataAtlas/plateDetails/lmrPlates/EasternOystersByState/LA_oysters.htm";
        }
        else  {
          var textLinkURL = "/website/DataAtlas/plateDetails/lmrPlates/EasternOystersByState/EasternOyster_LA/index.html";
        }
        openGraphicPortrait(textLinkURL);
      }
      if (subplateData.indexOf("Mississippi") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/StatesOysters.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_Oysters_GOM/_alllayers";
        var elementTitle = "Invertebrates - Eastern Oyster - Mississippi";
        var elementTopic = "LivingMarineResources";
        map.zoomToExtent(new OpenLayers.Bounds(-10008124,3493135,-9874665,3583484));
        if (subplateData.indexOf("HTML") != -1)  {
          var textLinkURL = "/website/DataAtlas/plateDetails/lmrPlates/EasternOystersByState/MS_oysters.htm";
        }
        else  {
          var textLinkURL = "/website/DataAtlas/plateDetails/lmrPlates/EasternOystersByState/EasternOyster_MS/index.html";
        }
        openGraphicPortrait(textLinkURL);
      }
      if (subplateData.indexOf("Texas") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/StatesOysters.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_Oysters_GOM/_alllayers";
        var elementTitle = "Invertebrates - Eastern Oyster - Texas";
        var elementTopic = "LivingMarineResources";
        map.zoomToExtent(new OpenLayers.Bounds(-11241665,2938355,-10172769,3663590));
        if (subplateData.indexOf("HTML") != -1)  {
          var textLinkURL = "/website/DataAtlas/plateDetails/lmrPlates/EasternOystersByState/TX_oysters.htm";
        }
        else  {
          var textLinkURL = "/website/DataAtlas/plateDetails/lmrPlates/EasternOystersByState/EasternOyster_TX/index.html";
        }
        openGraphicPortrait(textLinkURL);
      }
    }
    if (subplateData.indexOf("Brown Shrimp") != -1)  {
      if (subplateData.indexOf("Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/Shrimp_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BrownShrimp_Abundance/_alllayers";
        var elementTitle = "Brown Shrimp - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/Shrimp_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Effort/_alllayers";
        var elementTitle = "Brown Shrimp - Sampling Effort - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Stations") != -1 )  {
        if (subplateData.indexOf("Both") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/SEAMAP-CAGES_TrawlSites.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP-CAGES_Trawl_Stations/_alllayers";
          var elementTitle = "Brown Shrimp - Trawl Stations (State and Federal) - Fisheries-Independent";
          var elementTopic = "LivingMarineResources";
        }
        if (subplateData.indexOf("Federal") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/Shrimp_Trawl_Stations.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Stations/_alllayers";
          var elementTitle = "Brown Shrimp - Trawl Stations - Fisheries-Independent (Federal)";
          var elementTopic = "LivingMarineResources";
        }
        if (subplateData.indexOf("State") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/CAGES_Occurrence.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CAGES_BrownShrimp_Occurrence/_alllayers";
          var elementTitle = "Brown Shrimp - Occurrence/No Occurrence Based on Trawls - Fisheries-Independent (State)";
          var elementTopic = "LivingMarineResources";
        }
      }
      if (subplateData.indexOf("MeanCPUE") != -1 )  {
        if (subplateData.indexOf("Locations") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/CAGES_MeanCPUE_Location.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CAGES_BrownShrimp_MeanCPUE_Stations_2000-2007/_alllayers";
          var elementTitle = "Brown Shrimp - Mean Catch per Unit Effort (CPUE) by Locations - Fisheries-Independent (State)";
          var elementTopic = "LivingMarineResources";
        }
        if (subplateData.indexOf("Water Body") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/CAGES_MeanCPUE_WaterBody.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CAGES_BrownShrimp_MeanCPUE_ByWaterBody/_alllayers";
          var elementTitle = "Brown Shrimp - Mean Catch per Unit Effort (CPUE) by Water Bodies - Fisheries-Independent (State)";
          var elementTopic = "LivingMarineResources";
        }
      }
      if (subplateData.indexOf("Commercial Catch") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/BrownShrimp_CommercialCatch.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_FisheriesDependent_BrownShrimp_2002-2011/_alllayers";
        var elementTitle = "Brown Shrimp - Commercial Catch (2002-2011) - Fisheries-Dependent";
        var elementTopic = "LivingMarineResources";
      }
    }
    if (subplateData.indexOf("Pink Shrimp") != -1)  {
      if (subplateData.indexOf("Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/Shrimp_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_PinkShrimp_Abundance/_alllayers";
        var elementTitle = "Pink Shrimp - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/Shrimp_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Effort/_alllayers";
        var elementTitle = "Pink Shrimp - Sampling Effort - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Stations") != -1 )  {
        if (subplateData.indexOf("Both") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/SEAMAP-CAGES_TrawlSites.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP-CAGES_Trawl_Stations/_alllayers";
          var elementTitle = "Pink Shrimp - Trawl Stations (State and Federal) - Fisheries-Independent";
          var elementTopic = "LivingMarineResources";
        }
        if (subplateData.indexOf("Federal") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/Shrimp_Trawl_Stations.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Stations/_alllayers";
          var elementTitle = "Pink Shrimp - Trawl Stations - Fisheries-Independent (Federal)";
          var elementTopic = "LivingMarineResources";
        }
        if (subplateData.indexOf("State") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/CAGES_Occurrence.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CAGES_PinkShrimp_Occurrence/_alllayers";
          var elementTitle = "Pink Shrimp - Occurrence/No Occurrence Based on Trawls - Fisheries-Independent (State)";
          var elementTopic = "LivingMarineResources";
        }
      }
      if (subplateData.indexOf("MeanCPUE") != -1 )  {
        if (subplateData.indexOf("Locations") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/CAGES_MeanCPUE_Location.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CAGES_PinkShrimp_MeanCPUE_Stations_2000-2007/_alllayers";
          var elementTitle = "Pink Shrimp - Mean Catch per Unit Effort (CPUE) by Locations - Fisheries-Independent (State)";
          var elementTopic = "LivingMarineResources";
        }
        if (subplateData.indexOf("Water Body") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/CAGES_MeanCPUE_WaterBody.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CAGES_PinkShrimp_MeanCPUE_ByWaterBody/_alllayers";
          var elementTitle = "Pink Shrimp - Mean Catch per Unit Effort (CPUE) by Water Bodies - Fisheries-Independent (State)";
          var elementTopic = "LivingMarineResources";
        }
      }
      if (subplateData.indexOf("Commercial Catch") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/PinkShrimp_CommercialCatch.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_FisheriesDependent_PinkShrimp_2002-2011/_alllayers";
        var elementTitle = "Pink Shrimp - Commercial Catch (2002-2011) - Fisheries-Dependent";
        var elementTopic = "LivingMarineResources";
      }
    }
    if (subplateData.indexOf("White Shrimp") != -1)  {
      if (subplateData.indexOf("Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/Shrimp_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_WhiteShrimp_Abundance/_alllayers";
        var elementTitle = "White Shrimp - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/Shrimp_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Effort/_alllayers";
        var elementTitle = "White Shrimp - Sampling Effort - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Stations") != -1 )  {
        if (subplateData.indexOf("Both") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/SEAMAP-CAGES_TrawlSites.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP-CAGES_Trawl_Stations/_alllayers";
          var elementTitle = "White Shrimp - Trawl Stations (State and Federal) - Fisheries-Independent";
          var elementTopic = "LivingMarineResources";
        }
        if (subplateData.indexOf("Federal") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/Shrimp_Trawl_Stations.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Stations/_alllayers";
          var elementTitle = "White Shrimp - Trawl Stations - Fisheries-Independent (Federal)";
          var elementTopic = "LivingMarineResources";
        }
        if (subplateData.indexOf("State") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/CAGES_Occurrence.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CAGES_WhiteShrimp_Occurrence/_alllayers";
          var elementTitle = "White Shrimp - Occurrence/No Occurrence Based on Trawls - Fisheries-Independent (State)";
          var elementTopic = "LivingMarineResources";
        }
      }
      if (subplateData.indexOf("MeanCPUE") != -1 )  {
        if (subplateData.indexOf("Locations") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/CAGES_MeanCPUE_Location.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CAGES_WhiteShrimp_MeanCPUE_Stations_2000-2007/_alllayers";
          var elementTitle = "White Shrimp - Mean Catch per Unit Effort (CPUE) by Locations - Fisheries-Independent (State)";
          var elementTopic = "LivingMarineResources";
        }
        if (subplateData.indexOf("Water Body") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/CAGES_MeanCPUE_WaterBody.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CAGES_WhiteShrimp_MeanCPUE_ByWaterBody/_alllayers";
          var elementTitle = "White Shrimp - Mean Catch per Unit Effort (CPUE) by Water Bodies - Fisheries-Independent (State)";
          var elementTopic = "LivingMarineResources";
        }
      }
      if (subplateData.indexOf("Commercial Catch") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/WhiteShrimp_CommercialCatch.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_FisheriesDependent_WhiteShrimp_2002-2011/_alllayers";
        var elementTitle = "White Shrimp - Commercial Catch (2002-2011) - Fisheries-Dependent";
        var elementTopic = "LivingMarineResources";
      }
    }
    if (subplateData.indexOf("Atlantic Croaker") != -1)  {
      if (subplateData.indexOf("Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/AtlanticCroaker_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_AtlanticCroaker_Abundance/_alllayers";
        var elementTitle = "Atlantic Croaker - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/Shrimp_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Effort/_alllayers";
        var elementTitle = "Atlantic Croaker - Sampling Effort - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Stations") != -1 )  {
        if (subplateData.indexOf("Both") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/SEAMAP-CAGES_TrawlSites.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP-CAGES_Trawl_Stations/_alllayers";
          var elementTitle = "Atlantic Croaker - Trawl Stations (State and Federal) - Fisheries-Independent";
          var elementTopic = "LivingMarineResources";
        }
        if (subplateData.indexOf("Federal") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/Shrimp_Trawl_Stations.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Stations/_alllayers";
          var elementTitle = "Atlantic Croaker - Trawl Stations - Fisheries-Independent (Federal)";
          var elementTopic = "LivingMarineResources";
        }
        if (subplateData.indexOf("State") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/CAGES_Occurrence.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CAGES_AtlanticCroaker_Occurrence/_alllayers";
          var elementTitle = "Atlantic Croaker - Occurrence/No Occurrence Based on Trawls - Fisheries-Independent (State)";
          var elementTopic = "LivingMarineResources";
        }
      }
      if (subplateData.indexOf("MeanCPUE") != -1 )  {
        if (subplateData.indexOf("Locations") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/CAGES_MeanCPUE_Location.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CAGES_AtlanticCroaker_MeanCPUE_Stations_2000-2007/_alllayers";
          var elementTitle = "Atlantic Croaker - Mean Catch per Unit Effort (CPUE) by Locations - Fisheries-Independent (State)";
          var elementTopic = "LivingMarineResources";
        }
        if (subplateData.indexOf("Water Body") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/CAGES_MeanCPUE_WaterBody.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CAGES_AtlanticCroaker_MeanCPUE_ByWaterBody/_alllayers";
          var elementTitle = "Atlantic Croaker - Mean Catch per Unit Effort (CPUE) by Water Bodies - Fisheries-Independent (State)";
          var elementTopic = "LivingMarineResources";
        }
      }
    }
    if (subplateData.indexOf("Gag Grouper") != -1)  {
      if (subplateData.indexOf("Occurrence") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/GagGrouper_Occurrence.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_GagGrouper_Occurrence/_alllayers";
        var elementTitle = "Gag Grouper - Occurrence/No Occurrence - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Reef Fish - Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/ReefFish_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_ReefFish_GagGrouper_Abundance/_alllayers";
        var elementTitle = "Gag Grouper - Adult Relative Abundance - Reef Fish Surveys - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Reef Fish - Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/ReefFish_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_ReefFish_Effort/_alllayers";
        var elementTitle = "Gag Grouper - Adult Sampling Effort - Reef Fish Surveys - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Reef Fish - Stations") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/ReefFish_Stations.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_ReefFish_Stations/_alllayers";
        var elementTitle = "Gag Grouper - Reef Fish Stations - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Longline - Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/BottomLongline_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_GagGrouper_Abundance/_alllayers";
        var elementTitle = "Gag Grouper - Adult Relative Abundance - Bottom Longline Surveys - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Longline - Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/BottomLongline_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_Effort/_alllayers";
        var elementTitle = "Gag Grouper - Adult Sampling Effort - Bottom Longline Surveys - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Longline - Stations") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/BottomLongline_Stations.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_Stations/_alllayers";
        var elementTitle = "Gag Grouper - Bottom Longline Stations - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
    }
    if (subplateData.indexOf("Gray Triggerfish") != -1)  {
      if (subplateData.indexOf("Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/GrayTriggerfish_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_GrayTriggerfish_Abundance/_alllayers";
        var elementTitle = "Gray Triggerfish - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/Shrimp_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Effort/_alllayers";
        var elementTitle = "Gray Triggerfish - Sampling Effort - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Stations") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/Shrimp_Trawl_Stations.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Stations/_alllayers";
        var elementTitle = "Gray Triggerfish - Trawl Stations - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
    }
    if (subplateData.indexOf("Gulf Butterfish") != -1)  {
      if (subplateData.indexOf("Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/GulfButterfish_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_GulfButterfish_Abundance/_alllayers";
        var elementTitle = "Gulf Butterfish - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/Shrimp_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Effort/_alllayers";
        var elementTitle = "Gulf Butterfish - Sampling Effort - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Stations") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/Shrimp_Trawl_Stations.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Stations/_alllayers";
        var elementTitle = "Gulf Butterfish - Trawl Stations - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
    }
    if (subplateData.indexOf("King Mackerel") != -1)  {
      if (subplateData.indexOf("Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/KingMackerel_Larval_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_FallPlankton_KingMackerel_Abundance/_alllayers";
        var elementTitle = "King Mackerel - Larval Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/FallPlankton_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_FallPlankton_Effort/_alllayers";
        var elementTitle = "King Mackerel - Larval Sampling Effort - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Stations") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/FallPlankton_Stations.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_FallPlankton_Stations/_alllayers";
        var elementTitle = "King Mackerel - Fall Plankton Stations - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
    }
    if (subplateData.indexOf("Lane Snapper") != -1)  {
      if (subplateData.indexOf("Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/LaneSnapper_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_LaneSnapper_Abundance/_alllayers";
        var elementTitle = "Lane Snapper - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/Shrimp_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Effort/_alllayers";
        var elementTitle = "Lane Snapper - Sampling Effort - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Stations") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/Shrimp_Trawl_Stations.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Stations/_alllayers";
        var elementTitle = "Lane Snapper - Trawl Stations - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
    }
    if (subplateData.indexOf("Red Grouper") != -1)  {
      if (subplateData.indexOf("Occurrence") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/RedGrouper_Occurrence.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_RedGrouper_Occurrence/_alllayers";
        var elementTitle = "Red Grouper - Occurrence/No Occurrence - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Reef Fish - Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/ReefFish_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_ReefFish_RedGrouper_Abundance/_alllayers";
        var elementTitle = "Red Grouper - Adult Relative Abundance - Reef Fish Surveys - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Reef Fish - Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/ReefFish_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_ReefFish_Effort/_alllayers";
        var elementTitle = "Red Grouper - Adult Sampling Effort - Reef Fish Surveys - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Reef Fish - Stations") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/ReefFish_Stations.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_ReefFish_Stations/_alllayers";
        var elementTitle = "Red Grouper - Reef Fish Stations - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Longline - Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/BottomLongline_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_RedGrouper_Abundance/_alllayers";
        var elementTitle = "Red Grouper - Adult Relative Abundance - Bottom Longline Surveys - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Longline - Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/BottomLongline_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_Effort/_alllayers";
        var elementTitle = "Red Grouper - Adult Sampling Effort - Bottom Longline Surveys - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Longline - Stations") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/BottomLongline_Stations.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_Stations/_alllayers";
        var elementTitle = "Red Grouper - Bottom Longline Stations - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Hot Spot") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/FisheriesDependent_CommercialCatch_HotSpotAnalysis.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_FisheriesDependent_RedGrouper_2007_2013/_alllayers";
        var elementTitle = "Red Grouper - Commercial Catch - Fisheries-Dependent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
    }
    if (subplateData.indexOf("Red Snapper") != -1)  {
      if (subplateData.indexOf("Occurrence") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/RedSnapper_Occurrence.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_RedSnapper_Occurrence/_alllayers";
        var elementTitle = "Red Snapper - Occurrence/No Occurrence - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Larval - Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/RedSnapper_Larval_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_FallPlankton_RedSnapper_Abundance/_alllayers";
        var elementTitle = "Red Snapper - Larval Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Larval - Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/FallPlankton_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_FallPlankton_Effort/_alllayers";
        var elementTitle = "Red Snapper - Larval Sampling Effort - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Larval - Stations") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/FallPlankton_Stations.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_FallPlankton_Stations/_alllayers";
        var elementTitle = "Red Snapper - Fall Plankton Stations - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Juvenile - Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/RedSnapper_Juvenile_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_RedSnapper_Abundance/_alllayers";
        var elementTitle = "Red Snapper - Juvenile Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Juvenile - Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/Juvenile_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Effort/_alllayers";
        var elementTitle = "Red Snapper - Juvenile Sampling Effort - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Juvenile - Stations") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/Trawl_Stations.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Stations/_alllayers";
        var elementTitle = "Red Snapper - Trawl Stations - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Reef Fish - Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/ReefFish_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_ReefFish_RedSnapper_Abundance/_alllayers";
        var elementTitle = "Red Snapper - Adult Relative Abundance - Reef Fish Surveys - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Reef Fish - Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/ReefFish_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_ReefFish_Effort/_alllayers";
        var elementTitle = "Red Snapper - Adult Sampling Effort - Reef Fish Surveys - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Reef Fish - Stations") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/ReefFish_Stations.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_ReefFish_Stations/_alllayers";
        var elementTitle = "Red Snapper - Reef Fish Stations - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Longline - Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/BottomLongline_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_RedSnapper_Abundance/_alllayers";
        var elementTitle = "Red Snapper - Adult Relative Abundance - Bottom Longline Surveys - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Longline - Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/BottomLongline_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_Effort/_alllayers";
        var elementTitle = "Red Snapper - Adult Sampling Effort - Bottom Longline Surveys - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Longline - Stations") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/BottomLongline_Stations.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_Stations/_alllayers";
        var elementTitle = "Red Snapper - Bottom Longline Stations - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Hot Spot") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/FisheriesDependent_CommercialCatch_HotSpotAnalysis.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_FisheriesDependent_RedSnapper_2007_2013/_alllayers";
        var elementTitle = "Red Snapper - Commercial Catch - Fisheries-Dependent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
    }
    if (subplateData.indexOf("Sand Seatrout") != -1)  {
      if (subplateData.indexOf("Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/SandSeatrout_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_SandSeatrout_Abundance/_alllayers";
        var elementTitle = "Sand Seatrout - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/Shrimp_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Effort/_alllayers";
        var elementTitle = "Sand Seatrout - Sampling Effort - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Stations") != -1 )  {
        if (subplateData.indexOf("Both") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/SEAMAP-CAGES_TrawlSites.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP-CAGES_Trawl_Stations/_alllayers";
          var elementTitle = "Sand Seatrout - Trawl Stations (State and Federal) - Fisheries-Independent";
          var elementTopic = "LivingMarineResources";
        }
        if (subplateData.indexOf("Federal") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/Shrimp_Trawl_Stations.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Stations/_alllayers";
          var elementTitle = "Sand Seatrout - Trawl Stations - Fisheries-Independent (Federal)";
          var elementTopic = "LivingMarineResources";
        }
        if (subplateData.indexOf("State") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/CAGES_Occurrence.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CAGES_SandSeatrout_Occurrence/_alllayers";
          var elementTitle = "Sand Seatrout - Occurrence/No Occurrence Based on Trawls - Fisheries-Independent (State)";
          var elementTopic = "LivingMarineResources";
        }
      }
      if (subplateData.indexOf("MeanCPUE") != -1 )  {
        if (subplateData.indexOf("Locations") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/CAGES_MeanCPUE_Location.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CAGES_SandSeatrout_MeanCPUE_Stations_2000-2007/_alllayers";
          var elementTitle = "Sand Seatrout - Mean Catch per Unit Effort (CPUE) by Locations - Fisheries-Independent (State)";
          var elementTopic = "LivingMarineResources";
        }
        if (subplateData.indexOf("Water Body") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/CAGES_MeanCPUE_WaterBody.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CAGES_SandSeatrout_MeanCPUE_ByWaterBody/_alllayers";
          var elementTitle = "Sand Seatrout - Mean Catch per Unit Effort (CPUE) by Water Bodies - Fisheries-Independent (State)";
          var elementTopic = "LivingMarineResources";
        }
      }
    }
    if (subplateData.indexOf("Silver Seatrout") != -1)  {
      if (subplateData.indexOf("Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/SilverSeatrout_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_SilverSeatrout_Abundance/_alllayers";
        var elementTitle = "Silver Seatrout - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/Shrimp_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Effort/_alllayers";
        var elementTitle = "Silver Seatrout - Sampling Effort - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Stations") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/Shrimp_Trawl_Stations.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Stations/_alllayers";
        var elementTitle = "Silver Seatrout - Trawl Stations - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
    }
    if (subplateData.indexOf("Spanish Mackerel") != -1)  {
      if (subplateData.indexOf("Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/SpanishMackerel_Larval_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_FallPlankton_SpanishMackerel_Abundance/_alllayers";
        var elementTitle = "Spanish Mackerel - Larval Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/FallPlankton_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_FallPlankton_Effort/_alllayers";
        var elementTitle = "Spanish Mackerel - Larval Sampling Effort - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Stations") != -1 )  {
        if (subplateData.indexOf("Both") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/SEAMAP-CAGES_TrawlSites.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP-CAGES_SpanishMackerel_Stations/_alllayers";
          var elementTitle = "Spanish Mackerel - Sampling Locations (State and Federal) - Fisheries-Independent";
          var elementTopic = "LivingMarineResources";
        }
        if (subplateData.indexOf("Federal") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/FallPlankton_Stations.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_FallPlankton_Stations/_alllayers";
          var elementTitle = "Spanish Mackerel - Fall Plankton Stations - Fisheries-Independent (Federal)";
          var elementTopic = "LivingMarineResources";
        }
        if (subplateData.indexOf("State") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/CAGES_Occurrence.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CAGES_SpanishMackerel_Occurrence/_alllayers";
          var elementTitle = "Spanish Mackerel - Occurrence/No Occurrence Based on Trawls - Fisheries-Independent (State)";
          var elementTopic = "LivingMarineResources";
        }
      }
      if (subplateData.indexOf("MeanCPUE") != -1 )  {
        if (subplateData.indexOf("Locations") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/CAGES_MeanCPUE_Location.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CAGES_SpanishMackerel_MeanCPUE_Stations_2000-2007/_alllayers";
          var elementTitle = "Spanish Mackerel - Mean Catch per Unit Effort (CPUE) by Locations - Fisheries-Independent (State)";
          var elementTopic = "LivingMarineResources";
        }
        if (subplateData.indexOf("Water Body") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/CAGES_MeanCPUE_WaterBody.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CAGES_SpanishMackerel_MeanCPUE_ByWaterBody/_alllayers";
          var elementTitle = "Spanish Mackerel - Mean Catch per Unit Effort (CPUE) by Water Bodies - Fisheries-Independent (State)";
          var elementTopic = "LivingMarineResources";
        }
      }
    }
    if (subplateData.indexOf("Spot") != -1)  {
      if (subplateData.indexOf("Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/Spot_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Spot_Abundance/_alllayers";
        var elementTitle = "Spot - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/Shrimp_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Effort/_alllayers";
        var elementTitle = "Spot - Sampling Effort - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Stations") != -1 )  {
        if (subplateData.indexOf("Both") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/SEAMAP-CAGES_TrawlSites.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP-CAGES_Trawl_Stations/_alllayers";
          var elementTitle = "Spot - Trawl Stations (State and Federal) - Fisheries-Independent";
          var elementTopic = "LivingMarineResources";
        }
        if (subplateData.indexOf("Federal") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/Shrimp_Trawl_Stations.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Stations/_alllayers";
          var elementTitle = "Spot - Trawl Stations - Fisheries-Independent (Federal)";
          var elementTopic = "LivingMarineResources";
        }
        if (subplateData.indexOf("State") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/CAGES_Occurrence.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CAGES_Spot_Occurrence/_alllayers";
          var elementTitle = "Spot - Occurrence/No Occurrence Based on Trawls - Fisheries-Independent (State)";
          var elementTopic = "LivingMarineResources";
        }
      }
      if (subplateData.indexOf("MeanCPUE") != -1 )  {
        if (subplateData.indexOf("Locations") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/CAGES_MeanCPUE_Location.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CAGES_Spot_MeanCPUE_Stations_2000-2007/_alllayers";
          var elementTitle = "Spot - Mean Catch per Unit Effort (CPUE) by Locations - Fisheries-Independent (State)";
          var elementTopic = "LivingMarineResources";
        }
        if (subplateData.indexOf("Water Body") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/lmrLegends/CAGES_MeanCPUE_WaterBody.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CAGES_Spot_MeanCPUE_ByWaterBody/_alllayers";
          var elementTitle = "Spot - Mean Catch per Unit Effort (CPUE) by Water Bodies - Fisheries-Independent (State)";
          var elementTopic = "LivingMarineResources";
        }
      }
    }
    if (subplateData.indexOf("Vermilion Snapper") != -1)  {
      if (subplateData.indexOf("Occurrence") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/VermilionSnapper_Occurrence.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_VermilionSnapper_Occurrence/_alllayers";
        var elementTitle = "Vermilion Snapper - Occurrence/No Occurrence - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Larval - Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/VermilionSnapper_Larval_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_FallPlankton_VermilionSnapper_Abundance/_alllayers";
        var elementTitle = "Vermilion Snapper - Larval Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Larval - Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/FallPlankton_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_FallPlankton_Effort/_alllayers";
        var elementTitle = "Vermilion Snapper - Larval Sampling Effort - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Larval - Stations") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/FallPlankton_Stations.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_FallPlankton_Stations/_alllayers";
        var elementTitle = "Vermilion Snapper - Fall Plankton Stations - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Juvenile - Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/VermilionSnapper_Juvenile_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_VermilionSnapper_Abundance/_alllayers";
        var elementTitle = "Vermilion Snapper - Juvenile Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Juvenile - Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/Juvenile_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Effort/_alllayers";
        var elementTitle = "Vermilion Snapper - Juvenile Sampling Effort - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Juvenile - Stations") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/Trawl_Stations.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_Trawl_Stations/_alllayers";
        var elementTitle = "Vermilion Snapper - Trawl Stations - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Hot Spot") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/FisheriesDependent_CommercialCatch_HotSpotAnalysis.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_FisheriesDependent_VermilionSnapper_2007_2013/_alllayers";
        var elementTitle = "Vermilion Snapper - Commercial Catch - Fisheries-Dependent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
    }
    if (subplateData.indexOf("Yellowedge Grouper") != -1)  {
      if (subplateData.indexOf("Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/YellowedgeGrouper_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_YellowedgeGrouper_Abundance/_alllayers";
        var elementTitle = "Yellowedge Grouper - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/BottomLongline_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_Effort/_alllayers";
        var elementTitle = "Yellowedge Grouper - Sampling Effort - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Stations") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/BottomLongline_Stations.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_Stations/_alllayers";
        var elementTitle = "Yellowedge Grouper - Bottom Longline Stations - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
    }
    if (subplateData.indexOf("Green Sea Turtle") != -1)  {
      if (subplateData.indexOf("Nesting Sites") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/SWOT_NestingSites_GreenSeaTurtles.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SWOT_GreenSeaTurtles_NestingSites/_alllayers";
        var elementTitle = "Green Sea Turtles - Nesting Sites";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Frequency") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/SWOT_FreqSpeciesPerNestingSite_SeaTurtles.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SWOT_NestingSites_FrequencyBySpecies/_alllayers";
        var elementTitle = "Sea Turtles - Frequency of Species per Nesting Site";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Predicted Habitat") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/SWOT_PredictedHabitatSuitability_SeaTurtles.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SWOT_PredictedHabitatSuitability_GreenSeaTurtle/_alllayers";
        var elementTitle = "Green Sea Turtles - Predicted Habitat Suitability";
        var elementTopic = "LivingMarineResources";
      }
    }
    if (subplateData.indexOf("Hawksbill Sea Turtle") != -1)  {
      if (subplateData.indexOf("Nesting Sites") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/SWOT_NestingSites_HawksbillSeaTurtles.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SWOT_HawksbillSeaTurtles_NestingSites/_alllayers";
        var elementTitle = "Hawksbill Sea Turtles - Nesting Sites";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Frequency") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/SWOT_FreqSpeciesPerNestingSite_SeaTurtles.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SWOT_NestingSites_FrequencyBySpecies/_alllayers";
        var elementTitle = "Sea Turtles - Frequency of Species per Nesting Site";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Predicted Habitat") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/SWOT_PredictedHabitatSuitability_SeaTurtles.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SWOT_PredictedHabitatSuitability_HawksbillSeaTurtle/_alllayers";
        var elementTitle = "Hawksbill Sea Turtles - Predicted Habitat Suitability";
        var elementTopic = "LivingMarineResources";
      }
    }
    if (subplateData.indexOf("Leatherback Sea Turtle") != -1)  {
      if (subplateData.indexOf("Nesting Sites") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/SWOT_NestingSites_LeatherbackSeaTurtles.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SWOT_LeatherbackSeaTurtles_NestingSites/_alllayers";
        var elementTitle = "Leatherback Sea Turtles - Nesting Sites";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Frequency") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/SWOT_FreqSpeciesPerNestingSite_SeaTurtles.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SWOT_NestingSites_FrequencyBySpecies/_alllayers";
        var elementTitle = "Sea Turtles - Frequency of Species per Nesting Site";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Predicted Habitat") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/SWOT_PredictedHabitatSuitability_SeaTurtles.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SWOT_PredictedHabitatSuitability_LeatherbackSeaTurtle/_alllayers";
        var elementTitle = "Leatherback Sea Turtles - Predicted Habitat Suitability";
        var elementTopic = "LivingMarineResources";
      }
    }
    if (subplateData.indexOf("Loggerhead Sea Turtle") != -1)  {
      if (subplateData.indexOf("Nesting Sites") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/SWOT_NestingSites_LoggerheadSeaTurtles.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SWOT_LoggerheadSeaTurtles_NestingSites/_alllayers";
        var elementTitle = "Loggerhead Sea Turtles - Nesting Sites";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Frequency") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/SWOT_FreqSpeciesPerNestingSite_SeaTurtles.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SWOT_NestingSites_FrequencyBySpecies/_alllayers";
        var elementTitle = "Sea Turtles - Frequency of Species per Nesting Site";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Predicted Habitat") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/SWOT_PredictedHabitatSuitability_SeaTurtles.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SWOT_PredictedHabitatSuitability_LoggerheadSeaTurtle/_alllayers";
        var elementTitle = "Loggerhead Sea Turtles - Predicted Habitat Suitability";
        var elementTopic = "LivingMarineResources";
      }
    }
    if (subplateData.indexOf("Kemp Ridley Sea Turtle") != -1)  {
      if (subplateData.indexOf("Nesting Sites") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/SWOT_NestingSites_KempRidleySeaTurtles.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SWOT_RidleyKempSeaTurtles_NestingSites/_alllayers";
        var elementTitle = "Kemp's Ridley Sea Turtles - Nesting Sites";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Frequency") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/SWOT_FreqSpeciesPerNestingSite_SeaTurtles.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SWOT_NestingSites_FrequencyBySpecies/_alllayers";
        var elementTitle = "Sea Turtles - Frequency of Species per Nesting Site";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Predicted Habitat") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/SWOT_PredictedHabitatSuitability_SeaTurtles.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SWOT_PredictedHabitatSuitability_RidleyKempSeaTurtle/_alllayers";
        var elementTitle = "Kemp's Ridley Sea Turtles - Predicted Habitat Suitability";
        var elementTopic = "LivingMarineResources";
      }
    }
    if (subplateData.indexOf("Atlantic Sharpnose Shark") != -1)  {
      if (subplateData.indexOf("Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/AtlanticSharpnoseShark_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_AtlanticSharpnoseShark_Abundance/_alllayers";
        var elementTitle = "Atlantic Sharpnose Shark - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/BottomLongline_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_Effort/_alllayers";
        var elementTitle = "Atlantic Sharpnose Shark - Sampling Effort - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Stations") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/BottomLongline_Stations.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_Stations/_alllayers";
        var elementTitle = "Atlantic Sharpnose Shark - Bottom Longline Stations - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
    }
    if (subplateData.indexOf("Blacknose Shark") != -1)  {
      if (subplateData.indexOf("Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/BlacknoseShark_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_BlacknoseShark_Abundance/_alllayers";
        var elementTitle = "Blacknose Shark - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/BottomLongline_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_Effort/_alllayers";
        var elementTitle = "Blacknose Shark - Sampling Effort - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Stations") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/BottomLongline_Stations.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_Stations/_alllayers";
        var elementTitle = "Blacknose Shark - Bottom Longline Stations - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
    }
    if (subplateData.indexOf("Blacktip Shark") != -1)  {
      if (subplateData.indexOf("Abundance") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/BlacktipShark_Abundance.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_BlacktipShark_Abundance/_alllayers";
        var elementTitle = "Blacktip Shark - Relative Abundance - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Effort") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/BottomLongline_Effort.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_Effort/_alllayers";
        var elementTitle = "Blacktip Shark - Sampling Effort - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Stations") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/BottomLongline_Stations.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SEAMAP_BottomLongline_Stations/_alllayers";
        var elementTitle = "Blacktip Shark - Bottom Longline Stations - Fisheries-Independent (Federal)";
        var elementTopic = "LivingMarineResources";
      }
    }
    if (subplateData.indexOf("Bluefin Tuna") != -1)  {
      if (subplateData.indexOf("Spawning") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/ABFT_Spawning.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_BluefinTuna_Spawning/_alllayers";
        var elementTitle = "Percent Daily Occurrence of Potential Spawning Habitat - Large Atlantic Bluefin Tuna- March to May";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Winter") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/ABFT_WinterFeeding.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_BluefinTuna_Feeding_Winter/_alllayers";
        var elementTitle = "Percent Daily Occurrence of Potential Feeding Habitat - Large Atlantic Bluefin Tuna- Winter";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Spring") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/ABFT_SpringFeeding.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_BluefinTuna_Feeding_Spring/_alllayers";
        var elementTitle = "Percent Daily Occurrence of Potential Feeding Habitat - Large Atlantic Bluefin Tuna- Spring";
        var elementTopic = "LivingMarineResources";
      }
      if (subplateData.indexOf("Autumn") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/lmrLegends/ABFT_AutumnFeeding.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_BluefinTuna_Feeding_Autumn/_alllayers";
        var elementTitle = "Percent Daily Occurrence of Potential Feeding Habitat - Large Atlantic Bluefin Tuna- Autumn";
        var elementTopic = "LivingMarineResources";
      }
    }

    // add socioeconomic conditions subplate data to the map (formerly known as economic activity)
    if (subplateData.indexOf("CSVI") != -1)  {
      if (subplateData.indexOf("Poverty") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SocialIndicators_FishingCommunities_GulfCoast_PovertyIndex/_alllayers";
        var elementTitle = "Community Social Vulnerability Indicators - Poverty (US Gulf Coast)";
        var elementTopic = "SocioeconomicConditions";
      }
      if (subplateData.indexOf("Retiree Migration") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SocialIndicators_FishingCommunities_GulfCoast_RetireeMigrationIndex/_alllayers";
        var elementTitle = "Community Social Vulnerability Indicators - Retiree Migration (US Gulf Coast)";
        var elementTopic = "SocioeconomicConditions";
      }
      if (subplateData.indexOf("Commercial Fishing Engagement") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_SocialIndicators_FishingCommunities_GulfCoast_CommercialFishingEngagementIndex/_alllayers";
        var elementTitle = "Community Social Vulnerability Indicators - Commercial Fishing Engagement (US Gulf Coast)";
        var elementTopic = "SocioeconomicConditions";
      }
    }
    if (subplateData.indexOf("Social WellBeing") != -1)  {
      if (subplateData.indexOf("Social Services") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCCOS_SocialWellBeing_AccessToSocialServices_2012/_alllayers";
        var elementTitle = "Coastal Community Well-Being Indicators - Access to Social Services (US Gulf Coast) - 2012";
        var elementTopic = "SocioeconomicConditions";
      }
      if (subplateData.indexOf("Basic Needs") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCCOS_SocialWellBeing_BasicNeeds_2012/_alllayers";
        var elementTitle = "Coastal Community Well-Being Indicators - Basic Needs (US Gulf Coast) - 2012";
        var elementTopic = "SocioeconomicConditions";
      }
      if (subplateData.indexOf("Economic Security") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCCOS_SocialWellBeing_EconomicSecurity_2012/_alllayers";
        var elementTitle = "Coastal Community Well-Being Indicators - Economic Security (US Gulf Coast) - 2012";
        var elementTopic = "SocioeconomicConditions";
      }
      if (subplateData.indexOf("Education") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCCOS_SocialWellBeing_Education_2012/_alllayers";
        var elementTitle = "Coastal Community Well-Being Indicators - Education (US Gulf Coast) - 2012";
        var elementTopic = "SocioeconomicConditions";
      }
      if (subplateData.indexOf("Governance") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCCOS_SocialWellBeing_Governance_2012/_alllayers";
        var elementTitle = "Coastal Community Well-Being Indicators - Governance (US Gulf Coast) - 2012";
        var elementTopic = "SocioeconomicConditions";
      }
      if (subplateData.indexOf("Health") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCCOS_SocialWellBeing_Health_2012/_alllayers";
        var elementTitle = "Coastal Community Well-Being Indicators - Health (US Gulf Coast) - 2012";
        var elementTopic = "SocioeconomicConditions";
      }
      if (subplateData.indexOf("Safety") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCCOS_SocialWellBeing_Safety_2012/_alllayers";
        var elementTitle = "Coastal Community Well-Being Indicators - Safety (US Gulf Coast) - 2012";
        var elementTopic = "SocioeconomicConditions";
      }
      if (subplateData.indexOf("Social Connectedness") != -1)  {
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_NCCOS_SocialWellBeing_SocialConnectedness_2012/_alllayers";
        var elementTitle = "Coastal Community Well-Being Indicators - Social Connectedness (US Gulf Coast) - 2012";
        var elementTopic = "SocioeconomicConditions";
      }
    }
    if (subplateData.indexOf("Shipping Density") != -1)  {
      if (subplateData.indexOf("2010") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/socioeconomicLegends/ShippingDensity_CommercialVessels_AIS.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_AIS_CommercialVesselDensity2009_2010/_alllayers";
        var elementTitle = "Shipping Density - Commercial Vessels - 2010";
        var elementTopic = "SocioeconomicConditions";
      }
      if (subplateData.indexOf("2011") != -1)  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/socioeconomicLegends/ShipDens2011_Legend.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_AIS_VesselDensity_2011/_alllayers";
        var elementTitle = "Shipping Density - All Vessels - 2011";
        var elementTopic = "SocioeconomicConditions";
      }
     }
    if (subplateData.indexOf("Waterways") != -1)  {
      if (subplateData.indexOf("Type") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/socioeconomicLegends/WaterWayTypesLegend.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_USACE_NatlWaterWayNetwork_TypeNN/_alllayers";
        var elementTitle = "Navigable Waterway Routes - Types";
        var elementTopic = "SocioeconomicConditions";
      }
      if (subplateData.indexOf("Nodes") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/socioeconomicLegends/WaterWayNodesLegend.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_USACE_NatlWaterWayNetwork_WtwyType/_alllayers";
        var elementTitle = "Navigable Waterway Routes - Nodes";
        var elementTopic = "SocioeconomicConditions";
      }
      if (subplateData.indexOf("Class") != -1 )  {
        var legend = document.getElementById("legendImage");
        var imgTag = "<img src='legends/socioeconomicLegends/WaterWayFuncClassLegend2.png'/>";
        legend.innerHTML = imgTag;
        var elementURL = serviceURL + "/arcgiscache/DataAtlas_USACE_NatlWaterWayNetwork_FunctionalClass/_alllayers";
        var elementTitle = "Navigable Waterway Routes - Functional Class";
        var elementTopic = "SocioeconomicConditions";
      }
    }

    // add environmental quality subplate data to the map
    if (subplateData.indexOf("Water Quality") != -1)  {
      if (subplateData.indexOf("Nitrogen") != -1)  {
        if (subplateData.indexOf("Total Yield") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/environmentalLegends/NAWQA_Nitrogen_TotalYieldDelivered.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_NAWQA_Nitrogen_TotalYieldDelivered_GOM/_alllayers";
          var elementTitle = "Water Quality - Total Yield Delivered - Nitrogen - Estuarine";
          var elementTopic = "EnvironmentalQuality";
        }
        if (subplateData.indexOf("Total Load") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/environmentalLegends/NAWQA_Nitrogen_TotalLoadDelivered.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_NAWQA_Nitrogen_TotalLoadDelivered_GOM/_alllayers";
          var elementTitle = "Water Quality - Total Load Delivered - Nitrogen - Estuarine";
          var elementTopic = "EnvironmentalQuality";
        }
      }
      if (subplateData.indexOf("Phosphorus") != -1)  {
        if (subplateData.indexOf("Total Yield") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/environmentalLegends/NAWQA_Phosphorus_TotalYieldDelivered.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_NAWQA_Phosphorus_TotalYieldDelivered_GOM/_alllayers";
          var elementTitle = "Water Quality - Total Yield Delivered - Phosphorus - Estuarine";
          var elementTopic = "EnvironmentalQuality";
        }
        if (subplateData.indexOf("Total Load") != -1)  {
          var legend = document.getElementById("legendImage");
          var imgTag = "<img src='legends/environmentalLegends/NAWQA_Phosphorus_TotalLoadDelivered.png'/>";
          legend.innerHTML = imgTag;
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_NAWQA_Phosphorus_TotalLoadDelivered_GOM/_alllayers";
          var elementTitle = "Water Quality - Total Load Delivered - Phosphorus - Estuarine";
          var elementTopic = "EnvironmentalQuality";
        }
      }
    }

    // CMECS goes across physical, biotic, and environmental plates
    if (subplateData.indexOf("CMECS") != -1)  {
      if (subplateData.indexOf("Temperature") != -1 )  {
        if (subplateData.indexOf("Fall") != -1)  {
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_Temperature_Fall/_alllayers";
          var elementTitle = "Remotely Sensed Sea Surface Temperature - CMECS Sea Surface Temperature Subcomponent - Mean - Fall";
          var elementTopic = "Physical";
        }
        if (subplateData.indexOf("Spring") != -1)  {
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_Temperature_Spring/_alllayers";
          var elementTitle = "Remotely Sensed Sea Surface Temperature - CMECS Sea Surface Temperature Subcomponent - Mean - Spring";
          var elementTopic = "Physical";
        }
        if (subplateData.indexOf("Summer") != -1)  {
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_Temperature_Summer/_alllayers";
          var elementTitle = "Remotely Sensed Sea Surface Temperature - CMECS Sea Surface Temperature Subcomponent - Mean - Summer";
          var elementTopic = "Physical";
        }
        if (subplateData.indexOf("Winter") != -1)  {
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_Temperature_Winter/_alllayers";
          var elementTitle = "Remotely Sensed Sea Surface Temperature - CMECS Sea Surface Temperature Subcomponent - Mean - Winter";
          var elementTopic = "Physical";
        }
      }
      if (subplateData.indexOf("Water Column Stability") != -1 )  {
        if (subplateData.indexOf("Fall") != -1)  {
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_WaterColumnStabilityModifier_Fall/_alllayers";
          var elementTitle = "Remotely Sensed Sea Surface Temperature - CMECS Water Column Temperature Change - Mean - Fall";
          var elementTopic = "Physical";
        }
        if (subplateData.indexOf("Spring") != -1)  {
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_WaterColumnStabilityModifier_Spring/_alllayers";
          var elementTitle = "Remotely Sensed Sea Surface Temperature - CMECS Water Column Temperature Change - Mean - Spring";
          var elementTopic = "Physical";
        }
        if (subplateData.indexOf("Summer") != -1)  {
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_WaterColumnStabilityModifier_Summer/_alllayers";
          var elementTitle = "Remotely Sensed Sea Surface Temperature - CMECS Water Column Temperature Change - Mean - Summer";
          var elementTopic = "Physical";
        }
        if (subplateData.indexOf("Winter") != -1)  {
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_WaterColumnStabilityModifier_Winter/_alllayers";
          var elementTitle = "Remotely Sensed Sea Surface Temperature - CMECS Water Column Temperature Change - Mean - Winter";
          var elementTopic = "Physical";
        }
      }
      if (subplateData.indexOf("Salinity") != -1 )  {
        if (subplateData.indexOf("Fall") != -1)  {
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_Salinity_Fall/_alllayers";
          var elementTitle = "Seawater Salinity - CMECS Sea Surface Salinity Subcomponent - Mean - Fall";
          var elementTopic = "Physical";
        }
        if (subplateData.indexOf("Spring") != -1)  {
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_Salinity_Spring/_alllayers";
          var elementTitle = "Seawater Salinity - CMECS Sea Surface Salinity Subcomponent - Mean - Spring";
          var elementTopic = "Physical";
        }
        if (subplateData.indexOf("Summer") != -1)  {
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_Salinity_Summer/_alllayers";
          var elementTitle = "Seawater Salinity - CMECS Sea Surface Salinity Subcomponent - Mean - Summer";
          var elementTopic = "Physical";
        }
        if (subplateData.indexOf("Winter") != -1)  {
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_Salinity_Winter/_alllayers";
          var elementTitle = "Seawater Salinity - CMECS Sea Surface Salinity Subcomponent - Mean - Winter";
          var elementTopic = "Physical";
        }
      }
      if (subplateData.indexOf("Chlorophyll") != -1 )  {
        if (subplateData.indexOf("Fall") != -1)  {
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_Chlorophyll_Fall/_alllayers";
          var elementTitle = "CMECS Water Column Productivity Modifier - Mean - Fall";
          var elementTopic = "Biotic";
        }
        if (subplateData.indexOf("Spring") != -1)  {
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_Chlorophyll_Spring/_alllayers";
          var elementTitle = "CMECS Water Column Productivity Modifier - Mean - Spring";
          var elementTopic = "Biotic";
        }
        if (subplateData.indexOf("Summer") != -1)  {
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_Chlorophyll_Summer/_alllayers";
          var elementTitle = "CMECS Water Column Productivity Modifier - Mean - Summer";
          var elementTopic = "Biotic";
        }
        if (subplateData.indexOf("Winter") != -1)  {
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_Chlorophyll_Winter/_alllayers";
          var elementTitle = "CMECS Water Column Productivity Modifier - Mean - Winter";
          var elementTopic = "Biotic";
        }
      }
      if (subplateData.indexOf("Euphotic Depth") != -1 )  {
        if (subplateData.indexOf("Fall") != -1)  {
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_EuphoticDepth_Fall/_alllayers";
          var elementTitle = "CMECS Photic Quality - Euphotic Depth - Mean - Fall";
          var elementTopic = "Biotic";
        }
        if (subplateData.indexOf("Spring") != -1)  {
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_EuphoticDepth_Spring/_alllayers";
          var elementTitle = "CMECS Photic Quality - Euphotic Depth - Mean - Spring";
          var elementTopic = "Biotic";
        }
        if (subplateData.indexOf("Summer") != -1)  {
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_EuphoticDepth_Summer/_alllayers";
          var elementTitle = "CMECS Photic Quality - Euphotic Depth - Mean - Summer";
          var elementTopic = "Biotic";
        }
        if (subplateData.indexOf("Winter") != -1)  {
          var elementURL = serviceURL + "/arcgiscache/DataAtlas_CMECS_EuphoticDepth_Winter/_alllayers";
          var elementTitle = "CMECS Photic Quality - Euphotic Depth - Mean - Winter";
          var elementTopic = "Biotic";
        }
      }
    }

    // add the dataLayer to the map
    var dataLayer = new OpenLayers.Layer.ArcGISCache(elementTitle, elementURL, {layerInfo: layerInfo, useArcGISServer: false, isBaseLayer: false, displayInLayerSwitcher: false, opacity: 0.9});
    addTiledMap(dataLayer);
    mapLayer.push(dataLayer);

    // change map title
    var barColor = "#d2ebf0";
    //if (elementTopic.indexOf("Physical") != -1)  barColor = "#4d8777";
    //if (elementTopic.indexOf("Biotic") != -1)  barColor = "#799c4b";
    //if (elementTopic.indexOf("LivingMarineResources") != -1)  barColor = "#2851c3";
    //if (elementTopic.indexOf("SocioeconomicConditions") != -1)  barColor = "#124c82";
    //if (elementTopic.indexOf("EnvironmentalQuality") != -1)  barColor = "#6a7a3d";
    //if (elementTopic.indexOf("Jurisdictions") != -1)  barColor = "#88bd6f";
    var colorBarHTML = "";
    colorBarHTML += '<table cellpadding="0" cellspacing="0">';
    colorBarHTML += '<tr align="center">';
    colorBarHTML += '<td bgcolor="'+barColor+'" width="900" height="25" class="smallText4">'+elementTitle+'</td>';
    colorBarHTML += '<td bgcolor="'+barColor+'" width="300" height="25"></td>';
    colorBarHTML += '</tr>';
    colorBarHTML += '</table>';
    document.getElementById("colorBar").innerHTML = colorBarHTML;

    // add opacity bar
    var opacityBarHTML = "";
    opacityBarHTML += '<table width="880" border="0" cellspacing="0" cellpadding="0" align="center" height="25">';
    opacityBarHTML += '<tr align="center" valign="middle">';
    opacityBarHTML += '<td bgcolor="#d0ecf0" class="opacityText" height="25" width="880">';
    opacityBarHTML += 'Set Opacity: ';
    opacityBarHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
    opacityBarHTML += '<a title="decrease opacity" href="javascript: changeOpacity(-10);"><font size="3"><b>-</b></font></a>&nbsp;&nbsp;';
    opacityBarHTML += '<input id="opacity" type="text" value="90" size="1" disabled="true" style="width: 30px; height: 20px; font: bold 12px arial; text-align: center; background-color: #ffffff;"/>';
    opacityBarHTML += '&nbsp;&nbsp;<a title="increase opacity" href="javascript: changeOpacity(10);"><font size="3"><b>+</b></font></a>';
    opacityBarHTML += '</td>';
    opacityBarHTML += '<td></td>';
    opacityBarHTML += '</tr>';
    opacityBarHTML += '</table>';
    document.getElementById("opacityBar").innerHTML = opacityBarHTML;
  }

  // function to handle zooming into a section of a main plate without changing plate
  function zoomToExtent(area)  {
    // turn on a reference layer that to cover this area
    //referenceLayer1.setVisibility(true);

    if (area.indexOf("Apalachicola Bay") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/ApalachicolaBay.png'/>";
      legend.innerHTML = imgTag;
      map.zoomToExtent(new OpenLayers.Bounds(-9517245,3421131,-9383480,3511939));
      var elementTitle = "Estuarine Bathymetry - Apalachicola Bay, FL";
    }
    if (area.indexOf("Aransas Bay") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/AransasBay.png'/>";
      legend.innerHTML = imgTag;
      map.zoomToExtent(new OpenLayers.Bounds(-10873391,3213223,-10739779,3304030));
      var elementTitle = "Estuarine Bathymetry - Aransas Bay, TX";
    }
    if (area.indexOf("Atchafalaya Bay") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/AtchafalayaBay.png'/>";
      legend.innerHTML = imgTag;
      map.zoomToExtent(new OpenLayers.Bounds(-10255932,3395907,-10122168,3486409));
      var elementTitle = "Estuarine Bathymetry - Atchafalaya Bay, LA";
    }
    if (area.indexOf("Baffin Bay") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/BaffinBay.png'/>";
      legend.innerHTML = imgTag;
      map.zoomToExtent(new OpenLayers.Bounds(-10926744,3114772,-10792826,3205426));
      var elementTitle = "Estuarine Bathymetry - Baffin Bay, TX";
    }
    if (area.indexOf("Barataria Bay") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/BaratariaBay.png'/>";
      legend.innerHTML = imgTag;
      map.zoomToExtent(new OpenLayers.Bounds(-10092357,3376645,-9958745,3467299));
      var elementTitle = "Estuarine Bathymetry - Barataria Bay, LA";
    }
    if (area.indexOf("Calcasieu Lake") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/CalcasieuLake.png'/>";
      legend.innerHTML = imgTag;
      map.zoomToExtent(new OpenLayers.Bounds(-10459561,3461490,-10325490,3552144));
      var elementTitle = "Estuarine Bathymetry - Calcasieu Lake, LA";
    }
    if (area.indexOf("Charlotte Harbor") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/CharlotteHarbor.png'/>";
      legend.innerHTML = imgTag;
      map.zoomToExtent(new OpenLayers.Bounds(-9213331,3045061,-9080331,3135563));
      var elementTitle = "Estuarine Bathymetry - Charlotte Harbor, FL";
    }
    if (area.indexOf("Choctawhatchee Bay") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/ChoctawhatcheeBay.png'/>";
      legend.innerHTML = imgTag;
      map.zoomToExtent(new OpenLayers.Bounds(-9682349,3512091,-9548584,3602593));
      var elementTitle = "Estuarine Bathymetry - Choctawhatchee Bay, FL";
    }
    if (area.indexOf("Corpus Christi Bay") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/CorpusChristiBay.png'/>";
      legend.innerHTML = imgTag;
      map.zoomToExtent(new OpenLayers.Bounds(-10891124,3180202,-10757512,3271009));
      var elementTitle = "Estuarine Bathymetry - Corpus Christi Bay, TX";
    }
    if (area.indexOf("Galveston Bay") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/GalvestonBay.png'/>";
      legend.innerHTML = imgTag;
      map.zoomToExtent(new OpenLayers.Bounds(-10694222,3342554,-10426387,3524168));
      var elementTitle = "Estuarine Bathymetry - Galveston Bay, TX";
    }
    if (area.indexOf("Matagorda Bay") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/MatagordaBay.png'/>";
      legend.innerHTML = imgTag;
      map.zoomToExtent(new OpenLayers.Bounds(-10773258,3284156,-10639646,3374811));
      var elementTitle = "Estuarine Bathymetry - Matagorda Bay, TX";
    }
    if (area.indexOf("Mississippi Sound") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/MississippiSound.png'/>";
      legend.innerHTML = imgTag;
      map.zoomToExtent(new OpenLayers.Bounds(-10037323,3437947,-9770099,3618645));
      var elementTitle = "Estuarine Bathymetry - Mississippi Sound";
    }
    if (area.indexOf("Mobile Bay") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/MobileBay.png'/>";
      legend.innerHTML = imgTag;
      map.zoomToExtent(new OpenLayers.Bounds(-9867174,3527837,-9733562,3618492));
      var elementTitle = "Estuarine Bathymetry - Mobile Bay, AL";
    }
    if (area.indexOf("Pensacola Bay") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/PensacolaBay.png'/>";
      legend.innerHTML = imgTag;
      map.zoomToExtent(new OpenLayers.Bounds(-9765360,3513773,-9632053,3604275));
      var elementTitle = "Estuarine Bathymetry - Pensacola Bay, FL";
    }
    if (area.indexOf("Perdido Bay") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/PerdidoBay.png'/>";
      legend.innerHTML = imgTag;
      map.zoomToExtent(new OpenLayers.Bounds(-9802049,3504142,-9668590,3594643));
      var elementTitle = "Estuarine Bathymetry - Perdido Bay, FL";
    }
    if (area.indexOf("San Antonio Bay") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/SanAntonioBay.png'/>";
      legend.innerHTML = imgTag;
      map.zoomToExtent(new OpenLayers.Bounds(-10836854,3242763,-10703089,3333724));
      var elementTitle = "Estuarine Bathymetry - San Antonio Bay, TX";
    }
    if (area.indexOf("Sarasota Bay") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/SarasotaBay.png'/>";
      legend.innerHTML = imgTag;
      map.zoomToExtent(new OpenLayers.Bounds(-9266684,3119510,-9133378,3210165));
      var elementTitle = "Estuarine Bathymetry - Sarasota Bay, FL";
    }
    if (area.indexOf("St. Andrew Bay") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/StAndrewBay.png'/>";
      legend.innerHTML = imgTag;
      map.zoomToExtent(new OpenLayers.Bounds(-9603618,3482739,-9470006,3573241));
      var elementTitle = "Estuarine Bathymetry - St. Andrew Bay, FL";
    }
    if (area.indexOf("Tampa Bay") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/TampaBay.png'/>";
      legend.innerHTML = imgTag;
      map.zoomToExtent(new OpenLayers.Bounds(-9265614,3171182,-9132460,3261989));
      var elementTitle = "Estuarine Bathymetry - Tampa Bay, FL";
    }
    if (area.indexOf("Terrebonne Timbalier Bays") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/TerreTimBays.png'/>";
      legend.innerHTML = imgTag;
      map.zoomToExtent(new OpenLayers.Bounds(-10161303,3352338,-10027997,3443145));
      var elementTitle = "Estuarine Bathymetry - Terrebonne and Timbalier Bays, LA";
    }
    if (area.indexOf("Whole Gulf") != -1)  {
      var legend = document.getElementById("legendImage");
      var imgTag = "<img src='legends/physicalLegends/estuarineBathymetry.png'/>";
      legend.innerHTML = imgTag;
      map.zoomToExtent(new OpenLayers.Bounds(-11077478.10883,2218165.88923,-8932349.34703,3653959.02853));
      var elementTitle = "Estuarine Bathymetry"
    }
    var barColor = "#d2ebf0";
    var colorBarHTML = "";
    colorBarHTML += '<table cellpadding="0" cellspacing="0">';
    colorBarHTML += '<tr align="center">';
    colorBarHTML += '<td bgcolor="'+barColor+'" width="900" height="25" class="smallText4">'+elementTitle+'</td>';
    colorBarHTML += '<td bgcolor="'+barColor+'" width="300" height="25"></td>';
    colorBarHTML += '</tr>';
    colorBarHTML += '</table>';
    document.getElementById("colorBar").innerHTML = colorBarHTML;
  }

  // change the opacity of the added map layer
  function changeOpacity(byOpacity) {
    if (mapLayer.length != 0)  {
      var newOpacity = (parseFloat(OpenLayers.Util.getElement('opacity').value) + byOpacity).toFixed(1);
      newOpacity = newOpacity * .01;
      newOpacity = Math.min(maxOpacity, Math.max(minOpacity, newOpacity));
      mapLayer[0].setOpacity(newOpacity);
      newOpacity = newOpacity * 100;
      OpenLayers.Util.getElement('opacity').value = newOpacity;
    }
  }

  // reset map to original settings
  function resetMap()  {

    // reset right column to original text
    var linkURL = htmlURL;
    linkURL += "/website/DataAtlas/introPage.htm";
    loadPage(linkURL);

    // determine if map has an image already drawn on it
    if (mapLayer.length != 0)  {
      map.removeLayer(mapLayer[0]);
      mapLayer = [];
    }

    // determine if map has points of interest already drawn on it
    if (mapPOI.length != 0)  {
      map.removeLayer(mapPOI[0]);
      mapPOI = [];
    }

    // reset to original center
    map.zoomToExtent(new OpenLayers.Bounds(-11077478.10883,2218165.88923,-8932349.34703,3653959.02853));

    // reset to original background image
    imageryLayer.setVisibility(true);
    topographyLayer.setVisibility(false);
    simpleLayer.setVisibility(false);
    ngLayer.setVisibility(false);
    oceanLayer.setVisibility(false);
    referenceLayer.setVisibility(true);
    referenceLayer1.setVisibility(true);
    bathymetryLayer.setVisibility(false);
    bathymetryLayer1.setVisibility(false);
    shorelineLayer.setVisibility(false);
    gazetteerLayer.setVisibility(false);
    loopcurrentLayer.setVisibility(false);
    graticuleLayer.setVisibility(true);
    bathySourceLayer.setVisibility(false);
    bathySourceLayer1.setVisibility(false);
    var initBaseMap = document.getElementsByName("OpenLayers_Control_LayerSwitcher_17_baseLayers")[0];
    initBaseMap.checked = true;

    // reset some variables
    contourOverlay = false;
    placeNameOverlay = false;
    bathySourcesOverlay = false;

    // reset color bar under menu to original colors
    var colorBarHTML = "";
    colorBarHTML += '<table cellpadding="0" cellspacing="0">';
    colorBarHTML += '<tr align="center">';
    colorBarHTML += '<td bgcolor="#d2ebf0" width="1200" height="25"></td>';
    colorBarHTML += '</tr>';
    colorBarHTML += '</table>';
    document.getElementById("colorBar").innerHTML = colorBarHTML;

    // reset opacity bar
    var opacityBarHTML = "";
    opacityBarHTML += '<table cellpadding="0" cellspacing="0">';
    opacityBarHTML += '<tr align="center">';
    opacityBarHTML += '<td bgcolor="#d0ecf0" height="25" width="880">';
    opacityBarHTML += '</tr>';
    opacityBarHTML += '</table>';
    document.getElementById("opacityBar").innerHTML = opacityBarHTML;

    // reset the collapsible variable  ... this is so the collapsible folders within the "More Information" tab don't get replicated
    collapsibleFirstTime = true;
  }

   // function to handle display of metadata record coming from NCDDC
  function getMetadataRecord(doc)  {
    var docURL = htmlURL + doc;
    var Win = open(docURL,"MetadataWindow","height=600,width=800,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes");
    Win.focus();
  }

   // function to handle display of metadata record coming from external source
  function getExternalMetadataRecord(doc)  {
    var Win = open(doc,"MetadataWindow","height=600,width=800,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes");
    Win.focus();
  }

  // function to handle WMS Get Capabilities file
  function getWMSCapabilities(doc)  {
    var docURL = serverURL + doc;
    var Win = open(docURL,"WMSWindow","height=600,width=800,toolbar=no,menubar=yes,location=no,scrollbars=yes,resizable=yes");
    Win.focus();
  }

  // function to handle WMS Get Capabilities file from external source
  function getExternalWMSCapabilities(doc)  {
    var Win = open(doc,"WMSWindow","height=600,width=800,toolbar=no,menubar=yes,location=no,scrollbars=yes,resizable=yes");
    Win.focus();
  }

  // function to handle data download calls to links
  function getDataDownloadLink(doc)  {
    var Win = open(doc,"DownloadWindow","height=600,width=800,toolbar=no,menubar=yes,location=no,scrollbars=yes,resizable=yes");
    Win.focus();
  }

  // function to handle data download calls to data itself
  function getDataDownload(doc)  {
    var Win = open(doc,"","height=200,width=200,toolbar=no,menubar=yes,location=no,scrollbars=yes,resizable=yes");
  }

  // function to handle data download calls to links
  function getExternalLink(doc)  {
    var Win = open(doc,"DocumentWindow","height=600,width=800,toolbar=no,menubar=yes,location=no,scrollbars=yes,resizable=yes");
    Win.focus();
  }

  // special animation function for hypoxia
  function getAnimation(page)  {
    var pageURL = htmlURL + page;
    var Win = open(pageURL,"AnimationWindow","height=600,width=800,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes");
    Win.focus();
  }

  // function to display graphic in landscape mode
  function openGraphicLandscape(page)  {
    var pageURL = htmlURL + page;
    var Win = open(pageURL,"LandscapeWindow","height=800,width=1000,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes");
    Win.focus();
  }

  // function to display graphic in portrait mode
  function openGraphicPortrait(page)  {
    var pageURL = htmlURL + page;
    var Win = open(pageURL,"PortraitWindow","height=800,width=700,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes");
    Win.focus();
  }

  // function to handle opening the original atlas
  function DataAtlas1985(page)  {
    var pageURL = htmlURL + page;
    var Win = open(pageURL,"DataAtlas1985","height=800,width=1200,toolbar=no,menubar=no,location=no,scrollbars=no,resizable=yes");
    Win.focus();
  }

  // function to handle help menu
  function helpPopup()  {
    var pageURL = "https://gulfatlas.noaa.gov/help-window/";
    var Win = open(pageURL,"HelpWindow","height=800,width=900,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes");
    Win.focus();
  }

  // function to handle acknowledgements page
  function creditsPage()  {
    var pageURL = htmlURL + "/website/DataAtlas/Acknowledgements.htm";
    var Win = open(pageURL,"Acknowledgements","height=800,width=600,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes");
    Win.focus();
  }

  // function to convert spherical mercator to geographic for mouse position control
  function formatLonlats(lonLat)  {
    var mercatorX = lonLat.lon;
    var mercatorY = lonLat.lat;
    //var rMajor = 6378137.0; // Equatorial Radius, WGS84
    //var shift = Math.PI * rMajor;
    //var longitude = mercatorX / shift * 180.0;
    //var latitude = mercatorY / shift * 180.0;
    //latitude = 180 / Math.PI * (2 * Math.atan(Math.exp(latitude * Math.PI / 180.0)) - Math.PI / 2.0);
    //var ns = OpenLayers.Util.getFormattedLonLat(latitude,'lat','dm');
    //var ew = OpenLayers.Util.getFormattedLonLat(longitude,'lon','dm');
    //return 'Pos: ' + ew + ', ' + ns; 
    return 'Pos: ' + mercatorX.toFixed(2) + ', ' + mercatorY.toFixed(2);
  }

  // function to handle survey page
  function createSurveyPage()  {
    var pageURL = "https://docs.google.com/a/noaa.gov/forms/d/1Rd93Prvr6or8ItUm62kPoY2MJDJyoZYEQRkaTAWpXxQ/viewform";
    var Win = open(pageURL,"SurveyPage","height=700,width=800,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes");
    Win.focus();
  }

