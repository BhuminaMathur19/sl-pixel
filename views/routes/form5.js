const express = require("express");
const mysql = require("mysql2");
var jsdom = require('jsdom');
$ = require('jquery')(new jsdom.JSDOM().window);
const ejs = require("ejs");
// const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const axios = require('axios').default;
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const cookieParser = require("cookie-parser");
const moment = require('moment');
const aws = require('aws-sdk');
const multer = require('multer');
//aws credentials
const multerS3 = require('multer-s3');
aws.config.update({
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  accessKeyId: process.env.ACCESS_KEY_ID,
  region: "ap-south-1"
});
const s3 = new aws.S3();

//storing data on aws-s3

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'speedlabs',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.fieldname
      });
    },
    key: function (req, file, cb) {
      cb(null, "pixels/" + Date.now().toString())
    }
  })
})

//require verifyUser function

const {
  verifyUser
} = require("../middlewares/verifyUser");
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

var flag = 1; // 1 for wrong key
var image = " "; // stores image url of the generated image
var date; // stored date at which the image is created
const KEY = "12345678"; //for authentication in form
var count = 0; // helping variable to change the value of flag
var flag_n = 0; //if 0 then on refresh redirect to preview page

//generate access token

const generateAccessToken = (username) => {
  return jwt.sign(username, process.env.TOKEN_SECRET, {
    expiresIn: "1800s",
  });
};

router.get("/", verifyUser, function (req, res) {
  var preview_type = app.get("preview_type");
  if (!preview_type && flag_n === 0) {
    res.redirect("/preview");
  } else {
    if (flag_n === 1) {
      flag_n = 0;
    }
    if (flag === 0 && count === 1) {
      flag = 1;
      count = 0;
    } else if (flag === 0 && count === 0) {
      count++;
    }
    res.render("form5", {
      url: image,
      date: date,
      flag: flag, // if key is wrong, flag is raised
    });
    image = " ";
  }

});

// const singleUpload = upload.single("img")

router.post("/", verifyUser, upload.single("img"), function (req, res) {
  var key = "12345678";
  var url_image = req.body.url;
  var image_type = req.body.image_type;
  var h_logo = req.body.h_logo;
  var w_logo = req.body.width_div;
  var date = moment(req.body.date, 'YYYY-MM-DD').format("DD-MMM");
  var time = req.body.time;
  var ar = req.body.aspect_ratio;
  var instituteName = req.body.instituteName;
  // var logo_name = req.body.logo;
  var logo_source = req.body.logo_source;
  var id = req.body.id;
  var pswd = req.body.password;
  var middle_url = app.get("middle_url");
  var footer_url = req.body.footer_url;
  if (req.file) {
    var path = req.file.location;
  }
  console.log("Form 5")
  var url;
  var n_h_logo = "";
  var n_w_logo = (w_logo > 176.297) ? "176.297" : w_logo;
  if (key === KEY) {
    //console.log(url);
    if (logo_source === "") {
      url = "";
      visibility = "false"; // if no logo then do not show logo
      visibility_sq = "false";
      visibility_rect = "false";
    } else {
      if (url_image) {
        url = url_image;
        console.log(ar)
        n_h_logo = n_w_logo / ar;
        console.log(url, n_w_logo, n_h_logo)
      } else if (path) {
        url = path;
        n_h_logo = n_w_logo / ar;
        console.log(url, n_w_logo, n_h_logo)
      }
    }

    let obj = {
      middle_url, date, time, instituteName, id, pswd
    }

    console.log("obj", obj)

    //footer -> zoom

    //api post
    axios.post('https://studio.pixelixe.com/api/graphic/automation/v2',
      {
        "template_name": "teacher id",
        "api_key": "dd8SrZnkmnXbzcjjVu9lTUPJylA2",
        "format": "json",
        "modifications": [
          {
            "name": "bg-img",
            "type": "image",
            "image_url": middle_url,
            "width": "1001px",
            "height": "1001px",
            "visible": "true"
          },
          {
            "name": "instituteName",
            "type": "text",
            "text": instituteName,
            "color": "rgb(0, 113, 188)",
            "font-size": "30px",
            "visible": "true"
          },
          {
            "name": "date",
            "type": "text",
            "text": "Date : " + date,
            "color": "rgb(0, 113, 188)",
            "font-size": "41px",
            "visible": "true"
          },
          {
            "name": "time",
            "type": "text",
            "text": "Time : " + time,
            "color": "rgb(0, 113, 188)",
            "font-size": "41px",
            "visible": "true"
          },
          {
            "name": "meeting-id",
            "type": "text",
            "text": id,
            "color": "rgb(0, 113, 188)",
            "font-size": "24px",
            "visible": "true"
          },
          {
            "name": "passcode",
            "type": "text",
            "text": pswd,
            "color": "rgb(0, 113, 188)",
            "font-size": "24px",
            "visible": "true"
          },
          {
            "name": "image-1",
            "type": "image",
            "image_url": url,
            // "image_url": "default",
            "width": `${n_w_logo}px`,
            // "width": "154.688px",
            "height": `${n_h_logo}px`,
            // "height": "103.591px",
            "visible": "true"
          },
        ]
      }
    ).then(function (response) {
      console.log("res", response.data);
      image = response.data.image_url;
      date = response.data.created_at;
      //store activity of user in database
      var obj = {
        user_id: req.user.user_id1,
        date: response.data.created_at,
        url: response.data.image_url
      }
      var values = Object.values(obj);
      pool.getConnection(function (err, conn) {
        if (err) {
          console.log(err);
        } else {
          conn.query("INSERT INTO marketing_data (user_id,date,url) VALUES ?", [
            [values]
          ], function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log("Successfully inserted data");
            }
          })
          pool.releaseConnection(conn);
        }
      })
      flag_n = 1;
      res.redirect("/form5");
    })
      .catch(function (error) {
        console.log(error);
      });


  } else {
    flag = 0;
    res.redirect("/form5");
  }

});

module.exports = router;