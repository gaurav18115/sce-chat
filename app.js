var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");
const uuid = require("uuid/v4");
const FileStore = require("session-file-store")(session);
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const axios = require("axios");

// configure passport to use the local strategy
passport.use(
  new LocalStrategy(
    { usernameField: "username" },
    (username, password, done) => {
      axios
        .get(`http://localhost:5000/users?username=${username}`)
        .then(res => {
          const user = res.data[0];
          if (!user) {
            return done(null, false, { message: "Invalid credentials.\n" });
          }
          if (password != user.password) {
            return done(null, false, { message: "Invalid credentials.\n" });
          }
          return done(null, user);
        })
        .catch(error => done(error));
    }
  )
);

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  axios
    .get(`http://localhost:5000/users/${id}`)
    .then(res => done(null, res.data))
    .catch(error => done(error, false));
});

var app = express();

// create session using uuid

app.use(
  session({
    genid: req => {
      return uuid(); // use UUIDs for session IDs
    },
    store: new FileStore(),
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/**
 *  HOME
 */
app.get("/", function(req, res, next) {
  res.redirect("/authrequired");
});

/**
 *  AUTH
 */

app.get("/login", function(req, res, next) {
  res.render("login", { title: "SocketChatExpress", uuid: req.sessionID });
});

app.post("/login", function(req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (info) {
      return res.send(info.message);
    }
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }

    req.login(user, err => {
      if (err) {
        return next(err);
      }
      return res.redirect("/authrequired");
    });
  })(req, res, next);
});

app.get("/authrequired", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/chat");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

/**
 *  CHAT
 */

app.get("/chat", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("chat", { username: req.user.username });
  } else {
    res.redirect("/login");
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
