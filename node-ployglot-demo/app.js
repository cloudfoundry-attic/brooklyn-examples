// setup express
var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
var cookieParser = require('cookie-parser');
app.use(cookieParser());
if(process.env.VCAP_SERVICES){
  var env = JSON.parse(process.env.VCAP_SERVICES);
  
  // redis
  var credentials = env.redis[0].credentials;
  var brooklynAppKey = Object.keys(credentials)[0];
  var redisCredentials = {
    "host": credentials[brooklynAppKey]["host.name"],
    "port": credentials[brooklynAppKey]["redis.port"]
  }
  // cassandra
  credentials = env.cassandra[0].credentials;
  var clusterAppKey = Object.keys(credentials)[0];
  var clusterNodes = credentials[clusterAppKey]["cassandra.cluster.nodes"];
  var nodes = [];
  for (var i = 0; i < clusterNodes.length; i++){
	  var split = clusterNodes[i].split(":");
	  nodes.push(split[0]);
  }
  // mongo
  credentials = env.mongodb[0].credentials;
  brooklynAppKey = Object.keys(credentials)[0];
  var mongoUri = "mongodb://"+credentials[brooklynAppKey]["host.name"] + ":" +credentials[brooklynAppKey]["mongo.server.port"];
  
  // riak
  credentials = env.riak[0].credentials;
  clusterAppKey = Object.keys(credentials)[0];
  var children = credentials[clusterAppKey].children;
  var firstChildKey = Object.keys(children)[0];
  var riakHost = children[firstChildKey]["host.name"];
  var riakPort = children[firstChildKey]["riak.webPort"];
}
else{
  // redis	
  var redisCredentials = {
    "host":"localhost",
    "port":6379
  }
  // cassandra
  var nodes = [localhost];
  // mongo
  var mongoUri = 'mongodb://localhost:27017';
  // riak
  var riakHost = "localhost";
  var riakPort = 8098;
}

// setup redis 
// we use redis as the session store
var RedisStore = require('connect-redis')(session);
app.use(session({
  store: new RedisStore(redisCredentials),  
  secret: '123456789QWERTY'
}));

// setup MongoDB and schema
// we use MongoDB as the product store
var mongoose = require('mongoose');
mongoose.connect(mongoUri + '/products');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectID;

var Item = new Schema({
  name: {type: String, required: true, trim: true},
  description: {type: String, required: true, trim: true}
});

var ProductCatalog = mongoose.model('Item', Item);

// setup connection to Riak
// we use Riak as the shopping cart
var riak = require('nodiak').getClient('http', riakHost, riakPort);
riak.ping(function(err, response) {
    console.log("RIAK: " + response);
});

// setup connection to Cassandra
// we use cassandra to count the page visits
var cassandra = require('cassandra-driver');
var cassandraClient = new cassandra.Client({ 
  contactPoints : nodes
});
cassandraClient.connect(function(err, result) {
    if(err){
      console.log(err);
    }else{
      console.log('Cassandra: OK');
    }
});

var increment = "UPDATE counter.page_view_counts SET counter_value = counter_value + 1 WHERE page_name = ";

function loggingCallback(error, result){
  if(error) {
    console.log(error);
  }else{
    console.log(result);
  }
}

// Create Routes

// shows all the products in the catalog
app.get('/', function(req, res){
  cassandraClient.execute(increment + "'home'", loggingCallback);
  ProductCatalog.find().lean().exec(function(error, data){
	res.write("<h1>Catalog</h1>");
	res.write("<p>Logged in as: <b>"+ req.session.username +"</b></p>");
    if(error){
      console.log(error);
    } else if (data == null){
      res.write('<p>Empty catalog</p>');
    } else {
		res.write("<table style='width:50%; text-align:left'>");
		res.write("<tr><th>Name</th><th>Description</th><th>&nbsp;</th></tr>");
		for (var i = 0; i < data.length; i++){
			res.write("<tr><td>" + data[i].name + "</td><td>" + data[i].description + "</td><td><a href='"+ data[i].name + "'>add to cart</a></td></tr>");
		}
		res.write("</table>");
    }

	res.write("<p><a href='cart'>view cart</a></p>");
	res.write("<p>Switch user: <a href='login/Alice'>Alice</a> | <a href='login/Bob'>Bob</a></p>");
	res.end("<hr /><p><a href='counts'>statistics</a></p>")
  });
});

// shows all the products that have been added to the cart
app.get('/cart', function(req, res){
	riak.bucket('carts').objects.get(req.session.username, function(error, obj) {
		res.write("<h1>Cart for: " + req.session.username + "</h1>");
		if(error || obj == null)
			res.write('No items in cart.');
	    else{
			var counts = {};
			for (var i = 0; i < obj.data.items.length; i++)
			    counts[obj.data.items[i]] = (counts[obj.data.items[i]] + 1) || 1;
			
			for(var key in counts){
				res.write("<p>"+counts[key] + " x " + key +"</p>");
			}
		}

		res.end("<p><a href='/'>back to catalog</a></p>");
	});
});

// logs in the user
app.get('/login/:name', function(req, res){
  req.session.username = req.params.name;
  res.redirect('/');
});

// shows all of the page views
app.get('/counts', function(req, res){
  res.write("<h1>Page Visits</h1>");
  cassandraClient.execute('SELECT * FROM counter.page_view_counts', function(err, result) {
    if (err) {
      res.end('<p>No counts found.</p>');
    } else {
		for (var i = 0; i < result.rows.length; i++) {
	        res.write("<p>"+result.rows[i].page_name+ ": " + result.rows[i].counter_value.low + " hits</p>"); 
		} 

		res.end("<p><a href='/'>back to catalog</a></p>");     
    }
  });
});

// page of a particular product
app.get('/:name', function(req, res){
  ProductCatalog.findOne({ name: req.params.name}, 
    function(error, item){
      if(error){
        console.log(error);
      } else if (item == null){
        res.end('Item not found!');
      } else {
		  cassandraClient.execute(increment +"'"+item.name+"'", loggingCallback);

		  riak.bucket('carts').objects.get(req.session.username, function(error, obj) {
			if(obj == null){
				obj = riak.bucket('carts').objects.new(req.session.username, { items: [item.name] });
			}else{
				obj.data.items.push(item.name);
			}
			riak.bucket('carts').objects.save(obj, function(error, obj){
				console.log(obj);
			});
		  });
        res.write("<p>" + item.name + " added to cart</p>");
		res.end("<p><a href='/'>back to catalog</a></p>");
      }
  });
});

// adds a product to the catalog
app.post('/additem', function(req, res){
  var item = new ProductCatalog(req.body);
  item.save(function(error, data){
    if(error){
      res.json(error);
    }else{
      res.json(data);
    }
  });
});

// sets up the cassandra keyspace
app.post('/keyspace', function(req, res) {
    cassandraClient.execute("CREATE KEYSPACE counter WITH replication " + 
                   "= {'class' : 'SimpleStrategy', 'replication_factor' : 3};",
    function(error, data){
   			if(error) return res.json(error);
   			return res.json(data);            	
   	});
});

// sets up the cassandra tables
app.post('/tables', function(req, res) {
    cassandraClient.execute('CREATE TABLE counter.page_view_counts (' +
		'page_name varchar PRIMARY KEY,' + 
		'counter_value counter' + ');', function(error, data){
			if(error) return res.json(error);
			return res.json(data);            	
	});
});

app.listen(process.env.VCAP_APP_PORT || 3000);
