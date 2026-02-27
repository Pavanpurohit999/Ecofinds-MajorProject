const Chat = require("../models/Chat.model.js");
const User = require("../models/User.model.js");
const Message = require("../models/Message.model.js");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log("UserId param not sent with request");
        return res.status(400).json({ message: "UserId param not sent with request" });
    }

    try {
        // Check if a chat exists between req.user and the provided userId
        var isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: userId } } },
            ],
        })
            .populate("users", "-password")
            .populate("latestMessage");

        isChat = await User.populate(isChat, {
            path: "latestMessage.sender",
            select: "name profileImage email",
        });

        if (isChat.length > 0) {
            res.send(isChat[0]);
        } else {
            // Create a new chat if it doesn't exist
            var chatData = {
                chatName: "sender", // Or generate a descriptive name
                isGroupChat: false,
                users: [req.user._id, userId],
            };

            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "users",
                "-password"
            );
            res.status(200).json(FullChat);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "name profileImage email",
                });
                res.status(200).send(results);
            });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//@description     Create a Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all the feilds" });
    }

    var users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res
            .status(400)
            .send("More than 2 users are required to form a group chat");
    }

    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = async (req, res) => {
    const { chatId, chatName } = req.body;

    try {
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            {
                chatName: chatName,
            },
            {
                new: true,
            }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!updatedChat) {
            return res.status(404).json({ message: "Chat Not Found" });
        } else {
            res.json(updatedChat);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    try {
        // check if the requester is admin

        const added = await Chat.findByIdAndUpdate(
            chatId,
            {
                $push: { users: userId },
            },
            {
                new: true,
            }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!added) {
            return res.status(404).json({ message: "Chat Not Found" });
        } else {
            res.json(added);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    try {
        // check if the requester is admin

        const removed = await Chat.findByIdAndUpdate(
            chatId,
            {
                $pull: { users: userId },
            },
            {
                new: true,
            }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!removed) {
            return res.status(404).json({ message: "Chat Not Found" });
        } else {
            res.json(removed);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//@description     Fetch all messages for a specific chat
//@route           GET /api/messages/:chatId
//@access          Protected
const allMessages = async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name profileImage email")
            .populate("chat");
        res.json(messages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//@description     Create New Message
//@route           POST /api/messages/
//@access          Protected
const sendMessage = async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.status(400).json({ message: "Invalid data passed into request" });
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    };

    try {
        var message = await Message.create(newMessage);

        message = await message.populate("sender", "name profileImage");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name profileImage email",
        });

        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.json(message);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


module.exports = {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
    allMessages,
    sendMessage
};
