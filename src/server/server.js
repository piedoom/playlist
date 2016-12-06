var http = require("http");
var fs = require("fs");
var url = require('url');
var striptags = require('striptags');
var giphy = require('giphy-api')();

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

            // do everything inside of our query to tumblr
            tclient.blogPosts(query.blog, {type: 'text', limit: 20}, function(err, resp) {

                // if we get a null response, respond with a 404 error
                if (resp == null){
                    response.writeHead(404, {"Content-Type": "application/json"});
                    response.write(JSON.stringify({status: 404}));
                    response.end();
                    return;
                }

                // otherwise, give a JSON response
                response.writeHead(200, {"Content-Type": "application/json"});

                // assign resp.posts to "data" for convience.
                data = resp.posts; // use them for something

                // our finalData array will contain all the posts we want after they have been filtered
                var finalData = [];

                // add those posts to a new array and rid them of non-original posts
                for (var i = 0; i < data.length; i++){
                    post = data[i];

                    if (typeof(post.trail[0]) !== 'undefined' && post.trail.length == 1){
                        if (post.trail[0].blog.name == query.blog){
                            post.body = striptags(post.body);
                            finalData.push(post);
                        }
                    }
                }

                response.write(JSON.stringify(finalData));
                response.end();
            });
            break;
        case((/^\/gif\?post\=[.]*/).test(request.url)):
            // get our post data
            var post = url.parse(request.url, true).query.post;
            var words = post.split(" ");
            var images = [];
            for (var i = 0; i < words.length; i++){
                word = words[i];

                // how do i not make this async
                giphy.search({q: word, limit: 1}, function(err, res) {
                    images.push({word: word, order: i, image: res.data[0].images.fixed_height.url});

                    if (images.length == words.length){
                        response.write(JSON.stringify(images));
                        response.end();
                    }
                });
            }
            break;
    }
    
};

http.createServer(onRequest).listen(port);
console.log("Listening on localhost:" + port);

