const CityModel = require("../../models/Master/City");
const { CitySchemas } = require("../../schemas/MasterSchemas");
const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { ObjectId } = require("mongodb");
const awsHelper = require("../../helper/awsHelper");
const Countries = require("../../models/Master/Country");

const CityApi = () => {
  // For create and update City

  const save = async (req, res) => {
    if (req.files != null) {
      if (req.files.icon != undefined) {
        var url = await awsHelper.uploadSingleFileToS3fromBackend(
          req.files.icon,
          req.body
        );
        req.body.icon = url;
      }
    }
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, CitySchemas)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id) {
            await crudServices.update(CityModel, { _id: reqData._id }, reqData);
          } else {
            response = await crudServices.insert(CityModel, reqData);
          }
          return res.status(201).json({
            code: 200,
            success: true,
            message: `City ${reqData._id ? "updated" : "created"} successfully`,
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
  // for deleting City
  const destroy = async (req, res) => {
    try {
      if (req.body.record_id) {
        await crudServices.destroy(CityModel, { _id: req.body.record_id });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `City deleted successfully.`,
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
      if (req.query.country_id) {
        whereClause.country_id = ObjectId(req.query.country_id);
      }
      if (req.query.province_id) {
        whereClause.province_id = ObjectId(req.query.province_id);
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
      let response = await crudServices.get(CityModel, {
        where: whereClause,
        projection: { _id: 1, name: 1, icon: 1, country_id: 1, province_id: 1 },
        skip: skip,
        limit: limit,
        sortField: "name",
        populate: [
          {
            from: "master_countries",
            let: { countryId: "$country_id" },
            as: "Country",
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$countryId"] },
                },
              },
              {
                $project: {
                  name: 1,
                  population: 1,
                },
              },
            ],
          },
          {
            from: "master_provinces",
            let: { provinceId: "$province_id" },
            as: "Province",
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$provinceId"] },
                },
              },
              {
                $project: {
                  name: 1,
                  population: 1,
                },
              },
            ],
          },
        ],
      });
      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;
      return res.status(200).json({
        code: 200,
        success: true,
        message: `City get successfully.`,
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
module.exports = CityApi;
