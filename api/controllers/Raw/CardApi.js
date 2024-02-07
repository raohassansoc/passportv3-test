const soap = require("soap");

const CardApi = () => {
  const create_card = async (req, res) => {
    let {
      first_name,
      last_name,
      add_line_1,
      add_line_2,
      city,
      state,
      country,
      zipcode,
      phone_number,
      ssn,
      custom1,
      custom2,
      custom3,
      custom4,
      custom5,
      addfld1,
      addfld2,
      addfld3,
      addfld4,
      addfld5,
    } = req.body;

    if (
      !first_name ||
      !last_name ||
      !add_line_1 ||
      !city ||
      !state ||
      !country ||
      !zipcode ||
      !phone_number ||
      !custom1 ||
      !custom2 ||
      !custom3
    )
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Please Provide Required details to Create the Card",
      });

    const url =
      "https://api.prepaidcards.cloud/prepaidcardsmanagement.asmx?WSDL";

    const requestArgs = {
      ApiUserName: process.env.MSWIPE_API_USERNAME,
      ApiPassword: process.env.MSWIPE_API_PASSWORD,
      WalletID: process.env.MSWIPE_WALLET_ID,
      CardIssuerBinID: process.env.MSWIPE_CARD_ISSUER_BIN_ID,
      FirstName: first_name,
      LastName: last_name,
      AdrLine1: add_line_1,
      AdrLine2: add_line_2 ? add_line_2 : "",
      City: city,
      State: state,
      Country: country,
      ZipCode: zipcode,
      PhoneNumber: phone_number,
      SSN: ssn,
      Custom1: custom1,
      Custom2: custom2,
      Custom3: custom3,
      Custom4: custom4,
      Custom5: custom5,
      AddFld1: addfld1,
      AddFld2: addfld2,
      AddFld3: addfld3,
      AddFld4: addfld4,
      AddFld5: addfld5,
    };

    soap.createClient(url, (err, client) => {
      if (err) {
        console.log(err);
        return res.status(501).json({
          code: 501,
          success: false,
          message: "Internal Server Error:Soap.",
        });
      }

      console.log("Soap Client created successfully.");

      client.Card_CreateNew(requestArgs, (e, result) => {
        if (e) {
          console.log(e);
          return res.status(501).json({
            code: 501,
            success: false,
            message: "Internal Server Error.",
            error: e,
          });
        } else {
          console.log(result);
          return res.status(200).json({
            code: 200,
            success: true,
            message: "Card Created Successfully.",
            data: result,
          });
        }
      });
    });
  };

  const view_balance = async (req, res) => {
    let { your_api_username, your_api_password, your_wallet_id } = req.body;

    if (!your_api_password || !your_api_username || !your_wallet_id) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Please Provide Required details to View Balance",
      });
    }

    const url =
      "https://api.prepaidcards.cloud/prepaidcardsmanagement.asmx?WSDL";

    const requestArgs = {
      ApiUserName: your_api_username,
      ApiPassword: your_api_password,
      WalletID: your_wallet_id,
    };

    soap.createClient(url, (err, client) => {
      if (err) {
        console.log(err);
        return res.status(501).json({
          code: 501,
          success: false,
          message: "Internal Server Error:Soap.",
        });
      }

      console.log("Soap Client created successfully.");

      client.Wallet_ViewBalance(requestArgs, (e, result) => {
        if (e) {
          console.log(e);
          return res.status(501).json({
            code: 501,
            success: false,
            message: "Internal Server Error.",
            error: e,
          });
        } else {
          console.log(result);
          return res.status(200).json({
            code: 200,
            success: true,
            message: "Wallet Balance Fetched Successfully.",
            data: result,
          });
        }
      });
    });
  };

  const create_sub_wallet = async (req, res) => {
    let {
      your_api_username,
      your_api_password,
      your_wallet_id,
      new_wallet_name,
    } = req.body;

    if (
      !your_api_password ||
      !your_api_username ||
      !your_wallet_id ||
      !new_wallet_name
    )
      return res.status(401).json({
        code: 401,
        success: false,
        message:
          "Please Provide Required Details to Create Sub wallet of an Existing Wallet.",
      });

    const url =
      "https://api.prepaidcards.cloud/prepaidcardsmanagement.asmx?WSDL";

    const requestArgs = {
      ApiUserName: your_api_username,
      ApiPassword: your_api_password,
      ParentWalletID: your_wallet_id,
      WalletName: new_wallet_name,
    };

    soap.createClient(url, (err, client) => {
      if (err) {
        console.log(err);
        return res.status(501).json({
          code: 501,
          success: false,
          message: "Internal Server Error:Soap.",
        });
      }

      console.log("Soap Client created successfully.");

      client.Wallet_CreateSubWallet(requestArgs, (e, result) => {
        if (e) {
          console.log(e);
          return res.status(501).json({
            code: 501,
            success: false,
            message: "Internal Server Error.",
            error: e,
          });
        } else {
          console.log(result);
          return res.status(200).json({
            code: 200,
            success: true,
            message: "Sub Wallet created Successfully.",
            data: result,
          });
        }
      });
    });
  };

  const check_platform_status = async (req, res) => {
    const requestArgs = {
      ApiUserName: process.env.MSWIPE_API_USERNAME,
      ApiPassword: process.env.MSWIPE_API_PASSWORD,
    };

    const url =
      "https://api.prepaidcards.cloud/prepaidcardsmanagement.asmx?WSDL";

    soap.createClient(url, (err, client) => {
      if (err) {
        console.log(err);
        return res.status(501).json({
          code: 501,
          success: false,
          message: "Internal Server Error:Soap.",
        });
      }

      console.log("Soap Client created successfully.");

      client.isAvailable(requestArgs, (e, result) => {
        if (e) {
          console.log(e);
          return res.status(501).json({
            code: 501,
            success: false,
            message: "Internal Server Error.",
            error: e,
          });
        } else {
          console.log(result);
          return res.status(200).json({
            code: 200,
            success: true,
            message: "Platform Status Fetched.",
            data: result,
          });
        }
      });
    });
  };

  return {
    create_card,
    view_balance,
    create_sub_wallet,
    check_platform_status,
  };
};

module.exports = CardApi;
