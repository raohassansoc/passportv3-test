const TrustedComms = require("twilio/lib/rest/preview/TrustedComms");
const walletService = require("../../services/wallet.services");
const axios = require("axios");
require("dotenv").config();

const OnRampApi = () => {
  function getCurrentUtcTimestamp() {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const validTimestamp = currentTimestamp + 300;
    return validTimestamp * 1000;
  }

  const onRampAccessToken = async (req, res) => {
    try {
      if (req.body.email) {
        const currentUtcTimestamp = getCurrentUtcTimestamp();
        req.body.timestamp = currentUtcTimestamp;
        let data = await walletService.onRampSign(req.body);
        delete req.body.timestamp;
        const config = {
          headers: {
            sign: data,
            timestamp: currentUtcTimestamp,
            appid: process.env.alchemypay_app_id,
          },
        };
        const url =
          "https://openapi-test.alchemypay.org/open/api/v3/merchant/getToken";

        axios
          .post(url, req.body, config)
          .then((response) => {
            return res.status(200).json({
              code: 200,
              success: true,
              message: `Order Created successfully.`,
              data: response.data.data,
            });
          })
          .catch((err) => {
            console.log(err);
            return res.status(207).json({
              code: 207,
              success: false,
              message: `Internal Server Error`,
              data: err,
            });
          });
      } else {
        return res.status(207).json({
          code: 207,
          success: false,
          message: `Invalid Url Parameters`,
          data: {},
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  }; // deprecated

  const onRampCreateOrder = async (req, res) => {
    try {
      const currentUtcTimestamp = getCurrentUtcTimestamp();
      req.body.timestamp = currentUtcTimestamp;

      req.body.redirectUrl = process.env.PASSPORT_ONRAMP_REDIRECT_URL;
      req.body.callbackUrl = process.env.PASSPORT_ONRAMP_REDIRECT_URL;
      req.body.failRedirectUrl = process.env.PASSPORT_ONRAMP_CALLBACK_URL;
      req.body.merchantName = "@Passport";

      let data = await walletService.onRampSign(req.body);
      delete req.body.timestamp;

      const config = {
        headers: {
          "access-token":
            "ACH9469107258@ACH@4LraXaMnSYy+O8QyBx88Gg==@PAY@dm95auID/Xq1UDYEnkZZSuekdT7sSc9oyRaRV/PDH+s=@IO@j3jUIFXxuf9hVRGIj2E5QFbfeF8LQ0LkuY/4e8OMeG+0yWdM+DLjlAkX0IsVrJ7JnfywksmTdVxiv9VWOi0MwQ==",
          sign: data,
          timestamp: currentUtcTimestamp,
          appid: process.env.alchemypay_app_id,
        },
      };

      const url =
        "https://openapi-test.alchemypay.org/open/api/v3/merchant/trade/create";

      axios
        .post(url, req.body, config)
        .then((response) => {
          return res.status(200).json({
            code: 200,
            success: true,
            message: `Order Created successfully.`,
            data: response.data.data,
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(501).json({
            code: 501,
            success: false,
            message: `Internal Server Error`,
            data: err,
          });
        });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
        error: error,
      });
    }
  }; // deprecated

  const newOnRampOrder = async (req, res) => {
    if (
      req.body.email == undefined ||
      req.body.email == "" ||
      req.body.side == undefined ||
      req.body.side == "" ||
      req.body.cryptoCurrency == undefined ||
      req.body.cryptoCurrency == "" ||
      req.body.address == undefined ||
      req.body.address == "" ||
      req.body.network == undefined ||
      req.body.network == "" ||
      req.body.fiatCurrency == undefined ||
      req.body.fiatCurrency == "" ||
      req.body.amount == undefined ||
      req.body.amount == "" ||
      req.body.depositType == undefined ||
      req.body.depositType == "" ||
      req.body.payWayCode == undefined ||
      req.body.payWayCode == "" ||
      req.body.alpha2 == undefined ||
      req.body.alpha2 == ""
    ) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Missing Required details for Crypto Purchase.",
      });
    }

    try {
      const currentUtcTimestamp = getCurrentUtcTimestamp();
      req.body.timestamp = currentUtcTimestamp;

      let data = await walletService.onRampSign({
        email: req.body.email,
        timestamp: req.body.timestamp,
      });

      delete req.body.timestamp;

      const config = {
        headers: {
          sign: data,
          timestamp: currentUtcTimestamp,
          appid: process.env.alchemypay_app_id,
        },
      };

      const url =
        "https://openapi-test.alchemypay.org/open/api/v3/merchant/getToken";

      const access_token_response = await axios.post(
        url,
        { email: req.body.email },
        config
      );

      delete req.body.email;

      req.body.callbackUrl = process.env.PASSPORT_ONRAMP_REDIRECT_URL;
      req.body.failRedirectUrl = process.env.PASSPORT_ONRAMP_CALLBACK_URL;
      req.body.merchantName = "@Passport";

      const currentUtcTimestamp2 = getCurrentUtcTimestamp();
      req.body.timestamp = currentUtcTimestamp2;

      let data2 = await walletService.onRampSign(req.body);
      delete req.body.timestamp;

      const config2 = {
        headers: {
          "access-token": access_token_response.data.data.accessToken,
          sign: data2,
          timestamp: currentUtcTimestamp2,
          appid: process.env.alchemypay_app_id,
        },
      };

      const url2 =
        "https://openapi-test.alchemypay.org/open/api/v3/merchant/trade/create";
      const order_response = await axios.post(url2, req.body, config2);

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Order Created Successfully.",
        data: order_response.data.data,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
        error: error,
      });
    }
  };

  const on_ramp_payment_success_handler = async (req, res) => {
    if (req.body.txHash) {
      console.log("Fiat Transaction Complete + crypto transferred.");
      console.log(req.body);
      console.log(
        "Code : 201 , all payment verification process should be done after this point."
      );
      console.log(
        "Use of Web socket to notify user that crypto has been transaferred."
      );
      console.log("Fiat Transaction Complete + crypto transferred.");
      return res.status(201).json({
        code: 201,
        success: true,
        message: "Fiat Payment complete + Crypto Transafered.",
        data: req.body,
      });
    } else {
      console.log("Fiat Transaction Complete + crypto yet to be transferred.");
      console.log(req.body);
      console.log("Code : 304 , no process.");
      console.log("App Redirection should be done after this point.");
      console.log("Fiat Transaction Complete + crypto yet to be transferred.");
      return res.status(304).json({
        code: 304,
        success: true,
        message: "Fiat Payment complete + Crypto is yet to be Transafered.",
      });
    }
  };

  const on_ramp_payment_failure_handler = async (req, res) => {
    console.log("payment failure", req.body);
    res.status(200).json({
      code: 200,
      success: true,
      message: "Payment Failed!!",
      data: {},
    });
  };

  const cryptoList = async (req, res) => {
    try {
      const currentUtcTimestamp = getCurrentUtcTimestamp();
      req.body.timestamp = currentUtcTimestamp;
      let data = await walletService.onRampSign(req.body);

      delete req.body.timestamp;
      const config = {
        headers: {
          sign: data,
          timestamp: currentUtcTimestamp,
          appid: process.env.alchemypay_app_id,
        },
      };
      const url =
        "https://openapi-test.alchemypay.org/open/api/v3/merchant/crypto/list";

      let unfiltered_crypto_list;
      try {
        unfiltered_crypto_list = await axios.get(url, config);
      } catch (error) {
        console.log(error);
        return res.status(501).json({
          code: 501,
          success: false,
          message: "Internal Server Error.",
        });
      }

      if (req.query.network) {
        const network_filtered_data = unfiltered_crypto_list.data.data.filter(
          (obj) => obj.network == req.query.network
        );
        unfiltered_crypto_list.data.data = network_filtered_data;
      }

      if (req.query.crypto) {
        const crypto_filtered_data = unfiltered_crypto_list.data.data.filter(
          (obj) => obj.crypto == req.query.crypto
        );
        unfiltered_crypto_list.data.data = crypto_filtered_data;
      }

      return res.status(201).json({
        code: 201,
        success: true,
        message: "Crypto List Fetched Successfully.",
        data: unfiltered_crypto_list.data.data,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
        error: error,
      });
    }
  };

  const fiatList = async (req, res) => {
    try {
      const currentUtcTimestamp = getCurrentUtcTimestamp();
      req.body.timestamp = currentUtcTimestamp;
      let data = await walletService.onRampSign(req.body);

      delete req.body.timestamp;
      const config = {
        headers: {
          sign: data,
          timestamp: currentUtcTimestamp,
          appid: process.env.alchemypay_app_id,
        },
      };
      const url =
        "https://openapi-test.alchemypay.org/open/api/v3/merchant/fiat/list";

      axios
        .get(url, config)
        .then((response) => {
          let final_data = [];
          if (req.query.country) {
            const fiat_country_currency = response.data.data.filter(
              (obj) => obj.country == req.query.country
            );
            final_data = fiat_country_currency;
          }
          return res.status(200).json({
            code: 200,
            success: true,
            message: `Fiat Currency get successfully.`,
            data: req.query.country ? final_data : response.data.data,
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(207).json({
            code: 501,
            success: false,
            message: `Internal Server Error`,
            data: err,
          });
        });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
        error: error,
      });
    }
  };

  const get_tz = async (req, res) => {
    if (
      req.query.latitude == undefined ||
      req.query.latitude == "" ||
      req.query.longitude == undefined ||
      req.query.longitude == ""
    )
      res.status(401).json({
        code: 401,
        success: false,
        message: "Please Provide Location Details.",
      });

    try {
      const current_time = new Date().getTime();

      const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${req.query.latitude}%2C${req.query.longitude}&timestamp=1331161200&key=${process.env.google_map_api_key}`;
      const tz_r = await axios.get(url);
      const time_diff_in_sec = tz_r.data.rawOffset;
      let time_zone_delta = "UTC";
      if (time_diff_in_sec > 0) time_zone_delta = `${time_zone_delta}+`;
      else time_zone_delta = `${time_zone_delta}-`;

      let abs_time_diff_in_sec = Math.abs(time_diff_in_sec);
      let time_diff_in_min = abs_time_diff_in_sec / 60;

      let hour_str;
      if (parseInt(time_diff_in_min / 60) < 10)
        hour_str = `0${parseInt(time_diff_in_min / 60)}`;
      else hour_str = `${parseInt(time_diff_in_min / 60)}`;

      let min_str;
      if (time_diff_in_min % 60 < 10) min_str = `0${time_diff_in_min % 60}`;
      else min_str = `${time_diff_in_min % 60}`;

      time_zone_delta = `${time_zone_delta}${hour_str}:${min_str}`;
      return res.status(200).json({
        code: 200,
        success: true,
        message: "ok!!",
        data: [time_zone_delta, tz_r.data],
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
        error: error,
      });
    }
  };

  const get_fiat_to_crypto_rate = async (req, res) => {
    if (
      req.body.side == undefined ||
      req.body.side == "" ||
      req.body.fiatAmount == undefined ||
      req.body.fiatAmount == "" ||
      req.body.fiatCurrency == undefined ||
      req.body.fiatCurrency == "" ||
      req.body.cryptoQuantity == undefined ||
      req.body.cryptoQuantity == "" ||
      req.body.cryptoCurrency == undefined ||
      req.body.cryptoCurrency == "" ||
      req.body.network == undefined ||
      req.body.network == "" ||
      req.body.payWayCode == undefined ||
      req.body.payWayCode == ""
    )
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Missing required details to get Conversion rate.",
      });

    try {
      const currentUtcTimestamp = getCurrentUtcTimestamp();
      req.body.timestamp = currentUtcTimestamp;

      let signed_tree_data = await walletService.onRampSign(req.body);

      console.log(signed_tree_data);

      delete req.body.timestamp;

      const header_data = {
        headers: {
          sign: signed_tree_data,
          timestamp: currentUtcTimestamp,
          appid: process.env.alchemypay_app_id,
        },
      };

      const url =
        "https://openapi-test.alchemypay.org/open/api/v3/merchant/order/quoted/result";

      const conversion_rate_data = await axios.post(url, req.body, header_data);

      console.log(conversion_rate_data);

      return res.status(201).json({
        code: 201,
        success: true,
        data: conversion_rate_data.data.data,
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
    onRampAccessToken,
    onRampCreateOrder,
    newOnRampOrder,
    cryptoList,
    fiatList,
    get_tz,
    on_ramp_payment_success_handler,
    on_ramp_payment_failure_handler,
    get_fiat_to_crypto_rate,
  };
};

module.exports = OnRampApi;
