
const express = require("express");
const mysql = require("mysql2");
const ejs = require("ejs");
const router = express.Router();
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

const generateAccessToken = (username) => {
  return jwt.sign(username, process.env.TOKEN_SECRET, {
    expiresIn: "1800s",
  });
};

router.get("/", verifyUser, function (req, res) {
  let arr = [];
  pool.getConnection(function (err, conn) {
    if (err) {
      console.log(err);
    } else {
      //get id for permitted views only and store in arr
      conn.query("SELECT permitted_id FROM permission WHERE user_id=?", req.user.user_id1, function (err, rows) {
        if (err) {
          console.log(err);
        } else {
          rows.forEach(function (row) {
            arr.push(row.permitted_id);
          // arr=[3,4,5,8]
          })
          res.render("preview", {
            arr: arr
            
          });
          console.log("Arr", arr)

        }
      })
    }
  })
})


router.post("/", verifyUser, function (req, res) {
  preview_type = req.body.preview_type;
  //redirect to the form corresponding to the preview type selected
  app.set("preview_type", preview_type);
  switch (preview_type) {
     case "1":
     res.redirect("/form");
      break;
     case "2":
     res.redirect("/preview-form2");
      break;
    case "3":
      res.redirect("/preview-form3");
      break;
    case "4":
      res.redirect("/preview-form4");
      break;
    case "5":
      res.redirect("/preview-form5");
      break;
    case "6":
      res.redirect("/preview-form6");
      break;
    case "7":
      res.redirect("/preview-form7");
      break;
    case "8":
      res.redirect("/preview-form3_2");
      break;
    default:
      res.redirect("/preview");

  }


})

module.exports = router;
