const express = require("express");
const router = express.Router();
const {
  getClients, getClient, updateClient,
  suspendClient, activateClient, deleteClient,
} = require("../../controllers/admin/clientController");
const adminAuth = require("../../middleware/admin/adminAuth");
const adminRole = require("../../middleware/admin/adminRole");
const validate = require("../../middleware/common/validate");
const { updateClientSchema } = require("../../validators/admin/clientValidator");

router.get("/", adminAuth, getClients);
router.get("/:id", adminAuth, getClient);
router.put("/:id", adminAuth, validate(updateClientSchema), updateClient);
router.put("/:id/suspend", adminAuth, suspendClient);
router.put("/:id/activate", adminAuth, activateClient);
router.delete("/:id", adminAuth, adminRole("superadmin"), deleteClient);

module.exports = router;