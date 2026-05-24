const express = require("express");
const router = express.Router();
const { chat } = require("../../controllers/public/chatController");

router.post("/", chat);

module.exports = router;