'use strict';

const express = require('express');
const request = require('request');

const app = express();
const port = process.env.PORT || 3001;
const facebookAppConfig = require('./facebookAppConfig');
const accessToken = facebookAppConfig.appId + '|' + facebookAppConfig.appSecret;
const baseUrl = 'https://graph.facebook.com';
const cacheExpirationTime = 60 * 60; // 3600s === 1h
const appConfig = require('./config.json');

let redisOptions;
let cache;

if (process.env.NODE_ENV === 'development') {
    redisOptions = {
        host: appConfig.development.redisHost,
        port: appConfig.development.redisPort
    };
} else {
    redisOptions = {
        host: appConfig.production.redisHost,
        port: appConfig.production.redisPort
    };
}

cache = require('express-redis-cache')(redisOptions);;

// allow request from everywhere
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

// build URL for the request to Facebook
app.get('/*', function (req, res, next) {
    // if url has already query params
    if (req.url.indexOf('?') > 0) {
        // add new param
        req.apiUrl = baseUrl + req.url + '&access_token=' + accessToken;
    } else {
        // append as query string
        req.apiUrl = baseUrl + req.url + '?access_token=' + accessToken;
    }
    next();
});

// use redis cache to minimize requests to Facebook
app.get('/*', cache.route({
    expire: cacheExpirationTime
}), function (req, res, next) {
    next();
});

// proxy all GET request to the Facebook Graph API
app.get('/*',
    function (req, res) {
        request.get(req.apiUrl, function (err, data) {
            if (err) {
                res.send({
                    error: 'couldn\'t load data from ' + baseUrl
                });
            } else {
                try {
                    res.send(JSON.parse(data.body));
                } catch (parseError) {
                    res.send(parseError);
                }
            }
        });
    }
);

// start server
app.listen(port, function (err) {
    console.log('app listen to port:', port, 'in', process.env.NODE_ENV, 'mode');
});

cache.on('error', function onRedisCacheError (error) {
    throw new Error(error.message);
});

// debug redis cache in development mode
if (process.env.NODE_ENV === 'development') {

    cache.on('message', function onRedisCacheMessage (message) {
        console.log('from redis cache:', message);
    });
}
