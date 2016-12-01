var http = require("http");
var fs = require("fs");
var url = require('url');

// get our API keys
var keys = require("../../secret.json");

var port = process.env.PORT || 3000;

// start our tumblr client
var tumblr = require('tumblr.js');
var tclient = tumblr.createClient(keys.tumblr);

// get our index page (this is a SPA so no need to load it separately)
var index = fs.readFileSync(__dirname + "/../client/index.html");

var onRequest = function(request, response){

    // get our routes
    switch(true){
        case ("/" == (request.url)):
            console.log(request.url);
            
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(index);
            response.end();
            break;
        case ((/^\/blog\?blog\=[.]*/).test(request.url)):
            // get the querystring
            var query = url.parse(request.url, true).query;
            tclient.blogPosts(query.blog, {type: 'photo'}, function(err, resp) {
                if (resp == null){
                    response.writeHead(404, {"Content-Type": "application/json"});
                    response.write(JSON.stringify({status: 404}));
                    response.end();
                    return;
                }

                response.writeHead(200, {"Content-Type": "application/json"});
                data = resp.posts; // use them for something
                response.write(JSON.stringify(data));
                response.end();
            });
            break;
    }
    
};

http.createServer(onRequest).listen(port);
console.log("Listening on localhost:" + port);

