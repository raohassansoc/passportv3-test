const IntegrationPartner = require("../../models/IntegrationPartner/IntegrationPartner");
const Merchant = require("../../models/Merchant/Merchant");
const Restaurant = require("../../models/Restaurant/Restaurant");
const crudServices = require("../../services/mongo.crud.services");

const StatisticApi = () => {
  const calculate_statistics = async (req, res) => {
    try {
      let whereClause_ip = {};
      whereClause_ip.is_deleted = false;

      let executing_parameters_ip = {
        where: whereClause_ip,
      };
      const integration_partner_details = await crudServices.get(
        IntegrationPartner,
        executing_parameters_ip
      );

      let whereClause_merchant = {};
      whereClause_merchant.is_deleted = false;

      let executing_parameters_merchant = {
        where: whereClause_merchant,
      };
      const merchant_details = await crudServices.get(
        Merchant,
        executing_parameters_merchant
      );

      let whereClause_res = {};
      whereClause_res.is_deleted = false;

      let executing_parameters_res = {
        where: whereClause_res,
      };
      const restaurant_details = await crudServices.get(
        Restaurant,
        executing_parameters_res
      );

      let analytics_data = {};
      analytics_data.integration_partner_count =
        integration_partner_details.data.length;
      analytics_data.merchant_count = merchant_details.data.length;
      analytics_data.restaurant_count = restaurant_details.data.length;

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Analytics calculated Successfully.",
        data: analytics_data,
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
    calculate_statistics,
  };
};

module.exports = StatisticApi;
