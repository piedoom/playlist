var http = require("http");
var fs = require("fs");

// get our API keys
var keys = require("../../secret.json");

var port = process.env.PORT || 3000;

// start our tumblr client
var tumblr = require('tumblr.js');
var tclient = tumblr.createClient(keys.tumblr);

var onRequest = function(request, response){
    console.log(request.url);
    
    
};

http.createServer(onRequest).listen(port);
console.log("Listening on localhost:" + port);

