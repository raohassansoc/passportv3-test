const promocodeRoutes = {
  "GET /discount-type/get": "DiscountTypeApi.get",
  "POST /discount-type/save": "DiscountTypeApi.save",
  "POST /discount-type/delete": "DiscountTypeApi.destroy",

  "GET /promo-code/get": "PromoCodeApi.get",
  "POST /promo-code/save": "PromoCodeApi.save",
  "POST /promo-code/delete": "PromoCodeApi.destroy",
  "POST /promo-code/bulk/create": "PromoCodeApi.create_list_of_promocodes",
};

module.exports = promocodeRoutes;
