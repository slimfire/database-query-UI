## Overview
This is a simple web app that queries data from a MongoDB database. The main components are a Node.js server, a Knockout.js and Backbone.js app.

## Usage
Please enter a select statement and a where clause and click on Query to fetch data. 
The where clause builder, located above the Clear and Query button, can take a maximum of four attributes and can be cleared to when full. It displays the attributes the uses has added a range of values on and is about to execute.

Below is a simple snippet of result for a query whose selected attributes are timestamp, source_vn, dirction_ingress, destination_vn, destination_port, sum_bytes and sum_packets and a where clause, dirction_ingress = 1 and SumOfBytes: below 50,000kb 

<h1 align="center">
  <br>
  <a href="http://juniper-yohannes.herokuapp.com"><img src="https://raw.githubusercontent.com/slimfire/personal-website/master/junper2.png" alt="Juniper Networks Exercise"></a>
  <br>
</h1>
## Dependencies
- [Node.js](http://nodejs.org)
- [npm](http://npmjs.org)

## Setup
To install, run:

```bash
$ npm install
```

## Running app
```bash
$ node server.js
```
- [live demo](http://juniper-yohannes.herokuapp.com)