var redis = require('redis'); 
var express = require('express');
var app = express();
var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); 

if(process.env.VCAP_SERVICES){
  var env = JSON.parse(process.env.VCAP_SERVICES);
  var credentials = env.redis[0].credentials;
  var brooklynAppKey = Object.keys(credentials)[0];
  var redisCredentials = {
    "host": credentials[brooklynAppKey]["host.name"],
    "port": credentials[brooklynAppKey]["redis.port"]
  }
}
else{
  var redisCredentials = {
    "host":"localhost",
    "port":6379,
    "password":"",
  }
}

var port = process.env.VCAP_APP_PORT || 3000;
client = redis.createClient(redisCredentials.port, redisCredentials.host, {});

client.on('error', function (err) {
  console.log('Error ' + err);
});

app.get('/', function(req, res){
  client.hgetall("todos", function(err, replies) {
    var html = '';
    html += '<p>Items:</p>';

    html += '<ul>';
    for (var key in replies) {
        if (replies.hasOwnProperty(key)){
          html += '<li>' + replies[key] + '</li>';
        }
    }
    html += '</ul>';

    html += '<form method="POST">';
    html += '<table>';
    html += '<tr>';
    html += '<td>Description:</td>';
    html += '<td><input type="text" name="description"></td>';
    html += '</tr>';
    html += '</table>';
    html += '<input type="submit" value="Submit" />';
    res.send(html);
  });
});

app.post('/', function(req, res){
  var id = Math.random().toString(36).substring(7);
  client.hset("todos", id, req.body.description, redis.print);
  res.redirect('/')
});

var server = app.listen(port, function(){
  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
});
