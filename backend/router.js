  var events = new(require("./features/database/events")),
      games = new(require("./features/database/games")),
      users = new(require("./features/database/users")),
      subscribe = new(require("./features/database/subscribe")),
      apiPreff = "/api";

var router = {
	init: function init(app) {
    app.get(apiPreff + "/users", function(req, res) {
        users.getAll().then(function(data) {
            res.send(data);
        });
    });
    app.get(apiPreff + "/users/:id", function(req, res) {
        users.getUserById().then(function(data) {
            res.send(data);
        });
    });
     app.post(apiPreff + "/users", function(req, res) {
         users.addUser().then(req.body);
         res.send(req.body);
    });
     app.put(apiPreff + "/users/:id", function(req, res) {
         users.updateUser(req.body);
         res.end();
        });
     app.delete(apiPreff + "/users/:id", function(req, res) {
         users.deleteUser(req.params);
         res.end();
        });
        
        
        
        
     app.get(apiPreff + "/games/user/:user", function(req, res) {
        games.getByUser(req.params.user).then(function(data) {
            res.send(data);
        });
    });
    app.get(apiPreff + "/games/event/:event", function(req, res) {
        games.getByEvent(req.params.event).then(function(data) {
            res.send(data);
        });
    });
    app.post(apiPreff + "/games/event/:event", function(req, res) {
        games.addGame(Object.assign({}, req.body, req.params));
        res.end();
    });
    app.post(apiPreff + "/games/user/:user", function(req, res) {
        games.addGame(Object.assign({}, req.body, req.params));
        res.end();
    });
    app.post(apiPreff + "/games/:user/:event", function(req, res) {
        games.addGame(Object.assign({}, req.body, req.params));
        res.end();
    });
    app.put(apiPreff + "/games/:id", function(req, res) {
        games.updateGame(Object.assign({}, req.params, req.body));
        res.end();
    });
    app.delete(apiPreff + "/games/:id", function(req, res) {
        games.deleteById(req.params.id);
        res.end();
    });
    app.delete(apiPreff + "/games/user/:user", function(req, res) {
        games.deleteByUser(req.params.user);
        res.end();
    });
    app.delete(apiPreff + "/games/event/:event", function(req, res) {
        games.deleteByEvent(req.params.event);
        res.end();
    });


    app.post(apiPreff + "/subscribe/:user/:event", function(req, res) {
        subscribe.subscribe(req.params);
        res.end();
    });
    app.delete(apiPreff + "/unsubscribe/:user/:event", function(req, res) {
        subscribe.unsubscribe(req.params);
        res.end();
    });



    app.get(apiPreff + "/events", function(req, res) {
        events.getAll().then(function(data) {
            res.send(data);
        });
    });
    app.get(apiPreff + "/events/:id", function(req, res) {
      console.log(req.params.id);
      events.getByEvent(req.params.id).then(function(data) {
          res.send(data);
      });
    });
    app.post(apiPreff + "/event/add", function(req, res)    {

    //  console.dir(req.params);
    //  res.writeHead(200, {'Content-Type': 'text/html'});
    //   events.addEvent(req.params)
    });


    app.get('*', function(req, res) {
        res.sendFile(path.resolve('frontend/app/index.html'));
    });
  }
};

  module.exports = router;
