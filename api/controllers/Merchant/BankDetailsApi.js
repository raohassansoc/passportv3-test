const BankDetailsModel = require("../../models/Merchant/BankDetails");
const { BankDetailsSchemas } = require("../../schemas/MerchantSchemas");
const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { ObjectId } = require("mongodb");

const BankDetailsApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, BankDetailsSchemas)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id) {
            await crudServices.update(
              BankDetailsModel,
              { _id: reqData._id },
              reqData
            );
          } else {
            response = await crudServices.insert(BankDetailsModel, reqData);
          }
          return res.status(201).json({
            code: 200,
            success: true,
            message: `Merchant Bank Details ${
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

  const destroy = async (req, res) => {
    try {
      if (req.body.record_id) {
        await crudServices.destroy(BankDetailsModel, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Bank Details deleted successfully.`,
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
        whereClause.$or = [
          { bank_name: { $regex: new RegExp("^" + req.query.keyword, "i") } },
          { iban: { $regex: new RegExp("^" + req.query.keyword, "i") } },
          {
            swift_code: {
              $regex: new RegExp("^" + req.query.keyword, "i"),
            },
          },
          {
            bank_branch_code: {
              $regex: new RegExp("^" + req.query.keyword, "i"),
            },
          },
          {
            account_holder_name: {
              $regex: new RegExp("^" + req.query.keyword, "i"),
            },
          },
        ];
      }
      if (req.query._id) {
        whereClause._id = ObjectId(req.query._id);
      }
      if (req.query.bank_city_id) {
        whereClause.bank_city_id = ObjectId(req.query.bank_city_id);
      }
      if (req.query.bank_province_id) {
        whereClause.bank_province_id = ObjectId(req.query.bank_province_id);
      }
      if (req.query.bank_country_id) {
        whereClause.bank_country_id = ObjectId(req.query.bank_country_id);
      }
      if (req.query.merchant_id) {
        whereClause.merchant_id = ObjectId(req.query.merchant_id);
      }
      if (req.query.account_type_id) {
        whereClause.account_type_id = ObjectId(req.query.account_type_id);
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

      const executing_parameters = {
        where: whereClause,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          updated_at: 0,
          created_at: 0,
        },
        skip: skip,
        limit: limit,
        sortField: "name",
      };

      let response = await crudServices.get(
        BankDetailsModel,
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
        message: `Bank Details fetched successfully.`,
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

module.exports = BankDetailsApi;
