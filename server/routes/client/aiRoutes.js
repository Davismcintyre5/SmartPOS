const express = require("express");
const router = express.Router();
const { chat, command, getSettings, updateSettings } = require("../../controllers/client/aiController");

router.post("/chat", chat);
router.post("/command", command);
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

module.exports = router;