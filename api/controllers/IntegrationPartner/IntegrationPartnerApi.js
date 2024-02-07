const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { ObjectId } = require("mongodb");
const IntegrationPartner = require("../../models/IntegrationPartner/IntegrationPartner");
const {
  IntegrationPartnerSchema,
} = require("../../schemas/IntegrationPartnerSchema");
const awsHelper = require("../../helper/awsHelper");
const Restaurants = require("../../models/Restaurant/Restaurant");
const DeletedRestaurant = require("../../models/Restaurant/DeletedRestaurant");

const IntegrationPartnerApi = () => {
  const save = async (req, res) => {
    await validationService.convertIntObj(req.body);
    if (req.body._id) {
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause._id = ObjectId(req.body._id);

      let executing_parameters = {
        where: whereClause,
      };

      let found_data = await crudServices.get(
        IntegrationPartner,
        executing_parameters
      );
      if (req.files != null) {
        if (req.files.nda != undefined) {
          if (found_data.data[0].nda)
            await awsHelper.deleteSingleImageFilefromS3fromBackend(
              found_data.data[0].nda
            );
          var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
            req.files.nda
          );
          req.body.nda = url;
        }
        if (req.files.trading_license != undefined) {
          if (found_data.data[0].trading_license)
            await awsHelper.deleteSingleImageFilefromS3fromBackend(
              found_data.data[0].trading_license
            );
          var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
            req.files.trading_license
          );
          req.body.trading_license = url;
        }
        if (req.files.contract != undefined) {
          if (found_data.data[0].contract)
            await awsHelper.deleteSingleImageFilefromS3fromBackend(
              found_data.data[0].contract
            );
          var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
            req.files.contract
          );
          req.body.contract = url;
        }
      }
    } else {
      if (req.files != null) {
        if (req.files.nda != undefined) {
          var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
            req.files.nda
          );
          req.body.nda = url;
        }
        if (req.files.trading_license != undefined) {
          var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
            req.files.trading_license
          );
          req.body.trading_license = url;
        }
        if (req.files.contract != undefined) {
          var url = await awsHelper.uploadSingleImageFiletoS3fromBackend(
            req.files.contract
          );
          req.body.contract = url;
        }
      }
    }
    validationService
      .validate(req.body, IntegrationPartnerSchema)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id) {
            await crudServices.update(
              IntegrationPartner,
              { _id: reqData._id },
              reqData
            );
          } else {
            reqData.status_id = ObjectId("651e6478ce8c4f45f6ba9788");
            response = await crudServices.insert(IntegrationPartner, reqData);
          }
          return res.status(201).json({
            code: 200,
            success: true,
            message: `Integration Partner ${
              reqData._id ? "Details Updated" : "On Boarded"
            } successfully`,
            data: response || {},
          });
        } catch (error) {
          console.log(105, error);
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

  const destroy = async (req, res) => {
    try {
      if (req.body.record_id) {
        await crudServices.destroy(IntegrationPartner, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Integration Partner Details deleted successfully.`,
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

      let populate = [
        {
          from: "integration_partner_statuses",
          let: { statusId: "$status_id" },
          as: "Status",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$statusId"] },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "industry_types",
          let: { industryTypesId: "$industry_type_id" },
          as: "InustryTypes",
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$industryTypesId"] },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
      ];

      let executing_parameters = {
        where: whereClause,
        projection: {
          __v: 0,
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
        },
        skip: skip,
        limit: limit,
        populate: populate,
      };

      let response = await crudServices.get(
        IntegrationPartner,
        executing_parameters
      );

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      let final_response = [];
      if (req.query.industry_type_id) {
        for (let data of response.data) {
          for (let ith_industry_id of data.industry_type_id) {
            if (ith_industry_id == req.query.industry_type_id) {
              final_response.push(data);
              break;
            }
          }
        }
      }

      return res.status(200).json({
        code: 200,
        success: true,
        message: `Integration Partner Details get successfully.`,
        data: req.query.industry_type_id ? final_response : response.data,
        page_info: page_info,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };

  const show_tree = async (req, res) => {
    if (req.query.ip_id == undefined || req.query.ip_id == "")
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Please Provide Integration Partner Id.",
      });

    try {
      let whereClause = {
        is_deleted: false,
        _id: ObjectId(req.query.ip_id),
      };

      let populate = [
        {
          from: "integration_partner_statuses",
          let: { statusId: "$status_id" },
          as: "Status",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$statusId"] },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "restaurants",
          let: { ipId: "$_id" },
          as: "Restaurants",
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$$ipId", "$ip_id"] },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
      ];

      let executing_parameters = {
        where: whereClause,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
        },
        populate: populate,
      };

      let tree = await crudServices.get(
        IntegrationPartner,
        executing_parameters
      );

      tree.data[0].RestaurantsCount = tree.data[0].Restaurants.length;

      return res.status(200).json({
        code: 200,
        success: true,
        data: tree.data[0],
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

  const delete_ip_and_on_board_all_restaurants = async (req, res) => {
    if (req.body.ip_id == undefined || req.body.ip_id == "")
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Please Provide Integration Partner Id.",
      });

    try {
      let whereClause = {
        is_deleted: false,
        _id: ObjectId(req.body.ip_id),
      };

      let populate = [
        {
          from: "restaurants",
          let: { ipId: "$_id" },
          as: "Restaurants",
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$$ipId", "$ip_id"] },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
      ];

      let executing_parameters = {
        where: whereClause,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
        },
        populate: populate,
      };

      let tree = await crudServices.get(
        IntegrationPartner,
        executing_parameters
      );

      const restaurantIds = tree.data[0].Restaurants.map((r) => r._id);
      await Promise.all([
        crudServices.updateMany(
          Restaurants,
          { _id: { $in: restaurantIds } },
          { ip_id: [], restaurant_uuid: "" }
        ),
        crudServices.destroy(IntegrationPartner, { _id: req.body.ip_id }),
      ]);

      return res.status(200).json({
        code: 200,
        success: true,
        message:
          "Integration Partner removed and all Properties are on-boarded.",
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        success: false,
        mess: "Internal Server Error",
      });
    }
  };

  const delete_ip_and_move_restaurant_data = async (req, res) => {
    if (req.body.ip_id == undefined || req.body.ip_id == "")
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Please Provide Integration Partner Id.",
      });

    try {
      let whereClause = {
        is_deleted: false,
        _id: ObjectId(req.body.ip_id),
      };

      let populate = [
        {
          from: "restaurants",
          let: { ipId: "$_id" },
          as: "Restaurants",
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$$ipId", "$ip_id"] },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
      ];

      let executing_parameters = {
        where: whereClause,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
        },
        populate: populate,
      };

      let tree = await crudServices.get(
        IntegrationPartner,
        executing_parameters
      );

      const promises = tree.data[0].Restaurants.map(async (r_data) => {
        await Promise.all([
          crudServices.insert(DeletedRestaurant, r_data),
          crudServices.destroyHard(Restaurants, { _id: r_data._id }),
        ]);
      });

      await Promise.all(promises);
      await crudServices.destroy(IntegrationPartner, { _id: req.body.ip_id });

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Integration Partner removed and all Properties are removed.",
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        success: false,
        mess: "Internal Server Error",
      });
    }
  };

  return {
    save,
    destroy,
    get,
    show_tree,
    delete_ip_and_on_board_all_restaurants,
    delete_ip_and_move_restaurant_data,
  };
};
module.exports = IntegrationPartnerApi;
