const express = require("express");
const router = express.Router();
const { login, register, getUsers, updateUser, deleteUser } = require("../../controllers/client/userController");

router.post("/login", login);
router.post("/register", register);
router.get("/", getUsers);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;