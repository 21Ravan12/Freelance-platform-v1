const { Message } = require('../config/dbSchemas');

const getChatMessages = async (req, res) => {
  const { sender, receiver } = req.params;

  if (!sender || !receiver) {
    return res.status(400).json({ message: "Sender and receiver are required." });
  }

  try {
    const messages = await Message.find({
      $or: [
        { from: sender, to: receiver },
        { from: receiver, to: sender }
      ]
    }).sort({ timestamp: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ message: "Server error occurred." });
  }
};

const getChatMessagesToMe = async (req, res) => {
  const receiver = req.user.id;
  console.log(receiver);

  if (!receiver) {
    return res.status(400).json({ message: "Receiver is required." });
  }

  try {
    const messages = await Message.find({
      $or: [
        { to: receiver },
        { from: receiver }
      ]
    }).sort({ timestamp: 1 });

    return res.status(200).json({ messages: messages || [], receiver });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ message: error.message || "Server error occurred." });
  }
};

const getUnreadMessagesCount = async (req, res) => {
  const receiver = req.user.id;

  if (!receiver) {
    return res.status(400).json({ message: "Receiver are required." });
  }

  try {
    const unreadCount = await Message.countDocuments({
      to: receiver,
      isRead: false
    });

    return res.status(200).json({ unreadCount: unreadCount });
  } catch (error) {
    console.error("Error fetching unread messages count:", error);
    return res.status(500).json({ message: "Server error occurred." });
  }
};

const readMyMessages = async (req, res) => {
  const { sender, receiver } = req.body;

  if (!sender || !receiver) {
    return res.status(400).json({ message: "Sender and receiver are required." });
  }

  try {
    const updateResult = await Message.updateMany(
      { from: sender, to: receiver, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      message: "Messages marked as read",
      modifiedCount: updateResult.modifiedCount
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return res.status(500).json({ message: "Server error occurred." });
  }
};

module.exports = { getChatMessages, getChatMessagesToMe, getUnreadMessagesCount, readMyMessages };