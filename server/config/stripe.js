const Stripe = require('stripe');
const env = require('./env');

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20'
});

module.exports = stripe;