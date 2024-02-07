const businessRoutes = {
  "GET /business/get": "BusinessApi.get",
  "POST /business/save": "BusinessApi.save",
  "POST /business/delete": "BusinessApi.destroy",

  "GET /business-category/get": "BusinessCategoryApi.get",
  "POST /business-category/save": "BusinessCategoryApi.save",
  "POST /business-category/delete": "BusinessCategoryApi.destroy",

  "GET /location/get": "LocationApi.get",
  "POST /location/save": "LocationApi.save",
  "POST /location/delete": "LocationApi.destroy",

  "GET /real-estate/get": "RealEstateApi.get",
  "POST /real-estate/save": "RealEstateApi.save",
  "POST /real-estate/delete": "RealEstateApi.destroy",

  "GET /real-estate-category/get": "RealEstateCategoryApi.get",
  "POST /real-estate-category/save": "RealEstateCategoryApi.save",
  "POST /real-estate-category/delete": "RealEstateCategoryApi.destroy",
};

module.exports = businessRoutes;
