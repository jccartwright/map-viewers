dojo.provide('firedetects.DatePanel');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.form.DateTextBox');

dojo.declare('firedetects.DatePanel',[dijit._Widget, dijit._Templated],{
   templatePath: dojo.moduleUrl('firedetects','templates/DatePanel.html'),
   widgetsInTemplate: true,
   startDate: null,
   endDate: null,

   //lifecycle extension points
	postMixInProperties: function() {
		//TODO accept start, end date parameters to initialize DateTextBox
				
		var now = new Date();
		var yesterday =  new Date(now.getTime() - (24*60*60*1000));
		//this.startDate = yesterday.getUTCFullYear()+"-"+(yesterday.getUTCDate()+1)+"-"+yesterday.getUTCDate();
		this.startDate = new Date(yesterday.getTime());
		this.startDate.setUTCHours(0);
		this.startDate.setUTCMinutes(0);
		this.endDate = new Date(yesterday.getTime());
		this.endDate.setUTCHours(23);
		this.endDate.setUTCMinutes(59);
	},   
	
   postCreate: function() {
		this.date1.set('value',this.startDate);	
		//this.date2.set('value',this.endDate);	
		
/*
 		//alternate 1		
		this.connect(this.date1,'onChange',function(d){
			console.log('date = ',d);	
		});

		//alternate 2
		dojo.connect(this.date1,'onChange',this,function(d){
			console.log('date = ',d);
		}
		
		//alternate 3 - use dojoAttachEvent and separate function
*/
		
		this.connect(this.date1,'onChange',function(d){
			//TODO check that date1 <= date2
			d.setUTCHours(0);
			d.setUTCMinutes(0);
			this.startDate = d;
			
			this.endDate = new Date(this.startDate.getTime());
			this.endDate.setUTCHours(23);
			this.endDate.setUTCMinutes(59);
			this.dateRangeChanged();		
		});
/*
		this.connect(this.date2,'onChange',function(d){
			//TODO check that date2 >= date1
			d.setUTCHours(23);
			d.setUTCMinutes(59);
			this.endDate = d;
			this.dateRangeChanged();		
		});
*/		
		this.subscribe('/ngdc/dataRange',function(data){
			this.dateRange.attr('content', "<h4>Data are available fom "+this.formatDate(data.start_date)+" to "+this.formatDate(data.end_date)+" (UTC)</h4>");	
		});

   },
   
	formatDate: function(date) {
		var month = date.getUTCMonth()+1;
		return (month+"/"+date.getUTCDate()+"/"+date.getUTCFullYear());
	},
	
	dateRangeChanged: function() {
		dojo.publish('/ngdc/DateRange',[{
			startDate: this.startDate,
			endDate: this.endDate
		}]);		
	}	  
});