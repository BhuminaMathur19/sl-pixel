const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    // return res
    //   .status(401)
    //   .send("Yo, we need a token please give it to me next time.");
    res.redirect("/");
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      // return res.status(400).send("Oops! auth Failed");
      res.redirect("/");
    }

    req.user = decoded;
    // console.log(req.user);
    next();
  });
};

exports.verifyUser = authenticateToken;
