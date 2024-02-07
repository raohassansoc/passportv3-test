const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const CurrencyModel = require("../../models/Master/Currency");
const { CurrencySchema } = require("../../schemas/MasterSchemas");
const { ObjectId } = require("mongodb");
const awsHelper = require("../../helper/awsHelper");

const CurrencyApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    if (req.body._id) {
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause._id = ObjectId(req.body._id);

      let executing_parameters = {
        where: whereClause,
        projection: {
          currency_abi: 1,
          currency_icon: 1,
        },
      };

      let found_data = await crudServices.get(
        CurrencyModel,
        executing_parameters
      );

      console.log(found_data);

      if (req.files != null) {
        if (req.files.currency_abi != undefined) {
          if (found_data.data[0].currency_abi)
            await awsHelper.deleteJSONFilefromS3fromBackend(
              found_data.data[0].currency_abi
            );
          var url = await awsHelper.uploadJSONFiletoS3fromBackend(
            req.files.currency_abi
          );
          req.body.currency_abi = url;
        }
        if (req.files.currency_icon != undefined) {
          if (found_data.data[0].currency_icon)
            await awsHelper.deleteJSONFilefromS3fromBackend(
              found_data.data[0].currency_icon
            );
          var url = await awsHelper.uploadJSONFiletoS3fromBackend(
            req.files.currency_icon
          );
          req.body.currency_icon = url;
        }
      }
      req.body.id = parseInt(req.body.id);
    } else {
      if (req.files != null) {
        if (req.files.currency_abi != undefined) {
          var url = await awsHelper.uploadJSONFiletoS3fromBackend(
            req.files.currency_abi
          );
          req.body.currency_abi = url;
        }
        if (req.files.currency_icon != undefined) {
          var url = await awsHelper.uploadJSONFiletoS3fromBackend(
            req.files.currency_icon
          );
          req.body.currency_icon = url;
        }
      }
    }
    validationService
      .validate(req.body, CurrencySchema)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id)
            response = await crudServices.update(
              CurrencyModel,
              { _id: reqData._id },
              reqData
            );
          else response = await crudServices.insert(CurrencyModel, reqData);
          return res.status(201).json({
            code: 200,
            success: true,
            message: `Currency ${
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
      if (req.query.currency_category_id)
        whereClause.currency_category_id = ObjectId(
          req.query.currency_category_id
        );
      if (req.query.network) whereClause.network = req.query.network;
      if (req.query.keyword)
        whereClause.$or = [
          {
            currency_code: { $regex: new RegExp("^" + req.query.keyword, "i") },
          },
          {
            currency_address: {
              $regex: new RegExp("^" + req.query.keyword, "i"),
            },
          },
        ];
      if (req.query.currency_code)
        whereClause.currency_code = req.query.currency_code;
      if (req.query.currency_address)
        whereClause.currency_address = req.query.currency_address;

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
          _id: 1,
          currency_code: 1,
          currency_address: 1,
          currency_category_id: 1,
          currency_abi: 1,
          currency_name: 1,
          currency_icon: 1,
        },
      };

      let response = await crudServices.get(
        CurrencyModel,
        executing_parameters
      );

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Currency get successfully.",
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
        await crudServices.destroy(CurrencyModel, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Currency deleted successfully.`,
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

module.exports = CurrencyApi;
