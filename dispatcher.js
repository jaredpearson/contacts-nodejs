"use strict";

var url = require('url'),
    utils = require('./utils');

var dispatcher = {
    routes: [],
    dispatch: function(request, response) {
        var requestUrl = url.parse(request.url, true);
        var path = requestUrl.pathname;

        var mappedRoute = this.getRouteForPath(path);
        if(!mappedRoute) {
            console.log('Selecting default route since no route matched');
            mappedRoute = this.defaultRoute;
        }
        this.executeRoute(mappedRoute, request, response);
    },
    getRouteForPath: function(path) {
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
    },
    executeRoute: function(route, request, response) {
        var method = request.method.toLowerCase();
        if(method in route) {
            route[method](request, response);
        } else {
            response.writeHead(405);
            response.end();
        }
    },
    addRoute: function(route) {
        this.routes.push(route);
    }
};

module.exports = dispatcher;
