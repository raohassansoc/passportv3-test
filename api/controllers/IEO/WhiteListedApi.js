const WhiteListedModel = require("../../models/IEO/WhiteListed");
const { WhiteListedSchemas } = require("../../schemas/IeoSchemas");
const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { ObjectId } = require("mongodb");

const WhiteListedApi = () => {
  // For create and update WhiteListed
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, WhiteListedSchemas)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id) {
            await crudServices.update(
              WhiteListedModel,
              { _id: ObjectId(reqData._id) },
              reqData
            );
          } else {
            response = await crudServices.insert(WhiteListedModel, reqData);
          }
          return res.status(201).json({
            code: 200,
            success: true,
            message: `WhiteListed ${
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
  // for deleting WhiteListed
  const destroy = async (req, res) => {
    try {
      if (req.body.record_id) {
        await crudServices.destroy(WhiteListedModel, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `WhiteListed deleted successfully.`,
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
      let response = await crudServices.get(WhiteListedModel, {
        where: whereClause,
        projection: {
          _id: 1,
          first_name: 1,
          last_name: 1,
          email_id: 1,
          whatsapp_number: 1,
          job_title: 1,
          company_name: 1,
          is_terms_condition: 1,
        },
        skip: skip,
        limit: limit,
        sortField: "email_id",
      });
      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;
      return res.status(200).json({
        code: 200,
        success: true,
        message: `WhiteListed get successfully.`,
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
module.exports = WhiteListedApi;
