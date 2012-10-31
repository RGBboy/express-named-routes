/**
 * Module dependencies.
 */

var express = require('express'),
    should = require('should'),
    request = require('supertest'),
    namedRoutes = require('../');

describe('Named Routes', function () {

  var app,
      routeName,
      route,
      nestedRouteName,
      nestedRoute,
      paramRouteName,
      paramRouteBase,
      paramRoute;

  beforeEach(function (done) {
    app = express();
    routeName = 'routeName';
    route = '/route';
    nestedRouteName = 'nestedRouteName';
    nestedRoute = {
      index: '/nested-route',
      show: '/nested-route/show'
    };
    paramRouteName = 'paramRouteName';
    paramRouteBase = '/param-route';
    paramRoute = paramRouteBase + '/:param';

    namedRoutes.extend(app);

    app.defineRoute(routeName, route);
    app.defineRoute(nestedRouteName, nestedRoute);
    app.defineRoute(paramRouteName, paramRoute);

    done();
  });

  describe('.version', function () {

    it('should match the format x.x.x', function (done) {
      namedRoutes.version.should.match(/^\d+\.\d+\.\d+$/);
      done();
    });

  });

  describe('app.defineRoute', function () {

    it('should return the app', function (done) {
      var testApp = app.defineRoute('routeName', '/routeName');
      testApp.should.equal(app);
      done();
    });

  });

  describe('app.lookupRoute', function () {

    it('should return the base route object if no params are passed', function (done) {
      var testRoutes = app.lookupRoute();
      testRoutes[routeName].should.equal(route)
      testRoutes[nestedRouteName].should.equal(nestedRoute)
      testRoutes[paramRouteName].should.equal(paramRoute)
      done();
    });

    it('should return the correct route', function (done) {
      app.lookupRoute(routeName).should.equal(route);
      done();
    });

    it('should return the route object if route is an object', function (done) {
      app.lookupRoute(nestedRouteName).should.equal(nestedRoute);
      done();
    });

    it('should return a nested route', function (done) {
      app.lookupRoute(nestedRouteName + '.index').should.equal(nestedRoute.index);
      app.lookupRoute(nestedRouteName + '.show').should.equal(nestedRoute.show);
      done();
    });

  });

  describe('request.routeToPath', function () {

    it('should return a path if it exists', function (done) {

      app.get(route, function(req, res, next) {
        res.send(req.routeToPath(routeName));
      })

      request(app)
        .get(route)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.text.should.equal(route);
          done();
        });
    });

    it('should throw if route is an object', function (done) {

      app.get(nestedRoute.index, function(req, res, next) {
        (function(){req.routeToPath(nestedRouteName)}).should.throw();
        done();
      })

      request(app)
        .get(nestedRoute.index)
        .end();
    });

    it('should throw if route does not exist', function (done) {

      app.get(nestedRoute.index, function(req, res, next) {
        (function(){req.routeToPath('undefinedRoute')}).should.throw();
        done();
      })

      request(app)
        .get(nestedRoute.index)
        .end();
    });

    it('should return a nested route path', function (done) {

      app.get(nestedRoute.show, function(req, res, next) {
        res.send(req.routeToPath(nestedRouteName + '.show'));
      })

      request(app)
        .get(nestedRoute.show)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.text.should.equal(nestedRoute.show);
          done();
        });
    });

    it('should return a path with params matching request.params', function (done) {

      app.get(paramRoute, function(req, res, next) {
        res.send(req.routeToPath(paramRouteName));
      })

      request(app)
        .get(paramRouteBase + '/1')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.text.should.equal(paramRouteBase + '/1');
          done();
        });
    });

    it('should return a path with params matching override', function (done) {

      app.get(paramRoute, function(req, res, next) {
        res.send(req.routeToPath(paramRouteName, { param: '2' }));
      });

      request(app)
        .get(paramRouteBase + '/1')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.text.should.equal(paramRouteBase + '/2');
          done();
        });
    });

    describe('is mounted', function () {

      var app2,
          mountedRouteName,
          mountedRoute;

      beforeEach(function (done) {
        app2 = express();
        mountedRouteName = 'mountedRoute';
        mountedRoute = '/mounted-route';
        namedRoutes.extend(app2);
        app2.defineRoute(mountedRouteName, mountedRoute);
        app.use('/mounted-application', app2);
        done();
      });

      it('should return a mounted route path', function (done) {
        app2.get(mountedRoute, function(req, res, next) {
          res.send(req.routeToPath(mountedRouteName));
        });
        request(app)
          .get('/mounted-application' + mountedRoute)
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            res.text.should.equal(mountedRoute);
            done();
          });
      });

      it('should return a parent route path', function (done) {
        app2.get(mountedRoute, function(req, res, next) {
          res.send(req.routeToPath(routeName));
        });
        request(app)
          .get('/mounted-application' + mountedRoute)
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            res.text.should.equal(route);
            done();
          });
      });

    });

  });

});