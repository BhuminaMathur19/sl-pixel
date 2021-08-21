const express = require("express");
const mysql = require("mysql2");
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
    res.render("form2", {
      url: image,
      date: date,
      flag: flag, // if key is wrong, flag is raised
    });
    image = " ";
  }

});

// const singleUpload = upload.single("img")

router.post("/", verifyUser, upload.single("img"), function (req, res) {
  var key = req.body.key;
  var url_user = req.body.url;
  var image_type = req.body.image_type;
  var h_logo = req.body.h_logo;
  var w_logo = req.body.w_logo;
  var logo_name = req.body.logo;
  var logo_source = req.body.logo_source;
  var id = req.body.id;
  var pswd = req.body.password;
  var middle_url = app.get("middle_url");
  var footer_url = req.body.footer_url;
  if (req.file) {
    var path = req.file.location;
    //console.log(path);
  }

  console.log("Form 2")

  var n_h_logo;
  var n_w_logo;
  var url;
  var visibility;
  var visibility_sq;
  var visibility_rect;
  var visibility_zoom;
  var visibility_meet;

  //var preview_type = app.get("preview_type");
  if (key === KEY) {

    if (footer_url === "https://json.mycareerlift.com/pixels/templete2-04_03.gif") { //zoom
      visibility_zoom = "true";
      visibility_meet = "false";
    } else { //meet
      visibility_zoom = "false";
      visibility_meet = "true";
    }
    //console.log(url);
    if (logo_source === "") {
      url = "";
      visibility = "false"; // if no logo then do not show logo
      visibility_sq = "false";
      visibility_rect = "false";
    } else {
      visibility_sq = "true";
      if (url_user) {
        url = url_user;
      } else {
        url = path;
      }

      //adjusting image according to aspect ratio

      if (image_type === "square") {
        visibility_sq = "true";
        visibility_rect = "false";
        if (h_logo > 182) {
          n_h_logo = 182;
          n_w_logo = (w_logo / h_logo) * n_h_logo;
        } else {
          n_h_logo = h_logo;
          n_w_logo = w_logo;
        }
      } else if (image_type === "rect_h") {
        visibility_rect = "true";
        visibility_sq = "false";
        if (w_logo > 394) {
          n_w_logo = 394;
          n_h_logo = (h_logo / w_logo) * n_w_logo;
          h_logo = n_h_logo;
          w_logo = n_w_logo;
        }
        if (h_logo > 182) {
          n_h_logo = 182;
          n_w_logo = (w_logo / h_logo) * n_h_logo;
        }
        if (h_logo <= 182 && w_logo <= 394) {
          n_h_logo = h_logo;
          n_w_logo = w_logo;
        }
      }
    }

    if (logo_name.length < 18) {
      visibility_org_name = "false";
      visibility_logo_center = "true";
    } else {
      visibility_org_name = "true";
      visibility_logo_center = "false";
    }

    //footer -> zoom

    //api post
    axios.post('https://studio.pixelixe.com/api/graphic/automation/v2', {


      "template_name": "preview-2-new-1",
      "api_key": "dd8SrZnkmnXbzcjjVu9lTUPJylA2",
      "format": "json",
      "modifications": [{
        "name": "footer-img",
        "type": "image",
        "image_url": footer_url,
        "width": "1080px",
        "height": "180px",
        "visible": "true"
      },
      {
        "name": "middle-img",
        "type": "image",
        "image_url": middle_url,
        "width": "1080px",
        "height": "724px",
        "visible": "true"
      },
      {
        "name": "org-logo",
        "type": "image",
        "image_url": url,
        "width": n_w_logo,
        "height": n_h_logo,
        "visible": visibility_sq
      },
      {
        "name": "org-name",
        "type": "text",
        "text": logo_name,
        "color": "rgb(109, 48, 136)",
        "font-size": "80px",
        "visible": visibility_org_name
      },
      {
        "name": "meet_id",
        "type": "text",
        "text": "Meeting Id : " + id,
        "color": "rgb(109, 48, 136)",
        "font-size": "41px",
        "visible": visibility_zoom
      },
      {
        "name": "meet_pswd",
        "type": "text",
        "text": "Password : " + pswd,
        "color": "rgb(109, 48, 136)",
        "font-size": "41px",
        "visible": visibility_zoom
      },
      {
        "name": "logo_rect",
        "type": "image",
        "image_url": url,
        "width": n_w_logo,
        "height": n_h_logo,
        "visible": visibility_rect
      },
      {
        "name": "logo_center",
        "type": "text",
        "text": logo_name,
        "color": "rgb(109, 48, 136)",
        "font-size": "80px",
        "visible": visibility_logo_center
      },
      {
        "name": "image-1",
        "type": "image",
        "image_url": "default",
        "width": "1080px",
        "height": "180px",
        "visible": visibility_meet
      },
      {
        "name": "meet-url",
        "type": "text",
        "text": "Meeting Url:&nbsp;",
        "color": "rgb(109, 48, 136)",
        "font-size": "45px",
        "visible": visibility_meet
      },
      {
        "name": "url-link",
        "type": "text",
        "text": id,
        "color": "rgb(109, 48, 136)",
        "font-size": "45px",
        "visible": visibility_meet
      }
      ]
    }).then(function (response) {
      // console.log(response);
      image = response.data.image_url;
      date = response.data.created_at;
      //store activity of user in database
      var obj = {
        user_id: req.user.user_id1,
        date: date,
        url: image
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
      res.redirect("/form2");
    })
      .catch(function (error) {
        console.log(error);
      });


  } else {
    flag = 0;
    res.redirect("/form2");
  }

});

module.exports = router;
