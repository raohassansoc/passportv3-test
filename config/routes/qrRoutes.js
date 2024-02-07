const qrRoutes = {
  "GET /qr/get": "QRApi.get",
  "POST /qr/save": "QRApi.save",
  "POST /qr/delete": "QRApi.destroy",
  "POST /qr/generate": "QRApi.generate_qr_code",
  "POST /qr/transaction/status": "QRApi.get_transaction_details_by_qr_id",
};

module.exports = qrRoutes;
