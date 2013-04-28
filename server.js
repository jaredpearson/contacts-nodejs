"use strict";

var http = require('http'),
    url = require('url'),
    querystring = require('querystring'),
    sys = require('sys'),
    ContactRepository = require('./contactRepository-memory').ContactRepository,
    Dispatcher = require('./dispatcher').Dispatcher,
    StaticResourceRoute = require('./staticResourceRoute').StaticResourceRoute;

//create a contacts repository to store all of the contacts
//since this an in memory implementation we can add some test data
var contactRepository = new ContactRepository({
    data: [
        {firstName: "Peter", lastName: "Parker", email: "peterparker@dailyglobe.com"}
    ]
});

//create a new dispatcher - this is used by the server to dispatch recieved
//requests out to routes
var dispatcher = new Dispatcher();

//create a new route for serving static files out of the 'public' directory
//this will be the default route, which is invoked by the dispatcher if 
//no other routes match first
dispatcher.defaultRoute = new StaticResourceRoute();

//Create the route for /services/Contact/{id}
dispatcher.addRoute({
    pathPattern: /^\/services\/Contact\/\d+?/,

    /**
     * Gets the single contact specified on the path
     */
    get: function(request, response) {
        var id = this.getIdFromPath(request);

        //find the contact and return it
        contactRepository.getContactById(id, function(event, contact){
            if(!contact) {
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(JSON.stringify(contact));
            } else {
                response.writeHead(404);
                response.end();
            }
        });
    },

    /**
     * Deletes the single contact specified on the path
     */
    delete: function(request, response) {
        var id = this.getIdFromPath(request);

        //find the contact and delete it
        contactRepository.removeContactById(id, function(event, found) {
            if(found) {
                response.writeHead(200);
                response.end();
            } else {
                response.writeHead(404);
                response.end();
            }
        });
    },

    getIdFromPath: function(request) {
        var requestUrl = url.parse(request.url, true);
        var path = requestUrl.pathname;
        return parseInt(path.substring(path.lastIndexOf('/') + 1));
    }
});

//Create the route for /services/Contact
dispatcher.addRoute({
    pathPattern: /^\/services\/Contact\/??/,

    /**
     * Displays a complete list of contacts
     */
    get: function(request, response) {
        contactRepository.getContacts(function(event, contacts) {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(contacts));
        });
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
            contactRepository.addContact(newContact, function(event, success){
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(JSON.stringify(newContact));
            });
            
        });
    }
});

// start the server with the dispatcher
var port = process.env.PORT || 8080;
http.createServer(function (request, response) {

    try {
        dispatcher.dispatch(request, response);
    } catch(err) {
        sys.puts(err);
        console.log(err);
        response.writeHead(500);
        response.end('Internal Server Error');
    }

}).listen(port, null, null, function() {
    console.log('Server started on port: ' + port);
});
console.log('Starting the server on port: ' + port);