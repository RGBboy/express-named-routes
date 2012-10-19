/*!
 * express-named-routes
 * Copyright(c) 2012 RGBboy <me@rgbboy.com>
 * MIT Licensed
 */

/**
 * Library version.
 */

exports.version = '0.0.2';

/**
 * Add named routes functionality to `app`.
 *
 * @param {express.HTTPServer} app
 * @api public
 */
exports.extend = function (app) {

  var namedRoutes = {},
      defineRoute,
      lookupRoute,
      routeToPath;

  /**
   * Define a route;
   *
   * @param {String} routeName (the name of the route)
   * @param {String|Object} route, can be a string or another namedRoutes object;
   * @return {Application} for chaining
   * @api public
   */
  defineRoute = function (routeName, route) {
    namedRoutes[routeName] = route;
    return app;
  };

  /**
   * Lookup a route;
   *
   * If routeName references an object of routes it will return routeName.index
   *
   * @param {String} routeName (optional)
   * @return {String|Object}
   * @api public
   */
  lookupRoute = function (routeName) {
    // If no argument, return namedRoutes object;
    if (!routeName) {
      return namedRoutes;
    };
    var route = resolve(namedRoutes, routeName);
    if(!route) {
      throw new Error('Route Does Not Exist');
    }
    return route;
  };

  /**
   * routeToPath Middleware
   *
   * adds the routeToPath method to the request object;
   *
   * @param {Object} req
   * @param {Object} res
   * @param {fn} next
   * @api public
   */
  routeToPath = function (req, res, next) {
    /**
     * routeToPath function
     *
     * takes a routeName and returns a resolved path using
     * the current request params. You can optionally pass
     * in an object to use to replace the route params. 
     *
     * @param {String} routeName
     * @param {Object} override (optional)
     * @return {String} path
     * @api public
     */
    req.routeToPath = function (routeName, override) {
      var path = lookupRoute(routeName),
          params = req.params,
          key;

      if ('object' === typeof path) {
        throw new Error('Route Is An Object')
      }

      if (override) {
        params = merge(params, override);
      };

      for (key in params) {
        path = path.replace('/:' + key, '/' + params[key]);
      };
      return path;
    };
    next();
  };

  app.defineRoute = defineRoute;
  app.lookupRoute = lookupRoute;
  app.use(routeToPath);

  return app; // for chaining;

};

/**
 * Merges one object into another and returns a new object
 *
 * @param {Object} obj1
 * @param {Object} obj2
 * @return {Object}
 * @api private
 */
function merge (obj1, obj2) {
  var target = {},
      i;
    for (i in obj1) {
      if (obj1.hasOwnProperty(i)) {
        target[i] = obj1[i];
      }
    }
    for (i in obj2) {
      if (obj2.hasOwnProperty(i)) {
        target[i] = obj2[i];
      }
    }
  return target;
}

/**
 * Resolves a nested property lookup
 *
 * @param {Object} obj
 * @param {String} string
 * @return {Object|String}
 * @api private
 */
function resolve (obj, string) {
  var resolution = obj,
      i;
  string = string.split('.');
  for (i = 0; i < string.length; i += 1) {
    resolution = resolution[string[i]];
    if (!resolution) {
      return;
    }
  }
  return resolution;
}