"use strict";

var url = require('url'),
	fs = require('fs'),
    path = require('path');

var StaticResourceRoute = function(options){
    options = options || {};

    this.directory = options.directory || 'public';
    this.directoryIndex = options.directoryIndex || 'index.html';

    //maps a file extension to a mimetype
    //configure a set of default mimetypes
    this.mimeTypes = {
        "html": "text/html",
        "jpeg": "image/jpeg",
        "jpg": "image/jpeg",
        "png": "image/png",
        "js": "text/javascript",
        "css": "text/css"
    };
}

StaticResourceRoute.prototype.get = function(req, res) {
    var mimeTypes = this.mimeTypes;
    var uri = url.parse(req.url).pathname;

    //if the user requests a directory, then we want to use the directory index
    if(uri.substring(uri.length - 1) === '/') {
        uri += this.directoryIndex;
    }

    //serve files only out of the specified directory
    var filename = path.join(process.cwd(), this.directory, uri);
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

exports.StaticResourceRoute = StaticResourceRoute;