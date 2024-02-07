const PropertyModel = require("../../models/Merchant/Property");
const { PropertySchemas } = require("../../schemas/MerchantSchemas");
const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { ObjectId } = require("mongodb");

const PropertyApi = () => {
  // For create and update Property
  const save = async (req, res) => {
    if (req.body.image == undefined) {
      req.body.image = [];
    } else if (req.body.image.length == 0) {
      req.body.image = [];
    } else if (typeof req.body.image == "string") {
      req.body.image = JSON.parse(req.body.image);
    }
    if (req.files != null) {
      if (req.files.image_file != undefined) {
        for (i = 0; i < req.files.image_file.length; i++) {
          var url = await awsHelper.uploadSingleFileToS3fromBackend(
            req.files.image_file[i]
          );
          req.body.image.push(url);
        }
        if (
          req.files.image_file.length == undefined &&
          req.files.image_file != undefined
        ) {
          var url = await awsHelper.uploadSingleFileToS3fromBackend(
            req.files.image_file
          );
          req.body.image.push(url);
        }
      }
    }
    if (req.files != null) {
      if (req.files.thumbnail_image != undefined) {
        var url = await awsHelper.uploadSingleFileToS3fromBackend(
          req.files.thumbnail_image,
          req.body
        );
        req.body.thumbnail_image = url;
      }
    }
    if (req.body.deleted_image) {
      for (let img of req.body.deleted_image) {
        await awsHelper.deleteFileS3fromBackend(img);
      }
    }
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, PropertySchemas)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id) {
            await crudServices.update(
              PropertyModel,
              { _id: reqData._id },
              reqData
            );
          } else {
            response = await crudServices.insert(PropertyModel, reqData);
          }
          return res.status(201).json({
            code: 200,
            success: true,
            message: `Property ${
              reqData._id ? "updated" : "created"
            } successfully`,
            data: response || {},
          });
        } catch (error) {
          console.log(error);
          return res.status(501).json(error);
        }
      })
      .catch((err) => {
        return res.status(500).json({
          code: 500,
          success: false,
          message: "Internal Server Error",
          error: err,
        });
      });
  };
  // for deleting Property
  const destroy = async (req, res) => {
    try {
      if (req.body.record_id) {
        await crudServices.destroy(PropertyModel, { _id: req.body.record_id });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Property deleted successfully.`,
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
      return res.status(501).json(error);
    }
  };

  const get = async (req, res) => {
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      if (req.query.keyword) {
        whereClause.name = { $regex: req.query.keyword, $options: "i" };
      }
      if (req.query._id) {
        whereClause._id = ObjectId(req.query._id);
      }
      if (req.query.property_category_id) {
        whereClause.property_category_id = req.query.property_category_id;
      }
      if (req.query.merchant_id) {
        whereClause.merchant_id = req.query.merchant_id;
      }
      if (req.query.country_id) {
        whereClause.country_id = req.query.country_id;
      }
      if (req.query.city_id) {
        whereClause.city_id = req.query.city_id;
      }
      if (req.query.zipcode_id) {
        whereClause.zipcode_id = req.query.zipcode_id;
      }
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

      let response = await crudServices.get(PropertyModel, {
        where: whereClause,
        projection: {
          _id: 1,
          name: 1,
          description: 1,
          property_category_id: 1,
          merchant_id: 1,
          property_size: 1,
          property_code: 1,
          primary_contact_number: 1,
          is_primary_number_whatsapp: 1,
          alternate_contact_number: 1,
          email_id: 1,
          accepted_currency: 1,
          address_line_1: 1,
          address_line_2: 1,
          country_id: 1,
          province_id: 1,
          city_id: 1,
          zipcode_id: 1,
          manager_name: 1,
          manager_email_id: 1,
          manager_contact_number: 1,
        },
        skip: skip,
        limit: limit,
        sortField: "name",
      });
      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;
      return res.status(200).json({
        code: 200,
        success: true,
        message: `Property get successfully.`,
        data: response.data,
        page_info: page_info,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };

  return {
    save,
    destroy,
    get,
  };
};
module.exports = PropertyApi;
