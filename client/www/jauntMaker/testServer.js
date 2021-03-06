var express = require('express');
var fs = require('fs');
var url = require('url');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser());
var yelp = require("yelp").createClient({
	consumer_key: 'REPLACE WITH PROPER KEY', 
	consumer_secret: 'REPLACE WITH PROPER KEY',
	token: 'REPLACE WITH PROPER KEY',
	token_secret: 'REPLACE WITH PROPER KEY'
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/style.css', function (req, res) {
  res.sendFile(__dirname + '/style.css');
});

app.get('/testScript.js', function (req, res) {
  res.sendFile(__dirname + '/testScript.js');
});

app.get('/getJaunts', function (req, res) {
	fs.readFile('jaunts.txt', 'utf8', function (err, data) {
	  if (err){
	  	throw err;
	  }else{
	  	var dataArr = [];
	  	var index = 0;
	  	var lastIndex;
	  	while(data.indexOf('***END', index) >= 0){
	  		lastIndex = index;
	  		index = data.indexOf('***END', index);
	  		var subData = data.substring(lastIndex, index);
	  		subData = JSON.parse(subData);
	  		dataArr.push(subData);
	  		// there are 18 characters in '***END OF JAUNT***'
	  		index += 18;
	  	}
	  	res.send(dataArr);
	  }
	});
});

//POST request handler to call YELP API
app.post('/getYelpData', function(req, res){
	// var latLng = '"'+req.body.latitude+','+req.body.longitude+'"';
	var latLng = req.body.latitude+','+req.body.longitude;
	// console.log(latLng);
	var latitude = req.body.latitude;
	var longitude = req.body.longitude;
	//radius of 500 feet = 152.4 meters
	yelp.search({
		ll: latLng,
		radius_filter: "152.4",
		limit: "5"
	},function(error, data){
		if(error){
			console.log(error);
		}else{
			var businesses = data.businesses;
			var outputObj = {};
			businesses.map(function(item, index, collection){
				outputObj[item.name] = item;
			});
			res.send(outputObj);
		}
	});
});

app.post('/saveJaunt', function(req, res){
	var body = "";
	body += JSON.stringify(req.body);
	body += '***END OF JAUNT***';
	fs.appendFile('jaunts.txt', body, function(err){
			if(err){
				console.log(err);
			}else{
				console.log('file written');
			}
		});
});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});