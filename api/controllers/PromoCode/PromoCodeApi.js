const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { ObjectId } = require("mongodb");
const { PromoCodeSchema } = require("../../schemas/PromoCodeSchema");
const PromoCode = require("../../models/PromoCode/PromoCode");
const crypto = require("crypto");

const PromoCodeApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, PromoCodeSchema)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id) {
            if (reqData.event_id) {
              let promocode = await crudServices.get(PromoCode, {
                where: { _id: ObjectId(reqData._id), is_deleted: false },
              });
              promocode.data[0].event_list_ids.push(ObjectId(reqData.event_id));
              reqData.event_list_ids = promocode.data[0].event_list_ids;
            }
            response = await crudServices.update(
              PromoCode,
              { _id: reqData._id },
              reqData
            );
          } else {
            response = await crudServices.insert(PromoCode, reqData);
          }
          return res.status(201).json({
            code: 200,
            success: true,
            message: `Promo Code Details ${
              reqData._id ? "updated" : "created"
            } successfully.`,
            data: response || {},
          });
        } catch (error) {
          console.log(error);
          return res.status(501).json({
            code: 501,
            success: false,
            message: "Internal Server Error.",
            error: error,
          });
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
      if (req.query.discount_type_id)
        whereClause.discount_type_id = ObjectId(req.query.discount_type_id);
      if (req.query.keyword)
        whereClause.code = { $regex: req.query.keyword, $options: "i" };
      if (req.query.is_redeemed != undefined)
        whereClause.is_redeemed = JSON.parse(req.query.is_redeemed);

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

      let populate = [
        {
          from: "discount_types",
          let: { discountTypeId: "$discount_type_id" },
          as: "DiscountType",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$discountTypeId"] },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                ip_id: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "events",
          let: { eventListIds: "$event_list_ids" },
          as: "Events",
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$eventListIds"] },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                ip_id: 0,
                __v: 0,
              },
            },
          ],
        },
      ];

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
        populate: populate,
      };

      let response = await crudServices.get(PromoCode, executing_parameters);

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      let final_data = [];
      if (req.query.event_id) {
        for (let ith_promo_code of response.data) {
          if (ith_promo_code.event_list_ids[0] == req.query.event_id)
            final_data.push(ith_promo_code);
        }
      }

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Promo Code get successfully.",
        data: req.query.event_id ? final_data : response.data,
        page_info: page_info,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
        error: error,
      });
    }
  };

  const destroy = async (req, res) => {
    try {
      if (req.body.record_id) {
        await crudServices.destroy(PromoCode, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Promo Code deleted successfully.`,
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
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
        error: error,
      });
    }
  };

  function generateRandomHex(length) {
    return crypto
      .randomBytes(length / 2)
      .toString("hex")
      .toUpperCase();
  }

  const create_list_of_promocodes = async (req, res) => {
    let {
      event_id,
      no_of_codes,
      discount_value,
      discount_type_id,
      description,
    } = req.body;

    if (!event_id || !no_of_codes || !discount_value || !discount_type_id)
      return res.status(401).json({
        code: 401,
        success: false,
        message:
          "Please Provide No Of codes to generate with Percentage value.",
      });

    if (no_of_codes > 500)
      return res.status(401).json({
        code: 401,
        success: false,
        message: "More than 500 Promo codes can not be generated at ones.",
      });

    if (discount_value < 0 || discount_value > 100)
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Invalid Percentge discount of Promo code.",
      });

    try {
      for (let i = 0; i < no_of_codes; ++i) {
        const random_hex_promo_code = generateRandomHex(8);

        let ith_promo_code_body = {};
        ith_promo_code_body.code = random_hex_promo_code;
        ith_promo_code_body.discount_type_id = ObjectId(discount_type_id);
        ith_promo_code_body.discount_value = parseInt(discount_value);
        ith_promo_code_body.event_list_ids = [];
        ith_promo_code_body.event_list_ids.push(event_id);
        if (description) ith_promo_code_body.description = description;
        await crudServices.insert(PromoCode, ith_promo_code_body);
      }

      return res.status(201).json({
        code: 201,
        success: true,
        message: `${no_of_codes} Promo Codes Generated.`,
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

  return {
    save,
    get,
    destroy,
    create_list_of_promocodes,
  };
};

module.exports = PromoCodeApi;
