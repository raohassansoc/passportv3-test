require("dotenv").config();
const { Magic } = require("@magic-sdk/admin");
const magic = new Magic(process.env.MAGIC_LINK_SECREATE_KEY);
module.exports = {
  verifyToken: async (req, res, next) => {
    var Authorization = req.headers["authorization"];
    if (!Authorization) {
      return res.status(200).json({
        code: 206,
        status: false,
        message: "Please provide a Authorization",
      });
    }
    try {
      jwt.verify(Authorization, "passportV3.io", function (err, decoded) {
        if (err) {
          console.log("error");
          return res.status(200).json({
            message: "Failed to authenticate",
          });
        }
        next();
      });
    } catch (error) {
      console.error("Error validating DID token:", error.code);
      if (error.code == "ERROR_DIDT_EXPIRED") {
        console.log("DID token has expired");
        return res.status(500).json({
          code: 401,
          status: false,
          message: "DID token has expired",
          data: error.message,
        });
      }
      return res.status(500).json({
        code: 401,
        status: false,
        message: "Failed to authenticate",
        data: error.message,
      });
    }
  },
};
