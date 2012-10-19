# express-named-routes

  Route storage, lookup and conversion to usable paths.

  [![Build Status](https://secure.travis-ci.org/RGBboy/express-named-routes.png)](http://travis-ci.org/RGBboy/express-named-routes)

## Installation

  Works with Express 3.0.x

    $ npm install express-named-routes

## Usage

  Simply invoke the `extend()` method on an Express server to add this functionality.

```javascript
var app = require('express')(),
    namedRoutes = require('express-named-routes');

namedRoutes.extend(app);
```

## Defining and Looking Up Routes

  Routes can be defined via `app.defineRoute(routeName, routeDefinition)`:

```javascript

app.defineRoute('signin', '/signin');
```

  Routes can be retrieved via `app.lookupRoute(routeName)`:

```javascript

app.lookupRoute('signin'); // returns '/signin'
```

  You may also pass in an object containing nested routes:

```javascript

app.defineRoute('resource', {
  index: '/resource',
  show: '/resource/:param',
  edit: '/resource/:param/edit'
});
```

  Looking up a route that points to an object containing multiple routes will return the
  route object:

```javascript

app.lookupRoute('resource'); // returns { index: '/resource', show: '/resource/:param', edit: '/resource/:param/edit' }
```

  To lookup nested routes use the `.` notation:

```javascript

app.lookupRoute('resource.index'); // returns '/resource';
app.lookupRoute('resource.show'); // returns '/resource/:param';
app.lookupRoute('resource.edit'); // returns '/resource/:param/edit;
```

## Converting routes to usable paths (URLS)

  A helper function is added to your request object to convert a route to a usable path.
  You can use this via `req.routeToPath(routeName)`.

```javascript

app.defineRoute('signin', '/signin');

app.get('/some/other/route', function (req, res, next) {
  var linkToSignin = req.routeToPath('signin'); // '/signin'
  next();
});
```

  If the route contains params, these will be replaced by the params
  for current route. You may optionally override these by passing in an
  object containing the param name as a key and a value to override with:

```javascript

app.defineRoute('resource', '/resource/:resourceId');

app.get(app.lookupRoute('resource'), function (req, res, next) {
  var resourceId = req.params.resourceId;
  var currentResourcePath = req.routeToPath('resource'); // e.g. '/resource/1'
  var nextResourcePath = req.routeToPath('resource', { resourceId: resourceId + 1}); // e.g. '/resource/2'
  next();
});
```

## To Do

  * Returned route objects should be read-only
  * Add ability to declare nested routes:

```javascript

app.defineRoute('resource.show', '/resource/:resourceId');
```

## License 

(The MIT License)

Copyright (c) 2012 RGBboy &lt;me@rgbboy.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.