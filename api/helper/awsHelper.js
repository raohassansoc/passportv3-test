// Please Do not make any changes with the content of this awsHelper.js file
// the functions declared in this files are being used at many critical points
// change in this file should not be pushed to main production and development
// pipelines as it may potentially break some critical functionality of application

// s3 content public format : https://<bucket-name>.s3.<region>.amazonaws.com/<key>
// here <key> is file name

const dotenv = require("dotenv");
const aws = require("aws-sdk");
const crypto = require("crypto");
const util = require("util");
const fs = require("fs");
const url = require("url");

const randomBytes = util.promisify(crypto.randomBytes);

const region = process.env.REGION;
const bucketName = process.env.BUCKET_NAME;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: "v4",
});

// to get the uploadURL to upload content from frontend
exports.generate_Upload_URL_for_frontend = async () => {
  const rawBytes = await randomBytes(16);
  const imageName = rawBytes.toString("hex");

  const params = {
    Bucket: bucketName,
    Key: imageName,
    Expires: 180,
  };

  const uploadURL = await s3.getSignedUrlPromise("putObject", params);
  return uploadURL;
};


exports.uploadSingleFileToS3fromBackend = async (file, req) => {
  try {
    let img =
      "https://s3.eu-north-1.amazonaws.com/passportv3.io/icons8-burj-khalifa-96+1.jpg";
    function extractS3ParamsFromUrl(imageUrl) {
      const parsedUrl = url.parse(imageUrl);
      const key = parsedUrl.pathname.split("/")[2]; // Remove the leading slash
      let params = {
        Key: key,
        Bucket: bucketName,
      };
      s3.deleteObject(params, (err, data) => {
        if (err) {
          console.error("Error deleting object:", err);
        } else {
          console.log("Object deleted successfully", data);
        }
      });
    }
    extractS3ParamsFromUrl(img);
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};

exports.uploadJSONFiletoS3fromBackend = async (file, res) => {
  if (!file) return null;
  let file_name = file.name;
  if (file_name !== undefined) {
    file_name = file_name.replace(/\s/g, "").trim();
    file_name = `${Date.now()}_${file_name}`;
  } else {
    file_name = `${Date.now()}`;
  }

  const params = {
    Bucket: bucketName,
    Key: file_name,
    Body: file.data instanceof Buffer ? file.data : file.data.buffer,
    ACL: "public-read",
  };

  try {
    const uploadResult = await s3.upload(params).promise();
    const publicUrl = uploadResult.Location;
    return publicUrl;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};

exports.uploadSingleImageFiletoS3fromBackend = async (file, res) => {
  if (!file) return null;
  let file_name = file.name;
  if (file_name !== undefined) {
    file_name = file_name.replace(/\s/g, "").trim();
    file_name = `${Date.now()}_${file_name}`;
  } else {
    file_name = `${Date.now()}`;
  }

  const params = {
    Bucket: bucketName,
    Key: file_name,
    Body: file.data instanceof Buffer ? file.data : file.data.buffer,
    ACL: "public-read",
  };

  try {
    const uploadResult = await s3.upload(params).promise();
    const publicUrl = uploadResult.Location;
    return publicUrl;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};

exports.deleteJSONFilefromS3fromBackend = async (file) => {
  try {
    function extractS3ParamsFromUrl(imageUrl) {
      const parsedUrl = url.parse(imageUrl);
      const key = parsedUrl.pathname.split("/")[2]; // Remove the leading slash
      let params = {
        Key: key,
        Bucket: bucketName,
      };
      s3.deleteObject(params, (err, data) => {
        if (err) {
          console.error("Error deleting object:", err);
        } else {
          console.log("Object deleted successfully", data);
        }
      });
    }
    extractS3ParamsFromUrl(file);
  } catch (error) {
    console.error("Error Deleting JSON file from S3:", error);
    throw error;
  }
};

exports.deleteSingleImageFilefromS3fromBackend = async (file) => {
  try {
    function extractS3ParamsFromUrl(imageUrl) {
      const parsedUrl = url.parse(imageUrl);
      const key = parsedUrl.pathname.split("/")[2]; // Remove the leading slash
      let params = {
        Key: key,
        Bucket: bucketName,
      };
      s3.deleteObject(params, (err, data) => {
        if (err) {
          console.error("Error deleting object:", err);
        } else {
          console.log("Object deleted successfully", data);
        }
      });
    }
    extractS3ParamsFromUrl(file);
  } catch (error) {
    console.error("Error Deleting Image file from S3:", error);
    throw error;
  }
};

exports.deleteFileS3fromBackend = async (file) => {
  try {
    let img = file;
    function extractS3ParamsFromUrl(imageUrl) {
      const parsedUrl = url.parse(imageUrl);
      const key = parsedUrl.pathname.split("/")[2]; // Remove the leading slash
      let params = {
        Key: key,
        Bucket: bucketName,
      };
      s3.deleteObject(params, (err, data) => {
        if (err) {
          console.error("Error deleting object:", err);
        } else {
          console.log("Object deleted successfully", data);
        }
      });
    }
    extractS3ParamsFromUrl(img);
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};

exports.uploadMultipleFilesToS3fromBackend = async (files, req) => {
  if (!files) return null;
  const uploadPromises = [];
  let file_name;
  if (req.pass_name != undefined) {
    file_name = `${req.pass_name}`;
  }
  if (req.pass_category_name != undefined) {
    file_name = `${file_name}_${req.pass_category_name}`;
  }
  if (req.activity_name != undefined) {
    newFileName = `${newFileName}_${req.activity_name}`;
  }
  let newFileName;
  if (file_name != undefined) {
    file_name = file_name.replace(/\s/g, "").trim();
    newFileName = `${file_name}_${Date.now()}`;
  } else {
    newFileName = `${Date.now()}`;
  }

  for (let i = 0; i < files.length; i++) {
    let thisfile_name = `${newFileName}_${i + 1}`;
    const fileContent = fs.readFileSync(files[i]);
    const params = {
      Bucket: bucketName,
      Key: thisfile_name,
      Body: fileContent,
      ACL: "public-read", // Optional: Set ACL to make the uploaded file publicly accessible
    };

    uploadPromises.push(s3.upload(params).promise());
  }
  const uploadResults = await Promise.all(uploadPromises);
  const publicUrls = uploadResults.map((result) => result.Location);

  return publicUrls;
};

aws.config.update({ region: process.env.REGION });
const secretsManager = new aws.SecretsManager();

exports.saveSecret = async (secretName, secretValue) => {
  const params = {
    Name: secretName,
    SecretString: secretValue,
  };

  try {
    await secretsManager.createSecret(params).promise();
  } catch (err) {
    console.log(`Error saving secret "${secretName}":`, err);
    throw err;
  }
};

exports.retrieveSecret = async (secretName) => {
  const params = {
    SecretId: secretName,
  };

  try {
    const data = await secretsManager.getSecretValue(params).promise();
    if (data.SecretString) {
      return data.SecretString;
    } else {
      console.log(
        `Retrieved secret "${secretName}" (Binary Data):`,
        data.SecretBinary
      );
    }
  } catch (err) {
    console.log(`Error retrieving secret "${secretName}":`, err);
    throw err;
  }
};

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

const AuthorizedSecretManager = new aws.SecretsManager();

exports.awsTestFunction = async () => {
  try {
    const test_details = await AuthorizedSecretManager.listSecrets().promise();
    return test_details;
  } catch (error) {
    console.log("Authorized Test Fetch was a Failure.");
    throw error;
  }
};
