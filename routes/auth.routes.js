const express = require("express");
const router = express.Router();

const User = require("../models/User.model");

const bcryptjs = require("bcryptjs");
const { default: mongoose } = require("mongoose");
const saltRounds = 10;

/* ======================
    SIGN UP
   ====================== */

router.get("/signup", (req, res) => {
  res.render("auth/signup.hbs");
});

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);

  //make sure everything is fill

  if (!username || !password) {
    res.render("auth/signup", { errorMessage: "All files are mandatory." });
    return;
  }

  //make sure password is strong
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res.status(500).render("auth/signup", {
      errorMessage:
        "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  //make sure username has a number
  // if (!username.match(/\d/)) {
  //   res.render("auth/signup", {
  //     errorMessage: "Username must have at least one number.",
  //   });
  //   return;
  // }

  try {
    const salt = await bcryptjs.genSalt(saltRounds);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const userFromDb = await User.create({
      username,
      password: hashedPassword,
    });
    console.log(userFromDb);
    res.redirect("/");
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(500).render("auth/signup", { errorMessage: error.message });
    } else if (error.code === 11000) {
      res.status(500).render("auth/signup", {
        errorMessage:
          "Username is being in used. Please choose a different one.",
      });
    } else {
      next(error);
    }
  }
});

/* ======================
    LOGIN
   ====================== */

router.get("/login", (req, res) => res.render("auth/login"));

router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.render("auth/login", { errorMessage: "All files are mandatory." });
    return;
  }

  try {
    const findUser = await User.findOne({ username });

    if (!findUser) {
      res.render("auth/login", { errorMessage: "Username doesn't exist." });
      return;
    } else if (bcryptjs.compareSync(password, findUser.password)) {
      res.render("users/user-profile", { findUser });
    } else {
      res.render("auth/login", { errorMessage: "Incorrect password." });
    }
  } catch (error) {
    next(error);
  }
});

/* ======================
    USER PROFILE
   ====================== */

router.get("/userProfile", (req, res) => res.render("users/user-profile"));
module.exports = router;
