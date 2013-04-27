"use strict";

var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    querystring = require('querystring'),
    sys = require('sys'),
    contacts = require('./contacts'),
    dispatcher = require('./dispatcher');

var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"};

var staticResourceRoute = {
    get: function(req, res) {
        var uri = url.parse(req.url).pathname;
        if(uri === '/') {
            res.writeHead(404);
            res.end();
            return;
        }
        var filename = path.join(process.cwd(), uri);
        path.exists(filename, function(exists) {
            if(!exists) {
                console.log("not exists: " + filename);
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.write('404 Not Found\n');
                res.end();
                return;
            }
            var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
            res.writeHead(200, {'Content-Type': mimeType});
            var fileStream = fs.createReadStream(filename);
            fileStream.pipe(res);
        });
    }
}
dispatcher.defaultRoute = staticResourceRoute;

var contactResourceRoute = {
    pathPattern: /^\/services\/Contact\/\d+?/,

    /**
     * Gets the single contact specified on the path
     */
    get: function(request, response) {
        var id = this.getIdFromPath(request);

        //find the contact and return it
        var contact = contacts.getContactById(id);
        if(!contact) {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(contact));
        } else {
            response.writeHead(404);
            response.end();
        }
    },

    /**
     * Deletes the single contact specified on the path
     */
    delete: function(request, response) {
        var id = this.getIdFromPath(request);

        //find the contact and delete it
        var found = contacts.removeContactById(id);
        if(found) {
            response.writeHead(200);
            response.end();
        } else {
            response.writeHead(404);
            response.end();
        }
    },

    getIdFromPath: function(request) {
        var requestUrl = url.parse(request.url, true);
        var path = requestUrl.pathname;
        return parseInt(path.substring(path.lastIndexOf('/') + 1));
    }
};
dispatcher.addRoute(contactResourceRoute);

var allContactResourceRoute = {
    pathPattern: /^\/services\/Contact\/??/,

    /**
     * Displays a complete list of contacts
     */
    get: function(request, response) {
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify(contacts.getContacts()));
    }, 

    /**
     * Creates a new 
     */
    post: function(request, response) {
        
        //get all of the data specified within the request body
        var bodyarr = [];
        request.on('data', function(chunk){
            bodyarr.push(chunk);
        });
        request.on('end', function(){
            var data = querystring.parse(bodyarr.join(''));
            
            var firstName = ('firstName' in data)? data.firstName : null;
            var lastName = ('lastName' in data)? data.lastName : null;
            var email = ('email' in data)? data.email : null;
            
            var newContact = {
                    firstName: firstName, 
                    lastName: lastName,
                    email: email
                };
            contacts.addContact(newContact);
            
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(newContact));
        });
    }
};
dispatcher.addRoute(allContactResourceRoute);

// start the server with the dispatcher
var port = process.env.PORT || 8080;
http.createServer(function (request, response) {

    try {
        dispatcher.dispatch(request, response);
    } catch(err) {
        sys.puts(err);
        response.writeHead(500);
        response.end('Internal Server Error');
    }

}).listen(port, null, null, function() {
    console.log('Server started on port: ' + port);
});
console.log('Starting the server on port: ' + port);