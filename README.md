# Filo-Proxy

Is a proxy service for [filo.js](https://github.com/BerlinPix/filo) to transfer incoming requests to the Facebook Graph API using a cache.

## Can I have my own copy?

Go for it! Download or fork the repository and feel free to make any changes you want. You could host your own proxy on your web server.

**I strongly recommend to change the access control to allow just those requests from sites you want to**

```
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});
```

## Your'e using a cache?

Yes I'm using a redis cache which expires after one hour. Doing that I can reduce the amount of requests going to Facebook. Otherwise it could be that Facebook is disabling my app for one day.
 
## What do I have to do?

- Install nodejs (If you not have already done so)
- Install all npm modules using "npm install"
- [Create an app on Facebook ](https://developers.facebook.com/docs/apps/register)
- rename facebookAppConfigExample.json to facebookAppConfig.json 
- put in your app ID and your app secret
- [OPTIONAL] install [redis cache](http://redis.io/) and [start the server](http://redis.io/topics/quickstart) using the redis.conf inside this project
- run the script using "node index"

That's all.

## I got an error "Error: Redis connection to ..."

Yup. Your redis server isn't running. Pleas read [this guide](http://redis.io/topics/quickstart) or just comment out the part of redis in index.js if you don't want to use it.

```
app.get('/*', cache.route({
    expire: cacheExpirationTime
}), function (req, res, next) {
    next();
});
```

## Why?

I always wanted filo.js to be simple as possible for all users, so that everybody could use it even without any knowledge about programming. 

I started with [FQL](https://developers.facebook.com/docs/reference/fql/) to grab all the data from the "public" Facebook pages but since Facebook decided to drop that API I updated filo.js with the [Graph API](https://developers.facebook.com/docs/graph-api).
 
This API expects always an [access token](https://developers.facebook.com/docs/facebook-login/access-tokens/) to identify who that person is who makes the request and if you are allowed to do so.

To get a token you have to be a logged in user or you can use your credentials of your created app. A login doesn't make sense for filo.js because you just want to see the pictures of someone's website, even if you don't have a Facebook account.

So it has to be the app. But I don't want to share my app secret with the whole world without any control who is using **my** token. Additionally Facebook is limiting the amount of requests per hour so I reached that limit very fast and filo.js wasn't working anymore.

That's why I decided to provide a service instead where my app credentials will be still secret and where I could use a cache to minimize to amount of requests.
