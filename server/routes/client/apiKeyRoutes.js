const express = require("express");
const router = express.Router();
const { generateApiKey, getApiKeys, revokeApiKey } = require("../../controllers/client/apiKeyController");

router.post("/generate", generateApiKey);
router.get("/", getApiKeys);
router.delete("/:id", revokeApiKey);

module.exports = router;