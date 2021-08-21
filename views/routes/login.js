
const express = require("express");
const mysql = require("mysql2");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const axios = require('axios').default;
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const cookieParser = require("cookie-parser");
var moment = require('moment');
const multer = require('multer');
const upload = multer({
  dest: 'public/uploads/'
});
const { verifyUser } = require("../middlewares/verifyUser");
const router = express.Router();
require('dotenv').config();

router.use(cookieParser());

// router.set('view engine', 'ejs');
router.use(bodyParser.urlencoded({
  extended: true
}));
router.use(express.static("public"));

const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER_DB,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
// generate access token
const generateAccessToken = (username) => {
  return jwt.sign(username, process.env.TOKEN_SECRET, {
    expiresIn: "1800s",
  });
};

router.get("/", function (req, res) {
  res.render("login");
})

router.post("/", function (req, res) {
  var username = req.body.username;
  var password = md5(req.body.password);

  pool.getConnection(function (err, conn) {
    if (err) {
      console.log(err);
      // console.log("DB Connection unsuccessful");
      // console.log(process.env.USER_DB);
      // console.log(process.env.HOST);
    } else {
      // console.log("DB Connection Successful");
      // console.log(process.env.USER_DB);
      // console.log(process.env.HOST);

      //check credentials in database
      conn.query("SELECT * FROM identities WHERE username=?", username, function (err, rows) {
        //console.log(rows);
        if (rows.length > 0) {

          if (rows[0].password === password) {
            // console.log("User Found");
            const user_id1 = rows[0].id;
            //generate token
            const token = generateAccessToken({ username, user_id1 });
            res.cookie("jwt", token, {
              expires: new Date(Date.now() + 1000 * 60 * 60),
              httpOnly: true
            });
            //console.log(token);
            res.redirect("/preview");
          } else {
            console.log("incorrect password");
            res.redirect("/");
          }
        } else {
          console.log("User Not found");
          res.redirect("/");
        }
      })
      pool.releaseConnection(conn);
    }
  })
});


module.exports = router;
