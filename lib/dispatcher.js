"use strict";

var url = require('url'),
    utils = require('./utils');

var Dispatcher = function(options) {
    options = options || {};
    this.routes = [];
    this.defaultRoute = options.defaultRoute || null;
}

Dispatcher.prototype.dispatch = function(request, response) {
    var requestUrl = url.parse(request.url, true);
    var path = requestUrl.pathname;

    var mappedRoute = this.getRouteForPath(path);
    if(!mappedRoute) {
        console.log('Selecting default route since no route matched');

        if(this.defaultRoute) {
            mappedRoute = this.defaultRoute;
        } else {
            console.log('No default route found; sending a 404');
            response.writeHead(404);
            response.end();
        }
    }
    this.executeRoute(mappedRoute, request, response);
}

Dispatcher.prototype.getRouteForPath = function(path) {
    console.log('Attempting to find route for path: ' + path);
    return utils.find(this.routes, function(route) {
        console.log('Checking route: ' + JSON.stringify(route));

        console.log('Checking path against route.path: ' + route.path);
        if(route.path && route.path === path) {
            return true;
        }

        console.log('Checking path against route.pathPattern: ' + route.pathPattern);
        if(route.pathPattern && route.pathPattern.test(path)) {
            return true;
        }

        console.log('Route does not match');
    });
}

Dispatcher.prototype.executeRoute = function(route, request, response) {
    var method = request.method.toLowerCase();
    if(method in route) {
        route[method](request, response);
    } else {
        response.writeHead(405);
        response.end();
    }
}

Dispatcher.prototype.addRoute = function(route) {
    this.routes.push(route);
}

exports.Dispatcher = Dispatcher;
