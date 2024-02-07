const adminRoutes = {
  "GET /admin/get": "AdminApi.get",
  "POST /admin/save": "AdminApi.save",
  "POST /admin/delete": "AdminApi.destroy",
  "POST /admin/login": "AdminApi.adminLogin",

  "GET /admin-category/get": "AdminCategoryApi.get",
  "POST /admin-category/save": "AdminCategoryApi.save",
  "POST /admin-category/delete": "AdminCategoryApi.destroy",
};

module.exports = adminRoutes;
