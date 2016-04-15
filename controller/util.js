const model = require('../models/model');

var Util = function(){}
Util.prototype.removeEmptyFields = function(where){
    for (var i in where) {
        if ((i == 'undefined') || (where[i] === '') || (where[i] == null) || (where[i] == {})) {
            delete where[i];
        } else if (typeof where[i] === 'object') {
            Util.prototype.removeEmptyFields(where[i]);
        }
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