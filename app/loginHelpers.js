var request = require('request');
var User = require('./models/user_model');
var Queue = require('./models/queue_model');
var Config = require('../secret');
var Q = require('q');

module.exports = {
  validateUser: function (code, sessionId) {
    var d = Q.defer();

    var addSession = function (user) {
      User.addSession(user.username, sessionId)
        .then(function (user) {
          d.resolve(user);
        })
        .fail(function (err) {
          console.log("there was an error");
          d.reject("There was a failure at the database: " + err);
        });
    };


    console.log(code);
    /*request.post({
      url: 'https://oauth.io/auth/access_token',
      form: {
        code: code,
        key: Config.data.oauth.public,
        secret: Config.data.oauth.secret
      }
    }, function (err, req, body) {
      if (err) {
        d.reject("Oauth Error; ", err);
        return;
      }
      var data = JSON.parse(body);
      if (!data.state) {
        d.reject("Got error: " + body);
        return;
      }
      if (data.state !== sessionId) {
        d.reject("Oups, state does not match !");
        return;
      }
*/
      //Fetch username from facebook
      request.get({
        url: "https://graph.facebook.com/me?access_token=" + code
      }, function (err, req, body) {
        if (err) {
          console.log("Facebook Error: ", err);
          d.reject(err);
        }
        var fbUser = JSON.parse(body);
        User.getUser({username: fbUser.username})
          //The user exists in the DB
          .then(function (user) {
            addSession(user);
          })
          //the user does not exist, create it
          .fail(function (err) {
            User.findOrCreate(fbUser)
              .then(function (user) {
                addSession(user);
              })
              .fail(function (err) {
                d.reject(err);
              });
          });
      });
    //});

    return d.promise;
  },

  validateSession: function (username, sessionId) {
    var d = Q.defer();
    console.log(username);
    console.log(sessionId);

    User.getSession(username)
      .then(function (validSessionId) {
        if (validSessionId && validSessionId === sessionId) {
          d.resolve(true);
        } else {
          d.reject("not logged in");
        }
      })
      .fail(function (err) {
        d.reject(err);
      });

    return d.promise;
  },

  closeSession: function (username) {
    var d = Q.defer();

    if (!username) {
      d.reject("No username passed");
    } else {
      User.closeSession({username: username})
        .then(function () {
          d.resolve(true);
        })
        .fail(function (err) {
          d.reject(err);
        });
    }

    return d.promise;
  },

  isAuthorized: function (shareId, sessionId) {
    var d = Q.defer();

    Queue.getQueue(shareId)
      .then(function (queue) {
        if (queue.isPrivate) {
          return module.exports.validateSession(queue.username, sessionId);
        }
        return true;
      })
      .then(function () {
        d.resolve(true);
      })
      .fail(function (err) {
        d.reject(err);
      });

    return d.promise;
  }

};
