const express = require("express");
const router = express.Router();
const userSch = require("../Models/User");
const passport = require("passport");
const bcrypt = require("bcryptjs");
router.get("/", (req, res) => {
  res.send("Hello World");
});

router.get("/login", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));

// Register Handle
router.post("/register", async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill all the fields" });
  }

  // check passwords match
  if (password != password2) {
    errors.push({ msg: "Password do not match" });
  }

  // check password length
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 character" });
  }

  if (errors.length > 0) {
    res.render("register", { errors, name, email, password, password2 });
  } else {
    // validation passed
    const user = await userSch.findOne({ email });
    if (user) {
      // user exists
      errors.push({ msg: "Email already exists" });
      res.render("register", { errors, name, email, password, password2 });
    } else {
      const newUser = new userSch({ name, email, password });

      // Hash password

      bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(newUser.password, salt, async (err, hash) => {
          if (err) throw err;
          // Set password to hashed
          newUser.password = hash;
          // save the user
          const data = await newUser.save();
          if (data) {
            req.flash("success_msg", "You are now registered and can log in ");
            res.redirect("/users/login");
          }
        })
      );
    }
  }
});

// Login handle
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

// Logout handler
router.get("/logout", (req, res) => {
  req.logOut();
  req.flash("success_msg", "You are logged out successfully!!");
  res.redirect("/users/login");
});

module.exports = router;
