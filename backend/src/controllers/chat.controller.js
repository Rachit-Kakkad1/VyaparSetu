const { Conversation, ConversationParticipant, Message, User, Role } = require('../models');
const ApiResponse = require('../utils/ApiResponse');

class ChatController {
  async getMyConversations(req, res, next) {
    try {
      const conversations = await Conversation.findAll({
        include: [
          {
            model: ConversationParticipant,
            as: 'participants',
            where: { userId: req.user.id }
          },
          {
            model: Message,
            as: 'messages',
            limit: 50,
            order: [['createdAt', 'DESC']],
            include: [{ model: User, as: 'sender', attributes: ['firstName', 'lastName', 'email'] }]
          }
        ]
      });
      ApiResponse.success(res, 'Conversations retrieved', { conversations });
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const { conversationId, message } = req.body;
      const msg = await Message.create({
        conversationId,
        senderId: req.user.id,
        message
      });
      ApiResponse.success(res, 'Message sent', { message: msg }, 201);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChatController();
