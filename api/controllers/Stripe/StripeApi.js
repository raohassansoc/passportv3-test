// const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const stripe = require("stripe")(process.env.STRIPE_PUBLISHABLE_KEY);


const StripeApi = () => {
  const createCardToken = async (req, res) => {
    const { card_details } = req.body;
    if (
      !card_details ||
      !card_details.number ||
      !card_details.exp_month ||
      !card_details.exp_year ||
      !card_details.cvc
    )
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Please Provide Card Details to Generate Card Token.",
      });

    try {
      const token = await stripe.tokens.create({ card: card_details });
      console.log(token);

      return res.status(200).json({
        code: 200,
        success: true,
        token_id: token.id,
      });
    } catch (error) {
      console.log(error);
      if (error.type != undefined && error.type == "StripeCardError")
        return res.status(error.statusCode).json({
          code: 501,
          stripe_server_code: error.statusCode,
          success: false,
          message: error.raw.message,
        });
      res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
        error: error,
      });
    }
  };
  const createPayment = async (req, res) => {
    const {
      email,
      name,
      address,
      amount,
      currency,
      description,
      token_id,
    } = req.body;

    try {
      const customer = await stripe.customers.create({
        email,
        source: token_id,
        name,
        address,
      });
      console.log(106, customer);

      const charge = await stripe.charges.create({
        amount: parseInt(amount) * 100,
        currency,
        description,
        customer: customer.id,
      });
      console.log(114, charge);

      res.status(201).json({
        code: 201,
        success: true,
        data: charge,
      });
    } catch (error) {
      console.log(error);
      if (error.type != undefined && error.type == "StripeCardError")
        return res.status(error.statusCode).json({
          code: 501,
          stripe_server_code: error.statusCode,
          success: false,
          message: error.raw.message,
        });
      res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
        error: error,
      });
    }
  };
  return {
    createPayment,
    createCardToken,
  };
};

module.exports = StripeApi;
