const model = require('../models/model');

var Util = function(){}
Util.prototype.removeEmptyFields = function(where){
	if(!where.dirction_ingress.$gte)
	{
		delete where.dirction_ingress.$gte;
	}
	if(!where.dirction_ingress.$lte)
	{
		delete where.dirction_ingress.$lte;
	}
	if(!where.timestamp.$gte)
	{
		delete where.timestamp.$gte;
	}
	if(!where.timestamp.$lte)
	{
		delete where.timestamp.$lte;
	}
	if(!where.sum_bytes.$gte)
	{
		delete where.sum_bytes.$gte;
	}
	if(!where.sum_bytes.$lte)
	{
		delete where.sum_bytes.$lte;
	}
	if(!where.sum_packets.$gte)
	{
		delete where.sum_packets.$gte;
	}
	if(!where.sum_packets.$lte)
	{
		delete where.sum_packets.$lte;
	}
	if(Object.keys(where.timestamp).length == 0)
	{
		delete where.timestamp;
	}
	if(Object.keys(where.dirction_ingress).length == 0)
	{
		delete where.dirction_ingress;
	}
	if(Object.keys(where.sum_bytes).length == 0)
	{
		delete where.sum_bytes;
	}
	if(Object.keys(where.sum_packets).length == 0)
	{
		delete where.sum_packets;
	}
	return where;
}

Util.prototype.getMinAndMaxTime = function(callback){
	model.findOne({$query : {}, $orderby: {timestamp : -1}}, function(err, earliestInstance){
		model.findOne({$query : {}, $orderby: {timestamp : 1}}, function(err, latestInstance){
			callback({
				min : earliestInstance.timestamp,
				max : latestInstance.timestamp
			});
		});
	})
}

module.exports = new Util();