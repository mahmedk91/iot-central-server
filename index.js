var express = require('express');
var app = require('express')();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var exec = require('child_process').exec;
//exec("start cmd /k mongod --dbpath=c:/data/db");

var rest = require('restler');

var server = app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

var http = require('http').Server(app);
var io = require('socket.io').listen(server);

var url = 'mongodb://root:root@ds033734.mongolab.com:33734/iot-project';

io.on('connection', function(socket){
   console.log("connected!!");
   MongoClient.connect(url, function(err, db) {
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
  res.sendfile('index.html');
});

app.post('/', function (req, res) {
  var data = req.body;
  MongoClient.connect(url, function(err, db) {
    if(!err) {
      var buses = db.collection("buses");
      var stops = db.collection("stops");
      var route = db.collection("route");
      var dataCollection = db.collection("data");
      //console.log(data);
      rest.get("http://api.openweathermap.org/data/2.5/weather?lat="+data.lat+"&lon="+data.long+"&appid=ac595deec802a928a67876607c0bdf6d").on('complete', function(weather) {
        buses.find({"tag":parseInt(data.uid)}).toArray(function(err, docs){
          data.bus=docs[0].bus;
          data.class=docs[0].class;
          data.weather=weather.weather[0].main;
          if (docs[0].class=="red-line") {
            data.nextAvgSpeed=60;
          } else if (docs[0].class=="blue-line") {
            data.nextAvgSpeed=50;
          }
          if(weather.weather[0].main.indexOf("Rain") != -1){
            data.nextAvgSpeed=30;
          }
          if (weather.weather[0].main.indexOf("Snow") != -1 || weather.weather[0].main.indexOf("Fog") != -1) {
            data.nextAvgSpeed=20;
          }
          stops.find({"sensor": data.sensorid}).toArray(function(err, docs1){
            data.currentStop=docs1[0].stop;
            var startLat=docs1[0].lat;
            var startLong=docs1[0].long;
            route.find({"bus":data.bus, "start": data.currentStop}).toArray(function(err, docs2){
              data.nextStop=docs2[0].stop;
              stops.find({"stop": data.nextStop}).toArray(function(err, docs3){
                var stopLat=docs3[0].lat;
                var stopLong=docs3[0].long;
                rest.get("https://maps.googleapis.com/maps/api/directions/json?origin="+startLat+","+startLong+"&destination="+stopLat+","+stopLong+"&key=AIzaSyCAiuF4LPhSwYLdeUfJ_y5t57IaNueADW4").on('complete', function(directions) {
                  var distance=0;
                  for(var i=0;i<directions.routes[0].legs.length;i++){
                    distance = distance + directions.routes[0].legs[i].distance.value;
                  }
                  data.distance = distance/1000 + " kms";
                  data.expectedTime = ((distance/1000)/data.nextAvgSpeed) * 60 + " mins";
                  dataCollection.insertOne(data, function(err, result) {
                    assert.equal(err, null);
                    db.close();
                    io.emit("newData", data);
                    var status = {status:1};
                    res.json(status);
                  });
                });
              });
            });
          });
        });
      });
    }
  });

});
