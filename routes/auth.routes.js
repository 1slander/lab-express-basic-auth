const express = require("express");
const router = express.Router();

const User = require("../models/User.model");

const bcryptjs = require("bcryptjs");
const saltRounds = 10;

router.get("/signup", (req, res) => {
  res.render("auth/signup.hbs");
});

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
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
    console.log(error);
  }
});
module.exports = router;
