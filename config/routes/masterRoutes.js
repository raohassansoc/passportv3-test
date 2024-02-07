const masterRoutes = {
  // creating routes for country
  "GET /country/get": "CountryApi.get",
  "POST /country/save": "CountryApi.save",
  "POST /country/delete": "CountryApi.destroy",
  // 'GET /country': 'CountryApi.data',

  // creating routes for province
  "GET /province/get": "ProvinceApi.get",
  "POST /province/save": "ProvinceApi.save",
  "POST /province/delete": "ProvinceApi.destroy",

  // creating routes for city
  "GET /city/get": "CityApi.get",
  "POST /city/save": "CityApi.save",
  "POST /city/delete": "CityApi.destroy",

  // creating routes for zipcode
  "GET /zipcode/get": "ZipCodeApi.get",
  "POST /zipcode/save": "ZipCodeApi.save",
  "POST /zipcode/delete": "ZipCodeApi.destroy",

  // creating routes for Equity
  "GET /equity/get": "EquityApi.get",
  "POST /equity/save": "EquityApi.save",
  "POST /equity/delete": "EquityApi.destroy",

  // creating routes for currency category
  "GET /currency-category/get": "CurrencyCategoryApi.get",
  "POST /currency-category/save": "CurrencyCategoryApi.save",
  "POST /currency-category/delete": "CurrencyCategoryApi.destroy",

  // creating routes for currency
  "GET /currency/get": "CurrencyApi.get",
  "POST /currency/save": "CurrencyApi.save",
  "POST /currency/delete": "CurrencyApi.destroy",
};

module.exports = masterRoutes;
