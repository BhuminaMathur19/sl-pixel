const express = require("express");
const mysql = require("mysql2");
const ejs = require("ejs");
app = express();
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

require('dotenv').config();


app.use(cookieParser());

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER_DB,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});



const loginRoute = require("./routes/login");
const previewRoute = require("./routes/preview");
const formRoute = require("./routes/form");
const preview_form2Route = require("./routes/preview-form2");
const preview_form3Route = require("./routes/preview-form3");
const preview_form4Route = require("./routes/preview-form4");
const preview_form5Route = require("./routes/preview-form5");
const preview_form6Route = require("./routes/preview-form6");
const preview_form7Route = require("./routes/preview-form7");
const preview_form3_2Route = require("./routes/preview-form3_2");
const form2Route = require("./routes/form2");
const form3Route = require("./routes/form3");
const form4Route = require("./routes/form4");
const form5Route = require("./routes/form5");
const form6Route = require("./routes/form6");
const form7Route = require("./routes/form7");
const form3_2Route = require("./routes/form3_2");


var flag = 1;

var preview_type = 0;

const generateAccessToken = (username) => {
  return jwt.sign(username, process.env.TOKEN_SECRET, {
    expiresIn: "1800s",
  });
};


const { verifyUser } = require("./middlewares/verifyUser");

app.use("/", loginRoute);
app.use("/preview", previewRoute);
app.use("/form", formRoute);
app.use("/preview-form2", preview_form2Route);
app.use("/preview-form3", preview_form3Route);
app.use("/preview-form3_2", preview_form3_2Route);
app.use("/preview-form4", preview_form4Route);
app.use("/preview-form5", preview_form5Route);
app.use("/preview-form6", preview_form6Route);
app.use("/preview-form7", preview_form7Route);
app.use("/form2", form2Route);
app.use("/form3", form3Route);
app.use("/form3_2", form3_2Route);
app.use("/form4", form4Route);
app.use("/form5", form5Route);
app.use("/form6", form6Route);
app.use("/form7", form7Route);


app.get("/logout", function (req, res) {
  res.cookie("jwt", " ", {
    expires: new Date(Date.now() + 1),
    httpOnly: true
  });
  res.redirect("/");
})


app.listen(3200, function () {
  console.log("Server started on port 3200");
})
