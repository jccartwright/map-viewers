define([
    "dojo/_base/declare",
    "dojo/on",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/dom-style",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dnd/move",
    "esri/domUtils",
    "dojox/layout/FloatingPane",
    "dojo/topic",
    "dojo/store/Memory",
    "dojo/store/Observable",
    "dijit/tree/ObjectStoreModel",
    "dijit/Tree",
    "dijit/layout/BorderContainer",
    "dijit/layout/StackContainer",
    "dijit/layout/ContentPane",
    "dijit/form/Button",
    "dijit/registry",
    "esri/tasks/QueryTask",
    "esri/tasks/query",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "dojo/_base/Color",
    "esri/SpatialReference",
    "esri/geometry/Polyline",
    "esri/geometry/Point",
    "esri/geometry/Polygon",
    "esri/geometry/Multipoint",
    "esri/geometry/Extent"
],
    function (
        declare,
        on,
        dom,
        domConstruct,
        array,
        domStyle,
        lang,
        domClass,
        move,
        domUtils,
        FloatingPane,
        topic,
        Memory,
        Observable,
        ObjectStoreModel,
        Tree,
        BorderContainer,
        StackContainer,
        ContentPane,
        Button,
        registry,
        QueryTask,
        Query,
        SimpleFillSymbol,
        SimpleLineSymbol,
        SimpleMarkerSymbol,
        Color,
        SpatialReference,
        Polyline,
        Point,
        Polygon,
        Multipoint,
        Extent
        )
    {
        return declare(FloatingPane, {

            constructor: function (params) {
                logger.debug('inside constructor for ngdc.identify.IdentifyPane');

                this.resizable = true;
                this.dockable = false;
                this.doLayout = true;
                this.duration = 100;
                this.isFirstShow = true;

                lang.mixin(this, params);

                this.uid = 0;

                topic.subscribe("/identify/results", lang.hitch(this, function (results) {
                    //console.log('identify results: ', results);
                    this.results = results;
                    this.showResults(results);
                }));

                // the symbol used to display polygon features
                this.fillSymbol = params.fillSymbol ||
                    new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                            new Color([64, 64, 64, 1]), 2), new Color([255, 0, 0, 0.5]));

                // the symbol used to display polyline features
                this.lineSymbol = params.lineSymbol ||
                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 255]), 2);

                // the symbol used to display point/multipoint features
                this.markerSymbol = params.markerSymbol ||
                    new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 13,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 128, 0]), 2), new Color([0, 255, 0]));

            },

            postCreate: function() {
                this.inherited(arguments);
                //console.log('inside postCreate...');

                //Hide initial display
                this.hide();

                //Set the FloatingPane's Moveable to be constrained to the parent
                this.moveable = new dojo.dnd.move.parentConstrainedMoveable(
                    this.domNode,
                    {
                        handle: this.focusNode,
                        area: "content",
                        within: true
                    }
                );

                //Initialize the StackContainer with 2 ContentPanes: featurePage and infoPage
                this.stackContainer = new StackContainer({
                    id: "stackContainer",
                    style: "height: 100%; width: 100%"
                }, this.containerNode);

                this.featurePage = new ContentPane({
                    id: "featurePage",
                    style: "height: 100%; width: 100%"
                }).placeAt(this.containerNode);
                this.stackContainer.addChild(this.featurePage);

                this.infoPage = new ContentPane({
                    id: "infoPage",
                    style: "height: 100%; width: 100%"
                    //innerHTML: "InfoPane content"
                });
                this.stackContainer.addChild(this.infoPage);

                //Create a BorderContainer for the featurePage.
                //The top part (featurePane) contains the tree; the bottom part is a spacer for the resize handle
                var bc = new BorderContainer({
                    style: "height: 100%; width: 100%",
                    gutters: false
                });

                this.featurePane = new ContentPane({
                    region: "center",
                    style: "background: #EEE"
                });
                bc.addChild(this.featurePane);

                var cp = new ContentPane({
                    region: "bottom",
                    style: "height: 16px;"
                });
                bc.addChild(cp);
                bc.placeAt(this.featurePage);


                //Create a BorderContainer for the infoPage.
                var bc2 = new BorderContainer({
                    style: "height: 100%; width: 100%",
                    gutters: false
                });
                this.infoPane = new ContentPane({
                    region: "center",
                    style: "background: #EEE"
                });
                bc2.addChild(this.infoPane);

                var cp2 = new ContentPane({
                    region: "bottom"//,
                    //style: "height: 16px;",
                });
                bc2.addChild(cp2);
                bc2.placeAt(this.infoPage);

                //Initialize the infoPage with a back button
                //TODO: finish implementing this
                this.backButton = new Button({
                    label: "Back",
                    style: "bottom: 5px; left: 5px;",
                    onClick: lang.hitch(this, function(){
                        console.log("button clicked!");
                        this.setTitle(this.featurePageTitle);
                        this.stackContainer.back();
                    })
                }).placeAt(cp2);

                this.stackContainer.startup();

                //Initialize a Memory store with a root only
                this.featureStore = new Observable(Memory({
                    data: [
                        {id: 'root', label: 'root'}
                    ],
                    getChildren: function(object){
                        return this.query({parent: object.id});
                    }
                }));

                //Create the store model used by the Tree
                this.storeModel = new ObjectStoreModel({
                    store: this.featureStore,
                    query: {id: 'root'},
                    labelAttr: 'label'
                });

                //Custom TreeNode class (based on dijit.TreeNode) that allows rich text labels.
                //Example here: http://dojotoolkit.org/reference-guide/1.9/dijit/Tree-examples.html
                this.CustomTreeNode = declare(Tree._TreeNode, {
                    _setLabelAttr: {node: "labelNode", type: "innerHTML"}
                });
            },

            resize: function() {
                //console.log('inside resize...');
                this.inherited(arguments);

                //Ensure the contents get properly resized when the entire widget resizes, doesn't seem to happen otherwise
                this.featurePage.resize();
                this.infoPage.resize();
            },

            startup: function() {
                //console.log('inside startup...');
                this.inherited(arguments);

                //Activate the featurePage by default. TODO fix this
                this.stackContainer.forward();
                this.stackContainer.back();
                //this.showFeaturePage();
            },

            showResults: function(results) {
                //console.log("inside showResults...");

                this.removeHighlightGraphic();

                this.showFeaturePage();

                //Destroy the existing tree and clear the feature store
                if (this.tree) {
                    this.tree.destroyRecursive();
                }
                this.clearFeatureStore();

                //Populate the store used by the tree
                var numFeatures = this.populateFeatureStore(results.results);

                //Construct a new tree and place it in the feature pane.
                this.constructFeatureTree();

                this.featurePageTitle = "Identified Features (" + numFeatures + ")";
                this.setTitle(this.featurePageTitle);
                this.show(); //Show the widget
            },

            populateFeatureStore: function(results) {
                var numFeatures = 0;

                //Iterate over each IdentifyResultCollection (one per service)
                for (var svcId in results) {
                    if (results.hasOwnProperty(svcId)) {

                        numFeatures += results[svcId].length;
                        var svcUrl = results[svcId].svcUrl;

                        //TODO: allow custom sorting function for layers, and for features within a layer

                        //Loop through the array of IdentifyResults
                        for (var i = 0; i < results[svcId].length; i++) {
                            var item = results[svcId][i];
                            var layerUrl = svcUrl + '/' + item.layerId; //construct the layerUrl (needed for QueryTasks)
                            var layerKey = svcId + '/' + item.layerName;

                            //Create a layer "folder" node if it doesn't already exist
                            if (this.featureStore.query({name: item.layerName}).length == 0) {
                                this.featureStore.put({
                                    uid: ++this.uid,
                                    id: item.layerName,
                                    label: this.getLayerDisplayLabel(item),
                                    type: 'layer',
                                    parent: 'root'
                                });
                            }

                            //Add the current item to the store, with the layerName as parent
                            this.featureStore.put({
                                uid: ++this.uid,
                                id: item.value,
                                //TODO: point to the magnifying glass image using a module path
                                displayLabel: this.getItemDisplayLabel(item),
                                label: this.getItemDisplayLabel(item) + " <a id='zoom-" + this.uid + "' href='#' class='zoomto-link'><img src='js/ngdc/identify/images/magnifying-glass.png'></a>",
                                layerUrl: layerUrl,
                                layerKey: layerKey,
                                attributes: item.feature.attributes,
                                parent: item.layerName,
                                type: 'item'
                            });
                        };
                    }
                }
                return numFeatures;
            },

            constructFeatureTree: function() {
                //Construct a new Tree
                this.tree = new Tree({
                    model: this.storeModel,
                    showRoot: false,
                    persist: false,
                    autoExpand: true,
                    openOnClick: true,
                    onClick: lang.hitch(this, function(item) {
                        this.showInfo(item);
                    }),
                    getIconClass: function(item, opened) {
                        if (item.type == 'item') {
                            return "iconBlank";
                        }
                        else if (item.type == 'layer') {
                            return (opened ? "dijitFolderOpened" : "dijitFolderClosed");
                        }
                        else {
                            return "dijitLeaf";
                        }
                    },
                    _createTreeNode: lang.hitch(this, function(args){
                        return new this.CustomTreeNode(args);
                    })
                });
                //Attach the onMouseOver handler for highlighting features.
                //It's pausable so we can pause it when hiding the dijit to avoid extraneous mouseovers firing
                this.onMouseOverHandler = on.pausable(this.tree, "mouseOver", lang.hitch(this, function(item) {
                    this.onMouseOverNode(item);
                }));
                this.tree.placeAt(this.featurePane);
                this.tree.startup();
            },

            getLayerDisplayLabel: function(item) {
                //Sub-classes should implement this method. By default, it's the layer name (from the map service) in bold
                return '<b>' + item.layerName + '</b>';
            },

            getItemDisplayLabel: function(item) {
                //Sub-classes should implement this method. By default, it's the display expression for the feature (from the map service)
                return item.value;
            },

            clearFeatureStore: function() {
                //console.log("inside clearFeatureStore...");
                //TODO: just destroy it and define a new store instead?
                var children = this.featureStore.getChildren(this.featureStore.get('root'));
                array.forEach(children, lang.hitch(this, function(child) {
                    var subChildren = this.featureStore.getChildren(this.featureStore.get(child.id));
                    array.forEach(subChildren, lang.hitch(this, function(child) {
                        this.featureStore.remove(child.id);
                    }));
                    this.featureStore.remove(child.id);
                }));
            },

            showInfo: function(item) {
                //Should be overidden by subclasses in most cases
                //console.log("inside showInfo...");

                //Highlight the current geometry (specifically for touch-screen devices where the mouseOver event won't fire)
                this.queryForHighlightGeometry(item);

                this.setTitle('Attributes: ' + item.displayLabel);

                topic.publish('identifyPane/showInfo', item);

                this.showInfoPage();
            },

            setInfoPaneContent: function(content) {
                this.infoPane.domNode.innerHTML = content;
            },

            onMouseOverNode: function(evt) {
                //console.log("inside onMouseOverNode...");

                //The event references the TreeRow. Get the enclosing TreeNode widget.
                var item = registry.getEnclosingWidget(evt.target).item;

                if (item && item.type == 'item') {
                    if (this.highlightItem && item.uid == this.highlightItem.uid) {
                        //skip if current item already highlighted
                        return;
                    }

                    clearTimeout(this.mouseOverTimer); //clear any existing timeout
                    this.mouseOverTimer = setTimeout(lang.hitch(this, function(){
                        //only fire a query if hovering for >100ms
                        this.queryForHighlightGeometry(item);
                    }), 100);

                    //TODO: cache feature geometries in a store to speed up subsequent mouseovers?
                    //Cache the first X features on load?
                }
            },

            queryForHighlightGeometry: function(item) {
                //Query the map service for one feature's geometry
                //console.log("inside mouseOverQuery...");
                if (this.highlightItem && item.uid == this.highlightItem.uid) {
                    //skip if current item already highlighted
                    return;
                }

                this.highlightItem = item;

                var queryTask = new QueryTask(item.layerUrl);
                var query = new Query();
                query.where = "OBJECTID = " + item.attributes['OBJECTID'];
                query.outSpatialReference = this.map.spatialReference;
                query.returnGeometry = true;
                query.maxAllowableOffset = 100; //simpify a bit for performance
                query.outFields = [];
                var uid = item.uid;

                //console.log("Executing query");
                queryTask.execute(query).then(lang.hitch(this, function(featureSet) {
                    //console.log("Query returned");

                    //highlight the feature on the map
                    this.highlightFeature(featureSet.features[0]);

                    //TODO: show the zoom-to button for this TreeNode
                    this.showZoomToIcon(uid);

                    //TODO: error handling
                }));

            },

            showZoomToIcon: function(id) {
                if (this.currentZoomToIcon && dom.byId(this.currentZoomToIcon.id)) {
                    domStyle.set(this.currentZoomToIcon.id, "display", "none");
                }
                this.currentZoomToIcon = dom.byId('zoom-' + id);
                domStyle.set('zoom-' + id, "display", "inline");

                //Remove any existing zoom-to handler
                if (this.zoomToHandler) {
                    this.zoomToHandler.remove();
                }
                this.zoomToHandler = on(this.currentZoomToIcon, "click", lang.hitch(this, function(evt){
                    console.log('Zoom-to clicked for uid=' + id);
                    evt.stopPropagation(); //Stop the onClick event from bubbling up to the enclosing TreeNode
                    this.zoomToFeature(this.highlightGraphic);
                }));
            },

            zoomToFeature: function(graphic) {
                console.log("inside zoomToFeature...");

                var geometry = graphic.geometry;
                var worldWidth = 40075014.13432359; //Width of the map in Web Mercator

                if (geometry.type === "point") {
                    this.map.centerAndZoom(geometry, this.map.getLevel() + 3); //Center on the point and zoom in 3 more levels
                }
                else {
                    var featureExtent = geometry.getExtent();
                    if ((featureExtent.spatialReference.wkid === 3857 || featureExtent.spatialReference.wkid === 102100) &&
                        featureExtent.xmin <= -20000000 && featureExtent.xmax >= 20000000) {
                        //Projection is Web Mercator, and the feature's bounding box crosses the entire globe.
                        //So, it's likely the feature crosses the antimeridian.

                        //180-degree centered Web Mercator WKT
                        var outSR = new SpatialReference({wkt: "PROJCS[\"WGS_1984_Web_Mercator_Auxiliary_Sphere\",GEOGCS[\"GCS_WGS_1984\",DATUM[\"D_WGS_1984\",SPHEROID[\"WGS_1984\",6378137.0,298.257223563]],PRIMEM[\"Greenwich\",0.0],UNIT[\"Degree\",0.0174532925199433]],PROJECTION[\"Mercator_Auxiliary_Sphere\"],PARAMETER[\"False_Easting\",0.0],PARAMETER[\"False_Northing\",0.0],PARAMETER[\"Central_Meridian\",180],PARAMETER[\"Standard_Parallel_1\",0.0],PARAMETER[\"Auxiliary_Sphere_Type\",0.0],UNIT[\"Meter\",1.0]]"});

                        //Convert the geometry to 180-centered Web Mercator by adding/subtracting worldWidth from all x coords in the Western Hemisphere
                        var newGeom;
                        if (geometry.type === 'polyline') {
                            newGeom = new Polyline(outSR);
                            array.forEach(geometry.paths, function(path){
                                var newPoints = [];
                                for (i = 0; i < path.length; i++) {
                                    var x = path[i][0] - worldWidth/2
                                    if (x < -worldWidth/2)
                                        x += worldWidth;
                                    newPoints[i] = new Point(x, path[i][1], outSR);
                                }
                                newGeom.addPath(newPoints);
                            }, this);
                        }
                        else if (geometry.type === 'polygon') {
                            newGeom = new Polygon(outSR);
                            array.forEach(geometry.rings, function(ring){
                                var newPoints = [];
                                for (i = 0; i < ring.length; i++) {
                                    var x = ring[i][0] - worldWidth/2;
                                    if (x < -worldWidth/2)
                                        x += worldWidth;
                                    newPoints[i] = new Point(x, ring[i][1], outSR);
                                }
                                newGeom.addRing(newPoints);
                            }, this);
                        }
                        else { //multipoint
                            newGeom = new Multipoint(outSR);
                            array.forEach(geometry.points, function(point){
                                var x = point - worldWidth/2;
                                if (x < -worldWidth/2)
                                    x += worldWidth;
                                newGeom.addPoint(new Point(x, point[1], outSR));
                            }, this);
                        }
                        var newExtent = newGeom.getExtent(); //extent in 180-centered coords

                        //Shift the extent by a constant to convert back to Web Mercator
                        //May result in a geometry extending past the western edge of the map. This is what we want.
                        featureExtent = new Extent(newExtent.xmin - worldWidth/2, newExtent.ymin, newExtent.xmax - worldWidth/2, newExtent.ymax, new esri.SpatialReference({
                            wkid: 3857
                        }));
                    }
                    this.map.setExtent(featureExtent, true); //Set the map's extent for Web Mercator, Arctic, etc.
                }

            },

            highlightFeature: function(graphic) {
                //console.log("inside highlightFeature...");

                // remove previous highlight graphic
                this.removeHighlightGraphic();


                if (graphic) {
                    // set the symbol for the graphic
                    switch (graphic.geometry.type) {
                        case "point":
                            graphic.setSymbol(this.markerSymbol);
                            break;
                        case "multipoint":
                            graphic.setSymbol(this.markerSymbol);
                            break;
                        case "polyline":
                            graphic.setSymbol(this.lineSymbol);
                            break;
                        case "polygon":
                            graphic.setSymbol(this.fillSymbol);
                            break;
                    }

                    // add the highlight graphic to the map
                    this.map.graphics.add(graphic);
                    this.highlightGraphic = graphic;
                }
            },

            removeHighlightGraphic: function() {
                if (this.highlightGraphic) {
                    this.map.graphics.remove(this.highlightGraphic);
                }
            },

            showFeaturePage: function() {
                this.stackContainer.selectChild(this.featurePage);
            },

            showInfoPage: function() {
                this.stackContainer.selectChild(this.infoPage);
            },

            close: function() {
                //Remove any highlighted feature on the map.
                this.removeHighlightGraphic();

                //Override the default close function so the widget doesn't get destroyed. Hide it instead.
                this.hide();
            },

            show: function() {
                this.inherited(arguments);

                if (this.isFirstShow) {
                    this.isFirstShow = false;
                    domStyle.set(this.domNode, 'top', '40px');
                    domStyle.set(this.domNode, 'left', '40px');
                }

                //Resume mouseover events on the tree
                if (this.onMouseOverHandler) {
                    this.onMouseOverHandler.resume();
                }
            },

            hide: function() {
                this.inherited(arguments);

                //Pause the tree's mouseover event to prevent unwanted mouseovers when closing the dijit
                if (this.onMouseOverHandler) {
                    this.onMouseOverHandler.pause();
                }
            }

        });
    });