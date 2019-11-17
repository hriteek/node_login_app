const express = require("express");
const expressLayout = require("express-ejs-layouts");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const app = express();

const PORT = process.env.PORT || 5000;

// passport config
require("./config/passport")(passport);

// DB config
const db = require("./config/keys").MongoURI;

// Middleware
// Ejs
app.use(expressLayout);
app.set("view engine", "ejs");

// bodyParser
app.use(express.urlencoded({ extended: false }));

// express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// connect flash
app.use(flash());

// Global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// MongoDB connection
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }, () =>
  console.log("MongoDB connected")
);

// Routes
app.use("/", require("./router/index"));
app.use("/users", require("./router/user"));

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
