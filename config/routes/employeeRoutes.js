const employeeRoutes = {
  "GET /employee/get": "EmployeeApi.get",
  "POST /employee/save": "EmployeeApi.save",
  "POST /employee/delete": "EmployeeApi.destroy",

  "GET /employee-status/get": "StatusApi.get",
  "POST /employee-status/save": "StatusApi.save",
  "POST /employee-status/delete": "StatusApi.destroy",

  "GET /employee-designation/get": "DesignationApi.get",
  "POST /employee-designation/save": "DesignationApi.save",
  "POST /employee-designation/delete": "DesignationApi.destroy",
};

module.exports = employeeRoutes;
