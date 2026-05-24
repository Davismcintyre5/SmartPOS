const express = require("express");
const router = express.Router();
const { getPlan, updatePlan } = require("../../controllers/admin/subscriptionController");
const adminAuth = require("../../middleware/admin/adminAuth");
const validate = require("../../middleware/common/validate");
const { updatePlanSchema } = require("../../validators/admin/subscriptionValidator");

router.get("/", adminAuth, getPlan);
router.put("/", adminAuth, validate(updatePlanSchema), updatePlan);

module.exports = router;