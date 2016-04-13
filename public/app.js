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
	self.test = [1, 2, 4, 5, 6, 7, 8, 89, 9]
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
	self.query = function(){
		console.log(self.selectedItems());
		console.log(self.startDate(), " <<<--->>> ", self.endDate())
		var params = {
	    	select : self.selectedItems(),
	    	where : {
	    		timestamp : {
	    			$gte : new Date(self.startDate()).getTime() || '',
	    			$lte : new Date(self.endDate()).getTime() || ''
	    		},
	    		dirction_ingress : {
	    			$gte : self.directionMin(),
	    			$lte : self.directionMax()
	    		},
	    		sum_bytes : {
	    			$gte : self.sumOfBytesMin(),
	    			$lte : self.sumOfBytesMax()
	    		},
	    		sum_packets : {
	    			$gte : self.sumOfPacketsMin(),
	    			$lte : self.sumOfPacketsMax()
	    		}
	    	}
	    }
		
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
					console.log("selected attributes : ", self.selectedItems());
					$('#result-container').html(this.template({data : self.data(), attributes : self.selectedItems()}));
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
ko.applyBindings(new appViewModel());






















var where = {};
var select = '';
var select = function(attributes){
	var self = this;
	self.timestamp = ko.observable(attributes.timestamp);
	self.source_vn = ko.observable(attributes.source_vn);
	self.source_ip = ko.observable(attributes.source_ip);
	self.source_port = ko.observable(attributes.source_port);
	self.dirction_ingress = ko.observable(attributes.dirction_ingress);
	self.destination_vn = ko.observable(attributes.destination_vn);
	self.destination_ip = ko.observable(attributes.destination_ip);
	self.destination_port = ko.observable(attributes.destination_port);
	self.protocol = ko.observable(attributes.protocol);
	self.sum_bytes = ko.observable(attributes.sum_bytes);
	self.sum_packets = ko.observable(attributes.sum_packets);
};

var Instance = function(instance, self){
	self.timestamp = ko.observable(instance.timestamp);
	self.source_vn = ko.observable(instance.source_vn);
	self.source_ip = ko.observable(instance.source_ip);
	self.source_port = ko.observable(instance.source_port);
	self.dirction_ingress =ko.observable(instance.dirction_ingress);
	self.destination_vn = ko.observable(instance.destination_vn);
	self.destination_ip = ko.observable(instance.destination_ip);
	self.destination_port = ko.observable(instance.destination_port);
	self.protocol = ko.observable(instance.protocol);
	self.sum_bytes = ko.observable(instance.sum_bytes);
	self.sum_packets = ko.observable(instance.sum_packets);
};

