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


var QueryView = Backbone.View.extend({
	template : _.template($('#query-template').html()),
	render : function(){
	    $('#query-container').html(this.template());
	    return this;
	},
	initialize : function(){
		this.render();
	}
});

var Router = Backbone.Router.extend({
	routes : {
	"" : "queryRoute"
	},
	queryRoute : function(){
		var queryView = new QueryView();
		queryView.render();
	}
});


var UIRouter = new Router();

Backbone.history.start();