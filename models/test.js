'use strict';
var model = require('./model');
var faker = require('faker');

const source_vn = 'project2:virtual-network2';
var instance = new model({
	timestamp : faker.date.past().getTime(),
	source_vn : 'project2:virtual-network2',
	source_ip : '10.1.1.3',
	source_port : 41322,
	dirction_ingress : Math.round(Math.random()),
	destination_vn : 'project1:virtual-network1',
	destination_ip : '10.2.1.3',
	destination_port : 9117,
	protocol : 6,
	sum_bytes : Math.round(Math.random(0,1)* 100000),
	sum_packets : Math.round(Math.random(0,1)* 100000)
});

instance.save(function(err, data) {
	console.log(err, data)
});