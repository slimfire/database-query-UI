var fetch = function(select, where, callback) {
	var trafficModel = Backbone.Model.extend({
	    urlRoot: '/api/traffic'
	});
	var trafficCollection = Backbone.Collection.extend({
	    model: trafficModel
	    , url: '/api/traffic'
	});

	var traffic = new trafficModel({
		select : select,
		where : where
	});

	traffic.save().then(function(data) {
		console.log("Heyy : ", data);
		callback(data);
	}, function(err){
		console.log("err : ", err)
		callback([]);
	});
}

var HomeView = Backbone.View.extend({
	template : Handlebars.compile($('#query-template').html()),
	render : function(){
	    $('#query-container').html(this.template());
	    return this;
	},
	initialize : function(){
		this.render();
	}
});

var init = function(callback){
	var initModel = Backbone.Collection.extend({
	  url: '/api/init'
	});

	var init = new initModel();
	init.fetch().then(function(attributes) {
		callback(attributes);
	}, function(err){
		console.log("err : ", err)
		callback([]);
	});
}

var resultRoute = function(){
	var ResultView = Backbone.View.extend({
		template : Handlebars.compile($('#result-template').html()),
		initialize : function(){
			this.render();
		},
		render : function(){
			fetch(select, where, function(data){
				$('#result-container').html(this.template(data));
				return this;
			});
		}
	});
	var queryView = new ResultView();
	queryView.render();
}

function getTimeRange(){
    var startDateTextBox = $('#startDate');
    var endDateTextBox = $('#endDate');

    startDateTextBox.datetimepicker({ 
      timeFormat: 'HH:mm z',
      onClose: function(dateText, inst) {
        if (endDateTextBox.val() != '') {
          var testStartDate = startDateTextBox.datetimepicker('getDate');
          var testEndDate = endDateTextBox.datetimepicker('getDate');
          if (testStartDate > testEndDate)
            endDateTextBox.datetimepicker('setDate', testStartDate);
        }
        else {
          endDateTextBox.val(dateText);
        }
      },
      onSelect: function (selectedDateTime){
        endDateTextBox.datetimepicker('option', 'minDate', startDateTextBox.datetimepicker('getDate') );
      }
    });
    endDateTextBox.datetimepicker({ 
      timeFormat: 'HH:mm z',
      onClose: function(dateText, inst) {
        if (startDateTextBox.val() != '') {
          var testStartDate = startDateTextBox.datetimepicker('getDate');
          var testEndDate = endDateTextBox.datetimepicker('getDate');
          if (testStartDate > testEndDate)
            startDateTextBox.datetimepicker('setDate', testEndDate);
        }
        else {
          startDateTextBox.val(dateText);
        }
      },
      onSelect: function (selectedDateTime){
        startDateTextBox.datetimepicker('option', 'maxDate', endDateTextBox.datetimepicker('getDate') );
      }
    });
}

var ResultView;
function appViewModel(){
	var self = this;
	self.queryValues = ko.observableArray([
			{attribute : ko.observable('')},
			{attribute : ko.observable('')},
			{attribute : ko.observable('')},
			{attribute : ko.observable('')}
		]);
	self.attributes = ko.observableArray([]);
	self.selectedItems = ko.observableArray([]);
	self.data = ko.observableArray([]);
	self.startDate = ko.observable("");
	self.endDate = ko.observable("");
	self.directionMin = ko.observable();
	self.directionMax = ko.observable();
	self.sumOfBytesMin = ko.observable();
	self.sumOfBytesMax = ko.observable();
	self.sumOfPacketsMin = ko.observable();
	self.sumOfPacketsMax = ko.observable();
	//on query building section
	self.firstOp = ko.observable('');
	self.secondOp = ko.observable('');
	self.thirdOp = ko.observable('');
	var currentIndex = 0;
	self.clearQueryBuild = function(){
		self.queryValues([
			{attribute : ko.observable('')},
			{attribute : ko.observable('')},
			{attribute : ko.observable('')},
			{attribute : ko.observable('')}
		]);
	}
	self.addToQuery = function(attribute){
		for (var i = 0; i <= self.queryValues().length - 1; i++) {
			console.log(self.queryValues()[i].attribute())
			if(self.queryValues()[i].attribute() == '')
			{
				currentIndex = i;
				break;
			}
		};
		console.log(currentIndex)
		if(attribute == 'timestamp')
		{
			self.queryValues()[currentIndex].attribute(attribute);
			self.queryValues()[currentIndex]['timestamp'] = {};
			self.queryValues()[currentIndex]['timestamp']['$gte'] = new Date(self.startDate()).getTime();
			self.queryValues()[currentIndex]['timestamp']['$lte'] = new Date(self.endDate()).getTime();
		}
		else if(attribute == 'dirction_ingress')
		{
			self.queryValues()[currentIndex].attribute(attribute);
			self.queryValues()[currentIndex]['dirction_ingress'] = {};
			self.queryValues()[currentIndex]['dirction_ingress']['$gte'] = self.directionMin();
			self.queryValues()[currentIndex]['dirction_ingress']['$lte'] = self.directionMax();
		}
		else if(attribute == 'sum_bytes')
		{
			self.queryValues()[currentIndex].attribute(attribute);
			self.queryValues()[currentIndex]['sum_bytes'] = {};
			self.queryValues()[currentIndex]['sum_bytes']['$gte'] = self.sumOfBytesMin();
    		self.queryValues()[currentIndex]['sum_bytes']['$lte'] = self.sumOfBytesMax();
		}
		else if(attribute == 'sum_packets')
		{
    		self.queryValues()[currentIndex].attribute(attribute);
    		self.queryValues()[currentIndex]['sum_packets'] = {};
			self.queryValues()[currentIndex]['sum_packets']['$gte'] = self.sumOfPacketsMin();
			self.queryValues()[currentIndex]['sum_packets']['$lte'] = self.sumOfPacketsMax();
		}
		
		console.log(attribute, self.queryValues())
	}
	self.query = function(){
		console.log(self.selectedItems());
		console.log(self.startDate(), " <<<--->>> ", self.endDate())
		var params = {
	    	select : self.selectedItems(),
	    	where : {}
	    }

	    params.where[mapOpCode(self.secondOp())] = [{}, {}];
		params.where[mapOpCode(self.secondOp())][0][mapOpCode(self.firstOp())] = [self.queryValues()[0], self.queryValues()[1]];
		params.where[mapOpCode(self.secondOp())][1][mapOpCode(self.thirdOp())] = [self.queryValues()[2], self.queryValues()[3]];
		console.log(params.where)
		fetch(params.select, params.where, function(data){
			self.data(data);
			ResultView = Backbone.View.extend({
				template : _.template($('#result-template').html()),
				initialize : function(data){
					this.data = self.data();
					this.attributes = self.attributes();
					this.render();
				},
				render : function(){
					var attributes;
					console.log("selected attributes : ", self.selectedItems());
					if(self.selectedItems().length == 0)
					{
						attributes = self.attributes();
					}
					else
					{
						attributes = self.selectedItems();
					}
					$('#result-container').html(this.template({data : self.data(), attributes : attributes}));
					return this;
				}
			});
			var resultView = new ResultView();
			resultView.render();
		});
	}

	//init
	getTimeRange();
	console.log(self.attributes())
	init(function(attributes){
		for (var i = 0; i < attributes.length; i++) {
			attributes[i] = ko.observable(attributes[i]);
		};
		self.attributes(attributes);
	});
}


var mapOpCode = function(opCode){
	if(opCode == 'AND')
		return '$and';
	if(opCode == 'OR')
		return '$or';
}
ko.applyBindings(new appViewModel());