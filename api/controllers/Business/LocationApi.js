const Location = require("../../models/Business/Location");
const { LocationSchema } = require("../../schemas/BusinessSchema");
const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { ObjectId } = require("mongodb");
const awsHelper = require("../../helper/awsHelper");

const LocationApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    if (req.body._id) {
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause._id = ObjectId(req.body._id);

      let executing_parameters = {
        where: whereClause,
      };

      let found_data = await crudServices.get(Location, executing_parameters);
      req.body.images = [];
      if (
        req.body.to_be_deleted != undefined &&
        req.body.to_be_deleted.length &&
        found_data.data[0].images.length
      ) {
        for (let i = 0; i < found_data.data[0].images.length; ++i) {
          if (req.body.to_be_deleted.includes(found_data.data[0].images[i])) {
            await awsHelper.deleteSingleImageFilefromS3fromBackend(
              found_data.data[0].images[i]
            );
          } else {
            req.body.images.push(found_data.data[0].images[i]);
          }
        }
      }

      if (req.files != null) {
        if (req.files.thumbnail_image != undefined) {
          if (found_data.data[0].thumbnail_image)
            await awsHelper.deleteSingleImageFilefromS3fromBackend(
              found_data.data[0].thumbnail_image
            );
          var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
            req.files.thumbnail_image
          );
          req.body.thumbnail_image = url;
        }
        if (req.files.images != undefined) {
          req.body.images = req.body.images || [];
          for (let i = 0; i < req.files.images.length; ++i) {
            var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
              req.files.images[i]
            );
            req.body.images.push(url);
          }
          if (
            req.files.images.length == undefined &&
            req.files.images != undefined
          ) {
            var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
              req.files.images
            );
            req.body.images.push(url);
          }
        }
      }
    } else {
      if (req.files != null) {
        if (req.files.thumbnail_image != undefined) {
          var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
            req.files.thumbnail_image
          );
          req.body.thumbnail_image = url;
        }
        if (req.files.images != undefined) {
          req.body.images = [];
          for (let i = 0; i < req.files.images.length; ++i) {
            var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
              req.files.images[i]
            );
            req.body.images.push(url);
          }
          if (
            req.files.images.length == undefined &&
            req.files.images != undefined
          ) {
            var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
              req.files.images
            );
            req.body.images.push(url);
          }
        }
      }
    }
    validationService
      .validate(req.body, LocationSchema)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id)
            response = await crudServices.update(
              Location,
              { _id: reqData._id },
              reqData
            );
          else response = await crudServices.insert(Location, reqData);
          return res.status(201).json({
            code: 200,
            success: true,
            message: `Location Details ${
              reqData._id ? "updated" : "created"
            } successfully.`,
            data: response || {},
          });
        } catch (error) {
          console.log(error);
          return res.status(501).json(error);
        }
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({
          code: 500,
          success: false,
          message: "Internal Server Error",
          error: err,
        });
      });
  };

  const get = async (req, res) => {
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      if (req.query._id) whereClause._id = ObjectId(req.query._id);
      if (req.query.keyword)
        whereClause.$or = [
          {
            name: { $regex: new RegExp("^" + req.query.keyword, "i") },
          },
          {
            local_name: {
              $regex: new RegExp("^" + req.query.keyword, "i"),
            },
          },
        ];

      if (req.query.city_id) whereClause.city_id = ObjectId(req.query.city_id);
      if (req.query.province_id)
        whereClause.province_id = ObjectId(req.query.province_id);
      if (req.query.country_id)
        whereClause.country_id = ObjectId(req.query.country_id);

      const {
        query: { current_page, page_size },
      } = req;
      let skip;
      let limit;
      if (current_page && page_size) {
        skip =
          parseInt(current_page) > 0
            ? (parseInt(current_page) - 1) * parseInt(page_size)
            : 0;
        limit = parseInt(page_size);
      }

      const executing_parameters = {
        where: whereClause,
        skip: skip,
        limit: limit,
        projection: {
          __v: 0,
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
        },
      };

      let response = await crudServices.get(Location, executing_parameters);

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Location Details get successfully.",
        data: response.data,
        page_info: page_info,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };

  const destroy = async (req, res) => {
    try {
      if (req.body.record_id) {
        await crudServices.destroy(Location, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Location Details deleted successfully.`,
          data: {},
        });
      } else {
        return res.status(207).json({
          code: 207,
          success: false,
          message: `Invalid Url Parameters`,
          data: {},
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };

  return {
    save,
    get,
    destroy,
  };
};

module.exports = LocationApi;
