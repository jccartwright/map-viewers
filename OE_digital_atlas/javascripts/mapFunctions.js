     // load up functions once map is ready
     function mapReady(map)  {
       mapCenterPoint = map.extent.getCenter();
       dojo.connect(map, "onUpdateStart", UpdateStart);
       dojo.connect(map, "onUpdateEnd", UpdateEnd);
       dojo.connect(map, "onMouseMove", showCoordinates);
       dojo.connect(map, "onMouseDrag", showCoordinates);
       processCruiseData();
     }

     // handles the reading of the cruise file
     function processCruiseData()  {
       
       csvStore = new dojox.data.CsvStore({url:"cruises.csv"});
       csvStore.fetch({
         onComplete: function(items, request)  {
           //var content = "";
           dojo.forEach(items, function(item, index)  {
             var year = csvStore.getValue(item, "Year");
             var cruise = csvStore.getValue(item, "Cruise");
             var latitude = csvStore.getValue(item, "Latitude");
             var longitude = csvStore.getValue(item, "Longitude");
             var id = csvStore.getIdentity(item);
             if (latitude != undefined && longitude != undefined)  {
               createMarker(id, year, cruise, latitude, longitude);
             }
           });
           initializeCruiseListing();
           dojo.connect(dataLayer, "onClick", onFeatureClick);
           dojo.connect(highlightLayer, "onClick", onFeatureClick);
           dojo.connect(dataLayer, "onMouseOver", function(evt)  {
             var g = evt.graphic;
             var longitude = g.geometry.x;
             var latitude = g.geometry.y;
             var cruise = g.attributes.cruise;
             var year = g.attributes.year;
             var hoverText = cruise + " - " + year;
             if (hoverText.length > 50)  {
               var subCruise = cruise.substring(0,50);
               hoverText = subCruise + " ... - " + year;
             }
             var point = new esri.geometry.Point(longitude, latitude, new esri.SpatialReference({wkid: 3857}));
             var font = new esri.symbol.Font("12px", esri.symbol.Font.STYLE_NORMAL, esri.symbol.Font.VARIANT_NORMAL, esri.symbol.Font.WEIGHT_BOLD, "Arial");
             var symbol = new esri.symbol.TextSymbol(hoverText);
             symbol.setColor( new dojo.Color([0,0,0]) );
             symbol.setAlign(esri.symbol.TextSymbol.ALIGN_START);
             symbol.setOffset(5,5);
             symbol.setFont(font);
             hoverTextLayer.add(new esri.Graphic(point,symbol));
           });
           dojo.connect(dataLayer, "onMouseOut", function()  {
             if (hoverTextLayer != undefined)  hoverTextLayer.clear();
           });           
           var cruiseTotals = dijit.byId("yearCounter");
           cruiseTotals.attr("value", dataLayer.graphics.length + " Cruises Displayed");
           var cruiseTotals = dijit.byId("themeCounter");
           cruiseTotals.attr("value", dataLayer.graphics.length + " Cruises Displayed");
           var cruiseTotals = dijit.byId("wordCounter");
           cruiseTotals.attr("value", dataLayer.graphics.length + " Cruises Displayed");
           var cruiseTotals = dijit.byId("customCounter");
           cruiseTotals.attr("value", dataLayer.graphics.length + " Cruises Displayed");
           if (surveySearch != undefined)  {
             var cruiseID;
             dojo.forEach(dataLayer.graphics, function(graphic)  {
               var id = graphic.attributes.id;
               var year = graphic.attributes.year;
               var cruise = graphic.attributes.cruise;
               var cruiseSearch = cruise + " " + year;
               if (surveySearch.indexOf(cruiseSearch) != -1)  {
                 cruiseID = id;
               }
             });
             if (cruiseID != undefined)  showCruise(cruiseID);
           }
           if (textSearch != undefined)  {
             if (textSearch.length != 0)  {
               searchSurveysByText(textSearch);
             }
           }
           if (missionGroupSearch != undefined)  {
             if (missionGroupSearch.length != 0)  {
               searchSurveysByMissionGroup(missionGroupSearch);
             }
           }
         },
         onError: function(error) {
            dojo.byId("itemsList").innerHTML = error;
         }
       });
     }

     // create a marker for each cruise .. color code by year
     function createMarker(id, year, cruise, lat, lon)  {
       var latitude = parseFloat(lat);
       var longitude = parseFloat(lon);

       var symbol = new esri.symbol.SimpleMarkerSymbol();
       symbol.setStyle(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE);
       symbol.setSize(8);
       if (year == "2001")  symbol.setColor(new dojo.Color([0,0,255,1.0]));
       if (year == "2002")  symbol.setColor(new dojo.Color([0,255,0,1.0]));
       if (year == "2003")  symbol.setColor(new dojo.Color([255,0,0,1.0]));
       if (year == "2004")  symbol.setColor(new dojo.Color([0,255,255,1.0]));
       if (year == "2005")  symbol.setColor(new dojo.Color([255,0,255,1.0]));
       if (year == "2006")  symbol.setColor(new dojo.Color([255,255,0,1.0]));
       if (year == "2007")  symbol.setColor(new dojo.Color([255,128,0,1.0]));
       if (year == "2008")  symbol.setColor(new dojo.Color([128,0,255,1.0]));
       if (year == "2009")  symbol.setColor(new dojo.Color([236,0,140,1.0]));
       if (year == "2010")  symbol.setColor(new dojo.Color([249,173,129,1.0]));
       if (year == "2011")  symbol.setColor(new dojo.Color([255,255,255,1.0]));
       if (year == "2012")  symbol.setColor(new dojo.Color([0,0,0,1.0,1.0]));
       if (year == "2013")  symbol.setColor(new dojo.Color([76,187,23,1.0]));
       if (year == "2014")  symbol.setColor(new dojo.Color([255,215,0],1.0));
       if (year == "2015")  symbol.setColor(new dojo.Color([158,163,157,1.0]));
       if (year == "2016")  symbol.setColor(new dojo.Color([137,112,68,1.0]));

       var geometry = new esri.geometry.Point(longitude, latitude);
       geometry = esri.geometry.geographicToWebMercator(geometry);
       dataLayer.add(new esri.Graphic(geometry, symbol, {id: id, year: year, cruise: cruise, x: lon, y: lat}));
     }

     function initializeCruiseListing()  {
       var content = "";
       var count = 1;
       for (var j=dataLayer.graphics.length-1;j>=0;j--)  {
         graphic = dataLayer.graphics[j];
         var id = graphic.attributes.id;
         var year = graphic.attributes.year;
         var cruise = graphic.attributes.cruise;
         var xPt = graphic.attributes.x;
         var yPt = graphic.attributes.y;
         content += "<li id="+id+" onclick='showCruise("+id+");'onmouseover='highlightFromList("+xPt+","+yPt+");'onmouseout='listHighlightLayer.clear();'><b>"+(count)+")</b> "+year+" - "+cruise+"<br/><u>More Details ...</u></li>";
         count++;
       }
       dojo.byId("itemsList").innerHTML = content;
       // make sure to align the list to the top of the scroll
       //var element = document.getElementById(dataLayer.graphics.length-1);
       //element.className = element.className+" active";
       //alignWithTop = true;
       //element.scrollIntoView(alignWithTop)
     }

     // handle generating the infowindow based on what cruise (graphic) has been clicked on the map
     function onFeatureClick(evt)  {
       initializeCruiseListing();
       var graphic = evt.graphic;
       if (graphic)  {
         id = graphic.attributes.id;
         var content = "";
         var title = "";
         var cruise_dates = "";
         var summary_html = "";
         var dataAccess_html = "";
         var GISTools_html = "";
         var pub_html = "";
         var eem_html = "";
         
         var element = document.getElementById(id);
         //element.className = element.className+" active";
         alignWithTop = true;
         element.scrollIntoView(alignWithTop)

         var tc = new dijit.layout.TabContainer({ doLayout:false,
           style: "width:100%; height:500px; color:#000000; background-image:none; background-color:transparent;"
           }, dojo.create("div"));

         csvStore.fetchItemByIdentity({identity: id, onItem: function(item)  {
           // retrieve information based on graphic click
           var year = csvStore.getValue(item,"Year");
           var project_principals = csvStore.getValue(item,"Project Principals");
           var cruise = csvStore.getValue(item,"Cruise");
           var vessel = csvStore.getValue(item,"Vessel");
           var months = csvStore.getValue(item,"Cruise Dates");
           var summary = csvStore.getValue(item,"Summary");
           var oe_link = csvStore.getValue(item,"OE_Link");
           var oe_image = csvStore.getValue(item,"OE_Link_Image");
           //var atlas_image = csvStore.getValue(item,"Atlas_image");
           var soo_link = csvStore.getValue(item, "SOO");
           var overview_link = csvStore.getValue(item,"Overview");
           var archive_link = csvStore.getValue(item,"Archive");
           var direct_link = csvStore.getValue(item,"Direct");
           var dive_link = csvStore.getValue(item,"Dive");
           var atlas_link = csvStore.getValue(item,"NCDDC_Link");
           var cruise_id = csvStore.getValue(item,"CruiseID");
           var gis_link = csvStore.getValue(item,"GISMapLayers");
           var eem = csvStore.getValue(item,"EEM");
           var emc = csvStore.getValue(item,"EMC");
           var lesson_plans = csvStore.getValue(item,"Lesson_Plans");
           var educ_focus = csvStore.getValue(item,"Educ_Focus");
           var pub_link = csvStore.getValue(item,"Publications");
           var metadata_link = csvStore.getValue(item,"Metadata");

           title += '<center><b>'+cruise+' - '+year+'</b></center>';
           if (vessel != undefined)  {
             cruise_dates += '<b>Dates:</b>&nbsp;&nbsp;'+months+'&nbsp;&nbsp;<b>Vessel:</b>&nbsp;&nbsp;'+vessel;
           }
           else  {
             cruise_dates += '<b>Dates:</b>&nbsp;&nbsp;'+months;
           }

           // determine contents of summary tab
           if (summary == undefined)  summary_html = "";
           if (oe_link == undefined)  {
             if (metadata_link == undefined)  {
               if (project_principals != undefined)  {
                 if (oe_image == undefined)  {
                   summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p/><b>Project Principals</b><br/>'+project_principals+'<p/><b>Description</b><br/>'+summary+'</div>';
                 }
                 else  {
                   summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p/><b>Project Principals</b><br/>'+project_principals+'<p/><b>Description</b><br/>'+summary+'<p><center><img src="images/oe/'+oe_image+'" width="108" height="71"></center></div>';
                 }
               }
               else  {
                 if (oe_image == undefined)  {
                   summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p/><b>Description</b><br/>'+summary+'</div>';
                 }
                 else  {
                   summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p/><b>Description</b><br/>'+summary+'<p><center><img src="images/oe/'+oe_image+'" width="108" height="71"></center></div>';
                 }
               }
             }
             else  {
               if (project_principals != undefined)  {
                 if (oe_image == undefined)  {
                   summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p/><b>Project Principals</b><br/>'+project_principals+'<p/><b>Description</b><br/>'+summary+'<p/><center><a href="'+metadata_link+'" target="_new"><u><b>Expedition Metadata</b></u></center></a></div>';
                 }
                 else  {
                   summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p/><b>Project Principals</b><br/>'+project_principals+'<p/><b>Description</b><br/>'+summary+'<p/><center><a href="'+metadata_link+'" target="_new"><u><b>Expedition Metadata</b></u></center></a><p><center><img src="images/oe/'+oe_image+'" width="108" height="71"></center></div>';
                 }
               }
               else  {
                 if (oe_image == undefined)  {
                   summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p/><b>Description</b><br/>'+summary+'<p/><center><a href="'+metadata_link+'" target="_new"><u><b>Expedition Metadata</b></u></center></a></div>';
                 }
                 else  {
                   summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p/><b>Description</b><br/>'+summary+'<p/><center><a href="'+metadata_link+'" target="_new"><u><b>Expedition Metadata</b></u></center></a><p><center><img src="images/oe/'+oe_image+'" width="108" height="71"></center></div>';
                 }
               }
             }
           }
           else  {
             if (metadata_link == undefined)  {
               if (project_principals != undefined)  {
                 summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p/><b>Project Principals</b><br/>'+project_principals+'<p/><b>Description</b><br/>'+summary+'<p/><center><a href="'+oe_link+'" target="_new"><u><b>Expedition Web Site</b></u></center></a><p><center><img src="images/oe/'+oe_image+'" width="108" height="71"></center></div>';
               }
               else  {
                 summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p/><b>Description</b><br/>'+summary+'<p/><center><a href="'+oe_link+'" target="_new"><u><b>Expedition Web Site</b></u></center></a><p/><center><img src="images/oe/'+oe_image+'" width="108" height="71"></center></div>';
               }
             }
             else  {
               if (project_principals != undefined)  {
                 summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p/><b>Project Principals</b><br/>'+project_principals+'<p/><b>Description</b><br/>'+summary+'<p/><center><a href="'+oe_link+'" target="_new"><u><b>Expedition Web Site</b></u></a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+metadata_link+'" target="_new"><u><b>Expedition Metadata</b></u></center></a><p/><center><img src="images/oe/'+oe_image+'" width="108" height="71"></center></div>';
               }
               else  {
                 summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p><b>Description</b><br/>'+summary+'<p/><center><a href="'+oe_link+'" target="_new"><u><b>Expedition Web Site</b></u></a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+metadata_link+'" target="_new"><u><b>Expedition Metadata</b></u></center></a><p/><center><img src="images/oe/'+oe_image+'" width="108" height="71"></center></div>';
               }
             }
           }
           var cp1 = new dijit.layout.ContentPane({title: "Summary", content: summary_html});
           tc.addChild(cp1);

           // determine if data access tab must be added
           if ((overview_link != undefined) || (archive_link != undefined) || (direct_link != undefined) || (dive_link != undefined) || (soo_link != undefined))  {
             dataAccess_html += '<p>';
             //dataAccess_html += '<div class="OEinfoWindow">Our goal is to fully document OER data collections and to make the information easily accessible. Self-service information is linked below. If you need assistance, contact the OER Information Management Team (<a href="mailto:oer.info.mgmt@noaa.gov" title="Email OER IMT"><font color="black"><u>oer.info.mgmt@noaa.gov</u></a></font>).<p>';
             dataAccess_html += '<div class="OEinfoWindow">Self service information is linked below. If you do not find what you are looking for, please fill out this <a href="javascript:SubmissionForm();"><font color="red"><u>form</u></font></a>.<p>';
             dataAccess_html += '<p/>';
             dataAccess_html += '<table class="smallText3" colspan="2" align="left" border="1">';
             if (overview_link != undefined)  {
               dataAccess_html += '<tr bgcolor="yellow"><td width="350"><b>Cruise Summary Products</b></td><td></td></tr>';
               if (overview_link.indexOf("|") != -1)  {
                 arrayOfCollections = overview_link.split("|");
                 for (var i=0;i<arrayOfCollections.length;i++)  {
                   arrayOfEntries = arrayOfCollections[i].split(";");
                   dataAccess_html += '<tr><td width="350">'+arrayOfEntries[0]+'</td><td width="75"><a href="javascript:launchDataLink(\''+arrayOfEntries[3]+'\')" title="'+arrayOfEntries[2]+'"><font color="blue"><u>'+arrayOfEntries[1]+'</u></a></font></td></tr>';
                 }
               }
               else  {
                 arrayOfEntries = overview_link.split(";");
                 dataAccess_html += '<tr><td width="350">'+arrayOfEntries[0]+'</td><td width="75"><a href="javascript:launchDataLink(\''+arrayOfEntries[3]+'\')" title="'+arrayOfEntries[2]+'"><font color="blue"><u>'+arrayOfEntries[1]+'</u></a></font></td></tr>';
               }
             }                      
             if (archive_link != undefined)  {
               dataAccess_html += '<tr bgcolor="yellow"><td width="350"><b>Archived Collections</b></td><td></td></tr>';
               if (archive_link.indexOf("|") != -1)  {
                 arrayOfCollections = archive_link.split("|");
                 for (var i=0;i<arrayOfCollections.length;i++)  {
                   arrayOfEntries = arrayOfCollections[i].split(";");
                   dataAccess_html += '<tr><td width="350">'+arrayOfEntries[0]+'</td><td width="75"><a href="javascript:launchDataLink(\''+arrayOfEntries[3]+'\')" title="'+arrayOfEntries[2]+'"><font color="blue"><u>'+arrayOfEntries[1]+'</u></a></font></td></tr>';
                 }
               }
               else  {
                 arrayOfEntries = archive_link.split(";");
                 dataAccess_html += '<tr><td width="350">'+arrayOfEntries[0]+'</td><td width="75"><a href="javascript:launchDataLink(\''+arrayOfEntries[3]+'\')" title="'+arrayOfEntries[2]+'"><font color="blue"><u>'+arrayOfEntries[1]+'</u></a></font></td></tr>';
               }
             }
             if (direct_link != undefined)  {
               dataAccess_html += '<tr bgcolor="yellow"><td width="350"><b>Selected Data Sets</b></td><td></td></tr>';
               if (direct_link.indexOf("|") != -1)  {
                 arrayOfCollections = direct_link.split("|");
                 for (var i=0;i<arrayOfCollections.length;i++)  {
                   arrayOfEntries = arrayOfCollections[i].split(";");
                   dataAccess_html += '<tr><td width="350">'+arrayOfEntries[0]+'</td><td width="75"><a href="javascript:launchDataLink(\''+arrayOfEntries[3]+'\')" title="'+arrayOfEntries[2]+'"><font color="blue"><u>'+arrayOfEntries[1]+'</u></a></font></td></tr>';
                 }
               }
               else  {
                 arrayOfEntries = direct_link.split(";");
                 dataAccess_html += '<tr><td width="350">'+arrayOfEntries[0]+'</td><td width="75"><a href="javascript:launchDataLink(\''+arrayOfEntries[3]+'\')" title="'+arrayOfEntries[2]+'"><font color="blue"><u>'+arrayOfEntries[1]+'</u></a></font></td></tr>';
               }
             }
             if (dive_link != undefined)  {
               dataAccess_html += '<tr bgcolor="yellow"><td width="350"><b>Dive Information</b></td><td></td></tr>';
               if (dive_link.indexOf("|") != -1)  {
                 arrayOfCollections = dive_link.split("|");
                 for (var i=0;i<arrayOfCollections.length;i++)  {
                   arrayOfEntries = arrayOfCollections[i].split(";");
                   dataAccess_html += '<tr><td width="350">'+arrayOfEntries[0]+'</td><td width="75"><a href="javascript:launchDataLink(\''+arrayOfEntries[3]+'\')" title="'+arrayOfEntries[2]+'"><font color="blue"><u>'+arrayOfEntries[1]+'</u></a></font></td></tr>';
                 }
               }
               else  {
                 arrayOfEntries = dive_link.split(";");
                 dataAccess_html += '<tr><td width="350">'+arrayOfEntries[0]+'</td><td width="75"><a href="javascript:launchDataLink(\''+arrayOfEntries[3]+'\')" title="'+arrayOfEntries[2]+'"><font color="blue"><u>'+arrayOfEntries[1]+'</u></a></font></td></tr>';
               }
             }
             if (soo_link != undefined)  {
               dataAccess_html += '<tr bgcolor="yellow"><td width="350"><b>Surveys of Opportunity</b></td><td></td></tr>';
               if (soo_link.indexOf("|") != -1)  {
                 arrayOfCollections = soo_link.split("|");
                 for (var i=0;i<arrayOfCollections.length;i++)  {
                   arrayOfEntries = arrayOfCollections[i].split(";");
                   dataAccess_html += '<tr><td width="350">'+arrayOfEntries[0]+'</td><td width="75"><a href="javascript:launchDataLink(\''+arrayOfEntries[3]+'\')" title="'+arrayOfEntries[2]+'"><font color="blue"><u>'+arrayOfEntries[1]+'</u></a></font></td></tr>';
                 }
               }
               else  {
                 arrayOfEntries = soo_link.split(";");
                 dataAccess_html += '<tr><td width="350">'+arrayOfEntries[0]+'</td><td width="75"><a href="javascript:launchDataLink(\''+arrayOfEntries[3]+'\')" title="'+arrayOfEntries[2]+'"><font color="blue"><u>'+arrayOfEntries[1]+'</u></a></font></td></tr>';
               }
             }
             //dataAccess_html += '<tr bgcolor="gray"><td width="350" height="10"></td><td></td></tr>';
             dataAccess_html += '</table>';
             dataAccess_html += '</div>';
           }
           if (dataAccess_html.length != 0)  {
             var cp2 = new dijit.layout.ContentPane({title: "Data Access", content: dataAccess_html});
             tc.addChild(cp2);
           }

           // determine if GIS Tools tab needs to be created
           if ((atlas_link != undefined) || (gis_link != undefined))  {
             GISTools_html += '<p>';
             GISTools_html += '<div class="OEinfoWindow">';
             if (navigator.appVersion.indexOf("MSIE") != -1)  {
               if (gis_link != undefined) {
                 GISTools_html += '<table class="smallText3" colspan="4" align="left">';
                 //findMapService = gis_link.split(";");
                 //mapService = "&#39;" + findMapService[1] + "&#39;";
                 GISTools_html += '<tr><td width="75"><b>Data Sets:</b></td><td></td><td></td><td width="100" align="right"><button dojotype="dijit.form.Button" type="button" name="add gis data" onClick="plotDataToMap();showCruisePoint('+id+');">Plot on Map</button></td></tr>';
                 if (gis_link.indexOf("|") != -1)  {
                   arrayOfGISLayers = gis_link.split("|");
                   for (var i=0;i<arrayOfGISLayers.length;i++) {
                     arrayOfDatasets = arrayOfGISLayers[i].split(";");
                     GISTools_html += '<tr><td align="right"><input type="checkbox" class="list_item" id="'+arrayOfDatasets[2]+'" name="'+arrayOfDatasets[0]+'" value='+arrayOfDatasets[1]+'></td><td width="100">'+arrayOfDatasets[0]+'</td><td align="left" valign="center" width="75"><img src="images/GISsymbols/'+arrayOfDatasets[3]+'"></td><td></td></tr>';
                   }
                 }
                 else {
                   arrayOfDatasets = gis_link.split(";");
                   GISTools_html += '<tr><td align="right"><input type="checkbox" class="list_item" id="'+arrayOfDatasets[2]+'" name="'+arrayOfDatasets[0]+'" value='+arrayOfDatasets[1]+'></td><td width="100">'+arrayOfDatasets[0]+'</td><td align="left" valign="center" width="75"><img src="images/GISsymbols/'+arrayOfDatasets[3]+'"></td><td></td></tr>';
                 }
                 GISTools_html += '</table>';
                 GISTools_html += '<p>';
               }
               if (atlas_link != undefined) {
                 if (cruise.indexOf("AUV") != -1)  {
                   GISTools_html += '<table class="smallText3" colspan="2" align="left">';
                   GISTools_html += '<tr><td width="250"><b>In-depth Map:</b></td><td width="100" align="right"><button dojotype="dijit.form.Button" type="button" name="add map" onClick="launchGoogleMap(\''+atlas_link+'\')">Launch</button></td></tr>';
                   GISTools_html += '</table>';
                   GISTools_html += '</div>';
                 }
                 if (cruise.indexOf("Okeanos Explorer") != -1)  {
                   GISTools_html += '<table class="smallText3" colspan="2" align="left">';
                   GISTools_html += '<tr><td width="250"><b>In-depth Map:</b></td><td width="100" align="right"><button dojotype="dijit.form.Button" type="button" name="add EX map" onClick="launchOEGoogleMap(\''+atlas_link+'\')">Launch</button></td></tr>';
                   GISTools_html += '</table>';
                 }
               }
             }
             else {
               if (gis_link != undefined) {
                 GISTools_html += '<table class="smallText3" colspan="4" align="left">';
                 //findMapService = gis_link.split(";");
                 //mapService = "&apos;" + findMapService[1] + "&apos;";
                 GISTools_html += '<tr><td width="75"><b>Data Sets:</b></td><td></td><td></td><td width="100" align="right"><button dojotype="dijit.form.Button" type="button" name="add gis data" onClick="plotDataToMap();showCruisePoint('+id+');">Plot on Map</button></td></tr>';
                 if (gis_link.indexOf("|") != -1)  {
                   arrayOfGISLayers = gis_link.split("|");
                   for (var i=0;i<arrayOfGISLayers.length;i++) {
                     arrayOfDatasets = arrayOfGISLayers[i].split(";");
                     GISTools_html += '<tr><td align="right"><input type="checkbox" class="list_item" id="'+arrayOfDatasets[2]+'" name="'+arrayOfDatasets[0]+'" value='+arrayOfDatasets[1]+'></td><td width="100">'+arrayOfDatasets[0]+'</td><td align="left" valign="center" width="75"><img src="images/GISsymbols/'+arrayOfDatasets[3]+'"></td><td></td></tr>';
                   }
                 }
                 else {
                   arrayOfDatasets = gis_link.split(";");
                   GISTools_html += '<tr><td align="right"><input type="checkbox" class="list_item" id="'+arrayOfDatasets[2]+'" name="'+arrayOfDatasets[0]+'" value='+arrayOfDatasets[1]+'></td><td width="100">'+arrayOfDatasets[0]+'</td><td align="left" valign="center" width="75"><img src="images/GISsymbols/'+arrayOfDatasets[3]+'"></td><td></td></tr>';
                 }
                 GISTools_html += '</table>';
                 GISTools_html += '<p>';
               }
               if (atlas_link != undefined) {
                 if (cruise.indexOf("AUV") != -1)  {
                   GISTools_html += '<table class="smallText3" colspan="2" align="left">';
                   GISTools_html += '<tr><td width="250"><b>In-depth Map:</b></td><td width="100" align="right"><button dojotype="dijit.form.Button" type="button" name="add map" onClick="launchGoogleMap(\''+atlas_link+'\')">Launch</button></td></tr>';
                   GISTools_html += '</table>';
                   GISTools_html += '</div>';
                 }
                 if (cruise.indexOf("Okeanos Explorer") != -1)  {
                   GISTools_html += '<table class="smallText3" colspan="2" align="left">';
                   GISTools_html += '<tr><td width="250"><b>In-depth Map:</b></td><td width="100" align="right"><button dojotype="dijit.form.Button" type="button" name="add EX map" onClick="launchOEGoogleMap(\''+atlas_link+'\')">Launch</button></td></tr>';
                   GISTools_html += '</table>';
                 }
               }
             }
             GISTools_html += '</div>';
           }
           if (GISTools_html.length != 0)  {
             var cp3 = new dijit.layout.ContentPane({title: "GIS Tools", content: GISTools_html});
             tc.addChild(cp3);
           }

           // determine if Publication tab needs to be created
           if (pub_link != undefined)  {
             pub_html += '<p>';
             pub_html += '<div class="OEinfoWindow">The NOAA Central Library is developing a bibliography of the peer-reviewed journal articles from cruises sponsored by NOAA&apos;s Office of Ocean Exploration and Research.  The publications resulting from this cruise can be found below.<p>';
             pub_html += '<table class="smallText3" colspan="2" align="left">';
             pub_html += '<tr><td width="200"><b>Find Publication:</b></td><td><a href="javascript:launchPublications(\''+pub_link+'\')">  <u>Click to Access</u></a></td></tr>';
             pub_html += '</table></div>';
           }
           if (pub_html.length != 0)  {
             var cp4 = new dijit.layout.ContentPane({title: "Publications", content: pub_html});
             tc.addChild(cp4);
           }

           // determine if Education tab needs to be created
           if ((emc != undefined) || (eem != undefined) || (lesson_plans != undefined) || (educ_focus != undefined))  {
             var iYear = parseInt(year);
             if (iYear < 2006)  {
               if (emc != undefined) {
                 eem_html += '<p>';
                 eem_html += '<div class="OEinfoWindow">';
                 eem_html += 'Educators and scientists worked with NOAA to develop a series of lesson plans for students in Grades 5 - 12 that share the excitement of daily at-sea discoveries and the science behind NOAA&apos;s major ocean exploration expeditions.  All lessons are correlated to the National Science Education Standards.<p>';
                 eem_html += '<b>Link to the Education page for this mission:</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:launchEEM(\''+emc+'\')"><u>Click to Access</u></a>';
               }
               if (lesson_plans != undefined) {
                 eem_html += '<p>';
                 eem_html += '<b>Link to Lesson Plans for Grades 5-12 in this EEM:</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:launchEEM(\''+lesson_plans+'\')"><u>Click to Access</u></a>';
                 eem_html += '<p>';
               }
               if (educ_focus != undefined)  {
                 eem_html += '<p>';
                 eem_html += 'For additional information and lessons about deep-sea ecology in the Gulf of Mexico, see <b>Lessons from the Deep: Exploring the Gulf of Mexico\'s Deep-Sea Ecosystems Education Materials Collection (EMC).</b><p>';
                 eem_html += '<b>Link to Gulf of Mexico EMC:</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:launchEEM(\''+educ_focus+'\')"><u>Click to Access</u></a>';
               }
               eem_html += '</div>';
             }
             else {
               if (cruise.indexOf("Okeanos Explorer") != -1)  {
                 eem_html += '<div class="OEinfoWindow">';
                 if (eem != undefined)  {
                   eem_html += '<b>Ocean Explorer Expedition Education Modules (EEM)</b> are education resources that share the excitement of daily at-sea discoveries and the science behind NOAA\'s major ocean exploration expeditions.  Each module includes background information about the expedition, lesson plans, Multimedia Discovery Missions, OceanAGE Career Connections, and a list of additional resources and links.<p>';
                   eem_html += '<b>Link to EEM:</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:launchEEM(\''+eem+'\')"><u>Click to Access</u></a>';
                   eem_html += '<p>';
                 }
                 if (lesson_plans != undefined) {
                   eem_html += '<p>';
                   eem_html += '<b>Link to Lesson Plans for Grades 5-12 in this EEM:</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:launchEEM(\''+lesson_plans+'\')"><u>Click to Access</u></a>';
                   eem_html += '<p>';
                 }
                 if (emc != undefined)  {
                   eem_html += '<b>The <i>Okeanos Explorer</i> Education Materials Collection (EMC)</b> was developed to encourage educators and students to become personally involved with the voyages and discoveries of the <i>Okeanos Explorer</i>.  This collection of standards-based lessons, activities, and background information is being presented in two volumes: Volume 1: Why Do We Explore?, Volume 2: How Do We Explore?<p>';
                   eem_html += '<b>Link to <i>Okeanos Explorer</i> EMC:</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:launchEEM(\''+emc+'\')"><u>Click to Access</u></a>';
                   eem_html += '<p>';
                 }
                 if (educ_focus != undefined)  {
                   eem_html += 'For additional information and lessons about deep-sea ecology in the Gulf of Mexico, see <b>Lessons from the Deep: Exploring the Gulf of Mexico\'s Deep-Sea Ecosystems Education Materials Collection (EMC).</b><p>';
                   eem_html += '<b>Link to Gulf of Mexico EMC:</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:launchEEM(\''+educ_focus+'\')"><u>Click to Access</u></a>';
                 }
                 eem_html += '</div>';
               }
               else  {
                 eem_html += '<div class="OEinfoWindow">';
                 if (eem != undefined)  {
                   eem_html += '<b>Ocean Explorer Expedition Education Modules (EEM)</b> are education resources that share the excitement of daily at-sea discoveries and the science behind NOAA\'s major ocean exploration expeditions.  Each module includes background information about the expedition, lesson plans, Multimedia Discovery Missions, OceanAGE Career Connections, and a list of additional resources and links.<p>';
                   eem_html += '<b>Link to EEM:</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:launchEEM(\''+eem+'\')"> <u>Click to Access</u></a>';
                 }
                 if (lesson_plans != undefined) {
                   eem_html += '<p>';
                   eem_html += '<b>Link to Lesson Plans for Grades 5-12 in this EEM:</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:launchEEM(\''+lesson_plans+'\')"><u>Click to Access</u></a>';
                 }
                 if (educ_focus != undefined) {
                   eem_html += '<p>';
                   eem_html += 'For additional information and lessons about deep-sea ecology in the Gulf of Mexico, see <b>Lessons from the Deep: Exploring the Gulf of Mexico\'s Deep-Sea Ecosystems Education Materials Collection (EMC).</b><p>';
                   eem_html += '<b>Link to Gulf of Mexico EMC:</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:launchEEM(\''+educ_focus+'\')"><u>Click to Access</u></a>';
                 }
                 if (emc != undefined) {
                   eem_html += '<p>';
                   eem_html += 'Educators and scientists worked with NOAA to develop a series of lesson plans for students in Grades 5 - 12 that share the excitement of daily at-sea discoveries and the science behind NOAA&apos;s major ocean exploration expeditions.  All lessons are correlated to the National Science Education Standards.<p>';
                   eem_html += '<b>Link to the Education page for this mission:</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:launchEEM(\''+emc+'\')"><u>Click to Access</u></a>';
                 }
                 eem_html += '</div>';
               }
             }
           }

           if (eem_html.length != 0)  {
             var cp5 = new dijit.layout.ContentPane({title: "Education", content: eem_html});
             tc.addChild(cp5);
           }
           tc.domNode;
         }
         });
         // remove any previously plotted GIS layers
         var layersOnMap = map.layerIds.length;
         if (layersOnMap > 1)  {
           map.removeAllLayers();
           map.addLayer(basemap);
           map.addLayer(basemapReference);
           map.addLayer(hoverTextLayer);
           map.addLayer(highlightLayer);
           map.addLayer(dataLayer);
           map.addLayer(listHighlightLayer);
         }
         if (hoverTextLayer != undefined)  hoverTextLayer.clear();
         if (highlightLayer != undefined)  highlightLayer.clear();
         if (listHighlightLayer != undefined)  listHighlightLayer.clear();
         map.infoWindow.hide();
         map.infoWindow.resize(475,400);
         map.infoWindow.setTitle(title);
         map.infoWindow.setContent(tc.domNode);
         map.infoWindow.setFixedAnchor(esri.dijit.InfoWindow.ANCHOR_UPPERRIGHT);
         var maxPoint = new esri.geometry.Point(map.extent.xmax, map.extent.ymax, new esri.SpatialReference({wkid: 3857}));
         var centerPoint = new esri.geometry.Point(map.extent.getCenter());
         var maxPointScreen = map.toScreen(maxPoint);
         var centerPointScreen = map.toScreen(centerPoint);
         var xDiff = Math.abs(maxPointScreen.x - evt.screenPoint.x) - 505;
         var yDiff = Math.abs(maxPointScreen.y - evt.screenPoint.y) - 485;
         if (xDiff < 0)  {centerPointScreen.x -= xDiff;}
         if (yDiff < 0)  {centerPointScreen.y += yDiff;}
         centerPoint = map.toMap(centerPointScreen);
         map.centerAt(centerPoint);
         map.infoWindow.show(evt.screenPoint, esri.dijit.InfoWindow.ANCHOR_UPPERRIGHT);
       }
     }

     // handle generating the infowindow based on what cruise has been selected from the right pane list
     function showCruise(id)  {

       var content = "";
       var title = "";
       var cruise_dates = "";
       var summary_html = "";
       var dataAccess_html = "";
       var GISTools_html = "";
       var pub_html = "";
       var eem_html = "";

       var tc = new dijit.layout.TabContainer({ doLayout:false,
         style: "width:100%; height:500px; color:#000000; background-image:none; background-color:transparent;"
         }, dojo.create("div"));

       csvStore.fetchItemByIdentity({identity: id, onItem: function(item)  {
         // retrieve information based on graphic click
         var year = csvStore.getValue(item,"Year");
         var project_principals = csvStore.getValue(item,"Project Principals");
         var cruise = csvStore.getValue(item,"Cruise");
         var vessel = csvStore.getValue(item,"Vessel");
         var months = csvStore.getValue(item,"Cruise Dates");
         var summary = csvStore.getValue(item,"Summary");
         var oe_link = csvStore.getValue(item,"OE_Link");
         var oe_image = csvStore.getValue(item,"OE_Link_Image");
         //var atlas_image = csvStore.getValue(item,"Atlas_image");
         var soo_link = csvStore.getValue(item, "SOO");
         var overview_link = csvStore.getValue(item,"Overview");
         var archive_link = csvStore.getValue(item,"Archive");
         var direct_link = csvStore.getValue(item,"Direct");
         var dive_link = csvStore.getValue(item,"Dive");
         var atlas_link = csvStore.getValue(item,"NCDDC_Link");
         var cruise_id = csvStore.getValue(item,"CruiseID");
         var gis_link = csvStore.getValue(item,"GISMapLayers");
         var eem = csvStore.getValue(item,"EEM");
         var emc = csvStore.getValue(item,"EMC");
         var lesson_plans = csvStore.getValue(item,"Lesson_Plans");
         var educ_focus = csvStore.getValue(item,"Educ_Focus");
         var pub_link = csvStore.getValue(item,"Publications");
         var metadata_link = csvStore.getValue(item,"Metadata");

         title += '<center><b>'+cruise+' - '+year+'</b></center>';
         if (vessel != undefined)  {
           cruise_dates += '<b>Dates:</b>&nbsp;&nbsp;'+months+'&nbsp;&nbsp;<b>Vessel:</b>&nbsp;&nbsp;'+vessel;
         }
         else  {
           cruise_dates += '<b>Dates:</b>&nbsp;&nbsp;'+months;
         }

         // determine contents of summary tab
         if (summary == undefined)  summary_html = "";
         if (oe_link == undefined)  {
           if (metadata_link == undefined)  {
             if (project_principals != undefined)  {
               if (oe_image == undefined)  {
                 summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p/><b>Project Principals</b><br/>'+project_principals+'<p/><b>Description</b><br/>'+summary+'</div>';
               }
               else  {
                 summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p/><b>Project Principals</b><br/>'+project_principals+'<p/><b>Description</b><br/>'+summary+'<p><center><img src="images/oe/'+oe_image+'" width="108" height="71"></center></div>';
               }
             }
             else  {
               if (oe_image == undefined)  {
                 summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p/><b>Description</b><br/>'+summary+'</div>';
               }
               else  {
                 summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p/><b>Description</b><br/>'+summary+'<p><center><img src="images/oe/'+oe_image+'" width="108" height="71"></center></div>';
               }
             }
           }
           else  {
             if (project_principals != undefined)  {
               if (oe_image == undefined)  {
                 summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p/><b>Project Principals</b><br/>'+project_principals+'<p/><b>Description</b><br/>'+summary+'<p/><center><a href="'+metadata_link+'" target="_new"><u><b>Expedition Metadata</b></u></center></a></div>';
               }
               else  {
                 summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p/><b>Project Principals</b><br/>'+project_principals+'<p/><b>Description</b><br/>'+summary+'<p/><center><a href="'+metadata_link+'" target="_new"><u><b>Expedition Metadata</b></u></center></a><p><center><img src="images/oe/'+oe_image+'" width="108" height="71"></center></div>';
               }
             }
             else  {
               if (oe_image == undefined)  {
                 summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p/><b>Description</b><br/>'+summary+'<p/><center><a href="'+metadata_link+'" target="_new"><u><b>Expedition Metadata</b></u></center></a></div>';
               }
               else  {
                 summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p/><b>Description</b><br/>'+summary+'<p/><center><a href="'+metadata_link+'" target="_new"><u><b>Expedition Metadata</b></u></center></a><p><center><img src="images/oe/'+oe_image+'" width="108" height="71"></center></div>';
               }
             }
           }
         }
         else  {
           if (metadata_link == undefined)  {
             if (project_principals != undefined)  {
               summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p/><b>Project Principals</b><br/>'+project_principals+'<p/><b>Description</b><br/>'+summary+'<p/><center><a href="'+oe_link+'" target="_new"><u><b>Expedition Web Site</b></u></center></a><p><center><img src="images/oe/'+oe_image+'" width="108" height="71"></center></div>';
             }
             else  {
               summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p/><b>Description</b><br/>'+summary+'<p/><center><a href="'+oe_link+'" target="_new"><u><b>Expedition Web Site</b></u></center></a><p/><center><img src="images/oe/'+oe_image+'" width="108" height="71"></center></div>';
             }
           }
           else  {
             if (project_principals != undefined)  {
               summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p/><b>Project Principals</b><br/>'+project_principals+'<p/><b>Description</b><br/>'+summary+'<p/><center><a href="'+oe_link+'" target="_new"><u><b>Expedition Web Site</b></u></a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+metadata_link+'" target="_new"><u><b>Expedition Metadata</b></u></center></a><p/><center><img src="images/oe/'+oe_image+'" width="108" height="71"></center></div>';
             }
             else  {
               summary_html += '<div class="OEinfoWindow">'+cruise_dates+'<p><b>Description</b><br/>'+summary+'<p/><center><a href="'+oe_link+'" target="_new"><u><b>Expedition Web Site</b></u></a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="'+metadata_link+'" target="_new"><u><b>Expedition Metadata</b></u></center></a><p/><center><img src="images/oe/'+oe_image+'" width="108" height="71"></center></div>';
             }
           }
         }
         var cp1 = new dijit.layout.ContentPane({title: "Summary", content: summary_html});
         tc.addChild(cp1);

         // determine if data access tab must be added
         if ((overview_link != undefined) || (archive_link != undefined) || (direct_link != undefined) || (dive_link != undefined) || (soo_link != undefined))  {
           dataAccess_html += '<p>';
           //dataAccess_html += '<div class="OEinfoWindow">Our goal is to fully document OER data collections and to make the information easily accessible. Self-service information is linked below. If you need assistance, contact the OER Information Management Team (<a href="mailto:oer.info.mgmt@noaa.gov" title="Email OER IMT"><font color="black"><u>oer.info.mgmt@noaa.gov</u></a></font>).<p>';
           dataAccess_html += '<div class="OEinfoWindow">Self service information is linked below. If you do not find what you are looking for, please fill out this <a href="javascript:SubmissionForm();"><font color="red"><u>form</u></font></a>.<p>';
           dataAccess_html += '<p/>';
           dataAccess_html += '<table class="smallText3" colspan="2" align="left" border="1">';
           if (overview_link != undefined)  {
             dataAccess_html += '<tr bgcolor="yellow"><td width="350"><b>Cruise Summary Products</b></td><td></td></tr>';
             if (overview_link.indexOf("|") != -1)  {
               arrayOfCollections = overview_link.split("|");
               for (var i=0;i<arrayOfCollections.length;i++)  {
                 arrayOfEntries = arrayOfCollections[i].split(";");
                 dataAccess_html += '<tr><td width="350">'+arrayOfEntries[0]+'</td><td width="75"><a href="javascript:launchDataLink(\''+arrayOfEntries[3]+'\')" title="'+arrayOfEntries[2]+'"><font color="blue"><u>'+arrayOfEntries[1]+'</u></a></font></td></tr>';
               }
             }
             else  {
               arrayOfEntries = overview_link.split(";");
               dataAccess_html += '<tr><td width="350">'+arrayOfEntries[0]+'</td><td width="75"><a href="javascript:launchDataLink(\''+arrayOfEntries[3]+'\')" title="'+arrayOfEntries[2]+'"><font color="blue"><u>'+arrayOfEntries[1]+'</u></a></font></td></tr>';
             }
           }                      
           if (archive_link != undefined)  {
             dataAccess_html += '<tr bgcolor="yellow"><td width="350"><b>Archived Collections</b></td><td></td></tr>';
             if (archive_link.indexOf("|") != -1)  {
               arrayOfCollections = archive_link.split("|");
               for (var i=0;i<arrayOfCollections.length;i++)  {
                 arrayOfEntries = arrayOfCollections[i].split(";");
                 dataAccess_html += '<tr><td width="350">'+arrayOfEntries[0]+'</td><td width="75"><a href="javascript:launchDataLink(\''+arrayOfEntries[3]+'\')" title="'+arrayOfEntries[2]+'"><font color="blue"><u>'+arrayOfEntries[1]+'</u></a></font></td></tr>';
               }
             }
             else  {
               arrayOfEntries = archive_link.split(";");
               dataAccess_html += '<tr><td width="350">'+arrayOfEntries[0]+'</td><td width="75"><a href="javascript:launchDataLink(\''+arrayOfEntries[3]+'\')" title="'+arrayOfEntries[2]+'"><font color="blue"><u>'+arrayOfEntries[1]+'</u></a></font></td></tr>';
             }
           }
           if (direct_link != undefined)  {
             dataAccess_html += '<tr bgcolor="yellow"><td width="350"><b>Selected Data Sets</b></td><td></td></tr>';
             if (direct_link.indexOf("|") != -1)  {
               arrayOfCollections = direct_link.split("|");
               for (var i=0;i<arrayOfCollections.length;i++)  {
                 arrayOfEntries = arrayOfCollections[i].split(";");
                 dataAccess_html += '<tr><td width="350">'+arrayOfEntries[0]+'</td><td width="75"><a href="javascript:launchDataLink(\''+arrayOfEntries[3]+'\')" title="'+arrayOfEntries[2]+'"><font color="blue"><u>'+arrayOfEntries[1]+'</u></a></font></td></tr>';
               }
             }
             else  {
               arrayOfEntries = direct_link.split(";");
               dataAccess_html += '<tr><td width="350">'+arrayOfEntries[0]+'</td><td width="75"><a href="javascript:launchDataLink(\''+arrayOfEntries[3]+'\')" title="'+arrayOfEntries[2]+'"><font color="blue"><u>'+arrayOfEntries[1]+'</u></a></font></td></tr>';
             }
           }
           if (dive_link != undefined)  {
             dataAccess_html += '<tr bgcolor="yellow"><td width="350"><b>Dive Information</b></td><td></td></tr>';
             if (dive_link.indexOf("|") != -1)  {
               arrayOfCollections = dive_link.split("|");
               for (var i=0;i<arrayOfCollections.length;i++)  {
                 arrayOfEntries = arrayOfCollections[i].split(";");
                 dataAccess_html += '<tr><td width="350">'+arrayOfEntries[0]+'</td><td width="75"><a href="javascript:launchDataLink(\''+arrayOfEntries[3]+'\')" title="'+arrayOfEntries[2]+'"><font color="blue"><u>'+arrayOfEntries[1]+'</u></a></font></td></tr>';
               }
             }
             else  {
               arrayOfEntries = dive_link.split(";");
               dataAccess_html += '<tr><td width="350">'+arrayOfEntries[0]+'</td><td width="75"><a href="javascript:launchDataLink(\''+arrayOfEntries[3]+'\')" title="'+arrayOfEntries[2]+'"><font color="blue"><u>'+arrayOfEntries[1]+'</u></a></font></td></tr>';
             }
           }
           if (soo_link != undefined)  {
             dataAccess_html += '<tr bgcolor="yellow"><td width="350"><b>Surveys of Opportunity</b></td><td></td></tr>';
             if (soo_link.indexOf("|") != -1)  {
               arrayOfCollections = soo_link.split("|");
               for (var i=0;i<arrayOfCollections.length;i++)  {
                 arrayOfEntries = arrayOfCollections[i].split(";");
                 dataAccess_html += '<tr><td width="350">'+arrayOfEntries[0]+'</td><td width="75"><a href="javascript:launchDataLink(\''+arrayOfEntries[3]+'\')" title="'+arrayOfEntries[2]+'"><font color="blue"><u>'+arrayOfEntries[1]+'</u></a></font></td></tr>';
               }
             }
             else  {
               arrayOfEntries = soo_link.split(";");
               dataAccess_html += '<tr><td width="350">'+arrayOfEntries[0]+'</td><td width="75"><a href="javascript:launchDataLink(\''+arrayOfEntries[3]+'\')" title="'+arrayOfEntries[2]+'"><font color="blue"><u>'+arrayOfEntries[1]+'</u></a></font></td></tr>';
             }
           }
           //dataAccess_html += '<tr bgcolor="gray"><td width="350" height="10"></td><td></td></tr>';
           dataAccess_html += '</table>';
           dataAccess_html += '</div>';
         }
         if (dataAccess_html.length != 0)  {
           var cp2 = new dijit.layout.ContentPane({title: "Data Access", content: dataAccess_html});
           tc.addChild(cp2);
         }

         // determine if GIS Tools tab needs to be created
         if ((atlas_link != undefined) || (gis_link != undefined))  {
           GISTools_html += '<p>';
           GISTools_html += '<div class="OEinfoWindow">';
           if (navigator.appVersion.indexOf("MSIE") != -1)  {
             if (gis_link != undefined) {
               GISTools_html += '<table class="smallText3" colspan="4" align="left">';
               //findMapService = gis_link.split(";");
               //mapService = "&#39;" + findMapService[1] + "&#39;";
               GISTools_html += '<tr><td width="75"><b>Data Sets:</b></td><td></td><td></td><td width="100" align="right"><button dojotype="dijit.form.Button" type="button" name="add gis data" onClick="plotDataToMap();showCruisePoint('+id+');">Plot on Map</button></td></tr>';
               if (gis_link.indexOf("|") != -1)  {
                 arrayOfGISLayers = gis_link.split("|");
                 for (var i=0;i<arrayOfGISLayers.length;i++) {
                   arrayOfDatasets = arrayOfGISLayers[i].split(";");
                   GISTools_html += '<tr><td align="right"><input type="checkbox" class="list_item" id="'+arrayOfDatasets[2]+'" name="'+arrayOfDatasets[0]+'" value='+arrayOfDatasets[1]+'></td><td width="100">'+arrayOfDatasets[0]+'</td><td align="left" valign="center" width="75"><img src="images/GISsymbols/'+arrayOfDatasets[3]+'"></td><td></td></tr>';
                 }
               }
               else {
                 arrayOfDatasets = gis_link.split(";");
                 GISTools_html += '<tr><td align="right"><input type="checkbox" class="list_item" id="'+arrayOfDatasets[2]+'" name="'+arrayOfDatasets[0]+'" value='+arrayOfDatasets[1]+'></td><td width="100">'+arrayOfDatasets[0]+'</td><td align="left" valign="center" width="75"><img src="images/GISsymbols/'+arrayOfDatasets[3]+'"></td><td></td></tr>';
               }
               GISTools_html += '</table>';
               GISTools_html += '<p>';
             }
             if (atlas_link != undefined) {
               if (cruise.indexOf("AUV") != -1)  {
                 GISTools_html += '<table class="smallText3" colspan="2" align="left">';
                 GISTools_html += '<tr><td width="250"><b>In-depth Map:</b></td><td width="100" align="right"><button dojotype="dijit.form.Button" type="button" name="add map" onClick="launchGoogleMap(\''+atlas_link+'\')">Launch</button></td></tr>';
                 GISTools_html += '</table>';
                 GISTools_html += '</div>';
               }
               if (cruise.indexOf("Okeanos Explorer") != -1)  {
                 GISTools_html += '<table class="smallText3" colspan="2" align="left">';
                 GISTools_html += '<tr><td width="250"><b>In-depth Map:</b></td><td width="100" align="right"><button dojotype="dijit.form.Button" type="button" name="add EX map" onClick="launchOEGoogleMap(\''+atlas_link+'\')">Launch</button></td></tr>';
                 GISTools_html += '</table>';
               }
             }
           }
           else {
             if (gis_link != undefined) {
               GISTools_html += '<table class="smallText3" colspan="4" align="left">';
               //findMapService = gis_link.split(";");
               //mapService = "&apos;" + findMapService[1] + "&apos;";
               GISTools_html += '<tr><td width="75"><b>Data Sets:</b></td><td></td><td></td><td width="100" align="right"><button dojotype="dijit.form.Button" type="button" name="add gis data" onClick="plotDataToMap();showCruisePoint('+id+');">Plot on Map</button></td></tr>';
               if (gis_link.indexOf("|") != -1)  {
                 arrayOfGISLayers = gis_link.split("|");
                 for (var i=0;i<arrayOfGISLayers.length;i++) {
                   arrayOfDatasets = arrayOfGISLayers[i].split(";");
                   GISTools_html += '<tr><td align="right"><input type="checkbox" class="list_item" id="'+arrayOfDatasets[2]+'" name="'+arrayOfDatasets[0]+'" value='+arrayOfDatasets[1]+'></td><td width="100">'+arrayOfDatasets[0]+'</td><td align="left" valign="center" width="75"><img src="images/GISsymbols/'+arrayOfDatasets[3]+'"></td><td></td></tr>';
                 }
               }
               else {
                 arrayOfDatasets = gis_link.split(";");
                 GISTools_html += '<tr><td align="right"><input type="checkbox" class="list_item" id="'+arrayOfDatasets[2]+'" name="'+arrayOfDatasets[0]+'" value='+arrayOfDatasets[1]+'></td><td width="100">'+arrayOfDatasets[0]+'</td><td align="left" valign="center" width="75"><img src="images/GISsymbols/'+arrayOfDatasets[3]+'"></td><td></td></tr>';
               }
               GISTools_html += '</table>';
               GISTools_html += '<p>';
             }
             if (atlas_link != undefined) {
               if (cruise.indexOf("AUV") != -1)  {
                 GISTools_html += '<table class="smallText3" colspan="2" align="left">';
                 GISTools_html += '<tr><td width="250"><b>In-depth Map:</b></td><td width="100" align="right"><button dojotype="dijit.form.Button" type="button" name="add map" onClick="launchGoogleMap(\''+atlas_link+'\')">Launch</button></td></tr>';
                 GISTools_html += '</table>';
                 GISTools_html += '</div>';
               }
               if (cruise.indexOf("Okeanos Explorer") != -1)  {
                 GISTools_html += '<table class="smallText3" colspan="2" align="left">';
                 GISTools_html += '<tr><td width="250"><b>In-depth Map:</b></td><td width="100" align="right"><button dojotype="dijit.form.Button" type="button" name="add EX map" onClick="launchOEGoogleMap(\''+atlas_link+'\')">Launch</button></td></tr>';
                 GISTools_html += '</table>';
               }
             }
           }
           GISTools_html += '</div>';
         }
         if (GISTools_html.length != 0)  {
           var cp3 = new dijit.layout.ContentPane({title: "GIS Tools", content: GISTools_html});
           tc.addChild(cp3);
         }

         // determine if Publication tab needs to be created
         if (pub_link != undefined)  {
           pub_html += '<p>';
           pub_html += '<div class="OEinfoWindow">The NOAA Central Library is developing a bibliography of the peer-reviewed journal articles from cruises sponsored by NOAA&apos;s Office of Ocean Exploration and Research.  The publications resulting from this cruise can be found below.<p>';
           pub_html += '<table class="smallText3" colspan="2" align="left">';
           pub_html += '<tr><td width="200"><b>Find Publication:</b></td><td><a href="javascript:launchPublications(\''+pub_link+'\')">  <u>Click to Access</u></a></td></tr>';
           pub_html += '</table></div>';
         }
         if (pub_html.length != 0)  {
           var cp4 = new dijit.layout.ContentPane({title: "Publications", content: pub_html});
           tc.addChild(cp4);
         }

         // determine if Education tab needs to be created
         if ((emc != undefined) || (eem != undefined) || (lesson_plans != undefined) || (educ_focus != undefined))  {
           var iYear = parseInt(year);
           if (iYear < 2006)  {
             if (emc != undefined) {
               eem_html += '<p>';
               eem_html += '<div class="OEinfoWindow">';
               eem_html += 'Educators and scientists worked with NOAA to develop a series of lesson plans for students in Grades 5 - 12 that share the excitement of daily at-sea discoveries and the science behind NOAA&apos;s major ocean exploration expeditions.  All lessons are correlated to the National Science Education Standards.<p>';
               eem_html += '<b>Link to the Education page for this mission:</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:launchEEM(\''+emc+'\')"><u>Click to Access</u></a>';
             }
             if (lesson_plans != undefined) {
               eem_html += '<p>';
               eem_html += '<b>Link to Lesson Plans for Grades 5-12 in this EEM:</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:launchEEM(\''+lesson_plans+'\')"><u>Click to Access</u></a>';
               eem_html += '<p>';
             }
             if (educ_focus != undefined)  {
               eem_html += '<p>';
               eem_html += 'For additional information and lessons about deep-sea ecology in the Gulf of Mexico, see <b>Lessons from the Deep: Exploring the Gulf of Mexico\'s Deep-Sea Ecosystems Education Materials Collection (EMC).</b><p>';
               eem_html += '<b>Link to Gulf of Mexico EMC:</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:launchEEM(\''+educ_focus+'\')"><u>Click to Access</u></a>';
             }
             eem_html += '</div>';
           }
           else {
             if (cruise.indexOf("Okeanos Explorer") != -1)  {
               eem_html += '<div class="OEinfoWindow">';
               if (eem != undefined)  {
                 eem_html += '<b>Ocean Explorer Expedition Education Modules (EEM)</b> are education resources that share the excitement of daily at-sea discoveries and the science behind NOAA\'s major ocean exploration expeditions.  Each module includes background information about the expedition, lesson plans, Multimedia Discovery Missions, OceanAGE Career Connections, and a list of additional resources and links.<p>';
                 eem_html += '<b>Link to EEM:</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:launchEEM(\''+eem+'\')"><u>Click to Access</u></a>';
                 eem_html += '<p>';
               }
               if (lesson_plans != undefined) {
                 eem_html += '<p>';
                 eem_html += '<b>Link to Lesson Plans for Grades 5-12 in this EEM:</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:launchEEM(\''+lesson_plans+'\')"><u>Click to Access</u></a>';
                 eem_html += '<p>';
               }
               if (emc != undefined)  {
                 eem_html += '<b>The <i>Okeanos Explorer</i> Education Materials Collection (EMC)</b> was developed to encourage educators and students to become personally involved with the voyages and discoveries of the <i>Okeanos Explorer</i>.  This collection of standards-based lessons, activities, and background information is being presented in two volumes: Volume 1: Why Do We Explore?, Volume 2: How Do We Explore?<p>';
                 eem_html += '<b>Link to <i>Okeanos Explorer</i> EMC:</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:launchEEM(\''+emc+'\')"><u>Click to Access</u></a>';
                 eem_html += '<p>';
               }
               if (educ_focus != undefined)  {
                 eem_html += 'For additional information and lessons about deep-sea ecology in the Gulf of Mexico, see <b>Lessons from the Deep: Exploring the Gulf of Mexico\'s Deep-Sea Ecosystems Education Materials Collection (EMC).</b><p>';
                 eem_html += '<b>Link to Gulf of Mexico EMC:</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:launchEEM(\''+educ_focus+'\')"><u>Click to Access</u></a>';
               }
               eem_html += '</div>';
             }
             else  {
               eem_html += '<div class="OEinfoWindow">';
               if (eem != undefined)  {
                 eem_html += '<b>Ocean Explorer Expedition Education Modules (EEM)</b> are education resources that share the excitement of daily at-sea discoveries and the science behind NOAA\'s major ocean exploration expeditions.  Each module includes background information about the expedition, lesson plans, Multimedia Discovery Missions, OceanAGE Career Connections, and a list of additional resources and links.<p>';
                 eem_html += '<b>Link to EEM:</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:launchEEM(\''+eem+'\')"> <u>Click to Access</u></a>';
               }
               if (lesson_plans != undefined) {
                 eem_html += '<p>';
                 eem_html += '<b>Link to Lesson Plans for Grades 5-12 in this EEM:</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:launchEEM(\''+lesson_plans+'\')"><u>Click to Access</u></a>';
               }
               if (educ_focus != undefined) {
                 eem_html += '<p>';
                 eem_html += 'For additional information and lessons about deep-sea ecology in the Gulf of Mexico, see <b>Lessons from the Deep: Exploring the Gulf of Mexico\'s Deep-Sea Ecosystems Education Materials Collection (EMC).</b><p>';
                 eem_html += '<b>Link to Gulf of Mexico EMC:</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:launchEEM(\''+educ_focus+'\')"><u>Click to Access</u></a>';
               }
               if (emc != undefined) {
                 eem_html += '<p>';
                 eem_html += 'Educators and scientists worked with NOAA to develop a series of lesson plans for students in Grades 5 - 12 that share the excitement of daily at-sea discoveries and the science behind NOAA&apos;s major ocean exploration expeditions.  All lessons are correlated to the National Science Education Standards.<p>';
                 eem_html += '<b>Link to the Education page for this mission:</b>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:launchEEM(\''+emc+'\')"><u>Click to Access</u></a>';
               }
               eem_html += '</div>';
             }
           }
         }

         if (eem_html.length != 0)  {
           var cp5 = new dijit.layout.ContentPane({title: "Education", content: eem_html});
           tc.addChild(cp5);
         }
         tc.domNode;
       }
       });
       dojo.some(dataLayer.graphics, function(graphic) {
         if (graphic.attributes.id === id)  {
           selectedCruise = graphic;
         }
       });
       // remove any previously plotted GIS layers
       var layersOnMap = map.layerIds.length;
       if (layersOnMap > 1)  {
         map.removeAllLayers();
         map.addLayer(basemap);
         map.addLayer(basemapReference);
         map.addLayer(hoverTextLayer);
         map.addLayer(highlightLayer);
         map.addLayer(dataLayer);
         map.addLayer(listHighlightLayer);
       }
       if (hoverTextLayer != undefined)  hoverTextLayer.clear();
       if (highlightLayer != undefined)  highlightLayer.clear();
       if (listHighlightLayer != undefined)  listHighlightLayer.clear();
       map.infoWindow.hide();
       // must calculate an offset in x and y in order for the infoWindow to popup within the map
       var xPt = selectedCruise.geometry.x + 1250000;
       var yPt = selectedCruise.geometry.y + 750000;
       //alert("xPt: " + xPt + " yPt: " + yPt);
       var newCenterPoint = new esri.geometry.Point(xPt, yPt, new esri.SpatialReference({wkid: 3857}));
       map.centerAndZoom(newCenterPoint, 5);
       var sp = map.toScreen(selectedCruise.geometry);
       map.infoWindow.resize(475,400);
       map.infoWindow.setTitle(title);
       map.infoWindow.setContent(tc.domNode);
       map.infoWindow.setFixedAnchor(esri.dijit.InfoWindow.ANCHOR_UPPERRIGHT);
       map.infoWindow.show(selectedCruise.geometry, esri.dijit.InfoWindow.ANCHOR_UPPERRIGHT);
     }


     // launches IMS page into its own window instead of as a tab in the current window
     function launchArcIMS(ims) {
       var Win1 = open(ims,"ArcIMSWindow","height=800,width=1000,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes");
       Win1.focus();
     }

     // launches Google Map page into its own window instead of as a tab in the current window
     function launchGoogleMap(gm) {
       var Win1 = open(gm,"GoogleMapWindow","height=800,width=950,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes");
       Win1.focus();
     }

     // launches Google Map page of Okeanos Explorer into its own window instead of as a tab in the current window
     function launchOEGoogleMap(okeanos) {
       var Win1 = open(okeanos,"OEGoogleMapWindow","height=800,width=1000,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes");
       Win1.focus();
     }

     // launches Publications page into its own window instead of as a tab in the current window
     function launchPublications(pub) {
       var Win1 = open(pub,"","height=800,width=1000,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes");
       Win1.focus();
     }

     // launches EEM page into its own window instead of as a tab in the current window
     function launchEEM(edu_module) {
       var Win1 = open(edu_module,"","height=800,width=1000,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes");
       Win1.focus();
     }

     // displays lat-lon coordinates in lower right corner of map
     function showCoordinates(evt) {
        //get mapPoint from event
        //The map is in web mercator - modify the map point to display the results in geographic
        var mp = esri.geometry.webMercatorToGeographic(evt.mapPoint);
        //display mouse coordinates
        dojo.byId("coords").innerHTML = "<b>Longitude: " + mp.x.toFixed(2) + "&nbsp;&nbsp;&nbsp;&nbsp;Latitude: " + mp.y.toFixed(2) + "</b>";
        //dojo.byId("coords").innerHTML = "<b>X: " + evt.mapPoint.x + "&nbsp;&nbsp;&nbsp;Y: " +evt.mapPoint.y + "</b>";
     }

     function UpdateEnd()  { 
       esri.hide(loading);
     }
 
     function UpdateStart()  {
       esri.show(loading);
     }

     // turns all the year checkboxes to on or off .. if all cruises turned on, rereads cruiseData file
     function searchYears(noYears)  {
       if (noYears == "No")  {
         var content = "";
         dijit.byId('year_2001').setValue(false);
         dijit.byId('year_2002').setValue(false);
         dijit.byId('year_2003').setValue(false);
         dijit.byId('year_2004').setValue(false);
         dijit.byId('year_2005').setValue(false);
         dijit.byId('year_2006').setValue(false);
         dijit.byId('year_2007').setValue(false);
         dijit.byId('year_2008').setValue(false);
         dijit.byId('year_2009').setValue(false);
         dijit.byId('year_2010').setValue(false);
         dijit.byId('year_2011').setValue(false);
         dijit.byId('year_2012').setValue(false);
         dijit.byId('year_2013').setValue(false);
         dijit.byId('year_2014').setValue(false);
         dijit.byId('year_2015').setValue(false);
         dijit.byId('year_2016').setValue(false);
         var cruiseTotals = dijit.byId("yearCounter");
         cruiseTotals.attr("value", "");
         dojo.byId("itemsList").innerHTML = content;
         // remove any previously plotted GIS layers
         var layersOnMap = map.layerIds.length;
         if (layersOnMap > 1)  {
           map.removeAllLayers();
           map.addLayer(basemap);
           map.addLayer(basemapReference);
           map.addLayer(hoverTextLayer);
           map.addLayer(highlightLayer);
           map.addLayer(dataLayer);
           map.addLayer(listHighlightLayer);
         }
         if (hoverTextLayer != undefined) hoverTextLayer.clear();
         if (listHighlightLayer != undefined)  listHighlightLayer.clear();
         if (highlightLayer != undefined)  highlightLayer.clear();

         dataLayer.clear();
         map.infoWindow.hide();
       }
       else  {
         dijit.byId('year_2001').setValue(true);
         dijit.byId('year_2002').setValue(true);
         dijit.byId('year_2003').setValue(true);
         dijit.byId('year_2004').setValue(true);
         dijit.byId('year_2005').setValue(true);
         dijit.byId('year_2006').setValue(true);
         dijit.byId('year_2007').setValue(true);
         dijit.byId('year_2008').setValue(true);
         dijit.byId('year_2009').setValue(true);
         dijit.byId('year_2010').setValue(true);
         dijit.byId('year_2011').setValue(true);
         dijit.byId('year_2012').setValue(true);
         dijit.byId('year_2013').setValue(true);
         dijit.byId('year_2014').setValue(true);
         dijit.byId('year_2015').setValue(true);
         dijit.byId('year_2016').setValue(true);
         // remove any previously plotted GIS layers
         var layersOnMap = map.layerIds.length;
         if (layersOnMap > 1)  {
           map.removeAllLayers();
           map.addLayer(basemap);
           map.addLayer(basemapReference);
           map.addLayer(hoverTextLayer);
           map.addLayer(highlightLayer);
           map.addLayer(dataLayer);
           map.addLayer(listHighlightLayer);
         }
         if (hoverTextLayer != undefined) hoverTextLayer.clear();
         if (listHighlightLayer != undefined)  listHighlightLayer.clear();
         if (highlightLayer != undefined)  highlightLayer.clear();

         dataLayer.clear();
         map.infoWindow.hide();
       
         csvStore.fetch({
           onComplete: function(items, request)  {
             dojo.forEach(items, function(item, index)  {
               var year = csvStore.getValue(item, "Year");
               var cruise = csvStore.getValue(item, "Cruise");
               var latitude = csvStore.getValue(item, "Latitude");
               var longitude = csvStore.getValue(item, "Longitude");
               var id = csvStore.getIdentity(item);
               if (latitude != undefined && longitude != undefined)  {
                 createMarker(id, year, cruise, latitude, longitude);
               }
             });
             initializeCruiseListing();
             dojo.connect(dataLayer, "onClick", onFeatureClick);
             var cruiseTotals = dijit.byId("yearCounter");
             cruiseTotals.attr("value", dataLayer.graphics.length + " Cruises Displayed");
           },
           onError: function(error) {
              dojo.byId("itemsList").innerHTML = "Unable to search the data.";
           }
         });
       }
       map.setExtent(startExtent);
     }

     // based on years selected by checkboxes, plots cruises and populates sidebar
     function searchForSelectedYears()  {
       var year2001 = dijit.byId('year_2001').attr('value');
       var year2002 = dijit.byId('year_2002').attr('value');
       var year2003 = dijit.byId('year_2003').attr('value');
       var year2004 = dijit.byId('year_2004').attr('value');
       var year2005 = dijit.byId('year_2005').attr('value');
       var year2006 = dijit.byId('year_2006').attr('value');
       var year2007 = dijit.byId('year_2007').attr('value');
       var year2008 = dijit.byId('year_2008').attr('value');
       var year2009 = dijit.byId('year_2009').attr('value');
       var year2010 = dijit.byId('year_2010').attr('value');
       var year2011 = dijit.byId('year_2011').attr('value');
       var year2012 = dijit.byId('year_2012').attr('value');
       var year2013 = dijit.byId('year_2013').attr('value');
       var year2014 = dijit.byId('year_2014').attr('value');
       var year2015 = dijit.byId('year_2015').attr('value');
       var year2016 = dijit.byId('year_2016').attr('value');

       // remove any previously plotted GIS layers
       var layersOnMap = map.layerIds.length;
       if (layersOnMap > 1)  {
         map.removeAllLayers();
         map.addLayer(basemap);
         map.addLayer(basemapReference);
         map.addLayer(hoverTextLayer);
         map.addLayer(highlightLayer);
         map.addLayer(dataLayer);
         map.addLayer(listHighlightLayer);
       }
       if (hoverTextLayer != undefined) hoverTextLayer.clear();
       if (listHighlightLayer != undefined)  listHighlightLayer.clear();
       if (highlightLayer != undefined)  highlightLayer.clear();

       dataLayer.clear();
       map.infoWindow.hide();
       
       csvStore.fetch({
         onComplete: function(items, request)  {
           dojo.forEach(items, function(item, index)  {
             var foundIt = false;
             var year = csvStore.getValue(item, "Year");
             var cruise = csvStore.getValue(item, "Cruise");
             var latitude = csvStore.getValue(item, "Latitude");
             var longitude = csvStore.getValue(item, "Longitude");
             var id = csvStore.getIdentity(item);
             if (latitude != undefined && longitude != undefined)  {
               if (year2001 == "true" && year == "2001")  foundIt = true;
               if (year2002 == "true" && year == "2002")  foundIt = true;
               if (year2003 == "true" && year == "2003")  foundIt = true;
               if (year2004 == "true" && year == "2004")  foundIt = true;
               if (year2005 == "true" && year == "2005")  foundIt = true;
               if (year2006 == "true" && year == "2006")  foundIt = true;
               if (year2007 == "true" && year == "2007")  foundIt = true;
               if (year2008 == "true" && year == "2008")  foundIt = true;
               if (year2009 == "true" && year == "2009")  foundIt = true;
               if (year2010 == "true" && year == "2010")  foundIt = true;
               if (year2011 == "true" && year == "2011")  foundIt = true;
               if (year2012 == "true" && year == "2012")  foundIt = true;
               if (year2013 == "true" && year == "2013")  foundIt = true;
               if (year2014 == "true" && year == "2014")  foundIt = true;
               if (year2015 == "true" && year == "2015")  foundIt = true;
               if (year2016 == "true" && year == "2016")  foundIt = true;

               if (foundIt)  {
                 createMarker(id, year, cruise, latitude, longitude);
               }
             }
           });
           initializeCruiseListing();
           dojo.connect(dataLayer, "onClick", onFeatureClick);
           var cruiseTotals = dijit.byId("yearCounter");
           cruiseTotals.attr("value", dataLayer.graphics.length + " Cruises Displayed");
         },
         onError: function(error) {
            dojo.byId("itemsList").innerHTML = "Unable to search the data.";
         }
       });
       map.setExtent(startExtent);
     }

     // turns all the themes checkboxes to on or off .. if all cruises turned on, rereads cruiseData file
     function searchThemes(noThemes)  {
       if (noThemes.indexOf("No") != -1)  {
         var content = "";
         dijit.byId('canyon').setValue(false);
         dijit.byId('cave').setValue(false);
         dijit.byId('fault').setValue(false);
         dijit.byId('seamount').setValue(false);
         dijit.byId('seep').setValue(false);
         dijit.byId('trench').setValue(false);
         dijit.byId('volcano').setValue(false);
         dijit.byId('biodiv').setValue(false);
         dijit.byId('biolum').setValue(false);
         dijit.byId('chemo').setValue(false);
         dijit.byId('corals').setValue(false);
         dijit.byId('habitat').setValue(false);
         dijit.byId('micro').setValue(false);
         dijit.byId('arch').setValue(false);
         dijit.byId('biotech').setValue(false);
         dijit.byId('sampling').setValue(false);
         dijit.byId('diving').setValue(false);
         dijit.byId('mapping').setValue(false);
         dijit.byId('sound').setValue(false);
         dijit.byId('subs').setValue(false);
         dijit.byId('tele').setValue(false);
         dijit.byId('newtech').setValue(false);
         dojo.byId("itemsList").innerHTML = content;
         var cruiseTotals = dijit.byId("themeCounter");
         cruiseTotals.attr("value", "");
         // remove any previously plotted GIS layers
         var layersOnMap = map.layerIds.length;
         if (layersOnMap > 1)  {
           map.removeAllLayers();
           map.addLayer(basemap);
           map.addLayer(basemapReference);
           map.addLayer(hoverTextLayer);
           map.addLayer(highlightLayer);
           map.addLayer(dataLayer);
           map.addLayer(listHighlightLayer);
         }
         if (hoverTextLayer != undefined) hoverTextLayer.clear();
         if (listHighlightLayer != undefined)  listHighlightLayer.clear();
         if (highlightLayer != undefined)  highlightLayer.clear();

         dataLayer.clear();
         map.infoWindow.hide();
       }
       else  {
         dijit.byId('canyon').setValue(true);
         dijit.byId('cave').setValue(true);
         dijit.byId('fault').setValue(true);
         dijit.byId('seamount').setValue(true);
         dijit.byId('seep').setValue(true);
         dijit.byId('trench').setValue(true);
         dijit.byId('volcano').setValue(true);
         dijit.byId('biodiv').setValue(true);
         dijit.byId('biolum').setValue(true);
         dijit.byId('chemo').setValue(true);
         dijit.byId('corals').setValue(true);
         dijit.byId('habitat').setValue(true);
         dijit.byId('micro').setValue(true);
         dijit.byId('arch').setValue(true);
         dijit.byId('biotech').setValue(true);
         dijit.byId('sampling').setValue(true);
         dijit.byId('diving').setValue(true);
         dijit.byId('mapping').setValue(true);
         dijit.byId('sound').setValue(true);
         dijit.byId('subs').setValue(true);
         dijit.byId('tele').setValue(true);
         dijit.byId('newtech').setValue(true);
         // remove any previously plotted GIS layers
         var layersOnMap = map.layerIds.length;
         if (layersOnMap > 1)  {
           map.removeAllLayers();
           map.addLayer(basemap);
           map.addLayer(basemapReference);
           map.addLayer(hoverTextLayer);
           map.addLayer(highlightLayer);
           map.addLayer(dataLayer);
           map.addLayer(listHighlightLayer);
         }
         if (hoverTextLayer != undefined) hoverTextLayer.clear();
         if (listHighlightLayer != undefined)  listHighlightLayer.clear();
         if (highlightLayer != undefined)  highlightLayer.clear();

         dataLayer.clear();
         map.infoWindow.hide();
       
         csvStore.fetch({
           onComplete: function(items, request)  {
             dojo.forEach(items, function(item, index)  {
               var year = csvStore.getValue(item, "Year");
               var cruise = csvStore.getValue(item, "Cruise");
               var latitude = csvStore.getValue(item, "Latitude");
               var longitude = csvStore.getValue(item, "Longitude");
               var id = csvStore.getIdentity(item);
               if (latitude != undefined && longitude != undefined)  {
                 createMarker(id, year, cruise, latitude, longitude);
               }
             });
             initializeCruiseListing();
             dojo.connect(dataLayer, "onClick", onFeatureClick);
             var cruiseTotals = dijit.byId("themeCounter");
             cruiseTotals.attr("value", dataLayer.graphics.length + " Cruises Displayed");
           },
           onError: function(error) {
              dojo.byId("itemsList").innerHTML = "Unable to search the data.";
           }
         });
       }

       map.setExtent(startExtent);
     }

     // based on themes selected by checkboxes, plots cruises and populates sidebar
     function searchForSelectedThemes()  {
       var canyons = dijit.byId('canyon').attr('value');
       var caves = dijit.byId('cave').attr('value');
       var faults = dijit.byId('fault').attr('value');
       var seamounts = dijit.byId('seamount').attr('value');
       var seeps_and_vents = dijit.byId('seep').attr('value');
       var trenches = dijit.byId('trench').attr('value');
       var volcanoes = dijit.byId('volcano').attr('value');
       var biodiversity = dijit.byId('biodiv').attr('value');
       var bioluminescence = dijit.byId('biolum').attr('value');
       var chemosynthetic_communities = dijit.byId('chemo').attr('value');
       var deepsea_corals = dijit.byId('corals').attr('value');
       var habitat_characterizations = dijit.byId('habitat').attr('value');
       var microbiology = dijit.byId('micro').attr('value');
       var marine_archaeology = dijit.byId('arch').attr('value');
       var biotechnology = dijit.byId('biotech').attr('value');
       var scuba_and_technical_diving = dijit.byId('diving').attr('value');
       var sampling_operations = dijit.byId('sampling').attr('value');
       var seafloor_mapping = dijit.byId('mapping').attr('value');
       var sound_and_light = dijit.byId('sound').attr('value');
       var submersibles = dijit.byId('subs').attr('value');
       var telepresence = dijit.byId('tele').attr('value');
       var testing_new_technologies = dijit.byId('newtech').attr('value');

       // remove any previously plotted GIS layers
       var layersOnMap = map.layerIds.length;
       if (layersOnMap > 1)  {
         map.removeAllLayers();
         map.addLayer(basemap);
         map.addLayer(basemapReference);
         map.addLayer(hoverTextLayer);
         map.addLayer(highlightLayer);
         map.addLayer(dataLayer);
         map.addLayer(listHighlightLayer);
       }
       if (hoverTextLayer != undefined) hoverTextLayer.clear();
       if (listHighlightLayer != undefined)  listHighlightLayer.clear();
       if (highlightLayer != undefined)  highlightLayer.clear();

       dataLayer.clear();
       map.infoWindow.hide();
       
       csvStore.fetch({
         onComplete: function(items, request)  {
           //alert(items.length);
           dojo.forEach(items, function(item, index)  {
             var foundIt = false;
             var year = csvStore.getValue(item, "Year");
             var cruise = csvStore.getValue(item, "Cruise");
             var latitude = csvStore.getValue(item, "Latitude");
             var longitude = csvStore.getValue(item, "Longitude");
             var themesString = csvStore.getValue(item, "New Themes");
             if (themesString != undefined)  {
               var themes = themesString.toLowerCase();
             }
             else {
               var themes = csvStore.getValue(item, "New Themes");
             }
             var id = csvStore.getIdentity(item);
             if (latitude != undefined && longitude != undefined)  {
               if (themes != undefined)  {
                 if ((canyons == "true") && (themes.indexOf("canyon") != -1))  foundIt = true;
                 if ((caves == "true") && (themes.indexOf("cave") != -1))  foundIt = true;
                 if ((faults == "true") && (themes.indexOf("fault") != -1))  foundIt = true;
                 if ((seamounts == "true") && (themes.indexOf("seamount") != -1))  foundIt = true;
                 if ((seeps_and_vents == "true") && (themes.indexOf("seep") != -1))  foundIt = true;
                 if ((trenches == "true") && (themes.indexOf("trench") != -1))  foundIt = true;
                 if ((volcanoes == "true") && (themes.indexOf("volcano") != -1))  foundIt = true;
                 if ((biodiversity == "true") && (themes.indexOf("biodiv") != -1))  foundIt = true;
                 if ((bioluminescence == "true") && (themes.indexOf("biolum") != -1))  foundIt = true;
                 if ((chemosynthetic_communities == "true") && (themes.indexOf("chemo") != -1))  foundIt = true;
                 if ((deepsea_corals == "true") && (themes.indexOf("corals") != -1))  foundIt = true;
                 if ((habitat_characterizations == "true") && (themes.indexOf("habitat") != -1))  foundIt = true;
                 if ((microbiology == "true") && (themes.indexOf("micro") != -1))  foundIt = true;
                 if ((marine_archaeology == "true") && (themes.indexOf("arch") != -1))  foundIt = true;
                 if ((biotechnology == "true") && (themes.indexOf("biotech") != -1))  foundIt = true;
                 if ((sampling_operations == "true") && (themes.indexOf("sampling") != -1))  foundIt = true;
                 if ((scuba_and_technical_diving == "true") && (themes.indexOf("diving") != -1))  foundIt = true;
                 if ((seafloor_mapping == "true") && (themes.indexOf("mapping") != -1))  foundIt = true;
                 if ((sound_and_light == "true") && (themes.indexOf("sound") != -1))  foundIt = true;
                 if ((submersibles == "true") && (themes.indexOf("subs") != -1))  foundIt = true;
                 if ((telepresence == "true") && (themes.indexOf("tele") != -1))  foundIt = true;
                 if ((testing_new_technologies == "true") && (themes.indexOf("newtech") != -1))  foundIt = true;
                 if (foundIt)  {
                   createMarker(id, year, cruise, latitude, longitude);
                 }
               }
             }
           });
           initializeCruiseListing();
           dojo.connect(dataLayer, "onClick", onFeatureClick);
           var cruiseTotals = dijit.byId("themeCounter");
           cruiseTotals.attr("value", dataLayer.graphics.length + " Cruises Displayed");
         },
         onError: function(error) {
            dojo.byId("itemsList").innerHTML = "Unable to search the data.";
         }
       });

       map.setExtent(startExtent);
     }

     // search cruises based on text ... look at summary and cruise attributes for matches
     function searchForText()  {

       var searchText = dijit.byId("wordSearchTB").get('value');
       var searchValue = searchText.toUpperCase();

       // remove any previously plotted GIS layers
       var layersOnMap = map.layerIds.length;
       if (layersOnMap > 1)  {
         map.removeAllLayers();
         map.addLayer(basemap);
         map.addLayer(basemapReference);
         map.addLayer(hoverTextLayer);
         map.addLayer(highlightLayer);
         map.addLayer(dataLayer);
         map.addLayer(listHighlightLayer);
       }
       if (hoverTextLayer != undefined) hoverTextLayer.clear();
       if (listHighlightLayer != undefined)  listHighlightLayer.clear();
       if (highlightLayer != undefined)  highlightLayer.clear();

       dataLayer.clear();
       map.infoWindow.hide();
       
       csvStore.fetch({
         onComplete: function(items, request)  {
           //alert(items.length);
           dojo.forEach(items, function(item, index)  {
             var foundIt = false;
             var year = csvStore.getValue(item, "Year");
             var cruise = csvStore.getValue(item, "Cruise");
             var latitude = csvStore.getValue(item, "Latitude");
             var longitude = csvStore.getValue(item, "Longitude");
             var summary = csvStore.getValue(item, "Summary");
             var id = csvStore.getIdentity(item);
             if (latitude != undefined && longitude != undefined)  {
               if (summary != undefined)  {
                 var summaryText = summary.toUpperCase();
                 if (summaryText.indexOf(searchValue) != -1)  foundIt = true;
               }
               if (cruise != undefined)  {
                 var cruiseText = cruise.toUpperCase();
                 if (cruiseText.indexOf(searchValue) != -1)  foundIt = true;
               }
               if (foundIt)  {
                 createMarker(id, year, cruise, latitude, longitude);
               }
             }
           });
           initializeCruiseListing();
           dojo.connect(dataLayer, "onClick", onFeatureClick);
           var cruiseTotals = dijit.byId("wordCounter");
           cruiseTotals.attr("value", dataLayer.graphics.length + " Cruises Displayed");
         },
         onError: function(error) {
            dojo.byId("itemsList").innerHTML = "Unable to search the data.";
         }
       });

       map.setExtent(startExtent);

     }

     // search cruises based on text passed via the URL address
     function searchSurveysByText(searchText)  {

       var searchValue = searchText.toUpperCase();
       dataLayer.clear();
       map.infoWindow.hide();

       csvStore.fetch({
         onComplete: function(items, request)  {
           dojo.forEach(items, function(item, index)  {
             var foundIt = false;
             var year = csvStore.getValue(item, "Year");
             var cruise = csvStore.getValue(item, "Cruise");
             var latitude = csvStore.getValue(item, "Latitude");
             var longitude = csvStore.getValue(item, "Longitude");
             var summary = csvStore.getValue(item, "Summary");
             var id = csvStore.getIdentity(item);
             if (latitude != undefined && longitude != undefined)  {
               if (summary != undefined)  {
                 var summaryText = summary.toUpperCase();
                 if (summaryText.indexOf(searchValue) != -1)  {
                   foundIt = true;
                 }
               }
               if (cruise != undefined)  {
                 var cruiseText = cruise.toUpperCase();
                 if (cruiseText.indexOf(searchValue) != -1)  {
                   foundIt = true;
                 }
               }
               if (foundIt)  {
                 createMarker(id, year, cruise, latitude, longitude);
               }
             }
           });
           initializeCruiseListing();
           dojo.connect(dataLayer, "onClick", onFeatureClick);
           var cruiseTotals = dijit.byId("yearCounter");
           cruiseTotals.attr("value", dataLayer.graphics.length + " Cruises Displayed");
         },
         onError: function(error) {
            dojo.byId("itemsList").innerHTML = "Unable to search the data.";
         }
       });

       map.setExtent(startExtent);
     }


     // search cruises based on mission group passed via the URL address
     function searchSurveysByMissionGroup(searchText)  {

       var searchValue = searchText.toUpperCase();
       dataLayer.clear();
       map.infoWindow.hide();

       csvStore.fetch({
         onComplete: function(items, request)  {
           dojo.forEach(items, function(item, index)  {
             var foundIt = false;
             var year = csvStore.getValue(item, "Year");
             var cruise = csvStore.getValue(item, "Cruise");
             var latitude = csvStore.getValue(item, "Latitude");
             var longitude = csvStore.getValue(item, "Longitude");
             var missionGroupString = csvStore.getValue(item, "Mission Group");
             var id = csvStore.getIdentity(item);
             if (latitude != undefined && longitude != undefined)  {
               if (missionGroupString != undefined)  {
                 var missionGroupText = missionGroupString.toUpperCase();
                 if (missionGroupText.indexOf(searchValue) != -1)  {
                   foundIt = true;
                 }
               }
               if (foundIt)  {
                 createMarker(id, year, cruise, latitude, longitude);
               }
             }
           });
           initializeCruiseListing();
           dojo.connect(dataLayer, "onClick", onFeatureClick);
           var cruiseTotals = dijit.byId("yearCounter");
           cruiseTotals.attr("value", dataLayer.graphics.length + " Cruises Displayed");
         },
         onError: function(error) {
            dojo.byId("itemsList").innerHTML = "Unable to search the data.";
         }
       });

       map.setExtent(startExtent);
     }

     // search for cruises based on combination of year, theme, ocean area, mission group, and/or platform
     function customSearch()  {
       // retrieve any selected settings from dropdown lists
       var yearSelected = dijit.byId("customSearch_Year").get('value');
       var topicSelected = document.getElementById("customSearch_topics").value;
       var focusAreasSelected = dijit.byId("customSearch_FocusAreas").get('value');
       var missionGroupSelected = dijit.byId("customSearch_MissionGroup").get('value');
       var platformSelected = document.getElementById("customSearch_platforms").value;

       // determine if search needs to be made
       var createASearch = false;
       if (yearSelected != "None")  createASearch = true;
       if (topicSelected != "None")  createASearch = true;
       if (focusAreasSelected != "None")  createASearch = true;
       if (missionGroupSelected != "None")  createASearch = true;
       if (platformSelected != "None")  createASearch = true;

       if (createASearch)  {
         // remove any previously plotted GIS layers
         var layersOnMap = map.layerIds.length;
         if (layersOnMap > 1)  {
           map.removeAllLayers();
           map.addLayer(basemap);
           map.addLayer(basemapReference);
           map.addLayer(hoverTextLayer);
           map.addLayer(highlightLayer);
           map.addLayer(dataLayer);
           map.addLayer(listHighlightLayer);
         }
         if (hoverTextLayer != undefined) hoverTextLayer.clear();
         if (listHighlightLayer != undefined)  listHighlightLayer.clear();
         if (highlightLayer != undefined)  highlightLayer.clear();

         dataLayer.clear();
         map.infoWindow.hide();
       
         csvStore.fetch({
           onComplete: function(items, request)  {
             dojo.forEach(items, function(item, index)  {
               yearFound = false;
               themesFound = false;
               focusAreasFound = false;
               missionGroupFound = false;
               platformsFound = false;
               var year = csvStore.getValue(item, "Year");
               var cruise = csvStore.getValue(item, "Cruise");
               var latitude = csvStore.getValue(item, "Latitude");
               var longitude = csvStore.getValue(item, "Longitude");
               var themesString = csvStore.getValue(item, "New Themes");
               if (themesString != undefined)  {
                 var themes = themesString.toLowerCase();
               }
               else {
                 var themes = csvStore.getValue(item, "New Themes");
               }
               var focusAreasString = csvStore.getValue(item, "OER Focus Areas");
               if (focusAreasString != undefined)  {
                 var focusAreas = focusAreasString.toLowerCase();
               }
               else  {
                 var focusAreas = csvStore.getValue(item, "OER Focus Areas");
               }
               var missionGroupString = csvStore.getValue(item, "Mission Group");
               if (missionGroupString != undefined)  {
                 var missionGroup = missionGroupString.toLowerCase();
               }
               else  {
                 var missionGroup = csvStore.getValue(item, "Mission Group");
               }
               var platformsString = csvStore.getValue(item, "Platforms");
               if (platformsString != undefined)  {
                 var platforms = platformsString.toLowerCase();
               }
               else {
                 var platforms = csvStore.getValue(item, "Platforms");
               }
               var id = csvStore.getIdentity(item);
               if (latitude != undefined && longitude != undefined)  {
                 if (yearSelected != "None")  {
                   if (year.indexOf(yearSelected) != -1)  yearFound = true;
                 }
                 else {
                   yearFound = true;
                 }
                 if (topicSelected != "None")  {
                   var themesSelected = document.getElementById("customSearch_themes").value;
                   if (themesSelected != "None")  {
                     if (themes != undefined)  {
                       if (themes.indexOf(themesSelected) != -1)  themesFound = true;
                     }
                   }
                   else  {
                     if (topicSelected == "geology")  {
                       if (themes != undefined)  {
                         if ((themes.indexOf("canyon") != -1) || (themes.indexOf("cave") != -1) || (themes.indexOf("fault") != -1) || (themes.indexOf("seamount") != -1) || (themes.indexOf("seep") != -1) || (themes.indexOf("trench") != -1) || (themes.indexOf("volcano") != -1))  themesFound = true; 
                       }
                     }
                     if (topicSelected == "ecosystems")  {
                       if (themes != undefined)  {
                         if ((themes.indexOf("biodiv") != -1) || (themes.indexOf("biolum") != -1) || (themes.indexOf("chemo") != -1) || (themes.indexOf("corals") != -1) || (themes.indexOf("habitat") != -1) || (themes.indexOf("micro") != -1))  themesFound = true; 
                       }
                     }
                     if (topicSelected == "technology")  {
                       if (themes != undefined)  {
                         if ((themes.indexOf("biotech") != -1) || (themes.indexOf("sampling") != -1) || (themes.indexOf("diving") != -1) || (themes.indexOf("mapping") != -1) || (themes.indexOf("sound") != -1) || (themes.indexOf("subs") != -1) || (themes.indexOf("tele") != -1) || (themes.indexOf("newtech") != -1))  themesFound = true; 
                       }
                     }
                   }
                 }
                 else  {
                   themesFound = true;
                 }
                 if (focusAreasSelected != "None")  {
                   if (focusAreas != undefined)  {
                     if (focusAreas.indexOf(focusAreasSelected) != -1)  focusAreasFound = true;
                   }
                 }
                 else  {
                   focusAreasFound = true;
                 }
                 if (missionGroupSelected != "None")  {
                   if (missionGroup != undefined)  {
                     if (missionGroup.indexOf(missionGroupSelected) != -1)  missionGroupFound = true;
                   }
                 }
                 else  {
                   missionGroupFound = true;
                 }
                 if (platformSelected != "None")  {
                   var platformNamesSelected = document.getElementById("customSearch_names").value;
                   if (platformNamesSelected != "None")  {
                     if (platforms != undefined)  {
                       if (platforms.indexOf(platformNamesSelected) != -1)  platformsFound = true;
                     }
                   }
                   else  {
                     if (platformSelected == "submersible")  {
                       if (platforms != undefined)  {
                         if ((platforms.indexOf("abe") != -1) || (platforms.indexOf("alvin") != -1) || (platforms.indexOf("argus") != -1) || (platforms.indexOf("atlas") != -1) || (platforms.indexOf("clelia") != -1) || (platforms.indexOf("deeprover") != -1) || (platforms.indexOf("deepworker") != -1) || (platforms.indexOf("d2") != -1) || (platforms.indexOf("dsl120") != -1) || (platforms.indexOf("fetch") != -1) || (platforms.indexOf("focus2") != -1) || (platforms.indexOf("gavia") != -1) || (platforms.indexOf("global") != -1) || (platforms.indexOf("herc") != -1) || (platforms.indexOf("hugin") != -1) || (platforms.indexOf("innov") != -1) || (platforms.indexOf("jason") != -1) || (platforms.indexOf("jsl") != -1) || (platforms.indexOf("klein") != -1) || (platforms.indexOf("kraken") != -1) || (platforms.indexOf("lilherc") != -1) || (platforms.indexOf("mir1") != -1) || (platforms.indexOf("mir2") != -1) || (platforms.indexOf("phantom") != -1) || (platforms.indexOf("pisces4") != -1) || (platforms.indexOf("pisces5") != -1) || (platforms.indexOf("prosas") != -1) || (platforms.indexOf("quest4") != -1) || (platforms.indexOf("quest6") != -1) || (platforms.indexOf("rcv") != -1) || (platforms.indexOf("ropos") != -1) || (platforms.indexOf("seaeye") != -1) || (platforms.indexOf("seabed") != -1) || (platforms.indexOf("seabotix") != -1) || (platforms.indexOf("seirios") != -1) || (platforms.indexOf("sentry") != -1) || (platforms.indexOf("sonsub") != -1) || (platforms.indexOf("tiburon") != -1))  platformsFound = true; 
                       }
                     }
                     if (platformSelected == "vessel")  {
                       if (platforms != undefined)  {
                         if ((platforms.indexOf("alliance") != -1) || (platforms.indexOf("aegaeo") != -1) || (platforms.indexOf("akademik") != -1) || (platforms.indexOf("alliance") != -1) || (platforms.indexOf("atlantis") != -1) || (platforms.indexOf("barunajaya") != -1) || (platforms.indexOf("bayhydro") != -1) || (platforms.indexOf("baylis") != -1) || (platforms.indexOf("bigelow") != -1) || (platforms.indexOf("brooks") != -1) || (platforms.indexOf("capefear") != -1) || (platforms.indexOf("caribbean") != -1) || (platforms.indexOf("connecticut") != -1) || (platforms.indexOf("curlew") != -1) || (platforms.indexOf("dominator") != -1) || (platforms.indexOf("donjose") != -1) || (platforms.indexOf("endeavor") != -1) || (platforms.indexOf("endurance") != -1) || (platforms.indexOf("ferguson") != -1) || (platforms.indexOf("flamingo") != -1) || (platforms.indexOf("foster") != -1) || (platforms.indexOf("grapple") != -1) || (platforms.indexOf("gray") != -1) || (platforms.indexOf("gunter") != -1) || (platforms.indexOf("healy") != -1) || (platforms.indexOf("hiialakai") != -1) || (platforms.indexOf("huron") != -1) || (platforms.indexOf("kilomoana") != -1) || (platforms.indexOf("khromov") != -1) || (platforms.indexOf("knorr") != -1) || (platforms.indexOf("kok") != -1) || (platforms.indexOf("lakeguardian") != -1) || (platforms.indexOf("laurentian") != -1) || (platforms.indexOf("laurier") != -1) || (platforms.indexOf("lesuroit") != -1) || (platforms.indexOf("mcarthur") != -1) || (platforms.indexOf("melville") != -1) || (platforms.indexOf("mirai") != -1) || (platforms.indexOf("nautilus") != -1) || (platforms.indexOf("neptune") != -1) || (platforms.indexOf("oceanexp") != -1) || (platforms.indexOf("oceanhunter") != -1) || (platforms.indexOf("oceanic") != -1) || (platforms.indexOf("okeanos") != -1) || (platforms.indexOf("pacificstorm") != -1) || (platforms.indexOf("pelican") != -1) || (platforms.indexOf("pisces") != -1) || (platforms.indexOf("presbitero") != -1) || (platforms.indexOf("roper") != -1) || (platforms.indexOf("ronbrown") != -1) || (platforms.indexOf("sewardjohnson") != -1) || (platforms.indexOf("sila") != -1) || (platforms.indexOf("sonne") != -1) || (platforms.indexOf("spree") != -1) || (platforms.indexOf("srvx") != -1) || (platforms.indexOf("stlaurent") != -1) || (platforms.indexOf("storm") != -1) || (platforms.indexOf("tangaroa") != -1) || (platforms.indexOf("tatoosh") != -1) || (platforms.indexOf("thompson") != -1) || (platforms.indexOf("tjefferson") != -1) || (platforms.indexOf("turks") != -1) || (platforms.indexOf("waltonsmith") != -1) || (platforms.indexOf("weatherbird") != -1) || (platforms.indexOf("westernflyer") != -1) || (platforms.indexOf("whiting") != -1) || (platforms.indexOf("yuhz") != -1))  platformsFound = true;
                       }
                     }
                     if (platformSelected == "other")  {
                       if (platforms != undefined)  {
                         if ((platforms.indexOf("aquarius") != -1) || (platforms.indexOf("scuba") != -1))  platformsFound = true; 
                       }
                     }
                   }
                 }
                 else  {
                   platformsFound = true;
                 }
               }  
               if (yearFound && themesFound && focusAreasFound && missionGroupFound && platformsFound)  {
                 createMarker(id, year, cruise, latitude, longitude);
               }
             });
             initializeCruiseListing();
             dojo.connect(dataLayer, "onClick", onFeatureClick);
             var cruiseTotals = dijit.byId("customCounter");
             cruiseTotals.attr("value", dataLayer.graphics.length + " Cruises Displayed");
           },
           onError: function(error) {
              dojo.byId("itemsList").innerHTML = "Unable to search the data.";
           }
         });
       }
       else  {
         // remove any previously plotted GIS layers
         var layersOnMap = map.layerIds.length;
         if (layersOnMap > 1)  {
           map.removeAllLayers();
           map.addLayer(basemap);
           map.addLayer(basemapReference);
           map.addLayer(hoverTextLayer);
           map.addLayer(highlightLayer);
           map.addLayer(dataLayer);
           map.addLayer(listHighlightLayer);
         }
         if (hoverTextLayer != undefined) hoverTextLayer.clear();
         if (listHighlightLayer != undefined)  listHighlightLayer.clear();
         if (highlightLayer != undefined)  highlightLayer.clear();

         dataLayer.clear();
         map.infoWindow.hide();

         csvStore.fetch({
           onComplete: function(items, request)  {
             dojo.forEach(items, function(item, index)  {
               var year = csvStore.getValue(item, "Year");
               var cruise = csvStore.getValue(item, "Cruise");
               var latitude = csvStore.getValue(item, "Latitude");
               var longitude = csvStore.getValue(item, "Longitude");
               var id = csvStore.getIdentity(item);
               if (latitude != undefined && longitude != undefined)  {
                 createMarker(id, year, cruise, latitude, longitude);
               }
             });
             initializeCruiseListing();
             dojo.connect(dataLayer, "onClick", onFeatureClick);
             var cruiseTotals = dijit.byId("customCounter");
             cruiseTotals.attr("value", dataLayer.graphics.length + " Cruises Displayed");
           },
           onError: function(error) {
              dojo.byId("itemsList").innerHTML = "Unable to search the data.";
           }
         });
       }       
       map.setExtent(startExtent);
     }

     // highlight a site when gis layers drawn on map
     function showCruisePoint(id)  {
       if (highlightLayer != undefined)  highlightLayer.clear();
       var highlightSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 22, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 3.5), new dojo.Color([0, 255, 0, 0.0]));
       dojo.some(dataLayer.graphics, function(graphic) {
         if (graphic.attributes.id === id)  {
           selectedCruise = graphic;
         }
       });
       geometry = selectedCruise.geometry;
       highlightLayer.add(new esri.Graphic(geometry, highlightSymbol, {id: id}));
     }

     // highlights a site on the map from the listing in the right pane
     function highlightFromList(xPt,yPt)  {
       var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 18, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 255, 0]), 3.5), new dojo.Color([0, 255, 0, 0.0]));
       var geometry = new esri.geometry.Point(xPt, yPt);
       geometry = esri.geometry.geographicToWebMercator(geometry);
       listHighlightLayer.add(new esri.Graphic(geometry, symbol));
     }

     // reset atlas to original settings ... this is done when a new tab is selected or reset button is hit
     function resetAtlas()  {
       if (firstTime)  {
         firstTime = false;
       }
       else  {
         var layersOnMap = map.layerIds.length;
         if (layersOnMap > 1)  {
           map.removeAllLayers();
           map.addLayer(basemap);
           map.addLayer(basemapReference);
           map.addLayer(hoverTextLayer);
           map.addLayer(highlightLayer);
           map.addLayer(dataLayer);
           map.addLayer(listHighlightLayer);
         }
         dataLayer.clear();
         if (highlightLayer != undefined)  highlightLayer.clear();
         if (hoverTextLayer != undefined)  hoverTextLayer.clear();
         if (listHighlightLayer != undefined)  listHighlightLayer.clear();
         surveySearch = "";
         textSearch = "";
         missionGroupSearch = "";
         map.infoWindow.hide();
         map.setExtent(startExtent);
         dijit.byId('year_2001').setValue(true);
         dijit.byId('year_2002').setValue(true);
         dijit.byId('year_2003').setValue(true);
         dijit.byId('year_2004').setValue(true);
         dijit.byId('year_2005').setValue(true);
         dijit.byId('year_2006').setValue(true);
         dijit.byId('year_2007').setValue(true);
         dijit.byId('year_2008').setValue(true);
         dijit.byId('year_2009').setValue(true);
         dijit.byId('year_2010').setValue(true);
         dijit.byId('year_2011').setValue(true);
         dijit.byId('year_2012').setValue(true);
         dijit.byId('year_2013').setValue(true);
         dijit.byId('year_2014').setValue(true);
         dijit.byId('year_2015').setValue(true);
         dijit.byId('year_2016').setValue(true);
         dijit.byId('yearsYes').setValue(true);
         dijit.byId('canyon').setValue(true);
         dijit.byId('cave').setValue(true);
         dijit.byId('fault').setValue(true);
         dijit.byId('seamount').setValue(true);
         dijit.byId('seep').setValue(true);
         dijit.byId('trench').setValue(true);
         dijit.byId('volcano').setValue(true);
         dijit.byId('biodiv').setValue(true);
         dijit.byId('biolum').setValue(true);
         dijit.byId('chemo').setValue(true);
         dijit.byId('corals').setValue(true);
         dijit.byId('habitat').setValue(true);
         dijit.byId('micro').setValue(true);
         dijit.byId('arch').setValue(true);
         dijit.byId('biotech').setValue(true);
         dijit.byId('sampling').setValue(true);
         dijit.byId('diving').setValue(true);
         dijit.byId('mapping').setValue(true);
         dijit.byId('sound').setValue(true);
         dijit.byId('subs').setValue(true);
         dijit.byId('tele').setValue(true);
         dijit.byId('newtech').setValue(true);
         dijit.byId('themesYes').setValue(true);
         dijit.byId('wordSearchTB').setValue('');
         dijit.byId('customSearch_Year').setValue("All");
         dijit.byId('customSearch_FocusAreas').setValue("All");
         dijit.byId('customSearch_MissionGroup').setValue("All");
         resetListGroup('topics-themes');
         resetListGroup('oer-platforms');
         processCruiseData();
       }
     }

     // launches Data Access page into its own window instead of as a tab in the current window
     function launchDataLink(data) {
       var Win = open(data,"DataAccessPage","height=800,width=1000,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes");
       Win.focus();
     }

     // launches submission form page into its own window instead of as a tab in the current window
     function SubmissionForm() {
       var urlLink = "https://docs.google.com/a/noaa.gov/spreadsheet/viewform?usp=drive_web&formkey=dHAycC1MYndJb0hTdGRaYXAzVTVBdWc6MA#gid=0";
       var Win = open(urlLink, "SubmissionFormPage","height=800,width=1000,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes");
       Win.focus();
     }

     // adds gis layers defined in the spreadsheet to be added to the map
     function plotDataToMap(mapService)  {

       map.infoWindow.hide();

       // first determine which dataset will be used to define map extent
       // if ship track exists, it will automatically made the spatial extent otherwise next on the list checked will be used
       var lyrId = 0;
       var foundIt = 0;
       var inputs = dojo.query(".list_item"), input;
       var surveyId;
       var year;

       for (var i=0, il=inputs.length; i<il; i++)  {
         if (inputs[i].checked)  {
           foundIt = 1;
         }
       }
       if (foundIt === 0)  {
         alert("You didn't pick anything to plot");
       }
       else  {
         var inputs = dojo.query(".list_item"), input;
         for (var i=0, il=inputs.length; i<il; i++)  {
           if (inputs[i].name == "Ship Track")  {
             lyrId = inputs[i].id;
             var queryTaskURL = "http://service.ncddc.noaa.gov/arcgis/rest/services/OceanExploration/";
             //var queryTaskURL = "http://www.ln.ncddc.noaa.gov/arcgis/rest/services/OceanExploration/";
             queryTaskURL += inputs[i].value;
             queryTaskURL += "/MapServer/";
             queryTaskURL += lyrId;
           }
           if (inputs[i].name == 'Ship Track (ECS)') {
              //Retrieve the survey ID and year for this cruise specified in the CSV file. 
              //The format of column AA in the CSV file should be: "Ship Track (ECS);<year>;<survey_id>;<ship_track_thumbnail.jpg>"
              //These values are stored in the id and value fields in the HTML elements created starting at line 354.
              //Note: the survey ID can contain a wildcard, i.e. 'DAO301%'
              surveyId = inputs[i].id; 
              year = inputs[i].value;
              var queryTaskURL = "http://mapdevel.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer/0";
              lyrId = -9999; //dummy value, not used. Bypasses code below.
           }
         }
         if (lyrId === 0)  {
           var inputs = dojo.query(".list_item"), input;
           for (var i=0, il=inputs.length; i<il; i++)  {
             lyrId = inputs[i].id;
             var queryTaskURL = "http://service.ncddc.noaa.gov/arcgis/rest/services/OceanExploration/";
             //var queryTaskURL = "http://www.ln.ncddc.noaa.gov/arcgis/rest/services/OceanExploration/";
             queryTaskURL += inputs[i].value;
             queryTaskURL += "/MapServer/";
             queryTaskURL += lyrId;
           }
         }
         // reset the map, removing any pre-existing drawn datasets
         var layersOnMap = map.layerIds.length;
         if (layersOnMap > 1)  {
           map.removeAllLayers();
           map.addLayer(basemap);
           map.addLayer(basemapReference);
           map.addLayer(hoverTextLayer);
           map.addLayer(highlightLayer);
           map.addLayer(dataLayer);
           map.addLayer(listHighlightLayer);
         }
         // zoom the map the spatial extent of one of the datasets
         var queryTask = new esri.tasks.QueryTask(queryTaskURL);
         query = new esri.tasks.Query();
         query.returnGeometry = true;
         query.outFields = ["*"];
         
          if (inputs[0].name == 'Ship Track (ECS)') {
            query.where = "SURVEY_ID LIKE'" + surveyId + "'"; //If an ECS track, filter by the survey ID (can contain wildcard: %).
          }
          else {
            query.where = "1=1";
          }

         query.maxAllowableOffset = 1000; //generalize the returned geometry to 1km for performance

         queryTask.execute(query, function(fset)  {
          if (fset.features.length > 0) {
            map.setExtent(esri.graphicsExtent(fset.features),true);
          }
         });
         // draw the datasets
         var inputs = dojo.query(".list_item"), input;
         for (var i=0, il=inputs.length; i<il; i++)  {
           visible = [];
           if (inputs[i].checked)  {
             visible.push(inputs[i].id);

             var mapServiceURL;
             var imageParameters;
             var layerDefs;
             var layerDrawingOptions;

             if (inputs[i].name == 'Ship Track (ECS)') {
              //If an ECS cruise, point to the multibeam_dynamic service with custom layerDefinitions and layerDrawingOptions.

              mapServiceURL = "http://mapdevel.ngdc.noaa.gov/arcgis/rest/services/web_mercator/multibeam_dynamic/MapServer/";
              imageParameters = new esri.layers.ImageParameters();
              imageParameters.format = 'PNG32';
              layerDefs = [];
              layerDefs[0] = "SURVEY_ID LIKE'" + surveyId + "'";
              
              //Set the line's color based on the year. Same as in createMarker() above. 
              var symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([0,0,0]), 2);
              if (year == "2001")  symbol.setColor(new dojo.Color([0,0,255,1.0]));
              if (year == "2002")  symbol.setColor(new dojo.Color([0,255,0,1.0]));
              if (year == "2003")  symbol.setColor(new dojo.Color([255,0,0,1.0]));
              if (year == "2004")  symbol.setColor(new dojo.Color([0,255,255,1.0]));
              if (year == "2005")  symbol.setColor(new dojo.Color([255,0,255,1.0]));
              if (year == "2006")  symbol.setColor(new dojo.Color([255,255,0,1.0]));
              if (year == "2007")  symbol.setColor(new dojo.Color([255,128,0,1.0]));
              if (year == "2008")  symbol.setColor(new dojo.Color([128,0,255,1.0]));
              if (year == "2009")  symbol.setColor(new dojo.Color([236,0,140,1.0]));
              if (year == "2010")  symbol.setColor(new dojo.Color([249,173,129,1.0]));
              if (year == "2011")  symbol.setColor(new dojo.Color([255,255,255,1.0]));
              if (year == "2012")  symbol.setColor(new dojo.Color([0,0,0,1.0,1.0]));
              if (year == "2013")  symbol.setColor(new dojo.Color([76,187,23,1.0]));
              if (year == "2014")  symbol.setColor(new dojo.Color([255,215,0],1.0));
              if (year == "2015")  symbol.setColor(new dojo.Color([158,163,157,1.0]));
              if (year == "2016")  symbol.setColor(new dojo.Color([137,112,68,1.0]));

              var renderer = new esri.renderer.SimpleRenderer(symbol);

              layerDrawingOptions = new esri.layers.LayerDrawingOptions();
              layerDrawingOptions.renderer = renderer;
            }
             else {
              mapServiceURL = "http://service.ncddc.noaa.gov/arcgis/rest/services/OceanExploration/";
              mapServiceURL += inputs[i].value;
              mapServiceURL += "/MapServer";
              imageParameters = new esri.layers.ImageParameters();
              imageParameters.layerIds = [visible];
              imageParameters.layerOption = esri.layers.ImageParameters.LAYER_OPTION_SHOW;
            }
            var GISLayer = new esri.layers.ArcGISDynamicMapServiceLayer(mapServiceURL,{"imageParameters":imageParameters});

            if (layerDefs) {
              //If an ECS cruise, set the layer definitions and custom layer drawing options on the dynamic map service.
              GISLayer.setLayerDefinitions(layerDefs);
              GISLayer.setLayerDrawingOptions([layerDrawingOptions]);
            }
            
             GISLayer.id = inputs[i].name;
             map.addLayer(GISLayer);
           }
         }
       }
     }
