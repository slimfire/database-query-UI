var mongoose = require('mongoose');
var schema = mongoose.Schema;

mongoose.connect('mongodb://heroku_wc4867g7:kbldciqhv7qfopg4bkok3uf5nv@ds021000.mlab.com:21000/heroku_wc4867g7');

var trafficSchema = new schema({
	timestamp: Number,
	source_vn : String,
	source_ip : String,
	source_port : Number,
	dirction_ingress : Number,
	destination_vn : String,
	destination_ip : String,
	destination_port : Number,
	protocol : Number,
	sum_bytes : Number,
	sum_packets : Number
}, {collection : 'traffic'});

var trafficModel = mongoose.model('traffic', trafficSchema);

module.exports = trafficModel;