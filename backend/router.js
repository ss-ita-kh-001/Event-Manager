  var path = require('path');
  var events = new(require("./features/database/events"));
  var games = new(require("./features/database/games"));
  var users = new(require("./features/database/users"));
  var subscribe = new(require("./features/database/subscribe"));
  var auth = new(require("./features/database/auth"));
  var config = require("./features/database/config");
  var apiPreff = "/api";

  /*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
  function ensureAuthenticated(req, res, next) {
      if (!req.header('Authorization')) {
          return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
      }
      var token = req.header('Authorization').split(' ')[1];

      var payload = null;
      try {
          payload = jwt.decode(token, config.TOKEN_SECRET);
      } catch (err) {
          return res.status(401).send({ message: err.message });
      }

      if (payload.exp <= moment().unix()) {
          return res.status(401).send({ message: 'Token has expired' });
      }
      req.user = payload.sub;
      next();
  }

  var router = {
      init: function init(app) {
          app.post(apiPreff + "/login", function(req, res) {
              console.log('req.body.email', req.body.email);
              users.getUserByEmail(req.body.email).then(function(data) {
                  var token = auth.login(data, req.body);
                  if (token) {
                      res.status(200).send(token);
                  } else {
                      res.status(401).send('Incorrect data!');
                  }
              }).catch(function(error) {
                  res.status(500).send(error);
                  console.log(error);
              });
          });
          app.get(apiPreff + "/users", function(req, res) {
              users.getAll().then(function(data) {
                  res.status(200).send(data);
              }).catch(function(error) {
                  res.status(500).send(error);
                  console.log(error);
              });
          });
          app.get(apiPreff + "/profile/:id", function(req, res) {
              users.getUserById(req.params.id).then(function(data) {
                  res.status(200).send(data);
              }).catch(function(error) {
                  res.status(500).send(error);
              });
          });
          app.post(apiPreff + "/users", function(req, res) {
              users.addUser(req.body).then(function() {
                  users.getLastId().then(function(data) {
                      res.status(200).send(data);
                  }).catch(function(error) {
                      res.status(500).send(error);
                  });
              }).catch(function(error) {
                  res.status(500).send(error);
              });

          });
          app.put(apiPreff + "/profile/:id", function(req, res) {
              users.updateUser(Object.assign({}, req.body, req.params)).then(function() {
                  res.status(200).end();
              }).catch(function(error) {
                  res.status(500).send(error);
              });
          });
          app.delete(apiPreff + "/profile/:id", function(req, res) {
              users.deleteUser(req.params).then(function() {
                  res.status(200).end();
              }).catch(function(error) {
                  res.status(500).send(error);
              });
          });

          app.get(apiPreff + "/games/user/:user", function(req, res) {
              games.getByUser(req.params.user).then(function(data) {
                  res.status(200).send(data);
              }).catch(function(error) {
                  res.status(500).send(error);
              });
          });
          app.get(apiPreff + "/games/event/:event", function(req, res) {
              games.getByEvent(req.params.event).then(function(data) {
                  res.status(200).send(data);
              }).catch(function(error) {
                  res.status(500).send(error);
              });
          });
          app.post(apiPreff + "/games/event/:event", function(req, res) {
              games.addGame(Object.assign({}, req.body, req.params)).then(function() {
                  games.getLastId().then(function(data) {
                      res.status(200).send(data);
                  }).catch(function(error) {
                      res.status(500).send(error);
                  });
              }).catch(function(error) {
                  res.status(500).send(error);
              });
          });
          app.post(apiPreff + "/games/user/:user", function(req, res) {
              games.addGame(Object.assign({}, req.body, req.params)).then(function() {
                  games.getLastId().then(function(data) {
                      res.status(200).send(data);
                  }).catch(function(error) {
                      res.status(500).send(error);
                  });
              }).catch(function(error) {
                  res.status(500).send(error);
              });
          });
          app.post(apiPreff + "/games/:user/:event", function(req, res) {
              games.addGame(Object.assign({}, req.body, req.params)).then(function() {
                  games.getLastId().then(function(data) {
                      res.status(200).send(data);
                  }).catch(function(error) {
                      res.status(500).send(error);
                  });
              }).catch(function(error) {
                  res.status(500).send(error);
              });
          });
          app.put(apiPreff + "/games/:id", function(req, res) {
              games.updateGame(Object.assign({}, req.params, req.body)).then(function() {
                  res.status(200).end();
              }).catch(function(error) {
                  res.status(500).send(error);
              });
          });
          app.delete(apiPreff + "/games/:id", function(req, res) {
              games.deleteById(req.params.id).then(function() {
                  res.status(200).end();
              }).catch(function(error) {
                  res.status(500).send(error);
              });
          });
          app.delete(apiPreff + "/games/user/:user", function(req, res) {
              games.deleteByUser(req.params.user).then(function() {
                  res.status(200).end();
              }).catch(function(error) {
                  res.status(500).send(error);
              });
          });
          app.delete(apiPreff + "/games/event/:event", function(req, res) {
              games.deleteByEvent(req.params.event).then(function() {
                  res.status(200).end();
              }).catch(function(error) {
                  res.status(500).send(error);
              });
          });

          app.post(apiPreff + "/subscribe/:user/:event", function(req, res) {
              subscribe.subscribe(req.params).then(function() {
                  res.status(200).end();
              }).catch(function(error) {
                  res.status(500).send(error);
              });
          });
          app.delete(apiPreff + "/unsubscribe/:user/:event", function(req, res) {
              subscribe.unsubscribe(req.params).then(function() {
                  res.status(200).end();
              }).catch(function(error) {
                  res.status(500).send(error);
              });
          });
          app.get(apiPreff + "/events", function(req, res) {
              events.getAll().then(function(data) {
                  res.status(200).send(data);
              }).catch(function(error) {
                  res.status(500).send(error);
              });
          });
          app.get(apiPreff + "/events/:id", function(req, res) {
              events.getByEvent(req.params.id).then(function(data) {
                  res.status(200).send(data);
              }).catch(function(error) {
                  res.status(500).send(error);
              })
          });
          app.put(apiPreff + "/events/:id/", function(req, res) {
              events.updateEvent(Object.assign({}, req.body, req.params)).then(function() {
                  res.status(200).end();
              }).catch(function(error) {
                  res.status(500).send(error);
              });
          });
          app.post(apiPreff + "/events", function(req, res) {
              events.addEvent(Object.assign({}, req.body, req.params)).then(function() {
                  events.getLastId().then(function(data) {
                      res.status(200).send(data);
                  }).catch(function(error) {
                      res.status(500).send(error);
                  });

              }).catch(function(error) {
                  res.status(500).send(error);
              });
          });
          app.delete(apiPreff + "/events/:id", function(req, res) {
              events.deleteEventById(req.params.id).then(function() {
                  res.status(200).end();
              }).catch(function(error) {
                  res.status(500).send(error);
              });
          });
          app.get('*', function(req, res) {
              res.status(200).sendFile(path.resolve('frontend/app/index.html'));
          });
      }
  };
  module.exports = router;
