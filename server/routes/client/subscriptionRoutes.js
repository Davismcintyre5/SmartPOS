const express = require("express");
const router = express.Router();
const { getSubscription, getPaymentHistory } = require("../../controllers/client/subscriptionController");

router.get("/", getSubscription);
router.get("/payments", getPaymentHistory);

module.exports = router;