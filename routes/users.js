var express = require("express");
var router = express.Router();
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const res = require("express/lib/response");
const saltRounds = 10;
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/signup", function (req, res, next) {
    res.render("signup");
  });
router.get("/login", function (req, res, next){
res.render("login");
});

router.post("/signup", function (req, res, next) {
    console.log("hit", req.body);
    if (!req.body.username || !req.body.password) {
        res.render("signup", { message: "Username and password requiered"})
    }

User.findOne({ username: req.body.username })
.then((foundUser) => {
    console.log("Found user", foundUser);
    if (foundUser) {
        res.render("signup", { message: "username is taken"})
    } else {
    const salt = bcrypt.genSaltSync(saltRounds);
    console.log("SALT", salt);

    const hashedPass = bcrypt.hashSync(req.body.password, salt);
    console.log("hashedPass", hashedPass);

    User.create({
     username: req.body.username,
     password: hashedPass,
     })
      .then((createdUser) => {
        res.redirect("/users/signup");
     })
      .catch((err) => {
    console.log("error creating user".err.message)
        });
        }
    })
});

router.post("/login", (req, res) => {
    if (!req.body.username || !req.body.password) {
        req.render("login", { message: "Username and password requiered"})
    }

    User.findOne({ username: req.body.username })
    .then((foundUser) => {
    if (!foundUser) {
    res.render("login", {message: "Username not found"});
} else {
    let correctPassword = bcrypt.compareSync(
    req.body.password,
    foundUser.password
 );
 if (correctPassword) {
     req.session.user = foundUser;
     res.json(req.session);
 } else {
     res.render("login", { message: "Incorrect password"})
 }
}
 })
 .catch((error) => {
     console.log("Login failed", error.message);
 });
});

router.get("/test-login", (req, res) => {
    if (req.session.user) {
        res.json(req.session);
    } else {
        res.status(402).json("You are not logged in");
    }
});

router.get("/logout", (req, res) => {
    req.session.destroy();
    res.json("You have logout");
});

//itiration 3
//GET secret
router.get("/secret", isLoggedIn,  (req, res, next) => {
    //1.Check to see if you are logged in
    res.render("secret");
  });
  
  
  //GET logout
  router.get("/logout", (req, res, next) => {
    req.session.destroy();
    res.render("index", { info: "You have logged out" });
  });


module.exports = router;