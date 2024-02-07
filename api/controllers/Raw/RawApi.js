const awsHelper = require("../../helper/awsHelper");

const RawApi = () => {
  const upload_file_on_s3 = async (req, res) => {
    if (req.files != null) {
      if (req.files.file != undefined) {
        var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
          req.files.file
        );
        console.log(url);
        return res.status(201).json({
          code: 201,
          success: true,
          url: url,
          message: "File Uploaded.",
        });
      } else {
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Please Provide File to Upload.",
        });
      }
    } else {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Please Provide File to Upload.",
      });
    }
  };

  const retrieve_secret_key_of_user = async (req, res) => {
    if (req.body.user_id == undefined || req.body.user_id == "")
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Internal Server Error.",
      });

    try {
      let secret_key = `${req.body.user_id}_private`;
      let fetched_private_key = await awsHelper.retrieveSecret(secret_key);
      console.log(fetched_private_key);

      return res.status(201).json({
        code: 201,
        success: true,
        message: "Secret Fetched.",
        private_key: fetched_private_key,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
      });
    }
  };

  const aws_test_function = async (req, res) => {
    try {
      let fetched_test_details = await awsHelper.awsTestFunction();
      return res.status(201).json({
        code: 201,
        success: true,
        message: "Aws Test Success",
        data: fetched_test_details,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Aws Test Failed.",
      });
    }
  };

  return {
    upload_file_on_s3,
    retrieve_secret_key_of_user,
    aws_test_function,
  };
};

module.exports = RawApi;
