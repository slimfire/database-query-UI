'use strict';
const server = require('express')();
const model = require('./models/model');
const serveStatic = require('serve-static');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const errorHandler = require('errorhandler');
const util = require('./controller/util');

server.use(serveStatic(path.join(__dirname, '/public')));
server.use(methodOverride());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: false}));

server.post('/api/traffic', function(req, res){
	console.log(req.body);
	//store request params
	var select = req.body.select;
	var where = req.body.where;

	//build select statement
	var queryStatement = '';
	for (var i = 0; i < select.length; i++) {
		queryStatement += select[i] + ' ';
	};

	//remove Empty Fields
	where = util.removeEmptyFields(where);
	console.log("after :: ", where)

	//run query
	var query = model.find(where, {_id:0})
	query.select(queryStatement);
	query.exec(function(err, data){
		console.log('Responded with traffic data !');
		res.json(data);
	});
});

server.get('/api/init', function(req, res){
	var attributes = Object.keys(model.schema.paths);
	attributes = attributes.slice(0,11);
	console.log(attributes)
	res.json(attributes);
});

server.get('*', function(req, res){
	res.sendFile(path.join(__dirname, '/public/index.html'));
});

server.listen(process.env.PORT || 3000, function () {
	console.log('Server running on port 3000 . . . ');
});