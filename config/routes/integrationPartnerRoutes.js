const integrationPartnerRoutes = {
  "GET /integration-partner/api-list/get": "ApiListApi.get",
  "POST /integration-partner/api-list/save": "ApiListApi.save",
  "POST /integration-partner/api-list/delete": "ApiListApi.destroy",

  "GET /integration-partner/attribute-mapping/get": "AttributeMappingApi.get",
  "POST /integration-partner/attribute-mapping/save":
    "AttributeMappingApi.save",
  "POST /integration-partner/attribute-mapping/delete":
    "AttributeMappingApi.destroy",

  "GET /integration-partner/get": "IntegrationPartnerApi.get",
  "POST /integration-partner/save": "IntegrationPartnerApi.save",
  "POST /integration-partner/delete": "IntegrationPartnerApi.destroy",
  "GET /integration-partner/tree": "IntegrationPartnerApi.show_tree",
  "DELETE /integration-partner/on-board-property-of-ip":
    "IntegrationPartnerApi.delete_ip_and_on_board_all_restaurants",

  "DELETE /integration-partner/remove-all-ip-data":
    "IntegrationPartnerApi.delete_ip_and_move_restaurant_data",

  "GET /integration-partner-status/get": "IntegrationPartnerStatusApi.get",
  "POST /integration-partner-status/save": "IntegrationPartnerStatusApi.save",
  "POST /integration-partner-status/delete":
    "IntegrationPartnerStatusApi.destroy",

  "GET /industry-type/get": "IndustryTypeApi.get",
  "POST /industry-type/save": "IndustryTypeApi.save",
  "POST /industry-type/delete": "IndustryTypeApi.destroy",
};

module.exports = integrationPartnerRoutes;
