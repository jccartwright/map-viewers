define(["dojo/_base/declare", "dojo/_base/array", "dojo/string", "ngdc/identify/IdentifyPane", "dojo/topic", "esri/dijit/Popup", "dojo/_base/lang", "dijit/form/Button",
    "dojo/dom-style", "app/RequestDataDialog"],
    function(declare, array, string, IdentifyPane, topic, Popup, lang, Button,
        domStyle, RequestDataDialog){

        return declare([IdentifyPane], {

            postCreate: function() {
                this.inherited(arguments);
                domStyle.set(this.domNode, 'height', '350px');
                domStyle.set(this.domNode, 'width', '400px');   

                domStyle.set(this.featurePageBottomBar.domNode, 'height', '30px');
                //this.featurePageBottomBar.style = 'height: 50px;';

                this.requestDataFilesButton = new Button({
                    label: "Request These Data Files",
                    style: "bottom: 5px; left: 15px;",
                    onClick: lang.hitch(this, function(){
                        this.requestDataFiles();
                    })
                }).placeAt(this.featurePageBottomBar);

                this.requestDataFileButton = new Button({
                    label: "Request This Data File",
                    style: "bottom: 25px; left: 15px;",
                    onClick: lang.hitch(this, function(){
                        this.requestDataFile();
                    })
                }).placeAt(this.infoPageBottomBar);
            },

            getLayerDisplayLabel: function(item) {
                return '<i><b>' + item.layerName + '</b></i>';
            },

            getItemDisplayLabel: function(item) {
                return item.value;                
            },

            requestDataFiles: function() {
                console.log('inside requestData...');
                var items = this.storeModel.store.query({type: 'item'});
                var filenames = [];
                for (var i = 0; i < items.length; i++) {
                    filenames.push(items[i].displayLabel);
                }

                if (!this.requestDataDialog) {
                    this.requestDataDialog = new RequestDataDialog({style: 'width: 300px;'});                
                }
                this.requestDataDialog.filenames = filenames;
                this.requestDataDialog.show();
            },

            requestDataFile: function() {
                var filename = this.currentItem.displayLabel;

                if (!this.requestDataDialog) {
                    this.requestDataDialog = new RequestDataDialog({style: 'width: 300px;'});
                }
                this.requestDataDialog.filenames = [filename];
                this.requestDataDialog.show();
            }

        });
    }
);