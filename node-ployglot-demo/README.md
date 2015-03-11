# E-Commerce Application using Node.js and Polyglot Persistence

This application is a simple e-commerce example using MongoDB to store the product catalog, 
Redis to store Session data, Riak for a shopping cart, and Cassandra to keep some statistics about page visits.


## Deploy to Cloud Foundry

First ensure you have a running [Brooklyn Service Broker](https://github.com/cloudfoundry-community/brooklyn-service-broker)
and you have installed the [Brooklyn Plugin](https://github.com/cloudfoundry-community/brooklyn-plugin)

To deploy simply

    $ cf brooklyn push 

## Running

After the application is deployed, for convenience, store the endpoint that cloud foundry provides in a variable

    export APP_HOST = ...

set up cassandra keyspace.

    curl -X POST $APP_HOST/keyspace

set up cassandra table.

    curl -X POST $APP_HOST/tables
  
Then add some product information

    curl -H "Content-Type: application/json" -d '{ "name": "product A", "description" : "The best Product A in the world!"}' $APP_HOST/additem -X POST
