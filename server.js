"use strict";

var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    querystring = require('querystring');

var nextContactId = 1;
var contacts = [];

//test fill the data
contacts = [{id: nextContactId++, firstName: "Jared", lastName: "Pearson", email: "jared.pearson@salesforce.com"}];

function getContactById(id) {
    for(var index = 0; index < contacts.length; index++) {
        if(contacts[index].id === id) {
            return contacts[index];
        }
    }
    return null;
}
function removeContactById(id) {
    var foundIndex = -1;
    for(var index = 0; index < contacts.length; index++) {
        if(contacts[index].id === id) {
            foundIndex = index;
            break;
        }
    }
    
    if(foundIndex > -1) {
        contacts.splice(foundIndex, 1);
        return true;
    }
    return false;
}

var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"};
function serveStaticFile(req, res) {
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

http.createServer(function (request, response) {
    
    var requestUrl = url.parse(request.url, true);
    var pathParts = requestUrl.pathname.substring(1).split('/');
    if(pathParts.length >= 2 && pathParts[0] === "services")
    {
        if(pathParts[1] === "Contact") {
            if(pathParts.length > 2) {
                var id = parseInt(pathParts[2], 10);
                if(id != pathParts[2]) {
                    response.writeHead(400);
                    response.end('Invalid ID');
                }
                
                if(request.method == 'GET') {
                    var contact = getContactById(id);
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.end(JSON.stringify(contact));
                    
                } else if (request.method == 'DELETE') {
                    var found = removeContactById(id);
                    if(found) {
                        response.writeHead(200);
                        response.end();
                    } else {
                        response.writeHead(404);
                        response.end();
                    }
                    
                } else {
                    response.writeHead(400);
                    response.end();
                }
                
            } else {
                if(request.method == 'GET') {
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.end(JSON.stringify(contacts));
                    
                } else if(request.method == 'POST') {
                    
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
                                id: nextContactId++,
                                firstName: firstName, 
                                lastName: lastName,
                                email: email
                            };
                        contacts.push(newContact);
                        
                        response.writeHead(200, {'Content-Type': 'application/json'});
                        response.end(JSON.stringify(newContact));
                    });
                    
                    
                } else {
                    response.writeHead(400);
                    response.end();
                }
            }
        } else {
            response.writeHead(400);
            response.end();
        }
        
    } else {
        serveStaticFile(request, response);
    }
    
}).listen(process.env.PORT);