  var events = new(require("./features/database/events")),
      games = new(require("./features/database/games")),
      users = new(require("./features/database/users")),
      subscribe = new(require("./features/database/subscribe")),
      apiPreff = "/api";

  var router = {
      init: function init(app) {
          app.get(apiPreff + "/users", function(req, res) {
              users.getAll().then(function(data) {
                  res.status(200).send(data);
              });
          });
          app.get(apiPreff + "/users/:id", function(req, res) {
              users.getUserById(req.params.id).then(function(data) {
                  res.status(200).send(data);
              });
          });
          app.post(apiPreff + "/users", function(req, res) {
              users.addUser(req.body);
              res.status(200).end();
          });
          app.put(apiPreff + "/users/:id", function(req, res) {
              users.updateUser(Object.assign({}, req.body, req.params));
              res.status(200).end();
          });
          app.delete(apiPreff + "/users/:id", function(req, res) {
              users.deleteUser(req.params);
              res.status(200).end();
          });

          app.get(apiPreff + "/games/user/:user", function(req, res) {
              games.getByUser(req.params.user).then(function(data) {
                  res.status(200).send(data);
              });
          });
          app.get(apiPreff + "/games/event/:event", function(req, res) {
              games.getByEvent(req.params.event).then(function(data) {
                  res.status(200).send(data);
              });
          });
          app.post(apiPreff + "/games/event/:event", function(req, res) {
              games.addGame(Object.assign({}, req.body, req.params));
              res.status(200).end();
          });
          app.post(apiPreff + "/games/user/:user", function(req, res) {
              games.addGame(Object.assign({}, req.body, req.params));
              res.status(200).end();
          });
          app.post(apiPreff + "/games/:user/:event", function(req, res) {
              games.addGame(Object.assign({}, req.body, req.params));
              res.status(200).end();
          });
          app.put(apiPreff + "/games/:id", function(req, res) {
              games.updateGame(Object.assign({}, req.params, req.body));
              res.status(200).end();
          });
          app.delete(apiPreff + "/games/:id", function(req, res) {
              games.deleteById(req.params.id);
              res.status(200).end();
          });
          app.delete(apiPreff + "/games/user/:user", function(req, res) {
              games.deleteByUser(req.params.user);
              res.status(200).end();
          });
          app.delete(apiPreff + "/games/event/:event", function(req, res) {
              games.deleteByEvent(req.params.event);
              res.status(200).end();
          });

          app.post(apiPreff + "/subscribe/:user/:event", function(req, res) {
              subscribe.subscribe(req.params);
              res.status(200).end();
          });
          app.delete(apiPreff + "/unsubscribe/:user/:event", function(req, res) {
              subscribe.unsubscribe(req.params);
              res.status(200).end();
          });

          app.get(apiPreff + "/events", function(req, res) {
              events.getAll().then(function(data) {
                  res.status(200).send(data);
              });
          });
          app.get(apiPreff + "/events/:id", function(req, res) {
              events.getByEvent(req.params.id).then(function(data) {
                  res.status(200).send(data);
              });
          });
          app.put(apiPreff + "/events/:id/edit", function(req, res) {
            events.updateEvent(req.body);
            res.status(200).end();
          });
          app.post(apiPreff + "/event/add", function(req, res) {
              events.addEvent(Object.assign({}, req.body, req.params));
              res.status(200).end();
          });
          app.delete(apiPreff + "/events/event/:id", function(req, res) {
              console.log(req.params.id)
              events.deleteEventById(req.params.id);
              res.status(200).end();
          });
          app.get('*', function(req, res) {
              res.status(200).sendFile(path.resolve('frontend/app/index.html'));
          });

      }
  };

  module.exports = router;
