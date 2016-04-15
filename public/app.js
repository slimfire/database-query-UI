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
	self.whereAttribute = ko.observable('');
	self.firstOp = ko.observable('');
	self.secondOp = ko.observable('');
	self.thirdOp = ko.observable('');
	var currentIndex = 0;

	//init
	getTimeRange();
	console.log(self.attributes())
	init(function(attributes){
		for (var i = 0; i < attributes.length; i++) {
			attributes[i] = ko.observable(attributes[i]);
		};
		self.attributes(attributes);
	});

	var mapOpCode = function(opCode){
		if(opCode == 'AND')
			return '$and';
		if(opCode == 'OR')
			return '$or';
	}

	self.queryResponseHandler = function(elements){
		var form = $("#bookForm").serializeArray();

		//remove template 
		form.pop();
		form.pop();
		form.pop();
		form.pop();

		//process data
		var where = [{}, {}, {}, {}];
		var formIndex = 0;
		for (var i = 0; i < form.length/4; i++) {
			where[i]['attribute'] = form[formIndex+0].value;
			where[i]['minimum'] = form[formIndex+1].value;
			where[i]['maximum'] = form[formIndex+2].value;
			where[i]['opCode'] = form[formIndex+3].value;
			if(where[i].attribute == 'timestamp')
			{
				if(where[i].minimum != '')
				{
					where[i].minimum = new Date(where[i].minimum).getTime();
				}
				if(where[i].maximum != '')
				{
					where[i].maximum = new Date(where[i].maximum).getTime();
				}
			}
			formIndex += 4
		};



		var mapBound = function(bound){
			if(bound == 'maximum')
				return '$lte';
			if(bound == 'minimum')
				return '$gte';
			else
				return undefined;
		}

		var convertMinMaxSymbols = function(where){
			var query = [];
			for (var i = 0; i < where.length; i++) {
				query.push({});
				query[i][where[i].attribute] = {};
				query[i][where[i].attribute][mapBound('maximum')] = where[i].maximum;
				query[i][where[i].attribute][mapBound('minimum')] = where[i].minimum;
			};
			return query;
		}

		var buildMongoDBWhereClause = function(where){
			var bounds = convertMinMaxSymbols(where);

			//build MongoDB where clause
			var mongoWhere = {};
			var firstOpCode = mapOpCode(where[0].opCode) || '$or';
			var middleOpCode = mapOpCode(where[1].opCode) || '$and';
			var thirdOpCode = mapOpCode(where[2].opCode) || '$or';
			mongoWhere[middleOpCode] = [];

			var firstHalf = {};
			firstHalf[firstOpCode] = [{}, {}];
			firstHalf[firstOpCode][0] = bounds[0];
			firstHalf[firstOpCode][1] = bounds[1];

			var secondHalf = {};
			secondHalf[thirdOpCode] = [{}, {}];
			secondHalf[thirdOpCode][0] = bounds[2];
			secondHalf[thirdOpCode][1] = bounds[3];

			mongoWhere[middleOpCode].push(firstHalf);
			mongoWhere[middleOpCode].push(secondHalf);
			// console.log(mongoWhere)

			return mongoWhere;
		}

		var params = {
			select : self.selectedItems(),
			where : buildMongoDBWhereClause(where)
		};

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
}

ko.applyBindings(new appViewModel());