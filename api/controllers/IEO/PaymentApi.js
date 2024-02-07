const { ObjectId } = require("mongodb");
const axios = require("axios");
const fetch = require("node-fetch");
const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51I9RIPFGlCQ4kK1CMiWgaLDoj6uO93StJQnYBI4ufoT3nI8qNGO8zksD4zcLV3Prbql3ObtwZEoxCzd4GO4c0xcG00glrwRwL4"
);

const PaymentApi = () => {
  const payment = async (req, res) => {
    try {
      console.log(req.body);
      try {
        token = req.body.token;
        async function createOrUpdateCustomer(req) {
          const email_id = req.body.email_id;
          const tokenID = req.body.token.id;
          const name = req.body.name;
          const address = req.body.address;

          try {
            // Check if customer with the email already exists
            const existingCustomers = await stripe.customers.list({
              email: email_id,
            });
            console.log(existingCustomers, "test");
            if (existingCustomers.data.length > 0) {
              // Customer already exists, retrieve the first customer
              console.log("hhhh");
              const existingCustomer = existingCustomers.data[0];
              console.log(existingCustomer);

              // Update customer's details (optional)
              await stripe.customers.update(existingCustomer.id, {
                metadata: {
                  source: tokenID, // Update payment source
                  name: name, // Update name
                  address: address, // Update address
                },
              });
              return existingCustomer;
              console.log("Existing customer details updated.");
            } else {
              // Create a new customer
              const newCustomer = await stripe.customers.create({
                email: email_id,
                source: tokenID,
                name: name,
              });
              console.log("New customer created:", newCustomer);
              return newCustomer;
            }
          } catch (error) {
            console.log(error);
            console.error("Error occurred:", error.message);
          }
        }
        const customer = stripe.customers
          .create({
            email: req.body.email_id,
            source: req.body.token.id,
            name: req.body.name,
            address: req.body.address,
          })
          .then((customer) => {
            console.log(customer);
            return stripe.charges.create({
              amount: parseInt(req.body.amount) * 100,
              description: "This is test transaction",
              currency: "USD",
              customer: customer.id,
            });
          })
          .then((charge) => {
            console.log(charge);
            return res.status(200).json({
              code: 2000,
              success: true,
              message: `Payment successfull`,
              data: charge,
            });
          })
          .catch((err) => {
            console.log(err);
            return res.status(200).json({
              code: 2000,
              success: false,
              message: `Payment failed`,
              err: err,
            });
          });
      } catch (error) {
        return res.status(501).json(error);
      }
    } catch (error) {
      return res.status(501).json(error);
    }
  };

  const convertCurrency = async (req, res) => {
    try {
      console.log("hello");
      const API_BASE_URL = "http://api.exchangeratesapi.io/latest";
      const API_KEY = "ba26154a22d9c5fdd4d212efc223eab1";
      const response = await fetch(
        `${API_BASE_URL}?base=USD&symbols=AED&access_key=${API_KEY}`
      );
      const data = await response.json();
      console.log(data);
      const exchangeRate = data.rates.AED;
      const amountInAED = amountInUSD * exchangeRate;
      return amountInAED;
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };

  const payout = async (req, res) => {
    try {
      console.log(req.body);
      try {
        const paymentIntent = stripe.paymentIntents.create({
          amount: 100,
          currency: "USD",
          payment_method: {
            cryptocurrency: {
              address: "0x9902cb7fdAb3CC6f9E7F7Cfab9cb2e46B2132F83",
              amount: 100,
              currency: "PASS",
            },
          },
        });

        async function createBankAccountRecipient(
          accountHolderName,
          accountNumber,
          routingNumber
        ) {
          try {
            const account = await stripe.accounts.create({
              type: "custom",
            });

            const externalAccount = await stripe.accounts.createExternalAccount(
              account.id,
              {
                external_account: {
                  object: "bank_account",
                  account_holder_name: accountHolderName,
                  account_number: accountNumber,
                  routing_number: routingNumber,
                  country: "US", // Replace with the appropriate country code
                  currency: "usd", // Replace with the appropriate currency
                },
              }
            );

            // The bank account recipient has been created successfully
            console.log("Bank account recipient created:", externalAccount);

            return externalAccount.id;
          } catch (error) {
            // An error occurred while creating the bank account recipient
            console.error("Error creating bank account recipient:", error);
            throw error;
          }
        }
        // createBankAccountRecipient("Test", "000123456789", "110000000")
      } catch (error) {
        console.log(error);
        return res.status(501).json(error);
      }
    } catch (error) {
      return res.status(501).json(error);
    }
  };

  return {
    payment,
    convertCurrency,
    payout,
  };
};
module.exports = PaymentApi;
