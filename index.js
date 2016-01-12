var express = require('express');
var app = require('express')();
app.use(express.static(__dirname + '/public'));
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var assert = require('assert');

var exec = require('child_process').exec;
exec("start cmd /k mongod --dbpath=c:/data/db");

var mongo = require('mongodb'),
  Server = mongo.Server,
  Db = mongo.Db;
var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('iotproject', server);

var server = app.listen(3001, function () {
  console.log('Listening on port 3001');
});


var http = require('http').Server(app);
var io = require('socket.io').listen(server);


io.on('connection', function(socket){
   console.log("connected!!");
   db.open(function(err, db) {
    if(!err) {
        var collection = db.collection("data");
        collection.find().toArray(function(err, docs) {
          socket.emit("schedule", docs);
          db.close();
        });    
    }
  });   
});

app.get('/', function (req, res) {
  /*db.open(function(err, db) {
    if(!err) {
        var collection = db.collection("data");
        collection.find().toArray(function(err, docs) {
          res.json(docs);
          db.close();
        });    
    }
  });*/
  res.sendfile('index.html');
});

app.post('/', function (req, res) {
  db.open(function(err, db) {
    if(!err) {
        var collection = db.collection("data");
        collection.insertOne(req.body, function(err, result) {
          assert.equal(err, null);
          db.close();
          io.emit("newData", req.body);
          var status = {status:1};
          res.json(status);
        }); 
    }
  });
  
});

