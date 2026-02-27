const express = require("express");
const {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
    allMessages,
    sendMessage
} = require("../controllers/chat.controller.js");
const authMiddleware = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.route("/").post(authMiddleware, accessChat);
router.route("/").get(authMiddleware, fetchChats);
router.route("/group").post(authMiddleware, createGroupChat);
router.route("/rename").put(authMiddleware, renameGroup);
router.route("/add").put(authMiddleware, addToGroup);
router.route("/remove").put(authMiddleware, removeFromGroup);

// I will re-route messages here to match standard REST patterns
router.route("/messages/:chatId").get(authMiddleware, allMessages);
router.route("/messages").post(authMiddleware, sendMessage);

module.exports = router;