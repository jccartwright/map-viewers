      // load tiled corals and sponges layer
      // this code comes from arcgis api javascript example about creating a custom tiled layer (https://developers.arcgis.com/javascript/jssamples/layers_custom_tiled.html)
      function initCoralsSpongesLayer()  {
        dojo.declare("CoralsSpongesTiledMapServiceLayer", esri.layers.TiledMapServiceLayer, {
          constructor: function() {
            this.spatialReference = new esri.SpatialReference({ wkid:3857 })
            this.initialExtent = (this.fullExtent = new esri.geometry.Extent(-20036793.671658352,-14297541.991821388,20036840.425844487,12658425.230164146, this.spatialReference));

            this.tileInfo = new esri.layers.TileInfo({
              "rows" : 256,
              "cols" : 256,
              "dpi" : 96,
              "format" : "PNG32",
              "compressionQuality" : 0,
              "origin" : {
                "x" : -20037508.342787001,
                "y" : 20037508.342787001
              },
              "spatialReference" : {
              "wkid" : 3857
            },
              "lods" : [
                //{"level" : 0, "resolution" : 156543.03392800014, "scale" : 591657527.591555},
                //{"level" : 1, "resolution" : 78271.516963999937, "scale" : 295828763.79577702},
                {"level" : 2, "resolution" : 39135.758482000092, "scale" : 147914381.89788899},
                {"level" : 3, "resolution" : 19567.879240999919, "scale" : 73957190.948944002},
                {"level" : 4, "resolution" : 9783.9396204999593, "scale" : 36978595.474472001},
                {"level" : 5, "resolution" : 4891.9698102499797, "scale" : 18489297.737236001},
                {"level" : 6, "resolution" : 2445.9849051249898, "scale" : 9244648.8686180003},
                {"level" : 7, "resolution" : 1222.9924525624949, "scale" : 4622324.4343090001},
                {"level" : 8, "resolution" : 611.49622628137968, "scale" : 2311162.2171550002},
                {"level" : 9, "resolution" : 305.74811314055756, "scale" : 1155581.108577},
                {"level" : 10, "resolution" : 152.87405657041106, "scale" : 577790.55428899999}
              ]
            });

            this.loaded = true;
            this.onLoad(this);
          },

          getTileUrl: function(level, row, col) {
            //return "https://service.ln.ncddc.noaa.gov/arcgiscache/EnvironmentalMonitoring_DSCRTP/_alllayers/" + 
            //return "https://service.ncddc.noaa.gov/arcgiscache/EnvironmentalMonitoring_DSCRTP/_alllayers/" +
            return "https://deepseacoraldata.noaa.gov/arcgiscache/EnvironmentalMonitoring_DSCRTP/_alllayers/" +
              "L" + dojo.string.pad(level, 2, '0') + "/" +
              "R" + dojo.string.pad(row.toString(16), 8, '0') + "/" +
              "C" + dojo.string.pad(col.toString(16), 8, '0') + "." +
              "png";
          }
        });

        var phrase = "1=1"
        var query = new esri.tasks.Query();
        query.where = phrase;
        query.outFields = ["recordnum"]
        // var qt = new esri.tasks.QueryTask("https://service.ln.ncddc.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0");
        //var qt = new esri.tasks.QueryTask("https://service.ncddc.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0");
        //var qt = new esri.tasks.QueryTask("https://deepseacoraldata.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0");
        var qt = new esri.tasks.QueryTask("https://gis.ngdc.noaa.gov/arcgis/rest/services/deep_sea_corals/MapServer/0");
        
        qt.executeForCount(query,function(count) {
          var countText = count.toLocaleString();
          if (countText == 1)  {
            dojo.byId("msg").innerHTML = "<font color='black'><b>"+countText+" Record Found</font>";
          }
          else  {
            dojo.byId("msg").innerHTML = "<font color='black'><b>"+countText+" Records Found</font>";
          }
          retrievedRecords = count;
          totalRecords = count;

          }, function(error){
            alert("Error:" + error);
        });
      }

      // load tiled eez layer
      // this code comes from arcgis api javascript example about creating a custom tiled layer (https://developers.arcgis.com/javascript/jssamples/layers_custom_tiled.html)
      function initEEZLayer()  {
        dojo.declare("EEZTiledMapServiceLayer", esri.layers.TiledMapServiceLayer, {
          constructor: function() {
            this.spatialReference = new esri.SpatialReference({ wkid:3857 })
            this.initialExtent = (this.fullExtent = new esri.geometry.Extent(-20037507.067,-1985527.167,20037507.067,12808185.769, this.spatialReference));

            this.tileInfo = new esri.layers.TileInfo({
              "rows" : 256,
              "cols" : 256,
              "dpi" : 96,
              "format" : "PNG32",
              "compressionQuality" : 0,
              "origin" : {
                "x" : -20037508.342787001,
                "y" : 20037508.342787001
              },
              "spatialReference" : {
              "wkid" : 3857
            },
              "lods" : [
                //{"level" : 0, "resolution" : 156543.03392800014, "scale" : 591657527.591555},
                //{"level" : 1, "resolution" : 78271.516963999937, "scale" : 295828763.79577702},
                {"level" : 2, "resolution" : 39135.758482000092, "scale" : 147914381.89788899},
                {"level" : 3, "resolution" : 19567.879240999919, "scale" : 73957190.948944002},
                {"level" : 4, "resolution" : 9783.9396204999593, "scale" : 36978595.474472001},
                {"level" : 5, "resolution" : 4891.9698102499797, "scale" : 18489297.737236001},
                {"level" : 6, "resolution" : 2445.9849051249898, "scale" : 9244648.8686180003},
                {"level" : 7, "resolution" : 1222.9924525624949, "scale" : 4622324.4343090001},
                {"level" : 8, "resolution" : 611.49622628137968, "scale" : 2311162.2171550002},
                {"level" : 9, "resolution" : 305.74811314055756, "scale" : 1155581.108577},
                {"level" : 10, "resolution" : 152.87405657041106, "scale" : 577790.55428899999}
              ]
            });

            this.loaded = true;
            this.onLoad(this);
          },

          getTileUrl: function(level, row, col) {
            //return "https://service.ncddc.noaa.gov/arcgiscache/EnvironmentalMonitoring_EEZ/_alllayers/" +
            return "https://deepseacoraldata.noaa.gov/arcgiscache/EnvironmentalMonitoring_EEZ/_alllayers/" +
              "L" + dojo.string.pad(level, 2, '0') + "/" +
              "R" + dojo.string.pad(row.toString(16), 8, '0') + "/" +
              "C" + dojo.string.pad(col.toString(16), 8, '0') + "." +
              "png";
          }
        });
      }

      // load tiled NMSP layer
      // this code comes from arcgis api javascript example about creating a custom tiled layer (https://developers.arcgis.com/javascript/jssamples/layers_custom_tiled.html)
      function initNMSPLayer()  {
        dojo.declare("NMSPTiledMapServiceLayer", esri.layers.TiledMapServiceLayer, {
          constructor: function() {
            this.spatialReference = new esri.SpatialReference({ wkid:3857 })
            this.initialExtent = (this.fullExtent = new esri.geometry.Extent(-20036793.671,-14297541.991,20036840.425,12658425.230, this.spatialReference));

            this.tileInfo = new esri.layers.TileInfo({
              "rows" : 256,
              "cols" : 256,
              "dpi" : 96,
              "format" : "PNG32",
              "compressionQuality" : 0,
              "origin" : {
                "x" : -20037508.342787001,
                "y" : 20037508.342787001
              },
              "spatialReference" : {
              "wkid" : 3857
            },
              "lods" : [
                //{"level" : 0, "resolution" : 156543.03392800014, "scale" : 591657527.591555},
                //{"level" : 1, "resolution" : 78271.516963999937, "scale" : 295828763.79577702},
                {"level" : 2, "resolution" : 39135.758482000092, "scale" : 147914381.89788899},
                {"level" : 3, "resolution" : 19567.879240999919, "scale" : 73957190.948944002},
                {"level" : 4, "resolution" : 9783.9396204999593, "scale" : 36978595.474472001},
                {"level" : 5, "resolution" : 4891.9698102499797, "scale" : 18489297.737236001},
                {"level" : 6, "resolution" : 2445.9849051249898, "scale" : 9244648.8686180003},
                {"level" : 7, "resolution" : 1222.9924525624949, "scale" : 4622324.4343090001},
                {"level" : 8, "resolution" : 611.49622628137968, "scale" : 2311162.2171550002},
                {"level" : 9, "resolution" : 305.74811314055756, "scale" : 1155581.108577},
                {"level" : 10, "resolution" : 152.87405657041106, "scale" : 577790.55428899999}
              ]
            });

            this.loaded = true;
            this.onLoad(this);
          },

          getTileUrl: function(level, row, col) {
            //return "https://service.ncddc.noaa.gov/arcgiscache/EnvironmentalMonitoring_NMSP/_alllayers/" +
            return "https://deepseacoraldata.noaa.gov/arcgiscache/EnvironmentalMonitoring_NMSP/_alllayers/" +
              "L" + dojo.string.pad(level, 2, '0') + "/" +
              "R" + dojo.string.pad(row.toString(16), 8, '0') + "/" +
              "C" + dojo.string.pad(col.toString(16), 8, '0') + "." +
              "png";
          }
        });
      }

      // load up functions once map is ready
      function mapReady(map)  {
        mapCenterPoint = map.extent.getCenter();
        var currentScale = map.getScale().toLocaleString();
        var currentScaleText = "<b>Map Scale is 1 : " + currentScale + "</b>";
        dojo.byId("mapScale").innerHTML = currentScaleText;
        dojo.connect(map, "onUpdateStart", showLoading);
        dojo.connect(map, "onUpdateEnd", hideLoading);
        dojo.connect(map, "onMouseMove", showCoordinates);
        dojo.connect(map, "onMouseDrag", showCoordinates);
        dojo.connect(map, "onZoomEnd", checkZoomLevel);
        dojo.connect(map, "onZoomEnd", showMapScale);
        dojo.connect(gFloatingPane.dockNode, 'click', function()  {
          var gsButton = dijit.byId("geospatialQuery");
          gsButton.set("checked", false);
        });
        dojo.connect(map, "onClick", runIdentifyTask);
        //identifyTask = new esri.tasks.IdentifyTask("https://service.ln.ncddc.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer");  // identify corals and sponges
        //identifyTask = new esri.tasks.IdentifyTask("https://service.ncddc.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer");  // identify corals and sponges
        //identifyTask = new esri.tasks.IdentifyTask("https://deepseacoraldata.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer");  // identify corals and sponges
        identifyTask = new esri.tasks.IdentifyTask("https://gis.ngdc.noaa.gov/arcgis/rest/services/deep_sea_corals/MapServer");
        identifyParams = new esri.tasks.IdentifyParameters();
        identifyParams.tolerance = 3;
        identifyParams.returnGeometry = true;
        identifyParams.layerIds = [0];
        identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
        identifyParams.width  = map.width;
        identifyParams.height = map.height;
        originalMapExtent = map.extent;
        savedMapExtent = map.extent;
        // save list of layers checked
        var eezSwitch = dijit.byId('eez_line').attr('value');
        var sitesSwitch = dijit.byId('site_markers').attr('value'); 
        var dataSwitch = dijit.byId('data_markers').attr('value');
        loadDSCRTPSites();
        loadModelLayersXML();
      }  

      // show map coordinates
      function showCoordinates(evt) {
        //get mapPoint from event
        //The map is in web mercator - modify the map point to display the results in geographic
        var mp = esri.geometry.webMercatorToGeographic(evt.mapPoint);
        //display mouse coordinates
        dojo.byId("coords").innerHTML = "<b>Latitude: " + mp.y.toFixed(4) + "&nbsp;&nbsp;&nbsp;&nbsp;Longitude: " + mp.x.toFixed(4) + "</b>";
        //dojo.byId("coords").innerHTML = "<b>X: " + evt.mapPoint.x + "&nbsp;&nbsp;&nbsp;Y: " +evt.mapPoint.y + "</b>";
      }

      // show current map scale
      function showMapScale(evt) {
        var currentScale = map.getScale().toLocaleString();
        var currentScaleText = "<b>Map Scale is 1 : " + currentScale + "</b>";
        dojo.byId("mapScale").innerHTML = currentScaleText;
      }

      function showLoading() {
        mapDrawing = true;
        esri.show(loading);
      }

      function hideLoading(error) {
        mapDrawing = false;
        esri.hide(loading);
      }

      // provide zoom in function
      function zoomInHandler()  {
        var zin = dijit.byId("zoomin");
        var zout = dijit.byId("zoomout");
        var pan = dijit.byId("pan");
        zout.set("checked", false);
        if (zin.checked)  {
          pan.set("checked", false);
          navToolbar.activate(esri.toolbars.Navigation.ZOOM_IN);
        }
        else  {
          navToolbar.deactivate();
          pan.set("checked", true);
        }
      }

      // provide zoom out function
      function zoomOutHandler()  {
        var zin = dijit.byId("zoomin");
        var zout = dijit.byId("zoomout");
        var pan = dijit.byId("pan");
        zin.set("checked", false);
        var zp = dijit.byId("zoomprev");
        var elm = dijit.byId("zoomout");
        if (zout.checked)
        {
          pan.set("checked", false);
          navToolbar.activate(esri.toolbars.Navigation.ZOOM_OUT);
        }
        else
        {
          navToolbar.deactivate();
          pan.set("checked", true);
        }
      }

      // provide stop method to zooms
      function stopZoomHandler()  {
        var zin = dijit.byId("zoomin");
        var zout = dijit.byId("zoomout");
        var pan = dijit.byId("pan");
        zin.set("checked", false);
        zout.set("checked", false);
        pan.set("checked", true);
        navToolbar.deactivate();
      }

      // provide previous extent function
      function prevExtentHandler()  {
        var elm = dijit.byId("zoomprev");
        stopZoomHandler();
        navToolbar.zoomToPrevExtent();
      }

      // provide next extent function
      function nextExtentHandler()  {
        stopZoomHandler();
        navToolbar.zoomToNextExtent();
      }

      // provide pan function
      function panHandler()  {
        var pan = dijit.byId("pan");
        pan.set("checked", true);
        stopZoomHandler();
        navToolbar.activate(esri.toolbars.Navigation.PAN);
      }

      // provide show/hide function of data query menu
      function dataQueryHandler()  {
        var dqMenu = dijit.byId("queryMenu");
        if (dqMenu.checked)  {
          var dataQueryPaneName = document.getElementById("titlePane_SearchParameters");
          dataQueryPaneName.style.display = 'block';
        }
        else  {
          var dataQueryPaneName = document.getElementById("titlePane_SearchParameters");
          dataQueryPaneName.style.display = 'none';
        }
      }

      // provide show/hide function of data download menu
      function dataDownloadHandler()  {
        var ddMenu = dijit.byId("downloadMenu");
        if (ddMenu.checked)  {
          var dataDownloadPaneName = document.getElementById("titlePane_DataDownload");
          dataDownloadPaneName.style.display = 'block';
        }
        else  {
          var dataDownloadPaneName = document.getElementById("titlePane_DataDownload");
          dataDownloadPaneName.style.display = 'none';
        }
      }

      // handles monitoring zoom levels and displaying messages on layers (bathy) that aren't available at certain levels
      // also handles switching between tiled and dynamic services for coral/sponge locations, eez, and nms
      function checkZoomLevel()  {
        var currentLevel = map.getLevel();
        var bathySwitch = dijit.byId('bathy_contours').attr('value');
        if (bathySwitch)  {
          //var currentLevel = map.getLevel();
          dojo.byId("msgBathy").innerHTML = "";
          if (currentLevel < 1)  {
             dojo.byId("msgBathy").innerHTML = "Zoom in map to see contours";
          }
          if (currentLevel > 6)  {
            dojo.byId("msgBathy").innerHTML = "Zoom out map to see contours";
          }
        }
        if (currentLevel > 8)  {
          if (totalRecords === retrievedRecords)  dscDynLayer.show();
          eezDynLayer.show();
          nmsDynLayer.show();
        }
        else  {
          if (totalRecords === retrievedRecords)  dscDynLayer.hide();
          eezDynLayer.hide();
          nmsDynLayer.hide();
        }
      }

      // load all data information and build modelLayerDetails array for later use
      function loadModelLayersXML()  {
        // extract information from xml
        var XMLHttpRequestObject = false;  
        if (window.XMLHttpRequest) {  
          XMLHttpRequestObject = new XMLHttpRequest();  
          XMLHttpRequestObject.overrideMimeType("text/xml");  
        }  
        else if (window.ActiveXObject) {  
          XMLHttpRequestObject = new  
          ActiveXObject("Microsoft.XMLHTTP");  
        }  
        if(XMLHttpRequestObject) {  
          XMLHttpRequestObject.open("GET", "xml/modelLayers.xml", true);  
          XMLHttpRequestObject.onreadystatechange = function()  
          {       
            if (XMLHttpRequestObject.readyState == 4 && XMLHttpRequestObject.status == 200) 
            {

              var xmlDoc = XMLHttpRequestObject.responseXML;
              var modelItems = xmlDoc.documentElement.getElementsByTagName("model");
              for (var j=0;j<modelItems.length;j++)
              {
                var modelItemString = "";
                modelItemString += modelItems[j].getAttribute("id");
                modelItemString += "|";
                modelItemString += modelItems[j].getAttribute("tileService");
                modelItemString += "|";
                modelItemString += modelItems[j].getAttribute("mapService");
                modelItemString += "|";
                modelItemString += modelItems[j].getAttribute("lyrIds");
                modelItemString += "|";
                modelItemString += modelItems[j].getAttribute("lyrType");
                modelItemString += "|";
                modelItemString += modelItems[j].getAttribute("boundaries");
                modelLayerDetails.push(modelItemString);
              }
            }// end of readyState == 4
          }      
          XMLHttpRequestObject.send(null);   
        }// end of readystate function
      }

      // build instructional page for geostatistics
      function geostatisticsSetup() {

        var gsMenu = dijit.byId("geospatialQuery");
        if (gsMenu.checked)  {

          var initialInfo_html = "";

          var tc = new dijit.layout.ContentPane({
            style: "font-family: arial; font-size: 12px; width: 100%; height: 100%; margin:10px; color:#000000; background-image:none; background-color:transparent; overflow:auto;"
            }, dojo.create("div"));

          initialInfo_html += '<div class="infoWindow">'; 
          initialInfo_html += '<p/>';
          initialInfo_html += '<center>The geostatistical tool summarizes the total number of records <b>(not individual corals or sponges)</b> in the coral/sponge database by either unique vernacular categories, scientific names, or phylum-order-family taxonomy within a user-defined region.</center>';
          initialInfo_html += '<p/>'; 
          initialInfo_html += '<center>Use your navigational tools (zoom in/zoom out/pan) to center and zoom to define the map area.</center>';
          initialInfo_html += '<p/>';
          // to eliminate confusion, basing whether to do a whole world query on the zoom level .. if zoom level is 0, will do world extent
          //initialInfo_html += '<br/>If you rather gather information for the whole world, click the checkbox "Whole World".</center>';
          initialInfo_html += '<form id="gsForm" data-dojo-type="dijit.form.Form" data-dojo-props="">';
          //initialInfo_html += '<center>';
          //initialInfo_html += '<input name="query_worldExtent" id="query_worldExtent" dojoType="dijit.form.CheckBox" value="true">&nbsp;&nbsp;&nbsp;&nbsp;Whole World';
          //initialInfo_html += '<p/>';
          // removed this option to allow stats to not include data query parameters ... this can be turned back on by removing comment tags          
          //initialInfo_html += '<center>If you want to include any parameters you set in the "Data Query" box, click the checkbox "Include Data Query".</center>';
          //initialInfo_html += '<p/>';
          //initialInfo_html += '<center>';
          //initialInfo_html += '<input name="query_dataQueryMenu" id="query_dataQueryMenu" dojoType="dijit.form.CheckBox" value="true">&nbsp;&nbsp;&nbsp;&nbsp;Include Data Query';
          //initialInfo_html += '<p/>';
          initialInfo_html += '<center>';
          initialInfo_html += '<b>Summary based on:</b>';
          initialInfo_html += '<br/>';
          initialInfo_html += '<table colspan="2">';
          initialInfo_html += '<tr><td width="5" align="left">';
          initialInfo_html += '<input type="radio" data-dojo-type="dijit.form.RadioButton" name="geoStat_Settings" id="gsVernacularYes" checked value="geostats_vernacular"/>';
          initialInfo_html += '</td><td width="175">';
          initialInfo_html += '<label for="gsVernacularYes">Vernacular Categories</label>';
          initialInfo_html += '</td></tr>';
          initialInfo_html += '<tr><td width="5" align="left">';
          initialInfo_html += '<input type="radio" data-dojo-type="dijit.form.RadioButton" name="geoStat_Settings" id="gsScientificYes" value="geostats_scientific"/>';
          initialInfo_html += '</td><td width="175">';
          initialInfo_html += '<label for="gsScientificYes">Scientific Names</label>';
          initialInfo_html += '</td></tr>';
          initialInfo_html += '<tr><td width="5" align="left">';
          initialInfo_html += '<input type="radio" data-dojo-type="dijit.form.RadioButton" name="geoStat_Settings" id="gsPhylumOrderFamilyYes" value="geostats_phylum-order-family"/>';
          initialInfo_html += '</td><td width="175">';
          initialInfo_html += '<label for="gsScientificYes">Phylum-Order-Family Taxonomy</label>';
          initialInfo_html += '</td></tr>';
          initialInfo_html += '</table>';
          initialInfo_html += '</center>';
          initialInfo_html += '</form>';
          initialInfo_html += '<p/>';
          initialInfo_html += '<center>When you are ready, hit the "Proceed" button.</center>';
          initialInfo_html += '<p/>';
          initialInfo_html += '<center><button dojoType="dijit.form.Button" style="font-size:12px;font-family:Helvetica,Arial;font-weight:normal;" type="button" onClick="taxonByGeostatistics();"><b>Proceed</b></button>';
          initialInfo_html += '<p/>';
          initialInfo_html += '<div><span id="processingMsg"></span></div>';
          initialInfo_html += '</div>'; 
          var cp1 = new dijit.layout.ContentPane({content: initialInfo_html});
          tc.addChild(cp1);   

          tc.domNode;

          gFloatingPane.attr("content",tc.domNode);
          gFloatingPane.show();
        }
        else {
          gFloatingPane.hide();
        }
      }

      // determine the unique values as well as totals based on spatial extent
      function taxonByGeostatistics()  {
        dojo.byId('processingMsg').innerHTML = "<center><img src='images/ajax-loader.gif'></center>";

        // determine whether to pull vernacular names or scientific names or phylum-order-family taxonomy
        var gsForm = dijit.byId("gsForm");
        var gsQuery = gsForm.attr('value').geoStat_Settings;
        //var queryWorldExtent = dijit.byId('query_worldExtent').attr('value');
        //var queryDataQueryMenu = dijit.byId('query_dataQueryMenu').attr('value');
        // determine if whole world query is in order
        var currentLevel = map.getLevel();
        if (currentLevel == 0)  {
          var queryWorldExtent = true; 
        }
        else  {
          var queryWorldExtent = false;
        }
        // by request, this is automatically going to use any data query information
        var queryDataQueryMenu = true;

        // set up some variables
        var newXMax = 20037508.3427892        // this value represents the international date line as 180
        var newXMin = -20037508.3427892       // this value represents the international date line as -180

        // calculate boundaries into geographic units
        var currentMapExtent = map.extent;
        var x = currentMapExtent.xmin;
        var y = currentMapExtent.ymin;
        var num3 = x / 6378137.0;
        var num4 = num3 * 57.295779513082323;
        var num5 = Math.floor((num4 + 180.0) / 360.0);
        var num6 = num4 - (num5 * 360.0);
        var num7 = 1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * y) / 6378137.0)));
        var west = num6;
        var south = num7 * 57.295779513082323;
        var x = currentMapExtent.xmax;
        var y = currentMapExtent.ymax;
        var num3 = x / 6378137.0;
        var num4 = num3 * 57.295779513082323;
        var num5 = Math.floor((num4 + 180.0) / 360.0);
        var num6 = num4 - (num5 * 360.0);
        var num7 = 1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * y) / 6378137.0)));
        var east = num6;
        var north = num7 * 57.295779513082323;
        // calculate geographic units into web mercator
        var num = east * 0.017453292519943295;
        var actualXMax = 6378137.0 * num;
        var a = north * 0.017453292519943295;
        var actualYMax = 3189068.5 * Math.log((1.0 + Math.sin(a)) / (1.0 - Math.sin(a)));
        var num = west * 0.017453292519943295;
        var actualXMin = 6378137.0 * num;
        var a = south * 0.017453292519943295;
        var actualYMin = 3189068.5 * Math.log((1.0 + Math.sin(a)) / (1.0 - Math.sin(a)));

        console.log("XMin: " + actualXMin + " YMin: " + actualYMin + " XMax: " + actualXMax + " YMax: " + actualYMax);
        console.log("West: " + west + " South: " + south + " East: " + east + " North: " + north);

        // determine whether one or two queries are going to have to be made .. this is based on whether the region being queried straddles the intl date line or the central meridian
        // if two queries are necessary, will have to use deferredList
        var oneQuery = true;
        var intlDateLine = true;
        if ( (east < 0) && (west > 0) )  {
          oneQuery = false;
        }
        if ( (east > 0) && (west < 0) )  {
          oneQuery = false;
          intlDateLine = false;
        }
        if (east < west)  {
          oneQuery = false;
        }
        // overread all extent settings if whole world to be queried
        if (queryWorldExtent)  oneQuery = true;

        if (oneQuery)  {
          // create query to send to arcgis rest services 
          if (queryDataQueryMenu)  {
            var dscForm = dijit.byId("dscForm");
            var fromDate = dijit.byId("fromDate").get('value');
            var toDate = dijit.byId("toDate").get('value');
            var depthMin = dijit.byId("depthSearchMin").get('value');
            var depthMax = dijit.byId("depthSearchMax").get('value');
            var recordsPhotosOnly = dijit.byId("recordsWithPhotos").get('value');

            var whereClause = "";

            // add scientific name or common name or order-family-genus to search if entered (using upper function to eliminate upper/lower case issues)
            // scientific name will search against scientificname and synonyms attributes
            var speciesQuerySelected = false;
            var phylumOnly = false;
            var speciesQuery = dscForm.attr('value').Scientific_Vernacular_OFG_pQuery;
            if (speciesQuery == "Scientific")  {
              var scientificNameText = dijit.byId("dbSearchTB").get('value');
              if (scientificNameText.length != 0)  {
                speciesQuerySelected = true;
                whereClause += "UPPER(synonymsearchproxy) LIKE ";
                //whereClause += "UPPER('%";
                whereClause += "UPPER('%25";                
		whereClause += scientificNameText;
                //whereClause += "%')";
                whereClause += "%25')";              }          
            }
            if (speciesQuery == "Vernacular")  {
              var vernacularNameText = dijit.byId("vernacularSearch").get('value');
              if (vernacularNameText != "None")  {
                speciesQuerySelected = true;
                whereClause += "UPPER(vernacularnamecategory) = ";
                whereClause += "UPPER('";
                whereClause += vernacularNameText;
                whereClause += "')";
              }             
            }
            if (speciesQuery == "OFG")  {
              var taxonphylumText = document.getElementById("taxonphylum").value;
              if (taxonphylumText != "None")  {
                speciesQuerySelected = true;
                phylumOnly = true;
                whereClause += "UPPER(taxonphylum) = ";
                whereClause += "UPPER('";
                whereClause += taxonphylumText;
                whereClause += "')";
                var taxonorderText = document.getElementById("taxonorder").value;
                if ((taxonorderText != "None") && (taxonorderText.length != 0))  {
                  phylumOnly = false;
                  whereClause += " AND ";
                  whereClause += "UPPER(taxonorder) = ";
                  whereClause += "UPPER('";
                  whereClause += taxonorderText;
                  whereClause += "')";
                  var taxonfamilyText = document.getElementById("taxonfamily").value;
                  if ((taxonfamilyText != "None") && (taxonfamilyText.length != 0))  {
                    whereClause += " AND ";
                    whereClause += "UPPER(taxonfamily) = ";
                    whereClause += "UPPER('";
                    whereClause += taxonfamilyText;
                    whereClause += "')";
                    var taxongenusText = document.getElementById("taxongenus").value;
                    if ((taxongenusText != "None") && (taxongenusText.length != 0)) {
                      whereClause += " AND ";
                      whereClause += "UPPER(taxongenus) = ";
                      whereClause += "UPPER('";
                      whereClause += taxongenusText;
                      whereClause += "')";
                    }
                  }
                } 
              }            
            }
            if (speciesQuery == "pQuery")  {
              var pQueryNameText = dijit.byId("pQuerySearch").get('value');
              if (pQueryNameText != "None")  {
                speciesQuerySelected = true;
                if (pQueryNameText == "structure-forming deep sea corals")  {
                  whereClause += "(UPPER(vernacularnamecategory) = UPPER('stony coral (branching)') OR UPPER(vernacularnamecategory) = UPPER('black coral') OR UPPER(vernacularnamecategory) = UPPER('gorgonian coral'))";
                }
                if (pQueryNameText == "structure-forming animals")  {
                  whereClause += "(UPPER(vernacularnamecategory) LIKE UPPER('%sponge%') OR UPPER(vernacularnamecategory) = UPPER('sea pen') OR UPPER(vernacularnamecategory) = UPPER('lace coral'))";
                }
              }
            }
            // use ocean to search if entered
            var definedRegionSelected = false;
            var definedRegion = dscForm.attr('value').LME_Ocean_FCR
            if (definedRegion == "LME") {
              var LMEBoundaries = dijit.byId("lmeSearch").get('value');
              if (LMEBoundaries != "None")  {
                definedRegionSelected = true;
                if (whereClause.length != 0)  {
                  whereClause += " AND ";
                }
                whereClause += "UPPER(largemarineecosystem) = ";
                whereClause += "UPPER('";
                whereClause += LMEBoundaries;
                whereClause += "')";
              }              
            }
            if (definedRegion == "Ocean") {
              var OceanBoundaries = dijit.byId("oceanSearch").get('value');
              if (OceanBoundaries != "None")  {
                definedRegionSelected = true;
                if (whereClause.length != 0)  {
                  whereClause += " AND ";
                }
                whereClause += "UPPER(ocean) = ";
                whereClause += "UPPER('";
                whereClause += OceanBoundaries;
                whereClause += "')";
              }
            }
            if (definedRegion == "FCR")  {
              var FCRBoundaries = dijit.byId("fcrSearch").get('value');
              if (FCRBoundaries != "None")  {
                definedRegionSelected = true;
                if (whereClause.length != 0)  {
                  whereClause += " AND ";
                }
                whereClause += "UPPER(fishcouncilregion) = ";
                whereClause += "UPPER('";
                whereClause += FCRBoundaries;
                whereClause += "')";
              }
            }
            // add time frame to search
            if (whereClause.length != 0)  {
                whereClause += " AND ";
            }
            whereClause += "observationyear >= ";
            whereClause += fromDate;
            whereClause += " AND observationyear <= ";
            whereClause += toDate;
            // add depth range to search
            if (whereClause.length != 0)  {
              whereClause += " AND ";
            }
            whereClause += "depthinmeters >= ";
            whereClause += depthMin;
            whereClause += " AND depthinmeters <= ";
            whereClause += depthMax;
            // determine whether to retrieve only records with photos
            if (recordsPhotosOnly)  {
              if (whereClause.length != 0)  {
                whereClause += " AND ";
              }
              whereClause += "imageurl <> 'NA'";
            }
            if (whereClause.length != 0)  {
              //var serviceURL = "https://service.ln.ncddc.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0/query?where=";
              //var serviceURL = "https://service.ncddc.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0/query?where=";
              //var serviceURL = "https://deepseacoraldata.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0/query?where=";
              var serviceURL = "https://gis.ngdc.noaa.gov/arcgis/rest/services/deep_sea_corals/MapServer/0/query?where=";
              serviceURL += whereClause;
            }
            else  {
              //var serviceURL = "https://service.ln.ncddc.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0/query?where=where=1=1";
              //var serviceURL = "https://service.ncddc.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0/query?where=where=1=1";
              //var serviceURL = "https://deepseacoraldata.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0/query?where=where=1=1";
              var serviceURL = "https://gis.ngdc.noaa.gov/arcgis/rest/services/deep_sea_corals/MapServer/0/query?where=where=1=1";
            }
          }
          else  {
            //var serviceURL = "https://service.ln.ncddc.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0/query?where=1=1";
            //var serviceURL = "https://service.ncddc.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0/query?where=1=1";
            //var serviceURL = "https://deepseacoraldata.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0/query?where=1=1";
            var serviceURL = "https://gis.ngdc.noaa.gov/arcgis/rest/services/deep_sea_corals/MapServer/0/query?where=1=1";
            
          }
          if (queryWorldExtent)  {
            var geometrySettings = "&returnGeometry=false";
          }
          else {
            var geometrySettings = "&geometry=" + actualXMin + "," + actualYMin + "," + actualXMax + "," + actualYMax + "&geometryType=esriGeometryEnvelope&returnGeometry=false";
          }
          if (gsQuery == "geostats_vernacular")  {
            var otherSettings = "&outFields=vernacularnamecategory&f=json";
          }
          if (gsQuery == "geostats_scientific")  {
            var otherSettings = "&outFields=scientificname&f=json";
          }
          if (gsQuery == "geostats_phylum-order-family")  {
            var otherSettings = "&outFields=taxonphylum,taxonorder,taxonfamily&f=json";
          }
          var queryURL = serviceURL + geometrySettings + otherSettings;
          console.log(queryURL);
          var deferred = getGeostatisticsResults(queryURL);
          // process features returned from query
          deferred.addCallback(function(response)  {
            dojo.byId('processingMsg').innerHTML = "";
            var values = [];
            var uniqueValues = [];
            var totals = [];
            var value;
            var features = response.features;
            dojo.forEach(features, function(feature)  {
              if (gsQuery == "geostats_vernacular")  {
                value = feature.attributes["vernacularnamecategory"];
              }
              if (gsQuery == "geostats_scientific")  {
                value = feature.attributes["scientificname"];
              }
              if (gsQuery == "geostats_phylum-order-family")  {
                taxonPhylum = feature.attributes["taxonphylum"];
                taxonOrder = feature.attributes["taxonorder"];
                taxonFamily = feature.attributes["taxonfamily"];
                value = "";
                value += taxonPhylum;
                value += ",";
                value += taxonOrder;
                value += ",";
                value += taxonFamily;
              }
              values.push(value);
              if (uniqueValues.length === 0)  {
                uniqueValues.push(value);
              }
              else  {
                var foundIt = false;
                for (var i=0;i<uniqueValues.length;i++)  {
                  if (uniqueValues[i] == value)  foundIt = true;
                }
                if (!foundIt)  uniqueValues.push(value);
              }
            });
            for (var i=0;i<uniqueValues.length;i++)  {
              var totalCounter = 0;
              for (var j=0;j<values.length;j++)  {
                if (uniqueValues[i] == values[j])  totalCounter++;
              }
              totals.push(totalCounter);
            }
            var tc = new dijit.layout.ContentPane({
              style: "font-family: arial; font-size: 12px; width: 100%; height: 100%; margin:10px; color:#000000; background-image:none; background-color:transparent; overflow:auto;"
            }, dojo.create("div"));
            var geostats_html = "";
            geostats_html += '<div class="infoWindow">'; 
            geostats_html += '<p/>';
            geostats_html += '<button dojoType="dijit.form.Button" style="font-size:12px;font-family:Helvetica,Arial;font-weight:normal;" type="button" onClick="geostatisticsSetup();"><b>Back</b></button>';
            geostats_html += '<p/>';
            geostats_html += '<center><b>Total Number of Corals/Sponges: ';
            geostats_html += features.length;
            geostats_html += '</b><br/>(Represents the total number of records, not individuals)</center>';
            geostats_html += '<br/>';
            geostats_html += '<center>Please note<br/>To scroll the list, use your mouse scroll.<br/>To close list, click on highlighted "Geostatistics" button.</center>';
            geostats_html += '<p/>';
            if (features.length != 0)  {
              var sortableValuesTotals = [];
              for (var i=0;i<uniqueValues.length;i++)  {
                var newString = "";
                newString += uniqueValues[i];
                newString += "|";
                newString += totals[i];
                sortableValuesTotals.push(newString);
              }
              var sortedValuesTotals = sortableValuesTotals.sort();
              if (gsQuery == "geostats_vernacular")  {
                geostats_html += '<center><table colspan="2" border="1">';
                geostats_html += '<tr><td width="150" align="center"><b>Vernacular Name</b></td><td><b>Totals</b></td></tr>';
              }
              if (gsQuery == "geostats_scientific")  {
                geostats_html += '<center><table colspan="2" border="1">';
                geostats_html += '<tr><td width="150" align="center"><b>Scientific Name</b></td><td><b>Totals</b></td></tr>';
              }
              if (gsQuery == "geostats_phylum-order-family")  {
                geostats_html += '<center><table  colspan="4" border="1">';
                geostats_html += '<tr><td align="center"><b>Phylum</b></td><td align="center"><b>Order</b></td><td align="center"><b>Family</b></td><td><b>Totals</b></td></tr>';
              }
              if ((gsQuery == "geostats_vernacular") || (gsQuery == "geostats_scientific"))  {
                for (var i=0;i<sortedValuesTotals.length;i++)  {
                  var sortedArray = sortedValuesTotals[i].split("|");
                  geostats_html += '<tr><td width="150" align="left">';
                  geostats_html += sortedArray[1];
                  geostats_html += '</td><td align="right">';
                  geostats_html += sortedArray[0];
                  geostats_html += '</td></tr>';
                }
              }
              else  {
                for (var i=0;i<sortedValuesTotals.length;i++)  {
                  var sortedArray = sortedValuesTotals[i].split("|");
                  var phylumOrderFamilyArray = sortedArray[0].split(",");
                  geostats_html += '<tr><td align="left">';
                  geostats_html += phylumOrderFamilyArray[0];
                  geostats_html += '</td><td align="left">';
                  geostats_html += phylumOrderFamilyArray[1];
                  geostats_html += '</td><td align="left">';
                  geostats_html += phylumOrderFamilyArray[2];
                  geostats_html += '</td><td align="right">';
                  geostats_html += sortedArray[1];
                  geostats_html += '</td></tr>';
                }
              }
              geostats_html += '</table></center>'; 
            }
            geostats_html += '</div>'; 

            var cp1 = new dijit.layout.ContentPane({content: geostats_html});
            tc.addChild(cp1);   
            tc.domNode;
 
            gFloatingPane.attr("content",tc.domNode);
            gFloatingPane.show();        
          });
        }    
        else  {
          if (intlDateLine)  {
            var geometrySettings_east = "&geometry=" + actualXMin + "," + actualYMin + "," + newXMax + "," + actualYMax + "&geometryType=esriGeometryEnvelope&returnGeometry=false";
            var geometrySettings_west = "&geometry=" + newXMin + "," + actualYMin + "," + actualXMax + "," + actualYMax + "&geometryType=esriGeometryEnvelope&returnGeometry=false";
          }
          else  {
            var geometrySettings_east = "&geometry=0," + actualYMin + "," + actualXMax + "," + actualYMax + "&geometryType=esriGeometryEnvelope&returnGeometry=false";
            var geometrySettings_west = "&geometry=" + actualXMin + "," + actualYMin + ",0," + actualYMax + "&geometryType=esriGeometryEnvelope&returnGeometry=false";
          }
          if (queryDataQueryMenu)  {
            var dscForm = dijit.byId("dscForm");
            var fromDate = dijit.byId("fromDate").get('value');
            var toDate = dijit.byId("toDate").get('value');
            var depthMin = dijit.byId("depthSearchMin").get('value');
            var depthMax = dijit.byId("depthSearchMax").get('value');
            var recordsPhotosOnly = dijit.byId("recordsWithPhotos").get('value');

            var whereClause = "";

            // add scientific name or common name or order-family-genus to search if entered (using upper function to eliminate upper/lower case issues)
            // scientific name will search against scientificname and synonyms attributes
            var speciesQuerySelected = false;
            var phylumOnly = false;
            var speciesQuery = dscForm.attr('value').Scientific_Vernacular_OFG_pQuery;
            if (speciesQuery == "Scientific")  {
              var scientificNameText = dijit.byId("dbSearchTB").get('value');
              if (scientificNameText.length != 0)  {
                speciesQuerySelected = true;
                whereClause += "UPPER(synonymsearchproxy) LIKE ";
                whereClause += "UPPER('%25";
                whereClause += scientificNameText;
                whereClause += "%25')";
              }          
            }
            if (speciesQuery == "Vernacular")  {
              var vernacularNameText = dijit.byId("vernacularSearch").get('value');
              if (vernacularNameText != "None")  {
                speciesQuerySelected = true;
                whereClause += "UPPER(vernacularnamecategory) = ";
                whereClause += "UPPER('";
                whereClause += vernacularNameText;
                whereClause += "')";
              }             
            }
            if (speciesQuery == "OFG")  {
              var taxonphylumText = document.getElementById("taxonphylum").value;
              if (taxonphylumText != "None")  {
                speciesQuerySelected = true;
                phylumOnly = true;
                whereClause += "UPPER(taxonphylum) = ";
                whereClause += "UPPER('";
                whereClause += taxonphylumText;
                whereClause += "')";
                var taxonorderText = document.getElementById("taxonorder").value;
                if ((taxonorderText != "None") && (taxonorderText.length != 0))  {
                  phylumOnly = false;
                  whereClause += " AND ";
                  whereClause += "UPPER(taxonorder) = ";
                  whereClause += "UPPER('";
                  whereClause += taxonorderText;
                  whereClause += "')";
                  var taxonfamilyText = document.getElementById("taxonfamily").value;
                  if ((taxonfamilyText != "None") && (taxonfamilyText.length != 0))  {
                    whereClause += " AND ";
                    whereClause += "UPPER(taxonfamily) = ";
                    whereClause += "UPPER('";
                    whereClause += taxonfamilyText;
                    whereClause += "')";
                    var taxongenusText = document.getElementById("taxongenus").value;
                    if ((taxongenusText != "None") && (taxongenusText.length != 0)) {
                      whereClause += " AND ";
                      whereClause += "UPPER(taxongenus) = ";
                      whereClause += "UPPER('";
                      whereClause += taxongenusText;
                      whereClause += "')";
                    }
                  }
                } 
              }            
            }
            if (speciesQuery == "pQuery")  {
              var pQueryNameText = dijit.byId("pQuerySearch").get('value');
              if (pQueryNameText != "None")  {
                speciesQuerySelected = true;
                if (pQueryNameText == "structure-forming deep sea corals")  {
                  whereClause += "(UPPER(vernacularnamecategory) = UPPER('stony coral (branching)') OR UPPER(vernacularnamecategory) = UPPER('black coral') OR UPPER(vernacularnamecategory) = UPPER('gorgonian coral'))";
                }
                if (pQueryNameText == "structure-forming animals")  {
                  whereClause += "(UPPER(vernacularnamecategory) LIKE UPPER('%sponge%') OR UPPER(vernacularnamecategory) = UPPER('sea pen') OR UPPER(vernacularnamecategory) = UPPER('lace coral'))";
                }
              }
            }
            // use ocean to search if entered
            var definedRegionSelected = false;
            var definedRegion = dscForm.attr('value').LME_Ocean_FCR
            if (definedRegion == "LME") {
              var LMEBoundaries = dijit.byId("lmeSearch").get('value');
              if (LMEBoundaries != "None")  {
                definedRegionSelected = true;
                if (whereClause.length != 0)  {
                  whereClause += " AND ";
                }
                whereClause += "UPPER(largemarineecosystem) = ";
                whereClause += "UPPER('";
                whereClause += LMEBoundaries;
                whereClause += "')";
              }              
            }
            if (definedRegion == "Ocean") {
              var OceanBoundaries = dijit.byId("oceanSearch").get('value');
              if (OceanBoundaries != "None")  {
                definedRegionSelected = true;
                if (whereClause.length != 0)  {
                  whereClause += " AND ";
                }
                whereClause += "UPPER(ocean) = ";
                whereClause += "UPPER('";
                whereClause += OceanBoundaries;
                whereClause += "')";
              }
            }
            if (definedRegion == "FCR")  {
              var FCRBoundaries = dijit.byId("fcrSearch").get('value');
              if (FCRBoundaries != "None")  {
                definedRegionSelected = true;
                if (whereClause.length != 0)  {
                  whereClause += " AND ";
                }
                whereClause += "UPPER(fishcouncilregion) = ";
                whereClause += "UPPER('";
                whereClause += FCRBoundaries;
                whereClause += "')";
              }
            }
            // add time frame to search
            if (whereClause.length != 0)  {
                whereClause += " AND ";
            }
            whereClause += "observationyear >= ";
            whereClause += fromDate;
            whereClause += " AND observationyear <= ";
            whereClause += toDate;
            // add depth range to search
            if (whereClause.length != 0)  {
              whereClause += " AND ";
            }
            whereClause += "depthinmeters >= ";
            whereClause += depthMin;
            whereClause += " AND depthinmeters <= ";
            whereClause += depthMax;
            // determine whether to retrieve only records with photos
            if (recordsPhotosOnly)  {
              if (whereClause.length != 0)  {
                whereClause += " AND ";
              }
              whereClause += "imageurl <> 'NA'";
            }
            if (whereClause.length != 0)  {
              //var serviceURL = "https://service.ln.ncddc.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0/query?where=";
              //var serviceURL = "https://service.ncddc.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0/query?where=";
              //var serviceURL = "https://deepseacoraldata.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0/query?where=";
              var serviceURL = "https://gis.ngdc.noaa.gov/arcgis/rest/services/deep_sea_corals/MapServer/0/query?where=";
              serviceURL += whereClause;
            }
            else  {
              //var serviceURL = "https://service.ln.ncddc.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0/query?where=where=1=1";
              //var serviceURL = "https://service.ncddc.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0/query?where=where=1=1";
              //var serviceURL = "https://deepseacoraldata.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0/query?where=where=1=1";
              var serviceURL = "https://gis.ngdc.noaa.gov/arcgis/rest/services/deep_sea_corals/MapServer/0/query?where=where=1=1";
              
            }
          }
          else  {
            //var serviceURL = "https://service.ln.ncddc.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0/query?where=where=1=1";
            //var serviceURL = "https://service.ncddc.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0/query?where=1=1";
            //var serviceURL = "https://deepseacoraldata.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0/query?where=1=1";
            var serviceURL = "https://gis.ngdc.noaa.gov/arcgis/rest/services/deep_sea_corals/MapServer/0/query?where=1=1";            
          }
          if (gsQuery == "geostats_vernacular")  {
            var otherSettings = "&outFields=vernacularnamecategory&f=json";
          }
          if (gsQuery == "geostats_scientific")  {
            var otherSettings = "&outFields=scientificname&f=json";
          }
          if (gsQuery == "geostats_phylum-order-family")  {
            var otherSettings = "&outFields=taxonphylum,taxonorder,taxonfamily&f=json";
          }          
          var queryURL_east = serviceURL + geometrySettings_east + otherSettings;
          var queryURL_west = serviceURL + geometrySettings_west + otherSettings;
          console.log(queryURL_east);
          console.log(queryURL_west);
          var d1 = getGeostatisticsResults(queryURL_east);
          var d2 = getGeostatisticsResults(queryURL_west);
          // create a deferred list of the two queries
          dList = new dojo.DeferredList([d1, d2]);
          dList.then(handleGeostatisticalResults);
        }
      }

      // process query to return features based on geographic extent
      function getGeostatisticsResults(url)  {
        var deferred = esri.request({
	  url: url, 
	  content: { f: "json" },
	  handleAs: "json",
 	  callbackParamName: "callback"
        });
        return deferred;
      }

      // process deferred list data when it has completed query
      function handleGeostatisticalResults(results)  {
        // determine whether to pull vernacular names or scientific names
        var gsForm = dijit.byId("gsForm");
        var gsQuery = gsForm.attr('value').geoStat_Settings;

        var geostatsFailure = false;

        if ( ! results[0][0] )  {
          console.log("East query failed");
          geostatsFailure = true;
        }
        if ( ! results[1][0] )  {
          console.log("West query failed");
          geostatsFailure = true;
        }
        
        if (!geostatsFailure)  {
          var eFeatures = results[0][1].features;
          var wFeatures = results[1][1].features;

          console.log("Number of features (east): " + eFeatures.length);
          console.log("Number of features (west): " + wFeatures.length);

          // if any values were returned from east query, get the unique values and totals of each
          if (eFeatures.length != 0)  {
            var eValues = [];
            var eUniqueValues = [];
            var eTotals = [];
            var eValue ;
            dojo.forEach(eFeatures, function(eFeature)  {
              if (gsQuery == "geostats_vernacular")  {
                eValue = eFeature.attributes["vernacularnamecategory"];
              }
              if (gsQuery == "geostats_scientific")  {
                eValue = eFeature.attributes["scientificname"];
              }
              if (gsQuery == "geostats_phylum-order-family")  {
                taxonPhylum = eFeature.attributes["taxonphylum"];
                taxonOrder = eFeature.attributes["taxonorder"];
                taxonFamily = eFeature.attributes["taxonfamily"];
                eValue = "";
                eValue += taxonPhylum;
                eValue += ",";
                eValue += taxonOrder;
                eValue += ",";
                eValue += taxonFamily;
              }
              eValues.push(eValue);
              if (eUniqueValues.length === 0)  {
                eUniqueValues.push(eValue);
              }
              else  {
                var foundIt = false;
                for (var i=0;i<eUniqueValues.length;i++)  {
                  if (eUniqueValues[i] == eValue)  foundIt = true;
                }
                if (!foundIt)  eUniqueValues.push(eValue);
              }
            });
            for (var i=0;i<eUniqueValues.length;i++)  {
              var eTotalCounter = 0;
              for (var j=0;j<eValues.length;j++)  {
                if (eUniqueValues[i] == eValues[j])  eTotalCounter++;
              }
              eTotals.push(eTotalCounter);
            }           
          }
          // if any values were returned from west query, get the unique values and totals of each
          if (wFeatures.length != 0)  {
            var wValues = [];
            var wUniqueValues = [];
            var wTotals = [];
            var wValue ;
            dojo.forEach(wFeatures, function(wFeature)  {
              if (gsQuery == "geostats_vernacular")  {
                wValue = wFeature.attributes["vernacularnamecategory"];
              }
              if (gsQuery == "geostats_scientific")  {
                wValue = wFeature.attributes["scientificname"];
              }
              if (gsQuery == "geostats_phylum-order-family")  {
                taxonPhylum = wFeature.attributes["taxonphylum"];
                taxonOrder = wFeature.attributes["taxonorder"];
                taxonFamily = wFeature.attributes["taxonfamily"];
                wValue = "";
                wValue += taxonPhylum;
                wValue += ",";
                wValue += taxonOrder;
                wValue += ",";
                wValue += taxonFamily;
              }
              wValues.push(wValue);
              if (wUniqueValues.length === 0)  {
                wUniqueValues.push(wValue);
              }
              else  {
                var foundIt = false;
                for (var i=0;i<wUniqueValues.length;i++)  {
                  if (wUniqueValues[i] == wValue)  foundIt = true;
                }
                if (!foundIt)  wUniqueValues.push(wValue);
              }
            });
            for (var i=0;i<wUniqueValues.length;i++)  {
              var wTotalCounter = 0;
              for (var j=0;j<wValues.length;j++)  {
                if (wUniqueValues[i] == wValues[j])  wTotalCounter++;
              }
              wTotals.push(wTotalCounter);
            }           
          }
          // merge the totals together to make one table of information
          var totalUniqueValues = [];
          var totalValues = [];
          var uniqueValues = [];
          var totals = [];
          if ((eFeatures.length != 0) && (wFeatures.length === 0))  {
            for (var i=0;i<eUniqueValues.length;i++)  {
              totalUniqueValues.push(eUniqueValues[i]);
              totalValues.push(eTotals[i]);
            }
          }
          if ((eFeatures.length === 0) && (wFeatures.length != 0))  {
            for (var i=0;i<wUniqueValues.length;i++)  {
              totalUniqueValues.push(wUniqueValues[i]);
              totalValues.push(wTotals[i]);
            }
          }
          if ((eFeatures.length != 0) && (wFeatures.length != 0))  {
            for (var i=0;i<wUniqueValues.length;i++)  {
              var newTotals = wTotals[i];
              for (var j=0;j<eUniqueValues.length;j++)  {
                if (wUniqueValues[i] == eUniqueValues[j])  {
                  newTotals = newTotals + eTotals[j];
                }
              }
              uniqueValues.push(wUniqueValues[i]);
              totalUniqueValues.push(wUniqueValues[i]);
              totals.push(newTotals);
              totalValues.push(newTotals);
            }
            for (var i=0;i<eUniqueValues.length;i++)  {
              var foundIt = false;
              for (var j=0;j<uniqueValues.length;j++)  {
                if (eUniqueValues[i] == uniqueValues[j])  {
                  foundIt = true;
                }
              }
              if (!foundIt)  {
                totalUniqueValues.push(eUniqueValues[i]);
                totalValues.push(eTotals[i]);
              }
            }
          }

          // create content for geostatistical popup
          var tc = new dijit.layout.ContentPane({
            style: "font-family: arial; font-size: 12px; width: 100%; height: 100%; margin:10px; color:#000000; background-image:none; background-color:transparent; overflow:auto;"
          }, dojo.create("div"));
          var geostats_html = "";
          geostats_html += '<div class="infoWindow">'; 
          geostats_html += '<p/>';
          geostats_html += '<button dojoType="dijit.form.Button" style="font-size:12px;font-family:Helvetica,Arial;font-weight:normal;" type="button" onClick="geostatisticsSetup();"><b>Back</b></button>';
          geostats_html += '<p/>';
          var totalFeatures = wFeatures.length + eFeatures.length;  
          geostats_html += '<center><b>Total Number of Corals/Sponges: ';
          geostats_html += totalFeatures;
          geostats_html += '</b><br/>(total number of records, not individuals)</center>';
          geostats_html += '<br/>';
          geostats_html += '<center>Please note<br/>To scroll the list, use your mouse scroll.<br/>To close list, click on highlighted "Geostatistics" button.</center>';
          geostats_html += '<p/>';
          if (totalFeatures != 0)  {
            var sortableValuesTotals = [];
            for (var i=0;i<totalUniqueValues.length;i++)  {
              var newString = "";
              newString += totalUniqueValues[i];
              newString += "|";
              newString += totalValues[i];
              sortableValuesTotals.push(newString);
            }
            var sortedValuesTotals = sortableValuesTotals.sort();
            geostats_html += '<p/>';
            if (gsQuery == "geostats_vernacular")  {
              geostats_html += '<center><table colspan="2" border="1">';
              geostats_html += '<tr><td width="150" align="center"><b>Vernacular Name</b></td><td><b>Totals</b></td></tr>';
            }
            if (gsQuery == "geostats_scientific")  {
              geostats_html += '<center><table colspan="2" border="1">';
              geostats_html += '<tr><td width="150" align="center"><b>Scientific Name</b></td><td><b>Totals</b></td></tr>';
            }
            if (gsQuery == "geostats_phylum-order-family")  {
              geostats_html += '<center><table colspan="4" border="1">';
              geostats_html += '<tr><td align="center"><b>Phylum</b></td><td align="center"><b>Order</b></td><td align="center"><b>Family</b></td><td><b>Totals</b></td></tr>';
            }
            if ((gsQuery == "geostats_vernacular") || (gsQuery == "geostats_scientific"))  {
              for (var i=0;i<sortedValuesTotals.length;i++)  {
                var sortedArray = sortedValuesTotals[i].split("|");
                geostats_html += '<tr><td width="150" align="left">';
                geostats_html += sortedArray[0];
                geostats_html += '</td><td align="right">';
                geostats_html += sortedArray[1];
                geostats_html += '</td></tr>';
              }
            }
            else  {
              for (var i=0;i<sortedValuesTotals.length;i++)  {
                var sortedArray = sortedValuesTotals[i].split("|");
                var phylumOrderFamilyArray = sortedArray[0].split(",");
                geostats_html += '<tr><td align="left">';
                geostats_html += phylumOrderFamilyArray[0];
                geostats_html += '</td><td align="left">';
                geostats_html += phylumOrderFamilyArray[1];
                geostats_html += '</td><td align="left">';
                geostats_html += phylumOrderFamilyArray[2];
                geostats_html += '</td><td align="right">';
                geostats_html += sortedArray[1];
                geostats_html += '</td></tr>';
              }
            }
            geostats_html += '</table></center>';
          }
          geostats_html += '</div>';
          var cp1 = new dijit.layout.ContentPane({content: geostats_html});
          tc.addChild(cp1);   
          tc.domNode;
 
          gFloatingPane.attr("content",tc.domNode);
          gFloatingPane.show();
        }
        else  {
          // create content popup
          var tc = new dijit.layout.ContentPane({
            style: "font-family: arial; font-size: 12px; width: 100%; height: 100%; margin:10px; color:#000000; background-image:none; background-color:transparent; overflow:auto;"
          }, dojo.create("div"));
          var geostats_html = "";
          geostats_html += '<div class="infoWindow">';
          geostats_html += '<center>An error occurred while trying to process the geostatistics. Try again.</center>';
          geostats_html += '</div>';
          geostats_html += '</div>';
          var cp1 = new dijit.layout.ContentPane({content: geostats_html});
          tc.addChild(cp1);   
          tc.domNode;
 
          gFloatingPane.attr("content",tc.domNode);
          gFloatingPane.show();
        }
      }

      // redraw map based on any search criterias as well as which layers have been turned on/off
      function UpdateMap()  {

        // set tab container to show legend
        dijit.byId("tabconID").selectChild(dijit.byId("legendTab"));

        var today = new Date();
        year = today.getFullYear();
        var toDateCheck = year;

        if (!mapDrawing)  {
          var photoFrame = document.getElementById("photoImage"); 
          var photoTag = "<img src='images/photoLegend.png' height='175' width='235'/>";
          photoFrame.innerHTML = photoTag;
          var layersOnMap = map.layerIds.length;
          //alert(layersOnMap);
          if (layersOnMap > 1)  {
            map.removeAllLayers();
            map.addLayer(basemap);
            map.addLayer(sitesLayer);
            map.addLayer(siteSelectedLayer);
            map.addLayer(siteHighlightLayer);
            if (sitesLayer != undefined)  sitesLayer.clear();
            if (siteSelectedLayer != undefined)  siteSelectedLayer.clear();
            if (siteHighlightLayer != undefined)  siteHighlightLayer.clear();
            //map.centerAndZoom(mapCenterPoint,0);
            dojo.byId("query_error_msg").innerHTML = "";
          }

          // remove any opened infowindows or panes and clear record counter message
          map.infoWindow.hide();
          pFloatingPane.hide();
          dojo.byId("msg").innerHTML = "";
          dojo.byId("msgBathy").innerHTML = "";

          // determine if model layers need to be added to map
          var modelLyrString = modelLayersTree.getAllChecked();
          if (modelLyrString.length != 0)  {
            // need to remove any checks that don't have any settings to data .. ie headers in the toc
            var modelLyrArray = modelLyrString.split(",");       
            var dataLyrString = "";
            for (i=0;i<modelLyrArray.length;i++)  {
              var lyrName = modelLyrArray[i];
              if ((lyrName == "USAtl") || (lyrName == "NCCOS") || (lyrName == "NCCOS_NE") || (lyrName == "NCCOS_SE") || (lyrName == "NCCOS_GOM"))  {
              }
              else  {
                if (dataLyrString.length != 0)  {
                  dataLyrString += ',';
                  dataLyrString += lyrName;
                }
                else  {
                  dataLyrString += lyrName;
                }
              }
            }
            // determine if more than one layer needs to be added to the map
            if (dataLyrString.length != 0)  {
              if (dataLyrString.indexOf(",") != -1)  {
                dataLyrArray = dataLyrString.split(",");
                for (var i=0; i<dataLyrArray.length; i++)  {
                  var lyrName = dataLyrArray[i];
                  for (var j=0; j<modelLayerDetails.length; j++)  {
                    var dataString = modelLayerDetails[j];
                    var dataArray = dataString.split("|");
                    var modelName = dataArray[0];
                    var modelTile = dataArray[1];
                    var modelSvc = dataArray[2];
                    var modelIds = dataArray[3];
                    var modelType = dataArray[4];
                    if (lyrName == modelName)  {
                      addDynamicLayerToMap(modelName, modelSvc, modelIds, modelType);
                    }
                  }
                }
              }
              else  {
                for (var j=0; j<modelLayerDetails.length; j++)  {
                  var dataString = modelLayerDetails[j];
                  var dataArray = dataString.split("|");
                  var modelName = dataArray[0];
                  var modelTile = dataArray[1];
                  var modelSvc = dataArray[2];
                  var modelIds = dataArray[3];
                  var modelType = dataArray[4];
                  if (dataLyrString == modelName)  {
                    addDynamicLayerToMap(modelName, modelSvc, modelIds, modelType);  
                  }
                }
              }
            }
          }

          // find out what layers need to be added back to the map
          var eezSwitch = dijit.byId('eez_line').attr('value');
          var nmspSwitch = dijit.byId('nmsp_poly').attr('value');
          var sitesSwitch = dijit.byId('site_markers').attr('value'); 
          var dataSwitch = dijit.byId('data_markers').attr('value');
          var bathySwitch = dijit.byId('bathy_contours').attr('value');

          // determine if eez needs to be added to map
          if (eezSwitch)  {
            map.addLayer(new EEZTiledMapServiceLayer);
            map.addLayer(eezDynLayer);
            eezDynLayer.hide();
          }
          // determine if nmsp boundaries need to be added to map
          if (nmspSwitch)  {
            map.addLayer(new NMSPTiledMapServiceLayer);
            map.addLayer(nmsDynLayer);
            nmsDynLayer.hide();
          }
          // determine if bathy contours from gebco08 need to be added to map
          if (bathySwitch)  {
            var currentLevel = map.getLevel();
            if (currentLevel < 1)  {
              dojo.byId("msgBathy").innerHTML = "Zoom in map to see contours";
            }
            if (currentLevel > 6)  {
              dojo.byId("msgBathy").innerHTML = "Zoom out map to see contours";
            }
            var lyr = new esri.layers.ArcGISTiledMapServiceLayer("https://maps.ngdc.noaa.gov/arcgis/rest/services/web_mercator/gebco08_contours/MapServer");
            lyr.id = "gebco08Contours";
            map.addLayer(lyr);
          }


          // determine if corals/sponges need to be added to map and if so, whether any search criterias have been set
          // if no search criteria set, will load cached tiles instead of dynamically rendered points ... this is for speed purposes
          if (dataSwitch)  {
            var dscForm = dijit.byId("dscForm");
            var fromDate = dijit.byId("fromDate").get('value');
            var toDate = dijit.byId("toDate").get('value');
            var depthMin = dijit.byId("depthSearchMin").get('value');
            var depthMax = dijit.byId("depthSearchMax").get('value');
            var recordsPhotosOnly = dijit.byId("recordsWithPhotos").get('value');

            var doSearch = true;
            // two definition files created 
            //  ... one to handle the identify task if needed (taskLayerDef)
            //  ... one to handle the generation of a map image (imageLayerDef)
            imageLayerDef = "";
            taskLayerDef = "";

            // first check to verify date ranges and/or depth ranges have been filled out properly
            //alert("To Date: " + toDate + " From Date: " + fromDate);
            if ( (isNaN(fromDate)) || (isNaN(toDate)) || (isNaN(depthMin)) || (isNaN(depthMax)) )  {
              var errorMsg = ""
              errorMsg += '<font color="red" size="2"><center>';
              errorMsg += 'Can not proceed with search.<br/>There is an error in either the Time Frame or Depth Range entry of the form.<br>These entries have to be numbers and must be filled in.';
              errorMsg += '</center></font>';
              dojo.byId("query_error_msg").innerHTML = errorMsg;
              savedMapExtent = originalMapExtent;
              var countText = totalRecords.toLocaleString();
              dojo.byId("msg").innerHTML = "<font color='black'><b>"+countText+" Records Found</font>";
              map.addLayer(new CoralsSpongesTiledMapServiceLayer);
            }
            else  {            
              // add scientific name or common name or order-family-genus to search if entered (using upper function to eliminate upper/lower case issues)
              // scientific name will search against scientificname and synonyms attributes
              var speciesQuerySelected = false;
              var phylumOnly = false;
              var speciesQuery = dscForm.attr('value').Scientific_Vernacular_OFG_pQuery;
              if (speciesQuery == "Scientific")  {
                var scientificNameText = dijit.byId("dbSearchTB").get('value');
                if (scientificNameText.length != 0)  {
                  speciesQuerySelected = true;
                  imageLayerDef += "UPPER(synonymsearchproxy) LIKE ";
                  taskLayerDef += "UPPER(synonymsearchproxy) LIKE ";
                  imageLayerDef += "UPPER('%";
                  taskLayerDef += "UPPER('%";
                  imageLayerDef += scientificNameText;
                  taskLayerDef += scientificNameText;
                  imageLayerDef += "%')";
                  taskLayerDef += "%')";
                }          
              }
              if (speciesQuery == "Vernacular")  {
                var vernacularNameText = dijit.byId("vernacularSearch").get('value');
                if (vernacularNameText != "None")  {
                  speciesQuerySelected = true;
                  imageLayerDef += "UPPER(vernacularnamecategory) = ";
                  taskLayerDef += "UPPER(vernacularnamecategory) = ";
                  imageLayerDef += "UPPER('";
                  taskLayerDef += "UPPER('";
                  imageLayerDef += vernacularNameText;
                  taskLayerDef += vernacularNameText;
                  imageLayerDef += "')";
                  taskLayerDef += "')";
                }             
              }
              if (speciesQuery == "OFG")  {
                var taxonphylumText = document.getElementById("taxonphylum").value;
                if (taxonphylumText != "None")  {
                  speciesQuerySelected = true;
                  phylumOnly = true;
                  imageLayerDef += "UPPER(taxonphylum) = ";
                  taskLayerDef += "UPPER(taxonphylum) = ";
                  imageLayerDef += "UPPER('";
                  taskLayerDef += "UPPER('";
                  imageLayerDef += taxonphylumText;
                  taskLayerDef += taxonphylumText;
                  imageLayerDef += "')";
                  taskLayerDef += "')";
                  var taxonorderText = document.getElementById("taxonorder").value;
                  if ((taxonorderText != "None") && (taxonorderText.length != 0))  {
                    phylumOnly = false;
                    //speciesQuerySelected = true;
                    imageLayerDef += " AND ";
                    taskLayerDef += " AND ";    
                    imageLayerDef += "UPPER(taxonorder) = ";
                    taskLayerDef += "UPPER(taxonorder) = ";
                    imageLayerDef += "UPPER('";
                    taskLayerDef += "UPPER('";
                    imageLayerDef += taxonorderText;
                    taskLayerDef += taxonorderText;
                    imageLayerDef += "')";
                    taskLayerDef += "')";
                    var taxonfamilyText = document.getElementById("taxonfamily").value;
                    if ((taxonfamilyText != "None") && (taxonfamilyText.length != 0))  {
                      imageLayerDef += " AND ";
                      taskLayerDef += " AND ";
                      imageLayerDef += "UPPER(taxonfamily) = ";
                      taskLayerDef += "UPPER(taxonfamily) = ";
                      imageLayerDef += "UPPER('";
                      taskLayerDef += "UPPER('";
                      imageLayerDef += taxonfamilyText;
                      taskLayerDef += taxonfamilyText;
                      imageLayerDef += "')";
                      taskLayerDef += "')";  
                      var taxongenusText = document.getElementById("taxongenus").value;
                      if ((taxongenusText != "None") && (taxongenusText.length != 0)) {
                        imageLayerDef += " AND ";
                        taskLayerDef += " AND ";
                        imageLayerDef += "UPPER(taxongenus) = ";
                        taskLayerDef += "UPPER(taxongenus) = ";
                        imageLayerDef += "UPPER('";
                        taskLayerDef += "UPPER('";
                        imageLayerDef += taxongenusText;
                        taskLayerDef += taxongenusText;
                        imageLayerDef += "')";
                        taskLayerDef += "')";
                      }
                    }
                  } 
                }            
              }
              if (speciesQuery == "pQuery")  {
                var pQueryNameText = dijit.byId("pQuerySearch").get('value');
                if (pQueryNameText != "None")  {
                  speciesQuerySelected = true;
                  if (pQueryNameText == "structure-forming deep sea corals")  {
                    imageLayerDef += "(UPPER(vernacularnamecategory) = UPPER('stony coral (branching)') OR UPPER(vernacularnamecategory) = UPPER('black coral') OR UPPER(vernacularnamecategory) = UPPER('gorgonian coral'))";
                    taskLayerDef += "(UPPER(vernacularnamecategory) = UPPER('stony coral (branching)') OR UPPER(vernacularnamecategory) = UPPER('black coral') OR UPPER(vernacularnamecategory) = UPPER('gorgonian coral'))";
                  }
                  if (pQueryNameText == "structure-forming animals")  {
                    imageLayerDef += "(UPPER(vernacularnamecategory) LIKE UPPER('%sponge%') OR UPPER(vernacularnamecategory) = UPPER('sea pen') OR UPPER(vernacularnamecategory) = UPPER('lace coral'))";
                    taskLayerDef += "(UPPER(vernacularnamecategory) LIKE UPPER('%sponge%') OR UPPER(vernacularnamecategory) = UPPER('sea pen') OR UPPER(vernacularnamecategory) = UPPER('lace coral'))";
                  }
                }
              }
              // use ocean to search if entered
              var definedRegionSelected = false;
              var definedRegion = dscForm.attr('value').LME_Ocean_FCR
              if (definedRegion == "LME") {
                var LMEBoundaries = dijit.byId("lmeSearch").get('value');
                if (LMEBoundaries != "None")  {
                  definedRegionSelected = true;
                  if (imageLayerDef.length != 0)  {
                    imageLayerDef += " AND ";
                    taskLayerDef += " AND ";
                  }
                  imageLayerDef += "UPPER(largemarineecosystem) = ";
                  taskLayerDef += "UPPER(largemarineecosystem) = ";
                  imageLayerDef += "UPPER('";
                  taskLayerDef += "UPPER('";
                  imageLayerDef += LMEBoundaries;
                  taskLayerDef += LMEBoundaries;
                  imageLayerDef += "')";
                  taskLayerDef += "')";
                }              
              }
              if (definedRegion == "Ocean") {
                var OceanBoundaries = dijit.byId("oceanSearch").get('value');
                if (OceanBoundaries != "None")  {
                  definedRegionSelected = true;
                  if (imageLayerDef.length != 0)  {
                    imageLayerDef += " AND ";
                    taskLayerDef += " AND ";
                  }
                  imageLayerDef += "UPPER(ocean) = ";
                  taskLayerDef += "UPPER(ocean) = ";
                  imageLayerDef += "UPPER('";
                  taskLayerDef += "UPPER('";
                  imageLayerDef += OceanBoundaries;
                  taskLayerDef += OceanBoundaries;
                  imageLayerDef += "')";
                  taskLayerDef += "')";
                }
              }
              if (definedRegion == "FCR")  {
                var FCRBoundaries = dijit.byId("fcrSearch").get('value');
                if (FCRBoundaries != "None")  {
                  definedRegionSelected = true;
                  if (imageLayerDef.length != 0)  {
                    imageLayerDef += " AND ";
                    taskLayerDef += " AND ";
                  }
                  imageLayerDef += "UPPER(fishcouncilregion) = ";
                  taskLayerDef += "UPPER(fishcouncilregion) = ";
                  imageLayerDef += "UPPER('";
                  taskLayerDef += "UPPER('";
                  imageLayerDef += FCRBoundaries;
                  taskLayerDef += FCRBoundaries;
                  imageLayerDef += "')";
                  taskLayerDef += "')";
                }
              }
              // add time frame to search
              if (imageLayerDef.length != 0)  {
                imageLayerDef += " AND ";
                taskLayerDef += " AND ";
              }
              imageLayerDef += "observationyear >= ";
              taskLayerDef += "observationyear >= ";
              imageLayerDef += fromDate;
              taskLayerDef += fromDate;
              imageLayerDef += " AND observationyear <= ";
              taskLayerDef += " AND observationyear <= ";
              imageLayerDef += toDate;
              taskLayerDef += toDate;
              // add depth range to search
              if (imageLayerDef.length != 0)  {
                imageLayerDef += " AND ";
                taskLayerDef += " AND ";
              }
              imageLayerDef += "depthinmeters >= ";
              taskLayerDef += "depthinmeters >= ";
              imageLayerDef += depthMin;
              taskLayerDef += depthMin;
              imageLayerDef += " AND depthinmeters <= ";
              taskLayerDef += " AND depthinmeters <= ";
              imageLayerDef += depthMax;
              taskLayerDef += depthMax;
              // determine whether to retrieve only records with photos
              if (recordsPhotosOnly)  {
                if (imageLayerDef.length != 0)  {
                  imageLayerDef += " AND ";
                  taskLayerDef += " AND " ;
                }
                imageLayerDef += "imageurl <> 'NA'";
                taskLayerDef += "imageurl <> 'NA'";
              }

              // determine whether to bring back tiled layer or allow for search 
              if (!speciesQuerySelected)  {
                if (!definedRegionSelected)  {
                  if (fromDate === -999 && toDate === toDateCheck)  { 
                    if (depthMin === -999 && depthMax === 6500)  {
                      if (!recordsPhotosOnly)  {
                        doSearch = false;
                      }
                    }
                  }
                }
              } 
              console.log(imageLayerDef);
              console.log(taskLayerDef);
              console.log(doSearch);
              if (doSearch)  {
                // hide the data query menu
                var dqMenu = dijit.byId("queryMenu");
                dqMenu.set("checked", false);
                var dataQueryPaneName = document.getElementById("titlePane_SearchParameters");
                dataQueryPaneName.style.display = 'none';
                dojo.byId("msg").innerHTML = "<font color='red'><b>Searching ... </font>&nbsp;&nbsp;&nbsp;&nbsp;<img src='images/ajax-loader.gif'>";
                var query = new esri.tasks.Query();
                query.returnGeometry = true;
                query.outFields = ["vernacularnamecategory"];
                query.where = imageLayerDef;
                //var qt = new esri.tasks.QueryTask("https://service.ln.ncddc.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0");
                //var qt = new esri.tasks.QueryTask("https://service.ncddc.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0");
                //var qt = new esri.tasks.QueryTask("https://deepseacoraldata.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer/0");
                var qt = new esri.tasks.QueryTask("https://gis.ngdc.noaa.gov/arcgis/rest/services/deep_sea_corals/MapServer/0");
                

                // get a record count quickly
                qt.executeForCount(query,function(count)  {
                  retrievedRecords = count;
                  var countText = count.toLocaleString();
                  if (countText == 1)  {
                    dojo.byId("msg").innerHTML = "<font color='black'><b>"+countText+" Record found</font>";
                  }
                  else  {
                    dojo.byId("msg").innerHTML = "<font color='black'><b>"+countText+" Records Found</font>";
                  }
                  if (retrievedRecords != 0)  {
                    // set up image parameters
                    var imageParameters = new esri.layers.ImageParameters();
                    var layerDefs = [];
                    layerDefs[0] = imageLayerDef;
                    imageParameters.layerDefinitions = layerDefs;
                    imageParameters.layerIds = [0];
                    imageParameters.layerOption = esri.layers.ImageParameters.LAYER_OPTION_SHOW;
                    imageParameters.transparent = true;
                    //var lyr = new esri.layers.ArcGISDynamicMapServiceLayer("https://service.ln.ncddc.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer", {"imageParameters":imageParameters});
                    //var lyr = new esri.layers.ArcGISDynamicMapServiceLayer("https://service.ncddc.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer", {"imageParameters":imageParameters});
                    //var lyr = new esri.layers.ArcGISDynamicMapServiceLayer("https://deepseacoraldata.noaa.gov/arcgis/rest/services/EnvironmentalMonitoring/DSCRTP/MapServer", {"imageParameters":imageParameters});
                    var lyr = new esri.layers.ArcGISDynamicMapServiceLayer("https://gis.ngdc.noaa.gov/arcgis/rest/services/deep_sea_corals//MapServer", {"imageParameters":imageParameters});                    
                    lyr.id = "Corals_Sponges";
                    map.addLayer(lyr);
                  }    
                }, function(error){
                  alert(error);
                });
                // zooms to selected points
                qt.execute(query, function(fset)  {
                  var count = fset.features.length;
                  if (count == 0)  {
                    //map.centerAndZoom(mapCenterPoint,2);
                    map.centerAndZoom(mapCenterPoint,0);
                    savedMapExtent = originalMapExtent;
                  }
                  else  {
                    if (count == 1)  {
                      var resultFeature = fset.features;
                      var thePoint = resultFeature[0].geometry;
                      //map.centerAndZoom(thePoint, 5);
                      map.centerAndZoom(thePoint, 3);
                      savedMapExtent = originalMapExtent;
                    }
                    if (count > 1) {
                      var resultExtent = esri.graphicsExtent(fset.features);
                      if (!resultExtent)  {
                        var resultFeature = fset.features;
                        var thePoint = resultFeature[0].geometry;
                        //map.centerAndZoom(thePoint, 5);
                        map.centerAndZoom(thePoint, 3);
                        savedMapExtent = originalMapExtent;
                      }
                      else  {
                        var xDiff = resultExtent.xmax - resultExtent.xmin;
                        // this will prevent the map from zooming out too far and not centering the data properly  
                        if (xDiff > 30000000) {
                          //map.centerAndZoom(mapCenterPoint,2);
                          map.centerAndZoom(mapCenterPoint,0);
                          savedMapExtent = originalMapExtent;
                        }
                        else {
                          map.setExtent(resultExtent,true);
                          savedMapExtent = resultExtent;
                        }
                      }
                    }
                  }
                }, function(error)  {
                  alert(error);
                });
              }
              else  {
                savedMapExtent = originalMapExtent;
                retrievedRecords = totalRecords;
                var countText = totalRecords.toLocaleString();
                dojo.byId("msg").innerHTML = "<font color='black'><b>"+countText+" Records Found</font>";
                map.addLayer(new CoralsSpongesTiledMapServiceLayer);
                map.addLayer(dscDynLayer);
                dscDynLayer.hide();
              }
            }
          }

          // determine if site characterization markers need to be added to map
          // because this is a graphicsLayer, it has to be handled differently
          // ...  it isn't counted within map.layerIds.length command
          // ...  therefore isn't removed when it is the only layer on the map
          if (sitesSwitch)  {
            var layersOnMap = map.layerIds.length;
            if (layersOnMap == 1)  {
              map.centerAndZoom(mapCenterPoint,0);
            }
            loadDSCRTPSites();
          }
          else {
            if (layersOnMap == 1)  {
              map.centerAndZoom(mapCenterPoint,0);
            }
            if (sitesLayer != undefined)  sitesLayer.clear();
            if (siteSelectedLayer != undefined)  siteSelectedLayer.clear();
            if (siteHighlightLayer != undefined)  siteHighlightLayer.clear();
          }
        }
        else {
          alert("Allow map to finish drawing");
          console.log(mapLyrsChecked);
        }
      }

      // handles loading dynamic layers (models) onto map
      function addDynamicLayerToMap(lyr, svc, ids, lyrType)  {
        var dynamicLyr = new esri.layers.ArcGISDynamicMapServiceLayer(svc);
        var modelExtent = new esri.geometry.Extent(-11950933, 1638987, -6206990, 6680442, new esri.SpatialReference({ wkid:3857 }) );
        //var modelPoint = new esri.geometry.Point(-9378317,3892290, new esri.SpatialReference({ wkid:3857 }) );
        dynamicLyr.setVisibleLayers([ids]);
        dynamicLyr.id = lyr;
        dynamicLyr.url = svc;
        dynamicLyr.className = ids;
        dynamicLyr.description = lyrType;
        map.addLayer(dynamicLyr);
        map.setExtent(modelExtent, fit='true');
        //map.centerAndZoom(modelPoint, 4);
        //alert(dynamicLyr);
      }
      
      // handle identify clicks of corals and/or sponges on map
      function runIdentifyTask(evt)  {
        map.infoWindow.hide();
        dojo.byId("query_msg").innerHTML = "<font color='red'><b>Querying</b></font><br/><img src='images/ajax-loader.gif'>";
        if (retrievedRecords != 0)  {

          // set the photo tab to be displayed first
          var recordsPhotosOnly = dijit.byId("recordsWithPhotos").get('value');
          if (recordsPhotosOnly)  {
            dijit.byId("tabconID").selectChild(dijit.byId("photoTab"));
          }

          // set up identify parameters
          identifyParams.geometry = evt.mapPoint;
          identifyParams.mapExtent = map.extent;
          identifyParams.layerDefinitions = [];
          identifyParams.layerDefinitions[0] = taskLayerDef;
       
          var deferred = identifyTask.execute(identifyParams);
          deferred.addCallback(function(response)  {
            dojo.byId("query_msg").innerHTML = "";
            return dojo.map(response, function(result)  {
              var feature = result.feature;
              feature.attributes.layerName = result.layerName;
              var template = new esri.InfoTemplate();
              if (result.layerName.indexOf("Locations") != -1)  {
                template.setTitle("Deep Sea Corals");
                template.setContent(getCoralsSpongesContent);
              }
              feature.setInfoTemplate(template);
              var h = 250;
              var w = 450;
              // make sure id win will fit on current map size
              var mapWin = dijit.byId("map");
              var wh = mapWin.h;
              var ww = mapWin.w;
              h = h > (wh * 0.7) ? Math.floor(wh * 0.7) : h;
              w = w > (ww * 0.7) ? Math.floor(ww * 0.7) : w;
              map.infoWindow.resize(w, h);
              map.infoWindow.setFeatures([ deferred ]);
              map.infoWindow.show(evt.mapPoint);
              return feature;
            });
          });
        }
      }

      // handle html of coral and sponge identification
      function getCoralsSpongesContent(graphic)  {
        var photoFrame = document.getElementById("photoImage"); 
        var photoTag = "<img src='images/blankPhoto.jpg' height='175' width='235'/>";
        photoFrame.innerHTML = photoTag;
        var imageLink = graphic.attributes.imageurl;
        if (imageLink != "NA")  {
          dijit.byId("tabconID").selectChild(dijit.byId("photoTab"));
          if (navigator.appVersion.indexOf("MSIE") != -1)  {
            var highResImgLink = "&#39;" + imageLink + "&#39;";
          }
          else  {
            var highResImgLink = "&apos;" + imageLink + "&apos;";
          }
          var photoTag = '<a href="javascript:openHighResolutionPhotoImage('+highResImgLink+')"><img src="'+imageLink+'" height="175" width="235"></a>';
          photoTag += "<p/>";
          photoTag += '<a href="javascript:openHighResolutionPhotoImage('+highResImgLink+')"><font color="red"><u>Full Resolution Image</u></font></a>';
          console.log(photoTag);
          photoFrame.innerHTML = photoTag;
        }
        dojo.byId("query_msg").innerHTML = "";
        var content = "";
        content += '<center><b><i>'+graphic.attributes.scientificname+'</i></b></center>';
        //if (graphic.attributes.synonyms != "NA")  content += '<center>Synonym: '+graphic.attributes.synonyms+'</center>';
        if (graphic.attributes.vernacularnamecategory != "NA")  content += '<center>('+graphic.attributes.vernacularnamecategory+')</center>';
        content += '<center><hr width="50%"></center>';
        content += '<table colspan="5" class="smallText1">';
        //content += '<tr><td width="115"><b>SampleID:</b></td><td width="100">'+graphic.attributes.sampleid+'</td><td width="5"></td><td></td></tr>';
        content += '<tr><td width="115"><b>Date</b>:</td><td width="100">'+graphic.attributes.observationdate+'</td><td width="5"></td><td width="115"><b>Catalog Number</b>:</td><td>'+graphic.attributes.catalognumber+'</td></tr>';
        content += '<tr><td width="115"><b>Depth(m)</b>:</td><td width="100">'+graphic.attributes.depthinmeters+'</td><td width="5"></td><td width="115"><b>Taxonomic Rank</b>:</td><td>'+graphic.attributes.taxonrank+'</td></tr>';
        content += '<tr><td width="115"><b>Position (lat lon)</b>:</td><td width="100">'+graphic.attributes.latitude+'&nbsp;'+graphic.attributes.longitude+'</td><td width="5"></td><td width="115"><b>Sampling Equipment</b>:</td><td>'+graphic.attributes.samplingequipment+'</td></tr>';
        content += '<tr><td width="115"><b>Location Accuracy(m)</b>:</td><td width="100">'+graphic.attributes.locationaccuracy+'</td><td width="5"></td><td width="115"><b>Location</b>:</td><td>'+graphic.attributes.locality+'</td></tr>';
        content += '</table>';
        content += '<table colspan="2" class="smallText1">';
        content += '<tr><td width="115"><b>SampleID:</b></td><td>'+graphic.attributes.sampleid+'</td></tr>';
        content += '<tr><td width="115"><b>Data Provider</b>:</td><td>'+graphic.attributes.dataprovider+'</td></tr>';
        content += '<tr><td width="115"><b>Identification Qualifier</b>:</td><td>'+graphic.attributes.identificationqualifier+'</td></tr>';
        content += '<tr><td width="115"><b>Citation</b>:</td><td>'+graphic.attributes.citation+'</tr>';
        content += '</table>';
        return content;
      }

      // function to handle opening high resolution photos into separate window
      function openHighResolutionPhotoImage(doc)  {
        var Win = open(doc,"ImageWindow","height=800,width=1000,toolbar=no,menubar=yes,location=no,scrollbars=yes,resizable=yes");
        Win.focus();
      }

      // load up site information
      // IMPORTANT TO NOTE: in order for the treeview to work, only allow the right pane section "Survey Characterization by US Region" to load once
      // all references to dojo.byId("itemsList").innerHTML = "" have been commented out to prevent this section from being written        
      function loadDSCRTPSites()  {
        csvStore = new dojox.data.CsvStore({url:"DSCRTP_Sites.csv"});
        csvStore.fetch({
          onComplete: function(items, request)  {
            dojo.forEach(items, function(item, index)  {
              var siteName = csvStore.getValue(item, "SiteName");
              var siteLatitude = csvStore.getValue(item, "Lat");
              var siteLongitude = csvStore.getValue(item, "Lon");
              var siteRegion = csvStore.getValue(item, "Region");
              var id = csvStore.getIdentity(item); 
              if (siteLatitude != undefined && siteLongitude != undefined)  {         
                createSiteMarker(id,siteLatitude,siteLongitude,siteName,siteRegion);
              }
            });
            if (firstTimeLoad)  {
              initializeSites();
              firstTimeLoad = false;
            }
          },
          onError: function(error) {
            dojo.byId("itemsList").innerHTML = error;
          }
        });
      }

      // load site markers to map 
      function createSiteMarker(id,latitude,longitude,site,siteRegion)  {
        var symbol = new esri.symbol.PictureMarkerSymbol("images/coral-green.png", 26, 26);
        var geometry = new esri.geometry.Point(longitude, latitude);
        geometry = esri.geometry.geographicToWebMercator(geometry);
        sitesLayer.add(new esri.Graphic(geometry, symbol, {id: id, site: site, x: longitude, y: latitude, siteRegion: siteRegion}));
        var sitesSwitch = dijit.byId('site_markers').attr('value');
        if (sitesSwitch)  {
          sitesLayer.setOpacity(1);
        }
        else  {
          sitesLayer.setOpacity(0);
        }
      }

      // load sites into sidebar for access
      function initializeSites()  {
        var content = "";
        var southeastSet = false;
        var gomSet = false;
        var californiaSet = false;
        var northwestSet = false;
        content += "<p/>";
        content += "<ul id='treemenu1' class='treeview'>";
        for (var j=0;j<sitesLayer.graphics.length;j++)  {
          graphic = sitesLayer.graphics[j];
          var xPt = graphic.attributes.x;
          var yPt = graphic.attributes.y;
          var id = graphic.attributes.id;
          var site = graphic.attributes.site;
          var siteRegion = graphic.attributes.siteRegion;
          if (siteRegion == "Southeast")  {
            if (!southeastSet)  {
              content += "<li title='Click for list of Southeast site characterizations'><b>Southeast</b>";
              content += "<ul>";
              southeastSet = true;
            }
          }
          if (siteRegion == "Gulf of Mexico")  {
            if (!gomSet)  {
              content += "</ul>";
              content += "</li>";
              content += "<li title='Click for list of Gulf of Mexico site characterizations'><b>Gulf of Mexico</b>";
              content += "<ul>";
              gomSet = true;
            }
          }
          if (siteRegion == "California")  {
            if (!californiaSet)  {
              content += "</ul>";
              content += "</li>";
              content += "<li title='Click for list of California site characterizations'><b>California</b>";
              content += "<ul>";
              californiaSet = true;
            }
          }
          if (siteRegion == "Northwest")  {
            if (!northwestSet)  {
              content += "</ul>";
              content += "</li>";
              content += "<li title='Click for list of Northwest site characterizations'><b>Northwest</b>";
              content += "<ul>";
              northwestSet = true;
            }
          }
          content += "<li style='background-color: #315f86; color: #E6E8FA; font-size: 12px; width: 100%;' title='Click to see information about "+site+"' onclick='showSite("+id+");'onmouseover='highlightSite("+xPt+","+yPt+");'onmouseout='siteHighlightLayer.clear();'>"+site+"</li>";
        }
        content += "</ul>";
        content += "</li>";
        content += "</ul>";
        dojo.byId("itemsList").innerHTML = content;
      }

      // build tab content for sites
      function showSite(id) {

        var title = "";
        var summary_html = "";

        // if tabcontainer needed, uncomment this and comment other tc
        //var tc = new dijit.layout.TabContainer({
        //  style: "font-family: arial; font-size: 12px; width: 100%; height: 100%; color:#000000; background-image:none; background-color:transparent; overflow:auto;"
        //  }, dojo.create("div"));

        var tc = new dijit.layout.ContentPane({
          style: "font-family: arial; font-size: 12px; width: 100%; height: 100%; margin:10px; color:#000000; background-image:none; background-color:transparent; overflow:auto;"
          }, dojo.create("div"));

        csvStore.fetchItemByIdentity({identity: id, onItem: function(item)  {
          var siteName = csvStore.getValue(item,"SiteName");
          var siteLatitude = csvStore.getValue(item, "Lat");
          var siteLongitude = csvStore.getValue(item, "Lon");
          var siteDescription = csvStore.getValue(item, "Description");
          var reportLink = csvStore.getValue(item, "ReportLink");
          var siteLink = csvStore.getValue(item, "SiteLink");
          //alert(siteLink);

          summary_html += '<div class="infoWindow">'; 
          summary_html += '<center><b>'+siteName+'</b></center>';
          summary_html += '<p/>';
          summary_html += siteDescription;
          summary_html += '<p/>';
          summary_html += '<center><a href="javascript:launchDataLink(\''+siteLink+'\');"><u><b>Reports</b></u></center>';
          summary_html += '</div>'; 
          //var cp1 = new dijit.layout.ContentPane({title:"Site", content: summary_html});  ... uncomment this if using tabcontainer instead
          var cp1 = new dijit.layout.ContentPane({content: summary_html});  // comment this if using tabcontainer instead
          tc.addChild(cp1);   

          tc.domNode;

          if (siteSelectedLayer != undefined)  siteSelectedLayer.clear();
          var symbol = new esri.symbol.PictureMarkerSymbol("images/coral-red.png", 26, 26);
          var geometry = new esri.geometry.Point(siteLongitude, siteLatitude);
          geometry = esri.geometry.geographicToWebMercator(geometry);
          siteSelectedLayer.add(new esri.Graphic(geometry, symbol));
          } 
        });

        // zoom to the selected site location
        dojo.some(sitesLayer.graphics, function(graphic)  {
          if (graphic.attributes.id === id)  {
            selectedSite = graphic;
          }
        });

        var sitesSwitch = dijit.byId('site_markers').attr('value');
        if (sitesSwitch)  {
          xPt = selectedSite.geometry.x - 1000000;
          yPt = selectedSite.geometry.y;
          var newCenterPoint = new esri.geometry.Point(xPt, yPt, new esri.SpatialReference({wkid: 3857}));
          map.centerAndZoom(newCenterPoint, 3);
        }

        pFloatingPane.attr("content",tc.domNode);
        pFloatingPane.show();
      }

      // handles opening up any links into separate windows
      function launchDataLink(doc)  {
        var Win = open(doc,"AccessWindow","height=500,width=800,toolbar=no,menubar=yes,location=no,scrollbars=yes,resizable=yes");
        Win.focus();
      }

      // highlights a site on the map from the listing in the right pane
      function highlightSite(xPt,yPt)  {
        if (siteSelectedLayer != undefined)  siteSelectedLayer.clear();
        //var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 25, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 255, 0]), 3.5), new dojo.Color([0, 255, 0, 0.0]));
        var symbol = new esri.symbol.PictureMarkerSymbol("images/coral-yellow.png", 26, 26);
        var geometry = new esri.geometry.Point(xPt, yPt);
        geometry = esri.geometry.geographicToWebMercator(geometry);
        siteHighlightLayer.add(new esri.Graphic(geometry, symbol));
      }

      // bring up metadata record for deep sea corals
      function metadataPage()  {
        var metadataURL = "https://deepseacoraldata.noaa.gov/library/dscrtp-database-metadata/";
        var Win = open(metadataURL,"MetadataMenu","height=800,width=1000,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes");
        Win.focus();
      }                     

      // reset map to original setting
      function resetMap()  {
        if (!mapDrawing)  {
          window.location.reload();
        }
        else  {
          alert("Allow map to finish drawing, then you may reset map");
        }
      }

      // handles standard data download call
      function downloadData()  {

        // hide the data download menu
        var ddMenu = dijit.byId("downloadMenu");
        ddMenu.set("checked", false);
        var dataDownloadPaneName = document.getElementById("titlePane_DataDownload");
        dataDownloadPaneName.style.display = 'none';

        var zoomLevel = map.getZoom();

        // get any defined input parameters
        var listOfParameters = "";

        // filled out from download form
        var inputs = document.getElementsByTagName("input");
        for (var i=0;i<inputs.length;i++)  {
          if (inputs[i].getAttribute('type') == 'checkbox')  {
            var elementName = inputs[i].getAttribute('name');
            if (elementName == "useMapExtent")  {
              var nameElement = document.getElementById('useMapExtent');
              var nameValue = nameElement.checked;
              if (nameValue)  {
                var x = map.extent.xmin;
                var y = map.extent.ymin;
                var num3 = x / 6378137.0;
                var num4 = num3 * 57.295779513082323;
                var num5 = Math.floor((num4 + 180.0) / 360.0);
                var num6 = num4 - (num5 * 360.0);
                var num7 = 1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * y) / 6378137.0)));
                var west = num6;
                var south = num7 * 57.295779513082323;
                var x = map.extent.xmax;
                var y = map.extent.ymax;
                var num3 = x / 6378137.0;
                var num4 = num3 * 57.295779513082323;
                var num5 = Math.floor((num4 + 180.0) / 360.0);
                var num6 = num4 - (num5 * 360.0);
                var num7 = 1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * y) / 6378137.0)));
                var east = num6;
                var north = num7 * 57.295779513082323;
                var useCurrentMapExtent = true;
                //alert("North: " + north + "\nSouth: " + south + "\nEast: " + east + "\nWest: " + west);
                //if (zoomLevel <= 2) {
                if (zoomLevel == 0)  {
                  south = -90;
                  north = 90;
                  west = -180;
                  east = 180;
                }
                else if ((east < 0) && (west > 0)) {
                  alert("Cannot use map extent to bound the data download because it crosses the 180th meridian.\nData will be extracted but not bound by current map extent.");
                  useCurrentMapExtent = false;
                }
                if (useCurrentMapExtent)  {
                  listOfParameters += '&latitude>=';
                  listOfParameters += south;
                  listOfParameters += '&latitude<=';
                  listOfParameters += north;
                  listOfParameters += '&longitude>=';
                  listOfParameters += west;
                  listOfParameters += '&longitude<=';
                  listOfParameters += east; 
                }
              }  
            }
          }
        }

        // fill in taxon information if necessary
        var dscForm = dijit.byId("dscForm");
        var speciesQuery = dscForm.attr('value').Scientific_Vernacular_OFG_pQuery;
        if (speciesQuery == "Scientific")  {
          var scientificNameText = dijit.byId("dbSearchTB").get('value');
          if (scientificNameText.length != 0)  {
            var newScientificNameText = capitalize(scientificNameText);
            if (newScientificNameText.indexOf("(") != -1)  {
              var newStringBefore = newScientificNameText.replace("(","%5C(");
              var newScientificNameText = newStringBefore.replace(")","%5C)");
            }
            //listOfParameters += "&scientificname";
            listOfParameters += "&SynonymSearchProxy";
            listOfParameters += '=~".*';
            listOfParameters += newScientificNameText;
            //listOfParameters += scientificNameText;
            listOfParameters += '.*"';
          }
        }
        if (speciesQuery == "Vernacular")  {
          var vernacularNameText = dijit.byId("vernacularSearch").get('value');
          if (vernacularNameText != "None")  {
            listOfParameters += "&VernacularNameCategory";
            listOfParameters += '="';
            listOfParameters += vernacularNameText;
            listOfParameters += '"';
          }
        }
        if (speciesQuery == "OFG")  {
          var taxonphylumText = document.getElementById("taxonphylum").value;
          if (taxonphylumText != "None")  {
            listOfParameters += "&Phylum";
            listOfParameters += '="';
            listOfParameters += taxonphylumText;
            listOfParameters += '"';
            var taxonorderText = document.getElementById("taxonorder").value;
            if (taxonorderText != "None")  {
              listOfParameters += "&Order";
              listOfParameters += '="';
              listOfParameters += taxonorderText;
              listOfParameters += '"';
              var taxonfamilyText = document.getElementById("taxonfamily").value;
              if ((taxonfamilyText != "None") && (taxonfamilyText.length != 0))  {
                listOfParameters += "&Family";
                listOfParameters += '="';
                listOfParameters += taxonfamilyText;
                listOfParameters += '"';
                taxongenusText = document.getElementById("taxongenus").value;
                if ((taxongenusText != "None") && (taxongenusText.length != 0)) {
                  listOfParameters += "&Genus";
                  listOfParameters += '="';
                  listOfParameters += taxongenusText;
                  listOfParameters += '"';
                }
              }
            }
          }
        }
        console.log(listOfParameters);
        if (speciesQuery == "pQuery")  {
          var pQueryNameText = dijit.byId("pQuerySearch").get('value');
          if (pQueryNameText != "None")  {
            if (pQueryNameText == "structure-forming deep sea corals")  {
              listOfParameters += '&VernacularNameCategory=~"(stony coral %5C(branching%5C))|(black coral)|(gorgonian coral)"';
            }
            if (pQueryNameText == "structure-forming animals")  {
              listOfParameters += '&VernacularNameCategory=~"(sea pen)|(lace coral)|(.*sponge.*)"';
            }
          }
        }

        // fill in region information if necessary
        var definedRegion = dscForm.attr('value').LME_Ocean_FCR
        if (definedRegion == "LME") {
          var LMEBoundaries = dijit.byId("lmeSearch").get('value');
          if (LMEBoundaries != "None")  {
            listOfParameters += "&LargeMarineEcosystem";
            listOfParameters += '="';
            listOfParameters += LMEBoundaries;
            listOfParameters += '"';
          }
        }
        if (definedRegion == "Ocean") {
          var OceanBoundaries = dijit.byId("oceanSearch").get('value');
          if (OceanBoundaries != "None")  {
            listOfParameters += "&Ocean";
            listOfParameters += '="';
            listOfParameters += OceanBoundaries;
            listOfParameters += '"';
          }
        }
        if (definedRegion == "FCR")  {
          var FCRBoundaries = dijit.byId("fcrSearch").get('value');
          if (FCRBoundaries != "None")  {
            listOfParameters += "&FishCouncilRegion";
            listOfParameters += '="';
            listOfParameters += FCRBoundaries;
            listOfParameters += '"';
          }
        }

        // fill in date information if necessary
        var today = new Date();
        var year = today.getFullYear();
        var fromDate = dijit.byId("fromDate").get('value');
        var toDate = dijit.byId("toDate").get('value');
        if (fromDate != -999) {
          listOfParameters += "&ObservationYear>=";
          listOfParameters += fromDate;
        }
        if (toDate != year)  {
          listOfParameters += "&ObservationYear<=";
          listOfParameters += toDate;
        }

        // fill in depth information if necessary
        var depthMin = dijit.byId("depthSearchMin").get('value');
        var depthMax = dijit.byId("depthSearchMax").get('value');
        if (depthMin != -999) {
          listOfParameters += "&DepthInMeters>=";
          listOfParameters += depthMin;
        }
        if (depthMax != 6500)  {
          listOfParameters += "&DepthInMeters<=";
          listOfParameters += depthMax;
        }

        // fill in imageurl field (meaning there are images available) if necessary
        var recordsPhotosOnly = dijit.byId("recordsWithPhotos").get('value');
        if (recordsPhotosOnly)  {
          listOfParameters += "&ImageURL";
          listOfParameters += '!="NA"';
        }

        //alert(listOfParameters);

        // get the output file format
        var fileFormats = document.getElementsByName('outputFormat');
        var fileFormat;
        for (var i=0; i<fileFormats.length; i++)  {
          if (fileFormats[i].checked)  {
            fileFormat = fileFormats[i].value;
          }
        }

        // get a list of fields to be included in the output file
        var listOfFields = "CatalogNumber,DataProvider,ScientificName,VernacularNameCategory,TaxonRank,Station,ObservationDate,latitude,longitude,DepthInMeters,DepthMethod,Locality,LocationAccuracy,SurveyID,Repository,IdentificationQualifier,EventID,SamplingEquipment,RecordType,SampleID";

        // submit request to erddap to create download based on user-inputted format
        var urlRequest = "";
        //urlRequest += 'https://ecowatch.ln.ncddc.noaa.gov/erddap/tabledap/deep_sea_corals.';
        urlRequest += 'https://ecowatch.ncddc.noaa.gov/erddap/tabledap/deep_sea_corals.';
        urlRequest += fileFormat;
        urlRequest += '?';
        urlRequest += listOfFields;
        if (listOfParameters != "")  {
          urlRequest += listOfParameters;
        }
        //alert(urlRequest);
        var Win = open(urlRequest,"_new");
      }

      // handles customized data download search which will go directly to ERDDAP
      function goto_ERDDAP()  {

        // hide the data download menu
        var ddMenu = dijit.byId("downloadMenu");
        ddMenu.set("checked", false);
        var dataDownloadPaneName = document.getElementById("titlePane_DataDownload");
        dataDownloadPaneName.style.display = 'none';

        var zoomLevel = map.getZoom();

        // get a list of fields to send to erddap to preload the erddap variables
        var listOfFields = "CatalogNumber,DataProvider,ScientificName,VernacularNameCategory,TaxonRank,Station,ObservationDate,latitude,longitude,DepthInMeters,DepthMethod,Locality,LocationAccuracy,SurveyID,Repository,IdentificationQualifier,EventID,SamplingEquipment,RecordType,SampleID";

        // fill out parameters that have already been set by the map to pass to erddap gui for pre-population
        var listOfParameters= "";

        // filled out from download form
        var inputs = document.getElementsByTagName("input");
        for (var i=0;i<inputs.length;i++)  {
          if (inputs[i].getAttribute('type') == 'checkbox')  {
            var elementName = inputs[i].getAttribute('name');
            if (elementName == "useMapExtent")  {
              var nameElement = document.getElementById('useMapExtent');
              var nameValue = nameElement.checked;
              if (nameValue)  {
                var x = map.extent.xmin;
                var y = map.extent.ymin;
                var num3 = x / 6378137.0;
                var num4 = num3 * 57.295779513082323;
                var num5 = Math.floor((num4 + 180.0) / 360.0);
                var num6 = num4 - (num5 * 360.0);
                var num7 = 1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * y) / 6378137.0)));
                var west = num6;
                var south = num7 * 57.295779513082323;
                var x = map.extent.xmax;
                var y = map.extent.ymax;
                var num3 = x / 6378137.0;
                var num4 = num3 * 57.295779513082323;
                var num5 = Math.floor((num4 + 180.0) / 360.0);
                var num6 = num4 - (num5 * 360.0);
                var num7 = 1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * y) / 6378137.0)));
                var east = num6;
                var north = num7 * 57.295779513082323;
                var useCurrentMapExtent = true;
                //alert("North: " + north + "\nSouth: " + south + "\nEast: " + east + "\nWest: " + west);
                //if (zoomLevel <= 2) {
                if (zoomLevel == 0)  {
                  south = -90;
                  north = 90;
                  west = -180;
                  east = 180;
                }
                else if ((east < 0) && (west > 0)) {
                  alert("Cannot use map extent to bound the data download because it crosses the 180th meridian");
                  useCurrentMapExtent = false;
                }
                if (useCurrentMapExtent)  {
                  listOfParameters += '&latitude>=';
                  listOfParameters += south;
                  listOfParameters += '&latitude<=';
                  listOfParameters += north;
                  listOfParameters += '&longitude>=';
                  listOfParameters += west;
                  listOfParameters += '&longitude<=';
                  listOfParameters += east; 
                }
              }  
            }
          }
        }

        // fill in taxon information if necessary
        var dscForm = dijit.byId("dscForm");
        var speciesQuery = dscForm.attr('value').Scientific_Vernacular_OFG_pQuery;
        if (speciesQuery == "Scientific")  {
          var scientificNameText = dijit.byId("dbSearchTB").get('value');
          if (scientificNameText.length != 0)  {
            var newScientificNameText = capitalize(scientificNameText);
            if (newScientificNameText.indexOf("(") != -1)  {
              var newStringBefore = newScientificNameText.replace("(","%5C(");
              var newScientificNameText = newStringBefore.replace(")","%5C)");
            }
            //listOfParameters += "&scientificname";
            listOfParameters += "&SynonymSearchProxy";
            listOfParameters += '=~".*';
            //listOfParameters += scientificNameText;
            listOfParameters += newScientificNameText;
            listOfParameters += '.*"';
          }
        }
        if (speciesQuery == "Vernacular")  {
          var vernacularNameText = dijit.byId("vernacularSearch").get('value');
          if (vernacularNameText != "None")  {
            listOfParameters += "&VernacularNameCategory";
            listOfParameters += '="';
            listOfParameters += vernacularNameText;
            listOfParameters += '"';
          }
        }
        if (speciesQuery == "OFG")  {
          var taxonphylumText = document.getElementById("taxonphylum").value;
          if (taxonphylumText != "None")  {
            listOfParameters += "&Phylum";
            listOfParameters += '="';
            listOfParameters += taxonphylumText;
            listOfParameters += '"';
            var taxonorderText = document.getElementById("taxonorder").value;
            if (taxonorderText != "None")  {
              listOfParameters += "&Order";
              listOfParameters += '="';
              listOfParameters += taxonorderText;
              listOfParameters += '"';
              var taxonfamilyText = document.getElementById("taxonfamily").value;
              if ((taxonfamilyText != "None") && (taxonfamilyText.length != 0))  {
                listOfParameters += "&Family";
                listOfParameters += '="';
                listOfParameters += taxonfamilyText;
                listOfParameters += '"';
                taxongenusText = document.getElementById("taxongenus").value;
                if ((taxongenusText != "None") && (taxongenusText.length != 0)) {
                  listOfParameters += "&Genus";
                  listOfParameters += '="';
                  listOfParameters += taxongenusText;
                  listOfParameters += '"';
                }
              }
            }
          }
        }
        console.log(listOfParameters);
        if (speciesQuery == "pQuery")  {
          var pQueryNameText = dijit.byId("pQuerySearch").get('value');
          if (pQueryNameText != "None")  {
            if (pQueryNameText == "structure-forming deep sea corals")  {
              listOfParameters += '&VernacularNameCategory=~"(stony coral %5C(branching%5C))|(black coral)|(gorgonian coral)"';
            }
            if (pQueryNameText == "structure-forming animals")  {
              listOfParameters += '&VernacularNameCategory=~"(sea pen)|(lace coral)|(.*sponge.*)"';
            }
          }
        }

        // fill in region information if necessary
        var definedRegion = dscForm.attr('value').LME_Ocean_FCR
        if (definedRegion == "LME") {
          var LMEBoundaries = dijit.byId("lmeSearch").get('value');
          if (LMEBoundaries != "None")  {
            listOfParameters += "&LargeMarineEcosystem";
            listOfParameters += '="';
            listOfParameters += LMEBoundaries;
            listOfParameters += '"';
          }
        }
        if (definedRegion == "Ocean") {
          var OceanBoundaries = dijit.byId("oceanSearch").get('value');
          if (OceanBoundaries != "None")  {
            listOfParameters += "&Ocean";
            listOfParameters += '="';
            listOfParameters += OceanBoundaries;
            listOfParameters += '"';
          }
        }
        if (definedRegion == "FCR")  {
          var FCRBoundaries = dijit.byId("fcrSearch").get('value');
          if (FCRBoundaries != "None")  {
            listOfParameters += "&FishCouncilRegion";
            listOfParameters += '="';
            listOfParameters += FCRBoundaries;
            listOfParameters += '"';
          }
        }

        // fill in date information if necessary
        var today = new Date();
        var year = today.getFullYear();
        var fromDate = dijit.byId("fromDate").get('value');
        var toDate = dijit.byId("toDate").get('value');
        if (fromDate != -999) {
          listOfParameters += "&ObservationYear>=";
          listOfParameters += fromDate;
        }
        if (toDate != year)  {
          listOfParameters += "&ObservationYear<=";
          listOfParameters += toDate;
        }

        // fill in depth field if necessary
        var depthMin = dijit.byId("depthSearchMin").get('value');
        var depthMax = dijit.byId("depthSearchMax").get('value');
        if (depthMin != -999) {
          listOfParameters += "&DepthInMeters>=";
          listOfParameters += depthMin;
        }
        if (depthMax != 6500)  {
          listOfParameters += "&DepthInMeters<=";
          listOfParameters += depthMax;
        }

        // fill in imageurl field (meaning there are images available) if necessary
        var recordsPhotosOnly = dijit.byId("recordsWithPhotos").get('value');
        if (recordsPhotosOnly)  {
          listOfParameters += "&ImageURL";
          listOfParameters += '!="NA"';
        }

        //alert(listOfParameters);

        // create erddap request
        var erddapRequest = "";
        //var erddapLink = "https://ecowatch.ln.ncddc.noaa.gov/erddap/tabledap/deep_sea_corals.html";
        var erddapLink = "https://ecowatch.ncddc.noaa.gov/erddap/tabledap/deep_sea_corals.html";
        if (listOfFields != "")  {
          erddapRequest += erddapLink;
          erddapRequest += "?";
          erddapRequest += listOfFields;
          if (listOfParameters != "")  {
            erddapRequest += listOfParameters;
          }
        }
        else  {
          erddapRequest += erddapLink;
        }
        var Win = open(erddapRequest,"_new");
      }

      function capitalize(s)  {
        return s[0].toUpperCase() + s.slice(1);
      }

      function provideFeedback()  {
        var link = "mailto:deepseacoraldata@noaa.gov?subject=Deep%20Sea%20Coral";
        window.location.href = link;
      }

      function getModelDetails()  {
        //alert("This will bring up your model details");
        var detail = "https://coastalscience.noaa.gov/projects/detail?key=35"
        var Win = open(detail,"_new");
      }

      function getModelArchive()  {
        //alert("This will bring up your model archive link");
        var archive = "https://data.nodc.noaa.gov/cgi-bin/iso?id=gov.noaa.nodc:145923"
        var Win = open(archive,"_new");
      }
