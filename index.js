require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const BASE_URL = process.env.BASE_URL;

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/checkout", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Node.js & Express book",
            },
            unit_amount: 20 * 100,
          },
          quantity: 2,
        },
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Python Course",
            },
            unit_amount: 40 * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      shipping_address_collection: {
        allowed_countries: ["PK", "US", "BR"],
      },
      success_url: `${BASE_URL}/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/cancel`,
    });

    res.redirect(session.url);
  } catch (error) {}
});

app.get("/complete", async (req, res) => {
  const result = Promise.all([
    stripe.checkout.sessions.retrieve(req.query.session_id, {
      expand: ["payment_intent.payment_method"],
    }),
    stripe.checkout.sessions.listLineItems(req.query.session_id),
  ]);

  const data = JSON.stringify(await result);

  console.log(data);

  res.send("Payment Successful");
});

app.get("/cancel", (req, res) => {
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server is running on ${BASE_URL}`);
});
