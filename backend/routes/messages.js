const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const sequelize = require('../config/database');

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, message, conversationId } = req.body;

    const newMessage = await Message.create({
      conversationId,
      senderId: req.user.id,
      receiverId,
      message,
      isRead: false,
      messageType: 'text'
    });

    const plainMessage = newMessage.get({ plain: true });
    // Normalize properties for client socket emission
    plainMessage.sender = { id: req.user.id, name: req.user.name, avatar: req.user.avatar };

    // Emit via socket
    const io = req.app.get('io');
    io.to(receiverId).emit('receiveMessage', {
      senderId: req.user.id,
      message,
      conversationId,
      timestamp: new Date()
    });

    res.status(201).json({ message: plainMessage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get messages for a conversation
router.get('/:conversationId', auth, async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { conversationId: req.params.conversationId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['name', 'avatar', 'role']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    // Mark as read
    await Message.update(
      { isRead: true },
      {
        where: {
          conversationId: req.params.conversationId,
          receiverId: req.user.id,
          isRead: false
        }
      }
    );

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all conversations (Grouped by conversationId)
router.get('/', auth, async (req, res) => {
  try {
    // Select latest messages utilizing GROUP BY subqueries
    const messages = await sequelize.query(`
      SELECT m1.*, 
             u.name AS senderName, u.avatar AS senderAvatar, u.role AS senderRole,
             r.name AS receiverName, r.avatar AS receiverAvatar, r.role AS receiverRole
      FROM Messages m1
      JOIN (
        SELECT conversationId, MAX(createdAt) AS max_created
        FROM Messages
        WHERE senderId = :userId OR receiverId = :userId
        GROUP BY conversationId
      ) m2 ON m1.conversationId = m2.conversationId AND m1.createdAt = m2.max_created
      LEFT JOIN Users u ON m1.senderId = u.id
      LEFT JOIN Users r ON m1.receiverId = r.id
      ORDER BY m1.createdAt DESC
    `, {
      replacements: { userId: req.user.id },
      type: sequelize.QueryTypes.SELECT
    });

    // Format output payload exact mapping frontend Redux selector
    const conversations = messages.map(m => ({
      _id: m.conversationId,
      lastMessage: {
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        receiverId: m.receiverId,
        message: m.message,
        isRead: m.isRead === 1 || m.isRead === true,
        messageType: m.messageType,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        sender: { id: m.senderId, name: m.senderName, avatar: m.senderAvatar, role: m.senderRole },
        receiver: { id: m.receiverId, name: m.receiverName, avatar: m.receiverAvatar, role: m.receiverRole }
      }
    }));

    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unread count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Message.count({
      where: {
        receiverId: req.user.id,
        isRead: false
      }
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
