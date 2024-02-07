const stripeRoutes = {
  "POST /raw-stripe/create-payment": "StripeApi.createPayment",
  "POST /card-token/create": "StripeApi.createCardToken",
};

module.exports = stripeRoutes;
