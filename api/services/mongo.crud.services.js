function trimObj(obj) {
  if (
    (!Array.isArray(obj) &&
      typeof obj != "object" &&
      obj != "null" &&
      obj != null &&
      obj != "undefined",
    obj != undefined)
  )
    return obj;
  return Object.keys(obj).reduce(
    function (acc, key) {
      acc[key.trim()] =
        typeof obj[key] == "string" ? obj[key].trim() : trimObj(obj[key]);
      return acc;
    },
    Array.isArray(obj) ? [] : {}
  );
}

const insert = (model, dataToInsert) => {
  dataToInsert = trimObj(dataToInsert);
  dataToInsert.is_deleted = false;
  dataToInsert.deleted_at = null;
  dataToInsert.created_at = new Date();
  return new Promise((resolve, reject) => {
    model
      .create(dataToInsert)
      .then((res) => {
        resolve(res.toObject());
      })
      .catch((err) => {
        console.log(err);
        reject(handleErrorResponse(err));
      });
  });
};

const update = async (
  model,
  objectToFind,
  attributesToUpdate,
  checkNonDeletedDataOnly = true
) => {
  attributesToUpdate = trimObj(attributesToUpdate);

  return new Promise((resolve, reject) => {
    if (checkNonDeletedDataOnly) {
      objectToFind.is_deleted = false;
    }
    attributesToUpdate.is_deleted = false;
    attributesToUpdate.deleted_at = null;
    attributesToUpdate.updated_at = new Date();

    model
      .updateOne(objectToFind, attributesToUpdate)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(handleErrorResponse(err));
      });
  });
};

const updateMany = async (
  model,
  objectToFind,
  attributesToUpdate,
  checkNonDeletedDataOnly = true
) => {
  attributesToUpdate = trimObj(attributesToUpdate);

  return new Promise((resolve, reject) => {
    if (checkNonDeletedDataOnly) objectToFind.is_deleted = false;
    attributesToUpdate.is_deleted = false;
    attributesToUpdate.deleted_at = null;
    attributesToUpdate.updated_at = new Date();

    model
      .updateMany(objectToFind, attributesToUpdate)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(handleErrorResponse(err));
      });
  });
};

const get = async (model, options) => {
  return new Promise(async (resolve, reject) => {
    try {
      const totalCount = await model.countDocuments(options.where);
      const pipeline = [];
      if (options.sortField) {
        let sort = options.sortField;
        pipeline.push({
          $sort: {
            [sort]: -1,
          },
        });
      }
      if (options.where) {
        pipeline.push({
          $match: options.where,
        });
      }
      if (options.projection) {
        pipeline.push({
          $project: options.projection,
        });
      }
      // Add the $lookup stage to the pipeline
      if (options.populate) {
        for (let lookup of options.populate) {
          pipeline.push({
            $lookup: lookup,
          });
        }
      }
      if (options.skip) {
        pipeline.push({
          $skip: options.skip,
        });
      }
      if (options.limit) {
        pipeline.push({
          $limit: options.limit,
        });
      }
      if (options.sort) {
        pipeline.push({
          $sort: sort,
        });
      }
      const data1 = await model.aggregate(pipeline).exec();

      resolve({
        data: data1,
        totalCount,
      });
    } catch (err) {
      reject(handleErrorResponse(err));
    }
  });
};

const destroy = async (model, objectToFind) => {
  return new Promise((resolve, reject) => {
    const updateQuery = { $set: { is_deleted: true, deleted_at: new Date() } };
    let query = model.updateMany(objectToFind, updateQuery);
    const queryString = JSON.stringify(query.getQuery(), null, 2);
    query
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(handleErrorResponse(err));
      });
  });
};

const destroyHard = async (model, objectToDelete) => {
  return new Promise((resolve, reject) => {
    model
      .deleteMany(objectToDelete)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const handleErrorResponse = (err) => {
  if (err.name === "MongoError" || err.code === 11000) {
    // MongoDB unique constraint error
    return {
      status: 500,
      error: {
        code: err.code,
        success: false,
        message: "Validation Failed",
        errors: Object.keys(err.keyPattern).map((key) => ({
          message: `${key} already exists.`,
          type: "unique",
          path: key,
          value: err.keyValue[key],
        })),
      },
    };
  } else if (err.name === "ValidationError") {
    // MongoDB validation error
    return {
      status: 500,
      error: {
        code: 4002,
        success: false,
        message: "Validation Failed",
        errors: Object.values(err.errors).map((error) => ({
          message: error.message,
          type: error.kind,
          path: error.path,
          value: error.value,
        })),
      },
    };
  } else {
    // Other errors
    return {
      status: 500,
      message: "Internal Server Error",
      error: err,
    };
  }
};

module.exports = {
  insert,
  update,
  updateMany,
  get,
  destroy,
  destroyHard,
};
