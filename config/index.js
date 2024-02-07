const mapRoutes = require("express-routes-mapper");
const masterRoutes = require("./routes/masterRoutes");
const ieoRoutes = require("./routes/ieoRoutes");
const merchantRoutes = require("./routes/merchantRoutes");
const passesRoutes = require("./routes/passesRoutes");
const passportsRoutes = require("./routes/passportsRoutes");
const visasRoutes = require("./routes/visasRoutes");
const authRoutes = require("./routes/authRoutes");
const payRoutes = require("./routes/payRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const settlementRoutes = require("./routes/settlementRoutes");
const rawRoutes = require("./routes/rawRoutes");
const qrRoutes = require("./routes/qrRoutes");
const businessRoutes = require("./routes/businessRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const integrationPartnerRoutes = require("./routes/integrationPartnerRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const eventRoutes = require("./routes/eventRoutes");
const promocodeRoutes = require("./routes/promocodeRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const fiatTransactionRoutes = require("./routes/fiatTransactionRoutes");
const testRoute = require("./routes/testRoute")

const config = {
  migrate: true,
  mappedMasterRoutes: mapRoutes(masterRoutes, "api/controllers/Master/"),
  mappedIeoRoutes: mapRoutes(ieoRoutes, "api/controllers/IEO/"),
  mappedMerchantRoutes: mapRoutes(merchantRoutes, "api/controllers/Merchant/"),
  mappedPassesRoutes: mapRoutes(passesRoutes, "api/controllers/Passes/"),
  mappedPassportsRoutes: mapRoutes(
    passportsRoutes,
    "api/controllers/Passports/"
  ),
  mappedTransactionRoutes: mapRoutes(
    transactionRoutes,
    "api/controllers/Transaction/"
  ),
  mappedSettlementRoutes: mapRoutes(
    settlementRoutes,
    "api/controllers/Settlement/"
  ),
  mappedVisasRoutes: mapRoutes(visasRoutes, "api/controllers/Visas/"),
  mappedPayRoutes: mapRoutes(payRoutes, "api/controllers/Pay/"),
  mappedQRRoutes: mapRoutes(qrRoutes, "api/controllers/QR/"),
  mappedRawRoutes: mapRoutes(rawRoutes, "api/controllers/Raw/"),
  mappedBusinessRoutes: mapRoutes(businessRoutes, "api/controllers/Business/"),
  mappedRestaurantRoutes: mapRoutes(
    restaurantRoutes,
    "api/controllers/Restaurant/"
  ),
  mappedIntegrationPartnerRoutes: mapRoutes(
    integrationPartnerRoutes,
    "api/controllers/IntegrationPartner/"
  ),
  mappedEmployeeRoutes: mapRoutes(employeeRoutes, "api/controllers/Employee/"),
  mappedAdminRoutes: mapRoutes(adminRoutes, "api/controllers/Admin/"),
  mappedAnalyticsRoutes: mapRoutes(
    analyticsRoutes,
    "api/controllers/Statistic/"
  ),
  mappedEventRoutes: mapRoutes(eventRoutes, "api/controllers/Event/"),
  mappedPromocodeRoutes: mapRoutes(
    promocodeRoutes,
    "api/controllers/PromoCode/"
  ),
  mappedBookingRoutes: mapRoutes(bookingRoutes, "api/controllers/Booking/"),
  mappedStripeRoutes: mapRoutes(stripeRoutes, "api/controllers/Stripe/"),
  mappedFiatTransactionRoutes: mapRoutes(
    fiatTransactionRoutes,
    "api/controllers/FiatTransaction/"
  ),
  // test
  mappedTestRoute: mapRoutes(testRoute, "api/controllers/Test/"),
  port: process.env.PORT || "5020",
};

module.exports = config;
