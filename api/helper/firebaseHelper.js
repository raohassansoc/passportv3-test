// Please Do not make any changes with the content of this firebaseHelper.js file
// the functions declared in this files are being used at many critical points
// change in this file should not be pushed to main production and development
// pipelines as it may potentially break some critical functionality of application

const { Storage } = require("@google-cloud/storage");
const { format } = require("util");

const storage = new Storage({
  projectId: "scoopywear-25a86",
  credentials: require("../../sugandh-co-firebase-adminsdk-0iblb-960b877d58.json"),
  predefinedAcl: "publicRead",
  cacheControl: "public, max-age=31536000",
});

const bucket = storage.bucket("gs://scoopywear-25a86.appspot.com");

var uploadImageToStorage = async (file) => {
  console.log(file);
  if (!file) {
    return null;
  }
  console.log("blobStream " + file.name);
  var file_name = file.name.replace(/\s/g, "").trim();
  let newFileName = `${Date.now()}_${file_name}`;
  console.log("blobStream " + newFileName.replace(/\s/g, ""));
  let fileUpload = bucket.file(newFileName);

  const blobStream = await fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  const url = format(
    `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`
  );
  console.log("blobStream " + url);

  blobStream.end(file.data);

  return url;
};

var uploadFileToStorage = async (file) => {
  console.log(file);
  if (!file) {
    return null;
  }
  console.log("blobStream " + file.name);
  var file_name = file.name.replace(/\s/g, "").trim();
  let newFileName = `${Date.now()}_${file_name}`;
  console.log("blobStream " + newFileName.replace(/\s/g, ""));
  let fileUpload = bucket.file(newFileName);

  const blobStream = await fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  const url = format(
    `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`
  );
  console.log("blobStream " + url);

  blobStream.end(file.data);

  return url;
};

var uploadBhaktiData = async (file, req) => {
  console.log(file);
  if (!file) {
    return null;
  }
  let file_name;
  if (req.god_name != undefined) {
    file_name = `${req.god_name}`;
  }
  if (req.bhakti_category_name != undefined) {
    file_name = `${file_name}_${req.bhakti_category_name}`;
  }
  console.log("blobStream " + file.name);
  let newFileName;
  if (file_name != undefined) {
    file_name = file_name.replace(/\s/g, "").trim();
    newFileName = `${file_name}_${Date.now()}`;
  } else {
    newFileName = `${Date.now()}`;
  }
  console.log("blobStream " + newFileName.replace(/\s/g, ""));
  let fileUpload = bucket.file(newFileName);

  const blobStream = await fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  const url = format(
    `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`
  );
  console.log("blobStream " + url);

  blobStream.end(file.data);

  return url;
};
var uploadDarshanData = async (file, req) => {
  console.log(file);
  if (!file) {
    return null;
  }
  let file_name;
  if (req.god_name != undefined) {
    file_name = `${req.god_name}`;
  }

  console.log("blobStream " + file.name);
  let newFileName;
  if (file_name != undefined) {
    file_name = file_name.replace(/\s/g, "").trim();
    newFileName = `${file_name}_${Date.now()}`;
  } else {
    newFileName = `${Date.now()}`;
  }
  console.log("blobStream " + newFileName.replace(/\s/g, ""));
  let fileUpload = bucket.file(newFileName);

  const blobStream = await fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  const url = format(
    `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`
  );
  console.log("blobStream " + url);

  blobStream.end(file.data);

  return url;
};
var DeleteImage = async (url) => {
  // Deletes the file from the bucket
  let image = url.replace(
    "https://storage.googleapis.com/livebhagwan-7dd31.appspot.com/",
    ""
  );
  console.log(image);
  try {
    await bucket.file(image).delete();
    console.log(`deleted.`);
    return true;
  } catch {
    return false;
  }
};
module.exports = {
  uploadImageToStorage,
  uploadFileToStorage,
  uploadBhaktiData,
  uploadDarshanData,
  DeleteImage,
};
